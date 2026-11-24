import { BookButton, CardRail, Section, SectionHead } from "@/components/hims";

const SERVICES = [
  {
    title: "Dental Crowns and Bridges",
    desc: "These are used to restore and replace damaged or missing teeth, improving the function and appearance of your smile.",
  },
  {
    title: "Regular Check-ups",
    desc: "Routine dental check-ups are essential for maintaining good oral health. These appointments typically include a dental cleaning, X-rays, and an examination by the dentist.",
  },
  {
    title: "Dental Fillings",
    desc: "Dental fillings are used to restore teeth damaged by decay back to their normal function and shape.",
  },
  {
    title: "Tooth Extractions",
    desc: "Sometimes a tooth may need to be removed due to decay, disease, or crowding. General dentists can perform simple extractions.",
  },
  {
    title: "Preventative Care",
    desc: "General dentistry aims to prevent oral health problems before they become severe. This includes advice on proper brushing techniques, flossing, and diet.",
  },
  {
    title: "Gum Disease Treatment",
    desc: "Treatment for gum diseases like gingivitis and periodontitis is another crucial aspect of general dentistry.",
  },
] as const;

export function GeneralDentistryServices() {
  return (
    <Section id="services" theme="white" aria-labelledby="gd-services-heading">
      <SectionHead
        id="gd-services-heading"
        title="Services Offered in General Dentistry"
        action={<BookButton>Book Appointment</BookButton>}
      />
      <div className="mt-10">
        <CardRail
          label="Services Offered in General Dentistry"
          items={SERVICES.map((s, i) => ({
            label: String(i + 1).padStart(2, "0"),
            title: s.title,
            text: s.desc,
          }))}
        />
      </div>
    </Section>
  );
}
