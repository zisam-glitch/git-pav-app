import { useState } from "react";
import { VacanciesHero } from "./vacancies-hero";
import { VacanciesList } from "./vacancies-list";
import { OpenApplication } from "./open-application";
import { ApplyModal } from "./apply-modal";
import type { Vacancy } from "./vacancies-data";

export function VacanciesPage() {
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleApply = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] text-fg">
      {/* 1. Hero Section with Culture & Perks */}
      <VacanciesHero />

      {/* 2. Vacancies List with Category Filters & Search */}
      <VacanciesList onApply={handleApply} />

      {/* 3. Speculative Inquiries & Recruitment Details */}
      <OpenApplication />

      {/* Interactive Application Modal */}
      <ApplyModal
        vacancy={selectedVacancy}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}

