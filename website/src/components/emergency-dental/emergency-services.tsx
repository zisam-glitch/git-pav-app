import {
  Activity,
  AlertCircle,
  Droplets,
  Flame,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { CallButton, Heading, Section, Tile } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

const EMERGENCY_CONDITIONS = [
  { id: "toothache", title: "Toothache", icon: Zap },
  { id: "sensitivity", title: "Sensitivity", icon: Activity },
  { id: "broken-filling", title: "Broken Filling Tooth", icon: Sparkles },
  { id: "swelling-abscess", title: "Swelling/Abscess", icon: Flame },
  { id: "denture-adjustment", title: "Denture Adjustment", icon: Wrench },
  { id: "recement-crowns", title: "Re-cement Crowns", icon: Shield },
  { id: "dental-trauma", title: "Dental Trauma", icon: AlertCircle },
  { id: "painful-gums", title: "Painful Gums", icon: Droplets },
] as const;

export function EmergencyServices() {
  return (
    <Section id="services" theme="white" space="default">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2-md" accent="The Following" tone="terracotta">
            Our Emergency Dentist Can Help With
          </Heading>
        </div>
        <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_CONDITIONS.map((cond) => {
          const Icon = cond.icon;
          return (
            <Tile
              key={cond.id}
              tone="cream"
              lift
              className="flex flex-col justify-between gap-6 p-6"
            >
              <div className="grid size-10 place-items-center rounded-full border border-border bg-white text-terracotta">
                <Icon aria-hidden className="size-4" />
              </div>
              <h3 className="text-h4 text-fg">{cond.title}</h3>
            </Tile>
          );
        })}
      </div>
    </Section>
  );
}
