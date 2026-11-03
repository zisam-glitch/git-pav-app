# Reference map (Phase 1, draft)

**Status: draft, Mobbin links missing.** The Mobbin MCP isn't connected in this session, and the
browser isn't signed in to Mobbin: the Wise screens page returned "403 Forbidden". Each row
names the reference screen by its Wise (or fallback app) flow and screen type. The Mobbin link
column gets filled in, and the choice checked against the real screens, once Mobbin is
reachable.

Rule for every row: borrowed layouts (Uber, Airbnb, Revolut…) are rebuilt with the Wise tokens and
components from Phase 2. Uber gives the structure of the van flow; it should still look like Wise.

Legend for "Ref app": **Wise** = primary baseline. Anything else = Wise has no matching pattern.

## 1. Entry and auth

| # | Pav screen | Ref app | Reference screen (Mobbin link to add) | Why |
|---|---|---|---|---|
| 1 | Welcome | Wise | Onboarding welcome: full-bleed brand colour, short promise, "Get started" + "Log in" | Same job: first launch, two choices |
| 2 | Sign in | Wise | Log in (email, password, "Trouble logging in?") | Same form |
| 3 | Create account | Wise | Sign up: email first, then name, country/phone, password on separate steps | Wise splits sign-up into one-question steps; we keep our fields, maybe split |
| 4 | Phone sign in (OTP) | Wise | 2-step verification: phone number, then 6-digit code entry | Same pattern |
| 5–6 | Forgot / reset | Wise | Reset password: email entry, then "Check your email" state | Same pattern |
| 7 | Reset password (link) | Wise | Set new password | Same |
| 8 | Verify email | Wise | Verify email: code entry + resend timer | Same |
| 9 | Account created | Wise | Success state: illustration, title, single primary button | Same |
| 10 | Access denied | Wise | Generic "can't do this here" info state | Info screen |
| 11 | Guest limit | Wise | Upsell / "finish setting up your account" prompt | Same intent |
| 12 | App locked | Wise | Passcode / Face ID unlock screen | Same |
| 13 | Not found | Wise | Generic error state | |

## 2. Onboarding

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 15 | Your details | Wise | KYC "Personal details" (name, date of birth) | Same data |
| 16 | Address | Wise | KYC "Home address" with postcode lookup | Same data |
| 17 | Medical history | Wise | KYC questionnaire (purpose of account: checkbox / radio list) | Closest list-of-questions pattern |
| 18 | Consents | Wise | Terms and privacy acceptance, marketing toggles | Same intent. Wording stays as is (legal draft) |
| 19 | All set | Wise | Verification complete / account ready | Success state |

## 3. Patient tabs

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 20 | Home | Wise | Home: greeting/avatar, balance cards, quick-action row (Send / Add / Request), recent activity | Map: next visit = balance card; Book / Video / Van = quick actions; treatments = horizontal cards |
| 21 | Bookings | Wise | Activity / transactions list grouped by date, status chips | Appointments are dated items with status |
| 22 | Records | Wise | Account hub with sections ("Cards", "Statements", "Interest") | Records is a hub of sub-areas |
| 23 | Messages | Wise | Help centre / chat inbox (Intercom-style threads) | Brief: chat → Wise first |
| 24 | Profile | Wise | Account/settings: avatar header, grouped rows | Same |

## 4. Profile and settings

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 25 | Personal info | Wise | Personal details (read rows, edit, phone verify) | Same |
| 26 | Medical history | Wise | Same questionnaire pattern as onboarding | Consistency |
| 27 | Emergency contact | Wise | Add/edit contact form (recipient details form) | Form of a person's details |
| 28 | Dependants | Wise | Recipients list + "Add recipient" sheet | Managing other people on the account |
| 29 | Payment methods | Wise | Cards / payment methods list + add card | Same |
| 30 | Notifications | Wise | Notification settings: grouped toggles | Same |
| 31 | Security | Wise | Security and privacy: passcode, 2-step, devices | Same |
| 32 | Sessions | Wise | Logged-in devices list | Same |
| 33 | Consent history | Wise | Privacy settings / data list | Same; wording unchanged |
| 34 | Refer | Wise | Invite friends (referral link, rewards) | Same |
| 35 | Delete account | Wise | Close account: reasons, consequences, confirm | Same |
| 36 | Perks | Revolut (fallback) | Rewards / points balance + redeem list | Wise has referral rewards only, no points store |

