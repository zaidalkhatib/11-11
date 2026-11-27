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
  Alert,
  Image,
  Animated,
  AppState,
  BackHandler,
  Easing,
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
import * as Haptics from "expo-haptics";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color, serif, sans, motion } from "./src/theme";
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
  usPhoneWarning,
  PHOTO_STEP,
  TRAIT_OFFSET,
  cityOptions,
  onboardingSections,
  questionSection,
  nextQuestion,
  toggleChoice,
} from "./src/onboarding";

import { profileProgress } from "./src/profile-progress";
import { InvitationMessages } from "./src/InvitationMessages";
import { InviteEntrance } from "./src/InviteEntrance";
import { DateHome, NavIcon, InvitationArt, ActiveInvite, InviteCoverPager, dateStyles } from "./src/DateHome";
import { plansReducer, DatePlan, PlanAction, hasActiveInvite, eventToItinerary, type DinnerItinerary } from "./src/date-plans";
import {
  allConditionsAccepted,
  conditionCheckboxes,
  conditionDocument,
  conditionDocuments,
  type ConditionDocId,
} from "./src/conditions";
import {
  clearSession,
  createProfileAndAnswers,
  fetchDinnerEvents,
  fetchInvitations,
  leaveEvent,
  triggerMatcher,
  tryReturningLogin,
} from "./src/api";

type InviteEntranceState = { itineraryId: string; title: string; meta: string };
type HomeTab = "Events" | "Invites" | "You";
const homeTabOrder: HomeTab[] = ["Events", "Invites", "You"];
function homeTabFromPath(pathname: string): HomeTab {
  if (pathname === "/you") return "You";
  if (pathname === "/invitations") return "Invites";
  return "Events";
}
const FlowContext = createContext<{
  flow: Flow;
  dispatch: React.Dispatch<Action>;
  plans: DatePlan[];
  planDispatch: React.Dispatch<PlanAction>;
  saved: boolean;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
  /** Survives /home → /invitations remounts (expo-router). */
  openedInviteId: string | null;
  setOpenedInviteId: React.Dispatch<React.SetStateAction<string | null>>;
  inviteEntrance: InviteEntranceState | null;
  setInviteEntrance: React.Dispatch<React.SetStateAction<InviteEntranceState | null>>;
  /** Lets invite details crossfade in as the cinema text exits. */
  inviteReveal: boolean;
  setInviteReveal: React.Dispatch<React.SetStateAction<boolean>>;
  homeTab: HomeTab;
  setHomeTab: React.Dispatch<React.SetStateAction<HomeTab>>;
} | null>(null);
export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [flow, dispatch] = useReducer(flowReducer, undefined, initialFlow);
  const [saved, setSaved] = useState(false);
  const [plans, planDispatch] = useReducer(plansReducer, []);
  const [openedInviteId, setOpenedInviteId] = useState<string | null>(null);
  const [inviteEntrance, setInviteEntrance] = useState<InviteEntranceState | null>(null);
  const [inviteReveal, setInviteReveal] = useState(true);
  const [homeTab, setHomeTab] = useState<HomeTab>("Events");
  return (
    <FlowContext.Provider value={{
      flow, dispatch, saved, setSaved, plans, planDispatch,
      openedInviteId, setOpenedInviteId, inviteEntrance, setInviteEntrance,
      inviteReveal, setInviteReveal,
      homeTab, setHomeTab,
    }}>
      {children}
    </FlowContext.Provider>
  );
}

