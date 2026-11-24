import { FileText, Heart, Mail, MapPin, User } from "lucide-react";
import { BookButton, ButtonLink, IncludedList, Section } from "@/components/hims";

const REGISTRATION_INFO = [
  { icon: User, title: "Personal Information", desc: "Name and gender" },
  { icon: Mail, title: "Contact Details", desc: "Email and phone number" },
  { icon: MapPin, title: "Address", desc: "Your address" },
  { icon: FileText, title: "Health History", desc: "Health history for patient evaluation" },
  { icon: Heart, title: "Dental History", desc: "Dental history before consultation" },
] as const;

export function VirtualDentistryRegistration() {
  return (
    <Section theme="white" aria-labelledby="virtual-registration-heading">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2
            id="virtual-registration-heading"
            className="text-[clamp(32px,3.6vw,48px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Registration <span className="text-[#8a4242]">Process.</span>
          </h2>
          <p className="mt-5 text-[20px] leading-[1.4] text-[#2a2a2c]">
            Signing up for Pav Dental virtual video consultation service is quick, short, and easy.
          </p>
          <p className="mt-4 text-[16px] leading-[1.55] text-[#6b6b70]">
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
        <IncludedList
          items={REGISTRATION_INFO.map((r) => ({ text: `${r.title}: ${r.desc}`, icon: r.icon }))}
        />
      </div>
    </Section>
  );
}
