# Video consult: plan to reach finished-product quality, 10 Nov 2026

The owner's brief: the video booking journey should work like an enterprise app. No bugs, no lag, no dead ends,
a real video call, real messaging through the app's own inbox, nothing fake or left over, and it should look and read as if a specialist product
team built it.

This plan covers one journey end to end: **book, pay, answer triage questions, wait, talk to the dentist, get the
summary**, plus the in-app inbox (Messages for patients, Inbox for dentists) and every notification the two
receive along the way.

**Scope note:** "real SMS" in the brief means the inbox inside the app, not text messages to a phone. Phone SMS
is out of this plan. It stays as it is today: login codes only. It builds on the readiness plan
([`13-readiness-plan-2026-11-10.md`](13-readiness-plan-2026-11-10.md)); where an item there already covers
something, its ID (R1, R12 and so on) is quoted and not repeated.

## How this was produced, and its limits

Read in full: `backend/src/routes/video.ts`, `backend/src/lib/communication-service.ts`,
`backend/src/lib/patient-push.ts`, `backend/src/routes/messages.ts`, the reminder ladder in `backend/src/lib/background-jobs.ts`, and in the app
`features/video/native-call.tsx`, `features/video/video-hooks.ts`, every screen under `(patient)/video/`, and the
first half of `(clinician)/consult-room.tsx`, `(patient)/(tabs)/messages.tsx` and `(clinician)/inbox.tsx`.
Searched, not read line by line: `booking.ts`, the booking screens, the admin dashboard (including its inbox
screen).

**Nothing was run.** No call was placed and no suite was executed for this plan. Findings are from reading code.
Each fix below starts with a failing test, which is also the proof the finding is real.

## Where it stands today

What is already real and sound:

- The call is a real, native Daily call inside the app (PR #56), in a private room per appointment, entered with a
  short-lived token. A patient cannot get a token until the dentist admits them.
- Payment, the booking hold, cancellation and refund rules are the same tested code the clinic bookings use.
- Triage answers are stored encrypted. Red-flag answers are checked on the server.
- Reminders are claimed safely by one worker at a time and retried after a crash.
- Inbox messages are stored encrypted, each side has its own unread flag, access is limited to the patient, the
  practice team and dentists who treat that patient, and every send is audited.

What stops it feeling finished:

1. **The inbox is not usable as a conversation.** A patient cannot read a thread: tapping one opens a reply box
   and nothing else (R4). A new message produces no push, only an email. Nothing refreshes until the app is
   restarted. A failed send shows a green "success" message. And the inbox has no connection to the video
   consult: no way to message from the waiting room, and the dentist cannot write to the patient afterwards.
2. **The patient is told nothing about a booking.** Booking, rescheduling and cancelling send no push, no email
   and no inbox message (R1). Reminders are push only, so a patient who declined notifications hears nothing.
3. **The two people cannot see each other until they are both in the call.** The dentist has no way to know the
   patient is in the waiting room. The patient is not told when the dentist lets them in unless the waiting screen
   is open and in front. Nobody is told if the other side never turns up.
4. **The call has no safety net.** No "reconnecting" state, no warning on a weak connection, the screen can sleep
   mid-call, no speaker or Bluetooth choice, and nothing is reported to us when a call goes badly.
5. **The screens say things that are not true.** "Consultation ready" when nobody is ready. "Completed" on a
   consult that did not happen (R13). Video reminders tell the patient to "arrive 10 minutes early" and "tap for
   directions".
6. **Left-over code.** `video-hooks.ts` is 370 lines of mostly unused hooks, one of which asks for photo-library
   access and calls it microphone access.

## Findings

Severity: **High** = a patient or dentist is stuck, misled, or loses data. **Medium** = works, but visibly
unfinished. **Low** = polish. Effort: XS under 2 hours, S half a day, M 1 to 2 days, L 3 to 5 days.

### A. Notifications (push and email)

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V1 | High | No confirmation, reschedule or cancellation message on any channel (R1). | `booking.ts`, `cancellations.ts`, `payments.ts` webhook | M |
| V2 | High | Reminders are push only, no email. `emailEnabled` is saved and never read (R2). | `background-jobs.ts:259`, `schema.prisma:563-564` | M |
| V3 | High | Video reminders use clinic wording: "arrive 10 minutes early", "at Pav Dental. Tap for directions and check-in info". The ladder does not look at the channel. | `background-jobs.ts:427` onwards | S |
| V4 | High | No message when the dentist admits the patient. If the app is in the background the patient never finds out. | `video.ts` admit-patient | S |
| V5 | High | Tapping a push does nothing: no notification response listener (R5). A "join now" push cannot open the waiting room. | `notification-hooks.ts:229` | S |
| V6 | Medium | No record of which notice went to whom for which appointment, or whether it was delivered. Push receipts are checked but not tied to an appointment. | `communication-service.ts`, `patient-push.ts` | M |
| V7 | Medium | The last reminder is 2 hours before. A video consult needs one about 10 minutes before, with a link that opens the waiting room. | `background-jobs.ts` ladder | S |
| V8 | Medium | Reminder de-duplication matches on user, time and title, not appointment. Two bookings at the same time for a parent and child would share one reminder. | `background-jobs.ts` ladder | XS |
| V9 | Low | Onboarding promises SMS and email reminders. Remove "SMS" from the wording; the email part becomes true once V2 lands. Hide the unused SMS switch in settings. | onboarding and settings screens | XS |

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

### G. The inbox (Messages for patients, Inbox for dentists)

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| V43 | High | **A patient cannot read a conversation.** Tapping a thread opens a one-line reply box; only a two-line preview of the last message is ever shown (R4). | `(tabs)/messages.tsx:80`, `:261` | M |
| V44 | High | **No push for a new message, in either direction.** The patient gets an email, the dentist gets an email, the practice gets an email. Nobody's phone tells them. | `messages.ts:261-284`, `:377-419` | S |
| V45 | High | **Nothing arrives until the app is restarted.** The thread list is fetched once: no refresh on return to the app, no refresh while a thread is open, and the patient list has no pull-to-refresh (R7). | `use-dental-api.ts:238` | S |
| V46 | High | **A failed send looks like a success.** Both screens show every toast in the green "success" style, including "Could not send reply". There is no per-message "sending / sent / failed, tap to retry". | `messages.tsx:127`, `inbox.tsx:136` | S |
| V47 | High | **A message can be sent twice.** The server has no duplicate guard on create or reply, so a double tap or a retry after a slow response sends it again. | `messages.ts` create and reply | S |
| V48 | High | **The inbox and the video consult do not know about each other.** A thread cannot be linked to an appointment. The waiting room has no "message the practice". The device check tells the patient to go to the Messages tab. | `schema.prisma:807`, video screens | M |
| V49 | High | **A dentist cannot start a conversation.** Only a patient can open a thread; staff can only reply. After a video consult the dentist cannot write to the patient unless the patient wrote first. (If a staff account calls the create endpoint, it makes a thread with the staff member recorded as the patient.) | `messages.ts:186-259` | M |
| V50 | Medium | **Slow by design.** Every load of the list returns every message of every thread (up to 100 threads), each decrypted one by one. It gets slower with every message sent. There is no "open one thread" endpoint and no paging of messages. | `messages.ts:108-174` | M |
| V51 | Medium | The message box is one line on both sides, for messages up to 4,000 characters. | `messages.tsx`, `inbox.tsx` | XS |
| V52 | Medium | The dentist's conversation view is a panel about 200 points high. After sending, a made-up copy of the reply is added on screen under the name "You (Clinician)" although the server stores the real name, and the open thread does not update when new messages arrive. | `inbox.tsx` | M |
| V53 | Medium | No photos. The list draws an "Attachment" row that can never appear, because nothing can attach a file. For dentistry a photo is the most useful thing a patient can send. | `messages.tsx`, `messages.ts` | L |
| V54 | Medium | No unread count on the Messages tab; the home bell always shows a dot (R6). | `(tabs)/_layout.tsx:87` | S |
| V55 | Medium | "Care team" routing picks the dentist from the patient's latest appointment by date, whatever its status, so a message can go to a dentist who has never seen them. The app also sends the name shown on the thread, and the server trusts it. | `messages.ts` create | S |
| V56 | Medium | A patient deleting a thread deletes it for staff too, including the dentist's written advice. Whether that advice is part of the clinical record is a clinical and legal question. | `messages.ts` delete | S, needs decision |
| V57 | Medium | The email about a staff reply puts the thread subject, which may describe a health problem, in the email subject line (R18). | `messages.ts:385` | XS, needs DPO |
| V58 | Low | Just after creating a thread the server returns the subject in its encrypted form. It corrects itself on the next refresh. | `messages.ts` create | XS |
| V59 | Low | The emergency notice and reply-time text are fixed in the server code (the constant is named "draft"). Wording needs a clinician. | `messages.ts:17-24` | S |
| V60 | Low | Wording: "Route message to:", "Care team clinician", "Write clinical reply to patient…". Plain words wanted. | both inbox screens | XS |

## Decisions needed from the owner first

None of these can be settled in code. Phases 1 and 2 do not wait for them, except where noted.

1. **Do booking notices go into the inbox?** Recommendation: yes. Each video appointment gets one conversation
   with the practice. The confirmation, "your dentist is ready" and the dentist's summary appear in it, and the
   patient can reply there. Push and email only say "you have a new message", never the content.
2. **Photos in messages** (V53). Recommendation: yes, with the same checks and encrypted storage as triage
   photos. It is the largest inbox item; say no and the plan is about a week shorter.
3. **Can a patient delete a conversation that contains a dentist's advice?** (V56) Recommendation: the patient
   can hide it from their own list; the practice keeps it. *Needs a clinician and the DPO.*
4. **Recording.** The consent switch implies calls are recorded. They are not. Either remove the switch or decide
   to record and get the DPO and a clinician to word it (R11, B2). Recommendation: remove it for launch.
5. **No-show rule for video.** How long does each side wait (suggest 10 minutes), and what happens to the money
   if the patient does not come, or the dentist does not? *This changes how payments are refunded, so it needs
   your decision before V14 is built.*
6. **Joining window.** Suggest: waiting room opens 10 minutes before the start time, closes at the end time.
7. **Triage options and end-of-consult form fields** (V34, V35): a clinician must review the wording.
8. **Staging needs a real Daily test key** so calls can be proved on real phones, not assumed.

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
6. V46, V47, V51, V58: inbox sends cannot double, failures look like failures, the message box grows as you type.
7. V17, V20, V21, V24: keep the screen awake, fresh token on every join, "your dentist has left" state, chat off.
8. V39: delete the unused hooks.

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

### Phase 3: a real inbox, and notices that arrive (about 2.5 weeks)

1. V50: the server gets a light thread list (last message and unread count only) and an "open one thread"
   endpoint that pages through messages. Additive migration: link a thread to an appointment.
2. V43, V52: one proper conversation screen, shared by patient and dentist. Full history, day separators, the
   real sender names, a growing message box that stays above the keyboard, each message marked sending, sent or
   failed with tap to retry, and "Seen" once the other side has read it.
3. V44, V45, V54: push for every new message (the push says "New message from Pav Dental", nothing more), opening
   the conversation when tapped. The list and an open conversation refresh on return to the app and every few
   seconds while open. Unread count on the tab; the bell tells the truth.
4. V48, V49: one conversation per video appointment (decision 1). "Message the practice" in the waiting room and
   on the appointment screen. The dentist can write to the patient from the consult room and afterwards, and the
   consult summary is delivered into that conversation.
5. V1, V2, V6, V7: confirmation, reschedule and cancellation notices by push and email, and into the inbox.
   Video reminders become 24 hours, 1 hour and 10 minutes before; the last one opens the waiting room. Email
   honours the patient's setting. Each notice is recorded against its appointment with its delivery result.
6. V55, V56, V57, V59, V60: routing to a dentist who has actually treated the patient, the delete rule per
   decision 3, no health wording in email subject lines, reviewed emergency wording, plain words.
7. V53: photos in messages (decision 2).
8. V9: remove the SMS promise and the unused SMS switch. V41: the dashboard shows notices sent and call times for
   each video visit.

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
  end, summary on iOS and Android, and one for a two-way conversation in the inbox.
- **Real devices:** two real phones on staging with a real Daily test key. A written test sheet
  run on Wi-Fi, 4G, a throttled weak connection, and switching network mid-call. Includes: lock the phone, take a
  phone call, deny camera, kill the app and reopen, low battery mode, Bluetooth headset.
- **Targets to pass before release:** call connects in under 5 seconds on 4G for 95% of joins; a 10-second network
  drop recovers without the user doing anything; admit-to-patient-notified under 5 seconds; every booking produces
  a confirmation that is recorded as delivered; a message sent on one phone shows on the other within 5 seconds
  with the app open, and as a push within 10 seconds with it closed; the inbox opens in under 1 second with 200
  conversations; no screen in the journey without a loading, empty and error state.
- **Load:** 50 consults starting in the same minute on staging.
- **Reviews:** accessibility check of every video screen; clinician sign-off on wording; DPO sign-off on notice
  wording and consent.

## Order and size

About 8 to 9 working weeks for one developer, less with two (phases 3 and 4 touch different files and can run
side by side). Phase 1 is the cheapest and removes the outright bugs. Phases 2 and 3 are what change how it
feels. Nothing in this plan adds a paid service.

## What this plan does not include

Text messages to a phone (SMS), live typing indicators, on-demand video with no booking (open decision 3 in
plan 13), recording calls, group calls, interpreters, and the
website. Booking for a child (plan 13) is assumed to land separately and before public launch.
