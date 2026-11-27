# 11:11

11:11 arranges personality-based, 1:1 blind dates around experiences. This repository ([github.com/zaidalkhatib/11-11](https://github.com/zaidalkhatib/11-11.git)) holds shared project planning, the website concept in `website/`, the authorized iOS-first UI prototype in `mobile/` (88-step onboarding — D-015), and the accepted isolated Java API in `backend/` (D-016; clients not wired).

## Shared documents

- [Project brief](docs/project-brief.md): confirmed requirements, constraints, and open questions; the common reference for every workstream.
- [Decision log](docs/decision-log.md): approved decisions, proposals, and the approval process (through D-016).
- [Architecture](docs/architecture.md): website, mobile UI, shared foundations, and as-built backend boundaries.
- [Validation and launch gates](docs/validation-and-launch-gates.md): prototype checks and decisions required before collecting data or launching.
- [Design charter](docs/charters/design.md)
- [Engineering charter](docs/charters/engineering.md)
- [QA & Safety charter](docs/charters/qa-and-safety.md)
- [Growth & Experiences charter](docs/charters/growth-and-experiences.md)

## Workflow

1. Read the shared brief and decision log before starting any workstream task.
2. Record missing information as an open question. Put suggested answers in the decision log as proposals; do not silently turn them into requirements.
3. Ask the user to resolve decisions when needed. CEO coordinates in a separate conversation; there is no assumed shared history or automatic synchronization. Bring relevant document contents or changes into that conversation explicitly.
4. Record an explicit approval and its source in the decision log, then update the brief and affected charters consistently. Coordination alone does not imply approval authority.
5. Before work begins, check dependencies and authorization. Charter deliverables describe future work, not permission to execute it now.
6. Preserve existing files. Make focused, reviewable updates; do not replace or discard prior work without explicit direction. When a decision changes, retain the earlier entry and mark it superseded.

For cross-conversation handoffs, include the task, relevant file contents or accessible links, decision IDs, unresolved questions, dependencies, changes made, and the next requested action. Local paths alone may not be accessible from another conversation.

## Current scope and next steps

Updated 2026-11-26: planning docs now match the checked-in tree (D-015, D-016). Earlier: website first after live [222](https://222.place/) review, original premium style with different color/animation, then iOS-first cross-platform (D-008–D-010).

The website remains a concept preview (D-011–D-013): local Sign up / chat demo and iOS coming-soon — no real accounts, App Store link, payments, or outreach. **Mobile** (`mobile/`) is the D-014 UI prototype with the accepted **88-step** onboarding (D-015). **Backend** (`backend/`) is the accepted Spring Boot foundation (D-016); neither client calls it yet. Gates 3–5 and open brief questions (Q-01–Q-15) still block production data collection, API wiring, and live dates.

**Current priority (D-017):** finish website and mobile **UI** first. Backend work, verification, and API wiring are deferred. Launch story: **18+**, **San Diego**, **Dinner only** (expand later).

Next: continue UI (copy/brand Q-13, Dinner-only surfaces, iOS polish). Gate 3+ and backend stay on hold.

## Website preview and validation

- [Private 11:11 preview](https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site)
- [Website validation results](docs/website-validation.md)
- Website code and development instructions: `website/README.md`.

This is a concept preview. No native iOS app or real dating service is launched.

- [Signup and messaging preview validation](docs/signup-validation.md): latest phone/chat/download checks and production limits.
- [Single-screen landing validation](docs/single-screen-validation.md): compact bottom actions, viewport-fit measurements and modal checks.

- [Minimalist landing validation](docs/minimalist-validation.md): D-013 checks, responsive measurements, limitations and verified private publication.

## iOS-first app · D-014 / D-015 / D-024

`mobile/` is the Expo React Native app. Against local-dev it saves profile/answers after conditions, lists seeded dinners, records interest, and shows matches on Invites. Phone code UI is preview-only (no SMS). Production OIDC/verification still required before real users.

- Run: [mobile/README.md](mobile/README.md) and [backend/README.md](backend/README.md) (`./scripts/local-dev.sh` then `cd mobile && npx expo start --ios`).
- Verification: [mobile UI validation](docs/mobile-ui-validation.md).

## Backend · D-016 / D-024

`backend/` is the Spring Boot API. Default JAR stays fail-closed. With `SPRING_PROFILES_ACTIVE=local-dev`, H2 file DB + seeded San Diego dinners + loopback JWT + single-sim complementary matching are enabled. Docs: [backend/README.md](backend/README.md).
