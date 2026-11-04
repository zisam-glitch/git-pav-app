import http from "http";
import crypto from "crypto";
import app from "../server";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";

// The dashboard's patient directory reads GET /api/admin/users. A patient
// account without a profile used to be described as "System Administrator",
// and patients couldn't be found by name. Users are kept after the test:
// deleting one rewrites its audit entries. Synthetic data only.
describe("admin user list", () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken = "";
  const tag = crypto.randomUUID().slice(0, 8);
  const profileIds: string[] = [];

  beforeAll(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const admin = await prisma.user.create({ data: { email: `users-admin-${tag}@example.test`, passwordHash: "x", role: "admin" } });
    adminToken = signAccessToken({ sub: admin.id, role: "admin", sessionId: crypto.randomUUID() });
  });

  afterAll(async () => {
    await prisma.patientProfile.deleteMany({ where: { id: { in: profileIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const list = async (query: string) => {
    const res = await fetch(`${baseUrl}/api/admin/users?${query}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    expect(res.status).toBe(200);
    return (await res.json()) as { users: { email: string; name: string; details: string }[] };
  };

  it("describes each account by what it is", async () => {
    await prisma.user.create({ data: { email: `users-noprofile-${tag}@example.test`, passwordHash: "x", role: "patient" } });
    const withProfile = await prisma.user.create({
      data: { email: `users-profile-${tag}@example.test`, passwordHash: "x", role: "patient" },
    });
    const profile = await prisma.patientProfile.create({
      data: { userId: withProfile.id, firstName: "Quill", lastName: `Synthetic${tag}`, city: "Testville", postcode: "ZZ1 1ZZ" },
    });
    profileIds.push(profile.id);

    const { users } = await list(`role=patient&search=${tag}`);
    const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));
    expect(byEmail[`users-noprofile-${tag}@example.test`].details).toBe("Profile not set up");
    expect(byEmail[`users-profile-${tag}@example.test`].details).toBe("Testville, ZZ1 1ZZ");
    for (const u of users) expect(u.details).not.toBe("System Administrator");

    const admins = await list(`role=admin&search=users-admin-${tag}`);
    expect(admins.users[0].details).toBe("Practice staff (admin)");
  });

  it("finds a patient by name", async () => {
    const { users } = await list(`role=patient&search=Synthetic${tag}`);
    expect(users.map((u) => u.name)).toContain(`Quill Synthetic${tag}`);
  });
});
