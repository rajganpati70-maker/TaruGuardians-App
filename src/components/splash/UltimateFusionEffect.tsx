// =====================================================
// ULTRA PREMIUM ULTIMATE FUSION EFFECT
// Complete Nature + Tech Combined Animation System
// Combines all previous effects into ultimate showcase
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =====================================================
// INTEGRATED PARTICLE SYSTEM
// =====================================================

interface IntegratedParticleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  velocity: { x: number; y: number };
  type: 'dust' | 'energy' | 'nature' | 'tech';
}

const IntegratedParticle: React.FC<IntegratedParticleProps> = ({ x, y, size, color, delay, velocity, type }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.sequence([Animated.delay(delay), Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
    ])]);

    const move = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, { toValue: velocity.x * 60, duration: 4000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: velocity.y * 60, duration: 4000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 4000, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ]),
    ]));

    const spin = Animated.loop(Animated.timing(rotate, { toValue: 360, duration: 8000, useNativeDriver: true }));

    entrance.start(() => { move.start(); spin.start(); });
    return () => { entrance.stop(); move.stop(); spin.stop(); };
  }, []);

  const shapes = { dust: 100, energy: 50, nature: 30, tech: 0 };
  return (
    <Animated.View style={[styles.particle, {
      left: x, top: y, width: size, height: size, borderRadius: shapes[type], backgroundColor: color,
      transform: [{ translateX }, { translateY }, { rotate: rotate }, { scale }],
      opacity, shadowColor: type === 'energy' ? Colors.glow.greenGlow : type === 'tech' ? Colors.tech.neonBlue : Colors.text.primary,
      shadowOpacity: type === 'dust' ? 0.3 : 0.7, shadowRadius: type === 'dust' ? 3 : 8,
    }]} />
  );
};

// =====================================================
// INTEGRATED WAVE SYSTEM
// =====================================================

interface IntegratedWaveProps {
  index: number;
  y: number;
  amplitude: number;
  frequency: number;
  color: string;
  phase: 'nature' | 'tech';
}

const IntegratedWave: React.FC<IntegratedWaveProps> = ({ index, y, amplitude, frequency, color, phase }) => {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 200;
    const fade = Animated.sequence([Animated.delay(delay), Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true })]);

    const anim1 = Animated.loop(Animated.timing(wave1, { toValue: 1, duration: 3000 + index * 200, useNativeDriver: false }));
    const anim2 = Animated.loop(Animated.timing(wave2, { toValue: -1, duration: 3000 + index * 200, useNativeDriver: false }));

    fade.start(); anim1.start(); anim2.start();
    return () => { fade.stop(); anim1.stop(); anim2.stop(); };
  }, []);

  const offset1 = wave1.interpolate({ inputRange: [0, 1], outputRange: [-amplitude, amplitude] });
  const offset2 = wave2.interpolate({ inputRange: [0, 1], outputRange: [amplitude, -amplitude] });

  return (
    <Animated.View style={[styles.waveContainer, { top: y, opacity }]}>
      <Animated.View style={[styles.wave, { backgroundColor: color, transform: [{ translateY: offset1 }] }]} />
      <Animated.View style={[styles.wave, { backgroundColor: color, opacity: 0.5, transform: [{ translateY: offset2 }] }]} />
    </Animated.View>
  );
};

// =====================================================
// INTEGRATED GRID SYSTEM
// =====================================================

interface IntegratedGridPointProps {
  x: number;
  y: number;
  delay: number;
  glowType: 'nature' | 'tech' | 'neutral';
}

const IntegratedGridPoint: React.FC<IntegratedGridPointProps> = ({ x, y, delay, glowType }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const colors = { nature: Colors.glow.greenGlow, tech: Colors.tech.neonBlue, neutral: Colors.accent.softGold };
  const color = colors[glowType];

  useEffect(() => {
    const entrance = Animated.sequence([Animated.delay(delay), Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.8, duration: 500, useNativeDriver: true }),
    ])]);

    const beat = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.4, duration: 1000 + delay % 500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1000 + delay % 500, useNativeDriver: true }),
    ]));

    entrance.start(() => beat.start());
    return () => { entrance.stop(); beat.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.gridPoint, {
      left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: color,
      transform: [{ scale }, { scale: pulse }], opacity,
      shadowColor: color, shadowOpacity: 0.9, shadowRadius: 6,
    }]} />
  );
};

// =====================================================
// INTEGRATED CIRCLE SYSTEM
// =====================================================

interface IntegratedCircleProps {
  centerX: number;
  centerY: number;
  radius: number;
  color: string;
  delay: number;
  type: 'ripple' | 'orbit' | 'pulse';
}

