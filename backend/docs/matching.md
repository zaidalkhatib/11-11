# Matching policy and questionnaire evolution

The algorithm is an **internal exploratory fit calculation**, not a chemistry predictor or ranking of people. `MatchingEngine` is pure with an injected clock, explicit `Policy`, deterministic rule order and a six-decimal score. `MatchingPreviewService` loads private owner data internally and never returns it through HTTP. There is no pair allocator or automatic booking trigger. Current UI users cannot become match-ready: verified identity/age and launch policy are absent.

## Separate facts, preferences and importance

The frozen `questionnaire-v1.json` preserves the original 81 answer definitions, with SELF/PREFERENCE/IMPORTANCE, target, consent and INACTIVE/EXCLUDED metadata. Option IDs `o01` etc. are immutable identifiers **within the frozen question version**, not ordinal scores. Renaming labels does not change IDs. The one-time importer refuses to overwrite the snapshot; never rerun it to silently reinterpret a released version.

An additive `questionnaire-v1.1-additions.json` supplies four optional PREFERENCE definitions. The public compatibility version remains `onboarding-v1` and the explicit revision is `onboarding-v1.1`. Catalog loading rejects duplicate IDs, duplicate option IDs/labels and active scoring in additions; it cannot overwrite an old definition. Each new ID uses question version 1. A frozen-file SHA-256 regression test protects every original ID and meaning.

Only explicitly implemented policy rules activate scoring. Adding a catalog question does not change scores. Future versions need a new definition snapshot, explicit accepted-version registry and migration/reconsent handling; do not change option meanings in v1. The database records the submitted question version. This foundation accepts only v1; it does not yet retain answer revision history or evaluate mixed historical versions. Add append-only provenance/audit under a defined retention policy before live scoring.

Examples that must remain distinct:

- Gender is self description; interestedIn is explicit dating interest. Orientation labels never imply interest. Exploring/declined/unknown interest is unknown, not everyone.
- Values describes desired traits, not evidence of one's own kindness/reliability.
- SmokingFit and drinkingFit describe preferences; the UI has no own-use facts. A smoke-free/alcohol-free boundary requires the partner's known self fact and otherwise returns NEEDS_INFO. No preference-to-preference comparison substitutes for that fact.
- Children mixes existing parenthood and future desire. “Same future” triggers NEEDS_INFO until normalized family plans exist. It is not compared by label equality.
- ReproductiveValues is importance, not stance. PoliticalFit is preference/importance, not a political identity. Both remain unscored.
- SharedFaith essential is an explicit boundary only with consented faith facts and preference. Missing/declined/“another belief” facts require clarification; known disagreement fails. SharedBackground important is **not** a declared dealbreaker and ethnicity never affects default fit.
- SelfRating, bodyBuild, height, looksImportance and childhoodResources are excluded, with answered collection disabled. No desirability, socioeconomic, or appearance ranking exists.
- DistanceFit cannot establish location or travel ability. User clarification supersedes personal location/availability collection: the organizer sets an event and users opt in. No inference from distanceFit.

The future normalized model should separate `selfAttribute`, `partnerPreference`, `importance`, and an explicitly chosen `dealbreaker` boolean plus consent provenance. Current importance language must not be silently converted into a hard gate. Relationship structure, family plans and lifestyle hard boundaries need a reviewed richer schema before production pairing.

## Gates and fit

Eligibility is PASS, FAIL or NEEDS_INFO **for implemented gates only**. PASS is not a conclusion that all preferences, relationship agreements or production requirements are satisfied. Known failures dominate missing information. Gates include self-pairing, age 18+ at the pinned clock, trusted identity verification, suspension, any-direction block/report, reciprocal explicit dating interest and both people's opt-in to an open scheduled event. Missing essential facts stop evaluation; there is no invented location or calendar input. Safety reports are conservatively exclusionary pending an eventual staffed review policy.

`exploratory-v3` has two unchanged configurable soft-fit domains: shared interests (weight .6) and partner energy (.4). Within shared interests, conversations, movies and music use set Jaccard overlap. Within partner energy, each person's desired energy is compared with the other's 1–5 energy. Quiet/outgoing/balance map explicitly to 1/5/3; “Different from mine could be good” (`partnerEnergy/o04`) expresses tentative openness and contributes **no directional evidence**, exactly like “No strong preference” (`o05`). It creates neither a bonus for opposite energy nor a penalty for equal energy. This mapping is a transparent, **unvalidated implementation hypothesis**. Nominal options such as planning are not ordinal.

Before soft-fit calculation, the separate private relationship assessment evaluates declared intention and structure. Its ALIGNED / CONFLICT / DISCUSS / UNKNOWN states concern the proposed pairing, not a person's eligibility or worth. Any non-ALIGNED result sets `pairingHeld=true`, `relationshipReadiness=HOLD_FOR_REVIEW`, and withholds the soft-fit score; the implemented-gate status is unchanged. When both facets are ALIGNED, `relationshipReadiness` is still only `PARTIALLY_ASSESSED`, never full readiness. Every result has `productionReady=false`. See the [coverage audit](matching-coverage.md) for exact rules and remaining unassessed constraints.

Each domain averages its known rule scores before domain weighting; adding many questions cannot automatically overweight that domain. Directional A→B and B→A fit combine with a harmonic mean so one satisfied direction cannot conceal the other. Weights must be positive finite values with a named policy version. No unknown question can enter the fixed rule allowlist through weight configuration.

Coverage is the weighted fraction of possible directional evidence present. Missing and declined answers contribute neither agreement nor disagreement; they reduce coverage. Default score requires at least two mutually observed dimensions and coverage ≥.5. All missing and a single shared hobby yield a null compatibility, not 0 or a confident 100. Even a complete 100 is labeled EXPLORATORY_UNVALIDATED. Coverage is evidence availability, **not statistical confidence**; the confidence field makes no validated probability claim. Internal evidence contains rule IDs and directional values; never disclose these private explanations to the other participant.

## Improve the questions before expanding weights

Audit redundancy, burden, accessibility, translation and clear behavioral wording with consented research participants. The UI now includes optional questions about sharing good news, feeling understood, repair after disagreement and support for personal goals; all four are mapped to inactive backend definitions. These are research-inspired topics, not validated instruments; adding more questions to the already long flow is not automatically better. Keep them inactive until their semantics and use are reviewed.

Future consensual post-date feedback could separately measure feeling respected/safe, conversational ease, and mutual interest in another date. Separate safety escalation from model training; allow skipping, explain purpose/retention, and never expose one person's feedback to the other. Log policy/question versions and exposure/selection effects, use held-out time cohorts, compare with transparent baselines, inspect calibration, subgroup error and missingness with privacy review, and guard against popularity/appearance proxies and nonresponse bias. Do not optimize for clicks or imply causality from observational outcomes. No feedback collector, training pipeline, experiment, learned model or validated success rate is implemented.

## Policy semantics history

- `exploratory-v1`: initial exploratory implementation; incorrectly treated tentative openness to different energy as preference for maximal difference. Retired.
- `exploratory-v2`: corrected o04 to no directional evidence, preserving IDs, weights and the other soft rules.
- `exploratory-v3`: current default; preserves the v2 correction and adds the separate conservative relationship-intention/structure assessment before soft-fit computation. No new score weights or desirability rules.

The current engine rejects the retired v1/v2 labels rather than silently executing new semantics under them. It does not implement historical replay; any future persisted result requires its actual engine/policy version and parameters. Question/option definitions and their versions are unchanged.
