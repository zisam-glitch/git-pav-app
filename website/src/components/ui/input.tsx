import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Hims form field: white, 14px radius, 2px border that turns black on focus (border-color 0.15s), label-size
 * text (16px, weight 500). The border is darker than Hims' own so it keeps 3:1 contrast against the page.
 */
export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-[14px] border-2 border-border-strong bg-white px-4 text-label text-fg placeholder:font-normal placeholder:text-subtle transition-[border-color,box-shadow] duration-150 focus-visible:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";
