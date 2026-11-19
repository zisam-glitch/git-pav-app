import type { ReactNode } from "react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

/** A centred card for the pages email links open (verify email, set password). */
export function AccountLinkLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-fg">
      <Header />
      <main className="section-y flex-1">
        <div className="wrap-prose">
          <div className="mx-auto max-w-md rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-h3-md text-fg">{title}</h1>
            <div className="mt-4 space-y-4 text-body text-muted">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Opens the app when it's installed on this device. */
export function OpenAppLink() {
  return (
    <a
      href="pavdental://"
      className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-black px-6 text-label text-white t-colors hover:bg-black/80"
    >
      Open the Pav Dental app
    </a>
  );
}
