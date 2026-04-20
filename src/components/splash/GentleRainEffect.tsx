// =====================================================
// GENTLE RAIN EFFECT
// Soft thin streaks falling slowly — like a light monsoon patter over
// the forest scene. Differs from DigitalRainEffect (neon code chars)
// by being thin, blue-green, semi-transparent, and breathing.
// =====================================================

import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StreakSpec {
  id: number;
  x: number;
  durationMs: number;
  delayMs: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
  reduceMotion: boolean;
}

const Streak: React.FC<StreakSpec> = ({
  id,
  x,
  durationMs,
  delayMs,
  length,
  width,
  alpha,
  color,
  reduceMotion,
}) => {
  const translateY = useRef(new Animated.Value(-length)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? durationMs * 0.55 : durationMs;

    const fall = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + length,
          duration: dur,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -length,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const fade = Animated.sequence([
      Animated.delay(delayMs),
      Animated.timing(opacity, {
        toValue: alpha,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    fade.start();
    fall.start();

    return () => {
      fall.stop();
      fade.stop();
    };
  }, [alpha, delayMs, durationMs, length, opacity, reduceMotion, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width,
        height: length,
        borderRadius: width / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};

// =====================================================
// PUDDLE — a soft ring that pulses to suggest droplet impact
// =====================================================

interface PuddleProps {
  x: number;
  y: number;
  delayMs: number;
  cycleMs: number;
  color: string;
  reduceMotion: boolean;
}

const Puddle: React.FC<PuddleProps> = ({
  x,
  y,
  delayMs,
  cycleMs,
  color,
  reduceMotion,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? cycleMs * 0.55 : cycleMs;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: dur * 0.6,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: dur * 0.2,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: dur * 0.4,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const start = Animated.sequence([Animated.delay(delayMs), loop]);
    start.start();

    return () => {
      loop.stop();
    };
  }, [cycleMs, delayMs, opacity, reduceMotion, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 16,
        top: y - 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface GentleRainEffectProps {
  streakCount?: number;
  puddleCount?: number;
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const GentleRainEffect: React.FC<GentleRainEffectProps> = ({
  streakCount,
  puddleCount,
  reduceMotion = false,
  density = 'normal',
}) => {
  const streakResolved =
    streakCount ??
    (density === 'soft' ? 18 : density === 'rich' ? 56 : 32);
  const puddleResolved =
    puddleCount ??
    (density === 'soft' ? 3 : density === 'rich' ? 9 : 5);

  const streaks = useMemo<StreakSpec[]>(() => {
    const arr: StreakSpec[] = [];
    for (let i = 0; i < streakResolved; i++) {
      arr.push({
        id: i,
        x: Math.round(((i * 127) % 1000) / 1000 * SCREEN_WIDTH),
        durationMs: 1600 + ((i * 83) % 1400),
        delayMs: (i * 89) % 3200,
        length: 30 + ((i * 11) % 36),
        width: 1.1 + ((i % 3) * 0.4),
        alpha: 0.28 + ((i * 7) % 20) / 120,
        color: i % 4 === 0 ? 'rgba(170, 228, 255, 0.9)' : 'rgba(128, 210, 255, 0.85)',
        reduceMotion,
      });
    }
    return arr;
  }, [reduceMotion, streakResolved]);

  const puddles = useMemo<PuddleProps[]>(() => {
    const arr: PuddleProps[] = [];
    for (let i = 0; i < puddleResolved; i++) {
      arr.push({
        x:
          24 +
          ((i * 241) % Math.round(SCREEN_WIDTH - 48)),
        y:
          SCREEN_HEIGHT * 0.55 +
          ((i * 137) % Math.round(SCREEN_HEIGHT * 0.35)),
        delayMs: (i * 430) % 4000,
        cycleMs: 2600 + ((i * 171) % 1200),
        color: 'rgba(170, 228, 255, 0.85)',
        reduceMotion,
      });
    }
    return arr;
  }, [puddleResolved, reduceMotion]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {streaks.map((s) => (
        <Streak key={`s-${s.id}`} {...s} />
      ))}
      {puddles.map((p, idx) => (
        <Puddle key={`p-${idx}`} {...p} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});

export default GentleRainEffect;
