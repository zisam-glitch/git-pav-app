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
  title = "About Us",
  description = "Providing exceptional dental care with comprehensive services and patient-centered treatment plans.",
  mainImage = {
    src: "/media/hero-clinic.jpg",
    alt: "Clinic",
  },
  secondaryImage = {
    src: "/media/hero-smile.jpg",
    alt: "Smile",
  },
  breakout = {
    src: "/media/gdc.bde60269dddf420e3b5a.png",
    alt: "Logo",
    title: "Your Trusted Dental Partner",
    description: "Providing comprehensive dental care with same-day appointments, mobile services, and 24/7 emergency support when you need it most.",
    buttonText: "Book Appointment",
    buttonUrl: BOOKING_URL,
  },
}: About3Props = {}) => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium">{title}</h1>
          <p className="text-muted">{description}</p>
        </div>
        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
          />
          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-xl glass p-7 md:w-1/2 lg:w-auto">
              {breakout.src ? (
                <img
                  src={breakout.src}
                  alt={breakout.alt || "Logo"}
                  className="mr-auto h-12"
                />
              ) : (
                <div className="grid size-12 place-items-center rounded-lg accent-gradient text-primary-fg">
                  <span className="text-xl font-bold">P</span>
                </div>
              )}
              <div>
                <p className="mb-2 text-lg font-semibold text-fg">{breakout.title}</p>
                <p className="text-muted">{breakout.description}</p>
              </div>
              <Button variant="outline" className="mr-auto" asChild>
                <a href={breakout.buttonUrl}>{breakout.buttonText}</a>
              </Button>
            </div>
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
