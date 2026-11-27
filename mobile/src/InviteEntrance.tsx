import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { color, serif } from "./theme";

const CHAR_MS = 48;
const HOLD_AFTER_MS = 1200;

/** Full-screen cinematic intro: title types on open, then yields to invite details. */
export function InviteEntrance({
  title,
  meta,
  reduce,
  onExitStart,
  onDone,
}: {
  title: string;
  meta: string;
  reduce: boolean;
  onExitStart?: () => void;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onExitStartRef = useRef(onExitStart);
  onExitStartRef.current = onExitStart;
  const [typed, setTyped] = useState(reduce ? title : "");
  const [showMeta, setShowMeta] = useState(reduce);
  const rootOpacity = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const rise = useRef(new Animated.Value(reduce ? 0 : 16)).current;
  const metaOpacity = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const metaRise = useRef(new Animated.Value(reduce ? 0 : 8)).current;
  const finishing = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let typeTimer: ReturnType<typeof setInterval> | undefined;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let reduceTimer: ReturnType<typeof setTimeout> | undefined;

    const exit = () => {
      if (cancelled || finishing.current) return;
      finishing.current = true;
      onExitStartRef.current?.();
      if (reduce) {
        onDoneRef.current();
        return;
      }
      Animated.parallel([
        Animated.timing(rootOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: -12,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished || !cancelled) onDoneRef.current();
      });
    };

    if (reduce) {
      reduceTimer = setTimeout(exit, 450);
      return () => {
        cancelled = true;
        clearTimeout(reduceTimer);
      };
    }

    Animated.parallel([
      Animated.timing(rootOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || cancelled) return;
      let index = 0;
      typeTimer = setInterval(() => {
        if (cancelled) return;
        index += 1;
        setTyped(title.slice(0, index));
        if (index >= title.length) {
          clearInterval(typeTimer);
          setShowMeta(true);
          Animated.parallel([
            Animated.timing(metaOpacity, {
              toValue: 1,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(metaRise, {
              toValue: 0,
              duration: 380,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          holdTimer = setTimeout(exit, HOLD_AFTER_MS);
        }
      }, CHAR_MS);
    });

    return () => {
      cancelled = true;
      if (typeTimer) clearInterval(typeTimer);
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [title, reduce, rootOpacity, rise, metaOpacity, metaRise]);

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: rootOpacity,
          transform: [{ translateY: rise }],
        },
      ]}
      accessibilityViewIsModal
    >
      <View pointerEvents="none" style={styles.glow} />
      <View style={styles.center}>
        <Text accessibilityRole="header" accessibilityLabel={title} style={styles.title}>
          {typed}
          {!reduce && typed.length < title.length ? (
            <Text style={styles.caret}>|</Text>
          ) : null}
        </Text>
        {showMeta ? (
          <Animated.Text
            style={[
              styles.meta,
              {
                opacity: metaOpacity,
                transform: [{ translateY: metaRise }],
              },
            ]}
          >
            {meta}
          </Animated.Text>
        ) : (
          <Text style={[styles.meta, { opacity: 0 }]}>{meta}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.background,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: color.accent,
    opacity: 0.08,
  },
  center: {
    paddingHorizontal: 36,
    alignItems: "center",
    maxWidth: 360,
  },
  title: {
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 44,
    color: color.ink,
    textAlign: "center",
  },
  caret: {
    color: color.accent,
    fontFamily: serif,
    fontSize: 36,
    lineHeight: 44,
    opacity: 0.55,
  },
  meta: {
    marginTop: 18,
    fontFamily: serif,
    fontSize: 15,
    letterSpacing: 0.2,
    color: color.muted,
    textAlign: "center",
  },
});
