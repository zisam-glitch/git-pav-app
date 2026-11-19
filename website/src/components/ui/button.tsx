import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Hims pill button: 48px tall, 24px side padding, 48px radius, 2px border, label in text-label (16px, weight 500),
 * colours and background change over 0.3s ease. Pick the variant that matches the section the button sits on:
 *
 *   default  black pill on a light section        light   white pill on a dark section or over a photo
 *   outline  white pill with a hairline border    ghost   no fill, for quiet actions
 *   glass    translucent white on a dark section  gold    gold pill on brown (Hims weight-loss section)
 *   butter   butter pill on navy                  sky     sky-blue pill on navy
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill border-2 border-transparent text-label transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 ease-in-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/80",
        light: "bg-white text-black hover:bg-white/85",
        outline: "border-border-strong bg-white text-black hover:border-black",
        ghost: "bg-transparent text-fg hover:bg-black/5",
        glass:
          "border-white/17 border-[1px] bg-white/7 text-white hover:bg-white/20 focus-visible:ring-white focus-visible:ring-offset-0",
        gold: "bg-gold text-brown hover:bg-gold-hover",
        butter: "bg-butter text-teal-ink hover:bg-butter-pale",
        sky: "bg-sky text-white hover:bg-sky/85",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-[34px] border-[1px] px-3 text-small font-medium",
        lg: "h-[69px] px-8",
        icon: "size-[42px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
