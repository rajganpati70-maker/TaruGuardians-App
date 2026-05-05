// =====================================================
// TARU GUARDIANS — ULTRA PREMIUM SPLASH SCREEN v3
// Tech × Sustainability · "Turn Passion Into Purpose"
// Self-contained · 7-second cinematic boot sequence
// =====================================================

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Easing,
  Image,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─────────────────────────────────────────────
// SCREEN DIMENSIONS
// ─────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = W < 375;
const IS_TABLET = W >= 768;

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────

const C = {
  black: '#000000',
  deepBlack: '#020409',
  darkBg: '#060d12',
  greenPrimary: '#00E676',
  greenSoft: '#1de9b6',
  greenDark: '#00c853',
  greenGlow: '#00ff8844',
  cyanBright: '#00e5ff',
  cyanSoft: '#18ffff',
  cyanGlow: '#00e5ff33',
  tealAccent: '#1de9b6',
  neonBlue: '#2979ff',
  blueSoft: '#448aff',
  whiteFull: '#ffffff',
  whiteHigh: 'rgba(255,255,255,0.92)',
  whiteMid: 'rgba(255,255,255,0.60)',
  whiteLow: 'rgba(255,255,255,0.30)',
  whiteGhost: 'rgba(255,255,255,0.10)',
  greenParticle: 'rgba(0,230,118,0.85)',
  cyanParticle: 'rgba(0,229,255,0.75)',
  gridLine: 'rgba(0,230,118,0.08)',
  gridLineBright: 'rgba(0,230,118,0.18)',
};

const LOGO = require('../../../assets/icon.png');

// ─────────────────────────────────────────────
// TIMING PLAN  (total ≈ 7 500 ms)
// ─────────────────────────────────────────────

const T = {
  gridFadeIn: 400,
  particlesBoot: 600,
  circuitDraw: 800,
  matrixStart: 1000,
  logoRevealStart: 1600,
  logoRevealDur: 900,
  titleRevealStart: 2600,
  titleRevealDur: 700,
  taglineStart: 3400,
  taglineDur: 900,
  passionStart: 4200,
  passionDur: 1100,
  statsStart: 5000,
  statsDur: 600,
  holdStart: 5800,
  outroStart: 6600,
  outroDur: 900,
  totalDur: 7500,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const rand = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const randInt = (min: number, max: number) =>
  Math.floor(rand(min, max));
const pick = <T,>(arr: T[]): T => arr[randInt(0, arr.length)];

const ease = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  spring: Easing.out(Easing.back(1.4)),
  smooth: Easing.bezier(0.25, 0.46, 0.45, 0.94),
};

// ─────────────────────────────────────────────
// MATRIX RAIN COLUMN
// ─────────────────────────────────────────────

const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF∑∞∂√π≈≠';

interface MatrixColumnProps {
  x: number;
  delay: number;
  speed: number;
  opacity: number;
  height: number;
}

