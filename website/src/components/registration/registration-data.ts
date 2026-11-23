import type { FaqItem } from "@/components/hims";

export const REGISTRATION_STEPS = [
  {
    step: "01",
    badge: "About 8 minutes",
    title: "Register Online",
    description:
      "Answer a few short questions about you, your health and your teeth, one step at a time. Nothing is saved until you send it. Then book a convenient time on our Setmore page, or call our Bradford reception team on 0800 1938 786.",
  },
  {
    step: "02",
    badge: "Privacy First",
    title: "We Set Up Your Patient Record",
    description:
      "Your registration goes to our secure dashboard for the Bradford team. We never email your answers, so your NHS number and medical history are seen only by the people who look after your care.",
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
    q: "What happens to the information I give when I register?",
    a: "Your registration is sent to our secure dashboard, where only our Bradford team can read it. We never email your answers, and nothing is stored in your browser. Your NHS number, ethnic group and anything about your health are optional or only used to set up your care. Our Privacy Policy explains how we look after it.",
  },
  {
    q: "Are you currently accepting new patients in Bradford?",
    a: "Yes. We welcome new private and emergency patients every day at 786 Leeds Road, Bradford, BD3 9TY, with no waiting lists and 24/7 online booking.",
  },
  {
    q: "What should I bring to my first visit?",
    a: "Simply bring photo ID if available and your list of current medications. Your dentist will go through your medical history with you in private at your first visit.",
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
