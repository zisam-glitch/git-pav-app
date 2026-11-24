import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, HAS_API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";
import { LEAD, MUTED_TITLE, TITLE } from "./tokens";

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
      { name: "Off Peak (Pre-Booked)", fee: "£35" },
      { name: "Peak Hours (Same Day)", fee: "£55" },
      { name: "After Hours (18:00 / 20:00)", fee: "£150" },
      { name: "Late Night (After 23:00)", fee: "£200" },
      { name: "Sunday (All Day + Night)", fee: "£200" },
    ],
  },
  {
    category: "Hygiene",
    items: [
      { name: "Basic (Polish only)", fee: "£45" },
      { name: "Intermediate (Scale only)", fee: "£65" },
      { name: "Advanced (Scale and Polish with/without Topical Anesthesia)", fee: "£75" },
    ],
  },
  {
    category: "Fillings / Bonding",
    items: [
      { name: "Basic Composite (white) Fillings", fee: "£95" },
      { name: "Intermediate Composite (white) Fillings", fee: "£145" },
      { name: "Advanced Composite (white) Fillings", fee: "£195" },
    ],
  },
  {
    category: "Root Canal Treatment",
    items: [
      { name: "Simple Root Canal Treatment", fee: "£195" },
      { name: "Intermediate Root Canal Treatment", fee: "£295" },
      { name: "Advanced Root canal Treatment", fee: "£395" },
      { name: "Surgical Root canal Treatment", fee: "£495" },
    ],
  },
  {
    category: "Extractions",
    items: [
      { name: "Simple Extraction", fee: "£95" },
      { name: "Intermediate Extraction", fee: "£145" },
      { name: "Advanced Extraction", fee: "£195" },
      { name: "Surgical Extraction", fee: "£295" },
      { name: "Treatment of Dry Socket", fee: "£35" },
    ],
  },
  {
    category: "Crown & Bridge",
    items: [
      { name: "Metal crown", fee: "£395" },
      { name: "Porcelain Crown/ Veneer", fee: "£495" },
      { name: "Precious Metal (Gold)", fee: "£695" },
      { name: "Inlay/ Onlay Composite", fee: "£295" },
      { name: "crown/ bridge recementation", fee: "£60" },
    ],
  },
  {
    category: "Dentures",
    items: [
      { name: "Acrylic Denture", fee: "£495" },
      { name: "Valplast Denture (flexible)", fee: "£795" },
      { name: "Chrome Denture", fee: "£1195" },
    ],
  },
  {
    category: "Prevention",
    items: [
      { name: "X-Ray per film", fee: "Free" },
      { name: "Fissure Sealants per tooth", fee: "£10" },
      { name: "Fluoride Varnish Application", fee: "£5" },
    ],
  },
  {
    category: "Teeth Whitening",
    items: [
      { name: "Home Teeth Whitening with Trays", fee: "£295" },
      { name: "In Office Teeth Whitening", fee: "£295" },
      { name: "Combined Home and In Office", fee: "£495" },
      { name: "Top Up Syringes (Single)", fee: "£45" },
      { name: "Top Up Syringes (Pack of 4)", fee: "£95" },
      { name: "Whitening Strips (14 day)", fee: "£65" },
    ],
  },
  {
    category: "Other Items",
    items: [
      { name: "Bite Guard", fee: "£145" },
      { name: "Sports Guard", fee: "£145" },
      { name: "antibiotic prescription", fee: "£25" },
      { name: "Clear aligners", fee: "£1995" },
    ],
  },
  {
    category: "Aesthetics Dermal Fillers",
    items: [
      { name: "0.5ML", fee: "£100" },
      { name: "0.7ML", fee: "£150" },
      { name: "1ML", fee: "£250" },
      { name: "2ML", fee: "£350" },
      { name: "3ML", fee: "£400" },
      { name: "4ML", fee: "£450" },
    ],
  },
  {
    category: "Aesthetics Botox",
    items: [
      { name: "1 AREA", fee: "£180" },
      { name: "2 AREAS", fee: "£240" },
      { name: "3 AREAS", fee: "£300" },
      { name: "4 AREAS", fee: "£400" },
    ],
  },
  {
    category: "Other Aesthetics",
    items: [
      { name: "PROFHILO FIRST DOSE", fee: "£249" },
      { name: "SOSUM BOOSTER", fee: "£160" },
      { name: "GRILLZ", fee: "Available on request" },
    ],
  },
];

