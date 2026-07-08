/**
 * Client-side media optimization pipeline.
 *
 * Images → WebP via Canvas API (max 2400px, quality 0.85).
 * Videos / PDFs / SVG → passthrough (no browser-side codec).
 * Uploads land in the private `project-media` bucket and we return a
 * 10-year signed URL that works cross-browser without Google session.
 */
import { supabase } from "@/integrations/supabase/client";

const MAX_WIDTH = 2400;
const WEBP_QUALITY = 0.85;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type OptimizedUpload = {
  url: string;
  path: string;
  contentType: string;
  originalSize: number;
  optimizedSize: number;
  kind: "image" | "video" | "pdf" | "other";
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };
    img.src = url;
  });
}

/** Encode an image to WebP with max-width resizing. Falls back to original on failure. */
export async function optimizeImageToWebP(
  file: File,
  opts: { maxWidth?: number; quality?: number } = {},
): Promise<{ blob: Blob; contentType: string; ext: string }> {
  const maxWidth = opts.maxWidth ?? MAX_WIDTH;
  const quality = opts.quality ?? WEBP_QUALITY;

  // Keep animated GIF / SVG as-is; canvas encode would lose animation / vector.
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    return { blob: file, contentType: file.type || "application/octet-stream", ext };
  }

  try {
    const img = await loadImage(file);
    const ratio = Math.min(1, maxWidth / img.width);
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D indisponible");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", quality),
    );
    if (!blob) throw new Error("Encodage WebP échoué");
    return { blob, contentType: "image/webp", ext: "webp" };
  } catch {
    // Fallback: original file
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    return { blob: file, contentType: file.type || "application/octet-stream", ext };
  }
}

function kindFromMime(type: string): "image" | "video" | "pdf" | "other" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf") return "pdf";
  return "other";
}

/**
 * Upload any user file to Supabase Storage. Images are converted to WebP
 * client-side first (fast, no server cost). Returns a long-lived signed URL.
 */
export async function uploadOptimizedMedia(
  file: File,
  folder = "uploads",
): Promise<OptimizedUpload> {
  const kind = kindFromMime(file.type);
  let blob: Blob = file;
  let contentType = file.type || "application/octet-stream";
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";

  if (kind === "image") {
    const optimized = await optimizeImageToWebP(file);
    blob = optimized.blob;
    contentType = optimized.contentType;
    ext = optimized.ext;
  }

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("project-media")
    .upload(path, blob, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Upload : ${error.message}`);

  const { data, error: sErr } = await supabase.storage
    .from("project-media")
    .createSignedUrl(path, TEN_YEARS);
  if (sErr || !data) throw sErr || new Error("URL signée échouée");

  return {
    url: data.signedUrl,
    path,
    contentType,
    originalSize: file.size,
    optimizedSize: blob.size,
    kind,
  };
}