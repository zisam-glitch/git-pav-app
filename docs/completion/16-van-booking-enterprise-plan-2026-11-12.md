# Dental van booking: plan to reach enterprise quality, 12 Nov 2026

The owner's brief: check the dental van booking logic and plan how to make the logic, the code and the experience
as good as an enterprise product, using the code of industry leaders as the reference.

This plan covers one journey end to end: **check the van comes to you, choose a treatment, give the address, hold a
deposit, a van accepts, watch it arrive, get treated, get the summary**, plus the operator's side (shift, incoming
requests, queue, route) and the staff dashboard's view of vans and shifts. It sits beside the video plan
([`15-video-booking-enterprise-plan-2026-11-10.md`](15-video-booking-enterprise-plan-2026-11-10.md)) and uses the
same severity and effort scales. Where the readiness plan
([`13-readiness-plan-2026-11-10.md`](13-readiness-plan-2026-11-10.md)) already covers something, its ID is quoted.

## How this was produced, and its limits

Read in full: `backend/src/routes/van.ts`, `van-queue.ts`, `van-stops.ts`, `public-van.ts`,
`backend/src/lib/van-eta.ts`, `van-eta-broadcast.ts`, `van-payments.ts`, `van-shift-end.ts`,
`cancellation-policy.ts`, `schemas/van-dispatch.ts`, the van models in `schema.prisma`, and in the app
`(patient)/van/live-track.tsx`, `features/van/tracking.ts`, `use-operator-location.ts`, `background-location.ts`,
`van-store.ts`.
Read in part or searched: `van-coverage.ts`, the van branches of `payments.ts` (webhook), `cancellations.ts`,
`background-jobs.ts` and `admin.ts`; the other patient van screens; the operator screens (`shift`, `incoming`,
`route`, `van-check-in`); the dashboard's van and van-shift screens. This closes most of the "second read of
`van.ts`" owed since 9 Nov (plan 13 item 20).

**Nothing was run.** No request was placed, no van was driven and no suite was executed. Every finding is from
reading code. Each fix starts with a failing test, which is also the proof the finding is real.

**Whose code was read.** Uber, DoorDash, Onfleet and the home-healthcare dispatch companies do not publish their
dispatch code, so it cannot be read. The open-source projects that solve the same problems were read instead, in
this session, and are listed with what each one taught under "What the reference code does". Anything stated from
memory and not read is marked as such.

## Where it stands today

What is already sound, and should be kept:

- **Races are taken seriously.** Accept, decline, patient cancel, expiry and shift end all run under one lock per
  shift with a compare-and-set, so a request cannot be accepted twice or accepted and cancelled at once. Partial
  unique indexes stop two open shifts on one van and two open requests for one patient.
- **Money is careful.** The deposit is a hold, captured only on accept with a stable idempotency key; every path
  that does not end in an accept releases it; failed releases are retried by a background job; every release is
  audited; the Stripe webhook covers authorise, fail, cancel, refund and dispute for van deposits.
- **Privacy is designed in.** Before accepting, the operator sees a postcode sector and a position rounded to
  about a kilometre, not the address. Gate codes and notes are encrypted. A patient further back in the queue
  gets an ETA but not the van's position. Location history is deleted after 30 days.
- **Travel times degrade gracefully.** Google, Mapbox or OSRM when configured, straight-line estimate otherwise,
  with a cache and a circuit breaker.
- **The operator's location keeps flowing in the background** (decision D-21).

What stops it being enterprise grade, in one paragraph: the van is **on-demand only** and depends on an operator
noticing a request on a screen within four minutes with nothing to alert them; the queue is a list of positions,
not a plan with times, so ETAs can be wrong and the appointment's recorded time is a guess; the rules for moving a
visit from one state to the next live in six different handlers that do not agree with each other; when something
goes wrong on the road (van breaks down, phone dies, patient not home) nobody has a button for it; and staff can
watch a shift but cannot intervene in a visit.

## Findings

