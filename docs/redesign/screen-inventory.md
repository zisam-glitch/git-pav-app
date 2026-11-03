# Screen inventory (Phase 1 audit)

App: **Pav Dental**, a dental care app with clinic, video and mobile-van visits (Expo / React Native, Expo Router).
Captured on the iOS simulator (iPhone 17, iOS 26.5) against a local backend with seed data.
Before shots are in `docs/redesign/before/`, one PNG per row, at half resolution to keep the repo small.

How the shots were taken: deep links (`xcrun simctl openurl booted pavdental:///<route>`) while signed in as
the role that owns the screen, with real seed data. A screen that needs earlier steps (booking, van, video) was
opened directly, so some show their "nothing selected yet" state. That is noted per row.

States column: what the screen can show besides its main content, read from the code
(`loading`, `empty`, `error`, `dialogs` = native alerts or an in-screen sheet).

**Current design system:** tokens in `pavdental/src/theme` (colors, typography, spacing, radius, shadows,
motion) and shared components in `pavdental/src/components`. Black ink on a cool grey canvas, white cards, and
grey filled inputs with an underline. It was modelled on Neo Financial (the `neo-financial-ios/` screenshots).
Screens mostly use the shared components, so the redesign is largely a token and component change.

## 1. Entry and auth (signed out)

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 1 | Welcome | `/welcome` | `(auth)/welcome.tsx` | | `auth-01-welcome` | |
| 2 | Sign in | `/sign-in` | `(auth)/sign-in.tsx` | error, MFA code step | `auth-02-sign-in`, `auth-02b-sign-in-code-step` | Dev builds show "Demo 1-tap fill" chips |
| 3 | Create account | `/sign-up` | `(auth)/sign-up.tsx` | error | `auth-03-sign-up` | |
| 4 | Phone sign in (OTP) | `/otp` | `(auth)/otp.tsx` | code step, error | `auth-04-otp` | |
| 5 | Forgot password | `/forgot` | `(auth)/forgot.tsx` | sent, error | `auth-05-forgot` | |
| 6 | Reset (enter code) | `/reset` | `(auth)/reset.tsx` | error | `auth-06-reset` | |
| 7 | Reset password (link) | `/reset-password` | `(auth)/reset-password.tsx` | invalid link | `auth-07-reset-password` | Opened without a token |
| 8 | Verify email | `/verify-email` | `(auth)/verify-email.tsx` | code, error | `auth-08-verify-email` | |
| 9 | Account created | `/account-created` | `(auth)/account-created.tsx` | | `auth-09-account-created` | |
| 10 | Access denied (staff portal) | `/access-denied` | `(auth)/access-denied.tsx` | | `auth-10-access-denied` | Shown to admin accounts |
| 11 | Guest limit | `/guest-limit` | `(auth)/guest-limit.tsx` | | `auth-11-guest-limit` | |
| 12 | App locked (biometric) | `/biometric-unlock` | `(auth)/biometric-unlock.tsx` | system prompt, cancelled | `auth-12-biometric-unlock`, `auth-12b-biometric-unlock-cancelled` | iOS shows its own passcode sheet first (no Face ID on the simulator) |
| 13 | Not found | any unknown route | `+not-found.tsx` | | `sys-01-not-found` | |
| 14 | Launch redirect | `/` | `index.tsx` | | (none) | Redirects only, no UI |

## 2. Onboarding (new patient)

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 15 | Your details | `/onboarding/profile` | `onboarding/profile.tsx` | validation | `ob-01-profile` | Seed patient has finished onboarding; the screens still render |
| 16 | Address | `/onboarding/address` | `onboarding/address.tsx` | validation | `ob-02-address` | |
| 17 | Medical history | `/onboarding/medical-history` | `onboarding/medical-history.tsx` | | `ob-03-medical-history` | |
| 18 | Consents | `/onboarding/consents` | `onboarding/consents.tsx` | | `ob-04-consents` | Consent wording is a legal draft: layout only, no wording changes |
| 19 | All set | `/onboarding/complete` | `onboarding/complete.tsx` | | `ob-05-complete` | |

## 3. Patient: tabs

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 20 | Home | `/home` | `(patient)/(tabs)/home.tsx` | error, active van banner | `pt-01-home` | |
| 21 | Bookings | `/appointments` | `(patient)/(tabs)/appointments.tsx` | loading, empty, error | `pt-02-appointments` | |
| 22 | Records | `/records` | `(patient)/(tabs)/records.tsx` | | `pt-03-records` | |
| 23 | Messages | `/messages` | `(patient)/(tabs)/messages.tsx` | loading, empty, error, compose sheet | `pt-04-messages` | |
| 24 | Profile | `/profile` | `(patient)/(tabs)/profile/index.tsx` | | `pt-05-profile`, `pt-05b-profile-bottom` | |

