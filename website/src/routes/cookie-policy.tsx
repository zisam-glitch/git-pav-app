import { createFileRoute } from "@tanstack/react-router";
import { ContentPageBody } from "@/components/content/content-blocks";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cookie-policy")({
  head: () => seoHead("/cookie-policy"),
  component: CookiePolicyPage,
});

const LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />

      <ContentPageBody
        eyebrow="Privacy & Preferences"
        title="Cookie Policy"
        subtitle="Last updated: 26 October 2026 • Effective date: 26 October 2026"
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">1. What Are Cookies?</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              Cookies are small text files placed on your computer or mobile device when you visit
              our website. They help the site remember your preferences, keep you signed in, support
              shopping cart functionality, and help us understand website performance.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">2. Types of Cookies We Use</h2>
            <div className="mt-4 space-y-6">
              <div className="border-l-2 border-terracotta pl-4">
                <h3 className="text-label text-fg">Strictly Necessary Cookies (Always Active)</h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  These cookies are essential for the operation of our website, security tokens,
                  login sessions, and shopping cart persistence during checkout. They cannot be
                  switched off in our systems.
                </p>
              </div>

              <div className="border-l-2 border-clay pl-4">
                <h3 className="text-label text-fg">
                  Analytics &amp; Performance Cookies (Optional)
                </h3>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  We use Google Analytics 4 (Measurement ID:{" "}
                  <code className="rounded bg-cream px-1.5 py-0.5 text-small text-fg">
                    G-KZVKDLY449
                  </code>
                  ) to collect aggregated, anonymised statistics on site usage, page visits, and
                  navigation paths.
                </p>
                <p className="mt-2 text-body font-medium leading-relaxed text-fg">
                  In compliance with UK PECR and GDPR, Google Analytics cookies are blocked until
                  you grant explicit consent via our cookie banner.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">3. Managing Your Preferences</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              You can change or withdraw your cookie consent at any time by clearing your browser
              cookies and reloading the page, which will re-trigger the cookie banner, or by
              adjusting your web browser settings to reject non-essential cookies.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body leading-relaxed text-muted">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  Google Chrome Cookie Settings
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  Apple Safari Cookie Settings
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  Mozilla Firefox Cookie Settings
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h2 className="text-h3-md text-fg">4. Contact Us</h2>
            <p className="mt-3 text-body leading-relaxed text-muted">
              If you have questions about how we use cookies, please contact us at{" "}
              <a href="mailto:hello@pavdental.com" className={LINK_CLASS}>
                hello@pavdental.com
              </a>{" "}
              or write to:
            </p>
            <p className="mt-2 text-body font-medium leading-relaxed text-fg">
              Pav Dental, 786 Leeds Road, Bradford, BD3 9TY, United Kingdom.
            </p>
          </section>
        </div>
      </ContentPageBody>

      <Footer />
    </main>
  );
}
