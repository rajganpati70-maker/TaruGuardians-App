// =====================================================
// ULTRA PREMIUM RIPPLE EFFECT
// Expanding Ripple Waves
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

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const Ripple: React.FC<RippleProps> = ({ x, y, size, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const borderWidth = useRef(new Animated.Value(3)).current;

  useEffect(() => {
    const rippleAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 3,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(borderWidth, {
            toValue: 0,
            duration: 2500,
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
          Animated.timing(borderWidth, {
            toValue: 3,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    rippleAnimation.start();

    return () => {
      rippleAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          borderWidth,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

interface RippleCenterProps {
  x: number;
  y: number;
}

const RippleCenter: React.FC<RippleCenterProps> = ({ x, y }) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeInAnimation = Animated.timing(opacity, {
      toValue: 0.8,
      duration: 1000,
      useNativeDriver: true,
    });

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    fadeInAnimation.start();
    pulseAnimation.start();

    return () => {
      fadeInAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.rippleCenter,
        {
          left: x - 15,
          top: y - 15,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: Colors.tech.neonBlue,
          transform: [{ scale: scale }, { scale: pulseScale }],
          opacity,
        },
      ]}
    />
  );
};

interface RippleEffectProps {
  active?: boolean;
}

const RippleEffect: React.FC<RippleEffectProps> = ({ active = true }) => {
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  if (!active) return null;

  const ripples = [
    { x: centerX, y: centerY, size: 80, color: Colors.tech.neonBlue, delay: 0 },
    { x: centerX, y: centerY, size: 120, color: Colors.glow.greenGlow, delay: 400 },
    { x: centerX, y: centerY, size: 160, color: Colors.accent.softGold, delay: 800 },
    { x: centerX, y: centerY, size: 200, color: Colors.tech.cyan, delay: 1200 },
    { x: centerX, y: centerY, size: 240, color: Colors.tech.neonBlue, delay: 1600 },
  ];

  return (
    <View style={styles.container} pointerEvents='none'>
      {ripples.map((ripple, index) => (
        <Ripple
          key={`ripple-${index}`}
          x={ripple.x}
          y={ripple.y}
          size={ripple.size}
          color={ripple.color}
          delay={ripple.delay}
        />
      ))}
      <RippleCenter x={centerX} y={centerY} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  ripple: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  rippleCenter: {
    position: 'absolute',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
});

export default RippleEffect;