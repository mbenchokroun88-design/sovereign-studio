import { useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProjectCategory =
  | "identity"
  | "report"
  | "event"
  | "video"
  | "3d"
  | "web";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  identity: "Identité Visuelle",
  report: "Rapport / Édition",
  event: "Couverture d'Événement",
  video: "Montage Vidéo",
  "3d": "Maquette & Visite 3D",
  web: "Web & Application",
};

export type MediaSlot =
  | "concept_note"
  | "rollup"
  | "photocall"
  | "save_the_date"
  | "event_visual"
  | "mockup_3d"
  | "real_image"
  | "report_pdf"
  | "letter"
  | "badge"
  | "banner"
  | "testimonial"
  | "program"
  | "video"
  | "other";

export const SLOT_LABELS: Record<MediaSlot, string> = {
  concept_note: "Note de concept",
  rollup: "Roll-up",
  photocall: "Photocall",
  save_the_date: "Save the Date",
  event_visual: "Visuel de l'événement",
  mockup_3d: "Mockups 3D",
  real_image: "Images réelles de l'événement",
  report_pdf: "Rapport (PDF)",
  letter: "Lettre",
  badge: "Badges",
  banner: "Banner",
  testimonial: "Témoignage",
  program: "Programme",
  video: "Vidéo",
  other: "Autre",
};

export const SLOT_ORDER: MediaSlot[] = [
  "concept_note",
  "save_the_date",
  "program",
  "event_visual",
  "banner",
  "rollup",
  "photocall",
  "badge",
  "letter",
  "mockup_3d",
  "real_image",
  "video",
  "report_pdf",
  "testimonial",
  "other",
];

export type MediaKind = "image" | "video" | "pdf";

export const DEFAULT_KIND_FOR_SLOT: Record<MediaSlot, MediaKind> = {
  concept_note: "pdf",
  rollup: "image",
  photocall: "image",
  save_the_date: "image",
  event_visual: "image",
  mockup_3d: "image",
  real_image: "image",
  report_pdf: "pdf",
  letter: "pdf",
  badge: "image",
  banner: "image",
  testimonial: "image",
  program: "pdf",
  video: "video",
  other: "image",
};

export interface MediaItem {
  slot: MediaSlot;
  kind: MediaKind;
  url: string;
  caption?: string;
  label?: string; // libellé personnalisé pour la section
  mockup?: boolean;
  mockupTemplate?: MockupTemplate;
  mockupViews?: string[]; // URLs additionnelles pour les autres angles
}

export type MockupTemplate =
  | "magazine"
  | "rollup"
  | "poster"
  | "badge"
  | "flyer"
  | "banner"
  | "card";

export const MOCKUP_LABELS: Record<MockupTemplate, string> = {
  magazine: "Magazine A4 ouvert",
  rollup: "Roll-up",
  poster: "Affiche",
  badge: "Badge",
  flyer: "Flyer",
  banner: "Banner",
  card: "Carte",
};

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  category: ProjectCategory;
  summary: string;
  description: string;
  cover: string;
  featured?: boolean;
  media: MediaItem[];
  blocks?: LayoutBlock[];
  tags?: string[];
  position?: number;
}

// ============ PAGE BUILDER BLOCKS ============
export type LayoutBlock =
  | {
      id: string;
      type: "image";
      url: string;
      width: "full" | "wide" | "centered";
      caption?: string;
      mockup?: MockupTemplate | "none";
      mockupViews?: string[];
    }
  | {
      id: string;
      type: "gallery";
      urls: string[];
      columns: 2 | 3;
      caption?: string;
      variant?: "grid" | "cinematic";
    }
  | {
      id: string;
      type: "text_image";
      url: string;
      heading?: string;
      eyebrow?: string;
      body: string;
      position: "left" | "right" | "top" | "bottom" | "overlay";
      overlayAlign?: "tl" | "tc" | "tr" | "cl" | "cc" | "cr" | "bl" | "bc" | "br";
      textSize?: "sm" | "md" | "lg";
      width?: "wide" | "full";
    }
  | {
      id: string;
      type: "text";
      heading?: string;
      body: string;
      align?: "left" | "center";
      eyebrow?: string;
    }
  | { id: string; type: "video"; url: string; caption?: string }
  | { id: string; type: "pdf"; url: string; caption?: string }
  | { id: string; type: "spacer"; size: "sm" | "md" | "lg" };

