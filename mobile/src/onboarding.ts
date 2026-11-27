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
export const chemistryOptions = [
  "Easy laughter",
  "A different perspective",
  "Feeling understood",
  "A little spontaneity",
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
  chemistry: string;
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
  chemistry: "",
  note: "",
  traits: {},
  photoUri: "",
});
export const heightOptions = [...Array.from({ length: 49 }, (_, i) => { const inches = i + 48; return `${Math.floor(inches / 12)}′${inches % 12}″ / ${Math.round(inches * 2.54)} cm`; }), "Outside this range"];
/** Whole years for automated age pairing (D-022). */
export const ageOptions = Array.from({ length: 63 }, (_, i) => `${i + 18}`);
export const personalityQuestions = [
  { key: "religion", section: "Beliefs & values", title: "What do you believe?", options: ["Christian", "Muslim", "Jewish", "Hindu", "Buddhist", "Sikh", "Spiritual", "Agnostic", "Atheist", "Another belief"], helper: "The belief or tradition that feels closest to you today." },
  { key: "faithImportance", section: "Beliefs & values", title: "How important is faith in your life?", options: ["Not important", "A small part", "Somewhat important", "Very important", "Central to my life"], helper: "Think about the place faith has in your everyday choices." },
  { key: "sharedFaith", section: "Beliefs & values", title: "Does sharing a belief matter?", options: ["Open to any belief", "Similar values matter more", "I prefer a shared belief", "A shared belief is essential"], helper: "Think about the beliefs you would want to share with a partner." },
  { key: "height", section: "The basics", title: "How tall are you?", options: heightOptions, helper: "Scroll to your height, then tap to select." },
  { key: "age", section: "The basics", title: "How old are you?", options: ageOptions, helper: "Scroll to your age, then tap to select. Used for pairing, not shown as a public boast." },
  { key: "work", section: "The basics", title: "What fills your workday?", options: ["Technology", "Healthcare", "Education", "Business & finance", "Creative work", "Science & engineering", "Law & public service", "Hospitality & service", "Skilled trade", "Entrepreneur", "Student", "Between chapters", "Another field"], helper: "Your current chapter counts, whatever shape it takes." },
  { key: "careerDrive", section: "The basics", title: "How career-oriented are you right now?", options: ["Career is my main focus", "Ambitious, with room for life", "Balanced with other priorities", "Building slowly", "Career is not my focus right now"], helper: "Your pace today — it can change." },
  { key: "adventure", section: "Your world", title: "Your appetite for adventure?", options: ["Familiar favorites", "Small new experiences", "A mix of comfort and discovery", "Always trying something new", "The bigger the adventure, the better"], helper: "Picture a free day with no expectations." },
  { key: "movies", section: "Your world", title: "What’s on movie night?", options: ["Comedy", "Romance", "Drama", "Thriller", "Horror", "Sci-fi & fantasy", "Action", "Documentaries", "Animation", "Not really a movie person"], max: 3, helper: "The genres you would happily put on together." },
  { key: "music", section: "Your world", title: "What’s on your playlist?", options: ["Pop", "Hip-hop & rap", "R&B & soul", "Rock & indie", "Electronic & dance", "Jazz & blues", "Classical", "Country & folk", "Latin", "Arabic", "A little of everything", "I prefer quiet"], max: 3, helper: "The sounds you keep coming back to." },
  { key: "weekend", section: "Your world", title: "Your ideal free day?", options: ["Outdoors", "Friends and good food", "A cultural escape", "A cozy day at home", "Something spontaneous", "A workout and a reset"], max: 2, helper: "Imagine a day that leaves you feeling like yourself." },
  { key: "selfRating", section: "Attraction", title: "How would you rate your own looks?", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], helper: "Be honest — for now this is self-reported. If looks matter a lot to you, we aim for someone at your rating or higher." },
  { key: "looksImportance", section: "Attraction", title: "How much do looks matter to you in a partner?", options: ["Personality comes first", "A little", "Personality and looks equally", "Physical attraction matters a lot"], helper: "If this is high, pairing prefers someone whose looks self-rating is the same as yours or better." },
  { key: "partnerAgeRange", section: "Attraction", title: "What partner ages are you open to?", options: ["Within 2 years of me", "Within 5 years of me", "Within 10 years of me", "Younger than me", "Older than me", "A wide range is fine"], max: 2, helper: "Pick the windows that feel realistic for you." },
  { key: "partnerPriorities", section: "Attraction", title: "What matters most in someone you meet?", options: ["Looks", "Career drive", "Personality", "Shared values", "Fitness", "Humor", "Kindness", "Ambition", "Emotional connection"], max: 3, min: 3, helper: "Your top three priorities for someone you meet." },
  { key: "relationship", section: "Love & connection", title: "What are you looking for?", options: ["A life partner", "A serious relationship", "Dating with intention", "Something casual", "Exploring what feels right"], helper: "Your intention right now, not a promise about the future." },
  { key: "communication", section: "Love & connection", title: "When something feels off, you…", options: ["Talk it through right away", "Take time, then talk", "Prefer a gentle check-in", "Find it easier to write first"], helper: "Think about a small misunderstanding with someone you care about." },
  { key: "affection", section: "Love & connection", title: "How do you show you care?", options: ["Quality time", "Thoughtful words", "Small acts of care", "Physical affection", "Thoughtful gifts"], max: 2, helper: "The little things you naturally do for someone you like." },
  { key: "pace", section: "Love & connection", title: "What pace feels good?", options: ["A slow build", "Let it unfold naturally", "I’m intentional from the start", "Follow the spark"], helper: "Imagine the first few weeks of getting to know someone." },
  { key: "gender", section: "The basics", title: "How do you describe your gender?", options: ["Male", "Female", "Non-binary", "Another identity", "Questioning"], helper: "Use the description that feels right for you." },
  { key: "interestedIn", section: "The basics", title: "Who are you open to meeting?", options: ["Men", "Women", "Men and women"], helper: "So we know who to introduce you to." },
  { key: "planning", section: "Personality", title: "A plan or a little spontaneity?", options: ["I love a detailed plan", "A loose plan feels right", "I like to decide in the moment", "It depends on the day"], helper: "Think about how you like a day together to unfold." },
  { key: "humor", section: "Personality", title: "What makes you laugh?", options: ["Playful banter", "Dry wit", "Silly, absurd moments", "Clever wordplay", "Relatable everyday stories", "Gentle, wholesome humor"], max: 2, helper: "The kind of laughter you would love to share." },
  { key: "decisions", section: "Personality", title: "When making a big decision, you…", options: ["Think through the facts", "Trust my intuition", "Talk it out with someone", "Balance my head and heart"], helper: "Think of a choice that really mattered to you." },
  { key: "support", section: "Love & connection", title: "After a hard day, what helps most?", options: ["Someone who listens", "Help finding a solution", "A comforting hug", "A little space first", "A lighthearted distraction"], helper: "Picture the kind of care you would welcome after a difficult day." },
  { key: "differences", section: "Personality", title: "When you see things differently, you…", options: ["Get curious about their perspective", "Enjoy a respectful debate", "Look for common ground", "Agree to disagree"], helper: "Think about a disagreement with someone you respect." },
  { key: "values", section: "Beliefs & values", title: "What do you value most in a partner?", options: ["Kindness", "Honesty", "Curiosity", "Reliability", "Ambition", "Emotional openness", "Independence", "Generosity", "Family connection"], max: 3, helper: "The qualities you would want at the heart of a relationship." },
  { key: "ambition", section: "Personality", title: "What does ambition look like for you?", options: ["Growing in my career", "Creating something of my own", "Learning and personal growth", "Building a balanced life", "Making a difference for others"], max: 2, helper: "The kind of growth that matters to you, beyond a job title." },
  { key: "independence", section: "Love & connection", title: "Together time and your own space?", options: ["Lots of shared time", "A close bond with regular solo time", "Plenty of independence", "Find a rhythm together"], helper: "Imagine a relationship with room for both of you." },
  { key: "children", section: "Love & connection", title: "How do children fit into your future?", options: ["I want children", "I may want children", "I do not want children", "I have children and am open to more", "I have children and do not want more", "Still figuring it out"], helper: "Your hopes for family life can change over time." },
  { key: "partnerHasChildren", section: "Love & connection", title: "How do you feel about a partner who already has children?", options: ["Yes, I’m open to that", "It depends on the situation", "I’d prefer a partner without children", "I’m not sure yet"], helper: "Separate from whether you want children of your own someday." },
  { key: "newExperiences", section: "Personality", title: "When you’re new at something, you…", options: ["Jump in and learn by doing", "Observe before trying", "Ask someone to show me", "Research and prepare first"], helper: "Think about your first day trying an unfamiliar skill." },
  { key: "bodyBuild", section: "The basics", title: "How would you describe your build?", options: ["Slim", "Average", "Athletic", "Muscular", "Curvy", "Larger build", "Another description"], helper: "Your own description, not a judgment." },
  { key: "workout", section: "Your world", title: "How often do you like to work out?", options: ["Rarely or never", "Once or twice a week", "Three or four times a week", "Most days", "It varies"], helper: "Your usual rhythm matters more than an ideal week." },
  { key: "fitnessLevel", section: "Your world", title: "How would you describe your fitness?", options: ["Just getting started", "Moderately active", "Fit", "Very fit", "Athlete-level"], helper: "Your own read on fitness today." },
  { key: "movement", section: "Your world", title: "What kind of movement do you enjoy?", options: ["Walking", "Hiking", "Running", "Strength training", "Yoga or Pilates", "Dancing", "Team sports", "Swimming", "Cycling", "Gentle movement", "Not a focus for me"], max: 3, helper: "The ways you actually enjoy moving, at your own pace." },
  { key: "sharedActivity", section: "Love & connection", title: "How important is an active partner?", options: ["Shared workouts matter to me", "Some shared activity would be nice", "Different routines are fine", "It is not important to me"], helper: "Think about whether you want to share an active routine." },
  { key: "partnerFitness", section: "Love & connection", title: "What fitness level are you hoping for in a partner?", options: ["Just getting started is fine", "Moderately active", "Fit", "Very fit", "Athlete-level", "Fitness is not a priority for me"], helper: "Used with how much an active partner matters to you." },
  { key: "partnerCareerDrive", section: "Love & connection", title: "How career-oriented do you want a partner to be?", options: ["Very career-focused", "Ambitious, with room for life", "Balanced", "Laid-back about career", "Career drive is not important to me"], helper: "We pair career preferences with how people describe themselves." },
  { key: "ethnicity", section: "The basics", title: "How do you describe your ethnic background?", options: ["Black or African heritage", "East Asian", "South Asian", "Southeast Asian", "Middle Eastern or North African", "Hispanic or Latino", "White or European heritage", "Indigenous or Native heritage", "Pacific Islander", "Mixed heritage", "Another background"], max: 3, helper: "Your identity is yours to describe." },
  { key: "sharedBackground", section: "Beliefs & values", title: "Does a shared ethnic background matter to you?", options: ["Open to any ethnic background", "Shared culture matters more than ethnicity", "I prefer a shared ethnic background", "A shared ethnic background is important to me"], helper: "A personal preference, not a ranking of anyone’s worth." },
  { key: "routine", section: "Personality", title: "What rhythm suits you best?", options: ["Early mornings", "Late nights", "A regular balanced routine", "Flexible and changing"], helper: "The rhythm you tend to settle into when life lets you." },
  { key: "stress", section: "Personality", title: "When life gets busy, you recharge by…", options: ["Quiet time alone", "Seeing people I trust", "Moving my body", "Making or creating something", "Getting organized"], max: 2, helper: "What restores your energy when you have a lot on your mind?" },
  { key: "affectionStyle", section: "Love & connection", title: "How openly do you show affection?", options: ["Warm and expressive", "Mostly in private", "Through actions more than words", "Gradually as trust grows"], helper: "Think about how you show warmth once you feel comfortable." },
  { key: "familyTime", section: "Beliefs & values", title: "How does family fit into your everyday life?", options: ["A big part of daily life", "Regular time together matters", "Close, with plenty of independence", "Chosen family is my focus", "It is complicated"], helper: "Family can mean the people you were born to or the people you chose." },
  {"key": "languages", "section": "The basics", "title": "Which languages feel like home?", "options": ["English", "Arabic", "Spanish", "French", "Mandarin", "Cantonese", "Hindi", "Urdu", "Portuguese", "German", "Korean", "Japanese", "Tagalog", "Vietnamese", "ASL", "Another language"], "max": 4, helper: "The languages you feel comfortable connecting in." },
  {"key": "siblings", "section": "The basics", "title": "Where do you fit among your siblings?", "options": ["Oldest", "Middle", "Youngest", "Only child", "A blended family", "It is a little more complicated"], helper: "The family dynamic you grew up with, in your own terms." },
  {"key": "upbringing", "section": "The basics", "title": "What kind of place shaped you?", "options": ["A big city", "The suburbs", "A small town", "The countryside", "Several very different places"], helper: "Think about the surroundings that felt like home growing up." },
  {"key": "movingRoots", "section": "The basics", "title": "How has moving shaped your story?", "options": ["I live near where I grew up", "I moved within my home country", "I moved to a new country", "My family moved before I was born", "I grew up across countries"], helper: "Share only the part of your story you feel comfortable describing." },
  {"key": "childhoodResources", "section": "The basics", "title": "Growing up, money felt…", "options": ["Often tight", "Enough for the essentials", "Generally comfortable", "Very comfortable", "Different at different times"], helper: "A little context about your upbringing, not a measure of your worth." },
  {"key": "relationshipStatus", "section": "Love & connection", "title": "What chapter are you in right now?", "options": ["Single", "Divorced", "Widowed", "Separated", "In an ethically non-monogamous relationship", "Figuring out my next chapter"], helper: "Your situation today, separate from what you hope to find." },
  {"key": "orientation", "section": "The basics", "title": "How do you describe your orientation?", "options": ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Queer", "Asexual", "Questioning", "Another identity"], helper: "Use a label only if it feels useful to you." },
  {"key": "thinkingStrength", "section": "Personality", "title": "Where does your mind feel most at home?", "options": ["Patterns and numbers", "Words and ideas", "Reading people", "Practical problem-solving", "Creative possibilities", "A mix of these"], "max": 2, helper: "The ways of thinking that come most naturally to you." },
  {"key": "practicalConfidence", "section": "Personality", "title": "In an unfamiliar everyday situation, you…", "options": ["Usually find my own way", "Ask good questions", "Watch and learn first", "Call someone I trust"], helper: "Imagine finding your feet somewhere unfamiliar." },
  {"key": "trust", "section": "Personality", "title": "How does trust usually grow for you?", "options": ["I start with an open heart", "I open up a little at a time", "Consistency earns my trust", "It depends on the person"], helper: "Think about getting close to someone new." },
  {"key": "composure", "section": "Personality", "title": "When plans unravel, your first instinct is…", "options": ["Stay calm and adapt", "Talk it through", "Take a moment to reset", "Start finding a new plan"], helper: "Picture a day that suddenly goes off script." },
  {"key": "imagination", "section": "Personality", "title": "How often do you get lost in possibilities?", "options": ["Rarely", "Now and then", "Often", "My mind is always imagining"], helper: "Think about daydreams, ideas, and the possibilities you notice." },
  {"key": "feedback", "section": "Personality", "title": "When someone makes a mistake, you tend to…", "options": ["Look for the context", "Offer a practical suggestion", "Speak honestly but gently", "Give them room to work it out"], helper: "Think about how you respond to someone you care about." },
  {"key": "followThrough", "section": "Personality", "title": "When motivation fades, what helps you finish?", "options": ["A steady routine", "A clear deadline", "Someone alongside me", "Remembering why I started", "A break and a fresh start"], helper: "What helps you keep a commitment on an ordinary difficult day?" },
  {"key": "hardConversations", "section": "Love & connection", "title": "How do you approach a conversation you would rather avoid?", "options": ["Name it gently and start", "Prepare my thoughts first", "Ask for the right time", "I sometimes need encouragement"], helper: "Think about bringing up something important with a partner." },
  {"key": "groupRole", "section": "Personality", "title": "In a group conversation, you usually…", "options": ["Keep the conversation moving", "Listen and join when something clicks", "Draw quieter people in", "Switch roles with the group"], helper: "Your natural role, not the one you feel expected to play." },
  {"key": "podcasts", "section": "Your world", "title": "What would you queue for a long walk?", "options": ["Comedy and conversation", "Science and discovery", "Culture and storytelling", "News and current affairs", "Business and ideas", "Relationships and wellbeing", "True crime", "Music instead", "Nothing, just the world around me"], "max": 3, helper: "The topics or sounds you would enjoy spending time with." },
  {"key": "socialSetting", "section": "Your world", "title": "What kind of setting brings you to life?", "options": ["A quiet corner", "A small lively table", "A buzzing room", "A dance floor", "It depends on my mood"], helper: "Imagine a place where conversation feels easy." },
  {"key": "pets", "section": "Your world", "title": "Which animals would you happily share life with?", "options": ["Dogs", "Cats", "Small pets", "Birds", "Horses", "Reptiles", "No pets for me", "Open to discovering"], "max": 3, helper: "Think about everyday life with animals, not just a cute photo." },
  {"key": "socialMedia", "section": "Your world", "title": "What place does social media have in your day?", "options": ["Barely any", "A quick check-in", "A way to keep in touch", "A creative outlet", "A regular part of my day"], helper: "Your usual habits, without judging screen time." },
  {"key": "phonesAtDinner", "section": "Love & connection", "title": "Phones at a table for two?", "options": ["Put away and be present", "A quick necessary check is fine", "Sharing things on screen can be fun", "I am easygoing about it"], helper: "Picture a relaxed date with time to really connect." },
  {"key": "humorBoundaries", "section": "Love & connection", "title": "How do you feel about humor that pushes boundaries?", "options": ["I enjoy a little edge", "Context and kindness matter most", "I prefer humor that does not target people", "It depends on the topic"], helper: "Think about what feels playful versus uncomfortable to you." },
  {"key": "purpose", "section": "Beliefs & values", "title": "Where do you think a sense of purpose comes from?", "options": ["Something we discover", "Something we create", "The people we care for", "A spiritual calling", "I am still exploring"], helper: "There is no right philosophy for a meaningful life." },
  {"key": "astrology", "section": "Beliefs & values", "title": "What is your relationship with astrology?", "options": ["Meaningful to me", "A fun conversation starter", "Curious, but skeptical", "Not my thing"], helper: "Think about whether it is meaningful, playful, or neither for you." },
  {"key": "communityAction", "section": "Beliefs & values", "title": "How do you like to contribute to your community?", "options": ["Hands-on volunteering", "Speaking up for causes", "Helping people close to me", "Supporting from behind the scenes", "Still finding my way"], "max": 2, helper: "Small, quiet contributions count too." },
  {"key": "politicalOutlook", "section": "Beliefs & values", "title": "How would you describe your political outlook?", "options": ["Left-leaning", "Center-left", "Centrist", "Center-right", "Right-leaning", "Independent or mixed", "Not politically engaged"], helper: "The broad description closest to your views, if you want to share." },
  {"key": "politicalFit", "section": "Love & connection", "title": "How much do shared political views matter in a relationship?", "options": ["Very important", "Some common ground matters", "Respectful differences are welcome", "Politics is not central for me"], helper: "Think about how much common ground you need with a partner." },
  {"key": "newsConversation", "section": "Your world", "title": "Current events on a first date?", "options": ["I love a thoughtful discussion", "A little is welcome", "Maybe once we know each other", "I prefer other topics"], helper: "Imagine the conversation during your first dinner together." },
  {"key": "sustainability", "section": "Beliefs & values", "title": "How does caring for the planet shape your choices?", "options": ["It guides many of my decisions", "I make changes where I can", "I am learning what works for me", "It is not a main focus"], helper: "Think about the choices that are realistic in your life." },
  {"key": "reproductiveValues", "section": "Beliefs & values", "title": "How important is agreement on reproductive choices?", "options": ["Essential to me", "Important to discuss early", "Open to a thoughtful conversation"], helper: "Share how important agreement is, without explaining personal decisions." },
  {"key": "styleSpending", "section": "Beliefs & values", "title": "What draws you to something you buy?", "options": ["Quality that lasts", "A beautiful design", "A recognizable brand", "A good value", "An ethical choice", "A meaningful story"], "max": 2, helper: "Think about what makes a purchase feel worthwhile to you." },
  {"key": "rules", "section": "Beliefs & values", "title": "When a rule does not make sense to you, you…", "options": ["Follow it unless there is a good reason not to", "Ask why it exists", "Look for a better way", "Decide based on the situation"], helper: "Imagine a rule you genuinely question, not a boundary someone has set." },
  {"key": "changeComfort", "section": "Beliefs & values", "title": "A familiar life or a fresh chapter?", "options": ["I value a steady foundation", "Small changes keep life interesting", "I welcome a new direction", "I like a balance of both"], helper: "Think about the balance of stability and discovery you want." },
  {"key": "individuality", "section": "Beliefs & values", "title": "How important is doing things your own way?", "options": ["Very important", "Important when it matters", "I balance my wishes with others", "Shared traditions often guide me"], helper: "Think about balancing your own path with shared expectations." },
  {"key": "moneyValues", "section": "Beliefs & values", "title": "What does financial wellbeing mean to you?", "options": ["Security and peace of mind", "Freedom to choose", "Enjoying experiences", "Building something lasting", "Being able to help others"], "max": 2, helper: "The role you hope money can play, not how much you have." },
  {"key": "relationshipStructure", "section": "Love & connection", "title": "What kind of relationship fits you?", "helper": "Think about the agreement you would want to build with a partner.", "options": ["Monogamous", "Ethically non-monogamous", "Open to discussing it", "Still exploring"]},
  {"key": "childrenAlignment", "section": "Love & connection", "title": "How closely should your family plans align?", "helper": "Separate your own hopes from how much flexibility you have with a partner.", "options": ["We need to want the same future", "Some flexibility, with an honest conversation", "I am still figuring this out"]},
  {"key": "smokingFit", "section": "Love & connection", "title": "How do you feel about a partner smoking or vaping?", "helper": "Think about what would feel comfortable in everyday life together.", "options": ["I need a smoke-free and vape-free partner", "Occasional use would be okay", "No strong preference"]},
  {"key": "drinkingFit", "section": "Love & connection", "title": "What would feel right around alcohol?", "helper": "Think about your comfort with a partner\u2019s drinking, not their worth.", "options": ["I want an alcohol-free partner", "Occasional drinking is fine", "Regular social drinking is fine", "No strong preference"]},
  {"key": "partnerEnergy", "section": "Love & connection", "title": "What social energy draws you in?", "helper": "You do not have to want someone whose rhythm matches your own.", "options": ["Quiet and reflective", "Outgoing and social", "A balance of both", "Different from mine could be good", "No strong preference"]},
  {"key": "goodNewsSupport", "title": "When something goes well, what feels good to hear?", "helper": "Imagine sharing a small win with someone you are dating.", "options": ["Ask me about the details", "Share my excitement", "Tell me they are proud of me", "Celebrate in a quiet way", "It depends on the moment"], "section": "Love & connection"},
  {"key": "feelingUnderstood", "title": "What helps you feel really understood?", "helper": "Think about how someone responds when you share something personal.", "options": ["Listen without rushing to a solution", "Ask thoughtful follow-up questions", "Reflect back what they heard", "Remember what matters to me", "Give me time to find the words", "It depends on what I am sharing"], "section": "Love & connection"},
  {"key": "conflictRepair", "title": "After a disagreement, what helps you reconnect?", "helper": "Think about a respectful disagreement once you both feel ready to reconnect.", "options": ["A clear apology and changed behavior", "Feeling that we understand each other", "Agreeing on a practical next step", "A gentle moment of warmth", "Some space, then a check-in", "I am still learning what helps"], "section": "Love & connection"},
  {"key": "goalSupport", "title": "How would you want a partner to support your goals?", "helper": "Imagine working toward something that matters to you, while keeping it your own.", "options": ["Encourage me and let me lead", "Be a sounding board when I ask", "Offer practical help when invited", "Celebrate progress along the way", "Give me room to focus", "It depends on the goal"], "section": "Love & connection"},
  { key: "smokingOwn", section: "Your world", title: "Do you smoke or vape?", options: ["No, never", "I used to, not anymore", "Occasionally", "Regularly"], helper: "Your own habits help pair people thoughtfully — not a judgment of worth." },
  { key: "drinkingOwn", section: "Your world", title: "How do you usually drink?", options: ["I do not drink", "Rarely", "Socially now and then", "Regularly with friends", "Most days"], helper: "Think about a typical week, not a special occasion." },
  { key: "dietary", section: "Your world", title: "What should a dinner plan respect?", options: ["No restrictions", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Dairy-free", "Nut allergy or caution", "Pescatarian", "Another need"], max: 3, helper: "So a first dinner can feel easy and considerate." },
  { key: "petsFit", section: "Love & connection", title: "How do you feel about a partner with pets?", options: ["I would love that", "Fine with most pets", "Depends on the animal", "I prefer a pet-free home", "No strong preference"], helper: "Everyday life with animals, not just a cute photo." },
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
/** Indices 0–6: phone, name, city, code, energy, conversations, chemistry. */
export const TRAIT_OFFSET = 7;
export const PHOTO_STEP = TRAIT_OFFSET + personalityQuestions.length;
export const QUESTION_COUNT = PHOTO_STEP + 1;
export const onboardingSections = ["The basics", "Personality", "Beliefs & values", "Your world", "Attraction", "Love & connection"] as const;
export function questionSection(index: number): string {
  if (index === PHOTO_STEP) return "Love & connection";
  if (index <= 3) return "The basics";
  if (index === 4 || index === 5) return "Personality";
  if (index === 6) return "Love & connection";
  return personalityQuestions[index - TRAIT_OFFSET]?.section ?? "The basics";
}
export const onboardingOrder = onboardingSections.flatMap(section => Array.from({length:QUESTION_COUNT},(_,i)=>i).filter(i=>questionSection(i)===section));
export const nextQuestion = (question: number) => onboardingOrder[onboardingOrder.indexOf(question)+1];
export const previousQuestion = (question: number) => onboardingOrder[onboardingOrder.indexOf(question)-1];
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
      return true; // UI-only code step; never represents authentication.
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
    case 6:
      return (chemistryOptions as readonly string[]).includes(
        answers.chemistry,
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
};
export const initialFlow = (): Flow => ({
  stage: "intro",
  intro: 0,
  question: 0,
  answers: emptyAnswers(),
  reviewAfterEdit: false,
  conditionsAccepted: emptyConditionAcceptances(),
});
export type Action =
  | { type: "next" }
  | { type: "back" }
  | { type: "answer"; patch: Partial<Answers> }
  | { type: "toggleCondition"; id: string }
  | { type: "edit"; question: number }
  | { type: "reset" }
  /** Known phone: skip name/city and land on the code step. */
  | { type: "phoneKnown"; name: string; phone: string }
  /** Returning phone session: skip signup and open home. */
  | { type: "returningHome"; name: string; phone: string };
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
    case "returningHome":
      return {
        ...initialFlow(),
        stage: "home",
        answers: {
          ...emptyAnswers(),
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
      )
        return nextQuestion(state.question) === undefined
          ? isComplete(state.answers) ? { ...state, stage: "section" } : state
          : questionSection(nextQuestion(state.question)) !== questionSection(state.question)
            ? { ...state, stage: "section" }
            : { ...state, question: nextQuestion(state.question) };
      if(state.stage === "section") return nextQuestion(state.question) === undefined
        ? { ...state, stage: "review" }
        : { ...state, stage: "questions", question: nextQuestion(state.question) };
      if (state.stage === "review" && isComplete(state.answers))
        return { ...state, stage: "conditions" };
      if (state.stage === "conditions" && allConditionsAccepted(state.conditionsAccepted))
        return { ...state, stage: "home" };
      return state;
    case "back":
      if (state.stage === "intro")
        return { ...state, intro: Math.max(0, state.intro - 1) };
      if(state.stage === "section") return { ...state, stage: "questions" };
      if (state.stage === "questions")
        return previousQuestion(state.question) !== undefined
          ? { ...state, question: previousQuestion(state.question) }
          : { ...state, stage: "intro", intro: 3 };
      if (state.stage === "conditions")
        return { ...state, stage: "review" };
      if (state.stage === "review")
        return { ...state, stage: "questions", question: onboardingOrder[onboardingOrder.length - 1] };
      return state;
  }
}
