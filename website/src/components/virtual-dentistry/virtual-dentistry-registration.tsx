import { FileText, Heart, Mail, MapPin, User } from "lucide-react";
import { BookButton, ButtonLink, Heading, Section } from "@/components/hims";

const REGISTRATION_INFO = [
  { icon: User, title: "Personal Information", desc: "Name and gender" },
  { icon: Mail, title: "Contact Details", desc: "Email and phone number" },
  { icon: MapPin, title: "Address", desc: "Your address" },
  { icon: FileText, title: "Health History", desc: "Health history for patient evaluation" },
  { icon: Heart, title: "Dental History", desc: "Dental history before consultation" },
] as const;

export function VirtualDentistryRegistration() {
  return (
    <Section theme="cream" aria-labelledby="virtual-registration-heading">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-28">
        <div className="lg:sticky lg:top-24">
          <div id="virtual-registration-heading">
            <Heading as="h2" size="h3" accent="Process." tone="terracotta" inline>
              Registration
            </Heading>
          </div>
          <p className="mt-4 text-lead text-fg">
            Signing up for Pav Dental virtual video consultation service is quick, short, and easy.
          </p>
          <p className="mt-4 text-body text-muted">
            The process of signing up for Pav Dental video consultation service is quick, short, and
            easy. The process involves providing basic information such as name, email, phone
            number, gender, address, health history, and dental history. This information is used to
            evaluate the patient before connecting them with a provider for the consultation. The
            entire process is designed to be user-friendly and convenient, making it easy for
            patients to access the service and get the dental care they need.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="#services">Register</ButtonLink>
            <BookButton variant="outline">Book Appointment</BookButton>
          </div>
        </div>

        <ul className="grid gap-3">
          {REGISTRATION_INFO.map((info) => {
            const Icon = info.icon;
            return (
              <li
                key={info.title}
                className="flex items-center gap-5 rounded-xl bg-white p-5 md:p-6"
              >
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-terracotta"
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="text-label text-fg">{info.title}</h3>
                  <p className="mt-1 text-small text-muted">{info.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
