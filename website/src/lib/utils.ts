import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the Hims type sizes (text-h2, text-label, ...) and radii (rounded-pill), or it
 * treats `text-label` as a colour and silently drops it when a `text-white` follows.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "hero",
            "h2",
            "h2-md",
            "h3",
            "h3-md",
            "h4",
            "lead",
            "body",
            "label",
            "small",
            "caption",
            "nav",
            "nav-lg",
          ],
        },
      ],
    },
    theme: { radius: ["pill", "header"] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
