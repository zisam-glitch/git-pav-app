/*
  Migration: 011_stripe_events_and_refund_amounts.sql
  - processed_stripe_events: one row per Stripe event, so a redelivered webhook
    can't take stock or change an order twice.
  - payments.amount_refunded: running total, so partial refunds are recorded
    without marking the whole order refunded.
*/
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_refunded NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Payments refunded before this column existed were always recorded as full refunds.
UPDATE payments SET amount_refunded = amount WHERE status = 'refunded' AND amount_refunded = 0;
