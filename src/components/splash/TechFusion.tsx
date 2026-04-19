// =====================================================
// ULTRA PREMIUM TECH FUSION
// Circuits, Grids, Light Streaks
// =====================================================

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  Easing,
} from 'react-native';
import { Colors, AnimationConfig } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CircuitLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const CircuitLine: React.FC<CircuitLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  delay,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateCircuit = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]);

    animateCircuit.start();

    return () => {
      animateCircuit.stop();
    };
  }, []);

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);

  return (
    <Animated.View
      style={[
        styles.circuitLine,
        {
          left: startX,
          top: startY,
          width: length,
          transform: [{ rotate: `${angle}rad` }],
          opacity,
        },
      ]}
    />
  );
};

interface GridLineProps {
  horizontal: boolean;
  index: number;
}

const GridLine: React.FC<GridLineProps> = ({ horizontal, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(horizontal ? 0 : 0)).current;

  useEffect(() => {
    const delay = index * 50;
    const showAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, {
        toValue: AnimationConfig.grid.opacity,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    showAnimation.start();

    return () => {
      showAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.gridLine,
        horizontal ? styles.horizontalLine : styles.verticalLine,
        {
          [horizontal ? 'top' : 'left']: index * AnimationConfig.grid.size,
          opacity,
        },
      ]}
    />
  );
};

interface LightStreakProps {
  index: number;
}

const LightStreak: React.FC<LightStreakProps> = ({ index }) => {
  const translateX = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const delay = 500 + index * 200;
    
    const streakAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH + 200,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH + 400,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    streakAnimation.start();

    return () => {
      streakAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.lightStreak,
        {
          top: (index + 1) * (SCREEN_HEIGHT / 5),
          transform: [
            { translateX },
            { scaleY },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface TechFusionProps {
  active?: boolean;
}

const TechFusion: React.FC<TechFusionProps> = ({ active = true }) => {
  const circuitsRef = useRef<CircuitLineProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate circuit lines
      const circuitCount = 15;
      const centerX = SCREEN_WIDTH / 2;
      const centerY = SCREEN_HEIGHT / 2;
      
      circuitsRef.current = Array.from({ length: circuitCount }, (_, i) => {
        const angle = (i / circuitCount) * Math.PI * 2;
        const innerRadius = 80;
        const outerRadius = 150 + Math.random() * 100;
        
        const startX = centerX + Math.cos(angle) * innerRadius;
        const startY = centerY + Math.sin(angle) * innerRadius;
        const endX = centerX + Math.cos(angle) * outerRadius;
        const endY = centerY + Math.sin(angle) * outerRadius;
        
        return {
          startX,
          startY,
          endX,
          endY,
          delay: 1000 + i * 100,
        };
      });
    }
  }, [active]);

  if (!active) return null;

  // Generate grid lines
  const horizontalLines = Math.ceil(SCREEN_HEIGHT / AnimationConfig.grid.size);
  const verticalLines = Math.ceil(SCREEN_WIDTH / AnimationConfig.grid.size);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Grid overlay */}
      {Array.from({ length: horizontalLines }).map((_, i) => (
        <GridLine key={`h-${i}`} horizontal={true} index={i} />
      ))}
      {Array.from({ length: verticalLines }).map((_, i) => (
        <GridLine key={`v-${i}`} horizontal={false} index={i} />
      ))}

      {/* Circuit lines */}
      {circuitsRef.current.map((circuit, index) => (
        <CircuitLine
          key={`circuit-${index}`}
          startX={circuit.startX}
          startY={circuit.startY}
          endX={circuit.endX}
          endY={circuit.endY}
          delay={circuit.delay}
        />
      ))}

      {/* Light streaks */}
      {Array.from({ length: 4 }).map((_, i) => (
        <LightStreak key={`streak-${i}`} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  circuitLine: {
    position: 'absolute',
    height: AnimationConfig.grid.lineWidth,
    backgroundColor: Colors.circuit.primary,
    transformOrigin: 'left center',
    shadowColor: Colors.circuit.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Colors.tech.neonBlue,
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  lightStreak: {
    position: 'absolute',
    left: 0,
    width: SCREEN_WIDTH * 0.4,
    height: 2,
    backgroundColor: Colors.accent.softGold,
    borderRadius: 1,
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default TechFusion;