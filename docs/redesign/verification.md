# Verification (Phase 4)

One row per item in `screen-inventory.md`. Shots are from the iOS simulator (iPhone 17) against the local
backend with seed and synthetic data. **Pass** means the after shot was checked by eye against the Wise
tokens and components: spacing, type, colour, and nothing clipped or under the status bar.

Status key: **Pass**; **Pass (mocked)** means the state was forced (stated in the notes);
**Not verifiable** means no after shot could be taken here (the reason is in the notes);
**n/a** means system UI or no UI.

## 1. Entry and auth (signed out)

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | Welcome | Wise: Onboarding welcome: full-bleed brand colour, short promise, "Get started" + "Log in" | [auth-01-welcome](before/auth-01-welcome.png) | [auth-01-welcome](after/auth-01-welcome.png) | Pass |  |
| 2 | Sign in | Wise: Log in (email, password, "Trouble logging in?") | [auth-02-sign-in](before/auth-02-sign-in.png), [auth-02b-sign-in-code-step](before/auth-02b-sign-in-code-step.png) | [auth-02-sign-in](after/auth-02-sign-in.png), [auth-02b-sign-in-code-step](after/auth-02b-sign-in-code-step.png), [auth-02c-sign-in-error](after/auth-02c-sign-in-error.png) | Pass | Dev builds show the demo 1-tap chips; error state also captured |
| 3 | Create account | Wise: Sign up: email first, then name, country/phone, password on separate steps | [auth-03-sign-up](before/auth-03-sign-up.png) | [auth-03-sign-up](after/auth-03-sign-up.png) | Pass |  |
| 4 | Phone sign in (OTP) | Wise: 2-step verification: phone number, then 6-digit code entry | [auth-04-otp](before/auth-04-otp.png) | [auth-04-otp](after/auth-04-otp.png) | Pass |  |
| 5 | Forgot password | Wise: Reset password: email entry, then "Check your email" state | [auth-05-forgot](before/auth-05-forgot.png) | [auth-05-forgot](after/auth-05-forgot.png) | Pass |  |
| 6 | Reset (enter code) | Wise: Reset password: email entry, then "Check your email" state | [auth-06-reset](before/auth-06-reset.png) | [auth-06-reset](after/auth-06-reset.png) | Pass |  |
| 7 | Reset password (link) | Wise: Set new password | [auth-07-reset-password](before/auth-07-reset-password.png) | [auth-07-reset-password](after/auth-07-reset-password.png) | Pass |  |
| 8 | Verify email | Wise: Verify email: code entry + resend timer | [auth-08-verify-email](before/auth-08-verify-email.png) | [auth-08-verify-email](after/auth-08-verify-email.png) | Pass |  |
| 9 | Account created | Wise: Success state: illustration, title, single primary button | [auth-09-account-created](before/auth-09-account-created.png) | [auth-09-account-created](after/auth-09-account-created.png) | Pass |  |
| 10 | Access denied (staff portal) | Wise: Generic "can't do this here" info state | [auth-10-access-denied](before/auth-10-access-denied.png) | [auth-10-access-denied](after/auth-10-access-denied.png) | Pass |  |
| 11 | Guest limit | Wise: Upsell / "finish setting up your account" prompt | [auth-11-guest-limit](before/auth-11-guest-limit.png) | [auth-11-guest-limit](after/auth-11-guest-limit.png) | Pass |  |
| 12 | App locked (biometric) | Wise: Passcode / Face ID unlock screen | [auth-12-biometric-unlock](before/auth-12-biometric-unlock.png), [auth-12b-biometric-unlock-cancelled](before/auth-12b-biometric-unlock-cancelled.png) | [auth-12-biometric-unlock](after/auth-12-biometric-unlock.png) | Partial | Main state passes. Cancelled state not verifiable: on this simulator the passcode sheet can't be cancelled from here (pressing Home unlocked the app). Same components as the main state |
| 13 | Not found | Wise: Generic error state | [sys-01-not-found](before/sys-01-not-found.png) | [sys-01-not-found](after/sys-01-not-found.png) | Pass |  |
| 14 | Launch redirect | Wise (design system) | — | — | n/a | Redirects only, no UI |

