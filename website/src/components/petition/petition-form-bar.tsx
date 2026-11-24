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
    "h-12 w-full rounded-[12px] border border-[#e4e0d8] bg-white px-4 text-[16px] text-[#1b1b1b] outline-none placeholder:text-[#9a9a9e] focus:border-[#1b1b1b]";
  const label = "mb-2 block text-[14px] font-medium text-[#1b1b1b]";

  return (
    <section
      id="sign-form"
      aria-labelledby="sign-heading"
      className="scroll-mt-28 rounded-[22px] bg-white p-6 shadow-[0_10px_36px_rgba(20,20,40,0.07)] md:p-8 lg:sticky lg:top-28"
    >
      <h2
        id="sign-heading"
        className="text-[28px] leading-[1.1] font-medium tracking-[-0.02em] text-[#1b1b1b]"
      >
        Sign <span className="text-[#8b8d92]">the Petition</span>
      </h2>
      <p className="mt-3 text-[16px] text-[#6b6b70]">{copy.eligibility}</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label htmlFor="pet-name" className={label}>
            {copy.fieldLabels.name}
          </label>
          <input
            id="pet-name"
            name="name"
            required
            type="text"
            autoComplete="name"
            placeholder={`${copy.fieldLabels.name} *`}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="pet-email" className={label}>
            {copy.fieldLabels.email}
          </label>
          <input
            id="pet-email"
            name="email"
            required
            type="email"
            autoComplete="email"
            placeholder={`${copy.fieldLabels.email} *`}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="pet-postcode" className={label}>
            {copy.fieldLabels.postcode}
          </label>
          <input
            id="pet-postcode"
            name="postcode"
            required
            type="text"
            autoComplete="postal-code"
            placeholder={`${copy.fieldLabels.postcode} *`}
            className={field}
          />
        </div>

        <div className="flex items-center gap-3 text-[14px] text-[#1b1b1b]">
          <input
            id="pet-resident"
            name="resident"
            type="checkbox"
            required
            className="size-4 accent-[#1b1b1b]"
          />
          <label htmlFor="pet-resident">{copy.residentLabel}</label>
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-2 h-14 w-full rounded-full bg-[#1b1b1b] text-[16px] font-medium text-white t-colors hover:bg-black disabled:opacity-60"
        >
          {status === "sending" ? "Submitting..." : copy.submit}
        </button>

        {status === "signed" ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-[12px] bg-[#f3f0a8] px-4 py-3 text-[14px] font-medium text-[#1b1b1b]"
          >
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            {copy.thanks}
          </p>
        ) : null}

        {status === "failed" ? (
          <p
            role="alert"
            className="rounded-[12px] bg-[#f6e6e2] px-4 py-3 text-[14px] font-medium text-[#8a4242]"
          >
            {copy.failed}
          </p>
        ) : null}
      </form>
    </section>
  );
}
