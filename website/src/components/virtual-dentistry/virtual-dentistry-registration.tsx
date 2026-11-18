import { ArrowRight, FileText, Heart, Mail, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const REGISTRATION_INFO = [
  {
    icon: User,
    title: "Personal Information",
    desc: "Name, gender, and contact details",
  },
  {
    icon: Mail,
    title: "Contact Details",
    desc: "Email address and phone number",
  },
  {
    icon: MapPin,
    title: "Address",
    desc: "Your current residential address",
  },
  {
    icon: FileText,
    title: "Health History",
    desc: "General medical background information",
  },
  {
    icon: Heart,
    title: "Dental History",
    desc: "Previous dental treatments and conditions",
  },
];

export function VirtualDentistryRegistration() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-14 text-white sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                Quick onboarding
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Registration Process
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/80">
                Signing up for the Pav Dental video consultation service is quick, short, and easy.
                Providing basic details helps our clinical team evaluate your needs before
                connecting you with a dentist.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <a href={BOOKING_URL}>
                    Book video consultation <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#services">View services</a>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {REGISTRATION_INFO.map((info, index) => (
                <div
                  key={info.title}
                  className={`${
                    index === REGISTRATION_INFO.length - 1 ? "sm:col-span-2" : ""
                  } rounded-[1.25rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm`}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-[#ECD880] text-[#1B3745]">
                    <info.icon className="size-4" />
                  </span>
                  <h3 className="mt-3 font-display text-lg font-normal text-white">
                    {info.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/75">{info.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
