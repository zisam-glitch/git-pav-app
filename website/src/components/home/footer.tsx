import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { FOOTER, SERVICE_PAGES, SOCIAL_LINKS } from "@/content/site-links";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

/** TikTok's mark (Simple Icons); the icon set in use has none. */
function TikTok({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.62-.93c-.01 2.92.01 5.84-.02 8.75c-.08 1.4-.54 2.79-1.35 3.94c-1.31 1.92-3.58 3.17-5.91 3.21c-1.43.08-2.86-.31-4.08-1.03c-2.02-1.19-3.44-3.37-3.65-5.71c-.02-.5-.03-1-.01-1.49c.18-1.9 1.12-3.72 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72c.02 1.48-.04 2.96-.04 4.44c-.99-.32-2.15-.23-3.02.37c-.63.41-1.11 1.04-1.36 1.75c-.21.51-.15 1.07-.14 1.61c.24 1.64 1.82 3.02 3.5 2.87c1.12-.01 2.19-.66 2.77-1.61c.19-.33.4-.67.41-1.06c.1-1.79.06-3.57.07-5.36c.01-4.03-.01-8.05.02-12.07" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]["name"], (props: { className?: string }) => ReactNode> = {
  Facebook,
  Instagram,
  TikTok,
  YouTube: Youtube,
};

const ADDRESS = ["786 Leeds Road, Bradford,", "BD3 9TY"];
const SECOND_PHONE = { text: "+44 7311 871456", href: "tel:+447311871456" };

const linkClass = "font-medium transition-colors hover:text-white";

/**
 * Under every page. Its links are plain links in the server-rendered HTML, so a search engine
 * finds every page from any page: the live site's quick links and policy links, every service page
 * (the header's Services menu only opens on a click), the shop and the petition.
 */
export function Footer() {
  return (
    <footer className="py-16 accent-gradient">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <a href="/" className="inline-flex w-fit items-center">
              <img
                src="https://res.cloudinary.com/db1i46uiv/image/upload/v1725565405/PAV_LOGO_2-01_r2ecmh_2_kko0yz.png"
                alt="Pav Dental"
                className="h-10 w-auto"
              />
            </a>
            <p className="max-w-xs text-sm text-white/80">{FOOTER.about}</p>
            <ul className="flex items-center gap-4 text-white/80">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.name];
                return (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label="Quick links">
            <h2 className="mb-4 font-bold text-white">{FOOTER.quickLinksHeading}</h2>
            <ul className="space-y-3 text-sm text-white/80">
              {FOOTER.quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h2 className="mb-4 font-bold text-white">{FOOTER.servicesHeading}</h2>
            <ul className="space-y-3 text-sm text-white/80">
              {SERVICE_PAGES.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-bold text-white">{FOOTER.contactsHeading}</h2>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                <address className="not-italic">
                  {ADDRESS[0]}
                  <br />
                  {ADDRESS[1]}
                </address>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                <a href={`mailto:${PRACTICE_EMAIL}`} className={linkClass}>
                  {PRACTICE_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                <a href={PRACTICE_PHONE_HREF} className={linkClass}>
                  {PRACTICE_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-white" aria-hidden="true" />
                <a href={SECOND_PHONE.href} className={linkClass}>
                  {SECOND_PHONE.text}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/20 pt-8 text-xs font-medium text-white/80 md:flex-row md:items-center">
          <p className="order-2 md:order-1">Copyright {new Date().getFullYear()} Pav Dental.</p>
          <nav aria-label="Policies" className="order-1 md:order-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {FOOTER.policyLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
