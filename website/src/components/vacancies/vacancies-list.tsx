import { useState, useMemo } from "react";
import {
  MapPin,
  Briefcase,
  ArrowRight,
  Search,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VACANCIES, type Vacancy } from "./vacancies-data";
import { cn } from "@/lib/utils";

interface VacanciesListProps {
  onApply: (vacancy: Vacancy) => void;
}

export function VacanciesList({ onApply }: VacanciesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredVacancies = useMemo(() => {
    return VACANCIES.filter((v) => {
      const matchesCategory =
        selectedCategory === "all" || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: "all", label: "All Roles", count: VACANCIES.length },
    {
      id: "dentistry",
      label: "Dentists",
      count: VACANCIES.filter((v) => v.category === "dentistry").length,
    },
    {
      id: "nursing",
      label: "Nursing",
      count: VACANCIES.filter((v) => v.category === "nursing").length,
    },
    {
      id: "hygiene",
      label: "Hygiene & Therapy",
      count: VACANCIES.filter((v) => v.category === "hygiene").length,
    },
  ];

  return (
    <section id="roles" className="bg-[#FBF8F5] py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">Vacancies</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Open <span className="text-[#754B3D]">Positions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-black/65 sm:text-lg">
            Discover your next opportunity in a supportive, modern dental practice
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-black/45" />
            <input
              type="text"
              aria-label="Search open positions"
              placeholder="Search roles, departments, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200",
                    active
                      ? "bg-black text-white"
                      : "border border-black/10 bg-white text-black/70 hover:bg-[#F2EDE5] hover:text-black",
                  )}
                >
                  {cat.label} <span className="opacity-75">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vacancy cards grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="flex flex-col justify-between rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-block rounded-full bg-[#FAF8F2] px-3 py-1 text-xs font-medium text-[#754B3D] border border-black/6">
                    {vacancy.department}
                  </span>
                  {vacancy.featured && (
                    <span className="inline-block rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#1B3745]">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  {vacancy.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-black/65 line-clamp-3">
                  {vacancy.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-black/55">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#1B3745]" aria-hidden="true" />
                    {vacancy.contractType}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#1B3745]" aria-hidden="true" />
                    Bradford, BD3
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {vacancy.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F2] px-3 py-1 text-xs text-black/75 border border-black/6"
                    >
                      <Check className="size-3 text-[#1B3745]" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                  {vacancy.tags.length > 3 && (
                    <span className="text-xs text-black/50">+{vacancy.tags.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row">
                <Button onClick={() => onApply(vacancy)} className="flex-1">
                  <span>Apply Now</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>

                <Button asChild variant="outline" className="px-6">
                  <a
                    href={`mailto:hello@pavdental.com?subject=Application%20for%20${encodeURIComponent(vacancy.title)}`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span>Email Us</span>
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredVacancies.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white p-14 text-center">
            <Briefcase className="mx-auto mb-4 size-10 text-black/40" aria-hidden="true" />
            <p className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
              No positions match your search
            </p>
            <p className="mt-2 text-sm text-black/60">
              Try clearing your filters or searching with a different keyword.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
