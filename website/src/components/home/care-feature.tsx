import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BookButton, ButtonLink } from "@/components/hims";
import {
  HOME_TESTIMONIALS,
  TESTIMONIALS_HEADING,
  TESTIMONIALS_INTRO,
} from "@/content/testimonials";
import { cn } from "@/lib/utils";

const TREATMENTS = [
  { label: "Emergency Dental", to: "/services/emergency-dental" },
  { label: "Mobile Dentistry", to: "/services/mobile-dentistry" },
  { label: "Aesthetics", to: "/services/aesthetics" },
  { label: "General Dentistry", to: "/services/general-dentistry" },
  { label: "Tooth Extraction", to: "/services/tooth-extraction" },
  { label: "Whitening", to: "/services/whitening" },
] as const;

const CARD = "rounded-[28px] bg-[#2e4d66]/30";

/** The Hims blue feature: an urgent-care card, a photo card with stacked pills, and the patient comments carousel. */
export function CareFeature() {
  const [index, setIndex] = useState(0);
  const count = HOME_TESTIMONIALS.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section id="care" className="mt-2.5 rounded-[32px] bg-[#5a87ab] py-10 text-white md:py-14">
      <div className="wrap-bento grid max-w-[1396px] gap-2.5 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <article className={cn(CARD, "relative flex min-h-[420px] overflow-hidden p-6 md:p-10")}>
            <h2 className="relative z-10 max-w-full text-h3-md text-white sm:max-w-[60%]">
              Require emergency dental care and want same day treatment?
            </h2>
            <img
              src="/images/home/phone-hand.jpg"
              alt="Hand holding a white smartphone showing an appointment calendar against a warm amber backdrop"
              loading="lazy"
              width={1024}
              height={1536}
              className="absolute right-6 bottom-0 h-[48%] w-auto rounded-t-[24px] sm:h-[78%] object-cover"
            />
            <ButtonLink
              to="/services/emergency-dental"
              variant="glass"
              className="absolute bottom-6 left-6 bg-white/20 md:bottom-10 md:left-10"
            >
              VISIT
            </ButtonLink>
          </article>

          <article className="relative min-h-[460px] overflow-hidden rounded-[28px] md:min-h-[508px]">
            <img
              src="/images/home/smile-sunny.jpg"
              alt="Smiling older man with a daisy behind his ear, laughing under a bright blue sky"
              loading="lazy"
              width={1024}
              height={1280}
              className="absolute inset-0 size-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#2e4d66]/70 via-transparent to-transparent" />
            <h3 className="relative z-10 max-w-[55%] p-6 text-h3-md text-white md:p-10">
              Explore our treatments
            </h3>
            <ul className="absolute right-6 bottom-6 flex flex-col items-end gap-2.5 md:right-10 md:bottom-10">
              {TREATMENTS.slice(0, 4).map((item, i) => (
                <li key={item.to} style={{ marginRight: `${(3 - i) * 12}px` }}>
                  <Link
                    to={item.to}
                    className="inline-flex h-[60px] items-center rounded-pill bg-white/20 px-8 text-label text-white backdrop-blur-md t-colors hover:bg-white/35"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className={cn(CARD, "relative flex min-h-[560px] flex-col p-6 md:p-10")}>
          <img
            src="/images/home/teeth-stack.jpg"
            alt="Three smooth lavender, cream and sage porcelain tooth models stacked in mid-air"
            loading="lazy"
            width={1024}
            height={1024}
            className="size-24 rounded-[20px] object-cover md:size-32"
          />
          <h2 className="mt-5 text-h4 text-white">{TESTIMONIALS_HEADING}</h2>
          <p className="mt-1 max-w-md text-small text-white/70">{TESTIMONIALS_INTRO}</p>

          <div
            className="mt-8 grid flex-1 px-0 md:px-14"
            role="region"
            aria-roledescription="carousel"
            aria-label={TESTIMONIALS_HEADING}
          >
            {HOME_TESTIMONIALS.map((item, i) => (
              <figure
                key={item.title}
                aria-hidden={i !== index}
                className={cn(
                  "col-start-1 row-start-1 flex flex-col justify-center transition-opacity duration-300",
                  i === index ? "opacity-100" : "invisible opacity-0",
                )}
              >
                <blockquote className="text-h4 font-normal text-white">{item.text}</blockquote>
                <figcaption className="mt-5 text-small font-medium text-white/70">
                  {item.title}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Previous comment"
                onClick={() => go(index - 1)}
                className="grid size-10 place-items-center rounded-full border border-white/40 t-colors hover:bg-white/15"
              >
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Comments">
                {HOME_TESTIMONIALS.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Comment ${i + 1} of ${count}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "size-2 rounded-full t-colors",
                      i === index ? "bg-white" : "bg-white/35",
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next comment"
                onClick={() => go(index + 1)}
                className="grid size-10 place-items-center rounded-full border border-white/40 t-colors hover:bg-white/15"
              >
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>
            <BookButton variant="light">Book Now</BookButton>
          </div>
        </article>
      </div>
      <p className="mx-auto mt-8 max-w-[760px] px-4 text-center text-caption text-white/70">
        Comments are from patients and published on the Pav Dental website.
      </p>
    </section>
  );
}
