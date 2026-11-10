# Enterprise-readiness checklist, 10 Nov 2026

A hard look at what still makes the app feel built by one person, and what a team-built, enterprise-grade app would
do instead. It follows [`13-readiness-plan-2026-11-10.md`](13-readiness-plan-2026-11-10.md), which covered
*correctness for patients*. This one covers *engineering quality*: structure, data, speed, reliability, testing,
operations.

## How this was made, and how far to trust it

Counts below come from searching the code on `main` (the `pavdental/` app and the `backend/`). **They are measured, but
they are searches, not a line-by-line review.** Where a number is a rough search (marked *heuristic*), check it before
acting. Nothing was run on a phone. `admin-dashboard/` and `website/` were **not** looked at.

Priority: **P0** do before real patients, **P1** do before scaling past the first clinic, **P2** worth doing, **P3** polish.
Effort: XS under an hour, S half a day, M one to two days, L a week or more.

## The ten things that most read as "one developer"

1. **Rules copied into the app and the server separately.** Cancellation terms, the reschedule window, the check-in
   window, the waiting-room opening time and the deposit are written as text or constants in both places. They will
   drift. The server should send them (A1).
2. **Payment logic lives inside a screen.** `booking/summary.tsx` has a 150-line function that creates the booking,
   creates the payment, opens the sheet, confirms and navigates, with no way to test it except by reading the file's
   text (A2).
3. **Tests that read source files.** 47 of 68 app test files check that a string exists in a file. They cannot catch a
   screen that renders wrong, and they broke when wording changed. There are no component tests and no end-to-end
   run in CI (G1, G2).
4. **No list virtualisation anywhere.** Zero `FlatList`/`FlashList`; 47 screens build lists with `.map` inside a
   `ScrollView` (C1).
5. **Dead code left in.** A cache-persistence module that is never wired up (and uses different key names from the real
   ones), a payment-hooks file nothing imports, an icon registry nothing imports, 5 unused illustration files, a
   structured-logging helper used by no file while the backend calls `console.*` 201 times (A5).
6. **Money shown five different ways.** One shared formatter exists and is used in 37 places, while 5 other helpers and
   inline `toFixed(2)` calls do the same job (B3).
7. **Two ways to fetch data.** React Query hooks in most screens, but 12 screens call `authFetch` directly and handle
   loading and errors by hand. Cache keys are loose strings with no key factory (B1, B2).
8. **Errors as pop-up alerts.** 30 files use `Alert.alert`, next to toasts and inline errors: three styles for one job.
   Some alerts show a payment provider's raw message to the patient (F2).
9. **Hand-typed everything.** 171 uses of `any`, 146 route strings cast with `as never`/`as any`, and 52 string
   comparisons like `status === "confirmed"` instead of one shared type (A3, A4).
10. **Big files that do everything.** 19 screens over 400 lines (largest 880); backend route files of 800 to 1,345 lines
    with business logic written straight into the request handler (A6, I1).

---

## A. Structure and code quality

- [ ] **A1 (P0, M) Send the rules from the server.** App and server both hold the cancellation policy (full, half, none),
      the reschedule window (48 h), the check-in window (48 h), the waiting-room opening (10 min) and deposit rules.
      *Better:* one `GET /api/config/policies` (or fields on the appointment: `canCancel`, `refundIfCancelledNow`,
      `canReschedule`, `checkInOpensAt`) so the app shows what the server will actually do and never has to guess.
      The text I added in `cancellation-policy.ts` is a copy and should become server data.
- [ ] **A2 (P1, M) Move payment orchestration out of the screen** into `useBookingPayment()` or a small state machine
      (idle, creating, paying, confirming, done, failed) that is unit-testable, and keep `summary.tsx` for layout.
      Same for `video/call.tsx`, `van/live-track.tsx`, `records/plans/[id].tsx`.
- [ ] **A3 (P1, M) Use the generated API types everywhere.** `api-contract.gen.ts` is imported by only 2 files, while
      screens use `any` (171 non-test uses). Generate types for every endpoint and replace `any`.
- [ ] **A4 (P1, S) Shared enums, not string literals.** `status`, `channel` and `role` are compared as raw strings in 71
      places. Use one union type and small helpers (`isConfirmed(b)`), so a new status cannot be missed in one screen.
