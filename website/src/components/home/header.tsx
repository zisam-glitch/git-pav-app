import { ArrowRight, Menu, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
 * The site header. From the xl breakpoint the menu sits in the bar; below xl it is
 * behind the hamburger. Both open the same side drawer, and Services in the bar opens
 * it at the list of services.
 */
export function Header() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);

  const openMenu = useCallback((services: boolean) => {
    setShowServices(services);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

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

          <nav
            aria-label="Primary navigation"
            className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
          >
            {LINKS_BEFORE_SERVICES.map((link) => (
              <a key={link.href} href={link.href} className={DESKTOP_LINK}>
                {link.name}
              </a>
            ))}
            <button
              ref={servicesButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={menuOpen && showServices}
              aria-controls="site-nav-drawer"
              onClick={() => openMenu(true)}
              className={DESKTOP_LINK}
            >
              Services
            </button>
            {LINKS_AFTER_SERVICES.map((link) => (
              <a key={link.href} href={link.href} className={DESKTOP_LINK}>
                {link.name}
              </a>
            ))}
          </nav>

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
            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              className="xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-nav-drawer"
              onClick={() => (menuOpen ? closeMenu() : openMenu(false))}
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <MenuDrawer
        open={menuOpen}
        showServices={showServices}
        onClose={closeMenu}
        menuButtonRef={menuButtonRef}
        servicesButtonRef={servicesButtonRef}
      />
    </>
  );
}

type MenuDrawerProps = {
  open: boolean;
  /** Opened from the Services item: scroll the list of services into view. */
  showServices: boolean;
  onClose: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  servicesButtonRef: React.RefObject<HTMLButtonElement | null>;
};

/** The side drawer with every page and service. */
function MenuDrawer({
  open,
  showServices,
  onClose,
  menuButtonRef,
  servicesButtonRef,
}: MenuDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";
      const frame = window.requestAnimationFrame(() => {
        if (showServices) servicesRef.current?.scrollIntoView({ block: "start" });
        closeButtonRef.current?.focus({ preventScroll: true });
      });
      return () => {
        window.cancelAnimationFrame(frame);
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      // The hamburger is hidden from xl up; there focus goes back to Services.
      const hamburger = menuButtonRef.current;
      if (hamburger && hamburger.offsetParent !== null) hamburger.focus();
      else servicesButtonRef.current?.focus();
    }
    return undefined;
  }, [open, showServices, menuButtonRef, servicesButtonRef]);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
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
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/44 transition-opacity duration-300 ease-smooth",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        ref={drawerRef}
        id="site-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[547px] flex-col bg-white shadow-card transition-transform duration-300 ease-smooth md:rounded-l-xl",
          open ? "translate-x-0" : "translate-x-full",
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
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <nav aria-label="Menu pages">
            <p className="mb-2 text-caption font-medium text-subtle">Explore</p>
            <ul className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={onClose}
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
                  onClick={onClose}
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

          <nav ref={servicesRef} aria-label="Services" className="mt-8 scroll-mt-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-caption font-medium text-subtle">All services</p>
              <a
                href="/services"
                onClick={onClose}
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
                    onClick={onClose}
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
