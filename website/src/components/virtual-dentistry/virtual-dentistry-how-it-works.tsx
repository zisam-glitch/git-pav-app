import { BookButton, Media } from "@/components/hims";
import { Steps, type Step } from "@/components/hims/steps";

const STEPS: readonly Step[] = [
  {
    title: "Step 1: Booking Your Virtual Dental Consultation",
    body: "Initiate your dental care journey by scheduling a video consultation via the Pav Dental app or website. Select a convenient date and time for your appointment, and await confirmation from one of our dentists. This step ensures a seamless integration of dental care into your schedule.",
  },
  {
    title: "Step 2: Establishing the Connection",
    body: "Upon appointment confirmation, you'll receive a link to access your video consultation. At the designated time, simply use your computer, smartphone, or tablet to click the link and start the video call. This direct line to your dentist facilitates a personal and effective consultation environment.",
  },
  {
    title: "Step 3: Engaging in the Consultation",
    body: "The consultation is your opportunity to voice dental concerns and undergo a virtual examination of your teeth and gums. The dentist will collaborate with you to formulate a comprehensive treatment plan. This interactive session allows for real-time questions and personalized advice, ensuring you're fully informed about your dental health options.",
  },
  {
    title: "Step 4: Post-Consultation Outcomes",
    body: "Following your consultation, a range of outcomes will be tailored to your specific needs, including: Professional Advice: Receive expert guidance on managing your dental health. Online Prescription: If needed, obtain prescriptions sent directly to your pharmacy. Home Visit Coordination: For cases requiring in-person care, arrange a home visit by a dental professional. Clinic Treatment Planning: Schedule an in-clinic appointment",
  },
];

export function VirtualDentistryHowItWorks() {
  return (
    <Steps
      id="how-it-works"
      title="How it"
      accent="works?"
      action={<BookButton variant="outline">Book appointment</BookButton>}
      steps={STEPS}
      media={
        <Media
          src="/images/generated/virtual-dentistry-benefits.jpg"
          alt="Digital dental e-prescription care in warm natural light"
          ratio="4 / 3"
          tone="sand"
        />
      }
    />
  );
}
