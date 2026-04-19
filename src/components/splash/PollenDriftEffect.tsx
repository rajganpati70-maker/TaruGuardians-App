// =====================================================
// POLLEN DRIFT EFFECT
// Tiny golden specks that float on invisible currents,
// occasionally swirling + fading back. Meant for the
// warm meadow stage of the splash sequence.
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
// POLLEN PALETTE
// Warm pollen yellows with a few pistachio greens mixed in.
// =====================================================

const POLLEN_TINTS: Array<{ core: string; halo: string }> = [
  { core: '#FFF1A6', halo: 'rgba(255, 223, 102, 0.45)' },
  { core: '#FFE07A', halo: 'rgba(242, 196, 55, 0.40)' },
  { core: '#FDCE59', halo: 'rgba(226, 177, 38, 0.35)' },
  { core: '#F7E48A', halo: 'rgba(214, 200, 96, 0.42)' },
  { core: '#E3E58F', halo: 'rgba(184, 204, 100, 0.38)' },
  { core: '#C8E38A', halo: 'rgba(154, 198, 107, 0.40)' },
  { core: '#FFF5C8', halo: 'rgba(255, 232, 140, 0.35)' },
];

// =====================================================
// SINGLE POLLEN MOTE
// Each mote has its own drift vector, blink cycle, and
// small swirl phase so the overall field feels organic.
// =====================================================

interface PolleProps {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  swirlRadius: number;
  size: number;
  core: string;
  halo: string;
  delayMs: number;
  lifeMs: number;
  reduceMotion: boolean;
}

const PollenMote: React.FC<PolleProps> = ({
  id,
  startX,
  startY,
  driftX,
  driftY,
  swirlRadius,
  size,
  core,
  halo,
  delayMs,
  lifeMs,
  reduceMotion,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const travel = useRef(new Animated.Value(0)).current;
  const swirl = useRef(new Animated.Value(0)).current;
  const offsetX = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const dur = reduceMotion ? lifeMs * 0.55 : lifeMs;

    // Single long travel from top-ish to bottom-ish with a sideways drift
    const travelAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(travel, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(travel, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    // Swirl phase · faster, goes round and round
    const swirlAnim = Animated.loop(
      Animated.timing(swirl, {
        toValue: 1,
        duration: dur * 0.55,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Soft blink so each mote pulses warmly
    const blinkAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.6,
          duration: dur * 0.22,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: dur * 0.22,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Scale breathes gently
    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Fade in slow · fade out slow · overall opacity envelope
    const envelope = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: dur * 0.25,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: dur * 0.35,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: dur * 0.2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const phaseListener = swirl.addListener(({ value }) => {
      const angle = value * Math.PI * 2 + id * 0.41;
      offsetX.setValue(Math.cos(angle) * swirlRadius);
      offsetY.setValue(Math.sin(angle) * swirlRadius * 0.55);
    });

    const start = Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([travelAnim, swirlAnim, blinkAnim, breatheAnim, envelope]),
    ]);
    start.start();

    return () => {
      travelAnim.stop();
      swirlAnim.stop();
      blinkAnim.stop();
      breatheAnim.stop();
      envelope.stop();
      swirl.removeListener(phaseListener);
    };
  }, [
    blink,
    delayMs,
    id,
    lifeMs,
    offsetX,
    offsetY,
    opacity,
    reduceMotion,
    scale,
    swirl,
    swirlRadius,
    travel,
  ]);

  const translateX = Animated.add(
    Animated.multiply(travel, driftX),
    offsetX,
  );
  const translateY = Animated.add(
    Animated.multiply(travel, driftY),
    offsetY,
  );
  const combinedOpacity = Animated.multiply(opacity, blink);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX - size,
        top: startY - size,
        width: size * 2,
        height: size * 2,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: combinedOpacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      {/* Outer halo */}
      <View
        style={{
          position: 'absolute',
          width: size * 2.6,
          height: size * 2.6,
          borderRadius: size * 1.3,
          backgroundColor: halo,
          shadowColor: core,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.75,
          shadowRadius: size * 1.4,
        }}
      />
      {/* Mid layer */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.55,
          height: size * 1.55,
          borderRadius: size * 0.775,
          backgroundColor: halo,
        }}
      />
      {/* Core dot */}
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: size * 0.375,
          backgroundColor: core,
        }}
      />
    </Animated.View>
  );
};

// =====================================================
// FIELD
// A scattered distribution of motes across the screen
// with a slight bias toward the upper third, so it feels
// like they are floating down from the tree-tops.
// =====================================================

interface PollenDriftEffectProps {
  density?: 'light' | 'normal' | 'dense';
  reduceMotion?: boolean;
  seedOffset?: number;
  topBiasPx?: number;
}

const PollenDriftEffect: React.FC<PollenDriftEffectProps> = ({
  density = 'normal',
  reduceMotion = false,
  seedOffset = 0,
  topBiasPx,
}) => {
  const count = useMemo(() => {
    switch (density) {
      case 'light':
        return 14;
      case 'dense':
        return 36;
      default:
        return 22;
    }
  }, [density]);

  const topBias = topBiasPx ?? SCREEN_HEIGHT * 0.32;

  const motes = useMemo(() => {
    const list: Array<Omit<PolleProps, 'reduceMotion'>> = [];
    for (let i = 0; i < count; i += 1) {
      const tint = POLLEN_TINTS[(i + seedOffset) % POLLEN_TINTS.length];
      const size = 1.8 + ((i * 13) % 10) * 0.35;

      const startX = ((i * 57 + seedOffset * 23) % SCREEN_WIDTH);
      const startY = topBias + ((i * 41) % Math.max(60, SCREEN_HEIGHT * 0.55));

      // Gentle rightward or leftward drift, biased downward
      const horizontalSign = i % 2 === 0 ? 1 : -1;
      const driftX = horizontalSign * (SCREEN_WIDTH * 0.12 + (i % 5) * 10);
      const driftY = SCREEN_HEIGHT * 0.18 + ((i * 7) % 40);

      const swirlRadius = 14 + (i % 6) * 4;
      const lifeMs = 5200 + ((i * 137) % 2600);
      const delayMs = ((i * 229) % 2600) + seedOffset * 17;

      list.push({
        id: i,
        startX,
        startY,
        driftX,
        driftY,
        swirlRadius,
        size,
        core: tint.core,
        halo: tint.halo,
        delayMs,
        lifeMs,
      });
    }
    return list;
  }, [count, seedOffset, topBias]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {motes.map((m) => (
        <PollenMote key={`pollen-${m.id}`} {...m} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({});

export default PollenDriftEffect;
