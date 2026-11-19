import { BookButton, ButtonLink } from "@/components/hims";
import { BOOKING_URL } from "@/lib/enquiry";

export interface CtaProps {
  ctaEnabled: boolean;
  text: string;
  link: string;
  variant?: "default" | "link";
}

export function Cta({ cta, cta: { text, link, variant = "default" } }: { cta: CtaProps }) {
  if (!cta.ctaEnabled) return null;

  if (link === BOOKING_URL) {
    return <BookButton variant={variant === "link" ? "outline" : "default"}>{text}</BookButton>;
  }

  return (
    <ButtonLink href={link} variant={variant === "link" ? "outline" : "default"}>
      {text}
    </ButtonLink>
  );
}
