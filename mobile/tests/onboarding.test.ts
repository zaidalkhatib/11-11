import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyAnswers,
  personalityQuestions,
  questionHelper,
  QUESTION_COUNT,
  PHOTO_STEP,
  TRAIT_OFFSET,
  onboardingOrder,
  onboardingSections,
  questionSection,
  flowReducer,
  initialFlow,
  isComplete,
  isStepValid,
  formatUsPhoneInput,
  toggleChoice,
  type Answers,
} from "../src/onboarding.ts";
const complete = (): Answers => ({
  name: "Alex",
  phone: "4155550100",
  city: "San Diego",
  experiences: ["Dinner"],
  energy: 3,
  conversations: ["Big ideas", "Food"],
  note: "",
  traits: Object.fromEntries(personalityQuestions.map(q => {
    const min = "min" in q ? q.min : 1;
    return [q.key, q.options.slice(0, min)];
  })),
  photoUri: "preview://photo",
});
test("phone OTP jumps to code then new users resume at name", () => {
  let f = initialFlow();
  f = flowReducer(f, { type: "awaitCode", phone: "(415) 555-0100" });
  assert.equal(f.question, 3);
  assert.equal(f.answers.phone, "(415) 555-0100");
  f = flowReducer(f, { type: "codeVerifiedNew" });
  assert.equal(f.question, 1);
  assert.equal(f.phoneVerified, true);
  f = flowReducer(f, { type: "answer", patch: { name: "Alex" } });
  f = flowReducer(f, { type: "next" });
  assert.equal(f.question, 2);
  f = flowReducer(f, { type: "answer", patch: { city: "San Diego" } });
  f = flowReducer(f, { type: "next" });
  // Skip code step (already verified); continue later "The basics" prompts — never back to OTP.
  assert.equal(f.stage, "questions");
  assert.notEqual(f.question, 3);
  assert.ok(f.question > 3);
});
test("starts before signup and requires four introduction pages", () => {
  let f = initialFlow();
  for (let i = 0; i < 3; i++) f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "intro");
  assert.equal(f.intro, 3);
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "questions");
  assert.equal(f.question, 0);
});
test("cannot skip an unanswered question or enter home without complete answers", () => {
  const f = { ...initialFlow(), stage: "questions" as const };
  assert.equal(flowReducer(f, { type: "next" }), f);
  assert.equal(
    flowReducer({ ...f, stage: "review" }, { type: "next" }).stage,
    "review",
  );
  assert.equal(isComplete(emptyAnswers()), false);
});
test("requires valid choices, name, social energy, personality options and photo", () => {
  const a = complete();
  assert.equal(isComplete(a), true);
  assert.equal(isStepValid(0, { ...a, phone: "bad" }), false);
  assert.equal(isStepValid(0, { ...a, phone: "" }), false);
  assert.equal(isStepValid(0, { ...a, phone: "4153193286" }), true);
  assert.equal(isStepValid(0, { ...a, phone: "14155550100" }), true);
  assert.equal(isStepValid(0, { ...a, phone: "(415) 555-0100" }), true);
  assert.equal(isStepValid(0, { ...a, phone: "0555550100" }), false);
  assert.equal(isStepValid(1, { ...a, name: "   " }), false);
  assert.equal(isStepValid(1, { ...a, name: "Alex" }), true);
  assert.equal(isStepValid(2, { ...a, city: "" }), false);
  assert.equal(isStepValid(2, { ...a, city: "San Diego" }), true);
  assert.equal(isStepValid(4, { ...a, energy: 6 }), false);
  assert.equal(isStepValid(4, { ...a, energy: 2.5 }), false);
  assert.equal(isStepValid(5, { ...a, conversations: ["Food"] }), false);
  assert.equal(isStepValid(TRAIT_OFFSET, { ...a, traits: {} }), false);
  assert.equal(isStepValid(TRAIT_OFFSET, { ...a, traits: { gender: ["Invented"] } }), false);
  assert.equal(isStepValid(PHOTO_STEP, { ...a, photoUri: "" }), false);
  assert.equal(isComplete({ ...a, photoUri: "" }), false);
  assert.equal(isStepValid(PHOTO_STEP, a), true);
  assert.equal(questionSection(PHOTO_STEP), "Love & connection");
  assert.equal(onboardingOrder[onboardingOrder.length - 1], PHOTO_STEP);
});
test("valid complete path passes questions, review, conditions, then gated home", () => {
  let f = {
    ...initialFlow(),
    stage: "questions" as const,
    answers: complete(),
  };
  while (f.stage === "questions" || f.stage === "section") {
    f = flowReducer(f, { type: "next" });
  }
  assert.equal(f.stage, "review");
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "conditions");
  for (const id of Object.keys(f.conditionsAccepted)) {
    if (!f.conditionsAccepted[id]) f = flowReducer(f, { type: "toggleCondition", id });
  }
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "home");
});
test("review edit returns to review after a complete profile change", () => {
  let f = {
    ...initialFlow(),
    stage: "review" as const,
    answers: complete(),
  };
  f = flowReducer(f, { type: "edit", question: 1 });
  assert.equal(f.stage, "questions");
  assert.equal(f.question, 1);
  assert.equal(f.reviewAfterEdit, true);
  f = flowReducer(f, { type: "answer", patch: { name: "Sam" } });
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "review");
  assert.equal(f.answers.name, "Sam");
  assert.equal(f.reviewAfterEdit, false);
});

