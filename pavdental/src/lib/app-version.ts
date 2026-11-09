/** True when `installed` is an older x.y.z than `minimum`. Anything unparseable is never "too old". */
export function isOlderVersion(installed: string | undefined | null, minimum: string | undefined | null): boolean {
  const parse = (v: string | undefined | null) => {
    const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v ?? "");
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };
  const a = parse(installed);
  const b = parse(minimum);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}
