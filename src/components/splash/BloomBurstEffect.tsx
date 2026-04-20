// =====================================================
// BLOOM BURST EFFECT
// A handful of "flower blooms" that open from a point (scale 0 → 1) with
// staggered petals and a soft glow center. Symbolic of growth / new life
// for the splash "nature" stage.
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
// PETAL
// =====================================================

interface PetalSpec {
  angleDeg: number;
  length: number;
  width: number;
  color: string;
  delayMs: number;
  durationMs: number;
  reduceMotion: boolean;
}

const Petal: React.FC<{ spec: PetalSpec }> = ({ spec }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = spec.reduceMotion ? spec.durationMs * 0.6 : spec.durationMs;
    const bloom = Animated.sequence([
      Animated.delay(spec.delayMs),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: dur,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: dur * 0.45,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);
    bloom.start();
    return () => bloom.stop();
  }, [opacity, scale, spec]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -spec.width / 2,
        top: -spec.length,
        width: spec.width,
        height: spec.length,
        opacity,
        transformOrigin: 'bottom',
        transform: [
          { rotate: `${spec.angleDeg}deg` },
          { scale },
        ],
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: spec.color,
          borderTopLeftRadius: spec.width,
          borderTopRightRadius: spec.width,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          shadowColor: spec.color,
          shadowOpacity: 0.55,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// BLOOM
// =====================================================

interface BloomSpec {
  id: number;
  x: number;
  y: number;
  petalCount: number;
  petalLength: number;
  petalWidth: number;
  petalColor: string;
  centerColor: string;
  delayMs: number;
  durationMs: number;
  centerRadius: number;
  reduceMotion: boolean;
}

const Bloom: React.FC<{ spec: BloomSpec }> = ({ spec }) => {
  const centerScale = useRef(new Animated.Value(0)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = spec.reduceMotion ? spec.durationMs * 0.6 : spec.durationMs;
    Animated.sequence([
      Animated.delay(spec.delayMs + dur * 0.4),
      Animated.parallel([
        Animated.timing(centerScale, {
          toValue: 1,
          duration: dur * 0.6,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(haloOpacity, {
          toValue: 1,
          duration: dur * 0.6,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [centerScale, haloOpacity, spec]);

  const petals = useMemo<PetalSpec[]>(() => {
    const arr: PetalSpec[] = [];
    const step = 360 / spec.petalCount;
    for (let i = 0; i < spec.petalCount; i++) {
      arr.push({
        angleDeg: step * i,
        length: spec.petalLength,
        width: spec.petalWidth,
        color: spec.petalColor,
        delayMs: spec.delayMs + i * 70,
        durationMs: spec.durationMs,
        reduceMotion: spec.reduceMotion,
      });
    }
    return arr;
  }, [spec]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: spec.x,
        top: spec.y,
        width: 0,
        height: 0,
      }}
    >
      {petals.map((p, i) => (
        <Petal key={`bp-${spec.id}-${i}`} spec={p} />
      ))}
      {/* Halo */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -spec.centerRadius * 2.4,
          top: -spec.centerRadius * 2.4,
          width: spec.centerRadius * 4.8,
          height: spec.centerRadius * 4.8,
          borderRadius: spec.centerRadius * 2.4,
          backgroundColor: spec.centerColor,
          opacity: haloOpacity,
          transform: [{ scale: 0.4 }],
        }}
      />
      {/* Core */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -spec.centerRadius,
          top: -spec.centerRadius,
          width: spec.centerRadius * 2,
          height: spec.centerRadius * 2,
          borderRadius: spec.centerRadius,
          backgroundColor: spec.centerColor,
          transform: [{ scale: centerScale }],
          shadowColor: spec.centerColor,
          shadowOpacity: 1,
          shadowRadius: spec.centerRadius * 2,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
};

// =====================================================
// TOP-LEVEL
// =====================================================

export interface BloomBurstEffectProps {
  count?: number;
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const PETAL_PALETTE = [
  '#FFC3D3',
  '#FFD9A8',
  '#E7FFC3',
  '#C3F0FF',
  '#FFE3F4',
  '#F6D6FF',
];

const CENTER_PALETTE = [
  '#FFE58A',
  '#FFCC63',
  '#FFD89E',
  '#FFE7B3',
];

const BloomBurstEffect: React.FC<BloomBurstEffectProps> = ({
  count,
  reduceMotion = false,
  density = 'normal',
}) => {
  const resolved =
    count ??
    (density === 'soft' ? 4 : density === 'rich' ? 10 : 6);

  const blooms = useMemo<BloomSpec[]>(() => {
    const arr: BloomSpec[] = [];
    for (let i = 0; i < resolved; i++) {
      const petalCount = 6 + (i % 3) * 2; // 6, 8, 10
      arr.push({
        id: i,
        x:
          SCREEN_WIDTH * 0.1 +
          ((i * 173) % Math.round(SCREEN_WIDTH * 0.8)),
        y:
          SCREEN_HEIGHT * 0.55 +
          ((i * 131) % Math.round(SCREEN_HEIGHT * 0.3)),
        petalCount,
        petalLength: 20 + ((i * 3) % 12),
        petalWidth: 10 + (i % 3) * 2,
        petalColor: PETAL_PALETTE[i % PETAL_PALETTE.length],
        centerColor: CENTER_PALETTE[i % CENTER_PALETTE.length],
        delayMs: i * 380,
        durationMs: 1600,
        centerRadius: 5 + (i % 3),
        reduceMotion,
      });
    }
    return arr;
  }, [reduceMotion, resolved]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {blooms.map((b) => (
        <Bloom key={`bloom-${b.id}`} spec={b} />
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

export default BloomBurstEffect;
