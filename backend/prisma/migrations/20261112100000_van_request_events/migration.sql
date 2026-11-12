-- The history of a van visit: one row per thing that happened. A new table,
-- additive and safe with the previous release still running
-- (docs/completion/migrations.md rule 3). No personal data: a role, never a person.
CREATE TABLE "van_request_events" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "from_phase" VARCHAR(20),
    "to_phase" VARCHAR(20),
    "actor_role" VARCHAR(20),
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "van_request_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "van_request_events_request_id_at_idx" ON "van_request_events"("request_id", "at");

ALTER TABLE "van_request_events" ADD CONSTRAINT "van_request_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "van_service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
