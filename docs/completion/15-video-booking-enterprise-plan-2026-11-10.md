# Video consult: plan to reach finished-product quality, 10 Nov 2026

The owner's brief: the video booking journey should work like an enterprise app. No bugs, no lag, no dead ends,
a real video call, real SMS, nothing fake or left over, and it should look and read as if a specialist product
team built it.

This plan covers one journey end to end: **book, pay, answer triage questions, wait, talk to the dentist, get the
summary**, plus every message the patient and dentist receive along the way. It builds on the readiness plan
([`13-readiness-plan-2026-11-10.md`](13-readiness-plan-2026-11-10.md)); where an item there already covers
something, its ID (R1, R12 and so on) is quoted and not repeated.

## How this was produced, and its limits

Read in full: `backend/src/routes/video.ts`, `backend/src/lib/communication-service.ts`,
`backend/src/lib/patient-push.ts`, the reminder ladder in `backend/src/lib/background-jobs.ts`, and in the app
`features/video/native-call.tsx`, `features/video/video-hooks.ts`, every screen under `(patient)/video/`, and the
first half of `(clinician)/consult-room.tsx`. Searched, not read line by line: `booking.ts`, the booking screens,
the admin dashboard.

**Nothing was run.** No call was placed and no suite was executed for this plan. Findings are from reading code.
Each fix below starts with a failing test, which is also the proof the finding is real.

## Where it stands today

What is already real and sound:

