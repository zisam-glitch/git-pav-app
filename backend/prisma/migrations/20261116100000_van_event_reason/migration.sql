-- Why a visit was cancelled by the van: a reason code on the history entry.
-- A nullable column, additive and safe with the previous release still
-- running (docs/completion/migrations.md rule 3). No backfill.
ALTER TABLE "van_request_events" ADD COLUMN     "reason" VARCHAR(40);
