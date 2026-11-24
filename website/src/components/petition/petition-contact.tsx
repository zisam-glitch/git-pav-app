import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { BookButton, CallButton, Heading } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { PetitionField } from "./petition-field";
import { useEnquiry } from "@/lib/use-enquiry";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  const info =
    "flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[15px] shadow-[0_2px_10px_rgba(20,20,40,0.06)]";

  return (
    <section
      id="petition-contact"
      aria-labelledby="touch-heading"
      className="bg-[#f9f9f9] py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-[560px] px-4">
        <h2
          id="touch-heading"
          className="text-center text-[clamp(32px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.03em]"
        >
          Get In <span className="text-[#8b8d92]">Touch</span>
        </h2>
        <span className="sr-only">{copy.heading}</span>
        <p className="mt-4 text-center text-[18px] leading-[1.4] text-[#55565a]">{copy.intro}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className={info}>
            <MapPin aria-hidden="true" className="size-4 text-[#b5644a]" />
            786 Leeds Road, Bradford, BD3 9TY
          </span>
          <a href={PRACTICE_PHONE_HREF} className={`${info} underline underline-offset-4`}>
            <Phone aria-hidden="true" className="size-4 text-[#b5644a]" />
            {PRACTICE_PHONE}
          </a>
          <a href={`mailto:${PRACTICE_EMAIL}`} className={`${info} underline underline-offset-4`}>
            <Mail aria-hidden="true" className="size-4 text-[#b5644a]" />
            {PRACTICE_EMAIL}
          </a>
        </div>

        <div className="mt-10">
          {enquiry.sent ? (
            <div role="status" className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#f3f0a8]">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h3-md">
                Message Received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you. Your message has reached the practice, and the team will get back to you.
                For urgent dental pain, call{" "}
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="font-medium text-[#b5644a] underline underline-offset-4"
                >
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <Button type="button" onClick={enquiry.reset} className="mt-6">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-3">
              <PetitionField
                id="touch-name"
                name="name"
                required
                type="text"
                autoComplete="name"
                label={copy.fieldLabels.name}
              />
              <PetitionField
                id="touch-email"
                name="email"
                required
                type="email"
                autoComplete="email"
                label={copy.fieldLabels.email}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <PetitionField
                  id="touch-subject"
                  name="subject"
                  required
                  type="text"
                  label={copy.fieldLabels.subject}
                />
                <PetitionField
                  id="touch-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  label={copy.fieldLabels.phone}
                />
              </div>
              <div className="relative">
                <textarea
                  id="touch-message"
                  name="message"
                  required
                  rows={5}
                  placeholder={copy.fieldLabels.message}
                  className="peer w-full resize-none rounded-[14px] border border-transparent bg-white px-4 pt-7 pb-3 text-[16px] shadow-[0_2px_10px_rgba(20,20,40,0.06)] outline-none placeholder-transparent focus:border-[#1b1b1b]"
                />
                <label
                  htmlFor="touch-message"
                  className="pointer-events-none absolute top-2.5 left-4 text-[12px] text-[#6b6b70] transition-all peer-placeholder-shown:top-[19px] peer-placeholder-shown:text-[16px] peer-focus:top-2.5 peer-focus:text-[12px]"
                >
                  {copy.fieldLabels.message}
                </label>
              </div>
              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-danger">
                  {enquiry.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={enquiry.sending}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-[16px] font-medium text-white t-colors hover:bg-[#1b1b1b] disabled:opacity-60"
              >
                <span>{enquiry.sending ? "Sending…" : copy.submit}</span>
                <Send aria-hidden="true" className="size-4" />
              </button>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <BookButton>{copy.bookLabel}</BookButton>
                <CallButton variant="outline" />
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
