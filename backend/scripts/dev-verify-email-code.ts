// Local development only: prints a fresh email verification code for an
// account, since there's no email provider locally and codes are never written
// to the server log. Refuses to run unless NODE_ENV is development or test.
//
//   npm run dev:verify-email-code -- someone@example.test
//
// Enter the code on the app's "Verify your email" screen (or open the printed
// link on the simulator). Earlier codes for the account keep working until
// they expire.
import { createHash, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const VALID_HOURS = 24;

async function main() {
  const nodeEnv = process.env.NODE_ENV ?? "";
  if (!["development", "test"].includes(nodeEnv)) {
    throw new Error(`Refusing to issue a code with NODE_ENV="${nodeEnv}": this is for local development only.`);
  }
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npm run dev:verify-email-code -- <email>");

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (!user) throw new Error(`No account with email ${email}`);
    if (user.emailVerified) {
      console.log(`${email} is already verified.`);
      return;
    }
    // Same shape as the server's codes (32 hex characters, stored hashed).
    const code = randomBytes(16).toString("hex");
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: createHash("sha256").update(code).digest("hex"),
        expiresAt: new Date(Date.now() + VALID_HOURS * 60 * 60 * 1000),
      },
    });
    console.log(`Email verification code for ${email}: ${code} (valid for ${VALID_HOURS} hours)`);
    console.log(`Or open: pavdental://verify-email?token=${code}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
