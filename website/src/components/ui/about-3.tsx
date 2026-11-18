import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

interface About3Props {
  title?: string;
  description?: string;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    alt: string;
  };
  breakout?: {
    src?: string;
    alt?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export const About3 = ({
  title = "The Dream and The Team",
  description = "Dr. Pav's dream was shared, nurtured, and diligently planned alongside his close friend and colleague, Dr. Hassan.",
  mainImage = {
    src: "/media/hims/suite-editorial.jpg",
    alt: "Pav Dental clinic interior",
  },
  secondaryImage = {
    src: "/media/hims/card-whitening.jpg",
    alt: "Patient care at Pav Dental",
  },
  breakout = {
    src: "/media/gdc.png",
    alt: "General Dental Council registered",
    title: "Your Trusted Dental Partner",
    description:
      "Providing comprehensive dental care with same-day appointments, mobile services, and 24/7 emergency support when you need it most.",
    buttonText: "Book Appointment",
    buttonUrl: BOOKING_URL,
  },
}: About3Props = {}) => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid items-end gap-6 border-t border-black/10 pt-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">Our Story</p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              {title}
            </h2>
          </div>
          <p className="text-base leading-relaxed text-black/65">{description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] lg:col-span-2">
            <img
              src={mainImage.src}
              alt={mainImage.alt}
              className="size-full max-h-[560px] object-cover"
            />
          </div>
          <div className="flex flex-col gap-6 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-7 md:w-1/2 lg:w-auto">
              {breakout.src ? (
                <img
                  src={breakout.src}
                  alt={breakout.alt || "General Dental Council"}
                  className="mr-auto h-12 w-auto"
                />
              ) : (
                <div className="grid size-12 place-items-center rounded-xl bg-[#1B3745] text-white">
                  <span className="text-xl font-medium">P</span>
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                  {breakout.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{breakout.description}</p>
              </div>
              <Button className="mr-auto" asChild>
                <a href={breakout.buttonUrl || BOOKING_URL}>
                  {breakout.buttonText || "Book Appointment"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
            <div className="grow basis-0 overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] md:w-1/2 lg:min-h-0 lg:w-auto">
              <img
                src={secondaryImage.src}
                alt={secondaryImage.alt}
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
