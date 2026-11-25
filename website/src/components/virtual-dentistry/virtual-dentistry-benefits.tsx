import { BookButton, CheckRows, Section } from "@/components/hims";

const BENEFITS = [
  {
    title: "Speed and Convenience",
    desc: "With virtual dental consultations, you can access dental care from the comfort of your own home.",
  },
  {
    title: "Time Saving",
    desc: "You don't have to take time off work or school to visit a dentist in person. Our Platform provides the quickest and simplest method obtaining your dental e-prescription, saving you time and effort",
  },
  {
    title: "Streamlined Prescription Management",
    desc: "Keep all your prescriptions organized and easily accessible in one place, enabling efficient tracking and monitoring",
  },
  {
    title: "Enhanced Accuracy",
    desc: "E-prescriptions significantly reduce the likelihood of errors, ensuring that you receive the precise medication, proper dosage, and accurate instructions",
  },
  {
    title: "Eco-friendly",
    desc: "Embracing paperless e-prescriptions contributed to a greener planet by minimizing paper waste and promoting eco-conscious practices.",
  },
] as const;

export function VirtualDentistryBenefits() {
  return (
    <Section theme="white" aria-labelledby="virtual-benefits-heading">
      <ul className="mx-auto grid max-w-[1000px] list-none grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [
            "/images/generated/virtual-dentistry-benefits.jpg",
            "Digital dental e-prescription care in warm natural light",
          ],
          ["/images/generated/virtual-dentistry-hero.jpg", ""],
          ["/images/generated/virtual-dentistry-services.jpg", ""],
          ["/images/generated/virtual-video.jpg", ""],
        ].map(([src, alt]) => (
          <li key={src} className="overflow-hidden rounded-[24px]">
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="aspect-[3/4] size-full object-cover"
            />
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-14 max-w-3xl text-center">
        <h2
          id="virtual-benefits-heading"
          className="text-[clamp(34px,4vw,52px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
        >
          Why you should choose <span className="text-[#8a4242]">PavDental Virtual Dentist?</span>
        </h2>
      </div>
      <div className="mt-10">
        <CheckRows items={BENEFITS.map((b) => ({ title: b.title, text: b.desc }))} />
      </div>
      <div className="mt-8 text-center">
        <BookButton>Book Appointment</BookButton>
      </div>
    </Section>
  );
}
