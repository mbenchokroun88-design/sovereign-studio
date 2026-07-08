/**
 * Server function: migrate a project's Google Drive URLs to Supabase Storage.
 *
 * Fetches each Drive image (via the public `thumbnail?id=X&sz=w2400` endpoint),
 * uploads the bytes to the private `project-media` bucket using the service
 * role client, and rewrites the URL to a 10-year signed URL. Non-Drive URLs
 * are left untouched. Cloudflare Workers can't run sharp/ffmpeg — images are
 * stored as-is (the source is already a JPEG from Drive's thumbnail service),
 * which is enough to fix the cross-browser / incognito breakage.
 */
import { createServerFn } from "@tanstack/react-start";

type MigrationResult = { projectId: string; migrated: number; failed: number; total: number };

function driveIdFromUrl(url: string): string | null {
  const m1 = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2 && /drive\.google\.com|googleusercontent\.com/.test(url)) return m2[1];
  return null;
}

function isMigratable(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (/supabase\.co\/storage\//.test(url)) return false; // already migrated
  return driveIdFromUrl(url) !== null;
}

async function fetchDriveBytes(url: string): Promise<{ bytes: ArrayBuffer; contentType: string; ext: string }> {
  const id = driveIdFromUrl(url);
  if (!id) throw new Error(`ID Drive introuvable : ${url}`);
  const target = `https://drive.google.com/thumbnail?id=${id}&sz=w2400`;
  const res = await fetch(target, { redirect: "follow" });
  if (!res.ok) throw new Error(`Drive fetch ${res.status} ${res.statusText}`);
  const rawCt = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 512) throw new Error("Fichier vide (accès Drive refusé ?)");
  let ext = "jpg";
  if (rawCt.includes("png")) ext = "png";
  else if (rawCt.includes("webp")) ext = "webp";
  else if (rawCt.includes("gif")) ext = "gif";
  return { bytes, contentType: rawCt, ext };
}

export const migrateProjectMedia = createServerFn({ method: "POST" })
  .inputValidator((data: { projectId: string }) => {
    if (!data?.projectId) throw new Error("projectId requis");
    return data;
  })
  .handler(async ({ data }): Promise<MigrationResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", data.projectId)
      .maybeSingle();
    if (error) throw new Error(`Lecture projet : ${error.message}`);
    if (!row) throw new Error("Projet introuvable");

    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    const cache = new Map<string, string>();
    let migrated = 0;
    let failed = 0;
    let total = 0;

    async function migrateOne(url: string): Promise<string> {
      if (!isMigratable(url)) return url;
      total++;
      if (cache.has(url)) return cache.get(url)!;
      try {
        const { bytes, contentType, ext } = await fetchDriveBytes(url);
        const path = `migrated/${row.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("project-media")
          .upload(path, bytes, { contentType, cacheControl: "31536000", upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("project-media")
          .createSignedUrl(path, TEN_YEARS);
        if (sErr || !signed) throw sErr || new Error("URL signée échouée");
        cache.set(url, signed.signedUrl);
        migrated++;
        return signed.signedUrl;
      } catch (e) {
        console.error("migrateOne failed", url, e);
        cache.set(url, url);
        failed++;
        return url;
      }
    }

    const changes: Record<string, unknown> = {};

    if (typeof row.cover_url === "string" && row.cover_url) {
      const next = await migrateOne(row.cover_url);
      if (next !== row.cover_url) changes.cover_url = next;
    }

    if (Array.isArray(row.media)) {
      const nextMedia = [];
      let mediaChanged = false;
      for (const m of row.media as Record<string, unknown>[]) {
        const nm: Record<string, unknown> = { ...m };
        if (typeof m.url === "string") {
          const nu = await migrateOne(m.url);
          if (nu !== m.url) mediaChanged = true;
          nm.url = nu;
        }
        if (Array.isArray(m.mockupViews)) {
          const views: string[] = [];
          for (const u of m.mockupViews as string[]) {
            const nu = await migrateOne(u);
            if (nu !== u) mediaChanged = true;
            views.push(nu);
          }
          nm.mockupViews = views;
        }
        nextMedia.push(nm);
      }
      if (mediaChanged) changes.media = nextMedia;
    }

    if (Array.isArray(row.blocks)) {
      const nextBlocks = [];
      let blocksChanged = false;
      for (const b of row.blocks as Record<string, unknown>[]) {
        const nb: Record<string, unknown> = { ...b };
        if (typeof b.url === "string" && b.url) {
          const nu = await migrateOne(b.url);
          if (nu !== b.url) blocksChanged = true;
          nb.url = nu;
        }
        if (Array.isArray(b.urls)) {
          const urls: string[] = [];
          for (const u of b.urls as string[]) {
            const nu = await migrateOne(u);
            if (nu !== u) blocksChanged = true;
            urls.push(nu);
          }
          nb.urls = urls;
        }
        if (Array.isArray(b.mockupViews)) {
          const views: string[] = [];
          for (const u of b.mockupViews as string[]) {
            const nu = await migrateOne(u);
            if (nu !== u) blocksChanged = true;
            views.push(nu);
          }
          nb.mockupViews = views;
        }
        nextBlocks.push(nb);
      }
      if (blocksChanged) changes.blocks = nextBlocks;
    }

    if (Object.keys(changes).length > 0) {
      const { error: uErr } = await supabaseAdmin
        .from("projects")
        .update(changes)
        .eq("id", row.id);
      if (uErr) throw new Error(`Écriture projet : ${uErr.message}`);
    }

    return { projectId: row.id, migrated, failed, total };
  });

/** Migrate cover/logo/image URLs on hero_slides and clients tables in one shot. */
export const migrateHeroAndClients = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ migrated: number; failed: number; total: number }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    let migrated = 0;
    let failed = 0;
    let total = 0;

    async function migrateOne(url: string, folder: string): Promise<string> {
      if (!isMigratable(url)) return url;
      total++;
      try {
        const { bytes, contentType, ext } = await fetchDriveBytes(url);
        const path = `migrated/${folder}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("project-media")
          .upload(path, bytes, { contentType, cacheControl: "31536000", upsert: false });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("project-media")
          .createSignedUrl(path, TEN_YEARS);
        if (sErr || !signed) throw sErr || new Error("URL signée échouée");
        migrated++;
        return signed.signedUrl;
      } catch (e) {
        console.error("migrateOne (site) failed", url, e);
        failed++;
        return url;
      }
    }

    const { data: slides } = await supabaseAdmin.from("hero_slides").select("id, image_url");
    for (const s of slides || []) {
      if (typeof s.image_url === "string" && isMigratable(s.image_url)) {
        const nu = await migrateOne(s.image_url, "hero");
        if (nu !== s.image_url) {
          await supabaseAdmin.from("hero_slides").update({ image_url: nu }).eq("id", s.id);
        }
      }
    }

    const { data: clients } = await supabaseAdmin.from("clients").select("id, logo_url");
    for (const c of clients || []) {
      if (typeof c.logo_url === "string" && isMigratable(c.logo_url)) {
        const nu = await migrateOne(c.logo_url, "clients");
        if (nu !== c.logo_url) {
          await supabaseAdmin.from("clients").update({ logo_url: nu }).eq("id", c.id);
        }
      }
    }

    return { migrated, failed, total };
  },
);