import { createFileRoute } from "@tanstack/react-router";
import { ContentPageBody } from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () => seoHead("/privacy-policy"),
  component: PrivacyPolicyPage,
});

const LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <ContentPageBody
        eyebrow="Working Draft • Pending Legal Review"
        title="Patient Privacy Notice"
        subtitle="Last updated: 27 October 2026 • Working Compliance Draft (LG-01/LG-02)"
        notice={
          <>
            <strong className="font-medium text-fg">Pre-Launch Notice:</strong> This privacy notice
            accurately reflects the technical architecture, sub-processors, and data handling of the
            Pav Dental software platform. It is currently undergoing formal legal, DPO, and clinical
            lead review (LG-01) prior to full launch.
          </>
        }
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">1. Data Controller Information</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              Pav Dental (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller
              responsible for your personal information.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Practice Address:</strong> 786 Leeds Road,
                Bradford, BD3 9TY, United Kingdom
              </li>
              <li>
                <strong className="font-medium text-fg">Telephone:</strong> 0800 1938 786 / +44 7311
                871456
              </li>
              <li>
                <strong className="font-medium text-fg">Email:</strong>{" "}
                <a href="mailto:hello@pavdental.com" className={LINK_CLASS}>
                  hello@pavdental.com
                </a>
              </li>
              <li>
                <strong className="font-medium text-fg">Data Protection Officer (DPO):</strong>{" "}
                <a href="mailto:dpo@pavdental.com" className={LINK_CLASS}>
                  dpo@pavdental.com
                </a>
              </li>
              <li>
                <strong className="font-medium text-fg">Clinical Lead:</strong> Dr Hassan Bhojani
                (GDC #262970)
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">2. Information We Collect</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              To provide safe, comprehensive dental treatment and appointment scheduling, we process
              the following categories of information:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-label text-fg">Personal &amp; Contact Details</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  Full name, date of birth, biological sex, contact address, email address, mobile
                  telephone number, and emergency contact details.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">Special Category Health &amp; Clinical Data</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  Medical history (medications, allergies, systemic conditions), dental charts
                  (odontograms), treatment plans, clinical notes, intraoral photographs, digital
                  radiographs (X-rays), and signed prescriptions.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">Dependants</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  Details of children under 16 booked by their parent or legal guardian for
                  paediatric dental care.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">Payment &amp; Transaction Data</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  Payment card tokens, transaction amounts, and deposit receipts. Full payment card
                  numbers are processed directly by our PCI-DSS Level 1 payment processor (Stripe)
                  and are never stored on our servers.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">3. Lawful Basis for Processing</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              Under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act
              2018:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">
                  Contractual Necessity (Article 6(1)(b)):
                </strong>{" "}
                To manage your patient account, schedule appointments, process deposits, and
                communicate essential appointment alerts.
              </li>
              <li>
                <strong className="font-medium text-fg">
                  Provision of Healthcare &amp; Medical Diagnosis (Article 9(2)(h)):
                </strong>{" "}
                To assess oral health, formulate treatment plans, take radiographs, and deliver
                dental care.
              </li>
              <li>
                <strong className="font-medium text-fg">Legal Obligation (Article 6(1)(c)):</strong>{" "}
                To maintain clinical dental records in compliance with General Dental Council (GDC)
                standards and healthcare record-keeping regulations.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">
              4. Third-Party Technical Processors &amp; Infrastructure
            </h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              We never sell, rent, or trade your personal data. We utilize third-party technology
              providers to host, secure, and deliver the service. Formal Data Processing Agreements
              (DPAs) and standard contractual clauses are managed as part of pre-launch compliance
              onboarding (tracked in our DPA Register):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Render:</strong> Cloud application server
                hosting and background worker execution (API runtime).
              </li>
              <li>
                <strong className="font-medium text-fg">Supabase:</strong> Managed PostgreSQL
                database with PostGIS extensions for encrypted patient records, appointments,
                clinical charts, and audit logs.
              </li>
              <li>
                <strong className="font-medium text-fg">Upstash:</strong> Managed serverless Redis
                for rate limiting, short-lived session security, and queue coordination.
              </li>
              <li>
                <strong className="font-medium text-fg">Vercel:</strong> Static asset hosting and
                serverless web runtime for the marketing site and staff admin dashboard.
              </li>
              <li>
                <strong className="font-medium text-fg">Stripe:</strong> Payment processing, deposit
                pre-authorisations, and card vaulting (PCI-DSS Level 1 compliant).
              </li>
              <li>
                <strong className="font-medium text-fg">Daily.co:</strong> Encrypted WebRTC virtual
                dental consultation video streams.
              </li>
              <li>
                <strong className="font-medium text-fg">Postmark:</strong> Transactional email
                delivery for administrative alerts (zero diagnostic or clinical information).
              </li>
              <li>
                <strong className="font-medium text-fg">Twilio:</strong> SMS delivery for one-time
                verification codes and staff two-factor authentication.
              </li>
              <li>
                <strong className="font-medium text-fg">Sentry:</strong> Application diagnostics and
                crash reporting with strict client and server-side personal data scrubbers.
              </li>
              <li>
                <strong className="font-medium text-fg">Expo (EAS):</strong> Mobile application
                compilation, binary delivery, and push notification routing via Apple APNs and
                Google FCM.
              </li>
              <li>
                <strong className="font-medium text-fg">postcodes.io:</strong> Geographic resolution
                of UK postcodes for clinic proximity and mobile van coverage calculation (no
                personal patient identifiers transmitted).
              </li>
              <li>
                <strong className="font-medium text-fg">Mapbox:</strong> Road network routing and
                estimated arrival calculations for mobile dental van visits.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">5. Retention Periods</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              In compliance with GDC Standards and the NHS Records Management Code of Practice:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Adult Patients:</strong> Clinical notes,
                odontograms, radiographs, and prescriptions are retained for a minimum of{" "}
                <strong className="font-medium text-fg">11 years</strong> after your last treatment.
              </li>
              <li>
                <strong className="font-medium text-fg">Children &amp; Young Persons:</strong>{" "}
                Records are retained until the patient&apos;s 25th birthday, or 11 years after the
                last treatment (whichever is longer).
              </li>
              <li>
                <strong className="font-medium text-fg">
                  Financial &amp; Transaction Records:
                </strong>{" "}
                Invoices and transaction logs are held for 6 years in accordance with UK statutory
                tax requirements.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">6. Your Rights</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              You have statutory rights under UK data protection law:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Right of Access:</strong> You can request a
                copy of your personal and clinical records (Subject Access Request) free of charge.
              </li>
              <li>
                <strong className="font-medium text-fg">Right to Rectification:</strong> You can ask
                us to correct inaccurate contact details or clinical records.
              </li>
              <li>
                <strong className="font-medium text-fg">Right to Erasure:</strong> You can request
                account closure and deletion of non-clinical data. (Note: Statutory regulations
                require clinical records to be retained for the minimum 11-year retention period).
              </li>
              <li>
                <strong className="font-medium text-fg">Complaints:</strong> If you are unhappy with
                how we have handled your data, you can contact our DPO at{" "}
                <a href="mailto:dpo@pavdental.com" className={LINK_CLASS}>
                  dpo@pavdental.com
                </a>{" "}
                or lodge a complaint with the UK Information Commissioner&apos;s Office (ICO) at{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  ico.org.uk
                </a>
                .
              </li>
            </ul>
          </section>
        </div>
      </ContentPageBody>

      <Footer />
    </main>
  );
}