const IntegratedCircle: React.FC<IntegratedCircleProps> = ({ centerX, centerY, radius, color, delay, type }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const borderWidth = useRef(new Animated.Value(3)).current;

  useEffect(() => {
    const entrance = Animated.sequence([Animated.delay(delay), Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
    ])]);

    let anim1, anim2;
    if (type === 'ripple') {
      anim1 = Animated.loop(Animated.timing(scale, { toValue: 2.5, duration: 3000, useNativeDriver: true }));
      anim2 = Animated.loop(Animated.timing(opacity, { toValue: 0, duration: 3000, useNativeDriver: true }));
    } else if (type === 'orbit') {
      anim1 = Animated.loop(Animated.timing(rotate, { toValue: 360, duration: 10000, useNativeDriver: true }));
    } else {
      anim1 = Animated.loop(Animated.sequence([
        Animated.timing(borderWidth, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(borderWidth, { toValue: 3, duration: 1500, useNativeDriver: true }),
      ]));
    }

    entrance.start(() => { if (anim1) anim1.start(); if (anim2) anim2.start(); });
    return () => { entrance.stop(); if (anim1) anim1.stop(); if (anim2) anim2.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.integratedCircle, {
      left: centerX - radius, top: centerY - radius, width: radius * 2, height: radius * 2, borderRadius: radius,
      borderColor: color, borderWidth,
      transform: [{ scale }, { rotate: rotate }],
      opacity, shadowColor: color, shadowOpacity: 0.8, shadowRadius: 15,
    }]} />
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const UltimateFusionEffect: React.FC<{ active?: boolean; stage?: number }> = ({ active = true, stage = 0 }) => {
  const [particles, setParticles] = useState<IntegratedParticleProps[]>([]);
  const [gridPoints, setGridPoints] = useState<IntegratedGridPointProps[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: IntegratedParticleProps[] = [];
      const types: ('dust' | 'energy' | 'nature' | 'tech')[] = ['dust', 'energy', 'nature', 'tech'];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT,
          size: 2 + Math.random() * 6, color: Colors.particles.mix[i % 5],
          delay: Math.random() * 3000, velocity: { x: (Math.random() - 0.5), y: (Math.random() - 0.5) },
          type: types[i % 4],
        });
      }
      setParticles(newParticles);

      const newGrid: IntegratedGridPointProps[] = [];
      for (let i = 0; i < 10; i++) for (let j = 0; j < 8; j++) {
        newGrid.push({ x: 30 + i * 45, y: 50 + j * 55, delay: i * 80 + j * 60, glowType: (i + j) % 3 === 0 ? 'nature' : (i + j) % 3 === 1 ? 'tech' : 'neutral' });
      }
      setGridPoints(newGrid);
    }
  }, [active]);

  if (!active) return null;

  const waves: IntegratedWaveProps[] = [
    { index: 0, y: SCREEN_HEIGHT * 0.15, amplitude: 25, frequency: 0.5, color: Colors.glow.greenGlow, phase: 'nature' },
    { index: 1, y: SCREEN_HEIGHT * 0.3, amplitude: 20, frequency: 0.6, color: Colors.tech.neonBlue, phase: 'tech' },
    { index: 2, y: SCREEN_HEIGHT * 0.5, amplitude: 30, frequency: 0.4, color: Colors.accent.softGold, phase: 'nature' },
    { index: 3, y: SCREEN_HEIGHT * 0.7, amplitude: 15, frequency: 0.7, color: Colors.glow.cyanGlow, phase: 'tech' },
  ];

  const circles: IntegratedCircleProps[] = [
    { centerX: SCREEN_WIDTH * 0.2, centerY: SCREEN_HEIGHT * 0.3, radius: 40, color: Colors.glow.greenGlow, delay: 0, type: 'ripple' },
    { centerX: SCREEN_WIDTH * 0.8, centerY: SCREEN_HEIGHT * 0.4, radius: 50, color: Colors.tech.neonBlue, delay: 400, type: 'orbit' },
    { centerX: SCREEN_WIDTH * 0.5, centerY: SCREEN_HEIGHT * 0.6, radius: 60, color: Colors.accent.softGold, delay: 800, type: 'pulse' },
    { centerX: SCREEN_WIDTH * 0.3, centerY: SCREEN_HEIGHT * 0.8, radius: 35, color: Colors.glow.cyanGlow, delay: 1200, type: 'ripple' },
    { centerX: SCREEN_WIDTH * 0.7, centerY: SCREEN_HEIGHT * 0.2, radius: 45, color: Colors.tech.electricBlue, delay: 1600, type: 'orbit' },
  ];

  return (
    <View style={styles.container} pointerEvents='none'>
      {particles.map((p, i) => <IntegratedParticle key={`p-${i}`} {...p} />)}
      {waves.map((w, i) => <IntegratedWave key={`w-${i}`} {...w} />)}
      {gridPoints.map((g, i) => <IntegratedGridPoint key={`g-${i}`} {...g} />)}
      {circles.map((c, i) => <IntegratedCircle key={`c-${i}`} {...c} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  particle: { position: 'absolute' },
  waveContainer: { position: 'absolute', left: 0, right: 0, height: 60, overflow: 'hidden' },
  wave: { position: 'absolute', height: 4, left: 0, right: 0, borderRadius: 2 },
  gridPoint: { position: 'absolute' },
  integratedCircle: { position: 'absolute', backgroundColor: 'transparent' },
});

export default UltimateFusionEffect;