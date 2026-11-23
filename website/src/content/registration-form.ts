/**
 * The new patient registration (/services/regestration): every question the live
 * site's registration form asks, in its words, grouped into short screens that
 * the flow shows one at a time (Hims "Completing health history" pattern).
 *
 * This file is plain data and pure functions so it can be tested without a
 * browser: which questions show, what is required, what is wrong with an
 * answer, and the payload sent to the dashboard (`/api/v1/forms/registration`).
 * The payload carries each answer with its question and section heading, so
 * staff read exactly what the patient saw and the dashboard keeps no copy of
 * the questions.
 *
 * The questions are the live form's. Where the live form was silent we made the
 * kind choice that asks the patient least: free-text answers and follow-ups are
 * optional, and the ethnic group is optional because it is special-category
 * data. Health answers are never stored in the browser; they live in memory
 * until the patient submits.
 */

export const CONSENT_VERSION = "2026-11-24";

export type Answers = Record<string, string | string[]>;

export interface Condition {
  /** The question this one depends on. */
  id: string;
  equals?: string;
  notEquals?: string;
  in?: readonly string[];
}

interface FieldBase {
  id: string;
  label: string;
  hint?: string;
  /** Optional unless set. */
  optional?: boolean;
  showIf?: Condition;
  autoComplete?: string;
}

export type Field =
  | (FieldBase & {
      kind: "text" | "textarea" | "email" | "tel";
      placeholder?: string;
      inputMode?: "numeric" | "text" | "tel" | "email";
      maxLength?: number;
      format?: "nhs" | "postcode";
    })
  | (FieldBase & { kind: "dob" })
  | (FieldBase & {
      kind: "select";
      options: readonly string[];
      /** The options depend on the answer to another question. */
      optionsBy?: { id: string; map: Record<string, readonly string[]> };
    })
  | (FieldBase & { kind: "choice"; options: readonly string[] })
  | (FieldBase & { kind: "multi"; options: readonly string[]; details?: boolean })
  | (FieldBase & { kind: "agree" });

export type SectionId = "personal" | "additional" | "lifestyle" | "address" | "medical" | "dental" | "review";

export interface Screen {
  id: string;
  section: SectionId;
  title: string;
  description?: string;
  showIf?: Condition;
  fields: Field[];
}

/** The live form's step headings, then the review. */
export const SECTIONS: readonly { id: SectionId; title: string }[] = [
  { id: "personal", title: "Personal info" },
  { id: "additional", title: "Additional information" },
  { id: "lifestyle", title: "Lifestyle information" },
  { id: "address", title: "Address" },
  { id: "medical", title: "Medical history" },
  { id: "dental", title: "Dental history" },
  { id: "review", title: "Review and consent" },
];

const YES_NO = ["No", "Yes"] as const;

const yesNo = (id: string, label: string, extra: { hint?: string; showIf?: Condition } = {}): Field => ({
  kind: "choice",
  id,
  label,
  options: YES_NO,
  ...extra,
});

/** A follow-up that appears when `parent` is answered "Yes". */
const followUp = (
  id: string,
  parent: string,
  label: string,
  placeholder?: string,
  kind: "text" | "textarea" = "text",
): Field => ({ kind, id, label, placeholder, optional: true, showIf: { id: parent, equals: "Yes" } });

const ETHNIC_GROUPS = [
  "White",
  "Mixed or multiple ethnic groups",
  "Asian or Asian British",
  "Black/African/Caribbean/British",
  "Other ethnic group",
] as const;

const ETHNIC_BACKGROUNDS: Record<string, readonly string[]> = {
  White: ["English, Welsh, Scottish, Northern Irish or British", "Irish", "Gypsy or Irish Traveller"],
  "Mixed or multiple ethnic groups": ["White and Black Caribbean", "White and Black African", "White and Asian"],
  "Asian or Asian British": ["Indian", "Pakistani", "Bangladeshi", "Chinese"],
  "Black/African/Caribbean/British": ["African", "Caribbean"],
};

