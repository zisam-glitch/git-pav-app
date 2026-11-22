import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { PRACTICE_PHONE } from "@/lib/enquiry";

export function EmergencyBanner() {
  return (
    <ClosingBand
      title="Say Goodbye TO"
      highlight="Your Dental Pain!"
      lead="Book An Emergency Dental Appointment With US TODAY!"
      actions={
        <>
          <CallButton variant="butter">Call us Now · {PRACTICE_PHONE}</CallButton>
          <BookButton variant="glass">Book Now</BookButton>
        </>
      }
    />
  );
}
