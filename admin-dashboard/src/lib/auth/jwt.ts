import { jwtVerify, SignJWT } from "jose";

const ALGORITHM = "HS256";

function signingKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: Record<string, any>, expiresInSeconds: number): Promise<string> {
  const key = signingKey();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(key);
}

/** The token's claims, or null if it is malformed, forged or expired. */
export async function verifyToken(token: string): Promise<Record<string, any> | null> {
  const key = signingKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM], requiredClaims: ["exp"] });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Every token is signed with ADMIN_JWT_SECRET, so a valid signature alone says
 * nothing about who holds it. Each signer sets a purpose; check it.
 */
export const STAFF_PURPOSE = "staff";
export const SHOPPER_PURPOSE = "auth";

/** Claims of a dashboard staff session, or null for any other token. */
export async function verifyStaffToken(token: string): Promise<Record<string, any> | null> {
  const payload = await verifyToken(token).catch(() => null);
  if (!payload || payload.purpose !== STAFF_PURPOSE || payload.role !== "admin") return null;
  return payload;
}

/** Claims of a website shopper session, or null for any other token. */
export async function verifyShopperToken(token: string): Promise<Record<string, any> | null> {
  const payload = await verifyToken(token).catch(() => null);
  if (!payload || payload.purpose !== SHOPPER_PURPOSE || !payload.userId) return null;
  return payload;
}
