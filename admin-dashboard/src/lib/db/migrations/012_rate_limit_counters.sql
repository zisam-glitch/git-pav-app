/*
  Migration: 012_rate_limit_counters.sql
  Request counts for public routes. Kept in the database because serverless
  instances share no memory. Keys are hashes, so no IP or email is stored.
*/
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key TEXT PRIMARY KEY,
  count INT NOT NULL,
  window_ends_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_window_ends_at ON rate_limit_counters (window_ends_at);
