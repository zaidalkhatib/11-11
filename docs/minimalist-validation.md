# Minimalist landing validation

Date: 2026-11-08. Implements the latest user request to simplify the landing around the service goal, retain the experience selector and changing animation, remove footer and visible play/pause controls, and show only informational how-it-works navigation.

All three user screenshots were inspected visually: the sparse 222 landing, the 11:11 Dinner/adventure/creative bar, and the old footer. The new central statement is “Meet someone on your wavelength,” followed by a changing compact pill for dinner, adventure or a creative experience. Original aubergine/copper styling remains. Large orbit/invitation artwork, secondary marketing paragraphs, the idea panel, the earlier guided-evening actions and unused landing CSS were removed. Small signup/download buttons and the existing local-only demos remain.

## Checks passed

- TypeScript, ESLint, all 10 existing unit tests and the production build passed. The build emitted only the existing Node module.register deprecation and Vinext route-classification notices.
- Local HTTP check returned 200. Browser warning/error logs were empty at the end.
- Page size equaled viewport size at five actual Chrome CSS-pixel sizes: 1675×845, 1309×818, 355×767, 291×516, and 767×355 landscape. Browser zoom explains the difference between requested device sizes and measured CSS sizes. No horizontal or vertical document scrolling was present.
- Visually reviewed desktop, phone, compact phone and landscape. The goal, changing pill, selector and both bottom actions stayed visible. The creative label wraps inside its pill on the narrowest phone without clipping. Bottom phone buttons remained about 110×44 and 129×44 CSS pixels.
- Manual experience selection updated the pill and selected state. Automatic cycling was observed progressing from Dinner to A little adventure without input. A timed locator check initially expired before the new text appeared; the next state check directly confirmed the transition.
- How it works contained only its information and close button. The header contained no idea or motion controls, and no footer was rendered.
- The short-landscape signup demo accepted the reserved sample number, opened chat, selected Dinner and simulated invitation acceptance. Escape closed the dialog and restored focus to Sign up. Document scroll remained at 0,0.
- Download opened the iOS-first coming-soon concept and its existing link opened signup. No app-store link or live account/message/booking was added.
- Temporary viewport override was reset.

## Accessibility and limits

The code uses prefers-reduced-motion for both the automatic timer guard and CSS motion suppression. It does not override the OS setting. The changing visual text is hidden from assistive technology; a static screen-reader heading describes the purpose and choices. The native dialog retains independent scrolling and keyboard dismissal. These behaviors were inspected in source; reduced-motion OS emulation and a screen-reader session were not run.

No physical iPhone/Safari, full accessibility audit, extreme text-size test or separate hosted-browser smoke test was run. The retained signup/chat/download remain clearly labeled prototypes, with no persistent signup, SMS/iMessage integration, live app, matching or booking.

## Publication

Verified private publication succeeded at https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site on 2026-11-08 at 22:04 UTC. Source commit: `f3c50a17432ce2fc5f6b9e9f30476868126eac5b`. Deployment: `appgdep_6af0f1f748bc81919fa69121a7ea6f2e`. Audience remains owner-private. Local preview server was stopped after validation.

## Copy refinement, 2026-11-08 at 22:09 UTC

At the user's request, replaced the landing headline with “Two people. One blind date.” and removed the specified development/status paragraph from How it works. Other layout, animation, selector, signup and download behavior is unchanged. Existing local-preview and coming-soon disclosures remain inside the signup/chat and app-download flows.

TypeScript, all 10 tests and production build passed. Local Chrome confirmed the updated headline and the paragraph's absence in the informational dialog; mobile visual inspection at 355×767 CSS pixels showed a one-screen layout with no page overflow. Browser warning/error logs were empty. The first dialog check occurred before hydration completed; a fresh state check and retry after automatic animation began confirmed the dialog worked. Viewport override was reset and local server stopped. No separate hosted-browser or physical-device check was run.

Private publication succeeded at the same URL. Commit: `2772496eba5193daf303d198fc6113e8ab08caeb`. Deployment: `appgdep_6af0f309d8448191a7661bbceef1e65a`.
