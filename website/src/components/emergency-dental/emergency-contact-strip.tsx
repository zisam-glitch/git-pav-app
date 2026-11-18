import { Clock, MapPin, Phone } from "lucide-react";
import { PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyContactStrip() {
  return (
    <section className="py-4 sm:py-6">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="hims-tile-warm grid gap-6 rounded-[1.5rem] border border-black/6 p-6 sm:grid-cols-3 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Address</p>
              <p className="mt-0.5 text-sm font-medium text-black">
                786 Leeds Road, Bradford, BD3 9TY
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
              <Phone className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                24/7 Phone
              </p>
              <a
                href={PRACTICE_PHONE_HREF}
                className="mt-0.5 block text-sm font-medium text-black hover:text-[#1B3745] hover:underline"
              >
                0800 1938 786 / 07311 871456
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Opening Hours
              </p>
              <p className="mt-0.5 text-sm font-medium text-black">
                Open 24/7 · Including Bank Holidays
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
