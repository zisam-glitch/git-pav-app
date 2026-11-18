import { Mail, MapPin, Phone } from "lucide-react";

const CARDS = [
  {
    icon: MapPin,
    title: "UK-Wide Service",
    desc: "Pav Dental Mobile visits patients across the UK, bringing convenient dental care directly to your location.",
    tone: "hims-tile-warm",
  },
  {
    icon: Phone,
    title: "Easy Booking",
    desc: "Simple appointment scheduling with flexible timing to suit your home or care-home routine.",
    tone: "hims-tile-sage",
  },
  {
    icon: Mail,
    title: "Contact Us",
    desc: "Reach out to discuss your mobile dental care needs and coordinate your visit.",
    tone: "bg-[#F2EDE5]",
  },
];

export function MobileDentistryLocation() {
  return (
    <section className="bg-[#FBF8F5] pb-16 sm:pb-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Coverage
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Location
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Pav Dental Mobile visits patients across the UK. Convenient dental care right at your
            doorstep.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={`${card.tone} rounded-[1.5rem] border border-black/6 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                <card.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.02em] text-black">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
