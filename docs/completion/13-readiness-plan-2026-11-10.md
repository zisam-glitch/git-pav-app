# Readiness plan, 10 Nov 2026

What still stands between the app and real patients, from a fresh read of `main` at `b75edfc`. It adds to
[`11-completion-checklist.md`](11-completion-checklist.md) (owner setup, legal, testing) and
[`12-bug-triage-2026-11-09.md`](12-bug-triage-2026-11-09.md) (B1 to B16); it does not repeat them.

**In one paragraph:** the booking, payment, video and van journeys work end to end on test providers, and the
code is healthy. What is missing is mostly around the edges of those journeys: the patient hears almost nothing
from us outside the app (no confirmation, push-only reminders), several screens say things that aren't true or
lead nowhere, a few standard screens don't exist (read a message thread, notifications, help, staff sign-out),
and nothing has yet been proven on a real phone with real providers. None of the new findings is a data-loss or
payment-integrity bug.

## What was and wasn't covered

| Area | Covered |
|---|---|
| App, patient: sign-up, sign-in, onboarding, home, booking (all 7 screens), bookings list and detail, reschedule, cancel, check-in, messages, records hub, video (all 7), van (all 6), perks | Read in full |
| App, patient: profile sub-screens, records sub-screens (plans, prescriptions, documents, insights) | Wording and actions only |
| App, clinician and van operator screens | Wording and actions only |
| Backend: which events notify patients, reminder job, notification preferences, message notifications | Read |
| Backend: `van.ts`, `admin.ts`, `auth.ts`, payments webhook in full | **Not read** (still owed from triage item 10) |
| `website/`, `admin-dashboard/` | **Not read** (website is on hold) |
| Checks | App `tsc --noEmit` passed. App test scripts, backend typecheck and tests **not run** here (the sandbox blocks them); CI is the source of truth. Nothing was run on a phone. |

Confidence: every finding below is **confirmed by reading the code** unless marked *to verify*.

---

## 1. Release blockers already tracked (unchanged)

These block a release more than anything new here. Details are in the checklist.

- No production environment; staging database and API need bringing up to date (checklist §4).
- No EAS project ID, `google-services.json` or APNs key, so no push on any device (§4).
- Nothing tested on real phones: card and wallet payment, video call, van with two phones, push, biometrics,
  deep links, the 9 Maestro flows (§3).
- Clinical sign-off (triage, prescribing, chart wording), DPIA, privacy notice, terms, DPAs, ICO, CQC (§5).
- **B2:** the server lets a patient with no health-data consent book and pay. Waiting on the DPO.
- Load test, penetration test, restore drill, soak, rollback rehearsal (§3).
- Website with the `.well-known` files and email-link pages deployed to the live domain (§4).

## 2. New bugs

Severity is the effect on a patient or the practice. Effort: XS under an hour, S half a day, M one to two days.

### High

| ID | What goes wrong | Where | Effort |
|---|---|---|---|
| R1 | **The patient gets no confirmation outside the app.** Booking, cancelling and rescheduling send nothing: no email, SMS or push. The only patient messages are push reminders and van/payment pushes. Someone who declines push hears nothing at all, yet the confirmed screen says "We'll remind you before your visit". Whether Stripe emails a receipt was not checked. | `backend/src/routes/booking.ts`, `cancellations.ts` (no notification calls); `lib/background-jobs.ts:427` | M |
| R2 | **The Email and SMS switches do nothing.** `emailEnabled` and `smsEnabled` are saved and never read. Onboarding promises "SMS and email reminders". | `backend/src/routes/notifications.ts`; [`onboarding/consents.tsx:210`](../../pavdental/src/app/onboarding/consents.tsx) | S to hide, M to build |
| R3 | **Cancelling from the bookings list promises a refund that may not come.** The sheet says the deposit "will be refunded by your bank within 5 working days" whatever the notice. The real policy (full, half, none) is on the detail screen. The list also never shows what was refunded. | [`(tabs)/appointments.tsx:188`](../../pavdental/src/app/(patient)/(tabs)/appointments.tsx) vs [`appointments/[id].tsx:264`](../../pavdental/src/app/(patient)/appointments/[id].tsx) | XS |

