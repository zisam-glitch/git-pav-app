import http from "http";
import crypto from "crypto";
import argon2 from "argon2";

// CS-08 part 2: an access token stops working as soon as its session ends;
// two refreshes racing with the same token don't log the user out; an old
// token is still treated as theft; check-email and a locked account don't
// reveal more than a wrong password does. Synthetic data only.
describe("session security", () => {
  let server: http.Server;
  let app: import("express").Express;
  let baseUrl: string;
  let prisma: typeof import("../lib/prisma").prisma;
  const tag = crypto.randomUUID().slice(0, 8);
  const password = `Synthetic-${tag}-pass`;
  const userIds: string[] = [];

  async function makePatient(label: string) {
    const user = await prisma.user.create({
      data: {
        email: `session-${label}-${tag}@example.test`,
        passwordHash: await argon2.hash(password),
        role: "patient",
        patientProfile: { create: { firstName: "Synthetic", lastName: label } },
      },
    });
    userIds.push(user.id);
    return user;
  }

  const call = (method: string, path: string, opts: { token?: string; body?: unknown } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    }).then(async (r) => ({ status: r.status, body: (await r.json().catch(() => null)) as any }));

  const signIn = async (email: string) => {
    const res = await call("POST", "/api/auth/login", { body: { email, password } });
    expect(res.status).toBe(200);
    return res.body as { accessToken: string; refreshToken: string };
  };

  beforeAll(async () => {
    const serverModule = require("../server");
    app = serverModule.default ?? serverModule;
    prisma = require("../lib/prisma").prisma;
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(3023, resolve));
    baseUrl = "http://localhost:3023";
  });

  afterAll(async () => {
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.patientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("refuses the access token once the user has logged out", async () => {
    const user = await makePatient("logout");
    const { accessToken } = await signIn(user.email);
    expect((await call("GET", "/api/auth/account", { token: accessToken })).status).toBe(200);
    expect((await call("POST", "/api/auth/logout", { token: accessToken })).status).toBe(200);
    expect((await call("GET", "/api/auth/account", { token: accessToken })).status).toBe(401);
  });

  it("ends other sessions straight away when the password changes", async () => {
    const user = await makePatient("password");
    const phone = await signIn(user.email);
    const tablet = await signIn(user.email);
    const changed = await call("POST", "/api/auth/account/change-password", {
      token: phone.accessToken,
      body: { currentPassword: password, newPassword: `${password}-rotated` },
    });
    expect(changed.status).toBe(200);
    expect((await call("GET", "/api/auth/account", { token: tablet.accessToken })).status).toBe(401);
    expect((await call("GET", "/api/auth/account", { token: phone.accessToken })).status).toBe(200);
  });

  it("gives two racing refreshes the same new token instead of logging the user out", async () => {
    const user = await makePatient("race");
    const { refreshToken } = await signIn(user.email);
    const [a, b] = await Promise.all([
      call("POST", "/api/auth/refresh", { body: { refreshToken } }),
      call("POST", "/api/auth/refresh", { body: { refreshToken } }),
    ]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect(a.body.refreshToken).toBe(b.body.refreshToken);
    expect(await prisma.authSession.count({ where: { userId: user.id, revokedAt: { not: null } } })).toBe(0);

    const next = await call("POST", "/api/auth/refresh", { body: { refreshToken: a.body.refreshToken } });
    expect(next.status).toBe(200);
  });

  it("still revokes the session when a superseded refresh token comes back", async () => {
    const user = await makePatient("reuse");
    const first = await signIn(user.email);
    const second = await call("POST", "/api/auth/refresh", { body: { refreshToken: first.refreshToken } });
    const third = await call("POST", "/api/auth/refresh", { body: { refreshToken: second.body.refreshToken } });
    expect(third.status).toBe(200);

    // `first` is two rotations old: not a race, so it's treated as stolen.
    expect((await call("POST", "/api/auth/refresh", { body: { refreshToken: first.refreshToken } })).status).toBe(401);
    expect((await call("GET", "/api/auth/account", { token: third.body.accessToken })).status).toBe(401);
    expect((await call("POST", "/api/auth/refresh", { body: { refreshToken: third.body.refreshToken } })).status).toBe(401);
  });

  it("doesn't reveal an account's role from check-email", async () => {
    const user = await makePatient("check");
    const res = await call("POST", "/api/auth/check-email", { body: { email: user.email } });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ exists: true, email: user.email });
    expect(res.body).not.toHaveProperty("role");
    expect((await call("POST", "/api/auth/check-email", { body: { email: "not-an-email" } })).status).toBe(400);
  });

  it("puts check-email behind the auth rate limiter", async () => {
    const realLimiter = app.get("authLimiter");
    app.set("authLimiter", (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) =>
      res.status(429).json({ error: "limited" })
    );
    try {
      const res = await call("POST", "/api/auth/check-email", { body: { email: `nobody-${tag}@example.test` } });
      expect(res.status).toBe(429);
    } finally {
      app.set("authLimiter", realLimiter);
    }
  });

  it("answers a locked account exactly like a wrong password", async () => {
    const user = await makePatient("locked");
    await prisma.user.update({ where: { id: user.id }, data: { lockedUntil: new Date(Date.now() + 600000) } });
    const locked = await call("POST", "/api/auth/login", { body: { email: user.email, password } });
    const wrong = await call("POST", "/api/auth/login", { body: { email: `nobody-${tag}@example.test`, password } });
    expect(locked.status).toBe(wrong.status);
    expect(locked.body).toEqual(wrong.body);
  });
});
