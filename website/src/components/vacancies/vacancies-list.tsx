import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PRACTICE_EMAIL } from "@/lib/enquiry";
import { VACANCIES, type Vacancy } from "./vacancies-data";

interface VacanciesListProps {
  onApply: (vacancy: Vacancy) => void;
}

export function VacanciesList({ onApply }: VacanciesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredVacancies = useMemo(() => {
    return VACANCIES.filter((v) => {
      const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q);
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
    {
      id: "sponsorship",
      label: "Sponsorship",
      count: VACANCIES.filter((v) => v.category === "sponsorship").length,
    },
  ];

  return (
    <section id="roles" className="mx-auto w-full max-w-[1392px] scroll-mt-24 px-4 py-16 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[14px] tracking-[0.14em] text-black/55 uppercase">
            Clinical &amp; Practice Careers
          </p>
          <h2 className="mt-4 text-[clamp(44px,7vw,112px)] leading-[0.92] font-medium tracking-[-0.045em]">
            Open Positions
          </h2>
          <p className="mt-5 text-[19px] text-black/70">
            Explore current roles at 786 Leeds Road, Bradford, BD3 9TY.
          </p>
        </div>
        <div className="w-full lg:w-[340px]">
          <label htmlFor="vacancy-search" className="sr-only">
            Search roles
          </label>
          <input
            id="vacancy-search"
            type="text"
            placeholder="Search roles or departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full border-0 border-b border-black/30 bg-transparent px-0 text-[18px] outline-none placeholder:text-black/40 focus:border-black"
          />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 border-b border-black pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            aria-pressed={selectedCategory === cat.id}
            className={`text-[17px] t-colors ${selectedCategory === cat.id ? "font-medium text-black underline underline-offset-[10px] decoration-2" : "text-black/50 hover:text-black"}`}
          >
            {cat.label} <span className="tabular-nums">({cat.count})</span>
          </button>
        ))}
      </div>

      <ul className="list-none">
        {filteredVacancies.map((vacancy, index) => (
          <li key={vacancy.id}>
            <article className="grid gap-5 border-b border-black/20 py-9 md:grid-cols-[70px_1.1fr_1.4fr] md:gap-10 md:py-12">
              <span className="text-[16px] text-black/45 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="text-[clamp(28px,3vw,44px)] leading-[1.05] font-medium tracking-[-0.025em]">
                  {vacancy.title}
                </h3>
                <p className="mt-3 text-[16px] text-black/60">
                  {vacancy.department} · {vacancy.contractType}
                </p>
                <p className="mt-1 text-[16px] text-black/60">{vacancy.location}</p>
              </div>

              <div>
                <p className="text-[18px] leading-[1.5] text-black/75">{vacancy.description}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-black/55">
                  {vacancy.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => onApply(vacancy)}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-7 text-[16px] font-medium text-white t-colors hover:bg-black/80"
                  >
                    Apply Now
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </button>
                  <a
                    href={`mailto:${PRACTICE_EMAIL}?subject=${encodeURIComponent(`Application for ${vacancy.title}`)}`}
                    className="text-[16px] font-medium underline underline-offset-4"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {filteredVacancies.length === 0 ? (
        <div className="border-b border-black/20 py-16">
          <p className="text-[28px] font-medium tracking-[-0.02em]">
            No positions match your search
          </p>
          <p className="mt-2 text-[18px] text-black/65">
            Try clearing your filters or searching with a different keyword.
          </p>
          <button
            type="button"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-black px-7 text-[16px] font-medium text-white"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </section>
  );
}
