# 11:11 — Decision log

Shared with every workstream. Read alongside the [project brief](project-brief.md).

## Status and approval rules

**Approved** means explicitly directed or approved by the user, or later by someone the user explicitly grants approval authority. **Proposed** means awaiting approval and must not be presented as a settled product requirement. **Implementation choice** means a reversible technical or design choice made within an explicitly authorized build; it is not a user-selected vendor or approved product policy. **Superseded** retains a previous decision and links to its replacement. **Rejected** retains a proposal and its rejection source.

For new entries record: ID, status, date, decision or proposal, source/approver, rationale, affected brief questions and workstreams, dependencies, and follow-up. Do not imply CEO can approve decisions merely because CEO coordinates.

## Approved baseline

All entries below were explicitly supplied by the user in this conversation on 2026-10-24. They are requirements, not additional product choices made during organization.

- **D-001 — Approved: 1:1 blind dates only.** No group events. Affects all workstreams.
- **D-002 — Approved: experience-led service.** People sign up for experiences; 11:11 matches two compatible people based on personality, notifies them, and arranges dinner or activity logistics. Matching method, timing, and operating details remain open (Q-03–Q-06).
- **D-003 — Approved: inspiration and originality.** Use the user's stated 222 inspiration and written aesthetic direction. Create an original 11:11 identity; do not copy branding, assets, or wording, or assume proprietary matching access. Affects Design, Engineering, and Growth & Experiences.
- **D-004 — Superseded by D-008: screenshot prerequisite.** Originally required requesting missing screenshots before visual design. Retained as historical context; the later live-reference instruction replaces this hold (Q-13).
- **D-005 — Partially superseded by D-008–D-010: organization-only phase.** Create a brief, decision log, four charters, and README. Do not code, choose a stack, publish, book, spend money, or contact anyone. Finish organization and wait for instructions. Affects all workstreams.
- **D-006 — Approved: common sources and explicit coordination.** All workstreams use the same brief and log. CEO coordinates in a separate conversation with no assumed shared history. Approval delegation remains open (Q-14).
- **D-007 — Approved: preserve work and unknowns.** Inspect existing files first; preserve them and do not overwrite existing work. Record unresolved product details as unknowns. Initial inspection found only Git metadata.

## Proposals

At the 2026-10-24 organization baseline, no product, technology, commercial, or operational proposals had been introduced. Later entries below distinguish explicit user direction from implementation recommendations. The brief's open questions remain unresolved unless an entry expressly resolves them.

### D-008 — Website execution and live reference

- Status: Approved, 2026-11-08.
- Decision: Build the website first and inspect the live 222 reference before doing so. Use the existing organized project documents.
- Source and approver: user, current build conversation: “first create a webist like the one 222 https://222.place/ but use different anmation but same style different color. we want to use the same style in our ios app which we will build using reactnative or something cross platfrom. design the best way to scale and make it cross platfrom, it first we want to foucs on IOS after hte website. also use the @Organize 11:11 project docs (thread://01a16ffc-1537-7ce3-aeb9-dd1a0204f733?hostId=local)” Follow-up: “look at the webiste https://222.place/ first.”
- Rationale: latest direct execution instruction replaces the earlier organization-only and missing-screenshot holds for the website. The implementation lead reports live visual inspection before implementation: sparse textured green viewport, cream serif type, animated activity/companion pills, pill navigation, and blurred-backdrop modals. This is a visual observation, not validation of 222 business operations.
- Related questions/workstreams: Q-11, Q-13; Design, Engineering, QA & Safety.
- Dependencies/follow-up: deliver a reviewable concept, validate it, and preserve unresolved product policies. No mobile build, real signup collection, booking, payment, or outreach follows implicitly.
- Supersedes: D-004 and the website execution restriction in D-005. Other D-005 boundaries remain unless separately authorized.

### D-009 — Original color and animation

