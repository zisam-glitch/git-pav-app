import { LEAD, MUTED_TITLE, SOFT_CARD, TITLE } from "./tokens";

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
    <section
      id="insurance"
      aria-labelledby="insurance-heading"
      className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24"
    >
      <div className="wrap-bento max-w-[1396px]">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <p className="text-small text-[#55565a]">Dental Insurance</p>
            <h2 className={`mt-2 ${TITLE}`} id="insurance-heading">
              We Accept All <span className={MUTED_TITLE}>Insurance Providers</span>
            </h2>
          </div>
          <p className={LEAD}>
            Itemised receipts are provided at every appointment for straightforward reimbursement
            claims.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {INSURANCE_PROVIDERS.map((provider) => (
            <li
              key={provider}
              className={`${SOFT_CARD} flex h-28 items-center justify-center px-4 text-center text-[18px] text-[#1b1b1b]`}
            >
              {provider}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
