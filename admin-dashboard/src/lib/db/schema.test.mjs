// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSchemaSql, dashboardSchemaFromEnv, searchPathOption } from "./schema.ts";

describe("dashboard database schema", () => {
  it("is off when unset or blank", () => {
    assert.equal(dashboardSchemaFromEnv({}), null);
    assert.equal(dashboardSchemaFromEnv({ DASHBOARD_DB_SCHEMA: "  " }), null);
  });

  it("accepts a plain lower-case name", () => {
    assert.equal(dashboardSchemaFromEnv({ DASHBOARD_DB_SCHEMA: "dashboard" }), "dashboard");
    assert.equal(dashboardSchemaFromEnv({ DASHBOARD_DB_SCHEMA: " web_admin_2 " }), "web_admin_2");
  });

  it("refuses anything that could be SQL, or the backend's own schema", () => {
    for (const bad of ["public", "Dashboard", "dash board", 'x"; drop table users; --', "dash-board", "1abc", "pg_catalog", "a".repeat(64)]) {
      assert.throws(() => dashboardSchemaFromEnv({ DASHBOARD_DB_SCHEMA: bad }), /DASHBOARD_DB_SCHEMA/, bad);
    }
  });

  it("builds the SQL and the connection option from a checked name", () => {
    assert.equal(createSchemaSql("dashboard"), 'CREATE SCHEMA IF NOT EXISTS "dashboard"');
    assert.equal(searchPathOption("dashboard"), "-c search_path=dashboard");
  });
});