- [ ] **A5 (P1, XS) Delete dead code:** `lib/react-query-persistence.ts`, `features/payment/payment-hooks.ts`,
      `components/better-icons-registry.ts`, the unused illustrations (`designer-keynote`, `designer-working`, `keynote`,
      `color-palette`, `graph-collapse`), and `backend/src/lib/structured-logging.ts` or start using it (see I3).
- [ ] **A6 (P2, L) Split the 19 screens over 400 lines** into a screen plus small components and hooks
      (`records/plans/[id].tsx` 880, `consult-room.tsx` 701, `odontogram.tsx` 686, `live-track.tsx` 642, `home.tsx` 604).
- [ ] **A7 (P2, M) Typed routes.** 146 casts (`as never`) hide wrong paths until a patient taps. Turn on Expo Router
      typed routes and fix them; a renamed screen then fails the build, not the patient.
- [ ] **A8 (P2, S) Turn on `noUnusedLocals` and `noUnusedParameters`** (currently off) and clear what appears.
- [ ] **A9 (P2, XS) Remove the 6 `eslint-disable` lines** or give each a written reason.
- [ ] **A10 (P2, S) Stop swallowing errors.** 58 places write `catch {}` or `.catch(() => {})`. Some are right (a haptic
      buzz); each should be a decision. At least send the rest to `reportCaughtError`.
- [ ] **A11 (P3, S) Lint budget.** The cap is 215 warnings and `main` has 214, so one new `any` can fail CI. Lower the
      count as `any` goes, then lower the cap.

## B. Data and state

- [ ] **B1 (P1, M) One way to fetch.** Move the 12 screens that call `authFetch` directly (video intake, waiting, summary,
      call, message; consent; prescription detail; van check-in; rx dispense; consult room) into React Query hooks so
      loading, error, retry, caching and cancellation behave the same.
- [ ] **B2 (P1, S) A query-key factory** (`keys.appointments.list()`, `keys.slots(params)`), not free strings.
      `"operator-shift"` is typed by hand 14 times; one typo means a screen never refreshes.
- [ ] **B3 (P1, S) One money formatter.** Use `formatGbp` everywhere; remove `pounds()` in `appointment-detail.ts`
      (added in this work, a duplicate), `depositPaidLabel`, and the 8 inline `toFixed(2)` calls. Add a `Money` type or
      keep pence as integers until display.
- [ ] **B4 (P1, S) One time/date module.** 23 `toLocale*` calls and 23 `timeZone` mentions are scattered. Route all
      through `uk-time.ts`; the clinician screens were missed once already (B6 on 9 Nov).
- [ ] **B5 (P1, S) Do not guess prices.** `service-catalog.tsx:98` still falls back to a 25% deposit if the server sends
      none. The server owns the deposit; show an error instead.
- [ ] **B6 (P2, M) Optimistic updates** for the actions that feel slow: mark message read, cancel, change preferences.
      There are none today (0 `onMutate`).
- [ ] **B7 (P2, M) Fetch one appointment, not the list.** The detail screen still loads every appointment to find one,
      and the booking-confirmed screen did too (B4/B5 on 9 Nov). The server has `GET /appointments/:id`.
- [ ] **B8 (P2, M) Decide what survives an app restart.** The booking draft (treatment, clinic, time) is in memory only.
      Save the non-clinical draft locally so a call or a kill does not lose it. Do not persist health answers.
- [ ] **B9 (P2, S) Pagination and infinite lists** for appointments, messages, notifications and documents
      (the API caps at 200 and sends all at once).

## C. Performance

- [ ] **C1 (P0, M) Virtualise long lists** with `FlashList` (appointments, messages, notifications, documents,
      prescriptions, clinician schedule). Today everything renders at once.
- [ ] **C2 (P1, S) Trim the JavaScript bundle.** 19 illustration files total 844 KB of source in the bundle. Load the
      few used as images (or SVG assets), delete the rest. Check the bundle with `expo export --dump-sourcemap` and a
      visualiser; set a size budget in CI.
- [ ] **C3 (P1, S) Image handling.** Only 5 files use `expo-image` (caching, placeholders). Use it for every remote image,
      with sized thumbnails from the server. Local JPEGs are 30 to 90 KB; convert to WebP.
- [ ] **C4 (P1, M) Measure, then fix.** There are no startup, screen-load or JS-frame measurements. Add Sentry performance
      traces (cold start, booking funnel, time-to-first-slot) and set budgets (for example cold start under 2.5 s on a
      mid Android phone).
