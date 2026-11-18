import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

const FIELD =
  "w-full rounded-xl border border-black/10 bg-[#FAF8F2] px-3.5 text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  return (
    <section className="bg-[#FBF8F5] pb-20 pt-8 sm:pt-12" aria-labelledby="touch-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
          <div className="mb-8 text-center">
            <h2
              id="touch-heading"
              className="font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl"
            >
              {copy.heading}
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm text-black/65">{copy.intro}</p>
          </div>

          {enquiry.sent ? (
            <div
              className="rounded-[1.25rem] border border-black/6 bg-[#FAF8F2] p-8 text-center"
              role="status"
            >
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#1B3745] text-[#ECD880]">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-normal tracking-[-0.02em] text-black">
                Message Received
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-black/65">
                Thank you. Your message has reached the practice, and the team will get back to
                you. For urgent dental pain, call{" "}
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="font-medium text-[#754B3D] underline underline-offset-4"
                >
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <Button onClick={enquiry.reset} className="mt-6" size="sm">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="touch-name" className="mb-1.5 block text-xs font-medium text-black/75">
                    {copy.fieldLabels.name}
                  </label>
                  <input
                    id="touch-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    className={`${FIELD} h-11`}
                  />
                </div>
                <div>
                  <label htmlFor="touch-email" className="mb-1.5 block text-xs font-medium text-black/75">
                    {copy.fieldLabels.email}
                  </label>
                  <input
                    id="touch-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    className={`${FIELD} h-11`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="touch-subject" className="mb-1.5 block text-xs font-medium text-black/75">
                    {copy.fieldLabels.subject}
                  </label>
                  <input
                    id="touch-subject"
                    name="subject"
                    required
                    type="text"
                    className={`${FIELD} h-11`}
                  />
                </div>
                <div>
                  <label htmlFor="touch-phone" className="mb-1.5 block text-xs font-medium text-black/75">
                    {copy.fieldLabels.phone}
                  </label>
                  <input
                    id="touch-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={`${FIELD} h-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="touch-message" className="mb-1.5 block text-xs font-medium text-black/75">
                  {copy.fieldLabels.message}
                </label>
                <textarea
                  id="touch-message"
                  name="message"
                  required
                  rows={5}
                  className={`${FIELD} p-3.5`}
                />
              </div>

              <div className="space-y-3 pt-2">
                {enquiry.error && (
                  <p role="alert" className="text-sm text-[#8A3A34]">
                    {enquiry.error}
                  </p>
                )}
                <Button type="submit" disabled={enquiry.sending} size="lg" className="w-full sm:w-auto">
                  {enquiry.sending ? "Sending…" : copy.submit}
                  <Send className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <a href={BOOKING_URL}>
              {copy.bookLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
