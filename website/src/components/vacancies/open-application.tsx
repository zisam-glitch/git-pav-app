import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function OpenApplication() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 text-center sm:px-10 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-black/55">
              Speculative Applications
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              Don&apos;t See Your <span className="text-[#754B3D]">Perfect Role?</span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-black/65">
              We&apos;re always growing and welcome speculative applications from passionate dental
              professionals who want to join our team.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/contact-us">
                  <Send className="size-4" aria-hidden="true" />
                  <span>Send Open Application</span>
                </a>
              </Button>

              <Button asChild variant="outline" size="lg">
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4 text-[#1B3745]" aria-hidden="true" />
                  <span>Call: {PRACTICE_PHONE}</span>
                </a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-black/60">
              <a
                href="mailto:hello@pavdental.com"
                className="flex items-center gap-2 transition-colors hover:text-[#1B3745]"
              >
                <Mail className="size-4 text-[#754B3D]" aria-hidden="true" />
                <span>hello@pavdental.com</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-[#754B3D]" aria-hidden="true" />
                <span>786 Leeds Road, Bradford, BD3 9TY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
