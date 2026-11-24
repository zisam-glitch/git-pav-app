import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PETITION } from "@/content/petition";
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

  const field =
    "h-12 w-full border-2 border-black bg-white px-4 text-[16px] text-black outline-none placeholder:text-black/45 focus:bg-[#fff8e8]";
  const label = "mb-1.5 block text-[14px] font-bold text-black";

  return (
    <section
      id="sign-form"
      aria-labelledby="sign-heading"
      className="scroll-mt-24 border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] md:p-8"
    >
      <h2 id="sign-heading" className="text-[28px] leading-tight font-extrabold uppercase">
        Sign the Petition
      </h2>
      <p className="mt-2 text-[16px] text-black/75">{copy.eligibility}</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label htmlFor="pet-name" className={label}>
            {copy.fieldLabels.name} *
          </label>
          <input
            id="pet-name"
            name="name"
            required
            type="text"
            autoComplete="name"
            placeholder={copy.fieldLabels.name}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="pet-email" className={label}>
            {copy.fieldLabels.email} *
          </label>
          <input
            id="pet-email"
            name="email"
            required
            type="email"
            autoComplete="email"
            placeholder={copy.fieldLabels.email}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="pet-postcode" className={label}>
            {copy.fieldLabels.postcode} *
          </label>
          <input
            id="pet-postcode"
            name="postcode"
            required
            type="text"
            autoComplete="postal-code"
            placeholder={copy.fieldLabels.postcode}
            className={field}
          />
        </div>

        <div className="flex items-center gap-3 text-[15px]">
          <input
            id="pet-resident"
            name="resident"
            type="checkbox"
            required
            className="size-5 accent-black"
          />
          <label htmlFor="pet-resident">{copy.residentLabel}</label>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="h-14 w-full border-2 border-black bg-[#ffc671] text-[17px] font-extrabold uppercase shadow-[4px_4px_0_0_#000] t-colors hover:bg-black hover:text-white disabled:opacity-60"
        >
          {status === "sending" ? "Submitting..." : copy.submit}
        </button>

        {status === "signed" ? (
          <p
            role="status"
            className="flex items-center gap-2 border-2 border-black bg-[#e4eee6] px-4 py-3 text-[15px] font-bold"
          >
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            {copy.thanks}
          </p>
        ) : null}
        {status === "failed" ? (
          <p
            role="alert"
            className="border-2 border-black bg-[#f6e6e2] px-4 py-3 text-[15px] font-bold text-[#8a4242]"
          >
            {copy.failed}
          </p>
        ) : null}
      </form>
    </section>
  );
}
