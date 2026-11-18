import { Phone } from "lucide-react";
import { Reveal } from "./reveal";

const POINTS = [
  "Oral hygiene advisory & assessment",
  "Dental public health insurance",
  "Free online appointment booking",
  "Various cosmetic dentistry services",
  "Special care dentistry services",
  "Oral surgery",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Overview() {
  return (
    <section id="overview" className="py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl">
            Comprehensive Dental Services: Book Online, Specialized Care, and{" "}
            <span className="text-primary">Insurance Support</span>
          </h2>
          <p className="mt-5 max-w-xl text-muted">
            Providing expert oral surgery, comprehensive dental hygiene assessments, cosmetic
            dentistry, special care services, and public health insurance assistance, our clinic
            ensures top-notch care for all your dental needs. Enjoy the convenience of free online
            appointment booking to easily schedule your visits.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 max-w-xl">
            <ul className="space-y-2.5 text-sm">
              {POINTS.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-primary">+</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div>
              <img src="/media/gdc.png" alt="General Dental Council registered" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="rounded-xl border border-border-soft bg-white p-6 shadow-soft sm:p-8">
            <h3 className="font-display text-2xl text-primary">Working Hours</h3>
            <ul className="mt-5 divide-y divide-border text-sm">
              {DAYS.map((d) => (
                <li key={d} className="flex items-center justify-between py-3">
                  <span className="text-muted">{d}</span>
                  <span className="tabular-nums">00:00 – 24:00</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-primary" aria-hidden />
              <div>
                <p className="text-sm text-muted">For private appointments.</p>
                <a href="tel:08001938786" className="font-medium text-primary">
                  0800 1938 786
                </a>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
