import { BookButton, CallButton, ExplainCards, Section } from "@/components/hims";

const GUARANTEE_CARDS = [
  {
    id: "same-day",
    eyebrow: "SAME-DAY CARE",
    title: "Alleviating your pain promptly",
    body: "In addition to our same-day extraction services, we offer comprehensive aftercare support to help you recover swiftly and return to your daily routine with minimal disruption.",
  },
  {
    id: "ongoing-guidance",
    eyebrow: "ONGOING GUIDANCE",
    title: "Post-extraction support",
    body: "Our team is always available to answer any questions and provide guidance on how to care for your mouth post-extraction.",
  },
] as const;

export function ExtractionGuarantee() {
  return (
    <Section id="same-day" theme="white" aria-labelledby="extraction-guarantee-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="extraction-guarantee-heading"
          className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          Guaranteed Tooth Extraction <span className="text-[#8a4242]">Same Day Treatment</span>
        </h2>
        <p className="mt-5 text-[20px] leading-[1.4] text-[#2a2a2c]">
          We understand that tooth pain can be unbearable and waiting is not an option. That&rsquo;s
          why we guarantee same-day tooth extraction services to provide you with immediate relief.
        </p>
        <p className="mt-4 text-[16px] leading-[1.55] text-[#6b6b70]">
          Our highly skilled dental professionals are dedicated to ensuring that your experience is
          as comfortable and stress-free as possible. Using the latest techniques and
          state-of-the-art equipment, we can quickly and safely remove the affected tooth,
          alleviating your pain and preventing further complications.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BookButton>Make an Appointment</BookButton>
          <CallButton variant="outline" />
        </div>
      </div>
      <div className="mt-12">
        <ExplainCards
          items={GUARANTEE_CARDS.map((c) => ({ title: c.title, text: <p>{c.body}</p> }))}
        />
      </div>
    </Section>
  );
}
