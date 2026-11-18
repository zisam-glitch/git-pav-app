import { CalendarCheck, ClipboardCheck, HeartHandshake, MessageSquareHeart, ShieldCheck, Stethoscope } from "lucide-react";
import { BOOKING_URL } from "@/lib/enquiry";

const PILLARS = [
  {
    lead: "24/7 support",
    rest: "from GDC-registered clinicians",
    icon: ShieldCheck,
  },
  {
    lead: "Same-day access",
    rest: "including bank holidays",
    icon: CalendarCheck,
  },
  {
    lead: "Calm, unhurried",
    rest: "dental & aesthetic suites",
    icon: HeartHandshake,
  },
  {
    lead: "Personalized",
    rest: "treatment plans & aftercare",
    icon: ClipboardCheck,
  },
] as const;

const STEPS = [
  {
    title: "Choose your visit",
    body: "Select a £35 complete dental check-up, emergency slot, or cosmetic consultation online.",
    icon: CalendarCheck,
  },
  {
    title: "Clinician assessment",
    body: "Meet our GDC-registered dentists in Bradford, via video, or in our mobile dental van.",
    icon: Stethoscope,
  },
  {
    title: "Clear treatment plan",
    body: "Every option and fee is explained upfront before any work begins.",
    icon: ClipboardCheck,
  },
  {
    title: "Ongoing support",
    body: "Reach our 24/7 helpline anytime for aftercare advice or urgent follow-ups.",
    icon: MessageSquareHeart,
  },
] as const;

export function TotalCare() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        {/* Total care, totally different */}
        <h2 className="font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
          Total care, <span className="text-black/40">totally different</span>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((item) => (
            <div
              key={item.lead}
              className="flex min-h-[160px] flex-col justify-between rounded-[1.25rem] border border-black/6 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
            >
              <p className="font-display text-lg font-normal leading-snug tracking-[-0.02em] text-black">
                {item.lead} <span className="text-black/50">{item.rest}</span>
              </p>
              <item.icon className="mt-6 size-8 stroke-[1.5] text-[#1B3745]" aria-hidden="true" />
            </div>
          ))}
        </div>

        {/* How it works — Mobbin Hims 4-step strip */}
        <div className="mt-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              How it works
            </h2>
            <a
              href={BOOKING_URL}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-[#1B3745]"
            >
              Get started today
            </a>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.title}>
                <div className="inline-flex size-10 items-center justify-center rounded-xl bg-[#F2EDE5] text-[#AD6E4B]">
                  <step.icon className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium tracking-[-0.02em] text-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
