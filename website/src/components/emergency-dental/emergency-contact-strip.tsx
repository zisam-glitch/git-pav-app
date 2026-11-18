import { MapPin, Phone, Clock } from "lucide-react";

export function EmergencyContactStrip() {
  return (
    <div className="bg-[#2a1c12] text-white py-6 sm:py-8 border-y border-[#3d2a1d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {/* Item 1 */}
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="size-12 rounded-xl bg-[#372418] border border-[#523825] flex items-center justify-center flex-shrink-0">
              <MapPin className="size-6 text-[#cf9448]" />
            </div>
            <div>
              <p className="text-[11px] uppercase text-[#cf9448] font-bold">Address</p>
              <p className="text-sm font-semibold text-white">786 Leeds Road, Bradford, BD3 9TY</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="size-12 rounded-xl bg-[#372418] border border-[#523825] flex items-center justify-center flex-shrink-0">
              <Phone className="size-6 text-[#cf9448]" />
            </div>
            <div>
              <p className="text-[11px] uppercase text-[#cf9448] font-bold">24/7 Phone</p>
              <a href="tel:07311871456" className="text-sm font-bold text-white hover:underline">
                07311 871456 / 0800 1938 786
              </a>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="size-12 rounded-xl bg-[#372418] border border-[#523825] flex items-center justify-center flex-shrink-0">
              <Clock className="size-6 text-[#cf9448]" />
            </div>
            <div>
              <p className="text-[11px] uppercase text-[#cf9448] font-bold">Opening Hours</p>
              <p className="text-sm font-semibold text-white">Open 24/7 · 365 Days a Year</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
