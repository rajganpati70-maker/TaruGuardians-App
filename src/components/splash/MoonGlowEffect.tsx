// =====================================================
// MOON GLOW EFFECT
// A soft moonrise over the treeline · pale silver disc,
// concentric halo rings, and a light cone that gently
// sweeps across the frame.
// Pure React Native Animated · no shaders · no svg.
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
// PALETTE
// Ivory moon with a faint blue-cold cast, warming toward
// cream at the edges.
// =====================================================

const MOON_COLORS = {
  core: '#F7F8F2',
  innerHalo: 'rgba(247, 248, 242, 0.42)',
  midHalo: 'rgba(210, 230, 240, 0.22)',
  outerHalo: 'rgba(180, 200, 230, 0.12)',
  cone: 'rgba(240, 245, 250, 0.06)',
  craterFaint: 'rgba(0, 0, 0, 0.04)',
} as const;

// =====================================================
// MOON DISC
// The moon itself · breathes · softly drifts up.
// =====================================================

interface MoonDiscProps {
  x: number;
  y: number;
  radius: number;
  reduceMotion: boolean;
}

const MoonDisc: React.FC<MoonDiscProps> = ({ x, y, radius, reduceMotion }) => {
  const riseProgress = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    const dur = reduceMotion ? 2600 : 5200;

    const rise = Animated.timing(riseProgress, {
      toValue: 1,
      duration: dur,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.02,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0.98,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.95,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.72,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    rise.start(() => {
      breatheLoop.start();
      glowLoop.start();
    });

    return () => {
      breatheLoop.stop();
      glowLoop.stop();
    };
  }, [breathe, glow, reduceMotion, riseProgress]);

  const translateY = riseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [radius * 1.3, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - radius * 3,
        top: y - radius * 3,
        width: radius * 6,
        height: radius * 6,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY }, { scale: breathe }],
        opacity: glow,
      }}
    >
      {/* Outer halo */}
      <View
        style={{
          position: 'absolute',
          width: radius * 5,
          height: radius * 5,
          borderRadius: radius * 2.5,
          backgroundColor: MOON_COLORS.outerHalo,
          shadowColor: MOON_COLORS.core,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: radius * 2.2,
        }}
      />
      {/* Mid halo */}
      <View
        style={{
          position: 'absolute',
          width: radius * 3.4,
          height: radius * 3.4,
          borderRadius: radius * 1.7,
          backgroundColor: MOON_COLORS.midHalo,
        }}
      />
      {/* Inner halo */}
      <View
        style={{
          position: 'absolute',
          width: radius * 2.4,
          height: radius * 2.4,
          borderRadius: radius * 1.2,
          backgroundColor: MOON_COLORS.innerHalo,
        }}
      />
      {/* Moon disc */}
      <View
        style={{
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundColor: MOON_COLORS.core,
          shadowColor: '#FFFFFF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.95,
          shadowRadius: radius * 0.5,
        }}
      />
      {/* Faint craters — three tiny dark patches */}
      <View
        style={{
          position: 'absolute',
          left: radius * 3 - radius * 0.35,
          top: radius * 3 - radius * 0.15,
          width: radius * 0.32,
          height: radius * 0.32,
          borderRadius: radius * 0.16,
          backgroundColor: MOON_COLORS.craterFaint,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: radius * 3 + radius * 0.1,
          top: radius * 3 + radius * 0.2,
          width: radius * 0.24,
          height: radius * 0.24,
          borderRadius: radius * 0.12,
          backgroundColor: MOON_COLORS.craterFaint,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: radius * 3 + radius * 0.25,
          top: radius * 3 - radius * 0.3,
          width: radius * 0.18,
          height: radius * 0.18,
          borderRadius: radius * 0.09,
          backgroundColor: MOON_COLORS.craterFaint,
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// LIGHT CONE
// A slow sweeping downward light wash from the moon.
// =====================================================

interface LightConeProps {
  originX: number;
  originY: number;
  reduceMotion: boolean;
}

const LightCone: React.FC<LightConeProps> = ({
  originX,
  originY,
  reduceMotion,
}) => {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? 5200 : 8400;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sweep]);

  const rotate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: originX - SCREEN_WIDTH * 0.6,
        top: originY,
        width: SCREEN_WIDTH * 1.2,
        height: SCREEN_HEIGHT,
        transform: [{ rotate }],
      }}
    >
      {/* Three stacked translucent rectangles of decreasing width to fake a cone */}
      <View
        style={{
          position: 'absolute',
          left: SCREEN_WIDTH * 0.4,
          top: 0,
          width: SCREEN_WIDTH * 0.4,
          height: SCREEN_HEIGHT,
          backgroundColor: MOON_COLORS.cone,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: SCREEN_WIDTH * 0.45,
          top: 0,
          width: SCREEN_WIDTH * 0.3,
          height: SCREEN_HEIGHT,
          backgroundColor: MOON_COLORS.cone,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: SCREEN_WIDTH * 0.5,
          top: 0,
          width: SCREEN_WIDTH * 0.2,
          height: SCREEN_HEIGHT,
          backgroundColor: MOON_COLORS.cone,
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// STAR TWINKLES
// A handful of soft stars around the moon that blink
// at different rates.
// =====================================================

interface StarTwinkleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  delayMs: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const StarTwinkle: React.FC<StarTwinkleProps> = ({
  id,
  x,
  y,
  size,
  delayMs,
  cycleMs,
  reduceMotion,
}) => {
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const dur = reduceMotion ? cycleMs * 0.55 : cycleMs;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: dur * 0.6,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const seq = Animated.sequence([Animated.delay(delayMs), loop]);
    seq.start();
    return () => loop.stop();
  }, [cycleMs, delayMs, opacity, reduceMotion]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - size,
        top: y - size,
        width: size * 2,
        height: size * 2,
        borderRadius: size,
        backgroundColor: '#F6F7FB',
        opacity,
        shadowColor: '#DDE7FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: size * 1.2,
      }}
    />
  );
};

