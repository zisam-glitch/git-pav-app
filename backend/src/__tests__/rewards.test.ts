import http from "http";
import crypto from "crypto";
import { awardMissedVisitPoints, awardVisitPoints, DEPOSIT_VOUCHER, POINTS_PER_COMPLETED_VISIT } from "../lib/rewards";

// CS-33 (decisions log #14): points come only from completed visits, once
// each, and 100 points buy £5 off a later deposit, used on one booking at a
// time. Runs against mock Stripe. Synthetic data only.
describe("rewards", () => {
  let server: http.Server;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  let signAccessToken: typeof import("../lib/jwt").signAccessToken;
  const tag = crypto.randomUUID().slice(0, 8);
  const userIds: string[] = [];
  const profileIds: string[] = [];
  const appointmentIds: string[] = [];
  let adminToken = "";
  let service: { id: string; depositPence: number };

  async function makeUser(role: "patient" | "admin", label: string) {
    const user = await prisma.user.create({
      data: { email: `${label}-${tag}@example.test`, passwordHash: "x", role },
    });
    userIds.push(user.id);
    return { userId: user.id, token: signAccessToken({ sub: user.id, role, sessionId: crypto.randomUUID() }) };
  }

  async function makePatient(label: string) {
    const { userId, token } = await makeUser("patient", label);
    const profile = await prisma.patientProfile.create({
      data: { userId, firstName: "Synthetic", lastName: "Patient" },
    });
    profileIds.push(profile.id);
    return { userId, profileId: profile.id, token };
  }

  async function appointment(patientId: string, status: "confirmed" | "completed" | "draft_hold", dayOffset: number) {
    const start = new Date(Date.now() + dayOffset * 86400000 + appointmentIds.length * 3600000);
    const appt = await prisma.appointment.create({
      data: {
        patientId,
        serviceId: service.id,
        channel: "clinic",
        startTimeUtc: start,
        endTimeUtc: new Date(start.getTime() + 1800000),
        status,
        holdExpiresAt: status === "draft_hold" ? new Date(Date.now() + 10 * 60000) : null,
        totalPricePence: 10000,
      },
    });
    appointmentIds.push(appt.id);
    return appt.id;
  }

  const send = (method: string, path: string, token: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }).then(async (r) => ({ status: r.status, body: (await r.json()) as any }));

  const pointsOf = async (userId: string) =>
    (await prisma.oralHealthMetric.findUnique({ where: { userId } }))?.pointsBalance ?? 0;

  beforeAll(async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const serverModule = require("../server");
    const app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    signAccessToken = require("../lib/jwt").signAccessToken;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3012, resolve));
    baseUrl = "http://localhost:3012";
    adminToken = (await makeUser("admin", "rewards-admin")).token;
    service = await prisma.service.findFirstOrThrow({
      where: { depositPence: { gt: DEPOSIT_VOUCHER.discountPence } },
      select: { id: true, depositPence: true },
    });
  });

  afterAll(async () => {
    await prisma.rewardRedemption.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
    await prisma.oralHealthMetric.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("awards points once when a visit is completed", async () => {
    const patient = await makePatient("visit");
    const id = await appointment(patient.profileId, "confirmed", -1);

    expect((await send("PATCH", `/api/admin/appointments/${id}/status`, adminToken, { status: "completed" })).status).toBe(200);
    expect(await pointsOf(patient.userId)).toBe(POINTS_PER_COMPLETED_VISIT);

    // Setting it again, or the catch-up sweep, does not pay twice.
    await send("PATCH", `/api/admin/appointments/${id}/status`, adminToken, { status: "completed" });
    await awardMissedVisitPoints();
    expect(await pointsOf(patient.userId)).toBe(POINTS_PER_COMPLETED_VISIT);
  });

  it("will not complete a visit that is still in the future, so no points and no way back", async () => {
    const patient = await makePatient("future");
    const id = await appointment(patient.profileId, "confirmed", 3);

    for (const status of ["completed", "in_progress"]) {
      const res = await send("PATCH", `/api/admin/appointments/${id}/status`, adminToken, { status });
      expect(res.status).toBe(400);
    }
    const unchanged = await prisma.appointment.findUniqueOrThrow({ where: { id } });
    expect(unchanged.status).toBe("confirmed");
    expect(await pointsOf(patient.userId)).toBe(0);

    // Cancelling a future visit is still allowed.
    expect((await send("PATCH", `/api/admin/appointments/${id}/status`, adminToken, { status: "cancelled" })).status).toBe(200);
  });

  it("catches up a completed visit that was never awarded", async () => {
    const patient = await makePatient("sweep");
    await appointment(patient.profileId, "completed", -2);
    await awardMissedVisitPoints(1000);
    expect(await pointsOf(patient.userId)).toBe(POINTS_PER_COMPLETED_VISIT);
  });

  it("credits nothing, and doesn't throw, when the visit is deleted mid-award", async () => {
    const patient = await makePatient("vanished");
    const id = await appointment(patient.profileId, "completed", -3);
    // The award reads the appointment, then it is erased before the insert.
    const read = prisma.appointment.findUnique.bind(prisma.appointment);
    const readThenErase = async (args: Parameters<typeof read>[0]) => {
      const row = await read(args);
      await prisma.appointment.delete({ where: { id } });
      return row;
    };
    const spy = jest
      .spyOn(prisma.appointment, "findUnique")
      .mockImplementationOnce(readThenErase as unknown as typeof prisma.appointment.findUnique);
    try {
      expect(await awardVisitPoints(id)).toBe("not_completed");
    } finally {
      spy.mockRestore();
    }
    expect(await pointsOf(patient.userId)).toBe(0);
  });

  it("offers only the deposit voucher and refuses it without enough points", async () => {
    const patient = await makePatient("catalogue");
    const rewards = await send("GET", "/api/rewards", patient.token);
    expect(rewards.body.catalog.map((c: any) => c.id)).toEqual([DEPOSIT_VOUCHER.id]);
    expect(rewards.body.vouchers).toEqual([]);
    expect((await send("POST", "/api/rewards/redeem", patient.token, { rewardId: DEPOSIT_VOUCHER.id })).status).toBe(422);
  });

  it("takes a voucher off one deposit, and frees it if that booking is cancelled", async () => {
    const patient = await makePatient("voucher");
    await prisma.oralHealthMetric.create({ data: { userId: patient.userId, pointsBalance: DEPOSIT_VOUCHER.pointsCost } });

    const redeemed = await send("POST", "/api/rewards/redeem", patient.token, { rewardId: DEPOSIT_VOUCHER.id });
    expect(redeemed.status).toBe(201);
    expect(redeemed.body.pointsBalance).toBe(0);
    const code = redeemed.body.voucherCode as string;
    expect((await send("GET", "/api/rewards", patient.token)).body.vouchers.map((v: any) => v.voucherCode)).toEqual([code]);

    const first = await appointment(patient.profileId, "draft_hold", 5);
    const intent = await send("POST", "/api/payments/create-intent", patient.token, { appointmentId: first, voucherCode: code });
    expect(intent.status).toBe(200);
    expect(intent.body).toMatchObject({
      amountPence: service.depositPence - DEPOSIT_VOUCHER.discountPence,
      discountPence: DEPOSIT_VOUCHER.discountPence,
    });

    // The same voucher can't go on a second booking while the first is live.
    const second = await appointment(patient.profileId, "draft_hold", 6);
    expect((await send("POST", "/api/payments/create-intent", patient.token, { appointmentId: second, voucherCode: code })).status).toBe(422);

    // Paying records the discounted deposit.
    const confirmed = await send("PATCH", `/api/booking/appointments/${first}/confirm`, patient.token, {});
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.depositPaidPence).toBe(service.depositPence - DEPOSIT_VOUCHER.discountPence);
    expect((await send("GET", "/api/rewards", patient.token)).body.vouchers).toEqual([]);

    // Cancelling the booking gives the voucher back for the next one.
    expect((await send("POST", `/api/booking/appointments/${first}/cancel-with-refund`, patient.token)).status).toBe(200);
    const retry = await send("POST", "/api/payments/create-intent", patient.token, { appointmentId: second, voucherCode: code });
    expect(retry.status).toBe(200);
    expect(retry.body.discountPence).toBe(DEPOSIT_VOUCHER.discountPence);
  });

  it("refuses another patient's voucher", async () => {
    const owner = await makePatient("voucher-owner");
    const other = await makePatient("voucher-other");
    await prisma.oralHealthMetric.create({ data: { userId: owner.userId, pointsBalance: DEPOSIT_VOUCHER.pointsCost } });
    const { voucherCode } = (await send("POST", "/api/rewards/redeem", owner.token, { rewardId: DEPOSIT_VOUCHER.id })).body;
    const hold = await appointment(other.profileId, "draft_hold", 7);
    expect((await send("POST", "/api/payments/create-intent", other.token, { appointmentId: hold, voucherCode })).status).toBe(422);
  });

  it("prevents points farming: self-reported brushing log never grants points (RW-2)", async () => {
    const patient = await makePatient("brushing-farming");
    const initialPoints = await pointsOf(patient.userId);
    expect(initialPoints).toBe(0);

    for (let i = 0; i < 5; i++) {
      const logRes = await send("POST", "/api/rewards/brushing-log", patient.token, {
        day: "Mon",
        session: "am",
        durationSec: 120,
      });
      expect(logRes.status).toBe(200);
      expect(logRes.body.pointsBalance).toBe(0);
    }

    const finalPoints = await pointsOf(patient.userId);
    expect(finalPoints).toBe(0);
  });

  it("refuses redemption of non-existent reward items", async () => {
    const patient = await makePatient("invalid-reward");
    const res = await send("POST", "/api/rewards/redeem", patient.token, { rewardId: "nonexistent-item" });
    expect(res.status).toBe(404);
  });

  it("enforces financing decision (FN-1): in-app approval retired (410) and links to external provider", async () => {
    const patient = await makePatient("finance-test");
    const applyRes = await send("POST", "/api/financing/apply", patient.token, { amountPence: 20000 });
    expect(applyRes.status).toBe(410);
    expect(applyRes.body.financeInfoUrl).toBeDefined();

    const getRes = await send("GET", "/api/financing", patient.token);
    expect(getRes.status).toBe(200);
    expect(getRes.body.financeInfoUrl).toBeDefined();
  });
});