test("each personality question validates single/multiple choice boundaries", () => {
  personalityQuestions.forEach((q, i) => {
    const a = complete();
    const step = i + TRAIT_OFFSET;
    assert.equal(isStepValid(step, a), true);
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: [] } }), false);
    const max = "max" in q ? q.max : 1;
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: q.options.slice(0, max + 1) } }), false);
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: [q.options[0], q.options[0]] } }), false);
  });
});
test("profile patches preserve app access and unrelated answers", () => {
  const home = { ...initialFlow(), stage: "home" as const, answers: complete() };
  const religion = personalityQuestions.find(q => q.key === "religion")!.options[0];
  const updated = flowReducer(home, { type: "answer", patch: { photoUri: "local-photo", traits: {...home.answers.traits, religion: [religion]} } });
  assert.equal(updated.stage, "home");
  assert.equal(updated.answers.photoUri, "local-photo");
  assert.equal(updated.answers.name, home.answers.name);
  assert.equal(isComplete(updated.answers), true);
});

test("algo keep-list has unique keys and locked belief/looks questions", () => {
  assert.equal(TRAIT_OFFSET, 6);
  assert.equal(PHOTO_STEP, TRAIT_OFFSET + personalityQuestions.length);
  assert.equal(QUESTION_COUNT, PHOTO_STEP + 1);
  assert.equal(new Set(personalityQuestions.map(q => q.key)).size, personalityQuestions.length);
  for (const key of ["selfRating", "looksImportance", "ethnicity", "sharedBackground", "religion", "faithImportance", "sharedFaith", "politicalOutlook", "politicalFit", "financialStabilityImportance", "dealbreakers", "haveChildren"]) {
    assert.ok(personalityQuestions.some(q => q.key === key), key);
  }
  for (const key of ["height", "bodyBuild", "partnerEnergy", "partnerPriorities", "chemistry", "goodNewsSupport"]) {
    assert.ok(!personalityQuestions.some(q => q.key === key), key);
  }
  const gender = personalityQuestions.find(q => q.key === "gender");
  assert.ok(gender?.options.includes("Male"));
  assert.ok(gender?.options.includes("Female"));
  assert.ok(personalityQuestions.find(q => q.key === "interestedIn")?.options.includes("Men and women"));
});

