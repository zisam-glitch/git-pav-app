import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { api } from "@/lib/api";

type Status = "idle" | "sending" | "signed" | "failed";

const INPUT =
  "h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-sm text-black placeholder:text-black/45 focus:border-[#ECD880] focus:outline-none focus:ring-2 focus:ring-[#ECD880]/40";

/**
 * The sign-the-petition form: name, email, postcode and a tick to say the signer is a British
 * citizen or UK resident, all required, as on the live page. A signature is only reported as
 * signed when the dashboard saved it. If sending fails the form keeps what was typed and says so.
 */
export function PetitionFormBar() {
  const [status, setStatus] = useState<Status>("idle");
  const { form: copy } = PETITION;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const postcode = String(data.get("postcode") ?? "").trim();
    if (!name || !email || !postcode) return;

    setStatus("sending");
    try {
      await api.forms.submitPetition({
        name,
        email,
        message: `Postcode: ${postcode}\nBritish citizen or UK resident: Yes`,
      });
      form.reset();
      setStatus("signed");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <section id="sign-form" aria-labelledby="sign-heading" className="py-4">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-12 text-white sm:px-10 sm:py-14">
          <h2
            id="sign-heading"
            className="font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-4xl"
          >
            {copy.heading}
          </h2>
          <p className="mt-2 text-xs text-white/75 sm:text-sm">{copy.eligibility}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-12 sm:gap-3.5">
              <div className="sm:col-span-4">
                <label htmlFor="pet-name" className="sr-only">
                  {copy.fieldLabels.name}
                </label>
                <input
                  id="pet-name"
                  name="name"
                  required
                  type="text"
                  autoComplete="name"
                  placeholder={`${copy.fieldLabels.name} *`}
                  className={INPUT}
                />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="pet-email" className="sr-only">
                  {copy.fieldLabels.email}
                </label>
                <input
                  id="pet-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder={`${copy.fieldLabels.email} *`}
                  className={INPUT}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pet-postcode" className="sr-only">
                  {copy.fieldLabels.postcode}
                </label>
                <input
                  id="pet-postcode"
                  name="postcode"
                  required
                  type="text"
                  autoComplete="postal-code"
                  placeholder={`${copy.fieldLabels.postcode} *`}
                  className={INPUT}
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  variant="gold"
                  disabled={status === "sending"}
                  className="h-12 w-full"
                >
                  {status === "sending" ? "Submitting..." : copy.submit}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-white/90">
              <input
                id="pet-resident"
                name="resident"
                type="checkbox"
                required
                className="size-4 accent-[#ECD880]"
              />
              <label htmlFor="pet-resident">{copy.residentLabel}</label>
            </div>

            {status === "signed" && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-[#ECD880]"
              >
                <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                {copy.thanks}
              </p>
            )}
            {status === "failed" && (
              <p role="alert" className="rounded-xl bg-black/25 px-4 py-3 text-sm font-medium">
                {copy.failed}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
