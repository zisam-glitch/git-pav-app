import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FEE_TILES = [
  {
    eyebrow: "Video consultation",
    title: "£35 Consultation Fee",
    subtitle: "Connect directly with a GDC-registered dentist from home",
    tone: "hims-tile-warm",
  },
  {
    eyebrow: "E-prescription",
    title: "£25 Prescription Cost",
    subtitle: "Sent straight to your preferred pharmacy if clinically needed",
    tone: "hims-tile-sage",
  },
] as const;

export function VirtualDentistryHero() {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-10 sm:pt-28 sm:pb-14"
      aria-label="Virtual dentistry services"
    >
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#F2EDE5] px-3.5 py-1 text-xs font-medium text-black/75">
              Virtual consultations &amp; online prescriptions
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
              Affordable{" "}
              <span className="text-[#754B3D]">Healthcare Services</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
              £35 Consultation Fee and £25 Prescription Cost. Quality medical advice and
              prescriptions at budget-friendly prices to ensure your health needs are met without
              breaking the bank.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  Book appointment <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-black/60 sm:text-sm">
              <li>Virtual consultations</li>
              <li>Online prescriptions</li>
              <li>24/7 availability</li>
              <li>Pharmacy collection or delivery</li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#F2EDE5] shadow-[0_10px_32px_rgba(0,0,0,0.06)]">
            <img
              src="/media/hims/virtual-care-editorial.jpg"
              alt="Virtual dental video consultation"
              className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
            <div className="bg-[#1B3745] px-6 py-4 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Pav Dental Virtual Dentist
              </p>
              <p className="mt-1 text-sm text-white/90">
                Video consultation from your smartphone, tablet, or computer.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {FEE_TILES.map((tile) => (
            <div
              key={tile.title}
              className={`${tile.tone} flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <div>
                <span className="inline-block rounded-full bg-black/6 px-2.5 py-0.5 text-[11px] font-medium text-black/70">
                  {tile.eyebrow}
                </span>
                <h2 className="mt-2 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  {tile.title}
                </h2>
                <p className="mt-1 text-sm text-black/65">{tile.subtitle}</p>
              </div>
              <a
                href={BOOKING_URL}
                aria-label={`Book ${tile.title}`}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-white transition-colors hover:bg-[#1B3745]"
              >
                <ArrowRight className="size-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
