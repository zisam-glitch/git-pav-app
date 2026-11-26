import { CalendarCheck, PhoneCall, Stethoscope } from "lucide-react";
import { BookButton, CallButton } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const STEPS = [
  { text: "Call us or book online, at any hour", icon: PhoneCall },
  { text: "A member of our dental team calls you back within the hour", icon: CalendarCheck },
  { text: "See a qualified dentist and dental nurse, usually the same day", icon: Stethoscope },
] as const;

/**
 * The white sheet that rides up over the hero photo (Hims "Feeling better is possible" /
 * "How it works" row): the two consultation prices on the left, three steps on the right.
 */
export function EmergencyIntro() {
  return (
    <section
      aria-label="Consultation prices and how it works"
      className="relative z-10 -mt-14 rounded-t-[32px] bg-white py-16 md:-mt-16 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-[1392px] gap-14 px-4 lg:grid-cols-2 lg:gap-24">
        <div id="pricing">
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            <span className="text-[#8a4242]">How much</span> does it cost?
          </h2>
          <ul className="mt-8 grid max-w-xl list-none gap-3 sm:grid-cols-2">
            <li className="flex flex-col justify-between gap-4 rounded-[20px] bg-[#f6efe4] p-6">
              <p className="text-h4 text-fg tabular-nums">£45 consultation</p>
              <p className="text-small text-muted">Monday to Friday between 9am – 5pm</p>
            </li>
            <li className="flex flex-col justify-between gap-4 rounded-[20px] bg-[#f6f6f4] p-6">
              <p className="text-h4 text-fg tabular-nums">£90* out-of-hours consultation</p>
              <p className="text-small text-muted">Weekends 9am – 8pm and Weekdays 5pm – 8pm</p>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            How does it work?
          </h2>
          <ol className="mt-8 list-none space-y-6">
            {STEPS.map(({ text, icon: Icon }) => (
              <li key={text} className="flex items-center gap-5 text-[18px] text-[#2a2a2c]">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#f3e9a8]">
                  <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap gap-3">
            <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
            <BookButton variant="outline">Book Online</BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}
