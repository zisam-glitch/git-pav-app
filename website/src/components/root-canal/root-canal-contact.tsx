import { CheckCircle2, Clock, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function RootCanalContact() {
  const enquiry = useEnquiry("Root canal");

  return (
    <section id="contact" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto grid max-w-[87rem] items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Contact
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Get in <span className="text-[#754B3D]">Touch</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
                Have questions about tooth pain or need an assessment for root canal care?
                Contact our clinical team today.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-black/55">Emergency &amp; enquiry line</p>
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="mt-0.5 block text-sm font-medium text-black hover:text-[#1B3745]"
                    >
                      {PRACTICE_PHONE}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-black/55">Clinic address</p>
                    <p className="mt-0.5 text-sm font-medium text-black">
                      786 Leeds Road, Bradford, BD3 9TY
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-black/55">Opening hours</p>
                    <p className="mt-0.5 text-sm font-medium text-black">{PRACTICE_HOURS}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
              {enquiry.sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Message Received
                  </h3>
                  <p className="max-w-sm text-sm text-black/65">
                    Thank you for contacting Pav Dental. Our clinical coordinator will review your
                    symptoms and call you promptly.
                  </p>
                  <Button type="button" onClick={enquiry.reset} className="mt-2">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rc-name">Full Name</Label>
                      <Input id="rc-name" name="name" placeholder="e.g. Robert Taylor" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rc-email">Email Address</Label>
                      <Input
                        id="rc-email"
                        name="email"
                        type="email"
                        placeholder="robert@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rc-subject">Subject</Label>
                      <Input
                        id="rc-subject"
                        name="subject"
                        placeholder="Toothache / Root Canal Query"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rc-phone">Phone Number</Label>
                      <Input
                        id="rc-phone"
                        name="phone"
                        type="tel"
                        placeholder="+44 7700 900786"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rc-message">Tooth Symptoms &amp; Details</Label>
                    <Textarea
                      id="rc-message"
                      name="message"
                      placeholder="Describe the affected tooth, pain level, sensitivity to hot/cold, or duration..."
                      className="min-h-28 resize-none"
                      required
                    />
                  </div>

                  {enquiry.error && (
                    <p role="alert" className="text-sm font-medium text-[#8A3A34]">
                      {enquiry.error}
                    </p>
                  )}

                  <Button type="submit" size="lg" disabled={enquiry.sending}>
                    <Send className="size-4" />
                    {enquiry.sending ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
