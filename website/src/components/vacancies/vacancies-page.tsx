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
    <div className="min-h-screen bg-[#FBF8F5] text-fg">
      <VacanciesHero />
      <VacanciesList onApply={handleApply} />
      <OpenApplication />
      <ApplyModal
        vacancy={selectedVacancy}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
