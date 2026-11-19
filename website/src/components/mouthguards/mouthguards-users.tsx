import { Carousel, Heading, Section, Tile } from "@/components/hims";

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
    <Section theme="cream">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Our Mouthguards" tone="terracotta" inline>
          Who Can Use
        </Heading>
      </div>

      <Carousel label="Who can use our mouthguards" className="mt-8">
        {USER_TYPES.map((user, i) => (
          <Tile key={user.title} tone="white" className="flex h-full flex-col justify-between p-6">
            <div>
              <span className="text-small font-medium tabular-nums text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-h4 text-fg">{user.title}</h3>
              <p className="mt-2 text-body text-muted">{user.desc}</p>
            </div>
          </Tile>
        ))}
      </Carousel>
    </Section>
  );
}
