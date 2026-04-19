// =====================================================
// ULTRA PREMIUM NEBULA EFFECT
// Cosmic Nebula Clouds
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

interface NebulaCloudProps {
  index: number;
  size: number;
  color: string;
  delay: number;
}

const NebulaCloud: React.FC<NebulaCloudProps> = ({ index, size, color, delay }) => {
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
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Float animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 30 + Math.random() * 20,
            duration: 5000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20 + Math.random() * 20,
            duration: 5000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -30 - Math.random() * 20,
            duration: 5000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20 - Math.random() * 20,
            duration: 5000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Rotation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 360,
        duration: 20000 + index * 5000,
        useNativeDriver: true,
      })
    );

    entranceAnimation.start(() => {
      floatAnimation.start();
      rotateAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      floatAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.nebulaCloud,
        {
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

interface NebulaBurstProps {
  index: number;
}

const NebulaBurst: React.FC<NebulaBurstProps> = ({ index }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = 500 + index * 400;

    const burstAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 4000,
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
        ]),
      ])
    );

    burstAnimation.start();

    return () => {
      burstAnimation.stop();
    };
  }, []);

  const colors = [
    Colors.glow.greenGlow,
    Colors.tech.neonBlue,
    Colors.accent.softGold,
    Colors.glow.cyanGlow,
  ];

  return (
    <Animated.View
      style={[
        styles.nebulaBurst,
        {
          left: (index % 4) * (SCREEN_WIDTH / 4) + SCREEN_WIDTH / 8 - 30,
          top: Math.floor(index / 4) * 150 + 100,
          backgroundColor: colors[index % 4],
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

interface NebulaEffectProps {
  active?: boolean;
}

const NebulaEffect: React.FC<NebulaEffectProps> = ({ active = true }) => {
  const cloudsRef = useRef<NebulaCloudProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate nebula clouds
      cloudsRef.current = Array.from({ length: 8 }, (_, i) => ({
        index: i,
        size: 100 + Math.random() * 200,
        color: [
          Colors.glow.greenSoft,
          Colors.glow.blueSoft,
          Colors.glow.goldSoft,
          Colors.overlay.green20,
          Colors.overlay.blue20,
        ][Math.floor(Math.random() * 5)],
        delay: i * 300,
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Nebula clouds */}
      {cloudsRef.current.map((cloud, index) => (
        <NebulaCloud
          key={`cloud-${index}`}
          index={cloud.index}
          size={cloud.size}
          color={cloud.color}
          delay={cloud.delay}
        />
      ))}

      {/* Nebula bursts */}
      {Array.from({ length: 8 }).map((_, index) => (
        <NebulaBurst key={`burst-${index}`} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  nebulaCloud: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
  },
  nebulaBurst: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default NebulaEffect;