// A failed send must look like a failure, and a message must not send twice (V46, V47, V51).
import { readFileSync } from "fs";
import { join } from "path";

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

for (const file of ["app/(patient)/(tabs)/messages.tsx", "app/(clinician)/inbox.tsx"]) {
  const src = read(file);
  check(`${file}: toast is not always green`, !src.includes('tone="success"'));
  check(`${file}: a failed send uses the error tone`, src.includes('tone: "error"'));
  check(`${file}: the message box can grow`, src.includes("multiline"));
}

const api = read("features/records/records-api.ts");
check("creating a thread sends an Idempotency-Key", /\/api\/messages", \{[^}]*Idempotency-Key/s.test(api));
check("replying sends an Idempotency-Key", /reply`, \{[^}]*Idempotency-Key/s.test(api));

if (failed > 0) process.exit(1);
console.log("INBOX SEND TESTS PASSED");
