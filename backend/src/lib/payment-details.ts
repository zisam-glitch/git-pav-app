// What a patient sees about a deposit on their bank statement and receipt.
//
// receipt_email: with it set, Stripe emails the patient a receipt for every
// successful live-mode payment, whatever the dashboard's email settings say
// (test mode never sends receipts). The address is the one already stored on
// the patient's Stripe Customer.
//
// statement_descriptor_suffix: appended to the business name set in the Stripe
// dashboard (Settings > Business > Public details > Statement descriptor), so a
// card statement reads like "PAV DENTAL* APPT DEPOSIT" and the patient
// recognises it instead of disputing it. Up to 22 characters, letters, digits
// and spaces only, and it must not be only digits.
//
// description: shows on Stripe's receipt and dashboard. Kept generic: no
// treatment name, so it adds nothing about the patient's care.

export const DEPOSIT_STATEMENT_SUFFIX = "APPT DEPOSIT";
export const VAN_DEPOSIT_STATEMENT_SUFFIX = "VAN DEPOSIT";

const SUFFIX_RE = /^(?=.*[A-Za-z])[A-Za-z0-9 ]{1,22}$/;
export function isValidStatementSuffix(value: string): boolean {
  return SUFFIX_RE.test(value);
}

export function depositPaymentDetails(
  kind: "clinic" | "van",
  patientEmail: string | null | undefined
): { description: string; statement_descriptor_suffix: string; receipt_email?: string } {
  const email = patientEmail?.trim();
  return {
    description: kind === "van" ? "Pav Dental van visit deposit" : "Pav Dental appointment deposit",
    statement_descriptor_suffix: kind === "van" ? VAN_DEPOSIT_STATEMENT_SUFFIX : DEPOSIT_STATEMENT_SUFFIX,
    ...(email ? { receipt_email: email } : {}),
  };
}
