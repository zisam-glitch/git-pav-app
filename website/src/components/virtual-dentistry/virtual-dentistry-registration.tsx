import { FileText, Heart, Mail, MapPin, User } from "lucide-react";
import { ButtonLink, Heading, Section, SplitFeature, Tile } from "@/components/hims";

const REGISTRATION_INFO = [
  { icon: User, title: "Personal Information", desc: "Name and gender" },
  { icon: Mail, title: "Contact Details", desc: "Email and phone number" },
  { icon: MapPin, title: "Address", desc: "Your address" },
  { icon: FileText, title: "Health History", desc: "Health history for patient evaluation" },
  { icon: Heart, title: "Dental History", desc: "Dental history before consultation" },
] as const;

export function VirtualDentistryRegistration() {
  return (
    <Section theme="cream" space="default">
      <SplitFeature
        reverse
        media={
          <div className="grid gap-4 sm:grid-cols-2">
            {REGISTRATION_INFO.map((info) => {
              const Icon = info.icon;
              return (
                <Tile key={info.title} tone="white" className="p-5">
                  <span className="grid size-10 place-items-center rounded-lg bg-cream text-terracotta">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <h3 className="mt-3 text-label text-fg">{info.title}</h3>
                  <p className="mt-1 text-small text-muted">{info.desc}</p>
                </Tile>
              );
            })}
          </div>
        }
      >
        <div>
          <Heading as="h2" size="h2-md" accent="Process." tone="terracotta" inline>
            Registration
          </Heading>
          <p className="mt-5 text-body text-muted">
            The process of signing up for Pav Dental video consultation service is quick, short, and
            easy. The process involves providing basic information such as name, email, phone
            number, gender, address, health history, and dental history. This information is used to
            evaluate the patient before connecting them with a provider for the consultation. The
            entire process is designed to be user-friendly and convenient, making it easy for
            patients to access the service and get the dental care they need.
          </p>
          <div className="mt-8">
            <ButtonLink href="#services">Register</ButtonLink>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
