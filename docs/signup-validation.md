# Signup, messaging and app-download preview validation

Date: 2026-11-08. Website source: `2097806214dab85ed25f1421925ae1b54330b2e0`.

## Scope

Reviewed all three user-supplied reference images visually before implementation. Used their signup structure, phone-entry pattern and rich conversation cards as inspiration. No private contact details, phone numbers, messages, logos or screenshot assets were copied into the website.

Added Sign up and Download our app actions. Signup is a local browser prototype, with a reserved sample phone number, input validation, message bubbles, example invitations, details, alternate invitation, simulated acceptance, local composer and reset. Download opens an iOS-coming-soon concept. There is no App Store/TestFlight URL, real account, phone verification, SMS, iMessage, booking or payment. Country-code examples are not a service-availability claim.

## Verified

- TypeScript, ESLint and production build passed.
- All 10 unit tests passed, including blank/malformed/short/long phone inputs, North American length, international total digit bounds, unique country codes and empty/overlong chat messages.
- Local HTTP readiness returned 200.
- Desktop and narrow Chrome visual checks completed. Narrow measured viewport was 355 CSS pixels with no horizontal overflow.
- Empty signup submission shows an inline error and returns focus to the phone field.
- Sample number advances into the chat preview without any verification or external send.
- Experience selection renders the matching example card. Details expand; alternate invitation changes content; simulated acceptance disables its action.
- Composer accepts a local text example and displays it with a clear local-demo reply. Empty send remains disabled.
- Restart and close/reopen clear phone input; verified the reopened input value was empty. Escape closes the dialog.
- Download panel accurately states that no App Store or TestFlight download exists and routes back to signup preview.
- Final local browser warning/error logs were empty. Native dialog and focused headings provide keyboard access. Mobile input sizing was adjusted to avoid small-input zoom, but real Safari behavior is not tested.
- Source helper confirmed the exact pushed commit and matching packaged build; website Git working tree was clean afterward.

## Limits and next gates

This is not production signup or a messaging integration. No physical iPhone/Safari, VoiceOver, OS keyboard, full accessibility audit or provider connection was tested. Phone formatting checks are illustrative UI validation, not verification, eligibility or international number assurance. Inputs/messages remain in React memory only and clear when the signup dialog closes or reloads; no storage or submit endpoint exists.

Before production: approve fields/consent/policies, implement server verification and validation, access control, rate limits, delivery and failure states, retention/deletion and operational support. Verify messaging-provider eligibility and actual supported rich-card/actions before promising iMessage behavior. Preserve all unresolved product and safety gates.

## Private publication

The updated preview was successfully published at https://eleven-eleven-rendezvous.goldmeter1.chatgpt.site on 2026-11-08 at 21:41 UTC. Access remains owner-private. Deployment: `appgdep_6af0ec902960819199a49d1e09225454`. The native hosting service verified success; a separate hosted-browser smoke test was not run. Local preview server stopped after validation.
