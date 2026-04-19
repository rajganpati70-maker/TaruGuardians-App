// =====================================================
// ULTRA PREMIUM AURORA BOREALIS EFFECT
// Northern Lights Effect
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraWaveProps {
  index: number;
  color: string;
}

const AuroraWave: React.FC<AuroraWaveProps> = ({ index, color }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 500;

    // Horizontal wave movement
    const waveAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 50,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 0.6,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -50,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 0.3,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Fade in
    const fadeInAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 0.4,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);

    waveAnimation.start();
    fadeInAnimation.start();

    return () => {
      waveAnimation.stop();
      fadeInAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.auroraWave,
        {
          backgroundColor: color,
          transform: [
            { translateX },
            { scaleY },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface AuroraBurstProps {
  index: number;
}

const AuroraBurst: React.FC<AuroraBurstProps> = ({ index }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = 1000 + index * 800;

    const burstAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 180,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    burstAnimation.start();

    return () => {
      burstAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.auroraBurst,
        {
          left: (index % 3) * (SCREEN_WIDTH / 3) + SCREEN_WIDTH / 6 - 50,
          top: 50 + Math.floor(index / 3) * 100,
          transform: [
            { scale },
            { rotate: rotate },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface AuroraBorealisEffectProps {
  active?: boolean;
}

const AuroraBorealisEffect: React.FC<AuroraBorealisEffectProps> = ({ active = true }) => {
  if (!active) return null;

  const auroraColors = [
    Colors.glow.greenGlow,
    Colors.tech.cyan,
    Colors.glow.blueGlow,
    Colors.glow.greenGlow,
  ];

  const waves = auroraColors.map((color, index) => (
    <AuroraWave key={`wave-${index}`} index={index} color={color} />
  ));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Aurora waves */}
      {waves}

      {/* Aurora bursts */}
      {Array.from({ length: 6 }).map((_, index) => (
        <AuroraBurst key={`burst-${index}`} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: '10%',
    height: '40%',
  },
  auroraWave: {
    position: 'absolute',
    left: -50,
    right: -50,
    top: 0,
    bottom: 0,
    borderRadius: 200,
  },
  auroraBurst: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.glow.greenGlow,
  },
});

export default AuroraBorealisEffect;