import React from "react";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "#services" },
  { name: "Whitening", href: "/services/whitening" },
  { name: "Extraction", href: "/services/tooth-extraction" },
  { name: "Root Canal", href: "/services/root-canal" },
  { name: "Dentures", href: "/services/dentures" },
  { name: "Emergency", href: "/services/emergency-dental" },
  { name: "Cosmetic", href: "/services/cosmetic" },
  { name: "Aesthetics", href: "/services/aesthetics" },
  { name: "Grillz", href: "/services/custom-grillz" },
  { name: "Team", href: "/team" },
  { name: "Shop", href: "/shop" },
  { name: "Petition", href: "/petition" },
  { name: "Vacancies", href: "/vacancies" },
  { name: "Blogs", href: "/blog" },
  { name: "Contact", href: "/contact-us" },
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
  { name: "Terms and Conditions", href: "/terms-and-condition" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Cookie Policy", href: "/cookie-policy" },
  { name: "Complaints Procedure", href: "/complaints-policy" },
];

export function Footer() {
  return (
    <section className="py-16 accent-gradient">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          {/* Company Info */}
          <div className="flex w-full flex-col justify-between gap-4 lg:items-start lg:w-1/3">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 lg:justify-start">
              <img src="https://res.cloudinary.com/db1i46uiv/image/upload/v1725565405/PAV_LOGO_2-01_r2ecmh_2_kko0yz.png" alt="PavDental Logo" className="h-10 w-auto" />
            </a>
            <p className="max-w-[70%] text-sm text-white/80">
              Providing comprehensive dental care in Bradford with 24/7 emergency services, mobile dentistry, and specialized treatments for all your oral health needs.
            </p>
            <ul className="flex items-center gap-4 text-white/80">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-white">
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="w-full lg:w-1/4">
            <h3 className="mb-4 font-bold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/80">
              {quickLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="font-medium hover:text-white">
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="w-full lg:w-1/3">
            <h3 className="mb-4 font-bold text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/80">
              {contactInfo.map((info, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <info.icon className="mt-0.5 size-4 shrink-0 text-white" />
                  <span>{info.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/20 py-8 text-xs font-medium text-white/80 md:flex-row md:items-center md:text-left">
          <div className="order-2 lg:order-1 space-y-1">
            <p>© 2026 Pav Dental. All rights reserved.</p>
            <p className="text-white/60">
              786 Leeds Road, Bradford, BD3 9TY. Dental professionals regulated by the General Dental Council (GDC). Clinical Lead: Dr Hassan Bhojani (GDC #262970).
            </p>
          </div>
          <ul className="order-1 flex flex-wrap gap-x-4 gap-y-2 md:order-2">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-white">
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
