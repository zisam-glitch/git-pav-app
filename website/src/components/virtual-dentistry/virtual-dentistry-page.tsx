import {
  Calendar,
  FileText,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
  User,
  Video,
} from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  DarkQuestion,
  FloatingCta,
  IncludedList,
  Section,
  StepsPanel,
} from "@/components/hims";
import { VirtualDentistryFaq } from "./virtual-dentistry-faq";
import { VirtualDentistryHero } from "./virtual-dentistry-hero";
import {
  BENEFITS,
  CONSULT_STEPS,
  OUTCOMES,
  PRESCRIPTION_STEPS,
  REGISTRATION_INFO,
} from "./virtual-dentistry-data";

const H2 =
  "text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]";
const REG_ICONS = [User, Mail, MapPin, FileText, Heart];

export function VirtualDentistryPage() {
  return (
    <main className="bg-white">
      <VirtualDentistryHero />

      <Section
        id="prescription-process"
        theme="white"
        aria-labelledby="virtual-prescription-heading"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 id="virtual-prescription-heading" className={H2}>
            How Online Prescription <span className="text-[#4a5c66]">Service Works?</span>
          </h2>
        </div>
        <StepsPanel steps={PRESCRIPTION_STEPS.map((s) => ({ ...s }))} />
      </Section>

      <Section id="how-it-works" theme="white" aria-labelledby="virtual-how-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="virtual-how-heading" className={H2}>
            How it <span className="text-[#4a5c66]">works?</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {[Calendar, Video, MessageCircle].map((Icon, i) => (
            <article key={CONSULT_STEPS[i].title} className="rounded-[24px] bg-[#f1f1f1] p-7 md:p-9">
              <Icon aria-hidden className="size-6 text-[#4a5c66]" />
              <h3 className="mt-5 text-[22px] leading-tight font-medium text-[#2a2a2c]">
                {CONSULT_STEPS[i].title}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-[#55565a]">
                {CONSULT_STEPS[i].desc}
              </p>
            </article>
          ))}
          <article className="rounded-[24px] bg-[#1d2b33] p-7 text-white md:p-9">
            <FileText aria-hidden className="size-6 text-[#e9c88a]" />
            <h3 className="mt-5 text-[22px] leading-tight font-medium">
              Step 4: Post-Consultation Outcomes
            </h3>
            <p className="mt-3 text-[16px] leading-[1.55] text-white/80">
              Following your consultation, a range of outcomes will be tailored to your specific
              needs, including:
            </p>
            <ul className="mt-4 list-none space-y-2.5 text-[15px] text-white/85">
              {OUTCOMES.map((o) => (
                <li key={o} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[#e9c88a]" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Section>

      <Section theme="white" aria-labelledby="virtual-benefits-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="virtual-benefits-heading" className={H2}>
            Why you should choose{" "}
            <span className="text-[#4a5c66]">PavDental Virtual Dentist?</span>
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-[900px] gap-3 sm:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className={`rounded-[24px] bg-[#f1f1f1] p-7 ${i === 0 ? "sm:col-span-2" : ""}`}
            >
              <h3 className="text-[20px] font-medium text-[#2a2a2c]">{b.title}</h3>
              <p className="mt-2 text-[16px] leading-[1.55] text-[#55565a]">{b.desc}</p>
            </div>
          ))}
        </div>
        <IncludedList
          items={[
            { text: "Dental care from your own home", icon: Smartphone },
            { text: "Paperless e-prescriptions", icon: Leaf },
          ]}
        />
      </Section>

      <Section id="registration" theme="white" aria-labelledby="virtual-registration-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="virtual-registration-heading" className={H2}>
            Registration <span className="text-[#4a5c66]">Process.</span>
          </h2>
          <p className="mt-4 text-lead text-muted">
            Signing up for Pav Dental virtual video consultation service is quick, short, and easy.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-[900px]">
          <p className="text-[17px] leading-[1.6] text-[#55565a]">
            The process of signing up for Pav Dental video consultation service is quick, short, and
            easy. The process involves providing basic information such as name, email, phone
            number, gender, address, health history, and dental history. This information is used to
            evaluate the patient before connecting them with a provider for the consultation. The
            entire process is designed to be user-friendly and convenient, making it easy for
            patients to access the service and get the dental care they need.
          </p>
          <ul className="mt-8 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {REGISTRATION_INFO.map((r, i) => {
              const Icon = REG_ICONS[i];
              return (
                <li key={r.title} className="rounded-[20px] bg-[#f1f1f1] p-5">
                  <Icon aria-hidden className="size-5 text-[#4a5c66]" />
                  <h3 className="mt-3 text-[16px] font-medium text-[#2a2a2c]">{r.title}</h3>
                  <p className="mt-1 text-[14px] text-[#55565a]">{r.desc}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="#services">Register</ButtonLink>
            <BookButton variant="outline">Book Appointment</BookButton>
          </div>
        </div>
      </Section>

      <Section id="services" theme="white" space="sm" aria-label="Choose Type of Services">
        <DarkQuestion
          lead="Choose Type"
          highlight="of Services"
          text={
            <>
              <strong className="font-medium">24 x 7 Emergency Dentists.</strong> Round the clock we
              help people to connect with Dentists
            </>
          }
          chips={["£35 Consultation", "£25 Prescription", "Video call", "E-prescription"]}
          cta={<BookButton variant="gold">Book Appointment</BookButton>}
        />
      </Section>

      <VirtualDentistryFaq />

      <CtaBand
        theme="brown"
        title="Need dental advice"
        accent="from home?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>

      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
