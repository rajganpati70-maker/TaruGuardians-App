// =====================================================
// ULTRA PREMIUM RING PULSE EFFECT
// Expanding Pulse Rings
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

interface PulseRingProps {
  size: number;
  color: string;
  delay: number;
}

const PulseRing: React.FC<PulseRingProps> = ({ size, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const borderWidth = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(borderWidth, {
            toValue: 1,
            duration: 3000,
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
            toValue: 4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
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

interface ConcentricRingProps {
  centerX: number;
  centerY: number;
  color: string;
}

const ConcentricRing: React.FC<ConcentricRingProps> = ({ centerX, centerY, color }) => {
  const ringsRef = useRef<{ scale: Animated.Value; opacity: Animated.Value }[]>([]);

  useEffect(() => {
    // Initialize rings
    ringsRef.current = Array.from({ length: 5 }, () => ({
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(0),
    }));

    // Animate each ring with delay
    ringsRef.current.forEach((ring, index) => {
      const delay = index * 300;
      
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(ring.scale, {
              toValue: 2,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ring.scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.concentricContainer} pointerEvents="none">
      {ringsRef.current.map((ring, index) => (
        <Animated.View
          key={`concentric-${index}`}
          style={[
            styles.concentricRing,
            {
              left: centerX - 50 - index * 30,
              top: centerY - 50 - index * 30,
              width: 100 + index * 60,
              height: 100 + index * 60,
              borderRadius: 50 + index * 30,
              borderColor: color,
              transform: [{ scale: ring.scale }],
              opacity: ring.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

interface RingPulseEffectProps {
  active?: boolean;
}

const RingPulseEffect: React.FC<RingPulseEffectProps> = ({ active = true }) => {
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Single pulse rings */}
      <PulseRing size={100} color={Colors.tech.neonBlue} delay={0} />
      <PulseRing size={150} color={Colors.glow.greenGlow} delay={500} />
      <PulseRing size={200} color={Colors.accent.softGold} delay={1000} />
      <PulseRing size={250} color={Colors.tech.cyan} delay={1500} />

      {/* Concentric rings from center */}
      <ConcentricRing centerX={centerX} centerY={centerY} color={Colors.tech.neonBlue} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  concentricContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  concentricRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});

export default RingPulseEffect;