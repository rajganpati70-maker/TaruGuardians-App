// =====================================================
// ULTRA PREMIUM ENERGY ORBS EFFECT
// Pulsing Energy Orbs
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OrbProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  orbitRadius: number;
  orbitSpeed: number;
}

const EnergyOrb: React.FC<OrbProps> = ({ x, y, size, color, delay, orbitRadius, orbitSpeed }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      ]),
    ]);

    const orbit = Animated.loop(Animated.timing(translateX, {
      toValue: Math.cos(0) * orbitRadius, duration: orbitSpeed, useNativeDriver: true
    }));

    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseScale, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulseScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]));

    entrance.start(() => { orbit.start(); pulse.start(); });
    return () => { entrance.stop(); orbit.stop(); pulse.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.orb, {
      left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color,
      transform: [{ translateX }, { translateY }, { scale }, { scale: pulseScale }],
      opacity,
    }]} />
  );
};

const EnergyOrbsEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const orbs = [
    { x: SCREEN_WIDTH * 0.3, y: SCREEN_HEIGHT * 0.3, size: 25, color: Colors.glow.greenGlow, delay: 0, orbitRadius: 40, orbitSpeed: 3000 },
    { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.4, size: 30, color: Colors.tech.neonBlue, delay: 300, orbitRadius: 50, orbitSpeed: 4000 },
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.6, size: 35, color: Colors.accent.softGold, delay: 600, orbitRadius: 60, orbitSpeed: 5000 },
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.7, size: 20, color: Colors.glow.cyanGlow, delay: 900, orbitRadius: 35, orbitSpeed: 3500 },
    { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.2, size: 28, color: Colors.tech.electricBlue, delay: 1200, orbitRadius: 45, orbitSpeed: 4500 },
  ];
  return (
    <View style={styles.container} pointerEvents='none'>
      {orbs.map((orb, i) => <EnergyOrb key={i} {...orb} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  orb: { position: 'absolute', shadowColor: Colors.text.primary, shadowOpacity: 0.9, shadowRadius: 15 },
});

export default EnergyOrbsEffect;