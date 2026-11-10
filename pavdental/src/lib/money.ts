/**
 * The one way money is shown. Amounts are whole pence everywhere in the app and
 * on the server; they become pounds only here, at the last moment.
 */
export function formatGbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