## 2. Onboarding (new patient)

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 15 | Your details | Wise: KYC "Personal details" (name, date of birth) | [ob-01-profile](before/ob-01-profile.png) | [ob-01-profile](after/ob-01-profile.png) | Pass |  |
| 16 | Address | Wise: KYC "Home address" with postcode lookup | [ob-02-address](before/ob-02-address.png) | [ob-02-address](after/ob-02-address.png) | Pass |  |
| 17 | Medical history | Wise: KYC questionnaire (purpose of account: checkbox / radio list) | [ob-03-medical-history](before/ob-03-medical-history.png) | [ob-03-medical-history](after/ob-03-medical-history.png) | Pass |  |
| 18 | Consents | Wise: Terms and privacy acceptance, marketing toggles | [ob-04-consents](before/ob-04-consents.png) | [ob-04-consents](after/ob-04-consents.png) | Pass |  |
| 19 | All set | Wise: Verification complete / account ready | [ob-05-complete](before/ob-05-complete.png) | [ob-05-complete](after/ob-05-complete.png) | Pass |  |

## 3. Patient: tabs

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 20 | Home | Wise: Home: greeting/avatar, balance cards, quick-action row (Send / Add / Request), recent activity | [pt-01-home](before/pt-01-home.png) | [pt-01-home](after/pt-01-home.png) | Pass |  |
| 21 | Bookings | Wise: Activity / transactions list grouped by date, status chips | [pt-02-appointments](before/pt-02-appointments.png) | [pt-02-appointments](after/pt-02-appointments.png) | Pass |  |
| 22 | Records | Wise: Account hub with sections ("Cards", "Statements", "Interest") | [pt-03-records](before/pt-03-records.png) | [pt-03-records](after/pt-03-records.png) | Pass |  |
| 23 | Messages | Wise: Help centre / chat inbox (Intercom-style threads) | [pt-04-messages](before/pt-04-messages.png) | [pt-04-messages](after/pt-04-messages.png) | Pass |  |
| 24 | Profile | Wise: Account/settings: avatar header, grouped rows | [pt-05-profile](before/pt-05-profile.png), [pt-05b-profile-bottom](before/pt-05b-profile-bottom.png) | [pt-05-profile](after/pt-05-profile.png), [pt-05b-profile-bottom](after/pt-05b-profile-bottom.png) | Pass | Section and row labels sentence-cased |

