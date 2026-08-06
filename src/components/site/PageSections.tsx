import { Fragment, type ReactNode } from "react";
import { ProjectBlocks } from "@/components/site/ProjectBlocks";
import { usePageLayout, type PageKey } from "@/lib/store/pages";

/**
 * Rend une page à partir de sa mise en page enregistrée (mode « Elementor »).
 * Sans mise en page personnalisée, l'ordre par défaut des sections natives est utilisé.
 */
export function PageSections({
  page,
  modules,
  defaultOrder,
}: {
  page: PageKey;
  modules: Record<string, ReactNode>;
  defaultOrder: string[];
}) {
  const { layout } = usePageLayout(page);
  const custom = layout?.enabled && layout.blocks.length > 0 ? layout.blocks : null;

  if (!custom) {
    return <>{defaultOrder.map((k) => <Fragment key={k}>{modules[k] ?? null}</Fragment>)}</>;
  }

  return (
    <>
      {custom.map((b) =>
        b.type === "module" ? (
          <Fragment key={b.id}>{modules[b.module] ?? null}</Fragment>
        ) : (
          <ProjectBlocks key={b.id} blocks={[b]} />
        ),
      )}
    </>
  );
}
