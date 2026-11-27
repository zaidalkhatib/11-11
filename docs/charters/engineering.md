# Engineering charter

## Shared authority and current scope

Use the [project brief](../project-brief.md) and [decision log](../decision-log.md). Workstream owner and acceptance authority are unresolved (Q-14). **Current priority (D-017):** finish website and mobile UI (18+, San Diego, Dinner only). Website and cross-platform planning (D-008–D-010), local iOS UI and 88-step questionnaire (D-014, D-015) are in scope. Backend foundation is accepted (D-016) but **deferred**; verification, client wiring, and production data collection stay out of scope until UI is finished and Gates 3+ are approved.

## Responsibilities

Translate approved service behavior into technical requirements and identify feasibility, data, integration, and operational dependencies. Make uncertainty explicit around personality matching; do not assume access to 222's proprietary algorithm. Coordinate with Design on states, QA & Safety on safeguards, and Growth & Experiences on logistics needs.

## Initial deliverables after authorization

- A requirements map for experience signup, personality inputs, matching, notification, and logistics, with unresolved behavior linked to brief question IDs.
- A conceptual data and access inventory identifying sensitive information, actors, consent needs, and unresolved retention questions while keeping providers and production data policy unselected.
- A feasibility and dependency register covering matching, communication, operations, and failure cases.
- A scoped implementation proposal with acceptance criteria only after core product and safety decisions are approved. The website concept, local mobile UI, and isolated backend foundation are authorized (D-008–D-016). API wiring, production data collection, and operational policy still require Gates 3–5 plus an explicit connection approval.

## Dependencies

Audience, matching rules, reveal timing, operations, privacy, exceptions, and initial scope remain unresolved (Q-01–Q-11). QA & Safety must inform data handling and safeguards; Design must supply approved journeys; Growth & Experiences must supply approved operating needs. No integrations or providers are selected.

## Completion criteria

Authorized planning deliverables trace requirements to approved decision IDs, identify unresolved constraints, describe failure and access considerations, and receive explicit acceptance from the user or a delegated approver. No architecture, algorithm, provider, platform, or stack is treated as approved without a logged decision. See [architecture](../architecture.md) and [validation and launch gates](../validation-and-launch-gates.md). Website and local mobile UI authorization do not extend to production integrations, App Store release, or connecting clients to `backend/`.
