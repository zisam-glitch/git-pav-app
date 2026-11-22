import { Mail, MapPin, Phone } from "lucide-react";
import { Section, Tile } from "@/components/hims";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyContactStrip() {
  return (
    <Section theme="cream" space="sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile tone="white" lift className="flex items-start gap-4 p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-cream text-terracotta">
            <MapPin aria-hidden className="size-4" />
          </div>
          <div>
            <p className="text-caption font-medium text-muted">Address</p>
            <p className="mt-1 text-body font-medium text-fg">
              HUB – 786 Leeds Road, Bradford, BD3 9TY
            </p>
          </div>
        </Tile>

        <Tile tone="white" lift className="flex items-start gap-4 p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-cream text-terracotta">
            <Phone aria-hidden className="size-4" />
          </div>
          <div>
            <p className="text-caption font-medium text-muted">Phone</p>
            <a
              href={PRACTICE_PHONE_HREF}
              className="mt-1 inline-flex min-h-11 items-center text-body font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              {PRACTICE_PHONE}
            </a>
          </div>
        </Tile>

        <Tile tone="white" lift className="flex items-start gap-4 p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-cream text-terracotta">
            <Mail aria-hidden className="size-4" />
          </div>
          <div>
            <p className="text-caption font-medium text-muted">Email</p>
            <a
              href={`mailto:${PRACTICE_EMAIL}`}
              className="mt-1 inline-flex min-h-11 items-center text-body font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              {PRACTICE_EMAIL}
            </a>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
