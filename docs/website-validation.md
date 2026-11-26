# Website validation — 2026-11-08

**Historical baseline:** this report covers the source revision listed below, before the later signup/download/chat addition (D-011). Its passed checks and no-personal-details statement describe that earlier build only. The new phone/chat flows require their own validation record; see the updated launch gates.

Website source revision: `4416b9c558fd131e3dd14948c14df2d1028ff205` in the nested `website/` Sites source repository. The parent planning repository and its original Git history were preserved.

## Passed

- `npm run typecheck`: TypeScript completed successfully.
- `npm test`: four tests passed, covering all nine experience/energy combinations, two-person concept status, safe unknown-experience fallback, unique IDs/content, and primitive design tokens/touch-target baseline.
- `npm run lint`: ESLint passed without warnings.
- Production build through the Sites `build-site.mjs` helper completed successfully against the final source. Vinext emitted a non-blocking route-classification notice and Node deprecation warning.
- Source helper confirmed the exact source commit was pushed and packaged before publication.
- Local HTTP readiness check returned 200.
- Real Chrome visual review at desktop and narrow mobile viewport settings. Browser zoom resulted in measured CSS widths of 1675px desktop and 355px narrow; no horizontal overflow remained after the fix.
- Experience buttons switch copy and original line illustrations.
- Guided preview: experience selection, energy selection, result disclosure, returning to the previous step, repeated opening and dismissal.
- Idea, how-it-works and preview-privacy panels render; Close and Escape dismiss. Escape restored focus to its triggering navigation control.
- Guided step headings receive keyboard focus. Shift+Tab returned to the dialog Close control, and the native modal prevents background interaction.
- Pause control sets the animation state to `none`; resume is available. No browser warning/error logs were captured during the final local checks.
- Nine project Markdown documents passed relative-link validation during the documentation update.

## Fixes made during review

- Clipped decorative orbital art at the page boundary to remove narrow-screen horizontal overflow.
- Adjusted mobile headline size and control heights.
- Moved keyboard focus to the newly displayed guided-preview step heading.
- Used React's external-store subscription for the OS motion preference instead of a cascading effect update; lint then passed.

## Not verified or not implemented

No physical iPhone, Safari, VoiceOver, full automated accessibility audit, full contrast audit, OS-level reduced-motion emulation, backend service, real signup, matching, booking, payments, notifications or native mobile app was tested. Reduced-motion support is implemented and the manual pause state was checked; this is not a physical-device accessibility certification.

The site is an interactive concept. Its matching approach, eligibility, launch market, pricing, safety operations and data policies remain unresolved. See `validation-and-launch-gates.md` before collecting real information or operating dates. No personal details are requested; guided-preview choices remain in page memory and reset on reload.

## Publication

The private Sites deployment succeeded on 2026-11-08 at 21:26 UTC. Verified URL: https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site . Access remains owner-private. Deployment: `appgdep_6af0e8e194fc8191bd628b24e2d66d92`. The native hosting service confirmed success; no separate deployed-browser smoke test was performed. Local preview server was stopped after validation.

Development-server note: after hot module replacement during edits, Vinext logged a React multiple-renderers/context warning in the terminal. The final browser console check was empty, and subsequent full-page reloads and interactions succeeded. This development warning was not reproduced as a production-build failure. A hosted production browser smoke test remains a follow-up check.
