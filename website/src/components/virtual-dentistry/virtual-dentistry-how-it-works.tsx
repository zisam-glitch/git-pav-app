import { Heading, Section, Tile } from "@/components/hims";

const DETAILED_STEPS = [
  {
    title: "Step 1: Booking Your Virtual Dental Consultation",
    desc: "Initiate your dental care journey by scheduling a video consultation via the Pav Dental app or website. Select a convenient date and time for your appointment, and await confirmation from one of our dentists. This step ensures a seamless integration of dental care into your schedule.",
  },
  {
    title: "Step 2: Establishing the Connection",
    desc: "Upon appointment confirmation, you'll receive a link to access your video consultation. At the designated time, simply use your computer, smartphone, or tablet to click the link and start the video call. This direct line to your dentist facilitates a personal and effective consultation environment.",
  },
  {
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
    <Section theme="white" space="default">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="works?" tone="terracotta" inline>
          How it
        </Heading>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {DETAILED_STEPS.map((step) => (
          <Tile key={step.title} as="article" tone="cream" className="p-6 md:p-8">
            <h3 className="text-h4 text-fg">{step.title}</h3>
            <p className="mt-4 text-body text-muted">{step.desc}</p>
          </Tile>
        ))}

        <Tile as="article" tone="cream" className="p-6 md:p-8">
          <h3 className="text-h4 text-fg">Step 4: Post-Consultation Outcomes</h3>
          <p className="mt-4 text-body text-muted">
            Following your consultation, a range of outcomes will be tailored to your specific
            needs, including:
          </p>
          <ul className="mt-3 space-y-2 text-body text-muted">
            {OUTCOMES.map((outcome) => (
              <li key={outcome} className="flex gap-2.5">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </Section>
  );
}
