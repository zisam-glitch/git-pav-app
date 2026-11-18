import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "./spotlight";
import { BOOKING_URL, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const SLIDES = [
  {
    id: "check",
    kicker: "Accessible smiles",
    title: "Complete dental check-up from £35",
    body: "Only £7.60 more than the NHS fee — with same-day access and premium care in Bradford.",
    image: "/media/hero.jpg",
    cta: "Book check-up",
    href: BOOKING_URL,
  },
  {
    id: "emergency",
    kicker: "Open every hour",
    title: "24/7 emergency dentistry",
    body: "Pain, trauma, or a lost restoration — our team is on call including bank holidays.",
    image: "/media/hero1.jpg",
    cta: "Call now",
    href: PRACTICE_PHONE_HREF,
  },
  {
    id: "smile",
    kicker: "Aesthetics",
    title: "Whitening, veneers, and calm cosmetic care",
    body: "Digital imaging and considered treatment plans — never rushed, never upsold.",
    image: "/media/hero2.jpg",
    cta: "View services",
    href: "/services",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[#faf6f0] border-b border-border-soft pt-16"
      aria-roledescription="carousel"
      aria-label="Clinic highlights"
    >
      <Spotlight />

      <div className="relative z-10 mx-auto grid min-h-[540px] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase text-primary">
            {slide.kicker}
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl font-display text-4xl font-bold text-fg sm:text-5xl lg:text-6xl"
            >
              {slide.title.replace("£35", "")}
              {slide.title.includes("£35") ? <span className="text-primary">£35</span> : null}
            </motion.h1>
          </AnimatePresence>
          <p className="mt-5 max-w-md text-base text-muted sm:text-lg">{slide.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={slide.href}>{slide.cta}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/services">Explore care</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-soft pt-5 text-sm font-medium text-muted">
            <li>GDC registered</li>
            <li>Same-day appointments</li>
            <li>
              <a href={PRACTICE_PHONE_HREF} className="text-primary hover:underline">
                24/7 Helpline: 0800 1938 786
              </a>
            </li>
          </ul>
        </div>

        <div className="relative hidden h-[420px] overflow-hidden rounded-xl border border-border bg-white shadow-soft lg:block">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 pb-6 flex justify-center">
        <div className="flex gap-2" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-[width,background-color] duration-250 ${
                i === index ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
