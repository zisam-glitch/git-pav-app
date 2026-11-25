import { useState } from "react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PERSONALISATION_OPTIONS = [
  { id: "name", label: "Name", placeholder: "e.g. Jordan" },
  { id: "initials", label: "Initials", placeholder: "e.g. J.S." },
  { id: "team", label: "Team Name", placeholder: "e.g. Bradford RFC" },
  { id: "number", label: "Number", placeholder: "e.g. 10" },
  { id: "logo", label: "Custom Logo", placeholder: "Describe your club or team logo" },
] as const;

export function MouthguardsPersonalisation() {
  const [selectedId, setSelectedId] =
    useState<(typeof PERSONALISATION_OPTIONS)[number]["id"]>("name");
  const [customText, setCustomText] = useState("");

  const active =
    PERSONALISATION_OPTIONS.find((option) => option.id === selectedId) ??
    PERSONALISATION_OPTIONS[0];

  return (
    <Section
      id="personalisation"
      theme="white"
      aria-labelledby="mouthguards-personalisation-heading"
    >
      <div className="grid items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <div className="max-w-xl">
          <div id="mouthguards-personalisation-heading" className="mt-4">
            <Heading size="h2-md" accent="Personalisation" tone="terracotta" inline>
              Add
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Personalise your mouthguard with your name, initials, team name, number, or even a
            custom logo if required.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {PERSONALISATION_OPTIONS.map((option) => (
              <li key={option.id}>
                <Button
                  type="button"
                  size="sm"
                  variant={selectedId === option.id ? "default" : "outline"}
                  aria-pressed={selectedId === option.id}
                  onClick={() => setSelectedId(option.id)}
                >
                  {option.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <Tile tone="grey" className="border border-border p-6 md:p-8">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="mg-personalisation-input">{active.label}</Label>
              <Input
                id="mg-personalisation-input"
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                placeholder={active.placeholder}
              />
            </div>

            <div className="rounded-xl border border-border bg-white px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-caption font-medium text-copper">Preview ({active.label})</p>
                <span className="inline-flex items-center rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium text-terracotta">
                  Custom Inscription
                </span>
              </div>
              <p className="mt-2 text-h3-md text-fg">
                {customText.trim() || active.placeholder.replace(/^e\.g\.\s*/, "")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
              <BookButton>Make an Appointment</BookButton>
              <ButtonLink href="#contact" variant="outline">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
