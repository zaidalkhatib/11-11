# iOS-first UI validation · 2026-11-08

Scope: D-014 UI-only prototype in `mobile/`. Native React Native screens with Expo SDK 58, React 19.3, React Native 0.88.1 and React Native Web for review. No backend or real account, match, invitation, booking, data submission or storage was implemented.

## Passed on the final source

- TypeScript strict check: `npm run typecheck`.
- ESLint: `npm run lint` passed. `expo lint` had a CLI version-detection issue, so the project uses the installed ESLint directly.
- Nine reducer/validation tests: four-page intro ordering, required-answer gate, invalid inputs, complete flow, back navigation, selection limits, edit relocking, reset, and direct return to review after a valid edit.
- `npm run export:web`: browser bundle produced successfully.
- `npm run export:ios`: Hermes iOS JavaScript bundle produced successfully in `dist-ios/`.
- `npx expo install --check`: dependencies up to date.
- `npx expo-doctor`: 20/20 checks passed.
- Local HTTP preview responds 200 at `http://127.0.0.1:8084` on this Mac.

## Browser interaction and visual checks

Used the connected Chrome browser against the locally served export. The phone viewport override was 390×844; the user's existing browser zoom resulted in approximately 354×767 CSS pixels. The compact override was 320×568, approximately 291×516 CSS pixels. This is browser rendering, not an iPhone emulator.

Verified:
- All four introduction pages and their reading/Next sequence; original typography, palette and staged reveal implementation.
- A rapid double click advances just one introduction page.
- Empty nickname disables Continue; valid synthetic nickname enables it.
- Required experience choice, five-position social rhythm and single-choice chemistry.
- Conversation interests require two selections and cap at three; deselection still works at the limit.
- A short invalid personal answer blocks progress; a valid synthetic answer enables review.
- All six edit links in review; entry to the main app only after completion.
- Main For you, Invitations and You tabs, sample-experience modal, close and local save actions.
- The active modal hides background controls from the browser accessibility tree.
- Editing from You relocks the main app, preserves answers and returns directly to review. A saved idea survives the edit/review round trip.
- Restart cancellation preserves answers; confirmed restart returns to the first introduction. Reload also returns to the initial state.
- Correct checked states exposed for checkbox/radio controls and selected state for tabs.
- Compact screen has no horizontal overflow; content uses internal scrolling as needed and the primary action remains available. Compact introductory typography was adjusted after visual inspection.
- No browser console errors or warnings were observed in the initial full UI flow. After Expo Router integration, the route-aware server was changed from a short-lived background process to a persistent local preview process; a transient chunk-loading error during that server interruption was resolved by restarting and reloading. The repeated routed flow then reached home, saved a sample idea, opened Invitations and You, and edited an answer back to review.
- Temporary viewport override was reset. The browser tab was marked as a deliverable. Browser transport closed during the final post-Router saved-state/reset rerun, so that last sequence has an uncertain outcome. The earlier full edit/save/reset checks and reducer tests passed; the local server was restarted independently of the interrupted test session and both `/` and `/home` returned HTTP 200 afterward. Opening the root preview URL starts a clean introduction.

Findings fixed during review: JSX literal line breaks, web accessibility selection states, chemistry radio semantics, modal background accessibility, modal reduced-motion handling, saved idea loss after editing, and ambiguous saved-toggle copy.

## Implemented but not device-validated

Safe areas, scrollable layouts, iOS keyboard avoidance, Android back handling, screen-reader detection, Reduce Motion support and app-background reveal cleanup are present. Browser motion preference was false during tests; native VoiceOver, Dynamic Type, keyboard, lifecycle interruption and reduced-motion behavior have not been tested on a device. No claim of complete accessibility compliance is made.

## Remaining limits

- Xcode/simctl is not installed on this Mac. No simulator, physical iPhone, signed IPA, TestFlight or App Store build was run or produced. A successful Hermes export is not a native runtime test.
- Android runtime was not tested.
- The official Expo dependency tree reports twelve moderate audit findings in the full dependency tree, including development/build/lint tooling (`glob`/`minimatch`), with no high or critical findings. The suggested automated resolution was a breaking SDK downgrade, so it was not applied. Revisit before production work.
- Node reports a harmless module-type warning when running `.ts` tests; tests pass. The generated Expo ESLint configuration is installed and direct ESLint passes.
- Question wording, final signup/authentication, privacy/consent, eligibility, real matching and experience operations remain future product decisions. The current UI is a design proposal, not a launched service.

## Review and restart

Open `http://127.0.0.1:8084` on this Mac. If the local server has stopped, from `mobile/` run:

```sh
npm run export:web
python3 scripts/serve-preview.py
```

See `mobile/README.md` for Expo development commands. The existing website source and published site were not changed or redeployed by this task.

## Routing check

Expo Router owns app navigation through `src/app/`: onboarding at `/`, and gated `/home`, `/invitations`, `/you` routes. The multistep introduction/questionnaire uses the tested reducer within the onboarding route. The flow provider remains mounted across routes; saved sample ideas and answers are held in memory. Direct entry to `/home` before completion was verified to redirect to onboarding. Home, Invitations, You, and profile-edit navigation were exercised after integration. The local preview server serves those known routes through the same static app entry.
