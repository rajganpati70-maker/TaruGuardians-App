// =====================================================
// FALLING LEAVES EFFECT
// Soft autumn leaves drifting down the screen with gentle sway, spin, and fade.
// Meant for the nature stage of the Taru Guardians splash sequence.
// No external libraries — pure React Native Animated + StyleSheet.
// =====================================================

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =====================================================
// LEAF PALETTE
// =====================================================

const LEAF_PALETTE = [
  '#7CBF3B', // lively green
  '#5C9B2A', // forest green
  '#C49B2A', // autumn gold
  '#B56A30', // warm rust
  '#8A4A19', // bark
  '#D6B84A', // dry mustard
  '#4D7A1B', // deep leaf
  '#EBC06A', // honey
];

// =====================================================
// LEAF SHAPES — 4 variants drawn with pure View containers
// =====================================================

type LeafVariant = 'almond' | 'heart' | 'oval' | 'fan';

interface LeafShapeSpec {
  width: number;
  height: number;
  borderRadius: [number, number, number, number];
  veinCount: number;
}

const LEAF_SHAPES: Record<LeafVariant, LeafShapeSpec> = {
  almond: {
    width: 14,
    height: 22,
    borderRadius: [10, 2, 10, 2],
    veinCount: 3,
  },
  heart: {
    width: 18,
    height: 18,
    borderRadius: [10, 10, 3, 3],
    veinCount: 2,
  },
  oval: {
    width: 20,
    height: 14,
    borderRadius: [10, 10, 10, 10],
    veinCount: 2,
  },
  fan: {
    width: 18,
    height: 14,
    borderRadius: [6, 12, 6, 12],
    veinCount: 4,
  },
};

// =====================================================
// SINGLE LEAF (self-animating)
// =====================================================

interface SingleLeafProps {
  index: number;
  startX: number;
  driftAmplitudeX: number;
  fallDistance: number;
  durationMs: number;
  delayMs: number;
  rotateFrom: number;
  rotateTo: number;
  scale: number;
  color: string;
  variant: LeafVariant;
  reduceMotion: boolean;
}

