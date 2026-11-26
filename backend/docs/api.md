# API v1 contract

JSON only. Private paths require a validated bearer token. All `/api/v1/me/` responses explicitly set `Cache-Control: no-store`, including profile, answers, readiness, interests, dates, mutations and errors. PUT/POST/PATCH API bodies are capped at 32 KiB; 413 `REQUEST_TOO_LARGE` applies even without Content-Length. Non-identity Content-Encoding is rejected with 415. These are synchronous application limits, not request-rate or proxy enforcement. Request bodies reject unknown fields, preventing client-supplied ownership or verification flags. Errors use `{ "code": "..." }` for domain failures; Spring Security's unauthenticated response may have an empty body. Validation 400; unauthorized 401; inaccessible resources 404; profile/idempotency/closed-state conflicts 409; stale answer preconditions 412; missing answer preconditions 428. No account ID is accepted for a `/me` action.

| Method/path | Request | Result |
|---|---|---|
| GET `/health` | none | up, FOUNDATION_NO_PAIRING |
| GET `/api/v1/questionnaire` | none | catalog compatibility version, revision, definitions, stable option IDs and current labels |
| GET `/api/v1/events` | none | up to 100 upcoming open events ordered by time/id; neighborhood and timezone, never venue |
| GET `/api/v1/me/profile` | bearer | own displayName, DOB, version, identityVerified |
| PUT `/api/v1/me/profile` | displayName, dateOfBirth ISO date or null, expectedVersion | own profile; null expectedVersion creates only, numeric version updates only |
| GET `/api/v1/me/answers` | bearer | `{revision,answers}` snapshot plus strong ETag |
| PUT `/api/v1/me/answers/{questionId}` | If-Match plus version, status, choices, sensitiveConsent | `{revision}` and new ETag; replaces own answer conditionally |
| DELETE `/api/v1/me/answers/{questionId}` | bearer + If-Match | `{revision}` and new ETag; conditional deletion |
| GET `/api/v1/me/interests` | bearer | own event UUIDs |
| PUT `/api/v1/me/interests/{eventId}` | bearer, existing adult profile | INTEREST_RECORDED, bookingConfirmed=false |
| DELETE `/api/v1/me/interests/{eventId}` | bearer | empty 200; idempotent |
| GET `/api/v1/me/readiness` | bearer, profile | canPair=false; unresolved launch readiness |
| GET `/api/v1/me/dates/{arrangementId}` | participant bearer | neighborhood, event time and timezone; nullable venueName, venueAddress, partnerName; no-store |
| PUT `/api/v1/me/dates/{arrangementId}/safety/{BLOCK or REPORT}` | participant bearer | empty 200; other participant resolved internally, repeated submissions deduplicated |

Example answer: `{"version":1,"status":"ANSWERED","choices":["o01","o02"],"sensitiveConsent":false}`. A decline uses `status=DECLINED`, empty choices and false consent. No row means unknown/unanswered. `Prefer not to say` is a label mapped to decline, never a scoreable value. No raw mobile labels accepted by API. Unknown versions, unknown/duplicate choices, exclusive sentinel combinations and missing required sensitive consent are rejected.

The adapter returns reviewable import issues rather than silently transmitting or inferring consent. Map `energy` to its string label, conversations to labels, chemistry to one label, and traits to their existing keys. Do not import phone/code/photo/name/notes into answers. The server accepts decline for every question even if the present UI calls it required; product wording must be reconciled before connecting.

Profile DOB is self-reported and only a preliminary adult check. JWT authentication is separate from age/identity verification. No verification endpoint exists. DOB is not disclosed to other participants. Updates currently invalidate verification conservatively even when only the display name changes.

Before event day: HIDDEN with all three private fields null. On the event's local calendar day: REVEALED only for a safe confirmed two-person arrangement with a confirmed booking and stored venue. Date calculations use the event's IANA timezone. At or after the end, or on subsequent days, private fields are hidden again as a conservative foundation default; post-date retention/disclosure policy is unresolved. Cancellation/block/report/suspension hide private fields. Public event responses never contain a venue or participant name. The service cannot remove information someone already saw; clients must also discard cached disclosure on refresh/logout.

No admin, pair-creation, venue-write, booking-write, profile-browse, search-users, score, messaging or real signup routes are exposed. Internal booking methods require an eventual audited staff facade before use. One scheduled event currently represents capacity for a single 1:1 arrangement; future multiple identical experiences require separate slots, not groups.

## Additive questionnaire revision

`version` remains `onboarding-v1` so existing v1 label-mapping adapters keep working (answer-write preconditions are a separate unreleased contract change). `revision` is now `onboarding-v1.1`, and 85 answer definitions cover all 88 current UI steps (82 traits + 3 base answers + 3 identity steps). Each newly introduced question starts at question version 1. The original 81 definitions retain every ID, label and meaning. New optional metadata is additive; old definitions return null for that previously unspecified field. All server questions still permit explicit decline or no stored answer.

The four optional additions are goodNewsSupport, feelingUnderstood, conflictRepair and goalSupport. They describe desired responses, with PREFERENCE kind, no invented partner-self target, no consent inference and INACTIVE scoring. Each permits one selection; empty ANSWERED is invalid, omission remains unknown, and DECLINED with no choices is accepted. “It depends” and “I am still learning” are literal selections, not opt-out sentinels; they remain unscored. No new opt-out label is invented. The existing ethnicity/pets/music exclusive-sentinel rules are preserved.

The framework-neutral opt-in preview adapter and synthetic actual-HTTP validation are documented in [local integration](local-integration.md). Client calls time out after 10 seconds by default and never auto-retry. Network failures on mutations are uncertain outcomes, not evidence of rejection or successful saving. Profile 409 requires reload/review, and answer batches expose partial acknowledgement rather than atomic-save semantics.

Answer mutations now require the aggregate snapshot precondition: missing If-Match returns 428; stale returns 412 with the current revision and a reload/review instruction. GET answers uses an envelope rather than the former bare map. This unreleased breaking change fails closed for old clients. See [answer concurrency](answers-concurrency.md) for snapshots, strong ETags, durable revisions, partial batches and lost acknowledgements.
