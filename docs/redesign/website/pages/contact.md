# Contact us

- Agent group: **S4**
- Route(s): `/contact-us`
- Route file(s): `website/src/routes/contact-us.tsx`
- Live words: `website/seo/live-text/contact-us.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | contact section | `website/src/components/contact/contact-section.tsx` | Hims lead-capture card (`wrap-max`, `bg-cream`, `p-6 md:p-10 lg:p-12`) + `Tile` details + `CtaBand` | verified | [top](../shots/contact/1440-top.png) · [hours](../shots/contact/1440-hours.png) | [shot](../shots/contact/390-contact.png) | same | Uses `useEnquiry("Contact")` with live fields (`Full Name`, `Email Address`, `Subject`, `Phone`, `Your Message`), `PRACTICE_PHONE`, `PRACTICE_EMAIL`, `PRACTICE_HOURS` (`00:00 – 24:00`), `BOOKING_URL`, `SOCIAL_LINKS`, and Bradford map embed |
| 2 | contact top bar | `website/src/components/contact/contact-top-bar.tsx` | — | verified | ok | ok | same | Unused by `routes/contact-us.tsx` (superseded by shared `Header`); cleaned banned classes/raw hex and wired `PRACTICE_PHONE` / `PRACTICE_EMAIL` |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| — | — | — | All live `contact-us.txt` headings, form labels, address, phone, WhatsApp, email, and Practice Manager wording preserved verbatim |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

- 2026-11-19: Verified `/contact-us` in Chromium at `1440x900` and `390x844` (verified `00:00 – 24:00` hours, widened `lg:` form grid, 0 horizontal overflow), confirmed `/contact-us` SEO parity 100% (0 failures), and saved shots in `docs/redesign/website/shots/contact/`. Marked both sections `verified`.

## Open questions for the lead

1. **Incorrect opening hours removed (`contact-section.tsx`)**:
   - Previous repo code stated `"Mon–Sun, 08:00–22:00"` and `"08:00 – 22:00 (Emergency 24/7)"` in the contact details, FAQ, and location cards. Replaced with `PRACTICE_HOURS` (`Open 24 hours, 7 days a week` / `00:00 – 24:00`) per `enquiry.ts` and `live-baseline.json`.
2. **Repo-only sections & unverified claims removed (`contact-section.tsx`)**:
   - *Department cards*: `Customer Support` ("around the clock"), `Feedback & Suggestions`, `Media Inquiries` (all linked to `#` and absent from `contact-us.txt`).
   - *FAQ accordion & unmounted quick-email input*: 5 FAQs not present in `contact-us.txt`, including unverified claims (`"We typically respond within 30 minutes during business hours"`, `"free on-site car park with dedicated disabled spaces"`, `"0% interest finance plans"`, `"Bus routes 72 & 73"`), plus an unwired email `<input>` + `Submit` button.
   - Confirm with the owner if any verified parking or transit details should be added back.

## Pass 2

- Capture used: homepage newsletter lead-capture card (`/index.html`).
- Differences found: form card padding (Hims 60px on desktop). Section order kept so every live and existing H2 stays.
- Rebuilt: form card padding `lg:p-12`. Form unchanged and working.
- Removed repo-only text: "Direct main-road access on Leeds Road with nearby parking." (parking claim).
- Wording changes: none. Images needed: none.
- Open questions: confirm parking details with the owner before adding them back.