const MatrixColumn: React.FC<MatrixColumnProps> = ({
  x,
  delay,
  speed,
  opacity,
  height,
}) => {
  const translateY = useRef(new Animated.Value(-height)).current;
  const colOpacity = useRef(new Animated.Value(0)).current;
  const [chars] = useState(() =>
    Array.from({ length: Math.ceil(height / 18) }, () =>
      pick(MATRIX_CHARS.split(''))
    )
  );

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(colOpacity, {
            toValue: opacity,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: height + 80,
            duration: speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(colOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -height,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        matrixStyles.column,
        { left: x, opacity: colOpacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      {chars.map((ch, i) => (
        <Text
          key={i}
          style={[
            matrixStyles.char,
            {
              color:
                i === chars.length - 1 ? C.whiteFull : C.greenPrimary,
              opacity: i === chars.length - 1 ? 1 : (chars.length - i) / chars.length,
            },
          ]}
        >
          {ch}
        </Text>
      ))}
    </Animated.View>
  );
};

const matrixStyles = StyleSheet.create({
  column: {
    position: 'absolute',
    top: 0,
    width: 16,
    flexDirection: 'column',
  },
  char: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    height: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
});

// ─────────────────────────────────────────────
// MATRIX RAIN (full overlay)
// ─────────────────────────────────────────────

interface MatrixRainProps {
  visible: Animated.Value;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ visible }) => {
  const columns = useMemo(() => {
    const cols: MatrixColumnProps[] = [];
    const colCount = Math.floor(W / 18);
    for (let i = 0; i < colCount; i++) {
      cols.push({
        x: i * 18,
        delay: randInt(0, 2800),
        speed: randInt(2200, 5000),
        opacity: rand(0.15, 0.55),
        height: H,
      });
    }
    return cols;
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity: visible }]}
      pointerEvents="none"
    >
      {columns.map((col, i) => (
        <MatrixColumn key={i} {...col} />
      ))}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// FLOATING PARTICLE
// ─────────────────────────────────────────────

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

interface FloatingParticleProps {
  particle: ParticleData;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({ particle }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: rand(0.4, 0.9),
            duration: particle.duration * 0.3,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: particle.driftX,
            duration: particle.duration,
            easing: ease.inOut,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: particle.driftY,
            duration: particle.duration,
            easing: ease.inOut,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(particle.duration * 0.6),
            Animated.timing(opacity, {
              toValue: 0,
              duration: particle.duration * 0.4,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        particleStyles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
};

const particleStyles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});

// ─────────────────────────────────────────────
// PARTICLE FIELD
// ─────────────────────────────────────────────

const ParticleField: React.FC = () => {
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: rand(0, W),
      y: rand(0, H),
      size: rand(2, 6),
      color: i % 3 === 0 ? C.greenParticle : i % 3 === 1 ? C.cyanParticle : 'rgba(41,121,255,0.7)',
      duration: randInt(3000, 6500),
      delay: randInt(0, 4000),
      driftX: rand(-40, 40),
      driftY: rand(-60, -10),
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p) => (
        <FloatingParticle key={p.id} particle={p} />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// CIRCUIT BOARD LINES
// ─────────────────────────────────────────────

const CircuitLines: React.FC<{ opacity: Animated.Value }> = ({ opacity }) => {
  const paths = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isHorizontal: boolean }[] = [];
    for (let i = 0; i < 18; i++) {
      const isHorizontal = i % 2 === 0;
      if (isHorizontal) {
        lines.push({
          x1: rand(0, W * 0.3),
          y1: rand(H * 0.05, H * 0.95),
          x2: rand(W * 0.6, W),
          y2: rand(H * 0.05, H * 0.95),
          isHorizontal: true,
        });
      } else {
        lines.push({
          x1: rand(W * 0.05, W * 0.95),
          y1: rand(0, H * 0.3),
          x2: rand(W * 0.05, W * 0.95),
          y2: rand(H * 0.6, H),
          isHorizontal: false,
        });
      }
    }
    return lines;
  }, []);

  const animations = useRef(
    paths.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const anims = animations.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 120),
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: ease.out,
          useNativeDriver: false,
        }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity }]}
      pointerEvents="none"
    >
      {paths.map((path, i) => {
        const width = Math.abs(path.x2 - path.x1) || 2;
        const height = Math.abs(path.y2 - path.y1) || 2;
        const isH = path.isHorizontal;
        const animatedWidth = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, isH ? width : 1.5],
        });
        const animatedHeight = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, isH ? 1.5 : height],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: Math.min(path.x1, path.x2),
              top: Math.min(path.y1, path.y2),
              width: animatedWidth,
              height: animatedHeight,
              backgroundColor: i % 4 === 0 ? C.greenSoft : C.gridLineBright,
            }}
          />
        );
      })}
      {/* Circuit nodes */}
      {paths.map((path, i) => {
        const nodeOpacity = animations[i];
        return (
          <Animated.View
            key={`node-${i}`}
            style={{
              position: 'absolute',
              left: path.x1 - 3,
              top: path.y1 - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i % 3 === 0 ? C.greenPrimary : C.cyanBright,
              opacity: nodeOpacity,
            }}
          />
        );
      })}
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// HEX GRID BACKGROUND
// ─────────────────────────────────────────────

