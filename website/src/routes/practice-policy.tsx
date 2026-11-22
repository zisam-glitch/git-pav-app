import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { documentFileType } from "@/components/content/content-blocks";
import {
  LegalDocumentPage,
  LegalSection,
  type LegalTocItem,
} from "@/components/legal/legal-document-layout";
import { LIVE_PAGES } from "@/content/live-pages";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/practice-policy")({
  head: () => seoHead("/practice-policy"),
  component: PracticePolicyPage,
});

interface DocumentGroup {
  id: string;
  title: string;
  items: Array<{ text: string; href: string }>;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractDocumentGroups(): { subtitle?: string; groups: DocumentGroup[] } {
  const page = LIVE_PAGES["/practice-policy"];
  let subtitle: string | undefined;
  const groups: DocumentGroup[] = [];
  let currentTitle = "Documents";

  for (const block of page.blocks) {
    if (block.kind === "paragraph" && !subtitle) {
      subtitle = block.text;
    } else if (block.kind === "heading") {
      currentTitle = block.text;
    } else if (block.kind === "documents") {
      groups.push({
        id: slugify(currentTitle),
        title: currentTitle,
        items: block.items,
      });
    }
  }

  return { subtitle, groups };
}

function PracticePolicyPage() {
  const page = LIVE_PAGES["/practice-policy"];
  const { subtitle, groups } = extractDocumentGroups();
  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  const toc: LegalTocItem[] = groups.map((group) => ({
    id: group.id,
    label: group.title,
    meta: String(group.items.length),
  }));

  return (
    <LegalDocumentPage
      currentPath="/practice-policy"
      category="Practice Governance & Forms"
      title={page.heading}
      subtitle={subtitle}
      metaItems={[
        `${totalCount} downloadable documents`,
        ...groups.map((group) => `${group.items.length} ${group.title}`),
      ]}
      toc={toc}
    >
      {groups.map((group, groupIndex) => (
        <LegalSection
          key={group.id}
          id={group.id}
          number={String(groupIndex + 1).padStart(2, "0")}
          title={group.title}
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {group.items.map((item) => {
              const typeLabel = documentFileType(item.href);
              return (
                <li key={item.href} className="min-w-0">
                  <a
                    href={item.href}
                    className="group flex h-full items-center justify-between gap-3 rounded-xl border border-transparent bg-tile-cream px-4 py-4 text-label text-fg t-lift hover:border-border hover:bg-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-terracotta t-colors group-hover:bg-cream">
                        <FileText aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0 text-small font-medium leading-snug text-fg t-colors group-hover:text-terracotta">
                        {item.text}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {typeLabel ? (
                        <span className="rounded-pill border border-border bg-white px-2.5 py-0.5 text-caption font-medium tracking-[0.04em] text-terracotta">
                          {typeLabel}
                        </span>
                      ) : null}
                      <Download
                        aria-hidden="true"
                        className="size-4 text-muted t-colors group-hover:text-fg"
                      />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </LegalSection>
      ))}
    </LegalDocumentPage>
  );
}
