// The people on the live site's team page, ported word for word from the live
// profiles (seo/live-content/team--*.json). Section headings keep the casing the
// live source wrote; the page's styling uppercases them. Dr Meucci's GDC number is
// added from the owner's records (decision V-02); the live profile omits it.
// Edit the text here from now on.
import type { ContentBlock } from "@/components/content/content-blocks";

export interface TeamMember {
  slug: string;
  name: string;
  /** The line under the name, as on the live team page. */
  role: string;
  photo: { src: string; alt: string };
  /** General Dental Council registration number, for clinicians. */
  gdc?: string;
  /** The opening paragraph(s) under the name. */
  summary: string[];
  languages?: string;
  availability?: string;
  /** How to book or get in touch, as the live profile words it. */
  contact?: string;
  /** Sections below the introduction. */
  blocks: ContentBlock[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    "slug": "aboo-bhojani",
    "name": "Aboo Bhojani",
    "role": "Director & Dental Engineer",
    "photo": {
      "src": "/images/team/1.jpg",
      "alt": "Aboo Bhojani"
    },
    "summary": [
      "Aboo Bhojani serves as Director and Dental Engineer at Pav Dental, bringing together technical expertise and financial governance. With a professional background as a former Tax Inspector and advanced Avensys certification in dental engineering, Aboo plays a vital role in ensuring Pav Dental operates with precision, transparency, and full compliance — both clinically and financially."
    ],
    "blocks": [
      {
        "kind": "heading",
        "text": "Professional Background"
      },
      {
        "kind": "paragraph",
        "text": "Aboo’s experience spans the public and healthcare sectors. His time as a Tax Inspector with HMRC provided him with a deep understanding of taxation law, financial accountability, and auditing processes. This experience directly informs his role at Pav Dental, where he oversees the clinic’s compliance with HMRC regulations, including payroll systems, VAT submissions, expense management, and corporation tax filings. Complementing his financial expertise, Aboo also completed the Avensys Dental Engineering course, equipping him with practical skills in maintaining, testing, and certifying dental equipment under HTM and CQC guidelines."
      },
      {
        "kind": "heading",
        "text": "Responsibilities"
      },
      {
        "kind": "list",
        "items": [
          "Overseeing HMRC compliance, tax returns, and payroll accuracy",
          "Managing financial governance and business reporting for Mars Purifier Ltd",
          "Supervising dental equipment maintenance and certification (autoclaves, compressors, suction systems)",
          "Ensuring full adherence to CQC, HTM 01-05, and infection control standards",
          "Supporting the Registered Manager in audits, risk assessments, and quality assurance"
        ]
      },
      {
        "kind": "heading",
        "text": "Qualifications and training"
      },
      {
        "kind": "list",
        "items": [
          "Avensys Biomedical & Dental Engineering Course (Completed)",
          "Former HMRC Tax Inspector",
          "Certified in Health & Safety, Infection Control, and Equipment Maintenance."
        ]
      },
      {
        "kind": "quote",
        "text": "Integrity and compliance are the backbone of sustainable healthcare. My goal is to ensure Pav Dental operates to the highest standard — clinically, technically, and financially — with full accountability to our patients and regulators."
      }
    ]
  },
  {
    "slug": "dr-hassan-bhojani",
    "name": "Dr Hassan Bhojani",
    "role": "Principal Dentist & Registered Manager",
    "photo": {
      "src": "/images/team/2.jpg",
      "alt": "Dr Hassan Bhojani"
    },
    "gdc": "262970",
    "summary": [
      "Cancer survivor and highly skilled dentist with advanced training in restorative and aesthetic procedures. Resilient, reliable, and responsible professional with extensive experience in urgent dental care, oral surgery, restorative dentistry, and practice leadership. Committed to delivering outstanding patient care while continuously striving to improve the dental experience for both patients and practitioners."
    ],
    "languages": "English (fluent)",
    "availability": "Mon–Sun (urgent care rota), routine by appointment",
    "contact": "Book with Dr Hassan — 0800 1938 786",
    "blocks": [
      {
        "kind": "heading",
        "text": "Special interests"
      },
      {
        "kind": "list",
        "items": [
          "Urgent dental care",
          "Oral surgery (simple & complex extractions)",
          "Restorative dentistry",
          "Dento-alveolar trauma",
          "Management of anxious patients"
        ]
      },
      {
        "kind": "heading",
        "text": "Education & Qualifications"
      },
      {
        "kind": "list",
        "items": [
          "MDDr Dentistry, Charles University – First Faculty of Medicine (2016)",
          "Postgraduate Diploma in Restorative & Aesthetic Dentistry, Dominic Hassall Training Institute (Completed 2019)",
          "Queen Elizabeth’s Grammar School, Blackburn — High School & College Education",
          "Enrolled in MSc Oral Surgery, University of Central Lancashire (UCLan), starting September 2026",
          "GDC-registered dentist (No. 262970)"
        ]
      },
      {
        "kind": "heading",
        "text": "Professional Experience"
      },
      {
        "kind": "heading",
        "text": "Founder, Director & Principal Dentist",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Pav Dental, UK · 2025 – Present"
      },
      {
        "kind": "list",
        "items": [
          "Lead all clinical and operational aspects of a busy private dental practice focused on emergency and restorative dentistry",
          "Provide comprehensive dental care including emergency treatment, restorative procedures, oral surgery, and aesthetic dentistry",
          "Oversee clinical governance, compliance, patient safety, radiographic safety, and quality assurance systems",
          "Develop patient-centred systems to improve accessibility, communication, and overall patient experience",
          "Manage business operations, team leadership, marketing strategy, and practice growth",
          "Built a strong reputation for same-day emergency care and high patient satisfaction"
        ]
      },
      {
        "kind": "heading",
        "text": "Director & Principal Dentist",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Parish Dental Practice, Leeds · 2022 – 2024"
      },
      {
        "kind": "list",
        "items": [
          "Directed clinical and operational management of a busy dental practice",
          "Maintained high standards of patient care, compliance, and clinical governance",
          "Led multidisciplinary teams while improving workflow efficiency and patient experience",
          "Oversaw treatment planning, patient communication, and practice development strategies"
        ]
      },
      {
        "kind": "heading",
        "text": "Self-Employed Dentist",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Various Practices & Institutions · 2016 – 2025"
      },
      {
        "kind": "heading",
        "text": "Practices & institutions"
      },
      {
        "kind": "list",
        "items": [
          "FCMS 111, North West England",
          "Smart Dental (Corporate) — Deepdale Dental, Preston",
          "HMP Preston, Preston",
          "HMP Kirkham, Preston",
          "HMP Lancaster Farms, Lancaster",
          "HMP Buckley Hall, Rochdale",
          "GenSmile — Ewood Dental, Blackburn",
          "Rodericks (Corporate) — Calder Dental, Burnley",
          "Rodericks (Corporate) — Jem Dental, Leeds",
          "mydentist (Corporate) — Hillside Dental, Nottingham",
          "HMP Whatton, Nottinghamshire",
          "Sielby Dental Practice, Leicestershire",
          "NHPL (Corporate) — Seven Dental, Nottingham",
          "Delivered comprehensive NHS and private dental care across urgent care, general practice, and custodial settings",
          "Managed emergency dental cases efficiently within fast-paced and high-demand environments",
          "Demonstrated adaptability across multiple clinical systems, teams, and practice structures",
          "Performed a broad range of treatments including restorative dentistry, extractions, endodontics, and emergency procedures",
          "Maintained high standards of clinical governance, cross-infection control, and record keeping"
        ]
      },
      {
        "kind": "heading",
        "text": "CEO & Founder",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Mars Purifier · 2020 – Present"
      },
      {
        "kind": "list",
        "items": [
          "Founded and oversees a healthcare-focused air purification company specialising in clinical air quality solutions",
          "Lead business operations, strategic partnerships, and healthcare innovation initiatives"
        ]
      },
      {
        "kind": "heading",
        "text": "Early Employment Experience"
      },
      {
        "kind": "heading",
        "text": "Cricket Scoreboard Assistant",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Local Cricket Club, East Lancashire CC Blackburn · 1999"
      },
      {
        "kind": "list",
        "items": [
          "Assisted with updating and maintaining the scoreboard during cricket matches.",
          "Developed early responsibility, teamwork, and attention to detail."
        ]
      },
      {
        "kind": "heading",
        "text": "Receptionist",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Family GP Practice, Barbara Castle Way, Blackburn · 2006 - 2009"
      },
      {
        "kind": "list",
        "items": [
          "Assisted with patient appointments and front-desk administration.",
          "Developed communication and organisational skills within a healthcare environment."
        ]
      },
      {
        "kind": "heading",
        "text": "Retail Assistant (Cooked Meats Department)",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Asda, Blackburn · 2008"
      },
      {
        "kind": "list",
        "items": [
          "Assisted with stock replenishment and customer service.",
          "Developed teamwork and communication skills in a fast-paced environment."
        ]
      },
      {
        "kind": "heading",
        "text": "Seasonal Retail Assistant",
        "level": 3
      },
      {
        "kind": "paragraph",
        "text": "Next plc, Blackburn · Christmas Season"
      },
      {
        "kind": "list",
        "items": [
          "Assisted customers and supported store operations during the Christmas sales period.",
          "Developed organisational skills and the ability to work under pressure."
        ]
      },
      {
        "kind": "heading",
        "text": "Clinical Scope"
      },
      {
        "kind": "list",
        "items": [
          "Emergency & routine dentistry",
          "Simple & complex extractions",
          "Dento-alveolar trauma",
          "Incision & drainage of abscesses",
          "Restorative dentistry",
          "Crowns & bridges",
          "Whitening",
          "Urgent endodontic stabilisation",
          "Anxious patient care"
        ]
      },
      {
        "kind": "quote",
        "text": "Money is not worthy of being the goal of one’s life. Status, power and social positions are too trivial to be the goals of a person’s life. The purpose of life is servitude. The goal is to reach God, and the only way to do this is to be at peace with those who are at peace with you, and at war with those who are at war with you. — Inspired by Imam حسين"
      }
    ]
  },
  {
    "slug": "dr-cosimo-meucci",
    "name": "Dr Cosimo Meucci",
    "role": "Implant Dentist",
    "photo": {
      "src": "/images/team/3.jpg",
      "alt": "Dr Cosimo Meucci"
    },
    "gdc": "280128",
    "summary": [
      "Dr Cosimo Meucci is Pav Dental’s visiting implantologist, providing patients with advanced dental implant care and surgical expertise. With extensive experience in implant placement, bone grafting, and full-mouth rehabilitation, Dr Meucci combines surgical precision with a patient-focused approach to achieve long-lasting, natural results."
    ],
    "languages": "English, Italian",
    "availability": "Fridays and select Saturdays (by referral and appointment)",
    "contact": "Book an implant consultation — 0800 1938 786 or hello@pavdental.com",
    "blocks": [
      {
        "kind": "heading",
        "text": "Professional Background"
      },
      {
        "kind": "paragraph",
        "text": "Dr Meucci qualified as a dentist in Italy and later advanced his training in oral implantology and restorative dentistry through postgraduate education in the UK. His calm, methodical approach and deep understanding of bone and soft-tissue management make him an invaluable part of Pav Dental’s multidisciplinary team."
      },
      {
        "kind": "heading",
        "text": "Special interests"
      },
      {
        "kind": "list",
        "items": [
          "Dental implant placement and restoration",
          "Bone grafting and sinus lift procedures",
          "Full-arch and All-on-X implant rehabilitation",
          "Digital implant planning and guided surgery",
          "Management of failing or missing teeth"
        ]
      },
      {
        "kind": "heading",
        "text": "Qualifications and membership"
      },
      {
        "kind": "list",
        "items": [
          "DDS, University of Valencia, Spain",
          "MSc in Implantology, Spain",
          "GDC-registered dentist"
        ]
      },
      {
        "kind": "quote",
        "text": "Every patient deserves a confident smile that feels and functions naturally. I focus on precision, comfort, and clear communication at every stage of implant treatment."
      }
    ]
  },
  {
    "slug": "raheela-shafiq",
    "name": "Raheela Shafiq",
    "role": "Compliance Manager",
    "photo": {
      "src": "/images/team/4.jpeg",
      "alt": "Raheela Shafiq"
    },
    "summary": [
      "Raheela Shafiq leads compliance and governance at Pav Dental. With a strong focus on regulatory standards, risk management, and patient safety, she ensures that every process—from clinical care to data management—meets legal, ethical, and industry benchmarks."
    ],
    "languages": "English, Urdu",
    "availability": "Monday – Friday",
    "contact": "hello@pavdental.com",
    "blocks": [
      {
        "kind": "heading",
        "text": "Professional Background"
      },
      {
        "kind": "paragraph",
        "text": "Raheela has experience in compliance, audit, or healthcare quality assurance."
      },
      {
        "kind": "heading",
        "text": "Key Responsibilities"
      },
      {
        "kind": "list",
        "items": [
          "Overseeing CQC, HTM, and dental regulatory compliance",
          "Managing GDPR, data protection, and patient confidentiality protocols",
          "Liaising with auditors, external regulators, and ensuring statutory adherence",
          "Conducting internal audits, risk assessments, and corrective action tracking",
          "Delivering staff training in compliance, safeguarding, infection control, health & safety",
          "Handling incident investigations, complaints review, and policy updates",
          "Keeping protocols and SOPs up to date with regulatory changes"
        ]
      },
      {
        "kind": "heading",
        "text": "Qualifications and training"
      },
      {
        "kind": "list",
        "items": [
          "Diploma in Business management",
          "Certification in Compliance, Risk Management, or Regulatory Affairs",
          "GDPR / Data Protection certification",
          "Training in safeguarding, health & safety, and quality systems"
        ]
      },
      {
        "kind": "quote",
        "text": "Compliance is more than rules — it’s a promise to our patients that we operate with integrity, accountability, and excellence every day."
      }
    ]
  },
  {
    "slug": "waleed-javed",
    "name": "Waleed Javed",
    "role": "Practice Manager",
    "photo": {
      "src": "/images/team/5.jpg",
      "alt": "Waleed Javed"
    },
    "summary": [
      "Waleed Javed brings a strong blend of technical expertise, healthcare knowledge and leadership experience to his role at Pav Dental. His professional qualifications include a First Class Degree in Software Engineering, CCNA qualification, Level 3 Diploma in Health and Social Care, Level 5 Diploma in Leadership and Management for Adult Care, Level 3 Award in Emergency First Aid at Work, Level 3 Safeguarding Adults, GDPR and Data Protection Certification, and Infection Prevention and Control Certification."
    ],
    "languages": "English, Urdu",
    "availability": "Monday–Friday",
    "contact": "hello@pavdental.com",
    "blocks": [
      {
        "kind": "heading",
        "text": "Key Areas of Focus"
      },
      {
        "kind": "list",
        "items": [
          "Providing exceptional patient care and communication",
          "Leading and supporting the clinical, administrative and reception teams",
          "Implementing digital systems to improve efficiency and patient experience",
          "Overseeing compliance and maintaining CQC standards",
          "Managing practice operations, workflow and quality assurance",
          "Driving continuous improvement across all areas of the practice"
        ]
      },
      {
        "kind": "heading",
        "text": "Professional Qualifications"
      },
      {
        "kind": "list",
        "items": [
          "First Class Degree in Software Engineering",
          "CCNA qualification",
          "Level 3 Diploma in Health and Social Care",
          "Level 5 Diploma in Leadership and Management for Adult Care",
          "Level 3 Award in Emergency First Aid at Work",
          "Level 3 Safeguarding Adults",
          "GDPR and Data Protection Certification",
          "Infection Prevention and Control Certification"
        ]
      },
      {
        "kind": "quote",
        "text": "At Pav Dental, the mission is simple: to deliver exceptional dental care that is accessible, comfortable and supported by innovation. The Practice Manager is proud to lead a team that puts patients at the heart of everything they do."
      }
    ]
  },
  {
    "slug": "uwais-ullah",
    "name": "Uwais Ullah",
    "role": "Trainee Dental Nurse",
    "photo": {
      "src": "/images/team/6.jpg",
      "alt": "Uwais Ullah"
    },
    "summary": [
      "Uwais is currently training as a dental nurse and is an integral part of the Pav Dental team. His calm and focused approach helps ensure every procedure runs smoothly and safely. Under the supervision of Dr. Hassan Bhojani, Uwais assists in clinical procedures, maintains infection control standards, and supports patients throughout their treatment journey."
    ],
    "languages": "English, Urdu",
    "availability": "Monday – Saturday",
    "contact": "Support queries — hello@pavdental.com",
    "blocks": [
      {
        "kind": "heading",
        "text": "What Uwais helps with"
      },
      {
        "kind": "list",
        "items": [
          "Chairside assistance during dental treatments and surgeries",
          "Preparing and sterilising instruments in compliance with HTM 01-05",
          "Maintaining surgery cleanliness and patient comfort",
          "Recording treatment notes and supporting digital workflows",
          "Assisting with stock management and clinical setup"
        ]
      },
      {
        "kind": "quote",
        "text": "Uwais is passionate about learning and providing the highest standard of patient care. He brings enthusiasm, reliability, and a strong commitment to developing his clinical skills within Pav Dental’s patient-centred environment."
      }
    ]
  },
  {
    "slug": "haris-bhojani",
    "name": "Haris Bhojani",
    "role": "Dental Assistant & Clinical Support",
    "photo": {
      "src": "/images/team/7.jpg",
      "alt": "Haris Bhojani"
    },
    "summary": [
      "Haris plays a key role in supporting the smooth daily operation of Pav Dental’s clinical services. He assists with patient preparation, treatment coordination, and maintains the highest standards of cleanliness and efficiency in every procedure. Haris is known for his friendly manner, professionalism, and commitment to patient comfort."
    ],
    "languages": "English, Urdu",
    "availability": "Monday – Saturday",
    "contact": "Support or clinical assistance — hello@pavdental.com",
    "blocks": [
      {
        "kind": "heading",
        "text": "What Haris helps with"
      },
      {
        "kind": "list",
        "items": [
          "Assisting the dentist during treatments and consultations",
          "Preparing instruments, materials, and equipment before each procedure",
          "Ensuring surgeries meet strict infection control and HTM 01-05 standards",
          "Supporting patient flow, appointment readiness, and digital note entry",
          "Helping new patients feel at ease before treatment"
        ]
      },
      {
        "kind": "heading",
        "text": "Training & development"
      },
      {
        "kind": "list",
        "items": [
          "Ongoing in-practice dental assisting training",
          "Regular CPD in infection prevention, medical emergencies, and radiography safety"
        ]
      },
      {
        "kind": "quote",
        "text": "Haris believes in creating a calm, reassuring environment for patients and takes pride in helping the team deliver seamless, high-quality care."
      }
    ]
  },
  {
    "slug": "sayed-shohag-rahman",
    "name": "Sayed Shohag Rahman",
    "role": "Marketing Manager",
    "photo": {
      "src": "/images/team/8.jpg",
      "alt": "Sayed Shohag Rahman"
    },
    "summary": [
      "Sayed oversees Pav Dental’s communications, website, seo and community outreach. He makes booking simple, keeps patients informed about offers and late-opening slots, and ensures our messages are clear and accessible"
    ],
    "languages": "English, Bangla",
    "availability": "Mon–Fri (with campaign monitoring out of hours)",
    "contact": "hello@pavdental.com (or preferred alias)",
    "blocks": [
      {
        "kind": "heading",
        "text": "What Sayed handles"
      },
      {
        "kind": "list",
        "items": [
          "Website, social media, seo and patient information materials",
          "Promotions, membership plan comms, referral campaigns",
          "Brand consistency, photography/graphics coordination",
          "Patient feedback surveys and service improvement loops"
        ]
      }
    ]
  }
];

export function findTeamMember(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((member) => member.slug === slug);
}
