import { createFileRoute } from "@tanstack/react-router";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentPage,
  LegalSection,
  LegalTable,
  type LegalTocItem,
} from "@/components/legal/legal-document-layout";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () => seoHead("/privacy-policy"),
  component: PrivacyPolicyPage,
});

const TOC: LegalTocItem[] = [
  { id: "data-controller", label: "Data Controller Information" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "lawful-basis", label: "Lawful Basis for Processing" },
  { id: "third-party-processors", label: "Third-Party Processors", meta: "12" },
  { id: "retention-periods", label: "Retention Periods" },
  { id: "your-rights", label: "Your Rights" },
];

const PROCESSORS: Array<[string, string]> = [
  ["Render", "Cloud application server hosting and background worker execution (API runtime)."],
  [
    "Supabase",
    "Managed PostgreSQL database with PostGIS extensions for encrypted patient records, appointments, clinical charts, and audit logs.",
  ],
  [
    "Upstash",
    "Managed serverless Redis for rate limiting, short-lived session security, and queue coordination.",
  ],
  [
    "Vercel",
    "Static asset hosting and serverless web runtime for the marketing site and staff admin dashboard.",
  ],
  [
    "Stripe",
    "Payment processing, deposit pre-authorisations, and card vaulting (PCI-DSS Level 1 compliant).",
  ],
  ["Daily.co", "Encrypted WebRTC virtual dental consultation video streams."],
  [
    "Postmark",
    "Transactional email delivery for administrative alerts (zero diagnostic or clinical information).",
  ],
  ["Twilio", "SMS delivery for one-time verification codes and staff two-factor authentication."],
  [
    "Sentry",
    "Application diagnostics and crash reporting with strict client and server-side personal data scrubbers.",
  ],
  [
    "Expo (EAS)",
    "Mobile application compilation, binary delivery, and push notification routing via Apple APNs and Google FCM.",
  ],
  [
    "postcodes.io",
    "Geographic resolution of UK postcodes for clinic proximity and mobile van coverage calculation (no personal patient identifiers transmitted).",
  ],
  ["Mapbox", "Road network routing and estimated arrival calculations for mobile dental van visits."],
];