- [ ] **C5 (P2, S) Memoise on purpose.** 29 `useMemo/useCallback/memo` across 332 files; list rows are not memoised.
      Add `React.memo` to list items once C1 is done and check with the profiler, not by feel.
- [ ] **C6 (P2, S) Check re-renders from the stores.** Several screens destructure the whole Zustand store
      (`const { a, b, c } = useBookingStore()`), so any field change re-renders them. Select single fields.
- [ ] **C7 (P2, XS) Stop polling when the screen is hidden or the app is in the background** (10 timers/polls in
      screens; `waiting`, `live-track`, `consult-room`). Pair with `focusManager`.
- [ ] **C8 (P3, S) Enable Hermes bytecode/`inlineRequires` checks** and confirm the production build has them on.

## D. Reliability and offline

- [ ] **D1 (P1, M) An outbox for messages that must arrive.** Emails and pushes are sent "fire and forget" from the
      request (added in this work). If Postmark is down the email is lost. Write a row (`pending`), send from the job
      runner with retries and back-off, record the result.
- [ ] **D2 (P1, M) Offline behaviour.** Only the van operator's notes queue offline. For patients: show cached
      appointments read-only, queue message replies, and say plainly what needs a connection.
- [ ] **D3 (P1, S) Idempotency on every money or booking action** from the app (a key per attempt exists for create;
      check confirm, cancel, reschedule, payment retry).
- [ ] **D4 (P2, M) One hold, not two.** A slot is held in Redis (10 minutes) and again in the database. The countdown and
      the real expiry can differ. Pick one source of truth.
- [ ] **D5 (P2, S) Backoff and jitter on retries.** Check `retry: 2` with fixed delays against a struggling server.
- [ ] **D6 (P2, S) Remove the mock-payment branch from the shipped app.** `summary.tsx` carries `if (intent.isMock)`
      client-side. The server refuses mock keys when deployed, but the code path should not ship at all.
- [ ] **D7 (P3, M) Graceful degradation** when Redis, Daily, Stripe or Postmark is down: what does the patient see
      for each? Write it down and test it.

## E. Security and privacy (app side)

- [ ] **E1 (P0, S) Never show a provider's raw error text to patients.** `Payment Failed` shows Stripe's `message`.
      Map to plain wording and log the code.
- [ ] **E2 (P1, S) Certificate pinning decision** and jailbreak/root detection decision, written in an ADR.
- [ ] **E3 (P1, XS) Check what the OS keeps.** Task-switcher snapshots (`screen-security` exists), clipboard use,
      keyboard caching on health fields (`autoCorrect`, `secureTextEntry`, `autoComplete="off"` on medical inputs).
- [ ] **E4 (P1, S) Remove health data from query cache logs and Sentry breadcrumbs** and add a test that proves it
      (a scrubber exists; test it with realistic payloads).
- [ ] **E5 (P1, M) Passkeys / Sign in with Apple and Google.** A 15-character password with no alternative will cost
      sign-ups; the decision is open.
- [ ] **E6 (P2, S) Session UX:** show "signed out because of inactivity" rather than a blank welcome screen.
- [ ] **E7 (P2, XS) Dependency hygiene:** `dependabot.yml` exists; add `npm audit` gating (a script exists), a lock-file
      check, and a licence check.

## F. Product, design system and accessibility

- [ ] **F1 (P1, M) Design tokens everywhere.** 394 numeric spacing/size literals in screens against 1,155 token uses;
      12 raw colour literals. Lint for them.
- [ ] **F2 (P1, M) One feedback pattern.** Alerts (30 files), toasts and inline errors all exist. Pick: inline for field
      errors, toast for confirmations, a sheet for decisions, an error screen for blocking failures. Remove
      `Alert.alert` from flows.
- [ ] **F3 (P1, M) Accessibility to a standard.** 156 labels exist, but dynamic type is handled in 4 places,
      the app is light-only and portrait-only, and there is no screen-reader pass on record. Run VoiceOver and TalkBack
      over the 10 main flows, test at 200% text, fix touch targets under 44 pt.
- [ ] **F4 (P1, S) `testID`s on every interactive element.** Only 3 exist; the Maestro flows select by visible text and
      broke when wording changed. Add IDs and switch the flows to them.
