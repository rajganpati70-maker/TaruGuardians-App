// =====================================================
// FERN FROND EFFECT
// Soft uncurling fronds at the foot of the splash screen.
// Nine fronds · each is a column of leaflets that tip & sway gently.
// Uses only React Native primitives — no skia, no svg.
// Meant for the nature stage of the splash sequence.
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
// PALETTE — soft mossy greens, mid-warmth
// =====================================================

const FROND_TINTS = [
  { stem: '#2F6B3F', leaf: 'rgba(92, 179, 112, 0.78)' },
  { stem: '#3C7A48', leaf: 'rgba(120, 191, 138, 0.7)' },
  { stem: '#235C2F', leaf: 'rgba(78, 158, 96, 0.72)' },
  { stem: '#4A8F58', leaf: 'rgba(138, 204, 156, 0.65)' },
  { stem: '#1D4E28', leaf: 'rgba(72, 146, 92, 0.75)' },
];

// =====================================================
// SINGLE LEAFLET
// =====================================================

interface LeafletProps {
  indexOnStem: number;
  totalOnStem: number;
  stemHeight: number;
  tint: string;
  stemTint: string;
  bendDelay: number;
  cycleMs: number;
  reduceMotion: boolean;
}

const Leaflet: React.FC<LeafletProps> = ({
  indexOnStem,
  totalOnStem,
  stemHeight,
  tint,
  stemTint,
  bendDelay,
  cycleMs,
  reduceMotion,
}) => {
  const tipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      tipAnim.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tipAnim, {
          toValue: 1,
          duration: cycleMs,
          delay: bendDelay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tipAnim, {
          toValue: 0,
          duration: cycleMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bendDelay, cycleMs, reduceMotion, tipAnim]);

  // Leaflets get longer toward the base of the stem, shorter at the tip.
  const positionRatio = indexOnStem / Math.max(1, totalOnStem - 1);
  const topOffset = positionRatio * stemHeight;
  const baseWidth = 6 + (1 - positionRatio) * 22;
  const baseHeight = 5 + (1 - positionRatio) * 4;
  const sideIsLeft = indexOnStem % 2 === 0;

  const rotate = tipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: sideIsLeft
      ? ['-46deg', '-52deg', '-48deg']
      : ['46deg', '52deg', '48deg'],
  });

  const translateY = tipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1.2],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.leafletBase,
        {
          top: topOffset,
          left: sideIsLeft ? -baseWidth + 4 : 0,
          width: baseWidth,
          height: baseHeight,
          backgroundColor: tint,
          borderColor: stemTint,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    />
  );
};

// =====================================================
// SINGLE FROND
// =====================================================

interface FrondProps {
  anchorX: number;
  baselineY: number;
  stemHeight: number;
  leafletCount: number;
  tint: { stem: string; leaf: string };
  swayDelay: number;
  swayCycleMs: number;
  reduceMotion: boolean;
}

const Frond: React.FC<FrondProps> = ({
  anchorX,
  baselineY,
  stemHeight,
  leafletCount,
  tint,
  swayDelay,
  swayCycleMs,
  reduceMotion,
}) => {
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      swayAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: swayCycleMs,
          delay: swayDelay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: swayCycleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: swayCycleMs * 0.6,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, swayAnim, swayCycleMs, swayDelay]);

  const sway = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3.5deg', '0deg', '3.5deg'],
  });

  const leaflets = useMemo(() => {
    const items: LeafletProps[] = [];
    for (let i = 0; i < leafletCount; i += 1) {
      items.push({
        indexOnStem: i,
        totalOnStem: leafletCount,
        stemHeight,
        tint: tint.leaf,
        stemTint: tint.stem,
        bendDelay: i * 80,
        cycleMs: 1600 + (i % 3) * 240,
        reduceMotion,
      });
    }
    return items;
  }, [leafletCount, stemHeight, tint.leaf, tint.stem, reduceMotion]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.frondHost,
        {
          left: anchorX,
          bottom: baselineY,
          height: stemHeight + 10,
          transform: [{ rotate: sway }],
        },
      ]}
    >
      <View style={[styles.stem, { height: stemHeight, backgroundColor: tint.stem }]} />
      {leaflets.map((l, idx) => (
        <Leaflet key={`lf-${idx}`} {...l} />
      ))}
    </Animated.View>
  );
};

// =====================================================
// MAIN
// =====================================================

interface FernFrondEffectProps {
  reduceMotion?: boolean;
  opacity?: Animated.Value;
}

const FernFrondEffect: React.FC<FernFrondEffectProps> = ({
  reduceMotion = false,
  opacity,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: reduceMotion ? 400 : 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, reduceMotion]);

  const fronds = useMemo<FrondProps[]>(() => {
    const list: FrondProps[] = [];
    const count = 9;
    const tintCycle = FROND_TINTS;
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      const anchorX = t * (SCREEN_WIDTH - 40) + 20;
      const stemHeight = 74 + ((i * 23) % 64);
      const baselineY = 6 + ((i * 11) % 18);
      list.push({
        anchorX,
        baselineY,
        stemHeight,
        leafletCount: 14,
        tint: tintCycle[i % tintCycle.length],
        swayDelay: i * 180,
        swayCycleMs: 2400 + (i % 4) * 240,
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
      {fronds.map((f, i) => (
        <Frond key={`fd-${i}`} {...f} />
      ))}
    </Animated.View>
  );
};

export default FernFrondEffect;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
  },
  frondHost: {
    position: 'absolute',
    width: 6,
    alignItems: 'center',
  },
  stem: {
    width: 2.6,
    borderRadius: 2,
    position: 'absolute',
    left: 1.7,
    bottom: 0,
    opacity: 0.82,
  },
  leafletBase: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 0.8,
    opacity: 0.9,
  },
});
