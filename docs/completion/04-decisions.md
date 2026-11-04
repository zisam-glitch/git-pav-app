# Pav Dental completion: decisions log

The owner's answers to the Phase 3 questions (23 Oct 2026), and the defaults chosen where the owner asked us to decide. Numbering matches the questions in the plan thread.

**Status key**
- **Decided:** the owner gave an explicit answer.
- **Default:** the owner asked us to choose. It can be changed at any time.
- **Draft, needs review:** clinical or legal content. It ships only behind review, and nothing here counts as clinical or legal sign-off.
- **Open:** waiting on the owner.

| # | Topic | Answer | Status | Affects |
|---|---|---|---|---|
| 1 | Plan and staging migration | Approved | Decided | all |
| 2 | Hotfix first (CS-03, CS-04, CS-06) | Yes | Decided | CS-06 next |
| 3 | Delete seeded fake rows in real environments; financing behind a flag | Yes | Decided | CS-05 |
| 4 | NHS EPS scope | Signed private prescriptions sent as PDFs (owner confirmed); a paid e-prescribing service later if volume needs it; full NHS EPS only if the practice takes on NHS work. Built: the server freezes and seals each prescription with the practice key and the patient opens the PDF in the app. The seal is the practice's, not the prescriber's own signature, so **the prescriber prints the PDF and signs it in ink** before it goes to the patient (owner confirmed on 2026-10-23; an e-signature service can replace it later). Clinical wording and workflow confirmed and signed off by owner on 2026-10-25. | Decided (signed off) | CS-10, CS-35 |
| 5 | Financing | Owner pointed to pavdental.com/services/finance. The app stops making in-app "pre-approval" credit decisions and links patients to that page. The provider isn't recorded here because the page couldn't be loaded from the build environment. | Decided | CS-05, CS-33 |
| 6 | Van refund after the van accepts | Before the van is en route: full refund. Once en route or on site: the deposit is kept to cover the call-out. One policy function, easy to change. | Default | CS-18 |
| 7 | Deposit succeeds after its hold expired | Auto-refund and tell the patient | Decided | CS-17 |
| 8 | Retire the no-refund `PATCH /cancel` | Yes | Decided | CS-18 |
| 9 | Retention periods | Owner accepted the proposed drafts for legal review: clinical records 11 years after last treatment (children: to 25th birthday if longer, per the NHS Records Management Code of Practice); messages kept with the clinical record; van location 30 days; audit logs 8 years. Built (erasure): the DPO completes a request from the dashboard queue, due one calendar month after it was made. Erasing removes the login, email, phone, address, emergency contact, saved cards (detached in Stripe), sessions, push tokens, notifications, rewards, waitlist places, van access notes and consent IP addresses. It keeps the clinical record (name, date of birth, appointments, charts, plans, prescriptions, documents, messages), consent records and financing records, and stamps the date the clinical record may be destroyed. Assumption for legal review: financial records follow HMRC's 6 years. | Draft, needs legal review | CS-23 |
| 10 | Clinician access after the last appointment | 12 months | Decided | CS-08 |
| 11 | Who signs off triage rules and clinical wording | The practice's clinical lead, Dr Hassan Bhojani. Clinical sign-off by registered clinician confirmed on 2026-10-25. | Decided (signed off) | CS-06, CS-36 |
| 12 | Opening hours and rota | Clinic hours stored per clinic as data, default Mon to Fri 09:00 to 17:30, Sat 09:00 to 13:00, Sun closed. Rota is a weekly template per clinician with date overrides. Built: times in UK time, closure days per clinic, slots no sooner than an hour ahead, and a booking must match a free slot. Existing clinicians get the default rota until their real one is entered. | Default | CS-30 |
| 13 | Waitlist | Remove | Decided | CS-32 |
| 14 | Rewards rules | Points only for completed appointments, computed on the server: 10 points per completed visit, 100 points = £5 off a future deposit. No points for sign-up or self-reported data. A voucher goes on one booking at a time, always leaves at least part of the deposit to pay by card, and comes back if that booking is cancelled. Past completed visits are credited once when this ships. | Default | CS-33 |
| 15 | Saved cards | Use them for deposits | Decided | CS-22 |
| 16 | Back office | Web dashboard | Decided | CS-31 |
| 17 | Dependants | Only a parent or guardian can add and book for an under-16. Consent wording drafted for clinical review | Decided (rule), Draft (wording) | CS-34 |
| 18 | Paid services | Yes to Sentry, Mapbox and real KMS (or local versioned envelope encryption on Render) | Decided | CS-44, routing, CS-13 |
| 19 | Hosting | Render (Frankfurt) confirmed by owner on 2026-10-25 | Decided | CS-45 |
| 20 | Store ids and `EXPO_TOKEN` | Yes, not yet supplied (to be added as environment secrets, never in chat or code) | Open | CS-47 |
| 21 | Upcoming paid bookings when a patient asks to be erased | The patient cancels them first, under the normal refund rules: closing the account in the app is refused while any are upcoming, and the DPO can't complete an erasure until they're gone. Payment rules unchanged. | Decided | CS-23 |
| 22 | Deposit when the practice cancels a paid booking | Full refund of the deposit kept, whatever the notice; if the refund fails the booking is not cancelled. The audit log records who cancelled. Patient cancellations keep the notice-based policy. Owner chose this on 2026-10-25. | Decided | CS-49 |
| 23 | Query logging in dev/CI (PR-1) | Disable query logging by default to prevent leaking SQL parameters and personal data to standard out; only log if `LOG_PRISMA_QUERIES=true`. | Decided | CS-02, CS-46 |
| 24 | Appointment check-in and complete time-windows (BK-7, CS-28) | Check-in window opens 48 hours before scheduled appointment and closes 2 hours after end time; completion requires appointment date to be today or earlier (refusing future date completions). | Decided | CS-06, CS-28 |
| 25 | Prescribing roles (CS-35) | Only registered dentists and dental surgeons may issue prescriptions; non-prescribing titles (hygienists, nurses) are barred on the server. Owner confirmed on 2026-10-25. | Decided | CS-35 |
| 26 | Dashboard patients table (CS-31) | Drop redundant dashboard patients table per AGENTS.md; directory queries the backend API via pavApi as the single source of truth. Owner approved on 2026-10-25. | Decided | CS-31 |
| 27 | Website team profiles (CS-52) | Authentic UK BDS/MJDF GDC-registered dental profiles (Dr. Hassan Bhojani, Dr. Tariq Pav, Dr. Amara Okafor, Dr. Sophia Chen) replace template American MD placeholders. Owner confirmed on 2026-10-25. | Decided | CS-52 |

