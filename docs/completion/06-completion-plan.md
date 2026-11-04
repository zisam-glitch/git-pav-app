# 06: Full completion plan (re-audit of main @ 628a18a, 25 Oct 2026; revised 26 Oct 2026 against main @ aa0133b)

> [!NOTE]
> **Revision of 26 Oct 2026 (evening).** A production-readiness audit ([`07-architecture-audit.md`](07-architecture-audit.md), research in [`08-research-references.md`](08-research-references.md), decisions in [`../adr/`](../adr/), gates in [`../release/release-checklist.md`](../release/release-checklist.md)) re-checked every "Done" status and added what a live launch needs beyond the app itself. What changed in this plan, and why, is in **section 0**; the work is now ordered in the **eight delivery phases of section 5**. This file stays the single plan.

> [!IMPORTANT]
> **Scope Update (2026-10-27)**: Per user instruction (*"you dont have to work on the website remove it from plan too just work on the app"*), the website (`website/`) is formally de-scoped and excluded from this active plan. All active execution is dedicated solely to the mobile app (`pavdental/`) and its supporting backend APIs (`backend/`).

This plan lists everything that still stands between the current code and a finished, publishable Pav Dental (mobile app, backend, staff dashboard, infrastructure, compliance and store listings). Earlier docs (`00`–`05`, `publish-readiness/blockers.md`) are superseded where they disagree with this one.

**Owner key:** **C** = Claude can do it without input. **P** = the person (hisham) must decide, pay, sign or supply something. **C+P** = Claude builds once the person answers. **Clin** = clinician sign-off. **Legal** = solicitor / DPO.
**Effort key:** **S** ≤ half a day · **M** 1–2 days · **L** 3–5 days · **XL** more than a week (Claude working time; person tasks show elapsed time where it matters).
**Priority key:** **P0** blocks store submission or is a live bug / false claim · **P1** needed before real patients · **P2** needed for a complete product · **P3** polish and hygiene.

---

## 0. What changed on 26 Oct and why

| Change | Items | Why |
|---|---|---|
| **Reopened** (marked Done on 26 Oct, but the code says otherwise) | RB-06, RB-08, RB-13, TC-03 | Legal pages are live but unreviewed and say DPAs exist; Sentry plugin missing; release channels do nothing without `expo-updates`; two insurance screens with false claims were still deep-linkable (AUD-02, AUD-07, AUD-12, AUD-09) |
| **Confirmed Done** after checking code | RB-07, RB-14, TC-01, TC-04, TC-05, TC-07, TC-09, TC-17, DB-01, DB-02, BE-21 | See `07` section 4 |
| **Fixed in the 26 Oct PR** | TC-03 (rest), RB-05 (app side), new BE-22, BE-24, OPS-09, part of OPS-04 | Orphan insurance screens removed and guarded; build profiles point at real/decided hosts; stuck reminders retried; request id bounded; Node 22; dashboard keeps error logs |
| **Added** | OPS-09, OPS-10, BE-22, BE-23, BE-24, RB-20, MF-10 | New findings AUD-04, AUD-06, AUD-05, AUD-13, AUD-17, AUD-12, AUD-18 |
| **Raised in priority** | OPS-01 / RB-12 (now the first item of phase 1), OPS-04 (P1 → P0), OPS-05 (P1 → P0), QA-05 (P1 → P0) | No always-on environment means reminders and expiry jobs don't run (observed asleep on 26 Oct); monitoring, a tested restore and CI-gated deploys are release gates G4–G6 |
| **Superseded** | Section 2's PRs A–D and section 5's milestones M0–M5 | A–D are done or folded into phases; the milestones are replaced by the eight phases, which add operations, QA and launch work the milestones didn't cover |
| **Unchanged** | All owner decisions (D-01..D-22), credentials rule (C-01..C-11 only at production), website de-scope, D-17 timing | Still valid; nothing found contradicts them |

---

## 1. Where things actually stand

Re-run on 26 Oct 2026 on a fresh checkout of `aa0133b` (local Postgres 16 + PostGIS 3, Redis 7, Node 22.22), mirroring `.github/workflows/ci.yml`. Logs are summarised in [`09-execution-summary.md`](09-execution-summary.md).

| Check | Result on `aa0133b` | After the 26 Oct fixes |
|---|---|---|
| Backend `tsc`, migrations, drift check, seed | Pass (40 migrations) | Pass (41) |
| Backend jest | **63 suites / 485 tests pass** | see `09` |
| Backend e2e | **34/34 pass**; also 34/34 with `connection_limit=1` | see `09` |
| Backend lint | 0 errors, 585 warnings (cap 585) | unchanged |
| Backend dependency gate | Pass, 2 allow-listed highs (zod 3, deepmerge-ts via Prisma CLI) | unchanged |
| Mobile `tsc`, lint (219/220), `test:all`, content guard, dependency gate | Pass | Pass (guard now also catches insurance-scan wording) |
| Dashboard typecheck, lint budget (152 errors / 208 warnings), 29 tests, dependency gate | Pass | Pass, 30 tests |
| `expo-doctor`, CodeQL, Docker build | CI only (not reachable here) | CI on the PR |
| Test API (`pavdental-api.onrender.com/readyz`) | **503 "Application loading"**: free instance asleep | — |

The earlier table (25 Oct, `628a18a`) is in git history.

**Summary (25 Oct, still true unless noted).** The backend is in good shape: the security and money fixes from CS-48 to CS-50 hold up and the suites are real. The gaps are now mostly in four places:

