// =====================================================
// SUNBEAMS EFFECT
// Soft golden/green sunbeams slanting through the scene like light through a canopy.
// Designed for the nature stage of the splash sequence.
// Pure View + Animated. No native shaders.
// =====================================================

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =====================================================
// BEAM CONFIG
// =====================================================

interface BeamSpec {
  key: string;
  originX: number;
  originY: number;
  angleDeg: number;
  width: number;
  length: number;
  startColor: string;
  endColor: string;
  maxOpacity: number;
  baseDurationMs: number;
  delayMs: number;
}

const DEFAULT_BEAMS = (
  screenW: number,
  screenH: number,
  reduceMotion: boolean,
): BeamSpec[] => {
  const speedScale = reduceMotion ? 0.55 : 1;
  return [
    {
      key: 'beam-1',
      originX: screenW * 0.12,
      originY: -screenH * 0.1,
      angleDeg: 28,
      width: 180,
      length: screenH * 1.6,
      startColor: 'rgba(255, 217, 122, 0.22)',
      endColor: 'rgba(212, 175, 55, 0)',
      maxOpacity: 0.75,
      baseDurationMs: 5600 * speedScale,
      delayMs: 0,
    },
    {
      key: 'beam-2',
      originX: screenW * 0.44,
      originY: -screenH * 0.05,
      angleDeg: 22,
      width: 220,
      length: screenH * 1.5,
      startColor: 'rgba(173, 230, 128, 0.20)',
      endColor: 'rgba(124, 191, 59, 0)',
      maxOpacity: 0.58,
      baseDurationMs: 6800 * speedScale,
      delayMs: 600,
    },
    {
      key: 'beam-3',
      originX: screenW * 0.78,
      originY: -screenH * 0.12,
      angleDeg: 32,
      width: 150,
      length: screenH * 1.65,
      startColor: 'rgba(255, 237, 170, 0.28)',
      endColor: 'rgba(235, 192, 106, 0)',
      maxOpacity: 0.82,
      baseDurationMs: 5200 * speedScale,
      delayMs: 1100,
    },
    {
      key: 'beam-4',
      originX: screenW * 0.28,
      originY: -screenH * 0.08,
      angleDeg: 18,
      width: 110,
      length: screenH * 1.7,
      startColor: 'rgba(178, 222, 139, 0.18)',
      endColor: 'rgba(93, 155, 42, 0)',
      maxOpacity: 0.46,
      baseDurationMs: 7200 * speedScale,
      delayMs: 1500,
    },
    {
      key: 'beam-5',
      originX: screenW * 0.62,
      originY: -screenH * 0.15,
      angleDeg: 25,
      width: 260,
      length: screenH * 1.5,
      startColor: 'rgba(240, 212, 120, 0.22)',
      endColor: 'rgba(196, 139, 44, 0)',
      maxOpacity: 0.62,
      baseDurationMs: 6000 * speedScale,
      delayMs: 900,
    },
  ];
};

// =====================================================
// SINGLE BEAM
// =====================================================

const Beam: React.FC<{ spec: BeamSpec }> = ({ spec }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: spec.maxOpacity,
          duration: spec.baseDurationMs * 0.45,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: spec.maxOpacity * 0.45,
          duration: spec.baseDurationMs * 0.55,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 6,
          duration: spec.baseDurationMs * 1.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -6,
          duration: spec.baseDurationMs * 1.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const start = Animated.sequence([
      Animated.delay(spec.delayMs),
      Animated.parallel([pulse, drift]),
    ]);
    start.start();

    return () => {
      pulse.stop();
      drift.stop();
    };
  }, [opacity, spec.baseDurationMs, spec.delayMs, spec.maxOpacity, translateY]);

  // Stack a few inner layers with decreasing opacity to approximate a smooth gradient
  const gradientLayers = useMemo(() => {
    const layers: { bg: string; top: number }[] = [];
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = 255;
      const g = 217 - Math.round(40 * t);
      const b = 122 - Math.round(62 * t);
      const alpha = 0.35 * (1 - t);
      layers.push({
        bg: `rgba(${r},${g},${b},${alpha.toFixed(3)})`,
        top: (spec.length / steps) * i,
      });
    }
    return layers;
  }, [spec.length]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: spec.originX,
        top: spec.originY,
        width: spec.width,
        height: spec.length,
        opacity,
        transform: [
          { translateY },
          { rotate: `${spec.angleDeg}deg` },
        ],
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: spec.startColor,
          borderRadius: spec.width / 2,
        }}
      >
        {gradientLayers.map((layer, idx) => (
          <View
            key={`g-${spec.key}-${idx}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: layer.top,
              height: spec.length / gradientLayers.length + 2,
              backgroundColor: layer.bg,
              opacity: 1 - idx / (gradientLayers.length + 1),
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface SunbeamsEffectProps {
  reduceMotion?: boolean;
  density?: 'soft' | 'normal' | 'rich';
}

const SunbeamsEffect: React.FC<SunbeamsEffectProps> = ({
  reduceMotion = false,
  density = 'normal',
}) => {
  const beams = useMemo(() => {
    const base = DEFAULT_BEAMS(SCREEN_WIDTH, SCREEN_HEIGHT, reduceMotion);
    if (density === 'soft') return base.slice(0, 3);
    if (density === 'rich') {
      return [
        ...base,
        ...base.map((b, i) => ({
          ...b,
          key: `${b.key}-alt`,
          originX: b.originX + (i % 2 === 0 ? 60 : -60),
          maxOpacity: b.maxOpacity * 0.55,
          width: b.width * 0.6,
          delayMs: b.delayMs + 700,
        })),
      ];
    }
    return base;
  }, [density, reduceMotion]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {beams.map((b) => (
        <Beam key={b.key} spec={b} />
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

export default SunbeamsEffect;
