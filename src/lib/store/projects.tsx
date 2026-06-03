import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import heroReport from "@/assets/proj-report.jpg";
import heroIdentity from "@/assets/proj-identity.jpg";
import hero3d from "@/assets/proj-3d.jpg";
import heroEvent from "@/assets/proj-event.jpg";
import heroVideo from "@/assets/proj-video.jpg";
import heroWeb from "@/assets/proj-web.jpg";

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

export type MediaItem =
  | { kind: "image"; url: string; caption?: string }
  | { kind: "video"; url: string; caption?: string } // youtube/vimeo/drive embed url
  | { kind: "pdf"; url: string; caption?: string }; // drive viewer url or direct

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
  tags?: string[];
}

const STORAGE_KEY = "mb_portfolio_projects_v1";

const seed: Project[] = [
  {
    id: "p1",
    slug: "ifc-impact-report-2024",
    title: "Rapport d'Impact Annuel 2024",
    client: "IFC — World Bank Group",
    year: "2024",
    category: "report",
    featured: true,
    summary:
      "Conception éditoriale et data-visualisation d'un rapport annuel diffusé dans 38 pays.",
    description:
      "Refonte complète du rapport d'impact annuel : architecture éditoriale, infographies, mise en page bilingue (EN/FR), préparation print et version digitale en flipbook.",
    cover: heroReport,
    tags: ["Édition", "Infographie", "Print"],
    media: [
      { kind: "image", url: heroReport, caption: "Couverture du rapport" },
      {
        kind: "pdf",
        url: "https://drive.google.com/file/d/0B0xQ_example/preview",
        caption: "Rapport complet — flipbook",
      },
    ],
  },
  {
    id: "p2",
    slug: "enr-cluster-identite",
    title: "Identité Visuelle ENR Cluster",
    client: "Cluster ENR Maroc",
    year: "2023",
    category: "identity",
    featured: true,
    summary:
      "Système d'identité complet pour le cluster des énergies renouvelables.",
    description:
      "Création de la marque : logo, charte graphique, papeterie, déclinaisons numériques et signalétique pour les événements internationaux.",
    cover: heroIdentity,
    tags: ["Logo", "Charte", "Papeterie"],
    media: [
      { kind: "image", url: heroIdentity, caption: "Système d'identité" },
    ],
  },
  {
    id: "p3",
    slug: "ministere-energie-3d",
    title: "Visite Virtuelle 3D — Ministère",
    client: "Ministère de la Transition Énergétique",
    year: "2024",
    category: "3d",
    featured: true,
    summary:
      "Maquette et visite virtuelle 3D du nouveau pôle administratif énergétique.",
    description:
      "Modélisation architecturale, rendus photoréalistes et visite virtuelle interactive intégrée au site institutionnel.",
    cover: hero3d,
    tags: ["3D", "Architecture", "Visite virtuelle"],
    media: [
      { kind: "image", url: hero3d, caption: "Rendu extérieur" },
      {
        kind: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        caption: "Visite guidée 3D",
      },
    ],
  },
  {
    id: "p4",
    slug: "bei-sustainable-finance-forum",
    title: "BEI — Sustainable Finance Forum",
    client: "Banque Européenne d'Investissement",
    year: "2024",
    category: "event",
    summary:
      "Direction artistique et couverture visuelle complète du forum financier européen.",
    description:
      "Identité de l'événement, signalétique, supports digitaux, captation photo/vidéo et livrables post-événement.",
    cover: heroEvent,
    tags: ["Événement", "Signalétique", "Captation"],
    media: [{ kind: "image", url: heroEvent }],
  },
  {
    id: "p5",
    slug: "film-artisanat-marocain",
    title: "Documentaire — Artisanat Marocain",
    client: "Ministère de l'Artisanat",
    year: "2023",
    category: "video",
    summary:
      "Montage et étalonnage d'un documentaire de 12 minutes pour la promotion internationale.",
    description:
      "Réalisation, montage, étalonnage et sound design d'un film valorisant les métiers de l'artisanat marocain auprès des marchés européens et nord-américains.",
    cover: heroVideo,
    tags: ["Montage", "Étalonnage", "Sound Design"],
    media: [
      {
        kind: "video",
        url: "https://www.youtube.com/embed/aqz-KE-bpKQ",
        caption: "Bande-annonce",
      },
    ],
  },
  {
    id: "p6",
    slug: "finance-app-design",
    title: "Plateforme Numérique — Finance",
    client: "Ministère des Finances",
    year: "2024",
    category: "web",
    summary:
      "Design produit d'une application de suivi budgétaire pour les citoyens.",
    description:
      "UX/UI, design system, prototypage interactif et accompagnement du développement via Lovable. Multi-plateformes, accessible, bilingue.",
    cover: heroWeb,
    tags: ["UI/UX", "Design System", "Mobile"],
    media: [{ kind: "image", url: heroWeb }],
  },
];

interface ProjectsCtx {
  projects: Project[];
  getBySlug: (slug: string) => Project | undefined;
  add: (p: Omit<Project, "id" | "slug"> & { slug?: string }) => Project;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<ProjectsCtx | null>(null);

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects, hydrated]);

  const getBySlug = useCallback(
    (slug: string) => projects.find((p) => p.slug === slug),
    [projects],
  );

  const add = useCallback<ProjectsCtx["add"]>((p) => {
    const id = crypto.randomUUID();
    const slug = p.slug && p.slug.length ? slugify(p.slug) : slugify(p.title);
    const project: Project = { ...p, id, slug } as Project;
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const update = useCallback<ProjectsCtx["update"]>((id, patch) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        if (patch.title && !patch.slug) merged.slug = slugify(patch.title);
        if (patch.slug) merged.slug = slugify(patch.slug);
        return merged;
      }),
    );
  }, []);

  const remove = useCallback<ProjectsCtx["remove"]>((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicate = useCallback<ProjectsCtx["duplicate"]>((id) => {
    setProjects((prev) => {
      const found = prev.find((p) => p.id === id);
      if (!found) return prev;
      const copy: Project = {
        ...found,
        id: crypto.randomUUID(),
        title: found.title + " (Copie)",
        slug: slugify(found.title + "-copie-" + Date.now()),
        featured: false,
      };
      return [copy, ...prev];
    });
  }, []);

  const reset = useCallback(() => setProjects(seed), []);

  const value = useMemo<ProjectsCtx>(
    () => ({ projects, getBySlug, add, update, remove, duplicate, reset }),
    [projects, getBySlug, add, update, remove, duplicate, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProjects() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}

// Convert various Google Drive URL shapes into a previewable embed URL.
export function toDrivePreview(url: string) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

export function toVideoEmbed(url: string) {
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  // Drive
  if (url.includes("drive.google.com")) return toDrivePreview(url);
  return url;
}