import { BookButton, ExplainCards, Section, SectionHead } from "@/components/hims";

type RouteOption = "clinic" | "home";

const PATHWAYS: ReadonlyArray<{
  id: RouteOption;
  badge: string;
  title: string;
  subtitle: string;
  steps: readonly string[];
  note: string;
}> = [
  {
    id: "clinic",
    badge: "In-Clinic Digital Scan",
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
    badge: "Postal Impression Kit",
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
  return (
    <Section id="ordering" theme="white" aria-labelledby="mouthguards-ordering-heading">
      <SectionHead
        id="mouthguards-ordering-heading"
        title="How to Order Your Mouthguard"
        action={<BookButton>Make an Appointment</BookButton>}
      />
      <div className="mt-10">
        <ExplainCards
          items={PATHWAYS.map((p) => ({
            title: p.title,
            text: (
              <>
                <p className="font-medium text-[#2a2a2c]">{p.subtitle}</p>
                <ol className="mt-4 list-none space-y-2">
                  {p.steps.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[13px] font-medium text-[#2a2a2c]">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4">{p.note}</p>
              </>
            ),
          }))}
        />
      </div>
    </Section>
  );
}
