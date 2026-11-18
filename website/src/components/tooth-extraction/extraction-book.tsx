import { ArrowRight, Check, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const REASONS = [
  "Experienced and compassionate surgical team",
  "State-of-the-art clinical facilities",
  "Patient-centric approach before and after care",
  "Affordable and transparent pricing",
];

export function ExtractionBook() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Why choose Pav Dental?
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Book Your{" "}
                <span className="text-[#754B3D]">Appointment Today</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-black/65">
                Don&apos;t let tooth pain hold you back. Contact Pav Dental now for a
                consultation and experience swift, professional care that puts your needs first.
              </p>

              <ul className="mt-7 space-y-3">
                {REASONS.map((r) => (
                  <li key={r} className="flex items-center gap-3 text-sm text-black/85">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-white">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={BOOKING_URL}>
                    Book appointment <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={PRACTICE_PHONE_HREF}>Call {PRACTICE_PHONE}</a>
                </Button>
              </div>
            </div>

            <div className="hims-tile-warm rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
              <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-[#1B3745]">
                Clinic Details
              </h3>
              <ul className="mt-6 divide-y divide-black/6 text-sm">
                <li className="flex items-start gap-3.5 py-4">
                  <Phone className="mt-0.5 size-5 shrink-0 text-[#1B3745]" />
                  <div>
                    <p className="text-xs text-black/55">Freephone</p>
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="mt-0.5 block font-medium text-black hover:text-[#1B3745]"
                    >
                      {PRACTICE_PHONE}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3.5 py-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#1B3745]" />
                  <div>
                    <p className="text-xs text-black/55">Practice address</p>
                    <p className="mt-0.5 font-medium text-black">
                      786 Leeds Road, Bradford, BD3 9TY
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5 py-4">
                  <Clock className="mt-0.5 size-5 shrink-0 text-[#1B3745]" />
                  <div>
                    <p className="text-xs text-black/55">Hours</p>
                    <p className="mt-0.5 font-medium text-black">{PRACTICE_HOURS}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
