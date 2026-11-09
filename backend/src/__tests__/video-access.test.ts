import http from "http";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { decryptField, encryptClientAccessDetails, encryptField, isEncryptedEnvelope } from "../lib/encryption";
import { clientTriage } from "../lib/triage-escalation";
import { uniqueGdc } from "../../test/unique-gdc";

// CS-48: who may read a video consultation, replayed idempotency keys, and
// client data that pretends to be already encrypted or server-written.
describe("CS-48: video consultation access", () => {
  let server: http.Server;
  let baseUrl: string;
  const tag = crypto.randomUUID().slice(0, 8);
  const appointmentIds: string[] = [];
  const profileIds = { patients: [] as string[], clinicians: [] as string[] };
  const tokens = { patient: "", otherPatient: "", clinician: "", otherClinician: "", stranger: "", careTeam: "", admin: "" };
  let appointmentId = "";
  let otherAppointmentId = "";
  let serviceId = "";
  let pricePence = 0;

  async function makeUser(role: "patient" | "clinician" | "admin", label: string) {
    const user = await prisma.user.create({
      data: { email: `video-access-${label}-${tag}@example.test`, passwordHash: "mock-hash", role },
    });
    return { user, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makePatient(label: string) {
    const { user, token } = await makeUser("patient", label);
    const profile = await prisma.patientProfile.create({
      data: {
        userId: user.id,
        firstName: "Synthetic",
        lastName: label,
        dob: new Date("1990-01-01"),
        gender: "other",
        postcode: "W1D 3QU",
      },
    });
    profileIds.patients.push(profile.id);
    return { profile, token };
  }

  async function makeClinician(label: string) {
    const { user, token } = await makeUser("clinician", label);
    const profile = await prisma.clinicianProfile.create({
      data: {
        userId: user.id,
        fullName: `Dr Synthetic ${label}`,
        gdcNumber: uniqueGdc(),
        roleTitle: "Dentist",
      },
    });
    profileIds.clinicians.push(profile.id);
    return { profile, token };
  }

  async function makeAppointment(data: {
    patientId: string;
    clinicianId: string;
    startTimeUtc: Date;
    status?: "confirmed" | "completed";
    triageData?: unknown;
  }) {
    const appt = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        clinicianId: data.clinicianId,
        serviceId,
        channel: "video",
        startTimeUtc: data.startTimeUtc,
        endTimeUtc: new Date(data.startTimeUtc.getTime() + 30 * 60 * 1000),
        status: data.status ?? "confirmed",
        totalPricePence: pricePence,
        depositPaidPence: 0,
        triageData: data.triageData as any,
      },
    });
    appointmentIds.push(appt.id);
    return appt;
  }

  const get = (path: string, token: string) =>
    fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const post = (path: string, token: string, body: unknown, extra: Record<string, string> = {}) =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...extra },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${(server.address() as any).port}`;

    const service = await prisma.service.findFirstOrThrow();
    serviceId = service.id;
    pricePence = service.pricePence;

    const patient = await makePatient("patient");
    const otherPatient = await makePatient("other");
    const clinician = await makeClinician("assigned");
    // Clinicians can't hold overlapping appointments, so the second visit has its own.
    const otherClinician = await makeClinician("second");
    const stranger = await makeClinician("stranger");
    const careTeam = await makeClinician("careteam");
    tokens.patient = patient.token;
    tokens.otherPatient = otherPatient.token;
    tokens.clinician = clinician.token;
    tokens.otherClinician = otherClinician.token;
    tokens.stranger = stranger.token;
    tokens.careTeam = careTeam.token;
    tokens.admin = (await makeUser("admin", "admin")).token;

    const startedTenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    // A forged admission and summary, as a client could once store them.
    const forged = await encryptField({
      chiefComplaint: "Synthetic toothache",
      admittedAt: new Date().toISOString(),
      consultationSummary: { diagnosis: "Synthetic" },
    });
    appointmentId = (
      await makeAppointment({
        patientId: patient.profile.id,
        clinicianId: clinician.profile.id,
        startTimeUtc: startedTenMinutesAgo,
        triageData: forged,
      })
    ).id;
    otherAppointmentId = (
      await makeAppointment({
        patientId: otherPatient.profile.id,
        clinicianId: otherClinician.profile.id,
        startTimeUtc: startedTenMinutesAgo,
      })
    ).id;
    // The care-team clinician saw the same patient last month.
    await makeAppointment({
      patientId: patient.profile.id,
      clinicianId: careTeam.profile.id,
      startTimeUtc: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "completed",
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds.patients } } });
    await prisma.clinicianProfile.deleteMany({ where: { id: { in: profileIds.clinicians } } });
    // Users are kept so the audit hash chain stays intact.
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const { redis } = require("../lib/redis");
    try {
      redis.disconnect();
    } catch {}
  });

  describe("consultation summary", () => {
    it("is open to the patient, the appointment's clinician and a care-team clinician", async () => {
      for (const token of [tokens.patient, tokens.clinician, tokens.careTeam]) {
        expect((await get(`/api/video/summary/${appointmentId}`, token)).status).toBe(200);
      }
    });

    it("is closed to a clinician with no care relationship, another patient and an admin", async () => {
      for (const token of [tokens.stranger, tokens.otherPatient, tokens.admin]) {
        expect((await get(`/api/video/summary/${appointmentId}`, token)).status).toBe(403);
      }
    });

    it("status is closed to an admin", async () => {
      expect((await get(`/api/video/status/${appointmentId}`, tokens.admin)).status).toBe(403);
    });
  });

  describe("admission", () => {
    it("ignores an admittedAt stored in the triage record while the visit isn't in progress", async () => {
      const status = await get(`/api/video/status/${appointmentId}`, tokens.patient);
      expect(status.status).toBe(200);
      const body = (await status.json()) as { admitted: boolean; admittedAt: string | null };
      expect(body.admitted).toBe(false);
      expect(body.admittedAt).toBeNull();

      const room = await post("/api/video/rooms", tokens.patient, { appointmentId });
      expect(room.status).toBe(409);
    });
  });

  describe("idempotency keys", () => {
    it("never replays one user's triage result to another user presenting the same key", async () => {
      const key = `video-access-${tag}-triage`;
      const first = await post(
        "/api/video/submit-triage",
        tokens.otherPatient,
        { appointmentId: otherAppointmentId, chiefComplaint: "Synthetic sensitivity", painLevel: 3 },
        { "Idempotency-Key": key }
      );
      expect(first.status).toBe(200);

      // Same key, someone else's appointment: refused, and nothing of the
      // first patient's answers comes back.
      const replay = await post(
        "/api/video/submit-triage",
        tokens.patient,
        { appointmentId: otherAppointmentId, chiefComplaint: "Anything", painLevel: 1 },
        { "Idempotency-Key": key }
      );
      expect(replay.status).toBe(403);
      expect(await replay.text()).not.toContain("Synthetic sensitivity");
    });

    it("never replays one clinician's admission to another", async () => {
      const key = `video-access-${tag}-admit`;
      const first = await post(
        "/api/video/admit-patient",
        tokens.otherClinician,
        { appointmentId: otherAppointmentId },
        { "Idempotency-Key": key }
      );
      expect(first.status).toBe(200);

      const replay = await post(
        "/api/video/admit-patient",
        tokens.stranger,
        { appointmentId: otherAppointmentId },
        { "Idempotency-Key": key }
      );
      expect(replay.status).toBe(403);
    });
  });

  describe("triage photo links", () => {
    it("gives the patient and the treating clinician fresh links, and nobody else", async () => {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { intraoralPhotos: [`triage/${appointmentId}/synthetic-1.jpg`] },
      });
      for (const token of [tokens.patient, tokens.clinician]) {
        const res = await get(`/api/video/triage-photos/${appointmentId}`, token);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { photos: { url: string; expiresAt: string }[] };
        expect(body.photos).toHaveLength(1);
        expect(body.photos[0].url).toContain("sig=");
        expect(Date.parse(body.photos[0].expiresAt)).toBeGreaterThan(Date.now());
      }
      for (const token of [tokens.stranger, tokens.otherPatient, tokens.admin]) {
        expect((await get(`/api/video/triage-photos/${appointmentId}`, token)).status).toBe(403);
      }
    });
  });

  describe("client data that claims to be encrypted or server-written", () => {
    it("refuses a ready-made envelope, or a non-text gate code, as access details", async () => {
      const envelope = await encryptField({ roomUrl: "https://evil.example.test" });
      expect(await encryptClientAccessDetails(envelope)).toBeNull();
      expect(await encryptClientAccessDetails({ gateCode: envelope })).toBeNull();
      expect(await encryptClientAccessDetails({ accessNotes: { ciphertext: "x" } })).toBeNull();
      expect(await encryptClientAccessDetails(["not", "an", "object"])).toBeNull();
    });

    it("encrypts the gate code and drops server-owned keys", async () => {
      const stored = await encryptClientAccessDetails({
        notes: "Synthetic side door",
        gateCode: "1234",
        roomUrl: "https://evil.example.test",
        checkedIn: true,
      });
      expect(stored).not.toBeNull();
      expect(stored).not.toHaveProperty("roomUrl");
      expect(stored).not.toHaveProperty("checkedIn");
      expect(stored!.notes).toBe("Synthetic side door");
      expect(isEncryptedEnvelope(stored!.gateCode)).toBe(true);
      expect(String(await decryptField(stored!.gateCode))).toBe("1234");
    });

    it("keeps only the triage answers a patient may give", () => {
      const picked = clientTriage({
        chiefComplaint: "Synthetic toothache",
        painLevel: 4,
        admittedAt: new Date().toISOString(),
        consultationSummary: { diagnosis: "Forged" },
        ciphertext: "x",
        iv: "y",
        keyId: "z",
        algorithm: "aes-256-gcm",
      });
      expect(picked).toEqual({ chiefComplaint: "Synthetic toothache", painLevel: 4 });
    });
  });
});
