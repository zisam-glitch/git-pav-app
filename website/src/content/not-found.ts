/**
 * The words on the not-found page, which the live site does not have: it answers an unknown
 * address with its home page and a 200 (a "soft 404"). This page answers 404, says so plainly,
 * and offers the pages people are most likely to want. Every link must be a page that exists, and
 * the sentence about emergency care is the live home page's own (`not-found.test.ts` checks both).
 */
export const NOT_FOUND = {
  code: "404",
  title: "Page not found",
  text: "We could not find the page you asked for. It may have moved, or the address may have a typo. These pages may help.",
  links: [
    { href: "/", label: "Home" },
    { href: "/services", label: "Our services" },
    { href: "/services/emergency-dental", label: "Emergency dental care" },
    { href: "/pricing", label: "Pricing" },
    { href: "/team", label: "Our team" },
    { href: "/blog", label: "Blog" },
    { href: "/contact-us", label: "Contact us" },
    { href: "/shop", label: "Shop" },
  ],
  bookLabel: "Book Appointment",
  pain: "In pain? We offer same day emergency dental care 24-hours a day, seven days a week. Call",
} as const;
