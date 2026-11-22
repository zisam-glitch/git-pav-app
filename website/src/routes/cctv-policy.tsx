import { createFileRoute } from "@tanstack/react-router";
import { Tile } from "@/components/hims";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentPage,
  LegalSection,
  LegalTable,
  type LegalTocItem,
} from "@/components/legal/legal-document-layout";
import { LIVE_PAGES } from "@/content/live-pages";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cctv-policy")({
  head: () => seoHead("/cctv-policy"),
  component: CctvPolicyPage,
});

const TOC: LegalTocItem[] = [
  { id: "overview", label: "Overview" },
  { id: "at-a-glance", label: "At a Glance" },
  { id: "policy-points", label: "Full CCTV Policy", meta: "9 points" },
  { id: "subject-access", label: "Subject Access & Contact" },
];

function CctvPolicyPage() {
  const page = LIVE_PAGES["/cctv-policy"];
  const introBlock = page.blocks.find((block) => block.kind === "paragraph");
  const listBlock = page.blocks.find((block) => block.kind === "list");
  const points =
    listBlock?.kind === "list"
      ? listBlock.items.map((item) => String(item))
      : [];

  return (
    <LegalDocumentPage
      currentPath="/cctv-policy"
      category="Clinic Safety & Governance"
      title={page.heading}
      subtitle="How closed-circuit television is operated across Pav Dental reception areas and corridors to protect patients and staff."
      metaItems={[
        "Video only (no audio)",
        "30-day rolling retention",
        "Free SAR access under UK GDPR",
        "ICO CCTV Guidelines",
      ]}
      toc={TOC}
    >
      <LegalSection id="overview" number="01" title="Overview">
        {introBlock?.kind === "paragraph" ? <p>{introBlock.text}</p> : null}
      </LegalSection>

      <LegalSection id="at-a-glance" number="02" title="At a Glance">
        <LegalTable
          headers={["Policy Area", "Pav Dental Standard"]}
          minWidthClass="min-w-[26rem]"
          rows={[
            ["Camera Locations", "Reception areas and corridors only (clearly signposted)"],
            ["Recording Mode", "Images only — CCTV does not record audio"],
            ["Storage & Retention", "Stored on password-protected clinic hard drives for 30 days before being wiped"],
            ["Authorised Access", "Restricted to the practice manager and practice owners"],
            [
              "Subject Access Requests",
              "Provided free of charge in accordance with UK GDPR upon written request with date/time details",
            ],
            ["Regulatory Guidance", "Information Commissioner's Office (ICO) CCTV guidelines"],
          ]}
        />
      </LegalSection>

      <LegalSection id="policy-points" number="03" title="Full CCTV Policy">
        <ol className="space-y-3">
          {points.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-4 rounded-xl border border-border/70 bg-tile-cream px-5 py-4"
            >
              <span className="mt-0.5 shrink-0 font-mono text-caption font-medium text-terracotta">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 text-body leading-[1.68] text-fg">{point}</span>
            </li>
          ))}
        </ol>
      </LegalSection>

      <LegalSection id="subject-access" number="04" title="Subject Access & Contact">
        <Tile tone="cream" className="border border-border border-l-2 border-l-terracotta p-6">
          <p className="text-body leading-relaxed text-fg">
            To submit a written Data Protection request for CCTV footage of yourself — provided free
            of charge under UK GDPR — email{" "}
            <a href="mailto:dpo@pavdental.com" className={LEGAL_LINK_CLASS}>
              dpo@pavdental.com
            </a>{" "}
            or{" "}
            <a href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
              hello@pavdental.com
            </a>{" "}
            with your full name, the date and approximate time of your visit, and information to
            help us identify you.
          </p>
        </Tile>
      </LegalSection>
    </LegalDocumentPage>
  );
}
