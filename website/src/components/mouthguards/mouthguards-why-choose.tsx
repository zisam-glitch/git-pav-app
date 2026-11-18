import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const BENEFITS = [
  {
    title: "Strong protection for sports",
    desc: "Designed to withstand high-impact activities and protect your teeth during sports.",
  },
  {
    title: "Comfortable fit that stays secure",
    desc: "Custom-made to fit your teeth for lasting comfort and a secure hold.",
  },
  {
    title: "Digital or mould kit options",
    desc: "Choose between precise digital scans at our clinic or convenient home mould kits.",
  },
  {
    title: "NHS partners",
    desc: "Working with NHS partners to provide accessible dental care and protection.",
  },
  {
    title: "High quality materials",
    desc: "Durable materials selected for comfort, retention, and reliable protection.",
  },
  {
    title: "Fast turnaround",
    desc: "Prompt manufacturing and delivery straight to your door.",
  },
  {
    title: "Trusted Bradford based clinic",
    desc: "Local clinical expertise with full control over colour, style, and fit.",
  },
];

export function MouthguardsWhyChoose() {
  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Custom quality
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Why Choose{" "}
              <span className="text-[#754B3D]">Pav Dental Mouthguards?</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Every mouthguard is created using precise digital or physical impressions with full
              control over colour, style and custom features.
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href={BOOKING_URL}>
                Book mouthguard fitting <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <ul className="divide-y divide-black/10 border-t border-b border-black/10">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit.title}
                className="flex items-center justify-between gap-6 py-5"
              >
                <div>
                  <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-black/60">{benefit.desc}</p>
                </div>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-black text-white">
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
