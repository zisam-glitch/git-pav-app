import { Heading, Section, Stat } from "@/components/hims";
import { CountingNumber } from "@/components/ui/counting-number";

const STATS = [
  { target: 2, suffix: "", label: "Doctors / Dentist" },
  { target: 5, suffix: "", label: "Staffs" },
  { target: 25, suffix: "+", label: "Years of experience" },
  { target: 500, suffix: "+", label: "Happy Patients" },
] as const;

export function Counters() {
  return (
    <Section id="ethos" theme="cream" space="default">
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div>
          <Heading as="h2" size="h2-md" accent="You Can Rely On" tone="copper">
            Exceptional Dentistry That
          </Heading>
          <p className="mt-6 text-label text-fg">Dr. Hassan Bhojani</p>
          <p className="mt-1 text-small text-muted">Founder &amp; Principal Dentist</p>
        </div>

        <div className="space-y-4 text-body text-muted">
          <p>
            At Pav Dental we hold a strong ethos in delivering the best dental care possible for all
            of our patients. We believe a healthy and happy smile is true to one’s nature in
            expression of themselves and we are committed to making sure all of our patients can be
            confident and satisfied with the care they receive from the moment they walk through our
            doors. We uphold community values and believe we have an important responsibility in
            serving our community to the best our ability.
          </p>
          <p>
            We appreciate no two patients are the same and are committed to delivering care and
            treatment tailored to fulfil the dental care you deserve. Dentistry is a fundamental
            aspect of any individual well being and we are determined to ensure excellence no matter
            what your needs may be.
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 sm:grid-cols-4">
        {STATS.map((stat) => (
          <Stat
            key={stat.label}
            value={
              <>
                <CountingNumber target={stat.target} />
                {stat.suffix}
              </>
            }
            label={stat.label}
          />
        ))}
      </div>
    </Section>
  );
}
