import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectBlocks } from "@/components/site/ProjectBlocks";
import { usePageLayout, CUSTOM_PREFIX } from "@/lib/store/pages";
import { useSiteSettings } from "@/lib/store/settings";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Page — Mohamed Benchokroun" },
      { name: "description", content: "Page composée depuis la console d'administration." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
      { property: "og:title", content: "Mohamed Benchokroun — Studio" },
      { property: "og:description", content: "Page du studio Mohamed Benchokroun." },
    ],
  }),
  component: CustomPageView,
});

function CustomPageView() {
  const { slug } = Route.useParams();
  const { layout, isLoading } = usePageLayout(CUSTOM_PREFIX + slug);
  const { settings } = useSiteSettings();
  const meta = (settings.customPages || []).find((p) => p.slug === slug);
  const blocks = layout?.blocks?.filter((b) => b.type !== "module") ?? [];

  return (
    <SiteLayout>
      <header className="bg-brand text-canvas">
        <div className="container-x py-16 md:py-24">
          <p className="eyebrow text-gold mb-4">Studio</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight text-balance">
            {meta?.title || slug.replace(/-/g, " ")}
          </h1>
        </div>
      </header>

      {isLoading ? (
        <div className="container-x py-24 text-center text-sm text-ink-muted">Chargement…</div>
      ) : blocks.length > 0 ? (
        <ProjectBlocks blocks={blocks} />
      ) : (
        <div className="container-x py-24 text-center">
          <p className="text-sm text-ink-muted">Cette page n'a pas encore de contenu.</p>
          <Link to="/" className="mt-6 inline-block text-sm text-gold gold-underline">
            ← Retour à l'accueil
          </Link>
        </div>
      )}
    </SiteLayout>
  );
}
