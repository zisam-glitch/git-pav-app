# What happens when something we depend on is down, 12 Nov 2026

Checklist item D7. For each service the backend leans on: what the patient sees, and whether that is tested or only read
in the code. Nothing here was exercised against a real outage; "tested" means a unit test with the dependency faked.

| Service | What the patient sees | State |
|---|---|---|
| **Redis**, holding a slot | "We couldn't hold that time just now. Please try again in a moment." (503). It never says someone else holds the time. | Already handled; tested (`slot-hold-outage.test.ts`). |
| **Redis**, idempotency (cancel, messages, ending a consult, booking with a key) | The action works. Only the protection against a double send is lost while Redis is down. If Redis fails after the action has happened, the success is still returned. | Changed in this pass; tested (`dependency-outage.test.ts`). It used to be a blanket 500. |
| **Redis**, sign-in code limits | An in-memory limit takes over on that server. | Already handled by design (OTP rate limit); read, not tested here. |
| **Redis**, sign-in failure counters | Every call is guarded, so a Redis failure never blocks sign-in. The counters simply do not count. This favours letting people in over locking them out. | Read, not tested here. A security decision for the owner if it should ever fail the other way. |
| **Stripe**, creating a payment or any call that throws a connection or server error | "A service we rely on isn't responding right now. Please try again in a moment." (503, with a retry hint). It used to be a blanket 500. | Changed in this pass; tested with a faked Stripe error. |
| **Stripe**, a refund on cancel | "We couldn't process your refund just now, so your booking has not been cancelled." The booking is put back as it was, and the retry is safe (same idempotency key). | Already handled; covered by the cancel tests in CI. |
| **Postmark** (email) | Nothing: emails are best-effort with a 5-second timeout and never break booking, cancelling or rescheduling. A failed email is recorded as failed against the visit and shows in the dashboard's "Call and notices" panel. | Already handled; the record is tested. |
| **Daily** (video room) | "The video service didn't respond. Please try again." (502). | Already handled; read, not tested here. |
| **Postgres** (database unreachable) | The same plain 503 message as other outages. Before this pass it was a blanket 500. | Changed in this pass; the error is recognised (tested), not tried against a real database outage. |

## What counts as an outage

`isDependencyOutage` in `backend/src/middleware/error-handler.ts`: Stripe connection or API errors, Redis connection errors,
database connection errors (Prisma P1001, P1002, P1017), timeouts, and the usual network codes (`ECONNREFUSED`,
`ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND`). A declined card, a bad request or a bug of ours is not an outage and is handled
as before: bugs are still a blanket 500 that leaks nothing.

Outages are still reported to the error tracker as server errors; only what the patient sees changes.

## Not done

- No test against a real outage (stop Redis or block Stripe on staging and try the app). Worth doing with the real-device
  pass in the video plan.
- The app's own wording for a 503 is whatever the server sends; it keeps short server messages as they are.
- Daily and sign-in counters were read, not tested.
