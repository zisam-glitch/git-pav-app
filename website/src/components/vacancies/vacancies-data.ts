export interface Vacancy {
  id: string;
  title: string;
  category: "nursing" | "dentistry" | "hygiene" | "sponsorship";
  department: string;
  contractType: string;
  location: string;
  description: string;
  tags: string[];
  salaryNote: string;
  featured?: boolean;
}

export const VACANCIES: Vacancy[] = [
  {
    id: "apprentice-nurse",
    title: "Apprentice Nurse",
    category: "nursing",
    department: "Dental Nursing",
    contractType: "Apprenticeship (Full-time)",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "An apprentice nurse works under the supervision of registered nurses and other healthcare professionals to provide basic patient care and support services. This role is designed to provide hands-on experience and training for individuals pursuing a career in nursing.",
    tags: ["Hands-on Training", "Clinical Mentorship", "Funded Qualification", "Patient Support"],
    salaryNote: "Competitive Apprentice Wage + Funded NVQ Level 3",
  },
  {
    id: "registered-nurse",
    title: "Registered Nurse",
    category: "nursing",
    department: "Nursing & Surgery",
    contractType: "Full-time / Part-time",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Registered Nurse (RN) is a highly skilled healthcare professional responsible for providing and coordinating patient care in various healthcare settings. Registered Nurses assess patient health needs, develop and implement nursing care plans, and maintain medical records.",
    tags: ["GDC Registered", "Infection Control", "Sedation Care", "Care Coordination"],
    salaryNote: "£14.50 – £17.00 / hour depending on experience",
  },
  {
    id: "associate-dentist",
    title: "Associate Dentist",
    category: "dentistry",
    department: "General & Cosmetic Dentistry",
    contractType: "Full-time / Part-time (3–5 days)",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Associate Dentist is a licensed dental professional who provides comprehensive dental care to patients. They diagnose and treat dental issues, educate patients about oral health, and promote preventive dental care.",
    tags: [
      "Established Patient List",
      "50% Private Split",
      "Digital Scanners",
      "Full Clinical Autonomy",
    ],
    salaryNote: "High Earning Potential + 50% Private Split",
    featured: true,
  },
  {
    id: "dental-therapist",
    title: "Dental Therapist",
    category: "hygiene",
    department: "Therapy & Restorative Care",
    contractType: "Full-time / Part-time",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Dental Therapist is a licensed dental professional who works under the supervision of dentists to provide preventive and restorative dental care to patients. Dental Therapists focus on routine dental procedures, such as cleanings, fillings, and preventive treatments.",
    tags: ["Direct Access", "Pediatric Care", "Restorative Filings", "Modern Equipment"],
    salaryNote: "£36.00 – £42.00 / hour negotiable",
  },
  {
    id: "dental-hygienist",
    title: "Dental Hygienist",
    category: "hygiene",
    department: "Periodontics & Prevention",
    contractType: "Part-time (2–3 days/week)",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Dental Hygienist is a licensed dental professional who specializes in preventive oral care. They work closely with dentists to provide dental cleanings, examine patients for signs of oral diseases, and educate patients about proper oral hygiene techniques.",
    tags: ["Airflow Technology", "Periodontal Care", "Flexible Days", "Nurse Support Provided"],
    salaryNote: "£38.00 – £44.00 / hour + nurse assistance",
  },
  {
    id: "vocational-training-dentist",
    title: "Vocational Training Dentist",
    category: "dentistry",
    department: "Foundation & Advanced Training",
    contractType: "12-Month Training Contract",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Vocational Training Dentist, also known as a Dental Resident or Dental Intern, is a licensed dental professional undergoing advanced training and education in various dental specialties.",
    tags: ["Accredited Practice", "1-on-1 Senior Mentor", "Multidisciplinary", "Study Days"],
    salaryNote: "NHS Foundation Training Salary Band + Benefits",
  },
  {
    id: "foreign-visa-sponsorship",
    title: "Foreign Visa and Sponsorship",
    category: "sponsorship",
    department: "International Dental Talent",
    contractType: "Skilled Worker Visa (Tier 2)",
    location: "786 Leeds Road, Bradford, BD3 9TY",
    description:
      "Pav Dental is seeking qualified dentists from abroad and offering foreign visa sponsorship to support their relocation and employment. This position is designed to provide skilled dental professionals with an opportunity to work in a new environment, expand their expertise, and contribute to the oral health of the community.",
    tags: [
      "Home Office Sponsor",
      "Relocation Support",
      "GDC / Performer Number Guidance",
      "Full Visa Assistance",
    ],
    salaryNote: "Tier 2 Eligible Salary Package + Relocation Assistance",
  },
];
