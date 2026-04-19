// =====================================================
// ULTRA PREMIUM GLOW EFFECTS
// Radial Glow, Floating Orbs
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

interface FloatingOrbProps {
  index: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({
  index,
  startX,
  startY,
  size,
  color,
  delay,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Float animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30 - Math.random() * 20,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 40,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    entranceAnimation.start(() => {
      floatAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      floatAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <View style={[styles.orbInner, { width: size * 0.6, height: size * 0.6 }]} />
    </Animated.View>
  );
};

interface RadialGlowProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const RadialGlow: React.FC<RadialGlowProps> = ({ x, y, size, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Initial entrance
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    glowAnimation.start();

    return () => {
      glowAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.radialGlow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x - size / 2,
          top: y - size / 2,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

interface GlowEffectsProps {
  active?: boolean;
}

const GlowEffects: React.FC<GlowEffectsProps> = ({ active = true }) => {
  const orbsRef = useRef<FloatingOrbProps[]>([]);
  const glowsRef = useRef<RadialGlowProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate floating orbs
      orbsRef.current = Array.from({ length: 8 }, (_, i) => ({
        index: i,
        startX: Math.random() * SCREEN_WIDTH * 0.8 + SCREEN_WIDTH * 0.1,
        startY: Math.random() * SCREEN_HEIGHT * 0.8 + SCREEN_HEIGHT * 0.1,
        size: 20 + Math.random() * 40,
        color: [
          Colors.glow.greenGlow,
          Colors.glow.blueGlow,
          Colors.glow.cyanGlow,
          Colors.accent.softGold,
        ][Math.floor(Math.random() * 4)],
        delay: i * 200,
      }));

      // Generate radial glows
      glowsRef.current = [
        { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.3, size: 150, color: Colors.glow.greenSoft, delay: 0 },
        { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.2, size: 200, color: Colors.glow.blueSoft, delay: 500 },
        { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.7, size: 180, color: Colors.glow.goldSoft, delay: 1000 },
      ];
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Radial glows */}
      {glowsRef.current.map((glow, index) => (
        <RadialGlow
          key={`glow-${index}`}
          x={glow.x}
          y={glow.y}
          size={glow.size}
          color={glow.color}
          delay={glow.delay}
        />
      ))}

      {/* Floating orbs */}
      {orbsRef.current.map((orb, index) => (
        <FloatingOrb
          key={`orb-${index}`}
          index={orb.index}
          startX={orb.startX}
          startY={orb.startY}
          size={orb.size}
          color={orb.color}
          delay={orb.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  orbInner: {
    borderRadius: 100,
    backgroundColor: Colors.text.primary,
    opacity: 0.8,
  },
  radialGlow: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
});

export default GlowEffects;