const HexGrid: React.FC<{ opacity: Animated.Value }> = ({ opacity }) => {
  const hexSize = IS_TABLET ? 44 : 32;
  const hexW = hexSize * 2;
  const hexH = hexSize * Math.sqrt(3);
  const cols = Math.ceil(W / hexW) + 2;
  const rows = Math.ceil(H / hexH) + 2;

  const hexes = useMemo(() => {
    const result: { cx: number; cy: number; key: string; bright: boolean }[] = [];
    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const cx = c * hexW + (r % 2 === 0 ? 0 : hexW / 2);
        const cy = r * hexH;
        result.push({
          cx,
          cy,
          key: `${r}-${c}`,
          bright: Math.random() < 0.08,
        });
      }
    }
    return result;
  }, []);

  const drawHexPath = (cx: number, cy: number, size: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    }
    return pts;
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity }]}
      pointerEvents="none"
    >
      {hexes.map((hex) => {
        const pts = drawHexPath(hex.cx, hex.cy, hexSize - 2);
        return (
          <View
            key={hex.key}
            style={[
              hexGridStyles.hex,
              {
                left: hex.cx - hexSize,
                top: hex.cy - hexSize * 0.866,
                width: hexSize * 2,
                height: hexSize * 1.732,
                borderColor: hex.bright ? C.gridLineBright : C.gridLine,
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const hexGridStyles = StyleSheet.create({
  hex: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
});

// ─────────────────────────────────────────────
// SCAN LINE
// ─────────────────────────────────────────────

const ScanLine: React.FC = () => {
  const translateY = useRef(new Animated.Value(-H * 0.1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(translateY, {
        toValue: H * 1.1,
        duration: 3800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[scanStyles.line, { transform: [{ translateY }] }]}
      pointerEvents="none"
    />
  );
};

const scanStyles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,230,118,0.18)',
  },
});

// ─────────────────────────────────────────────
// PULSE RINGS (expanding from logo center)
// ─────────────────────────────────────────────

interface PulseRingProps {
  delay: number;
  color: string;
  maxSize: number;
  cy: number;
}

const PulseRing: React.FC<PulseRingProps> = ({ delay, color, maxSize, cy }) => {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1900,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.2, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        pulseStyles.ring,
        {
          width: maxSize,
          height: maxSize,
          borderRadius: maxSize / 2,
          borderColor: color,
          top: cy - maxSize / 2,
          left: W / 2 - maxSize / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
};

const pulseStyles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});

// ─────────────────────────────────────────────
// LOGO CORE — logo + glow + rings
// ─────────────────────────────────────────────

const LOGO_SIZE = Math.min(W * 0.44, 200);
const LOGO_CY = H * 0.38;

interface LogoCoreProps {
  revealAnim: Animated.Value;
}

const LogoCore: React.FC<LogoCoreProps> = ({ revealAnim }) => {
  const glowPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1800,
          easing: ease.inOut,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 1800,
          easing: ease.inOut,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const logoScale = revealAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.0, 1.12, 1],
  });
  const logoOpacity = revealAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 1, 1],
  });
  const ringScale = revealAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.3, 1.05, 1],
  });
  const ringOpacity = revealAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });
  const glowOpacity = Animated.multiply(revealAnim, glowPulse);

  return (
    <View
      style={[logoStyles.container, { top: LOGO_CY - LOGO_SIZE / 2 }]}
      pointerEvents="none"
    >
      {/* Outer ambient glow */}
      <Animated.View
        style={[
          logoStyles.glowOuter,
          {
            width: LOGO_SIZE + 110,
            height: LOGO_SIZE + 110,
            borderRadius: (LOGO_SIZE + 110) / 2,
            opacity: Animated.multiply(revealAnim, glowPulse),
          },
        ]}
      />

      {/* Mid glow */}
      <Animated.View
        style={[
          logoStyles.glowMid,
          {
            width: LOGO_SIZE + 60,
            height: LOGO_SIZE + 60,
            borderRadius: (LOGO_SIZE + 60) / 2,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Outer decorative ring */}
      <Animated.View
        style={[
          logoStyles.ringOuter,
          {
            width: LOGO_SIZE + 48,
            height: LOGO_SIZE + 48,
            borderRadius: (LOGO_SIZE + 48) / 2,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* Inner decorative ring */}
      <Animated.View
        style={[
          logoStyles.ringInner,
          {
            width: LOGO_SIZE + 20,
            height: LOGO_SIZE + 20,
            borderRadius: (LOGO_SIZE + 20) / 2,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* The logo */}
      <Animated.Image
        source={LOGO}
        style={[
          logoStyles.logo,
          {
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const logoStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowOuter: {
    position: 'absolute',
    backgroundColor: 'rgba(0,230,118,0.06)',
  },
  glowMid: {
    position: 'absolute',
    backgroundColor: 'rgba(0,230,118,0.12)',
  },
  ringOuter: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,230,118,0.35)',
    backgroundColor: 'transparent',
  },
  ringInner: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(29,233,182,0.55)',
    backgroundColor: 'transparent',
  },
  logo: {
    borderRadius: 4,
  },
});

// ─────────────────────────────────────────────
// BRAND TEXT — "TARU GUARDIANS"
// ─────────────────────────────────────────────

interface BrandTextProps {
  titleAnim: Animated.Value;
  subtitleAnim: Animated.Value;
}

const BrandText: React.FC<BrandTextProps> = ({ titleAnim, subtitleAnim }) => {
  const titleY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const subY = subtitleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  return (
    <View style={brandStyles.container} pointerEvents="none">
      {/* Club name */}
      <Animated.Text
        style={[
          brandStyles.title,
          { opacity: titleAnim, transform: [{ translateY: titleY }] },
        ]}
      >
        TARU GUARDIANS
      </Animated.Text>

      {/* Divider line */}
      <Animated.View
        style={[brandStyles.divider, { opacity: subtitleAnim, scaleX: subtitleAnim }]}
      />

      {/* Sub label */}
      <Animated.Text
        style={[
          brandStyles.subtitle,
          { opacity: subtitleAnim, transform: [{ translateY: subY }] },
        ]}
      >
        HIT HALDIA · TECH CLUB
      </Animated.Text>
    </View>
  );
};

const brandStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: H * 0.28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: IS_SMALL ? 24 : IS_TABLET ? 40 : 30,
    fontWeight: '900',
    color: C.whiteFull,
    letterSpacing: IS_SMALL ? 4 : 7,
    textAlign: 'center',
  },
  divider: {
    width: IS_SMALL ? 100 : 140,
    height: 1.5,
    backgroundColor: C.greenPrimary,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: IS_SMALL ? 10 : 11,
    fontWeight: '700',
    color: C.greenSoft,
    letterSpacing: 3.5,
    textAlign: 'center',
  },
});

// ─────────────────────────────────────────────
// PASSION TAGLINE — "Turn Passion Into Purpose"
// letter-by-letter reveal
// ─────────────────────────────────────────────

const PASSION_TEXT = 'Turn Passion Into Purpose';
const PASSION_CHARS = PASSION_TEXT.split('');

interface PassionTaglineProps {
  masterAnim: Animated.Value;
}

const PassionTagline: React.FC<PassionTaglineProps> = ({ masterAnim }) => {
  const charAnims = useRef(
    PASSION_CHARS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const listener = masterAnim.addListener(({ value }) => {
      if (value > 0.05) {
        masterAnim.removeAllListeners();
        const stagger = Animated.stagger(
          38,
          charAnims.map((a) =>
            Animated.spring(a, {
              toValue: 1,
              friction: 6,
              tension: 120,
              useNativeDriver: true,
            })
          )
        );
        stagger.start();
      }
    });
    return () => masterAnim.removeAllListeners();
  }, []);

  return (
    <Animated.View
      style={[passionStyles.container, { opacity: masterAnim }]}
      pointerEvents="none"
    >
      <View style={passionStyles.row}>
        {PASSION_CHARS.map((ch, i) => {
          const isSpace = ch === ' ';
          return (
            <Animated.Text
              key={i}
              style={[
                passionStyles.char,
                isSpace && passionStyles.space,
                {
                  opacity: charAnims[i],
                  transform: [
                    {
                      translateY: charAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 0],
                      }),
                    },
                    {
                      scale: charAnims[i].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.6, 1.1, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {ch}
            </Animated.Text>
          );
        })}
      </View>

      {/* Underline glow */}
      <Animated.View
        style={[
          passionStyles.underline,
          {
            opacity: masterAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const passionStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: H * 0.21,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  char: {
    fontSize: IS_SMALL ? 16 : IS_TABLET ? 28 : 20,
    fontWeight: '800',
    color: C.cyanBright,
    letterSpacing: 0.5,
  },
  space: {
    width: IS_SMALL ? 7 : 9,
  },
  underline: {
    marginTop: 6,
    width: IS_SMALL ? 200 : 260,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.cyanBright,
  },
});

// ─────────────────────────────────────────────
// SHORT CIRCUIT OVERLOAD EFFECT
// Electric arcs · sparks · surge flash · overload
// ─────────────────────────────────────────────

// Generates a zigzag lightning bolt path as a series of small segments
const makeBoltPoints = (
  x1: number, y1: number,
  x2: number, y2: number,
  segments: number
): { x: number; y: number }[] => {
  const pts: { x: number; y: number }[] = [{ x: x1, y: y1 }];
  const dx = (x2 - x1) / segments;
  const dy = (y2 - y1) / segments;
  for (let i = 1; i < segments; i++) {
    const jitter = rand(-22, 22);
    const isH = Math.abs(dx) > Math.abs(dy);
    pts.push({
      x: x1 + dx * i + (isH ? 0 : jitter),
      y: y1 + dy * i + (isH ? jitter : 0),
    });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
};

// Single electric arc bolt
interface ArcBoltProps {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
  delay: number;
  duration: number;
  thickness: number;
}

const ArcBolt: React.FC<ArcBoltProps> = ({
  x1, y1, x2, y2, color, delay, duration, thickness,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [pts] = useState(() => makeBoltPoints(x1, y1, x2, y2, randInt(6, 12)));

  useEffect(() => {
    const fire = () => {
      const gap = randInt(600, 2200);
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(opacity, { toValue: rand(0.7, 1), duration: 30, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: rand(0.2, 0.5), duration: 40, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: rand(0.8, 1), duration: 25, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: duration, useNativeDriver: true }),
        ]).start(() => fire());
      }, gap);
    };
    const id = setTimeout(fire, delay);
    return () => clearTimeout(id);
  }, []);

  // Render as a chain of small line segments between points
  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity }]}
      pointerEvents="none"
    >
      {pts.slice(0, -1).map((pt, i) => {
        const next = pts[i + 1];
        const segW = Math.sqrt(Math.pow(next.x - pt.x, 2) + Math.pow(next.y - pt.y, 2));
        const angle = Math.atan2(next.y - pt.y, next.x - pt.x) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y - thickness / 2,
              width: segW,
              height: thickness,
              backgroundColor: color,
              borderRadius: thickness,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0% 50%',
            } as any}
          />
        );
      })}
      {/* Spark at end point */}
      <View
        style={{
          position: 'absolute',
          left: x2 - 4,
          top: y2 - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#ffffff',
        }}
      />
    </Animated.View>
  );
};

