import type { CSSProperties } from "react";

/**
 * Hims DISPLAY_M: 40px at a 360px screen growing to 82px at 1392px, weight 410, line-height 1. Apply it as `style`.
 * token-request: `text-display-m` (our `text-display` starts at 50px, too big for a phone headline).
 * Hims reference: the "Clinical excellence" capture's statement and hero titles
 * (`docs/redesign/website/hims-patterns/clinical-excellence.md`, type variants table).
 */
export const DISPLAY_M: CSSProperties = {
  fontSize: "clamp(40px, calc(40px + 42 * (100vw - 360px) / 1032), 82px)",
  fontWeight: 410,
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

/**
 * Hims BODY_L: 18px growing to 23px, line-height 1.3. Apply it as `style`.
 * token-request: `text-lead-l` (our `text-lead` stops at 19px).
 */
export const BODY_L: CSSProperties = {
  fontSize: "clamp(18px, calc(18px + 5 * (100vw - 360px) / 1032), 23px)",
  lineHeight: 1.3,
  letterSpacing: "0.012em",
};
