import { ArrowRight, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Deep brown gradient used where the Hims testosterone page uses its dark teal cards. */
const DARK = "bg-[linear-gradient(160deg,#5a4630_0%,#3a2c1b_100%)] text-white";

export type BentoItem = {
  title: string;
  kicker?: string;
  price?: string;
  text?: string;
  image?: string;
  alt?: string;
  href: string;
};

/**
 * hims.com/testosterone "treatments" grid: one large feature card on the left, two smaller cards
 * beside it and a wide "not sure?" card, all dark with the product photo and an arrow button.
 */
export function FeatureBento({
  feature,
  items,
  help,
}: {
  feature: BentoItem;
  items: BentoItem[];
  help: { title: string; text: string; cta: ReactNode };
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
      <a
        href={feature.href}
        className={cn(
          "group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[24px] p-7 md:min-h-[560px] md:p-9",
          DARK,
        )}
      >
        <div className="relative z-10">
          <h3 className="text-[clamp(32px,3.6vw,48px)] leading-[1.05] font-normal tracking-[-0.02em]">
            {feature.title}
          </h3>
          {feature.kicker ? (
            <p className="mt-2 text-[15px] text-white/75">{feature.kicker}</p>
          ) : null}
          {feature.price ? <p className="mt-1 text-[15px] text-white/75">{feature.price}</p> : null}
        </div>
        {feature.image ? (
          <img
            src={feature.image}
            alt={feature.alt ?? ""}
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <span className="relative z-10 grid size-11 place-items-center self-end rounded-full bg-white/20 backdrop-blur">
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </a>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              "group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[24px] p-5",
              DARK,
            )}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.alt ?? ""}
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : null}
            <div className="relative z-10">
              <h3 className="text-[22px] leading-[1.1] font-normal">{item.title}</h3>
              {item.kicker ? <p className="mt-2 text-[14px] text-white/80">{item.kicker}</p> : null}
              {item.price ? <p className="mt-1 text-[14px] text-white/80">{item.price}</p> : null}
            </div>
            <span className="relative z-10 grid size-10 place-items-center self-end rounded-full bg-white/20 backdrop-blur">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </a>
        ))}
        <div
          className={cn(
            "flex min-h-[260px] flex-col justify-between rounded-[24px] p-5 sm:col-span-2",
            DARK,
          )}
        >
          <div>
            <p className="text-[13px] text-white/70">Not sure?</p>
            <h3 className="mt-1 text-[24px] leading-[1.1] font-normal">{help.title}</h3>
            <p className="mt-2 max-w-md text-[14px] text-white/80">{help.text}</p>
          </div>
          <div className="mt-4">{help.cta}</div>
        </div>
      </div>
    </div>
  );
}

export type Step = { title: string; accent: string; text: string; image: string; alt: string };

/** "Built for you" panel: a soft gradient with three steps on the left (click to switch) and a photo on the right. */
export function StepsPanel({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <div className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#e8eef0_0%,#f6efc9_100%)] p-6 md:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
      <ol className="list-none space-y-5">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-current={i === active}
              className={cn(
                "w-full border-l-[3px] py-1 pl-5 text-left t-colors",
                i === active ? "border-[#1b1b1b]" : "border-black/15 opacity-45 hover:opacity-70",
              )}
            >
              <span className="block text-[clamp(26px,2.6vw,34px)] leading-[1.1] tracking-[-0.02em]">
                <span className="font-medium text-[#1b1b1b]">{s.title}</span>{" "}
                <span className="text-[#4a5c66]">{s.accent}</span>
              </span>
              {i === active ? (
                <span className="mt-3 block max-w-md text-[17px] leading-[1.45] text-[#55565a]">
                  {s.text}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ol>
      <div className="overflow-hidden rounded-[22px]">
        <img
          key={step.image}
          src={step.image}
          alt={step.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    </div>
  );
}

export type CompareColumn = { name: string; sub?: string };

/** "A range of options" comparison: a row label column and one column per option, striped rows. */
export function CompareTable({
  columns,
  rows,
}: {
  columns: CompareColumn[];
  rows: { label: string; cells: string[] }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
        <thead>
          <tr>
            <th className="w-[22%]" />
            {columns.map((c) => (
              <th
                key={c.name}
                scope="col"
                className="px-4 pb-4 align-bottom text-[17px] leading-tight font-medium text-[#1b1b1b]"
              >
                {c.name}
                {c.sub ? (
                  <span className="mt-1 block text-[14px] font-normal text-[#6b6b70]">{c.sub}</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i % 2 === 0 ? "bg-[#f6efe4]" : ""}>
              <th
                scope="row"
                className="rounded-l-[12px] px-4 py-4 align-top text-[14px] font-medium text-[#1b1b1b]"
              >
                {r.label}
              </th>
              {r.cells.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-4 py-4 align-top text-[14px] leading-[1.45] text-[#55565a]",
                    j === r.cells.length - 1 && "rounded-r-[12px]",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Everything beyond your medication": a narrow column of grey pill rows, each with a line icon at the right. */
export function IncludedList({ items }: { items: { text: string; icon: LucideIcon }[] }) {
  return (
    <ul className="mx-auto mt-10 max-w-[440px] list-none space-y-3">
      {items.map(({ text, icon: Icon }) => (
        <li
          key={text}
          className="flex items-center justify-between gap-4 rounded-[18px] bg-[#f6f6f4] px-6 py-5 text-[16px] text-[#1b1b1b]"
        >
          <span>{text}</span>
          <Icon className="size-5 shrink-0 text-[#1b1b1b]" strokeWidth={1.5} aria-hidden />
        </li>
      ))}
    </ul>
  );
}

/** The dark "Could it be…?" panel: a highlighted question, a line of text and a yellow button. */
export function DarkQuestion({
  lead,
  highlight,
  text,
  chips,
  cta,
}: {
  lead: string;
  highlight: string;
  text: ReactNode;
  chips: string[];
  cta: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 overflow-hidden rounded-[28px] p-8 md:p-14 lg:grid-cols-2",
        DARK,
      )}
    >
      <ul className="grid list-none grid-cols-2 gap-3">
        {chips.map((c) => (
          <li
            key={c}
            className="grid min-h-[110px] place-items-end rounded-[20px] bg-white/10 p-4 text-[16px] backdrop-blur"
          >
            {c}
          </li>
        ))}
      </ul>
      <div className="text-center lg:text-left">
        <h2 className="text-[clamp(30px,3.4vw,44px)] leading-[1.15] font-normal tracking-[-0.02em]">
          {lead}{" "}
          <span className="rounded-[10px] bg-[#f3e9a8] px-2 text-[#2a2418]">{highlight}</span>
        </h2>
        <p className="mt-5 max-w-md text-[17px] leading-[1.45] text-white/80">{text}</p>
        <div className="mt-7">{cta}</div>
      </div>
    </div>
  );
}

/** The floating "Get started" pill that stays at the bottom centre of the screen, with its warm ring. */
export function FloatingCta({ children }: { children: ReactNode }) {
  // Hims sticky CTA: a gold ring around the pill, shadowed, pinned to the bottom centre of the screen.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center">
      <div
        className="pointer-events-auto rounded-full p-3"
        style={{
          background:
            "radial-gradient(217.51% 50.62% at 50% 50%, rgba(255,198,113,.4) 0%, rgba(189,139,65,.4) 36.98%, rgba(255,198,113,.4) 67.19%, rgba(189,139,65,.4) 100%)",
          boxShadow: "0 0.875rem 1.25rem 0 rgba(0,0,0,.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
