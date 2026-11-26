import type { ReactNode } from "react";

/**
 * The Hims Peptides+ opening (hims.com/peptides-plus): a dark full-bleed photo, small monospace tags,
 * one huge headline split to the two sides with the right half highlighted, and a rounded promo bar.
 */
export function CinematicHero({
  id = "top",
  label,
  image,
  alt,
  tags,
  left,
  right,
  lead,
  promo,
  promoAction,
}: {
  id?: string;
  label: string;
  image: string;
  alt: string;
  tags: string[];
  left: ReactNode;
  right: ReactNode;
  lead?: ReactNode;
  promo: ReactNode;
  promoAction: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className="relative isolate overflow-hidden bg-[#120d08] text-white"
    >
      <img src={image} alt={alt} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,13,8,0.55)_0%,rgba(18,13,8,0.35)_50%,rgba(18,13,8,0.7)_100%)]" />
      <div className="mx-auto flex min-h-[640px] w-full max-w-[1392px] flex-col justify-end px-4 pt-32 pb-8 md:min-h-[760px]">
        <ul className="flex list-none gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-[6px] bg-black/55 px-2.5 py-1.5 font-mono text-[13px] tracking-wide text-[#ffc671] uppercase"
            >
              {t}
            </li>
          ))}
        </ul>
        <h1 className="mt-6 flex flex-col justify-between gap-2 text-[clamp(44px,8.6vw,124px)] leading-[0.95] font-normal tracking-[-0.04em] md:flex-row md:items-baseline md:gap-8">
          <span>{left}</span>
          <span className="text-[#ffc671]">{right}</span>
        </h1>
        {lead ? (
          <div className="mt-6 max-w-[640px] text-[18px] leading-[1.45] text-white/85">{lead}</div>
        ) : null}
        <div className="mt-10 flex flex-col gap-4 rounded-[20px] bg-black/45 p-5 backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
          <div className="text-[18px] leading-[1.35]">{promo}</div>
          <div className="shrink-0">{promoAction}</div>
        </div>
      </div>
    </section>
  );
}
