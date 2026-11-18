import { createFileRoute } from "@tanstack/react-router";
import { ContentPageBody } from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms-and-condition")({
  head: () => seoHead("/terms-and-condition"),
  component: TermsPage,
});

const LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <ContentPageBody
        eyebrow="Working Draft • Pending Legal Review"
        title="Terms of Service"
        subtitle="Last updated: 27 October 2026 • Working Compliance Draft (LG-08)"
        notice={
          <>
            <strong className="font-medium text-fg">Pre-Launch Notice:</strong> These terms govern
            the booking, deposits, cancellation policy, and clinical consultations of the Pav Dental
            platform. They represent a working draft undergoing formal legal review (LG-08) prior to
            full launch.
          </>
        }
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">1. About Pav Dental</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              These terms govern your use of the Pav Dental website, mobile application, and dental
              healthcare services provided by Pav Dental:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Practice Address:</strong> 786 Leeds Road,
                Bradford, BD3 9TY
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
                <strong className="font-medium text-fg">Clinical Lead:</strong> Dr Hassan Bhojani
                (GDC #262970)
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">2. Bookings, Deposits &amp; Cancellations</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-label text-fg">2.1 Booking Deposits</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  To secure an appointment slot with our dentists or mobile dental units, a booking
                  deposit is payable at the time of reservation. The deposit is credited toward the
                  total fee of your planned treatment.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">2.2 Patient Cancellation Policy</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  You may reschedule or cancel your appointment without penalty if you provide at
                  least 24 hours&apos; notice prior to your scheduled time. Deposits for
                  cancellations made with less than 24 hours&apos; notice may be retained to cover
                  clinician scheduling costs.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">2.3 Mobile Dental Van Dispatches</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  If you request a mobile dental van visit, cancellations made prior to the van
                  being en-route will receive a full refund. Once the mobile unit is en-route or
                  arrives on site, the deposit is retained as a call-out fee to cover vehicle
                  dispatch and travel costs.
                </p>
              </div>
              <div>
                <h3 className="text-label text-fg">2.4 Practice Cancellations</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  If Pav Dental must reschedule or cancel your appointment due to unforeseen
                  clinician illness or clinical emergency, you will receive prompt notice and the
                  option of an immediate priority reschedule or a 100% full refund of your deposit.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">3. Clinical Care &amp; Treatment Plans</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              All dental treatments are performed exclusively by registered dental practitioners
              licensed by the General Dental Council (GDC).
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body leading-relaxed text-muted">
              <li>
                <strong className="font-medium text-fg">Estimates &amp; Treatment Plans:</strong>{" "}
                Following your examination, your dentist will provide a clear, itemised treatment
                plan explaining clinical findings, proposed procedures, risks, benefits, and costs.
              </li>
              <li>
                <strong className="font-medium text-fg">Informed Consent:</strong> Digital
                acknowledgement in our mobile app confirms that you have reviewed your plan. Formal
                clinical consent to treatment is taken in person prior to the start of any dental
                procedure.
              </li>
              <li>
                <strong className="font-medium text-fg">Prescriptions:</strong> Private
                prescriptions issued through our service are clinically assessed and signed by
                authorised prescribers in compliance with UK prescribing laws.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">4. Patient Responsibilities</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              To enable safe clinical practice, you agree to:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body leading-relaxed text-muted">
              <li>
                Provide accurate, complete medical and medication histories, including updates on
                allergies or health changes.
              </li>
              <li>
                Follow post-treatment care instructions and aftercare guidance provided by your
                treating dentist.
              </li>
              <li>
                Treat our dental nurses, clinicians, drivers, and reception team with respect.
                Abusive or aggressive behaviour will not be tolerated and may result in immediate
                withdrawal of care.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">5. Contact &amp; Complaints</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              We take patient satisfaction seriously. For enquiries, feedback, or complaints
              regarding our services, please view our{" "}
              <a href="/complaints-policy" className={LINK_CLASS}>
                Complaints Procedure
              </a>{" "}
              or email us at{" "}
              <a href="mailto:hello@pavdental.com" className={LINK_CLASS}>
                hello@pavdental.com
              </a>
              .
            </p>
          </section>
        </div>
      </ContentPageBody>

      <Footer />
    </main>
  );
}
