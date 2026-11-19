import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Two equal columns, media and text, that stack on a phone. `reverse` puts the media on the right. */
export function SplitFeature({
  media,
  children,
  reverse = false,
  className,
}: {
  media: ReactNode;
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid items-center gap-8 md:grid-cols-2 md:gap-14", className)}>
      <div className={cn(reverse && "md:order-2")}>{media}</div>
      <div className={cn(reverse && "md:order-1")}>{children}</div>
    </div>
  );
}