## 4. Patient: profile and settings

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 25 | Personal info | Wise: Personal details (read rows, edit, phone verify) | [pt-06-profile-personal-info](before/pt-06-profile-personal-info.png) | [pt-06-profile-personal-info](after/pt-06-profile-personal-info.png) | Pass |  |
| 26 | Medical history | Wise: Same questionnaire pattern as onboarding | [pt-07-profile-medical-history](before/pt-07-profile-medical-history.png) | [pt-07-profile-medical-history](after/pt-07-profile-medical-history.png) | Pass |  |
| 27 | Emergency contact | Wise: Add/edit contact form (recipient details form) | [pt-08-profile-emergency-contact](before/pt-08-profile-emergency-contact.png) | [pt-08-profile-emergency-contact](after/pt-08-profile-emergency-contact.png) | Pass |  |
| 28 | Dependants | Wise: Recipients list + "Add recipient" sheet | [pt-09-profile-dependants](before/pt-09-profile-dependants.png) | [pt-09-profile-dependants](after/pt-09-profile-dependants.png) | Pass | Add sheet: md-06 |
| 29 | Payment methods | Wise: Cards / payment methods list + add card | [pt-10-profile-payment-methods](before/pt-10-profile-payment-methods.png) | [pt-10-profile-payment-methods](after/pt-10-profile-payment-methods.png) | Pass | Add sheet: md-07. Stripe's card field allows limited styling |
| 30 | Notifications | Wise: Notification settings: grouped toggles | [pt-11-profile-notifications](before/pt-11-profile-notifications.png) | [pt-11-profile-notifications](after/pt-11-profile-notifications.png) | Pass |  |
| 31 | Security | Wise: Security and privacy: passcode, 2-step, devices | [pt-12-profile-security](before/pt-12-profile-security.png) | [pt-12-profile-security](after/pt-12-profile-security.png) | Pass |  |
| 32 | Sessions | Wise: Logged-in devices list | [pt-13-profile-sessions](before/pt-13-profile-sessions.png) | [pt-13-profile-sessions](after/pt-13-profile-sessions.png) | Pass |  |
| 33 | Consent history | Wise: Privacy settings / data list | [pt-14-profile-consent](before/pt-14-profile-consent.png) | [pt-14-profile-consent](after/pt-14-profile-consent.png) | Pass |  |
| 34 | Refer a friend | Wise: Invite friends (referral link, rewards) | [pt-15-profile-refer](before/pt-15-profile-refer.png) | [pt-15-profile-refer](after/pt-15-profile-refer.png) | Pass |  |
| 35 | Delete account | Wise: Close account: reasons, consequences, confirm | [pt-16-profile-delete-account](before/pt-16-profile-delete-account.png) | [pt-16-profile-delete-account](after/pt-16-profile-delete-account.png) | Pass |  |
| 36 | Rewards / perks | Revolut (fallback): Rewards / points balance + redeem list | [pt-30-perks](before/pt-30-perks.png) | [pt-30-perks](after/pt-30-perks.png) | Pass |  |

