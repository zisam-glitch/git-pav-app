const USER_TYPES = [
  {
    title: "Rugby players",
    desc: "Shields teeth and gums during high-contact tackles and scrums.",
    tone: "hims-tile-warm",
  },
  {
    title: "Hockey players",
    desc: "Protects against sticks, pucks, and high-speed on-ice collisions.",
    tone: "hims-tile-sage",
  },
  {
    title: "Boxers",
    desc: "Minimizes jaw impact and prevents oral injuries during intense boxing sessions.",
    tone: "bg-[#F2EDE5]",
  },
  {
    title: "Athletes",
    desc: "Provides strong impact protection during training and competitive sports.",
    tone: "hims-tile-warm",
  },
  {
    title: "Adults",
    desc: "For everyday protection against grinding, clenching, or accidental impact.",
    tone: "hims-tile-sage",
  },
  {
    title: "Children",
    desc: "Keeps growing teeth safe during play, sports, and daily activities.",
    tone: "bg-[#F2EDE5]",
  },
  {
    title: "Anyone needing extra protection",
    desc: "Ideal for anyone who grinds teeth, plays sports, or needs added oral safety.",
    tone: "hims-tile-warm",
  },
] as const;

export function MouthguardsUsers() {
  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Built for everyone
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Who Can Use{" "}
            <span className="text-[#754B3D]">Our Mouthguards</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            From contact sports to everyday protection against grinding, every guard is made to
            your exact fit.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USER_TYPES.map((user, i) => (
            <article
              key={user.title}
              className={`${user.tone} ${
                i === USER_TYPES.length - 1 ? "sm:col-span-2 lg:col-span-2" : ""
              } rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-black">
                {user.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">{user.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