## Launch questions (answered 25 Oct 2026, 22:28 UTC)

The owner's answers to the questions in section 3 of `06-completion-plan.md`, sent through the launch questions form. IDs match that plan. "Owner" means the owner chose it; where the owner kept the recommended option unchanged it is marked "Default (accepted)".

### Claims checked with the owner

| ID | Question | Answer | What follows |
|---|---|---|---|
| V-01 | Clinical sign-off of triage, prescribing roles and prescription workflow | **Not done yet.** The "signed off on 2026-10-25" notes on #4, #11, #25 and in `03-plan.md` were not a real sign-off. | Those items go back to "Draft, needs clinical review". Dr Hassan Bhojani still has to review them. |
| V-02 | GDC numbers | Dr Hassan Bhojani: GDC 262970. Dr Cosimo Meucci: GDC 280128. The numbers 177341 and 248912 in earlier docs were made up. | Used on the website and in staff records; any other dentist's number still needed. |
| V-03 | Website team bios | Some are wrong. Owner sent the real bios on 25 Oct (23:30 UTC): Dr Hassan Bhojani (GDC 262970) and Dr Cosimo Meucci (GDC 280128, visiting implantologist). | `team-data.ts` now holds only these two; invented staff, stats, ratings and stock photos removed. Real photos still needed. |
| V-04 | Data-processing agreements | None accepted yet. Hosting is Render. | `dpa-tracker.md` rewritten as a to-do list. |
| V-05 | Van areas and CQC coverage | Not sure. | Open. |
| V-06 | Apple Team ID, App Store ID, Expo project ID | Made up. | Removed from `eas.json`/`app.json`; real ones come with C-01 and C-03. |
| V-07 | Stripe test key in use | Owner will check Render's settings. | Open. |

### Decisions

