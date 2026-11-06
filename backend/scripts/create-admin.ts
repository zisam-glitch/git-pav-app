// Creates the first practice admin on a new deployment and emails them a link
// to set their password, the same invitation the dashboard sends new staff.
// Run once, from a machine with the deployment's settings:
//
//   npm run create:admin -- someone@yourpractice.example
//
// Refuses when an active admin already exists: add further staff from the
// dashboard. The account has no usable password until the link is used, and
// the admin always signs in with a security code (email or SMS).
import { createFirstAdmin, isValidBootstrapEmail } from "../src/lib/bootstrap-admin.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!isValidBootstrapEmail(email)) {
    throw new Error("Usage: npm run create:admin -- <email>");
  }
  const result = await createFirstAdmin(email, "scripts/create-admin.ts");
  if (result.status === "skipped") {
    const reasons = {
      admin_exists: "An admin already exists. Add further staff from the dashboard (Team & Services).",
      email_in_use: `An account with ${email} already exists.`,
      invalid_email: "Usage: npm run create:admin -- <email>",
    } as const;
    throw new Error(reasons[result.reason]);
  }
  console.log(`Admin account created for ${email}.`);
  console.log(
    result.emailSent
      ? "An email with a link to set the password is on its way (valid for 72 hours)."
      : "The invitation email could NOT be sent. Check POSTMARK_SERVER_TOKEN and FROM_EMAIL, then use 'Forgot password' with this address."
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Shared clients (Redis) keep the process alive otherwise.
    process.exit();
  });
