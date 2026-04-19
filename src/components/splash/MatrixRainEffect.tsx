// =====================================================
// ULTRA PREMIUM MATRIX RAIN EFFECT
// Digital Matrix Rain
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  Text,
} from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatrixColumnProps {
  index: number;
}

const MatrixColumn: React.FC<MatrixColumnProps> = ({ index }) => {
  const translateY = useRef(new Animated.Value(-300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const charsRef = useRef<string[]>([]);

  useEffect(() => {
    // Generate random characters
    charsRef.current = Array.from({ length: 20 }, () => 
      String.fromCharCode(0x30A0 + Math.random() * 96)
    );

    const columnWidth = 20;
    const startX = index * columnWidth;

    const rainAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT + 300,
            duration: 5000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -300,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    rainAnimation.start();

    return () => {
      rainAnimation.stop();
    };
  }, []);

  const chars = ['0', '1', '雨', '風', '雷', '電', '光', '影', '魂', '魄'];

  return (
    <Animated.View
      style={[
        styles.matrixColumn,
        {
          left: index * 20,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {chars.map((char, charIndex) => (
        <Text
          key={`char-${charIndex}`}
          style={[
            styles.matrixChar,
            charIndex === 0 && styles.matrixCharLeading,
          ]}
        >
          {char}
        </Text>
      ))}
    </Animated.View>
  );
};

interface MatrixRainEffectProps {
  active?: boolean;
}

const MatrixRainEffect: React.FC<MatrixRainEffectProps> = ({ active = true }) => {
  if (!active) return null;

  const columnCount = Math.floor(SCREEN_WIDTH / 20);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: columnCount }).map((_, index) => (
        <MatrixColumn key={`col-${index}`} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  matrixColumn: {
    position: 'absolute',
    top: 0,
  },
  matrixChar: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: Colors.tech.neonBlue,
    opacity: 0.7,
    lineHeight: 20,
  },
  matrixCharLeading: {
    color: Colors.glow.greenGlow,
    opacity: 1,
    textShadowColor: Colors.glow.greenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default MatrixRainEffect;