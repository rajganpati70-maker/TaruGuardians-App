// =====================================================
// ULTRA PREMIUM LIGHT BEAM EFFECT
// Cinematic Light Beams and Rays
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

interface LightBeamProps {
  index: number;
  angle: number;
  width: number;
  color: string;
  delay: number;
}

const LightBeam: React.FC<LightBeamProps> = ({
  index,
  angle,
  width,
  color,
  delay,
}) => {
  const translateY = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const beamAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 4000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -SCREEN_HEIGHT,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    beamAnimation.start();

    return () => {
      beamAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.lightBeam,
        {
          width,
          backgroundColor: color,
          transform: [
            { rotate: `${angle}deg` },
            { translateY },
            { scaleX },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface LightRayProps {
  index: number;
}

const LightRay: React.FC<LightRayProps> = ({ index }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 300;
    
    const fadeInAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.3,
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

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 360,
        duration: 20000 + index * 2000,
        useNativeDriver: true,
      })
    );

    fadeInAnimation.start();
    rotateAnimation.start();

    return () => {
      fadeInAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.lightRay,
        {
          transform: [
            { rotate: rotate },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.rayLine} />
    </Animated.View>
  );
};

interface LightBeamEffectProps {
  active?: boolean;
}

const LightBeamEffect: React.FC<LightBeamEffectProps> = ({ active = true }) => {
  if (!active) return null;

  const beams = [
    { angle: -30, width: 60, color: Colors.glow.greenGlow, delay: 0 },
    { angle: 15, width: 80, color: Colors.tech.neonBlue, delay: 500 },
    { angle: -60, width: 50, color: Colors.accent.softGold, delay: 1000 },
    { angle: 45, width: 70, color: Colors.glow.cyanGlow, delay: 1500 },
    { angle: 0, width: 100, color: Colors.tech.electricBlue, delay: 2000 },
  ];

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Light beams */}
      {beams.map((beam, index) => (
        <LightBeam
          key={`beam-${index}`}
          index={index}
          angle={beam.angle}
          width={beam.width}
          color={beam.color}
          delay={beam.delay}
        />
      ))}

      {/* Light rays */}
      {Array.from({ length: 6 }).map((_, index) => (
        <LightRay key={`ray-${index}`} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  lightBeam: {
    position: 'absolute',
    top: 0,
    height: SCREEN_HEIGHT * 1.5,
    transformOrigin: 'top center',
  },
  lightRay: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  rayLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: Colors.text.primary,
    transform: [{ translateX: -1 }],
  },
});

export default LightBeamEffect;