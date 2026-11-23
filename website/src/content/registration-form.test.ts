import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  type Answers,
  CONSENT_VERSION,
  SCREENS,
  SECTIONS,
  buildPayload,
  buildSections,
  dateOfBirthIso,
  detailKey,
  fieldById,
  firstInvalidScreen,
  optionsFor,
  validateScreen,
  visibleFields,
  visibleScreens,
} from "./registration-form.ts";

const today = new Date("2026-11-24T12:00:00Z");

/** Questions taken from the live registration form (www.pavdental.com/services/regestration), as it asks them. */
const LIVE_QUESTIONS = [
  "Title",
  "Full Name",
  "Date of Birth (DD MM YYYY)",
  "What is your sex as recorded on your NHS record?",
  "NHS Number (if you have it)",
  "Name of UK GP surgery you registered with",
  "Home phone number",
  "Mobile phone number",
  "Email Address",
  "Name of emergency contact",
  "Phone number of emergency contact",
  "Their relationship to you",
  "What is your ethnic group?",
  "Ethnic group or background?",
  "Do you smoke?",
  "How many per day?",
  "For how many years?",
  "Do you vape (use e-cigarettes)?",
  "Type (nicotine / non-nicotine / other)",
  "Do you drink alcohol?",
  "How often / units per week?",
  "Do you use recreational or non-prescribed drugs?",
  "Please specify (e.g. cannabis, cocaine)",
  "What is your height?",
  "What is your weight?",
  "Current Address",
  "Postcode",
  "Village, town or city of birth",
  "Country of birth",
  "Age",
  "Where was the mother living when the baby was born?",
  "Where were they born?",
  "Do you attend any of the following?",
  "Are any of these involved in your care?",
  "Have you had all your routine vaccinations?",
  "Did you get your routine vaccinations in the UK?",
  "Please list all medications you currently take (pills, injections, or regular drugs)",
  "Are you allergic to any medications or substances?",
  "Please specify allergies and reactions",
  "Do you take blood thinners (e.g. Warfarin, Aspirin, Clopidogrel)?",
  "Do you take bisphosphonates (for osteoporosis, cancer, or bone conditions)?",
  "Have you had radiotherapy to the head, neck, or jaw?",
  "Have you taken steroids long-term?",
  "Have you ever been diagnosed with HIV/AIDS?",
  "Have you ever been diagnosed with Hepatitis B or C?",
  "Have you been diagnosed with any other infectious disease?",
  "Please tick all medical conditions that apply to you:",
  "Are you currently under hospital care or investigation?",
  "Do you have any problems with vision?",
  "Do you have any problems with hearing?",
  "Have you been diagnosed with Dyslexia, Dyspraxia, Autism, ADHD, or similar?",
  "Have you received your COVID-19 vaccinations?",
  "How many doses?",
  "Have you had any accidents, operations, or conditions not mentioned above?",
  "Are you pregnant or could you be pregnant?",
  "How many weeks?",
  "Do you use a wheelchair or require walking aids?",
  "When was your last dental check-up?",
  "Have you ever had any problems with dental treatment in the past?",
  "Do you usually attend the dentist:",
  "Do you currently have any dental pain or discomfort?",
  "Do your gums ever bleed when brushing or eating?",
  "Have you noticed loose teeth, drifting teeth, or gaps appearing?",
  "Do you clench or grind your teeth?",
  "Do you have any problems with your jaw joint (clicking, locking, pain)?",
  "How often do you brush your teeth each day?",
  "Do you have a sweet tooth / snack frequently on sugary foods/drinks?",
  "Are you happy with the appearance of your teeth and smile?",
  "What would you like to change?",
  "Do you feel nervous or anxious about dental treatment?",
  "Have you ever had a bad dental experience?",
  "Please explain",
];

const LIVE_CONDITIONS = [
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
];

