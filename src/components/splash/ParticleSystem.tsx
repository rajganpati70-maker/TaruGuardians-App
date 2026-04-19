// =====================================================
// ULTRA PREMIUM PARTICLE SYSTEM
// Lightweight Ambient Particles with Drift
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  Easing,
} from 'react-native';
import { Colors, AnimationConfig } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleProps {
  index: number;
  initialX: number;
  initialY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const Particle: React.FC<ParticleProps> = ({
  index,
  initialX,
  initialY,
  size,
  color,
  delay,
  duration,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Random drift direction
    const driftX = (Math.random() - 0.5) * 100;
    const driftY = (Math.random() - 0.5) * 150;

    // Staggered start based on index
    const startDelay = delay + Math.random() * 500;

    // Entrance animation
    const entranceSequence = Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.5 + 0.3,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Continuous drift animation
    const driftAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: driftX,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: driftY,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    entranceSequence.start(() => {
      driftAnimation.start();
      pulseAnimation.start();
    });

    return () => {
      entranceSequence.stop();
      driftAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: initialX,
          top: initialY,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface ParticleSystemProps {
  active?: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ active = true }) => {
  const particles = useRef<ParticleProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate particle data
      const particleCount = AnimationConfig.particles.count;
      const colors = Colors.particles.mix;
      
      particles.current = Array.from({ length: particleCount }, (_, index) => ({
        index,
        initialX: Math.random() * SCREEN_WIDTH,
        initialY: Math.random() * SCREEN_HEIGHT,
        size: AnimationConfig.particles.minSize + 
          Math.random() * (AnimationConfig.particles.maxSize - AnimationConfig.particles.minSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: index * AnimationConfig.delay.particle,
        duration: AnimationConfig.particles.minDuration + 
          Math.random() * (AnimationConfig.particles.maxDuration - AnimationConfig.particles.minDuration),
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle, index) => (
        <Particle
          key={index}
          index={particle.index}
          initialX={particle.initialX}
          initialY={particle.initialY}
          size={particle.size}
          color={particle.color}
          delay={particle.delay}
          duration={particle.duration}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    shadowColor: Colors.glow.whiteGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});

export default ParticleSystem;