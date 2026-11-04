import http from "http";
import express from "express";
import { prisma } from "../lib/prisma";
import { coordinatesToPostcode, formatUkPostcode } from "../lib/geo";
import publicVanRoutes from "../routes/public-van";

// The coverage check's `postcode` goes straight into the van request's address,
// which the server validates as a UK postcode. It used to be filled from the
// sector name ("WC - West Central London"), so no van request from the app
// could pass validation. It must be a real postcode, or null (plan J5).

const realFetch = global.fetch;
const SW1A = { lat: 51.501009, lng: -0.141588 };

function stubPostcodesIo(reverse: string | null) {
  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const json = (body: unknown) =>
      new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    if (url.startsWith("https://api.postcodes.io/postcodes?")) {
      return json({ status: 200, result: reverse ? [{ postcode: reverse }] : null });
    }
    if (url.startsWith("https://api.postcodes.io/postcodes/")) {
      return json({ status: 200, result: { latitude: SW1A.lat, longitude: SW1A.lng } });
    }
    return realFetch(input, init);
  }) as typeof fetch;
}

describe("van coverage check returns a real postcode", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/public/van", publicVanRoutes);
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  });

  const check = async (body: Record<string, unknown>) => {
    const res = await realFetch(`${baseUrl}/api/public/van/coverage-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res.status).toBe(200);
    return (await res.json()) as { postcode: string | null; activeSector: string | null; isCovered: boolean };
  };

  it("GPS: returns the nearest postcode, not the sector name", async () => {
    stubPostcodesIo("SW1A 1AA");
    const result = await check(SW1A);
    expect(result.postcode).toBe("SW1A 1AA");
    if (result.activeSector) expect(result.postcode).not.toBe(result.activeSector);
  });

  it("GPS: returns null when no postcode is found, so the patient types one", async () => {
    stubPostcodesIo(null);
    const result = await check(SW1A);
    expect(result.postcode).toBeNull();
  });

  it("postcode: returns it in the standard spaced form", async () => {
    stubPostcodesIo(null);
    const result = await check({ postcode: "sw1a1aa" });
    expect(result.postcode).toBe("SW1A 1AA");
  });

  it("coordinatesToPostcode survives a failing lookup", async () => {
    global.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    await expect(coordinatesToPostcode(SW1A)).resolves.toBeNull();
  });

  it.each([
    ["sw1a1aa", "SW1A 1AA"],
    ["M1 1AE", "M1 1AE"],
    ["bd39ty", "BD3 9TY"],
  ])("formatUkPostcode(%p) is %p", (input, expected) => {
    expect(formatUkPostcode(input)).toBe(expected);
  });
});
