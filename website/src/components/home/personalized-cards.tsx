import { BOOKING_URL } from "@/lib/enquiry";

const PHOTO_CARDS = [
  {
    tag: "Emergency Dental",
    title: "Toothache or urgent dental care?",
    image: "/media/hims/card-emergency.jpg",
    href: "/services/emergency-dental",
  },
  {
    tag: "Facial Aesthetics",
    title: "Rediscover your youthful radiance",
    image: "/media/hims/card-aesthetics.jpg",
    href: "/services/aesthetics",
  },
  {
    tag: "Teeth Whitening",
    title: "Looking for a brighter, healthier smile?",
    image: "/media/hims/card-whitening.jpg",
    href: "/services/whitening",
  },
] as const;

export function PersonalizedCards() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="max-w-3xl font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Get a personalized treatment plan{" "}
            <span className="text-[#8A3A34]">with clinician-trusted solutions</span>
          </h2>
          <a
            href={BOOKING_URL}
            className="inline-flex h-11 w-fit shrink-0 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-[#1B3745]"
          >
            Book appointment
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PHOTO_CARDS.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.25rem] bg-[#1B3745] p-6 text-white"
            >
              <img
                src={card.image}
                alt={card.tag}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/25" />

              <span className="relative z-10 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {card.tag}
              </span>

              <div className="relative z-10">
                <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-white sm:text-3xl">
                  {card.title}
                </h3>
                <span className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-5 text-xs font-medium text-black transition-transform duration-200 group-hover:scale-[1.03]">
                  Explore treatments
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
