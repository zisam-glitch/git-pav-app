// Local development only: prints a fresh sign-in security code for a seeded
// staff account, since codes are never written to the server log and there's
// no SMS or email provider locally (CS-08). Refuses to run unless NODE_ENV is
// development or test.
//
//   npm run dev:login-code -- doctor@pavdental.com
//
// Sign in with the password first (the app asks for a code), then run this
// and enter the code it prints. Only the newest code works.
// Reads backend/.env, as the server does, so `npm run` works in a fresh checkout.
import "dotenv/config";
import { createHash, randomInt } from "crypto";
import { PrismaClient } from "@prisma/client";

async function main() {
  const nodeEnv = process.env.NODE_ENV ?? "";
  if (!["development", "test"].includes(nodeEnv)) {
    throw new Error(`Refusing to issue a code with NODE_ENV="${nodeEnv}": this is for local development only.`);
  }
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npm run dev:login-code -- <email>");

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) throw new Error(`No account with email ${email}`);
    const code = Array.from({ length: 6 }, () => randomInt(0, 10)).join("");
    await prisma.mfaCode.create({
      data: {
        userId: user.id,
        code: createHash("sha256").update(code).digest("hex"),
        purpose: "mfa",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    console.log(`Security code for ${email}: ${code} (valid for 5 minutes)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
