import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A snap-scrolling row of fixed-width slides (people capsules) with two round arrow buttons under it.
 *
 * Hims reference: the executive photo slider of the "Clinical excellence" capture (page script, see
 * `docs/redesign/website/hims-patterns/clinical-excellence.md`): 4 slides in view on a desktop (212px each, 28px
 * gap), 3.25 on a tablet and 2 on a phone (16px gap), snap scrolling, with 60px of room under the row for the
 * capsule shadows. The Hims slider loops and keeps the active slide centred; this one is a plain scroller (every
 * slide stays in the HTML and keyboard reachable) with the Hims arrow buttons of `Carousel`.
 *
 * Props: `label` (names the carousel for screen readers), `children` (each child is one slide), `arrows`
 * ("light" on a white or cream band, "dark" on brown or navy), `className`.
 */
export function LeaderCarousel({
  children,
  label,
  arrows = "light",
  className,
}: {
  children: ReactNode;
  label: string;
  arrows?: "light" | "dark";
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowVariant = arrows === "dark" ? "glass" : "outline";

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <ul
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-2 pb-14 md:mx-0 md:gap-7 md:px-0"
      >
        {Children.map(children, (child) => (
          <li className="w-[calc(50%-0.5rem)] shrink-0 snap-start min-[600px]:w-[212px] md:w-[212px]">
            {child}
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <Button
          variant={arrowVariant}
          size="icon"
          aria-label="Previous"
          disabled={edge.start}
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant={arrowVariant}
          size="icon"
          aria-label="Next"
          disabled={edge.end}
          onClick={() => scrollBy(1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
