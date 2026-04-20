// =====================================================
// ULTRA PREMIUM ADVANCED PARTICLE SYSTEM
// Complex Physics Particles
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

interface AdvancedParticleProps {
  index: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const AdvancedParticle: React.FC<AdvancedParticleProps> = ({
  startX,
  startY,
  targetX,
  targetY,
  size,
  color,
  delay,
  duration,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Move to target with rotation
    const moveAnimation = Animated.timing(translateX, {
      toValue: targetX - startX,
      duration,
      useNativeDriver: true,
    });

    const moveYAnimation = Animated.timing(translateY, {
      toValue: targetY - startY,
      duration,
      useNativeDriver: true,
    });

    const rotateAnimation = Animated.timing(rotate, {
      toValue: 360,
      duration,
      useNativeDriver: true,
    });

    // Loop
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([moveAnimation, moveYAnimation, rotateAnimation]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    entranceAnimation.start(() => {
      loopAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      loopAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate: rotate },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface ParticleClusterProps {
  centerX: number;
  centerY: number;
  count: number;
}

const ParticleCluster: React.FC<ParticleClusterProps> = ({ centerX, centerY, count }) => {
  const clusterRef = useRef<AdvancedParticleProps[]>([]);

  useEffect(() => {
    clusterRef.current = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 30 + Math.random() * 50;
      const targetX = centerX + Math.cos(angle) * radius;
      const targetY = centerY + Math.sin(angle) * radius;
      
      return {
        index: i,
        startX: centerX,
        startY: centerY,
        targetX,
        targetY,
        size: 4 + Math.random() * 4,
        color: Colors.particles.mix[Math.floor(Math.random() * Colors.particles.mix.length)],
        delay: i * 50,
        duration: 2000 + Math.random() * 2000,
      };
    });
  }, []);

  return (
    <>
      {clusterRef.current.map((particle, index) => (
        <AdvancedParticle
          key={`cluster-${index}`}
          index={particle.index}
          startX={particle.startX}
          startY={particle.startY}
          targetX={particle.targetX}
          targetY={particle.targetY}
          size={particle.size}
          color={particle.color}
          delay={particle.delay}
          duration={particle.duration}
        />
      ))}
    </>
  );
};

interface AdvancedParticleSystemProps {
  active?: boolean;
}

const AdvancedParticleSystem: React.FC<AdvancedParticleSystemProps> = ({ active = true }) => {
  if (!active) return null;

  // Create multiple particle clusters
  const clusters = [
    { centerX: SCREEN_WIDTH * 0.2, centerY: SCREEN_HEIGHT * 0.3, count: 15 },
    { centerX: SCREEN_WIDTH * 0.8, centerY: SCREEN_HEIGHT * 0.4, count: 20 },
    { centerX: SCREEN_WIDTH * 0.5, centerY: SCREEN_HEIGHT * 0.7, count: 12 },
    { centerX: SCREEN_WIDTH * 0.3, centerY: SCREEN_HEIGHT * 0.8, count: 10 },
    { centerX: SCREEN_WIDTH * 0.7, centerY: SCREEN_HEIGHT * 0.2, count: 18 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {clusters.map((cluster, index) => (
        <ParticleCluster
          key={`cluster-${index}`}
          centerX={cluster.centerX}
          centerY={cluster.centerY}
          count={cluster.count}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
});

export default AdvancedParticleSystem;