/** Lives in root layout so route remounts / system Modals cannot flash white. */
export function InviteEntranceHost() {
  const ctx = useContext(FlowContext);
  const reduce = useGentleMotion();
  const [holdScrim, setHoldScrim] = useState(true);
  if (!ctx?.inviteEntrance) return null;
  const { inviteEntrance, setInviteEntrance, setInviteReveal } = ctx;
  return (
    <View
      pointerEvents="auto"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 200,
        elevation: 200,
        // Opaque until the cinema begins exiting so the Invites panel never flashes through.
        backgroundColor: holdScrim ? color.background : "transparent",
      }}
    >
      <InviteEntrance
        key={inviteEntrance.itineraryId}
        title={inviteEntrance.title}
        meta={inviteEntrance.meta}
        reduce={reduce === true}
        onExitStart={() => {
          setHoldScrim(false);
          setInviteReveal(true);
        }}
        onDone={() => {
          setInviteEntrance(null);
          setHoldScrim(true);
        }}
      />
    </View>
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
    title: ["A table for two.", "One shared plan."],
    accent: 1,
    body: "A 1:1 blind dinner date, built around an evening you can share.",
    foot: "* More experiences may come later.",
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
  { label: "YOUR NUMBER", title: "What’s your number?", helper: "We’ll use this to sign you in next time. Enter a valid US phone number." },
  { label: "A FIRST HELLO", title: "What should we call you?", helper: "A first name or nickname is perfect." },
  { label: "YOUR CITY", title: "Where are you based?", helper: "The place you call home right now." },
  { label: "CODE PREVIEW", title: "A little confirmation.", helper: "In the finished app, you would enter a text-message code here. If you already have an account, we’ll bring you back in. No code has been sent yet." },
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
      <Text style={[s.brand, small && s.brandSmall]}>
        11<Text style={s.brandColon}>:</Text>11
      </Text>
      <Text style={s.brandSpark}>✧</Text>
    </View>
  );
}
/** Back arrow on the left, 11:11 on the right for every onboarding screen. */
function ScreenHeader({
  onBack,
  showBack = true,
  smallBrand = true,
}: {
  onBack?: () => void;
  showBack?: boolean;
  smallBrand?: boolean;
}) {
  return (
    <View style={s.questionTop}>
      {showBack && onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous step"
          onPress={onBack}
          style={s.backButton}
        >
          <Text style={s.backArrow}>←</Text>
        </Pressable>
      ) : (
        <View style={s.backButton} />
      )}
      <Brand small={smallBrand} />
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
      <ScreenHeader onBack={back} showBack={index > 0} smallBrand={false} />
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
  return <><ScreenHeader onBack={back}/><ScrollView contentContainerStyle={[s.questionScroll,{flexGrow:1,justifyContent:"center"}]}><Reveal reduce={reduce}><Text style={s.eyebrow}>SECTION {onboardingSections.indexOf(section as typeof onboardingSections[number])+1} COMPLETE</Text><Text style={s.questionTitle}>{section}.{"\n"}A little more you.</Text><Text style={s.helper}>{following ? descriptions[following] : "Your introduction is ready. Take a moment to review it before stepping inside."}</Text><Text style={s.inputNote}>Your answers are kept as you continue. You can revisit them.</Text></Reveal></ScrollView><View style={s.questionBottom}><Button label={following ? "Next: "+following : "Review my introduction"} onPress={next}/></View></>;
}
function Questionnaire({ index, answers, patch, next, back, reduce }: { index: number; answers: Answers; patch: (patch: Partial<Answers>) => void; next: () => void; back: () => void; reduce: boolean }) {
  const [code, setCode] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [picking, setPicking] = useState(false);
  const trait = index === PHOTO_STEP || index < TRAIT_OFFSET ? undefined : personalityQuestions[index - TRAIT_OFFSET];
  const q = index === PHOTO_STEP
    ? { label: "YOUR PHOTO", title: "Add a photo of you.", helper: "A clear photo helps your introduction feel real. It stays in this preview only." }
    : trait ? { label: trait.section.toUpperCase(), title: trait.title, helper: questionHelper(trait) } : questions[index];
  const valid = isStepValid(index, answers);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(()=>{ scroll.current?.scrollTo({ y:0, animated:false }); },[index]);
  const choosePhoto = async () => {
    if (picking) return;
    setPicking(true); setPhotoError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) patch({ photoUri: result.assets[0].uri });
    } catch { setPhotoError("Couldn’t open photos. Please try again."); }
    finally { setPicking(false); }
  };
  return <>
    <ScreenHeader onBack={back} />
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.questionScroll}><Reveal key={index} reduce={reduce}><Text style={s.eyebrow}>{q.label}</Text><Text style={s.questionTitle}>{q.title}</Text>{!!q.helper&&<Text style={s.helper}>{q.helper}</Text>}<View style={s.answerArea}>
      {index===0&&<><TextInput accessibilityLabel="US phone number" value={answers.phone??""} onChangeText={phone=>patch({phone})} placeholder="(415) 555-0100" placeholderTextColor={color.muted} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" style={s.nameInput} maxLength={16}/><Text style={[s.inputNote, usPhoneWarning(answers.phone??"") ? { color: color.accent } : null]}>{usPhoneWarning(answers.phone??"") ?? "US number · used to find your account next time."}</Text></>}
      {index===1&&<TextInput accessibilityLabel="First name or nickname" value={answers.name} onChangeText={name=>patch({name})} placeholder="Your first name" placeholderTextColor={color.muted} autoComplete="given-name" textContentType="givenName" style={s.nameInput} maxLength={30}/>}
      {index===2&&cityOptions.map(city=><Choice key={city} label={city} role="radio" selected={answers.city===city} onPress={()=>patch({city})}/>)}
      {index===3&&<TextInput accessibilityLabel="Demo confirmation code" value={code} onChangeText={value=>setCode(value.replace(/\D/g,""))} placeholder="000000" placeholderTextColor={color.muted} keyboardType="number-pad" autoComplete="off" style={[s.nameInput,{letterSpacing:8}]} maxLength={6}/>}
      {index===4&&energyLabels.map((v,i)=><Choice key={v} label={v} role="radio" selected={answers.energy===i+1} onPress={()=>patch({energy:i+1})}/>)}
      {index===5&&conversations.map(v=><Choice key={v} label={v} selected={answers.conversations.includes(v)} onPress={()=>patch({conversations:toggleChoice(answers.conversations,v,3)})}/>)}
      {index===6&&chemistryOptions.map(v=><Choice key={v} label={v} role="radio" selected={answers.chemistry===v} onPress={()=>patch({chemistry:v})}/>)}
      {index===PHOTO_STEP&&<View style={s.photoStep}>
        <Pressable accessibilityRole="button" accessibilityLabel={answers.photoUri ? "Change your photo" : "Add your photo"} disabled={picking} onPress={choosePhoto} style={[s.profilePhoto, answers.photoUri ? s.profilePhotoFilled : null]}>
          {answers.photoUri ? <Image source={{ uri: answers.photoUri }} style={s.profileImage} /> : <Text style={s.photoPlaceholder}>＋</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" onPress={choosePhoto} disabled={picking} style={s.textButton}>
          <Text style={s.edit}>{picking ? "Opening photos…" : answers.photoUri ? "Change photo" : "Choose a photo"}</Text>
        </Pressable>
        {!!photoError && <Text style={[s.helper, { textAlign: "center" }]}>{photoError}</Text>}
      </View>}
      {trait&&<TraitChoices question={trait} values={answers.traits?.[trait.key]??[]} onChange={values=>patch({traits:{...answers.traits,[trait.key]:values}})}/>}
    </View></Reveal></ScrollView>
    <View style={s.questionBottom}><Button label={index===PHOTO_STEP?(valid?"Continue":"Add a photo to continue"):index===0||index===2||index===3?"Next":nextQuestion(index)===undefined?"Finish this section":"Continue"} disabled={!valid} onPress={next}/></View>
  </>;
}
type TraitQuestion = (typeof personalityQuestions)[number];
function TraitChoices({ question, values, onChange }: { question: TraitQuestion; values: string[]; onChange: (values: string[]) => void }) {
  const maximum = "max" in question ? question.max : 1;
  if (question.key === "height" || question.key === "age") return <View style={{height:242,borderWidth:1,borderColor:color.line,borderRadius:20,overflow:"hidden"}}><ScrollView nestedScrollEnabled showsVerticalScrollIndicator contentOffset={{x:0,y:Math.max(0,question.options.indexOf(values[0])-2)*48}}>{question.options.map(option=><Pressable key={option} accessibilityRole="radio" accessibilityState={{checked:values.includes(option)}} onPress={()=>onChange([option])} style={{height:48,alignItems:"center",justifyContent:"center",backgroundColor:values.includes(option)?color.surfaceRaised:"transparent"}}><Text style={{fontFamily:serif,fontSize: 15,color:values.includes(option)?color.accent:color.ink}}>{option}</Text></Pressable>)}</ScrollView></View>;

  return <View style={s.chips}>{question.options.map(option => {
    const selected = values.includes(option);
    const disabled = !selected && values.length >= maximum && maximum > 1;
    return <Pressable key={option} accessibilityRole={maximum === 1 ? "radio" : "checkbox"} accessibilityLabel={option} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={() => onChange(maximum === 1 ? [option] : toggleChoice(values, option, maximum))} style={[s.chip, selected && s.chipSelected, disabled && { opacity: 0.4 }]}><Text style={[s.chipText, selected && { color: color.ink }]}>{option}</Text></Pressable>;
  })}</View>;
}
const sections = ["The basics", "Personality", "Beliefs & values", "Your world", "Attraction", "Love & connection"];
function answerRows(answers: Answers) {
  return [
    { section: "The basics", label: "Phone · not verified", value: answers.phone ? "••• " + answers.phone.slice(-4) : "Not provided", index: 0 },
    { section: "The basics", label: "Name", value: answers.name, index: 1 },
    { section: "The basics", label: "City", value: answers.city || "Not answered yet", index: 2 },
    { section: "Personality", label: "Social energy", value: energyLabels[(answers.energy ?? 3) - 1], index: 4 },
    { section: "Personality", label: "Conversation", value: answers.conversations.join(" · "), index: 5 },
    { section: "Love & connection", label: "Chemistry", value: answers.chemistry, index: 6 },
    ...personalityQuestions.map((q, i) => ({ section: q.section, label: q.title, value: (answers.traits?.[q.key] ?? []).join(" · ") || "Not answered yet", index: i + TRAIT_OFFSET })),
    { section: "Love & connection", label: "Photo", value: answers.photoUri ? "Added" : "Required", index: PHOTO_STEP },
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
    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}><Text style={{fontFamily:serif,fontSize: 18,color:color.ink}}>You</Text><Text style={{color:color.accent,fontFamily:serif,fontSize: 15}}>{Math.round(answered/total*100)}%</Text></View>
    <View style={{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",gap:12}}>
      {progress.map((item,i)=><Pressable key={item.section} accessibilityRole="button" accessibilityLabel={`${item.section}, ${item.answered} of ${item.total} answered. Edit section`} onPress={()=>open(item.section)} style={{width:i%3===2?"100%":"48%",minHeight:i%3===2?142:178,borderWidth:1,borderColor:color.line,borderRadius:24,padding:18,backgroundColor:color.surface,justifyContent:"space-between"}}>
        <View accessible={false} style={{height:i%3===2?45:78,alignItems:"center",justifyContent:"center"}}>
          <View style={{width:45+i*3,height:45,borderWidth:1,borderColor:color.accent,borderRadius:i%2?24:6,transform:[{rotate:`${i*15}deg`}]}}/>
          <View style={{position:"absolute",width:24,height:24,borderWidth:1,borderColor:color.ink,borderRadius:14,transform:[{translateX:12},{translateY:-5}]}}/>
        </View>
        <Text style={{fontFamily:serif,fontSize: 16,color:color.ink,marginTop:12}}>{item.section}</Text>
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
  const trait = editing === null || editing === PHOTO_STEP || editing < TRAIT_OFFSET ? undefined : personalityQuestions[editing - TRAIT_OFFSET];
  const editPhoto = async () => {
    if (picking) return;
    setPicking(true); setPhotoError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) setDraft({ ...draft, photoUri: result.assets[0].uri });
    } catch { setPhotoError("Couldn’t open photos. Please try again."); }
    finally { setPicking(false); }
  };
  return <>
    <View style={s.profileHero}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose your profile photo" disabled={picking} onPress={choosePhoto} style={s.profilePhoto}>
        {answers.photoUri ? <Image source={{ uri: answers.photoUri }} style={s.profileImage} /> : <Text style={s.photoPlaceholder}>＋</Text>}
      </Pressable>
      <Text style={s.homeTitle}>{answers.name.trim()}</Text>
      <Pressable accessibilityRole="button" onPress={choosePhoto} disabled={picking} style={s.textButton}><Text style={s.edit}>{picking ? "Opening photos…" : answers.photoUri ? "Change photo" : "Add your photo"}</Text></Pressable>
      {!!photoError && <Text style={s.helper}>{photoError}</Text>}
    </View>
    <ProfileSections answers={answers} open={setSectionOpen}/>

    <Modal
      visible={sectionOpen !== null}
      animationType="slide"
      onRequestClose={() => {
        if (editing !== null) setEditing(null);
        else setSectionOpen(null);
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView style={[s.safe, { backgroundColor: color.background }]} edges={["top", "bottom"]}>
          {editing === null ? (
            <>
              <ScreenHeader onBack={() => setSectionOpen(null)} />
              <ScrollView contentContainerStyle={s.homeScroll} keyboardShouldPersistTaps="handled">
                <Text style={[s.sectionTitle, { marginBottom: 8 }]}>{sectionOpen}</Text>
                {answerRows(answers).filter(row => row.section === sectionOpen).map(row => (
                  <Pressable
                    key={row.index}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${row.label}: ${row.value}`}
                    onPress={() => { setDraft(answers); setEditing(row.index); }}
                    style={s.summaryRow}
                  >
                    <View style={s.summaryCopy}>
                      <Text style={s.summaryLabel}>{row.label}</Text>
                      <Text style={s.summaryValue}>{row.value}</Text>
                    </View>
                    <Text style={s.edit}>Edit</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <ScreenHeader onBack={() => setEditing(null)} />
              <ScrollView contentContainerStyle={s.questionScroll} keyboardShouldPersistTaps="handled">
                <Text style={s.eyebrow}>EDIT YOUR INTRODUCTION</Text>
                <Text style={s.questionTitle}>{editing === PHOTO_STEP ? "Your photo" : trait?.title ?? questions[editing]?.title}</Text>
                <View style={s.answerArea}>
                  {editing === 0 && <TextInput accessibilityLabel="Phone number preview" value={draft.phone??""} onChangeText={phone=>setDraft({...draft,phone})} keyboardType="phone-pad" style={s.nameInput} maxLength={24}/>}
                  {editing === 1 && <TextInput accessibilityLabel="First name" value={draft.name} onChangeText={name => setDraft({ ...draft, name })} style={s.nameInput} maxLength={30} />}
                  {editing === 2 && cityOptions.map(city => <Choice key={city} label={city} role="radio" selected={draft.city === city} onPress={() => setDraft({ ...draft, city })} />)}
                  {editing === 4 && energyLabels.map((v, i) => <Choice key={v} label={v} role="radio" selected={draft.energy === i + 1} onPress={() => setDraft({ ...draft, energy: i + 1 })} />)}
                  {editing === 5 && <><Text style={s.helper}>The topics you could happily talk about for hours. Pick two or three.</Text>{conversations.map(v => <Choice key={v} label={v} selected={draft.conversations.includes(v)} onPress={() => setDraft({ ...draft, conversations: toggleChoice(draft.conversations, v, 3) })} />)}</>}
                  {editing === 6 && chemistryOptions.map(v => <Choice key={v} label={v} role="radio" selected={draft.chemistry === v} onPress={() => setDraft({ ...draft, chemistry: v })} />)}
                  {editing === PHOTO_STEP && <View style={s.photoStep}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Choose your photo" disabled={picking} onPress={editPhoto} style={[s.profilePhoto, draft.photoUri ? s.profilePhotoFilled : null]}>
                      {draft.photoUri ? <Image source={{ uri: draft.photoUri }} style={s.profileImage} /> : <Text style={s.photoPlaceholder}>＋</Text>}
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={editPhoto} disabled={picking} style={s.textButton}>
                      <Text style={s.edit}>{picking ? "Opening photos…" : draft.photoUri ? "Change photo" : "Choose a photo"}</Text>
                    </Pressable>
                  </View>}
                  {trait && <Text style={s.helper}>{questionHelper(trait)}</Text>}
                  {trait && <TraitChoices question={trait} values={draft.traits?.[trait.key] ?? []} onChange={values => setDraft({ ...draft, traits: { ...draft.traits, [trait.key]: values } })} />}
                </View>
              </ScrollView>
              <View style={s.questionBottom}>
                <Button label="Save changes" disabled={!isStepValid(editing, draft)} onPress={() => { patch(draft); setEditing(null); }} />
              </View>
            </>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
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
      <ScreenHeader onBack={back} />
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
          label="Continue to conditions"
          onPress={next}
          disabled={!isComplete(answers)}
        />
      </View>
    </>
  );
}
function Conditions({
  accepted,
  toggle,
  next,
  back,
  reduce,
  answers,
}: {
  accepted: Record<string, boolean>;
  toggle: (id: string) => void;
  next: () => void;
  back: () => void;
  reduce: boolean;
  answers: Answers;
}) {
  const [docId, setDocId] = useState<ConditionDocId | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const ready = allConditionsAccepted(accepted);
  const openDoc = docId ? conditionDocument(docId) : null;
  const createProfile = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await createProfileAndAnswers(answers);
      if (result.state === "acknowledged") {
        next();
        return;
      }
      if (result.state === "blocked") {
        if ("issues" in result && Array.isArray(result.issues) && result.issues.length) {
          const summary = result.issues
            .slice(0, 4)
            .map((issue: { questionId: string; code: string }) => `${issue.questionId}:${issue.code}`)
            .join(", ");
          setSaveError(`Could not map answers (${summary}).`);
        } else {
          const code = "code" in result ? result.code : "BLOCKED";
          setSaveError(`Could not prepare profile (${code}). Check answers and try again.`);
        }
      } else if (result.state === "incomplete") {
        setSaveError("Some answers did not save. Retry after the API is ready.");
      } else if (result.state === "conflict") {
        setSaveError(`Save conflict (${result.code}). Pull to refresh profile state, then try again.`);
      } else if (result.state === "unauthorized" || result.state === "rejected" || result.state === "unconfirmed") {
        setSaveError(`Save failed (${result.code}). Check local-dev API on 127.0.0.1:8080.`);
      } else {
        setSaveError("Save failed. Is local-dev API running on 127.0.0.1:8080?");
      }
    } catch {
      setSaveError("Cannot reach the API. Start local-dev backend, then retry.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <ScreenHeader onBack={back} />
      <ScrollView contentContainerStyle={s.reviewScroll} keyboardShouldPersistTaps="handled">
        <Reveal reduce={reduce}>
          <Text style={s.eyebrow}>BEFORE YOU CONTINUE</Text>
          <Text accessibilityRole="header" style={s.questionTitle}>
            Conditions.
          </Text>
          <Text style={s.helper}>
            Tick every box to create your profile. Open each document, read it, and accept only if you agree.
          </Text>
          <View style={{ marginTop: 22, gap: 10 }}>
            {conditionCheckboxes.map((item) => {
              const checked = !!accepted[item.id];
              return (
                <View key={item.id} style={s.conditionRow}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={item.label}
                    onPress={() => toggle(item.id)}
                    style={s.conditionCheckHit}
                  >
                    <View style={[s.conditionBox, checked && s.conditionBoxOn]}>
                      {checked ? <Text style={s.conditionTick}>✓</Text> : null}
                    </View>
                    <Text style={s.conditionLabel}>{item.label}</Text>
                  </Pressable>
                  {item.docId ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Read ${conditionDocument(item.docId).title}`}
                      onPress={() => setDocId(item.docId!)}
                      style={s.textButton}
                    >
                      <Text style={s.edit}>Read</Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open all conditions documents"
            onPress={() => setDocId("terms")}
            style={[s.textButton, { marginTop: 18 }]}
          >
            <Text style={s.edit}>View all conditions pages</Text>
          </Pressable>
          <Text style={s.inputNote}>
            Fill company, address, website, and email placeholders before launch. Have counsel review.
          </Text>
          {saveError ? <Text style={[s.helper, { color: color.accent, marginTop: 16 }]}>{saveError}</Text> : null}
        </Reveal>
      </ScrollView>
      <View style={s.questionBottom}>
        <Button
          label={saving ? "Creating profile…" : "Create my profile"}
          onPress={createProfile}
          disabled={!ready || saving}
        />
      </View>
      <Modal visible={openDoc !== null} animationType="slide" onRequestClose={() => setDocId(null)}>
        <SafeAreaProvider>
          <SafeAreaView style={[s.safe, { backgroundColor: color.background }]} edges={["top", "bottom"]}>
            <ScreenHeader onBack={() => setDocId(null)} />
            {openDoc ? (
              <ScrollView contentContainerStyle={s.reviewScroll}>
                <Text style={s.eyebrow}>CONDITIONS</Text>
                <Text style={s.questionTitle}>{openDoc.title}</Text>
                <Text style={s.helper}>Updated {openDoc.updated}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18, marginBottom: 8 }}>
                  {conditionDocuments.map((doc) => (
                    <Pressable
                      key={doc.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: doc.id === openDoc.id }}
                      onPress={() => setDocId(doc.id)}
                      style={[s.docChip, doc.id === openDoc.id && s.docChipOn]}
                    >
                      <Text style={[s.docChipText, doc.id === openDoc.id && { color: color.ink }]}>{doc.title}</Text>
                    </Pressable>
                  ))}
                </View>
                {openDoc.sections.map((section) => (
                  <View key={section.heading} style={{ marginTop: 22 }}>
                    <Text style={s.sectionTitle}>{section.heading}</Text>
                    <Text style={s.legalBody}>{section.body}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}
function Home({ answers, reduce }: { answers: Answers; reduce: boolean }) {
  const {
    dispatch, plans, planDispatch,
    openedInviteId, setOpenedInviteId,
    inviteEntrance, setInviteEntrance,
    inviteReveal, setInviteReveal,
    homeTab, setHomeTab,
  } = useContext(FlowContext)!;
  const pathname = usePathname();
  const router = useRouter();
  const tab = homeTab;
  const [panel, setPanel] = useState<HomeTab>(homeTab);
  const pageName = panel === "Events" ? "events" : panel === "Invites" ? "invites" : "profile";
  const matches = plans.filter(hasActiveInvite);
  const [itineraries, setItineraries] = useState<DinnerItinerary[]>([]);
  const [apiReady, setApiReady] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const plansRef = useRef(plans);
  plansRef.current = plans;
  const apiReadyRef = useRef(apiReady);
  apiReadyRef.current = apiReady;
  const tabOpacity = useRef(new Animated.Value(1)).current;
  const tabShift = useRef(new Animated.Value(0)).current;
  const homeTabRef = useRef(homeTab);
  homeTabRef.current = homeTab;
  const openedInvite = matches.find((plan) => plan.itineraryId === openedInviteId) ?? null;
  const enterInviteCinema = (payload: InviteEntranceState) => {
    setInviteReveal(false);
    setOpenedInviteId(payload.itineraryId);
    setInviteEntrance(payload);
    setHomeTab("Invites");
    setPanel("Invites");
  };
  useEffect(() => {
    // Honor deep links without letting /home remounts wipe the in-memory tab.
    if (pathname === "/invitations" || pathname === "/you") {
      const next = homeTabFromPath(pathname);
      setHomeTab(next);
      setPanel(next);
    }
  }, [pathname, setHomeTab]);
  const goTab = (next: HomeTab) => {
    const prev = homeTabRef.current;
    // Re-tap Invites while a detail is open → back to the cover list.
    if (next === "Invites" && prev === "Invites" && openedInviteId) {
      setOpenedInviteId(null);
      return;
    }
    if (next !== "Invites") {
      setOpenedInviteId(null);
      setInviteEntrance(null);
    }
    if (next === prev && panel === next) return;

    const from = panel;
    homeTabRef.current = next;
    setHomeTab(next);
    // Switch the panel immediately — never gate navigation on an animation callback.
    setPanel(next);

    if (reduce) {
      tabOpacity.setValue(1);
      tabShift.setValue(0);
      return;
    }

    const dir = homeTabOrder.indexOf(next) >= homeTabOrder.indexOf(from) ? 1 : -1;
    tabOpacity.stopAnimation();
    tabShift.stopAnimation();
    tabOpacity.setValue(0);
    tabShift.setValue(14 * dir);
    Animated.parallel([
      Animated.timing(tabOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tabShift, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };
  useEffect(() => {
    if (inviteEntrance) return;
    if (openedInviteId && !matches.some((plan) => plan.itineraryId === openedInviteId)) {
      setOpenedInviteId(null);
    }
  }, [matches, openedInviteId, inviteEntrance, setOpenedInviteId]);
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const [events, invitations] = await Promise.all([fetchDinnerEvents(), fetchInvitations()]);
        if (cancelled) return;
        const slots = events.map((event) => eventToItinerary({
          id: String(event.id),
          title: event.title,
          neighborhood: event.neighborhood,
          startsAt: event.startsAt,
          timeZone: event.timeZone,
        }));
        setItineraries(slots);
        setApiReady(true);
        const invitationIds = new Set(invitations.map((inv) => String(inv.eventId)));
        for (const plan of plansRef.current) {
          if (!invitationIds.has(plan.itineraryId) && hasActiveInvite(plan)) {
            planDispatch({ type: "remove", itineraryId: plan.itineraryId });
          }
        }
        for (const inv of invitations) {
          const id = String(inv.eventId);
          const slot = eventToItinerary({
            id,
            title: inv.title,
            neighborhood: inv.neighborhood,
            startsAt: inv.startsAt,
            timeZone: inv.timeZone,
          });
          planDispatch({
            type: "add",
            dateType: "Dinner",
            itineraryId: id,
            day: slot.day,
            date: slot.date,
            time: slot.time,
            area: slot.area,
          });
          const matched = inv.state === "MATCHED";
          planDispatch({
            type: "patch",
            itineraryId: id,
            patch: {
              waiting: true,
              demoMatched: matched,
              notify: true,
              confirmed: matched,
            },
          });
        }
      } catch {
        if (!cancelled) setApiReady(false);
      }
    };
    void sync();
    const poll = setInterval(() => {
      void sync();
      if (apiReadyRef.current) void triggerMatcher().catch(() => undefined);
    }, 20000);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [planDispatch]);
  const cancelInterest = (id: string) => {
    const plan = plans.find((p) => p.itineraryId === id);
    if (plan?.demoMatched || plan?.confirmed) {
      Alert.alert("Already matched", "This dinner is confirmed. Cancel from support once that flow exists.");
      return;
    }
    setOpenedInviteId(null);
    setInviteEntrance(null);
    void leaveEvent(id)
      .catch(() => undefined)
      .finally(() => planDispatch({ type: "remove", itineraryId: id }));
  };
  const inviteDetailOpen = panel === "Invites" && !!openedInvite;
  const showInviteChrome = !inviteDetailOpen && !inviteEntrance;
  const showTabBar = !inviteEntrance && !inviteDetailOpen;
  return <View style={[s.safe, { position: "relative", overflow: "hidden" }]}>
    <Animated.View
      pointerEvents="box-none"
      style={{
        flex: 1,
        opacity: tabOpacity,
        transform: [{ translateX: tabShift }],
      }}
    >
      {showInviteChrome ? (
        <View style={s.homeTop}>
          <Text style={s.pageName}>{pageName}</Text>
          <Brand />
        </View>
      ) : null}
      {panel === "Events" ? (
        <DateHome
          plans={plans}
          dispatch={planDispatch}
          reduce={reduce}
          itineraries={apiReady ? itineraries : undefined}
          useApi={apiReady}
          onJoined={enterInviteCinema}
        />
      ) : null}
      {panel === "Invites" ? (
        matches.length === 0 ? (
          <View style={dateStyles.inviteBody}><InvitationArt/><InvitationMessages reduce={reduce}/></View>
        ) : openedInvite ? (
          <ActiveInvite
            plan={openedInvite}
            name={answers.name}
            photoUri={answers.photoUri}
            open
            reveal={inviteReveal}
            reduce={reduce}
            onOpenChange={(open) => { if (!open) setOpenedInviteId(null); }}
            onCancel={() => cancelInterest(openedInvite.itineraryId)}
          />
        ) : (
          <InviteCoverPager
            plans={matches}
            name={answers.name}
            photoUri={answers.photoUri}
            reduce={reduce}
            onOpen={(itineraryId) => {
              setInviteReveal(true);
              setOpenedInviteId(itineraryId);
            }}
            onCancel={(itineraryId) => cancelInterest(itineraryId)}
          />
        )
      ) : null}
      {panel === "You" ? <ScrollView contentContainerStyle={s.homeScroll}>
        <ProfileEditor answers={answers} patch={patch=>dispatch({type:"answer",patch})}/>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          onPress={() => setConfirmDelete(true)}
          style={[s.resetButton, { marginTop: 28, marginBottom: 40 }]}
        >
          <Text style={{ color: color.ink, fontFamily: serif, fontSize: 16 }}>Delete account</Text>
        </Pressable>
      </ScrollView> : null}
    </Animated.View>
    <Modal
      visible={confirmDelete}
      transparent
      animationType="fade"
      onRequestClose={() => setConfirmDelete(false)}
    >
      <View style={s.brandConfirmScrim}>
        <View style={s.brandConfirmCard} accessibilityViewIsModal>
          <Text style={s.brandConfirmTitle}>Delete account?</Text>
          <Text style={s.brandConfirmBody}>
            This clears your answers, photo, and preview dates from this session.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Keep my account"
            onPress={() => setConfirmDelete(false)}
            style={s.brandConfirmPrimary}
          >
            <Text style={s.brandConfirmPrimaryText}>Keep my account</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            onPress={() => {
              setConfirmDelete(false);
              clearSession();
              setOpenedInviteId(null);
              setInviteEntrance(null);
              dispatch({ type: "reset" });
              planDispatch({ type: "reset" });
              router.replace("/");
            }}
            style={s.brandConfirmSecondary}
          >
            <Text style={s.brandConfirmSecondaryText}>Delete account</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    {showTabBar ? (
      <View accessibilityRole="tablist" style={s.tabBar} pointerEvents="auto">
        {(["Events","Invites","You"] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityLabel={item}
            accessibilityState={{ selected: tab === item }}
            aria-selected={tab === item}
            hitSlop={8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => undefined);
              goTab(item);
            }}
            style={s.tab}
          >
            <NavIcon name={item} active={tab === item} reduce={reduce} />
          </Pressable>
        ))}
      </View>
    ) : null}
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
    if (unlocked && !homePath) router.replace("/home");
  }, [unlocked, pathname, homePath, router]);
  const reduce = useGentleMotion();
  const { width } = useWindowDimensions();
  const lastPress = useRef(0);
  const [signingIn, setSigningIn] = useState(false);
  const next = () => {
    const now = Date.now();
    if (now - lastPress.current < 400 || signingIn) return;
    lastPress.current = now;
    Keyboard.dismiss();
    // Phone-first login: known numbers skip name/city; code step opens home.
    if (flow.stage === "questions" && (flow.question === 0 || flow.question === 3)) {
      const phone = flow.answers.phone;
      setSigningIn(true);
      void tryReturningLogin(phone)
        .then((known) => {
          if (known && flow.question === 0) {
            dispatch({ type: "phoneKnown", name: known.name, phone });
            return;
          }
          if (known && flow.question === 3) {
            dispatch({ type: "returningHome", name: known.name, phone });
            return;
          }
          dispatch({ type: "next" });
        })
        .catch(() => dispatch({ type: "next" }))
        .finally(() => setSigningIn(false));
      return;
    }
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
            {flow.stage === "conditions" && (
              <Conditions
                accepted={flow.conditionsAccepted}
                toggle={(id) => dispatch({ type: "toggleCondition", id })}
                next={next}
                back={back}
                reduce={reduce}
                answers={flow.answers}
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
  photoStep: { alignItems: "center", paddingTop: 28, paddingBottom: 8, gap: 4 },
  profilePhoto: { width: 168, height: 168, borderRadius: 84, backgroundColor: "#49303e", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: color.line, marginBottom: 14 },
  profilePhotoFilled: { borderColor: color.accent },
  profileImage: { width: "100%", height: "100%" },
  photoPlaceholder: { color: color.accent, fontSize: 36, lineHeight: 40 },
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
  brandColon: { color: color.accent, fontFamily: serif },
  brandSpark: {
    color: color.accent,
    fontSize: 15,
    marginLeft: 3,
    marginTop: -2,
  },
  preview: { color: color.muted, fontFamily: sans, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase" },
  textButton: { minHeight: 44, paddingHorizontal: 4, justifyContent: "center" },
  mutedButton: { color: color.muted, fontFamily: serif, fontSize: 13 },
  introScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 38,
  },
  introContent: { paddingBottom: 13 },
  eyebrow: {
    color: color.accent,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
    lineHeight: 16,
    marginBottom: 29,
    textTransform: "uppercase",
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
    fontFamily: serif,
    fontSize: 16,
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
    color: color.muted,
    fontFamily: serif,
    fontSize: 13,
    lineHeight: 18,
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
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
    minHeight: 52,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: color.surface,
  },
  conditionCheckHit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minHeight: 44,
  },
  conditionBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  conditionBoxOn: { backgroundColor: color.accent },
  conditionTick: { color: color.ink, fontSize: 13, lineHeight: 16, fontWeight: "700" },
  conditionLabel: { flex: 1, color: color.ink, fontFamily: serif, fontSize: 14, lineHeight: 20 },
  docChip: {
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  docChipOn: { borderColor: color.accent, backgroundColor: color.surfaceRaised },
  docChipText: { color: color.muted, fontFamily: serif, fontSize: 13 },
  legalBody: { color: color.muted, fontFamily: serif, fontSize: 14, lineHeight: 22 },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backArrow: { color: color.ink, fontSize: 17 },
  stepCount: {
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.2,
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
  helper: { color: color.muted, fontFamily: serif, fontSize: 15, lineHeight: 22, marginTop: 17 },
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
  inputNote: { color: color.muted, fontFamily: serif, fontSize: 12, lineHeight: 18, marginTop: 12 },
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
    borderWidth: 1.5,
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
    fontFamily: serif,
    fontSize: 13,
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
  scaleText: { color: color.muted, fontFamily: serif, fontSize: 13, lineHeight: 18 },
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
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: "#735363",
    borderRadius: 30,
    minHeight: 52,
    justifyContent: "center",
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
    color: color.muted,
    fontFamily: serif,
    fontSize: 13,
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
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: color.muted,
    marginBottom: 9,
    lineHeight: 16,
  },
  summaryValue: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 23,
    color: color.ink,
  },
  edit: { color: color.accent, fontFamily: serif, fontSize: 13, paddingVertical: 12 },
  homeTop: {
    paddingHorizontal: 29,
    paddingTop: Platform.OS === "web" ? 30 : 12,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageName: {
    fontFamily: serif,
    fontSize: 16,
    color: color.ink,
    letterSpacing: 0.2,
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
    fontFamily: serif,
    fontSize: 15,
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
    color: color.accent,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    flexShrink: 1,
    lineHeight: 16,
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
  momentLink: { color: color.accent, fontFamily: serif, fontSize: 13 },
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
    fontFamily: serif,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 20,
    color: color.muted,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#573a48",
    paddingTop: 7,
    paddingBottom: Platform.OS === "web" ? 15 : 3,
    backgroundColor: color.background,
    zIndex: 20,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 7,
    minHeight: 61,
  },
  tabSymbol: { fontSize: 15, lineHeight: 22, color: "#9e8493" },
  tabLabel: { fontFamily: sans, fontSize: 11, color: color.muted },
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
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 280,
  },
  savedRow: { marginTop: 30 },
  savedTitle: {
    color: color.accent,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
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
  brandConfirmScrim: {
    flex: 1,
    backgroundColor: "rgba(17, 10, 15, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  brandConfirmCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  brandConfirmTitle: {
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 34,
    color: color.ink,
    textAlign: "center",
  },
  brandConfirmBody: {
    marginTop: 12,
    marginBottom: 26,
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    color: color.muted,
    textAlign: "center",
  },
  brandConfirmPrimary: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  brandConfirmPrimaryText: {
    color: color.background,
    fontFamily: serif,
    fontSize: 18,
    fontStyle: "italic",
  },
  brandConfirmSecondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  brandConfirmSecondaryText: {
    color: color.accent,
    fontFamily: serif,
    fontSize: 16,
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
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
    lineHeight: 16,
    textTransform: "uppercase",
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
