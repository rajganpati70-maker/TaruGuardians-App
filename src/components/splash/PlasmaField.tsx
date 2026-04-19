// =====================================================
// ULTRA PREMIUM PLASMA FIELD EFFECT
// Dynamic Plasma Energy
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

interface PlasmaBlobProps {
  index: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  delay: number;
}

const PlasmaBlob: React.FC<PlasmaBlobProps> = ({
  index,
  startX,
  startY,
  size,
  color,
  delay,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const borderRadius = useRef(new Animated.Value(50)).current;

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

    // Blob morphing
    const morphAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(borderRadius, {
            toValue: 30 + Math.random() * 20,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8 + Math.random() * 0.4,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(borderRadius, {
            toValue: 50,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Float
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 50,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: (Math.random() - 0.5) * 50,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    entranceAnimation.start(() => {
      morphAnimation.start();
      floatAnimation.start();
    });

    return () => {
      entranceAnimation.stop();
      morphAnimation.stop();
      floatAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.plasmaBlob,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius,
          backgroundColor: color,
          transform: [
            { scale },
            { translateX },
            { translateY },
          ],
          opacity,
        },
      ]}
    />
  );
};

interface PlasmaFieldProps {
  active?: boolean;
}

const PlasmaField: React.FC<PlasmaFieldProps> = ({ active = true }) => {
  const blobsRef = useRef<PlasmaBlobProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate plasma blobs
      const blobCount = 10;
      blobsRef.current = Array.from({ length: blobCount }, (_, i) => ({
        index: i,
        startX: Math.random() * (SCREEN_WIDTH - 100),
        startY: Math.random() * (SCREEN_HEIGHT - 100),
        size: 40 + Math.random() * 60,
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
    <View style={styles.container} pointerEvents='none'>
      {blobsRef.current.map((blob, index) => (
        <PlasmaBlob
          key={`blob-${index}`}
          index={blob.index}
          startX={blob.startX}
          startY={blob.startY}
          size={blob.size}
          color={blob.color}
          delay={blob.delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  plasmaBlob: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
});

export default PlasmaField;