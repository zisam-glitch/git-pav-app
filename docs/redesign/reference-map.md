# Reference map

Mobbin is connected. The design system (Phase 2) is taken from these Wise iOS screens:

| Pattern | Wise screen on Mobbin |
|---|---|
| Home: greeting, balance cards, pill actions, activity list, tab bar | [home](https://mobbin.com/screens/f1c8f9a2-3a9c-48ff-8e2c-51c0d8b03850), [home, new account](https://mobbin.com/screens/5a3cbf3c-62a8-4624-9a67-38df83c62350), [welcome](https://mobbin.com/screens/c9392ea7-3dc3-408a-84d2-df4804883fb8) |
| Detail with big number and round action buttons | [balance detail](https://mobbin.com/screens/44daafcf-9304-46ce-8110-9323e4f5252b), [total cash](https://mobbin.com/screens/a107df4b-a161-4b7e-96f4-95d1e26164d0) |
| Forms: large title, bold label, bordered input, green pill button | [log in](https://mobbin.com/screens/c4d7f38e-4e0d-4367-a3de-6d8a5d80b326), [enter email](https://mobbin.com/screens/19c4d96d-61c1-4a7e-8c2b-7137c994c611), [change email (disabled button)](https://mobbin.com/screens/34aaa76e-c81c-4464-9436-ef2fe3b8df46) |
| Settings lists: round outlined icon, title, subtitle, chevron | [settings](https://mobbin.com/screens/98a8775d-f61c-4a12-85d4-94c12fd21ad5), [security and privacy](https://mobbin.com/screens/7ff1c601-1814-4eb0-85c2-8029227abfad), [actions](https://mobbin.com/screens/bb143978-42f4-4201-b3bd-7350e6ccca67), [2-step verification](https://mobbin.com/screens/3d71fcf6-8f14-4f88-a112-ac3aa42b44de) |
| Review before paying: label/value rows, "Change" links, sticky button | [confirm and send](https://mobbin.com/screens/676d6d79-fb58-4dff-a517-af056631e589), [confirm (compact)](https://mobbin.com/screens/5c0b1302-b27a-4d93-8e15-45538f98eae2) |
| Bottom sheets: close button, title, option rows | [payment options](https://mobbin.com/screens/7cd04b9c-b800-48f9-a361-f7fd163c4eea), [choose a balance](https://mobbin.com/screens/6db6c3b8-e7b7-4a81-b6fd-0375db3a5676), [select an option](https://mobbin.com/screens/b78dcbf3-4a1b-4ea0-b1f9-1558f5ed1ac5) |

Per-screen links for non-Wise references (Uber, Uber Reserve, Revolut, Grab Driver) are in each row below. Uber Driver isn't on Mobbin, so the operator rows use Grab Driver where a matching screen exists.

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
| 36 | Perks | Revolut (fallback) | Rewards / points balance + redeem list. [Revolut cashback](https://mobbin.com/screens/ca01c9f4-8c14-4ec3-b912-42e1e2bf8334), [rewards](https://mobbin.com/screens/06ecc725-ee43-422a-a63d-32af73eb5959) | Wise has referral rewards only, no points store |

## 5. Appointments and booking

| # | Pav screen | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 37–39 | Appointment detail | Wise | Transfer detail: status timeline, amount, details rows, actions | A booking has a status, money (deposit) and actions |
| 40 | Cancelled | Wise | Transfer cancelled / refund state | Same: cancellation and refund |
| 41–42 | Choose a treatment | Wise | Currency / recipient picker: search + list rows | Picking one item from a list |
| 43 | Choose a clinic | Uber | Pickup location list / place search. [Uber plan your ride](https://mobbin.com/screens/94eef071-be28-4652-8ac7-3986c77722c7), [location list](https://mobbin.com/screens/ab334689-ba54-42f7-9bd1-c7603b3bfdd6) | Place choice. Wise has no locations |
| 44 | Choose a clinician | Wise | Recipient list with avatars | Picking a person |
| 45 | Clinician profile | Wise | Recipient details | Person details |
| 46 | Choose a time | Uber Reserve | Date strip + time slot picker (fallback: Airbnb calendar). [Uber Reserve a ride](https://mobbin.com/screens/e256085e-854f-48e2-9a7f-60b40608a899), [date range](https://mobbin.com/screens/3c124307-9495-43eb-8210-630a0546340a) | Brief: scheduling → Uber Reserve |
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
| 58 | Van coverage | Uber | "Where to?" / set pickup with current location and search. [Uber where to](https://mobbin.com/screens/58e88acd-c7a4-40f4-98a5-f9a1911dcae5) | Location first |
| 59 | Access and parking | Uber | Pickup notes / meeting point details. [Uber pickup notes](https://mobbin.com/screens/76380627-b6b3-4a58-8e6d-858d0cc2dc27), [confirm pickup spot](https://mobbin.com/screens/8d5fb7d1-ed99-4986-887b-283a24561f49) | Same intent |
| 60 | Review and dispatch | Uber | Confirm ride: vehicle card, ETA, price, "Confirm". [Uber choose a ride](https://mobbin.com/screens/1634d7c8-5d3f-4223-8f11-df000b37f3ea) | Same |
| 61 | Live tracking | Uber | Trip in progress: map + bottom sheet (ETA, driver/vehicle, plate). [Uber pickup in 1 min](https://mobbin.com/screens/02e52b85-dd21-40b0-b75c-548b35ae2125), [driver and vehicle](https://mobbin.com/screens/76380627-b6b3-4a58-8e6d-858d0cc2dc27) | Brief: live tracking → Uber |
| 62 | Out of area | Uber | "Not available in your area" state. No Uber screen on Mobbin. Closest: [Vivid unavailable in your country](https://mobbin.com/screens/6d1473c3-ab3d-4708-a327-88fe23c44ae5) | Same |
| 63 | Van visit complete | Uber | Trip complete / receipt / rating. [Uber tip and rate your trip](https://mobbin.com/screens/af273512-5746-402e-b78a-4c89235aaedf) | Same |

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
| 79 | Shift | Uber Driver | "Go online" home. Not on Mobbin (no Uber Driver or matching Grab Driver screen) | Brief: van/driver → Uber |
| 80 | Incoming requests | Uber Driver | Incoming trip request card (accept / decline, timer). Not on Mobbin (no Uber Driver or matching Grab Driver screen) | Same |
| 81 | Route | Uber Driver | Trip list / navigation to stop. Uber Driver isn't on Mobbin. Closest: [Grab Driver pick up passenger](https://mobbin.com/screens/e717570c-e334-4803-9738-6a310f895743) | Same |
| 82 | Van check-in | Uber Driver | Arrived / start trip. Uber Driver isn't on Mobbin. Closest: [Grab Driver pick up passenger](https://mobbin.com/screens/e717570c-e334-4803-9738-6a310f895743) | Same |
| 83 | Offline notes | Wise | Simple form + queued state | |

## 11. Modals, sheets, states

| # | Item | Ref app | Reference screen | Why |
|---|---|---|---|---|
| 84 | Emergency triage modal | Wise | Bottom sheet with options list | Wording unchanged (clinical) |
| 85–91 | Sheets (compose, redeem, sign plan, tooth, add dependant, add card, confirm) | Wise | Bottom sheets: title, body, primary + secondary button | One sheet component |
| 94 | Toast | Wise | Snackbar | |
| 95 | Offline | Wise | No connection state | |
| 96–98 | Loading / error / empty | Wise | Skeleton rows; error with retry; empty with illustration + action | |
