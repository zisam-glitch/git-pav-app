/**
 * The links in the header and footer, which every page carries. The live site's header and footer
 * link to nearly every page, so each page passes link weight to the rest of the site and a visitor
 * can reach anything from anywhere. `site-links.test.ts` checks that every link the live site
 * carries on almost all its pages is here, or is one the owner approved leaving out.
 *
 * The footer's links must be real links in the server-rendered HTML, because a search engine
 * reads that. The header's Services menu only opens on a click, so the footer lists every service.
 */
export type SiteLink = { readonly name: string; readonly href: string };

/** The header's main links. "Services" is the menu between About and Pricing. */
export const NAV_LINKS: readonly SiteLink[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact-us" },
  { name: "Team", href: "/team" },
  { name: "Shop", href: "/shop" },
  { name: "Petition", href: "/petition" },
  { name: "Vacancies", href: "/vacancies" },
  { name: "Blogs", href: "/blog" },
];

/**
 * Every service page on the site, including FCA-compliant Payment Options (/services/finance)
 * and privacy-safe Patient Registration (/services/regestration).
 */
export const SERVICE_PAGES: readonly SiteLink[] = [
  { name: "Whitening", href: "/services/whitening" },
  { name: "Cosmetic", href: "/services/cosmetic" },
  { name: "Aesthetics", href: "/services/aesthetics" },
  { name: "Custom Grillz", href: "/services/custom-grillz" },
  { name: "Tooth Extraction", href: "/services/tooth-extraction" },
  { name: "Root Canal", href: "/services/root-canal" },
  { name: "Dentures", href: "/services/dentures" },
  { name: "Emergency Dental", href: "/services/emergency-dental" },
  { name: "Oral Hygiene", href: "/services/oral-hygiene" },
  { name: "General Dentistry", href: "/services/general-dentistry" },
  { name: "Mouthguards", href: "/services/mouthguards" },
  { name: "Mobile Dentistry", href: "/services/mobile-dentistry" },
  { name: "Virtual Dentistry", href: "/services/virtual-dentistry" },
  { name: "Payment Options", href: "/services/finance" },
  { name: "Patient Registration", href: "/services/regestration" },
];

export const FOOTER = {
  /** The sentence under the logo on every live page. */
  about:
    "Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine check-ups, and advanced technologies like digital imaging and laser dentistry.",
  quickLinksHeading: "Quick Links",
  quickLinks: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact-us" },
    { name: "Team", href: "/team" },
    { name: "Shop", href: "/shop" },
    { name: "Petition", href: "/petition" },
    { name: "Vacancies", href: "/vacancies" },
    { name: "Blogs", href: "/blog" },
  ] satisfies readonly SiteLink[],
  servicesHeading: "Services",
  contactsHeading: "Contacts",
  /**
   * The links under every page, with the live site's wording. The live "GDPR" link is left out:
   * the live GDPR page is another practice's template, and `/gdpr` goes to the privacy notice.
   */
  policyLinks: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-condition" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "CCTV Policy", href: "/cctv-policy" },
    { name: "Sitemap", href: "/sitemap.xml" },
    { name: "Practice Policy", href: "/practice-policy" },
    { name: "Complaints Policy", href: "/complaints-policy" },
  ] satisfies readonly SiteLink[],
} as const;

/** The practice's profiles, as the live footer links them, without the tracking parameters. */
export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61566617083306" },
  { name: "Instagram", href: "https://www.instagram.com/pavdentalofficial" },
  { name: "TikTok", href: "https://www.tiktok.com/@pavdentalofficial" },
  { name: "YouTube", href: "https://www.youtube.com/@PavDental" },
] as const satisfies readonly SiteLink[];

/** True on a single service page (/services/whitening), not on the /services hub. */
export function isServiceDetailPath(pathname: string): boolean {
  return pathname.startsWith("/services/") && pathname.length > "/services/".length;
}
