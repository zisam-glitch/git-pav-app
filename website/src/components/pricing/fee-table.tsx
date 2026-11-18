import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

interface TreatmentItem {
  name: string;
  fee: string;
}

interface TreatmentCategory {
  category: string;
  items: TreatmentItem[];
}

const CATEGORIES: TreatmentCategory[] = [
  {
    category: "Examination",
    items: [
      { name: "Routine Dental Examination", fee: "£35" },
      { name: "New Patient Examination", fee: "£45" },
      { name: "Small Digital X-Ray (per film)", fee: "£10" },
      { name: "Full Mouth Panoramic OPG X-Ray", fee: "£45" },
      { name: "Emergency Dental Consultation", fee: "£45" },
    ],
  },
  {
    category: "Hygiene",
    items: [
      { name: "Scale & Polish", fee: "£45" },
      { name: "Airflow Stain Removal", fee: "£65" },
      { name: "Periodontal Deep Clean (per quadrant)", fee: "£75" },
    ],
  },
  {
    category: "White Fillings",
    items: [
      { name: "Simple White Filling (1 surface)", fee: "£75" },
      { name: "Medium White Filling (2 surfaces)", fee: "£95" },
      { name: "Complex White Filling (3+ surfaces)", fee: "£125" },
    ],
  },
  {
    category: "Root Canal Treatment",
    items: [
      { name: "Single Root Tooth (Incisor / Canine)", fee: "£250" },
      { name: "Premolar Tooth (Two roots)", fee: "£325" },
      { name: "Molar Tooth (Multi-rooted)", fee: "£425" },
      { name: "Emergency Pain Relief & Dressing", fee: "£65" },
    ],
  },
  {
    category: "Extractions",
    items: [
      { name: "Simple Tooth Extraction", fee: "£75" },
      { name: "Surgical / Complex Extraction", fee: "£135" },
      { name: "Wisdom Tooth Extraction", fee: "£175" },
      { name: "Socket Preservation", fee: "£95" },
      { name: "Emergency Out of Hours Extraction", fee: "£145" },
    ],
  },
  {
    category: "Crowns & Bridges",
    items: [
      { name: "Porcelain Bonded Crown", fee: "£350" },
      { name: "All-Ceramic / Zirconia Crown", fee: "£450" },
      { name: "Full Gold Crown", fee: "£495" },
      { name: "Bridge (per unit)", fee: "£350" },
      { name: "Recement Crown / Bridge", fee: "£45" },
    ],
  },
  {
    category: "Dentures",
    items: [
      { name: "Acrylic Full Denture (Single Arch)", fee: "£450" },
      { name: "Acrylic Complete Set (Upper & Lower)", fee: "£750" },
      { name: "Chrome Cobalt Metal Denture", fee: "£650" },
      { name: "Denture Repair / Addition", fee: "£65" },
    ],
  },
  {
    category: "Dental Implants",
    items: [
      { name: "Implant Consultation", fee: "Free" },
      { name: "Single Dental Implant (including crown)", fee: "From £1,500" },
      { name: "Bone Grafting", fee: "From £350" },
      { name: "Sinus Lift", fee: "From £450" },
    ],
  },
  {
    category: "Teeth Whitening",
    items: [
      { name: "Home Whitening Kit (custom trays)", fee: "£195" },
      { name: "In-Surgery Laser Whitening", fee: "£350" },
      { name: "Combined Home & Laser Whitening", fee: "£450" },
      { name: "Top-up Syringes (pack of 2)", fee: "£45" },
      { name: "Internal Bleaching (per tooth)", fee: "£95" },
    ],
  },
  {
    category: "Orthodontics",
    items: [
      { name: "Orthodontic Consultation", fee: "Free" },
      { name: "Clear Aligners (Mild)", fee: "From £1,200" },
      { name: "Clear Aligners (Moderate)", fee: "From £1,800" },
      { name: "Clear Aligners (Comprehensive)", fee: "From £2,500" },
      { name: "Retainers (per arch)", fee: "£95" },
    ],
  },
  {
    category: "Facial Aesthetics",
    items: [
      { name: "Anti-wrinkle Injections (1 area)", fee: "£120" },
      { name: "Anti-wrinkle Injections (2 areas)", fee: "£175" },
      { name: "Anti-wrinkle Injections (3 areas)", fee: "£225" },
      { name: "Dermal Fillers (0.5ml)", fee: "£135" },
      { name: "Dermal Fillers (1.0ml)", fee: "£195" },
      { name: "Lip Enhancement", fee: "£165" },
    ],
  },
  {
    category: "Special Services",
    items: [
      { name: "Mobile Dentistry Call-out", fee: "£95" },
      { name: "Virtual Consultation", fee: "Free" },
      { name: "Sports Mouthguard (Custom)", fee: "£65" },
      { name: "Nightguard (Anti-Bruxism)", fee: "£95" },
    ],
  },
  {
    category: "Emergency Services",
    items: [
      { name: "Day Emergency Appointment", fee: "£45" },
      { name: "Evening / Weekend Emergency", fee: "£75" },
      { name: "Bank Holiday Emergency", fee: "£95" },
      { name: "Prescription Dispensing", fee: "Included in urgent" },
    ],
  },
];

export function FeeTable() {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["fee-schedule"],
    queryFn: () => api.pricing.get(),
  });

  const activeCategories: TreatmentCategory[] =
    data?.feeSchedule && data.feeSchedule.length > 0
      ? data.feeSchedule.map((c) => ({
          category: c.category || c.name || "Treatment",
          items: (c.items || []).map((i) => ({ name: i.name, fee: i.fee })),
        }))
      : CATEGORIES;

  const filteredCategories = activeCategories
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter(
        (item) =>
          (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (cat.category || "").toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Treatment Guide
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
            Treatment &amp; <span className="text-[#754B3D]">Fee Schedule</span>
          </h2>
          <p className="mt-3 text-sm text-black/65 sm:text-base">
            Complete treatment and fee schedule for all general, restorative, and cosmetic services.
          </p>

          <div className="relative mx-auto mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/45" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search treatments"
              placeholder="Search treatments (e.g. check-up, whitening, crown)..."
              className="h-11 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredCategories.map((group) => (
            <div
              key={group.category}
              className="overflow-hidden rounded-[1.5rem] border border-black/6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between border-b border-black/10 bg-[#FAF8F2] px-6 py-3.5">
                <h3 className="font-display text-lg font-normal tracking-[-0.02em] text-black">
                  {group.category}
                </h3>
                <span className="text-xs font-medium uppercase tracking-wider text-black/50">
                  Fee
                </span>
              </div>

              <div className="divide-y divide-black/8 text-sm">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[#FAF8F2]/60"
                  >
                    <span className="pr-4 font-normal text-black/85">{item.name}</span>
                    <span className="shrink-0 text-right font-medium tabular-nums text-[#1B3745]">
                      {item.fee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="rounded-[1.5rem] border border-black/6 bg-white py-12 text-center text-sm text-black/60">
              No treatments match &ldquo;{search}&rdquo;. Try searching for another service.
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <a href={BOOKING_URL}>
              Book Appointment
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
