import { BookButton, CallButton, Section, VideoRow } from "@/components/hims";
import { DENTURE_VIDEOS } from "@/content/videos";

export function DenturesShowcase() {
  return (
    <Section theme="white" space="sm" aria-labelledby="dentures-showcase-heading">
      <h2
        id="dentures-showcase-heading"
        className="text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
      >
        Dentures
      </h2>
      <VideoRow videos={DENTURE_VIDEOS} className="mt-8 lg:grid-cols-2" />
      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Make an Appointment</BookButton>
        <CallButton variant="outline" />
      </div>
    </Section>
  );
}