- Status: Approved direction; implementation choices subject to review, 2026-11-08.
- Decision: retain a related premium style while using different color and animation; preserve 11:11 originality and exclusively 1:1 positioning.
- Source and approver: user instruction quoted in D-008.
- Implementation choice: midnight aubergine/copper with warm cream and two orbit paths resolving into a rendezvous. No 222 assets, branding, wording, or proprietary logic are to be copied.
- Related questions/workstreams: Q-13; Design, Engineering, Growth & Experiences.
- Dependencies/follow-up: visual and accessibility validation; final brand acceptance remains open. Updates the color component of D-003 while preserving its originality requirement.

### D-010 — Cross-platform architecture and iOS sequence

- Status: Approved sequence and architecture planning; recommended stack, 2026-11-08.
- Decision: website first, then iOS-focused cross-platform app. React Native is a candidate, not a mandate.
- Source and approver: user instruction quoted in D-008.
- Implementation choice for the website: Vinext/React/TypeScript starter with platform-neutral tokens and domain/copy modules under `website/packages/`.
- Recommendation, not a vendor commitment: Expo React Native for iOS first, separate native view/animation components, shared TypeScript contracts and design tokens. Keep web marketing in React DOM. See [architecture](architecture.md).
- Related questions/workstreams: Q-03–Q-11, Q-13; Engineering, Design, QA & Safety.
- Dependencies/follow-up: evaluate framework maturity, licenses and deployment before production; resolve product, privacy and safety decisions before backend or mobile implementation. No iOS build is included in this phase.

### D-011 — Signup, download and conversation concept

- Status: Approved interface direction; production integration unresolved. Added after D-008–D-010 in the current website iteration.
- Decision: add Download our app and Sign up, with an eventual iMessage-like conversation based on the supplied visual references.
- Source and approver: user, current build conversation: “ok add downlaod our app, and also sign up which will do something like this. the sign up eventlly will have Imessage chat like the one in the image.”
- Reference evidence: the implementation lead reports inspecting all three screenshots: minimal cream Sign up button, phone-first welcome/country-prefix input, and a Messages window with rich invitations and accept/details/alternate actions. No private contact details are retained in these documents or authorized for use as demo content.
- Implementation choice: a primary Sign up flow with basic phone-format validation, sample-number option, local chat demo, experience quick replies, rich invitation card, accept/details/alternate actions, typed-message demo and restart. Preserve the original guided experience preview. Download our app opens an iOS coming-soon concept, with no App Store/TestFlight link.
- Data boundary: inputs and messages remain in React memory and clear when signup closes or the page reloads. No submission, phone verification, account, backend, SMS/iMessage service, real invitation acceptance or booking is implemented. Validation only checks preview format, not ownership or deliverability.
- Related questions/workstreams: Q-03, Q-05, Q-08–Q-11, Q-13, Q-15; Design, Engineering, QA & Safety, Growth & Experiences.
- Dependencies/follow-up: validate the new flows separately from the earlier preview. Before real enrollment or messaging, resolve verification, consent, access, rate limits, data handling and provider feasibility. A web mockup proves neither native iMessage capability nor Apple affiliation. No provider or messaging integration is approved by this interface request.
- History: extends the website concept scope in D-008 and D-010. Earlier statements excluding real signup and production messaging still apply; the earlier concept without phone entry is no longer the complete interface.

### D-012 — Single-viewport landing and compact bottom actions

