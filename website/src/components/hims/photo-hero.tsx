import { Check } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The Hims full-photo opening (hims.com/erectile-dysfunction): a tall photo with a dark fade on the
 * left, a two-tone headline, three tick lines, two buttons and a line of fine print over it.
 */
export function PhotoHero({
  id = "top",
  label,
  image,
  alt,
  title,
  accent,
  ticks = [],
  lead,
  actions,
  note,
}: {
  id?: string;
  label: string;
  image: string;
  alt: string;
  title: ReactNode;
  accent?: ReactNode;
  ticks?: string[];
  lead?: ReactNode;
  actions: ReactNode;
  note?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className="relative isolate min-h-[640px] overflow-hidden bg-[#1c1712] text-white md:min-h-[720px]"
    >
      <img src={image} alt={alt} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,15,10,0.82)_0%,rgba(20,15,10,0.55)_45%,rgba(20,15,10,0.1)_100%)]" />
      <div className="mx-auto flex min-h-[640px] w-full max-w-[1392px] flex-col justify-end px-4 pt-32 pb-12 md:min-h-[720px] md:pb-16">
        <h1 className="max-w-[720px] text-[clamp(40px,5.2vw,64px)] leading-[1.02] font-normal tracking-[-0.03em]">
          {title}
          {accent ? <span className="block text-[#bcd2e6]">{accent}</span> : null}
        </h1>
        {lead ? (
          <div className="mt-6 max-w-[560px] text-[19px] leading-[1.4] text-white/90">{lead}</div>
        ) : null}
        {ticks.length ? (
          <ul className="mt-8 list-none space-y-4">
            {ticks.map((t) => (
              <li key={t} className="flex items-center gap-3 text-[18px]">
                <span className="grid size-8 place-items-center rounded-full bg-white/90 text-[#1c1712]">
                  <Check className="size-4" strokeWidth={2.4} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
        {note ? (
          <div className="mt-8 max-w-[640px] text-[13px] leading-[1.5] text-white/75">{note}</div>
        ) : null}
      </div>
    </section>
  );
}
