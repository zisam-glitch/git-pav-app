import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin, ExternalLink } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/#services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/#contact" },
  { name: "Shop", href: "/#shop" },
  { name: "Vacancies", href: "/#vacancies" },
];

const contactInfo = [
  { icon: MapPin, text: "786 Leeds Road, Bradford, BD3 9TY" },
  { icon: Mail, text: "hello@pavdental.com" },
  { icon: Phone, text: "0800 1938 786" },
  { icon: Phone, text: "+44 7311 871456" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const legalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
  { name: "Cookie Policy", href: "#" },
];

export function PricingFooter() {
  return (
    <footer className="rounded-t-[1.5rem] bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 items-start">
          {/* Column 1: Clinic Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/db1i46uiv/image/upload/v1725565405/PAV_LOGO_2-01_r2ecmh_2_kko0yz.png"
                alt="PavDental Logo"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              Providing comprehensive dental care in Bradford with 24/7 emergency services,
              mobile dentistry, and specialized treatments for all your oral health needs.
            </p>
            <ul className="flex items-center gap-3 text-white/90 pt-1">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <social.icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <span className="inline-block rounded-md   bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                GDC Registered Practice
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 font-bold text-base text-white">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              {quickLinks.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-4 font-bold text-base text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/80">
              {contactInfo.map((info, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <info.icon className="mt-0.5 size-4 shrink-0 text-white" />
                  <span>{info.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Location Map matching screenshot */}
          <div>
            <h3 className="mb-4 font-bold text-base text-white">Find Us</h3>
            <div className="rounded-xl overflow-hidden   shadow-md bg-white text-gray-800">
              {/* Map visual embed */}
              <div className="relative h-44 w-full bg-[#e8ecef] overflow-hidden">
                <iframe
                  title="Pav Dental Bradford Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5 bg-white/95 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 truncate">
                  786 Leeds Rd, Bradford
                </span>
                <a
                  href="https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  Directions <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-12 flex flex-col justify-between gap-4   pt-8 text-xs text-white/80 md:flex-row md:items-center">
          <p>© 2026 PavDental. All rights reserved.</p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
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

