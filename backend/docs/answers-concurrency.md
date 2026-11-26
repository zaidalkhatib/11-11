# Conditional questionnaire edits

This is an intentional **unreleased API contract change**. No deployed clients exist. Existing clients without an answer precondition now fail closed; do not bypass the requirement to retain old write behavior. Question/option identifiers, questionnaire versions, consent and scoring are unchanged.

## Server contract

`GET /api/v1/me/answers` returns a consistent snapshot:

```json
{"revision":"7","answers":{"music":{"version":1,"status":"ANSWERED","choices":["o01"],"sensitiveConsent":false}}}
```

The response includes `ETag: "answers-7"` and `Cache-Control: no-store`. Revisions are decimal **strings**, avoiding JavaScript integer precision limits. The revision is an opaque concurrency token, not the question definition version or profile edit version.

Every PUT (including DECLINED) and DELETE at `/api/v1/me/answers/{questionId}` requires the strong header `If-Match: "answers-7"` obtained from the editing snapshot. A successful command returns `{"revision":"8"}` plus the new ETag. A valid no-op DELETE and an identical PUT also advance the revision: each acknowledged command consumes its token. Retrying the old token returns conflict, not fabricated success.

- Missing header: **428**, `ANSWER_PRECONDITION_REQUIRED`. Read the answers and review the intended edit.
- Weak/wildcard/malformed/negative/out-of-range precondition: **400**, `INVALID_ANSWER_PRECONDITION`. Only one exact strong token is accepted.
- Stale token: **412**, `ANSWERS_CHANGED_RELOAD_AND_REVIEW`, with `currentRevision`, `action: RELOAD_AND_REVIEW`, and current ETag. The conflict response contains no other user's data. Its revision is a diagnostic hint, not authorization to replay the old edit.
- Consent/value/version validation failure: **400**, no mutation or revision advancement.
- Unknown/deleted profile: **404**. Authentication and ownership remain derived from the validated issuer/subject.

The expected revision is compared against server state; the client never allocates a revision or supplies an owner. All DTOs still reject unknown fields. A guessed or borrowed token cannot change ownership.

## Persistence and consistency

New migration **V3** adds `profile.answers_revision`, a nonnegative BIGINT with initial value 0. V1 and V2 are unchanged. Existing answers adopt the aggregate baseline revision 0. The existing answer primary key `(owner_id,question_id)` still prevents duplicate rows.

The server locks the owner's profile, verifies the expected revision, performs a guarded increment and mutates/deletes the answer inside one SQL transaction. Validation precedes mutation. A database failure rolls back both. The revision remains on the profile when individual answers are deleted, so delete/recreate cannot return to an earlier token (ABA prevention). Exhaustion fails rather than wrapping.

Snapshot reads hold the same owner-row lock while reading revision and answer rows. They cannot pair a new revision with old answers or vice versa. Owners have independent revision sequences. Profile edits use their separate existing optimistic version and do not reset the answer revision.

This conservative aggregate design deliberately conflicts even when two devices edit different questions. It trades some parallelism for clear consistency across the small questionnaire. Reads/writes for one owner serialize; different owners remain independent. PostgreSQL verification remains a production gate: tests currently prove this on H2 in PostgreSQL mode.

No account deletion/recreation endpoint exists. A future account-erasure/recreation flow must retain an appropriate revision generation/tombstone or introduce a new opaque generation token, rather than reset an existing identity's revision while stale clients can write. Database roles must prohibit bypassing service mutation paths. Future deployments must not run old unconditional answer writers alongside this version; coordinate the schema/API cutover and disable old writers before enabling clients. No production rollout occurred.

## Client and adapter behavior

The typed client now returns `AnswersSnapshot` from `answers()` and requires a revision for `saveAnswer(id,answer,revision)` and `deleteAnswer(id,revision)`. It validates the token format locally and sends If-Match. It never fetches a new revision implicitly to force a failed write through.

`savePreparedAnswers(client, plan, editingSnapshot)` requires the explicit snapshot the user edited against. Read that snapshot **before editing**, not just before submitting an old draft. The method advances `lastAcknowledgedRevision` only after a successful response, and exposes acknowledged IDs. A partial batch stops at the first error; `requiresReload=true` means no blind replay. Other devices can cause a conflict between batch entries, leaving a real partially acknowledged result; the operation is not advertised as atomic.

A lost acknowledgement may have committed. The client retains its last acknowledged token and returns unconfirmed/incomplete; reusing that stale token will be rejected. Re-read the complete snapshot, compare intended values, and let the user review/rebase. Do not copy `currentRevision` from a 412 into an old request or automatically retry. Matching values alone do not prove which command committed, especially if another device subsequently edited them.

Missing/declined/deleted remain distinct: omission does not alter a persisted answer; explicit decline stores DECLINED; explicit DELETE removes it while advancing the aggregate revision. No automatic synchronization or upload of preview state was added.

## Verification

SQL/API tests cover simultaneous writers with the same version, stale decline/delete, delete/recreate, absent-answer deletes, owner isolation, database rollback, snapshots blocking until commit, fresh ETags, missing/malformed headers and actionable 412 responses. Actual synthetic HTTP checks exercise stale writes and batch conflicts, including an answer response lost after commit. Typed contract checks cover required token handling and save/delete header propagation. Production authentication, the mobile UI and simulator are unchanged.