## 4. Patient: profile and settings

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 25 | Personal info | `/profile/personal-info` | `profile/personal-info.tsx` | loading, phone code step | `pt-06-profile-personal-info` | |
| 26 | Medical history | `/profile/medical-history` | `profile/medical-history.tsx` | loading | `pt-07-profile-medical-history` | |
| 27 | Emergency contact | `/profile/emergency-contact` | `profile/emergency-contact.tsx` | loading | `pt-08-profile-emergency-contact` | |
| 28 | Dependants | `/profile/dependants` | `profile/dependants.tsx` | empty, add sheet | `pt-09-profile-dependants` | |
| 29 | Payment methods | `/profile/payment-methods` | `profile/payment-methods.tsx` | loading, empty, error, add sheet | `pt-10-profile-payment-methods` | Stripe is in mock mode locally |
| 30 | Notifications | `/profile/notifications` | `profile/notifications.tsx` | loading, error | `pt-11-profile-notifications` | |
| 31 | Security | `/profile/security` | `profile/security.tsx` | 2-step sign-in sheet | `pt-12-profile-security` | |
| 32 | Sessions | `/profile/sessions` | `profile/sessions.tsx` | loading | `pt-13-profile-sessions` | |
| 33 | Consent history | `/profile/consent` | `profile/consent.tsx` | | `pt-14-profile-consent` | Legal wording: layout only |
| 34 | Refer a friend | `/profile/refer` | `profile/refer.tsx` | | `pt-15-profile-refer` | |
| 35 | Delete account | `/profile/delete-account` | `profile/delete-account.tsx` | confirm | `pt-16-profile-delete-account` | |
| 36 | Rewards / perks | `/perks` | `(patient)/perks.tsx` | redeem sheet | `pt-30-perks` | |

## 5. Patient: appointments and booking

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 37 | Appointment (video) | `/appointments/[id]` | `appointments/[id].tsx` | not found, cancel | `pt-17-appointment-video` | |
| 38 | Appointment (clinic) | same | same | | `pt-18-appointment-clinic` | |
| 39 | Appointment (van, completed) | same | same | | `pt-19-appointment-van-completed` | |
| 40 | Appointment cancelled | `/appointments/cancelled` | `appointments/cancelled.tsx` | | `pt-20-appointment-cancelled` | Opened without params |
| 41 | Choose a treatment | `/booking/service-catalog` | `booking/service-catalog.tsx` | search | `pt-21-booking-catalog` | Also `?channel=video` and `?channel=van` |
| 42 | Book a video consult | `?channel=video` | same | | `pt-22-booking-catalog-video` | |
| 43 | Choose a clinic | `/booking/clinic-picker` | `booking/clinic-picker.tsx` | loading, empty, error | `pt-23-booking-clinic-picker` | Reached by tapping through the flow |
| 44 | Choose a clinician | `/booking/clinician-picker` | `booking/clinician-picker.tsx` | | `pt-24-booking-clinician-picker` | Duplicate clinicians are leftover test data in this local DB |
| 45 | Clinician profile | `/booking/provider-profile` | `booking/provider-profile.tsx` | | `pt-25-booking-provider-profile` | |
| 46 | Choose a time | `/booking/slot-picker` | `booking/slot-picker.tsx` | no slots | `pt-26-booking-slot-picker`, `pt-26b-booking-slot-picker-no-times` | |
| 47 | Booking summary | `/booking/summary` | `booking/summary.tsx` | payment sheet, slot expired | `pt-27-booking-summary` | Stopped before paying |
| 48 | Booking confirmed | `/booking/confirmed` | `booking/confirmed.tsx` | loading | `pt-28-booking-confirmed` | |
| 49 | Clinic check-in | `/check-in` | `(patient)/check-in.tsx` | empty | `pt-29-check-in` | |