### Medium

| ID | What goes wrong | Where | Effort |
|---|---|---|---|
| R4 | **A message thread can't be read.** Tapping a thread opens only a reply box; the patient sees a two-line preview and never the conversation. Send failures show as a green "success" toast. The message field is one line. | [`(tabs)/messages.tsx:80`](../../pavdental/src/app/(patient)/(tabs)/messages.tsx), `:127`, `:261`, `:355` | M |
| R5 | **Tapping a push notification does nothing** beyond opening the app: there is no handler for it. | `pavdental/src/features/notifications/` (no response listener) | S |
| R6 | **The bell always shows an unread dot** and opens Messages. Notification history is fetched at start-up and shown nowhere. | [`home.tsx:151`](../../pavdental/src/app/(patient)/(tabs)/home.tsx); `notification-hooks.ts:177` | S |
| R7 | **Screens go stale.** Nothing refetches when the app comes back to the front, no patient screen has pull-to-refresh, data counts as fresh for 5 minutes, and messages never poll. A reply or a staff-side change shows only after a restart or a tab remount. | `lib/query-client.ts`; no `focusManager` anywhere | S |
| R8 | **When the 10-minute hold runs out the patient starts again from the treatment list.** The draft is cleared, the time picker then finds no treatment and bounces to the catalogue. | [`booking/summary.tsx:69`](../../pavdental/src/app/(patient)/booking/summary.tsx), `:94`, `:421`; `slot-picker.tsx:32` | S |
| R9 | **A cancelled booking within 24 hours still says "You're nearly there, check in".** The card checks the time and not the status. | [`appointments/[id].tsx:185`](../../pavdental/src/app/(patient)/appointments/[id].tsx) | XS |
| R10 | **Check-in is two tick-boxes that record the wrong thing.** The "health declaration" is sent as `balance`. The medical-history row has a chevron but opens nothing. With no id it checks in the first appointment in the list (the B4 mistake again). It says check-in opens at 24 hours; the server opens it at 48. The success toast is never seen. | [`check-in.tsx:35`](../../pavdental/src/app/(patient)/check-in.tsx), `:50`, `:62`, `:79` | S |
| R11 | **The video consent switch is not recorded.** The patient must turn it on to continue, and it is never sent to the server. | [`video/intake.tsx:21`](../../pavdental/src/app/(patient)/video/intake.tsx); `photo-review.tsx:130` | S, plus DPO wording |
| R12 | **The waiting room can be entered days early and waits for ever.** It is offered any time before the slot ends, ignores every error from the status check, sends no push when the clinician lets the patient in, and leaving it tells nobody. | [`appointments/[id].tsx:96`](../../pavdental/src/app/(patient)/appointments/[id].tsx); [`video/waiting.tsx:20`](../../pavdental/src/app/(patient)/video/waiting.tsx) | M |
| R13 | **"Completed. Your video consultation has ended"** is shown to anyone who taps "I've finished the call", whether or not a consult happened. | [`video/summary.tsx:47`](../../pavdental/src/app/(patient)/video/summary.tsx); `call.tsx:122` | S |
| R14 | **Clinicians and van operators cannot sign out.** Sign-out exists only on the patient profile. On a shared practice phone the next person inherits the session. | no `signOut` under `(clinician)/` or `(operator)/` | S |
| R15 | **Onboarding can be skipped and is never offered again.** "I'll do this later" is the only path past it, and nothing on Home asks for the missing medical history or consents. Answers are also held in memory until the last step, so closing the app midway loses them. This is how a patient reaches a booking with no consent (B2). | [`account-created.tsx:57`](../../pavdental/src/app/(auth)/account-created.tsx); `onboarding/consents.tsx:53` | M |
| R16 | **The treatment picked for a van visit is thrown away.** The catalogue saves it to the booking draft; the van screens read a different draft and pre-select the first van service. The patient picks twice, or books the wrong one. | [`van/access-details.tsx:49`](../../pavdental/src/app/(patient)/van/access-details.tsx) | S |

