import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  createContext,
  useContext,
} from "react";
import {
  AccessibilityInfo,
  Image,
  Animated,
  AppState,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color, serif, motion } from "./src/theme";
import {
  Answers,
  Action,
  Flow,
  personalityQuestions,
  questionHelper,
  chemistryOptions,
  conversations,
  flowReducer,
  initialFlow,
  isComplete,
  isStepValid,
  QUESTION_COUNT,
  onboardingOrder,
  onboardingSections,
  questionSection,
  nextQuestion,
  toggleChoice,
} from "./src/onboarding";

import { profileProgress } from "./src/profile-progress";
import { InvitationMessages } from "./src/InvitationMessages";
import { DateHome, NavIcon, InvitationArt, dateStyles } from "./src/DateHome";
import { plansReducer, DatePlan, PlanAction } from "./src/date-plans";

const FlowContext = createContext<{
  flow: Flow;
  dispatch: React.Dispatch<Action>;
  plans: DatePlan[];
  planDispatch: React.Dispatch<PlanAction>;
  saved: boolean;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);
export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [flow, dispatch] = useReducer(flowReducer, undefined, initialFlow);
  const [saved, setSaved] = useState(false);
  const [plans, planDispatch] = useReducer(plansReducer, []);
  return (
    <FlowContext.Provider value={{ flow, dispatch, saved, setSaved, plans, planDispatch }}>
      {children}
    </FlowContext.Provider>
  );
}
const homeRoutes = {
  "Events": "/home",
  Invites: "/invitations",
  You: "/you",
} as const;

const intros = [
  {
    label: "A DIFFERENT KIND OF BEGINNING",
    title: ["Less scrolling.", "More butterflies."],
    accent: 1,
    body: "There’s a whole person on the other side of a first hello.",
    foot: "11:11 is a little space for that hello to happen.",
  },
  {
    label: "01 / THE PERSON, NOT THE PROFILE",
    title: ["A little about you.", "A real connection."],
    accent: 1,
    body: "Your curiosity. Your energy. The things you could talk about for hours.",
    foot: "We start with who you are, not a swipe.",
  },
  {
    label: "02 / TWO PEOPLE. ONE SHARED PLAN.",
    title: ["A table for two.", "Or a little adventure."],
    accent: 1,
    body: "A 1:1 blind date, built around an experience you can share.",
    foot: "The idea is simple: less planning, more being there.",
  },
  {
    label: "03 / BEFORE THE FIRST HELLO",
    title: ["Come as you are.", "Start with you."],
    accent: 0,
    body: "A few thoughtful questions help make room for a connection that feels like you.",
    foot: "Take your time. There are no perfect answers.",
  },
];
const questions = [
  { label: "A FIRST HELLO", title: "What should we call you?", helper: "A first name or nickname is perfect." },
  { label: "YOUR NUMBER", title: "Stay in the loop.", helper: "Phone number preview. Leave blank to try the flow without personal data." },
  { label: "CODE PREVIEW", title: "A little confirmation.", helper: "In the finished app, you would enter a text-message code here. No code has been sent. Tap Next to continue." },
  { label: "YOUR SOCIAL RHYTHM", title: "Around someone new, you tend to…", helper: "Think about your natural rhythm before you feel completely at ease." },
  { label: "THE GOOD CONVERSATIONS", title: "What makes you lose track of time?", helper: "The topics you could happily talk about for hours. Pick two or three." },
  { label: "A LITTLE CHEMISTRY", title: "What draws you closer?", helper: "Think about the feeling that makes you want a second date." },
];
const energyLabels = [
  "Introvert",
  "Mostly introverted",
  "Ambivert",
  "Mostly extroverted",
  "Extrovert",
];

function useGentleMotion() {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    let motionReduced = true,
      reader = false;
    const update = () => mounted && setReduce(motionReduced || reader);
    Promise.all([
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isScreenReaderEnabled(),
    ])
      .then(([motion, screenReader]) => {
        motionReduced = motion;
        reader = screenReader;
        update();
      })
      .catch(() => {
        motionReduced = true;
        update();
      });
    const a = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        motionReduced = value;
        update();
      },
    );
    const b = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (value) => {
        reader = value;
        update();
      },
    );
    return () => {
      mounted = false;
      a.remove();
      b.remove();
    };
  }, []);
  return reduce;
}
function Reveal({
  children,
  delay = 0,
  reduce,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  reduce: boolean;
  style?: any;
}) {
  const [value] = useState(() => new Animated.Value(reduce ? 1 : 0));
  useEffect(() => {
    value.setValue(reduce ? 1 : 0);
    if (reduce) return;
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: motion.reveal,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        animation.stop();
        value.setValue(1);
      }
    });
    return () => {
      animation.stop();
      sub.remove();
    };
  }, [delay, reduce, value]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
