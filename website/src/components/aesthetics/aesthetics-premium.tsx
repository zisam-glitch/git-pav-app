import { Lock, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

export function AestheticsPremium() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Quality &amp; governance
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                We exclusively utilise{" "}
                <span className="text-[#ECD880]">premium-grade products</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80">
                Experience excellence with our Aesthetics services, where we use only the finest
                products to ensure exceptional results each time.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Indulge in the finest aesthetic treatments you&apos;ll ever experience. Through
                meticulous research, we have curated a selection of top-notch products, ensuring
                utmost quality and satisfaction for our esteemed clients.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5">
              <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/14 bg-white/8 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[#ECD880]">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-normal text-white">Care Quality</p>
                      <p className="text-[11px] uppercase tracking-wider text-white/65">
                        Commission Regulated
                      </p>
                    </div>
                  </div>
                  <Lock className="size-4 text-[#ECD880]" />
                </div>

                <div className="my-7">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                    Official Regulatory Compliance
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-normal tracking-[-0.02em] text-white">
                    Regulated Medical Aesthetics Practice
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">
                    As a regulated clinic under the Care Quality Commission (CQC), we adhere to
                    rigorous guidelines for cleanliness, sterilisation, and staff training.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/12 pt-4 text-xs text-white/75">
                  <span>Bradford, West Yorkshire</span>
                  <span className="font-medium text-[#ECD880]">CQC Registered</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
