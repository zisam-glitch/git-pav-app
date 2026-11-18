import { ArrowRight } from "lucide-react";
import { BookButton, CallButton, Heading, Section } from "@/components/hims";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { NOT_FOUND } from "@/content/not-found";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

/**
 * Shown for an address that is no page. The response is a real 404 and the head says noindex
 * (see the root route), so search engines drop the address; people get the site's header, footer
 * and the pages they most likely wanted.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-fg">
      <Header />
      <main className="flex-1">
        <Section theme="white" width="wide" space="default">
          <div className="max-w-3xl">
            <p className="text-caption font-medium text-subtle">{NOT_FOUND.code}</p>
            <Heading
              as="h1"
              size="hero"
              accent="not found"
              tone="terracotta"
              inline
              className="mt-3"
            >
              Page
            </Heading>
            <p className="mt-4 text-lead text-muted">{NOT_FOUND.text}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookButton>{NOT_FOUND.bookLabel}</BookButton>
              <CallButton variant="outline" />
            </div>
          </div>

          <ul className="mt-12 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NOT_FOUND.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group flex items-center justify-between rounded-xl bg-tile-cream p-5 text-fg t-lift hover:bg-white"
                >
                  <span className="text-label">{link.label}</span>
                  <ArrowRight
                    className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-xl bg-cream p-6">
            <p className="text-body text-fg">
              {NOT_FOUND.pain}{" "}
              <a
                href={PRACTICE_PHONE_HREF}
                className="whitespace-nowrap font-medium underline underline-offset-4 hover:text-muted"
              >
                {PRACTICE_PHONE}
              </a>
              .
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
