import { ChevronDown, ShoppingBag } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BookButton } from "@/components/hims";
import { NAV_LINKS, SERVICE_PAGES } from "@/content/site-links";
import { useCartStore } from "@/lib/cart-store";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

/** Every page in the header menu, in the live order. Services goes after About. */
const HEADER_LINKS = NAV_LINKS.filter((link) => link.href !== "/");
const ABOUT_INDEX = HEADER_LINKS.findIndex((link) => link.href === "/about");
const LINKS_BEFORE_SERVICES = HEADER_LINKS.slice(0, ABOUT_INDEX + 1);
const LINKS_AFTER_SERVICES = HEADER_LINKS.slice(ABOUT_INDEX + 1);

const LINK_CLASS =
  "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-small font-medium text-fg t-colors hover:bg-cream hover:text-muted";

/**
 * The site header. On a phone the menu is one row that scrolls sideways under
 * the logo, so there is no hamburger and the header stays short. From the xl
 * breakpoint the menu sits in the bar. Services opens the service menu.
 */
export function Header() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [servicesOpen, setServicesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!servicesOpen) return undefined;

    function onPointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [servicesOpen]);

  const closeServices = () => setServicesOpen(false);

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

      <header ref={headerRef} className="sticky top-0 z-50 rounded-t-header bg-white shadow-nav">
        <div className="wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 xl:h-[64px] xl:flex-nowrap xl:gap-x-6 xl:py-0">
          <a
            href="/"
            aria-label="Pav Dental home"
            className="inline-flex shrink-0 items-center rounded-pill t-colors"
          >
            <img
              src="/images/pav-logo.svg"
              alt="Pav Dental"
              width={1567}
              height={569}
              className="h-8 w-auto"
            />
          </a>

          <nav
            aria-label="Primary navigation"
            className="order-last flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] xl:order-none xl:w-auto xl:flex-1 xl:justify-center xl:overflow-visible xl:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {LINKS_BEFORE_SERVICES.map((link) => (
              <a key={link.href} href={link.href} className={LINK_CLASS}>
                {link.name}
              </a>
            ))}
            <button
              ref={servicesButtonRef}
              type="button"
              aria-expanded={servicesOpen}
              aria-controls={panelId}
              onClick={() => setServicesOpen((open) => !open)}
              className={cn(LINK_CLASS, "inline-flex items-center gap-1")}
            >
              Services
              <ChevronDown
                className={cn("size-4 transition-transform duration-200", servicesOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {LINKS_AFTER_SERVICES.map((link) => (
              <a key={link.href} href={link.href} className={LINK_CLASS}>
                {link.name}
              </a>
            ))}
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

          {/* Outside the scrolling menu, so the panel is never clipped. */}
          <div
            id={panelId}
            hidden={!servicesOpen}
            className="absolute inset-x-4 top-full z-[60] mt-2 rounded-xl bg-white p-4 shadow-card xl:inset-x-auto xl:left-1/2 xl:w-[640px] xl:-translate-x-1/2"
          >
            <p className="px-3 pb-2 text-caption font-medium text-subtle">Our services</p>
            <ul className="grid gap-0.5 sm:grid-cols-2 md:grid-cols-3">
              {SERVICE_PAGES.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    onClick={closeServices}
                    className="block rounded-md px-3 py-2 text-small text-fg t-colors hover:bg-cream hover:text-muted"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/services"
              onClick={closeServices}
              className="mt-3 block border-t border-border px-3 pt-3 text-small font-medium text-fg underline underline-offset-4 hover:text-muted"
            >
              View all services
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
