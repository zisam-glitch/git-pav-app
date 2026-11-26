/** The Hims "Labs | What We Test | How It Works" bar: a centred row of section links that stays under the page header. */
export function SubNav({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  return (
    <nav
      aria-label={label}
      className="sticky top-[60px] z-30 border-b border-black/10 bg-white/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[1392px] list-none items-center justify-center gap-6 overflow-x-auto px-4 py-3.5 text-[15px] font-medium text-[#2a2a2c] [scrollbar-width:none] md:gap-10">
        {items.map((it) => (
          <li key={it.href} className="shrink-0">
            <a href={it.href} className="t-colors hover:text-[#8a4242]">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
