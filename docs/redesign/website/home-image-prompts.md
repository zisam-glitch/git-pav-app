# Home page pictures: style guide and Gemini prompts

Analysed from the saved Hims pages and the Mobbin Hims screens (22 Nov 2026). Numbers and descriptions only; no Hims picture is used or copied.

## What the Hims pictures have in common

1. **One hero object, centred.** A single product (a pill, a dropper bottle, a vial) fills about 55–65% of the frame. Nothing else competes with it.
2. **Studio realism with a slightly 3D look.** Matte ceramic, frosted glass, brushed metal; crisp focus, visible surface texture, a soft contact shadow under the object.
3. **Flat or softly graded warm backgrounds.** Cream (#F3EEE5), sand, peach, pale yellow fading to pale blue. Never busy.
4. **Soft directional light** from the upper left, gentle shadows, no harsh highlights.
5. **Lifestyle pictures are tight crops**: hands holding a product, warm tan or terracotta backdrop, natural skin, shallow depth of field. No full rooms, no stock-photo smiles.
6. **No text, no labels with words, no logos, no watermarks.**
7. **Space for a headline**: the subject sits in the lower or right two thirds when the picture carries a caption.

## Shared block (put at the start of every prompt)

> Premium telehealth brand photography in a calm, modern style. Soft warm directional studio light from the upper left, gentle realistic shadows, crisp focus, tactile materials (matte ceramic, frosted glass, brushed steel, linen). Warm cream, sand and soft terracotta palette. Minimal composition with one clear subject and generous empty space. Photorealistic, high resolution, shallow depth of field.

## Shared ending (put at the end of every prompt)

> No text, no letters, no numbers, no logos, no watermark, no people, no hands unless stated, no brand names. Keep the subject unmistakably related to dentistry.

## Prompts (dental subjects)

Portrait cards (3:4, shown at about 400 × 530 px):

- **home-card-emergency**: A calm dental treatment chair in a bright modern clinic, cream upholstery, a slim overhead examination light and a stainless instrument tray, one tall window giving soft daylight, warm wood cabinet, empty room, viewed from a low three-quarter angle with the chair as the subject. 3:4 portrait.
- **home-card-aesthetics**: A still life for a facial-aesthetics clinic: a small amber glass dropper bottle and a frosted glass serum jar on a warm sand surface, a folded white linen cloth, one soft shadow, plain terracotta-cream backdrop. 3:4 portrait.
- **home-card-whitening**: A single clean upper-teeth dental model in glossy white porcelain on a pale sand plinth, with one small whitening-gel syringe laid beside it, soft shadow, plain cream backdrop. 3:4 portrait.
- **home-card-general**: A dental check-up set on a folded white cloth: stainless steel mouth mirror and explorer probe, a small ceramic dish, a wooden toothbrush, plain warm cream backdrop, tidy symmetrical composition. 3:4 portrait.
- **home-card-extraction**: Sterile dental forceps and a pack of folded white gauze on a pale sage linen cloth on a stainless tray, calm and clinical, no blood, soft shadow, plain cream backdrop. 3:4 portrait.
- **home-card-mobile**: A compact tan leather mobile dentist's case, open slightly to show neatly packed stainless instruments, standing beside a warm cream armchair in a bright home living room corner, soft daylight, no people. 3:4 portrait.

Wide and landscape:

- **home-hero-banner** (16:9, text goes on the left): A wide, bright, modern dental clinic reception and treatment suite, warm walnut cabinetry, cream chair at the right, plants, large window light, depth, the left third kept calm and empty for a headline. 16:9.
- **home-emergency-suite** (4:3): A dental treatment room at dusk, warm pendant lamp, cream treatment chair, deep window showing a blue evening sky, calm and reassuring. 4:3.
- **home-cavities-poster** (16:9): A large clean anatomical tooth model cut open to show the layers, on a plain cream background with a soft shadow, a small mirror and probe beside it. 16:9.

Top-row tiles (square, object on a flat cream background, object about 60% of the frame):

- **home-tile-checkup**: A wooden toothbrush standing upright beside a stainless mouth mirror.
- **home-tile-emergency**: A small cream first-aid case with a clean tooth-and-cross shape embossed, no text.
- **home-tile-aesthetics**: A frosted glass serum bottle with an amber dropper.
- **home-tile-whitening**: A white whitening-tray case, open, with a pearl-white tooth model inside.
- **home-tile-general**: A glossy white tooth model next to a stainless mirror.
- **home-tile-mobile**: A compact tan dentist's carry case with a brass clasp.

## After generating

1. Download the full-size image from Gemini.
2. Crop to the slot's ratio with ffmpeg (centre crop), resize to the slot's size, save as a compressed JPEG of at most 160 KB at the same filename in `website/public/images/generated/`.
3. Check each picture on screen at 1440 and 390 px wide.
