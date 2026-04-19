// =====================================================
// ULTRA PREMIUM WAVEFORM EFFECT
// Flowing Waveform Animations
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

interface WaveProps {
  index: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
}

const Wave: React.FC<WaveProps> = ({ index, amplitude, frequency, speed, color }) => {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const waveOffset = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave movement
    const moveAnimation = Animated.loop(
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: speed,
        useNativeDriver: true,
      })
    );

    // Opacity fade in
    const fadeInAnimation = Animated.timing(opacity, {
      toValue: 0.3,
      duration: 1000,
      delay: index * 200,
      useNativeDriver: true,
    });

    moveAnimation.start();
    fadeInAnimation.start();

    return () => {
      moveAnimation.stop();
      fadeInAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.wave,
        {
          top: SCREEN_HEIGHT * 0.3 + index * 40,
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      <View style={[styles.waveLine, { backgroundColor: color }]} />
    </Animated.View>
  );
};

interface WaveformBarProps {
  index: number;
  height: number;
  color: string;
  delay: number;
}

const WaveformBar: React.FC<WaveformBarProps> = ({ index, height, color, delay }) => {
  const scaleY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateBar = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 500 + Math.random() * 500,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleY, {
            toValue: 0.2,
            duration: 500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animateBar.start();

    return () => {
      animateBar.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: height,
          backgroundColor: color,
          transform: [{ scaleY }],
          opacity,
        },
      ]}
    />
  );
};

interface WaveformEffectProps {
  active?: boolean;
}

const WaveformEffect: React.FC<WaveformEffectProps> = ({ active = true }) => {
  const barsRef = useRef<WaveformBarProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate waveform bars
      const barCount = 30;
      barsRef.current = Array.from({ length: barCount }, (_, i) => ({
        index: i,
        height: 20 + Math.random() * 60,
        color: [
          Colors.tech.neonBlue,
          Colors.glow.greenGlow,
          Colors.accent.softGold,
        ][Math.floor(Math.random() * 3)],
        delay: i * 50,
      }));
    }
  }, [active]);

  if (!active) return null;

  const waves = [
    { amplitude: 30, frequency: 0.5, speed: 8000, color: Colors.glow.greenGlow },
    { amplitude: 20, frequency: 0.7, speed: 10000, color: Colors.tech.neonBlue },
    { amplitude: 25, frequency: 0.6, speed: 12000, color: Colors.accent.softGold },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Wave animations */}
      {waves.map((wave, index) => (
        <Wave
          key={`wave-${index}`}
          index={index}
          amplitude={wave.amplitude}
          frequency={wave.frequency}
          speed={wave.speed}
          color={wave.color}
        />
      ))}

      {/* Waveform bars at bottom */}
      <View style={styles.barsContainer}>
        {barsRef.current.map((bar, index) => (
          <WaveformBar
            key={`bar-${index}`}
            index={bar.index}
            height={bar.height}
            color={bar.color}
            delay={bar.delay}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    overflow: 'hidden',
  },
  waveLine: {
    height: '100%',
    width: SCREEN_WIDTH * 2,
  },
  barsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 80,
  },
  bar: {
    width: 6,
    marginHorizontal: 2,
    borderRadius: 3,
  },
});

export default WaveformEffect;