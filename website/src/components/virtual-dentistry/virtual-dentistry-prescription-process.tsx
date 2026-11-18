import { Calendar, FileText, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const STEPS = [
  {
    icon: Calendar,
    title: "Book Appointment",
    desc: "Schedule your virtual consultation at a time that suits you.",
  },
  {
    icon: MessageCircle,
    title: "Speak With Dentist",
    desc: "Connect with a qualified dentist directly via video call.",
  },
  {
    icon: FileText,
    title: "Generate Prescription",
    desc: "Receive an electronic prescription online if clinically appropriate.",
  },
  {
    icon: Truck,
    title: "Get Your Prescription Filled",
    desc: "Collect from your preferred pharmacy or arrange delivery.",
  },
];

export function VirtualDentistryPrescriptionProcess() {
  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Online prescriptions
            </p>
            <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              How Online Prescription{" "}
              <span className="text-[#754B3D]">Service Works</span>
            </h2>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href={BOOKING_URL}>Get started today</a>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-start">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#F2EDE5] text-[#754B3D]">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-black/45">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-normal tracking-[-0.02em] text-black">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
