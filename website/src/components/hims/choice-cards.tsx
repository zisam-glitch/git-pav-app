import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChoiceCard = {
  value: string;
  title: ReactNode;
  /** A second line: a price, a stock note, a pack size. */
  detail?: ReactNode;
  disabled?: boolean;
};

/**
 * Hims choice cards: a radio group drawn as side-by-side cards, for product options, pack sizes and plan
 * frequency. Native radio inputs, so keyboard arrows, labels and form semantics come for free.
 *
 * Hims reference: "Shipping frequency" selector on `/hair-loss/minoxidil.html` (y355, 1440 wide). Measured: group
 * label `h3` 15.67px / 485 (10px above the cards, 8px on a phone); cards are `label`s in a flex row, 12px gap,
 * 189 x 109 at a 389px side rail (two across), radius 16px, padding 18px, 8px between parts, 1px border.
 * Selected: fill rgba(0,0,0,.03), border rgba(0,0,0,.12), a 24px indicator at the top right with a filled black
 * disc. Not selected: fill white, border rgba(0,0,0,.19), a 24px ring. Title 15.67px / 485; detail 12.83px / 490
 * at 37% black (ours `text-small text-muted`). The radio input is visually hidden.
 *
 * Props: `legend` (the group label), `name`, `options`, `value`, `onChange`, `error` (a message under the cards,
 * announced), `className`. Two cards across from a tablet, one on a phone.
 */
export function ChoiceCards({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  className,
}: {
  legend: ReactNode;
  name: string;
  options: readonly ChoiceCard[];
  value: string | null;
  onChange: (value: string) => void;
  error?: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-2.5 text-label">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex flex-col gap-2 rounded-md border p-[18px] t-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                selected ? "border-border bg-black/3" : "border-border bg-white",
                option.disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "absolute top-[18px] right-[18px] grid size-6 place-items-center rounded-full border t-colors",
                  selected ? "border-black bg-black text-white" : "border-border-strong bg-white",
                )}
              >
                {selected ? <Check className="size-3.5" /> : null}
              </span>
              <span className="pr-8 text-label">{option.title}</span>
              {option.detail ? (
                <span className="text-small text-muted">{option.detail}</span>
              ) : null}
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-small text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
