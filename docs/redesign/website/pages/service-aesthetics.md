# Service: Aesthetics

- Agent group: **S3**
- Route(s): `/services/aesthetics`
- Route file(s): `website/src/routes/services.aesthetics.tsx`
- Live words: `website/seo/live-text/services--aesthetics.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | aesthetics faq | `website/src/components/aesthetics/aesthetics-faq.tsx` | — (skipped: not on live page) | verified | ok | ok | same | Live `/services/aesthetics` has no FAQ section; previous 8 FAQs were unverified repo copy (cosmetic teeth, not facial aesthetics). Component returns `null` and is omitted from `AestheticsPage` |
| 2 | aesthetics hero | `website/src/components/aesthetics/aesthetics-hero.tsx` | Hims treatment split hero; https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97 | verified | [shot](../shots/aesthetics/1440-hero.png) | [shot](../shots/aesthetics/390-hero.png) | same | Preserved live H1 + subtitle verbatim; temporarily wired `/images/generated/home-facial-aesthetics.jpg` |
| 3 | aesthetics page (page composition) | `website/src/components/aesthetics/aesthetics-page.tsx` | Hims service page rhythm + `TestimonialsSection` (`theme="warm"`) + `CtaBand` | verified | [shot](../shots/aesthetics/1440-testimonials.png) | ok | same | Alternates `white` / `cream` / `brown` / `sand`; omits unverified `AestheticsFaq`; includes `AestheticsSafety` form |
| 4 | aesthetics premium | `website/src/components/aesthetics/aesthetics-premium.tsx` | Hims dark `brown` `SplitFeature` | verified | ok | ok | same | Restored live "We exclusively utilise premium-grade products of exceptional quality" copy + `tone="brown" className="bg-white/10"` Media |
| 5 | aesthetics pricing | `website/src/components/aesthetics/aesthetics-pricing.tsx` | Hims fee tables in white rounded panels; https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb | verified | [shot](../shots/aesthetics/1440-pricing.png) | ok | same | Replaced wrong repo prices with exact live prices (Dermal Fillers £100–£450, Botox £180–£400, Profhilo £249, Sosum £160) |
| 6 | aesthetics safety banner | `website/src/components/aesthetics/aesthetics-safety-banner.tsx` | Hims `sand` bento tiles | verified | [shot](../shots/aesthetics/1440-safety.png) | ok | same | Restored live "1. Age Limit", "2. Things to Know", and "3. How We are Keeping You Safe" (with live CQC statement) |
| 7 | aesthetics safety | `website/src/components/aesthetics/aesthetics-safety.tsx` | Hims lead-capture card | verified | [shot](../shots/aesthetics/1440-contact.png) | ok | reworded | Uses `@/components/ui/select`, `useEnquiry`, `BOOKING_URL`, `PRACTICE_PHONE`; live treatments in `<Select>` |
| 8 | aesthetics treatments | `website/src/components/aesthetics/aesthetics-treatments.tsx` | Hims `Tile` 3-col grid | verified | ok | ok | same | Restored all 6 live treatments (Microneedling, Botox, Dermal fillers, Chemical peels, Lip enhancement, Skin Rejuvenation) |
| 9 | aesthetics values | `website/src/components/aesthetics/aesthetics-values.tsx` | Hims numbered `Tile` grid | verified | ok | ok | same | Restored all 3 live values (Wholehearted Commitment, Expert Guidance, Quality Assurance) |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `aesthetics-safety.tsx` | `Offers and packages now availabe. Please enquire with our team today on 0800 099 6375 to find out more` (exact live line kept in `aesthetics-pricing.tsx`) | Heading `Book Appointment` with the live offers line and practice contact details alongside the enquiry form | Keeps the `useEnquiry` form anchored in live copy without inventing descriptions |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `aesthetics-hero` | `website/src/components/aesthetics/aesthetics-hero.tsx` | `4 / 3` | Serene architectural photograph of a modern facial aesthetics clinic room in warm natural morning light, cream linen chair, frosted glass skincare bottles on a travertine counter, soft shadows, no text, no logos, no people | `website/public/images/generated/aesthetics-hero.jpg` | done |
| `aesthetics-premium` | `website/src/components/aesthetics/aesthetics-premium.tsx` | `4 / 3` | Hims-style studio product still life of amber and frosted glass medical skincare vials on a dark espresso-brown ceramic tray with warm golden side light, clean minimal shadows, no text, no logos, no people | `website/public/images/generated/aesthetics-premium.jpg` | done |

## Verification log

- 2026-11-19: Verified all 9 rows in Chromium at `1440x900` and `390x844` (0 console errors, 0 broken images, 0 horizontal overflow, single H1, `<Select>` verified, `TestimonialsSection theme="warm"` checked), confirmed `/services/aesthetics` SEO parity 100% (0 failures), and saved shots in `docs/redesign/website/shots/aesthetics/`. Marked all rows `verified`.

## Open questions for the lead

1. **Two phone numbers on live `/services/aesthetics`**: `services--aesthetics.txt` line 87 reads `"Offers and packages now availabe. Please enquire with our team today on 0800 099 6375 to find out more"` (also preserves `"availabe"` spelling verbatim for SEO parity), while the practice phone in `PRACTICE_PHONE` is `0800 1938 786`. Currently `aesthetics-pricing.tsx` keeps `0800 099 6375` in the verbatim sentence and provides `<CallButton />` (`0800 1938 786`). Confirm whether `0800 099 6375` is still active or should be updated.
2. **Live hero "Award-Winning" phrasing**: `services--aesthetics.txt` line 4 literally reads `"The Award-Winning Bradford Dental and Aesthetic Clinic: Excellence in Dental and Aesthetic Care."` Kept verbatim for live parity; confirm with owner whether to retain.
3. **Repo-only unverified claims removed from `aesthetics-hero.tsx`**: "Doctor-led facial aesthetics", "Natural results promise", "Sterile, private aesthetics suite", Unsplash URL (`photo-1519494026892-80bbd2d6fd0d`), `/media/hero-smile.jpg`.
4. **Repo-only unverified claims removed from `aesthetics-treatments.tsx`**: Longevity ranges ("9–18 Months", "3–5 Months", "6–9 Months"), "Masseter (Jaw Slimming)", "Profhilo®" treatment card description (moved back to live `Others` price item), and fabricated card tags.
5. **Repo-only unverified claims removed from `aesthetics-premium.tsx`**: "licensed UK pharmacies and FDA/CE-cleared global leaders including Juvéderm®", "five-plus years of rigorous university training in head and neck anatomy, vascular mapping, and sterile injection protocols", "Location: Bradford, West Yorkshire / Status: Registered" card.
6. **Repo-only unverified claims removed from `aesthetics-values.tsx`**: "45-minute medical consultation", "14-day review".
7. **Repo-only wrong/invented prices removed from `aesthetics-pricing.tsx`**: Old component listed unverified/incorrect prices (`Botox 1 Area £130, 2 Areas £180, 3 Areas £220, Masseter £250, Nefertiti £280, Hyperhidrosis £350`; `Dermal Fillers 0.5ml £140, 1.0ml £210, Cheekbone £250, Tear Trough £290, Nasolabial £220, Jawline £240`; `Profhilo £250, Polynucleotides £200, Seventy Hyal £160, Microneedling £95`; `Consultation fee £30`; `Bocouture®`, `Juvéderm®`, `Teosyal®`, `FDA-approved`). Replaced entirely with the live price list (`Dermal Fillers` 0.5ML £100 to 4ML £450; `Botox` 1 AREA £180 to 4 AREAS £400; `Others` PROFHILO FIRST DOSE £249, SOSUM BOOSTER £160).
8. **Repo-only unverified claims removed from `aesthetics-safety-banner.tsx`**: "Single-Use Sterile Micro-Cannulas", "Hyaluronidase Ready On-Site", "SMAS planes", "Photographic ID required", "Cooling-Off Protocol".
9. **Repo-only unverified claims removed from `aesthetics-safety.tsx`**: "within 24 hours", "Allergan & IBSA authentic products", "Bocouture®", "Masseter Slimming / Bruxism".
10. **Unused invented FAQ file (`aesthetics-faq.tsx`)**: Contained 8 repo-only FAQs about porcelain veneers, composite bonding, teeth whitening, and 10–15 year lifespans (not on `services--aesthetics.txt`). Omitted from `AestheticsPage` and turned into a no-op export.

## Pass 2

- Capture used: `/testosterone.html` plus `/hair-loss/minoxidil.html` cards, via `treatment-page-recipe.md`.
- Differences found: split hero, tile grids with per-card buttons, three tinted price tiles with "From" lines, testimonial tiles with fake counters, a glass-tile safety banner.
- Rebuilt: hero (`TreatmentHero`, two wired pictures), treatments (`BenefitCards`, six H3s), premium products (`Statement`, brown, H2 words unchanged), values (`TitleCards`), price list (three cards with `PriceList`, live prices only), patient comments (`TitleCards`, live comments word for word, no ratings), safety banner (navy, `TitleCards` dark, then the H2 and paragraph), enquiry form wrapper, closing (`ClosingBand`).
- Wording changes (1): hero fact rows are live treatment names ("Botox", "Dermal fillers", "Skin Rejuvenation"). Finance and consent words untouched.
- Removed (repo-only): eyebrows "Treatment Menu", "Curated Clinical Formulations", "Clinical Ethos", "Transparent Clinic Fees", "Patient Feedback", "Clinic Consultation"; price eyebrows "Volume & Contour", "Anti-Wrinkle", "Skin Boosters"; "From £100/£180/£160" lines; "CQC Regulated Clinic" badge; the "Pav Dental Aesthetics 01 / 03" card footer. "Award-Winning" stays because the live page says it.
- Images needed: none new.
- Open questions: "Award-Winning" (live claim, owner to verify); the safety paragraph mentions social distancing (live wording, may be dated).
