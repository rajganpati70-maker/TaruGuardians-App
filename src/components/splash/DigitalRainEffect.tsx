// =====================================================
// ULTRA PREMIUM DIGITAL RAIN EFFECT
// Matrix-style Digital Rain
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

interface RainColumnProps {
  x: number;
}

const RainColumn: React.FC<RainColumnProps> = ({ x }) => {
  const translateY = useRef(new Animated.Value(-400)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rain = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: SCREEN_HEIGHT + 400, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(translateY, { toValue: -400, duration: 0, useNativeDriver: true }),
      ])
    );
    rain.start();
    return () => rain.stop();
  }, []);

  const chars = Array.from({ length: 15 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]);

  return (
    <Animated.View style={[styles.column, { left: x, transform: [{ translateY }], opacity }]}>
      {chars.map((c, i) => (
        <Text key={i} style={[styles.char, i === 0 && styles.lead]}>{c}</Text>
      ))}
    </Animated.View>
  );
};

const DigitalRainEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const cols = Math.floor(SCREEN_WIDTH / 18);
  return (
    <View style={styles.container} pointerEvents='none'>
      {Array.from({ length: cols }).map((_, i) => <RainColumn key={i} x={i * 18} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  column: { position: 'absolute', top: 0 },
  char: { fontSize: 14, color: Colors.tech.neonBlue, opacity: 0.6, lineHeight: 18 },
  lead: { color: Colors.glow.greenGlow, opacity: 1, textShadowColor: Colors.glow.greenGlow, textShadowRadius: 4 },
});

export default DigitalRainEffect;