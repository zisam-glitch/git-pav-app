import { ArrowRight, Briefcase, ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { RowCard } from "@/components/hims/row-card";
import { StackedFlow } from "@/components/hims/stacked-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Section id="roles" theme="cream" space="default">
      <StackedFlow
        sticky
        lead={
          <>
            <Heading as="h2" size="h2-md" accent="Positions" tone="terracotta" inline>
              Open
            </Heading>

            <div className="mt-8 rounded-xl bg-white p-4 md:p-6">
              <Label htmlFor="vacancy-search" className="sr-only">
                Search roles
              </Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle"
                />
                <Input
                  id="vacancy-search"
                  type="text"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>
          </>
        }
      >
        <ul className="grid gap-5">
          {filteredVacancies.map((vacancy) => (
            <RowCard key={vacancy.id} className="md:items-start">
              <h3 className="text-h4 text-fg">{vacancy.title}</h3>
              <p className="mt-3 text-body text-muted">{vacancy.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={() => onApply(vacancy)}>
                  <span>Apply Now</span>
                  <ArrowRight aria-hidden="true" />
                </Button>
                <ButtonLink
                  href={`mailto:${PRACTICE_EMAIL}?subject=${encodeURIComponent(`Application for ${vacancy.title}`)}`}
                  variant="outline"
                  className="bg-white"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span>Email Us</span>
                </ButtonLink>
              </div>
            </RowCard>
          ))}
        </ul>

        {filteredVacancies.length === 0 ? (
          <Tile tone="white" className="p-12 text-center">
            <Briefcase aria-hidden="true" className="mx-auto size-10 text-subtle" />
            <p className="mt-4 text-h4 text-fg">No positions match your search</p>
            <p className="mt-2 text-body text-muted">
              Try clearing your filters or searching with a different keyword.
            </p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </Tile>
        ) : null}
      </StackedFlow>
    </Section>
  );
}