## 5. Patient: appointments and booking

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 37 | Appointment (video) | Wise: Transfer detail: status timeline, amount, details rows, actions | [pt-17-appointment-video](before/pt-17-appointment-video.png) | [pt-17-appointment-video](after/pt-17-appointment-video.png) | Pass |  |
| 38 | Appointment (clinic) | Wise: Transfer detail: status timeline, amount, details rows, actions | [pt-18-appointment-clinic](before/pt-18-appointment-clinic.png) | [pt-18-appointment-clinic](after/pt-18-appointment-clinic.png) | Pass |  |
| 39 | Appointment (van, completed) | Wise: Transfer detail: status timeline, amount, details rows, actions | [pt-19-appointment-van-completed](before/pt-19-appointment-van-completed.png) | [pt-19-appointment-van-completed](after/pt-19-appointment-van-completed.png) | Pass |  |
| 40 | Appointment cancelled | Wise: Transfer cancelled / refund state | [pt-20-appointment-cancelled](before/pt-20-appointment-cancelled.png) | [pt-20-appointment-cancelled](after/pt-20-appointment-cancelled.png) | Pass |  |
| 41 | Choose a treatment | Wise: Currency / recipient picker: search + list rows | [pt-21-booking-catalog](before/pt-21-booking-catalog.png) | [pt-21-booking-catalog](after/pt-21-booking-catalog.png) | Pass | Category picker as a Wise list |
| 42 | Book a video consult | Wise: Currency / recipient picker: search + list rows | [pt-22-booking-catalog-video](before/pt-22-booking-catalog-video.png) | [pt-22-booking-catalog-video](after/pt-22-booking-catalog-video.png) | Pass |  |
| 43 | Choose a clinic | Uber: Pickup location list / place search | [pt-23-booking-clinic-picker](before/pt-23-booking-clinic-picker.png) | [pt-23-booking-clinic-picker](after/pt-23-booking-clinic-picker.png) | Pass | While offline it says "No clinics available" instead of an error (logic, not changed) |
| 44 | Choose a clinician | Wise: Recipient list with avatars | [pt-24-booking-clinician-picker](before/pt-24-booking-clinician-picker.png) | [pt-24-booking-clinician-picker](after/pt-24-booking-clinician-picker.png) | Pass | Duplicate clinicians are leftover test data in the local DB |
| 45 | Clinician profile | Wise: Recipient details | [pt-25-booking-provider-profile](before/pt-25-booking-provider-profile.png) | [pt-25-booking-provider-profile](after/pt-25-booking-provider-profile.png) | Pass |  |
| 46 | Choose a time | Uber Reserve: Date strip + time slot picker (fallback: Airbnb calendar) | [pt-26-booking-slot-picker](before/pt-26-booking-slot-picker.png), [pt-26b-booking-slot-picker-no-times](before/pt-26b-booking-slot-picker-no-times.png) | [pt-26-booking-slot-picker](after/pt-26-booking-slot-picker.png), [pt-26b-booking-slot-picker-no-times](after/pt-26b-booking-slot-picker-no-times.png), [pt-26c-booking-slot-selected](after/pt-26c-booking-slot-selected.png) | Pass | Date strip starts the day before the device date (time zone; logic, not changed) |
| 47 | Booking summary | Wise: Review details before you pay (+ payment sheet) | [pt-27-booking-summary](before/pt-27-booking-summary.png) | [pt-27-booking-summary](after/pt-27-booking-summary.png) | Pass | Stopped before paying. Apple Pay button stays black (Apple's rules) |
| 48 | Booking confirmed | Wise: Transfer set up / success | [pt-28-booking-confirmed](before/pt-28-booking-confirmed.png) | [pt-28-booking-confirmed](after/pt-28-booking-confirmed.png) | Pass |  |
| 49 | Clinic check-in | Wise: Simple form + confirm | [pt-29-check-in](before/pt-29-check-in.png) | [pt-29-check-in](after/pt-29-check-in.png) | Pass |  |

## 6. Patient: records

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 50 | Dental chart | (custom): No analogue. Restyle with Wise tokens; tooth sheet as a Wise bottom sheet | [pt-31-records-odontogram](before/pt-31-records-odontogram.png) | [pt-31-records-odontogram](after/pt-31-records-odontogram.png) | Pass | Tooth sheet: md-05. "Tooth #1 (#18)" mixes numbering systems (clinical decision, not changed) |
| 51 | Treatment plans | Wise: Scheduled transfers / direct debits list | [pt-32-records-plans](before/pt-32-records-plans.png) | [pt-32-records-plans](after/pt-32-records-plans.png) | Pass |  |
| 52 | Treatment plan | Wise: Direct debit / agreement review and accept | [pt-33-records-plan-detail](before/pt-33-records-plan-detail.png) | [pt-33-records-plan-detail](after/pt-33-records-plan-detail.png), [pt-33b-records-plan-not-found](after/pt-33b-records-plan-not-found.png) | Pass | Sign sheet md-04, decline sheet md-08; unknown plan id shows the not-found state |
| 53 | Prescriptions | Wise: Statements list / statement detail | [pt-34-records-prescriptions-empty](before/pt-34-records-prescriptions-empty.png) | [pt-34-records-prescriptions-empty](after/pt-34-records-prescriptions-empty.png), [pt-34-records-prescriptions](after/pt-34-records-prescriptions.png) | Pass | Empty state and one synthetic prescription |
| 54 | Prescription | Wise: Statements list / statement detail | — | [pt-34b-records-prescription-detail](after/pt-34b-records-prescription-detail.png) | Pass | Synthetic prescription issued locally ("Test medicine… (synthetic)") |
| 55 | Documents vault | Wise: Statements and documents | [pt-35-records-vault](before/pt-35-records-vault.png) | [pt-35-records-vault](after/pt-35-records-vault.png) | Pass |  |
| 56 | Insights | Wise: Spending insights / charts | [pt-36-records-insights](before/pt-36-records-insights.png) | [pt-36-records-insights](after/pt-36-records-insights.png) | Pass |  |
| 57 | Financing | Wise: Product info page (e.g. Interest / Assets explainer) | [pt-37-records-financing](before/pt-37-records-financing.png) | [pt-37-records-financing](after/pt-37-records-financing.png) | Pass |  |

## 7. Patient: dental van (Uber-style)

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 58 | Van coverage | Uber: "Where to?" / set pickup with current location and search | [pt-38-van-service-area](before/pt-38-van-service-area.png) | [pt-38-van-service-area](after/pt-38-van-service-area.png) | Pass |  |
| 59 | Access and parking | Uber: Pickup notes / meeting point details | [pt-39-van-access-details](before/pt-39-van-access-details.png) | [pt-39-van-access-details](after/pt-39-van-access-details.png) | Pass |  |
| 60 | Review and dispatch | Uber: Confirm ride: vehicle card, ETA, price, "Confirm" | [pt-40-van-confirm](before/pt-40-van-confirm.png) | [pt-40-van-confirm](after/pt-40-van-confirm.png) | Pass | Opened directly, so no address or service is selected |
| 61 | Live tracking | Uber: Trip in progress: map + bottom sheet (ETA, driver/vehicle, plate) | [pt-41-van-live-track-none](before/pt-41-van-live-track-none.png) | [pt-41-van-live-track-none](after/pt-41-van-live-track-none.png), [pt-41b-van-live-track-finding](after/pt-41b-van-live-track-finding.png), [pt-41c-van-live-track-accepted](after/pt-41c-van-live-track-accepted.png), [pt-41d-van-live-track-en-route](after/pt-41d-van-live-track-en-route.png), [pt-41e-van-live-track-arrived](after/pt-41e-van-live-track-arrived.png), [pt-41f-van-live-track-treating](after/pt-41f-van-live-track-treating.png) | Pass | All phases from one synthetic request walked by the local operator. A finished visit shows /van/complete (row 63) |
| 62 | Out of area | Uber: "Not available in your area" state | [pt-42-van-not-covered](before/pt-42-van-not-covered.png) | [pt-42-van-not-covered](after/pt-42-van-not-covered.png) | Pass |  |
| 63 | Van visit complete | Uber: Trip complete / receipt / rating | [pt-43-van-complete](before/pt-43-van-complete.png) | [pt-43-van-complete](after/pt-43-van-complete.png) | Pass |  |

## 8. Patient: video consult

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 64 | Triage questions | Wise: One-question-per-step flow (KYC questions) | [pt-44-video-intake](before/pt-44-video-intake.png) | [pt-44-video-intake](after/pt-44-video-intake.png) | Pass |  |
| 65 | Photos | Wise: ID document photo capture and review | [pt-45-video-photos](before/pt-45-video-photos.png) | [pt-45-video-photos](after/pt-45-video-photos.png) | Pass | Camera not available on the simulator |
| 66 | Photo review | Wise: ID document photo capture and review | [pt-46-video-photo-review](before/pt-46-video-photo-review.png) | [pt-46-video-photo-review](after/pt-46-video-photo-review.png) | Pass |  |
| 67 | Device check | Wise: Camera/permission explainer before verification | [pt-47-video-device-check](before/pt-47-video-device-check.png) | [pt-47-video-device-check](after/pt-47-video-device-check.png) | Pass |  |
| 68 | Waiting room | Wise: "We're checking your details" pending state | [pt-48-video-waiting](before/pt-48-video-waiting.png) | [pt-48-video-waiting](after/pt-48-video-waiting.png) | Pass |  |
| 69 | Call | (system): In-app browser window (Daily) | [pt-49-video-call](before/pt-49-video-call.png) | [pt-49-video-call](after/pt-49-video-call.png) | Pass | No Daily key locally: shows the not-set-up state |
| 70 | Consult summary | Wise: Completed state with next steps | [pt-50-video-summary](before/pt-50-video-summary.png) | [pt-50-video-summary](after/pt-50-video-summary.png) | Pass |  |

## 9. Clinician

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 71 | Today's schedule | Wise (Business): Activity list grouped by day | [cl-01-schedule](before/cl-01-schedule.png) | [cl-01-schedule](after/cl-01-schedule.png) | Pass |  |
| 72 | Inbox | Wise: Help / inbox threads | [cl-02-inbox](before/cl-02-inbox.png) | [cl-02-inbox](after/cl-02-inbox.png) | Pass |  |
| 73 | Patient record | Wise: Recipient detail with tabs/sections | [cl-03-patient-record](before/cl-03-patient-record.png) | [cl-03-patient-record](after/cl-03-patient-record.png) | Pass |  |
| 74 | Appointment notes | Wise: Reference / note form | [cl-04-appointment-notes](before/cl-04-appointment-notes.png) | [cl-04-appointment-notes](after/cl-04-appointment-notes.png) | Pass |  |
| 75 | Chart editor | (custom): Restyle only | [cl-05-odontogram-editor](before/cl-05-odontogram-editor.png) | [cl-05-odontogram-editor](after/cl-05-odontogram-editor.png) | Pass |  |
| 76 | Plan builder | Wise: Batch payment builder (add rows, totals) | [cl-06-treatment-plan-builder](before/cl-06-treatment-plan-builder.png) | [cl-06-treatment-plan-builder](after/cl-06-treatment-plan-builder.png) | Pass |  |
| 77 | Prescribe | Wise: Multi-step form | [cl-07-rx-dispense](before/cl-07-rx-dispense.png) | [cl-07-rx-dispense](after/cl-07-rx-dispense.png) | Pass | Prescribing wording is clinical: layout only |
| 78 | Consult room | (custom): Restyle only | [cl-08-consult-room](before/cl-08-consult-room.png) | [cl-08-consult-room](after/cl-08-consult-room.png) | Pass |  |

## 10. Van operator

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 79 | Shift | Uber Driver: "Go online" home | [op-01-shift](before/op-01-shift.png) | [op-01-shift](after/op-01-shift.png), [op-01b-shift-online](after/op-01b-shift-online.png) | Pass |  |
| 80 | Incoming requests | Uber Driver: Incoming trip request card (accept / decline, timer) | [op-02-incoming](before/op-02-incoming.png) | [op-02-incoming](after/op-02-incoming.png), [op-02b-incoming-request](after/op-02b-incoming-request.png) | Pass |  |
| 81 | Route | Uber Driver: Trip list / navigation to stop | [op-03-route](before/op-03-route.png) | [op-03-route](after/op-03-route.png), [op-03b-route-with-stop](after/op-03b-route-with-stop.png) | Pass |  |
| 82 | Van check-in | Uber Driver: Arrived / start trip | [op-04-van-check-in](before/op-04-van-check-in.png) | [op-04-van-check-in](after/op-04-van-check-in.png), [op-04b-van-check-in-stop](after/op-04b-van-check-in-stop.png) | Pass |  |
| 83 | Offline notes | Wise: Simple form + queued state | [op-05-offline-capture](before/op-05-offline-capture.png) | [op-05-offline-capture](after/op-05-offline-capture.png) | Pass |  |

## 11. Modals, sheets and system states

| # | Screen | Reference | Before | After | Status | Notes |
|---|---|---|---|---|---|---|
| 84 | Emergency triage modal | Wise: Bottom sheet with options list | [md-01-emergency-triage](before/md-01-emergency-triage.png) | [md-01-emergency-triage](after/md-01-emergency-triage.png) | Pass | Clinical wording unchanged (layout only); last all-caps label sentence-cased |
| 85 | Compose message sheet | Wise: Bottom sheets: title, body, primary + secondary button | [md-02-compose-message](before/md-02-compose-message.png) | [md-02-compose-message](after/md-02-compose-message.png) | Pass |  |
| 86 | Redeem reward sheet | Wise: Bottom sheets: title, body, primary + secondary button | — | [md-03a-perks-with-points](after/md-03a-perks-with-points.png), [md-03-redeem-reward](after/md-03-redeem-reward.png) | Pass (mocked) | Local seed patient given 100 points in the local DB so the sheet opens; redeeming it also produced the toast (row 94) |
| 87 | Sign treatment plan sheet | Wise: Bottom sheets: title, body, primary + secondary button | [md-04-sign-plan](before/md-04-sign-plan.png) | [md-04-sign-plan](after/md-04-sign-plan.png) | Pass |  |
| 88 | Tooth detail sheet | Wise: Bottom sheets: title, body, primary + secondary button | [md-05-tooth-detail](before/md-05-tooth-detail.png) | [md-05-tooth-detail](after/md-05-tooth-detail.png) | Pass |  |
| 89 | Add dependant sheet | Wise: Bottom sheets: title, body, primary + secondary button | [md-06-add-dependant](before/md-06-add-dependant.png) | [md-06-add-dependant](after/md-06-add-dependant.png) | Pass | Selected relationship now uses the accent pill |
| 90 | Add payment method sheet | Wise: Bottom sheets: title, body, primary + secondary button | [md-07-add-payment-method](before/md-07-add-payment-method.png) | [md-07-add-payment-method](after/md-07-add-payment-method.png) | Pass |  |
| 91 | Confirm sheet (shared) | Wise: Bottom sheets: title, body, primary + secondary button | [md-08-confirm-sheet](before/md-08-confirm-sheet.png), [md-08b-confirm-sheet-sign-out](before/md-08b-confirm-sheet-sign-out.png) | [md-08-confirm-sheet](after/md-08-confirm-sheet.png), [md-08b-confirm-sheet-sign-out](after/md-08b-confirm-sheet-sign-out.png) | Pass | Both buttons clear the home indicator (audit fix) |
| 92 | Native alerts | Wise (design system) | — | — | n/a | iOS system alerts: can't be restyled |
| 93 | Location / photos / notification permission prompts | Wise (design system) | — | — | n/a | iOS system permission prompts |
| 94 | Toast | Wise: Snackbar | — | [st-01-toast](after/st-01-toast.png) | Pass | Message now wraps to 3 lines instead of being cut off |
| 95 | Offline banner / offline screen | Wise: No connection state | — | [st-02-offline-banner](after/st-02-offline-banner.png) | Pass | Seen offline after a Docker restart; now a floating pill below the status bar |
| 96 | Loading state | Wise: Skeleton rows; error with retry; empty with illustration + action | [cl-05-odontogram-editor](before/cl-05-odontogram-editor.png) | [cl-05-odontogram-editor](after/cl-05-odontogram-editor.png), [st-03-loading-state](after/st-03-loading-state.png) | Pass (mocked) | Backend stopped so the skeleton stays up long enough to capture |
| 97 | Error state with retry | Wise: Skeleton rows; error with retry; empty with illustration + action | — | [st-04-error-state](after/st-04-error-state.png) | Pass (mocked) | Backend stopped after sign-in, then Documents opened |
| 98 | Empty state | Wise: Skeleton rows; error with retry; empty with illustration + action | [pt-34-records-prescriptions-empty](before/pt-34-records-prescriptions-empty.png) | [pt-34-records-prescriptions-empty](after/pt-34-records-prescriptions-empty.png) | Pass | Empty states shown in rows 53, 27, 28, 71 |

## Not covered here

- **Row 12, cancelled state:** couldn't be reached on the simulator (see the row).
- **Mobbin links for non-Wise references:** the Uber, Uber Driver, Uber Reserve and Revolut rows in
  `reference-map.md` describe the screen used. Their Mobbin links aren't added yet because the Mobbin
  connection needs signing in again.
- **Findings left alone (logic, data or clinical decisions):** the clinic picker shows "No clinics
  available" while offline; the slot date strip starts the day before the device date; duplicate test
  clinicians in the local DB; "Tooth #1 (#18)" mixes numbering systems; on a cold start the perks balance
  can show a stale cached value until you pull to refresh; the live-tracking "finding" state already
  names the van and an ETA before any operator accepts.
