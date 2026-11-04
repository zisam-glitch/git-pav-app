/*
  Migration: 013_drop_shopper_users.sql
  DESTRUCTIVE: deletes shopper accounts (names, emails, phones, password hashes).
  Approved by the owner on 5 Nov 2026 after guest checkout (D-11). Take a backup
  before this deploys: migrations run automatically on the dashboard's first query.

  Orders keep their own customer email and address. CASCADE removes only the
  foreign keys on orders, carts, inventory_logs and audit_logs; their user id
  columns and rows stay.

  Every migration re-runs on each cold start, so 002 recreates an empty table and
  this drops it again. That goes away when migrations move to a deploy step.
*/
DROP TABLE IF EXISTS users CASCADE;
