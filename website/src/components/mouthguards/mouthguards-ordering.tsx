import { useState } from "react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteOption = "clinic" | "home";

const PATHWAYS: ReadonlyArray<{
  id: RouteOption;
  title: string;
  subtitle: string;
  steps: readonly string[];
  note: string;
}> = [
  {
    id: "clinic",
    title: "Visit Our Clinic",
    subtitle: "Accurate digital scan with quick delivery",
    steps: [
      "Book an appointment at Pav Dental",
      "We take a precise digital scan of your teeth",
      "Your custom mouthguard is manufactured",
      "Delivered straight to your address",
    ],
    note: "Digital scans give the highest accuracy and a perfect fit.",
  },
  {
    id: "home",
    title: "Order From Home",
    subtitle: "Easy mould kit sent to your door",
    steps: [
      "We send you a mould kit",
      "You take the impression at home",
      "Use the prepaid label to return it",
      "We create it and send it back to you",
    ],
    note: "This option is ideal if you live far away or need a convenient home solution.",
  },
];

export function MouthguardsOrdering() {
  const [selected, setSelected] = useState<RouteOption>("clinic");

  return (
    <Section id="ordering" theme="cream">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading size="h2-md" accent="Your Mouthguard" tone="terracotta" inline>
            How to Order
          </Heading>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Ordering route">
          {PATHWAYS.map((pathway) => (
            <Button
              key={pathway.id}
              type="button"
              size="sm"
              variant={selected === pathway.id ? "default" : "outline"}
              aria-pressed={selected === pathway.id}
              onClick={() => setSelected(pathway.id)}
            >
              {pathway.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {PATHWAYS.map((pathway) => {
          const isSelected = selected === pathway.id;
          return (
            <Tile
              key={pathway.id}
              tone="white"
              className={cn(
                "flex flex-col justify-between gap-6 p-6 md:p-8 t-colors",
                isSelected && "ring-2 ring-black",
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-h3-md text-fg">{pathway.title}</h3>
                    <p className="mt-2 text-lead text-muted">{pathway.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(pathway.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "shrink-0 rounded-pill border px-3 py-1 text-small font-medium t-colors",
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-border-strong bg-white text-fg hover:border-black",
                    )}
                  >
                    {isSelected ? "Selected" : "Choose"}
                  </button>
                </div>

                <ol className="mt-6 divide-y divide-border border-y border-border">
                  {pathway.steps.map((step, index) => (
                    <li key={step} className="flex items-baseline gap-4 py-3.5">
                      <span className="text-small font-medium tabular-nums text-muted">
                        {index + 1}
                      </span>
                      <span className="text-body text-fg">{step}</span>
                    </li>
                  ))}
                </ol>

                <p className="mt-5 text-body text-muted">{pathway.note}</p>
              </div>

              <div>
                {pathway.id === "clinic" ? (
                  <BookButton className="w-full sm:w-auto">Make an Appointment</BookButton>
                ) : (
                  <ButtonLink href="#contact" variant="outline" className="w-full sm:w-auto">
                    Contact us
                  </ButtonLink>
                )}
              </div>
            </Tile>
          );
        })}
      </div>
    </Section>
  );
}
