import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const HIGHLIGHTS = [
  {
    eyebrow: "Emergency access",
    title: "Same-day relief",
    subtitle: "Dedicated emergency slots reserved daily in Bradford",
    tone: "hims-tile-warm",
  },
  {
    eyebrow: "Comfort first",
    title: "Gentle local anaesthetic",
    subtitle: "Calm, unhurried care with sedation options discussed",
    tone: "hims-tile-sage",
  },
  {
    eyebrow: "Recovery",
    title: "Full aftercare support",
    subtitle: "Clear post-operative guidance and 24-hour clinical helpline",
    tone: "bg-[#F2EDE5]",
  },
] as const;

export function ExtractionHero() {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-10 sm:pt-28 sm:pb-14"
      aria-label="Same-day tooth extraction"
    >
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#F2EDE5] px-3.5 py-1 text-xs font-medium text-black/75">
              Emergency &amp; routine oral surgery
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
              Same-day tooth extraction{" "}
              <span className="text-[#754B3D]">from £95</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
              At Pav Dental, our experienced oral surgeons provide comfortable, effective
              extractions — from straightforward removals to impacted wisdom teeth — with
              same-day emergency slots in Bradford.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  Book appointment <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#pricing">View prices</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-black/60 sm:text-sm">
              <li>GDC registered</li>
              <li>Same-day appointments</li>
              <li>
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="underline underline-offset-4 hover:text-[#1B3745]"
                >
                  24/7 line: {PRACTICE_PHONE}
                </a>
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#F2EDE5] shadow-[0_10px_32px_rgba(0,0,0,0.06)]">
            <img
              src="/media/hims/suite-editorial.jpg"
              alt="Same day tooth extraction at Pav Dental"
              className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
            <div className="bg-[#1B3745] px-6 py-4 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Pav Dental Oral Surgery
              </p>
              <p className="mt-1 text-sm text-white/90">
                Assessed, planned, and treated in one calm appointment.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className={`${item.tone} rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="inline-block rounded-full bg-black/6 px-2.5 py-0.5 text-[11px] font-medium text-black/70">
                {item.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                {item.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-black/65">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
