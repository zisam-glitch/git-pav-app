import { query } from "@/lib/db/client";

/** Website shopper accounts, newest first. Callers must check the staff session. */
export function listShopperAccounts() {
  return query<any>(
    "SELECT id, email, name, phone, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC",
  );
}
