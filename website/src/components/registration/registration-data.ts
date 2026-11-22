import type { FaqItem } from "@/components/hims";

export const REGISTRATION_STEPS = [
  {
    step: "01",
    badge: "24/7 Access",
    title: "Book Online or Call",
    description:
      "Choose a convenient appointment time — daytime, evening, or weekend — using our online Setmore booking page or by calling our Bradford reception team on 0800 1938 786.",
  },
  {
    step: "02",
    badge: "Privacy First",
    title: "Complete Medical History Privately in Clinic",
    description:
      "We protect your NHS number and medical history by never asking for sensitive health data on an open website form. Your confidential clinical intake is completed securely in person when you arrive.",
  },
  {
    step: "03",
    badge: "Tailored Care",
    title: "Personalised Treatment & Ongoing Care Plan",
    description:
      "Your dentist carries out a thorough check-up, listens to your goals, and provides a clear written treatment plan with transparent fees before any treatment goes ahead.",
  },
] as const;

export const REGISTRATION_BENEFITS = [
  {
    step: "01",
    title: "Open 24 Hours, 7 Days a Week",
    description:
      "Routine check-ups and same-day urgent dental care in Bradford whenever you need us — with no waiting lists for new patients.",
  },
  {
    step: "02",
    title: "Pav Dental Membership Plans",
    description:
      "Optional Bronze (£9.47/mo), Silver (£15.85/mo), and Gold (£19.24/mo) plans covering check-ups, hygiene visits, X-rays, and 10%–20% off treatments.",
  },
  {
    step: "03",
    title: "Clear Fees & Price Match Promise",
    description:
      "Published private fees starting from £35 for a pre-booked off-peak examination, written treatment quotes upfront, and our Price Match Promise.",
  },
] as const;

export const CONTACT_TIME_OPTIONS = [
  "Anytime",
  "Morning (08:00 – 12:00)",
  "Afternoon (12:00 – 17:00)",
  "Evening (17:00 – 21:00)",
] as const;

export const REGISTRATION_FAQS: FaqItem[] = [
  {
    q: "Why don't you ask for my NHS number or medical history online?",
    a: "Your clinical information is private. Rather than collecting sensitive medical history, ethnicity, or NHS details through an open website form, we complete your confidential clinical intake securely with our team when you visit our Bradford clinic.",
  },
  {
    q: "Are you currently accepting new patients in Bradford?",
    a: "Yes. We welcome new private and emergency patients every day at 786 Leeds Road, Bradford, BD3 9TY, with no waiting lists and 24/7 online booking.",
  },
  {
    q: "What should I bring to my first visit?",
    a: "Simply bring photo ID if available and a list of any current medications so you can share them privately with your dentist during your in-clinic medical history check.",
  },
  {
    q: "How much is a new patient examination?",
    a: "Pre-booked off-peak examinations start from £35, peak same-day examinations are £55, and X-rays per film are included free of charge. You can view every fee on our Pricing page before booking.",
  },
  {
    q: "Can I join a Bronze, Silver, or Gold membership plan when I register?",
    a: "Yes. Ask our reception team or your dentist at your first visit and we will talk you through our Bronze, Silver, and Gold plans so you can choose what suits your routine care best.",
  },
];
