// =====================================================
// ULTRA PREMIUM NEURAL NETWORK
// Forming Neural Network Connections
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

interface NodeProps {
  x: number;
  y: number;
  delay: number;
  size: number;
}

const NeuralNode: React.FC<NodeProps> = ({ x, y, delay, size }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.node,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: scale }, { scale: pulseScale }],
          opacity,
        },
      ]}
    >
      <View style={[styles.nodeInner, { width: size * 0.6, height: size * 0.6 }]} />
    </Animated.View>
  );
};

interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const NeuralConnection: React.FC<ConnectionProps> = ({
  startX,
  startY,
  endX,
  endY,
  delay,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateConnection = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]);

    animateConnection.start();

    return () => {
      animateConnection.stop();
    };
  }, []);

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = Math.atan2(endY - startY, endX - startX);

  return (
    <Animated.View
      style={[
        styles.connection,
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

interface NeuralNetworkProps {
  active?: boolean;
}

const NeuralNetwork: React.FC<NeuralNetworkProps> = ({ active = true }) => {
  const nodesRef = useRef<{ x: number; y: number }[]>([]);
  const connectionsRef = useRef<ConnectionProps[]>([]);

  useEffect(() => {
    if (active) {
      // Generate node positions
      const nodeCount = AnimationConfig.neural.nodes;
      const centerX = SCREEN_WIDTH / 2;
      const centerY = SCREEN_HEIGHT / 2;
      
      // Create nodes in a circular pattern with random offsets
      nodesRef.current = Array.from({ length: nodeCount }, (_, i) => {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 100 + Math.random() * 150;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });

      // Generate connections
      connectionsRef.current = [];
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          if (Math.random() < AnimationConfig.neural.connectionChance) {
            connectionsRef.current.push({
              startX: nodesRef.current[i].x,
              startY: nodesRef.current[i].y,
              endX: nodesRef.current[j].x,
              endY: nodesRef.current[j].y,
              delay: 500 + Math.random() * 1000,
            });
          }
        }
      }
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Draw connections first (behind nodes) */}
      {connectionsRef.current.map((connection, index) => (
        <NeuralConnection
          key={`connection-${index}`}
          startX={connection.startX}
          startY={connection.startY}
          endX={connection.endX}
          endY={connection.endY}
          delay={connection.delay}
        />
      ))}

      {/* Draw nodes on top */}
      {nodesRef.current.map((node, index) => (
        <NeuralNode
          key={`node-${index}`}
          x={node.x}
          y={node.y}
          delay={index * 100}
          size={8 + Math.random() * 4}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  node: {
    position: 'absolute',
    backgroundColor: Colors.tech.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  nodeInner: {
    backgroundColor: Colors.text.primary,
    borderRadius: 100,
  },
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.circuit.primary,
    transformOrigin: 'left center',
    shadowColor: Colors.circuit.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
});

export default NeuralNetwork;