Severity: **High** = a patient or operator is stuck, misled, charged wrongly or put at risk. **Medium** = works,
but visibly unfinished or fragile. **Low** = polish. Effort: XS under 2 hours, S half a day, M 1 to 2 days, L 3 to
5 days.

### A. Dispatch rules and state

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N1 | High | **Any active treatment can be requested by van.** Creating a request checks the service exists and is active, not that it is offered on the van. Clinic and video bookings do check this. A patient could request an implant consultation by van. | `van.ts` create request (no `supportedChannels` check; `booking.ts:226` has it) | XS |
| N2 | High | **Reordering the queue breaks its numbering.** Manual reorder and "Optimize" renumber only the stops not yet started from 1, while a stop in progress keeps position 1. Two stops then share a position; the ETA for the patient behind ignores the treatment in front of them and reads too short. Neither endpoint takes the shift lock, so a reorder can also collide with an accept. No ETA update is sent to the patients whose order changed. | `van-queue.ts` `renumberQueue`, both routes | S |
| N3 | High | **Two cancel paths with different rules.** Cancelling from the tracking screen runs under the shift lock, renumbers the queue and updates everyone's ETA. Cancelling the same visit from the appointment screen does none of those: it calls Stripe first, then writes, with no lock, leaves a gap in the queue and tells nobody. | `van.ts` cancel vs `cancellations.ts:74-134` | S |
| N4 | High | **Nobody but the patient can cancel an accepted visit.** The operator has no "I can't make this one" and staff have no cancel. A shift cannot be ended while a stop is open, by the operator or by staff. A van that breaks down with three accepted patients leaves them waiting until each cancels for themselves. | `van.ts` phase table, `van-shift-end.ts`, `admin.ts:1261` | M |
| N5 | High | **The phase change is not safe to repeat and not checked against the queue.** It reads, decides, then writes without a lock or compare-and-set: a double tap sends two "Van has arrived" pushes. The server lets any stop be set to "driving" whatever its place in the queue (only the app limits it to the first). Check-in is a separate endpoint that skips the transition table. | `van.ts` phase route, `van-stops.ts` | S |
| N6 | Medium | **The appointment's time is a guess that is never corrected.** On accept, the appointment's start is "now plus the ETA worked out when the patient asked", up to four minutes stale, and the end is that plus the treatment length. Neither moves when the queue changes or the van runs late, and the appointment is never marked in progress. Records, the appointments list and anything reporting on visit times read these. | `van.ts` accept (`startTime`), phase route | S |
| N7 | Medium | **Requests waiting for an answer do not count.** A second patient asking while the first is still pending is quoted as if they were next. The queue-full check at request time counts pending requests but is not locked, so more can pile on than the limit; the check at accept time ignores pending ones. | `van.ts` availability, create, accept | M |
| N8 | Medium | **A new visit always goes to the back.** The ETA assumes the new patient is served last, even when their address is on the way to an existing stop. "Optimize" exists but only when the operator presses it, and it minimises driving time with no regard to who was promised what. | `van-eta.ts`, `van-queue.ts` | M (with N20) |
| N9 | Medium | **One van, one chance.** A request is tied to a single shift when it is created. If that operator declines or does not answer, the patient is told to try again: it is never offered to another van, and there is no "tell me when a van is free" (plan 13). | `van.ts` create, decline; expiry job | M |
| N10 | Medium | **Fixed guesses in the arithmetic.** Ten minutes between visits and 45 minutes for a treatment with no length are constants written into three files. Parking, setting up and clearing down are not modelled. | `van.ts:216`, `van-eta-broadcast.ts:92`, `van-eta.ts` | S |
| N11 | Medium | **No booking for a child or dependant by van**, though clinic and video bookings carry one. | `van.ts` create, `VanServiceRequest` | M |
| N12 | Low | The same "find the best van" loop is written twice (availability and create), and runs two queries per shift one after another. Fine for one van, a trap at five. | `van.ts:805`, `:907` | S |

