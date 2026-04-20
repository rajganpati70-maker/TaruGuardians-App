// =====================================================
// FOREST SILHOUETTE EFFECT
// Layered tree silhouettes with parallax sway.
// Drawn purely with Views (rectangles + triangle-ish containers) — no SVG.
// Two depth layers: background (fainter, slower) + foreground (darker, quicker sway).
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
// TREE SHAPE
// =====================================================

interface TreeSpec {
  id: string;
  x: number;
  baseY: number;
  trunkWidth: number;
  trunkHeight: number;
  canopyWidth: number;
  canopyHeight: number;
  color: string;
  swayDelayMs: number;
  swayAmpDeg: number;
  swayDurationMs: number;
  canopyLayers: number;
}

const Tree: React.FC<{ spec: TreeSpec; reduceMotion: boolean }> = ({
  spec,
  reduceMotion,
}) => {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = reduceMotion
      ? spec.swayDurationMs * 0.55
      : spec.swayDurationMs;

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: dur * 0.6,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const start = Animated.sequence([Animated.delay(spec.swayDelayMs), sway]);
    start.start();

    return () => {
      sway.stop();
    };
  }, [reduceMotion, rotate, spec.swayDelayMs, spec.swayDurationMs]);

  const rotateInterp = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${spec.swayAmpDeg}deg`, `${spec.swayAmpDeg}deg`],
  });

  // Layered canopy: multiple rounded rectangles stacked to fake a soft blob
  const canopy = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < spec.canopyLayers; i++) {
      const t = i / Math.max(1, spec.canopyLayers - 1);
      const w = spec.canopyWidth * (1 - t * 0.25);
      const h = spec.canopyHeight * (1 - t * 0.3);
      out.push(
        <View
          key={`c-${spec.id}-${i}`}
          style={{
            position: 'absolute',
            left: (spec.canopyWidth - w) / 2,
            top: i * (spec.canopyHeight / (spec.canopyLayers * 2)),
            width: w,
            height: h,
            borderRadius: w / 2,
            backgroundColor: spec.color,
            opacity: 0.82 + t * 0.18,
          }}
        />,
      );
    }
    return out;
  }, [spec.canopyHeight, spec.canopyLayers, spec.canopyWidth, spec.color, spec.id]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: spec.x - spec.canopyWidth / 2,
        bottom: spec.baseY,
        alignItems: 'center',
        transform: [{ rotate: rotateInterp }],
        transformOrigin: 'bottom',
      }}
    >
      {/* Canopy */}
      <View
        style={{
          width: spec.canopyWidth,
          height: spec.canopyHeight,
        }}
      >
        {canopy}
      </View>
      {/* Trunk */}
      <View
        style={{
          width: spec.trunkWidth,
          height: spec.trunkHeight,
          backgroundColor: spec.color,
          opacity: 0.95,
          marginTop: -2,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// LAYER BUILDER
// =====================================================

interface LayerBuildSpec {
  count: number;
  baseYOffset: number;
  color: string;
  scale: number;
  swayMul: number;
}

const buildTrees = (layer: LayerBuildSpec): TreeSpec[] => {
  const trees: TreeSpec[] = [];
  for (let i = 0; i < layer.count; i++) {
    const ratio = i / Math.max(1, layer.count - 1);
    const x = 30 + Math.round(ratio * (SCREEN_WIDTH - 60));
    const jitter = ((i * 71) % 24) - 12;
    const canopyWidth = 80 * layer.scale + ((i * 11) % 30);
    const canopyHeight = 100 * layer.scale + ((i * 7) % 30);
    trees.push({
      id: `${layer.color}-${i}`,
      x: x + jitter,
      baseY: layer.baseYOffset + ((i * 5) % 18),
      trunkWidth: 6 * layer.scale,
      trunkHeight: 28 * layer.scale + ((i * 3) % 10),
      canopyWidth,
      canopyHeight,
      color: layer.color,
      swayDelayMs: (i * 230) % 2800,
      swayAmpDeg: 1.6 * layer.swayMul + (i % 3) * 0.4,
      swayDurationMs: 2600 + ((i * 131) % 1400),
      canopyLayers: 4,
    });
  }
  return trees;
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface ForestSilhouetteEffectProps {
  reduceMotion?: boolean;
  backgroundColor?: string;
  midColor?: string;
  foregroundColor?: string;
  backgroundCount?: number;
  midCount?: number;
  foregroundCount?: number;
}

const ForestSilhouetteEffect: React.FC<ForestSilhouetteEffectProps> = ({
  reduceMotion = false,
  backgroundColor = 'rgba(20, 45, 32, 0.55)',
  midColor = 'rgba(14, 36, 24, 0.75)',
  foregroundColor = 'rgba(7, 22, 15, 0.95)',
  backgroundCount = 9,
  midCount = 7,
  foregroundCount = 5,
}) => {
  const layersData = useMemo(() => {
    const bg = buildTrees({
      count: backgroundCount,
      baseYOffset: SCREEN_HEIGHT * 0.04,
      color: backgroundColor,
      scale: 0.85,
      swayMul: 0.5,
    });
    const mid = buildTrees({
      count: midCount,
      baseYOffset: SCREEN_HEIGHT * 0.02,
      color: midColor,
      scale: 1,
      swayMul: 0.85,
    });
    const fg = buildTrees({
      count: foregroundCount,
      baseYOffset: -8,
      color: foregroundColor,
      scale: 1.25,
      swayMul: 1.2,
    });
    return { bg, mid, fg };
  }, [
    backgroundColor,
    backgroundCount,
    foregroundColor,
    foregroundCount,
    midColor,
    midCount,
  ]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.layer, { zIndex: 1 }]}>
        {layersData.bg.map((t) => (
          <Tree key={t.id} spec={t} reduceMotion={reduceMotion} />
        ))}
      </View>
      <View style={[styles.layer, { zIndex: 2 }]}>
        {layersData.mid.map((t) => (
          <Tree key={t.id} spec={t} reduceMotion={reduceMotion} />
        ))}
      </View>
      <View style={[styles.layer, { zIndex: 3 }]}>
        {layersData.fg.map((t) => (
          <Tree key={t.id} spec={t} reduceMotion={reduceMotion} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ForestSilhouetteEffect;
