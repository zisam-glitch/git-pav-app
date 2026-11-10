-- Photos in messages: the storage keys of a message's attached photos. The
-- photos themselves sit in object storage, the same as triage photos. A new
-- column with a constant default is additive and safe with the previous release
-- still running (docs/completion/migrations.md rule 3).
ALTER TABLE "messages" ADD COLUMN "attachment_keys" TEXT[] DEFAULT ARRAY[]::TEXT[];
