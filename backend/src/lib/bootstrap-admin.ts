/**
 * Creates the first practice admin on a new deployment.
 *
 * Used by `npm run create:admin` and, on a host with no shell, by the server's
 * startup when BOOTSTRAP_ADMIN_EMAIL is set. Either way it:
 *
 *  - does nothing when an active admin already exists, so it can't be used to
 *    add a second admin or to take over an existing deployment;
 *  - does nothing when the address already has an account;
 *  - gives the new account a random password nobody knows, and emails the
 *    address a link and token to choose a real one (valid 72 hours, the same
 *    invitation the dashboard sends new staff);
 *  - writes an audit entry.
 *
 * The admin always signs in with a security code as well as the password.
 */
import crypto from "crypto";
import argon2 from "argon2";
import { prisma } from "./prisma";
import { communicationService } from "./communication-service";
import { createAuditLogWithIntegrity } from "./audit-integrity";
import { maskEmail } from "./log-safety";

const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

export type BootstrapResult =
  | { status: "created"; emailSent: boolean }
  | { status: "skipped"; reason: "admin_exists" | "email_in_use" | "invalid_email" };

export function isValidBootstrapEmail(value: string | undefined): value is string {
  return !!value && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

export async function createFirstAdmin(rawEmail: string | undefined, source: string): Promise<BootstrapResult> {
  const email = rawEmail?.trim().toLowerCase();
  if (!isValidBootstrapEmail(email)) return { status: "skipped", reason: "invalid_email" };

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin", isActive: true }, select: { id: true } });
  if (existingAdmin) return { status: "skipped", reason: "admin_exists" };
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { status: "skipped", reason: "email_in_use" };
  }

  // A random password nobody knows: the invitation sets the real one.
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
    metadata: { source },
  });

  const emailSent = await communicationService.sendStaffInviteEmail(email, token, "practice admin");
  return { status: "created", emailSent };
}

/** Server startup: act on BOOTSTRAP_ADMIN_EMAIL, never throw, log only a masked address. */
export async function bootstrapAdminFromEnv(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const email = env.BOOTSTRAP_ADMIN_EMAIL?.trim();
  if (!email) return;
  try {
    const result = await createFirstAdmin(email, "BOOTSTRAP_ADMIN_EMAIL");
    if (result.status === "created") {
      console.log(
        `[Bootstrap] First admin created for ${maskEmail(email)}.`,
        result.emailSent
          ? "An invitation email is on its way (valid 72 hours)."
          : "The invitation email could NOT be sent: check POSTMARK_SERVER_TOKEN and FROM_EMAIL, then use 'Forgot password' with this address."
      );
    } else if (result.status === "skipped" && result.reason !== "admin_exists") {
      console.warn(`[Bootstrap] Not created (${result.reason}). Remove BOOTSTRAP_ADMIN_EMAIL once the admin exists.`);
    }
  } catch (err) {
    console.error("[Bootstrap] Could not create the first admin:", err instanceof Error ? err.name : "error");
  }
}
