# Engineering charter

## Shared authority and current scope

Use the [project brief](../project-brief.md) and [decision log](../decision-log.md). Workstream owner and acceptance authority are unresolved (Q-14). Website implementation and cross-platform architecture planning are authorized (D-008–D-010). Mobile, backend service, and production data collection remain out of scope.

## Responsibilities

Translate approved service behavior into technical requirements and identify feasibility, data, integration, and operational dependencies. Make uncertainty explicit around personality matching; do not assume access to 222's proprietary algorithm. Coordinate with Design on states, QA & Safety on safeguards, and Growth & Experiences on logistics needs.

## Initial deliverables after authorization

- A requirements map for experience signup, personality inputs, matching, notification, and logistics, with unresolved behavior linked to brief question IDs.
- A conceptual data and access inventory identifying sensitive information, actors, consent needs, and unresolved retention questions while keeping providers and production data policy unselected.
- A feasibility and dependency register covering matching, communication, operations, and failure cases.
- A scoped implementation proposal with acceptance criteria only after core product and safety decisions are approved. The website concept is already authorized. Mobile/backend implementation requires further scope and authorization; architecture recommendations do not approve operational policy.

## Dependencies

Audience, matching rules, reveal timing, operations, privacy, exceptions, and initial scope remain unresolved (Q-01–Q-11). QA & Safety must inform data handling and safeguards; Design must supply approved journeys; Growth & Experiences must supply approved operating needs. No integrations or providers are selected.

## Completion criteria

Authorized planning deliverables trace requirements to approved decision IDs, identify unresolved constraints, describe failure and access considerations, and receive explicit acceptance from the user or a delegated approver. No architecture, algorithm, provider, platform, or stack is treated as approved without a logged decision. See [architecture](../architecture.md) and [validation and launch gates](../validation-and-launch-gates.md). Website implementation authorization does not extend to production integrations or a mobile build.