- Status: Approved layout direction; implementation details reported by the website lead. Added after D-011 in the current website iteration.
- Decision: keep the landing page to one viewport without page scrolling, remove the supporting text around its actions, and make the buttons smaller and bottom-centered.
- Source and approver: user, current build conversation: “the page is scrolling we don't want to scroll just one page. remove those texts and just keep the buttons in the bottom make them smaller and put them at the buttom.”
- Reference evidence: the implementation lead reports inspecting the screenshot identifying the experience-description sentence above Sign up/Download and the “An invitation to something real / Explore the experience” text below. Both text areas were removed.
- Implementation choice: a single dynamic viewport with compact 44px-high, bottom-centered Sign up and Download our app buttons. Keep the hero, experience card and experience picker. Remove the footer tagline; place the motion control in the header. Privacy remains accessible from the idea dialog; how-it-works is directly accessible on desktop and through the idea dialog on mobile.
- Scope boundary: the no-page-scroll requirement concerns the landing. Dialogs retain internal scrolling so signup, chat and other content remain accessible rather than clipped into one screen. Existing prototype-only, local-memory, no-backend and iOS coming-soon constraints remain unchanged. This layout request grants no fresh launch or production-service authorization.
- Related questions/workstreams: Q-11, Q-13; Design, Engineering, QA & Safety.
- Dependencies/follow-up: validate the revised landing at relevant viewport sizes and verify dialog scrolling, keyboard access, dismissal and focus recovery. The implementation lead owns the validation report; this entry is not evidence that those checks passed.
- History: refines the landing layout introduced under D-009 and D-011. Earlier layout and text choices are superseded only where described above; signup/download behavior and unresolved product decisions remain intact.

### D-013 — Minimal purpose-led landing

- Status: Approved interface direction; implementation and validation in progress. Added after D-012 in the current website iteration.
- Decision: simplify the landing to a clear statement of the service goal, retain the interactive Dinner/adventure/creative bar and changing animation, remove the footer and visible play/pause control, remove the idea panel, and make how-it-works informational rather than action-driven.
- Source and approver: user, current build conversation: “make it more minmalist like this one, i like the dinner a liittle advneture and the changing animation but also keep everying minmal ... remove the buttom stuff for now the footer basically and also remove the play and pause buttion just keep it playing. ... just how it works and just display the info we don't need actins there and remove the idea. ... landing face should just tell the goal same as 222. tho keep thie interactive bar.”
- Reference evidence: the implementation lead reports visually inspecting three supplied screenshots: a sparse 222 landing, the original 11:11 experience selector and the earlier footer. Reference style does not authorize copying 222 branding, assets or wording.
- Implementation choice: replace the large arch/orbit scene and marketing paragraphs with one central purpose sentence and a compact, automatically changing experience pill with a small original illustration. Preserve aubergine/copper identity and the three-option interactive bar. Header contains only the logo and how-it-works. No idea control, footer or visible motion control remains; how-it-works presents information with only a close action.
- Motion behavior: automatic experience selection every six seconds, disabled for reduced-motion preference and suspended while a dialog is open. Removing the visible pause button does not remove the reduced-motion accommodation. Accessibility implications of auto-updating content remain subject to validation.
- Scope boundary: retain signup and download as the existing honest local-only/coming-soon prototypes. Preserve the single-viewport landing goal and internal dialog scrolling. No backend, real messaging, account creation, download availability or fresh production-service launch authorization follows from this visual revision.
- Related questions/workstreams: Q-11, Q-13; Design, Engineering, QA & Safety.
- Dependencies/follow-up: the implementation lead owns `minimalist-validation.md`. Build, browser checks and publication of this revision are pending verification; this decision entry does not establish any pass or deployment result. Check auto-selection, manual selection, reduced motion, dialog interruption, viewport fit, informational-only how-it-works, and unchanged signup/download disclosures.
- History: supersedes the large orbit/arch presentation in D-009 and the D-012 header motion control and idea-based navigation. Earlier entries remain historical evidence. Cross-platform architecture, originality, prototype data boundaries and unresolved launch gates remain intact.

### D-014 — iOS-first UI and required personality onboarding

