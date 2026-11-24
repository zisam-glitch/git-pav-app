import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { BookButton, CallButton, Heading } from "@/components/hims";
import { CONTAINER, LEAD, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PETITION } from "@/content/petition";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

/** "Get In Touch": the live page's contact form. Messages go to the practice through the dashboard. */
export function PetitionContact() {
  const enquiry = useEnquiry("Petition");
  const { contact: copy } = PETITION;

  return (
    <section id="petition-contact" aria-labelledby="touch-heading" className="pb-20 md:pb-28">
      <div className={`${CONTAINER} grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14`}>
        <div className="max-w-[460px]">
          <h2 id="touch-heading" className={TITLE}>
            Get In <span className={MUTED_TITLE}>Touch</span>
          </h2>
          <p className={`${LEAD} mt-5`}>{copy.intro}</p>
          <span className="sr-only">{copy.heading}</span>

          <ul className="mt-8 space-y-3 text-body">
            <li className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_10px_36px_rgba(20,20,40,0.05)] text-fg">
              <MapPin aria-hidden="true" className="size-4 shrink-0 text-[#b5644a]" />
              <span>786 Leeds Road, Bradford, BD3 9TY</span>
            </li>
            <li className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_10px_36px_rgba(20,20,40,0.05)]">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-[#b5644a]" />
              <a
                href={PRACTICE_PHONE_HREF}
                className="text-fg underline underline-offset-4 t-colors hover:text-[#8a4242]"
              >
                {PRACTICE_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_10px_36px_rgba(20,20,40,0.05)]">
              <Mail aria-hidden="true" className="size-4 shrink-0 text-[#b5644a]" />
              <a
                href={`mailto:${PRACTICE_EMAIL}`}
                className="text-fg underline underline-offset-4 t-colors hover:text-[#8a4242]"
              >
                {PRACTICE_EMAIL}
              </a>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>{copy.bookLabel}</BookButton>
            <CallButton variant="outline" className="bg-white" />
          </div>
        </div>

        <div className={`${SOFT_CARD} p-6 md:p-10`}>
          {enquiry.sent ? (
            <div className="max-w-[460px]" role="status">
              <div className="mb-4 flex size-12 items-center justify-center rounded-pill bg-sage text-fg">
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
            <form onSubmit={enquiry.submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="touch-name">{copy.fieldLabels.name}</Label>
                  <Input
                    id="touch-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="touch-email">{copy.fieldLabels.email}</Label>
                  <Input
                    id="touch-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="touch-subject">{copy.fieldLabels.subject}</Label>
                  <Input
                    id="touch-subject"
                    name="subject"
                    required
                    type="text"
                    placeholder="NHS dental funding"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="touch-phone">{copy.fieldLabels.phone}</Label>
                  <Input
                    id="touch-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+44"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="touch-message">{copy.fieldLabels.message}</Label>
                <Textarea
                  id="touch-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help?"
                />
              </div>

              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-danger">
                  {enquiry.error}
                </p>
              ) : null}

              <Button type="submit" disabled={enquiry.sending} className="w-full">
                <span>{enquiry.sending ? "Sending…" : copy.submit}</span>
                <Send aria-hidden="true" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
