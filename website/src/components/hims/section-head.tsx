import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The Hims service-page section header: a small grey label, a large left-aligned title (the first
 * words in the accent colour when `accent` is given) and an action button at the right.
 */
export function SectionHead({
  id,
  label,
  title,
  accent,
  action,
  children,
  className,
}: {
  id?: string;
  label?: string;
  title: ReactNode;
  accent?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="max-w-3xl">
        {label ? (
          <span className="inline-block rounded-full bg-[#e9e9e9] px-3 py-1 text-[13px] font-medium text-[#3a3a3d]">
            {label}
          </span>
        ) : null}
        <h2
          id={id}
          className="mt-3 text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          {accent ? <span className="text-[#8a4242]">{accent} </span> : null}
          {title}
        </h2>
        {children ? <p className="mt-4 max-w-2xl text-lead text-muted">{children}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
