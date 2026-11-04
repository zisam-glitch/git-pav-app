-- Leases that stop two API instances running the same background job. They
-- replace advisory locks held in a transaction, which kept one connection busy
-- for the whole job. Additive, safe with the previous release still running
-- (docs/completion/migrations.md rule 3).
CREATE TABLE "job_leases" (
    "id" INTEGER NOT NULL,
    "holder" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "job_leases_pkey" PRIMARY KEY ("id")
);
