import { useState } from "react";
import { Minus, PhoneCall, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const FAQS = [
  {
    q: "Who are 24hr Emergency Dentist?",
    a: "We are a professional and experienced dental team providing an Emergency Dental Service covering the Bradford area 24 hours a day, 7 days a week.",
  },
  {
    q: "What can you expect?",
    a: "Patients will be seen on the same day and as soon as possible by a qualified dentist and dental nurse. An initial diagnosis will be carried out to determine your dental emergency and provide clear treatment options.",
  },
  {
    q: "Where is the clinic located?",
    a: "The practice is at 786 Leeds Road, Bradford, West Yorkshire, around 10 minutes from central Bradford with straightforward access routes from Leeds and surrounding cities.",
  },
  {
    q: "How does it work?",
    a: "Once you have called us or booked via our online booking system, a member of our dental team will call you back to arrange an emergency dental appointment with one of our dentists.",
  },
  {
    q: "What will happen during the emergency dental appointment?",
    a: "During your appointment, the dentist will do their best to treat the dental issue in one visit. If follow-up care is required, we will advise you on how to keep comfortable until your next stage of treatment.",
  },
  {
    q: "What home methods can help until I see a dentist?",
    a: "If it is safe for you to take them, over-the-counter painkillers such as paracetamol or ibuprofen can temporarily reduce pain. Warm salt water mouthwashes can also help soothe swollen gums as a short-term measure until you are seen.",
  },
  {
    q: "Why is toothache worse at night time?",
    a: "When you lie down, blood flow to the head increases, raising pressure inside an inflamed tooth or swelling. Dental X-rays at your appointment help locate the exact tooth causing the pain.",
  },
  {
    q: "If I go to A&E with toothache will they treat me?",
    a: "A&E departments generally cannot treat routine toothache. However, if you have facial swelling that affects your ability to breathe or swallow, you should go directly to A&E.",
  },
  {
    q: "I am not registered — does that matter?",
    a: "No, you do not have to be registered with us or any practice to be seen for an emergency dental appointment.",
  },
  {
    q: "I am really nervous — what can you do?",
    a: "We regularly care for anxious patients. Our team explains every step before starting and works calmly at your pace so you feel reassured and comfortable.",
  },
];

export function EmergencyFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Emergency guidance,{" "}
              <span className="text-[#754B3D]">day or night</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Essential answers on triage, same-day appointments, fees, and what to do in an urgent
              dental situation.
            </p>
            <Button asChild className="mt-7">
              <a href={PRACTICE_PHONE_HREF}>
                <PhoneCall className="size-4" />
                Call 0800 1938 786
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="divide-y divide-black/10 border-t border-b border-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:text-[#1B3745]"
                    >
                      <span className="font-display text-lg font-normal tracking-[-0.02em] text-black sm:text-xl">
                        {faq.q}
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-black">
                        {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pb-6 pr-12">
                        <p className="text-sm leading-relaxed text-black/65 sm:text-base">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
