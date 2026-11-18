import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const HIGHLIGHTS = [
  {
    eyebrow: "Domiciliary",
    title: "Home Visits",
    subtitle: "Comprehensive dental services in the comfort of your own home",
    tone: "hims-tile-warm",
  },
  {
    eyebrow: "Residential",
    title: "Care Home Sessions",
    subtitle: "Supporting oral-health CQC compliance and resident wellbeing",
    tone: "hims-tile-sage",
  },
  {
    eyebrow: "UK-wide",
    title: "NHS Partners",
    subtitle: "Latest mobile dental equipment delivered to your doorstep",
    tone: "bg-[#F2EDE5]",
  },
] as const;

export function MobileDentistryHero() {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-8 sm:pt-28 sm:pb-12"
      aria-label="Mobile dental care"
    >
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-[1.5rem] hims-navy-gradient text-white">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#ECD880] px-3.5 py-1 text-xs font-medium text-[#1B3745]">
                Coming Soon
              </span>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-white sm:text-5xl lg:text-[4rem]">
                Mobile dental care at{" "}
                <span className="text-[#ECD880]">Doorstep</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                Pav Dental Mobile enables patients to access a full range of dental services from
                the comfort of their own home — combining traditional and mobile dentistry with
                modern portable equipment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <a href={BOOKING_URL}>
                    Make an appointment <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#contact">Contact us</a>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/80 sm:text-sm">
                <li>Home visits</li>
                <li>Care home services</li>
                <li>
                  <a
                    href={PRACTICE_PHONE_HREF}
                    className="underline underline-offset-4 hover:text-[#ECD880]"
                  >
                    Enquiries: {PRACTICE_PHONE}
                  </a>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-black/20 shadow-2xl">
              <img
                src="/media/hims/mobile-van-editorial.jpg"
                alt="Mobile dental surgery unit"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-6 max-w-[87rem] px-2 sm:-mt-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className={`${item.tone} rounded-[1.5rem] border border-black/6 p-5 shadow-[0_6px_24px_rgba(0,0,0,0.05)] sm:p-6`}
              >
                <span className="inline-block rounded-full bg-black/6 px-2.5 py-0.5 text-[11px] font-medium text-black/70">
                  {item.eyebrow}
                </span>
                <h2 className="mt-2 font-display text-xl font-normal tracking-[-0.02em] text-black">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-black/65">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