export function newBlockId() {
  return "b_" + Math.random().toString(36).slice(2, 10);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

function mapRow(r: any): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    client: r.client || "",
    year: r.year || "",
    category: r.category as ProjectCategory,
    summary: r.summary || "",
    description: r.description || "",
    cover: r.cover_url || "",
    featured: !!r.featured,
    media: Array.isArray(r.media) ? (r.media as MediaItem[]) : [],
    blocks: Array.isArray(r.blocks) ? (r.blocks as LayoutBlock[]) : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    position: r.position ?? 0,
  };
}

function toRow(p: Partial<Project>) {
  const o: Record<string, unknown> = {};
  if ("slug" in p) o.slug = p.slug;
  if ("title" in p) o.title = p.title;
  if ("client" in p) o.client = p.client ?? "";
  if ("year" in p) o.year = p.year ?? "";
  if ("category" in p) o.category = p.category;
  if ("summary" in p) o.summary = p.summary ?? "";
  if ("description" in p) o.description = p.description ?? "";
  if ("cover" in p) o.cover_url = p.cover ?? "";
  if ("featured" in p) o.featured = !!p.featured;
  if ("tags" in p) o.tags = p.tags ?? [];
  if ("media" in p) o.media = p.media ?? [];
  if ("blocks" in p) o.blocks = p.blocks ?? [];
  if ("position" in p && p.position !== undefined) o.position = p.position;
  return o;
}

const PROJECTS_KEY = ["projects"] as const;

export function ProjectsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useProjects() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: PROJECTS_KEY });

  const getBySlug = (slug: string) => projects.find((p) => p.slug === slug);

  const add = async (
    p: Omit<Project, "id" | "slug"> & { slug?: string },
  ): Promise<Project> => {
    const slug = p.slug && p.slug.length ? slugify(p.slug) : slugify(p.title);
    const row = { ...toRow(p), slug };
    const { data, error } = await supabase
      .from("projects")
      .insert(row as never)
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return mapRow(data);
  };

  const update = async (id: string, patch: Partial<Project>) => {
    const row = toRow(patch);
    if (patch.title && !patch.slug) row.slug = slugify(patch.title);
    if (patch.slug) row.slug = slugify(patch.slug);
    const { error } = await supabase
      .from("projects")
      .update(row as never)
      .eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const duplicate = async (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (!found) return;
    const { id: _id, ...rest } = found;
    await add({
      ...rest,
      title: rest.title + " (Copie)",
      slug: slugify(rest.title + "-copie-" + Date.now()),
      featured: false,
    });
  };

  return useMemo(
    () => ({
      projects,
      isLoading,
      getBySlug,
      add,
      update,
      remove,
      duplicate,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, isLoading],
  );
}

// ----- URL helpers -----
export function toDrivePreview(url: string) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

export function toDriveImage(url: string) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  const id = m ? m[1] : url.match(/[?&]id=([^&]+)/)?.[1];
  if (id) return `https://lh3.googleusercontent.com/d/${id}=w2400`;
  return url;
}

export function toVideoEmbed(url: string) {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  if (url.includes("drive.google.com")) return toDrivePreview(url);
  return url;
}

export function isDriveUrl(url: string) {
  return /drive\.google\.com/.test(url);
}

export function isSupabaseStorageUrl(url: string) {
  return /supabase\.co\/storage\//.test(url);
}