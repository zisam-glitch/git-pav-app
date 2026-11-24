import { BookButton, CallButton, HUB_CARD, Section } from "@/components/hims";

const SHOWCASE_OPTIONS = [
  {
    id: "intermediate",
    label: "Intermediate - acrylic with clasps",
    detail: "Secure retention with discreet clasp support for everyday comfort.",
  },
  {
    id: "premium",
    label: "Premium - Flexible denture",
    detail: "Lightweight, gum-coloured flexible Valplast design with a natural fit.",
  },
] as const;

export function DenturesShowcase() {
  return (
    <Section theme="white" space="sm" aria-labelledby="dentures-showcase-heading">
      <div className={`${HUB_CARD} grid items-center gap-8 p-4 md:p-6 lg:grid-cols-2 lg:gap-14`}>
        <div className="overflow-hidden rounded-[20px]">
          <img
            src="/images/generated/dentures-showcase.jpg"
            alt="Acrylic and flexible denture craftsmanship on a calm dark studio surface"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div className="px-3 py-4 md:px-6">
          <h2
            id="dentures-showcase-heading"
            className="text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Dentures
          </h2>
          <ul className="mt-6 list-none space-y-3">
            {SHOWCASE_OPTIONS.map((o) => (
              <li key={o.id} className="rounded-[16px] bg-white px-5 py-4">
                <p className="text-[18px] font-medium text-[#2a2a2c]">{o.label}</p>
                <p className="mt-1 text-[14px] text-[#6b6b70]">{o.detail}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Make an Appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </div>
    </Section>
  );
}
