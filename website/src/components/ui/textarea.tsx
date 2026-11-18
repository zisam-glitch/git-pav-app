import * as React from "react";
import { cn } from "@/lib/utils";

/** Same Hims field as Input, taller. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-[14px] border-2 border-border-strong bg-white px-4 py-3.5 text-label text-fg placeholder:font-normal placeholder:text-subtle transition-[border-color,box-shadow] duration-150 focus-visible:border-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
