import { Link, type LinkProps } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

type Look = VariantProps<typeof buttonVariants> & { className?: string; children?: ReactNode };
type AnchorRest = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

/**
 * A Hims pill button that is a link. Give `to` for a page on this site (client-side navigation) or `href`
 * for anything else (opens in a new tab when it is a full http(s) address).
 */
export function ButtonLink({
  to,
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: Look & { to?: LinkProps["to"]; href?: string } & AnchorRest) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (to) {
    return (
      <Link to={to} className={classes} {...(rest as object)}>
        {children}
      </Link>
    );
  }
  const external = href ? /^https?:\/\//.test(href) : false;
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Every Book button goes to the practice's Setmore page (a test enforces it). */
export function BookButton({ variant, size, className, children = "Book now" }: Look) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </a>
  );
}

/** Call the practice. Use `href` for a different number, for example the emergency line. */
export function CallButton({
  variant = "outline",
  size,
  className,
  children,
  href = PRACTICE_PHONE_HREF,
}: Look & { href?: string }) {
  return (
    <a href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children ?? `Call ${PRACTICE_PHONE}`}
    </a>
  );
}