### B. Operator alerting and acceptance

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N13 | High | **The operator is never told a request has arrived.** No push, no sound. The request shows only if the Incoming screen is open, which polls every 5 seconds. An operator who is driving or treating will miss a four-minute window almost every time, and the patient's hold is released with "no van accepted in time". | `van.ts` create (notifies the patient only); `(operator)/incoming.tsx` | S |
| N14 | High | **A van that has gone quiet is still offered to patients.** If the operator's phone dies or loses signal the shift stays "online" with its last position. Availability does not look at how old that position is. Patients are quoted an ETA from a van nobody can reach, and the dashboard shows "last reported in" but raises nothing. | `van-coverage.ts` `getOnlineShiftsCoveringPoint`, `van.ts` availability | S |
| N15 | Medium | **Four minutes is the wrong shape for acceptance.** It is long for a patient staring at a countdown and short for a clinician mid-treatment. The reference systems either assign automatically and let the crew object, or offer for under a minute and move on. Needs a decision (below). | `van-eta.ts` `REQUEST_TIMEOUT_MS` | decision |
| N16 | Medium | **The operator sees the patient's full name before accepting**, although the address is hidden for privacy until then. | `van.ts` shift/current `incoming` | XS |
| N17 | Medium | **Phase changes need a connection.** Only visit notes queue offline. In a car park with no signal, "Arrived" fails with an alert and the patient is not told the van is outside. | `(operator)/route.tsx`, `offline-notes-queue.ts` | M |

### C. Location and ETA quality

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N18 | Medium | **Every position report is believed.** No time from the phone (the server stamps arrival time, so a report delayed in a tunnel looks fresh), no accuracy limit, no check for an impossible jump, no guard against reports arriving out of order. The foreground path does not send accuracy at all. | `van.ts` shift/location, `schemas/van-dispatch.ts`, `use-operator-location.ts` | S |
| N19 | Medium | **The patient is not told when the position is old.** The map shows the van where it last reported, with no "last updated 4 minutes ago". | `live-track.tsx`, `tracking.ts` | XS |
| N20 | Medium | **There is no plan, only positions.** Nothing stores when each stop is expected to be reached, started and finished. Every reader recomputes an ETA its own way (three places), the push says "around 23 minutes" while the screen shows a band, and nobody can later ask "how wrong were our ETAs?". | `van-eta.ts`, `van-eta-broadcast.ts`, `van.ts` | M |
| N21 | Low | The ETA cache and circuit breaker live in one server's memory. Fine with one server; note it when a second is added. | `van-eta.ts` | none now |

### D. Money

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N22 | Medium | **Stripe is called while the database lock is held.** Accept, decline, cancel and shift end call Stripe inside a transaction that holds the shift lock for up to 30 seconds. A slow Stripe freezes every other action on that shift and ties up a database connection. If the database write fails after Stripe succeeded, the two disagree until a sweep repairs it (a capture followed by a rollback ends as a refund the patient sees). | `van.ts` accept, decline, cancel; `van-shift-end.ts` | M, needs owner's go-ahead |
| N23 | Medium | **No rule for a no-show.** The operator can mark "no-show" the second they arrive. The deposit, captured at accept, is simply kept. There is no waiting time, no record of trying to reach the patient, and nothing in the decisions log saying the deposit is kept. | `van.ts` phase route | S, needs decision |
| N24 | Low | In mock-payment mode an accept skips the deposit check entirely, so tests cannot catch "accepted without a hold". | `van.ts:487` | XS |

