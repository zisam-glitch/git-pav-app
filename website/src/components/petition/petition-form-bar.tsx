import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PETITION } from "@/content/petition";
import { PetitionField } from "./petition-field";
import { api } from "@/lib/api";

type Status = "idle" | "sending" | "signed" | "failed";

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
    <section
      id="sign-form"
      aria-labelledby="sign-heading"
      className="scroll-mt-24 bg-black text-white"
    >
      <div className="mx-auto grid w-full max-w-[1392px] gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2
            id="sign-heading"
            className="text-[clamp(40px,6vw,88px)] leading-[0.95] font-medium tracking-[-0.04em]"
          >
            Sign the
            <br />
            Petition
          </h2>
          <p className="mt-6 max-w-[420px] text-[19px] leading-[1.45] text-white/70">
            {copy.eligibility}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 [&_label]:text-white/55 [&_input]:text-white [&_input]:border-white/30 [&_input:focus]:border-white"
        >
          <PetitionField
            id="pet-name"
            name="name"
            required
            type="text"
            autoComplete="name"
            label={copy.fieldLabels.name}
          />
          <PetitionField
            id="pet-email"
            name="email"
            required
            type="email"
            autoComplete="email"
            label={copy.fieldLabels.email}
          />
          <PetitionField
            id="pet-postcode"
            name="postcode"
            required
            type="text"
            autoComplete="postal-code"
            label={copy.fieldLabels.postcode}
          />

          <div className="flex items-center gap-3 text-[16px]">
            <input
              id="pet-resident"
              name="resident"
              type="checkbox"
              required
              className="size-5 accent-white"
            />
            <label htmlFor="pet-resident" className="!text-white">
              {copy.residentLabel}
            </label>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="h-14 w-full rounded-full bg-white text-[17px] font-medium text-black t-colors hover:bg-white/85 disabled:opacity-60"
          >
            {status === "sending" ? "Submitting..." : copy.submit}
          </button>

          {status === "signed" ? (
            <p role="status" className="flex items-center gap-2 text-[17px] font-medium">
              <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
              {copy.thanks}
            </p>
          ) : null}
          {status === "failed" ? (
            <p role="alert" className="text-[17px] font-medium underline">
              {copy.failed}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
