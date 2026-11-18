import { Mail, Phone, MapPin } from "lucide-react";

export function ContactTopBar() {
  return (
    <div className="bg-[#1B3745] text-white text-xs py-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left info: Email, Phone, WhatsApp */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-white/95">
          <a
            href="mailto:hello@pavdental.com"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="size-3.5" />
            <span>hello@pavdental.com</span>
          </a>

          <a
            href="tel:08001938786"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="size-3.5" />
            <span>0800 1938 786</span>
          </a>

          <a
            href="https://wa.me/447311871456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            {/* WhatsApp Icon */}
            <svg
              className="size-3.5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
            </svg>
            <span>44 7311 871456</span>
          </a>
        </div>

        {/* Right info: Address */}
        <div className="flex items-center gap-1.5 text-white/95">
          <MapPin className="size-3.5 shrink-0" />
          <span>786 Leeds Road, Bradford, BD3 9TY</span>
        </div>
      </div>
    </div>
  );
}

