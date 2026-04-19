// =====================================================
// TARU GUARDIANS — PREMIUM SPLASH ORCHESTRATION
// Multi-stage boot sequence · nature × tech fusion
// =====================================================

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  Easing,
  Text,
  AccessibilityInfo,
  Platform,
  Pressable,
} from 'react-native';
import { Colors, AnimationConfig } from '../../constants';

// -----------------------------------------------------
// Effect imports
// -----------------------------------------------------

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
import LightBeamEffect from './LightBeamEffect';
import BioDigitalCoreEffect from './BioDigitalCoreEffect';
import DigitalRainEffect from './DigitalRainEffect';
import CosmicDustEffect from './CosmicDustEffect';
import EnergyOrbsEffect from './EnergyOrbsEffect';
import NebulaCloudsEffect from './NebulaCloudsEffect';
import VortexEffect from './VortexEffect';
import ChromaWaveEffect from './ChromaWaveEffect';
import UltimateFusionEffect from './UltimateFusionEffect';
import FallingLeavesEffect from './FallingLeavesEffect';
import SunbeamsEffect from './SunbeamsEffect';
import FirefliesEffect from './FirefliesEffect';
import ForestSilhouetteEffect from './ForestSilhouetteEffect';
import PetalDriftEffect from './PetalDriftEffect';
import GentleRainEffect from './GentleRainEffect';
import MistLayerEffect from './MistLayerEffect';
import BirdsFlightEffect from './BirdsFlightEffect';
import BloomBurstEffect from './BloomBurstEffect';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;

// -----------------------------------------------------
// Types
// -----------------------------------------------------

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
  allowSkip?: boolean;
  variant?: 'full' | 'fast';
}

type StageKey =
  | 'boot'
  | 'cosmos'
  | 'nature'
  | 'tech'
  | 'fusion'
  | 'logo'
  | 'brand'
  | 'outro';

interface StageBlueprint {
  key: StageKey;
  index: number;
  durationMs: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
  progressFrom: number;
  progressTo: number;
  statusLines: string[];
}

// -----------------------------------------------------
// Stage config — readable data over nested code
// -----------------------------------------------------

const STAGES: StageBlueprint[] = [
  {
    key: 'boot',
    index: 0,
    durationMs: 1400,
    eyebrow: 'SYSTEM',
    title: 'Waking up kindly.',
    subtitle: 'Nothing flashy. Breathing the app in.',
    accent: '#94A3B8',
    progressFrom: 0,
    progressTo: 12,
    statusLines: [
      'Warming up cold paths',
      'Leasing local storage',
      'Reading last known state',
    ],
  },
  {
    key: 'cosmos',
    index: 1,
    durationMs: 1400,
    eyebrow: 'SKY',
    title: 'Stars first. Then soil.',
    subtitle: 'Listening to the network, the clock, the light.',
    accent: '#6366F1',
    progressFrom: 12,
    progressTo: 26,
    statusLines: [
      'Calibrating starlight',
      'Positioning nebulae',
      'Sampling cosmic dust',
    ],
  },
  {
    key: 'nature',
    index: 2,
    durationMs: 1600,
    eyebrow: 'ROOTS',
    title: 'Roots waking.',
    subtitle: 'Tiny motions. Slow greens. The club\'s first breath.',
    accent: '#22C55E',
    progressFrom: 26,
    progressTo: 44,
    statusLines: [
      'Growing 12,000 saplings',
      'Routing monsoon paths',
      'Composing bird + breeze track',
    ],
  },
  {
    key: 'tech',
    index: 3,
    durationMs: 1500,
    eyebrow: 'GRID',
    title: 'The grid lights up.',
    subtitle: 'Quiet, honest code. Drawing the neural lattice.',
    accent: '#38BDF8',
    progressFrom: 44,
    progressTo: 62,
    statusLines: [
      'Linking neural mesh',
      'Booting matrix rain',
      'Settling holographic overlay',
    ],
  },
  {
    key: 'fusion',
    index: 4,
    durationMs: 1400,
    eyebrow: 'FUSION',
    title: 'Two halves. One club.',
    subtitle: 'Sustainability × engineering × culture. No versus.',
    accent: '#D4AF37',
    progressFrom: 62,
    progressTo: 80,
    statusLines: [
      'Weaving aurora into lattice',
      'Aligning nature palette to tech grid',
      'Priming fusion core',
    ],
  },
  {
    key: 'logo',
    index: 5,
    durationMs: 1300,
    eyebrow: 'IDENTITY',
    title: 'Taru Guardians.',
    subtitle: 'A tech club rooted in nature.',
    accent: '#D4AF37',
    progressFrom: 80,
    progressTo: 92,
    statusLines: [
      'Revealing mark',
      'Anchoring typography',
      'Holding still for a heartbeat',
    ],
  },
  {
    key: 'brand',
    index: 6,
    durationMs: 900,
    eyebrow: 'GREETING',
    title: 'Welcome back, guardian.',
    subtitle: '6 wings. 210+ members. 12,400 trees. 520 alumni.',
    accent: '#FBBF24',
    progressFrom: 92,
    progressTo: 98,
    statusLines: [
      'Preloading six wings',
      'Inviting alumni shelf',
      'Cueing first-light transition',
    ],
  },
  {
    key: 'outro',
    index: 7,
    durationMs: 1000,
    eyebrow: 'BEGIN',
    title: 'Stepping onto the floor.',
    subtitle: 'Handing you the home tab. Mind the plants.',
    accent: '#00D4FF',
    progressFrom: 98,
    progressTo: 100,
    statusLines: [
      'Warming bottom-tab bar',
      'Dispatching to Home',
      'Bye, splash.',
    ],
  },
];

