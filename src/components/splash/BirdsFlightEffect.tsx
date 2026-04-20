// =====================================================
// BIRDS FLIGHT EFFECT
// Tiny V-shaped bird silhouettes crossing the top half of the screen.
// Wings "flap" via a subtle scale-Y pulse; each bird follows a gentle arc.
// No SVG, no libraries — all Views + Animated.
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

interface BirdSpec {
  id: number;
  startY: number;
  endYDelta: number;
  startX: number;
  endX: number;
  flightMs: number;
  delayMs: number;
  wingMs: number;
  size: number;
  color: string;
  reduceMotion: boolean;
}

const Bird: React.FC<{ spec: BirdSpec }> = ({ spec }) => {
  const translateX = useRef(new Animated.Value(spec.startX)).current;
  const translateY = useRef(new Animated.Value(spec.startY)).current;
  const wingPhase = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = spec.reduceMotion ? spec.flightMs * 0.6 : spec.flightMs;
    const wing = spec.reduceMotion ? spec.wingMs * 0.7 : spec.wingMs;

    const glide = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: spec.endX,
            duration: dur,
            easing: Easing.bezier(0.42, 0, 0.58, 1),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: spec.startY + spec.endYDelta,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateX, {
          toValue: spec.startX,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: spec.startY,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const flap = Animated.loop(
      Animated.sequence([
        Animated.timing(wingPhase, {
          toValue: 1,
          duration: wing,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wingPhase, {
          toValue: 0,
          duration: wing,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const fade = Animated.sequence([
      Animated.delay(spec.delayMs),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 720,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    fade.start();
    glide.start();
    flap.start();

    return () => {
      glide.stop();
      flap.stop();
      fade.stop();
    };
  }, [opacity, spec, translateX, translateY, wingPhase]);

  const wingScaleY = wingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3],
  });
  const wingRotateL = wingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '-10deg'],
  });
  const wingRotateR = wingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: ['25deg', '10deg'],
  });

  const wingW = spec.size * 1.6;
  const wingH = Math.max(1.4, spec.size * 0.18);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    >
      <View
        style={{
          width: spec.size * 2.2,
          height: spec.size,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <Animated.View
          style={{
            width: wingW,
            height: wingH,
            backgroundColor: spec.color,
            borderRadius: wingH,
            transform: [{ rotate: wingRotateL }, { scaleY: wingScaleY }],
          }}
        />
        <Animated.View
          style={{
            width: wingW,
            height: wingH,
            backgroundColor: spec.color,
            borderRadius: wingH,
            marginLeft: -4,
            transform: [{ rotate: wingRotateR }, { scaleY: wingScaleY }],
          }}
        />
      </View>
    </Animated.View>
  );
};

// =====================================================
// FLOCK EFFECT
// =====================================================

export interface BirdsFlightEffectProps {
  count?: number;
  color?: string;
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const BirdsFlightEffect: React.FC<BirdsFlightEffectProps> = ({
  count,
  color = 'rgba(40, 50, 60, 0.95)',
  reduceMotion = false,
  density = 'normal',
}) => {
  const resolved =
    count ??
    (density === 'soft' ? 4 : density === 'rich' ? 12 : 7);

  const birds = useMemo<BirdSpec[]>(() => {
    const arr: BirdSpec[] = [];
    for (let i = 0; i < resolved; i++) {
      const startY = SCREEN_HEIGHT * 0.14 + ((i * 77) % Math.round(SCREEN_HEIGHT * 0.3));
      const startX = -40 - ((i * 41) % 180);
      const endX = SCREEN_WIDTH + 40 + ((i * 23) % 140);
      const endYDelta = (i % 2 === 0 ? 1 : -1) * (18 + ((i * 7) % 32));
      arr.push({
        id: i,
        startY,
        endYDelta,
        startX,
        endX,
        flightMs: 12000 + ((i * 173) % 4600),
        delayMs: (i * 560) % 7200,
        wingMs: 320 + ((i * 37) % 140),
        size: 8 + ((i * 3) % 6),
        color,
        reduceMotion,
      });
    }
    return arr;
  }, [color, reduceMotion, resolved]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {birds.map((b) => (
        <Bird key={`bird-${b.id}`} spec={b} />
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

export default BirdsFlightEffect;