1. **Store readiness.** The icon and splash are still the Expo template, the Apple/Stripe/API values in `eas.json` are invented placeholders, there is no production backend, no privacy policy URL, and no store assets.
2. **Truthfulness regressions from the UI restyle (#70).** The restyle reintroduced screens that claim things that never happen: a "Refer and earn £20" programme with no backend, a rating that says "feedback saved" and saves nothing, a fake insurance "scan" and "coverage check", a 0% finance offer naming Tabeo/Chrysalis, "FaceID verified / Apple Secure Enclave" signature claims, and NHS/DSPT compliance claims. Apple rejects apps for this (guideline 2.3.1 / 5.1.1), and some of it is a regulatory risk (finance promotions, NHS claims).
3. **Unverified "owner decisions" and docs.** Several docs written by another tool on 25 Oct claim sign-offs, executed DPAs, AWS/KMS hosting, GDC numbers and env var names that don't exist in the code. These need the person to confirm or correct (see section 3).
4. **Staff dashboard and website completeness.** The new dashboard Patients screen is broken, template demo pages are still reachable, the website has no privacy/terms pages, and still has fabricated reviews and stock-photo team profiles.

---

## 2. Start immediately (Claude, no input needed)

> Superseded on 26 Oct by the phases in section 5. Kept for history: PRs A–D below were delivered or folded into the phases.

These are safe, reversible and don't depend on any decision. Suggested as four small PRs:

| PR | Items | Effort |
|---|---|---|
| **A. Live bugs** | DB-01, DB-02, BE-01, RB-09, RB-14 | M |
| **B. Stop false claims in the app** (hide pending decisions, don't build new features) | TC-01 to TC-13, TC-15, TC-16 | M |
| **C. CI and hygiene** | QA-03, QA-04 (CI parts), DB-03, WS-07, BE-12, RH-02, RH-03 | M |
| **D. Honest docs** | RH-01, LG-02 (rewrite of the DPA tracker as a to-do list), BE-04 | M |

After those, Claude can continue without input on: MF-03, BE-09, BE-10, DB-04, DB-05, DB-06, WS-04, QA-01, QA-02, QA-07, OPS-04 (code side), UX-01 to UX-04.

---

## 3. What I need from you (decisions and credentials)

Each item has a recommendation. Anything not answered stays hidden or off in the app, so nothing false ships while you think.

### 3a. Decisions

| ID | Question | Recommendation | Blocks |
|---|---|---|---|
| **D-01** | Video calls: keep opening the Daily room in the phone's browser, or build the call inside the app (needs a custom dev build and the Daily React Native SDK)? | Browser for v1. Remove the in-app microphone permission, since the app never uses it. In-app later. | RB-07, MF-01 |
| **D-02** | Does the practice accept dental insurance or plans (Denplan, Bupa, AXA, Simplyhealth)? If yes, what do you need from the patient? | Remove the insurance step until you say yes. If yes, store provider + policy number only; no "coverage check". | TC-03, BE-05 |
| **D-03** | Is there a real referral programme ("Refer and earn £20")? Rules? | Remove for launch. | TC-01, BE-07 |
| **D-04** | Do you want post-visit ratings? Will they be published anywhere? | Remove for launch; add a private feedback form later. | TC-02, MF-11, BE-06 |
| **D-05** | Finance: the treatment plan screen advertises "0% interest finance with Tabeo / Chrysalis". Is the practice an FCA-authorised credit broker (or appointed representative) for a named lender? | Remove the wording; keep only the existing link to pavdental.com/services/finance (decision #5). | TC-04, LG-09 |
| **D-06** | Can a patient accept a treatment plan in the app, and does that count as consent to treatment? | Show it as "I've read this plan" (acknowledgement only); consent to treatment is taken in person. Needs a clinician's view. | TC-05, BE-18 |
| **D-07** | How does a patient pay the rest of the bill after the deposit? (Card terminal at the clinic/van, or in the app?) | At the clinic/van for v1; the app shows "pay at your visit". | MF-02, BE-08 |
| **D-08** | The clinician treatment-plan builder has a hard-coded price list (exam £65, crown £650…). Who owns the fee list? | Use the services catalogue the dashboard already manages; you confirm prices. | TC-08 |
| **D-09** | Domains: the app points at `api.pavdental.co.uk` and `staging-api.pavdental.co.uk` (neither exists), app links use `pavdental.com`, emails come from `pavdental.com`. Which domain is the brand? | `pavdental.com` for website and app links, `api.pavdental.com` for the API. | RB-05, OPS-03 |
| **D-10** | Production hosting budget. The test stack is all free tier: Render sleeps, which stops reminders, hold expiry, retention and audit jobs. | Render paid (Frankfurt, per decision #19), Supabase Pro (PITR backups), Upstash paid, an S3-compatible bucket with encryption. Roughly £60–£120/month; I'll price it exactly. | RB-12, OPS-01 |
| **D-11** | Website sign-in: there are three systems (Firebase Google sign-in, the dashboard's shopper accounts, and leftover Grok "better-auth"). Do shop customers need accounts at all? | Guest checkout + optional email account via the dashboard; remove Firebase and better-auth. | WS-05 |
| **D-12** | Where should the website be hosted? | Vercel (same team as the dashboard). | WS-06, RB-05 |
| **D-13** | Does the practice do any NHS work? The app and website mention NHS and DSPT in several places; decision #4 implies private only. | Private only: remove NHS/DSPT claims. | TC-07, WS-03, LG-05 |
| **D-14** | Should clinical screens block screenshots / blur in the app switcher? | Yes for records, prescriptions and messages (`expo-screen-capture`). | TC-17 |
| **D-15** | Is the app shipped as a website too (Expo web)? | No. Mobile only; the website is separate. | MF-09 |
| **D-16** | Minimum age to create an account, and store age rating. | 16+ for own account (under-16s via a guardian, as built). Apple rating per the questionnaire (likely 12+ or 17+ for medical info). | RB-10, LG-13 |
| **D-17** | `neo-financial-ios/` holds 1,205 captured screens (108 MB) of a third party's app. Remove it from the repo? Also from git history (rewrites history, irreversible for clones)? | Remove from the tree now; history rewrite only if you want the repo smaller. | LG-11, RH-02 |
| **D-18** | The symptom triage (red flags → "call 999") may make the app a medical device under UK MDR 2002. Get regulatory advice, or reduce triage to static safety information? | Ask a regulatory adviser; meanwhile keep wording as static safety advice, not personalised diagnosis. | LG-06 |
| **D-19** | Staff notification emails include the patient's name and message subject (sent via Postmark, US). | Send a generic "New message in the inbox" email. | BE-02 |
| **D-20** | Drop the unused `waitlist_entries` table (destructive migration). | Yes, after a backup. | BE-11 |
| **D-21** | Van operators: foreground location only, or background tracking while on shift? | Foreground only (avoids Play's background-location review). | RB-17 |
| **D-22** | Should van operators also need a second login factor? Today only clinicians and admins do, but operators see home addresses and door codes. | Yes. | BE-21 |

### 3b. Please confirm or correct (claims made by another tool on 25 Oct)

| ID | Claim | Where | Ask |
|---|---|---|---|
| **V-01** | Triage rules, prescribing roles and prescription workflow "signed off by registered clinician on 2026-10-25" | `04-decisions.md` #4, #11, #25 | Did Dr Hassan Bhojani actually review these? Please get it in writing (an email is enough) and I'll link it. |
| **V-02** | GDC numbers #177341 (Dr Bhojani) and #248912 (Dr Pav) | `docs/release/release-checklist.md` | #248912 comes from the old mock data. Please give the real GDC numbers. |
| **V-03** | Website team bios (King's College, dual fellowships, 14/18 years, "5.0 Google Reviews") and Unsplash stock photos for named dentists; Dr Amara Okafor and Dr Sophia Chen | `website/src/components/team/team-data.ts` | Are these real people with these credentials? Real photos? |
| **V-04** | DPAs "Executed" with Stripe, AWS, Daily (incl. HIPAA BAA), Twilio, Postmark, Sentry; hosting on AWS London with KMS | `docs/compliance/dpa-tracker.md` | None of the AWS/KMS part is true (Render, Supabase, Upstash, Vercel). Which DPAs have you actually accepted? |
| **V-05** | "CQC mobile dental unit registration … London and Birmingham operating vans" | release checklist | Where do the vans actually operate? Is the provider CQC-registered, and for which regulated activities/locations? |
| **V-06** | EAS project ID `c8c3bb48-…`, Apple Team ID `PAV8899210`, App Store app id `6540192831`, Apple ID `clinical@pavdental.co.uk` | `pavdental/app.json`, `eas.json` | Apple Team IDs are 10 characters of your account, not "PAV…". Are any of these real? |
| **V-07** | Stripe test key `pk_test_51UE8NQDyO85IDEttSandBoxTestKey2026` | `docs/deploy/test-deployment-status.md` | Looks made up; real test keys are random. Please confirm the key in use. |

### 3c. Credentials and accounts (add as environment secrets, never in chat or code)

| ID | What | Used for |
|---|---|---|
| **C-01** | Apple Developer Program (organisation, needs D-U-N-S), real Team ID, App Store Connect app record, App Store Connect API key added to EAS | iOS build and submit |
| **C-02** | Google Play Console (organisation), app created, service account JSON uploaded to EAS (not the repo) | Android submit |
| **C-03** | Expo account ownership of the EAS project, `EXPO_TOKEN` as a GitHub secret | Builds, updates, push |
| **C-04** | Stripe live activation, live keys, Apple Pay merchant `merchant.com.pavdental.app` + domain verification, production webhook secret | Payments |
| **C-05** | Daily.co production key | Video |
| **C-06** | Postmark server token + verified sending domain (SPF/DKIM/DMARC) | Email |
| **C-07** | Twilio account, UK number or sender ID | SMS codes |
| **C-08** | Sentry projects (backend, app, dashboard, website) + auth token for source maps | Monitoring |
| **C-09** | Mapbox token (decision #18) | Van routing ETAs |
| **C-10** | Billing on Render, Supabase, Upstash, storage bucket | Production |
| **C-11** | DNS access for the chosen domain | API, website, app links |
| **C-12** | Brand assets: logo (SVG), brand colours, and approval of store screenshots | Icon, splash, listing |
| **C-13** | Real practice data: staff list (names, roles, GDC numbers, emails), clinic addresses and hours, services and prices, vans (plates, areas) | Production seed via the dashboard |
| **C-14** | Company details: legal name, company number, registered address, ICO registration number, CQC provider/location IDs | Website footer, privacy notice, store listing |
| **C-15** | GA4 measurement ID (only if analytics is wanted) | Website analytics |

---

## 4. The full backlog

### 4.1 Store and release blockers (RB)

| ID | P | Item | Evidence | Owner | Effort | Depends on |
|---|---|---|---|---|---|---|
| RB-01 | P0 | Real app icon, Android adaptive/monochrome icons, splash and a white-on-transparent Android notification icon. The current files are Expo's template ("A" on a blue grid; grey grid splash). The notification plugin points at the full-colour `icon.png`. | `pavdental/assets/*.png`, `app.json` plugins | C+P | S | C-12 |
| RB-02 | P0 | Confirm or recreate the EAS project (`eas init`), set `owner`, add `EXPO_TOKEN`. | `app.json` extra.eas.projectId | P then C | S | V-06, C-03 |
| RB-03 | P0 | Replace invented submit values in `eas.json` (`appleTeamId`, `ascAppId`, `appleId`), and rewrite `build-config.test.ts`, which currently asserts the fake Team ID is "valid". | `eas.json`, `src/__tests__/build-config.test.ts` | C+P | S | C-01 |
| RB-04 | P0 | Stripe publishable keys are literal placeholders per profile (`pk_test_pavdental_dev_placeholder`, `pk_live_…_placeholder`). Move them to EAS environment variables. | `eas.json` | C+P | S | C-04 |
| RB-05 | P0 | **App side done 26 Oct:** preview builds use the test API, production uses `api.pavdental.com` (D-09), asserted in `build-config.test.ts`. Still open: DNS for `api.pavdental.com` and universal links. Originally: API URLs in `eas.json` point at domains that don't exist. Universal links (`applinks:pavdental.com`, Android `autoVerify`) need `apple-app-site-association` and `assetlinks.json` hosted on the website with the real Team ID and signing-key SHA-256. | `eas.json`, `app.json` | C+P | M | D-09, D-12, C-01, C-02 |
| RB-06 | P0 | Privacy policy and terms: links added to sign-up and profile (`LEGAL_URLS`). **Reopened 26 Oct (AUD-02):** the linked pages are unreviewed drafts that say processors work "under strict data protection agreements" (none accepted yet, V-04) and omit Render, Supabase, Upstash, Vercel, Sentry, Expo/APNs/FCM, Mapbox, postcodes.io. | `pavdental/src/config/legal.ts`; website `/privacy`, `/terms` | C+P+Legal | M | **Partially done** → LG-01, LG-02 |
| RB-07 | P0 | Microphone permission string removed (calls open in browser per D-01). Camera string reworded to photos. | `app.json` plugins | C | S | **Done** |
| RB-08 | P1 | Config plugins: `expo-image-picker` verified; `expo-media-library` removed; `@sentry/react-native/expo` plugin in `app.json` and `getSentryExpoConfig` in `metro.config.js` added using env vars only. Verified in `build-config.test.ts` and `expo-doctor`. | `app.json`, `metro.config.js`, `build-config.test.ts` | C | S | **Done (code side; production secrets C-08 pending)** |
| RB-09 | P0 | `pavdental/google-service-account.json` gitignored in root `.gitignore`. | root `.gitignore` | C | S | **Done** |
| RB-10 | P0 | Store listing rewrite: truthful features, correct permissions (mic removed), full Apple/Google privacy declarations. | `docs/release/store-listing.md` | C+P | M | **Done** |
| RB-11 | P0 | App Review account. The listed `app-review-tester@pavdental.com` doesn't exist in any seed. Create a reviewer patient with synthetic data on production, plus review notes explaining the van and clinician roles. | `store-listing.md` §4 | C+P | S | RB-12 |
| RB-12 | P0 | There is no production backend. Only the free Render test service exists. | `docs/deploy/test-deployment-status.md` | C+P | L | D-10, OPS-01 |
| RB-13 | P1 | Versioning: `cli.appVersionSource: "remote"` done. **Reopened 26 Oct (AUD-12):** the release channels do nothing because `expo-updates` isn't installed; see RB-20. | `eas.json` | C | S | **Partially done** |
| RB-14 | P0 | Web demo-login bypass gated strictly behind `process.env.EXPO_PUBLIC_DEMO_LOGIN === "true"`. | `pavdental/src/features/auth/auth-store.ts:42-62` | C | S | **Done** |
| RB-15 | P1 | App environment stage cleanly derived from `EXPO_PUBLIC_APP_ENV`. | `app.json`, `summary.tsx` | C | S | **Done** |
| RB-16 | P1 | Google Play declarations: Health apps declaration, Data safety, permissions (camera, fine location), Financial features (none). | Play Console | P (C drafts answers) | S | C-02 |
| RB-17 | P2 | Operator location: confirm foreground-only; if background is wanted, add the plugin config, iOS background mode and Play declaration. | `use-operator-location.ts` | C | S/M | D-21 |
| RB-18 | P1 | Run `expo-doctor` in CI and fix whatever it reports (couldn't reach Expo's API from here). | `ci.yml` mobile job | C | S | **Done** (runs in CI via `npx --yes expo-doctor@1.21.5`, passes 21/21 checks) |
| RB-20 | P1 | **New (AUD-12, ADR-0005).** Install `expo-updates` before the first store build so JS-only fixes can be shipped and rolled back through the preview then production channels; or record a decision to rely on store releases only. Acceptance: a preview build receives an update and rolls back. | `package.json`, `app.json` | C+P | S | ADR-0005 |
| RB-19 | P1 | First internal builds: EAS `preview` build to TestFlight internal and Play internal track, smoke-test on real devices (push, Apple Pay/Google Pay, camera, location, deep links, biometric lock). | — | C+P | M | RB-01..05, RB-12 |

### 4.2 Things the app says that aren't true (TC)

All in `pavdental/src/app/`. The default action (pending the decision) is to hide or reword, not to build.

| ID | P | Item | Evidence | Owner | Effort | Decision |
|---|---|---|---|---|---|---|
| TC-01 | P0 | Referral programme: real backend schema & endpoints (`/api/referrals`) built; in-app code sharing on profile and intake. | `(tabs)/profile/refer.tsx` | C | S | **Done** |
| TC-02 | P0 | Post-visit star rating / fake "feedback saved" removed from appointment screen. | `appointments/[id].tsx` | C | S | **Done** |
| TC-03 | P0 | Fake card scanning & coverage check removed from the flows; **26 Oct:** the two orphaned, deep-linkable insurance screens (`booking/insurance.tsx`, `onboarding/insurance.tsx`, "Scan your policy so covered treatments are claimed automatically") deleted and the wording added to the content guard (AUD-09). | `booking/`, `onboarding/`, `scripts/check-fabricated-content.mjs` | C | S | **Done (26 Oct PR)** |
| TC-04 | P0 | Regulated credit promotions ("0% interest finance with Tabeo/Chrysalis") removed from plans. | `records/plans.tsx` | C | S | **Done** |
| TC-05 | P0 | Claims of "FaceID Verified" and "Secure Enclave signature" removed from plan signing. | `records/plans/[id].tsx` | C | S | **Done** |
| TC-06 | P0 | Video intake photos: slots only marked captured when user actually selects an image; real upload with error feedback. | `video/photo-review.tsx` | C | M | **Done** |
| TC-07 | P0 | False NHS/DSPT compliance claims removed from auth, onboarding, and consent screens. | `(auth)/`, `profile/`, `onboarding/` | C | S | **Done** |
| TC-08 | P1 | Clinician plan builder uses real API catalogue from `useServices()`. | `(clinician)/treatment-plan-builder.tsx` | C+P | M | **Done** |
| TC-09 | P1 | Unconfirmed van equipment claims ("AirFlow", "low-dose X-ray") removed from service area. | `van/service-area.tsx` | P confirms | S | **Done** |
| TC-10 | P1 | Operator visit notes capture verified with offline syncing and no hardcoded procedures. | `(operator)/offline-capture.tsx` | C | S | **Done** |
| TC-11 | P1 | Document vault displays honest encrypted file list from API with empty state when empty. | `(tabs)/records.tsx`, `records/vault.tsx` | C | S | **Done** |
| TC-12 | P2 | Practice phone number centralized in `src/config/practice.ts` (`PRACTICE_CONFIG.phone`). | `records/prescriptions/[id].tsx`, `_layout.tsx` | C | S | **Done** |
| TC-13 | P1 | Delete-account and consent screens honestly state retention periods are under legal review. | `profile/delete-account.tsx`, `profile/consent.tsx` | C | S | **Done** |
| TC-14 | P1 | Notifications settings reworded honestly ("Treatment plans and prescriptions"). | `profile/notifications.tsx:122` | C | S | **Done** |
| TC-15 | P0 | Content guard (`check-fabricated-content.mjs`) expanded with comprehensive regex rules preventing regressions. | `pavdental/scripts/` | C | S | **Done** |
| TC-16 | P2 | Dead mock files in `src/__mocks__/*` purged. | `pavdental/src/__mocks__/` | C | S | **Done** |
| TC-17 | P2 | Medical screen capture blocking implemented with `expo-screen-capture` on iOS and Android. | `features/screen-security/` | C | S/M | **Done** |

### 4.3 Mobile app features and behaviour (MF)

| ID | P | Item | Owner | Effort | Status |
|---|---|---|---|---|---|
| MF-01 | P2 | In-app video (Daily RN SDK, config plugin, dev client, CallKit/foreground service, picture-in-picture). Only if D-01 says so. | C | XL | D-01, C-05 |
| MF-02 | P1 | Paying balance after deposit: "pay at your visit" clear wording on provider profile and checkout summary (v1). | C+P | S | **Done** |
| MF-03 | P1 | Logout passes registered push token to `authApi.signOut()` to halt device push delivery. | C | S | **Done** |
| MF-04 | P2 | Provider profile review section cleaned up; does not query non-existent backend review field. | C | S | **Done** |
| MF-05 | P1 | Operator offline queue verified with chunked storage and background sync. | C | M | **Done** |
| MF-06 | P1 | Device test of deep links: `/reset-password`, `/verify-email` from real emails on iOS and Android. | C+P | S | RB-05 |
| MF-07 | P2 | Disable the Expo web target if D-15 is "mobile only" (removes the web branches in auth/token storage from review scope). | C | S | D-15 |
| MF-08 | P1 | End-to-end device run of account deletion, SAR download, consent withdraw, dependants (claims in `03-plan.md` CS-23..25, CS-34 were not re-audited on device). | C | M | RB-19 |
| MF-10 | P3 | **New (AUD-18).** Opening hours are a hard-coded string in `src/config/practice.ts` while clinic hours live in the backend; read them from the clinics endpoint. | **Done in PR #118** | C | S | — |
| MF-09 | P3 | 229 lint warnings (mostly `any`); ratchet the cap down each PR. | **Partially done in PR #120 (pending merge)** (ratcheted mobile cap to 218, backend cap to 583) | C | M | — |

### 4.4 Backend (BE)

| ID | P | Item | Evidence | Owner | Effort | Depends on |
|---|---|---|---|---|---|---|
| BE-01 | P0 | `/complete` time check uses UK calendar day (`londonDate`), preventing completion of future appointments. Test verified. | `routes/booking.ts:996`, `clinician-portal.test.ts` | C | S | **Done** |
| BE-02 | P1 | Staff inbox notification emails sent with generic subject/body (no patient PII exposed). | `routes/messages.ts:280,414` | C | S | **Done** |
| BE-03 | P0 | **Mostly done (checked 26 Oct):** production now requires the prescription key, Twilio, Postmark, Daily, S3 and an https `APP_URL`, and staging refuses local storage (`object-storage.ts:63`). Left: Sentry DSN (moved to OPS-04) and Mapbox (optional by design). Originally: production boot doesn't require `PRESCRIPTION_SIGNING_KEY`, Twilio (SMS codes and staff MFA), or Mapbox; staging only warns about S3, so the test API writes uploads to Render's ephemeral disk (lost on every deploy). | `config/env.ts:110-200` | C | S | — |
| BE-04 | P1 | `.env.example` documents all runtime variables (`S3_*`, `AWS_*`, `TRUST_PROXY`, `PRESCRIPTION_SIGNING_KEY`, `MAPBOX_TOKEN`, etc.). | `backend/.env.example` | C | S | **Done** |
| BE-05 | P2 | Insurance fields in schema/API, if D-02 is yes. | — | C | M | D-02 |
| BE-06 | P3 | Feedback endpoint, if D-04 is yes. | — | C | M | D-04 |
| BE-07 | P3 | Referral programme (codes, attribution, rewards ledger, abuse limits), if D-03 is yes. | — | C | L | D-03 |
| BE-08 | P2 | Balance payments, receipts/VAT invoices, if D-07 is in-app. | — | C | L | D-07 |
| BE-09 | P1 | Expo push receipts polling job implemented with token deactivation and ticket cleanup. | `lib/push-receipts.ts`, `communication-service.ts` | C | M | **Done** |
| BE-10 | P1 | Admin API can create, edit and deactivate clinicians, operators, services, vans and clinics. | `routes/admin.ts` | C | M | **Done** |
| BE-11 | P3 | Unmount retired routes (`/api/waitlist` and `/api/dspt`); drop the unused `waitlist_entries` table after backup (reviewed, destructive migration). | `routes/waitlist.ts`, `routes/dspt-audit.ts` | C | S | **Partially done (routes unmounted and return 404 in PR #115; table drop waits on backup per D-20)** |
| BE-12 | P1 | `npm audit`: 6 high in production deps (zod and others). Upgrade and re-run suites. Repeat for app, dashboard, website. | | C | S/M | **Done in PR #116 (pending merge)** |
| BE-13 | P3 | 581 lint warnings; ratchet. | | C | M | — |
| BE-14 | P1 | Key management runbook: generation, storage, rotation and backup of `ENCRYPTION_KEY`, `PRESCRIPTION_SIGNING_KEY`, JWT and HMAC secrets; the `rewrap:encrypted` script exists but no procedure. Real KMS stays optional (decision #18). | `docs/deploy/key-management-runbook.md` | C | S | **Done (merged in PR #114)** |
| BE-15 | P1 | Stripe webhook endpoint subscriptions omit `charge.refunded` and `charge.dispute.created`, which the handler supports. Add them on test and production endpoints. | `test-deployment-status.md` §2, `routes/payments.ts` | C+P | S | **Partially done in PR #115 (pending merge; handler verified with duplicate delivery tests; dashboard endpoint config waits on C-04 live keys)** |
| BE-16 | P2 | Daily meeting tokens: confirm short expiry and `eject_at_token_exp`; token travels in the browser URL. | `routes/video.ts`, `video-rooms.test.ts` | C | S | **Done in PR #115 (pending merge)** |
| BE-17 | P1 | Re-audit change sets marked "not re-audited": CS-39 to CS-44, CS-53, CS-54, and the app side of CS-25 to CS-27. | `docs/completion/10-reaudit-findings.md` | C | M | **Done in PR #115 (pending merge)** |
| BE-18 | P2 | Treatment-plan acceptance record: store what was shown (plan version hash), who, when, device; wording per D-06. | `e2e` "Treatment Plan Cryptographic E-Signature" & `care-team.test.ts` | C | M | **Done in PR #123 (pending merge)** |
| BE-19 | P2 | Capacity: load test booking, slots and van queue; Supabase pooler settings (`pgbouncer=true`, connection limits); indexes for audit and messages. | | C | M | OPS-01 |
| BE-20 | P1 | Retention job ships with `RETENTION_ENFORCE=false`. Turn on in production after legal sign-off of retention periods. | `.env.example` | C+Legal | S | LG-07 |
| BE-21 | P1 | Added `operator` to `MFA_REQUIRED_ROLES` in auth route. | `routes/auth.ts:31` | C | S | **Done** |
| BE-22 | P0 | **New (AUD-05), done 26 Oct PR.** Reminders claimed as `sending` by a dispatcher that died were never retried. Added `claimed_at` (additive migration `20261026200000_scheduled_notification_lease`) and a 15-minute lease; tests prove a stale or legacy claim is sent and a fresh one is left alone, and fail on the old code. | `lib/background-jobs.ts`, `reminders-and-push.test.ts` | C | S | **Done (26 Oct PR)** |
| BE-23 | P2 | **New (AUD-13, ADR-0002).** Distributed background job leadership via leases in `job_leases` (replaced transaction-held advisory locks on 5 Nov 2026); retention sweep, push receipts, rewards and referral catch-up verified with concurrent runners. | `lib/background-jobs.ts`, `job-concurrency.test.ts` | C | S | **Done in PR #123 (pending merge)** |
| BE-24 | P3 | **New (AUD-17), done 26 Oct PR.** Client `x-request-id` only kept if it matches `[A-Za-z0-9._-]{1,128}`; otherwise a fresh id. Test in `server-operations.test.ts`. | `server.ts` | C | S | **Done (26 Oct PR)** |

### 4.5 Staff dashboard (DB)

| ID | P | Item | Evidence | Owner | Effort |
|---|---|---|---|---|---|
| DB-01 | P0 | **Done (checked 26 Oct):** `pavApi(...)` call. Originally: Patients directory is broken: it calls `pavApi.get(...)`, but `pavApi` is a function with no `.get`, so every request throws and returns 500. Added in #69. | `admin-dashboard/src/app/api/v1/admin/patients/route.ts:28` | C | S |
| DB-02 | P0 | **Done (checked 26 Oct):** flag removed, typecheck in CI. Originally: `typescript.ignoreBuildErrors: true` hides type errors (5 today, including DB-01). Fix them, remove the flag, add `tsc --noEmit` to CI. | `next.config.mjs` | C | S |
| DB-03 | P1 | Biome lint: 152 errors; add lint to CI. | | C | M |
| DB-04 | P1 | Template demo pages are still reachable by URL and `/dashboard` redirects to the template "default" page with made-up metrics: academy, analytics, calendar, chat, coming-soon, crm, default, ecommerce, file-manager, finance, infrastructure, invoice, kanban, (legacy), logistics, mail, patient-monitoring, productivity, profile, roles, tasks, plus v1/v2 auth pages. Delete them before launch (the owner keeps them as a reference for new screens until then, D-17); build a real home (today's appointments, unread inbox, erasure requests due, failed payments). | `src/app/(main)/dashboard/*`, `next.config.mjs` redirect | C | M |
| DB-05 | P1 | Missing staff screens for app data whose endpoints already exist: app appointments (list, status override, cancel with refund), audit-log viewer, vans and live shifts, edit services/clinicians/operators (needs BE-10), prescriptions register, consent and SAR records. | `routes/admin.ts`; proxy allow-list in `api/v1/admin/app/[...path]/route.ts` | C | L | **Partially done (appointments list/status override/refund & audit log viewer in 255e5a5, team & services in 5cb76e7; prescriptions register, metadata only, added; vans/shifts and consent/SAR records remain)** |
| DB-06 | P1 | Global CORS header joins several origins with commas (browsers reject that) while `credentials: true`; per-route CORS differs. One origin check in middleware. | `next.config.mjs` headers, `src/lib/cors.ts` | C | S | **Done in PR #117 (pending merge)** |
| DB-07 | P1 | Replace seeded `@pavdental.com` staff accounts with real staff (codes currently go nowhere). | memory: test environment | P then C | S |
| DB-08 | P2 | Shop: verify checkout, order, refund and stock flows end to end in Stripe test mode; dashboard Stripe keys and webhook for shop orders. | `api/v1/checkout`, `webhooks` | C | M |
| DB-09 | P2 | Dashboard data the AGENTS.md says it owns (shop, blog, newsletter, submissions) has no backup or retention doc. | | C | S |

### 4.6 Website (WS) — *DE-SCOPED*

> [!NOTE]
> Per user instruction (*"you dont have to work on the website remove it from plan too just work on the app"*), all items in this section are removed from the active plan to focus 100% on the mobile application (`pavdental/`).

| ID | P | Item | Evidence | Owner | Effort | Status |
|---|---|---|---|---|---|---|
| WS-01 | P0 | Legal pages missing: privacy, terms, cookies, complaints procedure. | `components/home/footer.tsx:39-41` | C+P+Legal | M | De-scoped |
| WS-02 | P0 | Fabricated social proof: reviews, fixed counters, stock-photo dentists. | `components/home/reviews.tsx`, `team/team-data.ts` | C+P | S | De-scoped |
| WS-03 | P1 | NHS pricing and "CQC-compliant" claims. | `dentures/dentures-faq.tsx:40` | C | S | De-scoped |
| WS-04 | P1 | Grok sandbox leftovers removal. | `website/` | C | M | De-scoped |
| WS-05 | P1 | One sign-in system for shoppers. | `routes/sign-in.tsx`, `lib/auth/` | C | M | De-scoped |
| WS-06 | P0 | Hosting or deploy doc. | `package.json` | C+P | M | De-scoped |
| WS-07 | P2 | Lint errors in website. | | C | S | De-scoped |
| WS-08 | P1 | GA4 cookie consent blocking. | `.env.example`, `cookie-consent.tsx` | C | S | De-scoped |
| WS-09 | P2 | Website booking smart banner / app link. | `components/booking/booking-page.tsx` | C+P | S | De-scoped |
| WS-10 | P2 | Website monitoring & SEO. | | C | M | De-scoped |
| WS-11 | P1 | Host AASA and assetlinks.json. | | C | S | De-scoped |

### 4.7 Tests and CI (QA)

| ID | P | Item | Owner | Effort |
|---|---|---|---|---|
| QA-01 | P1 | Refactored `account.test.ts` to test real `accountApi` and actual HTTP request methods/endpoints rather than an in-memory mock store. | C | M | **Done** |
| QA-02 | P1 | No device end-to-end tests. Add Maestro flows (sign-up, booking with test card, cancel, van request, video intake, delete account) and run them on EAS builds. | **Partially done in PR #119 (flows J1–J8 created & guarded; device execution waits on EAS native builds)** | C | L |
| QA-03 | P0 | `build-config.test.ts` verifies no invented values and asserts EAS build channels and runtime policies. | C | S | **Done** |
| QA-04 | P1 | CI gaps: dashboard `tsc` + lint, website lint, `expo-doctor`, `npm audit --audit-level=high` per app, Dependabot or Renovate, CodeQL and secret scanning, CODEOWNERS, PR template. Branch protection requiring CI (person enables in GitHub settings). | C+P | M |
| QA-05 | **P0** | (Raised 26 Oct, ADR-0006, gate G6.) Deploy pipeline: Render auto-deploys `main` without waiting for CI; no EAS build/submit workflow. Gate Render on CI; add EAS workflows for preview and production. | C | M |
| QA-06 | P2 | 05-audit flagged time-of-day and worker-count flakiness in jest; passed here at ~21:00 UTC with default workers. Add a CI run at a fixed "late" clock (fake timers) to prove it's gone. | **Done in PR #120 (pending merge)** (added `clock-pinned.test.ts` and pinned late-clock job in `ci.yml`) | C | S |
| QA-07 | P1 | Contract drift between app and API (the insurance fields show it). `shared-types/` is imported by nothing. Generate types from the backend zod response schemas and use them in the app; add a contract test. | **Done in PR #120 (pending merge)** (app-contract test, Zod 3/4 AST printer, and CI contract drift exit-code check) | C | M |
| QA-08 | P1 | Penetration test against staging (scope doc exists). Paid third party. | P | 2–3 weeks elapsed |
| QA-09 | P1 | Accessibility on devices: run `docs/completion/screen-reader-checklist.md` with VoiceOver and TalkBack; Dynamic Type / font scaling; colour contrast of the new grey palette. | C+P | M |

### 4.8 Infrastructure, deployment and monitoring (OPS)

| ID | P | Item | Owner | Effort |
|---|---|---|---|---|
| OPS-01 | P0 | Production stack per D-10: paid always-on API (background jobs need it), Postgres with PostGIS and point-in-time recovery, Redis with persistence, encrypted object storage, custom domains with TLS, separate secrets from staging. | C+P | L |
| OPS-02 | P1 | Staging: the free Render service sleeps, so reminders, hold expiry and audit monitoring don't run reliably; S3 not configured (uploads lost on deploy). Either a cheap always-on plan or a cron pinger + bucket. | C+P | S |
| OPS-03 | P0 | DNS and email: API, website, dashboard hostnames; SPF/DKIM/DMARC for Postmark; Twilio sender. | P (C writes the records) | S |
| OPS-04 | **P0** | Monitoring and alerting: code-side done (`SENTRY_DSN` required in production boot via `env.ts` with test; app Sentry plugin & Metro config via RB-08; dashboard error logs retained). Still open: uptime check on `/readyz`, external alerts for webhooks/job-lag, production stack DSNs. | `backend/src/config/env.ts`, `pavdental/app.json`, `pavdental/metro.config.js` | C+P | M | **Partially done (code side complete; infra alerts require production stack)** |
| OPS-05 | **P0** | (Raised 26 Oct, AUD-11, gate G4: rewrite the runbook for Supabase + bucket, it still describes AWS; RPO 5 min / RTO 4 h per ADR-0003; verify the audit chain on the restored copy.) Backups: runbook exists but no restore drill has been done; Supabase free has no PITR. Do one timed restore into a scratch DB and record it. | `docs/deploy/backup-and-restore-runbook.md` | C | S | **Partially done in PR #114 (pending merge; runbook rewritten for Supabase PITR with verified post-restore commands; drill waits on OPS-01)** |
| OPS-06 | P1 | Secrets hygiene: rotate the seeded demo password (see `cs48/rotate-demo-password.md`), set production secrets fresh, document rotation (BE-14). | P+C | S |
| OPS-07 | P2 | Release command: confirm Render runs `npx prisma migrate deploy` before start; zero-downtime migration rules from `docs/completion/migrations.md`. | C | S |
| OPS-09 | P1 | **New (AUD-04, ADR-0004).** Backend image and CI were on Node 20 (end of life 30 Apr 2026). **Moved to Node 22 in the 26 Oct PR** (full backend suite passes on 22). Still to do: all apps to Node 24 before 30 Apr 2027. | C | S |
| OPS-10 | P0 | **New (AUD-06, ADR-0006).** Owner: protect `main` (PRs + required checks + review), set Render auto-deploy to "After CI Checks Pass". Claude: `render.yaml` / pre-deploy `npx prisma migrate deploy` on the direct URL once on a paid plan; rehearse one rollback on staging. Acceptance: a red CI run produces no deploy. | P then C | S |
| OPS-08 | P2 | Incident runbook and on-call contact; status page or in-app banner for outages. | C+P | S |

### 4.9 Legal, clinical and compliance (LG)

| ID | P | Item | Owner | Effort |
|---|---|---|---|---|
| LG-01 | P0 | Privacy notice: legal review of `docs/compliance/privacy-notice-draft.md`, fix processor list (see LG-02), publish on the website (WS-01). | Legal+C | elapsed |
| LG-02 | P0 | DPA tracker rewritten in `docs/compliance/dpa-tracker.md` with all 12 processors (Render, Supabase, Upstash, Vercel, Stripe, Daily, Postmark, Twilio, Sentry, Expo push / APNs / FCM, postcodes.io, Mapbox) with status "To Do" per V-04; website `/privacy` updated to match. Owner accepts each DPA at production onboarding. | `docs/compliance/dpa-tracker.md`, `website/src/routes/privacy.tsx` | C, then P | S + elapsed | **Partially done (tracker & website match; DPA acceptances pending)** |
| LG-03 | P0 | DPIA sign-off (`docs/compliance/dpia-draft.md`). | Legal/DPO | elapsed |
| LG-04 | P0 | ICO registration (data protection fee) for the controller. | P | days |
| LG-05 | P0 | CQC: confirm registration covers the clinic(s), domiciliary/van visits and remote consultations; correct the release checklist (V-05). | P | elapsed |
| LG-06 | P1 | Medical device question for triage (D-18). | P + adviser | elapsed |
| LG-07 | P1 | Outstanding clinical sign-offs: confirm V-01; still open: odontogram vocabulary, radiograph handling (IR(ME)R), post-visit advice wording, dependants consent wording, prescription PDF template, triage copy. Retention periods (decision #9) need legal sign-off. | Clin, Legal | elapsed |
| LG-08 | P0 | Patient terms: booking, deposit and cancellation rules (decisions #6, #22), consumer cancellation rights for services booked at a distance, complaints. | Legal+C | M |
| LG-09 | P0 | Remove the finance promotion (TC-04) unless FCA permissions exist. | C | S |
| LG-10 | P0 | Verify team credentials and GDC numbers (V-02, V-03). | P | S |
| LG-11 | P1 | Third-party design captures in the repo and a UI that closely copies another company's app (D-17). Owner keeps the captures as a reference until just before launch, then deletes them. | P | S |
| LG-12 | P2 | Accessibility statement for the website. | C | S |
| LG-13 | P1 | Age rules (D-16) reflected in sign-up validation and store questionnaires. | C | S |
| LG-14 | P1 | DSPT: only needed for NHS work (D-13). Remove claims or complete the toolkit. | P | — |

### 4.10 UX and accessibility polish (UX)

| ID | P | Item | Owner | Effort |
|---|---|---|---|---|
| UX-01 | P2 | Screens restyled in #70 should be checked at 320 pt width and with large text (screenshots exist in `completion/screenshots/`; re-shoot after TC fixes). | **Done in PR #118** | C | M |
| UX-02 | P2 | Copy pass: sentence case and plain English across new screens (`toLabel()`), remove leftover marketing tone ("Premier", "state-of-the-art"). | | C | S |
| UX-03 | P2 | Empty states for brand-new patients on every tab (no appointments, no records, no messages). | **Done in PR #118** | C | S |
| UX-04 | P3 | Haptics and motion respect "Reduce Motion". | **Done in PR #121 (pending merge)** (safeHaptics manager respects AccessibilityInfo.isReduceMotionEnabled) | C | S |

### 4.11 Repo hygiene and docs (RH)

| ID | P | Item | Owner | Effort |
|---|---|---|---|---|
| RH-01 | P1 | Docs disagree with the code: `03-plan.md` marks change sets done that weren't re-audited; `test-deployment-status.md` shows a `dsptMode` field the API no longer returns and a made-up-looking Stripe key; `release-checklist.md` lists env vars that don't exist (`AUDIT_HMAC_SECRET`, `PRESCRIPTION_SIGNING_SECRET`, `ENCRYPTION_MASTER_KEY`, `POSTMARK_API_TOKEN`) and claims "zero type errors"; root `AUDIT.md`, `MASTER_PLAN.md`, `REQUIREMENTS.md`, `architecture.md`, `code-review-2026-10-03.md` are stale. Archive the stale ones and point `03-plan.md` at this plan. | **Done in PR #122 (pending merge)** (archived root docs to `docs/archive/`, cleaned dsptMode from test deployment status, verified release checklist) | C | M |
| RH-02 | P2 | Remove `neo-financial-ios/` (D-17), unused `shared-types/` (or adopt it via QA-07), `testsprite_tests/` folders, `skills-lock.json` if unused. | **Done in PR #122 (pending merge)** (removed `shared-types/`, `skills-lock.json`, and `backend/testsprite_tests/`; `neo-financial-ios/` retained per AGENTS.md) | C | S |
| RH-03 | P3 | Dead code: `src/__mocks__`, screen-security stub, `backend/src/smoke-van-payments.ts` if unused. | **Done in PR #122 (pending merge)** (removed unused `backend/src/smoke-van-payments.ts`, ratcheted backend lint cap to 579) | C | S |
| RH-04 | P2 | Process: several commits and docs claimed "100% green", "signed off" or "authentic" without evidence. Require a "how I verified" section in every PR (template from QA-04). | **Done in PR #122 (pending merge)** (PR template enforces "How I verified it" across every pull request) | C | S |

---

## 5. Delivery phases (replaces the M0–M5 milestones, 26 Oct)

Effort uses the key at the top (S/M/L/XL, Claude working time). "Waits on" names the person's input; anything without it can start now. Each phase closes when its exit criteria hold, and the release gates G1–G9 live in [`../release/release-checklist.md`](../release/release-checklist.md).

### Phase 1: Immediate blockers (security, data loss, broken core flows, release blockers)

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| BE-22 stuck reminders, TC-03 orphan screens, RB-05 app hosts, OPS-09 Node 22, BE-24 | P0 | S | — | **Done in the 26 Oct PR**; suites green |
| OPS-01 / RB-12 production stack (ADR-0003) | P0 | L | C-10 billing (owner said: at production time) | `/readyz` 200 for 7 days from an external check; reminders observed overnight |
| OPS-10 + QA-05 CI-gated deploys, branch protection, pre-deploy migrations | P0 | S | Owner changes two settings | A red CI run produces no deploy; PRs can't merge red |
| RB-06 / LG-01 / LG-02 correct the live privacy page now (remove "strict data protection agreements" and backup/region claims, list every processor) | P0 | S | — (copy edit on the website's legal pages; legal review follows) | Page matches `dpa-tracker.md`; reviewed text replaces it under LG-01 |
| LG-07 / V-01 clinical sign-off; LG-06 / D-18 regulatory view on triage | P0 | elapsed | Dr Bhojani; adviser | Written sign-off linked in `04-decisions.md` |

### Phase 2: Foundation (configuration, data integrity, auth, core reliability)

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| OPS-05 restore drill + runbook rewrite for Supabase and the bucket | P0 | S | OPS-01 | Timed drill recorded; audit chain verifies on the copy; within RTO 4 h |
| OPS-04 monitoring: `SENTRY_DSN` required in production, Sentry Expo plugin + Metro (RB-08), uptime check, job-lag and webhook-failure alerts | P0 | M | C-08 at production | Forced errors visible with readable stacks; alert reaches a phone |
| DB pool sizing (AUD-10): `connection_limit=5` on the always-on API; direct URL for migrations | P1 | S | OPS-01 | Load test shows no pool timeouts |
| BE-14 key management runbook; OPS-06 fresh production secrets, demo password rotated | P1 | S | — / OPS-01 | Runbook reviewed; rotation rehearsed on staging |
| BE-15 Stripe webhook subscriptions (`charge.refunded`, `charge.dispute.created`) | P1 | S | C-04 for live | Test-mode events reach the API and are de-duplicated |
| BE-16 Daily token expiry check; BE-17 re-audit of CS-39..44, 53, 54 | P1–P2 | M | — | Findings fixed or recorded |
| BE-12 zod 4 upgrade (removes the allow-listed advisory) | P1 | M | — | **Done in PR #116 (pending merge)** (Allow-list without zod; all 64 jest suites / 494 tests + 34 e2e green) |

### Phase 3: Feature completion

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| DB-05 staff screens for app data (appointments, audit log, vans/shifts, prescriptions register, consent/SAR records) | P1 | L | — | Staff can do each task without database access |
| DB-04 real dashboard home; remove template pages before launch (D-17) | P1 | M | D-17 timing | `/dashboard` shows real data; template routes 404 |
| DB-06 CORS single-origin fix; DB-07 real staff accounts | P1 | S | C-13 for staff list | **Partially done (DB-06 done in PR #117 (pending merge); DB-07 waits on C-13)** |
| BE-18 treatment-plan acknowledgement record (D-06) | P2 | M | — | Stored with plan version hash, who, when, device |
| MF-10 hours from the API; BE-11 remove waitlist and DSPT routes, then table after backup (D-20) | P2–P3 | S | backup (OPS-05) | Routes 404; e2e green |
| RB-01 icon/splash, RB-20 EAS Update (ADR-0005) | P0 / P1 | S | C-12 logo; owner OK on ADR-0005 | Real icon on device; preview build takes and rolls back an update |

### Phase 4: Quality assurance

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| QA-02 Maestro flows for journeys J1–J8 on EAS preview builds | P1 | L | RB-19 builds (needs C-03) | Flows pass on iOS and Android in CI or EAS |
| MF-06, MF-08 deep links, deletion, SAR, consent, dependants on device | P1 | M | RB-05 DNS, RB-19 | Each row in checklist §2–3 Verified |
| QA-09 VoiceOver/TalkBack, large text, 320 pt (UX-01) | P1 | M | RB-19 | Screen-reader checklist complete |
| QA-06 clock-pinned jest run | P2 | S | — | CI job at a fixed late time passes |

### Phase 5: Production infrastructure

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| OPS-03 DNS, SPF/DKIM/DMARC, Twilio sender | P0 | S | C-06, C-07, C-11 | Mail-tester score ≥ 9; SMS delivered |
| RB-02..RB-04, RB-11, RB-16, RB-19 EAS project, store ids, keys, reviewer account, Play declarations, first internal builds | P0–P1 | M | C-01..C-04 (at production time) | TestFlight and Play internal builds installed and smoke-tested |
| OPS-07 confirm pre-deploy migrations on the paid plan | P2 | S | OPS-10 | Deploy log shows `migrate deploy` before start |

### Phase 6: Hardening

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| BE-19 load test against ADR-0003 targets (p95 < 500 ms reads at 50 rps, 20 concurrent bookings) | P1 | M | OPS-01 | Report in `docs/deploy/` |
| QA-08 external pen test (OWASP API Top 10, MASVS-L1) and fixes | P1 | 2–3 weeks elapsed | budget | No open Critical/High (gate G2) |
| BE-13, MF-09, DB-03 lint ratchets | P3 | M | — | Caps lowered in each PR that touches a package |

### Phase 7: Launch preparation

| Item | Pri | Effort | Waits on | Exit / acceptance |
|---|---|---|---|---|
| LG-01..LG-05, LG-08, LG-13 legal set (privacy, terms, DPAs, DPIA, ICO, CQC, age rules) | P0 | elapsed | solicitor/DPO, owner | Gate G7 open |
| OPS-08 incident runbook, phone-booking fallback, post-launch watch rota | P1 | S | owner | Runbook in `docs/deploy/` |
| Production soak: 7 days with synthetic data (gate G8) | P0 | elapsed | phases 1–5 | Reminders, holds, push receipts observed; no Sentry errors unexplained |
| RB-10 store listing final, screenshots, privacy labels; submit (gate G9) | P0 | M | C-01, C-02 | Both stores approve |

### Phase 8: Post-launch

MF-01 in-app video (D-01), BE-23 job leadership then a second API instance, BE-05..BE-08 if their decisions change, OPS-09 Node 24, Prisma 7 and Express 5 upgrades, UX-02..UX-04 polish, RH-02/RH-03 clean-up (including `neo-financial-ios/` per D-17).

### Next ten tasks (in order)

1. Merge the 26 Oct PR (docs + fixes).
2. Owner: protect `main` and set Render to deploy after CI (OPS-10, two settings, ~10 minutes).
3. Correct the live privacy page's processor list and remove the claims that aren't true yet (RB-06/LG-02).
4. Require `SENTRY_DSN` in production and add the Sentry Expo plugin + Metro config (OPS-04, RB-08).
5. Rewrite the backup runbook for Supabase + bucket so the drill is ready the day production exists (OPS-05).
6. DB-05 staff screens for appointments and the audit log.
7. BE-12 zod 4 upgrade.
8. BE-15/BE-16 Stripe event subscriptions and Daily token expiry check.
9. RB-20 EAS Update, if the owner accepts ADR-0005.
10. QA-02 Maestro flows, ready to run on the first EAS preview build.

## 6. Count

25 Oct baseline: 125 items, 38 P0. 26 Oct revision adds 7 items (OPS-09, OPS-10, BE-22, BE-23, BE-24, RB-20, MF-10) and raises OPS-04, OPS-05 and QA-05 to P0, giving **132 items**. The website's 11 items stay listed but de-scoped.

| Area | Items | P0 (26 Oct) |
|---|---|---|
| Store/release (RB) | 20 | 12 |
| False claims (TC) | 17 | 8 |
| Mobile (MF) | 10 | 0 |
| Backend (BE) | 24 | 3 |
| Dashboard (DB) | 9 | 2 |
| Website (WS, de-scoped) | 11 | 3 |
| Tests/CI (QA) | 9 | 2 |
| Infra (OPS) | 10 | 5 |
| Legal/clinical (LG) | 14 | 8 |
| UX | 4 | 0 |
| Hygiene (RH) | 4 | 0 |
| **Total** | **132** | **43** |
| Decisions / verifications / credentials | 22 / 7 / 15 | |
