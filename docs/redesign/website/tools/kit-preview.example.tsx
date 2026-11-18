import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Clock, PhoneCall } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  Carousel,
  CtaBand,
  FaqList,
  Heading,
  Media,
  Section,
  SplitFeature,
  Stat,
  Tile,
  TileLink,
  TrustStrip,
} from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Temporary: a living style guide for the Hims kit. Remove before the redesign is merged.
export const Route = createFileRoute("/kit-preview")({ component: KitPreview });

function KitPreview() {
  return (
    <main>
      <Section theme="white">
        <Heading as="h1" size="hero" accent="starts here" tone="terracotta">
          Your best smile
        </Heading>
        <p className="mt-4 max-w-xl text-lead text-muted">
          Complete dental check-ups, same-day care and 24/7 emergency help in Bradford. This is the lead paragraph in
          text-lead.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BookButton />
          <CallButton />
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <TileLink to="/services/whitening" title="Whiten" accent="teeth" accentTone="clay" description="Safer, brighter" media={<Media alt="" ratio="4 / 3" tone="cream" />} />
          <TileLink to="/services/root-canal" tone="sage" title="Root" accent="canal" accentTone="copper" media={<Media alt="" ratio="4 / 3" tone="sage" />} />
          <TileLink to="/services/dentures" title="Dentures" media={<Media alt="" ratio="4 / 3" tone="cream" />} />
          <Tile lift>
            <p className="text-h4">Plain tile with lift</p>
            <p className="mt-2 text-small text-muted">Hover me: grows to 1.02 with a soft shadow.</p>
          </Tile>
        </div>
        <TrustStrip
          className="mt-8"
          items={[
            { icon: <ShieldCheck className="size-4" />, text: "GDC registered clinicians", tone: "terracotta" },
            { icon: <Clock className="size-4" />, text: "Open 24 hours, 7 days a week", tone: "navy" },
            { icon: <PhoneCall className="size-4" />, text: "Same-day appointments", tone: "copper" },
          ]}
        />
      </Section>

      <Section theme="brown" space="lg">
        <Heading size="hero" accent="breakthrough is here" tone="gold">
          Your treatment
        </Heading>
        <p className="mt-4 max-w-xl text-lead text-white/80">Dark feature section on brown with gold pill and glass pill.</p>
        <div className="mt-6 flex gap-3">
          <BookButton variant="gold" />
          <ButtonLink to="/pricing" variant="glass">
            See pricing
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tile tone="glass" lift>
            <Stat tone="dark" value="25+" label="Years of experience" />
          </Tile>
          <Tile tone="glass">
            <Stat tone="dark" value="2" label="Doctors" />
          </Tile>
          <Tile tone="glass">
            <Stat tone="dark" value="24/7" label="Emergency care" />
          </Tile>
        </div>
      </Section>

      <Section theme="navy" space="lg">
        <Heading size="h2" accent="care for you" tone="butter">
          Navy section with
        </Heading>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="https://example.com" variant="butter">
            Butter pill
          </ButtonLink>
          <ButtonLink to="/about" variant="sky">
            Sky pill
          </ButtonLink>
        </div>
        <Carousel label="Demo carousel" arrows="dark" className="mt-8">
          {[1, 2, 3, 4, 5].map((n) => (
            <Tile key={n} tone="glass" className="h-64">
              <p className="text-h4">Card {n}</p>
              <p className="mt-2 text-small text-white/70">Carousel shows 1.15 / 2.3 / 3.4 cards.</p>
            </Tile>
          ))}
        </Carousel>
      </Section>

      <Section theme="white">
        <SplitFeature media={<Media alt="Placeholder" ratio="4 / 3" tone="cream" />}>
          <Heading size="h2-md" accent="in your own words" tone="clay">
            Split feature
          </Heading>
          <p className="mt-4 text-body text-muted">Body copy in text-body with the Hims tracking. Lorem ipsum dolor sit amet.</p>
        </SplitFeature>
      </Section>

      <Section theme="cream" width="prose">
        <Heading size="h2-md">Frequently asked questions</Heading>
        <FaqList
          className="mt-6"
          items={[
            { q: "What is an emergency dentist?", a: "An emergency dentist provides rapid, same-day assessment and urgent treatment." },
            { q: "Can I get treatment on the same day?", a: "Yes. We keep daily emergency slots for walk-ins and same-day phone bookings." },
            { q: "Do you treat nervous patients?", a: "Yes, gently, with modern local anaesthetic techniques." },
          ]}
        />
      </Section>

      <Section theme="white" width="bento">
        <div className="rounded-xl bg-cream p-8 md:p-[60px]">
          <Heading size="h3-md">Form fields</Heading>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="n">Your name</Label>
              <Input id="n" placeholder="Name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="e">Email</Label>
              <Input id="e" type="email" placeholder="you@example.test" />
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="m">Message</Label>
              <Textarea id="m" placeholder="How can we help?" />
            </div>
          </div>
          <Button className="mt-6 w-full">Send message</Button>
        </div>
      </Section>

      <CtaBand
        theme="brown"
        title="Ready when you are,"
        accent="book now or call"
        actions={
          <>
            <BookButton variant="gold" />
            <CallButton variant="glass" />
          </>
        }
      >
        Same-day appointments and 24/7 emergency care.
      </CtaBand>
    </main>
  );
}
