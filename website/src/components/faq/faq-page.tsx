import { useMemo, useState } from "react";
import { Clock, HelpCircle, Phone, ShieldCheck } from "lucide-react";
import type { ContentBlock } from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  FaqList,
  Heading,
  Section,
  Tile,
  type FaqItem,
} from "@/components/hims";
import { Button } from "@/components/ui/button";
import { LIVE_PAGES } from "@/content/live-pages";
import { PRACTICE_HOURS, PRACTICE_PHONE } from "@/lib/enquiry";

type FaqCategoryId = "all" | "gums" | "sensitivity" | "visits";

interface CategorisedFaqItem extends FaqItem {
  category: Exclude<FaqCategoryId, "all">;
}

function categoriseQuestion(q: string): Exclude<FaqCategoryId, "all"> {
  const lower = q.toLowerCase();
  if (lower.includes("gum")) return "gums";
  if (lower.includes("sensitive") || lower.includes("toothache")) return "sensitivity";
  return "visits";
}

function extractCategorisedFaqItems(blocks: ContentBlock[]): CategorisedFaqItem[] {
  const items: CategorisedFaqItem[] = [];
  for (let i = 0; i < blocks.length; i += 2) {
    const question = blocks[i];
    const answer = blocks[i + 1];
    if (question?.kind !== "heading" || answer?.kind !== "paragraph") continue;
    items.push({
      q: question.text,
      a: answer.text,
      category: categoriseQuestion(question.text),
    });
  }
  return items;
}

const FAQ_CATEGORIES: ReadonlyArray<{ id: FaqCategoryId; label: string }> = [
  { id: "all", label: "All Questions" },
  { id: "gums", label: "Gums & Hygiene" },
  { id: "sensitivity", label: "Sensitivity & Toothache" },
  { id: "visits", label: "Check-Ups & Nervous Patients" },
];

/** Hims 54b349fb FAQ experience: two-tone display header, category filter pills, and hairline FaqList. */
export function FaqSection() {
  const page = LIVE_PAGES["/faq"];
  const allItems = useMemo(() => extractCategorisedFaqItems(page.blocks), [page.blocks]);
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId>("all");

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return allItems;
    return allItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, allItems]);

  const countFor = (id: FaqCategoryId) =>
    id === "all" ? allItems.length : allItems.filter((item) => item.category === id).length;

  return (
    <>
      <Section theme="cream" width="wide" space="default">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            {page.eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
                <HelpCircle className="size-3.5 text-terracotta" aria-hidden="true" />
                <span>{page.eyebrow}</span>
              </span>
            ) : null}
            <Heading as="h1" size="hero" className="mt-4">
              {page.heading}
            </Heading>
            <p className="mt-4 text-lead text-muted">
              Clear clinical guidance from our Bradford dental team on gum health, tooth
              sensitivity, routine check-ups, dental anxiety, and urgent toothache relief.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" className="bg-white" />
          </div>
        </div>

        {/* Hims category filter pills */}
        <div
          role="tablist"
          aria-label="Filter frequently asked questions by topic"
          className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6"
        >
          {FAQ_CATEGORIES.map((category) => {
            const active = activeCategory === category.id;
            return (
              <Button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={active}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={active ? undefined : "bg-white"}
              >
                <span>{category.label}</span>
                <span className="ml-1.5 opacity-75">({countFor(category.id)})</span>
              </Button>
            );
          })}
        </div>
      </Section>

      {/* Hims Mobbin 54b349fb two-tone display header + hairline accordion */}
      <Section theme="white" width="wide" space="default">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
          <div className="lg:sticky lg:top-24">
            <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
              Patient Guidance
            </span>
            <Heading
              as="h2"
              size="h2"
              accent="Get answers"
              tone="terracotta"
              className="mt-4"
            >
              Have questions?
            </Heading>
            <p className="mt-4 text-body text-muted">
              Select any question to read practical advice from our clinicians, or speak directly
              with our Bradford reception team 24 hours a day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <CallButton variant="outline" />
            </div>

            <Tile tone="cream" className="mt-8 border border-border/70 p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-terracotta">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-label text-fg">24/7 Urgent Dental Advice</p>
                  <p className="mt-1 text-small text-muted">
                    786 Leeds Road, Bradford, BD3 9TY · {PRACTICE_HOURS} ({PRACTICE_PHONE})
                  </p>
                </div>
              </div>
            </Tile>
          </div>

          <div>
            <FaqList items={filteredItems} tone="light" defaultOpen={0} />
          </div>
        </div>
      </Section>

      {/* Hims sand support tiles */}
      <Section theme="sand" width="wide" space="default">
        <div className="grid gap-6 md:grid-cols-3">
          <Tile tone="white" lift className="flex flex-col justify-between gap-5 p-6 md:p-8">
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-pill bg-cream text-terracotta">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-h4 text-fg">Emergency Dental Care</h3>
              <p className="mt-2 text-body text-muted">
                Same-day emergency appointments available 24 hours a day, 7 days a week in Bradford.
              </p>
            </div>
            <ButtonLink to="/services/emergency-dental" variant="outline" size="sm" className="w-fit">
              Emergency Dentistry
            </ButtonLink>
          </Tile>

          <Tile tone="sage" lift className="flex flex-col justify-between gap-5 p-6 md:p-8">
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-pill bg-white text-fg">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-h4 text-fg">Routine Check-Ups &amp; Hygiene</h3>
              <p className="mt-2 text-body text-muted">
                Complete dental check-ups (£35) and professional Airflow hygiene cleanings.
              </p>
            </div>
            <ButtonLink to="/services/oral-hygiene" variant="outline" size="sm" className="w-fit bg-white">
              Oral Hygiene Care
            </ButtonLink>
          </Tile>

          <Tile tone="white" lift className="flex flex-col justify-between gap-5 p-6 md:p-8">
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-pill bg-cream text-terracotta">
                <HelpCircle className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-h4 text-fg">Transparent Fees &amp; Plans</h3>
              <p className="mt-2 text-body text-muted">
                View our full treatment fee schedule and monthly preventative care plans.
              </p>
            </div>
            <ButtonLink to="/pricing" variant="outline" size="sm" className="w-fit">
              View Pricing
            </ButtonLink>
          </Tile>
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
  );
}

export function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <FaqSection />
      <Footer />
    </main>
  );
}
