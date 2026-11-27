# 11:11 website

Original 11:11 concept website. Built with React, TypeScript and the Sites Vinext starter. This is a design preview, not a live dating service. Signup and messaging are local-only previews. No real account creation, matching, booking, notification, payment, SMS/iMessage or analytics integration is connected.

## Run and verify

Use Node 22.13 or later. Install from the lockfile with `npm ci` (or the Sites dependency helper in the hosting workflow).

- `npm run dev`: local preview, normally http://127.0.0.1:5173.
- `npm run typecheck`: TypeScript.
- `npm test`: platform-neutral domain/token tests.
- `npm run lint`: ESLint.
- `npm run build`: production build. For Sites publication, use its build/source helpers.

## Source map

- `app/page.tsx`: single-viewport minimalist landing, automatically changing experience display and accessible dialogs.
- `app/globals.css`: web-only layout and animation renderer.
- `packages/design-tokens/index.ts`: platform-neutral colors, spacing, type, radius, motion, touch targets. Web consumes semantic colors, radii, motion duration and targets through CSS variables. Remaining primitive tokens are the baseline for future platform adapters.
- `packages/domain/index.ts`: typed experience concepts, preference types and a presentation-only preview function. It is not a matching algorithm.
- `tests/domain.test.ts`: shared-module invariants.
- `.openai/hosting.json`: private Site identity, preserved for future updates.

See the parent project's `docs/architecture.md`, `docs/decision-log.md` and `docs/validation-and-launch-gates.md` before expanding scope. Expo React Native is the recommended iOS-first next step after website review; no mobile app is implemented here. Share tokens/contracts, retain platform-specific accessible views.

## Design and privacy

The live 222 website was reviewed for its sparse invitation-like feeling, grain, serif type and restrained pill controls. No source code, logo, photographs, wording or animations were copied. 11:11 uses original aubergine/copper colors and small line illustrations in a changing experience pill. System serif fonts require no external font request; decorative texture and illustrations are embedded. The landing cycles every six seconds, while honoring OS reduced-motion preferences and suspending automatic changes when a dialog is open. There is no visible motion control.

The landing has one central purpose sentence, the Dinner/adventure/creative selector, compact signup/download actions and an informational-only how-it-works dialog. There is no footer or idea tab. Preview choices live only in React memory and reset on reload. Phone/message inputs in signup clear when that dialog closes or restarts; there is no storage or submission. A reserved sample phone number is provided so reviewers need not enter personal information. Do not introduce real signup or service claims until the parent project's privacy, safety and operational gates are resolved.

## Signup and app-download preview

`components/signup/SignupExperience.tsx` implements phone entry, country-code selection, inline validation, sample number, local chat replies, rich invitation cards, details, alternate concepts, simulated acceptance and reset. `packages/domain/signup.ts` contains portable UI validation/message rules with unit tests. These are not production verification or matching rules.

Download our app opens an iOS-first coming-soon concept, not an App Store or TestFlight URL. No Apple association or messaging capability is claimed. Screenshots supplied by the user informed the UI structure only; their personal contact/message contents and source assets are not included in the website.