const TOTAL_DURATION = STAGES.reduce((a, s) => a + s.durationMs, 0);

// -----------------------------------------------------
// Rotating nature + tech quotes
// -----------------------------------------------------

const QUOTES = [
  {
    text: 'The best time to plant a tree was 20 years ago. The second best is today.',
    attribution: 'Chinese proverb · printed on our lanyards',
  },
  {
    text: 'Build tools that stay useful after you graduate.',
    attribution: 'The Taru handbook, page 4',
  },
  {
    text: 'We don\'t ship hype. We ship pull-requests with kind reviewers.',
    attribution: 'Web/App wing ethos',
  },
  {
    text: 'A 74% survival rate isn\'t perfect. It\'s honest.',
    attribution: '2025 sustainability audit',
  },
  {
    text: 'Calm is a feature. Protect it.',
    attribution: 'Club-wide retro, Feb 2025',
  },
  {
    text: 'Show up for the Sunday digest. Even the week you don\'t feel like it.',
    attribution: 'Content wing rituals',
  },
  {
    text: 'Every event must be better for a first-year than a senior.',
    attribution: 'Events wing covenant',
  },
  {
    text: 'No laptop Fridays. Yes to warm tea and real talk.',
    attribution: 'Old rule that became a new rule',
  },
];

// -----------------------------------------------------
// Config helpers
// -----------------------------------------------------

const getStageByTime = (elapsedMs: number): StageBlueprint => {
  let acc = 0;
  for (const s of STAGES) {
    acc += s.durationMs;
    if (elapsedMs < acc) return s;
  }
  return STAGES[STAGES.length - 1];
};

const getStageStart = (stage: StageBlueprint): number => {
  let acc = 0;
  for (const s of STAGES) {
    if (s.key === stage.key) return acc;
    acc += s.durationMs;
  }
  return 0;
};

// Derived visibility rules — which effects are on per stage
interface EffectVisibility {
  backgroundGradient: boolean;
  particleSystem: boolean;
  starField: boolean;
  glow: boolean;
  cosmicDust: boolean;
  nebulaClouds: boolean;
  natureElements: boolean;
  auroraBorealis: boolean;
  waveform: boolean;
  energyFlow: boolean;
  neuralNetwork: boolean;
  techFusion: boolean;
  holographicOverlay: boolean;
  advancedParticles: boolean;
  morphingShapes: boolean;
  matrixRain: boolean;
  geometricPattern: boolean;
  bioDigitalCore: boolean;
  digitalRain: boolean;
  energyOrbs: boolean;
  chromaWave: boolean;
  ultimateFusion: boolean;
  lightBeam: boolean;
  ripple: boolean;
  nebula: boolean;
  plasmaField: boolean;
  ringPulse: boolean;
  vortex: boolean;
  logoReveal: boolean;
  scanline: boolean;
  // Nature layer
  fallingLeaves: boolean;
  sunbeams: boolean;
  fireflies: boolean;
  forestSilhouette: boolean;
  petalDrift: boolean;
  gentleRain: boolean;
  mistLayer: boolean;
  birdsFlight: boolean;
  bloomBurst: boolean;
}

