import { AlertTriangle, BedDouble, Droplets, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const INSTRUCTIONS = [
  {
    icon: Droplets,
    title: "Bleeding & Clot Care",
    tone: "hims-tile-warm",
    steps: [
      "Bite on a gauze pad firmly for 30–60 minutes after extraction",
      "If bleeding continues, replace the gauze and bite for another 30 minutes",
      "Avoid spitting or rinsing forcefully; chew on the opposite side",
      "Avoid smoking for as long as possible, ideally at least 48 hours",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Eating and Drinking",
    tone: "bg-white",
    steps: [
      "Start with soft foods and liquids",
      "Avoid using a straw for the first few days to protect the blood clot",
      "Avoid hot liquids and alcoholic beverages in the first 24 hours",
    ],
  },
  {
    icon: BedDouble,
    title: "Swelling, Rest & Pain",
    tone: "hims-tile-sage",
    steps: [
      "Apply an ice pack to the cheek for 10 minutes on, 10 minutes off during the first 24 hours",
      "Relax for at least 24 hours and avoid strenuous activities for 2–3 days",
      "Use over-the-counter pain relievers like ibuprofen or paracetamol as directed",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Oral Hygiene & Follow-Up",
    tone: "bg-[#F2EDE5]",
    steps: [
      "Do not rinse your mouth for the first 24 hours",
      "After 24 hours, gently rinse with warm salt water (1/2 tsp salt in a cup of water) after meals and before bed",
      "Take any prescribed antibiotics as directed and keep follow-up appointments",
    ],
  },
];

const RED_FLAGS = [
  "Heavy bleeding not controlled by biting on gauze",
  "Fever or swelling that worsens after a few days",
  "Severe pain or signs of dry socket where the blood clot is dislodged",
  "Persistent numbness or any complication you are concerned about",
];

export function ExtractionPostOp() {
  return (
    <section className="bg-[#FBF8F5] py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Recovery guidance
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Post Operative{" "}
            <span className="text-[#754B3D]">Instructions</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Remember, these are general guidelines. Always adhere to the specific instructions
            given by your healthcare provider based on your individual case and health history.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {INSTRUCTIONS.map((section) => (
            <div
              key={section.title}
              className={`${section.tone} flex flex-col gap-5 rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                <section.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                  {section.title}
                </h3>
                <ol className="mt-4 space-y-2.5">
                  {section.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-black/75">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#1B3745] text-[10px] font-medium text-[#ECD880]">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] hims-navy-gradient p-7 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#8A3A34] px-3 py-1 text-xs font-medium text-white">
                <AlertTriangle className="size-3.5 text-[#ECD880]" />
                Watch for complications
              </div>
              <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.03em] text-white sm:text-3xl">
                When to contact our clinical team urgently
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {RED_FLAGS.map((flag) => (
                  <li key={flag} className="flex items-start gap-2.5 text-sm text-white/85">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#ECD880]" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 rounded-[1.25rem] bg-white/10 p-6 backdrop-blur-sm lg:min-w-[260px]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                24/7 clinical helpline
              </p>
              <a
                href={PRACTICE_PHONE_HREF}
                className="mt-2 block font-display text-2xl font-normal tracking-[-0.02em] text-white hover:text-[#ECD880]"
              >
                {PRACTICE_PHONE}
              </a>
              <Button asChild variant="gold" className="mt-5 w-full">
                <a href="/contact-us">Contact the clinic</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
