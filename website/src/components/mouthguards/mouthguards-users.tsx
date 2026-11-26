import { BookButton, CardRail, Section, SectionHead } from "@/components/hims";

const USER_TYPES = [
  {
    title: "Anyone needing extra protection",
    desc: "Ideal for anyone who grinds teeth, plays sports, or needs added oral safety.",
  },
  {
    title: "Adults",
    desc: "For everyday protection against grinding, clenching, or accidental impact.",
  },
  {
    title: "Children",
    desc: "Keeps growing teeth safe during play, sports, and daily activities.",
  },
  {
    title: "Athletes",
    desc: "Provides strong impact protection during training and competitive sports.",
  },
  {
    title: "Boxers",
    desc: "Minimizes jaw impact and prevents oral injuries during intense boxing sessions.",
  },
  {
    title: "Rugby players",
    desc: "Shields teeth and gums during high-contact tackles and scrums.",
  },
  {
    title: "Hockey players",
    desc: "Protects against sticks, pucks, and high-speed on-ice collisions.",
  },
] as const;

export function MouthguardsUsers() {
  return (
    <Section theme="white" aria-labelledby="mouthguards-users-heading">
      <SectionHead
        id="mouthguards-users-heading"
        title="Who Can Use Our Mouthguards"
        action={<BookButton>Make an Appointment</BookButton>}
      />
      <div className="mt-10">
        <CardRail
          label="Who Can Use Our Mouthguards"
          items={USER_TYPES.map((u, i) => ({
            label: String(i + 1).padStart(2, "0"),
            title: u.title,
            text: u.desc,
          }))}
        />
      </div>
    </Section>
  );
}
