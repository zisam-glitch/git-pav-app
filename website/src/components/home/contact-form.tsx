import { useState, type FormEvent } from "react";
import { FaqList, type FaqItem } from "@/components/hims";
import { LIVE_PAGES } from "@/content/live-pages";
import { api } from "@/lib/api";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

/** The first four questions of the live FAQ page, word for word. */
function homeFaqs(): FaqItem[] {
  const items: FaqItem[] = [];
  const blocks = LIVE_PAGES["/faq"].blocks;
  for (let i = 0; i < blocks.length - 1 && items.length < 4; i += 1) {
    const heading = blocks[i];
    const answer = blocks[i + 1];
    if (heading.kind === "heading" && answer.kind === "paragraph") {
      items.push({ q: heading.text, a: answer.text });
    }
  }
  return items;
}

const FIELD =
  "h-14 w-full rounded-[14px] border-2 border-white bg-white px-4 text-label text-fg placeholder:font-normal placeholder:text-subtle focus-visible:border-black focus-visible:outline-none";

/** FAQ accordion, then the Hims photo banner holding the live "Get In Touch" form. */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    try {
      await api.forms.submitContact({
        name,
        email,
        phone: phone || undefined,
        subject: subject || "Website Enquiry",
        message,
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setError(
        msg || "Could not submit your message. Please try again or call our clinic directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="faq" className="bg-white pb-6 md:pb-10">
        <div className="mx-auto max-w-[736px] px-4">
          <h2 className="mb-6 text-h2-md text-fg">Frequently Asked Questions</h2>
          <FaqList items={homeFaqs()} defaultOpen={null} />
        </div>
      </section>

      <section id="contact" className="bg-white px-1 pb-4 md:px-1">
        <div className="relative overflow-hidden rounded-[32px] bg-[#9a6a3d]">
          <img
            src="/images/home/banner-smile.jpg"
            alt="Smiling young woman in an olive knit polo against a warm caramel backdrop"
            loading="lazy"
            width={1536}
            height={1024}
            className="absolute inset-0 size-full object-cover object-right"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#8a5a30]/90 via-[#8a5a30]/55 to-transparent md:from-[#8a5a30]/70 md:via-transparent"
          />
          <div className="relative z-10 px-6 py-12 md:min-h-[780px] md:px-[3.5rem] md:py-16">
            <div className="max-w-[460px] text-white">
              <h2 className="text-h2-md">Get In Touch</h2>
              <p className="mt-4 text-lead">
                Ready to take control of your dental health? Contact us to book your appointment
                today!
              </p>
              {sent ? (
                <div className="mt-8" role="status">
                  <p className="text-h4">Message received</p>
                  <p className="mt-3 text-body">
                    Thank you. A member of the team will reply during clinic hours. For pain now,
                    call the emergency line.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 h-14 rounded-pill bg-black px-8 text-label text-white"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-8 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label htmlFor="name" className="text-small font-medium">Full Name</label>
                      <input id="name" name="name" autoComplete="name" required placeholder="Jane Doe" className={FIELD} />
                    </div>
                    <div className="grid gap-1.5">
                      <label htmlFor="email" className="text-small font-medium">Email Address</label>
                      <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={FIELD} />
                    </div>
                    <div className="grid gap-1.5">
                      <label htmlFor="phone" className="text-small font-medium">Phone</label>
                      <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+44" className={FIELD} />
                    </div>
                    <div className="grid gap-1.5">
                      <label htmlFor="subject" className="text-small font-medium">Subject</label>
                      <input id="subject" name="subject" placeholder="Check-up / emergency" className={FIELD} />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <label htmlFor="message" className="text-small font-medium">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="How can we help?"
                      className={FIELD + " h-auto resize-none py-3"}
                    />
                  </div>
                  {error ? (
                    <p role="alert" className="rounded-lg bg-white px-3 py-2 text-small font-medium text-danger">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-full rounded-pill bg-black text-small font-medium text-white t-colors hover:bg-black/80 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
              <p className="mt-6 text-caption text-white/90">
                786 Leeds Road, Bradford, BD3 9TY ·{" "}
                <a className="underline" href={PRACTICE_PHONE_HREF}>{PRACTICE_PHONE}</a> ·{" "}
                <a className="underline" href="tel:+447311871456">+44 7311 871456</a> ·{" "}
                <a className="underline" href={`mailto:${PRACTICE_EMAIL}`}>{PRACTICE_EMAIL}</a>
                <br />
                Founder &amp; principal dentist — Dr Hassan Bhojani. Registered with the General
                Dental Council. Regulated by the Care Quality Commission.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
