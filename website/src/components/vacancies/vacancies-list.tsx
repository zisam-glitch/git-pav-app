import { useState, useMemo } from "react";
import {
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { VACANCIES, Vacancy } from "./vacancies-data";

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
    { id: "dentistry", label: "Dentists", count: VACANCIES.filter((v) => v.category === "dentistry").length },
    { id: "nursing", label: "Nursing", count: VACANCIES.filter((v) => v.category === "nursing").length },
    { id: "hygiene", label: "Hygiene & Therapy", count: VACANCIES.filter((v) => v.category === "hygiene").length },
  ];

  return (
    <section id="roles" className="py-16 sm:py-24 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1c12]">
            Open Positions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted max-w-2xl mx-auto">
            Discover your next opportunity in a supportive, modern dental practice
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-start justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              aria-label="Search open positions"
              placeholder="Search roles, departments, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-xl   bg-white pl-12 pr-4 text-sm placeholder:text-muted focus:border-[#925a27] focus:outline-none focus:ring-2 focus:ring-[#925a27]/20 shadow-sm"
            />
          </div>

          {/* Category filtering pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "accent-gradient text-white shadow-md scale-105"
                    : "bg-white text-muted   hover:border-[#925a27] hover:text-[#2a1c12]"
                }`}
              >
                {cat.label} <span className="opacity-80">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vacancy cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVacancies.map((vacancy) => {
            const isFeatured = vacancy.featured;

            return (
              <div
                key={vacancy.id}
                className={`relative overflow-hidden rounded-xl  bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isFeatured
                    ? "/50 shadow-md"
                    : " shadow-sm hover:border-[#925a27]/50"
                }`}
              >
                {/* Featured badge */}
                {isFeatured && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#faf6f0]   px-3 py-1 text-[11px] font-bold uppercase text-[#925a27]">
                      <Sparkles className="size-3" />
                      <span>Featured</span>
                    </div>
                  </div>
                )}

                

                <div className="space-y-4">
                  

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2a1c12]">
                    {vacancy.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted line-clamp-3">
                    {vacancy.description}
                  </p>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-[#925a27]" />
                      {vacancy.contractType}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#925a27]" />
                      Bradford, BD3
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {vacancy.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-[#faf6f0] px-2.5 py-1 text-[11px] font-medium text-[#844d1e]  /50"
                      >
                        <CheckCircle2 className="size-3 text-[#925a27]" />
                        {tag}
                      </span>
                    ))}
                    {vacancy.tags.length > 3 && (
                      <span className="text-[11px] text-muted">+{vacancy.tags.length - 3} more</span>
                    )}
                  </div>

                  

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => onApply(vacancy)}
                      className="flex-1 h-11 rounded-xl accent-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="size-4" />
                    </button>

                    <a
                      href={`mailto:hello@pavdental.com?subject=Application%20for%20${encodeURIComponent(vacancy.title)}`}
                      className="h-11 rounded-xl   text-sm font-medium text-muted hover:border-[#925a27] hover:text-[#2a1c12] transition-colors flex items-center justify-center px-8 gap-2"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Email Us</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredVacancies.length === 0 && (
          <div className="rounded-xl border-2 border-dashed  bg-white p-16 text-center">
            <Briefcase className="size-12 mx-auto text-muted mb-4" />
            <p className="font-display text-xl font-bold text-[#2a1c12]">No positions match your search</p>
            <p className="mt-2 text-sm text-muted">Try clearing your filters or searching with a different keyword.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2.5 rounded-xl accent-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