- Status: Approved UI-only execution, 2026-11-08; visual and question-content choices remain iterative proposals.
- Decision: begin the iOS-focused app UI. Before signup, present slowly revealed informational pages with Next between them. Follow with required personality forms; do not expose the main app until they are complete. Screenshots are not required to start this iteration. No backend work is requested.
- Source and approver: user: “ok the app now, we care about ios, one thing this app does is it starts the infromation being dispalied in moation like if you open this page https://rsvp.222.place/?utm_source=landing texts starts dispalying slowly. the app has same idea, the first time you use it before you sign up you get displayed information and different pages it tells how works and then next read, read page next then the forms starts you can't do anything but fill in your personality stuff once you are done you are able to use the app. you need screenshots from the app or you have them?” Follow-up: “i can't do that becuase i already sign up to the app but you understand what i mean we can itertate based on your design you don't need to worry about backend or anything lets work on the UI first”
- Implementation: separate `mobile/` Expo React Native project, same original aubergine/copper/cream tokens, four staggered-reading pages, six proposed questions, editable review and three-tab local app concept. No credentials or verification screen is invented as real authentication.
- Reference evidence: live reference reviewed up to its phone-entry gate. Its sparse typography and gradual disclosure informed pacing; its later private app flow and exact timing were not verified. No reference assets, copy or private contact details were reused.
- Boundaries: answers and saved sample ideas stay in React memory only. No account, message, matching, reservation or real availability is created. Native simulator/device checks remain required before claiming iOS runtime validation.
- Supersedes: the earlier app-build hold in D-008/D-010 for UI-only prototyping. Production privacy, eligibility, safety, provider, data collection and launch questions remain open.
- Follow-up (2026-11-26): D-015 accepts the expanded 88-step local questionnaire; D-016 accepts the isolated Java backend and supersedes this entry’s “no backend work” clause for that foundation only. Client preview / no-production-collection boundaries remain until Gate 3+ and wiring approval.

### D-015 — Expanded local onboarding questionnaire

- Status: **Approved** as the current local onboarding structure, 2026-11-26. Individual question wording, required-versus-optional rules, and production privacy treatment remain refinable under Q-03, Q-04, Q-09.
- Decision: keep the as-built **88-step** questionnaire in `mobile/src/onboarding.ts` (`QUESTION_COUNT = 6 + personalityQuestions.length`, 82 trait/preference prompts), sectioned review, and three-tab local preview as the canonical mobile UI flow.
- Source and approver: user, 2026-11-26 planning conversation: “Accept” (accepting the as-built questionnaire recorded in the prior reconciliation step).
- Rationale: stop treating the expanded UI as provisional relative to outdated “six” / “43” counts; align product iteration with the checked-in reducer.
- Related questions and workstreams: Q-01–Q-04, Q-08–Q-09, Q-11, Q-13; Design, Engineering, QA & Safety.
- Dependencies and follow-up: Gate 3 still needs verification, consent, and field policy. Rerun VoiceOver / Dynamic Type against this length before Gate 5 claims. Sensitive categories still need production privacy gates before real collection.
- Supersedes: the “six proposed questions” implementation detail in D-014 for local UI count and structure. D-014’s in-memory / no-production-collection boundaries remain until Gate 3.

### D-016 — Isolated Java backend foundation

- Status: **Approved** as the in-repo backend foundation, 2026-11-26. Client wiring, production data collection, and Gates 3–5 remain separately gated.
- Decision: accept `backend/` (Spring Boot / Java 21, Flyway, local H2, OIDC JWT default-deny, questionnaire/events GETs, authenticated `/api/v1/me/*`, typed contracts/tests) as the authorized service foundation. It **supersedes D-014’s “no backend work” exclusion** for maintaining and evolving this isolated API. It does **not** authorize connecting `website/` or `mobile/` to the API, collecting real user data, or operating dates.
- Source and approver: user, 2026-11-26 planning conversation: “Accept”.
- Rationale: the foundation already exists and is validated in isolation; formal acceptance removes the D-014 conflict so engineering can treat `backend/` as in-scope without implying launch authorization.
- Related questions and workstreams: Q-01–Q-11, Q-14; Engineering, QA & Safety.
- Dependencies and follow-up: keep clients preview-only until Gate 3+ decisions and an explicit wiring approval. Before any connection: auth/consent UX, review-and-save (no auto-upload of drafts), scheduled-event IDs, CORS, secure token storage — per `backend/docs/local-integration.md` and production blockers in `backend/docs/architecture.md`.
- Supersedes: D-014’s backend-exclusion clause only. Does not supersede D-011 local-memory signup, D-014 UI preview boundaries for clients, or launch gates 3–5.
- Priority note (D-017): active backend feature work and verification are deferred until the UI phase is finished.

