import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading, type HeadingSize } from "./heading";
import type { AccentTone } from "./tones";

/**
 * The heading block that opens a Hims content section: a headline with an accent phrase, an optional lead
 * paragraph and an optional action (a pill button) on the right.
 *
 * Hims reference: PDP captures (`/weight-loss/wegovy-pill.html`, `/hair-loss/minoxidil.html`) header row, a
 * 44.67px heading on the left and one 48px pill on the right with 55px to the cards below it; the condition
 * capture (`/testosterone.html`) centres 52.83px headings with the accent phrase in a muted blue.
 *
 * Props: `title`, `accent` (second phrase in the accent tone), `tone`, `size` (a Heading size, default "h2-md"),
 * `inline` (accent stays on the same line, default true), `lead`, `action` (buttons node), `align`
 * ("left" puts the action on the right on a desktop, "center" stacks everything in the middle), `as` (h2 or h3).
 */
export function SectionHeader({
  title,
  accent,
  tone = "terracotta",
  size = "h2-md",
  inline = true,
  lead,
  action,
  align = "left",
  as = "h2",
  className,
}: {
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  size?: HeadingSize;
  inline?: boolean;
  lead?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <header
      className={cn(
        "flex flex-col gap-6",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto")}>
        <Heading as={as} size={size} accent={accent} tone={tone} inline={inline}>
          {title}
        </Heading>
        {lead ? <p className="mt-4 text-lead text-muted">{lead}</p> : null}
      </div>
      {action ? (
        <div className={cn("flex flex-wrap gap-3", centered && "justify-center")}>{action}</div>
      ) : null}
    </header>
  );
}
