import test from "node:test";
import assert from "node:assert/strict";
import { hydrateAnswersFromServer, provisionalDobFromAge } from "../src/answers-hydrate.ts";
import type { Catalog, Profile, AnswersSnapshot } from "../src/contracts/client.ts";

const catalog: Catalog = {
  version: "onboarding-v1",
  questions: [
    {
      id: "energy",
      version: 1,
      title: "Energy",
      kind: "SELF",
      optional: null,
      target: null,
      sensitive: false,
      scoring: "INACTIVE",
      maximum: 1,
      options: [
        { id: "o01", label: "1", declined: false, exclusive: true },
        { id: "o03", label: "3", declined: false, exclusive: true },
      ],
    },
    {
      id: "conversations",
      version: 1,
      title: "Talk",
      kind: "SELF",
      optional: null,
      target: null,
      sensitive: false,
      scoring: "INACTIVE",
      maximum: 3,
      options: [
        { id: "o01", label: "Big ideas", declined: false, exclusive: false },
        { id: "o02", label: "Food", declined: false, exclusive: false },
      ],
    },
    {
      id: "gender",
      version: 1,
      title: "Gender",
      kind: "SELF",
      optional: null,
      target: null,
      sensitive: false,
      scoring: "INACTIVE",
      maximum: 1,
      options: [{ id: "o01", label: "Woman", declined: false, exclusive: true }],
    },
  ],
};

test("hydrateAnswersFromServer maps profile + labeled choices", () => {
  const profile: Profile = {
    displayName: "Alex",
    dateOfBirth: "1995-01-01",
    version: 1,
    identityVerified: false,
    photoUrl: "https://cdn.example/alex.jpg",
  };
  const snapshot: AnswersSnapshot = {
    revision: "1",
    answers: {
      energy: { version: 1, status: "ANSWERED", choices: ["o03"], sensitiveConsent: false },
      conversations: {
        version: 1,
        status: "ANSWERED",
        choices: ["o01", "o02"],
        sensitiveConsent: false,
      },
      gender: { version: 1, status: "ANSWERED", choices: ["o01"], sensitiveConsent: false },
    },
  };
  const answers = hydrateAnswersFromServer(catalog, profile, snapshot, "(415) 555-0100");
  assert.equal(answers.name, "Alex");
  assert.equal(answers.phone, "(415) 555-0100");
  assert.equal(answers.photoUri, "https://cdn.example/alex.jpg");
  assert.equal(answers.energy, 3);
  assert.deepEqual(answers.conversations, ["Big ideas", "Food"]);
  assert.deepEqual(answers.traits.gender, ["Woman"]);
});

test("provisionalDobFromAge rejects minors and non-integers", () => {
  assert.equal(provisionalDobFromAge("17"), null);
  assert.equal(provisionalDobFromAge("25.5"), null);
  assert.match(provisionalDobFromAge("30") ?? "", /^\d{4}-01-01$/);
});
