-- A patient who removes a conversation hides it from their own list; the
-- practice keeps it, because a dentist's written advice may be part of the
-- clinical record. Nullable and additive, safe with the previous release still
-- running (docs/completion/migrations.md rule 3).
ALTER TABLE "message_threads" ADD COLUMN "patient_hidden_at" TIMESTAMP(3);
