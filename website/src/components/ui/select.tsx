import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Hims select field: matches `Input` (white, 14px radius, 2px border turning black on focus) with
 * `appearance-none` and a custom chevron so native options align vertically in the center across browsers.
 */
export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "block h-14 w-full appearance-none rounded-[14px] border-2 border-border-strong bg-white px-4 pr-10 text-label leading-[3.25rem] text-fg transition-[border-color,box-shadow] duration-150 focus-visible:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  ),
);
Select.displayName = "Select";
