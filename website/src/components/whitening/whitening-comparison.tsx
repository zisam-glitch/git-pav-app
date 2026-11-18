import React from "react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function WhiteningComparison() {
  return (
    <section id="comparison-matrix" className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Compare Our 3 Whitening Treatments
          </h2>
          <p className="text-sm sm:text-base text-[#6b5848] mt-3 leading-relaxed">
            Side-by-side comparison of formulation, shade lift, tray design, and clinical indications.
          </p>
        </div>

        {/* Solid Table Card with crisp rounded-xl */}
        <div className="overflow-x-auto rounded-xl   bg-white shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="  text-[#925a27] font-bold uppercase text-[11px] sm:text-xs">
                <th className="py-5 px-6 bg-white w-1/4">Treatment Metric</th>
                <th className="py-5 px-6 bg-white w-1/4">
                  <div>Whitening Strips</div>
                  <div className="text-base sm:text-lg font-display text-[#2a1c12] font-bold mt-1">£25</div>
                </th>
                <th className="py-5 px-6 bg-[#faf6f0]   w-1/4 text-[#925a27] relative">
                  <div className="inline-block bg-[#925a27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                    Dentist Choice
                  </div>
                  <div>Custom Home Suite</div>
                  <div className="text-base sm:text-lg font-display text-[#925a27] font-bold mt-0.5">£295</div>
                </th>
                <th className="py-5 px-6 bg-white w-1/4">
                  <div>Home UV LED Kit</div>
                  <div className="text-base sm:text-lg font-display text-[#2a1c12] font-bold mt-1">£99</div>
                </th>
              </tr>
            </thead>
            <tbody className=" /70 text-[#2a1c12]">
              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Maximum Shade Lift</td>
                <td className="py-4 px-6 text-[#6b5848]">Up to 5 Shades</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-bold text-[#925a27]">
                  Up to 10 Shades
                </td>
                <td className="py-4 px-6 text-[#6b5848]">Up to 7 Shades</td>
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Tray / Delivery System</td>
                <td className="py-4 px-6 text-[#6b5848]">Adhesive Dry-Fit Strips</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-bold text-emerald-800">
                  Laboratory 3D Custom Sculpted
                </td>
                <td className="py-4 px-6 text-[#6b5848]">Universal Silicone Mouthpiece</td>
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Active Enamel Protection</td>
                <td className="py-4 px-6 text-[#6b5848]">Organic Coconut Oil Buffer</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-bold text-emerald-800">
                  ACP Hydroxyapatite Serum Included
                </td>
                <td className="py-4 px-6 text-[#6b5848]">PAP+ Remineralizing Formula</td>
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Treatment Protocol</td>
                <td className="py-4 px-6 text-[#6b5848]">14 days (30 mins daily)</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-semibold text-[#2a1c12]">
                  2–3 weeks (1 hr daily or overnight)
                </td>
                <td className="py-4 px-6 text-[#6b5848]">7 days (16 mins daily)</td>
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">Clinical Suitability</td>
                <td className="py-4 px-6 text-[#6b5848]">Everyday maintenance &amp; light stains</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-semibold text-[#2a1c12]">
                  Deep coffee, tea, smoking &amp; age stains
                </td>
                <td className="py-4 px-6 text-[#6b5848]">Fast turnaround before events</td>
              </tr>

              <tr>
                <td className="py-4 px-6 font-bold text-[#2a1c12]">GDC Clinical Review</td>
                <td className="py-4 px-6 text-[#6b5848]">Self-applied</td>
                <td className="py-4 px-6 bg-[#faf6f0]   font-bold text-emerald-800">
                  Included (Impressions + Shade Check)
                </td>
                <td className="py-4 px-6 text-[#6b5848]">Online guidance included</td>
              </tr>

              <tr className="bg-[#fffdf9]">
                <td className="py-5 px-6 font-bold text-[#2a1c12]">Action</td>
                <td className="py-5 px-6">
                  <Button asChild variant="outline" className="w-full rounded-full  text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]">
                    <a href="/shop">Select Strips</a>
                  </Button>
                </td>
                <td className="py-5 px-6 bg-[#faf6f0]  ">
                  <Button asChild className="w-full accent-gradient text-white rounded-full text-xs font-bold shadow hover:opacity-95">
                    <a href={BOOKING_URL}>Book Custom Suite</a>
                  </Button>
                </td>
                <td className="py-5 px-6">
                  <Button asChild variant="outline" className="w-full rounded-full  text-[#925a27] text-xs font-bold hover:bg-[#faf6f0]">
                    <a href="/shop">Select UV Kit</a>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
