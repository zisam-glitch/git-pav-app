import {
  Facebook,
  Instagram,
  Youtube,
  ExternalLink,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/#services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact-us" },
  { name: "Team", href: "/team" },
  { name: "Petition", href: "/petition" },
  { name: "Vacancies", href: "/#vacancies" },
  { name: "Blogs", href: "/#blogs" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms & Conditions", href: "#" },
  { name: "Cookie Policy", href: "#" },
  { name: "CCTV Policy", href: "#" },
  { name: "GDPR", href: "#" },
  { name: "Sitemap", href: "#" },
  { name: "Practice Policy", href: "#" },
  { name: "Complaints Policy", href: "#" },
];

export function ContactFooter() {
  return (
    <footer className="accent-gradient text-white pt-16 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Column 1: Clinic Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/db1i46uiv/image/upload/v1725565405/PAV_LOGO_2-01_r2ecmh_2_kko0yz.png"
                alt="Pav Dental Logo"
                className="h-10 w-auto"
              />
            </div>

            <p className="text-sm text-white/90 leading-relaxed pr-2">
              Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
              check-ups, and advanced technologies like digital imaging and laser dentistry.
            </p>

            {/* Social Icons */}
            <ul className="flex items-center gap-3 text-white pt-1">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Facebook className="size-4" />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Instagram className="size-4" />
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Youtube className="size-4" />
                </a>
              </li>
            </ul>

            {/* CQC Badge matching screenshot */}
            <div className="pt-2">
              <div className="inline-flex flex-col rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs">
                <span className="text-[10px] text-white/80 font-medium">Regulated by</span>
                <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
                  CareQuality Commission
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 font-bold text-base text-white border-b border-white/20 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm text-white/85">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <span className="text-white/60 group-hover:text-white">&gt;</span>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contacts (2.5 cols) */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 font-bold text-base text-white border-b border-white/20 pb-2 inline-block">
              Contacts
            </h3>
            <div className="space-y-2.5 text-sm text-white/85">
              <p>786 Leeds Road, Bradford, BD3 9TY</p>
              <p>
                <a href="mailto:hello@pavdental.com" className="hover:text-white transition-colors">
                  hello@pavdental.com
                </a>
              </p>
              <p>
                <a href="tel:08001938786" className="hover:text-white transition-colors">
                  0800 1938 786
                </a>
              </p>
              <p>
                <a href="https://wa.me/447311871456" className="hover:text-white transition-colors">
                  44 7311 871456
                </a>
              </p>
            </div>
          </div>

          {/* Column 4: Google Map (3 cols) */}
          <div className="lg:col-span-3">
            <div className="rounded-xl overflow-hidden border border-white/30 shadow-md bg-white text-gray-800">
              <div className="relative h-44 w-full bg-[#e8ecef] overflow-hidden">
                <iframe
                  title="Pav Dental Bradford Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5 bg-white flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800 truncate">786 Leeds Rd, Bradford</span>
                <a
                  href="https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  Open in Maps <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal links */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/20 pt-8 text-xs text-white/80 md:flex-row md:items-center">
          <p>Copyright 2026. Design by PavDental</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {legalLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

