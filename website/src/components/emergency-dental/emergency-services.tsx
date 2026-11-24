import { BookButton, CallButton, Section, SectionHead } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const EMERGENCY_CONDITIONS = [
  { id: "toothache", title: "Toothache" },
  { id: "sensitivity", title: "Sensitivity" },
  { id: "broken-filling", title: "Broken Filling Tooth" },
  { id: "swelling-abscess", title: "Swelling/Abscess" },
  { id: "denture-adjustment", title: "Denture Adjustment" },
  { id: "recement-crowns", title: "Re-cement Crowns" },
  { id: "dental-trauma", title: "Dental Trauma" },
  { id: "painful-gums", title: "Painful Gums" },
] as const;

const GRADIENTS = [
  "linear-gradient(160deg,#b5644a,#7a3a3a)",
  "linear-gradient(160deg,#c98b6b,#8a4242)",
  "linear-gradient(160deg,#6f5a43,#3a2c1b)",
  "linear-gradient(160deg,#8a6f55,#5a4630)",
];

export function EmergencyServices() {
  return (
    <Section id="services" theme="white" aria-labelledby="emergency-services-heading">
      <SectionHead
        id="emergency-services-heading"
        title="Our Emergency Dentist Can Help With The Following"
        action={<CallButton>Call us Now · {PRACTICE_PHONE}</CallButton>}
      />
      <ul className="mt-10 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_CONDITIONS.map((cond, i) => (
          <li key={cond.id}>
            <div
              className="flex aspect-[4/3] items-end rounded-[22px] p-5 text-white"
              style={{ background: GRADIENTS[i % 4] }}
            >
              <span className="grid size-10 place-items-center rounded-full bg-white/20 text-[15px] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 text-[22px] leading-[1.15] font-normal text-[#2a2a2c]">
              {cond.title}
            </h3>
            <BookButton variant="ghost" size="sm" className="mt-1 -ml-3">
              Book now →
            </BookButton>
          </li>
        ))}
      </ul>
    </Section>
  );
}