### D-017 — UI-first launch scope: 18+, San Diego, Dinner only

- Status: **Approved**, 2026-11-26.
- Decision:
  1. **Priority:** finish the website and mobile **UI** before further backend implementation, client↔API wiring, or production verification work. D-016 remains the accepted foundation; it is not the current work focus. Verification is **not** important in this phase.
  2. **Q-01 Eligibility:** initial audience is **18+** only.
  3. **Q-02 Geography:** first market is **San Diego**; expansion to other cities later.
  4. **Q-02 Experiences:** first experience type is **Dinner only**; adventure, creative, and other types may expand later.
- Source and approver: user, 2026-11-26: “we want to finish the UI first before we actully work on the backend, verfication is not important now. the aduiance should be 18 plus. also for now its going to be in san diego but will expand later. for now dinner only. will expand later.”
- Rationale: narrow the first honest product story and unblock UI completion without Gate 3/4 commitments.
- Related questions and workstreams: Q-01–Q-03, Q-11, Q-13; Design, Engineering, Growth & Experiences.
- Dependencies and follow-up: align concept UI copy and selectors to Dinner-first / San Diego / 18+ where shown; keep adventure/creative as future catalog, not current choosable launch options. Signup remains local preview. Matching (Q-04), reveal (Q-05), logistics/commercial (Q-06–Q-07), and Gate 3 verification/consent stay open or deferred.
- Supersedes: D-013’s three-option Dinner/adventure/creative **launch** presentation for the current phase; D-016’s implication that backend work is the next active track. Does not reopen production data collection.

### D-018 — Required onboarding photo; hide question progress

- Status: **Approved**, 2026-11-26.
- Decision: onboarding ends with a **required photo** step (library picker; cannot skip). Remove the per-question progress bar and step count (`01 / N`). Photo stays in-session memory only until Gate 3.
- Source and approver: user, 2026-11-26: “on our sign up we need a photo too as the last step, they should provide a photo. they can't skip. also lets remove the progress bar…”
- Related questions and workstreams: Q-03, Q-09, Q-13; Design, Engineering.
- Dependencies and follow-up: `QUESTION_COUNT` is now 89 (`PHOTO_STEP` last). Production upload, retention, and moderation remain Gate 3+.
- Extends: D-015 local onboarding structure.

### D-019 — All onboarding answers required; no Prefer not to say

- Status: **Approved**, 2026-11-26.
- Decision: every personality/questionnaire choice is **required** (no skip / optional flags). Remove **Prefer not to say** (and similar opt-outs such as “I’d rather not rate myself”) from all options. Phone preview may still be left blank; photo remains required (D-018).
- Source and approver: user, 2026-11-26: “prefer not to say should not be an answer for any question. all the questoins answers are required.”
- Related questions and workstreams: Q-03, Q-09; Design, Engineering, QA & Safety.
- Extends: D-015 / D-018.

### D-020 — Public copy: no San Diego / 18+ limits; dinner footnote

- Status: **Approved**, 2026-11-26.
- Decision: do **not** market-limit the concept UI with San Diego or 18+ copy. How-it-works step 02 is “A personality-led blind date. Always one person meeting one person.” Dinner remains the shown experience; add footer note **\* More experiences may come later.**
- Source and approver: user, 2026-11-26: remove San Diego and 18 “we don't want to limit ourselves”; put “More experiences may come later” as a footer with *.
- Related questions and workstreams: Q-01, Q-02, Q-13; Design.
- Supersedes: the **public-facing** San Diego / 18+ presentation implied by D-017. Dinner-only launch experience and UI-first priority remain. Eligibility/geography for real enrollment stay open until Gate 3.

