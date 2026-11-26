# Validation evidence — 2026-11-15

Final working tree: new `backend/` only. Existing files were untracked on arrival and were preserved; no commits, pushes, deployment, external messages, production data or bookings. The mobile UI and simulator were not edited or restarted by this backend work.

| Check | Result | Evidence |
|---|---|---|
| `mvn -B -f backend/pom.xml -Dmaven.repo.local=backend/.m2 -Dsynthetic.http=true verify` | **PASS** | 43 tests, 0 failures/errors/skips; executable JAR built |
| Matching unit suite | **PASS** | 16 tests: reciprocal symmetry, missing/declined/version semantics, sparse evidence, age/identity/interest/safety gates, missing smoking facts, consented faith, excluded/new inputs and event opt-in |
| Integrated SQL/API suite | **PASS** | 20 tests: explicit no-store and input-size rejection, new optional answer persistence, migrations, ownership, unknown fields, consent/validation/deletion, profile versions/age, concurrent interest and outbox uniqueness, concurrent idempotent booking transitions, reference requirements, timed/private disclosure, missing/invalid timezone, safety/cancellation, persisted matching inputs and launch readiness |
| Catalog evolution and input-limit unit suites | **PASS** | 5 tests: frozen original SHA-256, additive IDs, every new choice/decline/invalid values, sentinel exclusivity; exact 32 KiB boundary, absent Content-Length and compression rejection |
| Default-deny security suite | **PASS** | 1 test: no issuer accepts neither fake bearer nor identity header; public health works |
| Actual synthetic HTTP integration | **PASS** | 1 Java integration test orchestrates 65 Node checks and 49 real loopback requests; isolated test authentication, no verified identities or bookings |
| TypeScript strict compile | **PASS** | command below; adapter is not imported by Expo |
| Contract behavior | **PASS** | 763 checks covering all 88 UI steps and every option: stable mapping, decline, unknown/duplicate/sentinel values, consent, excluded collection, HTTPS and no automatic I/O |
| Packaged application smoke | **PASS** | final JAR, empty H2 memory DB, localhost: health 200, questionnaire 85 definitions, additive revision v1.1, events empty, private profile 401; process stopped afterward |
| PostgreSQL migrations/concurrency | **NOT RUN / environment blocked** | no `psql`; Docker CLI exists but daemon unavailable; no remote DB was provisioned |
| Java 21 runtime | **NOT RUN** | compiled with `--release 21` and tested on installed Java 27.0.1; JDK21 runtime remains CI gate |
| Real OIDC/phone/age verification | **NOT RUN / not integrated** | signed-token verification delegates to Spring Security; HTTP ownership tests use test-only principals. No live issuer configured |
| External booking/outbox delivery | **NOT RUN / not implemented** | no provider or worker; synthetic internal transitions only |
| Production reveal operations | **NOT RUN** | deterministic service/API tests only; no staff flow, live arrangements, actual venues or timezone rollout verification |
| Load/security scanning/backup restore/mobile end-to-end | **NOT RUN** | follow-up launch gates; frontend untouched |

Reproduce contract checks from repository root:

```sh
node mobile/node_modules/typescript/bin/tsc --strict --target ES2022 --module commonjs --lib ES2022,DOM --outDir backend/target/contracts backend/contracts/client.ts backend/contracts/preview-adapter.ts
node mobile/node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --module commonjs --lib ES2022,DOM backend/src/test/ts/mobile-shape.ts
node mobile/node_modules/typescript/bin/tsc --strict --target ES2022 --module commonjs --lib ES2022,DOM --outDir backend/target/ui-fixture mobile/src/onboarding.ts
node backend/scripts/test-contract.cjs
python3 backend/scripts/smoke.py
```

The contract compile reuses the existing frontend's installed TypeScript compiler without changing its files or package dependencies. The smoke script starts and stops only its own backend process on port 18081 and uses an ephemeral in-memory database. It needs permission to bind/connect to loopback under a restricted sandbox.

Build/dependency evidence: Maven 3.8.8, OpenJDK 27.0.1.0.3, Spring Boot 4.1.2, Spring Framework 7.0.10, Tomcat 11.0.27, H2 2.4.240. Three Flyway migrations applied successfully in H2 PostgreSQL mode. Flyway warns that its verified H2 version is 2.3.232; passing local tests does not establish PostgreSQL compatibility. Maven/Java emit forward-compatibility warnings from tooling/reflection; no build or test failure remains. Production dependency scanning is still required.

Initial restricted-network Maven downloads and loopback binding were blocked by the execution sandbox, then completed through approved scoped execution. These are resolved environment restrictions, not unresolved build failures. The first reciprocal-symmetry test exposed a last-bit floating-point difference; the result is now deterministically rounded to six decimals with sorted domain traversal, and the exact-symmetry test passes.

JUnit XML/text reports are generated under `backend/target/surefire-reports/`; executable artifact is `backend/target/backend-0.1.0-SNAPSHOT.jar`. Build outputs, local Maven cache and local data are ignored by backend's `.gitignore`. `backend/target/smoke.log` records the final packaged startup/shutdown. No runtime mock-auth fixture is packaged.

Hardening pass: original catalog SHA-256 remains `66e656d8f01e347969575d053e17f54064f6a230bbb8c53b928759332989a34e`. Four new UI questions are appended in a separate resource with no new scoring rules. Contract verification compiles the actual current onboarding module into ignored backend test output and checks all 85 answer mappings; name/phone/code remain the three excluded identity steps. No UI source or simulator changes were made. Request rate limiting and production ingress enforcement remain deferred, not tested or claimed.

Local HTTP integration pass: the full opt-in Maven run passed 43 tests with zero failures/errors/skips. Default Maven runs intentionally skip the real-socket test. Strict compilation includes the framework-neutral preview adapter and a compile-only check against current mobile Answers. Existing 763 catalog/contract checks also pass. The HTTP harness reports 65 checks and 49 actual loopback requests; some fault cases deliberately inject offline/timeout/503/lost-response transport errors. Production authentication main sources were unchanged by this pass, and test fixtures are excluded from the executable JAR. No mobile source was edited, so native lint/build/simulator checks were not rerun. See `local-integration.md` for implemented versus planned wiring and exact reproduction commands.

Answer revision pass: new V3 migration only; original V1/V2 migrations and questionnaire definitions are unchanged. Six added SQL/API tests cover same-version concurrent writers (one success/one 412), stale decline/delete, ABA after delete/recreate, owner isolation, no-op-delete advancement, transactional rollback, snapshot consistency during an uncommitted writer, required If-Match and ETag freshness. The synthetic HTTP harness now checks stale answer/batch conflicts and an answer write whose response was lost after commit; the adapter retains its last acknowledged revision and requires reload. Final verification: 36 Java tests, 763 contract checks, strict TypeScript/shape compilation, and 65 HTTP/adapter checks over 49 actual loopback requests. Production PostgreSQL concurrency verification remains unrun; no mobile changes or real data.

Matching semantics pass: exploratory-v3 replaces the retired v1/v2 runtime labels. Seven added matching tests cover all 25 self/partner energy combinations with tentative openness, no inferred bonus/penalty, directional coverage and symmetry; all 25 combinations for each relationship-intention and structure matrix; unknown/declined/unsupported facts; and separation of implemented-gate PASS from relationship/production readiness. Existing null-evidence tests remain. Final full run: 43 Java tests, 763 contract checks, strict TypeScript checks and 65 HTTP/adapter checks over 49 loopback requests. No new weights, questionnaire/UI changes or sensitive-response disclosure. The matching-coverage audit documents remaining catch-all-label and unmodeled-constraint limitations.
