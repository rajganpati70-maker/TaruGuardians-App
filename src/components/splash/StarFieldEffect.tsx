// =====================================================
// ULTRA PREMIUM STAR FIELD EFFECT
// Twinkling Star Field
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

interface StarProps {
  x: number;
  y: number;
  size: number;
  delay: number;
  twinkleSpeed: number;
}

const Star: React.FC<StarProps> = ({ x, y, size, delay, twinkleSpeed }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Twinkle animation
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      twinkleAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      twinkleAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.text.primary,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

interface ShootingStarProps {
  delay: number;
}

const ShootingStar: React.FC<ShootingStarProps> = ({ delay }) => {
  const translateX = useRef(new Animated.Value(-100)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const shootAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH + 200,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT + 200,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    shootAnimation.start();

    return () => {
      shootAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.shootingStar,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.shootingStarTail} />
    </Animated.View>
  );
};

interface StarFieldEffectProps {
  active?: boolean;
}

const StarFieldEffect: React.FC<StarFieldEffectProps> = ({ active = true }) => {
  const starsRef = useRef<StarProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate star positions
      const starCount = 100;
      starsRef.current = Array.from({ length: starCount }, (_, i) => ({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 2000,
        twinkleSpeed: 1000 + Math.random() * 3000,
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Static stars */}
      {starsRef.current.map((star, index) => (
        <Star
          key={`star-${index}`}
          x={star.x}
          y={star.y}
          size={star.size}
          delay={star.delay}
          twinkleSpeed={star.twinkleSpeed}
        />
      ))}

      {/* Shooting stars */}
      <ShootingStar delay={3000} />
      <ShootingStar delay={7000} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  shootingStar: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.primary,
    top: 0,
    left: 0,
  },
  shootingStarTail: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: 2,
    height: 30,
    backgroundColor: Colors.text.primary,
    transform: [{ rotate: '-45deg' }],
    opacity: 0.5,
  },
});

export default StarFieldEffect;