### Low

| ID | What goes wrong | Where |
|---|---|---|
| R17 | The 48-hour reminder says "Free cancellations available up to 48 hours prior", sent at the moment that window closes. | `backend/src/lib/background-jobs.ts:462` |
| R18 | The email telling a patient about a staff reply carries the thread's subject, which the patient may have written about their health, in the email subject line. For the DPO. | `backend/src/routes/messages.ts:384` |
| R19 | Triage: "how long" has no option between 48 hours and a week; pain has no 0; a missing pain score becomes 5. | `video/intake.tsx:25`; `photos.tsx:73`; `photo-review.tsx:125` |
| R20 | Date of birth accepts 31/02/2010 and future dates, with no age check on the phone. Gender is free text and anything unrecognised is stored as "other". | `onboarding/profile.tsx:20`; `consents.tsx:15` |
| R21 | The "General treatment" consent is stored as `clinical_records` and recall reminders as `marketing`, both on the lawful basis "consent". D-06 says treatment consent is taken in person. For the DPO. | `onboarding/consents.tsx:80` |
| R22 | Home: the eye button hides only the patient's name (left from a banking template); the next-visit badge is green for every status; made-up fallbacks ("Dental Examination & Polish", "Central Practice", "En Route"); "restorative" is labelled "Surgery"; the info button on a treatment card opens the whole catalogue; a missing deposit is guessed at 25% on the phone. | `(tabs)/home.tsx:45`, `:108`, `:139`, `:176`, `:187`, `:272`, `:313` |
| R23 | Appointment detail loads the whole list to find one visit; a network error reads "not found… belongs to another account"; it doesn't say who the visit is for, the price or the balance. | `appointments/[id].tsx:46`, `:65` |
| R24 | "View profile & reviews": there are no reviews (D-04). | `booking/clinician-picker.tsx:129` |
| R25 | After cancelling, "Find another time" opens the clinic picker with an empty draft and bounces to the catalogue. Refund timing reads "5 to 10 working days" here and "5" elsewhere. | `appointments/cancelled.tsx:51`, `:74` |
| R26 | A video booking counts steps "1 of 5, 3 of 5": it skips step 2. | `booking/service-catalog.tsx:88` |
| R27 | Van screens state things nobody has confirmed: ETA "~20–30 min" when the server sends none, "operator accepts within 4 minutes", "7.4m vehicle", "permit or visitor voucher will be provided on arrival". Raw GPS coordinates are shown to the patient. | `van/service-area.tsx:206`, `:258`; `confirm.tsx:26`, `:167`; `access-details.tsx:230`, `:251` |
| R28 | `guest-limit` is a screen for a guest mode that doesn't exist; nothing opens it. | `(auth)/guest-limit.tsx` |
| R29 | Legal links fall back to `pavdental-website.vercel.app`; the dial link is hard-coded apart from the phone number setting. | `config/legal.ts:6`; `config/practice.ts:9` |
| R30 | Development sign-in shortcuts use `@pavdental.com` addresses, not `@example.test` as the ground rules ask. Hidden in release builds. | `(auth)/sign-in.tsx:92`; `welcome.tsx:159` |

## 3. Flow issues

Not bugs: the journey works but costs the patient effort or trust.

- **Finding a time.** The picker shows 7 days as pills and one day's times. An empty day is a dead end: there is
  no "next available" across days and no way past a week. Rescheduling has the same limit.
- **Booking for a child** is chosen on the payment screen, after treatment, clinic, dentist and time. Ask first.
- **Treatment list** shows a name, price and minutes. The description exists in the data and is only searched,
  never shown. There is no treatment detail screen.
- **"Rebook" and "Book this again"** open the full catalogue with nothing filled in.
- **Paying.** Nothing links the terms at the point of payment. Errors arrive as system alerts (`Alert.alert` in 29
  files) next to toasts and inline errors elsewhere: three styles for one job.
