// =====================================================
// MIST LAYER EFFECT
// Low-altitude horizontal fog bands drifting slowly across the scene.
// Stacked bands with different speeds create a parallax-mist feel.
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

interface BandSpec {
  id: number;
  y: number;
  height: number;
  startX: number;
  endX: number;
  durationMs: number;
  delayMs: number;
  color: string;
  maxOpacity: number;
}

const Band: React.FC<{ spec: BandSpec; reduceMotion: boolean }> = ({
  spec,
  reduceMotion,
}) => {
  const translateX = useRef(new Animated.Value(spec.startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion ? spec.durationMs * 0.6 : spec.durationMs;

    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: spec.endX,
          duration: dur,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: spec.startX,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: dur * 0.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const fade = Animated.sequence([
      Animated.delay(spec.delayMs),
      Animated.timing(opacity, {
        toValue: spec.maxOpacity,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    fade.start();
    drift.start();
    breathing.start();

    return () => {
      drift.stop();
      breathing.stop();
      fade.stop();
    };
  }, [breathe, opacity, reduceMotion, spec, translateX]);

  const scaleY = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: spec.y - spec.height / 2,
        width: SCREEN_WIDTH * 2.5,
        height: spec.height,
        opacity,
        transform: [{ translateX }, { scaleY }],
      }}
    >
      {/* Gradient-ish layered bands — faked by stacking three semi-transparent blobs */}
      <View style={[styles.bandInner, { backgroundColor: spec.color }]} />
      <View
        style={[
          styles.bandInner,
          {
            backgroundColor: spec.color,
            opacity: 0.6,
            transform: [{ translateX: 120 }, { scaleY: 0.8 }],
          },
        ]}
      />
      <View
        style={[
          styles.bandInner,
          {
            backgroundColor: spec.color,
            opacity: 0.35,
            transform: [{ translateX: 320 }, { scaleY: 0.6 }],
          },
        ]}
      />
    </Animated.View>
  );
};

export interface MistLayerEffectProps {
  reduceMotion?: boolean;
  tint?: 'cool' | 'warm' | 'neutral';
  density?: 'soft' | 'normal' | 'rich';
}

const MistLayerEffect: React.FC<MistLayerEffectProps> = ({
  reduceMotion = false,
  tint = 'cool',
  density = 'normal',
}) => {
  const bands = useMemo<BandSpec[]>(() => {
    const palette =
      tint === 'warm'
        ? ['rgba(255, 210, 150, 0.16)', 'rgba(240, 180, 110, 0.12)']
        : tint === 'neutral'
        ? ['rgba(220, 220, 220, 0.16)', 'rgba(180, 180, 180, 0.12)']
        : ['rgba(160, 220, 230, 0.18)', 'rgba(110, 190, 220, 0.12)'];

    const count = density === 'soft' ? 3 : density === 'rich' ? 7 : 5;
    const arr: BandSpec[] = [];
    for (let i = 0; i < count; i++) {
      const y = SCREEN_HEIGHT * (0.25 + (i / Math.max(1, count - 1)) * 0.6);
      arr.push({
        id: i,
        y,
        height: 110 + ((i * 31) % 60),
        startX: -SCREEN_WIDTH * 0.6 - ((i * 53) % 120),
        endX: -SCREEN_WIDTH * 1.6 - ((i * 53) % 120),
        durationMs: 18000 + i * 2400,
        delayMs: i * 620,
        color: palette[i % palette.length],
        maxOpacity: 0.9 - i * 0.08,
      });
    }
    return arr;
  }, [density, tint]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {bands.map((b) => (
        <Band key={`mist-${b.id}`} spec={b} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bandInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 120,
  },
});

export default MistLayerEffect;
