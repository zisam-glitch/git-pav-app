import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ContentBlocks, ContentPageBody } from "@/components/content/content-blocks";
import { LIVE_PAGES, type LivePage, type LivePagePath } from "@/content/live-pages";

/** A page whose text is ported from the live site, between the site header and footer. */
export function LiveContentPage({ path }: { path: LivePagePath }) {
  const page: LivePage = LIVE_PAGES[path];
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <Header />
      <ContentPageBody eyebrow={page.eyebrow} title={page.heading}>
        <ContentBlocks blocks={page.blocks} />
      </ContentPageBody>
      <Footer />
    </main>
  );
}
