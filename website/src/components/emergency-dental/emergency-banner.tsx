import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { PRACTICE_PHONE } from "@/lib/enquiry";

export function EmergencyBanner() {
  return (
    <CtaBand
      theme="brown"
      title="Say Goodbye TO"
      accent="Your Dental Pain!"
      tone="gold"
      actions={
        <>
          <CallButton variant="gold">Call us Now · {PRACTICE_PHONE}</CallButton>
          <BookButton variant="glass">Book Now</BookButton>
        </>
      }
    >
      Book An Emergency Dental Appointment With US TODAY!
    </CtaBand>
  );
}
