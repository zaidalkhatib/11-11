# Actual matching coverage and semantic limits

Audit against current `mobile/src/onboarding.ts`, `mobile/App.tsx` energy labels, frozen catalog and `MatchingEngine`. There are **85 catalog answer definitions**, covering 88 UI steps after the three identity preview steps are excluded. Five catalog items disable answered collection; a large catalog is not evidence of a sophisticated or validated matching algorithm.

Live allocator policy is **reciprocal-v2** (looks, career, fitness, age, finance; faith/ethnicity/politics soft fit; shared interests; thin personality; dinner logistics). **exploratory-v3** remains available for research fixtures. Coverage is of the active policy’s soft dimensions, **not** a percentage of the full catalog. A 100 score means maximal agreement under those rules only — not chemistry.

Mobile onboarding (D-029) is trimmed to the algo keep-list; looks / ethnicity / religion (and how much each matters) stay required and scored.

## Implemented layers

| Layer | Inputs | Actual behavior |
|---|---|---|
| Adult/identity/safety/event gates | DOB, trusted verification, suspension, block/report, event opt-in and open state | Known failures stop evaluation; missing essential facts require information. No location/availability questionnaire is introduced. |
| Explicit dating interest | gender, interestedIn | Mutual stated interest required; unknown/exploring is not universal interest. Orientation is never used to infer interest. |
| Existing narrow boundaries | smokingFit, drinkingFit, sharedFaith, religion, childrenAlignment | Smoke/alcohol-free preferences require a partner's own known-use fact (not present in current UI/DB adapter); essential shared faith requires consented known facts; same-future family requirement needs normalized facts and returns NEEDS_INFO. These do not cover all lifestyle/family agreements. |
| Separate relationship assessment | relationship, relationshipStructure | ALIGNED / CONFLICT / DISCUSS / UNKNOWN; non-ALIGNED holds this pairing for review and withholds the soft score. It is not person-level rejection. |
| Shared interests | conversations, movies, music | Three set-Jaccard dimensions averaged within a .6-weight domain. |
| Partner energy | partnerEnergy → other person's energy | One directional dimension in a .4-weight domain. Only quiet/outgoing/balance use numeric targets; openness and no preference contribute no evidence. |

`eligibility=PASS` means only the implemented gate checks passed. Empty gate reasons do not certify missing or undeclared constraints as satisfied. `relationships.pairingHeld=false` means only the two explicit relationship facets were ALIGNED, not that all needs are understood. `relationshipReadiness` never claims complete readiness and `productionReady` is always false. No result is exposed through a public matching endpoint or used to allocate dates automatically.

## Narrow relationship rules

These are deterministic interpretations of the actual answer wording, not learned compatibility weights or universal dating judgments.

| Facet | Pair of answers | Assessment |
|---|---|---|
| Intention | Same declared life-partner, serious-relationship, or casual answer | ALIGNED on that declaration only |
| Intention | Life partner versus serious relationship | DISCUSS: their future expectations may overlap, but agreement is not established |
| Intention | Casual versus life partner or serious relationship | CONFLICT in the stated current intention; hold for review, not person-level ineligibility |
| Intention | “Dating with intention,” “Exploring what feels right,” missing/declined/unsupported | UNKNOWN: “intention” alone does not specify desired form or time horizon |
| Structure | Both monogamous, or both ethically non-monogamous | ALIGNED on that broad declaration only; specific agreements are still unassessed |
| Structure | Explicit monogamous versus ethically non-monogamous | CONFLICT; hold this pairing |
| Structure | “Open to discussing it” with a known structure or another discussion answer | DISCUSS; openness is not agreement to either structure |
| Structure | Still exploring, declined, missing, unsupported | UNKNOWN, including when the other person is open to discussion |

Any non-ALIGNED facet holds the pairing before interests act as tie-breaks. There is no acceptance/review workflow yet, so the engine cannot clear that hold automatically. Ambiguity and missing information are never converted into rejection or assumed agreement. Other consequential constraints below remain unassessed even when these two facets align.

## Literal-semantics audit of soft rules

