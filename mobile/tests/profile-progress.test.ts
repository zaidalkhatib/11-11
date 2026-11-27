import test from "node:test";
import assert from "node:assert/strict";
import {profileProgress} from "../src/profile-progress.ts";
import {emptyAnswers,personalityQuestions} from "../src/onboarding.ts";
test("profile bars start empty and reflect saved responses",()=>{
 const a=emptyAnswers();
 assert.ok(profileProgress(a).every(p=>p.answered===0&&p.percent===0));
 a.name="Alex";
 assert.equal(profileProgress(a)[0].answered,1);
 a.traits=Object.fromEntries(personalityQuestions.map(q=>{const min="min"in q?q.min:1;return[q.key,q.options.slice(0,min)];}));
 a.phone="4155550100";a.city="San Diego";a.energy=3;a.conversations=["Food","Big ideas"];a.photoUri="preview://photo";
 assert.ok(profileProgress(a).every(p=>p.percent===100));
 delete a.traits.selfRating;
 assert.ok(profileProgress(a).some(p=>p.percent<100));
});