function Brand({ small = false }: { small?: boolean }) {
  return (
    <View accessible accessibilityLabel="11:11" style={s.brandWrap}>
      <Text style={[s.brand, small && s.brandSmall]}>11:11</Text>
      <Text style={s.brandSpark}>✧</Text>
    </View>
  );
}
function Button({
  label,
  onPress,
  disabled = false,
  subtle = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  subtle?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        subtle && s.buttonSubtle,
        disabled && s.buttonDisabled,
        pressed && !disabled && s.pressed,
      ]}
    >
      <Text style={[s.buttonText, subtle && s.buttonSubtleText]}>{label}</Text>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[s.buttonArrow, subtle && s.buttonSubtleText]}
      >
        →
      </Text>
    </Pressable>
  );
}
function Choice({
  label,
  caption,
  selected,
  onPress,
  symbol,
  role = "checkbox",
}: {
  label: string;
  caption?: string;
  selected: boolean;
  onPress: () => void;
  symbol?: string;
  role?: "checkbox" | "radio";
}) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={({ pressed }) => [
        s.choice,
        selected && s.choiceSelected,
        pressed && s.pressed,
      ]}
    >
      {symbol && <Text style={s.choiceSymbol}>{symbol}</Text>}
      <View style={s.choiceCopy}>
        <Text style={s.choiceLabel}>{label}</Text>
        {caption && <Text style={s.choiceCaption}>{caption}</Text>}
      </View>
      <View style={[s.choiceMark, selected && s.choiceMarkSelected]}>
        <Text style={s.choiceCheck}>{selected ? "✓" : ""}</Text>
      </View>
    </Pressable>
  );
}
function Intro({
  index,
  next,
  back,
  reduce,
}: {
  index: number;
  next: () => void;
  back: () => void;
  reduce: boolean;
}) {
  const page = intros[index];
  const compact = useWindowDimensions().width < 350;
  return (
    <>
      <View style={s.topBar}>
        <Brand />
        {index > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous introduction"
            onPress={back}
            style={s.textButton}
          >
            <Text style={s.mutedButton}>Back</Text>
          </Pressable>
        ) : (
          <Text style={s.preview}>UI PREVIEW</Text>
        )}
      </View>
      <ScrollView
        contentContainerStyle={[
          s.introScroll,
          compact && { paddingVertical: 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View key={index} style={s.introContent}>
          <Reveal delay={50} reduce={reduce}>
            <Text style={s.eyebrow}>{page.label}</Text>
          </Reveal>
          <View accessibilityRole="header" style={s.introTitleGroup}>
            {page.title.map((line, i) => (
              <Reveal key={line} delay={300 + i * 650} reduce={reduce}>
                <Text
                  style={[
                    s.introTitle,
                    compact && {
                      fontSize: 22,
                      lineHeight: 31,
                      letterSpacing: -0.9,
                    },
                    i === page.accent && s.accentItalic,
                  ]}
                >
                  {line}
                </Text>
              </Reveal>
            ))}
          </View>
          <Reveal delay={1700} reduce={reduce}>
            <Text
              style={[s.introBody, compact && { fontSize: 15, lineHeight: 24 }]}
            >
              {page.body}
            </Text>
          </Reveal>
          <Reveal delay={2450} reduce={reduce}>
            <Text style={s.introFoot}>{page.foot}</Text>
          </Reveal>
        </View>
      </ScrollView>
      <View style={s.introBottom}>
        <View
          accessibilityLabel={`Introduction ${index + 1} of 4`}
          style={s.pageDots}
        >
          {intros.map((_, i) => (
            <View key={i} style={[s.pageDot, i === index && s.pageDotActive]} />
          ))}
        </View>
        <Button
          label={
            index === 3
              ? "Let’s begin"
              : index === 0
                ? "A little introduction"
                : "Next"
          }
          onPress={next}
        />
        <Text style={s.bottomNote}>
          {index === 3
            ? `${QUESTION_COUNT} questions · your own pace`
            : "A first hello, without the rush."}
        </Text>
      </View>
    </>
  );
}
function SectionComplete({ question, next, back, reduce }: { question:number; next:()=>void; back:()=>void; reduce:boolean }) {
  const section = questionSection(question);
  const upcoming = nextQuestion(question);
  const following = upcoming === undefined ? null : questionSection(upcoming);
  const descriptions: Record<string,string> = {
    "Personality":"Next, the little things that make you you: your energy, humor, and how you move through life.",
    "Beliefs & values":"Next, what matters to you. Share as much or as little of your background and beliefs as you like.",
    "Your world":"Next, your everyday world: music, movies, movement, and the things you enjoy.",
    "Attraction":"Next, a little about attraction. There is no right answer, and you can opt out of rating yourself.",
    "Love & connection":"Finally, how you connect and what you hope to find."
  };
  return <><View style={s.questionTop}><Pressable accessibilityRole="button" accessibilityLabel="Back to the last question" onPress={back} style={s.backButton}><Text style={s.backArrow}>←</Text></Pressable><Brand small/></View><ScrollView contentContainerStyle={[s.questionScroll,{flexGrow:1,justifyContent:"center"}]}><Reveal reduce={reduce}><Text style={s.eyebrow}>SECTION {onboardingSections.indexOf(section as typeof onboardingSections[number])+1} COMPLETE</Text><Text style={s.questionTitle}>{section}.{"\n"}A little more you.</Text><Text style={s.helper}>{following ? descriptions[following] : "Your introduction is ready. Take a moment to review it before stepping inside."}</Text><Text style={s.inputNote}>Your answers are kept as you continue. You can revisit them.</Text></Reveal></ScrollView><View style={s.questionBottom}><Button label={following ? "Next: "+following : "Review my introduction"} onPress={next}/></View></>;
}
function Questionnaire({ index, answers, patch, next, back, reduce }: { index: number; answers: Answers; patch: (patch: Partial<Answers>) => void; next: () => void; back: () => void; reduce: boolean }) {
  const [code, setCode] = useState("");
  const trait = personalityQuestions[index - 6];
  const q = trait ? { label: trait.section.toUpperCase(), title: trait.title, helper: questionHelper(trait) } : questions[index];
  const valid = isStepValid(index, answers);
  const optional = trait && "optional" in trait && trait.optional;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(()=>{ scroll.current?.scrollTo({ y:0, animated:false }); },[index]);
  return <>
    <View style={s.questionTop}><Pressable accessibilityRole="button" accessibilityLabel="Previous step" onPress={back} style={s.backButton}><Text style={s.backArrow}>←</Text></Pressable><Brand small/><Text style={s.stepCount}>{String(onboardingOrder.indexOf(index)+1).padStart(2,"0")} <Text style={s.countMuted}>/ {QUESTION_COUNT}</Text></Text></View>
    <View accessibilityRole="progressbar" accessibilityValue={{min:0,max:QUESTION_COUNT,now:onboardingOrder.indexOf(index)+1}} style={s.progressTrack}><View style={[s.progressFill,{width:`${(onboardingOrder.indexOf(index)+1)/QUESTION_COUNT*100}%`}]}/></View>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.questionScroll}><Reveal key={index} reduce={reduce}><Text style={s.eyebrow}>{q.label}</Text><Text style={s.questionTitle}>{q.title}</Text><Text style={s.helper}>{q.helper}</Text><View style={s.answerArea}>
      {index===0&&<TextInput accessibilityLabel="First name or nickname" value={answers.name} onChangeText={name=>patch({name})} placeholder="Your first name" placeholderTextColor={color.muted} style={s.nameInput} maxLength={30}/>}
      {index===1&&<><TextInput accessibilityLabel="Phone number preview" value={answers.phone??""} onChangeText={phone=>patch({phone})} placeholder="+1 (555) 000-0000" placeholderTextColor={color.muted} keyboardType="phone-pad" autoComplete="off" style={s.nameInput} maxLength={24}/><Text style={s.inputNote}>Local preview only. Nothing is sent or verified.</Text></>}
      {index===2&&<TextInput accessibilityLabel="Demo confirmation code" value={code} onChangeText={value=>setCode(value.replace(/\D/g,""))} placeholder="000000" placeholderTextColor={color.muted} keyboardType="number-pad" autoComplete="off" style={[s.nameInput,{letterSpacing:8}]} maxLength={6}/>}
      {index===3&&energyLabels.map((v,i)=><Choice key={v} label={v} role="radio" selected={answers.energy===i+1} onPress={()=>patch({energy:i+1})}/>)}
      {index===4&&conversations.map(v=><Choice key={v} label={v} selected={answers.conversations.includes(v)} onPress={()=>patch({conversations:toggleChoice(answers.conversations,v,3)})}/>)}
      {index===5&&chemistryOptions.map(v=><Choice key={v} label={v} role="radio" selected={answers.chemistry===v} onPress={()=>patch({chemistry:v})}/>)}
      {trait&&<TraitChoices question={trait} values={answers.traits?.[trait.key]??[]} onChange={values=>patch({traits:{...answers.traits,[trait.key]:values}})}/>}
    </View></Reveal></ScrollView>
    <View style={s.questionBottom}><Button label={index===1||index===2?"Next":optional&&!(answers.traits?.[trait.key]?.length)?"Skip for now":nextQuestion(index)===undefined?"Finish this section":"Continue"} disabled={!valid} onPress={next}/><Text style={s.bottomNote}>Your answers stay in this preview only.</Text></View>
  </>;
}
type TraitQuestion = (typeof personalityQuestions)[number];
function TraitChoices({ question, values, onChange }: { question: TraitQuestion; values: string[]; onChange: (values: string[]) => void }) {
  const maximum = "max" in question ? question.max : 1;
  if (question.key === "height") return <View style={{height:242,borderWidth:1,borderColor:color.line,borderRadius:20,overflow:"hidden"}}><ScrollView nestedScrollEnabled showsVerticalScrollIndicator contentOffset={{x:0,y:Math.max(0,question.options.indexOf(values[0])-2)*48}}>{question.options.map(option=><Pressable key={option} accessibilityRole="radio" accessibilityState={{checked:values.includes(option)}} onPress={()=>onChange([option])} style={{height:48,alignItems:"center",justifyContent:"center",backgroundColor:values.includes(option)?color.surfaceRaised:"transparent"}}><Text style={{fontFamily:serif,fontSize: 15,color:values.includes(option)?color.accent:color.ink}}>{option}{values.includes(option)?" ✓":""}</Text></Pressable>)}</ScrollView></View>;

  return <View style={s.chips}>{question.options.map(option => {
    const selected = values.includes(option);
    const disabled = !selected && values.length >= maximum && maximum > 1;
    return <Pressable key={option} accessibilityRole={maximum === 1 ? "radio" : "checkbox"} accessibilityLabel={option} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={() => onChange(maximum === 1 || option === "Prefer not to say" ? [option] : toggleChoice(values.filter(v=>v!=="Prefer not to say"), option, maximum))} style={[s.chip, selected && s.chipSelected, disabled && { opacity: 0.4 }]}><Text style={[s.chipText, selected && { color: color.ink }]}>{option}{selected ? " ✓" : ""}</Text></Pressable>;
  })}</View>;
}
const sections = ["The basics", "Personality", "Beliefs & values", "Your world", "Attraction", "Love & connection"];
function answerRows(answers: Answers) {
  return [
    { section: "The basics", label: "Name", value: answers.name, index: 0 },
    { section: "The basics", label: "Phone · not verified", value: answers.phone ? "••• " + answers.phone.slice(-4) : "Not provided", index: 1 },
    { section: "Personality", label: "Social energy", value: energyLabels[(answers.energy ?? 3) - 1], index: 3 },
    { section: "Personality", label: "Conversation", value: answers.conversations.join(" · "), index: 4 },
    { section: "Love & connection", label: "Chemistry", value: answers.chemistry, index: 5 },
    ...personalityQuestions.map((q, i) => ({ section: q.section, label: q.title, value: (answers.traits?.[q.key] ?? []).join(" · ") || "Not answered yet", index: i + 6 })),
  ];
}
function Summary({ answers, edit }: { answers: Answers; edit: (index: number) => void }) {
  return <View style={s.summary}>{sections.map(section => <View key={section} style={s.profileSection}>
    <Text style={s.sectionTitle}>{section}</Text>
    {answerRows(answers).filter(row => row.section === section).map(row => <Pressable key={row.index} accessibilityRole="button" accessibilityLabel={`Edit ${row.label}: ${row.value}`} onPress={() => edit(row.index)} style={s.summaryRow}><View style={s.summaryCopy}><Text style={s.summaryLabel}>{row.label}</Text><Text style={s.summaryValue}>{row.value}</Text></View><Text style={s.edit}>Edit</Text></Pressable>)}
  </View>)}</View>;
}
function ProfileSections({answers,open}:{answers:Answers;open:(section:string)=>void}){
  const progress=profileProgress(answers);
  const answered=progress.reduce((sum,p)=>sum+p.answered,0);
  const total=progress.reduce((sum,p)=>sum+p.total,0);
  return <View style={{gap:16}}>
    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}><Text style={{fontFamily:serif,fontSize: 18,color:color.ink}}>Your introduction</Text><Text style={{color:color.accent,fontSize: 15}}>{Math.round(answered/total*100)}%</Text></View>
    <View style={{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",gap:12}}>
      {progress.map((item,i)=><Pressable key={item.section} accessibilityRole="button" accessibilityLabel={`${item.section}, ${item.answered} of ${item.total} answered. Edit section`} onPress={()=>open(item.section)} style={{width:i%3===2?"100%":"48%",minHeight:i%3===2?142:178,borderWidth:1,borderColor:color.line,borderRadius:24,padding:18,backgroundColor:color.surface,justifyContent:"space-between"}}>
        <View accessible={false} style={{height:i%3===2?45:78,alignItems:"center",justifyContent:"center"}}>
          <View style={{width:45+i*3,height:45,borderWidth:1,borderColor:color.accent,borderRadius:i%2?24:6,transform:[{rotate:`${i*15}deg`}]}}/>
          <View style={{position:"absolute",width:24,height:24,borderWidth:1,borderColor:color.ink,borderRadius:14,transform:[{translateX:12},{translateY:-5}]}}/>
        </View>
        <Text style={{fontFamily:serif,fontSize: 14,color:color.ink,marginTop:12}}>{item.section}</Text>
        <View accessibilityRole="progressbar" accessibilityLabel={item.section+" answers"} accessibilityValue={{min:0,max:item.total,now:item.answered}} style={{height:3,borderRadius:2,backgroundColor:color.line,marginTop:12,overflow:"hidden"}}><View style={{width:`${item.percent}%`,height:3,backgroundColor:color.accent}}/></View>
      </Pressable>)}
    </View>
  </View>;
}
function ProfileEditor({ answers, patch }: { answers: Answers; patch: (patch: Partial<Answers>) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [sectionOpen, setSectionOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState(answers);
  const [photoError, setPhotoError] = useState("");
  const [picking, setPicking] = useState(false);
  const choosePhoto = async () => {
    if (picking) return;
    setPicking(true); setPhotoError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) patch({ photoUri: result.assets[0].uri });
    } catch { setPhotoError("Couldn’t open photos. Please try again."); }
    finally { setPicking(false); }
  };
  const trait = editing === null ? undefined : personalityQuestions[editing - 6];
  return <>
    <View style={s.profileHero}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose your profile photo" disabled={picking} onPress={choosePhoto} style={s.profilePhoto}>
        {answers.photoUri ? <Image source={{ uri: answers.photoUri }} style={s.profileImage} /> : <Text style={s.photoPlaceholder}>＋</Text>}
      </Pressable>
      <Text style={s.homeTitle}>{answers.name.trim()}</Text>
      <Pressable accessibilityRole="button" onPress={choosePhoto} disabled={picking} style={s.textButton}><Text style={s.edit}>{picking ? "Opening photos…" : answers.photoUri ? "Change photo" : "Add your photo"}</Text></Pressable>
      {!!photoError && <Text style={s.helper}>{photoError}</Text>}
      <Text style={s.helper}>A few pieces of what makes you, you.</Text>
    </View>
    {sectionOpen ? <View>
      <Pressable accessibilityRole="button" onPress={()=>setSectionOpen(null)} style={s.textButton}><Text style={s.mutedButton}>← All sections</Text></Pressable>
      <Text style={[s.sectionTitle,{marginTop:16}]}>{sectionOpen}</Text>
      {answerRows(answers).filter(row=>row.section===sectionOpen).map(row=><Pressable key={row.index} accessibilityRole="button" accessibilityLabel={`Edit ${row.label}: ${row.value}`} onPress={()=>{setDraft(answers);setEditing(row.index);}} style={s.summaryRow}><View style={s.summaryCopy}><Text style={s.summaryLabel}>{row.label}</Text><Text style={s.summaryValue}>{row.value}</Text></View><Text style={s.edit}>Edit</Text></Pressable>)}
    </View> : <ProfileSections answers={answers} open={setSectionOpen}/>}

    <Modal visible={editing !== null} animationType="slide" onRequestClose={() => setEditing(null)}>
      <SafeAreaView style={[s.safe, { backgroundColor: color.background }]}>
        <View style={s.questionTop}><Pressable accessibilityRole="button" onPress={() => setEditing(null)} style={s.textButton}><Text style={s.mutedButton}>Cancel</Text></Pressable><Brand small /></View>
        <ScrollView contentContainerStyle={s.questionScroll}>
          <Text style={s.eyebrow}>EDIT YOUR INTRODUCTION</Text>
          <Text style={s.questionTitle}>{trait?.title ?? (editing === null ? "" : questions[editing]?.title)}</Text>
          <View style={s.answerArea}>
          {editing === 0 && <TextInput accessibilityLabel="First name" value={draft.name} onChangeText={name => setDraft({ ...draft, name })} style={s.nameInput} maxLength={30} />}
          {editing === 1 && <TextInput accessibilityLabel="Phone number preview" value={draft.phone??""} onChangeText={phone=>setDraft({...draft,phone})} keyboardType="phone-pad" style={s.nameInput} maxLength={24}/>}
          {editing === 3 && energyLabels.map((v, i) => <Choice key={v} label={v} role="radio" selected={draft.energy === i + 1} onPress={() => setDraft({ ...draft, energy: i + 1 })} />)}
          {editing === 4 && <><Text style={s.helper}>The topics you could happily talk about for hours. Pick two or three.</Text>{conversations.map(v => <Choice key={v} label={v} selected={draft.conversations.includes(v)} onPress={() => setDraft({ ...draft, conversations: toggleChoice(draft.conversations, v, 3) })} />)}</>}
          {editing === 5 && chemistryOptions.map(v => <Choice key={v} label={v} role="radio" selected={draft.chemistry === v} onPress={() => setDraft({ ...draft, chemistry: v })} />)}
          {trait && <Text style={s.helper}>{questionHelper(trait)}</Text>}
          {trait && <TraitChoices question={trait} values={draft.traits?.[trait.key] ?? []} onChange={values => setDraft({ ...draft, traits: { ...draft.traits, [trait.key]: values } })} />}
          </View>
        </ScrollView>
        <View style={s.questionBottom}><Button label="Save changes" disabled={editing === null || !isStepValid(editing, draft)} onPress={() => { patch(draft); setEditing(null); }} /></View>
      </SafeAreaView>
    </Modal>
  </>;
}
function Review({
  answers,
  edit,
  next,
  back,
  reduce,
}: {
  answers: Answers;
  edit: (index: number) => void;
  next: () => void;
  back: () => void;
  reduce: boolean;
}) {
  return (
    <>
      <View style={s.questionTop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          onPress={back}
          style={s.backButton}
        >
          <Text style={s.backArrow}>←</Text>
        </Pressable>
        <Brand small />
        <Text style={s.preview}>YOUR INTRO</Text>
      </View>
      <ScrollView contentContainerStyle={s.reviewScroll}>
        <Reveal reduce={reduce}>
          <Text style={s.eyebrow}>A LITTLE PORTRAIT OF YOU</Text>
          <Text accessibilityRole="header" style={s.questionTitle}>
            Nice to meet you,{"\n"}
            <Text style={s.accentItalic}>{answers.name.trim()}.</Text>
          </Text>
          <Text style={s.helper}>
            Not a profile to perform. Just a starting point.
          </Text>
          <Summary answers={answers} edit={edit} />
        </Reveal>
      </ScrollView>
      <View style={s.questionBottom}>
        <Button
          label="Enter 11:11"
          onPress={next}
          disabled={!isComplete(answers)}
        />
        <Text style={s.bottomNote}>
          UI preview only · no account or match created
        </Text>
      </View>
    </>
  );
}
function Home({ answers, reduce }: { answers: Answers; reduce: boolean }) {
  const { dispatch, plans, planDispatch } = useContext(FlowContext)!;
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname === "/you" ? "You" : pathname === "/invitations" ? "Invites" : "Events";
  const matches = plans.filter(p => p.demoMatched);
  return <View style={s.safe}>
    <View style={s.homeTop}>
      {tab === "Invites" ? <Text style={{fontFamily:serif,fontStyle:"italic",fontSize: 16,color:color.ink}}>INVITES</Text> : <Brand />}

    </View>
    {tab === "Events" && <DateHome plans={plans} dispatch={planDispatch} reduce={reduce}/>}
    {tab === "Invites" && (matches.length === 0 ? <View style={dateStyles.inviteBody}><InvitationArt/><InvitationMessages reduce={reduce}/></View> : <ScrollView>{matches.map(p=><View key={p.type} style={dateStyles.inviteCard}><Text style={s.eyebrow}>DEMO INVITATION</Text><Text style={dateStyles.inviteText}>{p.type}</Text><Text style={s.helper}>Timing and location to be arranged</Text><Text style={s.notePrivacy}>A preview of a match. No real person or booking is connected.</Text></View>)}</ScrollView>)}
    {tab === "You" && <ScrollView contentContainerStyle={s.homeScroll}><ProfileEditor answers={answers} patch={patch=>dispatch({type:"answer",patch})}/><Text style={s.notePrivacy}>Your answers and photo stay in this preview session. Nothing is submitted.</Text></ScrollView>}
    <View accessibilityRole="tablist" style={s.tabBar}>
      {(["Events","Invites","You"] as const).map(item=><Pressable key={item} accessibilityRole="tab" accessibilityLabel={item} accessibilityState={{selected:tab===item}} aria-selected={tab===item} onPress={()=>router.replace(homeRoutes[item])} style={s.tab}><NavIcon name={item} active={tab===item}/></Pressable>)}
    </View>

  </View>;
}
export default function AppContent() {
  const context = useContext(FlowContext);
  if (!context) throw new Error("The preview requires FlowProvider.");
  const { flow, dispatch } = context;
  const router = useRouter();
  const pathname = usePathname();
  const unlocked = flow.stage === "home";
  const homePath = Object.values(homeRoutes).includes(
    pathname as (typeof homeRoutes)[keyof typeof homeRoutes],
  );
  useEffect(() => {
    if (!unlocked && pathname !== "/") router.replace("/");
    if (unlocked && !homePath) router.replace("/invitations");
  }, [unlocked, pathname, homePath, router]);
  const reduce = useGentleMotion();
  const { width } = useWindowDimensions();
  const lastPress = useRef(0);
  const next = () => {
    const now = Date.now();
    if (now - lastPress.current < 400) return;
    lastPress.current = now;
    Keyboard.dismiss();
    dispatch({ type: "next" });
  };
  const back = () => {
    Keyboard.dismiss();
    dispatch({ type: "back" });
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (flow.stage === "home" || (flow.stage === "intro" && flow.intro === 0))
        return false;
      dispatch({ type: "back" });
      return true;
    });
    return () => sub.remove();
  }, [flow.stage, flow.intro, dispatch]);
  const edit = (question: number) => dispatch({ type: "edit", question });
  if (reduce === null || unlocked !== homePath)
    return (
      <View style={s.outer}>
        <StatusBar style="light" />
      </View>
    );
  return (
    <View style={s.outer}>
      <StatusBar style="light" />
      <View style={[s.appFrame, width > 600 && s.desktopFrame]}>
        <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={s.safe}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {flow.stage === "intro" && (
              <Intro
                index={flow.intro}
                next={next}
                back={back}
                reduce={reduce}
              />
            )}
            {flow.stage === "questions" && (
              <Questionnaire
                index={flow.question}
                answers={flow.answers}
                patch={(patch) => dispatch({ type: "answer", patch })}
                next={next}
                back={back}
                reduce={reduce}
              />
            )}
            {flow.stage === "section" && <SectionComplete question={flow.question} next={next} back={back} reduce={reduce}/>}
            {flow.stage === "review" && (
              <Review
                answers={flow.answers}
                edit={edit}
                next={next}
                back={back}
                reduce={reduce}
              />
            )}
            {flow.stage === "home" && (
              <Home
                answers={flow.answers}
                reduce={reduce}

              />
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  profileHero: { alignItems: "center", paddingVertical: 12 },
  profilePhoto: { width: 126, height: 126, borderRadius: 63, backgroundColor: "#49303e", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: color.accent, marginBottom: 18 },
  profileImage: { width: "100%", height: "100%" },
  photoPlaceholder: { color: color.accent, fontSize: 27 },
  profileSection: { marginBottom: 28 },
  sectionTitle: { color: color.accent, fontFamily: serif, fontSize: 17, marginBottom: 8 },
  outer: { flex: 1, backgroundColor: "#160f17", alignItems: "center" },
  appFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    backgroundColor: color.background,
  },
  desktopFrame: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#49303e",
  },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 32,
    paddingTop: Platform.OS === "web" ? 35 : 16,
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandWrap: { flexDirection: "row", alignItems: "flex-start" },
  brand: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 22,
    letterSpacing: -2.5,
  },
  brandSmall: { fontSize: 19 },
  brandSpark: {
    color: color.accent,
    fontSize: 15,
    marginLeft: 3,
    marginTop: -2,
  },
  preview: { color: "#bba4b0", fontSize: 9, letterSpacing: 1.6 },
  textButton: { minHeight: 44, paddingHorizontal: 4, justifyContent: "center" },
  mutedButton: { color: color.muted, fontSize: 13 },
  introScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 38,
  },
  introContent: { paddingBottom: 13 },
  eyebrow: {
    color: color.accent,
    fontSize: 9,
    letterSpacing: 1.8,
    lineHeight: 16,
    marginBottom: 29,
  },
  introTitleGroup: { marginBottom: 28 },
  introTitle: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 27,
    lineHeight: 37,
    letterSpacing: -1.45,
  },
  accentItalic: { color: color.accent, fontStyle: "italic" },
  introBody: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 325,
  },
  introFoot: {
    color: color.muted,
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 22,
    maxWidth: 295,
  },
  introBottom: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === "web" ? 23 : 10,
  },
  pageDots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 7,
    marginBottom: 25,
    height: 5,
  },
  pageDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#69505c" },
  pageDotActive: { backgroundColor: color.accent, width: 23 },
  button: {
    backgroundColor: color.ink,
    minHeight: 56,
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  buttonText: {
    color: color.dark,
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
  buttonArrow: { color: color.dark, fontSize: 16, lineHeight: 22 },
  buttonDisabled: { opacity: 0.27 },
  buttonSubtle: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  buttonSubtleText: { color: color.ink },
  pressed: { opacity: 0.77 },
  bottomNote: {
    color: "#bca7b2",
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 16,
  },
  questionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "web" ? 25 : 6,
    paddingBottom: 14,
  },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backArrow: { color: color.ink, fontSize: 17 },
  stepCount: {
    fontSize: 11,
    color: color.accent,
    minWidth: 44,
    textAlign: "right",
  },
  countMuted: { color: "#947d8a" },
  progressTrack: {
    height: 2,
    backgroundColor: "#49323e",
    marginHorizontal: 32,
  },
  progressFill: { height: 2, backgroundColor: color.accent },
  questionScroll: {
    paddingHorizontal: 32,
    paddingTop: 38,
    paddingBottom: 25,
    flexGrow: 1,
  },
  questionTitle: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: -0.9,
  },
  helper: { color: color.muted, fontSize: 13, lineHeight: 21, marginTop: 17 },
  answerArea: { marginTop: 30 },
  questionBottom: {
    paddingHorizontal: 32,
    paddingTop: 15,
    paddingBottom: Platform.OS === "web" ? 22 : 9,
  },
  nameInput: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 27,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    minHeight: 65,
  },
  inputNote: { color: "#bba7b1", fontSize: 10, lineHeight: 18, marginTop: 12 },
  smallDivider: {
    width: 30,
    height: 1,
    backgroundColor: "#725360",
    marginVertical: 36,
  },
  sideNote: {
    color: "#bda6b0",
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  choice: {
    borderWidth: 1,
    borderColor: "#624754",
    backgroundColor: "#34232e",
    borderRadius: 17,
    paddingVertical: 19,
    paddingHorizontal: 16,
    marginBottom: 12,
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  choiceSelected: { borderColor: color.accent, backgroundColor: "#573b45" },
  choiceSymbol: {
    color: color.accent,
    fontFamily: serif,
    fontSize: 19,
    width: 28,
    textAlign: "center",
  },
  choiceCopy: { flex: 1 },
  choiceLabel: { color: color.ink, fontFamily: serif, fontSize: 15 },
  choiceCaption: {
    color: color.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },
  choiceMark: {
    width: 21,
    height: 21,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#92717e",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceMarkSelected: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  choiceCheck: { color: color.dark, fontSize: 13 },
  energyVisual: { alignItems: "center", paddingVertical: 22 },
  energyStar: {
    color: color.accent,
    fontFamily: serif,
    fontSize: 70,
    lineHeight: 90,
  },
  energySelected: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 15,
    marginTop: 7,
    marginBottom: 26,
  },
  energyRow: { flexDirection: "row", justifyContent: "space-between", gap: 7 },
  energyButton: {
    minWidth: 44,
    minHeight: 51,
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#7b5a69",
    justifyContent: "center",
    alignItems: "center",
  },
  energyButtonSelected: {
    backgroundColor: color.accent,
    borderColor: color.accent,
  },
  energyNumber: { color: color.ink, fontSize: 15 },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
  scaleText: { color: color.muted, fontSize: 10, lineHeight: 15 },
  scaleHint: {
    textAlign: "center",
    color: "#bba7b1",
    fontFamily: serif,
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 33,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  chip: {
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#735363",
    borderRadius: 30,
    minHeight: 52,
  },
  chipSelected: { backgroundColor: "#593b45", borderColor: color.accent },
  chipText: { color: "#dac8cd", fontFamily: serif, fontSize: 15 },
  noteInput: {
    minHeight: 178,
    color: color.ink,
    fontFamily: serif,
    fontSize: 14,
    lineHeight: 23,
    borderWidth: 1,
    borderColor: "#735363",
    borderRadius: 17,
    padding: 20,
    backgroundColor: "#30212d",
  },
  noteMeta: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  notePrivacy: {
    color: "#bba7b1",
    fontSize: 11,
    lineHeight: 19,
    marginVertical: 23,
  },
  reviewScroll: { paddingHorizontal: 32, paddingVertical: 25 },
  summary: { marginTop: 28 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#503543",
    paddingVertical: 19,
    gap: 16,
    minHeight: 70,
  },
  summaryCopy: { flex: 1 },
  summaryLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#b99b9c",
    marginBottom: 9,
    lineHeight: 14,
  },
  summaryValue: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 23,
    color: color.ink,
  },
  edit: { color: color.accent, fontSize: 11, paddingVertical: 12 },
  homeTop: {
    paddingHorizontal: 29,
    paddingTop: Platform.OS === "web" ? 30 : 12,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#654654",
    borderRadius: 30,
  },
  homeScroll: { paddingHorizontal: 29, paddingTop: 15, paddingBottom: 28 },
  homeTitle: {
    fontFamily: serif,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -1.2,
    color: color.ink,
  },
  homeGreeting: {
    color: color.muted,
    fontSize: 12,
    marginTop: 19,
    marginBottom: 30,
  },
  momentCard: {
    borderRadius: 24,
    backgroundColor: "#38252e",
    borderWidth: 1,
    borderColor: "#74505b",
    overflow: "hidden",
  },
  momentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 21,
    paddingTop: 20,
  },
  cardEyebrow: {
    color: "#d1b0a4",
    fontSize: 7,
    letterSpacing: 1.2,
    flexShrink: 1,
    lineHeight: 14,
  },
  cardStar: { fontSize: 15, color: color.accent },
  art: {
    height: 200,
    width: 260,
    alignSelf: "center",
    position: "relative",
    marginVertical: 3,
  },
  artArch: {
    position: "absolute",
    left: 53,
    top: 18,
    width: 154,
    height: 169,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderWidth: 1,
    borderColor: "#a77c7150",
    backgroundColor: "#83515b19",
  },
  artMoon: {
    width: 41,
    height: 41,
    borderRadius: 30,
    backgroundColor: "#b57e5d",
    opacity: 0.35,
    position: "absolute",
    top: 45,
    left: 110,
  },
  artStem: {
    width: 5,
    height: 29,
    backgroundColor: "#e6c7a1",
    position: "absolute",
    top: 102,
    left: 128,
  },
  artFlame: {
    width: 7,
    height: 12,
    borderTopLeftRadius: 9,
    borderBottomRightRadius: 9,
    backgroundColor: "#f0d19d",
    position: "absolute",
    top: 88,
    left: 127,
  },
  artGlass: {
    width: 27,
    height: 25,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    borderWidth: 1,
    borderColor: "#cda58d",
    backgroundColor: "#ad736627",
    position: "absolute",
    top: 96,
  },
  artGlassStem: {
    width: 1,
    height: 10,
    backgroundColor: "#cda58d",
    position: "absolute",
    top: 121,
  },
  artTable: {
    width: 168,
    height: 24,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "#cda58d",
    backgroundColor: "#67454a",
    position: "absolute",
    left: 46,
    top: 131,
  },
  artTableLeg: {
    width: 2,
    height: 34,
    backgroundColor: "#cda58d",
    position: "absolute",
    left: 129,
    top: 155,
  },
  artStar: { position: "absolute" },
  artStarText: { color: "#b88575", fontFamily: serif, fontSize: 14 },
  momentTitle: {
    fontFamily: serif,
    fontSize: 20,
    letterSpacing: -0.7,
    color: color.ink,
    textAlign: "center",
  },
  momentDescription: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 24,
    color: "#d1b9bd",
    textAlign: "center",
    marginTop: 13,
    marginBottom: 26,
  },
  momentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#77515d",
    paddingHorizontal: 23,
    paddingVertical: 19,
    backgroundColor: "#6f495024",
  },
  momentLink: { color: "#e6bea0", fontSize: 12 },
  homeFoot: { alignItems: "center", marginTop: 29 },
  smallLine: {
    height: 1,
    width: 27,
    backgroundColor: "#89606a",
    marginBottom: 18,
  },
  homeFootText: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    color: color.muted,
    textAlign: "center",
  },
  demoNote: {
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 20,
    color: "#b49ba7",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#573a48",
    paddingTop: 7,
    paddingBottom: Platform.OS === "web" ? 15 : 3,
    backgroundColor: color.background,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 7,
    minHeight: 61,
  },
  tabSymbol: { fontSize: 15, lineHeight: 22, color: "#9e8493" },
  tabLabel: { fontSize: 10, color: "#b09aa6" },
  tabActive: { color: color.accent },
  emptyInvite: {
    marginTop: 38,
    paddingVertical: 35,
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#593a49",
  },
  envelope: {
    fontFamily: serif,
    fontSize: 65,
    color: color.accent,
    marginBottom: 26,
  },
  emptyTitle: {
    fontFamily: serif,
    color: color.ink,
    fontSize: 15,
    textAlign: "center",
  },
  emptyBody: {
    color: color.muted,
    fontSize: 13,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 280,
  },
  savedRow: { marginTop: 30 },
  savedTitle: {
    color: color.accent,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  savedDescription: {
    fontFamily: serif,
    color: color.ink,
    fontSize: 16,
    marginTop: 13,
  },
  resetButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#755362",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#130b14d9",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalSafe: { width: "100%", maxWidth: 440, maxHeight: "100%" },
  detailSheet: {
    backgroundColor: "#34232e",
    borderWidth: 1,
    borderColor: "#886370",
    borderRadius: 28,
    overflow: "hidden",
    maxHeight: "100%",
  },
  closeButton: {
    position: "absolute",
    right: 13,
    top: 13,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 23,
    backgroundColor: "#4a303d",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: color.ink, fontSize: 18 },
  detailScroll: { padding: 27, paddingTop: 37 },
  detailBody: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    color: "#dac6cb",
    marginTop: 19,
  },
  detailRule: { height: 1, backgroundColor: "#74515e", marginVertical: 25 },
  detailMeta: {
    color: color.accent,
    fontSize: 8,
    letterSpacing: 0.7,
    lineHeight: 17,
  },
  confirmCard: {
    maxWidth: 380,
    width: "100%",
    padding: 28,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#886370",
    backgroundColor: color.surface,
  },
  confirmTitle: { fontFamily: serif, fontSize: 20, color: color.ink },
  cancelButton: {
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