| Rule/label | Current interpretation | Remaining limitation |
|---|---|---|
| Energy self scale | Introvert / mostly introverted / ambivert / mostly extroverted / extrovert → 1–5 | The equal distances are an exploratory ordinal approximation, not a validated interval measure. |
| Quiet/outgoing/balance partner preference | Targets 1/5/3 with linear distance | Exact extremes, midpoint and slope are unvalidated implementation assumptions; no new calibration is claimed. |
| “Different from mine could be good” | No directional evidence | Corrected: tentative openness does not mean wanting maximal difference. Across all 25 self/partner values it behaves like no directional preference. |
| “No strong preference” | No directional evidence | It does not earn a universal compatibility bonus. |
| Music: “A little of everything” | Currently an exclusive nominal Jaccard label | It is not expanded into every genre. Against Pop the primitive yields zero overlap; against itself it yields full overlap. Neither establishes actual taste overlap. A change needs a product decision about unknown breadth versus follow-up detail. **Known limitation; not fixed by this pass.** |
| Music: “I prefer quiet” | Currently an exclusive nominal label | Shared quiet is not shared music taste; quiet versus a genre is not proof of relationship incompatibility. Whether to exclude it or model sound-setting preferences separately is unresolved. |
| Movies: “Not really a movie person” | Currently an exclusive nominal label | Shared lack of movie interest can currently produce overlap; it is not evidence of a shared hobby. Needs reviewed treatment alongside music catch-alls. |
| Other selected genres/topics | Jaccard intersection divided by union | More/different selections can reduce the primitive score. No evidence establishes that exact-label overlap predicts conversational ease or dates going well. Shared topics are interests, not required partner traits. |

The catch-all limitations remain visible rather than being silently “fixed” with new weights or unsupported inference. There is no production ranking approval while they remain unresolved. Correcting them later must version policy semantics and test missing/coverage behavior explicitly.

## Consequential constraints still unmodeled or incomplete

- **Relationship status and agreements:** Single/divorced/widowed/separated/in an ENM relationship/figuring things out describes a current chapter. It does not prove readiness, current commitments, consent from other parties or compatibility of relationship agreements. No status is automatically a dealbreaker.
- **Family plans:** Children combines current parenthood with future wishes. Normalized future intent, existing-parent responsibilities and mutual flexibility are absent. Only the explicit same-future boundary currently triggers a hold for more information; lack of that answer is not proof that family plans align.
- **Reproductive choices:** reproductiveValues describes importance, not stance. “Essential” cannot establish which position is wanted or whether two people agree; this constraint remains unassessed, not satisfied.
- **Smoking/drinking:** Only explicit smoke-free/alcohol-free boundaries are presently checked. Own-use facts are absent from the UI/database candidate adapter. Occasional-use tolerances and differing notions of “social” or “regular” use are not evaluated; no preference is inferred from omission.
- **Other lifestyle needs:** Pets/allergies, dietary/accessibility needs, sleep/routine, exercise/sharedActivity, language for communication, phones/social-media habits, distance/travel, financial expectations and practical commitments are not evaluated as compatibility constraints. Do not turn an interest or lifestyle self-report into a hard filter without explicit choice and necessary facts.
- **Religion/politics/background:** Only the narrow explicit essential-faith gate exists. Faith importance and shared values are not interchangeable with religious identity. PoliticalFit and reproductiveValues are importance/preference wording, not fully declared stances. Ethnicity and sharedBackground have no default scoring/filter effect; “important” is not an invented ethnic dealbreaker.
- **Relational behavior:** Values is desired partner traits, not proof of one's own traits. Communication, affection, pace, independence, trust, support and the four new research-informed questions do not measure a partner's actual responsive behavior. They remain unscored; no same-label similarity is assumed to mean needs are met.
- **Attraction and socioeconomic data:** height, selfRating, looksImportance, bodyBuild and childhoodResources are excluded from answered collection and scoring. They are not desirability proxies.
- **Chemistry:** The field named chemistry is a stated hope for a feeling, not observed chemistry; it has no scoring effect.

The remaining questions stay inactive unless a separately reviewed policy explicitly uses them. Missing/declined/ambiguous answers are unknown; questionnaire completion does not cure absent concepts, establish consent, or make a pair operationally ready. No new user dealbreakers were invented in this pass.

## Explicit inactive inventory

Beyond the five soft-score inputs, seven questionnaire gate inputs, two relationship-assessment inputs and five disabled-collection items, these 66 catalog IDs have no implemented scoring or gate effect:

`faithImportance`, `work`, `adventure`, `weekend`, `communication`, `affection`, `pace`, `planning`, `humor`, `decisions`, `support`, `differences`, `values`, `ambition`, `independence`, `children`, `newExperiences`, `workout`, `movement`, `sharedActivity`, `ethnicity`, `sharedBackground`, `routine`, `stress`, `affectionStyle`, `familyTime`, `languages`, `siblings`, `upbringing`, `movingRoots`, `relationshipStatus`, `orientation`, `thinkingStrength`, `practicalConfidence`, `trust`, `composure`, `imagination`, `feedback`, `followThrough`, `hardConversations`, `groupRole`, `podcasts`, `socialSetting`, `pets`, `socialMedia`, `phonesAtDinner`, `humorBoundaries`, `purpose`, `astrology`, `communityAction`, `politicalOutlook`, `politicalFit`, `newsConversation`, `sustainability`, `reproductiveValues`, `styleSpending`, `rules`, `changeComfort`, `individuality`, `moneyValues`, `distanceFit`, `chemistry`, `goodNewsSupport`, `feelingUnderstood`, `conflictRepair`, `goalSupport`.