// Flying spark particle
interface SparkProps {
  ox: number; oy: number;
  angle: number; speed: number;
  color: string; delay: number;
}

const Spark: React.FC<SparkProps> = ({ ox, oy, angle, speed, color, delay }) => {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const rad = (angle * Math.PI) / 180;
  const destX = Math.cos(rad) * speed;
  const destY = Math.sin(rad) * speed;

  useEffect(() => {
    const fire = () => {
      tx.setValue(0); ty.setValue(0); scale.setValue(1);
      const gap = randInt(800, 3000);
      setTimeout(() => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 40, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.timing(tx, { toValue: destX, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ty, { toValue: destY, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.1, duration: 360, useNativeDriver: true }),
        ]).start(() => fire());
      }, gap);
    };
    const id = setTimeout(fire, delay);
    return () => clearTimeout(id);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: ox - 2,
        top: oy - 2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX: tx }, { translateY: ty }, { scale }],
      }}
      pointerEvents="none"
    />
  );
};

// Full-screen surge flash
interface SurgeFlashProps { trigger: Animated.Value }

const SurgeFlash: React.FC<SurgeFlashProps> = ({ trigger }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const surge = () => {
      const gap = randInt(1200, 3500);
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(opacity, { toValue: rand(0.06, 0.16), duration: 35, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.01, duration: 50, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: rand(0.08, 0.2), duration: 30, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start(() => surge());
      }, gap);
    };
    surge();
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: '#d4ff00', opacity }]}
      pointerEvents="none"
    />
  );
};

