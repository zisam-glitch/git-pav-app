import { useState } from "react";
import { ApplyModal } from "./apply-modal";
import { OpenApplication } from "./open-application";
import { VACANCIES, type Vacancy } from "./vacancies-data";
import { VacanciesHero } from "./vacancies-hero";
import { VacanciesList } from "./vacancies-list";
import { VisaSponsorshipBanner } from "./visa-sponsorship-banner";

export function VacanciesPage() {
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleApply = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy);
    setIsApplyModalOpen(true);
  };

  const sponsorshipVacancy =
    VACANCIES.find((v) => v.category === "sponsorship") ?? VACANCIES[VACANCIES.length - 1];

  return (
    <div className="bg-white text-fg">
      <VacanciesHero />
      <VacanciesList onApply={handleApply} />
      <VisaSponsorshipBanner onApplySponsorship={() => handleApply(sponsorshipVacancy)} />
      <OpenApplication />
      <ApplyModal
        vacancy={selectedVacancy}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}
