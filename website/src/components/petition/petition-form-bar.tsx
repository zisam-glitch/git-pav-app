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
    <section id="sign-form" aria-labelledby="sign-heading" className="scroll-mt-24 px-3 md:px-4">
      <div className="relative mx-auto max-w-[1392px] overflow-hidden rounded-[28px] bg-[#453421]">
        <img
          src="/images/generated/about-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="relative px-6 py-12 md:px-14 md:py-20">
          <div className="max-w-[460px]">
            <h2
              id="sign-heading"
              className="text-[clamp(32px,4vw,52px)] leading-[1.05] font-medium tracking-[-0.02em] text-white"
            >
              Sign the Petition
            </h2>
            <p className="mt-3 text-[18px] text-white/85">{copy.eligibility}</p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-3">
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

              <div className="mt-1 flex items-center gap-3 text-[15px] text-white">
                <input
                  id="pet-resident"
                  name="resident"
                  type="checkbox"
                  required
                  className="size-4 accent-[#f3b968]"
                />
                <label htmlFor="pet-resident">{copy.residentLabel}</label>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 h-14 w-full rounded-full bg-black text-[16px] font-medium text-white t-colors hover:bg-[#1b1b1b] disabled:opacity-60"
              >
                {status === "sending" ? "Submitting..." : copy.submit}
              </button>

              {status === "signed" ? (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-[14px] bg-white px-4 py-3 text-[15px] font-medium text-[#1b1b1b]"
                >
                  <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                  {copy.thanks}
                </p>
              ) : null}
              {status === "failed" ? (
                <p
                  role="alert"
                  className="rounded-[14px] bg-[#f6e6e2] px-4 py-3 text-[15px] font-medium text-[#8a4242]"
                >
                  {copy.failed}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
