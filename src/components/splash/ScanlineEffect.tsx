// =====================================================
// ULTRA PREMIUM SCANLINE EFFECT
// Retro Scanline Overlay
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

interface ScanlineRowProps {
  index: number;
}

const ScanlineRow: React.FC<ScanlineRowProps> = ({ index }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 100 + Math.random() * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.05,
          duration: 100 + Math.random() * 100,
          useNativeDriver: true,
        }),
      ])
    );

    fadeAnimation.start();

    return () => {
      fadeAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.scanlineRow,
        {
          top: index * 4,
          opacity,
        },
      ]}
    />
  );
};

interface FlickerOverlayProps {
  active?: boolean;
}

const FlickerOverlay: React.FC<FlickerOverlayProps> = ({ active = true }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      const flickerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.95,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.98,
            duration: 30,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );

      flickerAnimation.start();

      return () => {
        flickerAnimation.stop();
      };
    }
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.flickerOverlay,
        { opacity },
      ]}
      pointerEvents='none'
    />
  );
};

interface ScanlineEffectProps {
  active?: boolean;
}

const ScanlineEffect: React.FC<ScanlineEffectProps> = ({ active = true }) => {
  if (!active) return null;

  const rowCount = Math.ceil(SCREEN_HEIGHT / 4);

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Scanline rows */}
      {Array.from({ length: rowCount }).map((_, index) => (
        <ScanlineRow key={`scanline-${index}`} index={index} />
      ))}

      {/* Flicker overlay */}
      <FlickerOverlay active={active} />

      {/* Vignette effect */}
      <View style={styles.vignetteOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  scanlineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.background.deepBlack,
  },
  flickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.text.primary,
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowColor: Colors.background.deepBlack,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
});

export default ScanlineEffect;