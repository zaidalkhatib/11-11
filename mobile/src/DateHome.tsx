import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, PanResponder, Easing, Image, Alert, Vibration, Modal, Platform, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import * as Haptics from "expo-haptics";
import { color, sans, serif } from "./theme";
import { DatePlan, PlanAction, availableDinnerItineraries, DinnerItinerary, dinnerItineraries, formatClock, formatEventWhen, sentenceWords } from "./date-plans";
import { joinEvent } from "./api";

export function NavIcon({
  name,
  active = false,
  reduce = false,
}: {
  name: "You" | "Events" | "Invites";
  active?: boolean;
  reduce?: boolean;
}) {
  const ink = active ? color.ink : color.muted;
  const scale = useRef(new Animated.Value(active ? 1 : 0.92)).current;
  useEffect(() => {
    if (reduce) {
      scale.setValue(active ? 1 : 0.92);
      return;
    }
    Animated.spring(scale, {
      toValue: active ? 1 : 0.92,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [active, reduce, scale]);
  return (
    <Animated.View
      accessible={false}
      style={{
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        opacity: active ? 1 : 0.55,
        transform: [{ scale }],
      }}
    >
      {name === "Events" ? (
        <>
          <View style={{ position: "absolute", width: 25, height: 1.5, backgroundColor: ink }} />
          <View style={{ width: 1.5, height: 25, backgroundColor: ink }} />
        </>
      ) : name === "You" ? (
        <>
          <View style={{ width: 10, height: 10, borderWidth: 1.5, borderColor: ink, borderRadius: 8, marginBottom: 3 }} />
          <View style={{ width: 24, height: 12, borderWidth: 1.5, borderBottomWidth: 0, borderColor: ink, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
        </>
      ) : (
        <View style={{ width: 27, height: 19, borderWidth: 1.5, borderColor: ink, borderRadius: 4, justifyContent: "center", alignItems: "center" }}>
          <View style={{ height: 12, borderLeftWidth: 1, borderColor: ink, borderStyle: "dashed" }} />
        </View>
      )}
    </Animated.View>
  );
}
export function InvitationArt() {
  return <View accessible accessibilityLabel="No invitations yet. An 11:11 spark waiting to connect." style={d.inviteArt}>
    <View style={d.sparkOrbit}/>
    <View style={d.sparkOrbitInner}/>
    <View style={d.elevenMark}>{[0,1,2,3].map(i=><View key={i} style={[d.elevenBeam,{marginLeft:i===2?24:7,height:i%2===0?54:68}]}/>)}</View>
    <View style={[d.sparkDot,{top:54}]}/><View style={[d.sparkDot,{top:72}]}/>
    <View style={d.sparkDiamond}/>
  </View>;
}
function MapBackdrop() {
  return (
    <View pointerEvents="none" style={d.map}>
      <View style={[d.mapArc, { top: "18%", left: "-10%", width: "70%", height: 220 }]} />
      <View style={[d.mapArc, { top: "28%", right: "-18%", width: "80%", height: 260, borderRadius: 180 }]} />
      <View style={[d.mapLine, { top: "42%", left: "8%", width: "55%", transform: [{ rotate: "-18deg" }] }]} />
      <View style={[d.mapLine, { top: "55%", left: "22%", width: "48%", transform: [{ rotate: "12deg" }] }]} />
      <View style={[d.mapLine, { top: "63%", left: "12%", width: "62%", transform: [{ rotate: "-6deg" }] }]} />
      <View style={[d.mapDot, { top: "36%", left: "48%" }]} />
      <View style={[d.mapDot, { top: "58%", left: "33%" }]} />
      <View style={[d.mapDot, { top: "48%", left: "68%" }]} />
    </View>
  );
}

function SlideToJoin({
  onComplete,
  reduce,
}: {
  onComplete: () => void;
  reduce: boolean;
}) {
  const [width, setWidth] = useState(280);
  const [finishing, setFinishing] = useState(false);
  const finishingRef = useRef(false);
  const x = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const limit = Math.max(0, width - 64);
  const limitRef = useRef(limit);
  const onCompleteRef = useRef(onComplete);
  const reduceRef = useRef(reduce);
  limitRef.current = limit;
  onCompleteRef.current = onComplete;
  reduceRef.current = reduce;

  const finish = (from: number) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    const end = limitRef.current;
    const settle = () => {
      if (!reduceRef.current) {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.08, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
            Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 160, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 420, useNativeDriver: true }),
          ]),
        ]).start();
      }
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      Vibration.vibrate(36);
      onCompleteRef.current();
    };
    if (reduceRef.current) {
      x.setValue(end);
      settle();
      return;
    }
    Animated.timing(x, {
      toValue: end,
      duration: Math.max(90, 220 * (1 - from / Math.max(end, 1))),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) settle();
      else {
        finishingRef.current = false;
        setFinishing(false);
      }
    });
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !finishingRef.current,
      onMoveShouldSetPanResponder: (_, g) => !finishingRef.current && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        void Haptics.selectionAsync().catch(() => undefined);
      },
      onPanResponderMove: (_, g) => {
        if (finishingRef.current) return;
        const end = limitRef.current;
        x.setValue(Math.max(0, Math.min(end, g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        if (finishingRef.current) return;
        const end = limitRef.current;
        const current = Math.max(0, Math.min(end, g.dx));
        if (current >= end * 0.8 && end > 0) finish(current);
        else Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 7 }).start();
      },
      onPanResponderTerminate: () => {
        if (!finishingRef.current) Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 7 }).start();
      },
    }),
  ).current;

  const fillScale = x.interpolate({
    inputRange: [0, Math.max(limit, 1)],
    outputRange: [0.16, 1],
    extrapolate: "clamp",
  });
  const fillShift = x.interpolate({
    inputRange: [0, Math.max(limit, 1)],
    outputRange: [-(Math.max(width - 8, 1) * 0.42), 0],
    extrapolate: "clamp",
  });

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel="Slide to join dinner waitlist"
      accessibilityActions={[{ name: "activate", label: "Join dinner waitlist" }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "activate") finish(0);
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={d.slideTrack}
    >
      <Animated.View
        style={[
          d.slideFill,
          {
            width: Math.max(width - 8, 58),
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.8] }),
            transform: [{ translateX: fillShift }, { scaleX: fillScale }],
          },
        ]}
      />
      <Text style={[d.serif, { fontSize: 15, textAlign: "center", paddingLeft: 40 }]}>
        {finishing ? "You’re in" : "Slide to join"}
      </Text>
      <Animated.View
        {...responder.panHandlers}
        style={[
          d.slideThumb,
          {
            transform: [{ translateX: x }, { scale }],
          },
        ]}
      >
        <Text style={d.chevron}>{finishing ? "✓" : "›"}</Text>
      </Animated.View>
    </View>
  );
}