const visibilityForStage = (key: StageKey): EffectVisibility => {
  const base: EffectVisibility = {
    backgroundGradient: true,
    particleSystem: false,
    starField: false,
    glow: true,
    cosmicDust: false,
    nebulaClouds: false,
    natureElements: false,
    auroraBorealis: false,
    waveform: false,
    energyFlow: false,
    neuralNetwork: false,
    techFusion: false,
    holographicOverlay: false,
    advancedParticles: false,
    morphingShapes: false,
    matrixRain: false,
    geometricPattern: false,
    bioDigitalCore: false,
    digitalRain: false,
    energyOrbs: false,
    chromaWave: false,
    ultimateFusion: false,
    lightBeam: false,
    ripple: false,
    nebula: false,
    plasmaField: false,
    ringPulse: false,
    vortex: false,
    logoReveal: false,
    scanline: true,
    fallingLeaves: false,
    sunbeams: false,
    fireflies: false,
    forestSilhouette: false,
    petalDrift: false,
    gentleRain: false,
    mistLayer: false,
    birdsFlight: false,
    bloomBurst: false,
  };
  switch (key) {
    case 'boot':
      return { ...base, particleSystem: true, fireflies: true };
    case 'cosmos':
      return {
        ...base,
        particleSystem: true,
        starField: true,
        cosmicDust: true,
        nebulaClouds: true,
        fireflies: true,
      };
    case 'nature':
      return {
        ...base,
        starField: true,
        natureElements: true,
        auroraBorealis: true,
        waveform: true,
        energyFlow: true,
        fallingLeaves: true,
        sunbeams: true,
        fireflies: true,
        forestSilhouette: true,
        petalDrift: true,
        mistLayer: true,
        birdsFlight: true,
        bloomBurst: true,
      };
    case 'tech':
      return {
        ...base,
        natureElements: true,
        neuralNetwork: true,
        techFusion: true,
        holographicOverlay: true,
        advancedParticles: true,
        morphingShapes: true,
        matrixRain: true,
        geometricPattern: true,
        digitalRain: true,
      };
    case 'fusion':
      return {
        ...base,
        neuralNetwork: true,
        techFusion: true,
        auroraBorealis: true,
        energyOrbs: true,
        chromaWave: true,
        bioDigitalCore: true,
        ultimateFusion: true,
        lightBeam: true,
        holographicOverlay: true,
      };
    case 'logo':
      return {
        ...base,
        logoReveal: true,
        bioDigitalCore: true,
        lightBeam: true,
        ringPulse: true,
        glow: true,
        fireflies: true,
        sunbeams: true,
      };
    case 'brand':
      return {
        ...base,
        logoReveal: true,
        ringPulse: true,
        ripple: true,
        plasmaField: true,
        chromaWave: true,
        fireflies: true,
        petalDrift: true,
      };
    case 'outro':
      return {
        ...base,
        ripple: true,
        nebula: true,
        plasmaField: true,
        ringPulse: true,
        vortex: true,
        fireflies: true,
        bloomBurst: true,
      };
    default:
      return base;
  }
};

// -----------------------------------------------------
// Small presentational helpers
// -----------------------------------------------------

interface StageStripProps {
  stages: StageBlueprint[];
  activeIndex: number;
  progress: Animated.Value;
}

const StageStrip: React.FC<StageStripProps> = ({ stages, activeIndex }) => (
  <View style={splashStyles.stageStripRow}>
    {stages.map((s, i) => {
      const active = i === activeIndex;
      const done = i < activeIndex;
      return (
        <View
          key={s.key}
          style={[
            splashStyles.stageDot,
            {
              backgroundColor: done
                ? s.accent + 'CC'
                : active
                ? s.accent
                : '#ffffff22',
              width: active ? 22 : 8,
              borderColor: active ? '#ffffff66' : 'transparent',
            },
          ]}
        />
      );
    })}
  </View>
);

