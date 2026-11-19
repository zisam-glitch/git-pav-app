import { ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <Section id="sign-form" theme="brown" space="lg" aria-labelledby="sign-heading">
      <div className="max-w-2xl">
        <h2 id="sign-heading" className="text-h2-md text-white">
          Sign <span className="text-gold">the Petition</span>
        </h2>
        <p className="mt-3 text-lead text-white/80">{copy.eligibility}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-white/7 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-4">
            <Label htmlFor="pet-name" className="mb-2 block text-white/90">
              {copy.fieldLabels.name}
            </Label>
            <Input
              id="pet-name"
              name="name"
              required
              type="text"
              autoComplete="name"
              placeholder={`${copy.fieldLabels.name} *`}
            />
          </div>

          <div className="sm:col-span-4">
            <Label htmlFor="pet-email" className="mb-2 block text-white/90">
              {copy.fieldLabels.email}
            </Label>
            <Input
              id="pet-email"
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder={`${copy.fieldLabels.email} *`}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pet-postcode" className="mb-2 block text-white/90">
              {copy.fieldLabels.postcode}
            </Label>
            <Input
              id="pet-postcode"
              name="postcode"
              required
              type="text"
              autoComplete="postal-code"
              placeholder={`${copy.fieldLabels.postcode} *`}
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="gold"
              disabled={status === "sending"}
              className="h-14 w-full"
            >
              {status === "sending" ? "Submitting..." : copy.submit}
            </Button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-small text-white/90">
          <input
            id="pet-resident"
            name="resident"
            type="checkbox"
            required
            className="size-4 accent-gold"
          />
          <label htmlFor="pet-resident">{copy.residentLabel}</label>
        </div>

        {status === "signed" ? (
          <p
            role="status"
            className="mt-5 flex items-center gap-2 rounded-lg bg-white/12 px-4 py-3 text-small font-medium text-white"
          >
            <ShieldCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
            {copy.thanks}
          </p>
        ) : null}

        {status === "failed" ? (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-black/30 px-4 py-3 text-small font-medium text-white"
          >
            {copy.failed}
          </p>
        ) : null}
      </form>
    </Section>
  );
}
