import { Heading, Section, Tile } from "@/components/hims";

const IMPORTANCE_POINTS = [
  {
    title: "Early Diagnosis",
    desc: "Regular dental visits help in early detection of oral health problems like cavities and gum disease.",
  },
  {
    title: "Prevention",
    desc: "General dentistry focuses on preventative care, which can save you from more extensive and expensive treatments down the line.",
  },
  {
    title: "Education",
    desc: "Dentists not only treat but also educate patients on the best practices for oral care.",
  },
  {
    title: "Family Care",
    desc: "General dentistry caters to the dental needs of the entire family, from children to seniors.",
  },
] as const;

export function GeneralDentistryImportance() {
  return (
    <Section theme="white">
      <div className="max-w-2xl">
        <Heading size="h2-md" accent="Important?" tone="terracotta" inline>
          Why General Dentistry is
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {IMPORTANCE_POINTS.map((point, i) => (
          <Tile key={point.title} tone="cream" className="p-6">
            <span className="text-small font-medium tabular-nums text-terracotta">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-body text-muted">
              <strong className="font-medium text-fg">
                {i + 1}. {point.title}:
              </strong>{" "}
              {point.desc}
            </p>
          </Tile>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-tile-cream p-6 md:p-8">
        <h3 className="text-h4 text-fg">Cost and Insurance</h3>
        <p className="mt-2 max-w-3xl text-body text-muted">
          The cost of general dentistry services varies depending on the treatment and location.
          Many dental insurance plans cover the cost of preventative care treatments like regular
          check-ups and cleanings.
        </p>
      </div>
    </Section>
  );
}
