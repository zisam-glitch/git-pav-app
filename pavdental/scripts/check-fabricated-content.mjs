#!/usr/bin/env node
// Fails when screens or components hardcode clinical content that must come
// from a patient's record: named staff, GDC numbers, drugs, diagnoses on a
// specific tooth, or "AI" clinical claims (CS-06). Tests and fixtures are not
// scanned. Synthetic examples in placeholders should use neutral wording.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["src/app", "src/components"];
const RULES = [
  { name: "named staff member", re: /\b(Tariq|Emily Carter|Alexander Wright)\b/ },
  { name: "hardcoded GDC number", re: /GDC\s*#?\s*\d{4,}/ },
  {
    name: "drug name",
    // Allergy pickers list common allergens for the patient to choose from.
    allow: ["src/components/forms/MedicalHistoryForm.tsx", "src/app/onboarding/medical-history.tsx", "src/app/(onboarding)/medical-history.tsx"],
    re: /\b(amoxicillin|metronidazole|clindamycin|ibuprofen|paracetamol|co-codamol|chlorhexidine|fluconazole|penicillin|duraphat)\b/i,
  },
  { name: "tooth-specific finding", re: /\b(LR|LL|UR|UL)[1-8]\b|Tooth #\d+(?!\})/ },
  { name: "AI clinical claim", re: /24\/7 AI/i },
  { name: "made-up service id", re: /["']srv_[a-z_]+["']/ },
  // Claims the restyle in #70 brought back (06-completion-plan.md TC-01..TC-07).
  { name: "referral offer with no scheme behind it", re: /refer (friends|and earn)|invite link/i },
  { name: "security claim the app can't back", re: /Secure Enclave|FaceID Verified|bank-grade/i },
  // Vague trust badges: say what is true (email verified, health details encrypted), not "verified credentials".
  { name: "unsupported credential or encryption badge", re: /Verified patient credentials|256-bit encrypted medical safeguards/i },
  { name: "NHS or DSPT compliance claim", re: /\bDSPT\b|NHS (&|and) Private|NHS scale/i },
  { name: "finance promotion", re: /\b(Tabeo|Chrysalis)\b|0% (interest|APR)/i },
  { name: "insurance coverage claim", re: /— covered|member discount|Accepts (Denplan|Bupa|AXA)/i },
  // D-02: no insurers are accepted, so nothing scans a policy or checks cover.
  { name: "insurance scan or eligibility claim", re: /scan your (policy|insurance)|claimed automatically|check what's covered|Insurance & eligibility/i },
  { name: "feedback that goes nowhere", re: /feedback saved/i },
  // MF-04, D-04: no ratings or reviews are collected, so none can be shown.
  { name: "star rating or review count", re: /\b\d\.\d\s*·\s*\{?[^}]*\}?\s*reviews|Patient reviews|avgRating/i },
  // TC-09: van equipment the practice hasn't confirmed.
  { name: "unconfirmed van equipment", re: /low-dose X-ray|AirFlow|surgical suite/i },
  // TC-08, D-08: prices come from the services list, not the app.
  { name: "hardcoded procedure price list", re: /COMMON_PROCEDURES/ },
  {
    name: "claim that care was given",
    re: /Veneers Installation|clinical notes & charting|Dental examination & gum check|invoice has been sent/i,
  },
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "__tests__") continue;
      yield* walk(path);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      yield path;
    }
  }
}

const failures = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const rule of RULES) {
          if (rule.allow?.includes(relative(".", file))) continue;
          if (rule.re.test(line)) failures.push(`${relative(".", file)}:${i + 1} ${rule.name}: ${line.trim()}`);
        }
      });
  }
}

if (failures.length) {
  console.error("Hardcoded clinical content found. Load it from the patient's record instead:\n");
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("No hardcoded clinical content found.");
