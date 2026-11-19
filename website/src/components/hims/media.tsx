import { cn } from "@/lib/utils";

const PLACEHOLDERS = {
  cream: "bg-tile-cream",
  sage: "bg-tile-sage",
  sand: "bg-sand",
  brown: "bg-brown",
  navy: "bg-navy",
  clay: "bg-clay/30",
} as const;

/**
 * A rounded picture frame. With `src` it shows the image (cropped to fill). Without `src` it shows a soft
 * Hims-tinted block of the same shape, so a layout can be built and judged before its picture exists. Always
 * give `alt` (an empty string for a purely decorative picture).
 */
export function Media({
  src,
  alt,
  ratio = "4 / 3",
  tone = "cream",
  className,
  imgClassName,
  priority = false,
  width,
  height,
}: {
  src?: string;
  alt: string;
  /** CSS aspect ratio such as "4 / 3", "1 / 1" or "16 / 9". */
  ratio?: string;
  tone?: keyof typeof PLACEHOLDERS;
  className?: string;
  imgClassName?: string;
  /** True for the picture at the top of the page: it loads first instead of lazily. */
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", PLACEHOLDERS[tone], className)}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          className={cn("absolute inset-0 size-full object-cover", imgClassName)}
        />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0" />
      )}
    </div>
  );
}
