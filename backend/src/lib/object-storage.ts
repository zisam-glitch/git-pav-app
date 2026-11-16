/**
 * Object Storage Service (S3-Compatible & Durable Local Disk Storage)
 *
 * Provides binary persistence for clinical triage photos, radiographs,
 * signed treatment plans, and GDPR Subject Access Request (SAR) bundles.
 * Uses HMAC-SHA256 time-limited presigned URLs for secure clinical access.
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { deriveSubKey } from "./encryption";

export interface StorageConfig {
  provider: "s3" | "cloudinary" | "local";
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  apiKey?: string;
  uploadPath?: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  sha256: string;
}

export interface DownloadResult {
  key: string;
  buffer: Buffer;
  contentType: string;
  size: number;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
  signature: string;
}

export class ObjectStorage {
  private config: StorageConfig;
  private s3Client?: S3Client;
  private uploadDir: string;

  constructor(config: StorageConfig) {
    this.config = config;
    this.uploadDir = path.resolve(process.cwd(), config.uploadPath || "./uploads");

    // OS-1: In staging and production, refuse to boot without real storage config. Never silently write to local disk.
    const isProdOrStaging = env.isProduction || env.isStaging || env.isDeployedRuntime;

    if (isProdOrStaging && config.provider === "local") {
      throw new Error(
        "CRITICAL: Staging and Production must not use local object storage. Configure S3/R2 storage."
      );
    }

    if (config.provider === "s3") {
      if (!config.bucket) {
        throw new Error("CRITICAL: S3_BUCKET_NAME must be configured when S3 provider is used.");
      }
      const clientConfig: any = {
        region: config.region || "eu-west-2",
        forcePathStyle: true,
      };
      if (config.endpoint) {
        clientConfig.endpoint = config.endpoint;
      }
      if (config.accessKeyId && config.secretAccessKey) {
        clientConfig.credentials = {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        };
      }
      this.s3Client = new S3Client(clientConfig);
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/\.\./g, "").replace(/^\/+/, "");
  }

  /**
   * Persist binary data to S3 or durable local disk storage.
   */
  async upload(
    rawKey: string,
    file: Buffer | Uint8Array | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    const key = this.sanitizeKey(rawKey);
    const fileBuffer = Buffer.isBuffer(file)
      ? file
      : typeof file === "string"
        ? Buffer.from(file, "utf8")
        : Buffer.from(file);
    const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    if (this.config.provider === "s3") {
      if (!this.s3Client || !this.config.bucket) {
        throw new Error("CRITICAL: S3 client or bucket is not configured for upload");
      }
      // OS-2: Enforce AES256 server-side encryption at rest
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ServerSideEncryption: "AES256",
        Metadata: { ...metadata, sha256 },
      });
      await this.s3Client.send(command);
      const signed = await this.getSignedUrl(key, 900);
      return {
        key,
        url: signed.url,
        size: fileBuffer.length,
        contentType,
        sha256,
      };
    }

    // Durable local disk storage for development/test deployments
    const fullPath = path.join(this.uploadDir, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);
    await fs.writeFile(
      `${fullPath}.meta.json`,
      JSON.stringify({ contentType, size: fileBuffer.length, sha256, metadata, createdAt: new Date().toISOString() })
    );

    const signed = await this.getSignedUrl(key, 900);
    return {
      key,
      url: signed.url,
      size: fileBuffer.length,
      contentType,
      sha256,
    };
  }

  /**
   * Download binary file from storage
   */
  async download(rawKey: string): Promise<DownloadResult> {
    const key = this.sanitizeKey(rawKey);

    if (this.config.provider === "s3") {
      if (!this.s3Client || !this.config.bucket) {
        throw new Error("CRITICAL: S3 client or bucket is not configured for download");
      }
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      if (!response.Body) throw new Error("Empty object body from S3");
      const byteArray = await response.Body.transformToByteArray();
      const buffer = Buffer.from(byteArray);
      return {
        key,
        buffer,
        contentType: response.ContentType || "application/octet-stream",
        size: buffer.length,
      };
    }

    const fullPath = path.join(this.uploadDir, key);
    const buffer = await fs.readFile(fullPath);
    let contentType = "application/octet-stream";
    try {
      const metaRaw = await fs.readFile(`${fullPath}.meta.json`, "utf8");
      const meta = JSON.parse(metaRaw);
      if (meta.contentType) contentType = meta.contentType;
    } catch {}

    return {
      key,
      buffer,
      contentType,
      size: buffer.length,
    };
  }

  /**
   * Delete a file from storage
   */
  async delete(rawKey: string): Promise<void> {
    const key = this.sanitizeKey(rawKey);
    if (this.config.provider === "s3") {
      if (!this.s3Client || !this.config.bucket) {
        throw new Error("CRITICAL: S3 client or bucket is not configured for delete");
      }
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return;
    }

    const fullPath = path.join(this.uploadDir, key);
    await fs.unlink(fullPath).catch(() => {});
    await fs.unlink(`${fullPath}.meta.json`).catch(() => {});
  }

  /**
   * Generate an HMAC-SHA256 authenticated presigned URL with strict TTL
   */
  async getSignedUrl(rawKey: string, expiresInSeconds: number = 900): Promise<SignedUrlResult> {
    const key = this.sanitizeKey(rawKey);
    const expiresAtMs = Date.now() + expiresInSeconds * 1000;
    const expiresAt = new Date(expiresAtMs);

    const payload = `${key}:${expiresAtMs}`;
    const signature = crypto
      .createHmac("sha256", deriveSubKey("signed-url:v1"))
      .update(payload)
      .digest("hex");

    const baseUrl = (
      env.apiBaseUrl ||
      `http://localhost:${env.port || 3000}`
    ).replace(/\/+$/, "");

    const url = `${baseUrl}/api/patients/documents/stream/${encodeURI(key)}?expires=${expiresAtMs}&sig=${signature}`;
    return { url, expiresAt, signature };
  }

  /**
   * Verify a presigned URL's HMAC-SHA256 signature and expiration
   */
  verifySignedUrl(rawKey: string, expiresAtMs: number, signature: string): boolean {
    if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
      return false;
    }
    const key = this.sanitizeKey(rawKey);
    const payload = `${key}:${expiresAtMs}`;
    const expected = crypto
      .createHmac("sha256", deriveSubKey("signed-url:v1"))
      .update(payload)
      .digest("hex");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  async exists(rawKey: string): Promise<boolean> {
    const key = this.sanitizeKey(rawKey);
    if (this.config.provider === "s3") {
      if (!this.s3Client || !this.config.bucket) {
        throw new Error("CRITICAL: S3 client or bucket is not configured for exists check");
      }
      try {
        await this.s3Client.send(
          new HeadObjectCommand({ Bucket: this.config.bucket, Key: key })
        );
        return true;
      } catch {
        return false;
      }
    }
    try {
      await fs.access(path.join(this.uploadDir, key));
      return true;
    } catch {
      return false;
    }
  }
}

export function createStorageClient(config: StorageConfig): ObjectStorage {
  return new ObjectStorage(config);
}

export const objectStorage = createStorageClient({
  provider: env.s3BucketName ? "s3" : "local",
  endpoint: env.s3Endpoint,
  bucket: env.s3BucketName,
  region: env.awsRegion,
  accessKeyId: env.awsAccessKeyId,
  secretAccessKey: env.awsSecretAccessKey,
  uploadPath: "./uploads",
});

export const developmentStorage = objectStorage;
