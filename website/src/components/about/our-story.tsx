import { ArrowRight, CheckCircle2, Quote, Smartphone } from "lucide-react";
import { About3 } from "@/components/ui/about-3";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const ROADMAP_STEPS = [
  {
    step: "01",
    title: "Dream",
    text: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
  },
  {
    step: "02",
    title: "Creating a Partnership",
    text: "Building a foundation of shared passion and complementary expertise.",
  },
  {
    step: "03",
    title: "Reaching Shared Value between the Partnership",
    text: "Defining their commitment to patient well-being and professional excellence.",
  },
  {
    step: "04",
    title: "Creating a Very Detailed Roadmap",
    text: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
  },
] as const;

const APP_FEATURES = [
  "Schedule routine checkups and cleanings at your home or office.",
  "Book emergency appointments for swift relief.",
  "Consult virtually with our dentists for immediate advice.",
] as const;

export function OurStory() {
  return (
    <>
      <About3
        title="The Dream and The Team"
        description="Dr. Pav's dream was shared, nurtured, and diligently planned alongside his close friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan encompassing four crucial steps."
        mainImage={{
          src: "/media/hims/suite-editorial.jpg",
          alt: "Pav Dental Clinic Bradford",
        }}
        secondaryImage={{
          src: "/media/hims/card-whitening.jpg",
          alt: "Patient care at Pav Dental",
        }}
        breakout={{
          src: "/media/gdc.png",
          alt: "General Dental Council registered",
          title: "GDC Registered Bradford Practice",
          description:
            "786 Leeds Road, Bradford — same-day appointments, 24/7 emergency support, and transparent care.",
          buttonText: "Book Appointment",
          buttonUrl: BOOKING_URL,
        }}
      />

      {/* Roadmap 4-step grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col justify-between rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                <div>
                  <span className="inline-flex rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#1B3745]">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.025em] text-black">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-black/65">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Legacy Fulfilled */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
          <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto grid max-w-[87rem] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                  In Memory of Dr. Pavan Bhogal
                </p>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                  A Legacy <span className="text-[#754B3D]">Fulfilled</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-black/70">
                  Tragically, Dr. Pav passed away before witnessing the clinic&apos;s realization.
                  Their shared vision now rests with Dr. Hassan as a profound responsibility.
                  Fueled by a deep respect for their collaboration, Dr Hassan vowed to complete the
                  final step:
                </p>
                <div className="mt-6 rounded-[1.25rem] border border-black/6 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#754B3D]">
                    Executing
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-black/75 sm:text-base">
                    Bringing this dental clinic to life, serving our community with the same care
                    and innovation Dr. Pav championed.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <blockquote className="rounded-[1.5rem] border border-black/6 bg-white p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
                  <Quote className="size-7 text-[#754B3D]" aria-hidden="true" />
                  <p className="mt-4 font-display text-2xl font-normal leading-snug tracking-[-0.03em] text-black sm:text-3xl">
                    &ldquo;We can achieve all our dreams if we are brave enough to pursue
                    them.&rdquo;
                  </p>
                  <footer className="mt-4 text-xs font-medium uppercase tracking-wider text-black/50">
                    Inspiration and Growth — Dr. Pav &amp; Dr. Hassan
                  </footer>
                </blockquote>
                <p className="text-sm leading-relaxed text-black/65 sm:text-base">
                  While we must forgive past failings and present obstacles, the future of this
                  clinic demands unwavering standards. We will never compromise on the quality,
                  compassion, or dedication to access that Dr. Pav envisioned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Future of Dentistry */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[1.5rem] hims-navy-gradient px-7 py-12 text-white sm:px-12 sm:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-[#ECD880]">
                  <Smartphone className="size-3.5" aria-hidden="true" />
                  Pav Dental App · Hub &amp; Mobile Clinic
                </span>
                <h2 className="mt-4 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                  The Future of <span className="text-[#ECD880]">Dentistry</span>
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
                  We believe the Pav Dental App, alongside our Hub and Mobile clinic, represents the
                  future of dentistry — shaped by Dr. Pav&apos;s belief in accessibility and patient
                  empowerment.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-7 backdrop-blur-xs">
                <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                  With just a few taps, you can
                </p>
                <ul className="mt-4 space-y-3.5">
                  {APP_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/90">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-[#ECD880]"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild variant="gold" size="lg">
                    <a href={BOOKING_URL}>
                      Book Appointment
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