export function DateHome({
  plans,
  dispatch,
  reduce,
  itineraries = dinnerItineraries,
  useApi = false,
  onJoined,
}: {
  plans: DatePlan[];
  dispatch: React.Dispatch<PlanAction>;
  reduce: boolean;
  itineraries?: readonly DinnerItinerary[];
  /** When true, slide-to-join records server interest (never demoMatched). */
  useApi?: boolean;
  /** After a successful join — typed entrance, then invite details. */
  onJoined?: (payload: { itineraryId: string; title: string; meta: string }) => void;
}) {
  const [stage, setStage] = useState<"home" | "itineraries" | "join">("home");
  const [selected, setSelected] = useState<DinnerItinerary | null>(null);
  const openSlots = availableDinnerItineraries(plans, itineraries);

  const openJoin = (slot: DinnerItinerary) => {
    setSelected(slot);
    dispatch({
      type: "add",
      dateType: "Dinner",
      itineraryId: slot.id,
      day: slot.day,
      date: slot.date,
      time: slot.time,
      area: slot.area,
    });
    setStage("join");
  };

  const finishJoin = (id: string, matched: boolean) => {
    const slot = selected ?? itineraries.find((item) => item.id === id) ?? null;
    const title = slot?.area ? `Dinner in\n${sentenceWords(slot.area)}` : slot?.title ?? "Dinner";
    const meta = slot ? formatEventWhen(slot) : "";
    dispatch({
      type: "patch",
      itineraryId: id,
      patch: {
        waiting: true,
        demoMatched: matched,
        notify: true,
      },
    });
    setStage("home");
    setSelected(null);
    onJoined?.({ itineraryId: id, title, meta });
  };

  return (
    <View style={d.page}>
      <MapBackdrop />
      <View style={d.pageInner}>
        {stage === "home" && (
          <View style={d.floatCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Meet someone new over dinner"
              onPress={() => setStage("itineraries")}
              style={d.menuRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={d.menuTitle}>Meet someone new</Text>
                <Text style={d.menuCaption}>Dinner</Text>
              </View>
              <Text style={d.chevron}>›</Text>
            </Pressable>
          </View>
        )}

        {stage === "itineraries" && (
          <View style={d.floatCard}>
            <View style={d.itineraryHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={() => setStage("home")}
                style={d.headerBtn}
              >
                <Text style={d.chevron}>‹</Text>
              </Pressable>
              <Text style={d.itineraryHeading}>Choose a night</Text>
              <View style={d.headerBtn} />
            </View>
            {openSlots.length === 0 ? (
              <Text style={d.emptyNights}>No nights left.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {openSlots.map((slot) => (
                  <Pressable
                    key={slot.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${slot.title}, ${formatEventWhen(slot)}`}
                    onPress={() => openJoin(slot)}
                    style={d.itineraryRow}
                  >
                    <View style={d.itineraryCopy}>
                      <Text style={d.itineraryMeta}>
                        {formatEventWhen(slot)}
                      </Text>
                      <Text
                        style={d.itineraryTitle}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.82}
                      >
                        {slot.title}
                      </Text>
                    </View>
                    <Text style={d.chevron}>›</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {stage === "join" && selected && (
          <View style={d.floatCard}>
            <View style={d.itineraryHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to itineraries"
                onPress={() => {
                  dispatch({ type: "remove", itineraryId: selected.id });
                  setSelected(null);
                  setStage("itineraries");
                }}
                style={d.headerBtn}
              >
                <Text style={d.chevron}>‹</Text>
              </Pressable>
              <Text style={d.itineraryHeading}>Join this dinner</Text>
              <View style={d.headerBtn} />
            </View>
            <Text style={d.itineraryMeta}>
              {formatEventWhen(selected)}
            </Text>
            <Text style={[d.itineraryTitle, { marginBottom: 18 }]}>{selected.title}</Text>
            <SlideToJoin
              key={selected.id}
              reduce={reduce}
              onComplete={() => {
                const id = selected.id;
                // D-028: no client-side match fallback — join only via API; match comes from server.
                if (!useApi) {
                  Alert.alert(
                    "Not connected",
                    "Dinner join needs a live connection. Check your network and try again.",
                  );
                  return;
                }
                void joinEvent(id)
                  .then(() => finishJoin(id, false))
                  .catch(() => {
                    dispatch({ type: "remove", itineraryId: id });
                    setStage("itineraries");
                    setSelected(null);
                    Alert.alert("Couldn’t join", "Interest was not recorded. Check that the API is running, then try again.");
                  });
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
export function ActiveInvite({
  plan,
  name,
  photoUri,
  open,
  onOpenChange,
  onCancel,
  reveal = true,
  reduce = false,
}: {
  plan: DatePlan;
  name: string;
  photoUri?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  /** When false, stay hidden so the cinema overlay can crossfade in. */
  reveal?: boolean;
  reduce?: boolean;
}) {
  const title = sentenceWords(plan.type);
  const dinnerTitle = plan.area ? `Dinner in ${sentenceWords(plan.area)}` : "Dinner";
  const when = formatEventWhen(plan);
  const youLabel = name.trim() || "You";
  const matched = !!(plan.demoMatched || plan.confirmed);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const opacity = useRef(new Animated.Value(reveal && open ? 1 : 0)).current;
  const shift = useRef(new Animated.Value(reveal && open ? 0 : 18)).current;
  const wasMatched = useRef(matched);

  useEffect(() => {
    if (matched && !wasMatched.current) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    wasMatched.current = matched;
  }, [matched]);

  useEffect(() => {
    if (!open) return;
    if (!reveal) {
      opacity.setValue(0);
      shift.setValue(18);
      return;
    }
    if (reduce) {
      opacity.setValue(1);
      shift.setValue(0);
      return;
    }
    opacity.setValue(0);
    shift.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shift, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, reveal, reduce, opacity, shift, plan.itineraryId]);

  if (!open) {
    return (
      <View style={inv.coverWrapList}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${plan.type} invitation`}
          onPress={() => onOpenChange(true)}
          style={inv.coverCard}
        >
          <View style={inv.coverCenter}>
            <Text style={inv.coverTitle}>{title === "Dinner" ? dinnerTitle.replace(" in ", " in\n") : title}</Text>
            <Text style={inv.coverMeta}>{when}</Text>
            <View style={inv.coverPill}>
              <Text style={inv.curatorText}>
                arranged by <Text style={inv.curatorEm}>11:11</Text>
                <Text style={inv.curatorSpark}> ✧</Text>
              </Text>
              <Text style={inv.coverChevron}>›</Text>
            </View>
          </View>
          <View style={inv.coverFooter}>
            {matched ? (
              <View style={inv.coverMatchCluster} accessible={false}>
                <View style={[inv.coverMatchFace, inv.coverMatchFaceAccent, { zIndex: 2 }]} />
                <View style={[inv.coverMatchFace, inv.coverMatchFaceAccent, inv.coverMatchOverlap]} />
              </View>
            ) : (
              <View style={inv.coverMatchCluster} accessible={false}>
                <View style={[inv.coverMatchFace, { zIndex: 2 }]} />
                <View style={[inv.coverMatchFace, inv.coverMatchOverlap]} />
              </View>
            )}
            <Text style={[inv.coverFooterText, matched && inv.coverFooterTextMatched]}>
              {matched ? "matched with your date" : "waiting to be matched"}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        inv.root,
        {
          opacity,
          transform: [{ translateY: shift }],
        },
      ]}
    >
      <ScrollView
        style={inv.scrollView}
        contentContainerStyle={inv.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={inv.hero}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to invitation card"
            onPress={() => onOpenChange(false)}
            style={inv.curator}
          >
            <Text style={inv.curatorText}>
              arranged by <Text style={inv.curatorEm}>11:11</Text>
              <Text style={inv.curatorSpark}> ✧</Text>
            </Text>
            <Text style={inv.coverChevron}>‹</Text>
          </Pressable>
        </View>

        <Text style={inv.sectionTitle}>The night</Text>
        <View style={inv.timeline}>
          <View style={inv.timelineRail} />
          <View style={inv.dateRow}>
            <View style={inv.dateDot} />
            <Text style={inv.dateLabel}>
              {[plan.day, plan.date].filter(Boolean).join(" · ").toUpperCase() || "DATE TBD"}
            </Text>
          </View>

          <View style={inv.stopCard}>
            <Text style={inv.stopTime}>{plan.time ? formatClock(plan.time) : "Evening"}</Text>
            <Text style={inv.stopTitle}>{dinnerTitle}</Text>

            <View style={inv.peopleBox}>
              <View style={inv.personRow}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={inv.avatar} />
                ) : (
                  <View style={[inv.avatar, inv.avatarFallback]}>
                    <Text style={inv.avatarInitial}>{youLabel.slice(0, 1).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={inv.personName}>{youLabel}</Text>
                <View style={inv.statusPill}>
                  <Text style={inv.statusText}>In</Text>
                  <Text style={inv.statusIcon}>✓</Text>
                </View>
              </View>
              <View style={inv.personDivider} />
              <View style={inv.personRow}>
                <View style={inv.matchCluster}>
                  <View style={[inv.avatar, inv.avatarBlur, { zIndex: 2 }]} />
                  <View style={[inv.avatar, inv.avatarBlur, inv.avatarOverlap]} />
                </View>
                <Text style={inv.personName}>Your match</Text>
                {matched ? (
                  <Text style={inv.matchConfirmedText}>matched</Text>
                ) : (
                  <Text style={inv.matchHint}>finding</Text>
                )}
              </View>
            </View>
          </View>

          <View style={inv.dateRow}>
            <View style={inv.dateDot} />
            <Text style={inv.dateLabel}>NEXT</Text>
          </View>

          <View style={inv.noteCard}>
            <Text style={inv.noteTime}>Your match</Text>
            <Text style={inv.noteCopy}>A name, when it’s time</Text>
          </View>

          <View style={inv.noteCard}>
            <Text style={inv.noteTime}>The place</Text>
            <Text style={inv.noteCopy}>A little somewhere, soon</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed floating leave control — stays put while the plan scrolls underneath. */}
      <View style={inv.actions} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel dinner invitation"
          onPress={() => setConfirmLeave(true)}
          style={inv.actionX}
          hitSlop={6}
        >
          <Text style={inv.actionXText}>×</Text>
        </Pressable>
      </View>

      <Modal
        visible={confirmLeave}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmLeave(false)}
      >
        <View style={inv.confirmScrim}>
          <View style={inv.confirmCard} accessibilityViewIsModal>
            <Text style={inv.confirmTitle}>Leave this night?</Text>
            <Text style={inv.confirmBody}>
              Your seat will open up again for someone else.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Keep my seat"
              onPress={() => setConfirmLeave(false)}
              style={inv.confirmPrimary}
            >
              <Text style={inv.confirmPrimaryText}>Keep my seat</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Leave this dinner"
              onPress={() => {
                setConfirmLeave(false);
                onCancel();
              }}
              style={inv.confirmSecondary}
            >
              <Text style={inv.confirmSecondaryText}>Leave</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

export function InviteCoverPager({
  plans,
  name,
  photoUri,
  onOpen,
  onCancel,
  reduce = false,
}: {
  plans: DatePlan[];
  name: string;
  photoUri?: string;
  onOpen: (itineraryId: string) => void;
  onCancel: (itineraryId: string) => void;
  reduce?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index > plans.length - 1) setIndex(Math.max(0, plans.length - 1));
  }, [plans.length, index]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(plans.length - 1, next)));
  };

  return (
    <View
      style={inv.pager}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={inv.pagerScroll}
        >
          {plans.map((plan) => (
            <View key={plan.itineraryId} style={[inv.pagerPage, { width }]}>
              <ActiveInvite
                plan={plan}
                name={name}
                photoUri={photoUri}
                open={false}
                reduce={reduce}
                onOpenChange={(open) => {
                  if (open) onOpen(plan.itineraryId);
                }}
                onCancel={() => onCancel(plan.itineraryId)}
              />
            </View>
          ))}
        </ScrollView>
      ) : null}
      {plans.length > 1 ? (
        <View style={inv.pagerDots} accessibilityRole="adjustable" accessibilityLabel={`Invite ${index + 1} of ${plans.length}`}>
          {plans.map((plan, i) => (
            <View
              key={plan.itineraryId}
              style={[inv.pagerDot, i === index && inv.pagerDotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export const dateStyles = StyleSheet.create({
  inviteBody: { flex: 1, alignItems: "center", justifyContent: "center" },
});

const inv = StyleSheet.create({
  root: { flex: 1 },
  pager: { flex: 1, justifyContent: "center" },
  pagerScroll: { flexGrow: 0 },
  pagerPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  pagerDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 18,
    paddingBottom: 8,
  },
  pagerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.line,
  },
  pagerDotActive: {
    backgroundColor: color.accent,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coverWrapList: {
    alignItems: "center",
    width: "100%",
  },
  coverCard: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 3 / 4.05,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 28,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  coverCenter: { alignItems: "center", paddingTop: 36 },
  coverTitle: {
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
    color: color.ink,
    textAlign: "center",
  },
  coverMeta: {
    marginTop: 16,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
    lineHeight: 16,
    color: color.muted,
    textAlign: "center",
    textTransform: "uppercase",
  },
  coverPill: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: color.background,
  },
  coverChevron: { color: color.muted, fontSize: 18, marginLeft: 2 },
  coverFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "stretch",
    paddingVertical: 4,
  },
  coverFooterText: {
    color: color.muted,
    fontFamily: serif,
    fontStyle: "italic",
    fontSize: 14,
    letterSpacing: -0.2,
  },
  coverFooterTextMatched: {
    color: color.accent,
  },
  coverMatchCluster: { flexDirection: "row", width: 34, marginRight: 2 },
  coverMatchFace: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#5a4450",
    borderWidth: 1,
    borderColor: color.line,
  },
  coverMatchFaceAccent: {
    backgroundColor: "#8a6a58",
    borderColor: color.accent,
  },
  coverMatchOverlap: { marginLeft: -8, opacity: 0.55 },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 110 },
  hero: { alignItems: "center", marginBottom: 34 },
  heroTitle: {
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: color.ink,
    textAlign: "center",
  },
  heroMeta: {
    marginTop: 10,
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 20,
    color: color.muted,
    textAlign: "center",
  },
  curator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: color.background,
  },
  curatorText: {
    color: color.muted,
    fontFamily: serif,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  curatorEm: { color: color.ink, fontFamily: serif, fontStyle: "italic" },
  curatorSpark: { color: color.accent, fontFamily: serif, fontSize: 11 },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 28,
    color: color.ink,
    marginBottom: 18,
  },
  timeline: { paddingLeft: 4, position: "relative" },
  timelineRail: {
    position: "absolute",
    left: 7,
    top: 10,
    bottom: 24,
    width: 1,
    backgroundColor: color.line,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  dateDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: color.ink, marginLeft: 2 },
  dateLabel: {
    color: color.muted,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  stopCard: {
    marginLeft: 22,
    marginBottom: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    padding: 20,
  },
  stopTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stopTime: { color: color.muted, fontFamily: serif, fontSize: 14 },
  navOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  navOrbGlyph: { color: color.accent, fontSize: 14 },
  stopTitle: {
    marginTop: 14,
    fontFamily: serif,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: color.ink,
  },
  stopSub: { marginTop: 6, color: color.muted, fontFamily: serif, fontSize: 14 },
  peopleBox: {
    marginTop: 22,
    borderRadius: 22,
    backgroundColor: color.background,
    borderWidth: 1,
    borderColor: color.line,
    padding: 14,
    gap: 12,
  },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 },
  personDivider: { height: 1, backgroundColor: color.line, opacity: 0.7 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.surfaceRaised },
  avatarFallback: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: color.line },
  avatarInitial: { color: color.accent, fontFamily: serif, fontSize: 15 },
  avatarBlur: { backgroundColor: "#5a4450", opacity: 0.85 },
  avatarOverlap: { marginLeft: -14, opacity: 0.55 },
  matchCluster: { flexDirection: "row", width: 50 },
  personName: { flex: 1, color: color.ink, fontFamily: serif, fontSize: 16, },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { color: color.muted, fontFamily: serif, fontSize: 14, },
  statusIcon: { color: color.accent, fontSize: 12 },
  matchHint: { color: color.muted, fontFamily: serif, fontStyle: "italic", fontSize: 14 },
  matchConfirmedText: {
    color: color.accent,
    fontFamily: serif,
    fontStyle: "italic",
    fontSize: 14,
    letterSpacing: -0.2,
  },
  noteCard: {
    marginLeft: 22,
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  noteTime: {
    color: color.muted,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  noteCopy: {
    flex: 1,
    color: color.ink,
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "right",
    fontStyle: "italic",
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    // Sit where the home tab bar usually lives now that it's hidden on this screen.
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 18 : 12,
    minHeight: 72,
    zIndex: 5,
  },
  actionX: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  actionXText: { color: color.ink, fontSize: 28, lineHeight: 30, marginTop: -2 },
  confirmScrim: {
    flex: 1,
    backgroundColor: "rgba(17, 10, 15, 0.72)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  confirmCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  confirmTitle: {
    fontFamily: serif,
    fontSize: 28,
    lineHeight: 34,
    color: color.ink,
    textAlign: "center",
  },
  confirmBody: {
    marginTop: 12,
    marginBottom: 26,
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 22,
    color: color.muted,
    textAlign: "center",
  },
  confirmPrimary: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  confirmPrimaryText: {
    color: color.background,
    fontFamily: serif,
    fontSize: 18,
    fontStyle: "italic",
  },
  confirmSecondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmSecondaryText: {
    color: color.accent,
    fontFamily: serif,
    fontSize: 16,
  },
  actionYes: {
    flex: 1,
    height: 56,
    borderRadius: 999,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  actionYesDone: { opacity: 0.72 },
  actionYesText: {
    color: color.background,
    fontFamily: serif,
    fontStyle: "italic",
    fontSize: 20,
    letterSpacing: 0.4,
  },
});
const d = StyleSheet.create({
  page: { flex: 1, overflow: "hidden" },
  pageInner: { flex: 1, justifyContent: "center", paddingHorizontal: 18, zIndex: 2 },
  map: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0.55 },
  mapArc: {
    position: "absolute",
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 140,
    opacity: 0.55,
  },
  mapLine: {
    position: "absolute",
    height: 1,
    backgroundColor: color.line,
    opacity: 0.45,
  },
  mapDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.accent,
    opacity: 0.5,
  },
  floatCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: "rgba(48,33,45,0.92)",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 2,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuTitle: { color: color.ink, fontFamily: serif, fontSize: 18, },
  menuCaption: { color: color.muted, fontFamily: serif, fontStyle: "italic", fontSize: 14, marginTop: 4, },
  emptyNights: {
    color: color.muted,
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  itineraryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    minHeight: 44,
  },
  headerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  itineraryHeading: {
    flex: 1,
    textAlign: "center",
    color: color.ink,
    fontFamily: serif,
    fontSize: 18,
  },
  itineraryRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  itineraryCopy: { flex: 1, minWidth: 0, paddingRight: 4 },
  itineraryMeta: {
    color: color.muted,
    fontFamily: sans,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  itineraryTitle: {
    color: color.ink,
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 24,
  },
  serif: { fontFamily: serif, fontSize: 18, color: color.ink },
  chevron: { fontSize: 18, color: color.ink, width: 18, textAlign: "center" },
  inviteArt: { width: 180, height: 160, alignItems: "center", justifyContent: "center" },
  sparkOrbit: { position: "absolute", width: 166, height: 106, borderRadius: 83, borderWidth: 1, borderColor: color.line, transform: [{ rotate: "-28deg" }], opacity: 0.7 },
  sparkOrbitInner: { position: "absolute", width: 138, height: 86, borderRadius: 70, borderWidth: 1, borderColor: color.line, transform: [{ rotate: "28deg" }], opacity: 0.35 },
  elevenMark: { flexDirection: "row", alignItems: "center", marginLeft: -7 },
  elevenBeam: { width: 2, backgroundColor: color.accent, borderRadius: 2 },
  sparkDot: { position: "absolute", left: 87, width: 4, height: 4, borderRadius: 2, backgroundColor: color.ink },
  sparkDiamond: { position: "absolute", right: 25, top: 21, width: 9, height: 9, borderWidth: 1, borderColor: color.accent, transform: [{ rotate: "45deg" }] },
  slideTrack: {
    height: 64,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: color.background,
  },
  slideFill: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 16,
    backgroundColor: color.accent,
  },
  slideThumb: {
    position: "absolute",
    left: 4,
    top: 4,
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surfaceRaised,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
