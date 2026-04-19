// =====================================================
// ULTRA PREMIUM MORPHING SHAPES
// Organic to Tech Shape Transforms
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

interface MorphShapeProps {
  index: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
}

const MorphShape: React.FC<MorphShapeProps> = ({
  index,
  startX,
  startY,
  size,
  color,
  delay,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const borderRadius = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
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

    // Morph animation (circle to square and back)
    const morphAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(borderRadius, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(borderRadius, {
          toValue: 50,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 360,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    entranceAnimation.start(() => {
      morphAnimation.start();
      rotateAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      morphAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.morphShape,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius,
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

interface HexagonProps {
  index: number;
}

const Hexagon: React.FC<HexagonProps> = ({ index }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = 500 + index * 300;

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 60,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const fadeInAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: 0.4,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    floatAnimation.start();
    fadeInAnimation.start();

    return () => {
      floatAnimation.stop();
      fadeInAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.hexagon,
        {
          left: (index % 5) * 80 + 50,
          top: Math.floor(index / 5) * 80 + 100,
          transform: [
            { translateY },
            { rotate: rotate },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface MorphingShapesProps {
  active?: boolean;
}

const MorphingShapes: React.FC<MorphingShapesProps> = ({ active = true }) => {
  const shapesRef = useRef<MorphShapeProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate morph shapes
      const shapeCount = 12;
      shapesRef.current = Array.from({ length: shapeCount }, (_, i) => ({
        index: i,
        startX: Math.random() * (SCREEN_WIDTH - 60),
        startY: Math.random() * (SCREEN_HEIGHT - 60),
        size: 30 + Math.random() * 40,
        color: [
          Colors.glow.greenGlow,
          Colors.tech.neonBlue,
          Colors.accent.softGold,
          Colors.glow.cyanGlow,
        ][Math.floor(Math.random() * 4)],
        delay: i * 200,
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Morphing shapes */}
      {shapesRef.current.map((shape, index) => (
        <MorphShape
          key={`morph-${index}`}
          index={shape.index}
          startX={shape.startX}
          startY={shape.startY}
          size={shape.size}
          color={shape.color}
          delay={shape.delay}
        />
      ))}

      {/* Hexagons */}
      {Array.from({ length: 10 }).map((_, index) => (
        <Hexagon key={`hex-${index}`} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  morphShape: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  hexagon: {
    position: 'absolute',
    width: 40,
    height: 46,
    backgroundColor: Colors.tech.neonBlue,
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});

export default MorphingShapes;