-- Aggregate token survives answer deletion/recreation and is owned by the server.
ALTER TABLE profile ADD COLUMN answers_revision BIGINT NOT NULL DEFAULT 0 CHECK (answers_revision >= 0);
