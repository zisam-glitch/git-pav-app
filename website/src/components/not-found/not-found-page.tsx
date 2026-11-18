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
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <Header />
      <div className="pt-16">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8 sm:py-28">
          <p className="text-sm font-semibold uppercase text-primary">{NOT_FOUND.code}</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-[#2a1c12] sm:text-5xl">
            {NOT_FOUND.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{NOT_FOUND.text}</p>

          <ul className="mx-auto mt-10 grid max-w-xl list-none grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {NOT_FOUND.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-xl   bg-white px-4 py-3 text-sm font-medium text-fg shadow-2xs transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={BOOKING_URL}>{NOT_FOUND.bookLabel}</a>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted">
            {NOT_FOUND.pain}{" "}
            <a href={PRACTICE_PHONE_HREF} className="whitespace-nowrap font-semibold text-primary underline underline-offset-2">
              {PRACTICE_PHONE}
            </a>
            .
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
