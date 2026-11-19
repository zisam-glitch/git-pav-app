import {
  ContentBlocks,
  ContentPageBody,
  type ContentBlock,
} from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import {
  BookButton,
  CallButton,
  CtaBand,
  FaqList,
  Heading,
  Section,
  type FaqItem,
} from "@/components/hims";
import { LIVE_PAGES, type LivePage, type LivePagePath } from "@/content/live-pages";

function extractFaqItems(blocks: ContentBlock[]): FaqItem[] | null {
  const items: FaqItem[] = [];
  for (let i = 0; i < blocks.length; i += 2) {
    const question = blocks[i];
    const answer = blocks[i + 1];
    if (question?.kind !== "heading" || answer?.kind !== "paragraph") return null;
    items.push({ q: question.text, a: answer.text });
  }
  return items.length > 0 ? items : null;
}

/** A page whose text is ported from the live site, between the site header and footer. */
export function LiveContentPage({ path }: { path: LivePagePath }) {
  const page: LivePage = LIVE_PAGES[path];
  const faqItems = path === "/faq" ? extractFaqItems(page.blocks) : null;

  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      {faqItems ? (
        <>
          <Section theme="cream" width="wide" space="sm">
            {page.eyebrow ? (
              <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
                {page.eyebrow}
              </span>
            ) : null}
            <Heading as="h1" size="hero" className={page.eyebrow ? "mt-4" : undefined}>
              {page.heading}
            </Heading>
          </Section>

          <Section theme="white" width="wide" space="default">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
              <div className="lg:sticky lg:top-24">
                <Heading as="h2" size="h2-md" accent="answered" tone="terracotta">
                  Your questions,
                </Heading>
                <div className="mt-6 flex flex-wrap gap-3">
                  <BookButton>Book Now</BookButton>
                  <CallButton variant="outline" />
                </div>
              </div>

              <FaqList items={faqItems} tone="light" defaultOpen={0} />
            </div>
          </Section>

          <CtaBand
            theme="brown"
            title="Still have questions"
            accent="for our dental team?"
            tone="gold"
            actions={
              <>
                <BookButton variant="gold">Book Now</BookButton>
                <CallButton variant="glass" />
              </>
            }
          >
            786 Leeds Road, Bradford, BD3 9TY · Open 00:00 – 24:00, seven days a week.
          </CtaBand>
        </>
      ) : (
        <ContentPageBody eyebrow={page.eyebrow} title={page.heading}>
          <ContentBlocks blocks={page.blocks} />
        </ContentPageBody>
      )}

      <Footer />
    </main>
  );
}
