# 11:11 — Shared project brief

Status: website concept and iOS-first UI-only app execution authorized (D-014), updated 2026-11-08; original organization baseline retained in the decision log. Applies to all four workstreams. Approved requirements are traced in the [decision log](decision-log.md).

## Confirmed requirements

- 11:11 is exclusively for 1:1 blind dates. There are no group events.
- People sign up for experiences. 11:11 matches two compatible people based on personality, notifies them, and arranges dinner or activity logistics.
- Inspiration comes from [222](https://222.place/), specifically personality-based matching, curated experiences, anticipation before meeting, and a premium aesthetic. This describes the user's inspiration, not independently verified details of 222's operations.
- The original written visual direction was dark forest-green texture, warm ivory serif typography, translucent rounded cards, subtle illustrations, and an intimate invitation-like feel. The latest instruction retains the premium reference style but explicitly requests different color and animation (D-009). The website implementation retains midnight aubergine, copper and warm cream. D-013 replaces the earlier large orbit/rendezvous scene with a compact changing experience pill and small original illustration; final brand acceptance remains open.
- Build the website first, then prioritize iOS with a cross-platform approach. React Native or an equivalent approach may be evaluated; the user has not mandated a vendor or framework (D-010).
- The user subsequently requested **Download our app**, **Sign up**, and an eventual iMessage-like conversation inspired by supplied screenshots (D-011). The current implementation is a local-only phone-entry/chat demonstration and an iOS coming-soon concept, not a released app or messaging integration.
- The landing must fit a single dynamic viewport without page scrolling, with smaller bottom-centered Sign up and Download our app buttons and the surrounding supporting text removed (D-012). D-013 simplifies the hero to one purpose sentence and a compact changing experience pill while retaining the Dinner/adventure/creative interactive bar. This requirement applies to the landing; dialogs retain internal scrolling for accessible signup/chat content.
- The 11:11 identity must be original. Do not copy 222 branding, assets, or wording, or assume access to its proprietary matching algorithm.
- Detailed product decisions remain unresolved. Record unknowns rather than inventing requirements.
- CEO is the user's coordinator in a separate conversation. Conversation history is not automatically shared.

## Latest app UI authorization

D-014 authorizes building the iOS-first UI now, iterating from an original design without requiring screenshots or backend work. Show slowly revealed informational pages first, followed by mandatory personality questions, then allow access to the app. The implementation uses local-memory demo answers and clearly labeled sample experiences. Exact question wording, authentication, matching, privacy and operating policies remain proposals. This supersedes earlier mobile-implementation exclusions below only for the local UI prototype; production launch boundaries remain.

## Website-phase authorization and boundaries (historical)

Website design and implementation, live reference inspection, and cross-platform architecture planning are now authorized (D-008–D-010). The earlier screenshot hold is superseded by the explicit instruction to inspect the live reference first. The website implementation lead reports inspecting 222 before implementation on 2026-11-08.

The current deliverable is a concept preview, including the later authorized signup/download/chat interface addition (D-011). The implementation lead reports inspecting all three supplied screenshots: a minimal cream signup control, phone-first welcome with country prefix, and a Messages window with rich invitation cards and reply actions. Private contact details from these references must not be reproduced. Phone entry has preview validation and a sample-number option; a valid-looking number does not establish ownership. The chat supports experience replies, invitation accept/details/alternate actions, typed demo messages and restart. Inputs remain in React memory, clear on closing signup or reloading, and are not submitted. No account, verification text, real acceptance, booking, SMS or iMessage message is created. No live signup, waitlist collection, production matching, mobile implementation, payments, booking, spending, or outreach is authorized by this phase. Do not imply available venues, approved pricing, validated compatibility, or guaranteed outcomes. Publishing a production service requires the applicable gates in [validation and launch gates](validation-and-launch-gates.md). Charters beyond the authorized website work remain future scope.

The latest minimalist revision (D-013) removes the footer, idea panel and visible play/pause control. The header contains only the logo and how-it-works; the latter displays information without further actions apart from closing. The compact experience pill automatically changes every six seconds, stops automatic selection for reduced motion, and suspends it while a dialog is open. Signup/download retain their local-only and coming-soon boundaries. Earlier layout decisions remain in the log; no fresh production launch authorization is implied. Validation and publication of this revision are pending the implementation lead’s report.

## Open questions

All questions are unresolved and require user direction or an explicitly approved decision. IDs are stable for handoffs.

- **Q-01 — Audience and eligibility:** Who is the initial audience? What age, location, relationship-intent, and other eligibility rules apply?
- **Q-02 — Launch scope:** Which geography, audience size, and experience types should be considered first?
- **Q-03 — Signup:** Phone-first concept interaction is now specified (D-011), but account verification, required fields, consent and actual signup commitments remain unresolved. What does signing up for an experience commit someone to, and what availability or preferences are collected?
- **Q-04 — Personality matching:** What personality inputs, compatibility criteria, preferences, dealbreakers, and human review should be considered? What does success mean? No algorithm is selected.
- **Q-05 — Reveal and anticipation:** What information is revealed, at what time, through which notifications? How blind is the date, and what consent is needed? Messages-inspired chat is a requested direction, not a selected or verified delivery channel. Native iMessage capabilities, provider access and rich-action support must be investigated before promising them.
- **Q-06 — Logistics:** Who selects venues, coordinates schedules, communicates details, and handles changes? How are accessibility and dietary needs accommodated?
- **Q-07 — Commercial model:** Is there pricing, membership, payment, or venue compensation? Who pays for dinner or activities? No model or budget is approved.
- **Q-08 — Trust and safety:** What eligibility checks, consent, reporting, blocking, support, escalation, and date-related safeguards are needed? Who owns operational response?
- **Q-09 — Privacy:** What data is necessary, who may access it, what is shared with a match or venue, and what retention/deletion rules apply?
- **Q-10 — Exceptions:** What happens with no suitable match, declined matches, cancellations, lateness, no-shows, and requests for another match?
- **Q-11 — Product scope:** What should the initial user and operator journeys include? Which channels and operational tools are needed? Website first and iOS next are confirmed; later app journeys, operational tools, and the final cross-platform framework remain open. See the architecture recommendation.
- **Q-12 — Outcomes:** What measures define compatibility, experience quality, safety, and launch readiness? What evidence and thresholds are sufficient?
- **Q-13 — Identity references:** The live reference replaces the screenshot prerequisite. Which prototype brand elements should be retained, and what final accessibility and brand acceptance criteria apply?
- **Q-14 — Governance:** Who may approve which decisions, own each workstream, resolve conflicts, and accept deliverables? CEO is confirmed as coordinator only.
- **Q-15 — Acquisition:** What positioning, acquisition channels, waitlist approach, and communications may be explored after authorization?

## Shared operating rules

Use this brief and the decision log across Design, Engineering, QA & Safety, and Growth & Experiences. Cross-reference question and decision IDs. Do not maintain conflicting private requirements. A proposed answer remains a proposal until explicitly approved; propagate approved changes to every affected document.

For separate conversations, provide an explicit handoff with the current source documents and relevant approvals. Do not assume another chat knows changes made here.
