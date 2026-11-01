// Run with `npm test`. Node strips the types from pav-vans.ts when it is imported.

import { currentAssignments, parseAreaGeoJson, previewPaths } from "./pav-vans.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const box = [
  [-1.2, 60.1],
  [-1.2, 60.2],
  [-1.1, 60.2],
  [-1.1, 60.1],
  [-1.2, 60.1],
];

describe("parseAreaGeoJson", () => {
  it("reads a Polygon", () => {
    const r = parseAreaGeoJson(JSON.stringify({ type: "Polygon", coordinates: [box] }));
    assert.equal(r.ok, true);
    assert.deepEqual(r.polygons, [{ type: "Polygon", coordinates: [box] }]);
  });

  it("reads a Feature and a FeatureCollection, as geojson.io exports them", () => {
    const feature = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [box] } };
    assert.equal(parseAreaGeoJson(JSON.stringify(feature)).polygons.length, 1);
    const collection = { type: "FeatureCollection", features: [feature, feature] };
    assert.equal(parseAreaGeoJson(JSON.stringify(collection)).polygons.length, 2);
  });

  it("splits a MultiPolygon into one area per polygon", () => {
    const r = parseAreaGeoJson(JSON.stringify({ type: "MultiPolygon", coordinates: [[box], [box]] }));
    assert.equal(r.ok, true);
    assert.equal(r.polygons.length, 2);
  });

  it("closes an open ring", () => {
    const r = parseAreaGeoJson(JSON.stringify({ type: "Polygon", coordinates: [box.slice(0, 4)] }));
    assert.equal(r.ok, true);
    assert.deepEqual(r.polygons[0].coordinates[0], box);
  });

  it("explains what's wrong instead of accepting it", () => {
    const cases = [
      ["not json", /couldn't be read as JSON/],
      [JSON.stringify({ type: "Point", coordinates: [0, 0] }), /Only areas can be used/],
      [
        JSON.stringify({
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 1],
            ],
          ],
        }),
        /at least three distinct points/,
      ],
      [
        JSON.stringify({
          type: "Polygon",
          coordinates: [
            [
              [-0.1, 51.5],
              [200, 51.5],
              [-0.1, 51.6],
              [-0.1, 51.5],
            ],
          ],
        }),
        /outside the map/,
      ],
      [
        JSON.stringify({
          type: "Polygon",
          coordinates: [
            [
              ["a", 1],
              [1, 1],
              [1, 2],
              ["a", 1],
            ],
          ],
        }),
        /isn't \[longitude, latitude\]/,
      ],
      [JSON.stringify({ type: "FeatureCollection", features: [] }), /no features/],
    ];
    for (const [text, message] of cases) {
      const r = parseAreaGeoJson(text);
      assert.equal(r.ok, false, text);
      assert.match(r.error, message, text);
    }
  });
});

describe("previewPaths", () => {
  it("fits the areas in the box with north up", () => {
    const [path] = previewPaths([{ type: "Polygon", coordinates: [box] }], 100);
    const nums = path.match(/-?\d+(\.\d+)?/g).map(Number);
    for (const n of nums) assert.ok(n >= 0 && n <= 100, `${n} outside the box`);
    // The first point is the south-west corner, so it sits at the bottom (largest y).
    const [, firstY] = nums;
    assert.equal(firstY, Math.max(...nums.filter((_, i) => i % 2 === 1)));
    assert.match(path, /^M.* Z$/);
  });

  it("draws nothing for no areas", () => {
    assert.deepEqual(previewPaths([]), []);
  });
});

describe("currentAssignments", () => {
  const now = new Date("2026-11-01T12:00:00Z");
  const a = (startsAt, endsAt) => ({
    id: startsAt,
    operatorId: "o",
    startsAt,
    endsAt,
    operator: { fullName: "x", phone: null },
  });

  it("lists every assignment that has started and not ended, newest first", () => {
    const van = {
      assignments: [
        a("2026-10-20T09:00:00Z", null),
        a("2026-11-01T09:00:00Z", "2026-11-02T09:00:00Z"),
        a("2026-10-01T09:00:00Z", "2026-10-31T09:00:00Z"),
      ],
    };
    assert.deepEqual(
      currentAssignments(van, now).map((x) => x.id),
      ["2026-11-01T09:00:00Z", "2026-10-20T09:00:00Z"],
    );
  });

  it("is empty when every assignment has ended or not started", () => {
    const van = { assignments: [a("2026-10-01T09:00:00Z", "2026-10-31T09:00:00Z"), a("2026-12-01T09:00:00Z", null)] };
    assert.deepEqual(currentAssignments(van, now), []);
  });
});
