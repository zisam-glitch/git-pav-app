import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";

export const Route = createFileRoute("/privacy-policy")({
  head: () => seoHead("/privacy-policy"),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[72ch]">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full   bg-[#faf6f0] px-3.5 py-1 text-xs font-semibold text-[#925a27] uppercase">
              Working Draft • Pending Legal Review
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-[#2a1c12] sm:text-4xl">
              Patient Privacy Notice
            </h1>
            <p className="mt-2 text-sm text-[#6b5848]">
              Last updated: 27 October 2026 • Working Compliance Draft (LG-01/LG-02)
            </p>
          </div>

          <div className="rounded-xl   bg-[#faf6f0] p-4 sm:p-5 text-xs text-[#2a1c12] mb-8 leading-relaxed">
            <strong className="text-[#925a27]">Pre-Launch Notice:</strong> This privacy notice accurately reflects the technical architecture, sub-processors, and data handling of the Pav Dental software platform. It is currently undergoing formal legal, DPO, and clinical lead review (LG-01) prior to full launch.
          </div>

          <div className="space-y-8 text-[#4a3b2f] leading-relaxed">
            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">1. Data Controller Information</h2>
              <p className="mt-3 text-sm">
                Pav Dental ("we", "us", "our") is the data controller responsible for your personal information.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li><strong>Practice Address:</strong> 786 Leeds Road, Bradford, BD3 9TY, United Kingdom</li>
                <li><strong>Telephone:</strong> 0800 1938 786 / +44 7311 871456</li>
                <li><strong>Email:</strong> <a href="mailto:hello@pavdental.com" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">hello@pavdental.com</a></li>
                <li><strong>Data Protection Officer (DPO):</strong> <a href="mailto:dpo@pavdental.com" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">dpo@pavdental.com</a></li>
                <li><strong>Clinical Lead:</strong> Dr Hassan Bhojani (GDC #262970)</li>
              </ul>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">2. Information We Collect</h2>
              <p className="mt-3 text-sm">
                To provide safe, comprehensive dental treatment and appointment scheduling, we process the following categories of information:
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-[#2a1c12]">Personal & Contact Details</h3>
                  <p className="text-[#6b5848]">Full name, date of birth, biological sex, contact address, email address, mobile telephone number, and emergency contact details.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a1c12]">Special Category Health & Clinical Data</h3>
                  <p className="text-[#6b5848]">Medical history (medications, allergies, systemic conditions), dental charts (odontograms), treatment plans, clinical notes, intraoral photographs, digital radiographs (X-rays), and signed prescriptions.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a1c12]">Dependants</h3>
                  <p className="text-[#6b5848]">Details of children under 16 booked by their parent or legal guardian for paediatric dental care.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a1c12]">Payment & Transaction Data</h3>
                  <p className="text-[#6b5848]">Payment card tokens, transaction amounts, and deposit receipts. Full payment card numbers are processed directly by our PCI-DSS Level 1 payment processor (Stripe) and are never stored on our servers.</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">3. Lawful Basis for Processing</h2>
              <p className="mt-3 text-sm">
                Under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Contractual Necessity (Article 6(1)(b)):</strong> To manage your patient account, schedule appointments, process deposits, and communicate essential appointment alerts.</li>
                <li><strong>Provision of Healthcare & Medical Diagnosis (Article 9(2)(h)):</strong> To assess oral health, formulate treatment plans, take radiographs, and deliver dental care.</li>
                <li><strong>Legal Obligation (Article 6(1)(c)):</strong> To maintain clinical dental records in compliance with General Dental Council (GDC) standards and healthcare record-keeping regulations.</li>
              </ul>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">4. Third-Party Technical Processors & Infrastructure</h2>
              <p className="mt-3 text-sm">
                We never sell, rent, or trade your personal data. We utilize third-party technology providers to host, secure, and deliver the service. Formal Data Processing Agreements (DPAs) and standard contractual clauses are managed as part of pre-launch compliance onboarding (tracked in our DPA Register):
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Render:</strong> Cloud application server hosting and background worker execution (API runtime).</li>
                <li><strong>Supabase:</strong> Managed PostgreSQL database with PostGIS extensions for encrypted patient records, appointments, clinical charts, and audit logs.</li>
                <li><strong>Upstash:</strong> Managed serverless Redis for rate limiting, short-lived session security, and queue coordination.</li>
                <li><strong>Vercel:</strong> Static asset hosting and serverless web runtime for the marketing site and staff admin dashboard.</li>
                <li><strong>Stripe:</strong> Payment processing, deposit pre-authorisations, and card vaulting (PCI-DSS Level 1 compliant).</li>
                <li><strong>Daily.co:</strong> Encrypted WebRTC virtual dental consultation video streams.</li>
                <li><strong>Postmark:</strong> Transactional email delivery for administrative alerts (zero diagnostic or clinical information).</li>
                <li><strong>Twilio:</strong> SMS delivery for one-time verification codes and staff two-factor authentication.</li>
                <li><strong>Sentry:</strong> Application diagnostics and crash reporting with strict client and server-side personal data scrubbers.</li>
                <li><strong>Expo (EAS):</strong> Mobile application compilation, binary delivery, and push notification routing via Apple APNs and Google FCM.</li>
                <li><strong>postcodes.io:</strong> Geographic resolution of UK postcodes for clinic proximity and mobile van coverage calculation (no personal patient identifiers transmitted).</li>
                <li><strong>Mapbox:</strong> Road network routing and estimated arrival calculations for mobile dental van visits.</li>
              </ul>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">5. Retention Periods</h2>
              <p className="mt-3 text-sm">
                In compliance with GDC Standards and the NHS Records Management Code of Practice:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Adult Patients:</strong> Clinical notes, odontograms, radiographs, and prescriptions are retained for a minimum of <strong>11 years</strong> after your last treatment.</li>
                <li><strong>Children & Young Persons:</strong> Records are retained until the patient's 25th birthday, or 11 years after the last treatment (whichever is longer).</li>
                <li><strong>Financial & Transaction Records:</strong> Invoices and transaction logs are held for 6 years in accordance with UK statutory tax requirements.</li>
              </ul>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">6. Your Rights</h2>
              <p className="mt-3 text-sm">
                You have statutory rights under UK data protection law:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Right of Access:</strong> You can request a copy of your personal and clinical records (Subject Access Request) free of charge.</li>
                <li><strong>Right to Rectification:</strong> You can ask us to correct inaccurate contact details or clinical records.</li>
                <li><strong>Right to Erasure:</strong> You can request account closure and deletion of non-clinical data. (Note: Statutory regulations require clinical records to be retained for the minimum 11-year retention period).</li>
                <li><strong>Complaints:</strong> If you are unhappy with how we have handled your data, you can contact our DPO at <a href="mailto:dpo@pavdental.com" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">dpo@pavdental.com</a> or lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">ico.org.uk</a>.</li>
              </ul>
            </section>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
