import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { FOOTER, SERVICE_PAGES, SOCIAL_LINKS } from "@/content/site-links";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

/** TikTok's mark (Simple Icons); the icon set in use has none. */
function TikTok({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<
  (typeof SOCIAL_LINKS)[number]["name"],
  (props: { className?: string }) => ReactNode
> = {
  Facebook,
  Instagram,
  TikTok,
  YouTube: Youtube,
};

const PRACTICE_ADDRESS = ["786 Leeds Road, Bradford,", "BD3 9TY"];
const SECOND_PHONE = { text: "+44 7311 871456", href: "tel:+447311871456" };

const footerLinkClass = "text-nav text-white/90 t-colors hover:text-white";

/**
 * Under every page. Its links are plain links in the server-rendered HTML, so a search engine
 * finds every page from any page: the live site's quick links and policy links, every service page
 * (the header's menu stays in the HTML too), the shop and the petition.
 */
export function Footer() {
  return (
    <footer className="rounded-t-xl bg-black p-6 text-white md:p-[53px] md:pb-[60px]">
      <div className="mx-auto w-full max-w-[var(--container-wide)]">
        <p className="max-w-4xl text-h3 text-white">{FOOTER.about}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,430px)_1fr] lg:gap-14">
          <div className="flex flex-col justify-between gap-8 rounded-xl bg-white/11 p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-h4 text-white">Connect</h2>
                <p className="mt-1.5 text-small text-white/75">{PRACTICE_HOURS}</p>
              </div>

              <ul className="space-y-3 text-nav text-white/90">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-white/75" aria-hidden="true" />
                  <address className="not-italic">
                    {PRACTICE_ADDRESS[0]}
                    <br />
                    {PRACTICE_ADDRESS[1]}
                  </address>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-1 size-4 shrink-0 text-white/75" aria-hidden="true" />
                  <a href={`mailto:${PRACTICE_EMAIL}`} className={footerLinkClass}>
                    {PRACTICE_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-white/75" aria-hidden="true" />
                  <a href={PRACTICE_PHONE_HREF} className={footerLinkClass}>
                    {PRACTICE_PHONE}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 size-4 shrink-0 text-white/75" aria-hidden="true" />
                  <a href={SECOND_PHONE.href} className={footerLinkClass}>
                    {SECOND_PHONE.text}
                  </a>
                </li>
              </ul>
            </div>

            <ul className="flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.name];
                return (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-10 items-center justify-center rounded-pill bg-white/11 text-white/90 t-colors hover:bg-white/20 hover:text-white focus-visible:ring-white focus-visible:ring-offset-0"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <nav aria-label="Quick links">
              <h2 className="mb-4 text-small font-medium text-white/70">
                {FOOTER.quickLinksHeading}
              </h2>
              <ul className="space-y-2.5">
                {FOOTER.quickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={footerLinkClass}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Services">
              <h2 className="mb-4 text-small font-medium text-white/70">
                {FOOTER.servicesHeading}
              </h2>
              <ul className="space-y-2.5">
                {SERVICE_PAGES.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={footerLinkClass}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Policies">
              <h2 className="mb-4 text-small font-medium text-white/70">Policies</h2>
              <ul className="space-y-2.5">
                {FOOTER.policyLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={footerLinkClass}>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-caption text-white/66 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Pav Dental.</p>
          <p>786 Leeds Road, Bradford, BD3 9TY</p>
        </div>

        <div className="mt-8 overflow-hidden pt-2" aria-hidden="true">
          <svg viewBox="0 0 1200 215" className="block h-auto w-full select-none text-white/17">
            <text
              x="50%"
              y="84%"
              textAnchor="middle"
              fill="currentColor"
              fontFamily="var(--font-sans)"
              fontWeight="600"
              fontSize="215"
              letterSpacing="-0.02em"
            >
              Pav Dental
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
