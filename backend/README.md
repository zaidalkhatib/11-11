# 11:11 Java foundation

This is an isolated, runnable backend foundation. The Expo UI and simulator are unchanged and do not send data here. Use synthetic fixtures only. There is no account verification provider, real pairing, booking provider, notification sender or production launch.

Java 21 source/bytecode target, Spring Boot 4.1.2, Maven, Spring Security, JDBC and Flyway. Verified here with JDK 27.0.1 and Maven 3.8.8. Spring's [system requirements](https://docs.spring.io/spring-boot/system-requirements.html) list Java 17–27 and Maven 3.6.3+ for this release. Java 21 LTS is the deployment target; runtime testing on JDK 21 remains a CI gate.

## Run and verify

From the repository root:

```sh
mvn -B -f backend/pom.xml -Dmaven.repo.local=backend/.m2 verify
cd backend
java -jar target/backend-0.1.0-SNAPSHOT.jar
```

The service binds **127.0.0.1:8080**. An empty local H2 file database lives in `backend/data/`; Flyway applies migrations. No event or personal-data seed is installed. `/health`, `/api/v1/questionnaire` and `/api/v1/events` are public GETs. Every private route fails closed without authentication configuration. There is no fake SMS code, development user header, password fallback or runtime mock-auth profile.

For approved future identity integration, set `AUTH_ISSUER` to a trusted HTTPS OIDC issuer and `AUTH_AUDIENCE` to the API audience. JWT signature, issuer, audience and time claims are checked; account ownership derives from issuer plus subject, never request body IDs. A valid token is **not** identity/age/phone verification: profiles remain unverified, and clients cannot set verification. Test-only authentication helpers are under `src/test/` and absent from the executable JAR. Do not connect Expo or collect real data before the launch gates in [architecture](docs/architecture.md).

For PostgreSQL, set `DATABASE_URL=jdbc:postgresql://...`, `DATABASE_USER` and `DATABASE_PASSWORD`; use an isolated approved database. The PostgreSQL driver and Flyway module are included. H2 tests are not PostgreSQL verification. No database server, Docker daemon, external account or provider has been started by this work.

## Implemented slice

- Explicit `Cache-Control: no-store` for all personal routes, including errors. A 32 KiB synchronous JSON input limit rejects oversized bodies with 413 and unsupported compression with 415; no rate limiter is implemented.
- Own-profile create/update/read with optimistic version checking, 18+ DOB validation and server-owned verification state.
- Conditional questionnaire edits use a server-owned aggregate revision and strong ETag/If-Match; concurrent stale writes, declines and deletes fail closed. See [answer concurrency](docs/answers-concurrency.md).
- 85 versioned answer definitions matching the 82 current personality questions plus energy, conversations and chemistry. Three UI name/phone/code steps are not personality answers. Compatibility version `onboarding-v1`, additive revision `onboarding-v1.1` (original snapshot unchanged). Four new optional questions stay INACTIVE. Stable question and option IDs, explicit label import, choice validation, exclusive sentinels, decline/delete and consent handling. Appearance and socioeconomic ranking inputs are disabled for collection/scoring.
- Public scheduled experience summaries and idempotent, transactional event-interest joins/leaves. Interest records are not seats, matches or confirmed reservations.
- Pure reciprocal matching evaluation plus an internal database adapter. Current exploratory-v3 treats tentative energy openness as unscored and assesses declared relationship intention/structure separately before soft-fit scores. PASS covers only implemented gates; full relationship readiness remains unestablished. See the [coverage audit](docs/matching-coverage.md). PASS/FAIL/NEEDS_INFO gates precede soft scores. No endpoint exposes other users or scores and no code creates pairs automatically.
- Internal manual booking state transitions, concurrency/version guards, idempotency keys, required confirmation reference and durable transactional outbox records. No dispatch occurs.
- Participant-owned date disclosure: neighborhood/date/time beforehand; only venue/address and partner display name on the event's local day, before the end. Other profile data is never returned. Requires two participants, confirmed arrangement and booking, and no block/report/suspension. No-store response. Production arrangement creation and staff authorization remain unimplemented.
- Owned-arrangement block/report endpoints suppress disclosure and internal matching. These are exclusions, not a staffed incident response system.

User clarification: **do not ask for personal location or availability during onboarding**. 11:11 chooses venue/date/time; participants opt into that event. No personal location/radius/availability gate is added. Only the neighborhood is public before the day. No match information beyond the partner's name is revealed, even on the day.

The [synthetic HTTP integration](docs/local-integration.md) exercises the typed adapter against a test-only loopback server. Run `mvn -B -f backend/pom.xml -Dmaven.repo.local=backend/.m2 -Dsynthetic.http=true verify` to include it; ordinary verification skips that opt-in socket test.

See [API contract](docs/api.md), [matching policy](docs/matching.md), [architecture and launch gaps](docs/architecture.md), and [validation evidence](docs/validation.md). `contracts/client.ts` is an opt-in typed client and pure preview-label adapter; it is not imported by the mobile app.
