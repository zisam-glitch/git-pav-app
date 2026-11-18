/**
 * What a service page's enquiry form sends, and the practice's contact
 * details as the live site gives them. Plain data with no imports, so tests
 * load it directly; the React side is use-enquiry.ts.
 */

export const PRACTICE_PHONE = "0800 1938 786";
export const PRACTICE_PHONE_HREF = "tel:08001938786";
export const PRACTICE_EMAIL = "hello@pavdental.com";
/** The live site's working hours: every day, 00:00 – 24:00. */
export const PRACTICE_HOURS = "Open 24 hours, 7 days a week";
/** Where every "Book" button on the live site goes: the practice's Setmore page. */
export const BOOKING_URL = "https://pavdental.setmore.com/";

export interface EnquiryFields {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** A treatment or option the form asks the patient to pick. */
  interest?: string;
}

/** The body for the dashboard's contact form endpoint, which saves it and emails the practice. */
export function enquiryPayload(service: string, fields: EnquiryFields) {
  const message = [fields.interest?.trim() ? `Interested in: ${fields.interest.trim()}` : "", fields.message?.trim() ?? ""]
    .filter(Boolean)
    .join("\n\n");
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    phone: fields.phone?.trim() || undefined,
    subject: fields.subject?.trim() || `${service} enquiry`,
    message: message || `${service} enquiry from the website.`,
  };
}

/** A form's fields by input name. Forms that split the name into first and last are joined up. */
export function readEnquiryFields(get: (name: string) => string): EnquiryFields {
  const value = (name: string) => get(name).trim();
  const fullName = value("name") || value("fullName") || [value("firstName"), value("lastName")].filter(Boolean).join(" ");
  return {
    name: fullName,
    email: value("email"),
    phone: value("phone"),
    subject: value("subject"),
    message: value("message"),
    interest: [value("interest"), value("interest2")].filter(Boolean).join(", "),
  };
}
