# 11:11 — Website and cross-platform architecture

Updated 2026-11-08. Read [D-008–D-013](decision-log.md) and the [shared brief](project-brief.md) first. D-014 now authorizes the iOS-first, UI-only app iteration. Expo React Native is used for the local prototype; backend vendors and production-service architecture remain recommendations rather than commitments.

## Scope and sequence

1. Now: an original, responsive website concept that communicates personality-based 1:1 blind dates and arranged experiences. It must be honest about being a preview and must not collect real signup or waitlist information.
2. Current D-014 iteration: an iOS-first Expo React Native / TypeScript UI in `mobile/`, with web preview for review. Production behavior follows later product and safety decisions.
3. Later: Android and optional authenticated web journeys as demand and accessibility testing justify them. Do not promise identical release dates or identical UI code.

The current website lives in `website/` using a Vinext/React/TypeScript starter. Verify exact installed dependencies and scripts in its package manifest rather than treating this document as a version lock. Treat Vinext compatibility, deployment support, maintenance, and upgrade risk as production review items. The React components and pure TypeScript foundations should remain portable if a mature alternative is preferred before launch.

## Share foundations, not every screen

The website's `packages/` directory holds the platform-neutral token and domain/copy foundations. These modules should depend on neither DOM APIs nor React Native. Their intended consumers are the current website and the future mobile app; their presence does not imply a mobile app or production service exists.

- **Design tokens:** semantic colors, spacing, radius, typography roles, and motion timing. Keep values serializable. Web adapters translate tokens into CSS variables; native adapters translate them into `StyleSheet` values and native animation settings. Fonts require appropriate mobile/web licenses and explicit platform loading. Do not share CSS assumptions as native layout rules.
- **Domain and content:** stable product vocabulary, approved neutral copy, and eventually versioned request/response types and validation. Current concept copy is not an operational contract. Do not encode unapproved eligibility, pricing, compatibility scores, reveal timing, or retention periods.
- **Platform-specific views:** semantic React DOM for marketing and browser accessibility; native components for safe areas, keyboards, touch, navigation, VoiceOver and app lifecycle. Reuse behavior where practical without forcing a universal component abstraction prematurely.
- **Motion:** a shared visual idea and timing palette, with different renderers. D-013 replaces the earlier two-orbit scene with a compact illustrated experience pill that changes selection every six seconds. Preserve the interactive three-option selector. Automatic selection is disabled for reduced motion and suspended while a dialog is open; no visible pause control remains. Validate timing, interruption and accessibility rather than assuming removing controls establishes accessibility compliance. Later native motion should use an appropriate native renderer rather than a website embedded in a WebView.

When the mobile project is authorized, promote the shared modules into a workspace layout such as `apps/web`, `apps/mobile`, `packages/design-tokens`, and `packages/domain`. This is a future migration, not the current file tree. Add workspace package boundaries and explicit exports then; avoid duplicate token copies that drift. Keep package tests independent of either renderer.

## Signup and conversation preview

The later D-011 addition is implemented in `website/components/signup/SignupExperience.tsx`. It renders phone entry with country prefix, preview-only format validation and a sample-number option, followed by a Messages-inspired conversation. Quick replies select an experience; a rich invitation exposes accept, details and alternate actions. Typed messages receive a demo response, and restart returns to phone entry. None of these actions sends a message or creates an account, reservation or commitment.

`website/packages/domain/signup.ts` exports pure phone-preview and message-validation rules suitable for reuse or testing outside React DOM. These are deliberately limited preview rules, not production international-number validation or authentication. View state stays in React memory, clears when signup closes or the page reloads, and is not submitted or persisted by the application. Do not add analytics that capture phone input or message text. Use the sample-number option for testing rather than private screenshot content.

The Download our app action displays a concept phone and iOS coming-soon explanation. There is no App Store/TestFlight link or native app artifact. D-013 retains signup/download while simplifying the landing and replacing idea-based navigation with an informational-only how-it-works dialog. Earlier guided-preview code or historical validation does not establish that a separate guided-preview entry remains in the current navigation.

For production, distinguish an authenticated in-app chat from SMS or native iMessage delivery. A similar-looking browser conversation does not establish access to Apple messaging services, rich card actions, native branding permissions or Apple affiliation. Investigate supported provider APIs, eligibility/access, device behavior and terms before selecting a channel or promising parity. Keep a transport-independent conversation model and server-side invitation state; channel adapters can later render only the capabilities actually supported.

