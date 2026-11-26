CREATE TABLE profile (
  owner_id VARCHAR(64) PRIMARY KEY,
  display_name VARCHAR(30) NOT NULL,
  date_of_birth DATE,
  version BIGINT NOT NULL DEFAULT 0,
  identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
  suspended BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE answer (
  owner_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  question_id VARCHAR(80) NOT NULL,
  question_version INTEGER NOT NULL,
  status VARCHAR(12) NOT NULL CHECK(status IN ('ANSWERED','DECLINED')),
  choices VARCHAR(4000) NOT NULL,
  sensitive_consent BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(owner_id, question_id)
);
CREATE TABLE experience (
  id UUID PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  city_code VARCHAR(60) NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  interest_open BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK(ends_at > starts_at)
);
CREATE TABLE event_interest (
  owner_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  event_id UUID NOT NULL REFERENCES experience(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(owner_id,event_id)
);
CREATE TABLE safety_exclusion (
  reporter_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  target_id VARCHAR(64) NOT NULL REFERENCES profile(owner_id),
  kind VARCHAR(8) NOT NULL CHECK(kind IN ('BLOCK','REPORT')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(reporter_id,target_id,kind),
  CHECK(reporter_id <> target_id)
);
CREATE INDEX safety_target_idx ON safety_exclusion(target_id,reporter_id);
CREATE TABLE booking_request (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE REFERENCES experience(id),
  state VARCHAR(20) NOT NULL CHECK(state IN ('REQUESTED','HOLD_PENDING','HELD','CONFIRMED','CANCELLED')),
  version BIGINT NOT NULL DEFAULT 0,
  provider VARCHAR(40) NOT NULL,
  confirmation_reference VARCHAR(160),
  CHECK(state <> 'CONFIRMED' OR (confirmation_reference IS NOT NULL AND CHAR_LENGTH(TRIM(confirmation_reference)) > 0))
);
CREATE TABLE booking_command (
  request_id UUID NOT NULL REFERENCES booking_request(id),
  command_key UUID NOT NULL,
  fingerprint VARCHAR(64) NOT NULL,
  result_version BIGINT NOT NULL,
  PRIMARY KEY(request_id,command_key)
);
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  aggregate_id VARCHAR(80) NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX outbox_pending_idx ON outbox(delivered_at,available_at);