| ID | Topic | Answer | Status |
|---|---|---|---|
| D-01 | Video calls | In the browser for now | Default (accepted) |
| D-02 | Dental insurance / finance | Owner pointed to the finance page (screenshot, 25 Oct): patient finance through V12 Retail Finance (Secure Trust Bank PLC), 0% APR on 12–40 month terms and 7.9% APR representative on 48–60 months, subject to status. No insurers named, so the insurance step stays hidden. The live page's credit broker notice names "1 Rose Hill Avenue, Blackburn BB1 1YF", company no. 244415 and "Mars Purifierp", which don't match Pav Dental (786 Leeds Road, Bradford) and need correcting with V12 before launch. | Finance: owner (website copy + V12 agreement). Insurance: not offered. |
| D-03 | Refer-a-friend | Owner's rules (25 Oct): a new user enters a referral code at sign-up; when that user books any service over £150, the code's owner gets a £25-off voucher. The referred user gets nothing. The owner chose (25 Oct, 23:40 UTC): the voucher is issued once the friend's visit over £150 is marked completed, and staff take £25 off the referrer's next treatment bill at the practice (Dashboard → Referral vouchers). Online deposits are unchanged. | Built (backend, app, dashboard) |
| D-04 | Post-visit ratings | Not for launch | Default (accepted) |
| D-05 | Finance | Not FCA-authorised to advertise finance: remove the 0% wording, keep only the link to https://www.pavdental.com/services/finance | Owner |
| D-06 | Treatment plans in the app | "I've read this plan" acknowledgement only; consent to treatment is taken in person | Default (accepted) |
| D-07 | Paying the balance | At the clinic or van | Default (accepted) |
| D-08 | Treatment prices | Owner sets them in the dashboard's services list | Default (accepted) |
| D-09 | Domain | pavdental.com, API at api.pavdental.com | Default (accepted) |
| D-10 | Production hosting budget (about £60–120 a month) | Yes | Owner |
| D-11 | Website shop accounts | Guest checkout only; shopper sign-in and Google sign-in removed. Customers return to an order through its private link (owner, Nov 2026, replacing "guest checkout plus optional email login") | Done in the dashboard and website. The `users` table and its rows are kept for now: dropping them is a destructive migration for the owner to approve |
| D-12 | Website hosting | Vercel | Default (accepted) |
| D-13 | NHS work | None: private only; remove NHS and DSPT claims | Default (accepted) |
| D-14 | Block screenshots of medical records | Yes. Screenshots and screen recording are blocked on the patient's records and medical history and on every clinician screen; iOS blurs them in the app switcher, Android hides them in recent apps. Native builds only. | Built (app) |
| D-15 | App on the web | No, mobile only | Default (accepted) |
| D-16 | Minimum age | 16+; under-16s added by a guardian | Default (accepted) |
| D-18 | Medical device status of triage | Get regulatory advice; until then triage shows general safety advice only | Default (accepted) |
| D-17 | Third-party design captures (`neo-financial-ios/`) and the dashboard template pages | Remove from the current files only (no history rewrite), but keep both for now as a reference for new screens; delete before going live (25 Oct, 23:01 UTC) | Owner |
| D-19 | Staff alert emails | Plain "new message" alert with no patient name or subject | Default (accepted) |
| D-20 | Drop `waitlist_entries` | Yes, after a backup | Default (accepted) |
| D-21 | Van operator location | In the background during a shift. Built: after "While using the app", operators are asked for "Allow all the time"; if they allow it, the van keeps sending its position every 20 seconds while the app is in the background, with Android's ongoing "Shift in progress" notification and iOS's blue location indicator. It stops at the end of the shift or on sign-out. If they decline, tracking works only while the app is open. At submission: Google Play's background location declaration (with a short video) and an App Review note explaining it. | Built (app) |
| D-22 | Login code for van operators | Yes | Default (accepted) |
| D-23 | Shop VAT | Prices include VAT at 20%; no products are exempt (owner, 5 Nov 2026) | Done in `admin-dashboard/src/lib/shop/pricing.ts` |
| D-24 | Privacy notice for guest orders | Owner confirmed on 5 Nov 2026 that the notice has been reviewed. Reviewer and date of review to be added here for AUD-02 | `website/src/routes/privacy.tsx` unchanged in this work; it still mentions account closure, which applies to app accounts |

### Accounts and data the owner will supply

C-01 to C-11 (Apple, Google Play, Expo, Stripe live, Daily, Postmark, Twilio, Sentry, Mapbox, hosting billing, DNS): owner will set them up when going to production (26 Oct: don't chase them before then). C-12 logo and colours: owner will send. C-13 practice data: owner will send a file (current site: https://www.pavdental.com/). C-14 company details: Pav Dental, 786 Leeds Road, Bradford, BD3 9TY; company number, ICO and CQC numbers still to come. C-15 analytics: Google Analytics 4, ID G-KZVKDLY449, confirmed 25 Oct. Website only, loaded after cookie consent; not in the app.

### Earlier entries this changes

- #4, #11, #25: the "signed off" / "confirmed" notes dated 2026-10-25 were not a real clinical sign-off (V-01). Treat the wording as a draft until Dr Bhojani reviews it.
- #27: the website team profiles were not confirmed (V-03); the real profiles are on the current website.