export const MEDICAL_CONDITIONS = [
  "Heart disease / Angina / Heart attack / Stroke / High blood pressure",
  "Chest problems (Asthma, Bronchitis, Tuberculosis, COPD, Chest pain)",
  "Diabetes",
  "Epilepsy / Fainting attacks / Migraine / Frequent headaches",
  "Mental health conditions (Anxiety, Depression, Other)",
  "Allergies / Hayfever / Eczema / Psoriasis / Skin conditions",
  "Arthritis / Back pain / Sciatica / Slipped disc",
  "Digestive issues (Ulcer, Indigestion, Hernia, Appetite disorder)",
  "Kidney disease",
  "Liver disease / Jaundice / Hepatitis",
  "Cancer (Past or Present)",
  "Blood disorders (Anaemia, Bleeding problems, Sickle cell, etc.)",
  "Any other serious illness not listed",
] as const;

const NON_ADULT: Condition = { id: "ageGroup", notEquals: "Adult" };

export const SCREENS: readonly Screen[] = [
  // Personal info
  {
    id: "name",
    section: "personal",
    title: "What is your name?",
    fields: [
      {
        kind: "text",
        id: "title",
        label: "Title",
        placeholder: "e.g. Mr, Mrs, Ms, Dr",
        optional: true,
        autoComplete: "honorific-prefix",
        maxLength: 30,
      },
      { kind: "text", id: "fullName", label: "Full Name", autoComplete: "name", maxLength: 120 },
    ],
  },
  {
    id: "dob",
    section: "personal",
    title: "When were you born?",
    fields: [{ kind: "dob", id: "dateOfBirth", label: "Date of Birth (DD MM YYYY)" }],
  },
  {
    id: "sex",
    section: "personal",
    title: "What is your sex as recorded on your NHS record?",
    fields: [
      {
        kind: "choice",
        id: "sex",
        label: "What is your sex as recorded on your NHS record?",
        options: ["Female", "Male", "Intersex", "Not specified or known"],
      },
    ],
  },
  {
    id: "nhs",
    section: "personal",
    title: "Your NHS and GP details",
    description: "Both are optional. Add them if you have them to hand.",
    fields: [
      {
        kind: "text",
        id: "nhsNumber",
        label: "NHS Number (if you have it)",
        placeholder: "10 digits",
        inputMode: "numeric",
        optional: true,
        format: "nhs",
        maxLength: 14,
      },
      {
        kind: "text",
        id: "gpSurgery",
        label: "Name of UK GP surgery you registered with",
        optional: true,
        maxLength: 200,
      },
    ],
  },
  {
    id: "contact",
    section: "personal",
    title: "How can we reach you?",
    fields: [
      { kind: "tel", id: "mobilePhone", label: "Mobile phone number", autoComplete: "tel", inputMode: "tel" },
      {
        kind: "tel",
        id: "homePhone",
        label: "Home phone number",
        optional: true,
        autoComplete: "tel-national",
        inputMode: "tel",
      },
      { kind: "email", id: "emailAddress", label: "Email Address", autoComplete: "email", inputMode: "email" },
    ],
  },
  {
    id: "emergency",
    section: "personal",
    title: "Who should we contact in an emergency?",
    fields: [
      { kind: "text", id: "emergencyContactName", label: "Name of emergency contact", maxLength: 120 },
      { kind: "tel", id: "emergencyContactPhone", label: "Phone number of emergency contact", inputMode: "tel" },
      { kind: "text", id: "emergencyContactRelationship", label: "Their relationship to you", maxLength: 80 },
    ],
  },

  // Additional information
  {
    id: "ethnicity",
    section: "additional",
    title: "What is your ethnic group?",
    description: "This question is optional. You can skip it.",
    fields: [
      { kind: "choice", id: "ethnicGroup", label: "What is your ethnic group?", options: ETHNIC_GROUPS, optional: true },
      {
        kind: "select",
        id: "ethnicBackground",
        label: "Ethnic group or background?",
        options: [],
        optionsBy: { id: "ethnicGroup", map: ETHNIC_BACKGROUNDS },
        optional: true,
        showIf: { id: "ethnicGroup", in: Object.keys(ETHNIC_BACKGROUNDS) },
      },
      {
        kind: "text",
        id: "ethnicBackgroundOther",
        label: "Ethnic group or background?",
        placeholder: "e.g. Arab",
        optional: true,
        maxLength: 120,
        showIf: { id: "ethnicGroup", equals: "Other ethnic group" },
      },
    ],
  },

  // Lifestyle information
  {
    id: "smoke",
    section: "lifestyle",
    title: "Do you smoke?",
    fields: [
      yesNo("smoke", "Do you smoke?"),
      followUp("smokePerDay", "smoke", "How many per day?"),
      followUp("smokeYears", "smoke", "For how many years?"),
    ],
  },
  {
    id: "vape",
    section: "lifestyle",
    title: "Do you vape?",
    fields: [
      yesNo("vape", "Do you vape (use e-cigarettes)?"),
      followUp("vapeType", "vape", "Type (nicotine / non-nicotine / other)"),
      followUp("vapeOften", "vape", "How often?"),
    ],
  },
  {
    id: "alcohol",
    section: "lifestyle",
    title: "Do you drink alcohol?",
    fields: [yesNo("alcohol", "Do you drink alcohol?"), followUp("alcoholOften", "alcohol", "How often / units per week?")],
  },
  {
    id: "drugs",
    section: "lifestyle",
    title: "Do you use recreational or non-prescribed drugs?",
    fields: [
      yesNo("drugs", "Do you use recreational or non-prescribed drugs?"),
      followUp("drugsWhat", "drugs", "Please specify (e.g. cannabis, cocaine)"),
      followUp("drugsOften", "drugs", "How often?"),
    ],
  },
  {
    id: "body",
    section: "lifestyle",
    title: "Your height and weight",
    description: "Both are optional.",
    fields: [
      {
        kind: "text",
        id: "height",
        label: "What is your height?",
        placeholder: "e.g. 173 cm / 5’8”",
        optional: true,
        maxLength: 40,
      },
      {
        kind: "text",
        id: "weight",
        label: "What is your weight?",
        placeholder: "e.g. 70 kg / 154 lbs",
        optional: true,
        maxLength: 40,
      },
    ],
  },

  // Address
  {
    id: "address",
    section: "address",
    title: "Where do you live?",
    fields: [
      {
        kind: "textarea",
        id: "address",
        label: "Current Address",
        placeholder: "e.g. Civic Hall Calverley Street Leeds",
        autoComplete: "street-address",
        maxLength: 300,
      },
      {
        kind: "text",
        id: "postcode",
        label: "Postcode",
        placeholder: "e.g. LS1 1UR",
        autoComplete: "postal-code",
        format: "postcode",
        maxLength: 10,
      },
    ],
  },
  {
    id: "birth",
    section: "address",
    title: "Where were you born?",
    description: "Both are optional.",
    fields: [
      {
        kind: "text",
        id: "birthTown",
        label: "Village, town or city of birth",
        placeholder: "e.g. London",
        optional: true,
        maxLength: 120,
      },
      {
        kind: "text",
        id: "birthCountry",
        label: "Country of birth",
        placeholder: "e.g. England",
        optional: true,
        maxLength: 120,
      },
    ],
  },
  {
    id: "age",
    section: "address",
    title: "How old is the patient?",
    description: "Registering a child? Answer for them. A parent or guardian should complete the form.",
    fields: [{ kind: "choice", id: "ageGroup", label: "Age", options: ["Adult", "Under 18 years", "Under 12 months"] }],
  },
  {
    id: "child",
    section: "address",
    title: "A few more questions",
    showIf: NON_ADULT,
    fields: [
      {
        kind: "text",
        id: "motherLiving",
        label: "Where was the mother living when the baby was born?",
        placeholder: "e.g. London",
        optional: true,
        maxLength: 120,
        showIf: { id: "ageGroup", equals: "Under 12 months" },
      },
      {
        kind: "select",
        id: "bornIn",
        label: "Where were they born?",
        options: ["England", "Northern Ireland", "Wales", "Isle of Man", "Scotland", "Outside the UK"],
        optional: true,
      },
      {
        kind: "select",
        id: "attends",
        label: "Do you attend any of the following?",
        options: ["School", "Nursery", "Home school", "None of these"],
        optional: true,
        showIf: { id: "ageGroup", equals: "Under 18 years" },
      },
      {
        kind: "select",
        id: "careInvolved",
        label: "Are any of these involved in your care?",
        options: ["Hospital specialist", "Health worker", "Social worker", "None of these"],
        optional: true,
      },
      {
        kind: "choice",
        id: "vaccinations",
        label: "Have you had all your routine vaccinations?",
        options: ["Yes", "No", "Don't Know"],
        optional: true,
      },
      {
        kind: "choice",
        id: "vaccinationsUk",
        label: "Did you get your routine vaccinations in the UK?",
        options: ["Yes", "No", "Don't Know"],
        optional: true,
      },
    ],
  },

  // Medical history
  {
    id: "medications",
    section: "medical",
    title: "Medications and allergies",
    fields: [
      {
        kind: "textarea",
        id: "medications",
        label: "Please list all medications you currently take (pills, injections, or regular drugs)",
        placeholder: "e.g. Paracetamol 500mg twice daily, Insulin",
        optional: true,
        maxLength: 1500,
      },
      yesNo("allergies", "Are you allergic to any medications or substances?"),
      followUp("allergiesDetails", "allergies", "Please specify allergies and reactions", undefined, "textarea"),
    ],
  },
  {
    id: "thinners",
    section: "medical",
    title: "Blood thinners and bone medicines",
    fields: [
      yesNo("bloodThinners", "Do you take blood thinners (e.g. Warfarin, Aspirin, Clopidogrel)?"),
      followUp("bloodThinnersWhich", "bloodThinners", "Which one(s)?"),
      yesNo("bisphosphonates", "Do you take bisphosphonates (for osteoporosis, cancer, or bone conditions)?"),
      followUp("bisphosphonatesWhich", "bisphosphonates", "Which one(s)?"),
    ],
  },
  {
    id: "treatment",
    section: "medical",
    title: "Past treatment",
    fields: [
      yesNo("radiotherapy", "Have you had radiotherapy to the head, neck, or jaw?"),
      followUp("radiotherapyWhen", "radiotherapy", "When/where?"),
      yesNo("steroids", "Have you taken steroids long-term?"),
      followUp("steroidsType", "steroids", "What type & duration?"),
    ],
  },
  {
    id: "infections",
    section: "medical",
    title: "Infections",
    fields: [
      yesNo("hiv", "Have you ever been diagnosed with HIV/AIDS?"),
      yesNo("hepatitis", "Have you ever been diagnosed with Hepatitis B or C?"),
      yesNo("otherInfectious", "Have you been diagnosed with any other infectious disease?"),
      followUp("otherInfectiousDetails", "otherInfectious", "Please provide details", undefined, "textarea"),
    ],
  },
  {
    id: "conditions",
    section: "medical",
    title: "Please tick all medical conditions that apply to you",
    description: "Choose any that apply. Add details if you want to.",
    fields: [
      {
        kind: "multi",
        id: "conditions",
        label: "Please tick all medical conditions that apply to you:",
        options: MEDICAL_CONDITIONS,
        details: true,
        optional: true,
      },
    ],
  },
  {
    id: "care",
    section: "medical",
    title: "Hospital care, vision and hearing",
    fields: [
      yesNo("hospitalCare", "Are you currently under hospital care or investigation?"),
      followUp("hospitalCareDetails", "hospitalCare", "Please provide details", undefined, "textarea"),
      yesNo("visionProblems", "Do you have any problems with vision?"),
      followUp("visionProblemsDetails", "visionProblems", "Please provide details", undefined, "textarea"),
      yesNo("hearingProblems", "Do you have any problems with hearing?"),
      followUp("hearingProblemsDetails", "hearingProblems", "Please provide details", undefined, "textarea"),
    ],
  },
  {
    id: "learning",
    section: "medical",
    title: "Learning, vaccinations and accidents",
    fields: [
      yesNo("learningDifficulties", "Have you been diagnosed with Dyslexia, Dyspraxia, Autism, ADHD, or similar?"),
      followUp("learningDifficultiesDetails", "learningDifficulties", "Please provide details", undefined, "textarea"),
      yesNo("covidVaccinations", "Have you received your COVID-19 vaccinations?"),
      followUp("covidVaccinationsDoses", "covidVaccinations", "How many doses?"),
      yesNo("accidents", "Have you had any accidents, operations, or conditions not mentioned above?"),
      followUp("accidentsDetails", "accidents", "Please provide details", undefined, "textarea"),
    ],
  },
  {
    id: "wellbeing",
    section: "medical",
    title: "Pregnancy and mobility",
    fields: [
      yesNo("pregnant", "Are you pregnant or could you be pregnant?"),
      followUp("pregnantWeeks", "pregnant", "How many weeks?"),
      yesNo("wheelchair", "Do you use a wheelchair or require walking aids?"),
      followUp("wheelchairDetails", "wheelchair", "Please specify"),
    ],
  },

  // Dental history
  {
    id: "lastCheckup",
    section: "dental",
    title: "When was your last dental check-up?",
    fields: [
      {
        kind: "choice",
        id: "lastCheckup",
        label: "When was your last dental check-up?",
        options: ["Within 6 months", "6–12 months", "Over 1 year ago"],
      },
      {
        kind: "text",
        id: "lastCheckupDetails",
        label: "Details",
        optional: true,
        maxLength: 300,
      },
    ],
  },
  {
    id: "history",
    section: "dental",
    title: "Your dental history",
    fields: [
      yesNo("pastProblems", "Have you ever had any problems with dental treatment in the past?"),
      followUp("pastProblemsDetails", "pastProblems", "Please describe", undefined, "textarea"),
      { kind: "choice", id: "attendance", label: "Do you usually attend the dentist:", options: ["Regularly", "Only when in pain"] },
      yesNo("dentalPain", "Do you currently have any dental pain or discomfort?"),
      followUp("dentalPainDetails", "dentalPain", "Please provide details", undefined, "textarea"),
    ],
  },
  {
    id: "gums",
    section: "dental",
    title: "Gums, teeth and jaw",
    fields: [
      yesNo("gumBleeding", "Do your gums ever bleed when brushing or eating?"),
      yesNo("looseTeeth", "Have you noticed loose teeth, drifting teeth, or gaps appearing?"),
      yesNo("grinding", "Do you clench or grind your teeth?"),
      yesNo("jawJoint", "Do you have any problems with your jaw joint (clicking, locking, pain)?"),
    ],
  },
  {
    id: "hygiene",
    section: "dental",
    title: "Cleaning and diet",
    fields: [
      {
        kind: "choice",
        id: "brushing",
        label: "How often do you brush your teeth each day?",
        options: ["Once", "Twice", "More than twice"],
      },
      {
        kind: "multi",
        id: "cleaningAids",
        label: "Which of these do you use?",
        options: ["Fluoride toothpaste", "Mouthwash", "Dental floss / interdental brushes"],
        optional: true,
      },
      yesNo("sweetTooth", "Do you have a sweet tooth / snack frequently on sugary foods/drinks?"),
    ],
  },
  {
    id: "smile",
    section: "dental",
    title: "Your smile",
    fields: [
      yesNo("appearance", "Are you happy with the appearance of your teeth and smile?"),
      {
        kind: "multi",
        id: "appearanceChange",
        label: "What would you like to change?",
        options: [
          "Teeth whitening",
          "Orthodontics (braces/invisible aligners)",
          "Cosmetic fillings / veneers",
          "Implants / dentures",
        ],
        optional: true,
        showIf: { id: "appearance", equals: "No" },
      },
    ],
  },
  {
    id: "anxiety",
    section: "dental",
    title: "Feeling nervous about treatment?",
    fields: [
      yesNo("anxiety", "Do you feel nervous or anxious about dental treatment?"),
      {
        kind: "choice",
        id: "anxietyLevel",
        label: "How anxious?",
        options: ["Mild", "Moderate", "Severe"],
        optional: true,
        showIf: { id: "anxiety", equals: "Yes" },
      },
      yesNo("badExperience", "Have you ever had a bad dental experience?"),
      followUp("badExperienceDetails", "badExperience", "Please explain", undefined, "textarea"),
    ],
  },
  {
    id: "access",
    section: "dental",
    title: "Anything we should arrange for you?",
    description: "Optional.",
    fields: [
      {
        kind: "multi",
        id: "accessNeeds",
        label: "Support you may need",
        options: ["Translator / Language support", "Wheelchair access / Assisted mobility", "Extra time for appointments"],
        optional: true,
      },
    ],
  },

  // Review and consent
  {
    id: "consent",
    section: "review",
    title: "Review and consent",
    description: "Two last things before you send your registration.",
    fields: [
      {
        kind: "agree",
        id: "consentAccurate",
        label: "I confirm that the information I have given is accurate to the best of my knowledge.",
      },
      {
        kind: "agree",
        id: "consentStore",
        label:
          "I agree that Pav Dental may store and use this information, including my health information, to register me as a patient and to contact me about my care.",
      },
    ],
  },
];

