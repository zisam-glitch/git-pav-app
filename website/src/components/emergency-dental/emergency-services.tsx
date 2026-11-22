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
    <Section id="services" theme="navy" space="lg">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Heading as="h2" size="hero" accent="The Following" tone="butter" className="max-w-3xl">
          Our Emergency Dentist Can Help With
        </Heading>
        <CallButton variant="butter">Call us Now · {PRACTICE_PHONE}</CallButton>
      </div>

      <div className="mt-10 grid gap-2 md:mt-14 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_CONDITIONS.map((cond) => {
          const Icon = cond.icon;
          return (
            <Tile
              key={cond.id}
              tone="glass"
              className="flex flex-col justify-between gap-6 border border-white/12 p-6 t-colors hover:bg-white/12"
            >
              <div className="grid size-10 place-items-center rounded-full bg-white/10 text-butter">
                <Icon aria-hidden className="size-4" />
              </div>
              <h3 className="text-h4 text-white">{cond.title}</h3>
            </Tile>
          );
        })}
      </div>
    </Section>
  );
}
