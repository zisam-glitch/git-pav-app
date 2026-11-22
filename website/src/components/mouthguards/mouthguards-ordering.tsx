import { BookButton, ButtonLink, Section } from "@/components/hims";
import { NumberedList } from "@/components/hims/numbered-list";
import { SectionHeader } from "@/components/hims/section-header";

const PATHWAYS = [
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
    card: "bg-tile-sage",
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
    card: "bg-tile-cream",
  },
] as const;

export function MouthguardsOrdering() {
  return (
    <Section id="ordering" theme="white">
      <SectionHeader title="How to Order" accent="Your Mouthguard" />

      <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-4">
        {PATHWAYS.map((pathway) => (
          <article
            key={pathway.id}
            className={`flex flex-col justify-between gap-8 rounded-[2rem] p-6 md:p-10 ${pathway.card}`}
          >
            <div>
              <h3 className="text-h3-md">{pathway.title}</h3>
              <p className="mt-2 text-lead text-muted">{pathway.subtitle}</p>
              <NumberedList
                size="text"
                className="mt-8"
                items={pathway.steps.map((step) => ({ title: step }))}
              />
              <p className="mt-6 text-small text-muted">{pathway.note}</p>
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
          </article>
        ))}
      </div>
    </Section>
  );
}
