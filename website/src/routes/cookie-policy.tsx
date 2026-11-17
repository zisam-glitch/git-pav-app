import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";

export const Route = createFileRoute("/cookie-policy")({
  head: () => seoHead("/cookie-policy"),
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Privacy & Preferences
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cookie Policy
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Last updated: 26 October 2026 • Effective date: 26 October 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">1. What Are Cookies?</h2>
              <p className="mt-3 text-sm">
                Cookies are small text files placed on your computer or mobile device when you visit our website. They help the site remember your preferences, keep you signed in, support shopping cart functionality, and help us understand website performance.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">2. Types of Cookies We Use</h2>
              <div className="mt-4 space-y-6 text-sm">
                <div className="border-l-4 border-emerald-600 pl-4">
                  <h3 className="font-semibold text-slate-900">Strictly Necessary Cookies (Always Active)</h3>
                  <p className="mt-1 text-slate-600">
                    These cookies are essential for the operation of our website, security tokens, login sessions, and shopping cart persistence during checkout. They cannot be switched off in our systems.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-slate-900">Analytics & Performance Cookies (Optional)</h3>
                  <p className="mt-1 text-slate-600">
                    We use Google Analytics 4 (Measurement ID: <code>G-KZVKDLY449</code>) to collect aggregated, anonymised statistics on site usage, page visits, and navigation paths. 
                  </p>
                  <p className="mt-2 text-slate-600 font-medium">
                    In compliance with UK PECR and GDPR, Google Analytics cookies are blocked until you grant explicit consent via our cookie banner.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">3. Managing Your Preferences</h2>
              <p className="mt-3 text-sm">
                You can change or withdraw your cookie consent at any time by clearing your browser cookies and reloading the page, which will re-trigger the cookie banner, or by adjusting your web browser settings to reject non-essential cookies.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Google Chrome Cookie Settings</a></li>
                <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Apple Safari Cookie Settings</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">Mozilla Firefox Cookie Settings</a></li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">4. Contact Us</h2>
              <p className="mt-3 text-sm">
                If you have questions about how we use cookies, please contact us at{" "}
                <a href="mailto:hello@pavdental.com" className="text-emerald-700 underline">hello@pavdental.com</a> or write to:
              </p>
              <p className="mt-2 text-sm text-slate-800 font-medium">
                Pav Dental, 786 Leeds Road, Bradford, BD3 9TY, United Kingdom.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
