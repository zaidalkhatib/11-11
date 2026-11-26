# 11:11

11:11 arranges personality-based, 1:1 blind dates around experiences. This repository holds shared project planning, the website concept in `website/`, and the authorized iOS-first UI prototype in `mobile/`.

## Shared documents

- [Project brief](docs/project-brief.md): confirmed requirements, constraints, and open questions; the common reference for every workstream.
- [Decision log](docs/decision-log.md): approved decisions, proposals, and the approval process.
- [Architecture](docs/architecture.md): website implementation direction, shared foundations, and the recommended iOS-first path.
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

Updated 2026-11-08: the user authorized building the website first after inspecting the live [222 reference](https://222.place/), using a related premium style with different color and animation, and planning a scalable cross-platform app with iOS first after the website (D-008–D-010). The live-reference instruction replaces the earlier screenshot prerequisite.

The current website is a concept preview, not a working dating service or account system. The later signup addition (D-011) introduces a primary **Sign up** action with a phone-entry and Messages-inspired local chat demo, plus **Download our app** opening an iOS coming-soon concept. A sample number is available. Phone input and chat messages remain in React memory, are not submitted, and clear when signup closes or the page reloads. No App Store or TestFlight download exists yet. No production personal-data collection, real account or matching implementation, payments, reservations, outreach, or commercial promises are approved. D-014 separately authorizes the local-only mobile UI prototype. Public launch and any new external service commitments remain separate gates. The technical stack described in the architecture is an implementation recommendation, not a user-selected vendor commitment.

The latest requested revision (D-013) uses a minimalist purpose sentence, a compact changing experience pill and the original Dinner/adventure/creative bar. It removes the footer, idea panel and visible play/pause control; how-it-works is informational only. Automatic selection respects reduced motion and pauses while a dialog is open. TypeScript, lint, 10 tests, production build and responsive browser checks passed. The revision was privately published on 2026-11-08.

Review the preview and the validation record, then resolve the relevant product and operational questions before a real signup or service launch. The original organization-only phase is preserved in the decision log.

Initial inspection on 2026-10-24 found only `.git/` metadata and no pre-existing project documents or app files. Existing Git metadata was preserved.

## Website preview and validation

- [Private 11:11 preview](https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site)
- [Website validation results](docs/website-validation.md)
- Website code and development instructions: `website/README.md`.

This is a concept preview. No native iOS app or real dating service is launched.

- [Signup and messaging preview validation](docs/signup-validation.md): latest phone/chat/download checks and production limits.
- [Single-screen landing validation](docs/single-screen-validation.md): compact bottom actions, viewport-fit measurements and modal checks.

- [Minimalist landing validation](docs/minimalist-validation.md): D-013 checks, responsive measurements, limitations and verified private publication.

## iOS-first app UI · D-014

The user next authorized UI-first app iteration without backend work. `mobile/` now contains an Expo React Native prototype: four staged-reading intro pages, six required personality questions, editable review, and a gated local demo home. It uses the website’s original aubergine/copper/cream tokens without changing the existing website. No account, real match, event availability or booking is created.

- Run instructions: [mobile/README.md](mobile/README.md).
- Verification and remaining native-device limits: [mobile UI validation](docs/mobile-ui-validation.md).
- Local browser preview for the current Mac session: http://127.0.0.1:8084.
