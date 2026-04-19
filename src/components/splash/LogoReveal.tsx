// =====================================================
// ULTRA PREMIUM LOGO REVEAL
// Cinematic Logo with Scale, Glow, Shadow, Letter Animation
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  Text,
  Easing,
} from 'react-native';
import { Colors } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LogoRevealProps {
  active?: boolean;
  onComplete?: () => void;
}

const LogoReveal: React.FC<LogoRevealProps> = ({ active = true, onComplete }) => {
  // Logo scale animation
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  // Glow pulse animation
  const glowPulse = useRef(new Animated.Value(0.5)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  
  // Shadow animation
  const shadowOpacity = useRef(new Animated.Value(0)).current;
  
  // Text animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  
  // Letter by letter animation
  const letterAnims = useRef<Animated.Value[]>(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  );

  useEffect(() => {
    if (active) {
      // Phase 1: Logo entrance (0-500ms)
      const logoEntrance = Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]);

      // Phase 2: Glow pulse (500-1500ms)
      const glowPulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowPulse, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1.3,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(glowPulse, {
              toValue: 0.3,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Phase 3: Shadow fade in (500-1000ms)
      const shadowAnimation = Animated.timing(shadowOpacity, {
        toValue: 0.5,
        duration: 500,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      });

      // Phase 4: Title letter-by-letter reveal (1500-2500ms)
      const titleLetters = letterAnims.current.slice(0, 4).map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 150,
          delay: 1500 + index * 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        });
      });

      // Phase 5: Subtitle reveal (2500-3000ms)
      const subtitleAnimation = Animated.sequence([
        Animated.delay(2500),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

      // Start all animations
      Animated.parallel([
        logoEntrance,
        glowPulseAnimation,
        shadowAnimation,
        ...titleLetters,
        subtitleAnimation,
      ]).start(() => {
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      });

      return () => {
        logoEntrance.stop();
        glowPulseAnimation.stop();
        shadowAnimation.stop();
        subtitleAnimation.stop();
      };
    }
  }, [active]);

  const appName = 'TARU';
  const appTitle = 'GUARDIANS';

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main Logo Container */}
      <View style={styles.logoContainer}>
        {/* Glow effect behind logo */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              transform: [{ scale: glowScale }],
              opacity: glowPulse,
            },
          ]}
        />

        {/* Shadow effect */}
        <Animated.View
          style={[
            styles.shadowEffect,
            {
              opacity: shadowOpacity,
            },
          ]}
        />

        {/* Logo Icon - Abstract Tree + Shield Design */}
        <Animated.View
          style={[
            styles.logoIcon,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Tree trunk */}
          <View style={styles.treeTrunk}>
            <View style={styles.treeTrunkInner} />
          </View>
          
          {/* Tree canopy - multiple layers */}
          <View style={styles.treeCanopy}>
            <View style={[styles.canopyLayer, styles.canopyTop]} />
            <View style={[styles.canopyLayer, styles.canopyMiddle]} />
            <View style={[styles.canopyLayer, styles.canopyBottom]} />
          </View>
          
          {/* Shield element */}
          <View style={styles.shield}>
            <View style={styles.shieldInner} />
          </View>
        </Animated.View>

        {/* App Name - Letter by Letter */}
        <View style={styles.textContainer}>
          {appName.split('').map((letter, index) => (
            <Animated.View key={`title-${index}`}>
              <Animated.Text
                style={[
                  styles.titleLetter,
                  {
                    opacity: letterAnims.current[index] || 0,
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            </Animated.View>
          ))}
        </View>

        {/* Subtitle */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitle}>{appTitle}</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={styles.tagline}>
            Preserving Nature, Protecting Tomorrow
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.glow.greenGlow,
    shadowColor: Colors.glow.greenGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  shadowEffect: {
    position: 'absolute',
    width: 120,
    height: 20,
    top: 140,
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 60,
    shadowColor: Colors.background.deepBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoIcon: {
    width: 120,
    height: 140,
    position: 'relative',
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 0,
    left: 50,
    width: 20,
    height: 60,
    backgroundColor: Colors.nature.bark,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeTrunkInner: {
    width: 8,
    height: 50,
    backgroundColor: Colors.nature.wood,
    borderRadius: 2,
  },
  treeCanopy: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 100,
    height: 90,
  },
  canopyLayer: {
    position: 'absolute',
    backgroundColor: Colors.nature.leafGreen,
    borderRadius: 50,
  },
  canopyTop: {
    width: 80,
    height: 50,
    top: 0,
    left: 10,
    backgroundColor: Colors.nature.leafGreen,
  },
  canopyMiddle: {
    width: 90,
    height: 45,
    top: 25,
    left: 5,
    backgroundColor: Colors.nature.leafLight,
  },
  canopyBottom: {
    width: 70,
    height: 35,
    top: 50,
    left: 15,
    backgroundColor: Colors.nature.vine,
  },
  shield: {
    position: 'absolute',
    bottom: 30,
    right: -10,
    width: 40,
    height: 50,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  shieldInner: {
    width: 20,
    height: 25,
    backgroundColor: Colors.text.primary,
    borderRadius: 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  textContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  titleLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 8,
    textShadowColor: Colors.glow.greenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.accent.softGold,
    letterSpacing: 6,
    marginTop: 5,
    textShadowColor: Colors.accent.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.text.tertiary,
    letterSpacing: 2,
    marginTop: 15,
  },
});

export default LogoReveal;