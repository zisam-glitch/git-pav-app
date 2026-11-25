import { BookButton, Heading, Section, YouTubeVideo } from "@/components/hims";
import { YOUTUBE } from "@/content/videos";

export function GeneralDentistryCavities() {
  return (
    <Section theme="navy" width="bento" space="lg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2-md" accent="Form?" tone="butter" inline className="mt-4">
            How Do Dental Cavities
          </Heading>
        </div>
        <BookButton variant="butter">Book Appointment</BookButton>
      </div>

      <YouTubeVideo
        {...YOUTUBE.generalCavities}
        title="How dental cavities form"
        className="mt-8 rounded-xl border border-white/12"
      />
    </Section>
  );
}
