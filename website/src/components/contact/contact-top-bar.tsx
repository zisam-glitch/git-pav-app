import { Mail, MapPin, Phone } from "lucide-react";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function ContactTopBar() {
  return (
    <div className="bg-brown py-2 text-small text-white">
      <div className="wrap flex flex-col items-center justify-between gap-2.5 md:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:justify-start">
          <a
            href={`mailto:${PRACTICE_EMAIL}`}
            className="flex items-center gap-1.5 text-white/90 t-colors hover:text-white"
          >
            <Mail aria-hidden="true" className="size-3.5" />
            <span>{PRACTICE_EMAIL}</span>
          </a>

          <a
            href={PRACTICE_PHONE_HREF}
            className="flex items-center gap-1.5 text-white/90 t-colors hover:text-white"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            <span>{PRACTICE_PHONE}</span>
          </a>

          <a
            href="https://wa.me/447311871456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/90 t-colors hover:text-white"
          >
            <span>Whatsapp: +44 7311 871456</span>
          </a>
        </div>

        <div className="flex items-center gap-1.5 text-white/90">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span>786 Leeds Road, Bradford, BD3 9TY</span>
        </div>
      </div>
    </div>
  );
}
