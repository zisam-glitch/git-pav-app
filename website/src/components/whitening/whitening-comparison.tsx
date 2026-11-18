import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function WhiteningComparison() {
  return (
    <section id="comparison-matrix" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-4 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Whitening comparison
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Compare our 3 whitening{" "}
                <span className="text-[#754B3D]">ranges</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Side-by-side comparison of formulation, delivery method, sensitivity care, and
                included clinical guidance.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/8">
                      <th className="w-1/4 px-6 py-6 text-xs font-medium uppercase tracking-wider text-black/50">
                        Treatment detail
                      </th>
                      <th className="w-1/4 px-6 py-6">
                        <div className="text-xs font-medium text-black/55">Whitening Strips</div>
                        <div className="mt-1 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                          £65
                        </div>
                      </th>
                      <th className="hims-tile-warm w-1/4 px-6 py-6">
                        <span className="inline-block rounded-full bg-[#1B3745] px-2.5 py-0.5 text-[11px] font-medium text-white">
                          Day &amp; Night Kits
                        </span>
                        <div className="mt-1.5 text-xs font-medium text-black/70">
                          Home Teeth Whitening
                        </div>
                        <div className="mt-1 font-display text-2xl font-normal tracking-[-0.03em] text-[#754B3D]">
                          £295
                        </div>
                      </th>
                      <th className="w-1/4 px-6 py-6">
                        <div className="text-xs font-medium text-black/55">
                          Home &amp; In Office Whitening
                        </div>
                        <div className="mt-1 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                          £495
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8 text-black/80">
                    <tr>
                      <td className="px-6 py-4 font-medium text-black">System &amp; Format</td>
                      <td className="px-6 py-4 text-black/65">
                        Mint-flavoured dissolving strips (14 applications / 28 strips)
                      </td>
                      <td className="hims-tile-warm px-6 py-4 font-medium text-black">
                        4 x 3ml syringes + 30ml pre-polishing paste
                      </td>
                      <td className="px-6 py-4 text-black/65">
                        BEAM in-office session + BEAM Professional take-home kit
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-black">Active Formula</td>
                      <td className="px-6 py-4 text-black/65">
                        Advanced enamel-safe non-slip gel strip
                      </td>
                      <td className="hims-tile-warm px-6 py-4 text-black/80">
                        Hydrogen peroxide or carbamide peroxide (UK-made)
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1B3745]">
                        Optimized 6% Hydrogen Peroxide + PAP hybrid gel
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-black">Sensitivity &amp; Enamel Care</td>
                      <td className="px-6 py-4 text-black/65">
                        Short application time; no strips to remove
                      </td>
                      <td className="hims-tile-warm px-6 py-4 text-black/80">
                        Potassium nitrate, calcium &amp; fluoride blend
                      </td>
                      <td className="px-6 py-4 text-black/65">
                        Pre-whitening varnish primes teeth prior to session
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-black">Best For</td>
                      <td className="px-6 py-4 text-black/65">
                        On-the-go touch-ups &amp; ongoing smile maintenance
                      </td>
                      <td className="hims-tile-warm px-6 py-4 text-black/80">
                        Day or night dentist-crafted whitening at home
                      </td>
                      <td className="px-6 py-4 text-black/65">
                        In-clinic priming &amp; brightening with home continuation
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-5 font-medium text-black">Next Step</td>
                      <td className="px-6 py-5">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a href={BOOKING_URL}>Book Strips</a>
                        </Button>
                      </td>
                      <td className="hims-tile-warm px-6 py-5">
                        <Button asChild size="sm" className="w-full">
                          <a href={BOOKING_URL}>Book Home Kit</a>
                        </Button>
                      </td>
                      <td className="px-6 py-5">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a href={BOOKING_URL}>Book In Office</a>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
