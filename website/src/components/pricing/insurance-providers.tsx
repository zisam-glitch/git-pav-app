export function InsuranceProviders() {
  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 text-center sm:px-10 sm:py-16">
          <div className="mx-auto max-w-[87rem]">
            <p className="text-xs font-medium uppercase tracking-wider text-black/55">
              Insurance &amp; Claims
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              We Accept All <span className="text-[#754B3D]">Insurance Providers</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-black/65 sm:text-base">
              Direct claim processing and hassle-free coverage with leading UK private dental
              insurance plans.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="rounded-xs bg-[#00008f] px-2.5 py-1 text-xs font-extrabold text-white">
                    AXA
                  </div>
                  <span className="text-sm font-bold text-[#00008f]">Health</span>
                </div>
              </div>

              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#82c91e] text-xs font-black text-[#1a1a1a]">
                    S
                  </div>
                  <span className="text-sm font-bold text-gray-800">Simplyhealth</span>
                </div>
              </div>

              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="rounded-sm bg-[#0079c8] px-3 py-1 text-sm font-bold text-white">
                  Bupa
                </div>
              </div>

              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="size-3.5 rotate-45 rounded-xs bg-[#ffcc00]" />
                  <span className="text-base font-black text-[#004f9e]">AVIVA</span>
                </div>
              </div>

              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#166534] text-[10px] font-bold text-[#166534]">
                    D
                  </div>
                  <span className="text-sm font-bold text-[#166534]">Denplan</span>
                </div>
              </div>

              <div className="flex h-16 items-center justify-center rounded-2xl border border-black/6 bg-white px-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2">
                  <div className="rounded-xs bg-[#7c3aed] px-2 py-0.5 text-[11px] font-bold text-white">
                    WPA
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Health Insurance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
