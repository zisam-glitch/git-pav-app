-- One conversation per video appointment: a message thread can point at the
-- appointment it is about. Nullable and additive, safe with the previous
-- release still running (docs/completion/migrations.md rule 3). The unique
-- index allows many threads with no appointment (NULLs never collide).
ALTER TABLE "message_threads" ADD COLUMN "appointment_id" UUID;

CREATE UNIQUE INDEX "message_threads_appointment_id_key" ON "message_threads"("appointment_id");

ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
