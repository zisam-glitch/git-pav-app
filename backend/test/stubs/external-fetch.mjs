// Test-only fetch stub for third-party APIs the e2e suite touches.
// Loaded with: NODE_OPTIONS="--import ./test/stubs/external-fetch.mjs"
//
// - postcodes.io: BD3 9TY, the practice's own postcode, resolves to its spot on
//   Leeds Road, Bradford (inside the seeded van areas). SW1A 1AA resolves to
//   Westminster, which is outside them. Every other postcode is a 404. The
//   reverse lookup returns a postcode for points within about 500 m of either.
// - Daily.co REST: room and meeting-token creation return fixed stubs.
// - Google Routes: a fixed route and fixed drive times.
//
// Anything else passes through to the real fetch.
if (process.env.NODE_ENV === "production") {
  throw new Error("test/stubs/external-fetch.mjs must never be loaded in production");
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const KNOWN_POSTCODES = [
  { display: "BD3 9TY", latitude: 53.7998, longitude: -1.7289 },
  { display: "SW1A 1AA", latitude: 51.501009, longitude: -0.141588 },
];

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

  // Reverse lookup: like the real API, only a point close to a known postcode
  // (about 500 m) resolves to it; anywhere else has no postcode.
  if (url.startsWith("https://api.postcodes.io/postcodes?")) {
    const params = new URL(url).searchParams;
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    const near = KNOWN_POSTCODES.find((p) => Math.abs(lat - p.latitude) < 0.0045 && Math.abs(lon - p.longitude) < 0.007);
    return json({ status: 200, result: near ? [{ postcode: near.display }] : null });
  }

  if (url.startsWith("https://api.postcodes.io/postcodes/")) {
    const postcode = decodeURIComponent(url.slice("https://api.postcodes.io/postcodes/".length))
      .replace(/\s/g, "")
      .toUpperCase();
    const known = KNOWN_POSTCODES.find((p) => p.display.replace(/\s/g, "") === postcode);
    if (!known) return json({ status: 404, error: "Postcode not found" }, 404);
    return json({ status: 200, result: { latitude: known.latitude, longitude: known.longitude } });
  }

  // Google Routes (only when a GOOGLE_ROUTES_API_KEY is set): a fixed route
  // and an 8-minute drive for every pair.
  if (url.startsWith("https://routes.googleapis.com/directions/v2:computeRoutes")) {
    return json({ routes: [{ polyline: { encodedPolyline: "_p~iF~ps|U_ulLnnqC" }, distanceMeters: 2100, duration: "480s" }] });
  }
  if (url.startsWith("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix")) {
    const body = JSON.parse(String(init?.body ?? "{}"));
    const n = body.origins?.length ?? 0;
    const out = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push({ originIndex: i, destinationIndex: j, duration: i === j ? "0s" : "480s", condition: "ROUTE_EXISTS" });
    return json(out);
  }

  if (url.startsWith("https://api.daily.co/v1/")) {
    if (url.includes("/meeting-tokens")) return json({ token: "stub_meeting_token" });
    const name = "e2e-stub-room";
    return json({ name, url: `https://pavdental-e2e.daily.co/${name}`, privacy: "private" });
  }

  return realFetch(input, init);
};
