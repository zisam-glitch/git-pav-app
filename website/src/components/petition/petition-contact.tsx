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

  return (
    <section
      id="petition-contact"
      aria-labelledby="touch-heading"
      className="border-t border-black"
    >
      <div className="mx-auto grid w-full max-w-[1392px] gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2
            id="touch-heading"
            className="text-[clamp(40px,6vw,88px)] leading-[0.95] font-medium tracking-[-0.04em]"
          >
            Get In
            <br />
            Touch
          </h2>
          <span className="sr-only">{copy.heading}</span>
          <p className="mt-6 max-w-[440px] text-[19px] leading-[1.45] text-black/70">
            {copy.intro}
          </p>

          <dl className="mt-10 max-w-[440px] divide-y divide-black/15 border-y border-black/15 text-[18px]">
            <div className="flex items-center gap-3 py-4">
              <MapPin aria-hidden="true" className="size-5 shrink-0" />
              <span>786 Leeds Road, Bradford, BD3 9TY</span>
            </div>
            <div className="flex items-center gap-3 py-4">
              <Phone aria-hidden="true" className="size-5 shrink-0" />
              <a href={PRACTICE_PHONE_HREF} className="underline underline-offset-4">
                {PRACTICE_PHONE}
              </a>
            </div>
            <div className="flex items-center gap-3 py-4">
              <Mail aria-hidden="true" className="size-5 shrink-0" />
              <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
                {PRACTICE_EMAIL}
              </a>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>{copy.bookLabel}</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <div>
          {enquiry.sent ? (
            <div role="status">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h3-md">
                Message Received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you. Your message has reached the practice, and the team will get back to you.
                For urgent dental pain, call{" "}
                <a href={PRACTICE_PHONE_HREF} className="font-medium underline underline-offset-4">
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <Button type="button" onClick={enquiry.reset} className="mt-6">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-8">
              <div className="grid gap-8 sm:grid-cols-2">
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
              <div>
                <label
                  htmlFor="touch-message"
                  className="block text-[13px] tracking-wide text-black/55 uppercase"
                >
                  {copy.fieldLabels.message}
                </label>
                <textarea
                  id="touch-message"
                  name="message"
                  required
                  rows={4}
                  className="mt-1 w-full resize-none border-0 border-b border-black/25 bg-transparent px-0 py-2 text-[20px] outline-none focus:border-black"
                />
              </div>
              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-danger">
                  {enquiry.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={enquiry.sending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-[17px] font-medium text-white t-colors hover:bg-black/80 disabled:opacity-60"
              >
                <span>{enquiry.sending ? "Sending…" : copy.submit}</span>
                <Send aria-hidden="true" className="size-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