const FIELDS_BY_ID = new Map<string, Field>(SCREENS.flatMap((screen) => screen.fields).map((field) => [field.id, field]));

export const fieldById = (id: string): Field | undefined => FIELDS_BY_ID.get(id);

const asText = (value: string | string[] | undefined): string => (typeof value === "string" ? value : "");
const asList = (value: string | string[] | undefined): string[] => (Array.isArray(value) ? value : []);

/** Whether an answer-dependent question or screen shows. */
export function conditionMet(condition: Condition | undefined, answers: Answers): boolean {
  if (!condition) return true;
  const value = asText(answers[condition.id]);
  if (condition.equals !== undefined) return value === condition.equals;
  if (condition.notEquals !== undefined) return value !== "" && value !== condition.notEquals;
  if (condition.in) return condition.in.includes(value);
  return true;
}

export const isFieldVisible = (field: Field, answers: Answers): boolean => conditionMet(field.showIf, answers);

export const visibleFields = (screen: Screen, answers: Answers): Field[] =>
  screen.fields.filter((field) => isFieldVisible(field, answers));

/** The screens to walk through now: a screen needs its own condition and at least one visible question. */
export function visibleScreens(answers: Answers): Screen[] {
  return SCREENS.filter((screen) => conditionMet(screen.showIf, answers) && visibleFields(screen, answers).length > 0);
}

