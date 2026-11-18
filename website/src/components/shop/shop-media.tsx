import { Media } from "@/components/hims";
import { cn } from "@/lib/utils";

/**
 * Renders a real local or API product image, falling back to a Hims cream/sand `<Media>`
 * placeholder when no image URL is set (or when legacy cart-store fallback URLs appear).
 */
export function ShopMedia({
  src,
  alt,
  ratio = "1 / 1",
  tone = "cream",
  priority = false,
  className,
  imgClassName,
}: {
  src?: string | null;
  alt: string;
  ratio?: string;
  tone?: "cream" | "sage" | "sand";
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const usable = Boolean(src && !src.includes("images.unsplash.com"));
  if (!usable) {
    return <Media alt={alt} ratio={ratio} tone={tone} priority={priority} className={className} />;
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-cream", className)}
      style={{ aspectRatio: ratio }}
    >
      <img
        src={src as string}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("size-full object-cover", imgClassName)}
      />
    </div>
  );
}