/** Fills every required question of every visible screen, repeating until no new question appears. */
function completeAnswers(overrides: Answers = {}): Answers {
  const answers: Answers = {
    fullName: "Jane Example",
    mobilePhone: "07700 900123",
    emailAddress: "jane@example.test",
    dateOfBirthDay: "17",
    dateOfBirthMonth: "04",
    dateOfBirthYear: "1990",
    emergencyContactName: "John Example",
    emergencyContactPhone: "07700 900456",
    emergencyContactRelationship: "Partner",
    address: "1 Example Street, Bradford",
    postcode: "BD3 9TY",
    consentAccurate: "yes",
    consentStore: "yes",
    ...overrides,
  };
  for (let pass = 0; pass < 6; pass += 1) {
    for (const screen of visibleScreens(answers)) {
      for (const field of visibleFields(screen, answers)) {
        if (field.optional || answers[field.id] !== undefined) continue;
        if (field.kind === "choice") answers[field.id] = field.options[0] as string;
        if (field.kind === "multi") answers[field.id] = [field.options[0] as string];
      }
    }
  }
  return answers;
}

describe("registration form definition", () => {
  const fields = SCREENS.flatMap((screen) => screen.fields);

  it("uses each question id once", () => {
    const ids = fields.map((field) => field.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("asks every question the live form asks, in its words", () => {
    const labels = new Set(fields.map((field) => field.label));
    for (const question of LIVE_QUESTIONS) {
      assert.ok(labels.has(question), `missing live question: ${question}`);
    }
  });

  it("offers every medical condition the live form lists", () => {
    const conditions = fieldById("conditions");
    assert.ok(conditions && conditions.kind === "multi");
    assert.deepEqual([...conditions.options], LIVE_CONDITIONS);
    assert.equal(conditions.details, true);
  });

  it("only lets a question depend on a question that comes earlier", () => {
    const seen = new Set<string>();
    for (const screen of SCREENS) {
      for (const field of screen.fields) {
        if (field.showIf) assert.ok(seen.has(field.showIf.id), `${field.id} depends on ${field.showIf.id}`);
        seen.add(field.id);
      }
      if (screen.showIf) assert.ok(seen.has(screen.showIf.id), `screen ${screen.id} depends on ${screen.showIf.id}`);
    }
  });

  it("gives every choice and select its options, and every section a screen", () => {
    for (const field of fields) {
      if (field.kind === "choice" || field.kind === "multi") assert.ok(field.options.length >= 2, field.id);
      if (field.kind === "select" && !field.optionsBy) assert.ok(field.options.length >= 2, field.id);
    }
    for (const section of SECTIONS) {
      assert.ok(
        SCREENS.some((screen) => screen.section === section.id),
        section.id,
      );
    }
  });
});

describe("what shows", () => {
  it("shows a follow-up only after the matching answer", () => {
    const screen = SCREENS.find((s) => s.id === "smoke");
    assert.ok(screen);
    assert.deepEqual(
      visibleFields(screen, {}).map((f) => f.id),
      ["smoke"],
    );
    assert.deepEqual(
      visibleFields(screen, { smoke: "Yes" }).map((f) => f.id),
      ["smoke", "smokePerDay", "smokeYears"],
    );
    assert.deepEqual(
      visibleFields(screen, { smoke: "No" }).map((f) => f.id),
      ["smoke"],
    );
  });

  it("skips the child questions for an adult and shows them otherwise", () => {
    assert.ok(!visibleScreens({}).some((s) => s.id === "child"));
    assert.ok(!visibleScreens({ ageGroup: "Adult" }).some((s) => s.id === "child"));
    assert.ok(visibleScreens({ ageGroup: "Under 18 years" }).some((s) => s.id === "child"));
    const child = SCREENS.find((s) => s.id === "child");
    assert.ok(child);
    assert.ok(visibleFields(child, { ageGroup: "Under 12 months" }).some((f) => f.id === "motherLiving"));
    assert.ok(!visibleFields(child, { ageGroup: "Under 18 years" }).some((f) => f.id === "motherLiving"));
    assert.ok(visibleFields(child, { ageGroup: "Under 18 years" }).some((f) => f.id === "attends"));
  });

  it("offers the background that belongs to the chosen ethnic group, and a text box for Other", () => {
    const background = fieldById("ethnicBackground");
    assert.ok(background);
    assert.deepEqual([...optionsFor(background, { ethnicGroup: "Asian or Asian British" })], [
      "Indian",
      "Pakistani",
      "Bangladeshi",
      "Chinese",
    ]);
    const screen = SCREENS.find((s) => s.id === "ethnicity");
    assert.ok(screen);
    assert.deepEqual(
      visibleFields(screen, { ethnicGroup: "Other ethnic group" }).map((f) => f.id),
      ["ethnicGroup", "ethnicBackgroundOther"],
    );
  });

  it("asks what to change only of someone who is not happy with their smile", () => {
    const screen = SCREENS.find((s) => s.id === "smile");
    assert.ok(screen);
    assert.equal(visibleFields(screen, { appearance: "Yes" }).length, 1);
    assert.equal(visibleFields(screen, { appearance: "No" }).length, 2);
  });
});

describe("validation", () => {
  const screen = (id: string) => {
    const found = SCREENS.find((s) => s.id === id);
    assert.ok(found, id);
    return found;
  };

  it("needs the required answers and lets optional ones be empty", () => {
    assert.deepEqual(Object.keys(validateScreen(screen("name"), {}, today)), ["fullName"]);
    assert.deepEqual(validateScreen(screen("name"), { fullName: "Jane Example" }, today), {});
    assert.deepEqual(validateScreen(screen("nhs"), {}, today), {});
    assert.deepEqual(validateScreen(screen("ethnicity"), {}, today), {});
  });

  it("checks email, phone, NHS number and postcode", () => {
    const contact = screen("contact");
    const base = { mobilePhone: "07700 900123", emailAddress: "jane@example.test" };
    assert.deepEqual(validateScreen(contact, base, today), {});
    assert.ok(validateScreen(contact, { ...base, emailAddress: "jane@" }, today).emailAddress);
    assert.ok(validateScreen(contact, { ...base, mobilePhone: "call me" }, today).mobilePhone);
    assert.deepEqual(validateScreen(screen("nhs"), { nhsNumber: "943 476 5919" }, today), {});
    assert.ok(validateScreen(screen("nhs"), { nhsNumber: "12345" }, today).nhsNumber);
    assert.deepEqual(validateScreen(screen("address"), { address: "1 High St", postcode: "ls1 1ur" }, today), {});
    assert.ok(validateScreen(screen("address"), { address: "1 High St", postcode: "nowhere" }, today).postcode);
  });

  it("checks the date of birth is a real past date", () => {
    const dob = screen("dob");
    const date = (d: string, m: string, y: string) => ({ dateOfBirthDay: d, dateOfBirthMonth: m, dateOfBirthYear: y });
    assert.deepEqual(validateScreen(dob, date("17", "04", "1990"), today), {});
    assert.ok(validateScreen(dob, {}, today).dateOfBirth);
    assert.ok(validateScreen(dob, date("31", "02", "1990"), today).dateOfBirth);
    assert.ok(validateScreen(dob, date("17", "04", "2030"), today).dateOfBirth);
    assert.ok(validateScreen(dob, date("17", "04", "90"), today).dateOfBirth);
    assert.equal(dateOfBirthIso(date("7", "4", "1990"), today), "1990-04-07");
    assert.equal(dateOfBirthIso(date("24", "11", "2026"), today), "2026-11-24");
    assert.equal(dateOfBirthIso(date("25", "11", "2026"), today), null);
  });

  it("only accepts a choice from the options shown", () => {
    assert.ok(validateScreen(screen("sex"), {}, today).sex);
    assert.ok(validateScreen(screen("sex"), { sex: "Other" }, today).sex);
    assert.deepEqual(validateScreen(screen("sex"), { sex: "Female" }, today), {});
  });

  it("needs both consent boxes ticked", () => {
    const consent = screen("consent");
    assert.equal(Object.keys(validateScreen(consent, {}, today)).length, 2);
    assert.equal(Object.keys(validateScreen(consent, { consentAccurate: "yes" }, today)).length, 1);
    assert.deepEqual(validateScreen(consent, { consentAccurate: "yes", consentStore: "yes" }, today), {});
  });

  it("finds the first screen that cannot continue", () => {
    assert.equal(firstInvalidScreen({}, today)?.id, "name");
    assert.equal(firstInvalidScreen(completeAnswers(), today), null);
  });
});

describe("the registration sent to the dashboard", () => {
  it("is built from a complete set of answers", () => {
    const payload = buildPayload(completeAnswers({ title: "Ms" }), today);
    assert.ok(payload);
    assert.equal(payload.fullName, "Jane Example");
    assert.equal(payload.email, "jane@example.test");
    assert.equal(payload.mobilePhone, "07700 900123");
    assert.equal(payload.dateOfBirth, "1990-04-17");
    assert.equal(payload.consent, true);
    assert.equal(payload.consentVersion, CONSENT_VERSION);
  });

  it("is not built while anything required is missing", () => {
    const answers = completeAnswers();
    delete answers.emergencyContactName;
    assert.equal(buildPayload(answers, today), null);
    assert.equal(buildPayload(completeAnswers({ consentStore: "" }), today), null);
  });

  it("groups answers under the live headings, in the order asked", () => {
    const payload = buildPayload(completeAnswers(), today);
    assert.ok(payload);
    assert.deepEqual(
      payload.sections.map((section) => section.title),
      ["Personal info", "Lifestyle information", "Address", "Medical history", "Dental history"],
    );
    const personal = payload.sections[0];
    assert.ok(personal);
    assert.deepEqual(personal.items.slice(0, 2), [
      { label: "Full Name", value: "Jane Example" },
      { label: "Date of Birth", value: "17 April 1990" },
    ]);
  });

  it("labels a follow-up with the question it belongs to, and leaves unanswered ones out", () => {
    const sections = buildSections(completeAnswers({ smoke: "Yes", smokePerDay: "5" }), today);
    const lifestyle = sections.find((section) => section.title === "Lifestyle information");
    assert.ok(lifestyle);
    assert.ok(lifestyle.items.some((item) => item.label === "Do you smoke? – How many per day?" && item.value === "5"));
    assert.ok(!lifestyle.items.some((item) => item.label.includes("For how many years?")));
    const personal = sections.find((section) => section.title === "Personal info");
    assert.ok(personal && !personal.items.some((item) => item.label === "NHS Number (if you have it)"));
  });

  it("leaves out an answer that is no longer asked", () => {
    const sections = buildSections(completeAnswers({ smoke: "No", smokePerDay: "20" }), today);
    const lifestyle = sections.find((section) => section.title === "Lifestyle information");
    assert.ok(lifestyle && !lifestyle.items.some((item) => item.value === "20"));
  });

  it("carries the details a patient adds under each ticked condition", () => {
    const diabetes = "Diabetes";
    const sections = buildSections(
      completeAnswers({ conditions: [diabetes, "Kidney disease"], [detailKey("conditions", diabetes)]: "Type 2, diet controlled" }),
      today,
    );
    const medical = sections.find((section) => section.title === "Medical history");
    assert.ok(medical);
    assert.ok(medical.items.some((item) => item.value === `${diabetes}, Kidney disease`));
    assert.ok(medical.items.some((item) => item.label === "Diabetes – details" && item.value === "Type 2, diet controlled"));
    assert.ok(!medical.items.some((item) => item.label === "Kidney disease – details"));
  });

  it("asks adults nothing about children, and includes the child answers for a child", () => {
    const adult = buildPayload(completeAnswers(), today);
    assert.ok(adult && !JSON.stringify(adult).includes("routine vaccinations"));
    const child = buildPayload(completeAnswers({ ageGroup: "Under 18 years", vaccinations: "Yes" }), today);
    assert.ok(child && JSON.stringify(child).includes("routine vaccinations"));
  });

  it("never puts the consent boxes in the answers", () => {
    const payload = buildPayload(completeAnswers(), today);
    assert.ok(payload && !JSON.stringify(payload.sections).toLowerCase().includes("i agree that pav dental"));
  });
});