### D-021 — Added dinner-matching questionnaire prompts

- Status: **Approved** as local UI expansion, 2026-11-26. Matching use remains proposal until Gate 4 / Q-04.
- Decision: add required prompts for own smoking/vaping and drinking, dietary needs for dinner, and partner-with-pets fit. Also remove remaining looks opt-out. First-dinner vibe, conversation depth, meeting readiness, and early texting were added then removed per user. Onboarding step count superseded by D-022 additions.
- Source and approver: user, 2026-11-26: “if you feel there are more questions needed to match 2 people you can add them.” Follow-up: remove first-dinner vibe, conversation depth, meeting readiness, and early texting pace.
- Rationale: keep lifestyle facts that help dinner pairing; drop pre-date vibe/timing prompts the user does not want.
- Related questions and workstreams: Q-03, Q-04; Design, Engineering.
- Extends: D-015 / D-019. Backend catalog and scoring not updated in this UI-first phase (D-017).

### D-022 — Automated reciprocal preference matching (product direction)

- Status: **Approved** direction, 2026-11-26. Implementation of the scorer remains future work; questionnaire structure updated in UI now.
- Decision: matching must be **fully automated** (no human shortlist as the product goal). Pair people using:
  1. **Similar values / personality** soft fit;
  2. **Self attributes** (looks self-rating, career drive, age, fitness, etc.);
  3. **Partner preferences + importance** (what they care about in the other person — looks, career, fitness, age window, priority mix);
  4. **Reciprocal satisfaction** — e.g. if A weights looks highly (“Physical attraction matters a lot” / “An initial spark is essential”), prefer B whose looks **self-rating ≥ A’s self-rating** (same or better). Same pattern for career and fitness where preferences exist. No separate “partner looks hope” question.
  5. **Looks:** **self-reporting for now.** A future 11:11 photo-based looks rating may come later; not in the current UI phase.
- Source and approver: user, 2026-11-26: automated goal; similar values; looks/career preferences; personality included. Follow-ups: self-reporting + UI-first; remove partner looks-rating question — use looks importance + own rating (≥ self).
- UI additions: age, career drive (self), partner age range, partner priorities, fitness (self), partner fitness, partner career drive. Partner looks hope removed. Onboarding **100** steps including photo.
- Related questions and workstreams: Q-04, Q-08–Q-09; Engineering, Design, QA & Safety.
- **Priority:** finish **UI** first (D-017). Reciprocal scorer and other matching logic stay in `backend/` for a later phase — do not block UI completion. Gate 3 still required before real pairing. Supersedes earlier “appearance excluded from scoring” *product intent* for future automation (historical backend exclusions remain until the scorer is rewritten).
- Extends: D-015–D-021 questionnaire; does not authorize live auto-matching of real users yet.

### D-023 — Required conditions acceptance before profile creation

- Status: **Approved**, 2026-11-26.
- Decision: after review, users must open/accept legal conditions (18+, Terms with arbitration/class waiver, membership auto-renew notice, Privacy, Community Guidelines, Safety Policy, truthful profile, e-sign) in the **mobile app** before creating a profile / entering home. Website does **not** host conditions (no signup there).
- Source and approver: user, 2026-11-26: add tick-required conditions; later: remove conditions from website because signup is app-only.
- Rationale: gate entry behind explicit consents and liability-oriented notices for a dating introduction product.
- Related workstreams: Design, Engineering, QA & Safety.
- Dependencies and follow-up: draft copy only — counsel review before production; wire acceptances into real account creation when backend auth exists.

### D-024 — Local-dev mobile ↔ API hookup

