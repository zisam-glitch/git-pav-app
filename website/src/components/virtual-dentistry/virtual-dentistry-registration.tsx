import { FileText, Heart, Mail, MapPin, User } from "lucide-react";
import { BookButton, ButtonLink, Heading, Section, SplitFeature, Tile } from "@/components/hims";

const REGISTRATION_INFO = [
  { icon: User, title: "Personal Information", desc: "Name and gender" },
  { icon: Mail, title: "Contact Details", desc: "Email and phone number" },
  { icon: MapPin, title: "Address", desc: "Your address" },
  { icon: FileText, title: "Health History", desc: "Health history for patient evaluation" },
  { icon: Heart, title: "Dental History", desc: "Dental history before consultation" },
] as const;

export function VirtualDentistryRegistration() {
  return (
    <Section theme="white" space="default" aria-labelledby="virtual-registration-heading">
      <SplitFeature
        reverse
        media={
          <div className="grid gap-4 sm:grid-cols-2">
            {REGISTRATION_INFO.map((info, index) => {
              const Icon = info.icon;
              return (
                <Tile
                  key={info.title}
                  tone="white"
                  lift
                  className="border border-border p-5 md:p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-cream text-terracotta">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="inline-flex items-center rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-h4 text-fg">{info.title}</h3>
                  <p className="mt-1 text-small text-muted">{info.desc}</p>
                </Tile>
              );
            })}
          </div>
        }
      >
        <div>
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Quick Online Onboarding
          </span>
          <div id="virtual-registration-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="Process." tone="terracotta" inline>
              Registration
            </Heading>
          </div>
          <p className="mt-4 text-lead text-fg">
            Signing up for Pav Dental virtual video consultation service is quick, short, and easy.
          </p>
          <p className="mt-4 text-body leading-relaxed text-muted">
            The process of signing up for Pav Dental video consultation service is quick, short, and
            easy. The process involves providing basic information such as name, email, phone
            number, gender, address, health history, and dental history. This information is used to
            evaluate the patient before connecting them with a provider for the consultation. The
            entire process is designed to be user-friendly and convenient, making it easy for
            patients to access the service and get the dental care they need.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#services">Register</ButtonLink>
            <BookButton variant="outline">Book Appointment</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
