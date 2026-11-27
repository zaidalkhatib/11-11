import test from "node:test";
import assert from "node:assert/strict";
import {
  allConditionsAccepted,
  conditionCheckboxes,
  conditionDocuments,
  emptyConditionAcceptances,
  requiredConditionIds,
} from "../src/conditions.ts";

test("every required checkbox must be accepted before profile creation", () => {
  const accepted = emptyConditionAcceptances();
  assert.equal(allConditionsAccepted(accepted), false);
  assert.equal(requiredConditionIds.length, conditionCheckboxes.length);
  assert.ok(requiredConditionIds.length >= 6);
  for (const id of requiredConditionIds.slice(0, -1)) accepted[id] = true;
  assert.equal(allConditionsAccepted(accepted), false);
  accepted[requiredConditionIds.at(-1)!] = true;
  assert.equal(allConditionsAccepted(accepted), true);
});

test("conditions pages cover terms, membership, privacy, community, and safety", () => {
  const ids = conditionDocuments.map((doc) => doc.id);
  assert.deepEqual(ids, ["terms", "membership", "privacy", "community", "safety"]);
  for (const doc of conditionDocuments) {
    assert.ok(doc.title.length > 3);
    assert.ok(doc.sections.length >= 3);
    assert.ok(doc.sections.every((section) => section.body.length > 40));
  }
  assert.ok(conditionCheckboxes.some((item) => item.docId === "terms"));
  assert.ok(conditionCheckboxes.some((item) => item.docId === "membership"));
  assert.ok(conditionCheckboxes.some((item) => item.id === "age"));
  assert.ok(conditionCheckboxes.some((item) => item.id === "esign"));
  assert.ok(conditionDocuments[0].sections.some((section) => /arbitration/i.test(section.body)));
  assert.ok(conditionDocuments[1].sections.some((section) => /California Civil Code/i.test(section.body)));
});