// Overloaded circuit node — a bright glowing dot that flickers
interface OverloadNodeProps { x: number; y: number; color: string; delay: number }

const OverloadNode: React.FC<OverloadNodeProps> = ({ x, y, color, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: rand(0.7, 1), duration: randInt(60, 140), useNativeDriver: true }),
            Animated.timing(scale, { toValue: rand(1.2, 2.0), duration: randInt(60, 140), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: rand(0.1, 0.4), duration: randInt(80, 200), useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: randInt(80, 200), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(id);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - 5,
        top: y - 5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
      pointerEvents="none"
    />
  );
};

// Master short-circuit assembly
interface ShortCircuitProps { masterAnim: Animated.Value }

const ShortCircuit: React.FC<ShortCircuitProps> = ({ masterAnim }) => {
  // Static bolt configs — computed once
  const bolts = useMemo<ArcBoltProps[]>(() => [
    // Top-left cluster
    { x1: 0,        y1: rand(H*0.1, H*0.3),  x2: rand(W*0.3, W*0.5), y2: rand(H*0.2, H*0.45), color: '#ffffff', delay: 0,    duration: 120, thickness: 2.5 },
    { x1: rand(W*0.05,W*0.15), y1: rand(H*0.05,H*0.2), x2: rand(W*0.4,W*0.6), y2: rand(H*0.3,H*0.5), color: '#00e5ff', delay: 300,  duration: 90,  thickness: 1.5 },
    // Right side
    { x1: W,        y1: rand(H*0.2, H*0.4),  x2: rand(W*0.5, W*0.7), y2: rand(H*0.3, H*0.55), color: '#d4ff00', delay: 180,  duration: 100, thickness: 2 },
    { x1: W,        y1: rand(H*0.5, H*0.7),  x2: rand(W*0.4, W*0.7), y2: rand(H*0.55, H*0.75), color: '#ffffff', delay: 600,  duration: 80,  thickness: 1.5 },
    // Bottom cluster
    { x1: rand(W*0.1,W*0.3), y1: H, x2: rand(W*0.3,W*0.55), y2: rand(H*0.6,H*0.8), color: '#ff6d00', delay: 400,  duration: 110, thickness: 2 },
    { x1: rand(W*0.6,W*0.85), y1: H, x2: rand(W*0.45,W*0.65), y2: rand(H*0.65,H*0.85), color: '#00e5ff', delay: 750,  duration: 95,  thickness: 1.5 },
    // Diagonal cross bolts
    { x1: 0,        y1: H*0.6,  x2: W*0.45, y2: H*0.42, color: '#d4ff00', delay: 550,  duration: 130, thickness: 1.5 },
    { x1: W,        y1: H*0.3,  x2: W*0.55, y2: H*0.48, color: '#ffffff', delay: 900,  duration: 85,  thickness: 2 },
    // Short local arcs near logo
    { x1: W*0.2, y1: H*0.42, x2: W*0.38, y2: H*0.36, color: '#00e5ff', delay: 1100, duration: 70, thickness: 1 },
    { x1: W*0.8, y1: H*0.44, x2: W*0.62, y2: H*0.38, color: '#ffffff', delay: 1300, duration: 70, thickness: 1 },
  ], []);

  // Sparks bursting from hot nodes
  const nodes = useMemo(() => [
    { x: W * 0.18, y: H * 0.32 },
    { x: W * 0.82, y: H * 0.28 },
    { x: W * 0.12, y: H * 0.65 },
    { x: W * 0.88, y: H * 0.62 },
    { x: W * 0.50, y: H * 0.78 },
    { x: W * 0.35, y: H * 0.22 },
    { x: W * 0.65, y: H * 0.20 },
  ], []);

  const sparks = useMemo(() => {
    const result: SparkProps[] = [];
    nodes.forEach((node, ni) => {
      for (let a = 0; a < 360; a += randInt(28, 48)) {
        result.push({
          ox: node.x, oy: node.y,
          angle: a,
          speed: rand(18, 55),
          color: ni % 3 === 0 ? '#ffffff' : ni % 3 === 1 ? '#d4ff00' : '#00e5ff',
          delay: randInt(0, 1800),
        });
      }
    });
    return result;
  }, []);

  const overloadNodes = useMemo(() => nodes.map((n, i) => ({
    ...n,
    color: i % 2 === 0 ? '#ffffff' : '#d4ff00',
    delay: i * 120,
  })), []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity: masterAnim }]}
      pointerEvents="none"
    >
      {/* Arc bolts */}
      {bolts.map((b, i) => <ArcBolt key={`bolt-${i}`} {...b} />)}

      {/* Flying sparks */}
      {sparks.map((s, i) => <Spark key={`spark-${i}`} {...s} />)}

      {/* Overloaded nodes */}
      {overloadNodes.map((n, i) => <OverloadNode key={`node-${i}`} {...n} />)}

      {/* Surge flash */}
      <SurgeFlash trigger={masterAnim} />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// PROGRESS HUD