- **Sign-in.** The security code field appears under the password with no "resend". "Use phone OTP instead" is
  jargon. The phone-code screen has no resend delay and its own code boxes, unlike email verification.
- **Password** must be 15 characters. That is defensible (decision in PR #33) and unusually strict for a
  patient app; expect drop-off at sign-up. Sign in with Apple or Google would remove the problem.
- **Push permission** is asked the moment the patient signs in, before they have a reason to say yes.
- **Address** is typed by hand twice (onboarding, van) with no postcode lookup.
- **Records** hides half its six rows behind a three-way switch, and its "Clinical timeline" card does nothing.
- **Video.** The call opens in a browser sheet and the patient must tap "I've finished the call" themselves.
  Triage answers travel between screens and are lost if the patient leaves before the last one. "Answer the
  triage questions" stays on offer after they have been answered.
- **Van** is on-demand only. With no van on shift the patient can do nothing but book a clinic or video visit:
  no "tell me when a van is free", no booking a van for a later day.
- **Clinicians** see today only: no tomorrow, no week.
- **Profile** is a tab with a close button, and puts Sign out under "Danger zone".

## 4. Missing screens and features

Ordered by how much a patient would expect each from a comparable app (the code's own references are Zocdoc and MyChart).

**Needed before real patients**

1. Message thread screen (R4).
2. Confirmation, cancellation and reschedule messages by email, and reminders by email or SMS (R1, R2).
3. Notification handling: tap-through and an honest bell (R5, R6).
4. Sign-out and a small settings screen for clinicians and operators (R14).
5. A "finish your profile" prompt on Home and at booking (R15).
6. Help and contact: phone, email, opening hours, and what to do if the app fails. Today the practice number
   appears in only a few places, such as the crash screen and a prescription.
7. On the appointment screen: address with directions, call the practice, who it is for, price and balance.
8. A minimum-version check, so a broken build can be retired. With no `expo-updates` either, a bad release can
   only be fixed by a new store build that patients choose to install.

**Expected soon after**

9. Add to calendar (removed as fake on 31 Oct; build it for real).
10. Payment history and receipts.
11. Treatment detail screen.
12. "Next available" and a month view in the time picker.
13. Change email address.
14. Pull-to-refresh everywhere (R7).
15. Unread count on the Messages tab.
16. Photo attachments in messages (the list already draws an attachment row that can never appear).
17. Visit history with the clinician's notes, in Records.
18. Clinician week view.

**Later, or a decision**

19. Sign in with Apple and Google.
20. Scheduled van visits and a "notify me" for van cover.
21. Post-visit feedback (D-04 says not for launch).
22. Dark mode, tablet layout, in-app video (D-01), other languages.

## 5. Limitations to state plainly at launch

Known and acceptable for a first release, as long as the listing and the practice say so.

- One clinic, in Bradford. Van areas are placeholders until real ones are drawn.
- Phones only, portrait, light mode, English.
- Video runs in a browser sheet, not inside the app.
- The balance is paid in person. The app takes deposits only.
- Prescriptions are a PDF copy; the pharmacy needs the signed paper one.
- Dental chart and plans are read-only for the patient ("I've read this plan" only).
- Finance is a link to the website.
- No reviews, no waitlist, no insurance.
- Patient medical history is three switches and a GP name. Whether that is enough is a clinical decision.

## 6. Wording

Plain words a patient would use. One pass, one PR, reviewed by the clinical lead where it is clinical.

| Now | Use |
|---|---|
| Digital odontogram | Tooth chart |
| Clinical vault, Document vault | Documents |
| Treatment estimates & plans | Treatment plans |
| Telehealth waiting room | Waiting room |
| Take intraoral photos | Add photos of your teeth |
| Live van dispatch area; "in this polygon" | Check if the van comes to you |
| Surgery van, surgical van | Dental van |
| clinical block | (remove) |
| Use phone OTP instead | Sign in with a text code |
| Consent & GDPR; Request GDPR data bundle | Privacy and consent; Download my data |
| Active authorised sessions | Devices signed in |
| Danger zone | Account |
| a reset link has been dispatched | we've sent a reset link |
| Slot Reservation Expired | Your held time has run out |

---

## 7. The plan

One concern per pull request, each with a test that fails first. Phases A and B are code and can start now.
Phase C needs the owner. Phase D is the release itself.

### Phase A: make what exists true (about a week)

Small, safe, no decisions needed.

1. **Money wording:** R3, R25. One cancellation message, taken from the server's policy.
2. **Appointment screen:** R9, R23, and item 7 of section 4 (directions, call, who, price).
3. **Check-in:** R10. Either make the rows open the real screens and record the right kinds, or cut check-in to
   one "I'm here" action. Recommended: cut it.
4. **Hold expiry:** R8. Keep the treatment, clinic and dentist; return to the time picker.
5. **Fresh data:** R7. Refetch on foreground, pull-to-refresh on Home, Bookings, Messages, Records.
6. **Home tidy-up:** R22, R6 (remove the dot until there is something behind it).
7. **Van:** R16, R27.
8. **Video:** R13, R19, and gate the waiting room to 10 minutes before the start (R12, first half).
9. **Small fixes batch:** R17, R20, R24, R26, R28, R29, R30.
10. **Wording pass:** section 6.

### Phase B: the missing pieces (two to three weeks)

11. **Message thread screen** (R4), with unread count on the tab.
12. **Email to patients** for booked, cancelled, moved, plus reminders by email. Uses Postmark, which staff
    sign-in already needs. Honour `emailEnabled`. Hide the SMS switch until SMS is built (R1, R2).
13. **Push tap-through** and a notifications list behind the bell (R5, R6).
14. **Staff sign-out** and settings (R14).
15. **Profile completion** prompt, and save onboarding step by step (R15). Pairs with B2 once the DPO answers.
16. **Waiting room:** push when let in, a "running late" state, a way to message the practice (R12).
17. **Help and contact** screen.
18. **Minimum-version check,** and decide on `expo-updates` (ADR 0005).
19. **Time picker:** next available day, more than 7 days.
20. **Second read** of `van.ts`, `admin.ts`, `auth.ts` and the payments webhook, owed since 9 Nov.

### Phase C: owner, legal and clinical (runs alongside)

Unchanged from the checklist, with these additions from this read:

- DPO: R11 (video consent), R18 (subject in email), R21 (consent types and lawful basis), B2.
- Clinical lead: is three switches enough medical history; triage options (R19); should a van operator write
  clinical notes.
- Owner: accounts and keys (C-01 to C-11), real practice data, store listings.

### Phase D: prove it and ship

21. Staging brought up to date; an EAS preview build on two iPhones and two Android phones.
22. The on-device list in checklist §3, including the 9 Maestro flows.
23. Screen-reader pass, 320 pt and large-text pass.
24. Load test, penetration test, restore drill.
25. TestFlight and Play internal testing with practice staff for one to two weeks (`docs/release/testflight-plan.md`).
26. Soft launch to a small group of existing patients, with the phone line as the fallback. Daily check of
    Sentry, failed payments and reminder lag for two weeks.
27. Stripe live keys last.

## 8. Decisions needed from the owner

1. **Check-in:** keep and build properly, or cut to one tap? (Recommended: cut.)
2. **Patient email and SMS:** email through Postmark for launch, SMS later? (Recommended: yes. SMS adds a
   per-message cost.)
3. **Password length:** stay at 15, or drop to 12?
4. **Sign in with Apple and Google:** for launch or later?
5. **Onboarding:** must a patient finish medical history and consents before a first booking? (Recommended:
   yes, at the booking step, which also settles B2.)
6. **Over-the-air updates:** install `expo-updates`? (Recommended: yes, before the first store build.)
7. Still open from the checklist: on-demand video (decision 3), van areas and CQC cover (V-05).
