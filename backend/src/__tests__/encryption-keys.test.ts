import crypto from "crypto";
import { EncryptionService, clinicalRecordEncryptionService, type EncryptedData } from "../lib/encryption";
import { objectStorage } from "../lib/object-storage";
import { rewrapVanAccessDetails } from "../lib/rewrap";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { isPlaceholderCredential } from "../config/placeholder";

// CS-13 (EN-1, EN-3): encrypted data survives a change of AWS_REGION or
// KMS_KEY_ID, records written before the fix still decrypt and can be moved
// onto the current key, and download URLs aren't signed with the master key.
// Synthetic values only.

// The master key the service uses: a template value from .env.example ("replace…")
// is ignored in favour of the dev key, as in lib/encryption.ts masterKey().
const fromProcess = process.env.ENCRYPTION_KEY;
const MASTER = (isPlaceholderCredential(fromProcess) ? undefined : fromProcess) || env.encryptionKey!;

const service = (keyId: string, region = "eu-west-2") => new EncryptionService({ keyId, region, algorithm: "aes-256-gcm" });

// How records were encrypted before CS-13: AWS_REGION as the HKDF salt and the
// bare key id as both HKDF info and AAD.
function legacyEncrypt(plaintext: string, keyId: string, region: string): EncryptedData {
  const kek = Buffer.from(crypto.hkdfSync("sha256", Buffer.from(MASTER), Buffer.from(region), Buffer.from(`pavdental-kek:${keyId}`), 32));
  const dek = crypto.randomBytes(32);
  const dekIv = crypto.randomBytes(12);
  const dekCipher = crypto.createCipheriv("aes-256-gcm", kek, dekIv);
  dekCipher.setAAD(Buffer.from(keyId));
  const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final(), dekCipher.getAuthTag()]).toString("hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final(), cipher.getAuthTag()]).toString("hex");
  return { ciphertext, iv: iv.toString("hex"), encryptedDek, dekIv: dekIv.toString("hex"), keyId, algorithm: "aes-256-gcm" };
}

