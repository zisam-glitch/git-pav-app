/**
 * Envelope Encryption Service for Clinical Records and Document Metadata
 *
 * Implements AES-256-GCM envelope encryption using per-record random 256-bit
 * Data Encryption Keys (DEKs) wrapped by a Key Encryption Key (KEK) derived
 * via HKDF-SHA256 from the local master key (ENCRYPTION_KEY). KMS_KEY_ID is
 * only a label that versions the KEK; no KMS call is made yet (EN-2).
 *
 * Each record stores the key id it was wrapped under, and decrypt derives the
 * KEK from that stored id, so changing KMS_KEY_ID or AWS_REGION never makes
 * old data unreadable (EN-1). Records written before the fix ("legacy", no
 * "v2:" prefix) were derived with AWS_REGION as the HKDF salt; they still
 * decrypt, and `scripts/rewrap-encrypted-fields.ts` moves them onto the
 * current key.
 */

import crypto from "crypto";
import { env } from "../config/env";
import { isPlaceholderCredential } from "../config/placeholder";

const KEY_SCHEME = "v2:";
const KEK_SALT = "pavdental-kek-salt-v2";
// Before EN-1 the salt was AWS_REGION, which defaulted to this.
const LEGACY_DEFAULT_REGION = "eu-west-2";

export interface EncryptionConfig {
  keyId: string;
  region: string;
  algorithm: string;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  encryptedDek?: string;
  dekIv?: string;
  keyId: string;
  algorithm: string;
}

function masterKey(): string {
  // The template value from .env.example counts as unset (env.ts then gives
  // the dev key; deployed environments refuse to start without a real one).
  const fromProcess = process.env.ENCRYPTION_KEY;
  const rawKey = (isPlaceholderCredential(fromProcess) ? undefined : fromProcess) || env.encryptionKey;
  if (!rawKey || rawKey.length < 32 || rawKey.includes("default-key")) {
    throw new Error(
      "CRITICAL: ENCRYPTION_KEY must be configured with at least 32 characters. Static fallback keys are forbidden."
    );
  }
  return rawKey;
}

/**
 * A key for something other than wrapping records, such as signing download
 * URLs, derived from the master key so the two uses never share a key (EN-3).
 */
export function deriveSubKey(purpose: string): Buffer {
  return Buffer.from(
    crypto.hkdfSync("sha256", Buffer.from(masterKey(), "utf8"), Buffer.from(KEK_SALT, "utf8"), Buffer.from(`pavdental-subkey:${purpose}`, "utf8"), 32)
  );
}

