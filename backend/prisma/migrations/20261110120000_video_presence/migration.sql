-- Who is in a video consultation's waiting room. The patient's app reports in
-- while the waiting room is open; the dentist's queue reads it. Both columns are
-- nullable and additive, safe with the previous release still running
-- (docs/completion/migrations.md rule 3).
ALTER TABLE "appointments" ADD COLUMN "patient_waiting_since" TIMESTAMP(3),
ADD COLUMN "patient_last_seen_at" TIMESTAMP(3);
