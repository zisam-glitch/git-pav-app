import { useState } from "react";
import { ArrowRight, Minus, Phone, Plus } from "lucide-react";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Button } from "@/components/ui/button";
import {
  ContentBlocks,
  ContentPageBody,
  type ContentBlock,
} from "@/components/content/content-blocks";
import { LIVE_PAGES, type LivePage, type LivePagePath } from "@/content/live-pages";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

interface FaqItem {
  question: string;
  answers: string[];
}

function groupFaqItems(blocks: ContentBlock[]): FaqItem[] {
  const items: FaqItem[] = [];
  for (const block of blocks) {
    if (block.kind === "heading") {
      items.push({ question: block.text, answers: [] });
    } else if (block.kind === "paragraph" && items.length > 0) {
      items[items.length - 1].answers.push(block.text);
    }
  }
  return items;
}

function FaqAccordionPage({ page }: { page: LivePage }) {
  const items = groupFaqItems(page.blocks);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-[#FBF8F5] pt-24 pb-20 sm:pt-28">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          {page.eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              {page.eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-6xl">
            Frequently Asked <span className="text-[#754B3D]">Questions</span>
          </h1>
        </header>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-black/10 border-y border-black/10">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="py-6 sm:py-7">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 text-left"
                >
                  <span className="font-display text-xl font-normal tracking-[-0.025em] text-black sm:text-2xl">
                    {item.question}
                  </span>
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F2EDE5] text-black transition-colors hover:bg-[#1B3745] hover:text-white"
                    aria-hidden="true"
                  >
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4 space-y-3 pr-10 text-sm leading-relaxed text-black/65 sm:text-base">
                    {item.answers.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                Still have a dental question?
              </h2>
              <p className="mt-1.5 text-sm text-black/65">
                Speak with our Bradford reception team or book your visit online.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <a href={BOOKING_URL}>Book Appointment</a>
              </Button>
              <Button asChild variant="outline">
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4" aria-hidden="true" />
                  {PRACTICE_PHONE}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesDirectoryPage({ page }: { page: LivePage }) {
  return (
    <div className="bg-[#FBF8F5] pt-24 pb-20 sm:pt-28">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">Treatments</p>
            <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-6xl">
              Our <span className="text-[#754B3D]">Services</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={BOOKING_URL}>
                Book Appointment
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/pricing">View Pricing</a>
            </Button>
          </div>
        </div>

        <ContentBlocks blocks={page.blocks} />

        <div className="mt-14 rounded-[1.5rem] hims-navy-gradient px-7 py-10 text-white sm:px-12 sm:py-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                24/7 Bradford Practice
              </p>
              <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-4xl">
                Need same-day dental care or advice?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                Book online in minutes or call our 24-hour emergency line directly.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="gold" size="lg">
                <a href={BOOKING_URL}>Book Appointment</a>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4" aria-hidden="true" />
                  {PRACTICE_PHONE}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A page whose text is ported from the live site, between the site header and footer. */
export function LiveContentPage({ path }: { path: LivePagePath }) {
  const page: LivePage = LIVE_PAGES[path];

  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <Header />
      {path === "/faq" ? (
        <FaqAccordionPage page={page} />
      ) : path === "/services" ? (
        <ServicesDirectoryPage page={page} />
      ) : (
        <ContentPageBody eyebrow={page.eyebrow} title={page.heading}>
          <ContentBlocks blocks={page.blocks} />
        </ContentPageBody>
      )}
      <Footer />
    </main>
  );
}
