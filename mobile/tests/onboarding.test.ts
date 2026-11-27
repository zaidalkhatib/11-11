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
  chemistry: "Easy laughter",
  note: "",
  traits: Object.fromEntries(personalityQuestions.map(q => {
    const min = "min" in q ? q.min : 1;
    return [q.key, q.options.slice(0, min)];
  })),
  photoUri: "preview://photo",
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
  assert.equal(isStepValid(6, { ...a, chemistry: "Other" }), false);
  assert.equal(isStepValid(TRAIT_OFFSET, { ...a, traits: {} }), false);
  assert.equal(isStepValid(TRAIT_OFFSET, { ...a, traits: { religion: ["Invented"] } }), false);
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
  } as ReturnType<typeof initialFlow>;
  for (let i = 0; i < QUESTION_COUNT + onboardingSections.length; i++) f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "review");
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "conditions");
  assert.equal(flowReducer(f, { type: "next" }).stage, "conditions");
  for (const id of Object.keys(f.conditionsAccepted)) f = flowReducer(f, { type: "toggleCondition", id });
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "home");
  assert.equal(flowReducer(f, { type: "next" }), f);
});
test("back preserves answers and cannot fall below first introduction", () => {
  const f = {
    ...initialFlow(),
    stage: "questions" as const,
    question: 2,
    answers: complete(),
  };
  const previous = flowReducer(f, { type: "back" });
  assert.equal(previous.question, 1);
  assert.deepEqual(previous.answers, f.answers);
  assert.equal(flowReducer(initialFlow(), { type: "back" }).intro, 0);
});
test("multi-select respects max and permits deselection at limit", () => {
  const all = ["a", "b", "c"];
  assert.deepEqual(toggleChoice(all, "d", 3), all);
  assert.deepEqual(toggleChoice(all, "a", 3), ["b", "c"]);
  assert.deepEqual(toggleChoice(["a"], "b", 3), ["a", "b"]);
});
test("editing profile relocks app until valid and re-reviewed", () => {
  const home = {
    ...initialFlow(),
    stage: "home" as const,
    answers: complete(),
  };
  let f = flowReducer(home, { type: "edit", question: 1 });
  f = flowReducer(f, { type: "answer", patch: { name: "" } });
  assert.equal(f.stage, "questions");
  assert.equal(flowReducer(f, { type: "next" }), f);
  assert.equal(flowReducer(home, { type: "edit", question: QUESTION_COUNT }), home);
});
test("restart removes every answer and starts the first intro", () => {
  const home = {
    ...initialFlow(),
    stage: "home" as const,
    answers: complete(),
  };
  assert.deepEqual(flowReducer(home, { type: "reset" }), initialFlow());
});

test("editing one answer returns to review without repeating completed questions", () => {
  const home = {
    ...initialFlow(),
    stage: "home" as const,
    answers: complete(),
  };
  let f = flowReducer(home, { type: "edit", question: 1 });
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

test("expanded profile has unique keys and required identity choices", () => {
  assert.equal(QUESTION_COUNT, 101);
  assert.equal(PHOTO_STEP, 100);
  assert.equal(TRAIT_OFFSET, 7);
  assert.equal(new Set(personalityQuestions.map(q => q.key)).size, personalityQuestions.length);
  const gender = personalityQuestions.find(q => q.key === "gender");
  assert.ok(gender?.options.includes("Male"));
  assert.ok(gender?.options.includes("Female"));
  assert.ok(!(gender?.options as readonly string[] | undefined)?.includes("Prefer not to say"));
  for (const question of personalityQuestions) {
    assert.ok(!("optional" in question && question.optional), question.key);
    assert.ok(!(question.options as readonly string[]).includes("Prefer not to say"), question.key);
  }
});

test("phone requires a valid US number; code preview is not verification", () => {
  assert.equal(isStepValid(0, complete()), true);
  assert.equal(isStepValid(0, { ...complete(), phone: "123" }), false);
  assert.equal(isStepValid(1, complete()), true);
  assert.equal(isStepValid(2, complete()), true);
  assert.equal(isComplete({...complete(), experiences:[]}), true);
});
test("every personality answer is required and height options are precise", () => {
  const a=complete();
  delete a.traits.bodyBuild;
  assert.equal(isComplete(a),false);
  const height=personalityQuestions.find(q=>q.key==="height")!;
  assert.ok(height.options.includes("5′10″ / 178 cm"));
  assert.ok(!(height.options as readonly string[]).includes("Prefer not to say"));
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
  const keys = ["relationshipStructure", "childrenAlignment", "partnerHasChildren", "smokingFit", "drinkingFit", "partnerEnergy", "smokingOwn", "drinkingOwn", "dietary", "petsFit", "age", "looksImportance", "partnerPriorities", "partnerCareerDrive", "partnerFitness"];
  const answers = emptyAnswers();
  for (const key of keys) {
    const index = personalityQuestions.findIndex(q => q.key === key);
    assert.ok(index >= 0);
    assert.equal(isStepValid(index + TRAIT_OFFSET, answers), false);
    const question = personalityQuestions[index];
    const min = "min" in question ? question.min : 1;
    const validPick = question.options.slice(0, min);
    assert.ok(isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: validPick}}));
    if (min > 1) {
      assert.equal(isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: [question.options[0]]}}), false);
    }
    assert.ok(!isStepValid(index + TRAIT_OFFSET, {...answers, traits: {[key]: ["invented answer"]}}));
    assert.ok(!(question.options as readonly string[]).includes("Prefer not to say"), key);
  }
});

test("relationship-process prompts are required, neutral, and preserve unrelated answers", () => {
  const keys = ["goodNewsSupport", "feelingUnderstood", "conflictRepair", "goalSupport"];
  const answers = complete();
  for (const key of keys) {
    const index = personalityQuestions.findIndex(q => q.key === key);
    assert.ok(index >= 0);
    delete answers.traits[key];
    assert.equal(isStepValid(index + TRAIT_OFFSET, answers), false);
  }
  assert.equal(isComplete(answers), false);
  const filled = complete();
  const updated = flowReducer({...initialFlow(), stage: "home", answers: filled}, {type: "answer", patch: {traits: {...filled.traits, goalSupport: ["Encourage me and let me lead"]}}});
  assert.equal(updated.stage, "home");
  assert.deepEqual(updated.answers.traits.religion, filled.traits.religion);
});
