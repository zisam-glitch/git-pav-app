import type { ReactNode } from "react";
import { Section, type SectionTheme } from "./section";
import { SectionHeader } from "./section-header";
import type { AccentTone } from "./tones";

export type ComparisonColumn = {
  id: string;
  name: string;
  /** Small label above the name (a pill). */
  eyebrow?: string;
  price?: string;
  /** Button node for the last row and the phone card, for example a BookButton. */
  action?: ReactNode;
};
export type ComparisonRow = { label: string; values: readonly ReactNode[] };

/**
 * Side-by-side comparison of a page's treatment options: a table on a tablet or desktop, stacked cards on a phone.
 *
 * Hims reference: "A range of options" on `/testosterone.html` (y6283, 1440 wide): intro with a 48px/450 heading
 * and a 22.17px lead at 61% black; the table has a header row (84px thumbnail, a "New" pill in butter 11px/500, the
 * product name 15.67px/485, cells 13.67px padding) and rows with a 12.83px/490 label and 12.83px/400 values at 61%
 * black; every other row is tinted cream (#f8f4ef, label cell 6px radius, 18.5px side padding). The WegoVy PDP
 * (`/weight-loss/wegovy-pill.html`, y3836) shows the same facts as 282px cards in a scroller: label 11px/494 over a
 * 18.5px/480 value, 16px between slots, 16px radius picture slot.
 *
 * Both layouts are in the server HTML (CSS shows one), so words and headings stay the same at every width. Column
 * names are H3 in the phone cards only (the table uses plain text).
 *
 * Props: `title` + `accent` (the one H2), `tone`, `lead`, `columns`, `rows` (`label` and one value per column),
 * `theme` (default sand), `id`.
 */
export function ComparisonTable({
  id,
  theme = "sand",
  title,
  accent,
  tone = "terracotta",
  lead,
  columns,
  rows,
}: {
  id?: string;
  theme?: SectionTheme;
  title: ReactNode;
  accent?: ReactNode;
  tone?: AccentTone;
  lead?: ReactNode;
  columns: readonly ComparisonColumn[];
  rows: readonly ComparisonRow[];
}) {
  const hasAction = columns.some((column) => column.action);
  return (
    <Section id={id} theme={theme}>
      <SectionHeader title={title} accent={accent} tone={tone} lead={lead} />

      <div className="mt-10 hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="w-1/4 px-6 py-6 text-small font-medium text-muted">Feature</th>
              {columns.map((column) => (
                <th key={column.id} className="w-1/4 px-6 py-6 align-top font-normal">
                  {column.eyebrow ? (
                    <span className="inline-flex rounded-pill bg-butter px-2.5 py-0.5 text-caption font-medium text-teal-ink">
                      {column.eyebrow}
                    </span>
                  ) : null}
                  <div className="mt-3 text-h4">{column.name}</div>
                  {column.price ? (
                    <div className="mt-1 text-h3-md tabular-nums text-terracotta">
                      {column.price}
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="odd:bg-cream">
                <th scope="row" className="px-6 py-4 align-top text-label font-medium">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={columns[index]?.id ?? index}
                    className="px-6 py-4 align-top text-small text-muted"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
            {hasAction ? (
              <tr className="border-t border-border">
                <th scope="row" className="px-6 py-5 text-label font-medium">
                  Appointment
                </th>
                {columns.map((column) => (
                  <td key={column.id} className="px-6 py-5">
                    {column.action}
                  </td>
                ))}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 md:hidden">
        {columns.map((column, columnIndex) => (
          <article key={column.id} className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                {column.eyebrow ? (
                  <span className="inline-flex rounded-pill bg-butter px-2.5 py-0.5 text-caption font-medium text-teal-ink">
                    {column.eyebrow}
                  </span>
                ) : null}
                <h3 className="mt-2 text-h4">{column.name}</h3>
              </div>
              {column.price ? (
                <span className="text-h3-md tabular-nums text-terracotta">{column.price}</span>
              ) : null}
            </div>
            <dl className="mt-2 divide-y divide-border">
              {rows.map((row) => (
                <div key={row.label} className="py-3">
                  <dt className="text-caption font-medium text-muted">{row.label}</dt>
                  <dd className="mt-1 text-small">{row.values[columnIndex]}</dd>
                </div>
              ))}
            </dl>
            {column.action ? <div className="mt-4 [&>*]:w-full">{column.action}</div> : null}
          </article>
        ))}
      </div>
    </Section>
  );
}
