# Single-screen landing validation

Date: 2026-11-08. Implements the user's request to stop page scrolling, remove the text around the action pair and make those buttons smaller at the bottom.

The supplied screenshot was inspected visually. Removed the changing experience-description sentence above the buttons and the invitation/Explore the experience line below. The landing now uses one dynamic viewport, with responsive hero/artwork sizing, the experience picker above two compact bottom actions, and safe-area bottom spacing. The buttons retain approximately 44px height for usable touch targets. Motion control moved to the header; privacy remains accessible inside the idea dialog. Signup, chat and other dialogs retain independent scrolling rather than clipping content.

## Checks passed

- TypeScript, ESLint, 10 unit tests and production build passed against the final code.
- Local HTTP readiness check returned 200.
- Actual Chrome layout measurements showed page dimensions equal to viewport dimensions, with no horizontal/vertical page overflow, at these CSS-pixel sizes (browser zoom affected the requested device dimensions): 1675×845, 1309×818, 355×767, 291×516 and 767×355 landscape.
- Compact-phone buttons remained within the viewport at approximately 110×44 and 129×44 pixels. Desktop buttons measured approximately 126×44 and 161×44 pixels.
- Visual review confirmed headline, artwork, experience picker and both bottom actions remained visible on desktop and compact portrait layouts. Landscape uses a two-column hero to preserve available height.
- Signup was completed using the sample number in the short landscape viewport; chat invitation selection and simulated acceptance remained operable through internal scrolling. Escape closed the dialog and restored focus to Sign up. Page scroll stayed at 0,0 afterward.
- Download panel and relocated privacy navigation worked. Final browser warning/error logs were empty.
- Browser viewport override was reset after checks.

## Limits

No physical iPhone/Safari, VoiceOver, extreme text-size/accessibility audit, or separate hosted-browser smoke test was run. The existing signup/chat/app previews remain non-operational prototypes with no external messaging or account creation. Internal dialog scrolling is intentional and preserves access to longer content.

## Publication

Verified private publication succeeded at https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site on 2026-11-08 at 21:51 UTC. Source commit: `74e9f3676ff9d875bc2d1f77f8ee5854848dab07`. Deployment: `appgdep_6af0eec627ec8191b0da3ec769f76725`. Local preview server was stopped after validation.