### E. Patient experience

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N25 | High | **A lost connection looks like a lost booking.** If the status check fails, the tracking screen shows "No active van request" and a button to request a new one, to a patient whose deposit is held and whose van is on its way. | `live-track.tsx:120` (no error state) | XS |
| N26 | High | **Van visits cannot be booked ahead.** With no van on shift the patient can only be sent to the clinic or video (plan 13, item 20). This is the largest gap between this and any field-service product. | no scheduled path: `booking.ts:311` | L+ (phase 4) |
| N27 | Medium | **No way to reach the crew, and no name.** The patient sees a van name and a number plate, not who is coming, and cannot message "I'm at the side gate". The appointment conversation built for video (V48) is not used here. | `live-track.tsx` | M |
| N28 | Medium | **Push is the only channel.** Request received, accepted, on the way, arrived, completed, no-show, expired: all push only. A patient who declined notifications learns nothing unless the screen is open. No confirmation or receipt by email (R1, V1 pattern exists for video). | `van.ts`, `van-shift-end.ts`, expiry job | S |
| N29 | Medium | **The tracking screen checks every 5 seconds for ever**, at every stage, including before a van has accepted and during treatment. | `live-track.tsx:34` | S |
| N30 | Medium | **After a decline or time-out the patient starts again from the postcode.** The address, treatment and parking answers are not offered back. | `live-track.tsx` terminal states | S |
| N31 | Medium | Known from plan 13 and still open: the treatment chosen in the catalogue is discarded (R16); unconfirmed claims on the van screens (R27); the address is typed by hand with no lookup. | van screens | S each |
| N32 | Low | Wording: "Authorize deposit", "Review & dispatch van", "Select clinical treatment", "Checking dispatch status...", notification titles in Title Case. Plain British English wanted, as in plan 13's wording table. | van screens, push text | S |

### F. Staff view and evidence

| ID | Severity | What | Where | Effort |
|---|---|---|---|---|
| N33 | High | **Staff can watch but not act.** The dashboard lists shifts and can end one with no open stops. It cannot show a shift's visits, cancel or move a visit, mark one complete for an operator whose phone died, or see a map. | `admin-dashboard` van-shifts; `admin.ts` | L |
| N34 | Medium | **No timeline of a visit.** State lives in a handful of timestamp columns. Who moved a stop to which phase and when, what ETA was promised, when the patient was told: none of it is kept as a record a person can read back after a complaint. | `VanServiceRequest` | M |
| N35 | Medium | **Nothing is measured.** Time to accept, share of requests that expire, ETA promised against actual arrival, no-shows, cancellations by stage, routing-provider failures: none are counted, so nobody will know if the service is getting worse. Errors go to `console.error`. | van routes and libs | M |
| N36 | Medium | `van.ts` is 1,345 lines mixing rules, payments, encryption and HTTP (checklist I1). The rules cannot be tested without a request. | `van.ts` | with phase 2 |

## What the reference code does

Read in this session. "Fact" is what the code or its documentation says; "judgement" is how it is applied here.

| Source | What it does (fact) | What we take from it (judgement) |
|---|---|---|
| **Timefold** vehicle-routing quickstart: `Visit.java`, `VehicleRoutePlanRecommendationService.java` | Each visit has an earliest start, a latest end and a service duration. Arrival, start of service and departure are not stored by hand: they are derived down the chain from the visit before. For a new visit, `recommendAssignment` scores every position on every vehicle and returns the best few, best first, including "leave it unassigned". | N20: store a plan (arrival, start, finish per stop) derived by one function. N8: place a new visit at the best position that keeps earlier promises, not at the back. We do not need the solver itself: with at most five stops, trying every position is exact and instant. |
| **VROOM** `docs/API.md` | A job has a service time and a separate setup time, time windows, required skills and a priority. A vehicle has skills, breaks, working hours and a maximum number of tasks. Output gives each step's arrival and waiting time and lists what could not be assigned. A "plan mode" checks a given order and reports every promise it breaks. | N10: model setup time separately from treatment. N1: "skills" is the right shape for "which van can do which treatment". Phase 4: windows, breaks and working hours for scheduled days. Plan mode is the check to run before accepting a reorder (N2). VROOM itself becomes worth adopting at several vans and full days; not before. |
| **Cal.com** `reserveSlot.handler.ts`, `SelectedSlots` and `Booking` models | A slot being booked is held in its own table with a release time, so two people cannot take it and an abandoned hold frees itself. A booking carries a unique idempotency key, a link to the booking it was rescheduled from, a reassignment reason and a host no-show flag. | N7: a pending request is a hold on the queue and must count until it expires. Phase 4: the same hold for scheduled windows (our clinic booking already has one). N4, N23: reasons and "who failed to turn up" are first-class fields. |
| **Fleetbase** fleetops `Order.php` | An order is either scheduled (dispatched when its time comes) or ad hoc (offered to drivers within a set distance, 6 km by default). Assigning and unassigning a driver each notify them. Cancelling takes a reason. Every status change is an activity entry, and completion can require proof. | N13: offering a job always notifies the crew. N4: cancel with a reason, reassign with a notice. N34: a visit is a list of activities, not a set of columns. N26: scheduled and on-demand are the same order with a different dispatch moment. |
| **Traccar** `FilterHandler.java` | Before a position is accepted it is checked: invalid, zero, duplicate, older than the last one, in the future, too far in the past, too inaccurate, too small a move, impossible speed since the last fix, too soon after the last one. | N18: the same short list of checks on our position reports, using the phone's own timestamp. |