## 6. Patient: records

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 50 | Dental chart | `/records/odontogram` | `records/odontogram.tsx` | tooth sheet | `pt-31-records-odontogram` | |
| 51 | Treatment plans | `/records/plans` | `records/plans.tsx` | loading, empty, error | `pt-32-records-plans` | |
| 52 | Treatment plan | `/records/plans/[id]` | `records/plans/[id].tsx` | error, sign sheet | `pt-33-records-plan-detail` | |
| 53 | Prescriptions | `/records/prescriptions` | `records/prescriptions.tsx` | loading, empty, error | `pt-34-records-prescriptions-empty` | Seed patient has none: empty state |
| 54 | Prescription | `/records/prescriptions/[id]` | `records/prescriptions/[id].tsx` | loading, empty, error | (Phase 4) | The seed patient has none. Will issue a synthetic one from the clinician's Prescribe screen (local DB only) and capture before and after |
| 55 | Documents vault | `/records/vault` | `records/vault.tsx` | loading, empty, error | `pt-35-records-vault` | |
| 56 | Insights | `/records/insights` | `records/insights.tsx` | loading, error | `pt-36-records-insights` | |
| 57 | Financing | `/records/financing` | `records/financing.tsx` | | `pt-37-records-financing` | |

## 7. Patient: dental van (Uber-style)

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 58 | Van coverage | `/van/service-area` | `van/service-area.tsx` | covered, off duty, out of area | `pt-38-van-service-area` | Earlier shots: `screenshots/06`, `19` (not committed) |
| 59 | Access and parking | `/van/access-details` | `van/access-details.tsx` | gate code | `pt-39-van-access-details` | |
| 60 | Review and dispatch | `/van/confirm` | `van/confirm.tsx` | no service | `pt-40-van-confirm` | |
| 61 | Live tracking | `/van/live-track` | `van/live-track.tsx` | none, finding, accepted, driving, arrived, treating, complete | `pt-41-van-live-track-none` | Full journey in today's `screenshots/10`–`17` |
| 62 | Out of area | `/van/not-covered` | `van/not-covered.tsx` | | `pt-42-van-not-covered` | |
| 63 | Van visit complete | `/van/complete` | `van/complete.tsx` | | `pt-43-van-complete` | |

## 8. Patient: video consult

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 64 | Triage questions | `/video/intake` | `video/intake.tsx` | steps | `pt-44-video-intake` | |
| 65 | Photos | `/video/photos` | `video/photos.tsx` | | `pt-45-video-photos` | Camera not available on the simulator |
| 66 | Photo review | `/video/photo-review` | `video/photo-review.tsx` | | `pt-46-video-photo-review` | |
| 67 | Device check | `/video/device-check` | `video/device-check.tsx` | | `pt-47-video-device-check` | |
| 68 | Waiting room | `/video/waiting` | `video/waiting.tsx` | loading | `pt-48-video-waiting` | |
| 69 | Call | `/video/call` | `video/call.tsx` | not set up (no Daily key locally) | `pt-49-video-call` | |
| 70 | Consult summary | `/video/summary` | `video/summary.tsx` | loading | `pt-50-video-summary` | |

## 9. Clinician

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 71 | Today's schedule | `/schedule` | `(clinician)/schedule.tsx` | loading, empty | `cl-01-schedule` | |
| 72 | Inbox | `/inbox` | `(clinician)/inbox.tsx` | loading, empty, error | `cl-02-inbox` | |
| 73 | Patient record | `/patient-record` | `(clinician)/patient-record.tsx` | loading, empty | `cl-03-patient-record` | |
| 74 | Appointment notes | `/appointment-notes` | `(clinician)/appointment-notes.tsx` | loading | `cl-04-appointment-notes` | |
| 75 | Chart editor | `/odontogram-editor` | `(clinician)/odontogram-editor.tsx` | loading | `cl-05-odontogram-editor` | |
| 76 | Plan builder | `/treatment-plan-builder` | `(clinician)/treatment-plan-builder.tsx` | empty | `cl-06-treatment-plan-builder` | |
| 77 | Prescribe | `/rx-dispense` | `(clinician)/rx-dispense.tsx` | loading, error | `cl-07-rx-dispense` | Prescribing wording is clinical: layout only |
| 78 | Consult room | `/consult-room` | `(clinician)/consult-room.tsx` | | `cl-08-consult-room` | |

## 10. Van operator

| # | Screen | Route | File | States | Before shot | Notes |
|---|---|---|---|---|---|---|
| 79 | Shift | `/shift` | `(operator)/shift.tsx` | off shift, on shift, error | `op-01-shift` | |
| 80 | Incoming requests | `/incoming` | `(operator)/incoming.tsx` | empty, error | `op-02-incoming` | |
| 81 | Route | `/route` | `(operator)/route.tsx` | loading, error | `op-03-route` | |
| 82 | Van check-in | `/van-check-in` | `(operator)/van-check-in.tsx` | error | `op-04-van-check-in` | |
| 83 | Offline notes | `/offline-capture` | `(operator)/offline-capture.tsx` | queued | `op-05-offline-capture` | |

