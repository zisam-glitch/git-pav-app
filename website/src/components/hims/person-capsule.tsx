import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  md: "max-w-[212px]",
  lg: "max-w-[264px]",
  xl: "max-w-[360px]",
} as const;

/**
 * A person as a tall capsule portrait with their name and role under it, the whole card a link to their page.
 *
 * Hims reference: the executive slider of the "Clinical excellence" capture (page script, see
 * `docs/redesign/website/hims-patterns/clinical-excellence.md`): slide max-width 212px, `aspect-ratio: 2 / 3`,
 * radius 120px (a full capsule), shadow `0 30px 30px rgba(0,0,0,.16)`, photo cover and centred; name HEADING_L and
 * title LABEL_XS under it, centred. Name here is `text-h4` (the Hims size does not fit four across), the role is
 * `text-small` (14px, the Hims 11px is too small to read). Hover: the capsule grows to 1.03 over 200ms ease-in-out
 * (the Hims tile timing) and the name turns terracotta over 0.3s; both stand still for reduced motion.
 *
 * Props: `slug` (links to `/team/$slug`), `name`, `role`, `gdc` (shows a "GDC: number" pill; clinicians only),
 * `photo` (the image node, filled to the capsule: give it `size-full object-cover object-top`), `as` (the heading
 * tag for the name, h3 by default), `size` ("md" 212px, "lg" 264px or "xl" 360px), `className`.
 */
export function PersonCapsule({
  slug,
  name,
  role,
  gdc,
  photo,
  as: Name = "h3",
  size = "md",
  className,
}: {
  slug: string;
  name: string;
  role: string;
  gdc?: string;
  photo: ReactNode;
  as?: "h2" | "h3";
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Link
      to="/team/$slug"
      params={{ slug }}
      className={cn("group flex flex-col items-center text-center", className)}
    >
      <span
        className={cn(
          "relative block aspect-[2/3] w-full overflow-hidden rounded-[120px] bg-sand shadow-[0_30px_30px_rgb(0_0_0/0.16)] transition-transform duration-200 ease-in-out motion-safe:group-hover:scale-[1.03]",
          SIZES[size],
        )}
      >
        {photo}
      </span>
      <Name className="mt-8 text-h4 text-fg t-colors group-hover:text-terracotta">{name}</Name>
      <span className="mt-1 block text-small text-muted">{role}</span>
      {gdc ? (
        <span className="mt-3 inline-flex rounded-pill border border-border px-3 py-1 text-caption font-medium text-terracotta">
          GDC: {gdc}
        </span>
      ) : null}
    </Link>
  );
}