/** The options a select shows now. */
export function optionsFor(field: Field, answers: Answers): readonly string[] {
  if (field.kind !== "select") return [];
  if (!field.optionsBy) return field.options;
  return field.optionsBy.map[asText(answers[field.optionsBy.id])] ?? [];
}

/** The key that holds the "details" a patient adds under one ticked option. */
export const detailKey = (fieldId: string, option: string): string => `${fieldId}__${option}`;

// ---------------------------------------------------------------- dates

export const DOB_DAY = "dateOfBirthDay";
export const DOB_MONTH = "dateOfBirthMonth";
export const DOB_YEAR = "dateOfBirthYear";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** The date of birth as YYYY-MM-DD, or null when it is incomplete, impossible, in the future or before 1900. */
export function dateOfBirthIso(answers: Answers, today: Date = new Date()): string | null {
  const [d, m, y] = [asText(answers[DOB_DAY]), asText(answers[DOB_MONTH]), asText(answers[DOB_YEAR])].map((part) =>
    part.trim(),
  );
  if (!/^\d{1,2}$/.test(d ?? "") || !/^\d{1,2}$/.test(m ?? "") || !/^\d{4}$/.test(y ?? "")) return null;
  const [day, month, year] = [Number(d), Number(m), Number(y)] as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (year < 1900 || date.getTime() > today.getTime()) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const dateOfBirthLabel = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
};