const SingleLeaf: React.FC<SingleLeafProps> = ({
  index,
  startX,
  driftAmplitudeX,
  fallDistance,
  durationMs,
  delayMs,
  rotateFrom,
  rotateTo,
  scale,
  color,
  variant,
  reduceMotion,
}) => {
  const translateY = useRef(new Animated.Value(-40)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const swayPhase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const durationScale = reduceMotion ? 0.55 : 1;
    const localDuration = durationMs * durationScale;
    const localDelay = delayMs * durationScale;

    // Fall — drift smoothly from off-top to past-bottom
    const fall = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: fallDistance,
          duration: localDuration,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -40,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    // Sway — subtle horizontal oscillation
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(swayPhase, {
          toValue: 1,
          duration: 2200 * durationScale,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayPhase, {
          toValue: -1,
          duration: 2200 * durationScale,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayPhase, {
          toValue: 0,
          duration: 1200 * durationScale,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Spin — continuous slow rotation
    const spin = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 4400 * durationScale,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Fade in once, then stay visible at reduced alpha band
    const fade = Animated.sequence([
      Animated.delay(localDelay),
      Animated.timing(opacity, {
        toValue: 0.88,
        duration: 720 * durationScale,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    // Bind sway to translateX with amplitude
    const swayX = swayPhase.interpolate({
      inputRange: [-1, 1],
      outputRange: [-driftAmplitudeX, driftAmplitudeX],
    });
    translateX.setValue(0);
    const swayListener = swayPhase.addListener(({ value }) => {
      translateX.setValue(value * driftAmplitudeX);
    });

    fade.start();
    fall.start();
    sway.start();
    spin.start();

    return () => {
      fall.stop();
      sway.stop();
      spin.stop();
      fade.stop();
      swayPhase.removeListener(swayListener);
    };
  }, [
    delayMs,
    driftAmplitudeX,
    durationMs,
    fallDistance,
    opacity,
    reduceMotion,
    rotate,
    swayPhase,
    translateX,
    translateY,
  ]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotateFrom}deg`, `${rotateTo}deg`],
  });

  const shape = LEAF_SHAPES[variant];

  // Vein lines drawn as thin overlays
  const veins = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < shape.veinCount; i++) {
      const y = shape.height * ((i + 1) / (shape.veinCount + 1));
      out.push(
        <View
          key={`v-${index}-${i}`}
          style={{
            position: 'absolute',
            top: y,
            left: 2,
            right: 2,
            height: 0.6,
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        />,
      );
    }
    return out;
  }, [shape.height, shape.veinCount, index]);

  return (
    <Animated.View
      style={[
        styles.leafWrapper,
        {
          left: startX,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: spin },
            { scale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          width: shape.width,
          height: shape.height,
          borderTopLeftRadius: shape.borderRadius[0],
          borderTopRightRadius: shape.borderRadius[1],
          borderBottomRightRadius: shape.borderRadius[2],
          borderBottomLeftRadius: shape.borderRadius[3],
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.55,
          shadowRadius: 3,
        }}
      >
        {veins}
        <View
          style={{
            position: 'absolute',
            top: 2,
            bottom: 2,
            left: shape.width / 2 - 0.4,
            width: 0.8,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }}
        />
      </View>
    </Animated.View>
  );
};

// =====================================================
// TOP-LEVEL EFFECT
// =====================================================

export interface FallingLeavesEffectProps {
  /** Leaf count. Default 16. Keep low for slower devices. */
  count?: number;
  /** Base duration in ms for one top-to-bottom traversal. */
  baseDurationMs?: number;
  /** Extra horizontal drift amplitude. Default 18. */
  driftAmplitudeX?: number;
  /** If true, halves animation speed and skips some layers. */
  reduceMotion?: boolean;
}

const FallingLeavesEffect: React.FC<FallingLeavesEffectProps> = ({
  count = 16,
  baseDurationMs = 7200,
  driftAmplitudeX = 18,
  reduceMotion = false,
}) => {
  const buildLeaves = useCallback((): SingleLeafProps[] => {
    const leaves: SingleLeafProps[] = [];
    const variants: LeafVariant[] = ['almond', 'heart', 'oval', 'fan'];
    for (let i = 0; i < count; i++) {
      const ratio = i / Math.max(1, count - 1);
      const startX = 24 + Math.round(ratio * (SCREEN_WIDTH - 48));
      const variant = variants[i % variants.length];
      const color = LEAF_PALETTE[(i * 3) % LEAF_PALETTE.length];
      const scale = 0.85 + ((i * 11) % 30) / 120; // 0.85 .. 1.1
      const duration =
        baseDurationMs + ((i * 137) % 1800) * (reduceMotion ? 0.4 : 1);
      const delay = (i * 240) % 3800;
      const rotateFrom = (i % 2 === 0 ? -1 : 1) * (18 + ((i * 17) % 40));
      const rotateTo = rotateFrom + (i % 2 === 0 ? 290 : -290);

      leaves.push({
        index: i,
        startX,
        driftAmplitudeX: driftAmplitudeX + ((i * 5) % 10),
        fallDistance: SCREEN_HEIGHT + 80,
        durationMs: duration,
        delayMs: delay,
        rotateFrom,
        rotateTo,
        scale,
        color,
        variant,
        reduceMotion,
      });
    }
    return leaves;
  }, [baseDurationMs, count, driftAmplitudeX, reduceMotion]);

  const leaves = useMemo(() => buildLeaves(), [buildLeaves]);

  return (
    <View style={styles.container} pointerEvents="none">
      {leaves.map((leafProps) => (
        <SingleLeaf key={`leaf-${leafProps.index}`} {...leafProps} />
      ))}
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  leafWrapper: {
    position: 'absolute',
    top: 0,
  },
});

// Colour token guard: ensure Colors import is retained at runtime.
// This suppresses "unused import" warnings while keeping the file portable
// if we swap hard-coded palette to theme tokens later.
void Colors;

export default FallingLeavesEffect;