export function FeeTable() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data } = useQuery({
    queryKey: ["pricing"],
    queryFn: () => api.pricing.get(),
    enabled: HAS_API_BASE,
    retry: false,
  });

  const activeCategories: TreatmentCategory[] =
    data?.feeSchedule && data.feeSchedule.length > 0
      ? data.feeSchedule.map((c) => ({
          category: c.category || c.name || "Treatment",
          items: (c.items || []).map((i) => ({ name: i.name, fee: i.fee })),
        }))
      : CATEGORIES;

  const query = search.trim().toLowerCase();
  const filteredCategories = activeCategories
    .filter((cat) => selectedCategory === "All" || cat.category === selectedCategory)
    .map((cat) => ({
      ...cat,
      items: (cat.items || []).filter(
        (item) =>
          !query ||
          (item.name || "").toLowerCase().includes(query) ||
          (cat.category || "").toLowerCase().includes(query),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <section id="fees" aria-labelledby="fee-schedule-heading" className="scroll-mt-20 bg-white py-14 md:py-24">
      <div className="wrap-bento max-w-[1396px]">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <p className="text-small text-[#55565a]">Pav Dental Plans</p>
            <h2 className={`mt-2 ${TITLE}`} id="fee-schedule-heading">
              Treatment <span className={MUTED_TITLE}>Fee Schedule</span>
            </h2>
            <p className={`mt-4 max-w-[36rem] ${LEAD}`}>
              Complete treatment and fee schedule across examinations, hygiene, restorative care,
              whitening, and aesthetics.
            </p>
          </div>

          <div className="relative w-full">
            <label htmlFor="fee-search" className="sr-only">
              Search treatments
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-[#55565a]"
            />
            <Input
              id="fee-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search treatments (e.g. hygiene, whitening, crown)..."
              className="h-14 rounded-full border-0 bg-[#f4f1ea] pl-12 text-[16px]"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Treatment categories">
          {["All", ...activeCategories.map((c) => c.category)].map((name) => {
            const active = selectedCategory === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(name)}
                className={cn(
                  "rounded-full px-4 py-2 text-[15px] t-colors",
                  active ? "bg-[#1b1b1b] text-white" : "bg-[#f4f1ea] text-[#1b1b1b] hover:bg-[#ebe6dc]",
                )}
              >
                {name === "All" ? `All (${activeCategories.length})` : name}
              </button>
            );
          })}
        </div>

        {/* Hims FAQ-style rows: a big title with a round plus, opening to the fee list */}
        <div className="mt-10 border-t border-[#1b1b1b]/10">
          {filteredCategories.map((group, index) => (
            <details
              key={`${group.category}-${query ? "q" : "all"}`}
              open={Boolean(query) || selectedCategory !== "All" || index === 0}
              className="group border-b border-[#1b1b1b]/10"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 md:py-8 [&::-webkit-details-marker]:hidden">
                <span className="flex items-baseline gap-4">
                  <span className="text-[clamp(24px,2.8vw,40px)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                    {group.category}
                  </span>
                  <span className="text-small text-[#8b8d92]">{group.items.length}</span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efece6] text-[#1b1b1b]">
                  <Plus aria-hidden className="size-4 group-open:hidden" />
                  <Minus aria-hidden className="hidden size-4 group-open:block" />
                </span>
              </summary>
              <div className="pb-6 md:pb-8">
                <div className="flex items-center justify-between pb-3 text-small text-[#8b8d92]">
                  <span>Treatment</span>
                  <span>Price</span>
                </div>
                <ul className="divide-y divide-[#1b1b1b]/10">
                  {group.items.map((item, idx) => (
                    <li
                      key={`${group.category}-${item.name}-${idx}`}
                      className="flex items-center justify-between gap-6 py-4"
                    >
                      <span className="text-[17px] text-[#1b1b1b]">{item.name}</span>
                      <span className="shrink-0 text-right text-[clamp(20px,1.8vw,26px)] tracking-[-0.01em] text-[#1b1b1b] tabular-nums">
                        {item.fee}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="mt-8 rounded-[22px] bg-[#f4f1ea] p-10 text-center">
            <p className={LEAD}>
              No treatments match &ldquo;{search}&rdquo;. Try searching for another service or reset
              the category filter.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              Show all treatments
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
