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
