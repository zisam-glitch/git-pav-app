/*
  Migration: 015_site_settings.sql
  Settings staff change from the dashboard rather than in the server's
  environment. The first one is "email_alerts": who gets an email when the
  website's contact, booking, job or registration form is sent. Re-running is
  safe.
*/
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
