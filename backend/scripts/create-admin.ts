// Creates the first practice admin on a new deployment and emails them a link
// to set their password, the same invitation the dashboard sends new staff.
// Run once, from a machine with the deployment's settings:
//
//   npm run create:admin -- someone@yourpractice.example
//
// Refuses when an active admin already exists: add further staff from the
// dashboard. The account has no usable password until the link is used, and
// the admin always signs in with a security code (email or SMS).
import crypto from "crypto";
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma.js";
import { communicationService } from "../src/lib/communication-service.js";
import { createAuditLogWithIntegrity } from "../src/lib/audit-integrity.js";

const INVITE_TTL_MS = 72 * 60 * 60 * 1000; // same as dashboard staff invites

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Usage: npm run create:admin -- <email>");
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin", isActive: true }, select: { id: true } });
  if (existingAdmin) {
    throw new Error("An admin already exists. Add further staff from the dashboard (Team & Services).");
  }
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw new Error(`An account with ${email} already exists.`);
  }

  // A random password nobody knows: the invitation link sets the real one.
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await argon2.hash(crypto.randomBytes(32).toString("hex")),
      role: "admin",
      emailVerified: true,
    },
  });

  // Same token shape as the server's reset tokens (32 hex characters, stored hashed).
  const token = crypto.randomBytes(16).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: crypto.createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });
  await createAuditLogWithIntegrity({
    action: "admin.bootstrap_admin_created",
    actorId: null,
    resourceId: user.id,
    metadata: { source: "scripts/create-admin.ts" },
  });

  const sent = await communicationService.sendStaffInviteEmail(email, token, "practice admin");
  console.log(`Admin account created for ${email}.`);
  console.log(
    sent
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