Not read, stated from general knowledge, check before relying on it: card authorisation holds lapse after a few
days, which is why a scheduled van visit must take its deposit at booking the way clinic bookings do, not hold it
until the day; and the large ride and delivery platforms assign work automatically and treat a crew's refusal as
the exception.

What is deliberately **not** adopted: a routing solver service, hexagonal map indexing, a message broker, or a
live socket connection. One practice with one or two vans does not need them; ADR-0001 and ADR-0002 already say
so, and nothing found here changes that.

## The design to build towards

Five ideas, each replacing something scattered with something single.

1. **One place decides what a visit may do next.** A dispatch module with one function per event (accept,
   decline, set off, arrive, start, complete, no-show, cancel, reassign, expire). Each runs under the shift lock,
   checks the move is allowed from the current state and the current queue, writes the change and a timeline
   entry together, and returns what must happen afterwards (messages, payment step, ETA update). The six
   handlers become thin callers. This fixes N2, N3, N5 and N36 at the root and gives N34 for free.
2. **A plan, not a queue.** For each shift, one function turns "where the van is, what it is doing, the stops in
   order" into planned arrival, start and finish times for every stop, and stores them. The patient's ETA, the
   push, the appointment's time, the operator's list and the dashboard all read the same numbers. Pending
   requests appear in the plan as provisional. A new request is placed where it costs least without breaking a
   promise already made.
3. **A promise is a window, and we keep score.** The patient is told a window ("between 2:10 and 2:30"), it is
   recorded with the visit, and the actual arrival is recorded beside it. If the plan moves past the window the
   patient is told once, plainly ("running about 15 minutes late").
4. **Database first, then the outside world.** State changes and "what needs doing next" are written in one
   short transaction. Stripe calls and messages happen after it, from a small durable list that is retried, with
   the idempotency keys already in use. The deposit retry job already works this way; this makes it the rule.
5. **Every exception has a button.** Operator cannot make it; van broken down; patient not answering; running
   late; phone died. Each has an owner (operator or staff), a reason, a message to the patient and a money rule.

## Decisions needed from the owner first

Phases 1 and 2 do not wait for these except where noted.

1. **Who accepts a request?** Today an operator must tap Accept within four minutes. Recommendation: the system
   accepts automatically when the plan has room and the van is reachable, the crew is alerted at once and has a
   short time to object with a reason. The patient gets an answer in seconds. Alternative: keep manual accept,
   add the alert (N13) and shorten the wait to about 90 seconds. *This changes the moment the deposit is
   captured, so it needs your decision.*
2. **Scheduled van visits** (N26). Recommendation: yes, as arrival windows of about two hours on days a van is
   planned to be out, with the deposit taken at booking under the clinic refund rules. It needs van working days
   in the rota and is the largest item here.
