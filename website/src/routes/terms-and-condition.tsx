import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";

export const Route = createFileRoute("/terms-and-condition")({
  head: () => seoHead("/terms-and-condition"),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Working Draft • Pending Legal Review
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Last updated: 27 October 2026 • Working Compliance Draft (LG-08)
            </p>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 mb-8 leading-relaxed">
            <strong>Pre-Launch Notice:</strong> These terms govern the booking, deposits, cancellation policy, and clinical consultations of the Pav Dental platform. They represent a working draft undergoing formal legal review (LG-08) prior to full launch.
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">1. About Pav Dental</h2>
              <p className="mt-3 text-sm">
                These terms govern your use of the Pav Dental website, mobile application, and dental healthcare services provided by Pav Dental:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li><strong>Practice Address:</strong> 786 Leeds Road, Bradford, BD3 9TY</li>
                <li><strong>Telephone:</strong> 0800 1938 786 / +44 7311 871456</li>
                <li><strong>Email:</strong> <a href="mailto:hello@pavdental.com" className="text-emerald-700 underline">hello@pavdental.com</a></li>
                <li><strong>Clinical Lead:</strong> Dr Hassan Bhojani (GDC #262970)</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">2. Bookings, Deposits & Cancellations</h2>
              <div className="mt-3 space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-slate-900">2.1 Booking Deposits</h3>
                  <p className="text-slate-600">To secure an appointment slot with our dentists or mobile dental units, a booking deposit is payable at the time of reservation. The deposit is credited toward the total fee of your planned treatment.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">2.2 Patient Cancellation Policy</h3>
                  <p className="text-slate-600">You may reschedule or cancel your appointment without penalty if you provide at least 24 hours' notice prior to your scheduled time. Deposits for cancellations made with less than 24 hours' notice may be retained to cover clinician scheduling costs.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">2.3 Mobile Dental Van Dispatches</h3>
                  <p className="text-slate-600">If you request a mobile dental van visit, cancellations made prior to the van being en-route will receive a full refund. Once the mobile unit is en-route or arrives on site, the deposit is retained as a call-out fee to cover vehicle dispatch and travel costs.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">2.4 Practice Cancellations</h3>
                  <p className="text-slate-600">If Pav Dental must reschedule or cancel your appointment due to unforeseen clinician illness or clinical emergency, you will receive prompt notice and the option of an immediate priority reschedule or a 100% full refund of your deposit.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">3. Clinical Care & Treatment Plans</h2>
              <p className="mt-3 text-sm">
                All dental treatments are performed exclusively by registered dental practitioners licensed by the General Dental Council (GDC).
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                <li><strong>Estimates & Treatment Plans:</strong> Following your examination, your dentist will provide a clear, itemised treatment plan explaining clinical findings, proposed procedures, risks, benefits, and costs.</li>
                <li><strong>Informed Consent:</strong> Digital acknowledgement in our mobile app confirms that you have reviewed your plan. Formal clinical consent to treatment is taken in person prior to the start of any dental procedure.</li>
                <li><strong>Prescriptions:</strong> Private prescriptions issued through our service are clinically assessed and signed by authorised prescribers in compliance with UK prescribing laws.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">4. Patient Responsibilities</h2>
              <p className="mt-3 text-sm">
                To enable safe clinical practice, you agree to:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                <li>Provide accurate, complete medical and medication histories, including updates on allergies or health changes.</li>
                <li>Follow post-treatment care instructions and aftercare guidance provided by your treating dentist.</li>
                <li>Treat our dental nurses, clinicians, drivers, and reception team with respect. Abusive or aggressive behaviour will not be tolerated and may result in immediate withdrawal of care.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-serif text-xl font-semibold text-slate-900">5. Contact & Complaints</h2>
              <p className="mt-3 text-sm">
                We take patient satisfaction seriously. For enquiries, feedback, or complaints regarding our services, please view our{" "}
                <a href="/complaints-policy" className="text-emerald-700 underline font-semibold">Complaints Procedure</a> or email us at{" "}
                <a href="mailto:hello@pavdental.com" className="text-emerald-700 underline">hello@pavdental.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