function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      currentPath="/privacy-policy"
      category="Working Draft · Pending Legal Review"
      title="Patient Privacy"
      titleAccent="Notice"
      subtitle="How Pav Dental collects, protects, and manages your personal and clinical dental records under UK GDPR and the Data Protection Act 2018."
      metaItems={[
        "Last updated: 27 October 2026",
        "Working Compliance Draft (LG-01/LG-02)",
        "UK GDPR & DPA 2018",
      ]}
      notice={
        <>
          <strong className="font-medium text-fg">Pre-Launch Notice:</strong> This privacy notice
          accurately reflects the technical architecture, sub-processors, and data handling of the
          Pav Dental software platform. It is currently undergoing formal legal, DPO, and clinical
          lead review (LG-01) prior to full launch.
        </>
      }
      toc={TOC}
    >
      <LegalSection id="data-controller" number="01" title="Data Controller Information">
        <p>
          Pav Dental (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller
          responsible for your personal information.
        </p>
        <LegalTable
          headers={["Detail", "Contact & Registration"]}
          minWidthClass="min-w-[24rem]"
          rows={[
            ["Practice Address", "786 Leeds Road, Bradford, BD3 9TY, United Kingdom"],
            ["Telephone", "0800 1938 786 / +44 7311 871456"],
            [
              "Email",
              <a key="email" href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
                hello@pavdental.com
              </a>,
            ],
            [
              "Data Protection Officer (DPO)",
              <a key="dpo" href="mailto:dpo@pavdental.com" className={LEGAL_LINK_CLASS}>
                dpo@pavdental.com
              </a>,
            ],
            ["Clinical Lead", "Dr Hassan Bhojani (GDC #262970)"],
          ]}
        />
      </LegalSection>

      <LegalSection id="information-we-collect" number="02" title="Information We Collect">
        <p>
          To provide safe, comprehensive dental treatment and appointment scheduling, we process the
          following categories of information:
        </p>
        <LegalTable
          headers={["Category", "Data Processed"]}
          rows={[
            [
              "Personal & Contact Details",
              "Full name, date of birth, biological sex, contact address, email address, mobile telephone number, and emergency contact details.",
            ],
            [
              "Special Category Health & Clinical Data",
              "Medical history (medications, allergies, systemic conditions), dental charts (odontograms), treatment plans, clinical notes, intraoral photographs, digital radiographs (X-rays), and signed prescriptions.",
            ],
            [
              "Dependants",
              "Details of children under 16 booked by their parent or legal guardian for paediatric dental care.",
            ],
            [
              "Payment & Transaction Data",
              "Payment card tokens, transaction amounts, and deposit receipts. Full payment card numbers are processed directly by our PCI-DSS Level 1 payment processor (Stripe) and are never stored on our servers.",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection id="lawful-basis" number="03" title="Lawful Basis for Processing">
        <p>
          Under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018:
        </p>
        <LegalTable
          headers={["Lawful Basis", "Purpose"]}
          rows={[
            [
              "Contractual Necessity (Article 6(1)(b))",
              "To manage your patient account, schedule appointments, process deposits, and communicate essential appointment alerts.",
            ],
            [
              "Provision of Healthcare & Medical Diagnosis (Article 9(2)(h))",
              "To assess oral health, formulate treatment plans, take radiographs, and deliver dental care.",
            ],
            [
              "Legal Obligation (Article 6(1)(c))",
              "To maintain clinical dental records in compliance with General Dental Council (GDC) standards and healthcare record-keeping regulations.",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection
        id="third-party-processors"
        number="04"
        title="Third-Party Technical Processors & Infrastructure"
      >
        <p>
          We never sell, rent, or trade your personal data. We utilize third-party technology
          providers to host, secure, and deliver the service. Formal Data Processing Agreements
          (DPAs) and standard contractual clauses are managed as part of pre-launch compliance
          onboarding (tracked in our DPA Register):
        </p>
        <LegalTable headers={["Processor", "Infrastructure Role & Data Handled"]} rows={PROCESSORS} />
      </LegalSection>

      <LegalSection id="retention-periods" number="05" title="Retention Periods">
        <p>In compliance with GDC Standards and the NHS Records Management Code of Practice:</p>
        <LegalTable
          headers={["Record Category", "Minimum Retention Period"]}
          rows={[
            [
              "Adult Patients",
              <>
                Clinical notes, odontograms, radiographs, and prescriptions are retained for a
                minimum of <strong className="font-medium text-fg">11 years</strong> after your last
                treatment.
              </>,
            ],
            [
              "Children & Young Persons",
              "Records are retained until the patient's 25th birthday, or 11 years after the last treatment (whichever is longer).",
            ],
            [
              "Financial & Transaction Records",
              "Invoices and transaction logs are held for 6 years in accordance with UK statutory tax requirements.",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection id="your-rights" number="06" title="Your Rights">
        <p>You have statutory rights under UK data protection law:</p>
        <ul className="list-disc space-y-2.5 pl-5 marker:text-terracotta">
          <li>
            <strong className="font-medium text-fg">Right of Access:</strong> You can request a copy
            of your personal and clinical records (Subject Access Request) free of charge.
          </li>
          <li>
            <strong className="font-medium text-fg">Right to Rectification:</strong> You can ask us
            to correct inaccurate contact details or clinical records.
          </li>
          <li>
            <strong className="font-medium text-fg">Right to Erasure:</strong> You can request
            account closure and deletion of non-clinical data. (Note: Statutory regulations require
            clinical records to be retained for the minimum 11-year retention period).
          </li>
          <li>
            <strong className="font-medium text-fg">Complaints:</strong> If you are unhappy with how
            we have handled your data, you can contact our DPO at{" "}
            <a href="mailto:dpo@pavdental.com" className={LEGAL_LINK_CLASS}>
              dpo@pavdental.com
            </a>{" "}
            or lodge a complaint with the UK Information Commissioner&apos;s Office (ICO) at{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              ico.org.uk
            </a>
            .
          </li>
        </ul>
      </LegalSection>
    </LegalDocumentPage>
  );
}
