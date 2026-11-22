import { BookButton, CallButton } from "@/components/hims";
import { FaqSection } from "@/components/hims/faq-section";
import type { InfoAccordionItem } from "@/components/hims/info-accordion";

const FAQS: readonly InfoAccordionItem[] = [
  {
    title: "How do I schedule a virtual consultation with Pav Dental?",
    content:
      "To schedule a virtual consultation with Pav Dental, simply log into your account on the Pav Dental website or mobile app and select the virtual consultation option. From there, you will be able to choose a convenient time and date for your appointment",
  },
  {
    title: "Do I need to have any specific technology to use the virtual consultation service?",
    content:
      "You can access the service from any device with an internet connection and a camera, such as a smartphone, tablet, or computer.",
  },
  {
    title: "How does the virtual consultation work?",
    content:
      "The virtual consultation works by connecting you with a licensed dentist through video conferencing. The dentist will be able to see and hear you, and you will be able to see and hear the dentist. During the consultation, the dentist will assess your dental needs and discuss your treatment options.",
  },
  {
    title: "What happens after the virtual consultation?",
    content:
      "Following the virtual consultation, if deemed necessary prior to an in-person visit or primary care, the dentist will issue an electronic prescription for any required treatments or medications. This prescription will be transmitted to your preferred pharmacy, allowing you to conveniently retrieve it.",
  },
  {
    title: "How long does it take to receive a prescription after the virtual consultation?",
    content:
      "After your virtual consultation with the dentist, they will promptly e-file your prescription with your preferred pharmacy. Its availability to retrieve from your preferred pharmacy may depend on their stock and business hours.",
  },
  {
    title: "How much does a prescription cost?",
    content: "Flat rate £25.",
  },
  {
    title: "What is a virtual video consultation?",
    content:
      "A virtual video dental consultation is a way for you to connect with a dentist via video call. During the consultation, you can discuss your oral health concerns and treatment plan, and get any questions answered.",
  },
  {
    title: "How do I book a virtual video consultation?",
    content:
      "You can book a virtual video dental consultation through Pav Dental's platform, either as a subscriber or on a pay-as-you-go basis. Simply select the type of appointment you need, choose a date and time, and you will be connected with a qualified dentist.",
  },
  {
    title: "What type of services can I receive during a virtual video dental consultation?",
    content:
      "During a virtual video dental consultation, you can receive a wide range of services, including preventive care, smile correction, night guards, remineralization trays, sleep apnea devices, electronic prescriptions, free specialist referrals, and more.",
  },
  {
    title: "What equipment do I need for a virtual video dental consultation?",
    content:
      "All you need for a virtual video dental consultation is a device with a camera, such as a smartphone, tablet, or computer, and a reliable internet connection.",
  },
  {
    title:
      "Can I receive a diagnosis and treatment plan during a virtual video dental consultation?",
    content:
      "Yes, you can receive a diagnosis and treatment plan during a virtual video dental consultation. Your dentist will assess your oral health, answer any questions you have, and provide you with a personalized treatment plan.",
  },
  {
    title: "How long does a virtual video dental consultation typically last?",
    content:
      "Virtual video dental consultations typically last 30 minutes. You will have ample time to discuss your oral health concerns and receive a diagnosis and treatment plan from your dentist.",
  },
];

export function VirtualDentistryFaq() {
  return (
    <FaqSection
      theme="sand"
      title="Frequently Asked"
      accent="Question"
      actions={
        <>
          <BookButton>Book Appointment</BookButton>
          <CallButton variant="outline" />
        </>
      }
      items={FAQS}
    />
  );
}
