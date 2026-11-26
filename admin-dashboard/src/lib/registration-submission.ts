// Checks a patient registration sent from the website (/services/regestration)
// before it is stored as a form submission.
//
// The website sends who the patient is (the fields the practice needs to reach
// them and to match the record) and every answer, grouped under the headings the
// patient saw, so staff read exactly what was asked. The dashboard keeps the
// questions and answers it is given: it does not hold a second copy of the
// form, so the two cannot drift apart. What it does check is the shape and the
// size, because this is a public endpoint that receives health information.
//
// Nothing here logs a value. Run with `npm test`.

export interface RegistrationItem {
  label: string;
  value: string;
}

export interface RegistrationSection {
  title: string;
  items: RegistrationItem[];
}

export interface Registration {
  fullName: string;
  email: string;
  mobilePhone: string;
  /** ISO date, YYYY-MM-DD. */
  dateOfBirth: string;
  sections: RegistrationSection[];
  /** Which wording of the consent the patient agreed to. */
  consentVersion: string;
}

export type RegistrationCheck = { ok: true; value: Registration } | { ok: false; error: string };

export const LIMITS = {
  sections: 12,
  itemsPerSection: 120,
  items: 400,
  title: 80,
  label: 220,
  value: 2000,
  totalCharacters: 120_000,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+()\-\s]{6,30}$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Trims and drops control characters (keeping line breaks), so a value is plain text. */
function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: removing control characters is the point.
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim();
}

/** A real calendar date from 1900 up to today. */
export function isPlausibleBirthDate(value: string, today: Date = new Date()): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  return y >= 1900 && date.getTime() <= today.getTime();
}

export function validateRegistration(body: unknown, today: Date = new Date()): RegistrationCheck {
  if (!isRecord(body)) return { ok: false, error: "The registration was not understood." };

  const fullName = clean(body.fullName);
  if (!fullName || fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: "A full name is required." };
  }

  const email = clean(body.email);
  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }

  const mobilePhone = clean(body.mobilePhone);
  if (!mobilePhone || !PHONE.test(mobilePhone)) {
    return { ok: false, error: "A valid mobile phone number is required." };
  }

  const dateOfBirth = clean(body.dateOfBirth);
  if (!dateOfBirth || !isPlausibleBirthDate(dateOfBirth, today)) {
    return { ok: false, error: "A valid date of birth is required." };
  }

  if (body.consent !== true) {
    return { ok: false, error: "Consent to store the registration is required." };
  }

  const consentVersion = clean(body.consentVersion) ?? "";
  if (consentVersion.length === 0 || consentVersion.length > 40) {
    return { ok: false, error: "The consent version is required." };
  }

  if (!Array.isArray(body.sections) || body.sections.length === 0 || body.sections.length > LIMITS.sections) {
    return { ok: false, error: "The registration answers are missing or too long." };
  }

  const sections: RegistrationSection[] = [];
  let items = 0;
  let characters = 0;
  for (const rawSection of body.sections) {
    if (!isRecord(rawSection) || !Array.isArray(rawSection.items)) {
      return { ok: false, error: "The registration answers were not understood." };
    }
    const title = clean(rawSection.title);
    if (!title || title.length > LIMITS.title || rawSection.items.length > LIMITS.itemsPerSection) {
      return { ok: false, error: "The registration answers were not understood." };
    }
    const sectionItems: RegistrationItem[] = [];
    for (const rawItem of rawSection.items) {
      if (!isRecord(rawItem)) return { ok: false, error: "The registration answers were not understood." };
      const label = clean(rawItem.label);
      const value = clean(rawItem.value);
      if (!label || label.length > LIMITS.label || value === null || value.length > LIMITS.value) {
        return { ok: false, error: "The registration answers were not understood." };
      }
      items += 1;
      characters += label.length + value.length;
      if (items > LIMITS.items || characters > LIMITS.totalCharacters) {
        return { ok: false, error: "The registration answers are too long." };
      }
      sectionItems.push({ label, value });
    }
    sections.push({ title, items: sectionItems });
  }

  return { ok: true, value: { fullName, email, mobilePhone, dateOfBirth, sections, consentVersion } };
}
