import { BeigeGrid, BookButton, CallButton, Section, SectionHead } from "@/components/hims";

const INSTRUCTIONS = [
  {
    title: "Pain Management:",
    steps: [
      "Use over-the-counter pain relievers like ibuprofen or acetaminophen as directed.",
      "If prescribed pain medication, take as instructed.",
    ],
  },
  {
    title: "Swelling and Bruising:",
    steps: [
      "Apply an ice pack to the cheek near the extraction site for 10 minutes on, then 10 minutes off, during the first 24 hours.",
    ],
  },
  {
    title: "Rest:",
    steps: [
      "Relax for at least 24 hours after the extraction.",
      "Avoid strenuous activities for 2-3 days to reduce bleeding and help the healing process.",
    ],
  },
  {
    title: "Oral Hygiene:",
    steps: [
      "Do not rinse your mouth for the first 24 hours.",
      "After 24 hours, gently rinse with warm salt water (1/2 teaspoon of salt in a cup of water) after meals and before bed.",
    ],
  },
  {
    title: "Bleeding Management:",
    steps: [
      "Bite on a gauze pad firmly for 30-60 minutes after the extraction.",
      "If bleeding continues, replace the gauze and bite down for another 30 minutes.",
    ],
  },
  {
    title: "Eating and Drinking:",
    steps: [
      "Start with soft foods and liquids.",
      "Avoid using a straw for the first few days to prevent dislodging the blood clot.",
      "Avoid hot liquids and alcoholic beverages in the first 24 hours.",
    ],
  },
  {
    title: "Smoking:",
    steps: [
      "Avoid smoking for as long as possible after the extraction, ideally for at least 48 hours.",
    ],
  },
  {
    title: "Protect the Clot:",
    steps: ["Avoid spitting or rinsing forcefully.", "Chew on the opposite side of your mouth."],
  },
  {
    title: "Medications:",
    steps: ["Take any prescribed antibiotics as directed to prevent infection."],
  },
  {
    title: "Follow-Up:",
    steps: ["Keep any follow-up appointments with your dentist or oral surgeon."],
  },
];

export function ExtractionPostOp() {
  return (
    <Section id="post-op" theme="white" aria-labelledby="extraction-postop-heading">
      <SectionHead
        id="extraction-postop-heading"
        title="Post Operative Instructions"
        action={<BookButton>Make an Appointment</BookButton>}
      />
      <div className="mt-10">
        <BeigeGrid
          items={INSTRUCTIONS.map((i) => ({
            title: i.title,
            lines: [...i.steps],
          }))}
        />
      </div>
      <div className="mt-3 rounded-[24px] bg-[#f1e9de] p-7 md:p-9">
        <h3 className="text-[24px] font-normal text-[#5a2f2f]">Watch for Complications:</h3>
        <p className="mt-3 max-w-3xl text-[16px] leading-[1.5] text-[#8b7f73]">
          - Look out for signs of infection like fever, severe pain, or swelling that worsens after
          a few days. Also, be aware of dry socket, a condition where the blood clot fails to
          develop or is dislodged, leading to delayed healing.
        </p>
      </div>
      <div className="mt-3 rounded-[24px] bg-[#f7f7f7] p-7 md:p-9">
        <h3 className="text-[24px] font-normal text-[#2a2a2c]">Reminder:</h3>
        <p className="mt-3 max-w-3xl text-[16px] leading-[1.5] text-[#6b6b70]">
          Remember, these are general guidelines. Always adhere to the specific instructions given
          by your healthcare provider, as they may have additional or different recommendations
          based on your individual case and health history.
        </p>
        <div className="mt-6">
          <CallButton variant="outline" />
        </div>
      </div>
    </Section>
  );
}