describe("encryption keys", () => {
  const before = process.env.ENCRYPTION_KEY;
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = MASTER;
  });
  afterAll(() => {
    if (before === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = before;
  });

  it("still decrypts after AWS_REGION changes", async () => {
    const sealed = await service("key-a", "eu-west-2").encrypt("gate 1234");
    expect(await service("key-a", "global").decrypt(sealed)).toBe("gate 1234");
    expect(await service("key-a", "auto").decrypt(sealed)).toBe("gate 1234");
  });

  it("still decrypts after KMS_KEY_ID changes, and re-wraps onto the new key", async () => {
    const sealed = await service("key-a").encrypt("gate 1234");
    const rotated = service("key-b");
    expect(await rotated.decrypt(sealed)).toBe("gate 1234");
    expect(rotated.needsRewrap(sealed)).toBe(true);

    const rewrapped = await rotated.rewrap(sealed);
    expect(rewrapped.keyId).toBe("v2:key-b");
    expect(rewrapped.ciphertext).toBe(sealed.ciphertext);
    expect(rotated.needsRewrap(rewrapped)).toBe(false);
    expect(await rotated.decrypt(rewrapped)).toBe("gate 1234");
  });

  it("reads records written before the fix, even after AWS_REGION moved off the old default", async () => {
    const old = legacyEncrypt("door round the back", "key-a", "eu-west-2");
    expect(await service("key-a", "auto").decrypt(old)).toBe("door round the back");

    const otherRegion = legacyEncrypt("door round the back", "key-a", "global");
    expect(await service("key-a", "global").decrypt(otherRegion)).toBe("door round the back");

    const rewrapped = await service("key-a", "auto").rewrap(old);
    expect(rewrapped.keyId).toBe("v2:key-a");
    expect(await service("key-a", "global").decrypt(rewrapped)).toBe("door round the back");
  });

  it("refuses a record whose key id was swapped", async () => {
    const sealed = await service("key-a").encrypt("gate 1234");
    await expect(service("key-a").decrypt({ ...sealed, keyId: "v2:key-b" })).rejects.toThrow();
  });

  it("signs download URLs with a key of their own", async () => {
    const { url, signature, expiresAt } = await objectStorage.getSignedUrl("documents/synthetic.pdf", 60);
    expect(url).toContain(`sig=${signature}`);
    const withMaster = crypto
      .createHmac("sha256", MASTER)
      .update(`documents/synthetic.pdf:${expiresAt.getTime()}`)
      .digest("hex");
    expect(signature).not.toBe(withMaster);
    expect(objectStorage.verifySignedUrl("documents/synthetic.pdf", expiresAt.getTime(), signature)).toBe(true);
    expect(objectStorage.verifySignedUrl("documents/synthetic.pdf", expiresAt.getTime(), withMaster)).toBe(false);
  });

  describe("re-wrapping van access details", () => {
    const tag = crypto.randomUUID().slice(0, 8);
    const cleanup: { users: string[]; vanId?: string; shiftId?: string; operatorId?: string } = { users: [] };

    afterAll(async () => {
      await prisma.vanServiceRequest.deleteMany({ where: { shiftId: cleanup.shiftId } });
      if (cleanup.shiftId) await prisma.vanShift.delete({ where: { id: cleanup.shiftId } });
      if (cleanup.vanId) await prisma.van.delete({ where: { id: cleanup.vanId } });
      if (cleanup.operatorId) await prisma.operatorProfile.delete({ where: { id: cleanup.operatorId } });
      await prisma.patientProfile.deleteMany({ where: { userId: { in: cleanup.users } } });
      await prisma.user.deleteMany({ where: { id: { in: cleanup.users } } });
    });

    it("leaves data alone without --apply, then moves old records onto the current key", async () => {
      const opUser = await prisma.user.create({ data: { email: `rewrap-op-${tag}@example.test`, passwordHash: "x", role: "operator" } });
      const patientUser = await prisma.user.create({ data: { email: `rewrap-pt-${tag}@example.test`, passwordHash: "x", role: "patient" } });
      cleanup.users.push(opUser.id, patientUser.id);
      const operator = await prisma.operatorProfile.create({ data: { userId: opUser.id, fullName: "Synthetic Operator" } });
      cleanup.operatorId = operator.id;
      const van = await prisma.van.create({ data: { name: `Synthetic Van ${tag}`, registrationPlate: `RW${tag}`, vehicleModel: "Test" } });
      cleanup.vanId = van.id;
      const shift = await prisma.vanShift.create({ data: { vanId: van.id, operatorId: operator.id } });
      cleanup.shiftId = shift.id;
      const profile = await prisma.patientProfile.create({ data: { userId: patientUser.id, firstName: "Synthetic", lastName: "Rewrap" } });

      const legacyGate = legacyEncrypt("gate 1234", env.kmsKeyId, "eu-west-2");
      const current = await clinicalRecordEncryptionService.encryptField("ring twice");
      const request = await prisma.vanServiceRequest.create({
        data: {
          shiftId: shift.id,
          vanId: van.id,
          patientId: profile.id,
          serviceId: (await prisma.service.findFirstOrThrow()).id,
          patientLat: 51.5,
          patientLng: -0.12,
          accessDetails: { parkingType: "street", gateCode: legacyGate, accessNotes: current } as any,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });
      const read = async () => (await prisma.vanServiceRequest.findUniqueOrThrow({ where: { id: request.id } })).accessDetails as any;

      const dryRun = await rewrapVanAccessDetails({ apply: false });
      expect(dryRun.needingRewrap).toBeGreaterThanOrEqual(1);
      expect(dryRun.rewrapped).toBe(0);
      expect((await read()).gateCode).toEqual(legacyGate);

      const applied = await rewrapVanAccessDetails({ apply: true });
      expect(applied.rewrapped).toBeGreaterThanOrEqual(1);
      expect(applied.failed).toBe(0);

      const after = await read();
      expect(after.gateCode.keyId).toBe(`v2:${env.kmsKeyId}`);
      expect(after.accessNotes).toEqual(current);
      expect(after.parkingType).toBe("street");
      expect(await clinicalRecordEncryptionService.decryptField(after.gateCode)).toBe("gate 1234");
      expect(await clinicalRecordEncryptionService.decryptField(after.accessNotes)).toBe("ring twice");

      expect((await rewrapVanAccessDetails({ apply: false })).needingRewrap).toBe(0);
    });
  });
});
