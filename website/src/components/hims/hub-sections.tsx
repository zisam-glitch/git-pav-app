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
export function CardRail({ items, label }: { items: RailItem[]; label: string }) {
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
