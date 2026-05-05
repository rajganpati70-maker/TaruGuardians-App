// ================================================================
// PHOTO AVATAR — Ultra-Premium Animated Avatar Component
// Rotating gradient ring · Pulsing glow · Particles · Shimmer
// ================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Image,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Types ─────────────────────────────────────────────────────────
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

export interface PhotoAvatarProps {
  name: string;
  color?: string;
  size?: AvatarSize;
  isMentor?: boolean;
  isFeatured?: boolean;
  badge?: string;
  containerStyle?: any;
  showParticles?: boolean;
}

// ── Size tables ───────────────────────────────────────────────────
const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 30,
  sm: 46,
  md: 62,
  lg: 86,
  xl: 108,
  hero: 126,
};
const RING_MAP: Record<AvatarSize, number> = {
  xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4, hero: 4,
};
const GAP_MAP: Record<AvatarSize, number> = {
  xs: 2, sm: 2, md: 2.5, lg: 3, xl: 3, hero: 3.5,
};
const FONT_MAP: Record<AvatarSize, number> = {
  xs: 10, sm: 14, md: 20, lg: 28, xl: 36, hero: 42,
};
const BADGE_MAP: Record<AvatarSize, number> = {
  xs: 10, sm: 13, md: 18, lg: 22, xl: 26, hero: 28,
};

// ── Helpers ───────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0] ?? '').slice(0, 2).join('').toUpperCase();
}

function getAvatarUrl(name: string, px: number): string {
  const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  const res = Math.ceil(px * 2.5);
  return `https://api.dicebear.com/9.x/thumbs/png?seed=${seed}&size=${res}&shapeColor=0d6efd,6f42c1,d63384,fd7e14,20c997,0dcaf0,ffc107&backgroundColor=0a1828,0d1f2d,0f1923`;
}

function getParticlePositions(n: number, r: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
}