// =====================================================
// MOON GLOW EFFECT — WHOLE COMPOSITION
// =====================================================

interface MoonGlowEffectProps {
  density?: 'light' | 'normal' | 'dense';
  reduceMotion?: boolean;
  seedOffset?: number;
}

const MoonGlowEffect: React.FC<MoonGlowEffectProps> = ({
  density = 'normal',
  reduceMotion = false,
  seedOffset = 0,
}) => {
  const moon = useMemo(
    () => ({
      x: SCREEN_WIDTH * 0.72,
      y: SCREEN_HEIGHT * 0.22,
      radius: 32,
    }),
    [],
  );

  const stars = useMemo(() => {
    const count =
      density === 'dense' ? 14 : density === 'light' ? 6 : 10;

    const list: Omit<StarTwinkleProps, 'reduceMotion'>[] = [];
    for (let i = 0; i < count; i += 1) {
      const ang = (i / count) * Math.PI * 2 + seedOffset * 0.17;
      const r = 90 + (i % 5) * 28;
      const x = moon.x + Math.cos(ang) * r;
      const y = moon.y + Math.sin(ang) * r * 0.6;
      const size = 0.9 + ((i * 11) % 5) * 0.3;
      const delayMs = (i * 211) % 1800 + seedOffset * 13;
      const cycleMs = 2200 + ((i * 173) % 1800);

      list.push({ id: i, x, y, size, delayMs, cycleMs });
    }
    return list;
  }, [density, moon, seedOffset]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LightCone
        originX={moon.x}
        originY={moon.y + moon.radius}
        reduceMotion={reduceMotion}
      />
      <MoonDisc
        x={moon.x}
        y={moon.y}
        radius={moon.radius}
        reduceMotion={reduceMotion}
      />
      {stars.map((s) => (
        <StarTwinkle key={`moon-star-${s.id}`} {...s} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({});

export default MoonGlowEffect;
