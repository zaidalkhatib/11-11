/** Product legal copy. Fill company/legal placeholders before production; have counsel review. */

export type ConditionDocId =
  | "terms"
  | "membership"
  | "privacy"
  | "community"
  | "safety";

export type ConditionDoc = {
  id: ConditionDocId;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

export type ConditionCheckbox = {
  id: string;
  label: string;
  docId?: ConditionDocId;
};

const COMPANY = "[FULL LEGAL COMPANY NAME]";
const WEBSITE = "[WEBSITE URL]";
const ADDRESS = "[COMPANY ADDRESS]";
const CANCEL_EMAIL = "[CANCELLATION EMAIL]";
const SUPPORT_EMAIL = "[SUPPORT EMAIL]";
const EFFECTIVE = "November 26, 2026";

export const conditionDocuments: ConditionDoc[] = [
  {
    id: "terms",
    title: "Terms of Service, Liability Waiver, Assumption of Risk & Dispute Resolution",
    updated: EFFECTIVE,
    sections: [
      {
        heading: "Agreement header",
        body: `Effective Date: ${EFFECTIVE}. Last Updated: ${EFFECTIVE}. Company: ${COMPANY}. Operating As: 11:11. Website: ${WEBSITE}. Governing Jurisdiction: California, United States.`,
      },
      {
        heading: "1. Acceptance of Agreement",
        body: `By accessing, registering for, creating an account on, using, or participating in any service provided by 11:11 (“Platform”), you (“User,” “Participant,” or “you”) acknowledge that you have read, understood, and voluntarily agreed to be legally bound by this Agreement. This Agreement applies to account registration and profile creation; personality questionnaires and compatibility assessments; matching and matchmaking services; invitations and blind-date arrangements; in-person dates, dinners, activities, and events; communications with other participants; interactions with employees, contractors, organizers, partners, and third parties; and any related services provided by 11:11. If you do not agree, you must not access or use the Platform. You acknowledge that this Agreement is a legally binding contract.`,
      },
      {
        heading: "2. Eligibility and User Representations",
        body: `You represent and warrant that: (1) you are at least 18 years old; (2) you have the legal capacity to enter into this Agreement; (3) all information you provide is accurate and not misleading; (4) you will not impersonate another individual; (5) you will not use the Platform for unlawful purposes; (6) you will comply with applicable laws and regulations; and (7) you will respect other participants and their personal boundaries. 11:11 reserves the right to suspend, restrict, or terminate accounts that violate these requirements.`,
      },
      {
        heading: "3. Nature of the Service",
        body: `11:11 provides matchmaking, introductions, social coordination, and event-organizing services. You understand and acknowledge that: 11:11 does not guarantee that you will find a romantic partner; does not guarantee compatibility, attraction, chemistry, or relationship success; personality assessments and matching scores are informational tools and are not scientific guarantees of compatibility; 11:11 does not guarantee the accuracy of information submitted by other users; does not guarantee that another participant is honest, trustworthy, safe, or suitable; does not guarantee that an event, date, or interaction will meet your expectations; does not guarantee that another participant will attend an event; and may change, modify, cancel, or discontinue matching services and events. You acknowledge that dating and meeting unfamiliar individuals inherently involve uncertainty and personal judgment.`,
      },
      {
        heading: "4. Assumption of Risk",
        body: `You voluntarily acknowledge and assume all reasonably foreseeable risks associated with using the Platform and participating in activities arranged through 11:11. These risks include, without limitation: meeting strangers; incompatible personalities or expectations; disagreements, arguments, misunderstandings, or uncomfortable interactions; rejection, emotional distress, disappointment, or embarrassment; unwanted romantic attention or inappropriate conduct by other participants; accidents, falls, injuries, or illness; physical altercations; theft, loss, or damage to personal belongings; risks associated with transportation, public locations, restaurants, and activity venues; risks associated with consuming food, beverages, or alcohol; misrepresentation by other participants; harassment, misconduct, fraud, or criminal behavior by other users; and actions or omissions of venues, vendors, organizers, transportation providers, and other independent third parties. You understand that 11:11 cannot eliminate all risks associated with in-person interactions. You voluntarily accept responsibility for your own decisions, conduct, personal safety precautions, and participation.`,
      },
      {
        heading: "5. Release and Waiver of Liability",
        body: `To the fullest extent permitted by applicable law, you release and discharge ${COMPANY}, operating as 11:11, and its past, present, and future owners and shareholders; founders and directors; officers and executives; employees and contractors; agents and representatives; affiliates and subsidiaries; event organizers and coordinators acting on its behalf; and successors and assigns (collectively, the “Released Parties”). You agree that, to the fullest extent permitted by law, the Released Parties shall not be liable for claims, demands, damages, losses, costs, or expenses arising out of or relating to: (1) your use of the Platform; (2) your participation in dates, dinners, activities, or events; (3) ordinary negligence of a Released Party, where such a release is legally enforceable; (4) actions, statements, omissions, or misconduct of other users; (5) personal interactions between participants; (6) inaccurate information provided by users; (7) venue conditions or third-party services, to the extent legally permissible; (8) personal injury or property damage arising from risks that you voluntarily assumed; and (9) cancellations, scheduling changes, or disruptions, subject to applicable consumer protection laws. IMPORTANT LEGAL LIMITATIONS: Nothing in this Agreement releases or limits liability for fraud, intentional misconduct, willful injury, violations of law, or any other liability that cannot legally be waived. Nothing in this Agreement purports to release liability for gross negligence where such a release is prohibited by applicable law. This section is intended to establish the broadest lawful release of liability available under applicable law, not to eliminate rights that cannot legally be waived.`,
      },
      {
        heading: "6. Independent Third Parties and Venues",
        body: `11:11 may coordinate dates and events at restaurants, bars, cafes, entertainment establishments, and other third-party locations. Unless expressly stated otherwise: venues are independently owned and operated; transportation providers are independent third parties; other participants are independent individuals; and third-party vendors are not employees or agents of 11:11 merely because they participate in an event. 11:11 does not own, operate, supervise, or control every third-party venue or service provider. You acknowledge that third parties may have their own policies, safety procedures, and terms of service. Nothing in this section eliminates responsibilities that 11:11 may independently have under applicable law.`,
      },
      {
        heading: "7. User Conduct and Safety",
        body: `You agree that you will not: harass, threaten, intimidate, or stalk another participant; engage in unwanted physical contact; engage in sexual harassment or assault; engage in discrimination or abusive conduct; use threats, coercion, or manipulation; commit fraud, theft, or other unlawful acts; share another participant’s private information without authorization; photograph, record, or distribute private interactions without appropriate consent; attend events while engaging in dangerous or disruptive behavior; or use the Platform to solicit, exploit, or harm another participant. Consent must be freely given, informed, and revocable at any time. 11:11 reserves the right to investigate reported misconduct, restrict accounts, remove participants from events, and cooperate with law enforcement where appropriate. You acknowledge that reporting a safety concern does not guarantee a particular outcome or eliminate all potential risks.`,
      },
      {
        heading: "8. No Guarantee of Background Checks or User Verification",
        body: `Unless expressly communicated in writing, 11:11 does not represent that it conducts comprehensive criminal background checks, identity verification, employment verification, financial verification, or other investigations of every participant. Any verification process that 11:11 may implement is limited to the scope expressly described. You must independently exercise reasonable judgment when interacting with other participants. You should not rely on another user’s presence on the Platform as proof of their identity, character, background, intentions, or safety.`,
      },
      {
        heading: "9. Personal Responsibility During Events",
        body: `You are solely responsible for your personal decisions and conduct during events, including: your transportation to and from the venue; your decision to consume or decline food and beverages; your decision to consume or decline alcohol; your personal belongings; your interactions and physical boundaries; your decision to leave an event; and your compliance with venue rules and applicable laws. You are never required to remain at a date or event if you feel uncomfortable or unsafe. You should contact emergency services when appropriate.`,
      },
      {
        heading: "10. Indemnification",
        body: `To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless the Released Parties against third-party claims, liabilities, damages, judgments, reasonable legal fees, and expenses arising out of or relating to: (1) your violation of this Agreement; (2) your violation of applicable law; (3) your misconduct or unlawful behavior; (4) your infringement of another person’s rights; (5) your unauthorized use of the Platform; (6) your negligent or intentional actions toward another participant or third party; and (7) claims arising from content or information you submit to the Platform. This indemnification obligation does not apply to the extent a claim arises from the Released Parties’ own conduct where applicable law prohibits such indemnification. 11:11 reserves the right to participate in the defense of any claim subject to indemnification. You may not settle a claim in a manner that imposes liability or obligations on a Released Party without that party’s written consent.`,
      },
      {
        heading: "11. Limitation of Liability",
        body: `To the fullest extent permitted by law: 11:11 shall not be responsible for indirect, incidental, special, exemplary, punitive, or consequential damages arising from your use of the Platform. Where legally permissible, the aggregate liability of 11:11 for claims arising out of or relating to the Platform shall not exceed the greater of (a) the amount you paid directly to 11:11 during the twelve months preceding the event giving rise to the claim, or (b) one hundred U.S. dollars ($100). This limitation does not apply to liabilities that cannot legally be limited or excluded, including any applicable non-waivable statutory remedies.`,
      },
      {
        heading: "12. Dispute Resolution and Mandatory Arbitration",
        body: `PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS. Except for claims that are legally ineligible for arbitration or otherwise exempt under applicable law, you and 11:11 agree to resolve disputes through binding individual arbitration rather than court litigation. Before initiating arbitration, the parties agree to make a good-faith effort to resolve the dispute informally. A party must provide written notice describing the nature of the dispute, the relevant facts, the requested resolution, and contact information for responding to the notice. The parties will have at least 30 days to attempt an informal resolution. If the dispute remains unresolved, it may proceed to binding arbitration administered by the American Arbitration Association (AAA) under its applicable consumer arbitration rules. The arbitration shall: (1) be conducted by a neutral arbitrator; (2) be conducted on an individual basis; (3) take place in the county of your residence or another mutually agreed location, subject to applicable law; (4) permit remedies available under applicable law; and (5) follow applicable consumer arbitration fee requirements. 11:11 will pay arbitration costs beyond the consumer filing fees to the extent required by applicable law and the applicable arbitration rules. Nothing in this section prevents either party from bringing an individual claim in small claims court when eligible, or from seeking temporary emergency relief from a court when legally appropriate.`,
      },
      {
        heading: "13. Class Action and Jury Trial Waiver",
        body: `To the fullest extent permitted by law, you and 11:11 agree that disputes will be brought only in an individual capacity. You waive the right to participate in a class action, collective action, representative action, or consolidated proceeding to the extent such a waiver is legally enforceable. You and 11:11 also waive the right to a jury trial for disputes that are validly subject to arbitration or for which a jury waiver is otherwise enforceable. Nothing in this section waives any statutory right that applicable law makes non-waivable.`,
      },
      {
        heading: "14. Account Suspension and Termination",
        body: `11:11 may suspend, restrict, or terminate your account when: you violate this Agreement; you engage in harassment or misconduct; you create a safety risk; you provide materially false information; you engage in unlawful activities; or your conduct negatively affects other participants or the integrity of the Platform. Where appropriate, 11:11 may remove content, restrict access, cancel invitations, or prohibit participation in future events. Termination does not eliminate obligations or liabilities that accrued before termination.`,
      },
      {
        heading: "15. Cancellations, Refunds, and Events",
        body: `Event participation may be subject to separate booking, cancellation, and refund policies. 11:11 reserves the right to modify or cancel an event when reasonably necessary. Any refund eligibility, cancellation charges, or rescheduling rights will be governed by the applicable event policy and mandatory consumer protection laws. Nothing in this Agreement eliminates any refund or cancellation rights provided by applicable law.`,
      },
      {
        heading: "16. Privacy and Personal Information",
        body: `Your use of the Platform is also governed by the 11:11 Privacy Policy. The Privacy Policy explains how personal information is collected, used, stored, disclosed, and protected. 11:11 will process personal information in accordance with its published Privacy Policy and applicable privacy laws. You acknowledge that matching services may require processing information about your preferences and questionnaire responses. No provision of this Agreement constitutes blanket consent to disclose sensitive personal information or to use personal information for purposes not properly disclosed.`,
      },
      {
        heading: "17. Intellectual Property",
        body: `The Platform, including its software, branding, design, logos, content, matching systems, and proprietary materials, belongs to 11:11 or its licensors. You may not copy, reproduce, distribute, reverse engineer, exploit, or commercially use protected Platform materials without prior written authorization, except where applicable law permits. You retain ownership of content you submit, subject to a limited license allowing 11:11 to operate and provide the services in accordance with its Privacy Policy and applicable law.`,
      },
      {
        heading: "18. Force Majeure",
        body: `11:11 shall not be responsible for delays or failures caused by circumstances beyond its reasonable control, including natural disasters, severe weather, government actions, public emergencies, transportation disruptions, labor disputes, infrastructure failures, and other qualifying force majeure events. This provision does not eliminate refund obligations or other non-waivable rights under applicable law.`,
      },
      {
        heading: "19. Governing Law and Jurisdiction",
        body: `This Agreement shall be governed by the laws of the State of California, without regard to conflict-of-law principles, except where applicable federal law or mandatory law requires otherwise. For disputes that are not subject to arbitration, the parties agree to the jurisdiction and venue of courts located in California, subject to applicable consumer venue protections.`,
      },
      {
        heading: "20. Severability",
        body: `If any provision of this Agreement is determined to be invalid, unlawful, or unenforceable, that provision shall be limited or severed to the minimum extent necessary. The remaining provisions shall remain effective to the fullest extent permitted by law. If an arbitration or class action waiver provision is unenforceable in a particular circumstance, the remaining enforceable provisions shall continue to apply to the extent legally permissible.`,
      },
      {
        heading: "21. No Waiver",
        body: `Failure by 11:11 to enforce any provision of this Agreement shall not constitute a waiver of its right to enforce that provision in the future.`,
      },
      {
        heading: "22. Entire Agreement",
        body: `This Agreement, together with the Privacy Policy and any applicable event-specific terms, constitutes the entire agreement between you and 11:11 regarding the subject matter covered herein. It supersedes prior agreements and understandings concerning that subject matter, except where otherwise expressly stated.`,
      },
      {
        heading: "23. Modifications",
        body: `11:11 may update this Agreement from time to time. Material changes will be communicated through appropriate channels when required by law. Where legally required, 11:11 will obtain renewed consent before applying material changes to existing users. Continued use of the Platform following the effective date of a properly communicated update constitutes acceptance only to the extent legally recognized.`,
      },
      {
        heading: "24. Electronic Signature and Consent",
        body: `You acknowledge that: you have had an opportunity to review this Agreement; you understand that it contains liability limitations and dispute resolution provisions; you understand that arbitration may replace court litigation for covered disputes; you understand that you are waiving certain legal rights to the extent permitted by law; you voluntarily agree to its terms; and your electronic acceptance constitutes your electronic signature. You agree that electronic records and signatures may be used to establish your acceptance of this Agreement, consistent with applicable electronic signature laws.`,
      },
      {
        heading: "User Acknowledgment and Acceptance",
        body: `By selecting “I Agree,” ticking the required acceptance boxes, or electronically signing, you acknowledge that you have read and voluntarily accepted this Agreement.`,
      },
    ],
  },
  {
    id: "membership",
    title: "Paid Membership & Automatic Renewal Agreement",
    updated: EFFECTIVE,
    sections: [
      {
        heading: "Agreement header",
        body: `Company: ${COMPANY}, operating as 11:11. Business Address: ${ADDRESS}. Cancellation Email: ${CANCEL_EMAIL}. Effective Date: ${EFFECTIVE}. Membership Agreement Version: 1.0.`,
      },
      {
        heading: "Important California Cancellation Notice",
        body: `YOU, THE BUYER, MAY CANCEL THIS AGREEMENT, WITHOUT ANY PENALTY OR OBLIGATION, AT ANY TIME PRIOR TO MIDNIGHT OF THE THIRD BUSINESS DAY FOLLOWING THE DATE OF THIS AGREEMENT, EXCLUDING SUNDAYS AND HOLIDAYS. TO CANCEL, YOU MAY SEND WRITTEN NOTICE OF YOUR INTENTION TO CANCEL TO ${CANCEL_EMAIL}. YOU MAY ALSO USE ANY OTHER CANCELLATION METHOD PROVIDED BY APPLICABLE LAW. ALL MONEY PAID PURSUANT TO A VALID CANCELLATION UNDER THIS RIGHT WILL BE REFUNDED WITHIN 10 DAYS OF RECEIPT OF THE CANCELLATION NOTICE. Dating Service Operator: ${COMPANY}, operating as 11:11. Cancellation Email: ${CANCEL_EMAIL}.`,
      },
      {
        heading: "1. Membership Services",
        body: `11:11 provides paid access to a dating and matchmaking platform that facilitates introductions between individuals based on personal preferences, questionnaire responses, and compatibility assessments. Depending on the selected membership tier, services may include: access to matchmaking services; personality-based compatibility assessments; eligibility for curated 1:1 introductions; invitations to organized dates and experiences; access to membership features; profile management and matching preferences; and other features expressly included in the purchased membership. The precise services included in each membership tier will be disclosed before purchase.`,
      },
      {
        heading: "2. Membership Pricing",
        body: `The customer agrees to pay the membership price displayed at checkout. Membership Plan, Membership Price, Billing Frequency, Initial Billing Date, Next Renewal Date, and applicable taxes will be disclosed before payment. Billing frequency for standard membership is monthly unless otherwise stated at checkout. The complete price, billing frequency, renewal terms, and applicable cancellation policy will be displayed clearly before the customer confirms payment. 11:11 will not charge undisclosed recurring fees.`,
      },
      {
        heading: "3. Automatic Renewal",
        body: `Membership automatically renews at the end of each monthly billing period unless canceled before the next renewal. By expressly selecting the recurring payment option, you authorize 11:11 and its payment processor to charge your selected payment method the disclosed membership price on the disclosed monthly billing date until you cancel your membership. If membership pricing changes, 11:11 will provide the legally required advance notice and cancellation information. You are responsible for maintaining a valid payment method.`,
      },
      {
        heading: "4. Affirmative Consent to Recurring Payments",
        body: `You acknowledge that membership involves recurring payments. Before completing your purchase, you will be presented with the membership price, billing frequency, renewal terms, and cancellation method. You must provide affirmative consent to the recurring payment arrangement. Your consent will be recorded electronically, including account identifier, date and time of consent, membership plan selected, disclosed price and billing frequency, agreement version, and records of the affirmative consent action. 11:11 will retain verification of affirmative consent for at least three years or one year after termination, whichever period is longer, as required by California law.`,
      },
      {
        heading: "5. Free Trials and Promotional Memberships",
        body: `If 11:11 offers a free or discounted trial: the trial duration will be disclosed before enrollment; the price following the trial will be clearly disclosed; the date of the first paid charge will be disclosed; the user must affirmatively consent to the applicable recurring payment arrangement; and users must be able to cancel before the first paid charge. Promotional pricing does not eliminate the user’s statutory cancellation rights.`,
      },
      {
        heading: "6. Ordinary Membership Cancellation",
        body: `You may cancel your recurring membership at any time through the membership settings in your account. The cancellation mechanism will be accessible online and will not require unnecessary communication with customer support. Upon cancellation: future automatic renewals will stop; no additional recurring membership charges will be made after cancellation takes effect; and your existing paid membership access will generally continue until the end of the current billing period. Cancellation does not automatically entitle you to a refund for previously used membership periods, except where required by law or expressly provided by 11:11’s refund policy. Canceling a membership does not waive your separate statutory right to cancel the original dating-service contract within the applicable three-business-day period.`,
      },
      {
        heading: "7. California Statutory Cancellation Rights",
        body: `Nothing in this Agreement limits the cancellation rights provided under California Civil Code Sections 1694.1 and 1694.2. You may cancel the original dating-service agreement before midnight of the third business day following the date of the agreement, excluding Sundays and holidays. For online dating services, written cancellation may be submitted by email to ${CANCEL_EMAIL}. A cancellation notice does not need to follow a particular format, provided it communicates your intention to cancel. All money paid pursuant to a valid statutory cancellation must be refunded within 10 days of receipt of the cancellation notice.`,
      },
      {
        heading: "8. Death or Disability",
        body: `If, because of death or qualifying disability, you are unable to receive all services covered by your membership: you or your estate may elect to be relieved of future payment obligations for services not received; and any prepaid amount allocable to services not received must be refunded promptly. A qualifying disability must be documented by a physician as required by California Civil Code Section 1694.3. Where the statute permits, if the physician determines that the disability will last less than six months, 11:11 may extend the contract for six months without additional charge instead of canceling it.`,
      },
      {
        heading: "9. Relocation",
        body: `California Civil Code Section 1694.3 provides certain relocation cancellation rights for qualifying dating-service contracts. However, the statutory relocation provision excludes online dating services generally available regionally, nationally, or globally. Any applicable statutory relocation rights will be honored.`,
      },
      {
        heading: "10. Membership Services and No Guarantee",
        body: `Membership provides access to the services described in the selected plan. Payment does not guarantee: a romantic relationship; a particular match; a specific compatibility score; a specific number of successful dates unless expressly included in the plan; that another participant will attend; or that another participant will meet your expectations. 11:11 will make reasonable efforts to provide the services advertised and purchased.`,
      },
      {
        heading: "11. Payment Processing",
        body: `Payments may be processed through third-party payment providers. 11:11 does not intend to store complete payment card credentials on its own servers when those credentials can be securely handled by its payment processor. You authorize the applicable payment processor to process charges associated with your membership. Payment disputes and unauthorized transactions may be reported to 11:11 at ${SUPPORT_EMAIL}.`,
      },
      {
        heading: "12. Billing Errors and Refunds",
        body: `If you believe you have been incorrectly charged, contact ${SUPPORT_EMAIL}. 11:11 will review billing disputes and correct verified errors. Refunds will be handled in accordance with applicable California dating-service laws, applicable automatic renewal laws, the advertised membership terms, the published refund policy, and other applicable consumer protection laws. Nothing in this Agreement eliminates non-waivable consumer rights.`,
      },
      {
        heading: "13. Membership Termination by 11:11",
        body: `11:11 may suspend or terminate membership for legitimate reasons, including fraudulent payment activity, material violations of the Terms of Service, harassment or threats toward other participants, illegal activity, or conduct presenting a credible safety risk. Where membership is terminated by 11:11, refunds for unused prepaid services will be handled in accordance with applicable law and the circumstances of termination.`,
      },
      {
        heading: "14. Agreement with Other Legal Documents",
        body: `This Agreement supplements the 11:11 Terms of Service. Your membership is also subject to the applicable Privacy Policy, Community Guidelines, Safety Policy, Liability Waiver and Assumption of Risk Agreement, and Cancellation and Refund Policy. If a provision conflicts with a mandatory statutory consumer protection, the mandatory statutory requirement controls.`,
      },
      {
        heading: "15. Electronic Acceptance",
        body: `You acknowledge that you have reviewed the membership price, renewal frequency, cancellation terms, and applicable legal agreements. Your affirmative electronic acceptance constitutes your agreement to the membership terms, subject to applicable law.`,
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    updated: EFFECTIVE,
    sections: [
      {
        heading: "1. Scope",
        body: `This Privacy Policy describes how ${COMPANY}, operating as 11:11, collects, uses, shares, and retains personal information when you use the Platform at ${WEBSITE} and in related apps or services.`,
      },
      {
        heading: "2. Information we collect",
        body: `We may collect identity and contact details (such as name, phone, city, and email); profile answers and preferences; photos you upload; device and usage data; approximate location if you enable it; communications with us; payment-related metadata from processors; and information needed for safety, fraud prevention, or legal compliance.`,
      },
      {
        heading: "3. How we use information",
        body: `We use information to create and operate your profile, run matching and introductions, arrange or suggest experiences, communicate with you, process memberships, improve the Service, enforce policies, and comply with law. Automated systems may use your answers and preferences to suggest pairings; those systems are imperfect and not a guarantee of compatibility.`,
      },
      {
        heading: "4. Sharing",
        body: `We may share information with other users as part of an introduction or profile preview you authorize; vendors who process data for us under contract; professional advisors; authorities when required by law or to protect rights and safety; and a successor entity in a merger, acquisition, or asset transfer. We do not sell personal information as ordinary commerce “sale,” though some privacy laws define “sale” or “sharing” more broadly for advertising—if we engage in such activity we will provide required notices and choices.`,
      },
      {
        heading: "5. Retention and security",
        body: `We retain information as long as needed for the purposes above, including legal, accounting, and dispute-resolution needs. No method of transmission or storage is fully secure; residual security risk remains.`,
      },
      {
        heading: "6. Your choices",
        body: `Depending on your location, you may have rights to access, correct, delete, or export personal information, or to object to certain processing. Contact ${SUPPORT_EMAIL}. You may delete your account where the product provides that control.`,
      },
      {
        heading: "7. Children",
        body: `The Service is not directed to anyone under 18. We do not knowingly collect personal information from children under 18.`,
      },
      {
        heading: "8. International users",
        body: `If you access the Service from outside the United States, you understand information may be processed in the United States, which may have different data-protection rules than your country.`,
      },
    ],
  },
  {
    id: "community",
    title: "Community Guidelines",
    updated: EFFECTIVE,
    sections: [
      {
        heading: "Be respectful",
        body: `Treat others with dignity. No hate, harassment, threats, non-consensual sexual content, or discriminatory abuse.`,
      },
      {
        heading: "Be honest",
        body: `Use recent photos of yourself. Do not impersonate others or invent a false identity, age, relationship status, or intent.`,
      },
      {
        heading: "Consent and boundaries",
        body: `Respect no. Do not pressure anyone to share contact details, meet, drink, or continue a conversation. Stop if asked. Consent must be freely given, informed, and revocable.`,
      },
      {
        heading: "Safety reporting",
        body: `Report concerning behavior through available channels. We may investigate and remove accounts, but we are not an emergency service—call local authorities if you are in danger.`,
      },
      {
        heading: "Enforcement",
        body: `Violations may result in warnings, reduced visibility, suspension, or permanent bans, with or without prior notice, at our discretion, and cooperation with law enforcement where appropriate.`,
      },
    ],
  },
  {
    id: "safety",
    title: "Safety Policy",
    updated: EFFECTIVE,
    sections: [
      {
        heading: "Meet at your own discretion",
        body: `Any in-person meeting with someone you meet through 11:11 is voluntary. You alone decide whether, when, where, and how to meet. We do not supervise dates.`,
      },
      {
        heading: "Practical precautions",
        body: `Meet in public places. Tell a trusted person your plans. Arrange your own transportation. Limit alcohol. Leave if you feel unsafe. Do not share financial information or send money.`,
      },
      {
        heading: "Background checks",
        body: `Unless expressly stated otherwise in writing for a specific feature, we do not perform comprehensive criminal background checks on users and do not claim that any user is safe, trustworthy, or accurately represented.`,
      },
      {
        heading: "No emergency monitoring",
        body: `11:11 does not provide emergency assistance, real-time location monitoring of dates, or law-enforcement services. Contact emergency services when appropriate.`,
      },
    ],
  },
];

export const conditionCheckboxes: ConditionCheckbox[] = [
  {
    id: "age",
    label: "I confirm I am at least 18 years old and have the legal capacity to enter this Agreement.",
  },
  {
    id: "terms",
    label: "I have read and voluntarily agree to the Terms of Service, Liability Waiver, Assumption of Risk & Dispute Resolution Agreement, including arbitration and the class-action / jury-trial waivers.",
    docId: "terms",
  },
  {
    id: "membership",
    label: "I acknowledge the Paid Membership & Automatic Renewal Agreement, including California cancellation rights and recurring billing terms (when I purchase membership).",
    docId: "membership",
  },
  {
    id: "privacy",
    label: "I have read and agree to the Privacy Policy.",
    docId: "privacy",
  },
  {
    id: "community",
    label: "I agree to follow the Community Guidelines.",
    docId: "community",
  },
  {
    id: "safety",
    label: "I understand the Safety Policy and that meetings, venues, and other participants are my own responsibility.",
    docId: "safety",
  },
  {
    id: "accuracy",
    label: "I confirm my profile information and photo are truthful representations of me and are not misleading.",
  },
  {
    id: "esign",
    label: "I agree that ticking these boxes is my electronic signature and voluntary acceptance of the Agreements above.",
  },
];

export const requiredConditionIds = conditionCheckboxes.map((item) => item.id);

export function emptyConditionAcceptances(): Record<string, boolean> {
  return Object.fromEntries(requiredConditionIds.map((id) => [id, false]));
}

export function allConditionsAccepted(accepted: Record<string, boolean>): boolean {
  return requiredConditionIds.every((id) => accepted[id] === true);
}

export function conditionDocument(id: ConditionDocId): ConditionDoc {
  const doc = conditionDocuments.find((item) => item.id === id);
  if (!doc) throw new Error(`Unknown condition document: ${id}`);
  return doc;
}
