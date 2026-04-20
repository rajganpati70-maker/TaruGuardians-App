// =====================================================
// CONSTELLATION EFFECT
// Ten slow-rising constellations, each a small cluster of stars + glow
// connectors that blink softly with a shared pulse phase.
// Nature-leaning: meant to read as ‘campus sky at dusk’ — not a sci-fi starfield.
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

// =====================================================
// PALETTE
// =====================================================

const STAR_TINTS = [
  { core: '#FDFCF2', glow: 'rgba(255, 247, 210, 0.55)' },
  { core: '#EAF2FF', glow: 'rgba(200, 220, 255, 0.55)' },
  { core: '#FFF1CC', glow: 'rgba(255, 220, 160, 0.55)' },
  { core: '#E7FFF0', glow: 'rgba(180, 240, 210, 0.55)' },
];

const LINE_TINT = 'rgba(200, 220, 255, 0.32)';

// =====================================================
// STAR
// =====================================================

interface StarProps {
  cx: number;
  cy: number;
  size: number;
  tint: { core: string; glow: string };
  delay: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const Star: React.FC<StarProps> = ({
  cx,
  cy,
  size,
  tint,
  delay,
  cycleMs,
  reduceMotion,
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: cycleMs,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: cycleMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cycleMs, delay, pulse, reduceMotion]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.2],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.starHost,
        {
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.starGlow,
          {
            width: size * 2.6,
            height: size * 2.6,
            borderRadius: size * 1.3,
            backgroundColor: tint.glow,
            left: -size * 0.8,
            top: -size * 0.8,
          },
        ]}
      />
      <View
        style={[
          styles.starCore,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tint.core,
          },
        ]}
      />
    </Animated.View>
  );
};

// =====================================================
// CONNECTOR — a thin rotated rect that bridges two star points
// =====================================================

interface ConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const Connector: React.FC<ConnectorProps> = ({
  x1,
  y1,
  x2,
  y2,
  delay,
  cycleMs,
  reduceMotion,
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: cycleMs,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: cycleMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [cycleMs, delay, pulse, reduceMotion]);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.55],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.connector,
        {
          left: x1,
          top: y1 - 0.5,
          width: length,
          opacity,
          transform: [{ rotateZ: `${angle}deg` }],
        },
      ]}
    />
  );
};

// =====================================================
// CONSTELLATION — 4–6 stars + connectors, drifts slightly
// =====================================================

interface StarDef {
  cx: number;
  cy: number;
  size: number;
  tint: { core: string; glow: string };
  delay: number;
  cycleMs: number;
}

interface ConstellationProps {
  originX: number;
  originY: number;
  stars: StarDef[];
  edges: [number, number][];
  driftDelay: number;
  driftCycleMs: number;
  reduceMotion: boolean;
}

const Constellation: React.FC<ConstellationProps> = ({
  originX,
  originY,
  stars,
  edges,
  driftDelay,
  driftCycleMs,
  reduceMotion,
}) => {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: driftCycleMs,
          delay: driftDelay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: -1,
          duration: driftCycleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: driftCycleMs * 0.6,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, driftCycleMs, driftDelay, reduceMotion]);

  const translateX = drift.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3],
  });
  const translateY = drift.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [2, 0, -2],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.cluster,
        {
          left: originX,
          top: originY,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {edges.map(([a, b], idx) => (
        <Connector
          key={`cn-${idx}`}
          x1={stars[a].cx}
          y1={stars[a].cy}
          x2={stars[b].cx}
          y2={stars[b].cy}
          delay={200 + idx * 120}
          cycleMs={2200 + (idx % 3) * 300}
          reduceMotion={reduceMotion}
        />
      ))}
      {stars.map((s, idx) => (
        <Star
          key={`st-${idx}`}
          cx={s.cx}
          cy={s.cy}
          size={s.size}
          tint={s.tint}
          delay={s.delay}
          cycleMs={s.cycleMs}
          reduceMotion={reduceMotion}
        />
      ))}
    </Animated.View>
  );
};

// =====================================================
// MAIN
// =====================================================

interface ConstellationEffectProps {
  reduceMotion?: boolean;
  opacity?: Animated.Value;
}

const ConstellationEffect: React.FC<ConstellationEffectProps> = ({
  reduceMotion = false,
  opacity,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: reduceMotion ? 400 : 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, reduceMotion]);

  const clusters = useMemo<ConstellationProps[]>(() => {
    const list: ConstellationProps[] = [];
    const count = 10;
    for (let i = 0; i < count; i += 1) {
      const originX = ((i * 83) % (SCREEN_WIDTH - 120)) + 20;
      const originY = ((i * 61) % (SCREEN_HEIGHT - 260)) + 40;
      const size = 90 + (i % 4) * 32;
      const starCount = 4 + (i % 3);
      const stars: StarDef[] = [];
      for (let s = 0; s < starCount; s += 1) {
        const theta = (s / starCount) * Math.PI * 2 + i * 0.35;
        const r = 14 + ((s * 9) % 20);
        stars.push({
          cx: Math.cos(theta) * r + size / 2,
          cy: Math.sin(theta) * r + size / 2,
          size: 2.4 + (s % 3) * 0.9,
          tint: STAR_TINTS[(i + s) % STAR_TINTS.length],
          delay: 120 * s + i * 90,
          cycleMs: 1800 + ((s + i) % 4) * 280,
        });
      }
      const edges: [number, number][] = [];
      for (let s = 0; s < starCount - 1; s += 1) {
        edges.push([s, s + 1]);
      }
      if (starCount >= 4) {
        edges.push([0, starCount - 1]);
      }
      list.push({
        originX,
        originY,
        stars,
        edges,
        driftDelay: i * 240,
        driftCycleMs: 3400 + (i % 4) * 280,
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
      {clusters.map((c, idx) => (
        <Constellation key={`cluster-${idx}`} {...c} />
      ))}
    </Animated.View>
  );
};

export default ConstellationEffect;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cluster: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  starHost: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    opacity: 0.9,
  },
  starCore: {
    position: 'absolute',
    shadowColor: '#FFF6CE',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  connector: {
    position: 'absolute',
    height: 1,
    backgroundColor: LINE_TINT,
  },
});
