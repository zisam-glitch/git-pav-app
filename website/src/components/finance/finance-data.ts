import type { FaqItem } from "@/components/hims";

export interface PaymentOptionCard {
  step: string;
  badge: string;
  title: string;
  accent: string;
  description: string;
  highlights: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
}

export const PAYMENT_OPTIONS: readonly PaymentOptionCard[] = [
  {
    step: "01",
    badge: "Pay Per Visit",
    title: "Pay-as-you-go",
    accent: "transparent fees",
    description:
      "Clear published private fees across examinations, hygiene, restorative treatments, whitening, and aesthetics — pay at your visit with no hidden charges.",
    highlights: [
      "Pre-booked examinations from £35",
      "Hygiene appointments from £45",
      "X-rays per film included free of charge",
    ],
    ctaLabel: "View Fee Schedule",
    ctaHref: "/pricing#fees",
  },
  {
    step: "02",
    badge: "Bronze · Silver · Gold",
    title: "Pav Dental",
    accent: "Membership Plans",
    description:
      "Predictable monthly or annual plans designed to make routine check-ups, hygiene visits, and ongoing treatment savings straightforward.",
    highlights: [
      "Bronze from £9.47/month · Silver £15.85 · Gold £19.24",
      "10% to 20% off treatments and shop products",
      "Save 20% when billed annually",
    ],
    ctaLabel: "Compare Membership Plans",
    ctaHref: "/pricing#plans",
    featured: true,
  },
  {
    step: "03",
    badge: "In-Clinic Clarity",
    title: "Written plans",
    accent: "& staged care",
    description:
      "Before any multi-step treatment begins, your dentist provides a clear written treatment plan and itemised fee breakdown so you can decide at your own pace.",
    highlights: [
      "Full itemised written quote before you commit",
      "Multi-visit treatments can be scheduled in clear stages",
      "Third-party options discussed only in clinic with authorised information",
    ],
    ctaLabel: "Ask Our Clinic Team",
    ctaHref: "/contact-us",
  },
] as const;

export const ACCEPTED_INSURERS = [
  "AXA Health",
  "Simplyhealth",
  "Bupa",
  "Aviva",
  "Denplan",
  "WPA Health Insurance",
] as const;

export const PRICE_MATCH_PILLARS = [
  {
    step: "01",
    title: "Written Quotes Upfront",
    description:
      "Every patient receives a clear, written treatment plan outlining each procedure and fee before deciding whether to go ahead.",
  },
  {
    step: "02",
    title: "Receipts for Insurance",
    description:
      "We provide full itemised receipts after every visit so you can submit claims smoothly to your private dental insurer.",
  },
  {
    step: "03",
    title: "No Online Credit Promotion",
    description:
      "Pav Dental does not advertise regulated credit online. Any discussion about third-party payment options takes place only in clinic with authorised information.",
  },
] as const;

export const FINANCE_FAQS: FaqItem[] = [
  {
    q: "Will I receive a written quote before starting treatment?",
    a: "Yes. Following your examination, your dentist explains your clinical options and provides an itemised written treatment plan showing the exact fee for each stage before any treatment goes ahead.",
  },
  {
    q: "How do Pav Dental Membership Plans work?",
    a: "Our Bronze, Silver, and Gold membership plans cover routine check-ups, hygiene visits, and X-rays, alongside 10% to 20% savings on treatments and dental products. You can pay monthly or choose annual billing to save 20%.",
  },
  {
    q: "Can I pay per stage for longer treatment plans?",
    a: "For multi-visit treatments such as crowns, dentures, or restorative courses, your dentist will outline the clinical stages in your written plan so you know what is due at each stage rather than facing unexpected costs.",
  },
  {
    q: "Can I use my private dental insurance at Pav Dental?",
    a: "Yes. We welcome patients with AXA Health, Simplyhealth, Bupa, Aviva, Denplan, WPA Health Insurance, and other UK providers. We provide detailed itemised receipts after your appointment so you can claim reimbursement directly from your insurer.",
  },
  {
    q: "How does Pav Dental handle third-party finance enquiries?",
    a: "Pav Dental does not advertise or promote regulated credit online. If you would like to ask about payment options for a written treatment plan, please speak with our reception team in clinic at 786 Leeds Road, Bradford, where authorised information can be shared alongside your treatment plan.",
  },
];
