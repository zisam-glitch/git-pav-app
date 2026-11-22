import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Gem, Layers, Sparkles, Stethoscope, Wand2 } from "lucide-react";
import { BookButton } from "@/components/hims";
import { BenefitCards, type BenefitItem } from "@/components/hims/benefit-cards";

const PROCEDURES: readonly BenefitItem[] = [
  {
    title: "Tooth Contouring",
    body: "This procedure involves reshaping the tooth by removing some of its enamel to alter its length, shape, or surface.",
    icon: Wand2,
  },
  {
    title: "Teeth Whitening",
    body: (
      <>
        One of the most common and cost-effective cosmetic dentistry treatments, teeth whitening can
        brighten your smile in just one session.{" "}
        <Link
          to="/services/whitening"
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-fg underline underline-offset-4 t-colors hover:text-terracotta"
        >
          Learn more
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      </>
    ),
    icon: Sparkles,
  },
  {
    title: "Porcelain Veneers",
    body: "These are thin shells of porcelain that are custom-fitted to cover the front surface of a tooth, often used to correct uneven teeth, worn enamel, or discoloration.",
    icon: Gem,
  },
  {
    title: "Dental Implants",
    body: "Used to replace missing teeth, dental implants offer a long-lasting solution that looks and feels natural.",
    icon: Stethoscope,
  },
  {
    title: "Dental Bonding",
    body: "This involves applying a tooth-colored resin to a tooth and hardening it with a special light. It’s a cost-effective way to repair chipped or cracked teeth.",
    icon: Layers,
  },
];

export function CosmeticProcedures() {
  return (
    <BenefitCards
      id="procedures"
      theme="white"
      title="Popular"
      accent="Cosmetic Dentistry Procedures"
      action={<BookButton>Book Now</BookButton>}
      items={PROCEDURES}
      columns={3}
    />
  );
}
