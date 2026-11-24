import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { BookButton, CallButton, Heading } from "@/components/hims";
import { CONTAINER, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  const field =
    "h-12 w-full border-0 border-b border-[#cfcac0] bg-transparent px-0 text-[16px] text-[#1b1b1b] outline-none placeholder:text-[#b0aea8] focus:border-[#1b1b1b]";
  const label = "text-[13px] font-medium text-[#6b6b70]";
  const row =
    "flex items-center gap-4 border-t border-[#e4e0d8] py-4 text-[17px] text-[#1b1b1b] first:border-t-0";

  return (
    <section id="petition-contact" aria-labelledby="touch-heading" className="pb-20 md:pb-28">
      <div className={CONTAINER}>
        <div className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-[#f3f0a8] p-8 md:p-12">
            <h2 id="touch-heading" className={TITLE}>
              Get In <span className="text-[#6f6d3f]">Touch</span>
            </h2>
            <span className="sr-only">{copy.heading}</span>
            <p className="mt-5 text-[18px] leading-[1.4] text-[#3d3d3a]">{copy.intro}</p>

            <ul className="mt-8">
              <li className={row}>
                <MapPin aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0" />
                <span>786 Leeds Road, Bradford, BD3 9TY</span>
              </li>
              <li className={row}>
                <Phone aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0" />
                <a href={PRACTICE_PHONE_HREF} className="underline underline-offset-4">
                  {PRACTICE_PHONE}
                </a>
              </li>
              <li className={row}>
                <Mail aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0" />
                <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
                  {PRACTICE_EMAIL}
                </a>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>{copy.bookLabel}</BookButton>
              <CallButton variant="outline" className="bg-white" />
            </div>
          </div>

          <div className="p-8 md:p-12">
            {enquiry.sent ? (
              <div className="max-w-[460px]" role="status">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#f3f0a8]">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </div>
                <Heading as="h3" size="h3-md">
                  Message Received
                </Heading>
                <p className="mt-3 text-body text-muted">
                  Thank you. Your message has reached the practice, and the team will get back to
                  you. For urgent dental pain, call{" "}
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
              <form onSubmit={enquiry.submit} className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
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
                  <p role="alert" className="text-small font-medium text-danger">
                    {enquiry.error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={enquiry.sending}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1b1b1b] text-[16px] font-medium text-white t-colors hover:bg-black disabled:opacity-60"
                >
                  <span>{enquiry.sending ? "Sending…" : copy.submit}</span>
                  <Send aria-hidden="true" className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
