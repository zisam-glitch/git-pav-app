/**
 * Date of birth typed as DD/MM/YYYY → ISO YYYY-MM-DD, or null when it is not a
 * real date, is in the future, or is more than 120 years ago.
 */
export function parseDob(value: string, now: Date = new Date()): string | null {
  const m = value.trim().match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (date.getTime() > today) return null;
  if (year < now.getUTCFullYear() - 120) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
