import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { enquiryPayload, PRACTICE_PHONE, readEnquiryFields } from "@/lib/enquiry";

/**
 * Sends a service page's enquiry form to the practice: the dashboard saves it
 * and emails an alert. Inputs are read by name (`name`, `email`, `phone`,
 * `subject`, `message`, `interest`). If sending fails the form stays filled
 * in and says so, instead of showing a thank-you for a message nobody gets.
 */
export function useEnquiry(service: string) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>, interest?: string) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields = readEnquiryFields((name) => String(data.get(name) ?? ""));
    setSending(true);
    setError(null);
    try {
      await api.forms.submitContact(enquiryPayload(service, { ...fields, interest: interest ?? fields.interest }));
      setSent(true);
    } catch {
      setError(`Your message didn't send. Please try again, or call us on ${PRACTICE_PHONE}.`);
    } finally {
      setSending(false);
    }
  }

  return { sending, sent, error, submit, reset: () => setSent(false) };
}
