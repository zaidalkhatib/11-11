import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyAnswers,
  personalityQuestions,
  questionHelper,
  QUESTION_COUNT,
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
  phone: "",
  experiences: ["Dinner"],
  energy: 3,
  conversations: ["Big ideas", "Food"],
  chemistry: "Easy laughter",
  note: "",
  traits: Object.fromEntries(personalityQuestions.map(q => [q.key, [q.options[0]]])),
  photoUri: "",
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
test("requires valid choices, name, social energy and personality options", () => {
  const a = complete();
  assert.equal(isComplete(a), true);
  assert.equal(isStepValid(0, { ...a, name: "   " }), false);
  assert.equal(isStepValid(1, { ...a, phone: "bad" }), false);
  assert.equal(isStepValid(3, { ...a, energy: 6 }), false);
  assert.equal(isStepValid(3, { ...a, energy: 2.5 }), false);
  assert.equal(isStepValid(4, { ...a, conversations: ["Food"] }), false);
  assert.equal(isStepValid(5, { ...a, chemistry: "Other" }), false);
  assert.equal(isStepValid(6, { ...a, traits: {} }), false);
  assert.equal(isStepValid(6, { ...a, traits: { religion: ["Invented"] } }), false);
});
test("valid complete path passes questions, review, then gated home", () => {
  let f = {
    ...initialFlow(),
    stage: "questions" as const,
    answers: complete(),
  } as ReturnType<typeof initialFlow>;
  for (let i = 0; i < QUESTION_COUNT + onboardingSections.length; i++) f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "review");
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
  let f = flowReducer(home, { type: "edit", question: 0 });
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
  let f = flowReducer(home, { type: "edit", question: 0 });
  f = flowReducer(f, { type: "answer", patch: { name: "Sam" } });
  f = flowReducer(f, { type: "next" });
  assert.equal(f.stage, "review");
  assert.equal(f.answers.name, "Sam");
  assert.equal(f.reviewAfterEdit, false);
});

test("each personality question validates single/multiple choice boundaries", () => {
  personalityQuestions.forEach((q, i) => {
    const a = complete();
    const step = i + 6;
    assert.equal(isStepValid(step, a), true);
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: [] } }), "optional" in q && q.optional);
    const max = "max" in q ? q.max : 1;
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: q.options.slice(0, max + 1) } }), false);
    assert.equal(isStepValid(step, { ...a, traits: { ...a.traits, [q.key]: [q.options[0], q.options[0]] } }), false);
  });
});
test("profile patches preserve app access and unrelated answers", () => {
  const home = { ...initialFlow(), stage: "home" as const, answers: complete() };
  const updated = flowReducer(home, { type: "answer", patch: { photoUri: "local-photo", traits: {...home.answers.traits, religion: ["Prefer not to say"]} } });
  assert.equal(updated.stage, "home");
  assert.equal(updated.answers.photoUri, "local-photo");
  assert.equal(updated.answers.name, home.answers.name);
  assert.equal(isComplete(updated.answers), true);
});

test("expanded profile has unique keys and requested identity choices", () => {
  assert.equal(QUESTION_COUNT, 88);
  assert.equal(new Set(personalityQuestions.map(q => q.key)).size, personalityQuestions.length);
  const gender = personalityQuestions.find(q => q.key === "gender");
  assert.ok(gender?.options.includes("Male"));
  assert.ok(gender?.options.includes("Female"));
  assert.ok(gender?.options.includes("Prefer not to say"));
});

test("phone and code preview never require a real verification", () => {
  assert.equal(isStepValid(1, complete()), true);
  assert.equal(isStepValid(2, complete()), true);
  assert.equal(isComplete({...complete(), experiences:[]}), true);
});
test("sensitive optional questions can be skipped and height options are precise", () => {
  const a=complete();
  for(const q of personalityQuestions) if("optional" in q) delete a.traits[q.key];
  assert.equal(isComplete(a),true);
  const height=personalityQuestions.find(q=>q.key==="height")!;
  assert.ok(height.options.includes("5′10″ / 178 cm"));
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
    assert.match(helper, "max" in question ? /Up to \d selections\./ : /One selection\./);
  }
});
test("new partner compatibility questions are optional and independently editable", () => {
  const keys = ["relationshipStructure", "childrenAlignment", "smokingFit", "drinkingFit", "distanceFit", "partnerEnergy"];
  const answers = emptyAnswers();
  for (const key of keys) {
    const index = personalityQuestions.findIndex(q => q.key === key);
    assert.ok(index >= 0);
    assert.ok(isStepValid(index + 6, answers));
    const question = personalityQuestions[index];
    assert.ok(isStepValid(index + 6, {...answers, traits: {[key]: [question.options[0]]}}));
    assert.ok(!isStepValid(index + 6, {...answers, traits: {[key]: ["invented answer"]}}));
  }
});

test("relationship-process prompts are optional, neutral, and preserve older profiles", () => {
  const keys = ["goodNewsSupport", "feelingUnderstood", "conflictRepair", "goalSupport"];
  const answers = complete();
  for (const key of keys) {
    const index = personalityQuestions.findIndex(q => q.key === key);
    assert.ok(index >= 0);
    delete answers.traits[key];
    assert.ok(isStepValid(index + 6, answers));
  }
  assert.ok(isComplete(answers));
  const updated = flowReducer({...initialFlow(), stage: "home", answers}, {type: "answer", patch: {traits: {...answers.traits, goalSupport: ["Encourage me and let me lead"]}}});
  assert.equal(updated.stage, "home");
  assert.deepEqual(updated.answers.traits.religion, answers.traits.religion);
});
