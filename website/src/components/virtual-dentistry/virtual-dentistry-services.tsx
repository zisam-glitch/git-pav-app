import { Clock, FileText, Home, Phone, Shield, Video } from "lucide-react";

const SERVICES = [
  {
    icon: Clock,
    title: "24 x 7 Emergency Dentists",
    desc: "Round the clock we help people to connect with dentists for urgent dental advice.",
    tone: "hims-tile-warm",
  },
  {
    icon: Video,
    title: "Video Consultations",
    desc: "Connect with qualified dentists from anywhere using our secure video platform.",
    tone: "bg-white",
  },
  {
    icon: FileText,
    title: "Online Prescriptions",
    desc: "Get your prescriptions online and sent directly to your preferred pharmacy.",
    tone: "hims-tile-sage",
  },
  {
    icon: Home,
    title: "Home Visit Coordination",
    desc: "Arrange for dental professionals to visit you at home when in-person care is needed.",
    tone: "bg-[#F2EDE5]",
  },
  {
    icon: Shield,
    title: "General Dental Advice",
    desc: "Receive professional guidance on managing your oral health remotely.",
    tone: "hims-tile-warm",
  },
  {
    icon: Phone,
    title: "Treatment Planning",
    desc: "Create comprehensive clinic or remote treatment plans with our experienced dentists.",
    tone: "hims-tile-sage",
  },
];

export function VirtualDentistryServices() {
  return (
    <section id="services" className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Remote dental support
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Choose Type of{" "}
            <span className="text-[#754B3D]">Services</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Access consultation, prescriptions, and follow-up planning from the comfort of home.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              className={`${service.tone} rounded-[1.5rem] border border-black/6 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-white text-[#1B3745] shadow-xs">
                <service.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-normal tracking-[-0.02em] text-black">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">{service.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
