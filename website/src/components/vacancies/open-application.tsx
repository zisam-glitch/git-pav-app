import { ButtonLink, CallButton, CtaBand } from "@/components/hims";
import { PRACTICE_EMAIL } from "@/lib/enquiry";

export function OpenApplication() {
  return (
    <CtaBand
      theme="navy"
      title="Don't see your"
      accent="perfect role?"
      tone="butter"
      actions={
        <>
          <ButtonLink to="/contact-us" variant="butter">
            Send Open Application
          </ButtonLink>
          <CallButton variant="glass" />
        </>
      }
    >
      We welcome applications from dental professionals looking to join our team at 786 Leeds Road,
      Bradford, BD3 9TY or via{" "}
      <a href={`mailto:${PRACTICE_EMAIL}`} className="text-white underline underline-offset-4">
        {PRACTICE_EMAIL}
      </a>
      .
    </CtaBand>
  );
}
