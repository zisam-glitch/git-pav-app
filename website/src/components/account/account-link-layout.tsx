import type { ReactNode } from "react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

/** A centred card for the pages email links open (verify email, set password). */
export function AccountLinkLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <Header />
      <div className="px-4 pt-28 pb-20 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">{children}</div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

/** Opens the app when it's installed on this device. */
export function OpenAppLink() {
  return (
    <a
      href="pavdental://"
      className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 font-semibold text-sm text-white hover:bg-slate-800"
    >
      Open the Pav Dental app
    </a>
  );
}
