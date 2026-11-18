export function InsuranceProviders() {
  return (
    <section className="py-16 sm:py-20 bg-[#f7f1e7] border-y border-border/50 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#844d1e]">
          We Accept All Insurance Providers
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed">
          Direct claim processing and hassle-free coverage with leading UK private dental insurance plans.
        </p>

        {/* Insurance logos grid in modern elevated cards */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* AXA Health */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="bg-[#00008f] text-white font-extrabold px-2.5 py-1 text-xs rounded-xs">
                AXA
              </div>
              <span className="font-bold text-[#00008f] text-sm">Health</span>
            </div>
          </div>

          {/* Simplyhealth */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-[#82c91e] flex items-center justify-center text-[#1a1a1a] font-black text-xs">
                S
              </div>
              <span className="font-bold text-gray-800 text-sm">Simplyhealth</span>
            </div>
          </div>

          {/* Bupa */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="bg-[#0079c8] text-white font-bold px-3 py-1 text-sm rounded-sm">
                Bupa
              </div>
            </div>
          </div>

          {/* Aviva */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="size-3.5 bg-[#ffcc00] rounded-xs transform rotate-45" />
              <span className="font-black text-[#004f9e] text-base">AVIVA</span>
            </div>
          </div>

          {/* Denplan */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full border-2 border-[#166534] flex items-center justify-center text-[#166534] font-bold text-[10px]">
                D
              </div>
              <span className="font-bold text-[#166534] text-sm">Denplan</span>
            </div>
          </div>

          {/* WPA */}
          <div className="flex items-center justify-center h-16 px-6 rounded-xl bg-white border border-border/60 shadow-xs hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="bg-[#7c3aed] text-white font-bold px-2 py-0.5 text-[11px] rounded-xs">
                WPA
              </div>
              <span className="font-semibold text-gray-700 text-xs">Health Insurance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
