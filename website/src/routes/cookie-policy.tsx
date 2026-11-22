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

export const Route = createFileRoute("/cookie-policy")({
  head: () => seoHead("/cookie-policy"),
  component: CookiePolicyPage,
});

const TOC: LegalTocItem[] = [
  { id: "what-are-cookies", label: "What Are Cookies?" },
  { id: "types-of-cookies", label: "Types of Cookies We Use" },
  { id: "managing-preferences", label: "Managing Your Preferences" },
  { id: "contact-us", label: "Contact Us" },
];

function CookiePolicyPage() {
  return (
    <LegalDocumentPage
      currentPath="/cookie-policy"
      category="Privacy & Preferences"
      title="Cookie"
      titleAccent="Policy"
      subtitle="Transparent information about the essential and optional analytics cookies used on pavdental.com and how to manage your consent."
      metaItems={[
        "Last updated: 26 October 2026",
        "Effective date: 26 October 2026",
        "UK PECR & GDPR Compliant",
      ]}
      toc={TOC}
    >
      <LegalSection id="what-are-cookies" number="01" title="What Are Cookies?">
        <p>
          Cookies are small text files placed on your computer or mobile device when you visit our
          website. They help the site remember your preferences, keep you signed in, support
          shopping cart functionality, and help us understand website performance.
        </p>
      </LegalSection>

      <LegalSection id="types-of-cookies" number="02" title="Types of Cookies We Use">
        <LegalTable
          headers={["Cookie Category", "Status", "Purpose & Provider"]}
          rows={[
            [
              "Strictly Necessary Cookies",
              <span
                key="always"
                className="inline-flex rounded-pill border border-border bg-cream px-2.5 py-0.5 text-caption font-medium text-fg"
              >
                Always Active
              </span>,
              "Essential for the operation of our website, security tokens, login sessions, and shopping cart persistence during checkout. They cannot be switched off in our systems.",
            ],
            [
              "Analytics & Performance Cookies",
              <span
                key="optional"
                className="inline-flex rounded-pill border border-border bg-white px-2.5 py-0.5 text-caption font-medium text-terracotta"
              >
                Optional
              </span>,
              <>
                We use Google Analytics 4 (Measurement ID:{" "}
                <code className="rounded bg-cream px-1.5 py-0.5 text-small text-fg">
                  G-KZVKDLY449
                </code>
                ) to collect aggregated, anonymised statistics on site usage, page visits, and
                navigation paths.
              </>,
            ],
          ]}
        />

        <Tile tone="cream" className="mt-5 border border-border border-l-2 border-l-terracotta p-5">
          <p className="text-body font-medium leading-relaxed text-fg">
            In compliance with UK PECR and GDPR, Google Analytics cookies are blocked until you
            grant explicit consent via our cookie banner.
          </p>
        </Tile>
      </LegalSection>

      <LegalSection id="managing-preferences" number="03" title="Managing Your Preferences">
        <p>
          You can change or withdraw your cookie consent at any time by clearing your browser
          cookies and reloading the page, which will re-trigger the cookie banner, or by adjusting
          your web browser settings to reject non-essential cookies.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-terracotta">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Google Chrome Cookie Settings
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Apple Safari Cookie Settings
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
              target="_blank"
              rel="noopener noreferrer"
              className={LEGAL_LINK_CLASS}
            >
              Mozilla Firefox Cookie Settings
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-us" number="04" title="Contact Us">
        <p>
          If you have questions about how we use cookies, please contact us at{" "}
          <a href="mailto:hello@pavdental.com" className={LEGAL_LINK_CLASS}>
            hello@pavdental.com
          </a>{" "}
          or write to:
        </p>
        <p className="font-medium text-fg">
          Pav Dental, 786 Leeds Road, Bradford, BD3 9TY, United Kingdom.
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
