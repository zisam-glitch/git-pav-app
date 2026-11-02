// Local development only: prints a code for changing an account's phone
// number, since there's no SMS provider locally and codes are never written to
// the server log. Refuses to run unless NODE_ENV is development or test.
//
//   npm run dev:phone-code -- patient@pavdental.com "+447700900123"
//
// Use the same number you typed in the app; the code only works for it.
// Reads backend/.env, as the server does, so `npm run` works in a fresh checkout.
import "dotenv/config";
import { createHash, randomInt } from "crypto";
import { PrismaClient } from "@prisma/client";
import { phoneChangePurpose } from "../src/lib/phone-change-purpose";

async function main() {
  const nodeEnv = process.env.NODE_ENV ?? "";
  if (!["development", "test"].includes(nodeEnv)) {
    throw new Error(`Refusing to issue a code with NODE_ENV="${nodeEnv}": this is for local development only.`);
  }
  const [email, phone] = process.argv.slice(2);
  if (!email || !phone) throw new Error('Usage: npm run dev:phone-code -- <email> "<new phone number>"');

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) throw new Error(`No account with email ${email}`);
    const code = Array.from({ length: 6 }, () => randomInt(0, 10)).join("");
    await prisma.mfaCode.create({
      data: {
        userId: user.id,
        code: createHash("sha256").update(code).digest("hex"),
        purpose: phoneChangePurpose(phone.trim()),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    console.log(`Phone change code for ${email} → ${phone}: ${code} (valid for 5 minutes)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