- Status: **Approved**, 2026-11-26.
- Decision: authorize an explicit **local-dev** Spring profile for simulator wiring: HS256 JWT via loopback-only `POST /api/v1/local-dev/session`, seeded San Diego dinners, and Expo calling `http://127.0.0.1:8080` with `allowInsecureLocalhost`. After conditions, the app performs an explicit profile+answers save, Events list server experiences, and join records **interest only** (`waiting`, never `demoMatched`). Default JAR without `local-dev` stays fail-closed.
- Source and approver: user, 2026-11-26: “ok lets hook up our backend” → full local loop (A).
- Rationale: unblock Events → Invites server path for development without shipping production auth or collecting real users.
- Related workstreams: Engineering, QA & Safety.
- Dependencies and follow-up: Gate 3 real OIDC/verification still required before production collection; replace local-dev auth; allocator/invites/OpenTable remain separate. Extends D-016; does not supersede D-017 UI priority for remaining polish.

### D-025 — Join event = acceptance; match notifies confirmation

- Status: **Approved**, 2026-11-26.
- Decision: when a user joins an experience, that **is** their acceptance to be paired for that dinner. There is **no second accept/decline invite step**. The matching system selects another opted-in compatible person for the same experience, locks a 1:1 pair, and **notifies both** that they are confirmed / a match was found. Cancel is allowed while waiting; after match, cancellation is a separate confirmed-date policy (TBD). Venue booking runs after match confirmation.
- Clarification (2026-11-26): match only when **two people** (1) both joined the same event and (2) reciprocal scoring over their **self-provided personality/answers** produces a real compatibility score. No pair from interest alone or from a null/insufficient-evidence score. Local-dev optional synthetic partner is opt-in (`LOCAL_DEV_AUTO_PARTNER`), not the product path.
- Source and approver: user, 2026-11-26: “once the user joins the event that means they accepted, if another user that our matching system find we can notify the user that they are confirmed and found a match for them.” Follow-up: “we are using the information they provide about themselves to match people if 2 people have score with persoanliteies and answers and join same event then we match them.”
- Rationale: simpler UX — one commitment at join time; matching + notify are the system’s job.
- Related questions and workstreams: Q-04–Q-06, Q-08; Engineering, Design, Growth & Experiences.
- Dependencies and follow-up: implement allocator + MATCH_CONFIRMED notification; supersedes earlier dual-invite accept design in the Events→Invites architecture board. Does not authorize live pairing of real users before Gate 3+.

### D-026 — Hourly matching job

- Status: **Approved**, 2026-11-26.
- Decision: matching runs as a **scheduled batch job** (about every hour, configurable). Each run: for open experiences with WAITING interests, score eligible pairs, lock 1:1 matches, write arrangements, enqueue **MATCH_CONFIRMED** notifications to both users. Not real-time on every join; not a human shortlist. Rematch/unmatched leftovers wait for the next run.
- Source and approver: user, 2026-11-26: “Matcher be job that runs every hour or so to see if we found a match we notify both users. yes”
- Rationale: predictable load, simpler fairness/locking than per-join pairing, enough cadence for dinner waitlists.
- Related questions and workstreams: Q-04, Q-05; Engineering.
- Dependencies and follow-up: worker + outbox dispatcher; interval tunable (default ~1h). Builds on D-022 / D-025. Score inputs are the full questionnaire including looks self-rating and reciprocal preference satisfaction (D-022), not interest overlap alone.

### D-027 — Phone before name; returning login by phone

- Status: **Approved**, 2026-11-26.
- Decision: onboarding asks for **phone before name**. A known phone (existing profile for that local-dev subject) skips name/city, lands on the code step, then opens home — no full re-signup. New numbers continue name → city → questionnaire. Real SMS verification remains Gate 3.
- Source and approver: user, 2026-11-26: “ask for phone number before name… when the user has an account they don't need to create an account we just log them in.”
- Related workstreams: Engineering, Design.
- Dependencies and follow-up: production phone auth/OIDC; restore full answer snapshot on login (currently name + server interests).

## New-entry template

### D-XXX — Short title

- Status: Proposed / Approved / Rejected / Superseded
- Date:
- Decision or proposal:
- Source and approver: include the explicit instruction or an accessible approval reference
- Rationale:
- Related questions and workstreams:
- Dependencies and follow-up:
- Supersedes / superseded by, if applicable:
