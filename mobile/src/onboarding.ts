/** Pure preview rules: no account, persistence, or network behavior. */
/** Launch scope (D-017): Dinner only. */
import { allConditionsAccepted, emptyConditionAcceptances, requiredConditionIds } from "./conditions.ts";
export const experiences = ["Dinner"] as const;
export const conversations = [
  "Big ideas",
  "Music & culture",
  "Travel stories",
  "Everyday things",
  "Food",
  "Books & stories",
  "Humor and banter",
  "Work and ambition",
  "Faith and meaning",
  "Sports & games",
  "Art and design",
  "Science & discovery",
] as const;
/** Launch cities — San Diego only for now. */
export const cityOptions = ["San Diego"] as const;
export type Answers = {
  name: string;
  phone: string;
  city: string;
  experiences: string[];
  energy: number | null;
  conversations: string[];
  note: string;
  traits: Record<string, string[]>;
  photoUri: string;
};
export const emptyAnswers = (): Answers => ({
  name: "",
  phone: "",
  city: "",
  experiences: [],
  energy: null,
  conversations: [],
  note: "",
  traits: {},
  photoUri: "",
});
/** Whole years for automated age pairing (D-022). */
export const ageOptions = Array.from({ length: 63 }, (_, i) => `${i + 18}`);
/**
 * Algo-aligned keep list. Wording/helpers stay in the current 11:11 voice.
 * Cut ~half of the prior inventory; looks / ethnicity / faith / politics stay.
 */
export const personalityQuestions = [
  { key: "gender", section: "The basics", title: "How do you describe your gender?", options: ["Male", "Female", "Non-binary", "Another identity", "Questioning"], helper: "Use the description that feels right for you." },
  { key: "interestedIn", section: "The basics", title: "Who are you open to meeting?", options: ["Men", "Women", "Men and women"], helper: "So we know who to introduce you to." },
  { key: "age", section: "The basics", title: "How old are you?", options: ageOptions, helper: "Scroll to your age, then tap to select. Used for pairing, not shown as a public boast." },
  { key: "ethnicity", section: "The basics", title: "How do you describe your ethnic background?", options: ["Black or African heritage", "East Asian", "South Asian", "Southeast Asian", "Middle Eastern or North African", "Hispanic or Latino", "White or European heritage", "Indigenous or Native heritage", "Pacific Islander", "Mixed heritage", "Another background"], max: 3, helper: "Your identity is yours to describe." },
  { key: "languages", section: "The basics", title: "Which languages feel like home?", options: ["English", "Arabic", "Spanish", "French", "Mandarin", "Cantonese", "Hindi", "Urdu", "Portuguese", "German", "Korean", "Japanese", "Tagalog", "Vietnamese", "ASL", "Another language"], max: 4, helper: "The languages you feel comfortable connecting in." },
  { key: "careerDrive", section: "The basics", title: "How career-oriented are you right now?", options: ["Career is my main focus", "Ambitious, with room for life", "Balanced with other priorities", "Building slowly", "Career is not my focus right now"], helper: "Your pace today — it can change." },

  { key: "planning", section: "Personality", title: "A plan or a little spontaneity?", options: ["I love a detailed plan", "A loose plan feels right", "I like to decide in the moment", "It depends on the day"], helper: "Think about how you like a day together to unfold." },
  { key: "humor", section: "Personality", title: "What makes you laugh?", options: ["Playful banter", "Dry wit", "Silly, absurd moments", "Clever wordplay", "Relatable everyday stories", "Gentle, wholesome humor"], max: 2, helper: "The kind of laughter you would love to share." },
  { key: "communication", section: "Love & connection", title: "When something feels off, you…", options: ["Talk it through right away", "Take time, then talk", "Prefer a gentle check-in", "Find it easier to write first"], helper: "Think about a small misunderstanding with someone you care about." },
  { key: "pace", section: "Love & connection", title: "What pace feels good?", options: ["A slow build", "Let it unfold naturally", "I’m intentional from the start", "Follow the spark"], helper: "Imagine the first few weeks of getting to know someone." },
  { key: "independence", section: "Love & connection", title: "Together time and your own space?", options: ["Lots of shared time", "A close bond with regular solo time", "Plenty of independence", "Find a rhythm together"], helper: "Imagine a relationship with room for both of you." },

  { key: "religion", section: "Beliefs & values", title: "What do you believe?", options: ["Christian", "Muslim", "Jewish", "Hindu", "Buddhist", "Sikh", "Spiritual", "Agnostic", "Atheist", "Another belief"], helper: "The belief or tradition that feels closest to you today." },
  { key: "faithImportance", section: "Beliefs & values", title: "How important is faith in your life?", options: ["Not important", "A small part", "Somewhat important", "Very important", "Central to my life"], helper: "Think about the place faith has in your everyday choices." },
  { key: "sharedFaith", section: "Beliefs & values", title: "Does sharing a belief matter?", options: ["Open to any belief", "Similar values matter more", "I prefer a shared belief", "A shared belief is essential"], helper: "Think about the beliefs you would want to share with a partner." },
  { key: "sharedBackground", section: "Beliefs & values", title: "Does a shared ethnic background matter to you?", options: ["Open to any ethnic background", "Shared culture matters more than ethnicity", "I prefer a shared ethnic background", "A shared ethnic background is important to me"], helper: "A personal preference, not a ranking of anyone’s worth." },
  { key: "politicalOutlook", section: "Beliefs & values", title: "How would you describe your political outlook?", options: ["Left-leaning", "Center-left", "Centrist", "Center-right", "Right-leaning", "Independent or mixed", "Not politically engaged"], helper: "The broad description closest to your views, if you want to share." },
  { key: "politicalFit", section: "Love & connection", title: "How much do shared political views matter in a relationship?", options: ["Very important", "Some common ground matters", "Respectful differences are welcome", "Politics is not central for me"], helper: "Think about how much common ground you need with a partner." },
  { key: "financialStabilityImportance", section: "Beliefs & values", title: "How much does financial stability matter in a partner?", options: ["Not important", "A little", "Somewhat important", "Very important", "Essential"], helper: "About the steadiness you hope for — not anyone’s net worth." },

  { key: "weekend", section: "Your world", title: "Your ideal free day?", options: ["Outdoors", "Friends and good food", "A cultural escape", "A cozy day at home", "Something spontaneous", "A workout and a reset"], max: 2, helper: "Imagine a day that leaves you feeling like yourself." },
  { key: "socialSetting", section: "Your world", title: "What kind of setting brings you to life?", options: ["A quiet corner", "A small lively table", "A buzzing room", "A dance floor", "It depends on my mood"], helper: "Imagine a place where conversation feels easy." },
  { key: "movies", section: "Your world", title: "What’s on movie night?", options: ["Comedy", "Romance", "Drama", "Thriller", "Horror", "Sci-fi & fantasy", "Action", "Documentaries", "Animation", "Not really a movie person"], max: 3, helper: "The genres you would happily put on together." },
  { key: "music", section: "Your world", title: "What’s on your playlist?", options: ["Pop", "Hip-hop & rap", "R&B & soul", "Rock & indie", "Electronic & dance", "Jazz & blues", "Classical", "Country & folk", "Latin", "Arabic", "A little of everything", "I prefer quiet"], max: 3, helper: "The sounds you keep coming back to." },
  { key: "fitnessLevel", section: "Your world", title: "How would you describe your fitness?", options: ["Just getting started", "Moderately active", "Fit", "Very fit", "Athlete-level"], helper: "Your own read on fitness today." },
  { key: "smokingOwn", section: "Your world", title: "Do you smoke or vape?", options: ["No, never", "I used to, not anymore", "Occasionally", "Regularly"], helper: "Your own habits help pair people thoughtfully — not a judgment of worth." },
  { key: "drinkingOwn", section: "Your world", title: "How do you usually drink?", options: ["I do not drink", "Rarely", "Socially now and then", "Regularly with friends", "Most days"], helper: "Think about a typical week, not a special occasion." },
  { key: "dietary", section: "Your world", title: "What should a dinner plan respect?", options: ["No restrictions", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Dairy-free", "Nut allergy or caution", "Pescatarian", "Another need"], max: 3, helper: "So a first dinner can feel easy and considerate." },
  { key: "pets", section: "Your world", title: "Which animals would you happily share life with?", options: ["Dogs", "Cats", "Small pets", "Birds", "Horses", "Reptiles", "No pets for me", "Open to discovering"], max: 3, helper: "Think about everyday life with animals, not just a cute photo." },

  { key: "selfRating", section: "Attraction", title: "How would you rate your own looks?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], helper: "Be honest — for now this is self-reported. If looks matter a lot to you, we aim for someone at your rating or higher." },
  { key: "looksImportance", section: "Attraction", title: "How much do looks matter to you in a partner?", options: ["Personality comes first", "A little", "Personality and looks equally", "Physical attraction matters a lot"], helper: "If this is high, pairing prefers someone whose looks self-rating is the same as yours or better." },
  { key: "partnerAgeRange", section: "Attraction", title: "What partner ages are you open to?", options: ["Within 2 years of me", "Within 5 years of me", "Within 10 years of me", "Younger than me", "Older than me", "A wide range is fine"], max: 2, helper: "Pick the windows that feel realistic for you." },

  { key: "relationship", section: "Love & connection", title: "What are you looking for?", options: ["A life partner", "A serious relationship", "Dating with intention", "Something casual", "Exploring what feels right"], helper: "Your intention right now, not a promise about the future." },
  { key: "relationshipStatus", section: "Love & connection", title: "What chapter are you in right now?", options: ["Single", "Divorced", "Widowed", "Separated", "In an ethically non-monogamous relationship", "Figuring out my next chapter"], helper: "Your situation today, separate from what you hope to find." },
  { key: "relationshipStructure", section: "Love & connection", title: "What kind of relationship fits you?", helper: "Think about the agreement you would want to build with a partner.", options: ["Monogamous", "Ethically non-monogamous", "Open to discussing it", "Still exploring"] },
  { key: "haveChildren", section: "Love & connection", title: "Do you have children?", options: ["No", "Yes — they live with me", "Yes — part of the time", "Yes — they don’t live with me", "Prefer not to say"], helper: "Your situation today, separate from what you hope for later." },
  { key: "children", section: "Love & connection", title: "How do children fit into your future?", options: ["I want children", "I may want children", "I do not want children", "I have children and am open to more", "I have children and do not want more", "Still figuring it out"], helper: "Your hopes for family life can change over time." },
  { key: "partnerHasChildren", section: "Love & connection", title: "How do you feel about a partner who already has children?", options: ["Yes, I’m open to that", "It depends on the situation", "I’d prefer a partner without children", "I’m not sure yet"], helper: "Separate from whether you want children of your own someday." },
  { key: "childrenAlignment", section: "Love & connection", title: "How closely should your family plans align?", helper: "Separate your own hopes from how much flexibility you have with a partner.", options: ["We need to want the same future", "Some flexibility, with an honest conversation", "I am still figuring this out"] },
  { key: "sharedActivity", section: "Love & connection", title: "How important is an active partner?", options: ["Shared workouts matter to me", "Some shared activity would be nice", "Different routines are fine", "It is not important to me"], helper: "Think about whether you want to share an active routine." },
  { key: "partnerFitness", section: "Love & connection", title: "What fitness level are you hoping for in a partner?", options: ["Just getting started is fine", "Moderately active", "Fit", "Very fit", "Athlete-level", "Fitness is not a priority for me"], helper: "Used with how much an active partner matters to you." },
  { key: "partnerCareerDrive", section: "Love & connection", title: "How career-oriented do you want a partner to be?", options: ["Very career-focused", "Ambitious, with room for life", "Balanced", "Laid-back about career", "Career drive is not important to me"], helper: "We pair career preferences with how people describe themselves." },
  { key: "smokingFit", section: "Love & connection", title: "How do you feel about a partner smoking or vaping?", helper: "Think about what would feel comfortable in everyday life together.", options: ["I need a smoke-free and vape-free partner", "Occasional use would be okay", "No strong preference"] },
  { key: "drinkingFit", section: "Love & connection", title: "What would feel right around alcohol?", helper: "Think about your comfort with a partner’s drinking, not their worth.", options: ["I want an alcohol-free partner", "Occasional drinking is fine", "Regular social drinking is fine", "No strong preference"] },
  { key: "petsFit", section: "Love & connection", title: "How do you feel about a partner with pets?", options: ["I would love that", "Fine with most pets", "Depends on the animal", "I prefer a pet-free home", "No strong preference"], helper: "Everyday life with animals, not just a cute photo." },
  { key: "dealbreakers", section: "Love & connection", title: "What must match?", options: ["Same plans about children", "Smoke- and vape-free", "Alcohol-free", "Same faith", "Monogamous", "Pet-free home", "No children already", "Similar politics", "None of these"], max: 3, helper: "Pick up to three. We’ll never pair you with someone who doesn’t fit them." },
] as const;
export function questionHelper(question: typeof personalityQuestions[number]): string {
  const max = "max" in question ? question.max : 1;
  const min = "min" in question ? question.min : 1;
  const limit =
    max === 1
      ? "One selection."
      : min === max
        ? `Choose ${max}.`
        : `Up to ${max} selections.`;
  return `${question.helper} ${limit}`;
}
/** Indices 0–5: phone, name, city, code, energy, conversations. */
export const TRAIT_OFFSET = 6;
export const PHOTO_STEP = TRAIT_OFFSET + personalityQuestions.length;
export const QUESTION_COUNT = PHOTO_STEP + 1;
export const onboardingSections = ["The basics", "Personality", "Beliefs & values", "Your world", "Attraction", "Love & connection"] as const;
export function questionSection(index: number): string {
  if (index === PHOTO_STEP) return "Love & connection";
  if (index <= 3) return "The basics";
  if (index === 4 || index === 5) return "Personality";
  return personalityQuestions[index - TRAIT_OFFSET]?.section ?? "The basics";
}
export const onboardingOrder = onboardingSections.flatMap(section => Array.from({length:QUESTION_COUNT},(_,i)=>i).filter(i=>questionSection(i)===section));
export const nextQuestion = (question: number) => onboardingOrder[onboardingOrder.indexOf(question)+1];
export const previousQuestion = (question: number) => onboardingOrder[onboardingOrder.indexOf(question)-1];
/** Format US phone as the user types: (415) 555-0100 or 1 (415) 555-0100. */
export function formatUsPhoneInput(value: string): string {
  const raw = value.replace(/\D/g, "");
  const withCountry = raw.length > 10 && raw.startsWith("1");
  const digits = withCountry ? raw.slice(0, 11) : raw.slice(0, 10);
  const national = withCountry ? digits.slice(1) : digits;
  const prefix = withCountry || digits === "1" ? "1" : "";

  if (!national.length) return prefix;

  let body = "";
  if (national.length < 4) body = `(${national}`;
  else if (national.length < 7) body = `(${national.slice(0, 3)}) ${national.slice(3)}`;
  else body = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;

  return prefix ? `${prefix} ${body}` : body;
}

/** US / NANP format check for UI preview — not carrier verification. */
export function isValidUsPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return false;
  if (national[0] < "2" || national[3] < "2") return false;
  return true;
}
export function usPhoneWarning(phone: string): string | null {
  if (!phone.trim()) return "Enter a valid US phone number.";
  if (!isValidUsPhone(phone)) return "That doesn’t look like a valid US number. Use 10 digits (or 1 + 10 digits).";
  return null;
}
export function isStepValid(step: number, answers: Answers): boolean {
  switch (step) {
    case 0:
      return isValidUsPhone(answers.phone);
    case 1:
      return (
        answers.name.trim().length >= 1 && answers.name.trim().length <= 30
      );
    case 2:
      return (cityOptions as readonly string[]).includes(answers.city);
    case 3:
      // Code length checked in UI before advance; step stays open for Firebase confirm.
      return true;
    case 4:
      return (
        Number.isInteger(answers.energy) &&
        answers.energy !== null &&
        answers.energy >= 1 &&
        answers.energy <= 5
      );
    case 5:
      return (
        answers.conversations.length >= 2 &&
        answers.conversations.length <= 3 &&
        answers.conversations.every((x) =>
          (conversations as readonly string[]).includes(x),
        )
      );
    default: {
      if (step === PHOTO_STEP) return answers.photoUri.trim().length > 0;
      const q = personalityQuestions[step - TRAIT_OFFSET];
      if (!q) return false;
      const values = answers.traits?.[q.key] ?? [];
      const max = "max" in q ? q.max : 1;
      const min = "min" in q ? q.min : 1;
      return values.length >= min && values.length <= max && new Set(values).size === values.length && values.every(value => (q.options as readonly string[]).includes(value));
    }
  }
}
export const isComplete = (answers: Answers) =>
  Array.from({ length: QUESTION_COUNT }, (_, i) =>
    isStepValid(i, answers),
  ).every(Boolean);
export function toggleChoice(
  values: string[],
  choice: string,
  maximum: number,
): string[] {
  return values.includes(choice)
    ? values.filter((value) => value !== choice)
    : values.length < maximum
      ? [...values, choice]
      : values;
}
export type Stage = "intro" | "questions" | "section" | "review" | "conditions" | "home";
export type Flow = {
  stage: Stage;
  intro: number;
  question: number;
  answers: Answers;
  reviewAfterEdit: boolean;
  conditionsAccepted: Record<string, boolean>;
  /** OTP already confirmed — skip the code step when walking the question list. */
  phoneVerified: boolean;
};
export const initialFlow = (): Flow => ({
  stage: "intro",
  intro: 0,
  question: 0,
  answers: emptyAnswers(),
  reviewAfterEdit: false,
  conditionsAccepted: emptyConditionAcceptances(),
  phoneVerified: false,
});

function skipVerifiedCode(
  step: number | undefined,
  phoneVerified: boolean,
  direction: "next" | "back",
): number | undefined {
  if (step === undefined) return undefined;
  if (!(phoneVerified && step === 3)) return step;
  return direction === "next" ? nextQuestion(3) : previousQuestion(3);
}
export type Action =
  | { type: "next" }
  | { type: "back" }
  | { type: "answer"; patch: Partial<Answers> }
  | { type: "toggleCondition"; id: string }
  | { type: "edit"; question: number }
  | { type: "reset" }
  /** Known phone: skip name/city and land on the code step. */
  | { type: "phoneKnown"; name: string; phone: string }
  /** OTP sent — jump to confirmation code step. */
  | { type: "awaitCode"; phone: string }
  /** New user after OTP — continue at name. */
  | { type: "codeVerifiedNew" }
  /** Returning phone session: skip signup and open home with restored answers. */
  | { type: "returningHome"; name: string; phone: string; answers?: Answers };
export function flowReducer(state: Flow, action: Action): Flow {
  switch (action.type) {
    case "reset":
      return initialFlow();
    case "phoneKnown":
      return {
        ...state,
        stage: "questions",
        question: 3,
        reviewAfterEdit: false,
        answers: {
          ...state.answers,
          name: action.name,
          phone: action.phone,
        },
      };
    case "awaitCode":
      return {
        ...state,
        stage: "questions",
        question: 3,
        reviewAfterEdit: false,
        answers: { ...state.answers, phone: action.phone },
      };
    case "codeVerifiedNew":
      return {
        ...state,
        stage: "questions",
        question: 1,
        reviewAfterEdit: false,
        phoneVerified: true,
      };
    case "returningHome":
      return {
        ...initialFlow(),
        stage: "home",
        phoneVerified: true,
        answers: {
          ...(action.answers ?? emptyAnswers()),
          name: action.name,
          phone: action.phone,
        },
        conditionsAccepted: Object.fromEntries(requiredConditionIds.map((id) => [id, true])),
      };
    case "answer":
      return { ...state, answers: { ...state.answers, ...action.patch } };
    case "toggleCondition":
      return {
        ...state,
        conditionsAccepted: {
          ...state.conditionsAccepted,
          [action.id]: !state.conditionsAccepted[action.id],
        },
      };
    case "edit":
      return action.question >= 0 &&
        action.question < QUESTION_COUNT &&
        (state.stage === "review" || state.stage === "home" || state.stage === "conditions")
        ? {
            ...state,
            stage: "questions",
            question: action.question,
            reviewAfterEdit: true,
          }
        : state;
    case "next":
      if (state.stage === "intro")
        return state.intro < 3
          ? { ...state, intro: state.intro + 1 }
          : { ...state, stage: "questions" };
      if (
        state.stage === "questions" &&
        isStepValid(state.question, state.answers) &&
        state.reviewAfterEdit &&
        isComplete(state.answers)
      )
        return { ...state, stage: "review", reviewAfterEdit: false };
      if (
        state.stage === "questions" &&
        isStepValid(state.question, state.answers)
      ) {
        const upcoming = skipVerifiedCode(nextQuestion(state.question), state.phoneVerified, "next");
        return upcoming === undefined
          ? isComplete(state.answers) ? { ...state, stage: "section" } : state
          : questionSection(upcoming) !== questionSection(state.question)
            ? { ...state, stage: "section" }
            : { ...state, question: upcoming };
      }
      if (state.stage === "section") {
        const upcoming = skipVerifiedCode(nextQuestion(state.question), state.phoneVerified, "next");
        return upcoming === undefined
          ? { ...state, stage: "review" }
          : { ...state, stage: "questions", question: upcoming };
      }
      if (state.stage === "review" && isComplete(state.answers))
        return { ...state, stage: "conditions" };
      if (state.stage === "conditions" && allConditionsAccepted(state.conditionsAccepted))
        return { ...state, stage: "home" };
      return state;
    case "back":
      if (state.stage === "intro")
        return { ...state, intro: Math.max(0, state.intro - 1) };
      if(state.stage === "section") return { ...state, stage: "questions" };
      if (state.stage === "questions") {
        const prior = skipVerifiedCode(previousQuestion(state.question), state.phoneVerified, "back");
        return prior !== undefined
          ? { ...state, question: prior }
          : { ...state, stage: "intro", intro: 3 };
      }
      if (state.stage === "conditions")
        return { ...state, stage: "review" };
      if (state.stage === "review")
        return { ...state, stage: "questions", question: onboardingOrder[onboardingOrder.length - 1] };
      return state;
  }
}
