import { env } from "../config/env";
import { maskEmail, maskPhone, safeError } from "./log-safety";
import { prisma } from "./prisma";
import { isPlaceholderCredential } from "../config/placeholder";
import { formatEmailCode } from "./email-code";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendSmsOptions {
  to: string;
  body: string;
}

export interface PushNotificationMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
}

export class CommunicationService {
  private postmarkToken?: string;
  private fromEmail: string;
  private twilioSid?: string;
  private twilioToken?: string;
  private twilioFrom?: string;

  constructor() {
    this.postmarkToken = process.env.POSTMARK_SERVER_TOKEN?.trim();
    this.fromEmail = process.env.FROM_EMAIL?.trim() || "noreply@pavdental.com";
    this.twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    this.twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    this.twilioFrom = process.env.TWILIO_FROM_PHONE?.trim();
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    if (this.postmarkToken && !isPlaceholderCredential(this.postmarkToken) && !this.postmarkToken.startsWith("mock")) {
      try {
        const response = await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          signal: AbortSignal.timeout(5000),
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": this.postmarkToken,
          },
          body: JSON.stringify({
            From: this.fromEmail,
            To: options.to,
            Subject: options.subject,
            HtmlBody: options.html,
            TextBody: options.text,
            MessageStream: "outbound",
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as any;
          // Postmark's Message can echo the recipient; log the code only.
          console.error("[CommunicationService] Postmark error:", {
            status: response.status,
            errorCode: errorData?.ErrorCode,
            to: maskEmail(options.to),
          });
          return { success: false };
        }

        const data = await response.json() as any;
        return { success: true, messageId: data.MessageID };
      } catch (err) {
        console.error("[CommunicationService] Failed to send email via Postmark:", safeError(err));
        return { success: false };
      }
    }

    // No provider. Message bodies carry reset links, verification codes and
    // OTPs, so they are never logged (CS-1). When deployed this is a failure,
    // not a silent success.
    if (env.isProduction || env.isStaging) {
      console.error("[CommunicationService] Email not sent: POSTMARK_SERVER_TOKEN is not configured", {
        subject: options.subject,
        to: maskEmail(options.to),
      });
      return { success: false };
    }
    console.log("[Email Dispatch] (no provider, not sent)", { subject: options.subject, to: maskEmail(options.to) });
    return { success: true, messageId: `mock_email_${Date.now()}` };
  }

