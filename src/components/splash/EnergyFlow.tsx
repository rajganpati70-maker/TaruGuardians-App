// =====================================================
// ULTRA PREMIUM ENERGY FLOW
// Connecting Energy Lines
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

interface EnergyLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  color: string;
}

const EnergyLine: React.FC<EnergyLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  delay,
  color,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const length = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const angle = Math.atan2(endY - startY, endX - startX);

    const flowAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(progress, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(progress, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    flowAnimation.start();

    return () => {
      flowAnimation.stop();
    };
  }, []);

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);

  return (
    <Animated.View
      style={[
        styles.energyLine,
        {
          left: startX,
          top: startY,
          width: length,
          backgroundColor: color,
          transform: [{ rotate: `${angle}rad` }],
          opacity,
        },
      ]}
    />
  );
};

interface EnergyNodeProps {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const EnergyNode: React.FC<EnergyNodeProps> = ({ x, y, size, delay, color }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start();
    pulseAnimation.start();

    return () => {
      entranceAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.energyNode,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale }, { scale: pulseScale }],
        },
      ]}
    />
  );
};

interface EnergyFlowProps {
  active?: boolean;
}

const EnergyFlow: React.FC<EnergyFlowProps> = ({ active = true }) => {
  const linesRef = useRef<EnergyLineProps[]>([]);
  const nodesRef = useRef<EnergyNodeProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate energy network
      const nodeCount = 8;
      const nodes = Array.from({ length: nodeCount }, (_, i) => {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 120;
        return {
          x: SCREEN_WIDTH / 2 + Math.cos(angle) * radius,
          y: SCREEN_HEIGHT / 2 + Math.sin(angle) * radius,
        };
      });

      // Generate lines connecting nodes
      linesRef.current = [];
      for (let i = 0; i < nodes.length; i++) {
        const nextIndex = (i + 1) % nodes.length;
        linesRef.current.push({
          startX: nodes[i].x,
          startY: nodes[i].y,
          endX: nodes[nextIndex].x,
          endY: nodes[nextIndex].y,
          delay: i * 200,
          color: Colors.glow.greenGlow,
        });
      }

      // Generate nodes
      nodesRef.current = nodes.map((node, i) => ({
        x: node.x,
        y: node.y,
        size: 10 + Math.random() * 8,
        delay: i * 150,
        color: [
          Colors.tech.neonBlue,
          Colors.glow.greenGlow,
          Colors.accent.softGold,
        ][Math.floor(Math.random() * 3)],
      }));
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Energy lines */}
      {linesRef.current.map((line, index) => (
        <EnergyLine
          key={`line-${index}`}
          startX={line.startX}
          startY={line.startY}
          endX={line.endX}
          endY={line.endY}
          delay={line.delay}
          color={line.color}
        />
      ))}

      {/* Energy nodes */}
      {nodesRef.current.map((node, index) => (
        <EnergyNode
          key={`node-${index}`}
          x={node.x}
          y={node.y}
          size={node.size}
          delay={node.delay}
          color={node.color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  energyLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  energyNode: {
    position: 'absolute',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default EnergyFlow;