- The call is a real, native Daily call inside the app (PR #56), in a private room per appointment, entered with a
  short-lived token. A patient cannot get a token until the dentist admits them.
- Payment, the booking hold, cancellation and refund rules are the same tested code the clinic bookings use.
- Triage answers are stored encrypted. Red-flag answers are checked on the server.
- Reminders are claimed safely by one worker at a time and retried after a crash.

What stops it feeling finished:

1. **The patient gets no SMS and no email about an appointment, ever.** `sendSms` is called from one place only:
   login codes. Booking, rescheduling and cancelling send nothing (R1). Reminders are push only, so a patient who
   declined notifications hears nothing at all. The `smsEnabled` and `emailEnabled` settings are saved and never
   read (R2).
2. **The two people cannot see each other until they are both in the call.** The dentist has no way to know the
   patient is in the waiting room. The patient is not told when the dentist lets them in unless the waiting screen
   is open and in front. Nobody is told if the other side never turns up.
3. **The call has no safety net.** No "reconnecting" state, no warning on a weak connection, the screen can sleep
   mid-call, no speaker or Bluetooth choice, and nothing is reported to us when a call goes badly.
4. **The screens say things that are not true.** "Consultation ready" when nobody is ready. "Completed" on a
   consult that did not happen (R13). Video reminders tell the patient to "arrive 10 minutes early" and "tap for
   directions".
5. **Left-over code.** `video-hooks.ts` is 370 lines of mostly unused hooks, one of which asks for photo-library
   access and calls it microphone access.

## Findings

Severity: **High** = a patient or dentist is stuck, misled, or loses data. **Medium** = works, but visibly
unfinished. **Low** = polish. Effort: XS under 2 hours, S half a day, M 1 to 2 days, L 3 to 5 days.

### A. Messages (SMS, email, push)

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V1 | High | No confirmation, reschedule or cancellation message on any channel (R1). | `booking.ts`, `cancellations.ts`, `payments.ts` webhook | M |
| V2 | High | Reminders are push only. No SMS, no email. `smsEnabled` / `emailEnabled` never read (R2). | `background-jobs.ts:259`, `schema.prisma:563-564` | M |
| V3 | High | Video reminders use clinic wording: "arrive 10 minutes early", "at Pav Dental. Tap for directions and check-in info". The ladder does not look at the channel. | `background-jobs.ts:427` onwards | S |
| V4 | High | No message when the dentist admits the patient. If the app is in the background the patient never finds out. | `video.ts` admit-patient | S |
| V5 | High | Tapping a push does nothing: no notification response listener (R5). A "join now" push cannot open the waiting room. | `notification-hooks.ts:229` | S |
| V6 | Medium | `sendSms` posts straight to Twilio from one phone number: no Messaging Service, no named sender, no delivery status callback, no retry, no record of what was sent or whether it arrived. | `communication-service.ts` | M |
| V7 | Medium | The last reminder is 2 hours before. A video consult needs one about 10 minutes before, with a link that opens the waiting room. | `background-jobs.ts` ladder | S |
| V8 | Medium | Reminder de-duplication matches on user, time and title, not appointment. Two bookings at the same time for a parent and child would share one reminder. | `background-jobs.ts` ladder | XS |
| V9 | Low | Onboarding promises SMS and email reminders the app does not send. Becomes true once V1 and V2 land; check the wording then. | onboarding screens | XS |

### B. Waiting room and presence

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V10 | High | The dentist cannot see whether the patient is waiting. "Let patient in" only appears after the dentist has joined the call, and "admitted" is remembered on the phone only, so it is lost if they leave the screen. | `consult-room.tsx`, `video.ts` clinician-queue | M |
| V11 | High | The waiting room can be entered days early and waits for ever (R12). No appointment time, no dentist name, no "running late", no way out except a button that goes home and tells nobody. | `(patient)/video/waiting.tsx` | M |
| V12 | High | The waiting screen ignores every error from the status check, including signed out, cancelled and completed. The patient keeps looking at a spinner. | `waiting.tsx` | S |
| V13 | Medium | The status check runs every 4 seconds on a timer, including when the app is in the background, and is the only way the patient learns anything. | `waiting.tsx` | S |
| V14 | Medium | No no-show handling for video. A consult where one side never arrives stays `confirmed` until someone changes it by hand. | `video.ts`, `background-jobs.ts` | M |
| V15 | Medium | "Join" is offered on the appointment screen from the moment of booking; there is no "opens 10 minutes before" rule in the app or on the server. | `appointments/[id].tsx:88-100`, `video.ts` rooms | S |

### C. The call

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V16 | High | No reconnecting state. Daily's network events are not listened to, so a dropped connection shows a frozen picture, then a generic error. | `native-call.tsx` | M |
| V17 | High | The screen can dim and lock during a call (no keep-awake). | `native-call.tsx` | XS |
| V18 | High | The device check only tests "is there internet". It does not ask for camera or microphone, show the patient their own picture, or test sound. Permission is first asked for at the moment of joining. | `(patient)/video/device-check.tsx` | M |
| V19 | Medium | No choice of speaker, earpiece or Bluetooth headset; no handling of a phone call arriving mid-consult. | `native-call.tsx` | M |
| V20 | Medium | Rejoining reuses the token fetched when the screen opened. After a long consult it can be out of date. | `(patient)/video/call.tsx` | S |
| V21 | Medium | "The other person left" is not a state. The patient sees "Waiting for your dentist to join…" again, with no explanation. | `native-call.tsx` | S |
| V22 | Medium | Going to the background mid-call is not handled or tested on iOS (Android has the foreground service switched on). Needs checking on real phones. | `app.json:106`, `native-call.tsx` | S |
| V23 | Medium | Nothing about call quality reaches Sentry: join time, drops, failed joins. We would learn of a bad call only from a complaint. | `native-call.tsx` | S |
| V24 | Low | Rooms are created with chat switched on, but the app has no chat. Either build it or switch it off. | `video.ts` rooms | XS |

### D. Server correctness

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V25 | High | Admit, submit-triage and end-consult each read the triage record, change it and write it back. Two at once can overwrite each other. The same applies to photos: uploads sent in parallel can lose a photo. | `video.ts` | M |
| V26 | High | End-consult can mark a `confirmed` consult `completed` although nobody was admitted, and it is not safe to send twice. | `video.ts:585` area | S |
| V27 | Medium | Ending the consult does not close the Daily room. The other person stays in an open call until the token runs out. | `video.ts` end-consult | S |
| V28 | Medium | Submit-triage does not check that the appointment is a video one or still upcoming. | `video.ts` | XS |
| V29 | Medium | Photo upload trusts the file type the phone claims, has no limit on how many photos, and accepts an upload with no appointment. | `video.ts` upload-triage-photo | S |
| V30 | Low | Room and token failures are logged with `console.error`, not through the safe logger. `/triage-photos/:id` does not validate its parameter. | `video.ts` | XS |

### E. Triage, summary and flow

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V31 | High | Triage answers live only on the screen. Leaving the app half way loses them. | `(patient)/video/intake.tsx` | M |
| V32 | High | The recording-consent switch is shown and never sent to the server (R11). | `intake.tsx` | S, needs decision |
| V33 | High | The summary always says "Completed" and hides fetch errors (R13). Follow-up buttons open an empty catalogue. | `(patient)/video/summary.tsx` | S |
| V34 | Medium | The dentist's end-of-consult form sends fixed notes ("Consultation concluded via video call.") and "no follow-up" every time. The patient's summary is therefore always the same sentence. | `consult-room.tsx` | M |
| V35 | Medium | Pain scale has no zero; duration options skip 2 to 7 days (R19). Clinical wording. | `intake.tsx` | XS, needs clinician |
| V36 | Medium | "Answer the triage questions" stays on the appointment screen after they are answered. | `appointments/[id].tsx` | XS |
| V37 | Medium | Booking steps read "1 of 5, 3 of 5" for video (R26); the slot picker shows 7 days with no "next available" (plan 13 flow issues); a hold that runs out restarts the flow (R8). | booking screens | M |
| V38 | Low | Wording: "Telehealth waiting room", "Consultation ready". Plain words wanted: "Waiting room", "Your dentist will let you in soon". | video screens | XS |

### F. Left-overs and staff view

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V39 | Medium | `video-hooks.ts`: unused hooks, a wrong microphone permission check (lines 41-43), a stub "fallback", an `isMock` field. Delete what is unused; move what is used next to its screen. | `features/video/video-hooks.ts` | S |
| V40 | Medium | Dentists see today's consults only. No week view of video bookings (plan 13). | `(clinician)/schedule.tsx` | M |
| V41 | Medium | The admin dashboard lists video visits but shows nothing about messages sent or whether the call took place. | `admin-dashboard` app-appointments | M |
| V42 | Low | Call screen colours are hard-coded, not from the theme. | `native-call.tsx` | XS |

## Decisions needed from the owner first

None of these can be settled in code. Phases 1 and 2 do not wait for them, except where noted.

1. **Appointment SMS costs money per message** (ground rule: ask before adding a paid service). Twilio is already
   paid for login codes, but this is a new, larger use: about four messages per booking. UK SMS is priced per
   160-character segment; get today's price from the Twilio console before approving. This reverses decision 2 in
   the readiness plan ("email for launch, SMS later"). *Blocks V2 SMS and V4 SMS; email and push do not wait.*
2. **Sender name.** A named sender ("PavDental") looks professional but patients cannot reply to it, so opting out
   must be done in the app and said so in the first message. A normal number allows a STOP reply. Recommendation:
   named sender, opt-out in app settings, because these are service messages about a booking the patient made.
3. **What an SMS may say.** Recommendation: never the service name or any health detail. "Your Pav Dental video
   appointment is tomorrow at 14:30. Open the app to join." *Needs DPO sign-off.*
4. **Recording.** The consent switch implies calls are recorded. They are not. Either remove the switch or decide
   to record and get the DPO and a clinician to word it (R11, B2). Recommendation: remove it for launch.
5. **No-show rule for video.** How long does each side wait (suggest 10 minutes), and what happens to the money
   if the patient does not come, or the dentist does not? *This changes how payments are refunded, so it needs
   your decision before V14 is built.*
6. **Joining window.** Suggest: waiting room opens 10 minutes before the start time, closes at the end time.
7. **Triage options and end-of-consult form fields** (V34, V35): a clinician must review the wording.
8. **Staging needs real Daily and Twilio test credentials** so calls and messages can be proved, not assumed.

## The plan

One concern per pull request. Every item starts with a failing test. Nothing ships until its suite is green.

### Phase 1: make it correct (about 1 week)

Server and app fixes with no design change and no decision needed.

1. V25: make triage and photo writes safe against each other (one locked update per change). Test with two
   requests at once.
2. V26, V27, V28: end-consult only from `in_progress`, safe to repeat, and it closes the Daily room.
3. V29, V30: photo upload checks the real file type, caps the count, requires the appointment; safe logging.
4. V3, V8: video reminders get their own wording and are matched per appointment.
5. V12, V33, V36: waiting room and summary react to every status and show errors with a retry.
6. V17, V20, V21, V24: keep the screen awake, fresh token on every join, "your dentist has left" state, chat off.
7. V39: delete the unused hooks.

### Phase 2: both sides can see each other (about 1.5 weeks)

1. **Presence.** The server learns who is in the room from Daily (its webhooks for joined and left, verified by
   signature, with a presence check as a fallback). New fields on the appointment: patient waiting since,
   dentist joined at, call started, call ended. Additive migration only, following `migrations.md`.
2. V10: the dentist's queue shows "Waiting 3 min" beside each patient; "Let patient in" works before joining and
   reads its state from the server.
3. V11, V13, V15: waiting room rebuilt. Opens 10 minutes before. Shows the time, the dentist's name and one honest
   status line: "You're early", "Your dentist knows you're here", "Running a few minutes late", "You're in".
   Checks on a sensible interval, stops in the background, checks at once on return. "Leave" tells the server.
4. V4, V5: admitting sends a push straight away; tapping any appointment push opens the right screen.
5. V14: no-show timer, once decision 5 is made.

### Phase 3: real messages (about 1.5 weeks, SMS part waits for decisions 1 to 3)

1. One message service with a record per message: who, which appointment, which channel, template, status,
   provider ID. No message body with personal detail is stored or logged.
2. V6: SMS through a Twilio Messaging Service with a registered sender, delivery callbacks (signature checked),
   retry with back-off, and a fallback to email when SMS fails.
3. V1: confirmation, reschedule and cancellation on email and push, and SMS if the patient has it switched on.
4. V2, V7: reminder ladder for video becomes 24 hours, 1 hour and 10 minutes before, each honouring the patient's
   settings. The 10-minute one carries a link that opens the waiting room.
5. V4: "Your dentist is ready" SMS if the push was not opened within 60 seconds.
6. Settings screen: the SMS and email switches now do something; V9 wording checked.
7. V41: the dashboard shows the message history and call times for each video visit.

### Phase 4: a call that survives real life (about 1.5 weeks)

1. V18: proper pre-call check. Ask for camera and microphone with a plain reason, show the patient their own
   picture, show a moving sound level, test the connection, and give a clear route to Settings if refused. Offered
   from the reminder, not only at the last second.
2. V16: connection quality indicator, a "Reconnecting…" overlay, automatic rejoin, and audio-only when the
   connection is too weak for video.
3. V19, V22: speaker, earpiece and Bluetooth choice; behaviour on an incoming phone call and when the app goes to
   the background, on both platforms.
4. V23: join time, drops, failed joins and quality reported to Sentry with no personal data. An alert when the
   failed-join rate passes a threshold.
5. V42 and a design pass on the call screen: theme colours, large touch targets, screen-reader labels, text that
   still fits at the largest font size.

### Phase 5: finish the flow (about 1 week)

1. V31: triage saved to the server as a draft after each step; resumes where the patient left off.
2. V32, V35: consent and triage options, per decisions 4 and 7.
3. V34: a real end-of-consult form for the dentist (what was found, advice, follow-up needed, with a "book
   follow-up" route), and a patient summary that shows it. Wording reviewed by a clinician.
4. V37, V38, V40: step counter, "next available" slots, hold running out handled in place, wording pass, week view
   for dentists.

### Phase 6: prove it (about 1 week, overlaps the others)

"No bug, no lag" is a claim that needs evidence. This phase produces it.

- **Automated:** unit and end-to-end tests for every item above; a Maestro flow for book, pay, triage, wait, join,
  end, summary on iOS and Android.
- **Real devices:** two real phones on staging with real Daily and Twilio test credentials. A written test sheet
  run on Wi-Fi, 4G, a throttled weak connection, and switching network mid-call. Includes: lock the phone, take a
  phone call, deny camera, kill the app and reopen, low battery mode, Bluetooth headset.
- **Targets to pass before release:** call connects in under 5 seconds on 4G for 95% of joins; a 10-second network
  drop recovers without the user doing anything; admit-to-patient-notified under 5 seconds; every booking produces
  a confirmation that is recorded as delivered; no screen in the journey without a loading, empty and error state.
- **Load:** 50 consults starting in the same minute on staging.
- **Reviews:** accessibility check of every video screen; clinician sign-off on wording; DPO sign-off on messages
  and consent.

## Order and size

About 7 to 8 working weeks for one developer, less with two (phases 3 and 4 touch different files and can run
side by side). Phase 1 is the cheapest and removes the outright bugs. Phases 2 and 3 are what change how it
feels. The SMS work is the only part that waits on the owner.

## What this plan does not include

On-demand video with no booking (open decision 3 in plan 13), recording calls, group calls, interpreters, and the
website. Booking for a child (plan 13) is assumed to land separately and before public launch.