## 5. Appointments and booking

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 37–39 | Appointment detail | Wise | Transfer detail: status timeline, amount, details rows, actions | A booking has a status, money (deposit) and actions |
| 40 | Cancelled | Wise | Transfer cancelled / refund state | Same: cancellation and refund |
| 41–42 | Choose a treatment | Wise | Currency / recipient picker: search + list rows | Picking one item from a list |
| 43 | Choose a clinic | Uber | Pickup location list / place search | Place choice. Wise has no locations |
| 44 | Choose a clinician | Wise | Recipient list with avatars | Picking a person |
| 45 | Clinician profile | Wise | Recipient details | Person details |
| 46 | Choose a time | Uber Reserve | Date strip + time slot picker (fallback: Airbnb calendar) | Brief: scheduling → Uber Reserve |
| 47 | Booking summary | Wise | Review details before you pay (+ payment sheet) | Same: review, then pay deposit |
| 48 | Booking confirmed | Wise | Transfer set up / success | Same |
| 49 | Check-in | Wise | Simple form + confirm | |

## 6. Records

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 50 | Dental chart | (custom) | No analogue. Restyle with Wise tokens; tooth sheet as a Wise bottom sheet | Clinical visual |
| 51 | Treatment plans | Wise | Scheduled transfers / direct debits list | Planned items with status |
| 52 | Treatment plan | Wise | Direct debit / agreement review and accept | Read, then sign |
| 53–54 | Prescriptions | Wise | Statements list / statement detail | Documents with dates |
| 55 | Documents vault | Wise | Statements and documents | Same |
| 56 | Insights | Wise | Spending insights / charts | Same |
| 57 | Financing | Wise | Product info page (e.g. Interest / Assets explainer) | Info + external link |

## 7. Dental van (Uber layout, Wise styling)

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 58 | Van coverage | Uber | "Where to?" / set pickup with current location and search | Location first |
| 59 | Access and parking | Uber | Pickup notes / meeting point details | Same intent |
| 60 | Review and dispatch | Uber | Confirm ride: vehicle card, ETA, price, "Confirm" | Same |
| 61 | Live tracking | Uber | Trip in progress: map + bottom sheet (ETA, driver/vehicle, plate) | Brief: live tracking → Uber |
| 62 | Out of area | Uber | "Not available in your area" state | Same |
| 63 | Van visit complete | Uber | Trip complete / receipt / rating | Same |

## 8. Video consult

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 64 | Triage questions | Wise | One-question-per-step flow (KYC questions) | Step-by-step questions |
| 65–66 | Photos / review | Wise | ID document photo capture and review | Same: guided photo + retake |
| 67 | Device check | Wise | Camera/permission explainer before verification | Same |
| 68 | Waiting room | Wise | "We're checking your details" pending state | Waiting with status |
| 69 | Call | (system) | In-app browser window (Daily) | Not restyled beyond the frame |
| 70 | Consult summary | Wise | Completed state with next steps | Same |

## 9–10. Staff (clinician, van operator)

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 71 | Schedule | Wise (Business) | Activity list grouped by day | Timeline of items |
| 72 | Inbox | Wise | Help / inbox threads | Same as patient Messages |
| 73 | Patient record | Wise | Recipient detail with tabs/sections | Person detail |
| 74 | Appointment notes | Wise | Reference / note form | Text form |
| 75 | Chart editor | (custom) | Restyle only | Clinical tool |
| 76 | Plan builder | Wise | Batch payment builder (add rows, totals) | Building a list of priced items |
| 77 | Prescribe | Wise | Multi-step form | Form; wording unchanged |
| 78 | Consult room | (custom) | Restyle only | |
| 79 | Shift | Uber Driver | "Go online" home | Brief: van/driver → Uber |
| 80 | Incoming requests | Uber Driver | Incoming trip request card (accept / decline, timer) | Same |
| 81 | Route | Uber Driver | Trip list / navigation to stop | Same |
| 82 | Van check-in | Uber Driver | Arrived / start trip | Same |
| 83 | Offline notes | Wise | Simple form + queued state | |

## 11. Modals, sheets, states

| # | Item | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 84 | Emergency triage modal | Wise | Bottom sheet with options list | Wording unchanged (clinical) |
| 85–91 | Sheets (compose, redeem, sign plan, tooth, add dependant, add card, confirm) | Wise | Bottom sheets: title, body, primary + secondary button | One sheet component |
| 94 | Toast | Wise | Snackbar | |
| 95 | Offline | Wise | No connection state | |
| 96–98 | Loading / error / empty | Wise | Skeleton rows; error with retry; empty with illustration + action | |