interface ProgressBarProps {
  progress: Animated.Value;
  accent: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, accent }) => {
  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  return (
    <View style={splashStyles.progressBarTrack}>
      <Animated.View
        style={[
          splashStyles.progressBarFill,
          {
            backgroundColor: accent,
            width,
          },
        ]}
      />
    </View>
  );
};

interface NarrationBlockProps {
  stage: StageBlueprint;
  eyebrowAnim: Animated.Value;
  titleAnim: Animated.Value;
  subtitleAnim: Animated.Value;
  statusIndex: number;
}

const NarrationBlock: React.FC<NarrationBlockProps> = ({
  stage,
  eyebrowAnim,
  titleAnim,
  subtitleAnim,
  statusIndex,
}) => {
  const statusLine = stage.statusLines[statusIndex % stage.statusLines.length];
  return (
    <View style={splashStyles.narrationWrap}>
      <Animated.Text
        style={[
          splashStyles.narrationEyebrow,
          {
            opacity: eyebrowAnim,
            color: stage.accent,
            transform: [
              {
                translateY: eyebrowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
          },
        ]}
      >
        {stage.eyebrow}
      </Animated.Text>
      <Animated.Text
        style={[
          splashStyles.narrationTitle,
          {
            opacity: titleAnim,
            transform: [
              {
                translateY: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {stage.title}
      </Animated.Text>
      <Animated.Text
        style={[
          splashStyles.narrationSubtitle,
          {
            opacity: subtitleAnim,
            transform: [
              {
                translateY: subtitleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
          },
        ]}
      >
        {stage.subtitle}
      </Animated.Text>
      <View style={splashStyles.statusRow}>
        <View style={[splashStyles.statusDot, { backgroundColor: stage.accent }]} />
        <Text style={splashStyles.statusText}>{statusLine}</Text>
      </View>
    </View>
  );
};

interface QuoteBlockProps {
  quote: { text: string; attribution: string };
  anim: Animated.Value;
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({ quote, anim }) => (
  <Animated.View
    style={[
      splashStyles.quoteWrap,
      {
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      },
    ]}
  >
    <Text style={splashStyles.quoteText}>"{quote.text}"</Text>
    <Text style={splashStyles.quoteAttr}>— {quote.attribution}</Text>
  </Animated.View>
);

interface FooterBrandBarProps {
  appVersion: string;
  tagline: string;
  opacity: Animated.Value;
}

const FooterBrandBar: React.FC<FooterBrandBarProps> = ({
  appVersion,
  tagline,
  opacity,
}) => (
  <Animated.View style={[splashStyles.footerBrandBar, { opacity }]}>
    <Text style={splashStyles.footerBrand}>Taru Guardians</Text>
    <View style={splashStyles.footerDot} />
    <Text style={splashStyles.footerTagline}>{tagline}</Text>
    <View style={splashStyles.footerDot} />
    <Text style={splashStyles.footerVersion}>{appVersion}</Text>
  </Animated.View>
);

interface SkipPillProps {
  onSkip: () => void;
  opacity: Animated.Value;
  visible: boolean;
}

const SkipPill: React.FC<SkipPillProps> = ({ onSkip, opacity, visible }) => {
  if (!visible) return null;
  return (
    <Animated.View style={[splashStyles.skipPillWrap, { opacity }]}>
      <Pressable
        onPress={onSkip}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Skip splash"
        style={splashStyles.skipPill}
      >
        <Text style={splashStyles.skipPillText}>Skip ›</Text>
      </Pressable>
    </Animated.View>
  );
};

// -----------------------------------------------------
// Main component
// -----------------------------------------------------

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = AnimationConfig.totalDuration,
  allowSkip = true,
  variant = 'full',
}) => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const activeStage = STAGES[activeStageIndex];
  const visibility = useMemo(() => visibilityForStage(activeStage.key), [activeStage.key]);

  // Animated values
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const rootScale = useRef(new Animated.Value(1)).current;
  const eyebrowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const skipPillOpacity = useRef(new Animated.Value(0)).current;
  const stageStripOpacity = useRef(new Animated.Value(0)).current;
  const bgPulseAnim = useRef(new Animated.Value(0)).current;
  const vignetteAnim = useRef(new Animated.Value(0)).current;
  const accentOverlayAnim = useRef(new Animated.Value(0)).current;

  // refs to timers for clean teardown
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const quoteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgLoop = useRef<Animated.CompositeAnimation | null>(null);

  // -----------------------------------------------------
  // Accessibility: respect reduced motion
  // -----------------------------------------------------

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(Boolean(v));
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (v) => mounted && setReduceMotion(Boolean(v)),
    );
    return () => {
      mounted = false;
      // newer RN returns a subscription with remove()
      // but `as any` is forbidden — feature-detect safely:
      if (sub && typeof (sub as unknown as { remove?: () => void }).remove === 'function') {
        (sub as unknown as { remove: () => void }).remove();
      }
    };
  }, []);

  // -----------------------------------------------------
  // Stage transitions
  // -----------------------------------------------------

  const finish = useCallback(() => {
    Animated.parallel([
      Animated.timing(rootOpacity, {
        toValue: 0,
        duration: reduceMotion ? 200 : 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rootScale, {
        toValue: reduceMotion ? 1 : 1.08,
        duration: reduceMotion ? 200 : 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, [onComplete, reduceMotion, rootOpacity, rootScale]);

  const animateStageText = useCallback(
    (stage: StageBlueprint) => {
      eyebrowAnim.setValue(0);
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      Animated.stagger(reduceMotion ? 60 : 140, [
        Animated.timing(eyebrowAnim, {
          toValue: 1,
          duration: reduceMotion ? 180 : 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: reduceMotion ? 220 : 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleAnim, {
          toValue: 1,
          duration: reduceMotion ? 180 : 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(accentOverlayAnim, {
        toValue: stage.index,
        duration: reduceMotion ? 160 : 360,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
      Animated.timing(progressAnim, {
        toValue: stage.progressTo,
        duration: reduceMotion ? 200 : stage.durationMs * 0.92,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start();
    },
    [
      eyebrowAnim,
      titleAnim,
      subtitleAnim,
      accentOverlayAnim,
      progressAnim,
      reduceMotion,
    ],
  );

  const advanceToStage = useCallback(
    (index: number) => {
      if (index >= STAGES.length) {
        finish();
        return;
      }
      setActiveStageIndex(index);
      setStatusIndex(0);
      animateStageText(STAGES[index]);
    },
    [animateStageText, finish],
  );

  // Initial boot
  useEffect(() => {
    animateStageText(STAGES[0]);
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 800,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(stageStripOpacity, {
      toValue: 1,
      duration: 700,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (allowSkip) {
      Animated.timing(skipPillOpacity, {
        toValue: 1,
        duration: 400,
        delay: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    Animated.timing(vignetteAnim, {
      toValue: 1,
      duration: 1400,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    bgLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulseAnim, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bgPulseAnim, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    bgLoop.current.start();
    return () => {
      bgLoop.current?.stop();
    };
  }, [
    animateStageText,
    allowSkip,
    bgPulseAnim,
    footerOpacity,
    skipPillOpacity,
    stageStripOpacity,
    vignetteAnim,
  ]);

  // Stage timer
  useEffect(() => {
    const s = activeStage;
    const mult = variant === 'fast' ? 0.55 : 1;
    stageTimer.current = setTimeout(() => {
      advanceToStage(activeStageIndex + 1);
    }, Math.max(400, Math.floor(s.durationMs * mult * (reduceMotion ? 0.6 : 1))));
    return () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
    };
  }, [activeStageIndex, activeStage, advanceToStage, reduceMotion, variant]);

  // Status text rotator (per stage)
  useEffect(() => {
    setStatusIndex(0);
    statusTimer.current = setInterval(() => {
      setStatusIndex((i) => i + 1);
    }, 650);
    return () => {
      if (statusTimer.current) clearInterval(statusTimer.current);
    };
  }, [activeStageIndex]);

  // Quote rotator — independent cycle
  useEffect(() => {
    quoteAnim.setValue(1);
    quoteTimer.current = setInterval(() => {
      Animated.timing(quoteAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => {
      if (quoteTimer.current) clearInterval(quoteTimer.current);
    };
  }, [quoteAnim]);

  const handleSkip = useCallback(() => {
    if (stageTimer.current) clearTimeout(stageTimer.current);
    if (statusTimer.current) clearInterval(statusTimer.current);
    if (quoteTimer.current) clearInterval(quoteTimer.current);
    finish();
  }, [finish]);

  // -----------------------------------------------------
  // Derived display state
  // -----------------------------------------------------

  const v = visibility;
  const quote = QUOTES[quoteIndex];

  const accentGlowOpacity = bgPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  const accentColor = activeStage.accent;

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------

  return (
    <Animated.View
      style={[
        splashStyles.container,
        {
          opacity: rootOpacity,
          transform: [{ scale: rootScale }],
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`Taru Guardians launching. Stage ${activeStage.index + 1} of ${STAGES.length}: ${activeStage.title}.`}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
        translucent={Platform.OS === 'android'}
      />

      {/* Always-on base gradient */}
      <BackgroundGradient active={v.backgroundGradient} />

      {/* Ambient accent pulse glow tied to stage */}
      <Animated.View
        pointerEvents="none"
        style={[
          splashStyles.accentPulseLayer,
          {
            backgroundColor: accentColor,
            opacity: accentGlowOpacity,
          },
        ]}
      />

      {/* Star / cosmos layer */}
      {v.starField ? <StarFieldEffect active /> : null}
      {v.cosmicDust ? <CosmicDustEffect active /> : null}
      {v.nebulaClouds ? <NebulaCloudsEffect active /> : null}

      {/* Particles */}
      {v.particleSystem ? <ParticleSystem active /> : null}
      {v.advancedParticles ? <AdvancedParticleSystem active /> : null}

      {/* Glow field */}
      {v.glow ? <GlowEffects active /> : null}

      {/* Nature stage */}
      {v.natureElements ? <NatureElements active /> : null}
      {v.auroraBorealis ? <AuroraBorealisEffect active /> : null}
      {v.waveform ? <WaveformEffect active /> : null}
      {v.energyFlow ? <EnergyFlow active /> : null}

      {/* Nature vibe layer (new) */}
      {v.forestSilhouette ? (
        <ForestSilhouetteEffect reduceMotion={reduceMotion} />
      ) : null}
      {v.mistLayer ? (
        <MistLayerEffect reduceMotion={reduceMotion} tint="cool" density="normal" />
      ) : null}
      {v.sunbeams ? (
        <SunbeamsEffect reduceMotion={reduceMotion} density="normal" />
      ) : null}
      {v.gentleRain ? (
        <GentleRainEffect reduceMotion={reduceMotion} density="soft" />
      ) : null}
      {v.fallingLeaves ? (
        <FallingLeavesEffect reduceMotion={reduceMotion} />
      ) : null}
      {v.petalDrift ? (
        <PetalDriftEffect reduceMotion={reduceMotion} density="soft" />
      ) : null}
      {v.birdsFlight ? (
        <BirdsFlightEffect reduceMotion={reduceMotion} density="soft" />
      ) : null}
      {v.bloomBurst ? (
        <BloomBurstEffect reduceMotion={reduceMotion} density="soft" />
      ) : null}
      {v.fireflies ? (
        <FirefliesEffect reduceMotion={reduceMotion} density="soft" />
      ) : null}

      {/* Tech stage */}
      {v.neuralNetwork ? <NeuralNetwork active /> : null}
      {v.techFusion ? <TechFusion active /> : null}
      {v.holographicOverlay ? <HolographicOverlay active /> : null}
      {v.morphingShapes ? <MorphingShapes active /> : null}
      {v.matrixRain ? <MatrixRainEffect active /> : null}
      {v.geometricPattern ? <GeometricPattern active /> : null}
      {v.digitalRain ? <DigitalRainEffect active /> : null}

      {/* Fusion core */}
      {v.bioDigitalCore ? <BioDigitalCoreEffect active /> : null}
      {v.energyOrbs ? <EnergyOrbsEffect active /> : null}
      {v.chromaWave ? <ChromaWaveEffect active /> : null}
      {v.ultimateFusion ? <UltimateFusionEffect active /> : null}
      {v.lightBeam ? <LightBeamEffect active /> : null}

      {/* Outro */}
      {v.ripple ? <RippleEffect active /> : null}
      {v.nebula ? <NebulaEffect active /> : null}
      {v.plasmaField ? <PlasmaField active /> : null}
      {v.ringPulse ? <RingPulseEffect active /> : null}
      {v.vortex ? <VortexEffect active /> : null}

      {/* Identity */}
      {v.logoReveal ? <LogoReveal active onComplete={() => { /* no-op */ }} /> : null}

      {/* Vignette over everything */}
      <Animated.View
        pointerEvents="none"
        style={[
          splashStyles.vignetteLayer,
          {
            opacity: vignetteAnim,
          },
        ]}
      />

      {/* Narration / status HUD */}
      <View style={splashStyles.hudWrap} pointerEvents="box-none">
        <View style={splashStyles.hudInner}>
          <Animated.View style={{ opacity: stageStripOpacity }}>
            <StageStrip
              stages={STAGES}
              activeIndex={activeStageIndex}
              progress={progressAnim}
            />
          </Animated.View>

          <NarrationBlock
            stage={activeStage}
            eyebrowAnim={eyebrowAnim}
            titleAnim={titleAnim}
            subtitleAnim={subtitleAnim}
            statusIndex={statusIndex}
          />

          <ProgressBar progress={progressAnim} accent={accentColor} />

          <QuoteBlock quote={quote} anim={quoteAnim} />
        </View>
      </View>

      {/* Skip pill */}
      <SkipPill
        onSkip={handleSkip}
        opacity={skipPillOpacity}
        visible={allowSkip}
      />

      {/* Footer brand bar */}
      <FooterBrandBar
        appVersion="v1.0.0 · expo sdk 52"
        tagline="Rooted in nature. Built on code."
        opacity={footerOpacity}
      />

      {/* Always on top */}
      {v.scanline ? <ScanlineEffect active /> : null}
    </Animated.View>
  );
};

// -----------------------------------------------------
// Styles
// -----------------------------------------------------

const splashStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.deepBlack,
  },
  accentPulseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  vignetteLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },

  // HUD
  hudWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: IS_SMALL ? 18 : 26,
    paddingBottom: IS_TABLET ? 90 : 70,
  },
  hudInner: {
    width: '100%',
  },
  stageStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  stageDot: {
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    borderWidth: 1,
  },

  // Narration
  narrationWrap: {
    marginBottom: 14,
  },
  narrationEyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
  },
  narrationTitle: {
    color: '#fff',
    fontSize: IS_SMALL ? 22 : IS_TABLET ? 32 : 26,
    fontWeight: '900',
    marginTop: 8,
    lineHeight: IS_TABLET ? 38 : 32,
  },
  narrationSubtitle: {
    color: '#ffffffCC',
    fontSize: IS_SMALL ? 12 : 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: IS_TABLET ? 480 : SCREEN_WIDTH - 52,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffffAA',
    fontSize: 11,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },

  // Progress
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#ffffff1A',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Quote
  quoteWrap: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
    paddingTop: 12,
  },
  quoteText: {
    color: '#ffffffCC',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteAttr: {
    color: '#ffffff77',
    fontSize: 10,
    marginTop: 4,
  },

  // Skip pill
  skipPillWrap: {
    position: 'absolute',
    top: IS_TABLET ? 64 : 48,
    right: 18,
  },
  skipPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#ffffff16',
    borderWidth: 1,
    borderColor: '#ffffff24',
  },
  skipPillText: {
    color: '#ffffffCC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Footer brand bar
  footerBrandBar: {
    position: 'absolute',
    bottom: IS_TABLET ? 38 : 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ffffff44',
    marginHorizontal: 8,
  },
  footerTagline: {
    color: '#ffffff99',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  footerVersion: {
    color: '#ffffff66',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;

// -----------------------------------------------------
// Exports for other callers (debug, documentation)
// -----------------------------------------------------

export { STAGES, QUOTES, TOTAL_DURATION, visibilityForStage, getStageByTime, getStageStart };
export type { StageKey, StageBlueprint, EffectVisibility };