## 11. Modals, sheets and system states

| # | Item | Where | File | Before shot | Notes |
|---|---|---|---|---|---|
| 84 | Emergency triage modal | Home, Messages | `components/emergency-triage-modal.tsx` | `md-01-emergency-triage` | Clinical wording: layout only |
| 85 | Compose message sheet | Messages | `(tabs)/messages.tsx` | `md-02-compose-message` | |
| 86 | Redeem reward sheet | Perks | `perks.tsx` | (not reachable) | The seed patient has 0 points, so the sheet never opens. Will give the local patient 100 points (local DB only) to capture it in Phase 4 |
| 87 | Sign treatment plan sheet | Plan detail | `records/plans/[id].tsx` | `md-04-sign-plan` | |
| 88 | Tooth detail sheet | Dental chart | `records/odontogram.tsx` | `md-05-tooth-detail` | |
| 89 | Add dependant sheet | Dependants | `profile/dependants.tsx` | `md-06-add-dependant` | |
| 90 | Add payment method sheet | Payment methods | `profile/payment-methods.tsx` | `md-07-add-payment-method` | |
| 91 | Confirm sheet (shared) | cancel booking, sign out, decline plan | `components/confirm-sheet.tsx` | `md-08-confirm-sheet`, `md-08b-confirm-sheet-sign-out` | |
| 92 | Native alerts | many screens | `Alert.alert` | (n/a) | iOS system dialogs: can't be restyled |
| 93 | Location / photos / notification permission prompts | van, video | system | `screenshots/22` | iOS system UI |
| 94 | Toast | app-wide | `components/toast.tsx` | (Phase 4) | Transient; needs an action that shows one |
| 95 | Offline banner / offline screen | app-wide | `components/offline-banner.tsx`, `network-offline.tsx` | (Phase 4) | The simulator's network can't be cut from here; will force the state in a dev build and say so |
| 96 | Loading state | list screens | `components/loading-skeleton.tsx`, spinners | `cl-05-odontogram-editor` (spinner) | Skeletons flash too fast to catch; will force in Phase 4 |
| 97 | Error state with retry | list screens, root boundary | `components/error-state.tsx`, `app/_layout.tsx` | (Phase 4) | Stopping the backend signs the app out on a cold start, so this needs the backend to fail after sign-in |
| 98 | Empty state | list screens | `components/empty-state.tsx` | `pt-34-records-prescriptions-empty`, `pt-09`, `pt-10`, `cl-01` | |

## Problems the audit found (fixed as part of the redesign)

Layout and usability bugs seen in the before shots. Each one gets fixed in the matching screen's rebuild and
checked in its after shot.

| Screen | Problem | Shot |
|---|---|---|
| Booking: clinic, clinician, slot picker, summary | Back button and progress bar sit **under the status bar** (no top safe-area inset). The back button can't be tapped there; only the edge-swipe gesture works | `pt-23`, `pt-24`, `pt-26`, `pt-27` |
| Booking summary | Treatment name runs past the card's right edge, with no space after "Treatment:". Dentist shows a placeholder, "Assigned Practitioner" | `pt-27` |
| Confirm sheet (shared) | The second button (keep / cancel) is cut off below the screen edge | `md-08`, `md-08b` |
| Sign plan sheet | Plan total "£205.00" clipped at the right edge | `md-04` |
| Emergency triage modal | Selected pain score loses its number (white on red has no text) | `md-01` |
| Dental chart | The 32-tooth chart renders as **two empty pink bars**; "Missing" uses the green success style | `pt-31` |
| Onboarding steps | Progress bar runs into the back button | `ob-01` |
| Appointments list | A van visit shows "Video Consultation" as its location (fallback when there's no clinic) | `pt-02` |
| Operator screens | Large empty band above the content | `op-01`, `op-02` |
| Mixed styles | Section labels are sometimes uppercase grey, sometimes sentence-case; screen titles mix large left titles and small centred nav titles for the same kind of screen | many |

Out of scope (noted, not a design issue): clinician schedule is empty though the clinician has appointments today
(probably the simulator's +06:00 time zone, where it's already the next day); "Tooth #1 (#18)" mixes two numbering
systems (open clinical decision on tooth numbering).
