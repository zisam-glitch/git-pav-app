import { signToken, verifyToken } from "../auth/jwt.ts";

const ORDER_VIEW_PURPOSE = "order_view";
// Long enough to follow a delivery from the confirmation link.
const ORDER_LINK_SECONDS = 30 * 24 * 60 * 60;

/** The customer's private link to this order. There are no shopper accounts, so it is their only way back to it. */
export function createOrderAccessToken(orderId: string): Promise<string> {
  return signToken({ orderId, purpose: ORDER_VIEW_PURPOSE }, ORDER_LINK_SECONDS);
}

/** Order details hold an email and home address: that order's own link only. */
export async function canViewOrder(orderId: string, accessToken: string | null): Promise<boolean> {
  if (!accessToken) return false;
  const payload = await verifyToken(accessToken).catch(() => null);
  return payload?.purpose === ORDER_VIEW_PURPOSE && payload.orderId === orderId;
}