test("phone requires a valid US number; code preview is not verification", () => {
  assert.equal(isStepValid(0, complete()), true);
  assert.equal(isStepValid(0, { ...complete(), phone: "123" }), false);
  assert.equal(isStepValid(1, complete()), true);
  assert.equal(isStepValid(2, complete()), true);
  assert.equal(isComplete({...complete(), experiences:[]}), true);
});
test("formats US phone as the user types", () => {
  assert.equal(formatUsPhoneInput("4"), "(4");
  assert.equal(formatUsPhoneInput("415"), "(415");
  assert.equal(formatUsPhoneInput("4153"), "(415) 3");
  assert.equal(formatUsPhoneInput("4153193296"), "(415) 319-3296");
  assert.equal(formatUsPhoneInput("14155550100"), "1 (415) 555-0100");
  assert.equal(isStepValid(0, { ...complete(), phone: formatUsPhoneInput("4153193296") }), true);
});
test("missing a kept trait blocks completion", () => {
  const a = complete();
  delete a.traits.selfRating;
  assert.equal(isComplete(a), false);
});

test("onboarding groups all questions once and transitions between every section",()=>{
  assert.equal(new Set(onboardingOrder).size,QUESTION_COUNT);
  let f={...initialFlow(),stage:"questions" as const,answers:complete()} as ReturnType<typeof initialFlow>;
  const completed:string[]=[];
  for(let n=0;n<QUESTION_COUNT+onboardingSections.length;n++){
    f=flowReducer(f,{type:"next"});
    if(f.stage==="section"){
      completed.push(questionSection(f.question));
      const back=flowReducer(f,{type:"back"});
      assert.equal(back.stage,"questions");
      assert.equal(back.question,f.question);
      assert.deepEqual(back.answers,f.answers);
    }
  }
  assert.deepEqual(completed,[...onboardingSections]);
  assert.equal(f.stage,"review");
});

test("every question has contextual helper copy and an explicit selection limit", () => {
  for (const question of personalityQuestions) {
    assert.ok(question.helper.length > 25, question.key);
    assert.ok(!/^Choose (one|two|up to)/.test(question.helper), question.key);
    const helper = questionHelper(question);
    const max = "max" in question ? question.max : 1;
    const min = "min" in question ? question.min : 1;
    assert.match(
      helper,
      max === 1 ? /One selection\./ : min === max ? new RegExp(`Choose ${max}\\.`) : /Up to \d selections\./,
    );
  }
});
test("partner compatibility questions are required and independently editable", () => {
  const keys = ["relationshipStructure", "childrenAlignment", "partnerHasChildren", "smokingFit", "drinkingFit", "smokingOwn", "drinkingOwn", "dietary", "petsFit", "age", "looksImportance", "partnerCareerDrive", "partnerFitness", "sharedBackground", "dealbreakers"];
  const answers = emptyAnswers();
  for (const key of keys) {
    const index = personalityQuestions.findIndex(q => q.key === key);
    assert.ok(index >= 0, key);
    assert.equal(isStepValid(index + TRAIT_OFFSET, answers), false);
    const question = personalityQuestions[index];
    const min = "min" in question ? question.min : 1;
    const validPick = question.options.slice(0, min);
    assert.ok(isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: validPick}}));
    if (min > 1) {
      assert.equal(isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: [question.options[0]]}}), false);
    }
    assert.ok(!isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: ["invented answer"]}}));
  }
});

test("toggleChoice respects maximum selections", () => {
  assert.deepEqual(toggleChoice(["A"], "B", 2), ["A", "B"]);
  assert.deepEqual(toggleChoice(["A", "B"], "C", 2), ["A", "B"]);
  assert.deepEqual(toggleChoice(["A", "B"], "A", 2), ["B"]);
});

test("returningHome restores server answers and skips signup", () => {
  const restored = { ...complete(), name: "Sam", phone: "(415) 555-0199", photoUri: "https://cdn.example/p.jpg" };
  const f = flowReducer(initialFlow(), {
    type: "returningHome",
    name: "Sam",
    phone: "(415) 555-0199",
    answers: restored,
  });
  assert.equal(f.stage, "home");
  assert.equal(f.phoneVerified, true);
  assert.equal(f.answers.name, "Sam");
  assert.equal(f.answers.phone, "(415) 555-0199");
  assert.equal(f.answers.photoUri, "https://cdn.example/p.jpg");
  assert.equal(f.answers.energy, 3);
});
