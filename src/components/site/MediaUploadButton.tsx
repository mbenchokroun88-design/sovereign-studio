import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadOptimizedMedia } from "@/lib/media/client-optimize";

/**
 * Small icon-button that uploads a file (image → WebP auto, video/pdf raw)
 * to `project-media` and returns a signed URL via onUploaded().
 */
export function MediaUploadButton({
  onUploaded,
  accept = "image/*",
  folder = "uploads",
  label,
  className = "",
}: {
  onUploaded: (url: string) => void;
  accept?: string;
  folder?: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.currentTarget.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const res = await uploadOptimizedMedia(f, folder);
            onUploaded(res.url);
            const savedKb = Math.max(0, Math.round((res.originalSize - res.optimizedSize) / 1024));
            toast.success(
              res.kind === "image"
                ? `Image optimisée (${savedKb > 0 ? `-${savedKb} Ko` : "prête"})`
                : "Fichier uploadé",
            );
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload échoué");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-1.5 border border-border px-3 py-2 text-[11px] uppercase tracking-widest text-ink-muted hover:border-gold hover:text-brand disabled:opacity-50 ${className}`}
        title="Upload + conversion auto (WebP)"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {label ?? (busy ? "Upload…" : "Upload")}
      </button>
    </>
  );
}