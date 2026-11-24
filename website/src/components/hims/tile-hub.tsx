import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HubBigTile = {
  lead: string;
  accent: string;
  cta: string;
  image: string;
  alt: string;
  href: string;
};
export type HubSmallTile = { lead: string; rest: string; image: string; href: string };

/**
 * The Hims "Your best starts here" hub (hims.com/primary-care): a two-tone title, two big photo tiles with a
 * link line at the bottom, and a row of small cream tiles with a little picture and a chevron.
 */
export function TileHub({
  id = "top",
  label,
  title,
  accent,
  lead,
  big,
  small,
  children,
}: {
  id?: string;
  label: string;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  big: HubBigTile[];
  small: HubSmallTile[];
  children?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className="mx-auto w-full max-w-[1392px] px-4 pt-8 pb-14 md:pt-12 md:pb-20"
    >
      <h1 className="max-w-[1100px] text-[clamp(40px,5.2vw,64px)] leading-[1.04] font-normal tracking-[-0.03em] text-[#2a2a2c]">
        {title} {accent ? <span className="text-[#8a4242]">{accent}</span> : null}
      </h1>
      {lead ? (
        <div className="mt-5 max-w-2xl text-[19px] leading-[1.4] text-[#55565a]">{lead}</div>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div> : null}

      <div className="mt-10 grid gap-1 lg:grid-cols-2">
        {big.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#3a2c1b] p-5 text-white md:min-h-[300px]"
          >
            <img
              src={t.image}
              alt={t.alt}
              className="absolute inset-0 size-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,20,10,0.45)_0%,rgba(30,20,10,0)_50%,rgba(30,20,10,0.5)_100%)]" />
            <p className="relative text-[20px] leading-[1.15]">
              {t.lead} <span className="block text-[#f3c58a]">{t.accent}</span>
            </p>
            <span className="relative flex items-center justify-between text-[16px]">
              {t.cta}
              <ChevronRight className="size-5" aria-hidden />
            </span>
          </a>
        ))}
      </div>
      <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {small.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={cn(
              "flex h-[100px] items-center justify-between rounded-[24px] bg-[linear-gradient(180deg,#faf8f2,#f4f1e6)] px-5 t-lift",
            )}
          >
            <span className="text-[20px] text-[#2a2a2c]">
              {t.lead} <span className="text-[#8a4242]">{t.rest}</span>
            </span>
            <span className="flex items-center gap-3">
              <img
                src={t.image}
                alt=""
                aria-hidden
                className="size-[64px] rounded-full object-cover"
              />
              <ChevronRight className="size-5" aria-hidden />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