export class EncryptionService {
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig) {
    this.config = config;
    // Validate master key on service instantiation
    this.deriveKek();
  }

  /**
   * Encrypt plaintext using a unique random 256-bit DEK wrapped by the KEK.
   */
  async encrypt(plaintext: string): Promise<EncryptedData> {
    const keyId = this.currentKeyId();
    const [kek] = this.keksFor(keyId);

    // 1. Generate unique 32-byte Data Encryption Key (DEK) for this record
    const dek = crypto.randomBytes(32);

    // 2. Wrap DEK with KEK using AES-256-GCM and keyId as AAD
    const { encryptedDek, dekIv } = this.wrapDek(dek, kek, keyId);

    // 3. Encrypt payload with DEK using AES-256-GCM
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    // Zero out raw DEK buffer after use
    dek.fill(0);

    return {
      ciphertext: ciphertext + authTag.toString("hex"),
      iv: iv.toString("hex"),
      encryptedDek,
      dekIv,
      keyId,
      algorithm: this.config.algorithm,
    };
  }

  /**
   * Decrypt data using unwrapped DEK (or legacy direct key for backward compatibility).
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    const keyId = encryptedData.keyId || this.config.keyId;
    let lastError: unknown;
    for (const kek of this.keksFor(keyId)) {
      try {
        return this.decryptWith(encryptedData, kek, keyId);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  /** True when the record isn't wrapped under the current key. */
  needsRewrap(encryptedData: EncryptedData): boolean {
    return encryptedData.keyId !== this.currentKeyId();
  }

  /**
   * Re-wraps a record under the current key. Only the DEK is re-wrapped; the
   * payload ciphertext is unchanged. Legacy records that used the KEK directly
   * are re-encrypted.
   */
  async rewrap(encryptedData: EncryptedData): Promise<EncryptedData> {
    if (!this.needsRewrap(encryptedData)) return encryptedData;
    if (!encryptedData.encryptedDek || !encryptedData.dekIv) {
      return this.encrypt(await this.decrypt(encryptedData));
    }

    const oldKeyId = encryptedData.keyId || this.config.keyId;
    let dek: Buffer | null = null;
    let lastError: unknown;
    for (const kek of this.keksFor(oldKeyId)) {
      try {
        dek = this.unwrapDek(encryptedData.encryptedDek, encryptedData.dekIv, kek, oldKeyId);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!dek) throw lastError;

    const keyId = this.currentKeyId();
    const [kek] = this.keksFor(keyId);
    const wrapped = this.wrapDek(dek, kek, keyId);
    dek.fill(0);
    return { ...encryptedData, ...wrapped, keyId };
  }

  private currentKeyId(): string {
    return `${KEY_SCHEME}${this.config.keyId}`;
  }

  private decryptWith(encryptedData: EncryptedData, kek: Buffer, keyId: string): string {
    const dek =
      encryptedData.encryptedDek && encryptedData.dekIv
        ? this.unwrapDek(encryptedData.encryptedDek, encryptedData.dekIv, kek, keyId)
        : kek;

    try {
      const iv = Buffer.from(encryptedData.iv, "hex");
      const ciphertext = Buffer.from(encryptedData.ciphertext, "hex");
      const authTag = ciphertext.slice(-16);
      const encrypted = ciphertext.slice(0, -16);

      const decipher = crypto.createDecipheriv("aes-256-gcm", dek, iv);
      decipher.setAuthTag(authTag);

      let plaintext = decipher.update(encrypted, undefined, "utf8");
      plaintext += decipher.final("utf8");
      return plaintext;
    } finally {
      if (encryptedData.encryptedDek) {
        dek.fill(0);
      }
    }
  }

  private wrapDek(dek: Buffer, kek: Buffer, keyId: string): { encryptedDek: string; dekIv: string } {
    const dekIv = crypto.randomBytes(12);
    const dekCipher = crypto.createCipheriv("aes-256-gcm", kek, dekIv);
    dekCipher.setAAD(Buffer.from(keyId, "utf8"));
    const wrappedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
    const encryptedDek = Buffer.concat([wrappedDek, dekCipher.getAuthTag()]).toString("hex");
    return { encryptedDek, dekIv: dekIv.toString("hex") };
  }

  private unwrapDek(encryptedDek: string, dekIvHex: string, kek: Buffer, keyId: string): Buffer {
    const rawWrapped = Buffer.from(encryptedDek, "hex");
    const dekDecipher = crypto.createDecipheriv("aes-256-gcm", kek, Buffer.from(dekIvHex, "hex"));
    dekDecipher.setAAD(Buffer.from(keyId, "utf8"));
    dekDecipher.setAuthTag(rawWrapped.slice(-16));
    return Buffer.concat([dekDecipher.update(rawWrapped.slice(0, -16)), dekDecipher.final()]);
  }

  /**
   * The KEKs a record with this key id may have been wrapped under. Current
   * records have exactly one. Legacy records were salted with whatever
   * AWS_REGION was at the time, so try the configured region and the old
   * default.
   */
  private keksFor(keyId: string): Buffer[] {
    if (keyId.startsWith(KEY_SCHEME)) return [this.deriveKek(KEK_SALT, keyId)];
    const salts = [...new Set([this.config.region, LEGACY_DEFAULT_REGION])];
    return salts.map((salt) => this.deriveKek(salt, keyId));
  }

  /**
   * Derive a 256-bit Key Encryption Key (KEK) using HKDF-SHA256.
   * Refuses weak or static fallback keys.
   */
  private deriveKek(salt: string = KEK_SALT, keyId: string = this.currentKeyId()): Buffer {
    return Buffer.from(
      crypto.hkdfSync(
        "sha256",
        Buffer.from(masterKey(), "utf8"),
        Buffer.from(salt, "utf8"),
        Buffer.from(`pavdental-kek:${keyId}`, "utf8"),
        32
      )
    );
  }

  /**
   * Hash data for integrity verification
   */
  hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify data integrity using timing-safe comparison
   */
  verifyHash(data: string, expectedHash: string): boolean {
    const computed = Buffer.from(this.hash(data), "utf8");
    const target = Buffer.from(expectedHash, "utf8");
    if (computed.length !== target.length) return false;
    return crypto.timingSafeEqual(computed, target);
  }
}

export class ClinicalRecordEncryptionService {
  private encryptionService: EncryptionService;

  constructor(config: EncryptionConfig) {
    this.encryptionService = new EncryptionService(config);
  }

  async encryptClinicalRecord(record: unknown): Promise<EncryptedData> {
    const plaintext = JSON.stringify(record);
    return await this.encryptionService.encrypt(plaintext);
  }

  async decryptClinicalRecord(encryptedData: EncryptedData): Promise<unknown> {
    const plaintext = await this.encryptionService.decrypt(encryptedData);
    return JSON.parse(plaintext);
  }

  async encryptField(field: string): Promise<EncryptedData> {
    return await this.encryptionService.encrypt(field);
  }

  async decryptField(encryptedData: EncryptedData): Promise<string> {
    return await this.encryptionService.decrypt(encryptedData);
  }

  needsRewrap(encryptedData: EncryptedData): boolean {
    return this.encryptionService.needsRewrap(encryptedData);
  }

  async rewrapField(encryptedData: EncryptedData): Promise<EncryptedData> {
    return await this.encryptionService.rewrap(encryptedData);
  }
}

export class DocumentMetadataEncryptionService {
  private encryptionService: EncryptionService;

  constructor(config: EncryptionConfig) {
    this.encryptionService = new EncryptionService(config);
  }

  async encryptMetadata(metadata: unknown): Promise<EncryptedData> {
    const plaintext = JSON.stringify(metadata);
    return await this.encryptionService.encrypt(plaintext);
  }

