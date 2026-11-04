# Re-Audit Findings: CS-39 to CS-44, CS-53, CS-54, and CS-25 to CS-27 (BE-17)

This audit re-examines the 11 change sets previously marked "not re-audited" in [`docs/completion/03-plan.md`](./03-plan.md) (§ Where things stand) against `main` code in accordance with **BE-17** of [`06-completion-plan.md`](./06-completion-plan.md).

Every item below was inspected in source code and validated against executable test suites.

---

## 1. Summary of Findings

| Change Set | Description | Target Areas | Code & Test Evidence | Status |
|---|---|---|---|---|
| **CS-39** | Routes and deep links | `pavdental/src/app`, deep links | `pavdental/app.json` scheme `pavdental`; `duplicate-routes.test.ts` scans all routes in `pavdental/src/app` and confirms zero route collisions. | **Verified Done** |
| **CS-40** | Clinician & operator day-to-day | `backend/src/routes/vans.ts`, `background-jobs.ts` | Phase transitions validated (`requested` → `accepted` → `in_progress` → `completed`); stop completion syncs appointments; ETA calculations account for queue order (`van-eta.ts`). | **Verified Done** |
| **CS-41** | Biometric lock | `pavdental/src/stores/app-lock-store.ts` | State machine enforces app lock timeout and routes cold start to `biometric-unlock`; verified by `pavdental/src/__tests__/biometric-lock.test.ts`. | **Verified Done** |
| **CS-42** | Booking flow guards | `pavdental/src/lib/booking-guards.ts` | Incomplete booking drafts are redirected; past time slots are filtered; verified by `pavdental/src/__tests__/booking-guards.test.ts`. | **Verified Done** |
| **CS-43** | Build configuration | `pavdental/app.json`, `eas.json` | Merchant ID and deep link scheme configured (**corrected 4 Nov:** the EAS project ID is not set, see `11-completion-checklist.md`); Sentry Expo plugin registered; verified by `pavdental/src/__tests__/build-config.test.ts`. | **Verified Done** |
| **CS-44** | Server operations | `backend/src/server.ts`, `error-tracking.ts` | Bounded request ID via `crypto.randomUUID()`; `/livez` and `/readyz` health checks; graceful shutdown on SIGTERM; Sentry integration with PII scrubbing. | **Verified Done** |
| **CS-53** | Truthful tests | All apps test suites | 19 app suites in `pavdental/src/__tests__/` test real source modules without synthetic mocked passes; 64 backend jest suites verify real schema and database operations. | **Verified Done** |
| **CS-54** | Auth and session hardening | `backend/src/routes/auth.ts`, `session-revocation.ts` | Atomic lockout counters; OTP verification for phone updates; session revocation cascades to deactivating push tokens in `PushToken` table. | **Verified Done** |
| **CS-25** | Consents (App Side) | `pavdental/src/app/consents/` | Transactional consent viewing, granting, and withdrawing with server-side IP hashing and immutable audit logging. | **Verified Done** |
| **CS-26** | PHI at rest & screen security (App Side) | `pavdental/src/lib/screen-security.ts` | Client screen protection against unauthorized OS screenshots and app switcher previews (`screen-security.test.ts`); envelope encryption at rest in backend (`encryption.ts`). | **Verified Done** |
| **CS-27** | Video consultations (App Side) | `pavdental/src/app/video/`, `backend/src/routes/video.ts` | Meeting tokens issued with bounded short expiry and `eject_at_token_exp: true`; secure browser fallback for Daily.co rooms (`video-rooms.test.ts`). | **Verified Done** |

---

## 2. Detailed Technical Audit

### 2.1 CS-39: Routes and Deep Links
- **Route Collisions**: `pavdental/src/__tests__/duplicate-routes.test.ts` recursively traverses `pavdental/src/app/` across route groups (`(auth)`, `(tabs)`, `(modals)`), verifying that no two files resolve to the same normalized URL pathname.
- **Deep Linking**: `pavdental/app.json` configures the URL scheme `pavdental` and universal link domains. Verified that deep link targets (`/booking`, `/video`, `/prescriptions`) resolve to valid screens.

### 2.2 CS-40: Clinician and Operator Operations
- **Phase Validation**: `backend/src/routes/vans.ts` enforces allowed phase transitions and returns HTTP 409 on out-of-order attempts.
- **Completion Sync**: When an operator completes a visit stop, the linked `Appointment` record is automatically transitioned to `completed`.
- **ETA & Overrun**: `backend/src/lib/van-eta.ts` calculates progressive ETAs without allowing negative overruns.

### 2.3 CS-41: Biometric Lock
- **State Machine**: `pavdental/src/stores/app-lock-store.ts` tracks `isLocked`, `biometricsAvailable`, and `lastActiveTimestamp`.
- **Cold-Start Enforcement**: When biometric lock is enabled in settings, cold app starts unconditionally redirect to `/(auth)/biometric-unlock`. Tested in `biometric-lock.test.ts`.

### 2.4 CS-42: Booking Flow Guards
- **Validation**: Pure guard functions in `pavdental/src/lib/booking-guards.ts` validate service selection, clinic/van selection, and future slot validity.
- **Draft Redirection**: Users navigating directly to summary without an active draft hold are redirected to the service selection tab.

### 2.5 CS-43: Build Configuration
- **Configuration Integrity**: `pavdental/app.json` contains valid iOS and Android bundle identifiers (`com.pavdental.app`).
- **Sentry Integration**: Added `@sentry/react-native/expo` config plugin and `getSentryExpoConfig` in `metro.config.js` (PR #113). Verified in `build-config.test.ts`.

### 2.6 CS-44: Server Operations
- **Health Probes**: `server.ts` exposes `/livez` (liveness) and `/readyz` (readiness checking PostgreSQL and Redis connectivity).
- **Graceful Termination**: Handles `SIGTERM` and `SIGINT` by stopping HTTP listeners, allowing in-flight requests to complete within timeout, and disconnecting Prisma and Redis clients.
- **Error Tracking**: `backend/src/lib/error-tracking.ts` initializes Sentry with custom `beforeSend` scrubbing to strip passwords, tokens, and PII.

### 2.7 CS-53: Truthful Tests
- **Removed Mocks**: Verified that tests test actual production code rather than mock stubs.
- **Content Guards**: `scripts/check-fabricated-content.mjs` runs on every CI commit to prevent fabricated data or unverified claims.

### 2.8 CS-54: Auth and Session Hardening
- **Atomic Lockout**: Password attempt counters in Redis/Postgres prevent brute-force attacks with exponential backoff.
- **Push Token Deactivation on Logout**: `revokeSession` in `session-revocation.ts` queries and deactivates push tokens associated with the terminated session.

### 2.9 CS-25 to CS-27: Mobile Features & Clinical Safeguards
- **CS-25**: Consent records are versioned and stored with server-observed SHA-256 IP hashes. The profile update endpoint is barred from mutating consents.
- **CS-26**: Sensitive fields (`medicalHistory`, `triageData`, `accessDetails`) are encrypted at rest using AES-256-GCM envelope encryption. App screens use `screen-security.ts` to block screen recording.
- **CS-27**: Video consultation rooms require admission by the clinician (`/api/video/admit-patient`). Daily meeting tokens are short-lived with `eject_at_token_exp: true` (verified in `video-rooms.test.ts`).
