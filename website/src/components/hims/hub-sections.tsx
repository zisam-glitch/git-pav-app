import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FaqList, type FaqItem } from "./faq";

const INK = "text-[#2a2a2c]";
const RED = "text-[#8a4242]";

/** A grey rounded card in the hims.com/hair-loss style (24px radius, no border). */
export const HUB_CARD = "rounded-[24px] bg-[#f7f7f7]";

export type RailItem = { label?: string; title: string; text: string; action?: ReactNode };

/**
 * The horizontal card rail of hims.com/hair-loss ("Featured reviews", "More care to regrow hair"):
 * wide grey cards that scroll sideways, each with a small coloured label, a title and text.
 */
export function CardRail({
  items,
  label,
  tone = "grey",
}: {
  items: RailItem[];
  label: string;
  tone?: "grey" | "beige";
}) {
  return (
    <ul
      aria-label={label}
      className="-mx-4 flex list-none snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0"
    >
      {items.map((item, i) => (
        <li
          key={item.title}
          className={cn(
            HUB_CARD,
            "flex min-h-[340px] w-[82%] shrink-0 snap-start flex-col justify-between p-7 sm:w-[46%] lg:w-[31.5%]",
          )}
        >
          <div>
            <span className="inline-block rounded-full bg-[#8a4242] px-3 py-1 text-[13px] font-medium text-white">
              {item.label ?? String(i + 1).padStart(2, "0")}
            </span>
            <h3
              className={cn("mt-8 text-[30px] leading-[1.08] font-normal tracking-[-0.02em]", INK)}
            >
              {item.title}
            </h3>
            <p className="mt-4 text-[16px] leading-[1.5] text-[#6b6b70]">{item.text}</p>
          </div>
          {item.action ? <div className="mt-8">{item.action}</div> : null}
        </li>
      ))}
    </ul>
  );
}

export type WhyItem = { lead: string; rest: string; text: string };

