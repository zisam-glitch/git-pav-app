import { BookButton, FaqSplit, Section, type FaqItem } from "@/components/hims";

const FAQS: FaqItem[] = [
  {
    q: "How do I schedule a virtual consultation with Pav Dental?",
    a: "To schedule a virtual consultation with Pav Dental, simply log into your account on the Pav Dental website or mobile app and select the virtual consultation option. From there, you will be able to choose a convenient time and date for your appointment",
  },
  {
    q: "Do I need to have any specific technology to use the virtual consultation service?",
    a: "You can access the service from any device with an internet connection and a camera, such as a smartphone, tablet, or computer.",
  },
  {
    q: "How does the virtual consultation work?",
    a: "The virtual consultation works by connecting you with a licensed dentist through video conferencing. The dentist will be able to see and hear you, and you will be able to see and hear the dentist. During the consultation, the dentist will assess your dental needs and discuss your treatment options.",
  },
  {
    q: "What happens after the virtual consultation?",
    a: "Following the virtual consultation, if deemed necessary prior to an in-person visit or primary care, the dentist will issue an electronic prescription for any required treatments or medications. This prescription will be transmitted to your preferred pharmacy, allowing you to conveniently retrieve it.",
  },
  {
    q: "How long does it take to receive a prescription after the virtual consultation?",
    a: "After your virtual consultation with the dentist, they will promptly e-file your prescription with your preferred pharmacy. Its availability to retrieve from your preferred pharmacy may depend on their stock and business hours.",
  },
  {
    q: "How much does a prescription cost?",
    a: "Flat rate £25.",
  },
  {
    q: "What is a virtual video consultation?",
    a: "A virtual video dental consultation is a way for you to connect with a dentist via video call. During the consultation, you can discuss your oral health concerns and treatment plan, and get any questions answered.",
  },
  {
    q: "How do I book a virtual video consultation?",
    a: "You can book a virtual video dental consultation through Pav Dental's platform, either as a subscriber or on a pay-as-you-go basis. Simply select the type of appointment you need, choose a date and time, and you will be connected with a qualified dentist.",
  },
  {
    q: "What type of services can I receive during a virtual video dental consultation?",
    a: "During a virtual video dental consultation, you can receive a wide range of services, including preventive care, smile correction, night guards, remineralization trays, sleep apnea devices, electronic prescriptions, free specialist referrals, and more.",
  },
  {
    q: "What equipment do I need for a virtual video dental consultation?",
    a: "All you need for a virtual video dental consultation is a device with a camera, such as a smartphone, tablet, or computer, and a reliable internet connection.",
  },
  {
    q: "Can I receive a diagnosis and treatment plan during a virtual video dental consultation?",
    a: "Yes, you can receive a diagnosis and treatment plan during a virtual video dental consultation. Your dentist will assess your oral health, answer any questions you have, and provide you with a personalized treatment plan.",
  },
  {
    q: "How long does a virtual video dental consultation typically last?",
    a: "Virtual video dental consultations typically last 30 minutes. You will have ample time to discuss your oral health concerns and receive a diagnosis and treatment plan from your dentist.",
  },
];

export function VirtualDentistryFaq() {
  return (
    <Section id="faq" theme="white" aria-labelledby="virtual-faq-heading">
      <FaqSplit
        id="virtual-faq-heading"
        title="Frequently Asked Question"
        action={<BookButton>Book Appointment</BookButton>}
        items={FAQS}
      />
    </Section>
  );
}
