// =====================================================
// ULTRA PREMIUM HOLOGRAPHIC OVERLAY
// Scanning Grid, Data Streams
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

interface ScanLineProps {
  delay: number;
}

const ScanLine: React.FC<ScanLineProps> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 500,
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
        ]),
      ])
    );

    scanAnimation.start();

    return () => {
      scanAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.scanLine,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.scanLineInner} />
    </Animated.View>
  );
};

interface DataStreamProps {
  index: number;
}

const DataStream: React.FC<DataStreamProps> = ({ index }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const streamAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 500),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 100,
          duration: 4000 + index * 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    streamAnimation.start();

    return () => {
      streamAnimation.stop();
    };
  }, []);

  const data = Array.from({ length: 10 }, () => 
    Math.random() > 0.5 ? '1' : '0'
  ).join('');

  return (
    <Animated.View
      style={[
        styles.dataStream,
        {
          left: 20 + index * 80,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.dataText}>{data}</Text>
    </Animated.View>
  );
};

interface GridOverlayProps {
  active?: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({ active = true }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const fadeInAnimation = Animated.timing(opacity, {
        toValue: 0.15,
        duration: 1500,
        useNativeDriver: true,
      });

      fadeInAnimation.start();

      return () => {
        fadeInAnimation.stop();
      };
    }
  }, [active]);

  if (!active) return null;

  const gridLines = Array.from({ length: 20 });
  const vertLines = Array.from({ length: 12 });

  return (
    <Animated.View style={[styles.gridOverlay, { opacity }]} pointerEvents="none">
      {/* Horizontal lines */}
      {gridLines.map((_, index) => (
        <View
          key={`h-${index}`}
          style={[
            styles.gridLine,
            styles.horizontalLine,
            { top: index * 40 },
          ]}
        />
      ))}
      {/* Vertical lines */}
      {vertLines.map((_, index) => (
        <View
          key={`v-${index}`}
          style={[
            styles.gridLine,
            styles.verticalLine,
            { left: index * 35 },
          ]}
        />
      ))}
    </Animated.View>
  );
};

interface HolographicOverlayProps {
  active?: boolean;
}

const HolographicOverlay: React.FC<HolographicOverlayProps> = ({ active = true }) => {
  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Grid overlay */}
      <GridOverlay active={active} />

      {/* Scan lines */}
      <ScanLine delay={0} />
      <ScanLine delay={1500} />
      <ScanLine delay={3000} />

      {/* Data streams */}
      {Array.from({ length: 4 }).map((_, index) => (
        <DataStream key={`stream-${index}`} index={index} />
      ))}

      {/* Corner brackets */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
  },
  scanLineInner: {
    flex: 1,
    backgroundColor: Colors.tech.neonBlue,
    opacity: 0.3,
  },
  dataStream: {
    position: 'absolute',
    top: 0,
  },
  dataText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: Colors.tech.neonBlue,
    opacity: 0.5,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.tech.neonBlue,
  },
  topLeft: {
    top: 50,
    left: 50,
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  topRight: {
    top: 50,
    right: 50,
    borderRightWidth: 2,
    borderTopWidth: 2,
  },
  bottomLeft: {
    bottom: 50,
    left: 50,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
  },
  bottomRight: {
    bottom: 50,
    right: 50,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
});

export default HolographicOverlay;