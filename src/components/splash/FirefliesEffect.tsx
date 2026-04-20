// =====================================================
// FIREFLIES EFFECT
// Warm little glow points that drift, blink, and softly wander.
// Meant for the nature stage of the splash sequence.
// Uses only React Native primitives — no shaders, no skia, no svg.
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

// =====================================================
// FIREFLY PALETTE
// =====================================================

const FIREFLY_TINTS = [
  { core: '#FFF5B8', glow: 'rgba(255, 233, 124, 0.55)' },
  { core: '#F9E67A', glow: 'rgba(246, 204, 72, 0.5)' },
  { core: '#E7F38B', glow: 'rgba(198, 222, 82, 0.5)' },
  { core: '#D1FFC8', glow: 'rgba(144, 224, 126, 0.45)' },
  { core: '#FFE9A3', glow: 'rgba(255, 204, 120, 0.55)' },
];

// =====================================================
// SINGLE FIREFLY
// =====================================================

interface FireflyProps {
  id: number;
  x: number;
  y: number;
  driftRadius: number;
  core: string;
  glow: string;
  size: number;
  delayMs: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const Firefly: React.FC<FireflyProps> = ({
  id,
  x,
  y,
  driftRadius,
  core,
  glow,
  size,
  delayMs,
  cycleMs,
  reduceMotion,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const driftPhase = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const dur = reduceMotion ? cycleMs * 0.55 : cycleMs;

    // Blink — soft breathing opacity
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: dur * 0.3,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Pulse — scale breathing
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.85,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: dur * 0.2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Drift — wander in small circles
    const drift = Animated.loop(
      Animated.timing(driftPhase, {
        toValue: 1,
        duration: dur * 2.2,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const phaseListener = driftPhase.addListener(({ value }) => {
      const angle = value * Math.PI * 2 + id * 0.37;
      translateX.setValue(Math.cos(angle) * driftRadius);
      translateY.setValue(Math.sin(angle) * driftRadius * 0.62);
    });

    const start = Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([blink, breathe, drift]),
    ]);
    start.start();

    return () => {
      blink.stop();
      breathe.stop();
      drift.stop();
      driftPhase.removeListener(phaseListener);
    };
  }, [
    cycleMs,
    delayMs,
    driftPhase,
    driftRadius,
    id,
    opacity,
    reduceMotion,
    scale,
    translateX,
    translateY,
  ]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - size * 1.2,
        top: y - size * 1.2,
        width: size * 2.4,
        height: size * 2.4,
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      {/* Outer glow */}
      <View
        style={{
          position: 'absolute',
          width: size * 2.4,
          height: size * 2.4,
          borderRadius: size * 1.2,
          backgroundColor: glow,
          shadowColor: core,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: size * 1.6,
        }}
      />
      {/* Middle glow */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.4,
          height: size * 1.4,
          borderRadius: size * 0.7,
          backgroundColor: glow,
          opacity: 0.85,
        }}
      />
      {/* Core */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: core,
          shadowColor: core,
          shadowOpacity: 1,
          shadowRadius: size,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface FirefliesEffectProps {
  count?: number;
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const FirefliesEffect: React.FC<FirefliesEffectProps> = ({
  count,
  reduceMotion = false,
  density = 'normal',
}) => {
  const resolved =
    count ??
    (density === 'soft' ? 12 : density === 'rich' ? 42 : 24);

  const flies = useMemo<FireflyProps[]>(() => {
    const arr: FireflyProps[] = [];
    for (let i = 0; i < resolved; i++) {
      const tint = FIREFLY_TINTS[i % FIREFLY_TINTS.length];
      const marginX = SCREEN_WIDTH * 0.06;
      const marginYTop = SCREEN_HEIGHT * 0.2;
      const marginYBottom = SCREEN_HEIGHT * 0.85;
      const x =
        marginX +
        ((i * 137) % Math.round(SCREEN_WIDTH - marginX * 2));
      const y =
        marginYTop +
        ((i * 211) % Math.round(marginYBottom - marginYTop));

      arr.push({
        id: i,
        x,
        y,
        driftRadius: 18 + ((i * 5) % 22),
        core: tint.core,
        glow: tint.glow,
        size: 3 + ((i * 3) % 5),
        delayMs: (i * 160) % 4600,
        cycleMs: 1800 + ((i * 131) % 1800),
        reduceMotion,
      });
    }
    return arr;
  }, [reduceMotion, resolved]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {flies.map((f) => (
        <Firefly key={`ff-${f.id}`} {...f} />
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

export default FirefliesEffect;
