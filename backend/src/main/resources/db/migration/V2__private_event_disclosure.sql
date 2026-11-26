ALTER TABLE experience ADD COLUMN neighborhood VARCHAR(120) NOT NULL DEFAULT 'Not announced';
ALTER TABLE experience ADD COLUMN time_zone VARCHAR(80);
-- Separate storage prevents a future public SELECT * response from exposing venue details.
CREATE TABLE event_private (
  event_id UUID PRIMARY KEY REFERENCES experience(id),
  venue_name VARCHAR(160) NOT NULL,
  venue_address VARCHAR(300) NOT NULL
);
CREATE TABLE date_arrangement (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE REFERENCES experience(id),
  UNIQUE(id,event_id),
  state VARCHAR(12) NOT NULL CHECK(state IN ('DRAFT','CONFIRMED','CANCELLED'))
);
CREATE TABLE date_participant (
  arrangement_id UUID NOT NULL REFERENCES date_arrangement(id),
  event_id UUID NOT NULL REFERENCES experience(id),
  owner_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  seat INTEGER NOT NULL CHECK(seat IN (1,2)),
  PRIMARY KEY(arrangement_id,seat),
  FOREIGN KEY(arrangement_id,event_id) REFERENCES date_arrangement(id,event_id),
  UNIQUE(event_id,owner_id),
  UNIQUE(arrangement_id,owner_id)
);
-- No automatic arrangement writer exists; future transactional writer must verify
-- exactly two eligible participants, matching event IDs, consents and confirmed booking.
