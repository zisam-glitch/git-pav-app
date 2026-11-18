import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
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
import { NAV_LINKS } from "@/content/site-links";
import { BOOKING_URL } from "@/lib/enquiry";

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

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: "Cosmetic & Aesthetic",
    items: [
      {
        title: "Whitening",
        href: "/services/whitening",
        description: "Brighten your smile safely",
        icon: Sparkles,
      },
      {
        title: "Cosmetic",
        href: "/services/cosmetic",
        description: "Enhance your natural beauty",
        icon: Paintbrush,
      },
      {
        title: "Aesthetics",
        href: "/services/aesthetics",
        description: "Doctor-led facial aesthetics",
        icon: Crown,
      },
      {
        title: "Custom Grillz",
        href: "/services/custom-grillz",
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
        href: "/services/tooth-extraction",
        description: "Safe and comfortable extractions",
        icon: Scissors,
      },
      {
        title: "Root Canal",
        href: "/services/root-canal",
        description: "Save your natural tooth",
        icon: Syringe,
      },
      {
        title: "Dentures",
        href: "/services/dentures",
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
        href: "/services/emergency-dental",
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
        href: "/services/oral-hygiene",
        description: "Professional cleaning & prevention",
        icon: Sparkles,
      },
      {
        title: "General Dentistry",
        href: "/services/general-dentistry",
        description: "Complete dental care for all ages",
        icon: Smile,
      },
      {
        title: "Mouthguards",
        href: "/services/mouthguards",
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
        href: "/services/mobile-dentistry",
        description: "We come to you",
        icon: Truck,
      },
      {
        title: "Virtual Dentistry",
        href: "/services/virtual-dentistry",
        description: "Online consultations & advice",
        icon: Video,
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
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300",
        servicesOpen
          ? "bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          : scrolled || mobileOpen
          ? "bg-[#FBF8F5]/90 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[108rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.02]"
          onClick={() => setMobileOpen(false)}
        >
          <img className="h-6 w-auto" src="https://res.cloudinary.com/db1i46uiv/image/upload/v1723411040/PAV_LOGO_2-01_r2ecmh.png" alt="Pav Dental" />
        </a>

        {/* Desktop nav — Hims floating white pill bar */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
          <a
            href="/"
            className="inline-flex h-[34px] items-center rounded-full bg-white px-3.5 text-xs font-medium text-black shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:bg-[#F2EDE5]"
          >
            Home
          </a>
          <a
            href="/about"
            className="inline-flex h-[34px] items-center rounded-full bg-white px-3.5 text-xs font-medium text-black shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:bg-[#F2EDE5]"
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
                "inline-flex h-[34px] items-center gap-1 rounded-full px-3.5 text-xs font-medium shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-colors duration-200",
                servicesOpen
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-[#F2EDE5]",
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              onClick={() => setServicesOpen((v) => !v)}
            >
              Services
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  servicesOpen && "rotate-180",
                )}
              />
            </button>

            {servicesOpen && (
              <div
                className="absolute left-1/2 top-full z-[60] pt-3 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2"
                onMouseEnter={openServices}
                onMouseLeave={scheduleCloseServices}
              >
                <div className="overflow-hidden rounded-[1.5rem] border border-black/8 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
                    {SERVICE_CATEGORIES.map((category) => (
                      <div key={category.title} className="min-w-0">
                        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-black/45">
                          {category.title}
                        </p>
                        <ul className="space-y-1">
                          {category.items.map((item) => (
                            <li key={item.title}>
                              <a
                                href={item.href}
                                className="flex items-start gap-2.5 rounded-2xl p-2 transition-colors hover:bg-[#FAF8F2]"
                                onClick={() => setServicesOpen(false)}
                              >
                                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-[#F2EDE5]">
                                  <item.icon className="size-3.5 text-[#1B3745]" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-medium leading-tight text-black">
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <span className="mt-0.5 block text-[11px] leading-snug text-black/55 line-clamp-1">
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

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4 px-2">
                    <a
                      href="/services"
                      className="text-sm font-medium text-black underline-offset-4 hover:underline"
                      onClick={() => setServicesOpen(false)}
                    >
                      View all services →
                    </a>
                    <p className="text-xs text-black/55">
                      Not sure which service you need?{" "}
                      <a
                        href={BOOKING_URL}
                        className="font-medium text-black underline-offset-4 hover:underline"
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
              className="inline-flex h-[34px] items-center rounded-full bg-white px-3.5 text-xs font-medium text-black shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:bg-[#F2EDE5]"
            >
              {l.name}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="tel:08001938786"
            className="hidden h-[34px] items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-medium text-black shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#F2EDE5] xl:inline-flex"
          >
            <Phone className="size-3.5 text-[#1B3745]" />
            <span>0800 1938 786</span>
          </a>
          <Button asChild size="sm" className="h-[34px] px-4 text-xs">
            <a href={BOOKING_URL}>Book Now</a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-[34px] rounded-full border-black/10 bg-white lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              setMobileOpen((v) => !v);
              setServicesOpen(false);
            }}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={cn(
          "bg-[#FBF8F5] max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-black/8 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          <a
            href="/"
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
            <a
              href="/services"
              className="block rounded-xl px-3 py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              View all services
            </a>
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
              {l.name}
            </a>
          ))}

          <div className="mt-3 flex flex-col gap-2   pt-3">
            <Button asChild className="w-full">
              <a href={BOOKING_URL} onClick={() => setMobileOpen(false)}>
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
    <div className="  last:border-0">
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