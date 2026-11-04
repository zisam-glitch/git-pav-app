import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Crown,
  Gem,
  Menu,
  Paintbrush,
  Phone,
  Scissors,
  Shield,
  Smile,
  Sparkles,
  Syringe,
  Truck,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

type ServiceCategory = {
  title: string;
  items: LinkItem[];
};

const NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/team", label: "Team" },
  { href: "/shop", label: "Shop" },
  { href: "/petition", label: "Petition" },
  { href: "/vacancies", label: "Vacancies" },
  { href: "/blogs", label: "Blogs" },
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: "Cosmetic & Aesthetic",
    items: [
      {
        title: "Whitening",
        href: "/whitening",
        description: "Brighten your smile safely",
        icon: Sparkles,
      },
      {
        title: "Cosmetic",
        href: "/cosmetic",
        description: "Enhance your natural beauty",
        icon: Paintbrush,
      },
      {
        title: "Aesthetics",
        href: "/aesthetics",
        description: "Doctor-led facial aesthetics",
        icon: Crown,
      },
      {
        title: "Custom Grillz",
        href: "/custom-grillz",
        description: "Personalized gold & diamond grillz",
        icon: Gem,
      },
    ],
  },
  {
    title: "Restorative Treatments",
    items: [
      {
        title: "Tooth Extraction",
        href: "/tooth-extraction",
        description: "Safe and comfortable extractions",
        icon: Scissors,
      },
      {
        title: "Root Canal",
        href: "/root-canal",
        description: "Save your natural tooth",
        icon: Syringe,
      },
      {
        title: "Dentures",
        href: "/dentures",
        description: "Custom-fitted dentures & repairs",
        icon: Smile,
      },
    ],
  },
  {
    title: "Emergency & Urgent",
    items: [
      {
        title: "Emergency Dental",
        href: "/emergency-dental",
        description: "Immediate care when you need it most",
        icon: AlertCircle,
      },
    ],
  },
  {
    title: "Preventive Care",
    items: [
      {
        title: "Oral Hygiene",
        href: "/oral-hygiene",
        description: "Professional cleaning & prevention",
        icon: Sparkles,
      },
      {
        title: "General Dentistry",
        href: "/general-dentistry",
        description: "Complete dental care for all ages",
        icon: Smile,
      },
      {
        title: "Mouthguards",
        href: "/mouthguards",
        description: "Custom sports & night guards",
        icon: Shield,
      },
    ],
  },
  {
    title: "Special Services",
    items: [
      {
        title: "Mobile Dentistry",
        href: "/mobile-dentistry",
        description: "We come to you",
        icon: Truck,
      },
      {
        title: "Virtual Dentistry",
        href: "/virtual-dentistry",
        description: "Online consultations & advice",
        icon: Video,
      },
    ],
  },
  {
    title: "Patient Support",
    items: [
      {
        title: "Finance",
        href: "#services",
        description: "Flexible payment options",
        icon: CreditCard,
      },
      {
        title: "Registration",
        href: "#services",
        description: "New patient registration",
        icon: ClipboardList,
      },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };

  const scheduleCloseServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background,box-shadow,border-color] duration-200",
        servicesOpen
          ? "border-transparent bg-white shadow-soft"
          : scrolled || mobileOpen
          ? "border-border/70 glass shadow-soft"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2 font-medium"
          onClick={() => setMobileOpen(false)}
        >
          <img className="h-8 w-auto" src="https://res.cloudinary.com/db1i46uiv/image/upload/v1723411040/PAV_LOGO_2-01_r2ecmh.png" alt="" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          <a
            href="#top"
            className="rounded-full px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            Home
          </a>
          <a
            href="/about"
            className="rounded-full px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            About
          </a>

          {/* Services trigger + mega menu */}
          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors duration-150",
                servicesOpen ? "text-fg" : "text-muted hover:text-fg",
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
              <ChevronDown
                className={cn(
                  "size-4 mt-0.5 transition-transform duration-200",
                  servicesOpen && "rotate-180",
                )}
              />
            </button>

            {servicesOpen && (
              <div
                className="absolute left-1/2 top-full z-[60] mt-[15px] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2"
                onMouseEnter={openServices}
                onMouseLeave={scheduleCloseServices}
              >
                <div className="bg-[#FFF] overflow-hidden rounded-b-2xl p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                    {SERVICE_CATEGORIES.map((category) => (
                      <div key={category.title} className="min-w-0">
                        <p className="mb-2 px-2 text-[11px] font-semibold text-subtle">
                          {category.title}
                        </p>
                        <ul className="space-y-0.5">
                          {category.items.map((item) => (
                            <li key={item.title}>
                              <a
                                href={item.href}
                                className="flex items-start gap-2.5 rounded-xl p-2 transition-colors hover:bg-elevated/70"
                                onClick={() => setServicesOpen(false)}
                              >
                                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-surface/80">
                                  <item.icon className="size-3.5 text-primary" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-medium leading-tight text-fg">
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <span className="mt-0.5 block text-[11px] leading-snug text-muted line-clamp-1">
                                      {item.description}
                                    </span>
                                  )}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="px-2 text-sm text-muted">
                      Not sure which service you need?{" "}
                      <a
                        href="#contact"
                        className="font-medium text-fg underline-offset-2 hover:underline"
                        onClick={() => setServicesOpen(false)}
                      >
                        Book a free consultation
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {NAV_LINKS.slice(2).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          <Button asChild size="sm">
            <a href="/booking">Book Now</a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              setMobileOpen((v) => !v);
              setServicesOpen(false);
            }}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={cn(
          "glass max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/70 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          <a
            href="#top"
            className="rounded-xl px-3 py-2.5 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </a>
          <a
            href="/about"
            className="rounded-xl px-3 py-2.5 text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            About
          </a>

          {/* Nested services accordion */}
          <div className="mt-1">
            <p className="mb-1 px-3 text-[11px] font-semibold text-subtle">
              Services
            </p>
            {SERVICE_CATEGORIES.map((category) => (
              <MobileServiceCategory
                key={category.title}
                category={category}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>

          {NAV_LINKS.slice(2).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-xl px-3 py-2.5 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}

          <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
            <Button asChild className="w-full">
              <a href="/booking" onClick={() => setMobileOpen(false)}>
                Book Now
              </a>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <a href="tel:08001938786" onClick={() => setMobileOpen(false)}>
                <Phone className="size-4" />
                0800 1938 786
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileServiceCategory({
  category,
  onNavigate,
}: {
  category: ServiceCategory;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-elevated/50"
        aria-expanded={open}
      >
        <span>{category.title}</span>
        <ChevronRight
          className={cn(
            "size-4 text-muted transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>
      {open && (
        <div className="space-y-0.5 pb-2 pl-2">
          {category.items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated/60 hover:text-fg"
              onClick={onNavigate}
            >
              <item.icon className="size-4 shrink-0 text-primary" />
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}