# Architecture, scale and launch gaps

The latest Java backend instruction supersedes historical UI-only exclusions for this **local foundation**. Earlier project documents remain historical and are not rewritten. It does not authorize production launch, accounts with paid vendors, messages, bookings, publishing or pushing. No existing frontend file is changed by this backend implementation.

## Boundaries

One modular Spring Boot process: identity/security, questionnaire, own-profile/interest API, pure matching and internal operations/disclosure. SQL is centralized in small services with explicit transaction boundaries. This avoids premature microservices while allowing later extraction at measured boundaries. Java 21 target; Spring Boot dependency management; PostgreSQL production direction and local H2 convenience.

Authentication is default-deny without a trusted issuer. No caller controls an owner ID. Identity keys hash issuer+subject; hashing is an internal pseudonym, not anonymization. Private fields stay server-side; the security header writer explicitly sends no-store for every personal route, including error responses, and date disclosure also sets it. Venue data uses a separate table and a narrowly typed projection. Configured JWT access alone never marks identity verified. No real personal data has been collected during development.

The public event contains neighborhood, city, organizer-chosen start/end and IANA timezone. Venue and address are private. Event opt-in replaces onboarding location/availability. Exact location and only the partner's name become readable on the event day, with ownership and safety checks. There are no automated pushes announcing the reveal. Current arrangement creation is deliberately absent; integration tests create synthetic fixtures directly.

## Consistency

Profile updates compare an expected version; simultaneous creates are protected by a primary key (loser gets 409). Answer save/decline/delete and snapshot reads lock the owner row. Migration V3 adds a durable aggregate answer revision; mutations require a matching snapshot token and atomically advance it. Stale commands return 412, missing preconditions 428. Deletes cannot reset the token. See [answer concurrency](answers-concurrency.md). Interest joins lock the profile and event rows, then rely on `(owner_id,event_id)` uniqueness; retries create no duplicates. Event-close operations must take the same event lock. Joining remains interest-only, without claims about capacity or verification.

One booking request per scheduled 1:1 event, protected by an event lock and unique constraint. Internal states: REQUESTED → HOLD_PENDING → HELD → CONFIRMED, with cancellation from noncancelled states. Confirmation requires a nonblank reference; this validates presence, **not authenticity**. Staff must obtain and audit a genuine reference externally before future live use. Each command has a scoped UUID key, request fingerprint and stored result version. Same key/same payload returns its first result; changed payload or stale version conflicts. Transaction rollback prevents partial transition/outbox writes.

Arrangements have at most two unique participant seats and one arrangement/event. Composite foreign keys prevent mismatched event references. Uniqueness prevents one person joining multiple arrangements for the same event. The missing production allocation transaction must additionally enforce exactly two participants, current eligibility/consent, no overlapping commitments, and cancellation/rebooking policy. There is no automatic pair creation, so this is not advertised as implemented pair-allocation concurrency protection.

Safety exclusions are any-direction and persisted. The date reader locks participant profile rows in deterministic order while checking safety; block/report writes lock the reporter. A future cancellation/suspension writer must participate in the same lock protocol. Disclosure cannot retract already viewed information. Default post-event hiding is conservative and needs a product retention decision.

## Venue integrations and outbox

Provider-neutral booking requests currently use MANUAL; there is no assumed venue API access. An eventual provider adapter should expose request-hold/confirm/cancel and a capability map; manual operator action is a valid adapter. Add hold expiry, reconciliation, audited actor IDs, confirmation evidence, external request IDs, timeouts and compensation for uncertain remote outcomes. Never mark a timeout as confirmed. Never retry a non-idempotent remote operation without status reconciliation. No external booking was made.

Outbox records are written transactionally for newly recorded interest and booking transitions. No worker sends them. Proposed worker: bounded batch `FOR UPDATE SKIP LOCKED` or lease claims, provider idempotency key derived from outbox ID, exponential backoff+jitter, attempt cap/dead-letter quarantine, redacted operational alerts, manual replay and provider reconciliation. Delivery is at least once; consumers must deduplicate. Add typed minimal payload and privacy review before notification use. Available/attempt/delivered columns are a foundation, not proof of retry/delivery implementation.

