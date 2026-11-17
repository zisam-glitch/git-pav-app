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
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Working Draft • Pending Legal Review
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Patient Privacy Notice
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Last updated: 27 October 2026 • Working Compliance Draft (LG-01/LG-02)
            </p>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 mb-8 leading-relaxed">
            <strong>Pre-Launch Notice:</strong> This privacy notice accurately reflects the technical architecture, sub-processors, and data handling of the Pav Dental software platform. It is currently undergoing formal legal, DPO, and clinical lead review (LG-01) prior to full launch.
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">1. Data Controller Information</h2>
              <p className="mt-3 text-sm">
                Pav Dental ("we", "us", "our") is the data controller responsible for your personal information.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li><strong>Practice Address:</strong> 786 Leeds Road, Bradford, BD3 9TY, United Kingdom</li>
                <li><strong>Telephone:</strong> 0800 1938 786 / +44 7311 871456</li>
                <li><strong>Email:</strong> <a href="mailto:hello@pavdental.com" className="text-emerald-700 underline">hello@pavdental.com</a></li>
                <li><strong>Data Protection Officer (DPO):</strong> <a href="mailto:dpo@pavdental.com" className="text-emerald-700 underline">dpo@pavdental.com</a></li>
                <li><strong>Clinical Lead:</strong> Dr Hassan Bhojani (GDC #262970)</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">2. Information We Collect</h2>
              <p className="mt-3 text-sm">
                To provide safe, comprehensive dental treatment and appointment scheduling, we process the following categories of information:
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-slate-900">Personal & Contact Details</h3>
                  <p className="text-slate-600">Full name, date of birth, biological sex, contact address, email address, mobile telephone number, and emergency contact details.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Special Category Health & Clinical Data</h3>
                  <p className="text-slate-600">Medical history (medications, allergies, systemic conditions), dental charts (odontograms), treatment plans, clinical notes, intraoral photographs, digital radiographs (X-rays), and signed prescriptions.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Dependants</h3>
                  <p className="text-slate-600">Details of children under 16 booked by their parent or legal guardian for paediatric dental care.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payment & Transaction Data</h3>
                  <p className="text-slate-600">Payment card tokens, transaction amounts, and deposit receipts. Full payment card numbers are processed directly by our PCI-DSS Level 1 payment processor (Stripe) and are never stored on our servers.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">3. Lawful Basis for Processing</h2>
              <p className="mt-3 text-sm">
                Under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Contractual Necessity (Article 6(1)(b)):</strong> To manage your patient account, schedule appointments, process deposits, and communicate essential appointment alerts.</li>
                <li><strong>Provision of Healthcare & Medical Diagnosis (Article 9(2)(h)):</strong> To assess oral health, formulate treatment plans, take radiographs, and deliver dental care.</li>
                <li><strong>Legal Obligation (Article 6(1)(c)):</strong> To maintain clinical dental records in compliance with General Dental Council (GDC) standards and healthcare record-keeping regulations.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">4. Third-Party Technical Processors & Infrastructure</h2>
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

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">5. Retention Periods</h2>
              <p className="mt-3 text-sm">
                In compliance with GDC Standards and the NHS Records Management Code of Practice:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Adult Patients:</strong> Clinical notes, odontograms, radiographs, and prescriptions are retained for a minimum of <strong>11 years</strong> after your last treatment.</li>
                <li><strong>Children & Young Persons:</strong> Records are retained until the patient's 25th birthday, or 11 years after the last treatment (whichever is longer).</li>
                <li><strong>Financial & Transaction Records:</strong> Invoices and transaction logs are held for 6 years in accordance with UK statutory tax requirements.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">6. Your Rights</h2>
              <p className="mt-3 text-sm">
                You have statutory rights under UK data protection law:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Right of Access:</strong> You can request a copy of your personal and clinical records (Subject Access Request) free of charge.</li>
                <li><strong>Right to Rectification:</strong> You can ask us to correct inaccurate contact details or clinical records.</li>
                <li><strong>Right to Erasure:</strong> You can request account closure and deletion of non-clinical data. (Note: Statutory regulations require clinical records to be retained for the minimum 11-year retention period).</li>
                <li><strong>Complaints:</strong> If you are unhappy with how we have handled your data, you can contact our DPO at <a href="mailto:dpo@pavdental.com" className="text-emerald-700 underline">dpo@pavdental.com</a> or lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">ico.org.uk</a>.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