- [ ] **F5 (P2, M) Empty, loading, error and offline states** for every list and detail screen, from one `QueryState`
      pattern (it exists; 11 screens that use the main hooks should be checked against it).
- [ ] **F6 (P2, M) Dark mode and larger-screen layout** decision (currently light-only phone-only; fine to defer,
      but decide).
- [ ] **F7 (P2, M) Internationalisation.** No i18n at all (0 files). English-only is fine for launch, but moving strings
      into one place now makes the wording pass, legal review and later Welsh/Punjabi/Urdu feasible.
- [ ] **F8 (P2, S) Haptics, motion and micro-interactions** consistent and respecting "reduce motion".
- [ ] **F9 (P2, M) Product analytics with consent.** None today (no funnel: where do patients drop out of booking?).
      Add privacy-safe events behind the consent switch.
- [ ] **F10 (P3, S) In-app feedback and a "report a problem" button** that attaches version and a scrubbed log.

## G. Testing and quality gates

- [ ] **G1 (P0, L) Component tests.** Add React Native Testing Library and test the real screens: booking summary,
      appointment detail (each status), cancel flow, message thread, check-in. Replace source-reading tests
      (47 files) as you go; keep a few as architecture guards.
- [ ] **G2 (P0, M) Run Maestro in CI** on every pull request against a seeded staging or local stack (EAS or a
      macOS runner with a simulator). Today the 9 flows are not run by CI.
- [ ] **G3 (P1, S) Coverage report and a floor** (for example 70% on `features/`), failing the build when it drops.
- [ ] **G4 (P1, M) Contract tests** between app and backend (the generated types help): CI fails if a response shape
      changes without the app being updated.
- [ ] **G5 (P1, M) Visual regression** (Storybook or screenshots) for the 20 shared components.
- [ ] **G6 (P2, M) Backend integration tests to run against Postgres in CI with a fresh schema every time** (they
      do; check flaky ones such as the intermittent `admin-attention` and backend jest failures seen on 9 to 10 Nov).
- [ ] **G7 (P2, S) Mutation or property tests** on the money, time and policy functions.
- [ ] **G8 (P2, M) Load test script** in the repo (k6) for booking, slots, messages; run before launch.
- [ ] **G9 (P3, XS) Name the test commands in one place** (`npm run verify`) so a new developer runs one thing.

## H. Release, operations and team workflow

- [ ] **H1 (P0, M) Real environments.** Production does not exist; staging is behind. Create production, secrets, domain,
      backups and a restore drill (checklist section 4).
- [ ] **H2 (P1, M) Staged rollout and remote kill switch.** Feature flags (server-driven) and a way to turn off a screen
      or flow without a store release. The minimum-version gate is the start of this.
- [ ] **H3 (P1, M) Over-the-air updates** (`expo-updates`), with a rollback plan and runtime-version policy.
- [ ] **H4 (P1, S) Crash-free and performance dashboards with alerts** in Sentry, an on-call rota, and a one-page
      incident runbook.
- [ ] **H5 (P1, S) Release notes and a changelog** generated from pull requests; version bump automation.
- [ ] **H6 (P2, XS) Housekeeping:** 114 remote branches; a root `README` is missing; `docs/` has 10 folders with no index.
      Delete merged branches, add a README with "run it in 10 minutes", add a docs index.
- [ ] **H7 (P2, S) Branch protection and required reviews** (a `CODEOWNERS` file exists; check it is enforced), and a
      second reviewer for payment, auth and clinical code.
- [ ] **H8 (P2, M) Preview builds per pull request** so non-developers can try a change.
- [ ] **H9 (P3, S) Architecture decision records** for the open choices (OTA updates, passkeys, pinning, offline).

## I. Backend

- [ ] **I1 (P1, L) A service layer.** Route files are 800 to 1,345 lines (`van` 1,345, `booking` 1,255, `admin` 1,245,
      `payments` 845, `video` 842, `auth` 810) with business rules inside the request handler. Move rules into
      `services/` functions with their own tests; keep routes to parse, call, respond.
- [ ] **I2 (P1, S) Bound every list.** About 64 `findMany` calls have no `take` (*heuristic*; examples in `messages.ts`,
      `van.ts`, `van-queue.ts`, `consents.ts`, `rewards.ts`). Add a limit and pagination to each.
