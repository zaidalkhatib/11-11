-- Match confirmation audit + richer outbox payloads stay in outbox.event_type.
-- Arrangements already exist; allocator writes CONFIRMED pairs when matched.
CREATE TABLE match_notification (
  id UUID PRIMARY KEY,
  arrangement_id UUID NOT NULL REFERENCES date_arrangement(id),
  owner_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  event_id UUID NOT NULL REFERENCES experience(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(arrangement_id, owner_id)
);
CREATE INDEX match_notification_owner_idx ON match_notification(owner_id, created_at DESC);
