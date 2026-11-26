import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section } from "./section";

/**
 * The Hims service-page opening (hims.com/hair-loss): a warm band with the headline on the left and
 * the text, prices and buttons on the right, then a row of rounded photos under it.
 */
export function ServiceHeroLayout({
  head,
  children,
  images,
  label,
}: {
  head: ReactNode;
  children: ReactNode;
  /** First image is the page's hero photo; the rest fill the strip. */
  images: { src: string; alt: string }[];
  label: string;
}) {
  return (
    <>
      <Section
        id="top"
        theme="cream"
        space="none"
        className="pt-8 pb-10 md:pt-14 md:pb-14"
        aria-label={label}
      >
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div>{head}</div>
          <div className="[&_.t-hero-links]:mt-6">{children}</div>
        </div>
      </Section>
      <div className="bg-cream pb-12 md:pb-16">
        <ul
          className={cn(
            "mx-auto grid w-full max-w-[1392px] list-none gap-3 px-4",
            images.length >= 4
              ? "grid-cols-2 md:grid-cols-4"
              : images.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 md:grid-cols-2",
          )}
        >
          {images.map((img, i) => (
            <li key={img.src + i} className="overflow-hidden rounded-[24px] bg-[#efe9dd]">
              <img
                src={img.src}
                alt={i === 0 ? img.alt : ""}
                aria-hidden={i === 0 ? undefined : true}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-[4/5] size-full object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
