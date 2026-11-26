import test from "node:test";
import assert from "node:assert/strict";
import {profileProgress} from "../src/profile-progress.ts";
import {emptyAnswers,personalityQuestions} from "../src/onboarding.ts";
test("profile bars start empty and reflect saved responses",()=>{
 const a=emptyAnswers();
 assert.ok(profileProgress(a).every(p=>p.answered===0&&p.percent===0));
 a.name="Alex";
 assert.equal(profileProgress(a)[0].answered,1);
 a.traits=Object.fromEntries(personalityQuestions.map(q=>[q.key,[q.options[0]]]));
 a.phone="+1 555 000 0000";a.energy=3;a.conversations=["Food","Big ideas"];a.chemistry="Easy laughter";
 assert.ok(profileProgress(a).every(p=>p.percent===100));
 delete a.traits.bodyBuild;
 assert.ok(profileProgress(a)[0].percent<100);
});
