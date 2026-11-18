import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

const FIELD =
  "w-full rounded-lg border border-border/70 bg-[#fdfcfb] px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  return (
    <section className="border-t border-border/40 bg-white py-16 sm:py-24" aria-labelledby="touch-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 id="touch-heading" className="font-display text-3xl font-bold tracking-tight text-[#844d1e] sm:text-4xl">
            {copy.heading}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted sm:text-sm">{copy.intro}</p>
        </div>

        {enquiry.sent ? (
          <div className="rounded-2xl border border-primary/20 bg-[#faf6f0] p-8 text-center shadow-xs" role="status">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-bold text-fg">Message Received</h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted sm:text-sm">
              Thank you. Your message has reached the practice, and the team will get back to you. For urgent dental pain,
              call{" "}
              <a href={PRACTICE_PHONE_HREF} className="font-semibold text-primary underline">
                {PRACTICE_PHONE}
              </a>
              .
            </p>
            <Button onClick={enquiry.reset} className="accent-gradient mt-6 h-10 px-6 text-xs text-white">
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={enquiry.submit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="touch-name" className="mb-1.5 block text-xs font-semibold text-fg/80">
                  {copy.fieldLabels.name}
                </label>
                <input id="touch-name" name="name" required type="text" autoComplete="name" className={`${FIELD} h-11`} />
              </div>
              <div>
                <label htmlFor="touch-email" className="mb-1.5 block text-xs font-semibold text-fg/80">
                  {copy.fieldLabels.email}
                </label>
                <input id="touch-email" name="email" required type="email" autoComplete="email" className={`${FIELD} h-11`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="touch-subject" className="mb-1.5 block text-xs font-semibold text-fg/80">
                  {copy.fieldLabels.subject}
                </label>
                <input id="touch-subject" name="subject" required type="text" className={`${FIELD} h-11`} />
              </div>
              <div>
                <label htmlFor="touch-phone" className="mb-1.5 block text-xs font-semibold text-fg/80">
                  {copy.fieldLabels.phone}
                </label>
                <input id="touch-phone" name="phone" type="tel" autoComplete="tel" className={`${FIELD} h-11`} />
              </div>
            </div>

            <div>
              <label htmlFor="touch-message" className="mb-1.5 block text-xs font-semibold text-fg/80">
                {copy.fieldLabels.message}
              </label>
              <textarea id="touch-message" name="message" required rows={5} className={`${FIELD} p-3.5`} />
            </div>

            <div className="space-y-3 pt-2">
              {enquiry.error && (
                <p role="alert" className="text-sm text-red-700">
                  {enquiry.error}
                </p>
              )}
              <Button
                type="submit"
                disabled={enquiry.sending}
                className="accent-gradient h-11 gap-2 rounded-lg px-8 text-xs font-semibold text-white shadow-xs transition-all hover:opacity-95 sm:text-sm"
              >
                {enquiry.sending ? "Sending…" : copy.submit}
                <Send className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        <div className="mt-14 text-center">
          <a
            href={BOOKING_URL}
            className="inline-flex items-center gap-2 rounded-lg bg-[#925a27] px-7 py-3 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-[#844d1e] active:scale-95 sm:text-sm"
          >
            {copy.bookLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
