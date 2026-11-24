import { ArrowUpRight } from "lucide-react";

interface VisaSponsorshipBannerProps {
  onApplySponsorship: () => void;
}

const SPONSORSHIP_PILLARS = [
  {
    step: "01",
    title: "Skilled Worker Sponsorship",
    body: "Direct employer visa sponsorship supporting relocation to our Bradford practice.",
  },
  {
    step: "02",
    title: "GDC & Clinical Mentorship",
    body: "Structured induction and clinical guidance alongside our experienced Bradford team.",
  },
  {
    step: "03",
    title: "Long-Term Career Growth",
    body: "Modern digital dentistry suites, multidisciplinary support, and community impact.",
  },
] as const;

export function VisaSponsorshipBanner({ onApplySponsorship }: VisaSponsorshipBannerProps) {
  return (
    <section id="sponsorship" className="scroll-mt-24 bg-black text-white">
      <div className="mx-auto w-full max-w-[1392px] px-4 py-16 md:py-24">
        <p className="text-[14px] tracking-[0.14em] text-white/55 uppercase">
          International Dental Talent
        </p>
        <h2 className="mt-5 text-[clamp(44px,7vw,112px)] leading-[0.92] font-medium tracking-[-0.045em]">
          Foreign Visa
          <span className="block text-white/40">and Sponsorship</span>
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <p className="text-[clamp(20px,1.8vw,26px)] leading-[1.35] text-white/85">
            Pav Dental is seeking qualified dentists from abroad and offering foreign visa
            sponsorship to support their relocation and employment. This position is designed to
            provide skilled dental professionals with an opportunity to work in a new environment,
            expand their expertise, and contribute to the oral health of the community.
          </p>
          <div>
            <button
              type="button"
              onClick={onApplySponsorship}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[16px] font-medium text-black t-colors hover:bg-white/85"
            >
              Apply Now
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <ul className="mt-14 list-none border-t border-white/30">
          {SPONSORSHIP_PILLARS.map((pillar) => (
            <li
              key={pillar.step}
              className="grid gap-3 border-b border-white/15 py-7 md:grid-cols-[100px_1fr_1.2fr] md:gap-10"
            >
              <span className="text-[16px] text-white/50 tabular-nums">{pillar.step}</span>
              <h3 className="text-[26px] leading-tight font-medium tracking-[-0.02em]">
                {pillar.title}
              </h3>
              <p className="max-w-[520px] text-[17px] leading-[1.5] text-white/70">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
