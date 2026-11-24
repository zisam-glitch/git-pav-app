import { CallButton } from "@/components/hims";

const JUMPS = [
  { num: "01", label: "Open Positions", href: "#roles" },
  { num: "02", label: "Foreign Visa & Sponsorship", href: "#sponsorship" },
  { num: "03", label: "Open Application", href: "#open-application" },
] as const;

/** A very large headline, the intro, a wide photo and a plain jump list. */
export function VacanciesHero() {
  return (
    <section className="mx-auto w-full max-w-[1392px] px-4 pt-16 md:pt-28">
      <p className="text-[14px] tracking-[0.14em] text-black/55 uppercase">
        Careers in Bradford · 7 Open Roles
      </p>
      <h1 className="mt-6 text-[clamp(56px,12vw,190px)] leading-[0.9] font-medium tracking-[-0.05em]">
        Vacancies
        <span className="block text-black/35">at Pav Dental</span>
      </h1>

      <div className="mt-14 grid gap-8 border-t border-black pt-8 lg:grid-cols-2 lg:gap-16">
        <p className="text-[clamp(22px,2.2vw,32px)] leading-[1.2] font-medium tracking-[-0.01em]">
          Join a growing practice in Bradford across dental nursing, general dentistry, hygiene,
          therapy, and international sponsorship.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <a
            href="#roles"
            className="inline-flex h-12 items-center rounded-full bg-black px-7 text-[16px] font-medium text-white t-colors hover:bg-black/80"
          >
            View Open Positions
          </a>
          <CallButton variant="outline" />
        </div>
      </div>

      <img
        src="/images/generated/vacancies-hero.jpg"
        alt="Modern dental clinic workspace at Pav Dental in Bradford"
        className="mt-14 aspect-[21/9] w-full object-cover"
      />

      <nav
        aria-label="On this page"
        className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-b border-black/20 pb-8"
      >
        <span className="text-[14px] tracking-[0.14em] text-black/55 uppercase">On this page</span>
        {JUMPS.map((item) => (
          <a key={item.href} href={item.href} className="group text-[18px] font-medium">
            <span className="mr-2 text-black/45 tabular-nums">{item.num}</span>
            <span className="underline-offset-4 group-hover:underline">{item.label}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
