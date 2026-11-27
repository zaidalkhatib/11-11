# 11:11 · iOS-first app

Expo React Native app. Against **local-dev** Spring (`127.0.0.1:8080`) it saves profile/answers after conditions, lists seeded dinners, joins interest, and can reach a local match. Phone code is UI-only (no SMS). No production OIDC, push, or booking.

## Run with local API

```sh
# terminal 1 — H2 DB + seeded dinners + loopback JWT
./scripts/local-dev.sh

# terminal 2
cd mobile
npm install
npx expo start --ios
```

Optional: `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080` (default).

## UI-only / web preview

From this folder:

```sh
npm install
npm run web
```

The verified static preview is also served on this Mac at `http://127.0.0.1:8084` for this development session. To restart it:

```sh
npm run export:web
python3 scripts/serve-preview.py
```

For an iOS development session, use `npm start` and a compatible Expo Go version, or `npm run ios` with Xcode and an iOS simulator installed. Xcode and the iPhone 17 Pro simulator are installed; the app runs in Expo Go. The iOS Hermes bundle was successfully exported; that is not a signed app, TestFlight build, or device test. Android is structurally supported by Expo, but was not tested.

## Flow

1. Four original informational pages with staggered text reveals. No forced reading timer; Next remains available.
2. Forty-three steps: first name, a phone/code preview, plus option-only questions about personality, beliefs and their importance, height, gender, dating preferences, work, interests, attraction, relationship goals, humor, planning, decision-making, values, ambition, support, independence and family intentions. No free-text personality prompts.
3. An editable review. The app is gated until every step is valid and reviewed.
4. A local three-tab app concept: For you, Invitations, and You. The sample dinner can be saved locally for the session; it is not a real event or booking.

Back preserves answers. Editing during onboarding returns directly to review. The You tab groups answers into six editable sections; each answer opens a Save/Cancel sheet without replaying onboarding. A photo can be chosen from the system library and is kept only in memory, never uploaded. Saved ideas survive editing. Restart asks for confirmation and clears the session. Reload intentionally clears all demo state.

## Structure

- `src/app/`: Expo Router entry, home, invitation and profile routes. Direct links to main-app routes redirect to onboarding until the in-memory gate is complete.
- `App.tsx`: shared flow provider, native screens, motion, safe areas, keyboard handling, accessibility and UI styling.
- `src/onboarding.ts`: pure flow reducer and validation.
- `src/theme.ts`: native adapter importing the existing shared tokens from `../website/packages/design-tokens/index.ts`.
- `tests/onboarding.test.ts`: required-gate, validation, back, edit, selection-limit and reset tests.
- `metro.config.js`: watches the existing shared token source, avoiding a duplicated palette.

The website was preserved. A future workspace migration can promote the shared modules into root packages; it was not needed to build this iteration.

## Checks

```sh
npm run check
npm run export:web
npm run export:ios
```

See `../docs/mobile-ui-validation.md` for actual passes and verification limits. The current official Expo SDK 58 dependency tree reports twelve moderate dependency/tooling advisories in the full dependency tree, including glob/minimatch and lint tooling. No high or critical advisories were reported. No breaking automated dependency downgrade was applied.

## Accessibility and data boundaries

Motion respects the platform Reduce Motion preference and screen-reader detection. Leaving the active app stops pending reveals and exposes their text. Invitation copy rotates with a typewriter reveal while that screen is active; reduced motion and screen-reader mode show static copy instead. Native safe areas, scrollable content, iOS keyboard avoidance, 44pt minimum primary targets, accessible choice states, modal background hiding and editable summaries are implemented. Real VoiceOver, Dynamic Type, iOS keyboard and lifecycle behavior still need device validation.

Answers live only in React memory. Do not put sensitive or real contact information into a UI prototype. No fetch calls, API integrations, account provider, storage SDK, push setup, or credentials were added.

Question wording, completion policy, eventual authentication, privacy/consent, eligibility and real matching/experience operations are design proposals for later approval, not launched product policy.

## Date selection UI

The icon-only bar is Profile / Dates / Invitations and opens on the middle Dates tab. Choose one of three always-visible date rows (Dinner, A little adventure, Something creative) to create a unique horizontal card, open an in-place panel and slide to join a local preview waitlist. Details persist across tabs in React memory only. No day, time or location is requested or assigned. The panel stays within the center tab; there is no detail modal. The notification switch stores a preview preference, not device permission; Preview a match creates a clearly labeled in-app demo invitation and optional in-app banner. No push registration, real matching, reservation or location access. The invitation empty state uses an original 11:11 four-beam orbital spark with rotating original typewriter messages beneath it.

The initial experience selector has been removed; dates are chosen only in the middle tab after onboarding. Phone entry may be left blank and the code screen advances with Next without authentication. No SMS is sent. The phone is masked in the profile summary. Height uses a scrollable selection list in both onboarding and profile editing. Body build, ethnicity and shared-background preferences can be skipped; all remain local. Added movement habits, workout frequency, shared activity, daily rhythm, stress recovery, affection style and family connection prompts.

Onboarding now groups the same answers into six sections: basics, personality, beliefs & values, your world, attraction, and love & connection. Each section ends with an informational completion page previewing the next section; the last leads to review. Back and profile edits preserve answers.

Latest minimal date screen: only the three-choice card is shown. Selecting a row replaces it in place with that date and its slide-to-join control. Completing the slide still updates the local preview waitlist; joined rows show a checkmark when returning to choices. No carousel, notification switch, demo action, decoration, or extra selection-page copy.

Profile overview now uses tappable section cards and answer-completion bars, with original abstract line artwork. Bars reflect actual populated responses (optional omissions do not block onboarding). Open a card to view/edit its responses. Navigation is Events / Invites / You, icons only, with Invites as the initial middle tab. The duplicate top-right profile shortcut was removed. Display headings and large body text are reduced roughly 14%; small text, touch targets and native font scaling remain intact.

Reference-inspired expansion adds 35 optional, original option-only prompts. Existing questions and answers are retained. Topics include background/languages, podcasts, social settings, digital habits, pets, trust, resilience, purpose, viewpoints and money values. Duplicated attraction/religion/extroversion topics remain single questions. No screenshot answers were imported, no social handles collected, and no intelligence score or dated political-event claim was copied. Restart introduction and its footer action were removed.

### Contextual prompts and partner fit
Every personality prompt now includes original question-specific guidance, used in onboarding and profile editing, with explicit selection limits. Six optional partner-fit prompts cover relationship structure, alignment on children, smoking/vaping, drinking, distance, and preferred social energy. Existing answers and keys are preserved; no answers are inferred and these preferences do not run real matching. There are 84 total onboarding steps.

### Research-informed relationship prompts
Four optional original prompts explore positive-event support, feeling understood, reconnecting after respectful conflict, and autonomy-supportive goal support (88 total steps). They are preference/conversation prompts, not validated scales, diagnoses, or predictors of chemistry. No choice receives a score, and shared answers do not imply compatibility. Existing profiles remain valid without these answers. See `docs/question-research.md` for construct-to-source mapping and limitations.
