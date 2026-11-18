import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#844d1e]">
            Pav Dental Plans
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted">
            Complete treatment and fee schedule for all general, restorative, and cosmetic services.
          </p>

          {/* Quick search input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search treatments"
              placeholder="Search treatments (e.g. check-up, whitening, crown)..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-border bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Treatment fee tables */}
        <div className="space-y-6">
          {filteredCategories.map((group) => (
            <div
              key={group.category}
              className="rounded-xl overflow-hidden border border-border/80 bg-white shadow-xs"
            >
              {/* Category Header Row (warm beige background matching screenshot) */}
              <div className="flex items-center justify-between bg-[#efe5d8] px-5 py-3 border-b border-border/60">
                <span className="font-semibold text-sm sm:text-base text-[#693d17]">
                  {group.category}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#693d17] uppercase">
                  Fee
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-border/40 text-sm">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface/50 transition-colors"
                  >
                    <span className="text-fg/90 font-medium pr-4">{item.name}</span>
                    <span className="text-[#844d1e] font-semibold shrink-0 text-right">
                      {item.fee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted">
              No treatments match "{search}". Try searching for another service.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

