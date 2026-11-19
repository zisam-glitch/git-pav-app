import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Hims carousel: a snap-scrolling row that shows part of the next card (1.15 cards on a phone, 2.3 on a
 * tablet, 3.4 on a desktop) with two round arrow buttons under it. Every child becomes one slide.
 * Use `arrows="dark"` on a brown, navy or black section.
 */
export function Carousel({
  children,
  label,
  className,
  itemClassName,
  arrows = "light",
}: {
  children: ReactNode;
  /** Names the carousel for screen readers, for example "Our treatments". */
  label: string;
  className?: string;
  itemClassName?: string;
  arrows?: "light" | "dark";
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
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [--pv:1.15] md:mx-0 md:px-0 md:[--pv:2.3] lg:[--pv:3.4]"
      >
        {Children.map(children, (child) => (
          <li
            className={cn("shrink-0 snap-start", itemClassName)}
            style={{ flexBasis: "calc((100% - (var(--pv) - 1) * 1rem) / var(--pv))" }}
          >
            {child}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2">
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