Before real phone enrollment, implement verified account ownership with an approved verification provider, expiry and attempt limits, server validation, anti-abuse rate limits, safe error handling and consent records. A syntactically acceptable phone number is not proof of identity. Restrict account, phone and conversation data by purpose and role, define retention/deletion and notification disclosure, and keep private message content out of routine telemetry. Invitation accept/retry actions need authenticated, idempotent server transitions before they have real consequences.

## Backend recommendation for a real service

Start with a modular service and relational datastore, not microservices. This is a future recommendation with no selected vendor. Isolate identity, profile/consent, experiences/availability, matching review, date arrangements, notification delivery, and safety/support responsibilities. Build only the modules needed for the first approved journey.

Both mobile and authenticated web should consume a versioned API. The server owns authorization, eligibility, match state, disclosure and booking state. Client contracts improve consistency but never replace server validation. Never embed secrets or privileged access in web bundles or the app. Avoid exposing a match's private attributes through client-side filtering.

Before implementing matching, define the inputs, exclusions, review responsibility, consent and quality measures with the user. A simple auditable workflow with appropriate human review may be more useful than premature machine learning. Do not infer or claim access to 222's algorithm, scientific matching validity, or successful date guarantees.

For side effects, use queued jobs with bounded retries, idempotency keys, deduplication, and delivery-state records. A retry must not create a second booking or disclose information early. Make acceptance and cancellation transitions concurrency-safe. Keep matching and reveal rules testable independently of notification providers.

## Privacy and safety boundaries

No production personal-data collection is part of this concept. Before introducing it, decide necessary fields, consent, access roles, sharing purposes, retention, deletion/export behavior, and incident response. Separate public experience information from restricted participant profiles and safety reports. Limit staff access and audit consequential administrative changes without logging private answers or secrets unnecessarily.

Treat blocking, reporting and cancellation as first-class service behavior, not decorative controls. Define what is disclosed to each participant and when. Design secure notification previews and deep links so a lock-screen message does not reveal more than approved. Location, dietary, accessibility and other potentially sensitive details require explicit purpose and access decisions, not speculative collection.

## Scaling and maintenance

Scale measured bottlenecks: cache public content at the edge, index actual query paths, queue slow external operations, and observe latency/error rates without recording sensitive content. Use database transactions for two-person pairing and state changes. Add rate limiting and abuse protection before real signup. Split services only when operational load or team boundaries justify it.

Use separate development, staging and production environments with least-privilege credentials, reversible schema migrations, backups and a tested restore plan. Keep generated API clients or contract tests aligned across app versions. Mobile releases can lag server changes, so support backward-compatible API evolution, explicit deprecation and feature flags with safe defaults.

## Delivery and quality gates

The website requires type/build checks plus real-browser interaction and accessibility review. Native work later requires simulator and physical-device checks, VoiceOver, dynamic type, interrupted navigation, offline/retry states and upgrade compatibility. Shared modules need unit tests; API work needs authorization and state-transition tests; critical product journeys need end-to-end tests.

See [validation and launch gates](validation-and-launch-gates.md) for the required evidence and unresolved decisions. “Cross-platform ready” means the architecture separates reusable foundations from platform views; it does not mean iOS has been implemented, tested, or accepted.

## Current mobile implementation · D-014

`mobile/` is a separate Expo SDK 58 project using native React Native views, Expo Router navigation, Animated reveals, safe-area context and iOS keyboard avoidance. It is not the marketing website inside a WebView. The browser export uses React Native Web from the same screens.

A pure reducer gates home behind four intro pages, six validated questionnaire steps and review. Back/edit preserve draft answers; review edits return directly to review; reset clears the in-memory session. There is no API, persistent storage, matching model, authentication or booking integration.

The native theme imports `website/packages/design-tokens/index.ts` directly via a small Metro watch-folder adapter. This intentionally avoids duplicating the palette or migrating the existing website during UI iteration. Promote these source modules to proper workspace packages when that migration is useful.

The web and iOS Hermes exports pass. The current Mac lacks Xcode/simctl, so no simulator, physical iPhone, VoiceOver, Dynamic Type or native keyboard test is claimed. See `mobile-ui-validation.md`.
