# 11:11 — Validation and launch gates

Updated 2026-11-08. This document defines checks and decisions, not a record that tests have passed. Attach actual commands, outcomes, browser/device details, and remaining failures in the implementation handoff. A concept preview is not a launched dating service.

## Gate 1: Reviewable website concept

The authorized current deliverable should satisfy these checks:

- Build and type checks run against the final source using the project's supported scripts. Report failures or unavailable tools honestly; a build alone is not browser QA.
- Desktop and narrow/mobile layouts are reviewed for clipped navigation, text overflow, readable type, safe viewport sizing, and accessible touch targets.
- Navigation and dialogs work through repeated open/close actions, Escape, backdrop interaction where supported, keyboard focus movement and return, and interrupted flows. Check Back/Forward when state is routed.
- Important content remains usable with keyboard navigation, meaningful headings, accessible names and visible focus. Review contrast against actual composited colors, including translucent surfaces.
- Reduced-motion preference yields a calm, readable state. Animation must not obstruct navigation or be the only way to understand the service. For D-013, check six-second automatic selection, manual Dinner/adventure/creative selection, suspension while a dialog is open and disabled automatic selection under reduced motion. Assess auto-updating-content accessibility explicitly; no visible pause control is requested, but that alone is not evidence of compliance.
- For D-013, verify the single-viewport minimalist landing, compact illustrated experience pill, removed footer/idea/motion controls, and header with only logo and how-it-works. The how-it-works dialog must be informational apart from close, while signup/download remain accessible and truthful.
- Content is exclusively 1:1, original, and truthful: no fabricated venues, prices, waitlist totals, matching accuracy, safety guarantees, live availability, testimonials, or launch dates.
- Signup/interest controls do not silently collect data or suggest registration succeeded. The current concept must clearly explain its preview status.
- Validate the D-011 signup flow: empty/invalid numbers, country changes, sample-number entry, keyboard submit, chat transition focus, quick replies, accept-once behavior, details toggle, alternate invitation, typed-message limits, restart, and closing/reopening. None may imply verified account creation or a real booking.
- Verify phone input and chat messages are not sent or stored by the application and clear when signup closes or the page reloads. Prefer the sample number and synthetic text for checks. Confirm no private screenshot details appear in the product.
- Verify Download our app opens an explicitly labeled iOS coming-soon concept, with no fabricated store link or implication that an app can currently be installed. Test its transition to signup and dismissal/focus recovery.
- Review network behavior for unexpected third-party tracking or form submission. Identify external fonts/assets and their licensing and data implications before publication.
- Token/domain modules remain free of platform-specific dependencies. No credentials or private user data are present in client assets.

**Evidence status in this document:** check specification only. The implementation lead owns the final validation report. Unexecuted checks remain unverified, not passed.

## Gate 2: Publish a concept preview

Before sharing a hosted preview, verify the publishing authorization and intended audience, confirm the target host and visibility, review asset/font rights and any required provider terms, and verify the deployed version. Keep preview labeling and disable all real signup collection. If deployment introduces a new account, paid commitment, data transfer or other confirmation-sensitive action, obtain the applicable approval first.

Deployment is separate from local implementation. Do not claim a live URL works until the actual URL is checked. A hosted concept does not authorize running the dating service.

## Gate 3: Collect interest or create accounts

Resolve Q-01–Q-03, Q-08–Q-09, Q-14–Q-15 to the extent required for the actual flow. Required decisions include audience/geography, eligibility, what the user is joining, necessary fields, communications consent, privacy disclosures, retention/deletion, support ownership and approved providers. Implement server validation, access control, spam/rate limits, confirmation/error states, monitoring and a tested deletion path. Agree on what happens when a person is not eligible or the service is not available.

The local phone field is a demonstration, not authorization for production collection. Encourage the sample-number option; do not persist, transmit or use entered numbers/messages for real enrollment while these decisions are unresolved. Do not use production users to test placeholder matching or notification logic.

Before enabling real phone signup, test phone/account verification through an approved provider, ownership checks, expired/incorrect/reused codes, resend/attempt limits, server-side international-number validation, rate limiting, consent records, account recovery, and restricted access to personal data. Format validation alone is not verification. Before live messaging, establish channel/provider feasibility and access, authenticated conversation ownership, delivery/failure behavior, opt-out rules and safe notification previews. Validate rich invitation actions against actual supported capabilities. An iMessage-inspired browser interface is not proof of native iMessage integration or Apple affiliation.

## Gate 4: Operate real 1:1 dates

Resolve matching inputs and exclusions (Q-04), reveal and consent (Q-05), venue/schedule ownership and accessibility needs (Q-06), pricing and cancellation commitments (Q-07), trust/safety and staffed escalation (Q-08), sharing and deletion (Q-09), and no-match/no-show/cancellation cases (Q-10). Define quality and launch thresholds (Q-12), owners and acceptance authority (Q-14).

Verify authorization and disclosure boundaries, two-person pairing under concurrent requests, duplicate/retried notifications and bookings, changes after acceptance, blocking/reporting, and operational recovery. Validate backup restoration and incident-response responsibilities. Obtain appropriate jurisdiction-specific legal and privacy review. A checklist cannot establish legal compliance or guarantee safety.

## Gate 5: Build and release the iOS-first app

Approve the actual mobile scope after website review. Confirm React Native/Expo or another cross-platform choice through a small feasibility check covering typography, original motion, accessibility and required native capabilities. Do not assume every web component will be reused.

Before release, verify physical iPhone behavior, VoiceOver and dynamic type, keyboard/safe-area layouts, background/foreground transitions, notifications and deep-link disclosure, interrupted onboarding, offline/retry states, secure session handling and compatible API upgrades. Confirm developer-account ownership, store privacy disclosures, permissions, support, and release/signing responsibilities. Android remains a later platform target unless separately prioritized.

## Readiness record template

For each delivery, record date, source revision or final working-tree description, check performed, expected result, actual result, evidence location, remaining risk, and owner/next action. Distinguish **passed**, **failed**, **blocked**, and **not run**. An unresolved policy is a decision needed, not a test failure to hide with placeholder behavior.
