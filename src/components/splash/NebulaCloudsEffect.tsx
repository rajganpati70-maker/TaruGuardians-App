// =====================================================
// ULTRA PREMIUM NEBULA CLOUDS EFFECT
// Colorful Nebula Cloud Formations
// =====================================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NebulaCloudProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const NebulaCloud: React.FC<NebulaCloudProps> = ({ x, y, size, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.25, duration: 2000, useNativeDriver: true }),
      ]),
    ]);

    const drift = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, { toValue: 30, duration: 5000, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 15, duration: 5000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(translateX, { toValue: -30, duration: 5000, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: -15, duration: 5000, useNativeDriver: true }),
      ]),
    ]));

    entrance.start(() => drift.start());
    return () => { entrance.stop(); drift.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.cloud, {
      left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color,
      transform: [{ translateX }, { rotate }, { scale }],
      opacity,
    }]} />
  );
};

const NebulaCloudsEffect: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;
  const clouds = [
    { x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.2, size: 180, color: Colors.glow.greenSoft, delay: 0 },
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.15, size: 220, color: Colors.glow.blueSoft, delay: 400 },
    { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.3, size: 160, color: Colors.glow.goldSoft, delay: 800 },
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.6, size: 200, color: Colors.overlay.green20, delay: 1200 },
    { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.7, size: 190, color: Colors.overlay.blue20, delay: 1600 },
    { x: SCREEN_WIDTH * 0.4, y: SCREEN_HEIGHT * 0.8, size: 170, color: Colors.overlay.gold20, delay: 2000 },
  ];
  return (
    <View style={styles.container} pointerEvents='none'>
      {clouds.map((c, i) => <NebulaCloud key={i} {...c} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  cloud: { position: 'absolute', shadowColor: Colors.text.primary, shadowOpacity: 0.2, shadowRadius: 80 },
});

export default NebulaCloudsEffect;