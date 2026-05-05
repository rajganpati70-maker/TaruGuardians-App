import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
  Easing,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.60, 240);
const LOGO = require('../../../assets/splash-logo.png');

interface LogoRevealProps {
  active?: boolean;
  onComplete?: () => void;
}

const LogoReveal: React.FC<LogoRevealProps> = ({ active = true, onComplete }) => {
  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  const glowScale   = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale   = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 600,
        easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, damping: 11, stiffness: 85, useNativeDriver: true,
      }),
      Animated.spring(ringScale, {
        toValue: 1, damping: 10, stiffness: 70, useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
    ]);

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1,    duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 1.35, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.2, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 1,   duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    const textReveal = Animated.sequence([
      Animated.delay(700),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.delay(150),
      Animated.timing(tagOpacity,  { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]);

    entrance.start();
    glowLoop.start();
    textReveal.start(() => {
      if (onComplete) setTimeout(onComplete, 500);
    });

    return () => {
      entrance.stop();
      glowLoop.stop();
      textReveal.stop();
    };
  }, [active]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Pulsing green glow */}
      <Animated.View
        style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      />

      {/* Outer animated ring */}
      <Animated.View
        style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />

      {/* TaruGuardians logo — real image, transparent bg */}
      <Animated.Image
        source={LOGO}
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        A tech club rooted in nature.
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: LOGO_SIZE + 80,
    height: LOGO_SIZE + 80,
    borderRadius: (LOGO_SIZE + 80) / 2,
    backgroundColor: 'rgba(0,200,80,0.15)',
  },
  ring: {
    position: 'absolute',
    width: LOGO_SIZE + 28,
    height: LOGO_SIZE + 28,
    borderRadius: (LOGO_SIZE + 28) / 2,
    borderWidth: 2,
    borderColor: 'rgba(80,220,80,0.5)',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  tagline: {
    marginTop: 24,
    fontSize: 13,
    color: 'rgba(255,255,255,0.60)',
    letterSpacing: 1.6,
    fontWeight: '300',
  },
});

export default LogoReveal;