// ─────────────────────────────────────────────

interface ProgressHUDProps {
  progress: Animated.Value;
  stageLabel: string;
  stageAnim: Animated.Value;
}

const ProgressHUD: React.FC<ProgressHUDProps> = ({
  progress,
  stageLabel,
  stageAnim,
}) => {
  const barWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  const labelY = stageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });

  return (
    <View style={hudStyles.container} pointerEvents="none">
      {/* Stage label */}
      <Animated.Text
        style={[
          hudStyles.stageLabel,
          { opacity: stageAnim, transform: [{ translateY: labelY }] },
        ]}
      >
        {stageLabel}
      </Animated.Text>

      {/* Progress track */}
      <View style={hudStyles.track}>
        <Animated.View style={[hudStyles.fill, { width: barWidth }]}>
          {/* Glowing tip */}
          <View style={hudStyles.fillTip} />
        </Animated.View>
      </View>

      {/* Percentage */}
      <Animated.Text style={[hudStyles.pct, { opacity: stageAnim }]}>
        <AnimatedPercent progress={progress} />
      </Animated.Text>
    </View>
  );
};

// Helper to display animated percentage
const AnimatedPercent: React.FC<{ progress: Animated.Value }> = ({
  progress,
}) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      setPct(Math.round(value));
    });
    return () => progress.removeListener(id);
  }, []);
  return <>{pct}%</>;
};

const hudStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: H * 0.06,
    left: IS_SMALL ? 24 : 32,
    right: IS_SMALL ? 24 : 32,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.greenSoft,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  track: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: C.greenPrimary,
    borderRadius: 2,
    position: 'relative',
  },
  fillTip: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.cyanBright,
  },
  pct: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '700',
    color: C.whiteLow,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'right',
  },
});

// ─────────────────────────────────────────────
// SKIP BUTTON
// ─────────────────────────────────────────────

interface SkipButtonProps {
  onSkip: () => void;
  opacity: Animated.Value;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onSkip, opacity }) => (
  <Animated.View style={[skipStyles.wrap, { opacity }]}>
    <Pressable onPress={onSkip} hitSlop={12} style={skipStyles.pill}>
      <Text style={skipStyles.text}>Skip  ›</Text>
    </Pressable>
  </Animated.View>
);

const skipStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: IS_TABLET ? 64 : 52,
    right: 20,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  text: {
    color: C.whiteMid,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

interface FooterProps {
  opacity: Animated.Value;
}

const Footer: React.FC<FooterProps> = ({ opacity }) => (
  <Animated.View style={[footerStyles.container, { opacity }]} pointerEvents="none">
    <Text style={footerStyles.brand}>TARU GUARDIANS</Text>
    <View style={footerStyles.dot} />
    <Text style={footerStyles.tagline}>Rooted in Nature · Built on Code</Text>
  </Animated.View>
);

const footerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: IS_TABLET ? 60 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 9,
    fontWeight: '900',
    color: C.whiteLow,
    letterSpacing: 3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.greenPrimary,
    marginHorizontal: 10,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '500',
    color: C.whiteLow,
    letterSpacing: 1,
  },
});

// ─────────────────────────────────────────────
// DATA STREAM LINES (vertical binary streams)
// ─────────────────────────────────────────────

interface DataStreamProps {
  x: number;
  delay: number;
}

