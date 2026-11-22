import { createFileRoute } from "@tanstack/react-router";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentPage,
  LegalSection,
  LegalTable,
  type LegalTocItem,
} from "@/components/legal/legal-document-layout";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms-and-condition")({
  head: () => seoHead("/terms-and-condition"),
  component: TermsPage,
});

const TOC: LegalTocItem[] = [
  { id: "about-pav-dental", label: "About Pav Dental" },
  { id: "deposits-cancellations", label: "Deposits & Cancellations" },
  { id: "clinical-care", label: "Clinical Care & Plans" },
  { id: "patient-responsibilities", label: "Patient Responsibilities" },
  { id: "contact-complaints", label: "Contact & Complaints" },
];

function TermsPage() {
  return (
    <LegalDocumentPage
      currentPath="/terms-and-condition"
      category="Working Draft · Pending Legal Review"
      title="Terms of"
      titleAccent="Service"
      subtitle="Clear terms governing reservations, deposits, cancellations, mobile dental van dispatches, and clinical consultations across Pav Dental."
      metaItems={["Last updated: 27 October 2026", "Working Compliance Draft (LG-08)"]}
      notice={
        <>
          <strong className="font-medium text-fg">Pre-Launch Notice:</strong> These terms govern the
          booking, deposits, cancellation policy, and clinical consultations of the Pav Dental
          platform. They represent a working draft undergoing formal legal review (LG-08) prior to
          full launch.
        </>
      }
      toc={TOC}
    >
      <LegalSection id="about-pav-dental" number="01" title="About Pav Dental">
        <p>
          These terms govern your use of the Pav Dental website, mobile application, and dental
          healthcare services provided by Pav Dental:
        </p>
        <LegalTable
          headers={["Detail", "Practice Information"]}
          minWidthClass="min-w-[24rem]"
          rows={[
            ["Practice Address", "786 Leeds Road, Bradford, BD3 9TY"],
            ["Telephone", "0800 1938 786 / +44 7311 871456"],
            [
              "Email",
              <a key="email" href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
                hello@pavdental.com
              </a>,
            ],
            ["Clinical Lead", "Dr Hassan Bhojani (GDC #262970)"],
          ]}
        />
      </LegalSection>

      <LegalSection
        id="deposits-cancellations"
        number="02"
        title="Bookings, Deposits & Cancellations"
      >
        <LegalTable
          headers={["Scenario", "Policy Summary"]}
          rows={[
            [
              "2.1 Booking Deposits",
              "Payable at the time of reservation and credited toward the total fee of your planned treatment.",
            ],
            [
              "2.2 Patient Cancellation Policy",
              "Free reschedule or cancellation with at least 24 hours' notice; under 24 hours' notice, deposits may be retained to cover clinician scheduling costs.",
            ],
            [
              "2.3 Mobile Dental Van Dispatches",
              "Full refund prior to the van being en-route; once en-route or on site, the deposit is retained as a call-out fee.",
            ],
            [
              "2.4 Practice Cancellations",
              "Prompt notice plus your choice of an immediate priority reschedule or a 100% full refund of your deposit.",
            ],
          ]}
        />

        <div className="mt-6 space-y-5">
          <div>
            <h3 className="text-label text-fg">2.1 Booking Deposits</h3>
            <p className="mt-1.5">
              To secure an appointment slot with our dentists or mobile dental units, a booking
              deposit is payable at the time of reservation. The deposit is credited toward the
              total fee of your planned treatment.
            </p>
          </div>
          <div>
            <h3 className="text-label text-fg">2.2 Patient Cancellation Policy</h3>
            <p className="mt-1.5">
              You may reschedule or cancel your appointment without penalty if you provide at least
              24 hours&apos; notice prior to your scheduled time. Deposits for cancellations made
              with less than 24 hours&apos; notice may be retained to cover clinician scheduling
              costs.
            </p>
          </div>
          <div>
            <h3 className="text-label text-fg">2.3 Mobile Dental Van Dispatches</h3>
            <p className="mt-1.5">
              If you request a mobile dental van visit, cancellations made prior to the van being
              en-route will receive a full refund. Once the mobile unit is en-route or arrives on
              site, the deposit is retained as a call-out fee to cover vehicle dispatch and travel
              costs.
            </p>
          </div>
          <div>
            <h3 className="text-label text-fg">2.4 Practice Cancellations</h3>
            <p className="mt-1.5">
              If Pav Dental must reschedule or cancel your appointment due to unforeseen clinician
              illness or clinical emergency, you will receive prompt notice and the option of an
              immediate priority reschedule or a 100% full refund of your deposit.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="clinical-care" number="03" title="Clinical Care & Treatment Plans">
        <p>
          All dental treatments are performed exclusively by registered dental practitioners
          licensed by the General Dental Council (GDC).
        </p>
        <ul className="list-disc space-y-2.5 pl-5 marker:text-terracotta">
          <li>
            <strong className="font-medium text-fg">Estimates &amp; Treatment Plans:</strong>{" "}
            Following your examination, your dentist will provide a clear, itemised treatment plan
            explaining clinical findings, proposed procedures, risks, benefits, and costs.
          </li>
          <li>
            <strong className="font-medium text-fg">Informed Consent:</strong> Digital
            acknowledgement in our mobile app confirms that you have reviewed your plan. Formal
            clinical consent to treatment is taken in person prior to the start of any dental
            procedure.
          </li>
          <li>
            <strong className="font-medium text-fg">Prescriptions:</strong> Private prescriptions
            issued through our service are clinically assessed and signed by authorised prescribers
            in compliance with UK prescribing laws.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="patient-responsibilities" number="04" title="Patient Responsibilities">
        <p>To enable safe clinical practice, you agree to:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-terracotta">
          <li>
            Provide accurate, complete medical and medication histories, including updates on
            allergies or health changes.
          </li>
          <li>
            Follow post-treatment care instructions and aftercare guidance provided by your treating
            dentist.
          </li>
          <li>
            Treat our dental nurses, clinicians, drivers, and reception team with respect. Abusive or
            aggressive behaviour will not be tolerated and may result in immediate withdrawal of
            care.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-complaints" number="05" title="Contact & Complaints">
        <p>
          We take patient satisfaction seriously. For enquiries, feedback, or complaints regarding
          our services, please view our{" "}
          <a href="/complaints-policy" className={LEGAL_LINK_CLASS}>
            Complaints Procedure
          </a>{" "}
          or email us at{" "}
          <a href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
            hello@pavdental.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
