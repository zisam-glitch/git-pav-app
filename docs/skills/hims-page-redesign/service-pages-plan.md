# Service pages: which Hims page each Pav Dental page follows

Measured on hims.com (25 Nov 2026). The live pavdental.com text stays the content truth; Hims decides
the layout. Shared pieces live in `website/src/components/hims/` (`ServiceHeroLayout`, `SectionHead`,
`FeatureBento`, `StepsPanel`, `CompareTable`, `IncludedList`, `DarkQuestion`, `FloatingCta`).

## The Hims page types found

| Type | Hims examples | What it looks like |
|---|---|---|
| A. Condition hub | /testosterone, /hair-loss, /erectile-dysfunction, /weight-loss | Cream hero (headline left, icon list + two buttons right), photo strip, treatment bento, "built for you" steps panel, comparison table, "everything included" list, dark "could it be…?" band, FAQ, floating Get started pill |
| B. Full-photo hero | /psychiatry, /labs | Photo fills the first screen with text over it, sticky sub-nav (Labs, What we test, How it works, Action plan), step sections |
| C. Product detail | /hair-loss/minoxidil | Image gallery left, buying panel right (frequency cards, plan select, button), then benefits, how it works, FAQ |
| D. Hub of tiles | /primary-care (home) | Big two-tile row plus small category tiles, then themed bands |
| E. Cinematic brand | /peptides-plus | Dark full-bleed film hero, huge headline with one highlighted word, sticky brand nav |

## Mapping (13 pages)

| # | Pav page | Hims type | Why |
|---|---|---|---|
| 1 | Teeth whitening | A /testosterone | Three ranges with prices, comparison, suitability. **Done** |
| 2 | Cosmetic dentistry | A /hair-loss | Many procedures, results, costs and financing |
| 3 | Aesthetics | A /hair-loss | Treatments grid, price list, safety |
| 4 | Oral hygiene | A /erectile-dysfunction | One condition family, tiers, who needs it |
| 5 | Root canal | A /testosterone | Three price tiers compared, consent, how it works |
| 6 | Virtual dentistry | A /weight-loss (app) | Online consult, prescription steps, app |
| 7 | Dentures | C /hair-loss/minoxidil | Choose a type and price, then details |
| 8 | Mouthguards | C /hair-loss/minoxidil | Choose colour and personalisation, then order |
| 9 | Emergency dentist | B /psychiatry | Urgent, photo-led, call first |
| 10 | Tooth extraction | B /labs | Sticky sub-nav: pricing, post-op, guarantee |
| 11 | Mobile dentistry | B /labs | At-home service, how it works, coverage |
| 12 | General dentistry | D /primary-care | Many services as tiles |
| 13 | Custom grillz | E /peptides-plus | Premium product, dark cinematic |

## Rules
- Keep every live sentence on the page (tests and `npm run seo:parity`); rewrite layout, not facts.
- Drop anything that is not on the live site.
- Images: generate in Gemini with a Hims capture as a style reference only; never copy Hims images.
- One page per commit.
