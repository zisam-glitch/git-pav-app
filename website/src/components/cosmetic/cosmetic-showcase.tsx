import { Heading, Section, VideoRow } from "@/components/hims";
import { COSMETIC_PROCEDURE_VIDEOS } from "@/content/videos";

export function CosmeticShowcase() {
  return (
    <Section theme="brown" space="lg" aria-labelledby="cosmetic-showcase-heading">
      <div id="cosmetic-showcase-heading" className="mt-4">
        <Heading size="h2" tone="gold">
          Procedures
        </Heading>
      </div>
      <VideoRow tone="dark" videos={COSMETIC_PROCEDURE_VIDEOS} className="mt-8" />
    </Section>
  );
}