// ----------------------------------------------------------- validation

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+()\-\s]{6,30}$/;
const POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

export type Errors = Record<string, string>;

function validateField(field: Field, answers: Answers, today: Date): string | null {
  const required = !field.optional;

  if (field.kind === "dob") {
    const parts = [answers[DOB_DAY], answers[DOB_MONTH], answers[DOB_YEAR]].map(asText);
    if (parts.every((part) => part.trim() === "")) return required ? "Enter your date of birth." : null;
    return dateOfBirthIso(answers, today) ? null : "Enter a real date of birth, for example 17 04 1990.";
  }

  if (field.kind === "multi") {
    const chosen = asList(answers[field.id]);
    if (required && chosen.length === 0) return "Choose at least one.";
    return chosen.every((option) => field.options.includes(option)) ? null : "Choose from the options shown.";
  }

  if (field.kind === "agree") {
    return answers[field.id] === "yes" ? null : "Please tick this box to continue.";
  }

  const value = asText(answers[field.id]).trim();
  if (value === "") return required ? "This answer is needed to continue." : null;

  if (field.kind === "choice") {
    return field.options.includes(value) ? null : "Choose one of the options.";
  }
  if (field.kind === "select") {
    return optionsFor(field, answers).includes(value) ? null : "Choose one of the options.";
  }

  const limit = field.maxLength ?? (field.kind === "textarea" ? 1500 : 200);
  if (value.length > limit) return `Please keep this under ${limit} characters.`;
  if (field.kind === "email" && !EMAIL.test(value)) return "Enter a valid email address.";
  if (field.kind === "tel" && !PHONE.test(value)) return "Enter a phone number using digits only.";
  if (field.format === "nhs" && !/^\d{10}$/.test(value.replace(/[\s-]/g, ""))) {
    return "An NHS number has 10 digits. Leave it blank if you do not have it.";
  }
  if (field.format === "postcode" && !POSTCODE.test(value)) return "Enter a UK postcode, for example LS1 1UR.";
  return null;
}

