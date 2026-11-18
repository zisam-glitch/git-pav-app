import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "How do whitening strips differ from trays (kits)?",
    a: "As well as being more cost-effective than trays, WhiteWash Professional Whitening Strips are more comfortable, less bulky, and allow you to whiten on the go. What's more, each strip already contains the optimum amount of whitening gel so it's less hassle for you and helps to ensure you achieve an even white smile.",
  },
  {
    q: "Will I get even results?",
    a: "Each strip contains the exact amount of whitening gel to effectively whiten your teeth. Each strip should be positioned across the teeth and gently pressed into place, aiming to get maximum contact with all of your visible teeth. This will ensure even spread of the whitening gel.",
  },
  {
    q: "If white spots appear will they go or are they permanent?",
    a: "No. These white spots are temporary; they are not harmful and will disappear within 24 hours.",
  },
  {
    q: "What if I experience tooth sensitivity or gum irritation?",
    a: "It is not uncommon to experience tooth sensitivity and/or gum irritation whilst whitening your teeth. This is temporary and NOT harmful. To alleviate symptoms it may be sensible to whiten your teeth on alternate days, until you have used all of the strips. If the problem persists, discontinue use and consult your dentist.",
  },
  {
    q: "Can I swallow saliva when using the whitening strips?",
    a: "Yes, you can. It is perfectly safe to swallow saliva when using the whitening strips. You may also notice a foaming reaction as the hydrogen peroxide gets to work, this is normal.",
  },
  {
    q: "Are whitening strips suitable for everyone?",
    a: "Though the whitening strips are non-harmful to the human body, it is advised that children under the age of 16 (18 in the European Union due to this being a legal requirement), pregnant women, and those sensitive to hydrogen peroxide should not use them. Patients with teeth sensitive to cold, heat or acid, or those who suffer from oral ulceration should discuss this with their prescribing dentist before undergoing a course of whitening treatment.",
  },
  {
    q: "Can the whitening strips be in contact with my gums?",
    a: "Yes, but such contact should be minimised to avoid gum irritation.",
  },
  {
    q: "Can I use a whitening toothpaste everyday?",
    a: "Yes, you can use WhiteWash Whitening toothpastes like you would use your normal toothpaste. However this is not always the case with all whitening toothpastes as some can be extremely abrasive, so it is best to check with the specific toothpaste manufacturer.",
  },
];

export function WhiteningFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.3fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Whitening questions,{" "}
              <span className="text-[#754B3D]">answered</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Guidance on dissolving strips, sensitivity management, suitability, and informed
              consent for tooth whitening.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href={BOOKING_URL}>
                  Book Appointment
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/contact-us">Contact us</a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="divide-y divide-black/10 border-t border-b border-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
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

        <Reveal delay={0.1}>
          <div className="hims-navy-gradient mt-16 flex flex-col items-start justify-between gap-6 rounded-[1.5rem] p-8 text-white sm:flex-row sm:items-center sm:p-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Informed Consent for Tooth Whitening
              </p>
              <h3 className="mt-2 font-display text-2xl font-normal tracking-[-0.03em] text-white sm:text-3xl">
                Ready for a brighter smile in Bradford?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-white/75">
                Book an assessment with our GDC-registered clinicians to choose between dissolving
                strips, home kits, or BEAM in-office whitening.
              </p>
            </div>
            <Button asChild variant="gold" size="lg" className="shrink-0">
              <a href={BOOKING_URL}>
                Book Appointment
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
