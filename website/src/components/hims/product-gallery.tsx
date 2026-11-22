import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Media } from "./media";

/**
 * Hims product gallery: one big rounded picture with round thumbnails over its bottom edge (dots on a phone).
 * With one picture it is just the picture; with none it shows a soft placeholder frame of the same shape.
 *
 * Hims reference: `/hair-loss/minoxidil.html` and `/weight-loss/wegovy-pill.html` gallery (y57, 1440 wide).
 * Measured: frame 889 x 803 (ratio 1.107), radius 16px, 66px gutter to the 389px side rail; thumbnails: round
 * 60 x 60 buttons, 16px apart, centred, 28px above the bottom edge, shadow 0 4px 10px rgba(0,0,0,.2), the active
 * one wrapped in a 64px ring. Phone: frame 346 x 310, thumbnails become 8px dots in a 68 x 20 pill (fill
 * rgba(0,0,0,.33), 6px padding, active dot white, others 17% white), 28px above the bottom edge.
 *
 * Props: `images` (usable picture URLs, first is shown first), `alt` (the product name: the big picture uses it
 * as is, the thumbnails add "view N"), `badge` (a `Chip` shown top left), `className`.
 */
export function ProductGallery({
  images,
  alt,
  badge,
  className,
}: {
  images: readonly string[];
  alt: string;
  badge?: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(images.length - 1, 0));
  const current = images[index];
  const frame = "889 / 803";

  /* token-request: thumbnail shadow 0 4px 10px rgba(0,0,0,.2) and dot pill fill rgba(0,0,0,.33) */
  return (
    <div className={cn("relative", className)}>
      {current ? (
        <div
          className="relative overflow-hidden rounded-md bg-black/3"
          style={{ aspectRatio: frame }}
        >
          <img
            key={current}
            src={current}
            alt={alt}
            width={889}
            height={803}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : (
        <Media alt={alt} ratio={frame} tone="cream" className="rounded-md" priority />
      )}
      {badge ? <div className="absolute top-5 left-5">{badge}</div> : null}

      {images.length > 1 ? (
        <>
          <div
            role="group"
            aria-label="Product pictures"
            className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 gap-4 md:flex"
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Show picture ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                onClick={() => setActive(i)}
                className={cn(
                  "size-[60px] shrink-0 overflow-hidden rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.2)] outline-offset-2 t-colors focus-visible:outline-2",
                  i === index ? "ring-2 ring-black ring-offset-2" : "opacity-85 hover:opacity-100",
                )}
              >
                <img
                  src={src}
                  alt={`${alt} view ${i + 1}`}
                  width={60}
                  height={60}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label="Product pictures"
            className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2 rounded-[10px] bg-black/33 p-1.5 md:hidden"
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Show picture ${i + 1} of ${images.length}`}
                aria-pressed={i === index}
                onClick={() => setActive(i)}
                className={cn(
                  "relative size-2 rounded-full before:absolute before:-inset-3 before:content-['']",
                  i === index ? "bg-white" : "bg-white/17",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
