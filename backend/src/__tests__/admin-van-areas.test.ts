import http from "http";
import crypto from "crypto";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { findCoveringVans, getCoverageBackend } from "../lib/van-coverage";

// Staff set up where each van goes and who drives it (plan Phase 2). Areas are
// drawn far from the seeded London ones (Shetland) so they never change other
// tests' coverage. Users are kept: deleting one would rewrite its audit
// entries and break the audit chain. Synthetic data only.
describe("van service areas and operator assignments (admin)", () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken = "";
  let patientToken = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const vanIds: string[] = [];
  const operatorIds: string[] = [];

  // A small box near Lerwick, closed ring of [lng, lat] positions.
  const SHETLAND = {
    type: "Polygon",
    coordinates: [[[-1.2, 60.1], [-1.2, 60.2], [-1.1, 60.2], [-1.1, 60.1], [-1.2, 60.1]]],
  };
  const INSIDE = { lat: 60.15, lng: -1.15 };

  const api = async (method: string, path: string, body?: unknown, token = adminToken) => {
    const res = await fetch(`${baseUrl}/api/admin${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };

  async function makeVan() {
    const van = await prisma.van.create({
      data: { name: `Synthetic Van ${tag}-${vanIds.length}`, registrationPlate: `SYN${tag}${vanIds.length}`, vehicleModel: "Synthetic" },
    });
    vanIds.push(van.id);
    return van;
  }

  async function makeOperator(n: number) {
    const user = await prisma.user.create({
      data: { email: `van-op-${n}-${tag}@example.test`, passwordHash: "x", role: "operator" },
    });
    const operator = await prisma.operatorProfile.create({ data: { userId: user.id, fullName: `Synthetic Operator ${n}` } });
    operatorIds.push(operator.id);
    return operator;
  }

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const admin = await prisma.user.create({ data: { email: `van-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
    const patient = await prisma.user.create({ data: { email: `van-patient-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    patientToken = signAccessToken({ sub: patient.id, role: "patient", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.vanOperatorAssignment.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.vanServicePolygon.deleteMany({ where: { vanId: { in: vanIds } } });
    await prisma.van.deleteMany({ where: { id: { in: vanIds } } });
    await prisma.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("refuses an area without a shape instead of inventing one", async () => {
    const van = await makeVan();
    const res = await api("POST", `/vans/${van.id}/polygons`, { sectorName: "No shape" });
    expect(res.status).toBe(400);
    expect(await prisma.vanServicePolygon.count({ where: { vanId: van.id } })).toBe(0);
  });

  it.each([
    ["an open ring", { type: "Polygon", coordinates: [[[-1.2, 60.1], [-1.2, 60.2], [-1.1, 60.2], [-1.1, 60.1]]] }],
    ["too few points", { type: "Polygon", coordinates: [[[-1.2, 60.1], [-1.2, 60.2], [-1.2, 60.1]]] }],
    ["latitude out of range", { type: "Polygon", coordinates: [[[-1.2, 95], [-1.2, 60.2], [-1.1, 60.2], [-1.2, 95]]] }],
    ["a MultiPolygon", { type: "MultiPolygon", coordinates: [SHETLAND.coordinates] }],
  ])("refuses %s", async (_label, polygonGeoJson) => {
    const van = await makeVan();
    const res = await api("POST", `/vans/${van.id}/polygons`, { sectorName: "Bad shape", polygonGeoJson });
    expect(res.status).toBe(400);
  });

  it("refuses a ring that crosses itself with the reason, not a server error", async () => {
    // The check needs PostGIS (CI and docker-compose have it).
    if ((await getCoverageBackend()).mode !== "postgis") return;
    const van = await makeVan();
    const bowtie = { type: "Polygon", coordinates: [[[-1.2, 60.1], [-1.1, 60.2], [-1.2, 60.2], [-1.1, 60.1], [-1.2, 60.1]]] };
    const res = await api("POST", `/vans/${van.id}/polygons`, { sectorName: "Bow tie", polygonGeoJson: bowtie });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Self-intersection/);
    expect(await prisma.vanServicePolygon.count({ where: { vanId: van.id } })).toBe(0);
  });

  it("adds an area that patients there are covered by, lists it with its shape, and removes it", async () => {
    const van = await makeVan();
    const added = await api("POST", `/vans/${van.id}/polygons`, { sectorName: "Lerwick", polygonGeoJson: SHETLAND });
    expect(added.status).toBe(201);

    const covering = await findCoveringVans(INSIDE);
    expect(covering.map((c) => c.vanId)).toContain(van.id);

    const vans = await api("GET", "/vans");
    const listed = (vans.body as { id: string; servicePolygons: { id: string; polygonGeoJson: unknown }[] }[]).find(
      (v) => v.id === van.id
    );
    expect(listed?.servicePolygons).toHaveLength(1);
    expect(listed?.servicePolygons[0].polygonGeoJson).toEqual(SHETLAND);

    const removed = await api("DELETE", `/vans/${van.id}/polygons/${added.body.id}`);
    expect(removed.status).toBe(204);
    expect((await findCoveringVans(INSIDE)).map((c) => c.vanId)).not.toContain(van.id);

    const again = await api("DELETE", `/vans/${van.id}/polygons/${added.body.id}`);
    expect(again.status).toBe(404);
  });

  it("lists operators with their current van; a new assignment ends the old one; an assignment can be ended", async () => {
    const [vanA, vanB] = [await makeVan(), await makeVan()];
    const operator = await makeOperator(1);

    const first = await api("POST", `/vans/${vanA.id}/assignments`, { operatorId: operator.id });
    expect(first.status).toBe(201);
    let listed = (await api("GET", "/operators")).body.find((o: { id: string }) => o.id === operator.id);
    expect(listed.currentAssignment).toMatchObject({ vanId: vanA.id });
    expect(listed.email).toBe(`van-op-1-${tag}@example.test`);

    const second = await api("POST", `/vans/${vanB.id}/assignments`, { operatorId: operator.id });
    expect(second.status).toBe(201);
    const old = await prisma.vanOperatorAssignment.findUniqueOrThrow({ where: { id: first.body.id } });
    expect(old.endsAt).not.toBeNull();
    listed = (await api("GET", "/operators")).body.find((o: { id: string }) => o.id === operator.id);
    expect(listed.currentAssignment).toMatchObject({ vanId: vanB.id });

    const ended = await api("POST", `/vans/${vanB.id}/assignments/${second.body.id}/end`);
    expect(ended.status).toBe(200);
    listed = (await api("GET", "/operators")).body.find((o: { id: string }) => o.id === operator.id);
    expect(listed.currentAssignment).toBeNull();

    expect((await api("POST", `/vans/${vanB.id}/assignments/${second.body.id}/end`)).status).toBe(409);
    // Wrong van for that assignment.
    expect((await api("POST", `/vans/${vanA.id}/assignments/${second.body.id}/end`)).status).toBe(404);
  });

  it("refuses an assignment that ends before it starts", async () => {
    const van = await makeVan();
    const operator = await makeOperator(2);
    const res = await api("POST", `/vans/${van.id}/assignments`, {
      operatorId: operator.id,
      startsAt: "2027-01-02T09:00:00.000Z",
      endsAt: "2027-01-01T09:00:00.000Z",
    });
    expect(res.status).toBe(400);
  });

  it("is admin only", async () => {
    const van = await makeVan();
    expect((await api("GET", "/operators", undefined, patientToken)).status).toBe(403);
    expect(
      (await api("POST", `/vans/${van.id}/polygons`, { sectorName: "x", polygonGeoJson: SHETLAND }, patientToken)).status
    ).toBe(403);
  });
});
