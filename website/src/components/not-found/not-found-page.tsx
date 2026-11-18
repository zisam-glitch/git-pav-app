import { ArrowRight, Phone } from "lucide-react";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Button } from "@/components/ui/button";
import { NOT_FOUND } from "@/content/not-found";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

/**
 * Shown for an address that is no page. The response is a real 404 and the head says noindex
 * (see the root route), so search engines drop the address; people get the site's header, footer
 * and the pages they most likely wanted.
 */
export function NotFoundPage() {
  const firstColumn = NOT_FOUND.links.slice(0, 4);
  const secondColumn = NOT_FOUND.links.slice(4);

  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <Header />
      <div className="pt-24 sm:pt-28">
        <section className="mx-auto max-w-[87rem] px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                {NOT_FOUND.code}
              </p>
              <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.05] text-black sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#AD6E4B] via-[#8A3A34] to-[#754B3D] bg-clip-text text-transparent">
                  {NOT_FOUND.title}
                </span>{" "}
                <span className="text-black">— let&apos;s get you back to care</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-black/65">
                {NOT_FOUND.text}
              </p>
              <p className="mt-3 text-sm text-black/65">
                Back to{" "}
                <a
                  href="/"
                  className="font-medium text-black underline decoration-black/30 underline-offset-4 transition-colors hover:text-[#1B3745]"
                >
                  pavdental.com
                </a>
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-black/10 pt-8">
                <div>
                  <p className="text-xs font-medium text-black/45">Dental treatments</p>
                  <ul className="mt-3 space-y-2.5">
                    {firstColumn.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-base font-normal text-black transition-colors hover:text-[#754B3D]"
                        >
                          <span>{link.label}</span>
                          <ArrowRight
                            className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-black/45">Practice</p>
                  <ul className="mt-3 space-y-2.5">
                    {secondColumn.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-base font-normal text-black transition-colors hover:text-[#754B3D]"
                        >
                          <span>{link.label}</span>
                          <ArrowRight
                            className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href={BOOKING_URL}>{NOT_FOUND.bookLabel}</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <a href={PRACTICE_PHONE_HREF}>
                    <Phone className="size-4" aria-hidden="true" />
                    {PRACTICE_PHONE}
                  </a>
                </Button>
              </div>

              <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/55">
                {NOT_FOUND.pain}{" "}
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="whitespace-nowrap font-medium text-[#1B3745] underline underline-offset-4 hover:text-[#754B3D]"
                >
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[32rem] overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                <img
                  src="/media/hims/card-whitening.jpg"
                  alt="Pav Dental patient care in Bradford"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