const DataStream: React.FC<DataStreamProps> = ({ x, delay }) => {
  const translateY = useRef(new Animated.Value(-H)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [bits] = useState(() =>
    Array.from({ length: 24 }, () => (Math.random() > 0.5 ? '1' : '0'))
  );

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: rand(0.05, 0.18), duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, {
            toValue: H * 1.2,
            duration: randInt(5000, 9000),
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -H, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        streamStyles.stream,
        { left: x, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      {bits.map((b, i) => (
        <Text key={i} style={streamStyles.bit}>
          {b}
        </Text>
      ))}
    </Animated.View>
  );
};

const streamStyles = StyleSheet.create({
  stream: {
    position: 'absolute',
    top: 0,
    flexDirection: 'column',
  },
  bit: {
    color: C.greenSoft,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 14,
    textAlign: 'center',
    width: 12,
  },
});

const DataStreamLayer: React.FC = () => {
  const streams = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: rand(0, W - 14),
        delay: randInt(0, 5000),
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {streams.map((s, i) => (
        <DataStream key={i} x={s.x} delay={s.delay} />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// GLITCH FLASH (subtle, techy)
// ─────────────────────────────────────────────

const GlitchFlash: React.FC = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glitch = () => {
      const delay = randInt(1800, 4500);
      setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: rand(0.04, 0.09), duration: 40, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: rand(-8, 8), duration: 40, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 40, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
        ]).start(() => glitch());
      }, delay);
    };
    glitch();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: C.cyanBright,
          opacity,
          transform: [{ translateX }],
        },
      ]}
      pointerEvents="none"
    />
  );
};

// ─────────────────────────────────────────────
// STAGE DEFINITIONS
// ─────────────────────────────────────────────

interface Stage {
  label: string;
  progressStart: number;
  progressEnd: number;
  startMs: number;
  durationMs: number;
}

const STAGES_DEF: Stage[] = [
  { label: 'INITIALISING', progressStart: 0, progressEnd: 14, startMs: 0, durationMs: 1000 },
  { label: 'LOADING MATRIX', progressStart: 14, progressEnd: 32, startMs: 1000, durationMs: 1200 },
  { label: 'CALIBRATING', progressStart: 32, progressEnd: 52, startMs: 2200, durationMs: 1000 },
  { label: 'BUILDING IDENTITY', progressStart: 52, progressEnd: 72, startMs: 3200, durationMs: 1400 },
  { label: 'ACTIVATING PURPOSE', progressStart: 72, progressEnd: 90, startMs: 4600, durationMs: 1200 },
  { label: 'WELCOME, GUARDIAN', progressStart: 90, progressEnd: 100, startMs: 5800, durationMs: 1700 },
];

// ─────────────────────────────────────────────
// MAIN SPLASH SCREEN COMPONENT
// ─────────────────────────────────────────────

export interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
  allowSkip?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  allowSkip = true,
}) => {
  // ── Master progress & stage ──────────────────
  const [stageIndex, setStageIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stageTextAnim = useRef(new Animated.Value(0)).current;

  // ── Layer anims ──────────────────────────────
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const hexOpacity = useRef(new Animated.Value(0)).current;
  const circuitOpacity = useRef(new Animated.Value(0)).current;
  const matrixOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;

  // ── Logo & text ──────────────────────────────
  const logoRevealAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const passionAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // ── Finish handler ───────────────────────────
  const hasFinished = useRef(false);

  const finish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    Animated.timing(rootOpacity, {
      toValue: 0,
      duration: 800,
      easing: ease.inOut,
      useNativeDriver: true,
    }).start(() => onComplete());
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    finish();
  }, [finish]);

  // ── Main timeline ────────────────────────────

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
    };

    // ── 0 ms: Background fade in ──
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 500,
      easing: ease.out,
      useNativeDriver: true,
    }).start();

    // ── 300 ms: Hex grid ──
    t(300, () => {
      Animated.timing(hexOpacity, {
        toValue: 1,
        duration: 800,
        easing: ease.out,
        useNativeDriver: true,
      }).start();
    });

    // ── 400 ms: Footer + skip ──
    t(400, () => {
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 700,
          easing: ease.out,
          useNativeDriver: true,
        }),
        Animated.timing(skipOpacity, {
          toValue: 1,
          duration: 500,
          easing: ease.out,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // ── 600 ms: Circuit lines ──
    t(600, () => {
      Animated.timing(circuitOpacity, {
        toValue: 0.8,
        duration: 600,
        easing: ease.out,
        useNativeDriver: true,
      }).start();
    });

    // ── 1 000 ms: Matrix rain ──
    t(T.matrixStart, () => {
      Animated.timing(matrixOpacity, {
        toValue: 1,
        duration: 500,
        easing: ease.out,
        useNativeDriver: true,
      }).start();
    });

    // ── 1 600 ms: Logo reveal ──
    t(T.logoRevealStart, () => {
      Animated.timing(logoRevealAnim, {
        toValue: 1,
        duration: T.logoRevealDur,
        easing: ease.spring,
        useNativeDriver: true,
      }).start();
    });

    // ── 2 600 ms: Title ──
    t(T.titleRevealStart, () => {
      Animated.stagger(180, [
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 550,
          easing: ease.out,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleAnim, {
          toValue: 1,
          duration: 450,
          easing: ease.out,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // ── 4 200 ms: "Turn Passion Into Purpose" ──
    t(T.passionStart, () => {
      Animated.timing(passionAnim, {
        toValue: 1,
        duration: T.passionDur,
        easing: ease.spring,
        useNativeDriver: true,
      }).start();
    });

    // ── 4 800 ms: Short circuit overload ──
    t(T.statsStart, () => {
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 400,
        easing: ease.out,
        useNativeDriver: true,
      }).start();
    });

    // ── Progress bar continuous ──
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: T.totalDur - 600,
      easing: Easing.bezier(0.1, 0.4, 0.6, 1),
      useNativeDriver: false,
    }).start();

    // ── Stage label cycling ──
    STAGES_DEF.forEach((stage, i) => {
      t(stage.startMs, () => {
        setStageIndex(i);
        stageTextAnim.setValue(0);
        Animated.timing(stageTextAnim, {
          toValue: 1,
          duration: 380,
          easing: ease.out,
          useNativeDriver: true,
        }).start();
      });
    });

    // ── Outro ──
    t(T.outroStart, () => finish());

    return () => timers.forEach(clearTimeout);
  }, []);

  const currentStage = STAGES_DEF[stageIndex] ?? STAGES_DEF[0];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <Animated.View style={[splashStyles.root, { opacity: rootOpacity }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.deepBlack}
        translucent={Platform.OS === 'android'}
      />

      {/* ── 1. BACKGROUND GRADIENT ── */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[C.deepBlack, '#040e16', '#071a14', C.deepBlack]}
          locations={[0, 0.35, 0.65, 1]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Radial centre ambient */}
        <View style={splashStyles.radialAmb} />
      </Animated.View>

      {/* ── 2. HEX GRID ── */}
      <HexGrid opacity={hexOpacity} />

      {/* ── 3. DATA STREAMS ── */}
      <DataStreamLayer />

      {/* ── 4. CIRCUIT LINES ── */}
      <CircuitLines opacity={circuitOpacity} />

      {/* ── 5. MATRIX RAIN ── */}
      <MatrixRain visible={matrixOpacity} />

      {/* ── 6. FLOATING PARTICLES ── */}
      <ParticleField />

      {/* ── 7. SCAN LINE ── */}
      <ScanLine />

      {/* ── 8. GLITCH FLASH ── */}
      <GlitchFlash />

      {/* ── 9. PULSE RINGS (behind logo) ── */}
      <PulseRing delay={0} color={C.greenSoft} maxSize={LOGO_SIZE + 160} cy={LOGO_CY} />
      <PulseRing delay={750} color={C.cyanBright} maxSize={LOGO_SIZE + 240} cy={LOGO_CY} />
      <PulseRing delay={1500} color={C.greenPrimary} maxSize={LOGO_SIZE + 320} cy={LOGO_CY} />

      {/* ── 10. LOGO ── */}
      <LogoCore revealAnim={logoRevealAnim} />

      {/* ── 11. BRAND TEXT ── */}
      <BrandText titleAnim={titleAnim} subtitleAnim={subtitleAnim} />

      {/* ── 12. PASSION TAGLINE ── */}
      <PassionTagline masterAnim={passionAnim} />

      {/* ── 13. SHORT CIRCUIT OVERLOAD ── */}
      <ShortCircuit masterAnim={statsAnim} />

      {/* ── 14. PROGRESS HUD ── */}
      <ProgressHUD
        progress={progressAnim}
        stageLabel={currentStage.label}
        stageAnim={stageTextAnim}
      />

      {/* ── 15. FOOTER ── */}
      <Footer opacity={footerOpacity} />

      {/* ── 16. SKIP ── */}
      {allowSkip && (
        <SkipButton onSkip={handleSkip} opacity={skipOpacity} />
      )}

      {/* ── 17. TOP VIGNETTE ── */}
      <View style={splashStyles.vignetteTop} pointerEvents="none" />

      {/* ── 18. BOTTOM VIGNETTE ── */}
      <View style={splashStyles.vignetteBottom} pointerEvents="none" />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// ROOT STYLES
// ─────────────────────────────────────────────

const splashStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.deepBlack,
    overflow: 'hidden',
  },
  radialAmb: {
    position: 'absolute',
    top: H * 0.22,
    left: W * 0.1,
    width: W * 0.8,
    height: H * 0.45,
    borderRadius: W * 0.4,
    backgroundColor: 'rgba(0,180,80,0.045)',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.22,
    backgroundColor: 'transparent',
    // Using borderRadius trick for vignette fade
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.18,
    backgroundColor: 'transparent',
  },
});

export default SplashScreen;

// ─────────────────────────────────────────────
// NAMED RE-EXPORTS (for App.tsx + nav imports)
// ─────────────────────────────────────────────

export { SplashScreen };
