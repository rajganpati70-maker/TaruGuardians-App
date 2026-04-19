// =====================================================
// ULTRA PREMIUM GEOMETRIC PATTERN
// Intricate Geometric Shapes
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

interface TriangleProps {
  index: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
}

const Triangle: React.FC<TriangleProps> = ({
  index,
  x,
  y,
  size,
  color,
  delay,
  rotation,
}) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 360,
        duration: 10000 + index * 1000,
        useNativeDriver: true,
      })
    );

    entranceAnimation.start(() => {
      rotateAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.triangle,
        {
          left: x,
          top: y,
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size * 0.866,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [
            { rotate: rotate },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface DiamondProps {
  index: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const Diamond: React.FC<DiamondProps> = ({ index, x, y, size, color, delay }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 180,
          duration: 3000 + index * 500,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 3000 + index * 500,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      rotateAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.diamond,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          transform: [
            { rotate: rotate },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface CirclePatternProps {
  index: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  delay: number;
}

const CirclePattern: React.FC<CirclePatternProps> = ({
  index,
  x,
  y,
  radius,
  color,
  delay,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const borderWidth = useRef(new Animated.Value(2)).current;

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
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderWidth, {
          toValue: 4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(borderWidth, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      pulseAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.circlePattern,
        {
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          borderColor: color,
          borderWidth,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

interface GeometricPatternProps {
  active?: boolean;
}

const GeometricPattern: React.FC<GeometricPatternProps> = ({ active = true }) => {
  const trianglesRef = useRef<TriangleProps[]>([]);
  const diamondsRef = useRef<DiamondProps[]>([]);
  const circlesRef = useRef<CirclePatternProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate triangles
      const triangleCount = 15;
      trianglesRef.current = Array.from({ length: triangleCount }, (_, i) => ({
        index: i,
        x: Math.random() * (SCREEN_WIDTH - 50),
        y: Math.random() * (SCREEN_HEIGHT - 50),
        size: 20 + Math.random() * 30,
        color: [
          Colors.tech.neonBlue,
          Colors.glow.greenGlow,
          Colors.accent.softGold,
        ][Math.floor(Math.random() * 3)],
        delay: i * 100,
        rotation: Math.random() * 360,
      }));

      // Generate diamonds
      const diamondCount = 10;
      diamondsRef.current = Array.from({ length: diamondCount }, (_, i) => ({
        index: i,
        x: Math.random() * (SCREEN_WIDTH - 40),
        y: Math.random() * (SCREEN_HEIGHT - 40),
        size: 15 + Math.random() * 25,
        color: [
          Colors.glow.cyanGlow,
          Colors.tech.electricBlue,
          Colors.glow.greenGlow,
        ][Math.floor(Math.random() * 3)],
        delay: 500 + i * 150,
      }));

      // Generate circle patterns
      const circleCount = 8;
      circlesRef.current = Array.from({ length: circleCount }, (_, i) => ({
        index: i,
        x: (i + 1) * (SCREEN_WIDTH / (circleCount + 1)),
        y: (i + 1) * (SCREEN_HEIGHT / (circleCount + 1)),
        radius: 30 + Math.random() * 40,
        color: [
          Colors.tech.neonBlue,
          Colors.accent.softGold,
          Colors.glow.blueGlow,
        ][Math.floor(Math.random() * 3)],
        delay: 1000 + i * 200,
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Triangles */}
      {trianglesRef.current.map((triangle, index) => (
        <Triangle
          key={`triangle-${index}`}
          index={triangle.index}
          x={triangle.x}
          y={triangle.y}
          size={triangle.size}
          color={triangle.color}
          delay={triangle.delay}
          rotation={triangle.rotation}
        />
      ))}

      {/* Diamonds */}
      {diamondsRef.current.map((diamond, index) => (
        <Diamond
          key={`diamond-${index}`}
          index={diamond.index}
          x={diamond.x}
          y={diamond.y}
          size={diamond.size}
          color={diamond.color}
          delay={diamond.delay}
        />
      ))}

      {/* Circle patterns */}
      {circlesRef.current.map((circle, index) => (
        <CirclePattern
          key={`circle-${index}`}
          index={circle.index}
          x={circle.x}
          y={circle.y}
          radius={circle.radius}
          color={circle.color}
          delay={circle.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  triangle: {
    position: 'absolute',
  },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  circlePattern: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

export default GeometricPattern;