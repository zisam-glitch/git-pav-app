import { ArrowRight, ChevronDown, Menu, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BookButton, CallButton } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SERVICE_PAGES } from "@/content/site-links";
import { useCartStore } from "@/lib/cart-store";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

/** Every page in the header, in the live order. Services goes after About. */
const HEADER_LINKS = NAV_LINKS.filter((link) => link.href !== "/");
const ABOUT_INDEX = HEADER_LINKS.findIndex((link) => link.href === "/about");
const LINKS_BEFORE_SERVICES = HEADER_LINKS.slice(0, ABOUT_INDEX + 1);
const LINKS_AFTER_SERVICES = HEADER_LINKS.slice(ABOUT_INDEX + 1);

const TOP_SERVICES = [
  { label: "Urgent care", title: "Emergency Dental", href: "/services/emergency-dental" },
  { label: "Cosmetic", title: "Whitening", href: "/services/whitening" },
  { label: "Facial aesthetics", title: "Aesthetics", href: "/services/aesthetics" },
] as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DESKTOP_LINK =
  "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-small font-medium text-fg t-colors hover:bg-cream hover:text-muted";

/**
 * The site header. From the xl breakpoint the menu sits in the bar, with
 * Services opening the service menu. Below xl the menu is behind the hamburger,
 * which opens a side drawer with every page and service.
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

      <header className="sticky top-0 z-50 h-[49px] rounded-t-header bg-white shadow-nav xl:h-[64px]">
        <div className="wrap flex h-full items-center justify-between gap-3 xl:gap-6">
          <a
            href="/"
            aria-label="Pav Dental home"
            className="inline-flex shrink-0 items-center rounded-pill t-colors"
          >
            <img
              src="/images/pav-logo.svg"
              alt="Pav Dental"
              width={1964}
              height={569}
              className="h-8 w-auto"
            />
          </a>

          <DesktopNav />

          <div className="ml-auto flex items-center gap-2">
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
            <MenuDrawerButton />
          </div>
        </div>
      </header>
    </>
  );
}

/** The inline menu, shown from the xl breakpoint up. */
function DesktopNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
    >
      {LINKS_BEFORE_SERVICES.map((link) => (
        <a key={link.href} href={link.href} className={DESKTOP_LINK}>
          {link.name}
        </a>
      ))}
      <ServicesMenu />
      {LINKS_AFTER_SERVICES.map((link) => (
        <a key={link.href} href={link.href} className={DESKTOP_LINK}>
          {link.name}
        </a>
      ))}
    </nav>
  );
}

/** The Services item in the desktop menu: a button that opens every service page. */
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
    <div ref={rootRef} className="static flex">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(DESKTOP_LINK, "inline-flex items-center gap-1")}
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
        className="absolute top-[calc(100%+8px)] left-1/2 z-[60] w-[640px] -translate-x-1/2 rounded-xl bg-white p-4 shadow-card"
      >
        <p className="px-3 pb-2 text-caption font-medium text-subtle">Our services</p>
        <ul className="grid grid-cols-3 gap-0.5">
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

/** The hamburger below xl, and the drawer it opens with the full menu. */
function MenuDrawerButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const frame = window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      return () => {
        window.cancelAnimationFrame(frame);
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
    return undefined;
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <Button
        ref={menuButtonRef}
        type="button"
        variant="ghost"
        size="icon"
        className="xl:hidden"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-nav-drawer"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/44 transition-opacity duration-300 ease-smooth",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={closeMenu}
      />

      <aside
        ref={drawerRef}
        id="site-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[547px] flex-col bg-white shadow-card transition-transform duration-300 ease-smooth md:rounded-l-xl",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[49px] shrink-0 items-center justify-between px-6">
          <span className="text-caption font-medium text-subtle">Menu</span>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <nav aria-label="Primary navigation">
            <p className="mb-2 text-caption font-medium text-subtle">Explore</p>
            <ul className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="group flex items-center justify-between rounded-md py-2.5 text-nav-lg text-fg t-colors hover:text-muted"
                  >
                    <span>{link.name}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8">
            <p className="mb-3 text-caption font-medium text-subtle">Top services</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {TOP_SERVICES.map((service) => (
                <a
                  key={service.href}
                  href={service.href}
                  onClick={closeMenu}
                  className="group flex flex-col justify-between gap-4 rounded-xl bg-tile-cream p-4 t-lift hover:bg-white"
                >
                  <div>
                    <span className="block text-caption text-subtle">{service.label}</span>
                    <span className="mt-1 block text-label text-fg">{service.title}</span>
                  </div>
                  <ArrowRight
                    className="size-4 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Services" className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-caption font-medium text-subtle">All services</p>
              <a
                href="/services"
                onClick={closeMenu}
                className="text-caption font-medium text-fg underline underline-offset-4 hover:text-muted"
              >
                View all
              </a>
            </div>
            <ul className="space-y-0.5">
              {SERVICE_PAGES.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    onClick={closeMenu}
                    className="group flex items-center justify-between rounded-md py-2 text-nav-lg text-fg t-colors hover:text-muted"
                  >
                    <span>{service.name}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
            <BookButton className="w-full" />
            <CallButton variant="outline" className="w-full" />
          </div>
        </div>
      </aside>
    </>
  );
}
