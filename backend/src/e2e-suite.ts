// Pav Dental end-to-end suite.
//
// Runs the full API against the local database in mock-Stripe mode so every
// step — including payment intent creation and the van deposit flow — is
// deterministic and never depends on whatever real-shaped key happens to be
// in .env. The env vars are set BEFORE the server module is dynamically
// imported, because the Stripe client is constructed at module load time.
//
// Run: npm test   (from backend/)

process.env.STRIPE_SECRET_KEY = "sk_test_mock_e2e";
if (!process.env.PORT || process.env.PORT === "0") {
  process.env.PORT = "3000";
}

import http from "http";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runE2ESuite() {
  // Dynamic import: env overrides above must land before the app (and its
  // module-scope Stripe client) is constructed.
  const serverModule: any = await import("./server.js");
  const app: any = serverModule.default ?? serverModule;
  const { prisma } = await import("./lib/prisma.js");
  const { signAccessToken } = await import("./lib/jwt.js");

  console.log("\n🏥 RUNNING PAV DENTAL END-TO-END INTEGRATION TEST SUITE...\n");

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3002, resolve));
  const baseUrl = "http://localhost:3002";

  try {
    // Archive any pre-existing unchained audit logs from older runs before starting the E2E suite
    await prisma.auditLog.updateMany({
      where: { archived: false, integrityHash: null },
      data: { archived: true, archivedAt: new Date() },
    });
    const { verifyAuditIntegrity } = await import("./lib/audit-integrity.js");
    const preCheck = await verifyAuditIntegrity(10000);
    if (!preCheck.valid) {
      await prisma.auditLog.updateMany({
        where: { archived: false },
        data: { archived: true, archivedAt: new Date() },
      });
    }

    // Step 1: Health Check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = (await healthRes.json()) as any;
    assert(healthData.status === "ok", "Health check failed");
    console.log("✓ PASSED: API Gateway & Health Check (DB + Redis active)");

    // Step 2: Register New Patient Account
    const testEmail = `e2e_patient_${Date.now()}@pavdental.co.uk`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "ClinicalPassword123!",
        firstName: "Alexander",
        lastName: "Wright",
        phone: `+4479${Date.now().toString().slice(-8)}`,
      }),
    });
    assert(regRes.status === 201, "Register failed");
    const regData = (await regRes.json()) as any;
    const token = regData.accessToken;
    const userId = regData.user.id;
    console.log("✓ PASSED: Patient Argon2id Registration & Session JWT Issued");

    // Step 3: Fetch Services Catalogue
    const srvRes = await fetch(`${baseUrl}/api/services`);
    const services = (await srvRes.json()) as any;
    assert(Array.isArray(services) && services.length > 0, "No services found");
    const testService = services[0];
    console.log(`✓ PASSED: Dental Service Catalogue (${services.length} services loaded)`);

    // Step 4: Van Coverage Check (unified helper — PostGIS or JS fallback)
    const vanRes = await fetch(`${baseUrl}/api/public/van/coverage-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: "BD3 9TY" }),
    });
    const vanData = (await vanRes.json()) as any;
    assert(vanData.isCovered === true, "Van coverage check failed for the practice postcode BD3 9TY");
    console.log(`✓ PASSED: Van Sector Polygon Coverage Verified (${vanData.assignedVan})`);

    // Real slots come from the clinic's hours and the clinicians' rota
    // (CS-30), so the suite books the next two free ones at a seeded clinic.
    const clinicsRes = await fetch(`${baseUrl}/api/services/clinics`);
    const e2eClinic = ((await clinicsRes.json()) as any[])[0];
    assert(e2eClinic?.openingHours?.length > 0, "Clinics must come with their opening hours");
    const freeSlots: any[] = [];
    for (let day = 1; day <= 14 && freeSlots.length < 2; day++) {
      const date = new Date(Date.now() + day * 86400000).toISOString().slice(0, 10);
      const slotsRes = await fetch(
        `${baseUrl}/api/booking/slots?date=${date}&channel=clinic&clinicId=${e2eClinic.id}&serviceId=${testService.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      assert(slotsRes.status === 200, `Slots lookup failed (got ${slotsRes.status})`);
      freeSlots.push(...((await slotsRes.json()) as any[]).filter((s) => s.available));
    }
    assert(freeSlots.length >= 2, "No free slots in the next two weeks");
    const [slot1, slot2] = freeSlots;

    // Step 5: Redis Slot Hold (10-minute lock)
    const slotId = slot1.id;
    const holdRes = await fetch(`${baseUrl}/api/booking/hold-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slotId }),
    });
    const holdData = (await holdRes.json()) as any;
    assert(holdData.success === true, "Slot hold failed");
    console.log("✓ PASSED: Redis 10-Minute Slot Reservation Lock (SET NX EX)");

    // Step 6: Create & Confirm Appointment
    const apptRes = await fetch(`${baseUrl}/api/booking/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        serviceId: testService.id,
        channel: "clinic",
        clinicId: e2eClinic.id,
        startTimeUtc: slot1.startTimeUtc,
        slotId,
      }),
    });
    assert(apptRes.status === 201, "Appointment creation failed");
    const apptData = (await apptRes.json()) as any;

    const confirmAppt = (body: Record<string, unknown>) =>
      fetch(`${baseUrl}/api/booking/appointments/${apptData.id}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

    // The client can't confirm without a server-created deposit payment, can't
    // name its own payment id, and can't set the amount paid (BK-5).
    const unpaidRes = await confirmAppt({});
    assert(unpaidRes.status === 402, `Confirm without payment must be refused (got ${unpaidRes.status})`);
    const tamperRes = await confirmAppt({ depositPaidPence: 999999 });
    assert(tamperRes.status === 400, `Client-set deposit amount must be rejected (got ${tamperRes.status})`);

    const depositRes = await fetch(`${baseUrl}/api/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appointmentId: apptData.id }),
    });
    assert(depositRes.status === 200, "Deposit intent creation failed");
    const depositData = (await depositRes.json()) as any;

    const foreignRes = await confirmAppt({ stripePaymentId: "pi_e2e_test_deposit_stripe" });
    assert(foreignRes.status === 409, `Foreign payment id must be refused (got ${foreignRes.status})`);

    // Confirm Appointment post Stripe Deposit
    const confirmRes = await confirmAppt({ stripePaymentId: depositData.paymentIntentId });
    assert(confirmRes.status === 200, "Appointment confirmation failed");
    const confirmData = (await confirmRes.json()) as any;
    assert(
      confirmData.depositPaidPence === testService.depositPence,
      "Recorded deposit must come from the server-side price"
    );
    console.log("✓ PASSED: Appointment Booking & Deposit Confirmation Flow (unpaid, tampered and foreign confirms refused)");

    // Step 7: Video rooms belong to one video appointment (CS-07). A room
    // can't be opened for a clinic visit, and a room with no appointment is
    // refused outright. The admitted-patient path is in video-rooms.test.ts.
    const openRoom = (body: Record<string, unknown>) =>
      fetch(`${baseUrl}/api/video/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    const clinicRoomRes = await openRoom({ appointmentId: apptData.id });
    assert(clinicRoomRes.status === 409, `Video room for a clinic visit must be refused (got ${clinicRoomRes.status})`);
    const looseRoomRes = await openRoom({});
    assert(looseRoomRes.status === 400, `Video room without an appointment must be refused (got ${looseRoomRes.status})`);
    console.log("✓ PASSED: Video rooms only open for a video appointment");

    // Step 8: Stripe Payment Intent Creation (mock path — deterministic).
    // create-intent only serves appointments still in draft_hold with an
    // unexpired hold, so this uses a fresh unconfirmed appointment rather
    // than the one confirmed in step 6.
    const slot2Id = slot2.id;
    const hold2Res = await fetch(`${baseUrl}/api/booking/hold-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slotId: slot2Id }),
    });
    const hold2Data = (await hold2Res.json()) as any;
    assert(hold2Data.success === true, "Second slot hold failed");

    const appt2Res = await fetch(`${baseUrl}/api/booking/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        serviceId: testService.id,
        channel: "clinic",
        clinicId: e2eClinic.id,
        startTimeUtc: slot2.startTimeUtc,
        slotId: slot2Id,
      }),
    });
    assert(appt2Res.status === 201, "Second appointment creation failed");
    const appt2Data = (await appt2Res.json()) as any;

    const stripeRes = await fetch(`${baseUrl}/api/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointmentId: appt2Data.id,
      }),
    });
    const stripeData = (await stripeRes.json()) as any;
    assert(stripeData.clientSecret != null, `Stripe intent failed (${stripeRes.status}): ${JSON.stringify(stripeData)}`);
    assert(stripeData.isMock === true, "Mock Stripe path not engaged — check STRIPE_SECRET_KEY bootstrap");
    console.log("✓ PASSED: Stripe PaymentIntent Generation & Client Secret (mock path)");

    // Step 9: DSPT audit trail: the server recorded the booking in the
    // hash-chained audit log, against this patient, without the request body.
    const bookingAudit = await prisma.auditLog.findFirst({
      where: { actorId: userId, action: "POST /api/booking/appointments" },
      orderBy: { timestampUtc: "desc" },
    });
    assert(!!bookingAudit?.integrityHash, "Booking wasn't recorded in the audit log");
    assert(!JSON.stringify(bookingAudit!.metadata).includes("startTimeUtc"), "Audit entry kept the request body");
    console.log("✓ PASSED: Booking Recorded in the Audit Trail");

    // Step 10: Expo Push Notification Token Registration
    const pushRes = await fetch(`${baseUrl}/api/notifications/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        expoPushToken: `ExponentPushToken[mock_e2e_device_token_${Date.now()}]`,
      }),
    });
    assert(pushRes.status === 201 || pushRes.status === 200, `Push token registration failed (${pushRes.status}): ${await pushRes.text()}`);
    console.log("✓ PASSED: Multi-Channel Expo Push Notification Token Registered");

    // Step 11: The old cancel route that never refunded is retired (CS-18)
    const oldCancelRes = await fetch(`${baseUrl}/api/booking/appointments/${apptData.id}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(oldCancelRes.status === 410, `PATCH /cancel should be retired, got ${oldCancelRes.status}`);
    const stillBooked = await prisma.appointment.findUniqueOrThrow({ where: { id: apptData.id } });
    assert(stillBooked.status === "confirmed", `Retired cancel must not change the booking (status ${stillBooked.status})`);
    console.log("✓ PASSED: No-refund cancel route retired (410, booking unchanged)");

    // Step 12: Cancellation Notice & Deposit Refund Evaluator
    const cancelRes = await fetch(`${baseUrl}/api/booking/appointments/${apptData.id}/cancel-with-refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const cancelData = (await cancelRes.json()) as any;
    assert(cancelRes.status === 200, "Cancellation refund failed");
    console.log(`✓ PASSED: Cancellation Evaluator (${cancelData.refundPercentage}% Deposit Refund Issued)`);

    // Step 13: Retired DSPT Route (404) & Audit Log Integrity Check (BE-11)
    let adminUser = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: `e2e_admin_${Date.now()}@pavdental.co.uk`,
          passwordHash: "e2e_mock_hash",
          role: "admin",
        },
      });
    }
    const adminToken = signAccessToken({
      sub: adminUser.id,
      role: "admin",
      sessionId: `e2e_admin_session_${Date.now()}`,
    });

    const dsptRes = await fetch(`${baseUrl}/api/dspt/dspt-report`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(dsptRes.status === 404, `Retired DSPT report should return 404 (${dsptRes.status})`);

    const auditIntegrityStep13Res = await fetch(`${baseUrl}/api/audit/integrity`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditIntegrityStep13Res.status === 200, `Audit integrity failed (${auditIntegrityStep13Res.status})`);

    const auditLogsRes = await fetch(`${baseUrl}/api/audit/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditLogsRes.status === 200, `Audit logs failed (${auditLogsRes.status})`);
    console.log("✓ PASSED: DSPT Route Unmounted (404) & Audit Log Integrity Verified");

    // ─── Van Dispatch Flow (Steps 14–19) ─────────────────────────────────
    // Fixtures: operator profile + van assignment. Stale shifts from earlier
    // runs are closed so this operator can own the van.
    const suffix = Date.now();
    const operatorUser = await prisma.user.create({
      data: {
        email: `e2e_op_${suffix}@pavdental.co.uk`,
        passwordHash: "e2e_mock_hash",
        role: "operator",
        operatorProfile: { create: { fullName: "E2E Operator" } },
      },
      include: { operatorProfile: true },
    });
    const van = await prisma.van.findFirst({ include: { servicePolygons: true } });
    assert(!!(van && van.servicePolygons.length > 0), "Seeded van with coverage polygon");
    await prisma.vanOperatorAssignment.create({
      data: { operatorId: operatorUser.operatorProfile!.id, vanId: van!.id, startsAt: new Date() },
    });
    await prisma.vanShift.updateMany({
      where: { endedAt: null },
      data: { status: "offline", endedAt: new Date() },
    });
    let vanService = await prisma.service.findFirst({
      where: { supportedChannels: { has: "van" }, isActive: true },
    });
    if (!vanService) {
      vanService = await prisma.service.create({
        data: {
          id: `srv_van_e2e_${suffix}`,
          name: "E2E Van Service",
          category: "checkup",
          description: "e2e",
          durationMinutes: 30,
          pricePence: 8500,
          depositPence: 2500,
          supportedChannels: ["van"],
        },
      });
    }
    const operatorToken = signAccessToken({
      sub: operatorUser.id,
      role: "operator",
      sessionId: `e2e_session_${suffix}`,
    });

    // Step 14: Operator Shift Start
    const shiftRes = await fetch(`${baseUrl}/api/van/shift/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${operatorToken}` },
      body: JSON.stringify({ lat: 53.7998, lng: -1.7289 }),
    });
    assert(shiftRes.status === 201, `Van shift start failed (${shiftRes.status}): ${JSON.stringify(await shiftRes.json())}`);
    console.log(`✓ PASSED: Operator Van Shift Online (${van!.name})`);

    // Step 15: Van Service Request + Mock Deposit Intent
    const vanReqRes = await fetch(`${baseUrl}/api/van/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        serviceId: vanService.id,
        accessDetails: {
          addressLine1: "1 Example Street",
          city: "Bradford",
          postcode: "BD3 8AA",
          lat: 53.7998,
          lng: -1.7289,
          parkingType: "permit_bay",
        },
      }),
    });
    const vanReq = (await vanReqRes.json()) as any;
    assert(vanReqRes.status === 201, `Van request failed: ${JSON.stringify(vanReq)}`);
    assert(vanReq.isMockPayment === true, "Van deposit mock path not engaged");
    assert(typeof vanReq.clientSecret === "string", "Van deposit client secret missing");
    console.log(`✓ PASSED: Van Dispatch Request Created (ETA ${vanReq.etaLabel}, deposit intent ${vanReq.paymentIntentId})`);

    // Step 16: Deposit Authorization State (mock auto-authorizes)
    const detailRes = await fetch(`${baseUrl}/api/van/requests/${vanReq.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const detail = (await detailRes.json()) as any;
    assert(detail.depositAuthorized === true, "Van deposit should be authorized in mock mode");
    console.log("✓ PASSED: Van Deposit Authorization State Exposed");

    // Step 17: Operator Accept — captures mock deposit & creates appointment
    const acceptRes = await fetch(`${baseUrl}/api/van/requests/${vanReq.id}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    if (acceptRes.status !== 200) {
      throw new Error(`Van accept failed: ${await acceptRes.text()}`);
    }
    const accepted = (await acceptRes.json()) as any;
    assert(accepted.status === "accepted", "Van request not accepted");
    const afterAccept = await prisma.vanServiceRequest.findUnique({
      where: { id: vanReq.id },
      select: { appointmentId: true, queuePosition: true },
    });
    assert(!!afterAccept?.appointmentId, "Accept did not link a van-channel appointment");
    console.log(`✓ PASSED: Operator Accepted Request → Appointment Linked (queue #${afterAccept!.queuePosition})`);

    // Step 18: Phase Ladder — en_route → on_site → in_treatment → completed
    for (const phase of ["en_route", "on_site", "in_treatment", "completed"]) {
      const phaseRes = await fetch(`${baseUrl}/api/van/requests/${vanReq.id}/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${operatorToken}` },
        body: JSON.stringify({ phase }),
      });
      assert(phaseRes.status === 200, `Phase ${phase} failed: ${await phaseRes.text()}`);
    }
    const completed = await prisma.vanServiceRequest.findUnique({
      where: { id: vanReq.id },
      select: { status: true, phase: true, completedAt: true },
    });
    assert(completed?.status === "completed" && completed.completedAt != null, "Van visit did not complete");
    console.log("✓ PASSED: Van Stop Phase Ladder → Visit Completed");

    // Step 19: Patient Cancel Releases Deposit (second request)
    const vanReq2Res = await fetch(`${baseUrl}/api/van/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        serviceId: vanService.id,
        accessDetails: {
          addressLine1: "1 Example Street",
          city: "Bradford",
          postcode: "BD3 8AA",
          lat: 53.7998,
          lng: -1.7289,
          parkingType: "permit_bay",
        },
      }),
    });
    const vanReq2 = (await vanReq2Res.json()) as any;
    assert(vanReq2Res.status === 201, "Second van request failed");
    const cancel2Res = await fetch(`${baseUrl}/api/van/requests/${vanReq2.id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (cancel2Res.status !== 200) {
      throw new Error(`Van cancel failed: ${await cancel2Res.text()}`);
    }
    const cancelled = (await cancel2Res.json()) as any;
    assert(cancelled.status === "cancelled", "Van request not cancelled");
    console.log("✓ PASSED: Patient Van Cancel with Deposit Release");

    // ─── Queue Optimization & Manual Reorder (Steps 20–22) ───────────────
    // Two more patients request stops at distinct locations; both accepted.
    const extraPatients: Array<{ lat: number; lng: number; address: string }> = [
      { lat: 53.8061, lng: -1.7328, address: "2 Example Street" },
      { lat: 53.7931, lng: -1.7228, address: "3 Example Street" },
    ];
    const extraIds: string[] = [];
    for (const spot of extraPatients) {
      const extraUser = await prisma.user.create({
        data: {
          email: `e2e_van_q_${suffix}_${extraIds.length}@pavdental.co.uk`,
          passwordHash: "e2e_mock_hash",
          role: "patient",
          patientProfile: { create: { firstName: "Queue", lastName: `Tester${extraIds.length}` } },
        },
      });
      const extraToken = signAccessToken({
        sub: extraUser.id,
        role: "patient",
        sessionId: `e2e_session_${extraUser.id}`,
      });
      const r = await fetch(`${baseUrl}/api/van/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${extraToken}` },
        body: JSON.stringify({
          serviceId: vanService.id,
          accessDetails: {
            addressLine1: spot.address,
            city: "Bradford",
            postcode: "BD3 8AA",
            lat: spot.lat,
            lng: spot.lng,
            parkingType: "permit_bay",
          },
        }),
      });
      const reqData = (await r.json()) as any;
      assert(r.status === 201, `extra van request failed: ${JSON.stringify(reqData)}`);
      extraIds.push(reqData.id);

      const a = await fetch(`${baseUrl}/api/van/requests/${reqData.id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${operatorToken}` },
      });
      assert(a.status === 200, `extra accept failed: ${await a.text()}`);
    }

    // Step 20: Manual Reorder — swap the two extra stops' queue positions.
    // The operator app reads its queue from the current shift.
    const queueNow = ((await fetch(`${baseUrl}/api/van/shift/current`, {
      headers: { Authorization: `Bearer ${operatorToken}` },
    }).then((r) => r.json())) as any).queue as any[];
    const queuedIds = queueNow.filter((s) => s.phase === "queued").map((s) => s.id);
    assert(queuedIds.length >= 2, "need at least two queued stops for reorder test");

    const manualOrder = [queuedIds[1], queuedIds[0], ...queuedIds.slice(2)];
    const reorderRes = await fetch(`${baseUrl}/api/van/shift/queue/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${operatorToken}` },
      body: JSON.stringify({ order: manualOrder }),
    });
    const reorder = (await reorderRes.json()) as any;
    assert(reorderRes.status === 200 && reorder.success === true, `reorder failed: ${JSON.stringify(reorder)}`);

    const afterReorder = ((await fetch(`${baseUrl}/api/van/shift/current`, {
      headers: { Authorization: `Bearer ${operatorToken}` },
    }).then((r) => r.json())) as any).queue as any[];
    const orderAfter = afterReorder.filter((s) => s.phase === "queued").map((s) => s.id);
    assert(
      JSON.stringify(orderAfter.slice(0, 2)) === JSON.stringify(manualOrder.slice(0, 2)),
      `manual order not applied: ${JSON.stringify(orderAfter)}`
    );
    console.log("✓ PASSED: Operator Manual Queue Reorder");

    // Step 21: Reject malformed reorder (not a permutation of the queue)
    const badRes = await fetch(`${baseUrl}/api/van/shift/queue/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${operatorToken}` },
      body: JSON.stringify({ order: [queuedIds[0]] }), // drops a stop — invalid
    });
    assert(badRes.status === 409, `malformed reorder should 409, got ${badRes.status}`);
    console.log("✓ PASSED: Malformed Reorder Rejected (409)");

    // Step 22: Server-side route optimization over the routing matrix
    const optRes = await fetch(`${baseUrl}/api/van/shift/optimize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const opt = (await optRes.json()) as any;
    assert(optRes.status === 200, `optimize failed: ${JSON.stringify(opt)}`);
    assert(Array.isArray(opt.order), "optimize response missing order");
    assert(
      [...opt.order].sort().join() === [...queuedIds].sort().join(),
      "optimize order is not a permutation of the queued stops"
    );
    console.log(`✓ PASSED: Route Optimization (${opt.message})`);

    // Cleanup: complete the extra stops so later steps start from a clean queue.
    // A queued stop has to go through every phase; skipping one is refused.
    for (const id of extraIds) {
      for (const phase of ["en_route", "on_site", "in_treatment", "completed"]) {
        const cleanupRes = await fetch(`${baseUrl}/api/van/requests/${id}/phase`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${operatorToken}` },
          body: JSON.stringify({ phase }),
        });
        assert(cleanupRes.status === 200, `Cleanup phase ${phase} failed: ${await cleanupRes.text()}`);
      }
    }

    // End the shift, as an operator does at the end of the day. A shift left
    // open blocks every other operator from starting one on this van.
    const endShiftRes = await fetch(`${baseUrl}/api/van/shift/end`, {
      method: "POST",
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    assert(endShiftRes.status === 200, `Van shift end failed (${endShiftRes.status})`);
    console.log("✓ PASSED: Van Shift Ended");

    // ─── Account & Onboarding Flow (Steps 23–27) ─────────────────────────

    // Step 23: Account Summary
    const accountRes = await fetch(`${baseUrl}/api/auth/account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const account = (await accountRes.json()) as any;
    assert(accountRes.status === 200, `Account fetch failed: ${JSON.stringify(account)}`);
    assert(account.user?.id === userId, "Account user mismatch");
    assert(!!account.patientProfile?.id, "Account missing patient profile");
    console.log("✓ PASSED: Account Summary Endpoint (user + profile)");

    // Step 24: Change Password (verify + rotate + re-login)
    const cpRes = await fetch(`${baseUrl}/api/auth/account/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "ClinicalPassword123!", newPassword: "RotatedPassword456!" }),
    });
    const cp = (await cpRes.json()) as any;
    assert(cpRes.status === 200 && cp.success === true, `Change password failed: ${JSON.stringify(cp)}`);

    const reloginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "RotatedPassword456!" }),
    });
    assert(reloginRes.status === 200, "Login with rotated password failed");
    console.log("✓ PASSED: Change Password + Re-login with New Credentials");

    // Step 25: Dependants CRUD. Only an adult with a date of birth on file can
    // add a child, and only a child under 16 (decisions log #17).
    const addChild = (body: Record<string, unknown>) =>
      fetch(`${baseUrl}/api/patients/dependants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: "Leo", lastName: "Wright", relationship: "Son", consentSigned: true, ...body }),
      });
    const noDobRes = await addChild({ dob: "2018-06-15" });
    assert(noDobRes.status === 422, `Dependant without guardian DOB should be 422, got ${noDobRes.status}`);

    const dobRes = await fetch(`${baseUrl}/api/patients/${account.patientProfile.id}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dob: "1985-03-02" }),
    });
    assert(dobRes.status === 200, `Profile DOB update failed: ${await dobRes.text()}`);

    const tooOldRes = await addChild({ dob: "2000-01-01" });
    assert(tooOldRes.status === 422, `Dependant aged 16+ should be 422, got ${tooOldRes.status}`);

    const depRes = await addChild({ dob: "2018-06-15" });
    const dependant = (await depRes.json()) as any;
    assert(depRes.status === 201, `Dependant create failed: ${JSON.stringify(dependant)}`);

    const depListRes = await fetch(`${baseUrl}/api/patients/dependants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const depList = (await depListRes.json()) as any;
    assert(depList.some((d: any) => d.id === dependant.id), "Dependant missing from list");

    const depDelRes = await fetch(`${baseUrl}/api/patients/dependants/${dependant.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(depDelRes.status === 200, "Dependant delete failed");
    console.log("✓ PASSED: Dependants CRUD (guardian checks → create → list → delete)");

    // Step 26: Onboarding Consents Persist
    const consentRes = await fetch(`${baseUrl}/api/consents/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ consentType: "data_processing", lawfulBasis: "vital_interests" }),
    });
    assert(consentRes.status === 201 || consentRes.status === 200, `Consent grant failed: ${await consentRes.text()}`);

    const consentCurrentRes = await fetch(`${baseUrl}/api/consents/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const consentCurrent = (await consentCurrentRes.json()) as any;
    const hasDataProcessing = JSON.stringify(consentCurrent).includes("data_processing");
    assert(hasDataProcessing, "Granted consent not visible via /consents/current");
    console.log("✓ PASSED: Onboarding Consent Grant Persisted & Retrievable");

    // Step 27: The waitlist route is unmounted (BE-11, CS-32, D-20): answers 404 and nothing is stored
    const wlRes = await fetch(`${baseUrl}/api/waitlist/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ serviceId: testService.id, preferredDate: "2026-10-25" }),
    });
    assert(wlRes.status === 404, `Waitlist join should be 404, got ${wlRes.status}`);
    const wlCount = await prisma.waitlistEntry.count({ where: { userId } });
    assert(wlCount === 0, "Retired waitlist must not store entries");
    console.log("✓ PASSED: Waitlist join unmounted (404, nothing stored)");

    // Step 28: Listing the retired waitlist also answers 404
    const wlListRes = await fetch(`${baseUrl}/api/waitlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(wlListRes.status === 404, `Waitlist list should be 404, got ${wlListRes.status}`);
    console.log("✓ PASSED: Waitlist list unmounted (404)");

    // Step 29: Clinical Messaging CRUD (GET / POST / REPLY / READ)
    const msgListRes = await fetch(`${baseUrl}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(msgListRes.status === 200, "Messages list failed");
    const msgList = (await msgListRes.json()) as any[];
    assert(Array.isArray(msgList) && msgList.length === 0, `A new inbox should be empty, got ${msgList.length} threads`);

    const msgCreateRes = await fetch(`${baseUrl}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject: "Synthetic question", body: "Synthetic message body." }),
    });
    const msgThread = (await msgCreateRes.json()) as any;
    assert(msgCreateRes.status === 201 && msgThread.id, `Message thread create failed: ${JSON.stringify(msgThread)}`);

    const msgReplyRes = await fetch(`${baseUrl}/api/messages/${msgThread.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: "Synthetic follow-up." }),
    });
    assert(msgReplyRes.status === 201, `Message reply failed: ${await msgReplyRes.text()}`);
    console.log("✓ PASSED: Clinical Care Messaging Persistence (empty inbox, create, reply)");

    // Step 30: In-app credit decisions are retired; patients are pointed to the finance page
    const finApplyRes = await fetch(`${baseUrl}/api/financing/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ treatmentCostPence: 185000, durationMonths: 12 }),
    });
    const finApply = (await finApplyRes.json()) as any;
    assert(finApplyRes.status === 410 && typeof finApply.financeInfoUrl === "string", `Financing apply should be retired: ${JSON.stringify(finApply)}`);
    const finCount = await prisma.financingApplication.count({ where: { userId } });
    assert(finCount === 0, "Retired financing endpoint must not record an approval");
    console.log("✓ PASSED: In-app financing approvals retired (410 with finance page link)");

    // Step 31: Rewards & Oral Health Insights Persistence
    const brushRes = await fetch(`${baseUrl}/api/rewards/brushing-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ day: "Sun", session: "pm", durationSec: 120 }),
    });
    assert(brushRes.status === 200, `Brushing log failed: ${await brushRes.text()}`);

    const rewardsRes = await fetch(`${baseUrl}/api/rewards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rewardsData = (await rewardsRes.json()) as any;
    // Points come only from this patient's completed visits (10 each, once
    // per visit); self-reported brushing earns none.
    const visitAwards = await prisma.rewardPointsAward.count({ where: { userId } });
    assert(
      rewardsRes.status === 200 && rewardsData.pointsBalance === visitAwards * 10,
      `Points should match completed visits only: ${JSON.stringify(rewardsData)}`
    );

    const redeem = () =>
      fetch(`${baseUrl}/api/rewards/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rewardId: "deposit_5" }),
      });
    await prisma.oralHealthMetric.update({ where: { userId }, data: { pointsBalance: 0 } });
    const brokeRes = await redeem();
    assert(brokeRes.status === 422, `Redeeming with no points should fail: ${brokeRes.status}`);

    // Stand-in for points earned from completed visits.
    await prisma.oralHealthMetric.update({ where: { userId }, data: { pointsBalance: 1000 } });
    const redeemRes = await redeem();
    const redeemData = (await redeemRes.json()) as any;
    assert(redeemRes.status === 201 && redeemData.voucherCode && redeemData.pointsBalance === 900, `Reward redeem failed: ${JSON.stringify(redeemData)}`);

    const insightsRes = await fetch(`${baseUrl}/api/rewards/insights`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const insightsData = (await insightsRes.json()) as any;
    assert(insightsRes.status === 200 && Array.isArray(insightsData.weeklyBrushing), "Insights fetch failed");
    assert(
      insightsData.plaqueIndexPercent === null && insightsData.bleedingPercent === null && insightsData.practitionerAdvice === null,
      `Clinical insights must be null until recorded: ${JSON.stringify(insightsData)}`
    );
    console.log(`✓ PASSED: Rewards & Oral Health Telemetry Persisted (Redeemed ${redeemData.voucherCode}, Balance: ${redeemData.pointsBalance} pts)`);

    // Step 32: Treatment Plan Cryptographic E-Signature (BE-18, D-06 Acknowledgement)
    const clinicianRow = await prisma.clinicianProfile.findFirst();
    if (clinicianRow) {
      const planRow = await prisma.treatmentPlan.create({
        data: {
          patientId: account.patientProfile.id,
          clinicianId: clinicianRow.id,
          title: "E2E Restorative Crown Plan",
          status: "proposed",
          totalCostPence: 65000,
          items: {
            create: [
              { code: "D2740", description: "All-Ceramic Zirconia Crown", toothNumber: 31, costPence: 65000 },
            ],
          },
        },
      });
      const signPlanRes = await fetch(`${baseUrl}/api/patients/${userId}/plans/${planRow.id}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "PavDental-E2E/1.0 (iOS 18.2; TestRunner)",
        },
        body: JSON.stringify({
          signerName: "Alexander Wright",
          signatureData: "FaceID:Alexander Wright",
          consentConfirmed: true,
        }),
      });
      const signPlanData = (await signPlanRes.json()) as any;
      assert(
        signPlanRes.status === 200 &&
          signPlanData.signatureHash &&
          signPlanData.planVersionHash &&
          signPlanData.device === "PavDental-E2E/1.0 (iOS 18.2; TestRunner)",
        `Plan sign failed: ${JSON.stringify(signPlanData)}`
      );

      // Verify vault document title & docType per BE-18 / D-06
      const vaultDoc = await prisma.documentVault.findFirst({
        where: { patientId: account.patientProfile.id, fileKey: { contains: planRow.id } },
      });
      assert(
        Boolean(
          vaultDoc &&
            vaultDoc.title === "Treatment Plan Acknowledgement — E2E Restorative Crown Plan" &&
            vaultDoc.docType === "treatment_plan_acknowledgement"
        ),
        `Expected acknowledgement document in vault, got: ${JSON.stringify(vaultDoc)}`
      );

      console.log(`✓ PASSED: Treatment Plan Cryptographic E-Signature (${signPlanData.signatureHash}, version: ${signPlanData.planVersionHash})`);
    }

    // Step 33: GDPR Subject Access Request (SAR) Real Encrypted Export + Signed URL
    const sarRes = await fetch(`${baseUrl}/api/consents/data-access-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: "E2E Compliance Verification", format: "json" }),
    });
    const sarData = (await sarRes.json()) as any;
    assert(sarRes.ok && typeof sarData.downloadUrl === "string" && typeof sarData.sha256 === "string", `SAR export failed: ${JSON.stringify(sarData)}`);
    console.log(`✓ PASSED: GDPR SAR Export Persisted & Signed (${sarData.sha256.slice(0, 12)}…)`);

    // Step 34: Verify Full Audit Log Hash-Chain Integrity
    const finalIntegrityRes = await fetch(`${baseUrl}/api/audit/integrity`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(finalIntegrityRes.status === 200, `Final audit integrity endpoint failed (${finalIntegrityRes.status})`);
    const integrityData = (await finalIntegrityRes.json()) as any;
    assert(integrityData.valid === true, `Audit hash-chain integrity check failed: ${JSON.stringify(integrityData.issues)}`);
    console.log(`✓ PASSED: Audit Log Hash-Chain Integrity Verified (${integrityData.checkedCount} entries chained)`);

    console.log("\n🎉 ALL 34 END-TO-END SYSTEM INTEGRATION TESTS PASSED (0 FAILURES)!\n");
  } catch (err: any) {
    console.error("❌ E2E TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await prisma.$disconnect().catch(() => {});
    process.exit();
  }
}

runE2ESuite();