/** "Why men choose Hims": grey cards, a two-tone title (red first words, dark rest), a round badge and a line of text. */
export function WhyCards({ items }: { items: WhyItem[] }) {
  return (
    <ul className="grid list-none gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li
          key={item.lead + item.rest}
          className={cn(HUB_CARD, "flex min-h-[380px] flex-col justify-between p-7")}
        >
          <h3 className="text-[26px] leading-[1.1] font-normal tracking-[-0.01em]">
            <span className={RED}>{item.lead}</span> <span className={INK}>{item.rest}</span>
          </h3>
          <div className="mx-auto grid size-[150px] place-items-center rounded-full border-[3px] border-[#c98b6b] text-[56px] font-normal text-[#b5644a]">
            {i + 1}
          </div>
          <p className="text-[15px] leading-[1.5] text-[#6b6b70]">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Two or three big grey explainer cards ("How finasteride & minoxidil work"): title, picture, text. */
export function ExplainCards({
  items,
}: {
  items: { title: string; text: ReactNode; image?: string; alt?: string; action?: ReactNode }[];
}) {
  return (
    <ul
      className={cn(
        "grid list-none gap-3",
        items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
      )}
    >
      {items.map((item) => (
        <li key={item.title} className={cn(HUB_CARD, "flex flex-col p-7")}>
          <h3 className={cn("text-[28px] leading-[1.1] font-normal tracking-[-0.02em]", INK)}>
            {item.title}
          </h3>
          {item.image ? (
            <div className="my-6 overflow-hidden rounded-[18px]">
              <img
                src={item.image}
                alt={item.alt ?? ""}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ) : null}
          <div className="text-[16px] leading-[1.5] text-[#6b6b70]">{item.text}</div>
          {item.action ? <div className="mt-6">{item.action}</div> : null}
        </li>
      ))}
    </ul>
  );
}

/** The four-column "how it works" band that sits in a white rounded panel above the FAQ. */
export function StepBand({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-12 shadow-[0_10px_36px_rgba(20,20,40,0.05)] md:px-12">
      <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.title}>
            <h3 className={cn("text-[22px] leading-[1.2] font-normal", INK)}>{item.title}</h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-[#6b6b70]">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** FAQ in the Hims layout: the title and a black button on the left, the accordion on the right. */
export function FaqSplit({
  id,
  title,
  action,
  items,
}: {
  id?: string;
  title: string;
  action: ReactNode;
  items: FaqItem[];
}) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
      <div className="lg:sticky lg:top-28">
        <h2
          id={id}
          className={cn(
            "text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em]",
            INK,
          )}
        >
          {title}
        </h2>
        <div className="mt-6">{action}</div>
      </div>
      <FaqList items={items} tone="light" defaultOpen={0} />
    </div>
  );
}

export type ProductItem = {
  pills?: string[];
  title: string;
  sub?: string;
  text: ReactNode;
  image: string;
  alt: string;
  position?: string;
  action: ReactNode;
  link?: ReactNode;
};

/** The "For spontaneous sex" product rail of hims.com/erectile-dysfunction: grey image tile, pills, name, price line, text, button, safety link. */
export function ProductRail({ items, label }: { items: ProductItem[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="-mx-4 flex list-none snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0"
    >
      {items.map((item) => (
        <li
          key={item.title}
          className="flex w-[84%] shrink-0 snap-start flex-col sm:w-[46%] lg:w-[31.8%]"
        >
          <div className={cn(HUB_CARD, "relative overflow-hidden")}>
            <img
              src={item.image}
              alt={item.alt}
              loading="lazy"
              style={{ objectPosition: item.position }}
              className="aspect-[4/3] w-full object-cover"
            />
            {item.pills?.length ? (
              <div className="absolute top-4 left-4 flex gap-1.5">
                {item.pills.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#2a2a2c]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <h3 className={cn("mt-5 text-[24px] leading-[1.15] font-normal tracking-[-0.01em]", INK)}>
            {item.title}
          </h3>
          {item.sub ? <p className="mt-1 text-[14px] text-[#8b8d92]">{item.sub}</p> : null}
          <div className="mt-2 flex-1 text-[14px] leading-[1.5] text-[#6b6b70]">{item.text}</div>
          <div className="mt-5 [&>a]:w-full [&>button]:w-full">{item.action}</div>
          {item.link ? (
            <div className="mt-3 text-center text-[14px] text-[#55565a] underline underline-offset-4">
              {item.link}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** "Let's get to the hard facts": the accordion and two buttons on the left, one tall rounded photo on the right. */
export function FaqPhoto({
  id,
  title,
  items,
  actions,
  image,
  alt,
}: {
  id?: string;
  title: string;
  items: FaqItem[];
  actions: ReactNode;
  image: string;
  alt: string;
}) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div>
        <h2
          id={id}
          className={cn(
            "text-[clamp(30px,3vw,40px)] leading-[1.1] font-normal tracking-[-0.02em]",
            INK,
          )}
        >
          {title}
        </h2>
        <FaqList items={items} tone="light" defaultOpen={0} className="mt-8" />
        <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
      </div>
      <div className="overflow-hidden rounded-[24px] lg:sticky lg:top-28">
        <img src={image} alt={alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
      </div>
    </div>
  );
}

/** "Get complete support in one membership": a narrow column of grey rows, each a title, a line of text and a tick on the right. */
export function CheckRows({ items }: { items: { title: string; text?: string }[] }) {
  return (
    <ul className="mx-auto max-w-[560px] list-none space-y-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex items-start justify-between gap-5 rounded-[18px] bg-[#f6f6f4] px-6 py-5"
        >
          <div>
            <p className="text-[17px] font-medium text-[#2a2a2c]">{item.title}</p>
            {item.text ? (
              <p className="mt-1 text-[14px] leading-[1.5] text-[#6b6b70]">{item.text}</p>
            ) : null}
          </div>
          <svg
            viewBox="0 0 16 16"
            className="mt-1 size-5 shrink-0 text-[#1b1b1b]"
            aria-hidden="true"
          >
            <path
              d="M3 8.4l3.2 3.2L13 4.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </li>
      ))}
    </ul>
  );
}

/** "Your membership comes with support": heading, amber-tick list and button on the left, one rounded photo on the right. */
export function SplitPhoto({
  id,
  title,
  lead,
  ticks,
  action,
  image,
  alt,
}: {
  id?: string;
  title: string;
  lead?: ReactNode;
  ticks: string[];
  action?: ReactNode;
  image: string;
  alt: string;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2
          id={id}
          className={cn(
            "text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em]",
            INK,
          )}
        >
          {title}
        </h2>
        {lead ? (
          <div className="mt-5 max-w-xl text-[17px] leading-[1.5] text-[#55565a]">{lead}</div>
        ) : null}
        <ul className="mt-7 list-none space-y-3">
          {ticks.map((t) => (
            <li key={t} className="flex items-start gap-3 text-[16px] text-[#2a2a2c]">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#f3b968]">
                <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
                  <path
                    d="M2.5 6.2l2.2 2.2 4.8-4.8"
                    fill="none"
                    stroke="#2a2418"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {t}
            </li>
          ))}
        </ul>
        {action ? <div className="mt-8">{action}</div> : null}
      </div>
      <div className="overflow-hidden rounded-[24px]">
        <img src={image} alt={alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      </div>
    </div>
  );
}

/** "Health signals that tell your unique story": tall beige cards, a title at the top and muted lines at the bottom. */
export function BeigeGrid({
  items,
  columns = 4,
}: {
  items: { title: string; sub?: string; lines?: string[]; text?: ReactNode }[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <ul
      className={cn(
        "grid list-none gap-2.5 sm:grid-cols-2",
        columns === 4 ? "lg:grid-cols-4" : columns === 3 ? "lg:grid-cols-3" : "",
      )}
    >
      {items.map((item) => (
        <li
          key={item.title}
          className="flex min-h-[260px] flex-col justify-between rounded-[20px] bg-[#f1e9de] p-5"
        >
          <div>
            <h3 className="text-[22px] leading-[1.15] font-normal text-[#5a2f2f]">{item.title}</h3>
            {item.sub ? (
              <p className="mt-1 text-[15px] text-[#8a4242] tabular-nums">{item.sub}</p>
            ) : null}
          </div>
          <div className="mt-6 text-[14px] leading-[1.5] text-[#8b7f73]">
            {item.text}
            {item.lines ? (
              <ul className="list-none space-y-1">
                {item.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** "Turn your body's data into a clear plan": three beige cards, a numbered circle, a centred title and text. */
export function NumberedCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ul className="grid list-none gap-3 md:grid-cols-3">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="flex min-h-[300px] flex-col items-center rounded-[24px] bg-[#f1e9de] px-6 py-8 text-center"
        >
          <span className="grid size-7 place-items-center rounded-full border border-[#8a4242] text-[13px] text-[#8a4242]">
            {i + 1}
          </span>
          <h3 className="mt-5 text-[28px] leading-[1.1] font-normal tracking-[-0.01em] text-[#5a2f2f]">
            {item.title}
          </h3>
          <p className="mt-3 max-w-[300px] text-[15px] leading-[1.5] text-[#8b7f73]">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
