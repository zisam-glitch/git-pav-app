import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Heading, Section } from "@/components/hims";
import { PriceList } from "@/components/hims/price-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, HAS_API_BASE } from "@/lib/api";

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
    <Section id="fees" theme="white" width="bento" aria-labelledby="fee-schedule-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2-md" accent="Fee Schedule" tone="terracotta" inline>
            <span id="fee-schedule-heading">Treatment</span>
          </Heading>
        </div>

        <div className="relative w-full md:max-w-sm">
          <label htmlFor="fee-search" className="sr-only">
            Search treatments
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            id="fee-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search treatments (e.g. hygiene, whitening, crown)..."
            className="h-12 rounded-pill pl-11"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Treatment categories">
        <Button
          type="button"
          role="tab"
          aria-selected={selectedCategory === "All"}
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("All")}
        >
          All ({activeCategories.length})
        </Button>
        {activeCategories.map((cat) => {
          const active = selectedCategory === cat.category;
          return (
            <Button
              key={cat.category}
              type="button"
              role="tab"
              aria-selected={active}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.category)}
            >
              {cat.category}
            </Button>
          );
        })}
      </div>

      {/* Hims biomarkers.md: per category a two-column band, heading left, hairline price rows right */}
      <div className="mt-8">
        {filteredCategories.map((group) => (
          <div
            key={group.category}
            className="grid gap-4 border-t border-border py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-28 md:py-[60px]"
          >
            <h3 className="text-h3-md">{group.category}</h3>
            <PriceList
              className="[&>div:first-child]:pt-0"
              rows={group.items.map((item) => ({ label: item.name, price: item.fee }))}
            />
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="rounded-xl border border-border bg-cream p-10 text-center">
            <p className="text-lead text-muted">
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
    </Section>
  );
}
