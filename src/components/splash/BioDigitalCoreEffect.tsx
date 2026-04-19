// =====================================================
// ULTRA PREMIUM BIO DIGITAL CORE EFFECT
// Nature + Technology Core Visualization
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

interface CoreRingProps {
  index: number;
  size: number;
  color: string;
  delay: number;
}

const CoreRing: React.FC<CoreRingProps> = ({ index, size, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const borderWidth = useRef(new Animated.Value(3)).current;

  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 360,
        duration: 8000 + index * 1000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderWidth, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(borderWidth, {
          toValue: 3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      rotateAnimation.start();
      pulseAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.coreRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          borderWidth,
          transform: [
            { scale },
            { rotate: rotate },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface CoreNodeProps {
  index: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

const CoreNode: React.FC<CoreNodeProps> = ({
  index,
  angle,
  distance,
  size,
  color,
  delay,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;
    const targetX = centerX + Math.cos((angle * Math.PI) / 180) * distance;
    const targetY = centerY + Math.sin((angle * Math.PI) / 180) * distance;

    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Orbit animation
    const orbitAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: targetX - centerX,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: targetY - centerY,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      orbitAnimation.start();
      pulseAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      orbitAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  return (
    <Animated.View
      style={[
        styles.coreNode,
        {
          left: centerX,
          top: centerY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { scale: pulseScale },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface BioDigitalCoreEffectProps {
  active?: boolean;
}

const BioDigitalCoreEffect: React.FC<BioDigitalCoreEffectProps> = ({ active = true }) => {
  if (!active) return null;

  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  // Core rings
  const rings = [
    { size: 60, color: Colors.glow.greenGlow, delay: 0 },
    { size: 100, color: Colors.tech.neonBlue, delay: 200 },
    { size: 150, color: Colors.accent.softGold, delay: 400 },
    { size: 200, color: Colors.glow.cyanGlow, delay: 600 },
    { size: 250, color: Colors.tech.electricBlue, delay: 800 },
  ];

  // Core nodes
  const nodes = [
    { angle: 0, distance: 80, size: 12, color: Colors.glow.greenGlow, delay: 1000 },
    { angle: 72, distance: 80, size: 10, color: Colors.tech.neonBlue, delay: 1100 },
    { angle: 144, distance: 80, size: 12, color: Colors.accent.softGold, delay: 1200 },
    { angle: 216, distance: 80, size: 10, color: Colors.glow.cyanGlow, delay: 1300 },
    { angle: 288, distance: 80, size: 12, color: Colors.tech.electricBlue, delay: 1400 },
    { angle: 36, distance: 130, size: 8, color: Colors.glow.greenGlow, delay: 1500 },
    { angle: 108, distance: 130, size: 10, color: Colors.tech.neonBlue, delay: 1600 },
    { angle: 180, distance: 130, size: 8, color: Colors.accent.softGold, delay: 1700 },
    { angle: 252, distance: 130, size: 10, color: Colors.glow.cyanGlow, delay: 1800 },
    { angle: 324, distance: 130, size: 8, color: Colors.tech.electricBlue, delay: 1900 },
  ];

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Core rings */}
      {rings.map((ring, index) => (
        <CoreRing
          key={`ring-${index}`}
          index={index}
          size={ring.size}
          color={ring.color}
          delay={ring.delay}
        />
      ))}

      {/* Core nodes */}
      {nodes.map((node, index) => (
        <CoreNode
          key={`node-${index}`}
          index={index}
          angle={node.angle}
          distance={node.distance}
          size={node.size}
          color={node.color}
          delay={node.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  coreNode: {
    position: 'absolute',
    marginLeft: -8,
    marginTop: -8,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default BioDigitalCoreEffect;