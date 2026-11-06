import fs from "node:fs";
import path from "node:path";

import { createSchemaSql, dashboardSchemaFromEnv, searchPathOption } from "./schema";

// Types for generic query
export type QueryFn = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

/** Runs `fn` in one transaction: commits if it returns, rolls back if it throws. */
export type TransactionFn = <T>(fn: (tx: QueryFn) => Promise<T>) => Promise<T>;

interface DbClient {
  query: QueryFn;
  transaction: TransactionFn;
}

const globalForDb = globalThis as unknown as {
  dbClient?: DbClient;
  initPromise?: Promise<DbClient>;
};

/** Run all numbered SQL migration files in order. Safe to re-run (uses IF NOT EXISTS). */
async function runMigrations(exec: (sql: string) => Promise<unknown>) {
  const migrationsDir = path.join(process.cwd(), "src/lib/db/migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // lexicographic – 001, 002, 003 …

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    try {
      await exec(sql);
    } catch (err: unknown) {
      // Log but don't crash – some migrations may be partial on retry
      console.error(`[db] Migration ${file} error:`, (err as Error).message);
    }
  }

  // Also run seed if present
  const seedPath = path.join(process.cwd(), "src/lib/db/seed.sql");
  if (fs.existsSync(seedPath)) {
    try {
      console.log("[db] Running seed data...");
      await exec(fs.readFileSync(seedPath, "utf8"));
      console.log("[db] Seed data executed successfully");
    } catch (err: unknown) {
      console.error("[db] Seed error:", (err as Error).message);
      console.error("[db] Seed stack:", (err as Error).stack);
    }
  } else {
    console.log("[db] No seed.sql file found");
  }

  console.log("[db] All migrations applied.");
}

async function createDbClient(): Promise<DbClient> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  // 1. If real DATABASE_URL is set, use node-postgres (pg.Pool)
  if (databaseUrl) {
    const { Pool } = await import("pg");
    // Shared server: keep the dashboard's tables in their own schema and pin every
    // connection to it, so `users` here never means the app backend's `users`.
    const schema = dashboardSchemaFromEnv();
    if (schema) {
      const setup = new Pool({ connectionString: databaseUrl, max: 1 });
      try {
        await setup.query(createSchemaSql(schema));
      } finally {
        await setup.end();
      }
    }
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      ...(schema ? { options: searchPathOption(schema) } : {}),
    });

    const queryFn = async <T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> => {
      const res = await pool.query(text, params);
      return res.rows as T[];
    };

    // Run migrations against real DB on startup
    await runMigrations((sql) => pool.query(sql));

    const transaction: TransactionFn = async (fn) => {
      const connection = await pool.connect();
      const tx: QueryFn = async <T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> => {
        const res = await connection.query(text, params);
        return res.rows as T[];
      };
      try {
        await connection.query("BEGIN");
        const result = await fn(tx);
        await connection.query("COMMIT");
        return result;
      } catch (error) {
        await connection.query("ROLLBACK").catch((rollbackError: unknown) => {
          console.error("[db] Rollback failed:", (rollbackError as Error).message);
        });
        throw error;
      } finally {
        connection.release();
      }
    };

    return { query: queryFn, transaction };
  }

  // 2. Otherwise in local dev/preview, use embedded PGlite
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.join(process.cwd(), ".pgdata_admin");
  const pg = new PGlite(dataDir);
  await pg.waitReady;

  // Run ALL migrations (idempotent – all use CREATE TABLE IF NOT EXISTS)
  await runMigrations((sql) => pg.exec(sql as string));

  return {
    query: async <T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> => {
      const res = await pg.query<T>(text, params);
      return res.rows;
    },
    transaction: async (fn) =>
      (await pg.transaction((pgTx) =>
        fn(async <T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> => {
          const res = await pgTx.query<T>(text, params);
          return res.rows;
        }),
      )) as Awaited<ReturnType<typeof fn>>,
  };
}

async function getDbClient(): Promise<DbClient> {
  if (globalForDb.dbClient) return globalForDb.dbClient;
  globalForDb.initPromise ??= createDbClient().then((client) => {
    globalForDb.dbClient = client;
    return client;
  });
  return globalForDb.initPromise;
}

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await getDbClient();
  return client.query<T>(text, params);
}

export async function withTransaction<T>(fn: (tx: QueryFn) => Promise<T>): Promise<T> {
  const client = await getDbClient();
  return client.transaction(fn);
}