- [ ] **I3 (P1, M) One logger.** 201 `console.*` calls while `structured-logging.ts` is used by no file. Use one JSON
      logger with request IDs and the existing scrubber; ship to a log service.
- [ ] **I4 (P1, S) Do not decrypt what the screen does not need.** The patient appointment list decrypts triage data and
      access details for every row (up to 200) on every call. Return them only from the detail endpoint.
- [ ] **I5 (P1, S) Read configuration in one place.** 45 `process.env` reads sit outside `config/` (`NODE_ENV` 6,
      `APP_URL` 3, `DAILY_API_KEY` 2 ...). Validate all of it once at start-up.
- [ ] **I6 (P1, M) A real job queue.** Background work runs from in-process `setInterval` timers behind an advisory lock
      (slot expiry, reminders, van expiry). Use a durable queue (BullMQ on the existing Redis, or Postgres-based) for
      retries, visibility, rate control and dead-letter handling.
- [ ] **I7 (P2, S) Per-account login throttling** and the fixes from the second read (S1, S2 in
      [`14-second-read-2026-11-10.md`](14-second-read-2026-11-10.md)).
- [ ] **I8 (P2, M) API versioning and deprecation policy.** Old app builds exist in the field once released; the
      `410 please update` pattern is a start. Add `/v1`, a header-based minimum version and a documented sunset.
- [ ] **I9 (P2, S) OpenAPI spec generated from the Zod schemas** and published; feeds A3 and G4.
- [ ] **I10 (P2, M) Database review:** confirm indexes against real queries (`EXPLAIN` on slots, appointments, messages),
      add slow-query logging, check connection-pool limits, and test the 47 migrations on a copy of realistic data.
- [ ] **I11 (P2, S) Rate limits per route group** (messages, uploads, slot hold) as well as the global and auth ones.
- [ ] **I12 (P3, S) Remove `any` in the backend** (counted separately; run the same search as for the app).

## J. Questionable decisions to revisit

- [ ] **J1** Cancellation and reschedule rules written in two places (see A1).
- [ ] **J2** Two slot holds, Redis and database (D4).
- [ ] **J3** A mock-payment path inside the shipped app (D6).
- [ ] **J4** A dental practice app with a 15-character password and no passkey or social sign-in (E5).
- [ ] **J5** Light mode and portrait only, with dynamic type handled in 4 places (F3, F6).
- [ ] **J6** Appointment list endpoint decrypts clinical fields for every row (I4).
- [ ] **J7** The balance is paid in person and the app takes deposits only: say so everywhere and show the balance
      (done on the appointment screen; check the receipt and email wording).
- [ ] **J8** Reminders and emails depend on a 1-minute in-process timer (I6, D1).
- [ ] **J9** Consent for "General treatment" stored as a data-consent type (R21, for the DPO).
- [ ] **J10** Tests that read source text count as coverage in the test total (G1).

## K. Corrections to work done earlier in this effort

Being honest about what I added that you should not copy:

- [ ] **K1** `appointment-detail.ts` added a sixth money formatter (`pounds`). Replace with `formatGbp` (B3).
- [ ] **K2** Several new tests I wrote read source text (for example `cancel-wording`, `home-truthful`, `plain-wording`).
      They guard against regressions in wording but are exactly the kind of test G1 should replace.
- [ ] **K3** Booking and cancellation emails send "fire and forget" with no retry (D1).
- [ ] **K4** `cancellation-policy.ts` duplicates the server's policy as text (A1).
- [ ] **K5** The min-version gate shows a fixed message and has no store link until `APP_STORE_URL` is set.

---

## Suggested order

1. **Quality gates first (G1, G2, G3, F4, A11).** Everything else is safer once a screen that renders wrong fails a test.
2. **Real environments and observability (H1, H4, C4, I3).** You cannot tune what you cannot see.
3. **Remove duplication and dead code (A1, A5, B3, B4, B5, D6).** Cheap and removes whole classes of bug.
4. **Data layer (B1, B2, A3, A4, I2, I4).** One way to fetch, typed end to end, bounded and lean.
5. **Performance (C1, C2, C3).** Do after measuring.
6. **Reliability (D1, D2, I6, D4).** The outbox, offline basics, a real job queue.
7. **Then the larger structural work (A2, A6, I1) and product polish (F-items).**

A realistic sizing: items 1 to 3 are about two weeks for one developer; items 4 to 6 about four to six weeks;
item 7 is ongoing.
