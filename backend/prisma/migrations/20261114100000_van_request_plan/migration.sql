-- The plan for a van stop: when the van is expected to arrive, start and
-- finish, and when that was last worked out. Nullable columns, additive and
-- safe with the previous release still running (docs/completion/migrations.md
-- rule 3). No backfill: the plan is written the next time the queue or the
-- van's position changes.
ALTER TABLE "van_service_requests" ADD COLUMN     "plan_computed_at" TIMESTAMP(3),
ADD COLUMN     "planned_arrival_at" TIMESTAMP(3),
ADD COLUMN     "planned_finish_at" TIMESTAMP(3),
ADD COLUMN     "planned_start_at" TIMESTAMP(3);
