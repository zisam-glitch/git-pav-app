import { Link } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

const EXPLORE = "inline-flex h-[34px] items-center rounded-pill bg-white px-5 text-small font-medium text-black t-colors hover:bg-white/85";

const TOPICS = [
  { title: "Emergency Dental", sub: "24/7 care", to: "/services/emergency-dental", tone: "from-[#d1673f] to-[#8a3a34]" },
  { title: "Mobile Dentistry", sub: "At-home care", to: "/services/mobile-dentistry", tone: "from-[#a15a6b] to-[#6d47b0]" },
  { title: "Aesthetics", sub: "Facial aesthetics", to: "/services/aesthetics", tone: "from-[#d1673f] to-[#8a3a34]" },
  { title: "General Dentistry", sub: "Preventive care", to: "/services/general-dentistry", tone: "from-[#a15a6b] to-[#6d47b0]" },
  { title: "Tooth Extraction", sub: "Same-day relief", to: "/services/tooth-extraction", tone: "from-[#d1673f] to-[#8a3a34]" },
  { title: "Whitening", sub: "Teeth whitening", to: "/services/whitening", tone: "from-[#a15a6b] to-[#6d47b0]" },
] as const;

const FACTS = [
  { text: "786 Leeds Road, Bradford, BD3 9TY" },
  { text: PRACTICE_HOURS },
  { text: PRACTICE_PHONE, href: PRACTICE_PHONE_HREF },
  { text: PRACTICE_EMAIL, href: `mailto:${PRACTICE_EMAIL}` },
  { text: "Free online appointment booking" },
] as const;

const BIG_CARD = "relative aspect-[4/5] w-[86vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-[#c9b8a0] sm:aspect-[16/10] sm:w-[68vw] md:w-[72vw] lg:aspect-[1380/736] lg:w-[min(72vw,1380px)]";

/** The Hims "here's what you need to know" band: big photo cards, a row of gradient topic cards, a facts strip and a progress bar. */
export function KnowMore() {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  return (
    <section id="know" className="overflow-hidden bg-white py-14 md:py-20">
      <h2 className="px-4 text-center text-h2-md text-fg">
        Here&apos;s what you <span className="block text-clay">need to know</span>
      </h2>

      <ul
        ref={track}
        aria-label="Patient guides"
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-2.5 md:mt-16"
      >
        <li className={BIG_CARD}>
          {playing ? (
            <>
              <iframe
                src="https://www.youtube.com/embed/zHXljj727OE?si=Uz7mq8eE5tSAvpgy&autoplay=1&controls=0&loop=1&playlist=zHXljj727OE&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3"
                title="What causes cavities? — Pav Dental"
                className="absolute inset-0 size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => setPlaying(false)}
                aria-label="Close video"
                className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white text-black"
              >
                <X aria-hidden className="size-4" />
              </button>
            </>
          ) : (
            <>
              <img
                src="/images/home/care-brush.jpg"
                alt="Woman laughing with a bright smile, holding a toothbrush beside her cheek"
                loading="lazy"
                width={1536}
                height={1024}
                className="absolute inset-0 size-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
              <h3 className="relative z-10 max-w-[60%] p-6 text-h3-md text-white md:p-10">
                What causes cavities?
              </h3>
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Play What causes cavities? video"
                className={cn(EXPLORE, "absolute bottom-6 left-1/2 -translate-x-1/2 gap-2 md:bottom-10 h-[64px] px-8 text-label")}
              >
                <Play aria-hidden className="size-4 fill-current" />
                Watch
              </button>
            </>
          )}
        </li>
        <li className={BIG_CARD}>
          <img
            src="/images/home/care-visit.jpg"
            alt="Dentist with a leather dental bag warmly greeted at a front door by a smiling elderly man"
            loading="lazy"
            width={1536}
            height={1024}
            className="absolute inset-0 size-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
          <h3 className="relative z-10 max-w-[60%] p-6 text-h3-md text-white md:p-10">
            Mobile Dentistry at Your Doorstep
          </h3>
          <Link
            to="/services/mobile-dentistry"
            className={cn(EXPLORE, "absolute bottom-6 left-1/2 h-[64px] -translate-x-1/2 px-8 text-label md:bottom-10")}
          >
            Explore
          </Link>
        </li>
        <li className={BIG_CARD}>
          <img
            src="/images/home/care-nurse.jpg"
            alt="Dental nurse answering a late-night call at a reception desk lit by a warm lamp"
            loading="lazy"
            width={1536}
            height={1024}
            className="absolute inset-0 size-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
          <h3 className="relative z-10 max-w-[60%] p-6 text-h3-md text-white md:p-10">
            24/7 Emergency Dental Services in Bradford
          </h3>
          <Link
            to="/services/emergency-dental"
            className={cn(EXPLORE, "absolute bottom-6 left-1/2 h-[64px] -translate-x-1/2 px-8 text-label md:bottom-10")}
          >
            Explore
          </Link>
        </li>
      </ul>

      <ul className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto px-2.5">
        {TOPICS.map((topic) => (
          <li key={topic.to} className="w-[72vw] shrink-0 sm:w-[44vw] lg:w-[28vw]">
            <Link
              to={topic.to}
              className={cn(
                "flex aspect-[540/305] flex-col justify-end rounded-[20px] bg-gradient-to-br p-6 text-white t-colors hover:opacity-95",
                topic.tone,
              )}
            >
              <span className="text-h3-md">{topic.title}</span>
              <span className="mt-1 text-small text-white/80">{topic.sub}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-14 max-w-[1386px] px-4 md:mt-24">
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-[28px] bg-[#f6f1e9] px-6 py-8 text-center text-label text-[#6f6a5e] md:py-12">
          {FACTS.map((fact) => (
            <li key={fact.text}>
              {"href" in fact ? (
                <a href={fact.href} className="t-colors hover:text-fg">
                  {fact.text}
                </a>
              ) : (
                fact.text
              )}
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="mx-auto mt-10 h-2 w-[91px] overflow-hidden rounded-full bg-[#ece7df]">
        <div
          className="h-full w-[64px] rounded-full bg-black"
          style={{ transform: `translateX(${progress * 27}px)` }}
        />
      </div>
    </section>
  );
}
