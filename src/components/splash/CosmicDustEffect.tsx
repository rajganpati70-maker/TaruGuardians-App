// =====================================================
// ULTRA PREMIUM COSMIC DUST EFFECT
// Floating Cosmic Dust Particles
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DustParticleProps {
  startX: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const DustParticle: React.FC<DustParticleProps> = ({ startX, startY, size, color, delay, duration }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 500, useNativeDriver: true }),
      ]),
    ]);

    const float = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, { toValue: (Math.random() - 0.5) * 80, duration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: (Math.random() - 0.5) * 80, duration, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 360, duration, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    ]));

    entrance.start(() => float.start());
    return () => { entrance.stop(); float.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.particle, {
      left: startX, top: startY, width: size, height: size, borderRadius: size / 2, backgroundColor: color,
      transform: [{ translateX }, { translateY }, { scale }, { rotate }],
      opacity,
    }]} />
  );
};

const CosmicDustEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const particles = Array.from({ length: 40 }, (_, i) => ({
    startX: Math.random() * SCREEN_WIDTH, startY: Math.random() * SCREEN_HEIGHT,
    size: 2 + Math.random() * 4, color: Colors.particles.mix[Math.floor(Math.random() * 5)],
    delay: Math.random() * 2000, duration: 3000 + Math.random() * 3000,
  }));
  return (
    <View style={styles.container} pointerEvents='none'>
      {particles.map((p, i) => <DustParticle key={i} {...p} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  particle: { position: 'absolute', shadowColor: Colors.text.primary, shadowOpacity: 0.4, shadowRadius: 3 },
});

export default CosmicDustEffect;