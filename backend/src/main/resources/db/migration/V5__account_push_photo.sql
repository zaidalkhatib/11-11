-- Push device tokens + optional profile photo URL for production clients.
ALTER TABLE profile ADD COLUMN photo_url VARCHAR(500);

CREATE TABLE push_token (
  owner_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  token VARCHAR(512) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (owner_id, token)
);

CREATE INDEX push_token_owner_idx ON push_token(owner_id);
