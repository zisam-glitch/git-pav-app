# ADR-0005: Add EAS Update before the first store build

## Status
Accepted on 15 Nov 2026 (the owner asked for it). EAS Update has a free tier.

Built: `expo-updates` is installed and `app.config.js` turns updates on only once `extra.eas.projectId` exists in `app.json`
(that is, after `npx eas init`); until then updates are off, so no build points at an invented address. When on, the app checks
as it opens and never holds the first screen for an update (a fix is used from the next launch). Left: run `eas init`, then
`eas update --channel preview` on a preview build to prove an update lands, and write the rollback steps into the release checklist.

## Context
`pavdental/eas.json` defines `development`, `preview` and `production` channels, but `expo-updates` is not installed, so the channels do nothing. A bad release can only be fixed by a new store build and review. The previous release checklist promised an "EAS Update rollback" that was not possible.

## Decision
Install `expo-updates`, keep `runtimeVersion.policy: "appVersion"`, and publish JavaScript-only fixes to the `preview` channel first, then `production`. Native changes (new permissions, SDK upgrades) always go through a store build with a new app version. Updates that change what the app claims or collects still follow the store's rules (no feature changes that bypass review).

## Alternatives considered
- **Store releases only**: nothing to add, but rollback takes days.
- **Self-hosted updates server** (Expo Updates protocol): no vendor, but another service to host and secure.

## Consequences
- Positive: a broken screen can be rolled back in minutes; the same build can be pointed at a fixed update.
- Negative: Expo receives the JS bundle (no patient data) and must be in the processor list; a careless update could ship untested code, so updates go through the same CI and preview channel.
- Follow-ups: RB-20.

## References
- EAS Update introduction, https://docs.expo.dev/eas-update/introduction/
