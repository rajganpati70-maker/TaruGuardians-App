// =====================================================
// ULTRA PREMIUM NATURE ELEMENTS
// Leaves, Vines with Growth Animations
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

interface LeafProps {
  index: number;
  startX: number;
  startY: number;
  angle: number;
  size: number;
  delay: number;
}

const Leaf: React.FC<LeafProps> = ({ startX, startY, angle, size, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Growth animation
    const growAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: angle,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Sway animation
    const swayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    growAnimation.start();
    swayAnimation.start();

    return () => {
      growAnimation.stop();
      swayAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          left: startX,
          top: startY,
          width: size,
          height: size * 0.6,
          transform: [
            { scale },
            { rotate: rotate },
            { translateY },
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.leafInner} />
    </Animated.View>
  );
};

interface VineProps {
  index: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const Vine: React.FC<VineProps> = ({ startX, startY, endX, endY, delay }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Growth animation
    const growAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: AnimationConfig.nature.growthSpeed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]);

    growAnimation.start();

    return () => {
      growAnimation.stop();
    };
  }, []);

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);

  return (
    <Animated.View
      style={[
        styles.vine,
        {
          left: startX,
          top: startY,
          width: length,
          transform: [
            { rotate: `${angle}rad` },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface NatureElementsProps {
  active?: boolean;
}

const NatureElements: React.FC<NatureElementsProps> = ({ active = true }) => {
  const leavesRef = useRef<LeafProps[]>([]);
  const vinesRef = useRef<VineProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate leaves from center
      const leafCount = AnimationConfig.nature.leafCount;
      const centerX = SCREEN_WIDTH / 2;
      const centerY = SCREEN_HEIGHT / 2;
      
      leavesRef.current = Array.from({ length: leafCount }, (_, i) => {
        const angle = (i / leafCount) * 360;
        const radius = 50 + Math.random() * 150;
        return {
          index: i,
          startX: centerX + Math.cos((angle * Math.PI) / 180) * radius - 20,
          startY: centerY + Math.sin((angle * Math.PI) / 180) * radius - 15,
          angle: angle + (Math.random() - 0.5) * 30,
          size: 30 + Math.random() * 20,
          delay: 500 + i * 150,
        };
      });

      // Generate vines from bottom
      vinesRef.current = Array.from({ length: AnimationConfig.nature.vineCount }, (_, i) => {
        const startX = (i + 1) * (SCREEN_WIDTH / (AnimationConfig.nature.vineCount + 1));
        const startY = SCREEN_HEIGHT * 0.9;
        const endX = startX + (Math.random() - 0.5) * 100;
        const endY = startY - 200 - Math.random() * 150;
        return {
          index: i,
          startX,
          startY,
          endX,
          endY,
          delay: 800 + i * 200,
        };
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Draw vines first */}
      {vinesRef.current.map((vine, index) => (
        <Vine
          key={`vine-${index}`}
          index={vine.index}
          startX={vine.startX}
          startY={vine.startY}
          endX={vine.endX}
          endY={vine.endY}
          delay={vine.delay}
        />
      ))}

      {/* Draw leaves on top */}
      {leavesRef.current.map((leaf, index) => (
        <Leaf
          key={`leaf-${index}`}
          index={leaf.index}
          startX={leaf.startX}
          startY={leaf.startY}
          angle={leaf.angle}
          size={leaf.size}
          delay={leaf.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  leaf: {
    position: 'absolute',
    backgroundColor: Colors.nature.leafGreen,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: Colors.glow.greenGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  leafInner: {
    width: '100%',
    height: '40%',
    backgroundColor: Colors.nature.leafLight,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: 2,
  },
  vine: {
    position: 'absolute',
    height: 4,
    backgroundColor: Colors.nature.vine,
    borderRadius: 2,
    transformOrigin: 'left center',
    shadowColor: Colors.glow.greenGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default NatureElements;