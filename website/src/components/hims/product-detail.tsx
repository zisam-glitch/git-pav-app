import { Check, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DetailOption = { id: string; name: string; price: string; note?: string };
export type DetailAccordion = { title: string; body: ReactNode };

/**
 * The Hims product page top (hims.com/hair-loss/minoxidil): a big rounded picture with round thumbnails on
 * the left; on the right a red label, the title, text, selectable option cards, a black button and accordions.
 * The button is a booking link here, never a cart.
 */
export function ProductDetail({
  id = "top",
  label,
  pill,
  title,
  text,
  images,
  optionsTitle,
  options,
  primary,
  secondary,
  accordions,
}: {
  id?: string;
  label: string;
  pill: string;
  title: ReactNode;
  text: ReactNode;
  images: { src: string; alt: string }[];
  optionsTitle: string;
  options: DetailOption[];
  primary: (selected: DetailOption) => ReactNode;
  secondary?: ReactNode;
  accordions: DetailAccordion[];
}) {
  const [img, setImg] = useState(0);
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      id={id}
      aria-label={label}
      className="mx-auto w-full max-w-[1392px] px-4 pt-6 pb-16 md:pt-10"
    >
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <div>
          <div className="relative overflow-hidden rounded-[24px] bg-[#efe6dc]">
            <img
              src={images[img].src}
              alt={images[img].alt}
              className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
          </div>
          <ul className="mt-4 flex list-none justify-center gap-3">
            {images.map((im, i) => (
              <li key={im.src}>
                <button
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={`Show picture ${i + 1}`}
                  aria-current={i === img}
                  className={cn(
                    "size-[60px] overflow-hidden rounded-full border-2 t-colors",
                    i === img
                      ? "border-[#1b1b1b]"
                      : "border-transparent opacity-80 hover:opacity-100",
                  )}
                >
                  <img src={im.src} alt="" aria-hidden className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pt-6">
          <span className="inline-block rounded-full bg-[#8a4242] px-3 py-1 text-[13px] font-medium text-white">
            {pill}
          </span>
          <h1 className="mt-4 text-[clamp(36px,4.4vw,56px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#2a2a2c]">
            {title}
          </h1>
          <div className="mt-4 text-[18px] leading-[1.4] text-[#6b6b70]">{text}</div>

          <p className="mt-7 text-[15px] font-medium text-[#2a2a2c]">{optionsTitle}</p>
          <div role="radiogroup" aria-label={optionsTitle} className="mt-3 grid gap-2">
            {options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={i === sel}
                onClick={() => setSel(i)}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-[16px] border px-5 py-4 text-left t-colors",
                  i === sel
                    ? "border-[#1b1b1b] bg-[#f6f6f4]"
                    : "border-[#e1ded8] bg-white hover:border-[#9a9a9e]",
                )}
              >
                <span>
                  <span className="block text-[16px] font-medium text-[#2a2a2c]">{o.name}</span>
                  <span className="mt-0.5 block text-[14px] text-[#8b8d92] tabular-nums">
                    {o.price}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border",
                    i === sel ? "border-[#1b1b1b] bg-[#1b1b1b] text-white" : "border-[#cfcac0]",
                  )}
                >
                  {i === sel ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
                </span>
              </button>
            ))}
          </div>
          {options[sel].note ? (
            <p className="mt-3 text-[14px] text-[#6b6b70]">{options[sel].note}</p>
          ) : null}

          <div className="mt-6 [&>a]:h-14 [&>a]:w-full [&>a]:text-[17px]">
            {primary(options[sel])}
          </div>
          {secondary ? <div className="mt-3 [&>a]:h-12 [&>a]:w-full">{secondary}</div> : null}

          <ul className="mt-8 list-none border-t border-[#e1ded8]">
            {accordions.map((a, i) => {
              const isOpen = open === i;
              return (
                <li key={a.title} className="border-b border-[#e1ded8]">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between py-5 text-left text-[16px] font-medium text-[#2a2a2c]"
                    >
                      {a.title}
                      <ChevronDown
                        className={cn("size-5 shrink-0 t-colors", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>
                  </h2>
                  <div
                    inert={!isOpen}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-5 text-[15px] leading-[1.55] text-[#6b6b70]">{a.body}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
