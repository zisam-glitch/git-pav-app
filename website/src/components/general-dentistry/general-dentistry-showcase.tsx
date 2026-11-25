import { Heading, Section, VideoRow } from "@/components/hims";
import { GENERAL_PROCEDURE_VIDEOS } from "@/content/videos";

export function GeneralDentistryShowcase() {
  return (
    <Section theme="brown" space="lg">
      <Heading size="h2-md" tone="gold" className="mt-4">
        Procedures
      </Heading>
      <VideoRow tone="dark" videos={GENERAL_PROCEDURE_VIDEOS} className="mt-8" />
    </Section>
  );
}