/** What is wrong on one screen, by question id. An empty object means the screen can continue. */
export function validateScreen(screen: Screen, answers: Answers, today: Date = new Date()): Errors {
  const errors: Errors = {};
  for (const field of visibleFields(screen, answers)) {
    const error = validateField(field, answers, today);
    if (error) errors[field.id] = error;
  }
  return errors;
}

/** The first screen that cannot continue, or null when every screen is complete. */
export function firstInvalidScreen(answers: Answers, today: Date = new Date()): Screen | null {
  return visibleScreens(answers).find((screen) => Object.keys(validateScreen(screen, answers, today)).length > 0) ?? null;
}

// ------------------------------------------------------------- payload

export interface RegistrationSection {
  title: string;
  items: { label: string; value: string }[];
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  mobilePhone: string;
  dateOfBirth: string;
  consent: true;
  consentVersion: string;
  sections: RegistrationSection[];
}

/** A follow-up reads "Do you smoke? – How many per day?" so staff see what it belongs to. */
function labelFor(field: Field): string {
  const parent = field.showIf ? fieldById(field.showIf.id) : undefined;
  return parent && field.kind !== "dob" ? `${parent.label} – ${field.label}` : field.label;
}

/** Every answered, visible question grouped under its section heading, in the order the patient saw them. */
export function buildSections(answers: Answers, today: Date = new Date()): RegistrationSection[] {
  const sections: RegistrationSection[] = [];
  for (const { id, title } of SECTIONS) {
    if (id === "review") continue;
    const items: RegistrationSection["items"] = [];
    for (const screen of visibleScreens(answers).filter((candidate) => candidate.section === id)) {
      for (const field of visibleFields(screen, answers)) {
        if (field.kind === "dob") {
          const iso = dateOfBirthIso(answers, today);
          if (iso) items.push({ label: "Date of Birth", value: dateOfBirthLabel(iso) });
          continue;
        }
        if (field.kind === "agree") continue;
        if (field.kind === "multi") {
          const chosen = asList(answers[field.id]);
          if (chosen.length === 0) continue;
          items.push({ label: labelFor(field), value: chosen.join(", ") });
          if (field.details) {
            for (const option of chosen) {
              const detail = asText(answers[detailKey(field.id, option)]).trim();
              if (detail) items.push({ label: `${option} – details`, value: detail });
            }
          }
          continue;
        }
        const value = asText(answers[field.id]).trim();
        if (value) items.push({ label: labelFor(field), value });
      }
    }
    if (items.length > 0) sections.push({ title, items });
  }
  return sections;
}

/** The registration to send, or null while anything the dashboard requires is missing. */
export function buildPayload(answers: Answers, today: Date = new Date()): RegistrationPayload | null {
  if (firstInvalidScreen(answers, today)) return null;
  const dateOfBirth = dateOfBirthIso(answers, today);
  if (!dateOfBirth) return null;
  return {
    fullName: asText(answers.fullName).trim(),
    email: asText(answers.emailAddress).trim(),
    mobilePhone: asText(answers.mobilePhone).trim(),
    dateOfBirth,
    consent: true,
    consentVersion: CONSENT_VERSION,
    sections: buildSections(answers, today),
  };
}
