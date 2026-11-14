-- The promise made to a van patient and how it turned out: the arrival window
-- they were told, when the van actually arrived, and when they were told it
-- was running late. Nullable columns, additive and safe with the previous
-- release still running (docs/completion/migrations.md rule 3). No backfill.
ALTER TABLE "van_service_requests" ADD COLUMN     "arrived_at" TIMESTAMP(3),
ADD COLUMN     "late_notice_sent_at" TIMESTAMP(3),
ADD COLUMN     "promised_from_at" TIMESTAMP(3),
ADD COLUMN     "promised_to_at" TIMESTAMP(3);
