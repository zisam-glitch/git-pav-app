import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";

export const Route = createFileRoute("/complaints-policy")({
  head: () => seoHead("/complaints-policy"),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[72ch]">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full   bg-[#faf6f0] px-3.5 py-1 text-xs font-semibold text-[#925a27] uppercase">
              Clinical Governance
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-[#2a1c12] sm:text-4xl">
              Complaints Procedure
            </h1>
            <p className="mt-2 text-sm text-[#6b5848]">
              Our commitment to fair, transparent, and prompt resolution
            </p>
          </div>

          <div className="space-y-8 text-[#4a3b2f] leading-relaxed">
            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">1. Our Commitment</h2>
              <p className="mt-3 text-sm">
                At Pav Dental, we aim to provide high-quality, patient-centred dental care. If any aspect of our service does not meet your expectations, we take your feedback seriously and operate a transparent complaints procedure compliant with General Dental Council (GDC) ethical principles.
              </p>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">2. How to Raise a Concern or Complaint</h2>
              <p className="mt-3 text-sm">
                You can raise a complaint in person, by phone, or in writing. Please direct your concern to our Practice Manager:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li><strong>By Email:</strong> <a href="mailto:hello@pavdental.com" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">hello@pavdental.com</a> (subject: "Formal Complaint - Attention: Practice Manager")</li>
                <li><strong>By Phone:</strong> 0800 1938 786 / +44 7311 871456</li>
                <li><strong>By Post:</strong> Practice Manager, Pav Dental, 786 Leeds Road, Bradford, BD3 9TY</li>
              </ul>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">3. Timescales & Investigation Process</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="border-l-4  pl-4">
                  <h3 className="font-semibold text-[#2a1c12]">Step 1: Acknowledgment (Within 3 Working Days)</h3>
                  <p className="mt-1 text-[#6b5848]">
                    We will acknowledge receipt of your complaint in writing within three working days and confirm who is investigating the matter.
                  </p>
                </div>

                <div className="border-l-4  pl-4">
                  <h3 className="font-semibold text-[#2a1c12]">Step 2: Investigation & Review (Within 10 Working Days)</h3>
                  <p className="mt-1 text-[#6b5848]">
                    Our Clinical Lead (Dr Hassan Bhojani, GDC #262970) or Practice Manager will thoroughly examine the relevant clinical records, consult the treating team, and conduct a detailed review.
                  </p>
                </div>

                <div className="border-l-4  pl-4">
                  <h3 className="font-semibold text-[#2a1c12]">Step 3: Comprehensive Written Response</h3>
                  <p className="mt-1 text-[#6b5848]">
                    You will receive a full written explanation of the findings, any corrective clinical actions taken, and proposals for resolution. If a complex clinical investigation requires more time, we will provide regular updates.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl   bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-[#2a1c12]">4. External Escalation</h2>
              <p className="mt-3 text-sm">
                If you are dissatisfied with the outcome of our internal investigation, you have the right to escalate your complaint to independent external bodies:
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-[#2a1c12]">Dental Complaints Service (Private Treatment)</h3>
                  <p className="text-[#6b5848]">
                    An independent service funded by the General Dental Council that assists patients and dental professionals to reach an amicable resolution:
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-[#6b5848]">
                    <li>Website: <a href="https://dcs.gdc-uk.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">dcs.gdc-uk.org</a></li>
                    <li>Telephone: 020 8253 0800</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-[#2a1c12]">General Dental Council (GDC)</h3>
                  <p className="text-[#6b5848]">
                    The statutory regulatory body responsible for regulating dental professionals across the United Kingdom:
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-[#6b5848]">
                    <li>Website: <a href="https://www.gdc-uk.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b] focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2 rounded-sm">www.gdc-uk.org</a></li>
                    <li>Address: 37 Wimpole Street, London, W1G 8DQ</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
