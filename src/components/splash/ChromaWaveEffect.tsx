// =====================================================
// ULTRA PREMIUM CHROMA WAVE EFFECT
// Color Shifting Wave Animation
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WaveProps {
  index: number;
  y: number;
  color: string;
  delay: number;
}

const ChromaWave: React.FC<WaveProps> = ({ index, y, color, delay }) => {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const move = Animated.loop(Animated.timing(translateX, {
      toValue: SCREEN_WIDTH, duration: 6000 + index * 500, useNativeDriver: true
    }));
    const fade = Animated.loop(Animated.sequence([
      Animated.delay(index * 300), Animated.timing(opacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
    ]));
    const undulate = Animated.loop(Animated.timing(wave, { toValue: 1, duration: 2000, useNativeDriver: false }));
    move.start(); fade.start(); undulate.start();
    return () => { move.stop(); fade.stop(); undulate.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.wave, {
      top: y, left: translateX, backgroundColor: color, opacity,
      transform: [{ scaleX: 3 }],
    }]} />
  );
};

const ChromaWaveEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const waves = [
    { index: 0, y: SCREEN_HEIGHT * 0.2, color: Colors.glow.greenGlow, delay: 0 },
    { index: 1, y: SCREEN_HEIGHT * 0.35, color: Colors.tech.neonBlue, delay: 200 },
    { index: 2, y: SCREEN_HEIGHT * 0.5, color: Colors.accent.softGold, delay: 400 },
    { index: 3, y: SCREEN_HEIGHT * 0.65, color: Colors.glow.cyanGlow, delay: 600 },
    { index: 4, y: SCREEN_HEIGHT * 0.8, color: Colors.tech.electricBlue, delay: 800 },
  ];
  return (
    <View style={styles.container} pointerEvents='none'>
      {waves.map((w, i) => <ChromaWave key={i} {...w} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  wave: { position: 'absolute', height: 4, width: SCREEN_WIDTH, borderRadius: 2 },
});

export default ChromaWaveEffect;