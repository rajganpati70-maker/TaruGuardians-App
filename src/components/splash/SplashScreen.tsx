// =====================================================
// ULTRA PREMIUM MAIN SPLASH SCREEN
// Orchestrates All Effects in Multi-Stage Sequence
// =====================================================

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { Colors, AnimationConfig } from '../../constants';

// Import all splash components
import BackgroundGradient from './BackgroundGradient';
import ParticleSystem from './ParticleSystem';
import NeuralNetwork from './NeuralNetwork';
import NatureElements from './NatureElements';
import TechFusion from './TechFusion';
import LogoReveal from './LogoReveal';
import GlowEffects from './GlowEffects';
import WaveformEffect from './WaveformEffect';
import RingPulseEffect from './RingPulseEffect';
import StarFieldEffect from './StarFieldEffect';
import AdvancedParticleSystem from './AdvancedParticleSystem';
import HolographicOverlay from './HolographicOverlay';
import MorphingShapes from './MorphingShapes';
import EnergyFlow from './EnergyFlow';
import MatrixRainEffect from './MatrixRainEffect';
import AuroraBorealisEffect from './AuroraBorealisEffect';
import NebulaEffect from './NebulaEffect';
import PlasmaField from './PlasmaField';
import RippleEffect from './RippleEffect';
import ScanlineEffect from './ScanlineEffect';
import GeometricPattern from './GeometricPattern';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = AnimationConfig.totalDuration,
}) => {
  // Animation stages
  const [stage, setStage] = useState(0);
  
  // Stage visibility states
  const [showInitial, setShowInitial] = useState(true);
  const [showNature, setShowNature] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  
  // Main fade out
  const mainOpacity = useRef(new Animated.Value(1)).current;
  const mainScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Stage 1: Initial (0-2s) - Dark background with particles
    const initialTimer = setTimeout(() => {
      setShowNature(true);
    }, 2000);

    // Stage 2: Nature Emergence (2-4s)
    const natureTimer = setTimeout(() => {
      setShowTech(true);
    }, 4000);

    // Stage 3: Tech Fusion (4-6s)
    const techTimer = setTimeout(() => {
      setShowLogo(true);
    }, 6000);

    // Stage 4: Logo Reveal (6-8s)
    const logoTimer = setTimeout(() => {
      setShowTransition(true);
    }, 8000);

    // Stage 5: Final Transition (8-10s) - Fade out
    const transitionTimer = setTimeout(() => {
      // Fade out entire splash
      Animated.parallel([
        Animated.timing(mainOpacity, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(mainScale, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Complete splash
        onComplete();
      });
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(natureTimer);
      clearTimeout(techTimer);
      clearTimeout(logoTimer);
      clearTimeout(transitionTimer);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: mainOpacity,
          transform: [{ scale: mainScale }],
        },
      ]}
    >
      <StatusBar barStyle='light-content' backgroundColor={Colors.background.deepBlack} />
      
      {/* Stage 0: Initial (0-2s) - Base effects always visible */}
      <BackgroundGradient active={showInitial} />
      <ParticleSystem active={showInitial} />
      <StarFieldEffect active={showInitial} />
      <GlowEffects active={showInitial} />
      
      {/* Stage 1: Nature Emergence (2-4s) */}
      <NatureElements active={showNature} />
      <AuroraBorealisEffect active={showNature} />
      <WaveformEffect active={showNature} />
      <EnergyFlow active={showNature} />
      
      {/* Stage 2: Tech Fusion (4-6s) */}
      <NeuralNetwork active={showTech} />
      <TechFusion active={showTech} />
      <HolographicOverlay active={showTech} />
      <AdvancedParticleSystem active={showTech} />
      <MorphingShapes active={showTech} />
      <MatrixRainEffect active={showTech} />
      <GeometricPattern active={showTech} />
      
      {/* Stage 3: Logo Reveal (6-8s) */}
      <LogoReveal 
        active={showLogo} 
        onComplete={() => {
          // Logo animation complete callback
        }}
      />
      
      {/* Stage 4: Final Transition (8-10s) */}
      <RippleEffect active={showTransition} />
      <NebulaEffect active={showTransition} />
      <PlasmaField active={showTransition} />
      <RingPulseEffect active={showTransition} />
      
      {/* Always on top */}
      <ScanlineEffect active={true} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.deepBlack,
  },
});

export default SplashScreen;