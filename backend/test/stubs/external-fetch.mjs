// Test-only fetch stub for third-party APIs the e2e suite touches.
// Loaded with: NODE_OPTIONS="--import ./test/stubs/external-fetch.mjs"
//
// - postcodes.io: SW1A 1AA resolves to Westminster (inside the seeded van
//   polygon); every other postcode is a 404, which the suite relies on for
//   its "not covered" checks. The reverse lookup returns SW1A 1AA for points
//   within about 500 m of it.
// - Daily.co REST: room and meeting-token creation return fixed stubs.
//
// Anything else passes through to the real fetch.
if (process.env.NODE_ENV === "production") {
  throw new Error("test/stubs/external-fetch.mjs must never be loaded in production");
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

  // Reverse lookup: like the real API, only a point close to SW1A 1AA (about
  // 500 m) resolves to it; anywhere else has no postcode.
  if (url.startsWith("https://api.postcodes.io/postcodes?")) {
    const params = new URL(url).searchParams;
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    const nearSw1a = Math.abs(lat - 51.501009) < 0.0045 && Math.abs(lon + 0.141588) < 0.007;
    return json({ status: 200, result: nearSw1a ? [{ postcode: "SW1A 1AA" }] : null });
  }

  if (url.startsWith("https://api.postcodes.io/postcodes/")) {
    const postcode = decodeURIComponent(url.slice("https://api.postcodes.io/postcodes/".length))
      .replace(/\s/g, "")
      .toUpperCase();
    if (postcode !== "SW1A1AA") return json({ status: 404, error: "Postcode not found" }, 404);
    return json({ status: 200, result: { latitude: 51.501009, longitude: -0.141588 } });
  }

  if (url.startsWith("https://api.daily.co/v1/")) {
    if (url.includes("/meeting-tokens")) return json({ token: "stub_meeting_token" });
    const name = "e2e-stub-room";
    return json({ name, url: `https://pavdental-e2e.daily.co/${name}`, privacy: "private" });
  }

  return realFetch(input, init);
};
