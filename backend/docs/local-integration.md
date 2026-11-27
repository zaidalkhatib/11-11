# Synthetic frontend-contract → backend HTTP integration

Implemented: a framework-neutral adapter, a test-only actual-HTTP harness, and (D-024) an opt-in **local-dev** mobile hookup. Default JAR remains fail-closed. With `SPRING_PROFILES_ACTIVE=local-dev` + `LOCAL_DEV_JWT_SECRET`, Expo can mint a loopback JWT, save profile/answers after conditions, list seeded events, and record interest — never `demoMatched`.

## Current mobile state and mapping

`mobile/App.tsx` holds `Answers` and `DatePlan[]` in React memory. `Answers` includes labels and optional fields, while date plans identify types such as Dinner rather than backend scheduled events. `demoMatched`, `waiting`, `notify`, area/day/time and the UI's saved flag are preview state; none establishes a server match, reservation or persisted save.

`contracts/preview-adapter.ts` exposes pure preparation methods:

- `prepareAnswers(catalog, preview, consentedQuestionIds)` selects energy, conversation labels, chemistry and traits. It ignores phone, photo URI, notes and experience types. Missing/empty values remain omitted, explicit opt-out labels become DECLINED, and sensitive consent must be supplied explicitly. Mapping issues block the batch before any write. Missing answers do not imply deleting an older stored answer.
- `prepareProfile(preview, dateOfBirth, expectedVersion)` extracts only the display name and separately supplied DOB/version. Neither DOB, age, phone verification nor identity is inferred from onboarding completion.
- `selectScheduledEvent(events, explicitEventId)` accepts only a UUID found exactly once in the supplied backend event catalog. A Dinner/type-only plan cannot map automatically. The event's organizer-chosen time, neighborhood and timezone remain authoritative. The server still validates event state.

A compile-only test checks compatibility with the actual current `Answers` type. No React Native/Expo API or new dependency is used.

## Acknowledgement and recovery

`createClient` requires HTTPS by default, an explicitly supplied token accessor and explicit method calls. With `{ allowInsecureLocalhost: true }` it also accepts `http:` only for `127.0.0.1`, `localhost`, or `10.0.2.2`. It rejects credentials/query/fragment in the base URL and makes no network calls on import/construction. Each request has a configurable finite timeout (10 seconds by default) and cancellation signal. There is **no automatic retry**, including no automatic write replay.

`saveProfile` returns acknowledged only after a successful server response. A stale version returns conflict without overwriting newer data; a 401 returns unauthorized. Network/timeout or mutation 5xx outcomes remain unconfirmed. A lost response may already have committed: read the current profile, compare its version and intended values, and let the user review before retrying. A duplicate create may return 409; do not translate that into saved or blindly retry as an update.

`savePreparedAnswers(client, plan, editingSnapshot)` is intentionally non-atomic. It returns acknowledged question IDs and stops at the first failure with remaining IDs and an error outcome. A local pending/failed request is never counted as acknowledged. Resume only after re-reading and reviewing current answers. The server now requires an aggregate answer revision on every save/decline/delete. The batch takes the explicit snapshot the user edited against and advances its token only after acknowledged writes; stale writes return 412, and lost acknowledgements require reload/review. See [answer concurrency](answers-concurrency.md). A skipped answer does not clear existing server data; explicit decline/delete handles removal.

Interest remains interest-only: `INTEREST_RECORDED`, `bookingConfirmed=false`. After an uncertain join, read `/me/interests`; a deliberate retry uses the existing idempotent PUT, not a new reservation. Repeated joins and leaves are tested over real HTTP. Event closure and other API failures must remain failures. A successful interest action must never set the mobile preview's `demoMatched` flag or manufacture an invitation.

## Test isolation and execution

Run from repository root:

```sh
mvn -B -f backend/pom.xml -Dmaven.repo.local=backend/.m2 -Dsynthetic.http=true verify
node mobile/node_modules/typescript/bin/tsc --strict --target ES2022 --module commonjs --lib ES2022,DOM --outDir backend/target/contracts backend/contracts/client.ts backend/contracts/preview-adapter.ts
node mobile/node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --module commonjs --lib ES2022,DOM backend/src/test/ts/mobile-shape.ts
node backend/scripts/test-contract.cjs
```

`SyntheticHttpTest` is enabled only by the explicit JVM property, runs under `synthetic-http-test`, binds to 127.0.0.1 on a random port and uses a dedicated H2 in-memory database. Its decoder refuses initialization outside that profile/property/address/database combination. It accepts only a randomly generated per-process test token and represents a synthetic **unverified** subject. The token is passed to a child Node test process through its environment, never embedded in the app or written to logs. This is a test authentication fixture, not SMS, phone ownership, cryptographic JWT or identity verification.

The Node harness injects a test-source transport that accepts only `https://synthetic.invalid/api/v1/...` and routes it to that one loopback port. Production client HTTPS enforcement and production Spring Security configuration are unchanged. The harness uses constant synthetic data and the pure `emptyAnswers()` factory; it never reads app storage or existing answers. There is no test authentication endpoint or always-allow development profile in main sources. Test Java classes and Node fixtures are absent from the packaged JAR.

The HTTP test compiles the existing TypeScript code into ignored backend output, starts no external service, exercises the real Spring Security filter chain/controllers/SQL, and ends with the test JVM. Default Maven verification leaves this socket-binding test skipped; the explicit full command above includes it. Reports live under `target/surefire-reports/` and `target/http-harness.log`.

Verified: profile create/read/update/version conflict, all four new questions, decline/delete/missing responses, consent rejection and explicit consent, invalid API values, explicit event identity, join/repeat/leave, unauthorized tokens, no-store responses, and database invariants (one interest outbox record despite a lost response and retries; zero bookings and verified profiles). Offline, timeout, partial batch and 503 recovery are injected client transport faults around the real request path; they are not claims of testing actual radio loss or production network behavior.

## Local-dev mobile hookup (D-024)

Authorized for simulator-only wiring. Not production auth, SMS, OIDC, or identity verification.

```sh
# Backend (from repo root)
mvn -f backend/pom.xml -DskipTests package
SPRING_PROFILES_ACTIVE=local-dev \
LOCAL_DEV_JWT_SECRET='replace-with-at-least-32-bytes-secret!!' \
java -jar backend/target/backend-*.jar

# Expo
cd mobile
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 npx expo start
```

Flow: after conditions, `createProfileAndAnswers` mints a loopback JWT via `POST /api/v1/local-dev/session`, then `PUT` profile + answers. Events load from `GET /api/v1/events` (five seeded San Diego dinners). Slide-to-join uses `PUT /me/interests/{id}` and sets local `waiting: true` with `demoMatched: false`. Matching locks a pair only when **two profiles** joined the same dinner **and** reciprocal scoring over their answers produces a real score. After each join the matcher is nudged once. Optional `LOCAL_DEV_AUTO_PARTNER=true` can mint a synthetic partner for solo demos. Invites hydrate from `GET /me/invitations`. Cancel uses `DELETE` interest while still waiting.

Phone code UI is preview-only (no SMS). Still out of scope for production: SecureStore/OIDC, physical-device bind beyond loopback, auto-sync of drafts, CORS for Expo web, OpenTable booking. Gate 3 real verification remains required before collecting real users.

Quick start: `./scripts/local-dev.sh` then `cd mobile && npx expo start --ios`.