## Scale and operations roadmap

Start with a single regional PostgreSQL primary and a small stateless service fleet behind TLS/rate limiting. The local default loopback binding should only change in a reviewed deployment configuration. Use managed secrets, separate environments, least-privilege roles, a separate migration principal, connection-pool limits and migration rollout coordination. Mobile clients can lag: add fields compatibly, keep old question definitions, explicitly deprecate APIs and require reconsent for changed meaning.

Index measured queries: owner answers/interest keys and safety reverse lookup are present; add start-time and geography indexes with actual query plans and pagination before a large event catalog. Candidate generation should batch by selected event and hard eligibility before expensive evaluation, not compare everyone globally. Use snapshot/version stamps and recheck safety/eligibility inside the eventual commit transaction. Persist policy/version audit metadata for reproducibility without copying private profiles into logs.

Add structured request IDs, endpoint latency/error metrics, pool saturation, migration status, outbox age/retries and eligibility reason counts with minimum cohort sizes. Do not log bearer tokens, names, DOB, answer values, venue addresses or partner data. No telemetry backend is configured. Performance/load tests, SLOs, on-call ownership and alerts remain to be established. Add read replicas/cache only for demonstrated public/read workloads; never cache private reveal responses at a CDN.

Backups: encrypted PostgreSQL snapshots plus WAL/PITR, distinct backup credentials, retention approved by privacy policy, recurring isolated restore drills with measured RPO/RTO, and deletion propagation/tombstone handling. H2 files are for local synthetic development only. No backup or restore has been exercised. Restore testing is a launch gate, not a documentation checkbox.

## Production blockers

1. Approved geographic/service policy, capacity, consent, terms/privacy, data minimization, retention, export/account deletion and support ownership. Per-answer deletion exists; complete account erasure, audit retention and consent revision history do not.
2. Real identity/age/phone verification, recovery, session revocation and abuse/rate controls, trusted staff roles/audit trails and a security review. Test mock principals prove ownership tests, not real provider verification.
3. Revised essential questionnaire facts and explicit dealbreakers; calibrated research and user review of scoring. No chemistry prediction claim or appearance ranking.
4. Event/venue operations UI/API, reviewed staff authorization, timezone validation, factual venue/reference verification and reveal policy acceptance. Current data is only synthetic tests; no booking/reveal workflow is production-certified.
5. Transactional pair allocation, two-party acceptance/cancellation, waitlist selection, overlaps, hold expiry/rebooking, no-shows, emergencies and safe failure handling. These are not implemented.
6. Staffed safety reporting/triage, appeal/remediation, fraud controls and incident response. A report row/exclusion alone is insufficient.
7. PostgreSQL migration/concurrency tests, JDK 21 CI, load tests, dependency/security scanning, TLS/proxy configuration, observability, deployment rollback and backup restore exercises.
8. Mobile secure token storage and consent screens, explicit integration approval, offline/retry behavior and physical-device/accessibility testing. The current phone/code flow stays an honest UI demo.

No deployment, publishing, push, simulator restart, provider account, production signup or external communication is part of this delivery.

## Bounded HTTP hardening

Authenticated JSON mutation inputs are limited to 32 KiB in a security-chain filter after authorization, reading at most limit+1 bytes even when Content-Length is absent. Declared oversize requests are rejected before body buffering, and compressed inputs are unsupported. Unit tests cover exact boundaries and unknown lengths; integration tests verify 413 before profile mutation and no-store across personal responses/errors. This is a synchronous Spring MVC foundation, not asynchronous streaming support.

Rate limiting remains **unimplemented**: production needs reviewed per-subject and pre-auth abuse limits, a trusted ingress/IP policy, shared counters or gateway enforcement across instances, and bounded retries with appropriate 429/Retry-After behavior. No ad-hoc in-process map is presented as distributed protection. Request/header/connection timeouts, concurrency limits, slow-client defenses and ingress maximum body sizes must also be configured and tested before deployment.
