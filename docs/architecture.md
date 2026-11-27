# 11:11 — Website and cross-platform architecture

Updated 2026-11-26. Read [D-008–D-016](decision-log.md) and the [shared brief](project-brief.md) first. D-014 authorizes the iOS-first app UI. D-015 accepts the 88-step local questionnaire. D-016 accepts the isolated Java API as the backend foundation; **client wiring and production data collection remain unauthorized** until Gate 3+ and an explicit connection approval. Expo React Native is used for the local prototype.

## Scope and sequence

1. **Now (D-017):** finish website and mobile **UI**. Launch story: **18+**, **San Diego**, **Dinner only** (other experience types later). Honest preview labeling; no real signup collection or verification work in this phase.
2. D-014 / D-015 mobile UI: iOS-first Expo React Native / TypeScript in `mobile/`, with web and simulator preview.
3. Accepted but **deferred** backend foundation (D-016 / D-017): Spring Boot API in `backend/` stays isolated; no active backend feature work or client wiring until the UI phase is done and Gate 3+ are approved.
4. Later: expand geography and experience types; Android and authenticated web as justified.

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

## Backend: as-built foundation and production path

**Accepted foundation (D-016).** `backend/` is a Spring Boot 4.x / Java 21 Maven service with JDBC + Flyway, local H2 on `127.0.0.1:8080` (PostgreSQL supported, not production-verified here), OIDC JWT default-deny unless `AUTH_ISSUER` is set, public health/questionnaire/events reads, and authenticated `/api/v1/me/*` profile, answers, interests, readiness, timed disclosure, and block/report. Typed TypeScript contracts and a preview adapter live under `backend/contracts/` for tests; they are not imported by `mobile/` or `website/` at runtime. See `backend/docs/` for API, matching coverage, concurrency, and local-integration rules.

**Boundaries.** Production clients must not call this API until Gate 3+ and real OIDC. **D-024** authorizes an explicit `local-dev` profile for simulator wiring only (loopback JWT, seeded dinners, Expo → `127.0.0.1:8080`). Do not treat preview `demoMatched` as server truth; interest is waitlist-only. Production gaps still include real OIDC, verified identity, CORS policy for clients, rate limits, staff roles, account deletion, match/booking/notification write paths, dispatched outbox, CI, backups, and OpenAPI.

**Production recommendation (unchanged intent).** Prefer a modular service and relational datastore over premature microservices. Isolate identity, profile/consent, experiences/availability, matching review, arrangements, notification delivery, and safety/support. Both mobile and authenticated web should eventually consume a versioned API; the server owns authorization and state. Client contracts never replace server validation. Before matching, define inputs, exclusions, review, consent and quality measures with the user. For side effects, use queued jobs with bounded retries, idempotency, and delivery-state records.

## Privacy and safety boundaries

No production personal-data collection is part of this concept. Before introducing it, decide necessary fields, consent, access roles, sharing purposes, retention, deletion/export behavior, and incident response. Separate public experience information from restricted participant profiles and safety reports. Limit staff access and audit consequential administrative changes without logging private answers or secrets unnecessarily.

Treat blocking, reporting and cancellation as first-class service behavior, not decorative controls. Define what is disclosed to each participant and when. Design secure notification previews and deep links so a lock-screen message does not reveal more than approved. Location, dietary, accessibility and other potentially sensitive details require explicit purpose and access decisions, not speculative collection.

## Scaling and maintenance

Scale measured bottlenecks: cache public content at the edge, index actual query paths, queue slow external operations, and observe latency/error rates without recording sensitive content. Use database transactions for two-person pairing and state changes. Add rate limiting and abuse protection before real signup. Split services only when operational load or team boundaries justify it.

Use separate development, staging and production environments with least-privilege credentials, reversible schema migrations, backups and a tested restore plan. Keep generated API clients or contract tests aligned across app versions. Mobile releases can lag server changes, so support backward-compatible API evolution, explicit deprecation and feature flags with safe defaults.

## Delivery and quality gates

The website requires type/build checks plus real-browser interaction and accessibility review. Native work later requires simulator and physical-device checks, VoiceOver, dynamic type, interrupted navigation, offline/retry states and upgrade compatibility. Shared modules need unit tests; API work needs authorization and state-transition tests; critical product journeys need end-to-end tests.

See [validation and launch gates](validation-and-launch-gates.md) for the required evidence and unresolved decisions. “Cross-platform ready” means the architecture separates reusable foundations from platform views; it does not mean iOS has been implemented, tested, or accepted.

## Current mobile implementation · D-014 / D-015

`mobile/` is a separate Expo SDK 58 project using native React Native views, Expo Router navigation, Animated reveals, safe-area context and iOS keyboard avoidance. It is not the marketing website inside a WebView. The browser export uses React Native Web from the same screens.

A pure reducer in `src/onboarding.ts` gates home behind four intro pages, an **88-step** questionnaire (name/phone/code plus 82 option-only prompts), sectioned review, and a three-tab local app concept. Back/edit preserve draft answers; reset clears the in-memory session. There is no API call, persistent storage, matching model, real authentication or booking integration. Phone/SMS remain preview-only.

The native theme imports `website/packages/design-tokens/index.ts` directly via a small Metro watch-folder adapter. That coupling is fine for local iteration; a standalone or EAS build may need the shared tokens promoted to a proper package (future migration).

Web and iOS Hermes exports have passed historically. As of 2026-11-26 this Mac has Xcode and simulators (including iPhone 17 Pro); Expo Go on iOS 16.0 simulators fails Expo SDK 58’s minimum (needs ≥16.4). Physical-device VoiceOver / Dynamic Type certification against the current 88-step flow is still outstanding. See `mobile-ui-validation.md` and D-015.
