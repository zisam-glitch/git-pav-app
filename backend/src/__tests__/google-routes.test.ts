// Google Routes as the van ETA provider and the source of the road route on the
// patient's map. Google is never called: fetch is replaced in each test, and
// the module is loaded fresh because the key is read when it loads.

type VanEta = typeof import("../lib/van-eta");

const VAN = { lat: 51.5033, lng: -0.1196 };
const HOME = { lat: 51.501, lng: -0.1416 };

async function load(env: Record<string, string | undefined>): Promise<VanEta> {
  const saved = { ...process.env };
  delete process.env.GOOGLE_ROUTES_API_KEY;
  delete process.env.GOOGLE_MAP_API;
  delete process.env.MAPBOX_TOKEN;
  delete process.env.OSRM_BASE_URL;
  Object.assign(process.env, env);
  let mod!: VanEta;
  // A fresh copy of the module, so it reads the key set above. Jest here runs
  // CommonJS, where require is the way to load a module in isolation.
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("../lib/van-eta");
  });
  process.env = saved;
  return mod;
}

type Call = { url: string; headers: Record<string, string>; body: Record<string, unknown> | undefined };

function stubFetch(handler: (url: string, body: Record<string, unknown> | undefined) => unknown, status = 200) {
  const calls: Call[] = [];
  global.fetch = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string>, body });
    return new Response(JSON.stringify(handler(url, body)), { status });
  }) as typeof fetch;
  return calls;
}

const realFetch = global.fetch;
afterEach(() => {
  global.fetch = realFetch;
});

describe("Google Routes provider", () => {
  it("is used when a key is set, under either name", async () => {
    expect((await load({ GOOGLE_ROUTES_API_KEY: "test-key" })).getRoutingProvider()).toBe("google");
    expect((await load({ GOOGLE_MAP_API: "test-key" })).getRoutingProvider()).toBe("google");
    expect((await load({})).getRoutingProvider()).toBe("haversine");
  });

  it("falls back to GOOGLE_MAP_API when GOOGLE_ROUTES_API_KEY is an empty line", async () => {
    expect((await load({ GOOGLE_ROUTES_API_KEY: "", GOOGLE_MAP_API: "test-key" })).getRoutingProvider()).toBe("google");
    expect((await load({ GOOGLE_ROUTES_API_KEY: "  ", GOOGLE_MAP_API: "test-key" })).getRoutingProvider()).toBe("google");
  });

  it("names the provider for the startup log, without the key", async () => {
    const google = (await load({ GOOGLE_MAP_API: "test-key" })).describeRoutingProvider();
    expect(google).toMatch(/^Google Routes/);
    expect(google).not.toContain("test-key");
    expect((await load({})).describeRoutingProvider()).toMatch(/no routing key set/);
  });

  it("reads driving times from the route matrix, sending the key as a header", async () => {
    const eta = await load({ GOOGLE_ROUTES_API_KEY: "test-key" });
    const calls = stubFetch(() => [
      { originIndex: 0, destinationIndex: 1, duration: "420s", condition: "ROUTE_EXISTS" },
      { originIndex: 1, destinationIndex: 0, duration: "400s", condition: "ROUTE_EXISTS" },
    ]);
    expect(await eta.travelSeconds(VAN, HOME)).toBe(420);
    expect(calls[0].url).toBe("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix");
    expect(calls[0].headers["X-Goog-Api-Key"]).toBe("test-key");
    expect(calls[0].url).not.toContain("test-key");
    expect(calls[0].body?.travelMode).toBe("DRIVE");
  });

  it("falls back to the distance estimate when Google has no route", async () => {
    const eta = await load({ GOOGLE_ROUTES_API_KEY: "test-key" });
    stubFetch(() => [{ originIndex: 0, destinationIndex: 1, condition: "ROUTE_NOT_FOUND" }]);
    const seconds = await eta.travelSeconds(VAN, HOME);
    expect(seconds).toBeGreaterThan(0);
  });
});

describe("road route for the patient's map", () => {
  const routeResponse = {
    routes: [{ polyline: { encodedPolyline: "_p~iF~ps|U_ulLnnqC" }, distanceMeters: 2100, duration: "480s" }],
  };

  it("returns the encoded route, and reuses it for a nearby position", async () => {
    const eta = await load({ GOOGLE_ROUTES_API_KEY: "test-key" });
    const calls = stubFetch(() => routeResponse);
    const route = await eta.roadRoute(VAN, HOME);
    expect(route).toEqual({ encodedPolyline: "_p~iF~ps|U_ulLnnqC", distanceMeters: 2100, durationSeconds: 480 });
    expect(calls[0].url).toBe("https://routes.googleapis.com/directions/v2:computeRoutes");
    expect(calls[0].headers["X-Goog-FieldMask"]).toContain("routes.polyline.encodedPolyline");

    // A few metres of GPS jitter: same route, no second request.
    await eta.roadRoute({ lat: VAN.lat + 0.0001, lng: VAN.lng }, HOME);
    expect(calls).toHaveLength(1);
  });

  it("is null, without calling anyone, when Google isn't configured", async () => {
    const eta = await load({ MAPBOX_TOKEN: "mapbox-test" });
    const calls = stubFetch(() => routeResponse);
    expect(await eta.roadRoute(VAN, HOME)).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it("is null when Google refuses, so the app draws a straight line", async () => {
    const eta = await load({ GOOGLE_ROUTES_API_KEY: "test-key" });
    stubFetch(() => ({ error: { message: "API key not valid" } }), 403);
    expect(await eta.roadRoute(VAN, HOME)).toBeNull();
  });
});
