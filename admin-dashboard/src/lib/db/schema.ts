/**
 * Which Postgres schema the dashboard keeps its own tables in.
 *
 * On staging the dashboard shares the app backend's Postgres server (owner
 * decision, see docs/completion/04-decisions.md #28). Both define tables with
 * the same names (users, audit_logs), so the dashboard's go in their own
 * schema, and its connections see only that schema: an unqualified `users`
 * can never mean the backend's table. Without DASHBOARD_DB_SCHEMA nothing
 * changes and the dashboard uses the database's default schema, as before.
 */

/** A plain lower-case identifier: it is placed in SQL, so nothing else is accepted. */
const SAFE_SCHEMA = /^[a-z_][a-z0-9_]{0,62}$/;

/** The schema name from the environment, null when unset, or throws when it is not a safe name. */
export function dashboardSchemaFromEnv(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.DASHBOARD_DB_SCHEMA?.trim();
  if (!raw) return null;
  if (!SAFE_SCHEMA.test(raw) || raw === "public" || raw.startsWith("pg_")) {
    throw new Error("DASHBOARD_DB_SCHEMA must be a lower-case name such as 'dashboard' (not 'public').");
  }
  return raw;
}

/** SQL that creates the schema (idempotent). */
export function createSchemaSql(schema: string): string {
  return `CREATE SCHEMA IF NOT EXISTS "${schema}"`;
}

/** Startup option that pins a connection to the schema only. */
export function searchPathOption(schema: string): string {
  return `-c search_path=${schema}`;
}
