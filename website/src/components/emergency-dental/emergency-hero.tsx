import { AlertCircle, Calendar, Clock, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="24/7 emergency dentist">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient relative overflow-hidden rounded-[1.5rem] text-white">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-medium text-[#ECD880]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ECD880] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#ECD880]" />
                </span>
                Open 24 hours, 7 days a week
              </div>

              <h1 className="mt-5 max-w-xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-white sm:text-5xl lg:text-[3.75rem]">
                Emergency dentist in{" "}
                <span className="text-[#ECD880]">Bradford, 24/7</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                Covering Bradford 24 hours, 7 days of the week including National and Bank
                Holidays. Same-day emergency triage for acute toothache, swelling, and dental
                trauma.
              </p>

              <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/14 bg-white/8 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#ECD880]">
                    <Clock className="size-4" />
                    Mon–Fri (9am – 5pm)
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-normal text-white">
                    £45 consultation
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">Includes exam, X-rays &amp; diagnosis</p>
                </div>

                <div className="rounded-[1.25rem] border border-white/14 bg-white/8 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#ECD880]">
                    <ShieldCheck className="size-4" />
                    Out-of-hours (5pm–8pm &amp; Weekends)
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-normal text-white">
                    £90* consultation
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">Enquire for appointments after 8pm</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5">
              <div className="rounded-[1.5rem] bg-[#FAF8F2] p-6 text-black shadow-[0_12px_36px_rgba(0,0,0,0.2)] sm:p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                  24/7 Emergency Hotline
                </p>
                <h2 className="mt-2 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  Call now or book online
                </h2>
                <p className="mt-1 text-sm text-black/65">
                  Anyone can book an appointment online 24 hours a day, 7 days a week.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href={PRACTICE_PHONE_HREF}
                    className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-black text-lg font-medium text-white transition-colors hover:bg-[#1B3745]"
                  >
                    <Phone className="size-4 text-[#ECD880]" />
                    0800 1938 786
                  </a>
                  <a
                    href="tel:07311871456"
                    className="flex h-11 w-full items-center justify-center rounded-full border border-black/12 bg-white text-sm font-medium text-black transition-colors hover:bg-[#F2EDE5]"
                  >
                    Direct / Out of hours: 07311 871456
                  </a>
                  <Button asChild variant="gold" size="lg" className="w-full">
                    <a href={BOOKING_URL}>
                      <Calendar className="size-4" />
                      Book Online
                    </a>
                  </Button>
                </div>

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#F2EDE5] p-3.5 text-xs leading-relaxed text-black/75">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#8A3A34]" />
                  <span>
                    <strong className="font-medium text-[#8A3A34]">
                      Facial swelling affecting breathing?
                    </strong>{" "}
                    Go straight to A&amp;E. For dental pain, call us immediately.
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