  async sendSms(options: SendSmsOptions): Promise<{ success: boolean; sid?: string }> {
    if (
      this.twilioSid &&
      this.twilioToken &&
      this.twilioFrom &&
      !isPlaceholderCredential(this.twilioSid) &&
      !isPlaceholderCredential(this.twilioToken) &&
      !this.twilioSid.startsWith("mock")
    ) {
      try {
        const auth = Buffer.from(`${this.twilioSid}:${this.twilioToken}`).toString("base64");
        const body = new URLSearchParams({
          From: this.twilioFrom,
          To: options.to,
          Body: options.body,
        });

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`,
          {
            method: "POST",
            signal: AbortSignal.timeout(5000),
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          }
        );

        if (!response.ok) {
          const errData = (await response.json().catch(() => ({}))) as any;
          console.error("[CommunicationService] Twilio error:", {
            status: response.status,
            errorCode: errData?.code,
            to: maskPhone(options.to),
          });
          return { success: false };
        }

        const data = await response.json() as any;
        return { success: true, sid: data.sid };
      } catch (err) {
        console.error("[CommunicationService] Failed to send SMS via Twilio:", safeError(err));
        return { success: false };
      }
    }

    // No provider: as for email, never log the body, and fail when deployed.
    if (env.isProduction || env.isStaging) {
      console.error("[CommunicationService] SMS not sent: Twilio is not configured", { to: maskPhone(options.to) });
      return { success: false };
    }
    console.log("[SMS Dispatch] (no provider, not sent)", { to: maskPhone(options.to) });
    return { success: true, sid: `mock_sms_${Date.now()}` };
  }

  async sendVerificationEmail(email: string, token: string, code?: string): Promise<boolean> {
    // With a short code, people type that; the long token only rides in the link.
    const shownCode = code ? formatEmailCode(code) : token;
    const appUrl = process.env.APP_URL || "http://localhost:8081";
    const verificationUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0D9488;">Pav Dental Account Verification</h2>
        <p>Thank you for registering with Pav Dental. Please verify your email address to access your dental records and consultations.</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0D9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #64748B; font-size: 13px;">Or enter this verification code in the app:</p>
        <p style="font-size: 28px; letter-spacing: 4px; font-weight: bold; color: #0F172A; margin: 8px 0 0;">${shownCode}</p>
        ${code ? '<p style="color: #64748B; font-size: 12px;">The code expires in 30 minutes.</p>' : ""}
        <p style="color: #94A3B8; font-size: 12px; margin-top: 40px;">If you did not create a Pav Dental account, please disregard this message.</p>
      </div>
    `;

    const text = `Pav Dental Account Verification\n\nPlease verify your email by opening:\n${verificationUrl}\n\nOr enter code: ${shownCode}\n\n${code ? "The code expires in 30 minutes. " : ""}The link expires in 24 hours.`;

    const result = await this.sendEmail({
      to: email,
      subject: "Verify your email - Pav Dental",
      html,
      text,
    });

    return result.success;
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const appUrl = process.env.APP_URL || "http://localhost:8081";
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0D9488;">Pav Dental Password Reset</h2>
        <p>A password reset was requested for your Pav Dental account.</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0D9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748B; font-size: 13px;">Or enter token: <strong>${token}</strong></p>
        <p style="color: #EF4444; font-size: 12px;">This reset link expires in 1 hour. If you did not request this, please contact support immediately.</p>
      </div>
    `;

    const text = `Pav Dental Password Reset\n\nReset your password at:\n${resetUrl}\n\nOr enter token: ${token}\n\nExpires in 1 hour.`;

    const result = await this.sendEmail({
      to: email,
      subject: "Reset your Pav Dental password",
      html,
      text,
    });

    return result.success;
  }

  /** A new staff member sets their own password from this link. */
  async sendStaffInviteEmail(email: string, token: string, roleLabel: string): Promise<boolean> {
    const appUrl = process.env.APP_URL || "http://localhost:8081";
    const setUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0D9488;">Welcome to Pav Dental</h2>
        <p>An account has been created for you as a ${roleLabel}. Choose a password to sign in to the Pav Dental app.</p>
        <p style="margin: 30px 0;">
          <a href="${setUrl}" style="background-color: #0D9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Set your password
          </a>
        </p>
        <p style="color: #64748B; font-size: 13px;">Or enter token: <strong>${token}</strong></p>
        <p style="color: #64748B; font-size: 12px;">This link expires in 72 hours. If you weren't expecting it, you can ignore this email.</p>
      </div>
    `;

    const text = `Welcome to Pav Dental\n\nAn account has been created for you as a ${roleLabel}. Set your password at:\n${setUrl}\n\nOr enter token: ${token}\n\nExpires in 72 hours.`;

    const result = await this.sendEmail({
      to: email,
      subject: "Set up your Pav Dental account",
      html,
      text,
    });

    return result.success;
  }

  async sendMfaCode(destination: string, code: string): Promise<boolean> {
    const isEmail = destination.includes("@");

    if (isEmail) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0D9488;">Pav Dental Security Code</h2>
          <p>Your two-factor authentication security code is:</p>
          <div style="background-color: #F1F5F9; padding: 16px; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #0F172A; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #64748B; font-size: 13px;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `;
      const text = `Your Pav Dental security code is ${code}. It expires in 5 minutes.`;

      const result = await this.sendEmail({
        to: destination,
        // Generic subject: subjects show on lock screens and in logs (CS-4).
        subject: "Your Pav Dental security code",
        html,
        text,
      });
      return result.success;
    } else {
      const body = `Your Pav Dental security code is ${code}. Expires in 5 minutes.`;
      const result = await this.sendSms({
        to: destination,
        body,
      });
      return result.success;
    }
  }

  async sendExpoPushNotifications(messages: PushNotificationMessage[]): Promise<{
    sentCount: number;
    failedCount: number;
    tickets?: any[];
  }> {
    if (messages.length === 0) {
      return { sentCount: 0, failedCount: 0, tickets: [] };
    }

    const CHUNK_SIZE = 100; // Expo maximum messages per batch
    let totalSent = 0;
    let totalFailed = 0;
    const allTickets: any[] = [];

    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);

      try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          signal: AbortSignal.timeout(10000),
          headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        if (!response.ok) {
          console.error("[CommunicationService] Expo push API returned status:", response.status);
          totalFailed += chunk.length;
          continue;
        }

        const resJson = (await response.json()) as any;
        const tickets = resJson.data || [];
        allTickets.push(...tickets);

        // Expo only accepts a message here; its receipt, fetched later by
        // checkPushReceipts, says whether Apple or Google delivered it (BE-09).
        const accepted = chunk.flatMap((message, j) =>
          tickets[j]?.status === "ok" && typeof tickets[j].id === "string" ? [{ id: tickets[j].id as string, token: message.to }] : []
        );
        if (accepted.length > 0) {
          await prisma.pushTicket
            .createMany({ data: accepted, skipDuplicates: true })
            .catch((err) => console.error("[CommunicationService] Failed to store push tickets:", safeError(err)));
        }

        for (let j = 0; j < chunk.length; j++) {
          const ticket = tickets[j];
          if (!ticket || ticket.status === "error") {
            totalFailed++;
            // PP-2 / CS-3: Deactivate dead tokens
            if (ticket?.details?.error === "DeviceNotRegistered") {
              const deadToken = chunk[j].to;
              await prisma.pushToken
                .updateMany({
                  where: { token: deadToken },
                  data: { active: false },
                })
                .catch((err) =>
                  console.error("[CommunicationService] Failed to deactivate dead token:", safeError(err))
                );
            }
          } else {
            totalSent++;
          }
        }
      } catch (err) {
        console.error("[CommunicationService] Error contacting Expo Push API:", safeError(err));
        totalFailed += chunk.length;
      }
    }

    return {
      sentCount: totalSent,
      failedCount: totalFailed,
      tickets: allTickets,
    };
  }

  /**
   * Polls receipts for push notification tickets and deactivates any tokens marked DeviceNotRegistered.
   */
  async checkExpoReceipts(ticketIds: string[], tokenByTicketId: Record<string, string> = {}): Promise<{
    okCount: number;
    errorCount: number;
    deactivatedTokens: string[];
    /** Tickets that have a receipt now; the rest aren't ready or weren't reached. */
    settledTicketIds: string[];
    /** Receipt error codes and how often each came back (no tokens or content). */
    errorsByCode: Record<string, number>;
  }> {
    const settledTicketIds: string[] = [];
    const errorsByCode: Record<string, number> = {};
    if (ticketIds.length === 0) return { okCount: 0, errorCount: 0, deactivatedTokens: [], settledTicketIds, errorsByCode };

    const CHUNK_SIZE = 300;
    let okCount = 0;
    let errorCount = 0;
    const deactivatedTokens: string[] = [];

    for (let i = 0; i < ticketIds.length; i += CHUNK_SIZE) {
      const chunk = ticketIds.slice(i, i + CHUNK_SIZE);
      try {
        const response = await fetch("https://exp.host/--/api/v2/push/getReceipts", {
          method: "POST",
          signal: AbortSignal.timeout(10000),
          headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: chunk }),
        });

        if (!response.ok) {
          errorCount += chunk.length;
          continue;
        }

        const resJson = (await response.json()) as any;
        const receipts = resJson.data || {};

        for (const ticketId of chunk) {
          const receipt = receipts[ticketId];
          if (!receipt) continue;
          settledTicketIds.push(ticketId);

          if (receipt.status === "ok") {
            okCount++;
          } else if (receipt.status === "error") {
            errorCount++;
            const code = typeof receipt.details?.error === "string" ? receipt.details.error : "Unknown";
            errorsByCode[code] = (errorsByCode[code] ?? 0) + 1;
            if (receipt.details?.error === "DeviceNotRegistered") {
              const token = tokenByTicketId[ticketId];
              if (token) {
                deactivatedTokens.push(token);
                await prisma.pushToken
                  .updateMany({
                    where: { token },
                    data: { active: false },
                  })
                  .catch(() => {});
              }
            }
          }
        }
      } catch (err) {
        console.error("[CommunicationService] Error checking Expo receipts:", safeError(err));
        errorCount += chunk.length;
      }
    }

    return { okCount, errorCount, deactivatedTokens, settledTicketIds, errorsByCode };
  }
}

export const communicationService = new CommunicationService();

