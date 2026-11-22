import { createFileRoute } from "@tanstack/react-router";
import { Tile } from "@/components/hims";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentPage,
  LegalSection,
  LegalTable,
  type LegalTocItem,
} from "@/components/legal/legal-document-layout";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/complaints-policy")({
  head: () => seoHead("/complaints-policy"),
  component: ComplaintsPage,
});

const TOC: LegalTocItem[] = [
  { id: "our-commitment", label: "Our Commitment" },
  { id: "raise-a-concern", label: "How to Raise a Concern" },
  { id: "timescales-process", label: "Timescales & Investigation" },
  { id: "external-escalation", label: "External Escalation" },
];

function ComplaintsPage() {
  return (
    <LegalDocumentPage
      currentPath="/complaints-policy"
      category="Clinical Governance"
      title="Complaints"
      titleAccent="Procedure"
      subtitle="Our commitment to fair, transparent, and prompt resolution compliant with General Dental Council (GDC) ethical principles."
      metaItems={[
        "Acknowledgment within 3 working days",
        "Review within 10 working days",
        "GDC Standards Aligned",
      ]}
      toc={TOC}
    >
      <LegalSection id="our-commitment" number="01" title="Our Commitment">
        <p>
          At Pav Dental, we aim to provide high-quality, patient-centred dental care. If any aspect
          of our service does not meet your expectations, we take your feedback seriously and
          operate a transparent complaints procedure compliant with General Dental Council (GDC)
          ethical principles.
        </p>
      </LegalSection>

      <LegalSection id="raise-a-concern" number="02" title="How to Raise a Concern or Complaint">
        <p>
          You can raise a complaint in person, by phone, or in writing. Please direct your concern
          to our Practice Manager:
        </p>
        <LegalTable
          headers={["Channel", "How to Reach Our Practice Manager"]}
          minWidthClass="min-w-[24rem]"
          rows={[
            [
              "By Email",
              <>
                <a href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
                  hello@pavdental.com
                </a>{" "}
                (subject: &quot;Formal Complaint - Attention: Practice Manager&quot;)
              </>,
            ],
            ["By Phone", "0800 1938 786 / +44 7311 871456"],
            ["By Post", "Practice Manager, Pav Dental, 786 Leeds Road, Bradford, BD3 9TY"],
          ]}
        />
      </LegalSection>

      <LegalSection
        id="timescales-process"
        number="03"
        title="Timescales & Investigation Process"
      >
        <LegalTable
          headers={["Stage", "Target Timescale", "What Happens"]}
          rows={[
            [
              "Step 1: Acknowledgment",
              "Within 3 Working Days",
              "We will acknowledge receipt of your complaint in writing within three working days and confirm who is investigating the matter.",
            ],
            [
              "Step 2: Investigation & Review",
              "Within 10 Working Days",
              "Our Clinical Lead (Dr Hassan Bhojani, GDC #262970) or Practice Manager will thoroughly examine the relevant clinical records, consult the treating team, and conduct a detailed review.",
            ],
            [
              "Step 3: Comprehensive Written Response",
              "Upon Completion",
              "You will receive a full written explanation of the findings, any corrective clinical actions taken, and proposals for resolution. If a complex clinical investigation requires more time, we will provide regular updates.",
            ],
          ]}
        />
      </LegalSection>

      <LegalSection id="external-escalation" number="04" title="External Escalation">
        <p>
          If you are dissatisfied with the outcome of our internal investigation, you have the right
          to escalate your complaint to independent external bodies:
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Tile tone="cream" className="min-w-0 border border-border/70 p-6">
            <h3 className="text-label text-fg">Dental Complaints Service (Private Treatment)</h3>
            <p className="mt-2 text-small leading-relaxed text-muted">
              An independent service funded by the General Dental Council that assists patients and
              dental professionals to reach an amicable resolution:
            </p>
            <ul className="mt-3 space-y-1.5 text-small text-fg">
              <li>
                Website:{" "}
                <a
                  href="https://dcs.gdc-uk.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LEGAL_LINK_CLASS}
                >
                  dcs.gdc-uk.org
                </a>
              </li>
              <li>Telephone: 020 8253 0800</li>
            </ul>
          </Tile>

          <Tile tone="cream" className="min-w-0 border border-border/70 p-6">
            <h3 className="text-label text-fg">General Dental Council (GDC)</h3>
            <p className="mt-2 text-small leading-relaxed text-muted">
              The statutory regulatory body responsible for regulating dental professionals across
              the United Kingdom:
            </p>
            <ul className="mt-3 space-y-1.5 text-small text-fg">
              <li>
                Website:{" "}
                <a
                  href="https://www.gdc-uk.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LEGAL_LINK_CLASS}
                >
                  www.gdc-uk.org
                </a>
              </li>
              <li>Address: 37 Wimpole Street, London, W1G 8DQ</li>
            </ul>
          </Tile>
        </div>
      </LegalSection>
    </LegalDocumentPage>
  );
}
