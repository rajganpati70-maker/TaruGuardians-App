// =====================================================
// ULTRA PREMIUM VORTEX EFFECT
// Spiraling Vortex Animation
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SpiralArmProps {
  index: number;
  length: number;
  color: string;
  delay: number;
}

const SpiralArm: React.FC<SpiralArmProps> = ({ index, length, color, delay }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ]),
    ]);

    const spin = Animated.loop(Animated.timing(rotate, {
      toValue: 360, duration: 8000 + index * 500, useNativeDriver: true
    }));

    entrance.start(() => spin.start());
    return () => { entrance.stop(); spin.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.arm, {
      width: length, height: 3, backgroundColor: color,
      transform: [{ rotate: rotate }, { scale }],
      opacity,
    }]} />
  );
};

const VortexEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const arms = [
    { index: 0, length: 150, color: Colors.glow.greenGlow, delay: 0 },
    { index: 1, length: 180, color: Colors.tech.neonBlue, delay: 200 },
    { index: 2, length: 160, color: Colors.accent.softGold, delay: 400 },
    { index: 3, length: 200, color: Colors.glow.cyanGlow, delay: 600 },
    { index: 4, length: 140, color: Colors.tech.electricBlue, delay: 800 },
    { index: 5, length: 190, color: Colors.glow.greenGlow, delay: 1000 },
  ];
  return (
    <View style={styles.container} pointerEvents='none'>
      <View style={styles.center}>
        {arms.map((arm, i) => <SpiralArm key={i} {...arm} />)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  center: { width: 0, height: 0 },
  arm: { position: 'absolute', transformOrigin: 'left center', borderRadius: 2 },
});

export default VortexEffect;