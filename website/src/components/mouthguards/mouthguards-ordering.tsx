import { ArrowRight, Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const CLINIC_STEPS = [
  {
    title: "Book an appointment at Pav Dental",
    desc: "Schedule your visit at our Bradford clinic.",
  },
  {
    title: "We take a precise digital scan of your teeth",
    desc: "Fast, mess-free 3D intraoral scanning.",
  },
  {
    title: "Your custom mouthguard is manufactured",
    desc: "Crafted in your chosen colour and personalisation.",
  },
  {
    title: "Delivered straight to your address",
    desc: "Ready for training, competition, or daily wear.",
  },
];

const HOME_STEPS = [
  {
    title: "We send you a mould kit",
    desc: "Delivered directly to your door with instructions.",
  },
  {
    title: "You take the impression at home",
    desc: "Simple, guided home impression process.",
  },
  {
    title: "Use the prepaid label to return it",
    desc: "Post your impression back to our laboratory.",
  },
  {
    title: "We create it and send it back to you",
    desc: "Custom-made and delivered straight to you.",
  },
];

export function MouthguardsOrdering() {
  return (
    <section id="ordering" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                  Two ways to order
                </p>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                  How to Order Your{" "}
                  <span className="text-[#754B3D]">Mouthguard</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-black/65">
                  Every mouthguard is custom-made just for you. Visit our clinic for a digital
                  scan or order a convenient mould kit from home.
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <a href={BOOKING_URL}>
                  Make an appointment <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="hims-tile-warm rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#1B3745] text-[#ECD880]">
                    <Building2 className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      Visit Our Clinic
                    </h3>
                    <p className="text-sm text-[#754B3D]">
                      Accurate digital scan with quick delivery
                    </p>
                  </div>
                </div>

                <ol className="mt-7 divide-y divide-black/8 border-t border-black/8">
                  {CLINIC_STEPS.map((step, index) => (
                    <li key={step.title} className="flex items-start gap-4 py-4">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-black text-xs font-medium text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-black">{step.title}</p>
                        <p className="mt-0.5 text-sm text-black/60">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className="mt-5 rounded-xl bg-white/80 px-4 py-3 text-xs font-medium text-[#1B3745]">
                  Digital scans give the highest accuracy and a perfect fit.
                </p>
              </div>

              <div className="hims-tile-sage rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-black text-white">
                    <Home className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                      Order From Home
                    </h3>
                    <p className="text-sm text-[#1B3745]">
                      Easy mould kit sent to your door
                    </p>
                  </div>
                </div>

                <ol className="mt-7 divide-y divide-black/8 border-t border-black/8">
                  {HOME_STEPS.map((step, index) => (
                    <li key={step.title} className="flex items-start gap-4 py-4">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#1B3745] text-xs font-medium text-[#ECD880]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-black">{step.title}</p>
                        <p className="mt-0.5 text-sm text-black/60">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className="mt-5 rounded-xl bg-white/80 px-4 py-3 text-xs font-medium text-[#1B3745]">
                  This option is ideal if you live far away or need a convenient home solution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
