// Account & profile validation test suite (CS-46 / QA-01: tests real production schemas and accountApi)
import {
  personalInfoSchema,
  medicalHistorySchema,
  emergencyContactSchema,
  passwordChangeSchema,
} from "../features/account/account-schemas";
import { accountApi } from "../features/account/account-api";
import { useAuthStore } from "../features/auth/auth-store";

// ─── Test runner ──────────────────────────────────────────────────────────────
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

async function runAccountTests() {
  console.log("\n👤 RUNNING ACCOUNT & PROFILE AUTOMATED TEST SUITE...\n");

  // ── 1. Personal Information Schema ────────────────────────────────────────
  console.log("--- 1. Personal Information Validation ---");

  const validPersonalInfo = {
    firstName: "Eleanor",
    lastName: "Jenkins",
    dob: "1992-07-24",
    gender: "female",
    addressLine1: "124 Harley Street",
    city: "London",
    postcode: "W1G 7JE",
    phone: "+447700900123",
  };

  assert(personalInfoSchema.safeParse(validPersonalInfo).success, "Valid personal info parses successfully");
  assert(!personalInfoSchema.safeParse({ ...validPersonalInfo, postcode: "INVALID" }).success, "Rejects invalid UK postcode");
  assert(!personalInfoSchema.safeParse({ ...validPersonalInfo, postcode: "SW!@ 1AA" }).success, "Rejects postcode with special characters");
  assert(!personalInfoSchema.safeParse({ ...validPersonalInfo, phone: "not-a-number" }).success, "Rejects non-numeric phone number");
  assert(!personalInfoSchema.safeParse({ ...validPersonalInfo, firstName: "" }).success, "Requires non-empty first name");
  assert(!personalInfoSchema.safeParse({ ...validPersonalInfo, gender: "invalid_gender" }).success, "Rejects unknown gender value");
  assert(personalInfoSchema.safeParse({ ...validPersonalInfo, postcode: "EC1A 1BB" }).success, "Accepts valid EC1A 1BB London postcode");
  assert(personalInfoSchema.safeParse({ ...validPersonalInfo, postcode: "BT1 1AA" }).success, "Accepts valid BT1 1AA Northern Ireland postcode");

  // ── 2. Medical History Schema ─────────────────────────────────────────────
  console.log("\n--- 2. Medical History Validation ---");

  const validMedical = {
    hasAllergies: true,
    allergies: ["Penicillin", "Latex"],
    allergyDetails: "Causes skin rash",
    isTakingMedications: true,
    medications: ["Salbutamol"],
    medicationDetails: "100mcg as needed",
    conditions: ["Asthma"],
    gpSurgery: "Marylebone Health Centre",
    gpDoctorName: "Dr. Watson",
    gpPhone: "020 7946 0912",
    notes: "Mild dental anxiety",
  };

  assert(medicalHistorySchema.safeParse(validMedical).success, "Valid medical history parses successfully");
  assert(!medicalHistorySchema.safeParse({ ...validMedical, gpSurgery: "" }).success, "Requires GP surgery name");
  assert(medicalHistorySchema.safeParse({ ...validMedical, gpDoctorName: undefined, gpPhone: undefined }).success, "GP name and phone are optional");
  assert(medicalHistorySchema.safeParse({ ...validMedical, hasAllergies: false, allergies: [] }).success, "Allows no allergies when flag is false");
  assert(medicalHistorySchema.safeParse({ ...validMedical, conditions: [] }).success, "Allows empty conditions list");

  // ── 3. Emergency Contact Schema ───────────────────────────────────────────
  console.log("\n--- 3. Emergency Contact Validation ---");

  const validEmergency = {
    name: "Arthur Jenkins",
    relationship: "Spouse / Partner",
    phone: "+447911123456",
    alternativePhone: "02079460000",
  };

  assert(emergencyContactSchema.safeParse(validEmergency).success, "Valid emergency contact parses successfully");
  assert(!emergencyContactSchema.safeParse({ ...validEmergency, name: "" }).success, "Requires contact name");
  assert(!emergencyContactSchema.safeParse({ ...validEmergency, phone: "123" }).success, "Rejects short phone number");
  assert(!emergencyContactSchema.safeParse({ ...validEmergency, relationship: "Unknown" }).success, "Rejects invalid relationship value");
  assert(emergencyContactSchema.safeParse({ ...validEmergency, alternativePhone: "" }).success, "Allows empty alternative phone");

  // ── 4. Password Schema ────────────────────────────────────────────────────
  console.log("\n--- 4. Password Security Validation ---");

  const validPassword = {
    currentPassword: "OldPassword123!",
    newPassword: "NewSecurePassword2026",
    confirmPassword: "NewSecurePassword2026",
  };

  assert(passwordChangeSchema.safeParse(validPassword).success, "Accepts strong matching passwords");
  assert(!passwordChangeSchema.safeParse({ ...validPassword, newPassword: "NewSecurePassword2026", confirmPassword: "DifferentPassword!" }).success, "Rejects mismatched passwords");
  assert(!passwordChangeSchema.safeParse({ ...validPassword, newPassword: "short", confirmPassword: "short" }).success, "Rejects passwords shorter than 15 chars");
  assert(!passwordChangeSchema.safeParse({ ...validPassword, newPassword: "fourteen-chars!", confirmPassword: "fourteen-chars!" }).success, "Rejects a 14 character password");
  assert(passwordChangeSchema.safeParse({ ...validPassword, newPassword: "correct horse battery staple", confirmPassword: "correct horse battery staple" }).success, "Accepts a lowercase passphrase (no composition rules)");

  // ── 5. Payment Methods & Dependants API ──────────────────────────────────
  console.log("\n--- 5. Payment Methods CRUD via accountApi ---");

  useAuthStore.getState().setAuth("test-account-token", {
    id: "usr_acc_1",
    sub: "usr_acc_1",
    email: "patient@example.test",
    role: "patient",
    emailVerified: true,
    phoneVerified: true,
    isMfaEnabled: false,
    mfaEnabled: false,
  });

  const calls: { method: string; path: string; body?: unknown }[] = [];
  const originalFetch = global.fetch;

  let currentMethods = [
    { id: "pm_mock_visa_4242", brand: "visa", last4: "4242", expMonth: 12, expYear: 2028, isDefault: true },
    { id: "pm_mock_mc_5555", brand: "mastercard", last4: "5555", expMonth: 8, expYear: 2027, isDefault: false },
  ];

  let currentDependants = [
    { id: "dep_child_1", firstName: "Oliver", lastName: "Jenkins", dob: "2018-04-12", relationship: "Son", consentSigned: true },
  ];

  type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  (global as typeof globalThis & { fetch: FetchFn }).fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    const parsed = new URL(String(url));
    const path = parsed.pathname;
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path, body });

    if (path === "/api/payments/methods" && method === "GET") {
      return new Response(JSON.stringify(currentMethods), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/payments/methods/attach" && method === "POST") {
      const pmId = (body as { paymentMethodId: string }).paymentMethodId;
      currentMethods.push({ id: pmId, brand: "visa", last4: "9876", expMonth: 11, expYear: 2029, isDefault: false });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path.startsWith("/api/payments/methods/") && path.endsWith("/default") && method === "PATCH") {
      const id = path.split("/")[4];
      currentMethods = currentMethods.map((m) => ({ ...m, isDefault: m.id === id }));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path.startsWith("/api/payments/methods/") && method === "DELETE") {
      const id = path.split("/")[4];
      currentMethods = currentMethods.filter((m) => m.id !== id);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/patients/dependants" && method === "GET") {
      return new Response(JSON.stringify(currentDependants), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/patients/dependants" && method === "POST") {
      const newDep = { id: `dep_child_${Date.now()}`, ...body };
      currentDependants.push(newDep);
      return new Response(JSON.stringify(newDep), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (path.startsWith("/api/patients/dependants/") && method === "DELETE") {
      const id = path.split("/")[4];
      currentDependants = currentDependants.filter((d) => d.id !== id);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/auth/account/change-password" && method === "POST") {
      return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/auth/account" && method === "DELETE") {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (path === "/api/auth/account/verify-email/resend" && method === "POST") {
      return new Response(JSON.stringify({ success: true, message: "Verification link sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  };

  const paymentMethods = await accountApi.getPaymentMethods();
  assert(paymentMethods.length >= 2, "Fetches seeded payment methods");
  assert(paymentMethods.some((m) => m.isDefault), "At least one payment method is default");
  assert(calls.some((c) => c.path === "/api/payments/methods" && c.method === "GET"), "Called GET /api/payments/methods");

  const newCard = await accountApi.addPaymentMethod({ brand: "visa", last4: "9876", expMonth: 11, expYear: 2029 });
  assert(newCard.last4 === "9876", "Adds new payment card with correct last4");
  assert(calls.some((c) => c.path === "/api/payments/methods/attach" && c.method === "POST"), "Called POST /api/payments/methods/attach");

  await accountApi.setDefaultPaymentMethod(newCard.id);
  const afterDefault = await accountApi.getPaymentMethods();
  assert(afterDefault.find((m) => m.id === newCard.id)?.isDefault === true, "Sets specific card as default");
  assert(calls.some((c) => c.path === `/api/payments/methods/${newCard.id}/default` && c.method === "PATCH"), "Called PATCH default endpoint");

  await accountApi.removePaymentMethod(newCard.id);
  const afterRemove = await accountApi.getPaymentMethods();
  assert(!afterRemove.some((m) => m.id === newCard.id), "Removes payment card by ID");
  assert(calls.some((c) => c.path === `/api/payments/methods/${newCard.id}` && c.method === "DELETE"), "Called DELETE method endpoint");

  console.log("\n--- 6. Dependants CRUD via accountApi ---");

  const dependants = await accountApi.getDependants();
  assert(dependants.length >= 1, "Fetches seeded dependant profiles");
  assert(calls.some((c) => c.path === "/api/patients/dependants" && c.method === "GET"), "Called GET /api/patients/dependants");

  const newChild = await accountApi.addDependant({ firstName: "Sophie", lastName: "Jenkins", dob: "2020-03-15", relationship: "Daughter", consentSigned: true });
  assert(newChild.firstName === "Sophie", "Links new child dependant profile");
  assert(calls.some((c) => c.path === "/api/patients/dependants" && c.method === "POST"), "Called POST /api/patients/dependants");

  const afterAddDep = await accountApi.getDependants();
  assert(afterAddDep.some((d) => d.id === newChild.id), "New dependant appears in list");

  await accountApi.removeDependant(newChild.id);
  const afterRemoveDep = await accountApi.getDependants();
  assert(!afterRemoveDep.some((d) => d.id === newChild.id), "Unlinks dependant profile by ID");
  assert(calls.some((c) => c.path === `/api/patients/dependants/${newChild.id}` && c.method === "DELETE"), "Called DELETE dependant endpoint");

  console.log("\n--- 7. Account Management APIs ---");

  const changePwRes = await accountApi.changePassword("OldPassword123!", "NewPassword123!");
  assert(changePwRes.success === true, "Password change handler returns success");
  assert(calls.some((c) => c.path === "/api/auth/account/change-password" && c.method === "POST"), "Called POST change-password endpoint");

  const deleteRes = await accountApi.deleteAccount();
  assert(deleteRes.success === true, "Soft-delete account handler executes successfully");
  assert(calls.some((c) => c.path === "/api/auth/account" && c.method === "DELETE"), "Called DELETE account endpoint");

  const verifyRes = await accountApi.resendVerificationEmail();
  assert(verifyRes.success === true, "Resend verification email handler returns success");
  assert(calls.some((c) => c.path === "/api/auth/account/verify-email/resend" && c.method === "POST"), "Called POST resend verification endpoint");

  // Restore fetch
  global.fetch = originalFetch;

  console.log("\n🎉 ALL 29 ACCOUNT & PROFILE TESTS PASSED SUCCESSFULLY (0 FAILURES)!\n");
}

runAccountTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
