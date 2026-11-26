import { BookButton, ExplainCards, Section, SectionHead, SplitPhoto } from "@/components/hims";

const DETAILED_STEPS = [
  {
    badge: "01 · Schedule",
    title: "Step 1: Booking Your Virtual Dental Consultation",
    desc: "Initiate your dental care journey by scheduling a video consultation via the Pav Dental app or website. Select a convenient date and time for your appointment, and await confirmation from one of our dentists. This step ensures a seamless integration of dental care into your schedule.",
  },
  {
    badge: "02 · Connect",
    title: "Step 2: Establishing the Connection",
    desc: "Upon appointment confirmation, you'll receive a link to access your video consultation. At the designated time, simply use your computer, smartphone, or tablet to click the link and start the video call. This direct line to your dentist facilitates a personal and effective consultation environment.",
  },
  {
    badge: "03 · Consult",
    title: "Step 3: Engaging in the Consultation",
    desc: "The consultation is your opportunity to voice dental concerns and undergo a virtual examination of your teeth and gums. The dentist will collaborate with you to formulate a comprehensive treatment plan. This interactive session allows for real-time questions and personalized advice, ensuring you're fully informed about your dental health options.",
  },
] as const;

const OUTCOMES = [
  "Professional Advice: Receive expert guidance on managing your dental health.",
  "Online Prescription: If needed, obtain prescriptions sent directly to your pharmacy.",
  "Home Visit Coordination: For cases requiring in-person care, arrange a home visit by a dental professional.",
  "Clinic Treatment Planning: Schedule an in-clinic appointment",
] as const;

export function VirtualDentistryHowItWorks() {
  return (
    <Section id="how-it-works" theme="white" aria-labelledby="virtual-how-heading">
      <SectionHead
        id="virtual-how-heading"
        title="How it works?"
        action={<BookButton>Book appointment</BookButton>}
      />
      <div className="mt-10">
        <ExplainCards
          items={DETAILED_STEPS.map((step) => ({ title: step.title, text: step.desc }))}
        />
      </div>
      <div className="mt-20">
        <SplitPhoto
          title="Step 4: Post-Consultation Outcomes"
          lead="Following your consultation, a range of outcomes will be tailored to your specific needs, including:"
          ticks={[...OUTCOMES]}
          image="/images/generated/virtual-dentistry-hero.jpg"
          alt="Virtual dental video consultation on a tablet in warm natural light"
        />
      </div>
    </Section>
  );
}
