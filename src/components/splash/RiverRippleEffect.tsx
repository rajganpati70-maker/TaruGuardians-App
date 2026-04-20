// =====================================================
// RIVER RIPPLE EFFECT
// Slow concentric rings from a low point on the screen,
// suggesting a gentle stream behind the treeline.
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
// RIPPLE PALETTE
// Cool water-blues with a hint of moonlight silver,
// softened with a green cast for a forested stream.
// =====================================================

const RIPPLE_TINTS: Array<{
  border: string;
  glow: string;
}> = [
  { border: 'rgba(120, 220, 255, 0.45)', glow: 'rgba(120, 220, 255, 0.08)' },
  { border: 'rgba(94, 190, 230, 0.40)', glow: 'rgba(94, 190, 230, 0.08)' },
  { border: 'rgba(150, 240, 220, 0.35)', glow: 'rgba(150, 240, 220, 0.06)' },
  { border: 'rgba(200, 240, 255, 0.35)', glow: 'rgba(200, 240, 255, 0.05)' },
  { border: 'rgba(70, 180, 200, 0.30)', glow: 'rgba(70, 180, 200, 0.05)' },
];

// =====================================================
// SINGLE RIPPLE
// =====================================================

interface RippleProps {
  id: number;
  originX: number;
  originY: number;
  maxRadius: number;
  border: string;
  glow: string;
  delayMs: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const Ripple: React.FC<RippleProps> = ({
  id,
  originX,
  originY,
  maxRadius,
  border,
  glow,
  delayMs,
  cycleMs,
  reduceMotion,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? cycleMs * 0.55 : cycleMs;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: dur,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const seq = Animated.sequence([Animated.delay(delayMs), loop]);
    seq.start();

    return () => {
      loop.stop();
    };
  }, [cycleMs, delayMs, progress, reduceMotion]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 1],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.7, 1],
    outputRange: [0, 0.85, 0.35, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: originX - maxRadius,
        top: originY - maxRadius,
        width: maxRadius * 2,
        height: maxRadius * 2,
        borderRadius: maxRadius,
        borderWidth: 1.2,
        borderColor: border,
        backgroundColor: glow,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// =====================================================
// WATERLINE SHIMMER
// A faint horizontal band near the origin line to hint
// at a reflective water surface.
// =====================================================

interface WaterlineProps {
  y: number;
  reduceMotion: boolean;
}

const Waterline: React.FC<WaterlineProps> = ({ y, reduceMotion }) => {
  const opacity = useRef(new Animated.Value(0.35)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? 3200 : 5600;

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: dur * 0.2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const slide = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 18,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -18,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    breathe.start();
    slide.start();

    return () => {
      breathe.stop();
      slide.stop();
    };
  }, [opacity, reduceMotion, translateX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -SCREEN_WIDTH * 0.1,
        top: y,
        width: SCREEN_WIDTH * 1.2,
        height: 1.5,
        backgroundColor: 'rgba(180, 230, 255, 0.25)',
        opacity,
        transform: [{ translateX }],
        shadowColor: '#BEE6FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 6,
      }}
    />
  );
};

// =====================================================
// FIELD
// Two nearby ripple origins to feel like water disturbed
// by a leaf falling or a stone rolling in a stream.
// =====================================================

interface RiverRippleEffectProps {
  density?: 'light' | 'normal' | 'dense';
  reduceMotion?: boolean;
  seedOffset?: number;
}

const RiverRippleEffect: React.FC<RiverRippleEffectProps> = ({
  density = 'normal',
  reduceMotion = false,
  seedOffset = 0,
}) => {
  const originY = SCREEN_HEIGHT * 0.78;

  const ripples = useMemo(() => {
    const perOrigin = density === 'dense' ? 6 : density === 'light' ? 3 : 4;
    const origins: Array<{ x: number; y: number }> = [
      { x: SCREEN_WIDTH * 0.28, y: originY },
      { x: SCREEN_WIDTH * 0.72, y: originY + 12 },
      { x: SCREEN_WIDTH * 0.5, y: originY - 18 },
    ];

    const list: Array<Omit<RippleProps, 'reduceMotion'>> = [];
    let i = 0;
    origins.forEach((o, oi) => {
      for (let k = 0; k < perOrigin; k += 1) {
        const tint = RIPPLE_TINTS[(i + seedOffset) % RIPPLE_TINTS.length];
        const maxRadius = 55 + k * 22 + ((oi * 9) % 14);
        const delayMs = k * 620 + oi * 310 + seedOffset * 17;
        const cycleMs = 4200 + ((i * 173) % 1600);

        list.push({
          id: i,
          originX: o.x,
          originY: o.y,
          maxRadius,
          border: tint.border,
          glow: tint.glow,
          delayMs,
          cycleMs,
        });
        i += 1;
      }
    });
    return list;
  }, [density, originY, seedOffset]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Waterline y={originY} reduceMotion={reduceMotion} />
      {ripples.map((r) => (
        <Ripple key={`river-ripple-${r.id}`} {...r} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({});

export default RiverRippleEffect;
