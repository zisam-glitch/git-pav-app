import { Heading, Section, Tile } from "@/components/hims";

const INSURANCE_PROVIDERS = [
  "AXA Health",
  "Simplyhealth",
  "Bupa",
  "Aviva",
  "Denplan",
  "WPA Health Insurance",
] as const;

export function InsuranceProviders() {
  return (
    <Section id="insurance" theme="white" aria-labelledby="insurance-heading">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="Insurance Providers" tone="terracotta" inline>
          <span id="insurance-heading">We Accept All</span>
        </Heading>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {INSURANCE_PROVIDERS.map((provider) => (
          <li key={provider}>
            <Tile tone="cream" className="flex h-24 items-center justify-center px-4 text-center">
              <span className="text-label text-fg">{provider}</span>
            </Tile>
          </li>
        ))}
      </ul>
    </Section>
  );
}
