import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { BookButton, CallButton, Heading } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  const field =
    "h-12 w-full border-2 border-black bg-white px-4 text-[16px] text-black outline-none placeholder:text-black/45 focus:bg-[#fff8e8]";
  const label = "mb-1.5 block text-[14px] font-bold text-black";
  const row =
    "flex items-center gap-4 border-t-2 border-white/20 py-4 text-[17px] first:border-t-0";

  return (
    <section
      id="petition-contact"
      aria-labelledby="touch-heading"
      className="bg-[#41301b] text-white"
    >
      <div className="mx-auto grid w-full max-w-[1392px] items-start gap-10 px-4 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <h2
            id="touch-heading"
            className="text-[clamp(34px,4.6vw,68px)] leading-[1] font-extrabold uppercase"
          >
            Get In Touch
          </h2>
          <span className="sr-only">{copy.heading}</span>
          <p className="mt-5 max-w-[480px] text-[18px] leading-relaxed text-white/80">
            {copy.intro}
          </p>
          <ul className="mt-8 max-w-[520px]">
            <li className={row}>
              <MapPin aria-hidden="true" className="size-5 shrink-0 text-[#ffc671]" />
              <span>786 Leeds Road, Bradford, BD3 9TY</span>
            </li>
            <li className={row}>
              <Phone aria-hidden="true" className="size-5 shrink-0 text-[#ffc671]" />
              <a href={PRACTICE_PHONE_HREF} className="underline underline-offset-4">
                {PRACTICE_PHONE}
              </a>
            </li>
            <li className={row}>
              <Mail aria-hidden="true" className="size-5 shrink-0 text-[#ffc671]" />
              <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
                {PRACTICE_EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <BookButton className="rounded-none border-2 border-white bg-[#ffc671] text-black hover:bg-white">
              {copy.bookLabel}
            </BookButton>
            <CallButton
              variant="outline"
              className="rounded-none border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
            />
          </div>
        </div>

        <div className="border-2 border-black bg-white p-6 text-black shadow-[8px_8px_0_0_#ffc671] md:p-8">
          {enquiry.sent ? (
            <div role="status">
              <div className="mb-4 flex size-12 items-center justify-center border-2 border-black bg-[#e4eee6]">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h3-md">
                Message Received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you. Your message has reached the practice, and the team will get back to you.
                For urgent dental pain, call{" "}
                <a href={PRACTICE_PHONE_HREF} className="font-bold underline underline-offset-4">
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <Button type="button" onClick={enquiry.reset} className="mt-6">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="touch-name" className={label}>
                    {copy.fieldLabels.name}
                  </label>
                  <input
                    id="touch-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="touch-email" className={label}>
                    {copy.fieldLabels.email}
                  </label>
                  <input
                    id="touch-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="touch-subject" className={label}>
                    {copy.fieldLabels.subject}
                  </label>
                  <input
                    id="touch-subject"
                    name="subject"
                    required
                    type="text"
                    placeholder="NHS dental funding"
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="touch-phone" className={label}>
                    {copy.fieldLabels.phone}
                  </label>
                  <input
                    id="touch-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+44"
                    className={field}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="touch-message" className={label}>
                  {copy.fieldLabels.message}
                </label>
                <textarea
                  id="touch-message"
                  name="message"
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className={`${field} h-auto resize-none py-3`}
                />
              </div>
              {enquiry.error ? (
                <p role="alert" className="text-small font-bold text-danger">
                  {enquiry.error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={enquiry.sending}
                className="flex h-14 w-full items-center justify-center gap-2 border-2 border-black bg-[#ffc671] text-[17px] font-extrabold uppercase shadow-[4px_4px_0_0_#000] t-colors hover:bg-black hover:text-white disabled:opacity-60"
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
