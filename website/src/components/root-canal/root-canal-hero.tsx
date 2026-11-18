import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const HIGHLIGHTS = [
  {
    eyebrow: "Front teeth",
    title: "Basic Root Canal — £195",
    subtitle: "Single-root incisors and canines",
    tone: "hims-tile-warm",
  },
  {
    eyebrow: "Premolars",
    title: "Intermediate — £295",
    subtitle: "Premolars or teeth with two roots",
    tone: "hims-tile-sage",
  },
  {
    eyebrow: "Molars",
    title: "Advanced — £395",
    subtitle: "Complex multi-root molar systems",
    tone: "bg-[#F2EDE5]",
  },
] as const;

export function RootCanalHero() {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-8 sm:pt-28 sm:pb-12"
      aria-label="Pav Dental Advanced Root Canal Care"
    >
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-[1.5rem] hims-hero-gradient text-white">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/18 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
                Microscope-enhanced endodontics
              </span>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-white sm:text-5xl lg:text-[4rem]">
                Pav Dental Advanced Root Canal Care
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Explore our transparent root canal pricing for basic, intermediate, and advanced
                treatments, along with essential information to help you make an informed decision
                about your dental care.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={BOOKING_URL}>
                    Make an appointment <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#pricing">View prices</a>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/85 sm:text-sm">
                <li>Local anaesthetic comfort</li>
                <li>Preserves natural teeth</li>
                <li>
                  <a
                    href={PRACTICE_PHONE_HREF}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    Emergency line: {PRACTICE_PHONE}
                  </a>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-black/15 shadow-2xl">
              <img
                src="/media/hims/suite-editorial.jpg"
                alt="Pav Dental clinical treatment room"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-6 max-w-[87rem] px-2 sm:-mt-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <a
                key={item.title}
                href="#pricing"
                className={`${item.tone} group flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/6 p-5 shadow-[0_6px_24px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-6`}
              >
                <div>
                  <span className="inline-block rounded-full bg-black/6 px-2.5 py-0.5 text-[11px] font-medium text-black/70">
                    {item.eyebrow}
                  </span>
                  <h2 className="mt-2 font-display text-xl font-normal tracking-[-0.02em] text-black">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-black/60">{item.subtitle}</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-black text-white transition-transform duration-200 group-hover:scale-105">
                  <ArrowRight className="size-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