3. **No-show rule** (N23). Suggest: the crew waits 10 minutes, the app records one message and one call attempt,
   then no-show can be marked and the deposit is kept. *A payments rule: your decision.*
4. **When the van cancels** (N4). Suggest: full refund always, a message with an apology and a one-tap rebook.
   *A payments rule: your decision.*
5. **Moving Stripe calls out of the locked transaction** (N22). The rules for when money is held, taken and
   returned do not change; the order of operations inside the server does. Under the ground rules this still
   needs your go-ahead.
6. **Which treatments each van can do, and who treats.** A van visit records a van and an operator but no
   dentist. Whether the operator is the clinician, and which treatments are safe in a van, is a clinical and CQC
   question (V-05 is still open). *Needs a clinician.*
7. **Can the patient message or call the crew?** Recommendation: messages through the existing inbox, tied to
   the visit, open from acceptance until an hour after it ends. No phone numbers shown either way.
8. **How precise is the promise?** Suggest a 20-minute window for on-demand, 2 hours for scheduled, and "late"
   means 10 minutes past the end of the window.
9. **Wording** of every van notification and of the no-show and late messages: a clinician and the DPO review
   them, as for video.

## The plan

One concern per pull request. Every item starts with a failing test. Nothing ships until its suite is green.
Schema changes are additive and follow `migrations.md`.

### Phase 1: make it correct (about 1 week)

No design change, no decision needed.

1. N1: refuse a treatment the van does not offer.
2. N2: reorder and optimise renumber the whole queue after the stops in progress, under the shift lock, and send
   the ETA update. Add a database rule that two open stops on a shift cannot share a position.
3. N3: the appointment-screen cancel calls the same code as the tracking-screen cancel.
4. N5: phase change under the lock with compare-and-set; only the first stop may set off; check-in uses the same
   table; repeated taps return the current state and send nothing twice.
5. N6: the appointment is marked in progress when treatment starts, and its start and end are set from the real
   times when the visit ends.
6. N25, N19: the tracking screen shows "Can't reach us, retrying" and keeps the last known state; shows how old
   the van's position is.
7. N13: push to the operator's phone for every new request, with sound, opening the request when tapped.
8. N14: a shift with no position report for 3 minutes is not offered to new patients; staff see it flagged on
   the dashboard's attention list.
9. N16, N24: initials only before accept; mock mode still requires the hold.
10. N18: position reports carry the phone's time and accuracy; the server drops stale, out-of-order, wildly
    inaccurate and impossible ones.

### Phase 2: one rulebook and one plan (about 2 weeks)

1. The dispatch module (design 1). Move accept, decline, phases, check-in, cancel, expiry and shift end onto it
   one pull request at a time, each with the existing race tests still green. New table: visit timeline
   (N34), holding the event, who did it, when, and no health data.
2. The plan (design 2, N20, N10): planned arrival, start and finish per stop, recomputed on every change and on
   a meaningful move of the van. Setup time and the gap between visits become settings per service and per van.
   Every reader switches to the stored plan; the three separate ETA calculations are deleted.
3. N7, N12: pending requests count as provisional stops; request creation takes the shift lock for its final
   check; the "best van" choice is one function.
4. N8: a new request is placed at the cheapest position that keeps every existing window; "Optimize" refuses an
   order that would break one and says which.
5. N22, once decision 5 is given: payment steps and messages run after the transaction from a retried list.
6. Promise and score (design 3): the window told to the patient is stored; actual arrival is stored; one "running
   late" notice when the plan leaves the window.

### Phase 3: when things go wrong (about 1.5 weeks)

1. N4: operator "can't make this visit" with a reason; staff cancel and staff "mark complete / no-show on the
   operator's behalf"; ending a shift offers to cancel what is left, with the refund rule from decision 4.
2. N9: a declined or unanswered request is offered to the next van that covers the address, if any; if none,
   "tell me when a van is free" using the existing waitlist table.
