import { ChevronDown, ShoppingBag } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BookButton } from "@/components/hims";
import { NAV_LINKS, SERVICE_PAGES } from "@/content/site-links";
import { useCartStore } from "@/lib/cart-store";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

/** Every page in the header menu, in the live order, with Services after About. */
const HEADER_LINKS = NAV_LINKS.filter((link) => link.href !== "/");
const ABOUT_INDEX = HEADER_LINKS.findIndex((link) => link.href === "/about");

const LINK_CLASS =
  "shrink-0 rounded-pill px-3 py-1.5 text-small font-medium text-fg t-colors hover:bg-cream hover:text-muted";

/**
 * The site header: the logo, the menu on one row (wrapping below the logo on
 * narrow screens, so there is no hamburger), Book and the bag. Services opens
 * the service menu. Service pages also open the services sidebar.
 */
export function Header() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <>
      <div className="bg-lime px-4 pt-2.5 pb-[27px] -mb-[17px] text-black">
        <div className="wrap flex min-h-[24px] items-center justify-center gap-2.5 px-0 text-center">
          <p className="text-body leading-tight text-black">24/7 dental care in Bradford</p>
          <a
            href={PRACTICE_PHONE_HREF}
            className="inline-flex shrink-0 items-center rounded-pill bg-black/6 px-2.5 py-1 text-small leading-none font-medium text-black t-colors hover:bg-black/12"
          >
            {PRACTICE_PHONE}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 rounded-t-header bg-white shadow-nav">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 xl:h-[64px] xl:flex-nowrap xl:py-0">
          <a
            href="/"
            aria-label="Pav Dental home"
            className="inline-flex shrink-0 items-center rounded-pill t-colors"
          >
            <img
              src="/images/pav-logo.png"
              alt="Pav Dental"
              width={3200}
              height={869}
              className="h-8 w-auto"
            />
          </a>

          <nav
            aria-label="Primary navigation"
            className="order-last flex w-full min-w-0 flex-wrap items-center gap-x-1 gap-y-1 xl:order-none xl:w-auto xl:flex-1 xl:flex-nowrap xl:justify-center"
          >
            {HEADER_LINKS.map((link, index) => (
              <div key={link.href} className="contents">
                {index === ABOUT_INDEX + 1 ? <ServicesMenu /> : null}
                <a href={link.href} className={LINK_CLASS}>
                  {link.name}
                </a>
              </div>
            ))}
            {ABOUT_INDEX === -1 ? <ServicesMenu /> : null}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <BookButton size="sm" />
            <a
              href="/cart"
              aria-label={cartCount > 0 ? `Shopping bag (${cartCount} items)` : "Shopping bag"}
              className="relative inline-flex size-9 items-center justify-center rounded-pill text-fg t-colors hover:bg-cream"
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {cartCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-pill bg-terracotta text-[11px] leading-none font-medium text-white tabular-nums">
                  {cartCount}
                </span>
              ) : null}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

/** The Services item in the menu: a button that opens the list of every service page. */
function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0 xl:static xl:flex">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={LINK_CLASS + " inline-flex items-center gap-1"}
      >
        Services
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-[60] mt-2 w-[min(640px,calc(100vw-2rem))] rounded-xl bg-white p-4 shadow-card xl:top-[calc(100%+8px)] xl:left-1/2 xl:-translate-x-1/2"
      >
        <p className="px-3 pb-2 text-caption font-medium text-subtle">Our services</p>
        <ul className="grid gap-0.5 sm:grid-cols-2 md:grid-cols-3">
          {SERVICE_PAGES.map((service) => (
            <li key={service.href}>
              <a
                href={service.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-small text-fg t-colors hover:bg-cream hover:text-muted"
              >
                {service.name}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="/services"
          onClick={() => setOpen(false)}
          className="mt-3 block border-t border-border px-3 pt-3 text-small font-medium text-fg underline underline-offset-4 hover:text-muted"
        >
          View all services
        </a>
      </div>
    </div>
  );
}
