import { CountingNumber } from "@/components/ui/counting-number";

const stats = [
  { target: 2, suffix: "", label: "Clinicians" },
  { target: 5, suffix: "", label: "Team members" },
  { target: 25, suffix: "+", label: "Years of care" },
  { target: 500, suffix: "+", label: "Happy patients" },
];

export function Counters() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-5xl">
                <CountingNumber target={stat.target} />
                {stat.suffix}
              </div>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
