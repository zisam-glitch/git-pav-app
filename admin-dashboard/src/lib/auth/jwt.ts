import { createHmac, randomBytes } from "crypto";

const header = {
  alg: "HS256",
  typ: "JWT",
};

function base64UrlEncode(str: string | Buffer): string {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function signToken(payload: Record<string, any>, expiresInSeconds: number): Promise<string> {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET not set");

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInSeconds;
  const fullPayload = { ...payload, iat: now, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64");
  const encodedSignature = base64UrlEncode(signature);
  return `${data}.${encodedSignature}`;
}

export async function verifyToken(token: string): Promise<Record<string, any> | null> {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET not set");
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = base64UrlEncode(createHmac("sha256", secret).update(data).digest("base64"));
  if (expectedSig !== encodedSignature) return null;
  const payloadJson = Buffer.from(encodedPayload, "base64").toString();
  const payload = JSON.parse(payloadJson);
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;
  return payload;
}

/**
 * Every token is signed with ADMIN_JWT_SECRET, so a valid signature alone says
 * nothing about who holds it. Each signer sets a purpose; check it.
 */
export const STAFF_PURPOSE = "staff";

/** Claims of a dashboard staff session, or null for any other token. */
export async function verifyStaffToken(token: string): Promise<Record<string, any> | null> {
  const payload = await verifyToken(token).catch(() => null);
  if (!payload || payload.purpose !== STAFF_PURPOSE || payload.role !== "admin") return null;
  return payload;
}
