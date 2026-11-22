import { BookButton, Heading, Section, Tile } from "@/components/hims";

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
    <Section id="how-it-works" theme="white" space="default" aria-labelledby="virtual-how-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
            Step-by-Step Guide
          </span>
          <div id="virtual-how-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="works?" tone="terracotta" inline>
              How it
            </Heading>
          </div>
        </div>

        <BookButton size="sm" variant="outline">
          Book appointment
        </BookButton>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {DETAILED_STEPS.map((step, i) => (
          <Tile
            key={step.title}
            as="article"
            tone={i === 1 ? "sage" : "cream"}
            lift
            className="flex flex-col justify-between gap-4 border border-border/60 p-6 md:p-8"
          >
            <div>
              <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-copper tabular-nums">
                {step.badge}
              </span>
              <h3 className="mt-4 text-h4 text-fg">{step.title}</h3>
              <p className="mt-3 border-t border-border pt-4 text-body leading-relaxed text-muted">
                {step.desc}
              </p>
            </div>
          </Tile>
        ))}

        <Tile
          as="article"
          tone="cream"
          lift
          className="flex flex-col justify-between gap-4 border border-border/60 p-6 md:p-8"
        >
          <div>
            <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-copper tabular-nums">
              04 · Follow-Up Care
            </span>
            <h3 className="mt-4 text-h4 text-fg">Step 4: Post-Consultation Outcomes</h3>
            <p className="mt-3 border-t border-border pt-4 text-body leading-relaxed text-muted">
              Following your consultation, a range of outcomes will be tailored to your specific
              needs, including:
            </p>
            <ul className="mt-3 space-y-2.5 text-body text-muted">
              {OUTCOMES.map((outcome) => (
                <li key={outcome} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tile>
      </div>
    </Section>
  );
}
