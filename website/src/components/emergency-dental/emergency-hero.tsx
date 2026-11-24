import { BookButton, CallButton } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

/**
 * Hims full-photo hero (hims.com/psychiatry): the photo fills the first screen, the headline,
 * one line of text and the buttons sit over it, and the next section slides up over its bottom
 * edge with rounded top corners. A dark gradient on the left keeps the text readable.
 */
export function EmergencyHero() {
  return (
    <section
      id="top"
      aria-label="Emergency Dentist"
      className="relative isolate flex min-h-[calc(100svh-72px)] items-center overflow-hidden bg-[#0e1a2b] pb-24 text-white md:min-h-[640px]"
    >
      <img
        src="/images/generated/emergency-dental-hero.jpg"
        alt="Pav Dental emergency dental clinic in Bradford ready for 24-hour urgent dental care"
        fetchPriority="high"
        className="absolute top-0 right-0 -z-20 h-full w-[130%] max-w-none object-cover object-[50%_68%] md:w-[120%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,14,26,0.92)_0%,rgba(8,14,26,0.78)_38%,rgba(8,14,26,0.15)_75%),linear-gradient(0deg,rgba(8,14,26,0.55)_0%,transparent_35%)]"
      />
      <div className="mx-auto w-full max-w-[1392px] px-4 pt-16 md:pt-20">
        <div className="max-w-[640px]">
          <h1 className="text-hero">Emergency Dentist</h1>
          <p className="mt-5 max-w-lg text-lead text-white/90">
            Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="light">Call us Now · {PRACTICE_PHONE}</CallButton>
            <BookButton variant="glass">Book Online</BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}
