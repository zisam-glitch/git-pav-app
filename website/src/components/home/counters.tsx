import { CountingNumber } from "@/components/ui/counting-number";
import { BOOKING_URL } from "@/lib/enquiry";

const stats = [
  { target: 2, suffix: "", label: "Clinicians" },
  { target: 5, suffix: "", label: "Team members" },
  { target: 25, suffix: "+", label: "Years of care" },
  { target: 500, suffix: "+", label: "Happy patients" },
];

export function Counters() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-16 text-white sm:px-10 sm:py-24">
          <div className="mx-auto max-w-[87rem]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                  Built around you
                </p>
                <h2 className="mt-3 max-w-2xl font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                  Total care, on your schedule
                </h2>
              </div>
              <a
                href={BOOKING_URL}
                className="inline-flex h-12 w-fit shrink-0 items-center justify-center rounded-full bg-[#ECD880] px-6 text-sm font-medium text-[#1B3745] transition-colors hover:bg-[#FDEAA0]"
              >
                Book an appointment
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-white/12 bg-white/6 p-6 sm:p-8"
                >
                  <div className="font-display text-4xl font-normal tracking-[-0.04em] text-[#ECD880] sm:text-5xl">
                    <CountingNumber target={stat.target} />
                    {stat.suffix}
                  </div>
                  <p className="mt-3 text-sm text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
