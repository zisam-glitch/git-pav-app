import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { idempotencyKeyFrom, withIdempotency } from "./idempotency";

type Outcome = { status: number; body?: unknown; error?: string };

/**
 * Runs an existing route handler once per Idempotency-Key (checklist D3). A client that lost the response
 * sends the same key again and gets the first answer back, not a second run or a confusing "already done".
 * Only a successful answer is kept; a failure frees the key so the client can retry. With no key the handler
 * runs exactly as before, so older app builds are unaffected. The key is scoped to the caller, the action and
 * the appointment, so one person's key can never replay another's answer.
 */
export async function runIdempotent(
  req: AuthRequest,
  res: Response,
  action: string,
  handler: (req: AuthRequest, res: Response) => Promise<unknown>
): Promise<void> {
  const header = idempotencyKeyFrom(req.header("Idempotency-Key"));
  if (header === null) {
    await handler(req, res);
    return;
  }
  if (header === "invalid") {
    res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, numbers, dashes, underscores or colons" });
    return;
  }

  const key = `${action}:${req.user!.sub}:${String(req.params.id)}:${header}`;
  const outcome = await withIdempotency<Outcome>(key, async () => {
    // The handler writes to a stand-in for the response, so its answer can be kept and replayed.
    const captured: Outcome = { status: 200 };
    const stand: { status: (code: number) => typeof stand; json: (body: unknown) => typeof stand } = {
      status: (code) => {
        captured.status = code;
        return stand;
      },
      json: (body) => {
        captured.body = body;
        return stand;
      },
    };
    await handler(req, stand as unknown as Response);
    // A failed attempt is not kept (it carries `error`), so the same key can try again.
    return captured.status >= 400 ? { ...captured, error: "failed" } : captured;
  });

  const body = outcome.body ?? { error: outcome.error };
  res.status(outcome.status).json(body);
}
