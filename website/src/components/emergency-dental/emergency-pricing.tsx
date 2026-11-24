import {
  BookButton,
  CallButton,
  CardRail,
  HUB_CARD,
  Section,
  SectionHead,
} from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const TREATMENT_FEES = [
  { name: "Tooth Extraction", price: "from £95" },
  { name: "Filling", price: "from £95" },
  { name: "Antibiotics", price: "£25" },
  { name: "Irrigation/cleaning of gums &/or wisdom tooth", price: "£75" },
  { name: "Dry socket", price: "£60" },
  { name: "Accessing & dressing a tooth", price: "from £170" },
  { name: "Surgical drainage of abscess", price: "£160" },
  { name: "Recement bridge/crown/veneer", price: "from £60" },
  { name: "Re-fixing a tooth loosened by trauma", price: "£195" },
] as const;

export function EmergencyPricing() {
  return (
    <Section id="pricing" theme="white" aria-labelledby="emergency-pricing-heading">
      <SectionHead
        id="emergency-pricing-heading"
        title="How much does it cost?"
        action={<CallButton>Call us Now · {PRACTICE_PHONE}</CallButton>}
      >
        Consultation (include exam, X-rays and diagnosis) appointment fee:
      </SectionHead>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <div className={`${HUB_CARD} flex min-h-[300px] flex-col justify-between p-8`}>
          <span className="w-fit rounded-full bg-[#8a4242] px-3 py-1 text-[13px] font-medium text-white">
            Standard Hours
          </span>
          <div>
            <p className="text-[clamp(56px,7vw,96px)] leading-none font-normal tracking-[-0.04em] text-[#2a2a2c] tabular-nums">
              £45
            </p>
            <p className="mt-4 text-[17px] text-[#6b6b70]">Monday to Friday between 9am – 5pm</p>
          </div>
        </div>
        <div className="flex min-h-[300px] flex-col justify-between rounded-[24px] bg-[linear-gradient(160deg,#5a4630_0%,#3a2c1b_100%)] p-8 text-white">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium">
            Out of Hours
          </span>
          <div>
            <p className="text-[clamp(56px,7vw,96px)] leading-none font-normal tracking-[-0.04em] tabular-nums">
              £90
            </p>
            <p className="mt-4 text-[17px] text-white/80">
              Out of Hours – Weekends 9am – 8pm and Weekdays 5pm – 8pm
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-2 text-[17px] text-[#55565a]">
        <p className="font-medium text-[#2a2a2c]">
          Contact us for prices and appointments after 8pm
        </p>
        <p>
          All patients receive an individual treatment plan with clearly illustrated costs prior to
          undergoing emergency dental treatment.
        </p>
      </div>
      <div className="mt-12">
        <CardRail
          label="Emergency treatment fees"
          items={TREATMENT_FEES.map((t) => ({ label: t.price, title: t.name, text: "" }))}
        />
      </div>
      <div
        className={`${HUB_CARD} mt-10 flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center md:p-9`}
      >
        <p className="max-w-xl text-[22px] leading-[1.3] text-[#2a2a2c]">
          Anyone can book an appointment online with a dentist 24 hours a day, 7 days a week.
        </p>
        <div className="flex flex-wrap gap-3">
          <CallButton>Call us Now · {PRACTICE_PHONE}</CallButton>
          <BookButton variant="outline">Book Online</BookButton>
        </div>
      </div>
    </Section>
  );
}