3. N23: no-show needs the wait and the contact attempts, per decision 3.
4. N17: phase changes queue on the phone when offline and send in order when the signal returns, each safe to
   repeat (phase 1 item 4 makes that true).
5. N33: dashboard shift page: the visits on a shift with their planned and actual times, the timeline, the van's
   last position on a map, and the actions above. Through `/api/admin/*` only.
6. Decision 1, if automatic acceptance is chosen: built here, on top of the plan.

### Phase 4: book a van ahead (about 3 weeks, decision 2)

1. Van working days: planned shifts for a van and crew (date, hours, area, breaks), managed from the dashboard
   beside the rota.
2. Arrival windows: for a date and an address, the windows in which the plan still has room once travel, setup,
   treatment and the gap are counted. A chosen window is held while the patient pays, the way clinic slots are.
3. Booking, rescheduling and cancelling a scheduled van visit through the existing booking flow and refund
   rules; deposit taken at booking.
4. On the day: the scheduled visits are already in the shift's plan when the operator starts; on-demand requests
   fit around them and can never push one out of its window.
5. Reminders: the day before with the window, and "you're next" when the van sets off.
6. N11: a van visit for a dependant, scheduled or on demand.

### Phase 5: the experience (about 2 weeks, overlaps 3 and 4)

1. Patient: address lookup from the postcode and a saved home address; the chosen treatment carries through
   (R16); every unconfirmed claim removed (R27); one honest status line per stage with the window, not a
   countdown; the crew's first name and the van; "Message the van team" (decision 7, N27); after a decline or
   time-out, "Try again" with everything kept (N30).
2. Notices (N28): each stage by push, and confirmation, cancellation and receipt by email, recorded against the
   visit with the delivery result, reusing the video notice code.
3. N29: check every 5 seconds only while the van is driving to this patient; every 30 seconds otherwise; stop in
   the background; check at once on return and on any push.
4. Operator: one "Today" screen with the next action as one large button, the plan with times, a clear alert for
   a new request, "running late" and "can't make it" within reach, and a handoff to the phone's maps.
5. Wording pass (N32) and accessibility pass on every van screen: screen-reader labels, large text, touch sizes.

### Phase 6: prove it (about 1 week, overlaps the others)

- **Automated:** unit tests for the dispatch module and the plan with a pinned clock; the existing race suite
  extended to reorder, both cancels and phase changes; a simulated shift (a scripted van driving a recorded
  route with requests arriving) run in CI; Maestro flows for request to summary on both platforms.
- **Two real phones on staging:** a written drill covering lost signal, phone locked, app killed, declined card,
  decline, time-out, cancel at each stage, late running, no-show and breakdown.
- **Measured (N35), with targets to pass before release:** request answered within 60 seconds for 95% of
  requests; van arrives inside the promised window for 90% of visits; no patient hears nothing for more than 10
  minutes while a visit is open; a quiet van is flagged within 3 minutes; every hold that does not become a
  visit is released within 2 minutes; the tracking screen opens in under 1 second. Counted without personal
  data and reported to Sentry, with an alert on each.
- **Reviews:** clinician sign-off on wording and the no-show rule; DPO sign-off on the notices, the timeline and
  the crew's name being shown.

## Order and size

About 10 to 11 working weeks for one developer with scheduled visits, about 7 without. Phase 1 is the cheapest
and removes the outright bugs; two of its items (N13, N14) decide whether the service works at all on a busy
day. Phase 2 is what makes everything after it simple. Phases 3 and 5 touch different files and can run side by
side with a second developer. Nothing in this plan adds a paid service; a routing key for road ETAs is already
optional in the code.

## What this plan does not include

Phone calls or SMS between patient and crew, tips, live typing, more than one van per visit, route planning
across several vans with a solver, van stock and equipment tracking, the clinical record made during the visit
(tooth chart and notes are their own screens), and the website. Real van areas still need drawing (V-05); the
plan assumes they exist before launch.
