import { BookButton, Carousel, Heading, Section, Tile } from "@/components/hims";

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
    <Section id="users" theme="white" aria-labelledby="mouthguards-users-heading">
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
          Tailored for Every Discipline
        </span>
        <div id="mouthguards-users-heading" className="mt-4">
          <Heading size="h2-md" accent="Our Mouthguards" tone="terracotta" inline>
            Who Can Use
          </Heading>
        </div>
      </div>

      <Carousel label="Who can use our mouthguards" className="mt-10">
        {USER_TYPES.map((user, i) => (
          <Tile
            key={user.title}
            tone="white"
            lift
            className="flex h-full flex-col justify-between gap-6 border border-border p-6 md:p-8"
          >
            <div>
              <span className="inline-flex items-center rounded-pill bg-cream px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h4 text-fg">{user.title}</h3>
              <p className="mt-3 text-body leading-relaxed text-muted">{user.desc}</p>
            </div>
            <div className="border-t border-border pt-4">
              <BookButton size="sm" variant="outline">
                Make an Appointment
              </BookButton>
            </div>
          </Tile>
        ))}
      </Carousel>
    </Section>
  );
}
