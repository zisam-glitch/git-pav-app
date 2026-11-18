import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A big figure with a caption, in the Hims display size (50px on a phone, 82px on a desktop). */
export function Stat({
  value,
  label,
  tone = "light",
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-display">{value}</div>
      <p className={cn("mt-2 text-small", tone === "dark" ? "text-white/70" : "text-muted")}>
        {label}
      </p>
    </div>
  );
}
