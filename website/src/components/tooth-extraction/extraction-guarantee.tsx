import { Clock, ShieldCheck } from "lucide-react";
import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";

const GUARANTEE_CARDS = [
  {
    id: "same-day",
    title: "Alleviating your pain promptly",
    body: "In addition to our same-day extraction services, we offer comprehensive aftercare support to help you recover swiftly and return to your daily routine with minimal disruption.",
    icon: Clock,
  },
  {
    id: "ongoing-guidance",
    title: "Post-extraction support",
    body: "Our team is always available to answer any questions and provide guidance on how to care for your mouth post-extraction.",
    icon: ShieldCheck,
  },
] as const;

export function ExtractionGuarantee() {
  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <Heading as="h2" size="hero" accent="Same Day Treatment" tone="gold">
            Guaranteed Tooth Extraction
          </Heading>
          <p className="mt-5 text-lead text-white">
            We understand that tooth pain can be unbearable and waiting is not an option.
            That&rsquo;s why we guarantee same-day tooth extraction services to provide you with
            immediate relief.
          </p>
          <p className="mt-4 text-body text-white/80">
            Our highly skilled dental professionals are dedicated to ensuring that your experience
            is as comfortable and stress-free as possible. Using the latest techniques and
            state-of-the-art equipment, we can quickly and safely remove the affected tooth,
            alleviating your pain and preventing further complications.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </div>
        </div>

        <div className="grid gap-4">
          {GUARANTEE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Tile
                key={card.id}
                tone="glass"
                className="flex flex-col gap-4 border border-white/12 p-6 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-white/10 text-gold">
                    <Icon aria-hidden className="size-4" />
                  </span>
                </div>
                <h3 className="text-h4 text-white">{card.title}</h3>
                <p className="text-body text-white/80">{card.body}</p>
              </Tile>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
