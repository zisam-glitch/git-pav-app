import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section, type SectionTheme } from "./section";
import { BODY_L, DISPLAY_M } from "./type-styles";

const DARK: SectionTheme[] = ["brown", "navy", "ink"];

/**
 * A centred statement band: a very large two-tone headline and a paragraph under it.
 *
 * Hims reference: the "Clinical excellence" capture (`/about/clinical-excellence.html`; the capture is empty, so
 * the values come from its saved page script, see `docs/redesign/website/hims-patterns/clinical-excellence.md`).
 * Statement title DISPLAY_M, centred, in grey with the key phrase in white (on dark); paragraph BODY_L, 1rem under
 * it; band padding 64 / 56 on a phone and 100 / 74 from the medium breakpoint; content about 8 of 12 grid columns
 * (912px). `sheet` makes the band lie over the previous one: 24px top radius and a 24px overlap (the Hims
 * overlapping sheets, measured on `/benefits.html`). On a light theme the first phrase is ink and the key phrase
 * takes the accent tone, like `Heading`. The page's scroll reveal is left out (all words stay visible).
 *
 * Props: `title` (first phrase) + `accent` (key phrase), `as` (h1 or h2, default h2), `theme`, `sheet`,
 * `breakAccent` (key phrase on its own line), `id`, `children` (the paragraph(s) under the title), `headingId`.
 */
export function Statement({
  title,
  accent,
  as: Tag = "h2",
  theme = "brown",
  sheet = false,
  breakAccent = false,
  id,
  headingId,
  className,
  children,
}: {
  title: ReactNode;
  accent?: ReactNode;
  as?: "h1" | "h2";
  theme?: SectionTheme;
  sheet?: boolean;
  breakAccent?: boolean;
  id?: string;
  headingId?: string;
  className?: string;
  children?: ReactNode;
}) {
  const dark = DARK.includes(theme);
  return (
    <Section
      id={id}
      theme={theme}
      width="full"
      space="none"
      aria-labelledby={headingId}
      className={cn(sheet && "relative -mt-6 rounded-t-xl", className)}
    >
      <div className="mx-auto max-w-[57rem] px-4 pt-16 pb-14 text-center md:px-6 md:pt-[100px] md:pb-[74px]">
        <Tag id={headingId} style={DISPLAY_M} className="text-balance">
          <span className={dark ? "text-white/60" : "text-fg"}>{title}</span>
          {accent ? (
            <>
              {breakAccent ? null : " "}
              <span className={cn(breakAccent && "block", dark ? "text-white" : "text-terracotta")}>
                {accent}
              </span>
            </>
          ) : null}
        </Tag>
        {children ? (
          <div
            style={BODY_L}
            className={cn("mt-4 space-y-4 text-pretty", dark ? "text-white/80" : "text-muted")}
          >
            {children}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
