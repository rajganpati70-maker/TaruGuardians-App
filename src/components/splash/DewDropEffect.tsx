// =====================================================
// DEW DROP EFFECT
// Small translucent droplets that sit on invisible blades of grass near the
// lower third of the splash, catching light with a slow pulse and a tiny
// downward slide before resetting. Meant for the nature stage.
// Uses only React Native primitives — no skia, no svg, no shaders.
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

const DEW_TINTS = [
  { core: 'rgba(230, 250, 240, 0.92)', glow: 'rgba(200, 240, 220, 0.55)', hi: '#F3FFF9' },
  { core: 'rgba(210, 240, 255, 0.92)', glow: 'rgba(180, 220, 255, 0.55)', hi: '#F0FAFF' },
  { core: 'rgba(245, 255, 220, 0.9)',  glow: 'rgba(220, 240, 190, 0.55)', hi: '#FAFFE3' },
  { core: 'rgba(255, 240, 220, 0.9)',  glow: 'rgba(240, 220, 190, 0.55)', hi: '#FFF7E8' },
];

interface DewDropProps {
  x: number;
  baseY: number;
  size: number;
  tint: { core: string; glow: string; hi: string };
  delay: number;
  cycleMs: number;
  slideDistance: number;
  reduceMotion: boolean;
}

const DewDrop: React.FC<DewDropProps> = ({
  x,
  baseY,
  size,
  tint,
  delay,
  cycleMs,
  slideDistance,
  reduceMotion,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      shimmer.setValue(0.6);
      slide.setValue(0);
      return;
    }
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: cycleMs,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: cycleMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const slideLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(slide, {
          toValue: 1,
          duration: cycleMs * 3,
          delay: delay + cycleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: cycleMs * 0.6,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );
    shimmerLoop.start();
    slideLoop.start();
    return () => {
      shimmerLoop.stop();
      slideLoop.stop();
    };
  }, [cycleMs, delay, reduceMotion, shimmer, slide]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const scale = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });
  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, slideDistance],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dropHost,
        {
          left: x - size / 2,
          top: baseY - size / 2,
          width: size,
          height: size,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.dropGlow,
          {
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: size * 1.1,
            backgroundColor: tint.glow,
            left: -size * 0.6,
            top: -size * 0.6,
          },
        ]}
      />
      <View
        style={[
          styles.dropCore,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tint.core,
          },
        ]}
      />
      <View
        style={[
          styles.dropHi,
          {
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: size * 0.16,
            backgroundColor: tint.hi,
            left: size * 0.18,
            top: size * 0.16,
          },
        ]}
      />
    </Animated.View>
  );
};

interface DewDropEffectProps {
  reduceMotion?: boolean;
  opacity?: Animated.Value;
}

const DewDropEffect: React.FC<DewDropEffectProps> = ({
  reduceMotion = false,
  opacity,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: reduceMotion ? 400 : 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, reduceMotion]);

  const drops = useMemo<DewDropProps[]>(() => {
    const list: DewDropProps[] = [];
    const count = 26;
    const band = SCREEN_HEIGHT * 0.36;
    const baseBand = SCREEN_HEIGHT - band - 40;
    for (let i = 0; i < count; i += 1) {
      const x = ((i * 67) % (SCREEN_WIDTH - 30)) + 15;
      const baseY = baseBand + ((i * 37) % band);
      const size = 4 + (i % 5) * 1.6;
      list.push({
        x,
        baseY,
        size,
        tint: DEW_TINTS[i % DEW_TINTS.length],
        delay: (i * 140) % 2800,
        cycleMs: 2200 + (i % 4) * 260,
        slideDistance: 5 + (i % 4) * 2,
        reduceMotion,
      });
    }
    return list;
  }, [reduceMotion]);

  const combinedOpacity = opacity
    ? Animated.multiply(fadeAnim, opacity)
    : fadeAnim;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.root, { opacity: combinedOpacity }]}
    >
      {drops.map((d, i) => (
        <DewDrop key={`dw-${i}`} {...d} />
      ))}
    </Animated.View>
  );
};

export default DewDropEffect;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dropHost: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropGlow: {
    position: 'absolute',
    opacity: 0.8,
  },
  dropCore: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  dropHi: {
    position: 'absolute',
    opacity: 0.85,
  },
});
