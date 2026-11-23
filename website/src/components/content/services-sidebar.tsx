import { useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SERVICE_PAGES } from "@/content/site-links";
import { cn } from "@/lib/utils";

/**
 * The service menu sidebar. On a service page it is open beside the content
 * from the xl breakpoint up; below that it opens over the page from a button.
 */
export function ServicesSidebar() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={drawerOpen}
        aria-controls="services-sidebar"
        onClick={() => setDrawerOpen((open) => !open)}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-pill bg-fg px-4 py-2.5 text-small font-medium text-white shadow-card xl:hidden"
      >
        {drawerOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
        All services
      </button>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-[65] bg-black/40 xl:hidden"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <aside
        id="services-sidebar"
        aria-label="Services"
        className={cn(
          "fixed inset-y-0 left-0 z-[66] flex w-72 flex-col overflow-y-auto border-r border-border bg-cream px-5 pt-6 pb-24 transition-transform duration-300 ease-smooth xl:z-40 xl:translate-x-0 xl:pt-24",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-caption font-medium text-subtle">Services</p>
          <button
            type="button"
            aria-label="Close services menu"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex size-8 items-center justify-center rounded-pill text-fg hover:bg-white xl:hidden"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Service pages">
          <ul className="space-y-0.5">
            {SERVICE_PAGES.map((service) => {
              const current = service.href === pathname;
              return (
                <li key={service.href}>
                  <a
                    href={service.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-small t-colors",
                      current
                        ? "bg-white font-medium text-fg shadow-card"
                        : "text-fg hover:bg-white hover:text-muted",
                    )}
                  >
                    {service.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <a
          href="/services"
          onClick={() => setDrawerOpen(false)}
          className="mt-4 px-3 text-small font-medium text-fg underline underline-offset-4 hover:text-muted"
        >
          View all services
        </a>
      </aside>
    </>
  );
}
