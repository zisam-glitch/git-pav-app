import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Full-width dark closing band with a highlighted headline: the last call to action of a treatment page.
 *
 * Hims reference: the "Could it be low T?" band that ends `/testosterone.html` (y9787, 742px tall at 1440): deep
 * teal (#0a2633), 111px vertical padding; two columns 120px apart (picture on the left, 500px of copy on the
 * right); the 52.83px/410 headline has its second line inside a highlighter box (8px radius, 8px side padding,
 * 4px under the text) with dark text; the lead is 18.5px at 66% white; one butter pill 56px tall; a 12.83px
 * disclaimer at 66% white. Compare `CtaBand`, the rounded panel inside the page width.
 *
 * Props: `title` (first line, white) + `highlight` (second line, in the butter highlighter box): together they
 * are the one H2, `lead`, `actions` (use BookButton `variant="butter"` and CallButton `variant="glass"`), `note`
 * (small print), `media` (a node shown on the left on a desktop), `aside` (a node shown on the right, for
 * example a form card), `id`. With neither `media` nor `aside` the copy is centred.
 */
export function ClosingBand({
  id,
  title,
  highlight,
  lead,
  actions,
  note,
  media,
  aside,
}: {
  id?: string;
  title: ReactNode;
  highlight?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  note?: ReactNode;
  media?: ReactNode;
  aside?: ReactNode;
}) {
  const split = Boolean(media || aside);
  return (
    <section id={id} className="bg-navy-deep text-white">
      <div className="wrap py-14 md:py-28">
        <div className={cn("grid items-center gap-10 lg:gap-[7.5rem]", split && "lg:grid-cols-2")}>
          {media ? <div>{media}</div> : null}
          <div className={cn(!split && "mx-auto max-w-3xl text-center")}>
            <h2 className="text-hero">
              <span className="block">{title}</span>
              {highlight ? (
                <>
                  {" "}
                  <span className="mt-2 inline-block rounded-sm bg-butter px-2 pb-1 text-teal-ink">
                    {highlight}
                  </span>
                </>
              ) : null}
            </h2>
            {lead ? (
              <p className={cn("mt-6 max-w-xl text-lead text-white/80", !split && "mx-auto")}>
                {lead}
              </p>
            ) : null}
            {actions ? (
              <div className={cn("mt-8 flex flex-wrap gap-3", !split && "justify-center")}>
                {actions}
              </div>
            ) : null}
            {note ? <div className="mt-6 text-caption text-white/70">{note}</div> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
