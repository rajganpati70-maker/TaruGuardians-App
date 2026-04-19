// =====================================================
// ULTRA PREMIUM BACKGROUND GRADIENT
// Multi-Layer Gradient System
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  LinearGradient,
} from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BackgroundGradientProps {
  active?: boolean;
}

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({ active = true }) => {
  // Layer animations
  const layer1Opacity = useRef(new Animated.Value(0)).current;
  const layer2Opacity = useRef(new Animated.Value(0)).current;
  const layer3Opacity = useRef(new Animated.Value(0)).current;
  
  // Animated gradient position
  const gradientPosition = useRef(new Animated.Value(0)).current;
  
  // Subtle pulse
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (active) {
      // Layer 1: Deep black to dark green (0-500ms)
      const layer1Animation = Animated.timing(layer1Opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      });

      // Layer 2: Dark green to dark teal (300-800ms)
      const layer2Animation = Animated.sequence([
        Animated.delay(300),
        Animated.timing(layer2Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      // Layer 3: Dark teal to dark midnight (600-1100ms)
      const layer3Animation = Animated.sequence([
        Animated.delay(600),
        Animated.timing(layer3Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      // Continuous subtle pulse
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1.02,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.5,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.3,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Subtle gradient movement
      const gradientAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(gradientPosition, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientPosition, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: false,
          })
        ])
      );

      // Start all animations
      Animated.parallel([
        layer1Animation,
        layer2Animation,
        layer3Animation,
        pulseAnimation,
        gradientAnimation,
      ]).start();

      return () => {
        layer1Animation.stop();
        layer2Animation.stop();
        layer3Animation.stop();
        pulseAnimation.stop();
        gradientAnimation.stop();
      };
    }
  }, [active]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Base layer - solid dark */}
      <View style={styles.baseLayer} />

      {/* Layer 1: Deep black to dark green */}
      <Animated.View style={[styles.gradientLayer, { opacity: layer1Opacity }]}>
        <LinearGradient
          colors={[
            Colors.background.deepBlack,
            Colors.background.darkGreen,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Layer 2: Dark green to dark teal */}
      <Animated.View style={[styles.gradientLayer, { opacity: layer2Opacity }]}>
        <LinearGradient
          colors={[
            Colors.background.darkGreen,
            Colors.background.darkTeal,
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Layer 3: Dark teal to midnight */}
      <Animated.View style={[styles.gradientLayer, { opacity: layer3Opacity }]}>
        <LinearGradient
          colors={[
            Colors.background.darkTeal,
            Colors.background.midnight,
          ]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Ambient glow pulse - center */}
      <Animated.View
        style={[
          styles.centerGlow,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <View style={styles.glowInner} />
      </Animated.View>

      {/* Radial gradient overlay */}
      <View style={styles.radialOverlay}>
        <View style={styles.radialGradient} />
      </View>

      {/* Subtle noise/texture overlay */}
      <View style={styles.textureOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.deepBlack,
  },
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.deepBlack,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  centerGlow: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: Colors.glow.greenSoft,
  },
  glowInner: {
    flex: 1,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: Colors.glow.greenSoft,
  },
  radialOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  radialGradient: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.3,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_WIDTH * 1.6,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: Colors.glow.blueSoft,
    opacity: 0.1,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay.dark40,
    opacity: 0.02,
  },
});

export default BackgroundGradient;