// ── Component ─────────────────────────────────────────────────────
const PhotoAvatar: React.FC<PhotoAvatarProps> = ({
  name,
  color = '#00D4FF',
  size = 'md',
  isMentor = false,
  isFeatured = false,
  badge,
  containerStyle,
  showParticles,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const shimmer    = useRef(new Animated.Value(0)).current;
  const glow       = useRef(new Animated.Value(0.5)).current;
  const spin       = useRef(new Animated.Value(0)).current;
  const spinSlow   = useRef(new Animated.Value(0)).current;
  const entrance   = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  const px      = SIZE_MAP[size];
  const ring    = RING_MAP[size];
  const gap     = GAP_MAP[size];
  const outer   = px + (ring + gap) * 2;
  const isLarge = size === 'hero' || size === 'xl' || size === 'lg';
  const hasGlow = isMentor || isFeatured;

  useEffect(() => {
    // Entrance spring
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: false,
      tension: 55,
      friction: 8,
    }).start();

    // Shimmer pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 850, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(shimmer, { toValue: 0.15, duration: 850, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    // Glow heartbeat
    if (hasGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0.3, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      ).start();
    }

    // Ring spin — fast
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 5500, easing: Easing.linear, useNativeDriver: false })
    ).start();

    // Ring spin — slow counter
    Animated.loop(
      Animated.timing(spinSlow, { toValue: 1, duration: 10000, easing: Easing.linear, useNativeDriver: false })
    ).start();

    // Particles staggered breathe
    if (showParticles || isLarge) {
      Animated.stagger(
        180,
        particleAnims.map((p) =>
          Animated.loop(
            Animated.sequence([
              Animated.timing(p, { toValue: 1, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
              Animated.timing(p, { toValue: 0.15, duration: 1600, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
            ])
          )
        )
      ).start();
    }
  }, []);

  const rotate1  = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2  = spinSlow.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const glowOp   = hasGlow ? glow : new Animated.Value(0);
  const shimOp   = shimmer.interpolate({ inputRange: [0.15, 1], outputRange: [0.15, 0.8] });
  const entScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const entOp    = entrance;

  const avatarUrl = useMemo(() => getAvatarUrl(name, px), [name, px]);

  const gradCols: [string, string, string, string, string] = [
    color,
    isFeatured ? '#F59E0B' : '#8B5CF6',
    '#EC4899',
    isMentor  ? '#10B981' : '#00D4FF',
    color,
  ];

  const particlePositions = useMemo(
    () => getParticlePositions(8, outer / 2 + 11),
    [outer]
  );

  const badgeSize = BADGE_MAP[size];
  const fontSize  = FONT_MAP[size];

  return (
    <Animated.View
      style={[
        {
          width: outer,
          height: outer,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: entScale }],
          opacity: entOp,
        },
        containerStyle,
      ]}
    >
      {/* ── 1. Outer glow blob ── */}
      {hasGlow && (
        <Animated.View
          style={{
            position: 'absolute',
            width: outer + 22,
            height: outer + 22,
            borderRadius: (outer + 22) / 2,
            backgroundColor: color + '28',
            top: -11,
            left: -11,
            opacity: glowOp,
          }}
        />
      )}

      {/* ── 2. Second halo ring (large sizes only) ── */}
      {isLarge && (
        <Animated.View
          style={{
            position: 'absolute',
            width: outer + 14,
            height: outer + 14,
            borderRadius: (outer + 14) / 2,
            borderWidth: 1,
            borderColor: color + '44',
            top: -7,
            left: -7,
            opacity: glowOp,
          }}
        />
      )}

      {/* ── 3. Particle dots ── */}
      {(showParticles || isLarge) &&
        particlePositions.map((pos, i) => {
          const dotSize = i % 3 === 0 ? 5 : i % 2 === 0 ? 4 : 3;
          const dotColor =
            i % 3 === 0 ? color :
            i % 3 === 1 ? '#F59E0B' :
            '#8B5CF6';
          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                top:  outer / 2 + pos.y - dotSize / 2,
                left: outer / 2 + pos.x - dotSize / 2,
                opacity: particleAnims[i],
                transform: [{ scale: particleAnims[i] }],
              }}
            />
          );
        })}

      {/* ── 4. Spinning gradient ring (layer 1) ── */}
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          overflow: 'hidden',
          position: 'absolute',
        }}
      >
        <Animated.View
          style={{
            width:  outer * 1.55,
            height: outer * 1.55,
            top:  -(outer * 0.275),
            left: -(outer * 0.275),
            transform: [{ rotate: rotate1 }],
          }}
        >
          <LinearGradient
            colors={gradCols}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>
      </View>

      {/* ── 5. Counter-spin accent ring (large) ── */}
      {isLarge && (
        <View
          style={{
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            overflow: 'hidden',
            position: 'absolute',
            opacity: 0.35,
          }}
        >
          <Animated.View
            style={{
              width: outer * 1.55,
              height: outer * 1.55,
              top:  -(outer * 0.275),
              left: -(outer * 0.275),
              transform: [{ rotate: rotate2 }],
            }}
          >
            <LinearGradient
              colors={['#EC4899', color, '#F59E0B', '#6366F1', '#EC4899']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ width: '100%', height: '100%' }}
            />
          </Animated.View>
        </View>
      )}

      {/* ── 6. Dark gap ring (creates separation) ── */}
      <View
        style={{
          width: px + gap * 2,
          height: px + gap * 2,
          borderRadius: (px + gap * 2) / 2,
          backgroundColor: '#080E13',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ── 7a. Image ── */}
        {!imgError && (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: px,
              height: px,
              borderRadius: px / 2,
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
          />
        )}

        {/* ── 7b. Shimmer skeleton (while loading) ── */}
        {!imgLoaded && !imgError && (
          <View
            style={{
              position: 'absolute',
              width: px,
              height: px,
              borderRadius: px / 2,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinearGradient
              colors={['#0D2035', color + '33', '#0D2035']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: color + '1A',
                opacity: shimOp,
              }}
            />
            <Text
              style={{
                color: color + 'BB',
                fontSize: fontSize * 0.9,
                fontWeight: '800',
                letterSpacing: 1.5,
                zIndex: 1,
              }}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}

        {/* ── 7c. Fallback gradient-letter (if image fails) ── */}
        {imgError && (
          <LinearGradient
            colors={[color + 'DD', color + '55', '#0D2035']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: px,
              height: px,
              borderRadius: px / 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: fontSize,
                fontWeight: '900',
                letterSpacing: 1.5,
              }}
            >
              {getInitials(name)}
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* ── 8. Badge dot ── */}
      {(badge != null || isMentor || isFeatured) && (
        <View
          style={{
            position: 'absolute',
            bottom: gap,
            right: gap,
            minWidth: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor:
              isFeatured ? '#F59E0B' :
              isMentor   ? '#10B981' :
              '#6366F1',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#080E13',
            paddingHorizontal: 2,
          }}
        >
          <Text style={{ fontSize: badgeSize * 0.55, lineHeight: badgeSize * 0.95 }}>
            {badge ?? (isFeatured ? '⭐' : '🤝')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default PhotoAvatar;