  async decryptMetadata(encryptedData: EncryptedData): Promise<unknown> {
    const plaintext = await this.encryptionService.decrypt(encryptedData);
    return JSON.parse(plaintext);
  }
}

const encryptionConfig: EncryptionConfig = {
  keyId: env.kmsKeyId,
  region: process.env.AWS_REGION || "eu-west-2",
  algorithm: "aes-256-gcm",
};

export const encryptionService = new EncryptionService(encryptionConfig);
export const clinicalRecordEncryptionService = new ClinicalRecordEncryptionService(encryptionConfig);
export const documentMetadataEncryptionService = new DocumentMetadataEncryptionService(encryptionConfig);

/**
 * Type guard to check if a value is an encrypted envelope.
 */
export function isEncryptedEnvelope(value: unknown): value is EncryptedData {
  return (
    typeof value === "object" &&
    value !== null &&
    "ciphertext" in value &&
    "iv" in value &&
    "keyId" in value &&
    "algorithm" in value
  );
}

/**
 * Encrypt any clinical object or text into an EncryptedData envelope.
 */
export async function encryptField(value: unknown): Promise<EncryptedData> {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return clinicalRecordEncryptionService.encryptField(text);
}

/**
 * Transparently decrypt an encrypted envelope or return plaintext/unencrypted value.
 */
export async function decryptField<T = unknown>(value: unknown): Promise<T> {
  if (!value) return value as T;
  if (!isEncryptedEnvelope(value)) {
    return value as T;
  }
  const text = await clinicalRecordEncryptionService.decryptField(value);
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Transparently decrypt string fields (e.g., Message.body) that may be stored
 * as JSON-stringified EncryptedData envelopes or plain text.
 */
export async function decryptString(value: unknown): Promise<string> {
  if (typeof value !== "string" || !value) return (value as string) || "";
  if (value.startsWith("{") && value.includes('"ciphertext"')) {
    try {
      const parsed = JSON.parse(value);
      if (isEncryptedEnvelope(parsed)) {
        return await clinicalRecordEncryptionService.decryptField(parsed);
      }
    } catch {
      // not a JSON envelope, treat as plaintext
    }
  }
  return value;
}

/**
 * Encrypt sensitive fields (gateCode, accessNotes) within accessDetails object.
 */
export async function encryptAccessDetails(accessDetails: any): Promise<any> {
  if (!accessDetails || typeof accessDetails !== "object") return accessDetails;
  if (isEncryptedEnvelope(accessDetails)) return accessDetails;

  const encrypted = { ...accessDetails };
  if (accessDetails.gateCode && !isEncryptedEnvelope(accessDetails.gateCode)) {
    encrypted.gateCode = await encryptField(accessDetails.gateCode);
  }
  if (accessDetails.accessNotes && !isEncryptedEnvelope(accessDetails.accessNotes)) {
    encrypted.accessNotes = await encryptField(accessDetails.accessNotes);
  }
  return encrypted;
}

/** Keys of accessDetails that only the server writes (video room, van check-in). */
const SERVER_ACCESS_KEYS = ["roomName", "roomUrl", "checkedIn", "checkedInAt", "completedTasks"];

/**
 * Encrypt access details a client sent. Unlike encryptAccessDetails, nothing
 * the client sends is trusted as already encrypted: a ready-made envelope, or
 * a gateCode or accessNotes that isn't plain text, is refused (null), and
 * server-owned keys are dropped.
 */
export async function encryptClientAccessDetails(input: unknown): Promise<Record<string, unknown> | null> {
  if (!input || typeof input !== "object" || Array.isArray(input) || isEncryptedEnvelope(input)) return null;
  const details: Record<string, unknown> = { ...(input as Record<string, unknown>) };
  for (const key of SERVER_ACCESS_KEYS) delete details[key];
  for (const key of ["gateCode", "accessNotes"]) {
    if (details[key] === undefined || details[key] === null || details[key] === "") continue;
    if (typeof details[key] !== "string") return null;
    details[key] = await encryptField(details[key]);
  }
  return details;
}

/**
 * Decrypt sensitive fields (gateCode, accessNotes) within accessDetails object.
 */
export async function decryptAccessDetails(accessDetails: any): Promise<any> {
  if (!accessDetails) return accessDetails;
  if (isEncryptedEnvelope(accessDetails)) {
    return decryptField(accessDetails);
  }
  if (typeof accessDetails !== "object") return accessDetails;

  const decrypted = { ...accessDetails };
  if (accessDetails.gateCode && isEncryptedEnvelope(accessDetails.gateCode)) {
    try {
      decrypted.gateCode = await decryptField(accessDetails.gateCode);
    } catch {
      decrypted.gateCode = "[ENCRYPTED]";
    }
  }
  if (accessDetails.accessNotes && isEncryptedEnvelope(accessDetails.accessNotes)) {
    try {
      decrypted.accessNotes = await decryptField(accessDetails.accessNotes);
    } catch {
      decrypted.accessNotes = "[ENCRYPTED]";
    }
  }
  return decrypted;
}
