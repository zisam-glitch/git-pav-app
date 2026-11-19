import { createFileRoute } from "@tanstack/react-router";
import { ContentPageBody } from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/complaints-policy")({
  head: () => seoHead("/complaints-policy"),
  component: ComplaintsPage,
});

const LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

function ComplaintsPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <ContentPageBody
        eyebrow="Clinical Governance"
        title="Complaints Procedure"
        subtitle="Our commitment to fair, transparent, and prompt resolution"
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">1. Our Commitment</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              At Pav Dental, we aim to provide high-quality, patient-centred dental care. If any
              aspect of our service does not meet your expectations, we take your feedback seriously
              and operate a transparent complaints procedure compliant with General Dental Council
              (GDC) ethical principles.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">2. How to Raise a Concern or Complaint</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              You can raise a complaint in person, by phone, or in writing. Please direct your
              concern to our Practice Manager:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">By Email:</strong>{" "}
                <a href="mailto:hello@pavdental.com" className={LINK_CLASS}>
                  hello@pavdental.com
                </a>{" "}
                (subject: &quot;Formal Complaint - Attention: Practice Manager&quot;)
              </li>
              <li>
                <strong className="font-medium text-fg">By Phone:</strong> 0800 1938 786 / +44 7311
                871456
              </li>
              <li>
                <strong className="font-medium text-fg">By Post:</strong> Practice Manager, Pav
                Dental, 786 Leeds Road, Bradford, BD3 9TY
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">3. Timescales &amp; Investigation Process</h2>
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-terracotta pl-4">
                <h3 className="text-label text-fg">
                  Step 1: Acknowledgment (Within 3 Working Days)
                </h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  We will acknowledge receipt of your complaint in writing within three working days
                  and confirm who is investigating the matter.
                </p>
              </div>

              <div className="border-l-2 border-terracotta pl-4">
                <h3 className="text-label text-fg">
                  Step 2: Investigation &amp; Review (Within 10 Working Days)
                </h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  Our Clinical Lead (Dr Hassan Bhojani, GDC #262970) or Practice Manager will
                  thoroughly examine the relevant clinical records, consult the treating team, and
                  conduct a detailed review.
                </p>
              </div>

              <div className="border-l-2 border-terracotta pl-4">
                <h3 className="text-label text-fg">Step 3: Comprehensive Written Response</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  You will receive a full written explanation of the findings, any corrective
                  clinical actions taken, and proposals for resolution. If a complex clinical
                  investigation requires more time, we will provide regular updates.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">4. External Escalation</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              If you are dissatisfied with the outcome of our internal investigation, you have the
              right to escalate your complaint to independent external bodies:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-label text-fg">
                  Dental Complaints Service (Private Treatment)
                </h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  An independent service funded by the General Dental Council that assists patients
                  and dental professionals to reach an amicable resolution:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-body leading-relaxed text-muted">
                  <li>
                    Website:{" "}
                    <a
                      href="https://dcs.gdc-uk.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK_CLASS}
                    >
                      dcs.gdc-uk.org
                    </a>
                  </li>
                  <li>Telephone: 020 8253 0800</li>
                </ul>
              </div>

              <div>
                <h3 className="text-label text-fg">General Dental Council (GDC)</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  The statutory regulatory body responsible for regulating dental professionals
                  across the United Kingdom:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-body leading-relaxed text-muted">
                  <li>
                    Website:{" "}
                    <a
                      href="https://www.gdc-uk.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK_CLASS}
                    >
                      www.gdc-uk.org
                    </a>
                  </li>
                  <li>Address: 37 Wimpole Street, London, W1G 8DQ</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </ContentPageBody>

      <Footer />
    </main>
  );
}
