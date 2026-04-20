// =====================================================
// PETAL DRIFT EFFECT
// Cherry-blossom style petals pushed by a gentle breeze from left to right.
// Wanders vertically, rotates slowly. Light-weight, runs alongside Firefly / Leaves.
// =====================================================

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PETAL_COLORS = [
  '#FFE0EC',
  '#FFC8DA',
  '#FFB3CC',
  '#FFD6E6',
  '#FFE8F0',
  '#F7C9DA',
];

interface PetalProps {
  id: number;
  startY: number;
  startX: number;
  endX: number;
  durationMs: number;
  delayMs: number;
  size: number;
  color: string;
  spinFromDeg: number;
  spinToDeg: number;
  reduceMotion: boolean;
}

const Petal: React.FC<PetalProps> = ({
  id,
  startY,
  startX,
  endX,
  durationMs,
  delayMs,
  size,
  color,
  spinFromDeg,
  spinToDeg,
  reduceMotion,
}) => {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? durationMs * 0.55 : durationMs;

    const glide = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: endX,
          duration: dur,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const bobber = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: -1,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: dur * 0.3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const spin = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: dur * 1.6,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const fadeIn = Animated.sequence([
      Animated.delay(delayMs),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 860,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const listener = bob.addListener(({ value }) => {
      translateY.setValue(startY + value * 18);
    });

    fadeIn.start();
    glide.start();
    bobber.start();
    spin.start();

    return () => {
      bob.removeListener(listener);
      glide.stop();
      bobber.stop();
      spin.stop();
      fadeIn.stop();
    };
  }, [
    bob,
    delayMs,
    durationMs,
    endX,
    opacity,
    reduceMotion,
    rotate,
    startX,
    startY,
    translateX,
    translateY,
  ]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: [`${spinFromDeg}deg`, `${spinToDeg}deg`],
  });

  // Petal is made of 2 overlapping ovals for a subtle bloom shape
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity,
        transform: [
          { translateX },
          { translateY },
          { rotate: spin },
        ],
      }}
    >
      <View
        style={{
          width: size * 1.1,
          height: size * 0.65,
          borderTopLeftRadius: size,
          borderTopRightRadius: size * 0.4,
          borderBottomRightRadius: size,
          borderBottomLeftRadius: size * 0.4,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.55,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size * 0.55,
          height: size * 0.35,
          borderRadius: size,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface PetalDriftEffectProps {
  count?: number;
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const PetalDriftEffect: React.FC<PetalDriftEffectProps> = ({
  count,
  reduceMotion = false,
  density = 'normal',
}) => {
  const resolved =
    count ??
    (density === 'soft' ? 10 : density === 'rich' ? 28 : 18);

  const buildPetals = useCallback((): PetalProps[] => {
    const petals: PetalProps[] = [];
    for (let i = 0; i < resolved; i++) {
      const startY = (SCREEN_HEIGHT * ((i * 79) % 90)) / 100 + 20;
      const startX = -32 - ((i * 21) % 140);
      const endX = SCREEN_WIDTH + 60 + ((i * 17) % 100);
      petals.push({
        id: i,
        startX,
        startY,
        endX,
        durationMs: 8200 + ((i * 263) % 4600),
        delayMs: (i * 187) % 5600,
        size: 10 + ((i * 3) % 8),
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        spinFromDeg: (i * 29) % 360,
        spinToDeg: ((i * 29) % 360) + (i % 2 === 0 ? 420 : -420),
        reduceMotion,
      });
    }
    return petals;
  }, [reduceMotion, resolved]);

  const petals = useMemo(() => buildPetals(), [buildPetals]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {petals.map((p) => (
        <Petal key={`p-${p.id}`} {...p} />
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

export default PetalDriftEffect;
