// =====================================================
// ULTRA PREMIUM TEAM MEMBER CARD COMPONENT
// Advanced animations, glow effects, interactive press states
// =====================================================

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { TeamMember } from '../../constants/teamData';
import {
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
} from '../../constants/teamData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const CARD_HEIGHT = 250;

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  onPress: (member: TeamMember) => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  index,
  onPress,
  onPressIn,
  onPressOut,
}) => {
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Press interaction animations
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressShadow = useRef(new Animated.Value(8)).current;
  const pressGlow = useRef(new Animated.Value(0)).current;
  const pressBrightness = useRef(new Animated.Value(1)).current;
  
  // Color calculations
  const departmentColor = getDepartmentColor(member.department);
  const roleColor = getRoleColor(member.role);
  const availabilityColor = getAvailabilityColor(member.availability);
  const statusColor = getStatusColor(member.status);

  // Entrance animation with staggered delay
  useEffect(() => {
    const staggerDelay = Math.floor(index / 2) * 80;
    
    // Shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Main entrance animation
    Animated.sequence([
      Animated.delay(staggerDelay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 55,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          easing: Animated.utils.Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Press handlers with spring physics
  const handlePressIn = useCallback(() => {
    onPressIn?.();
    
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.92,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(pressShadow, {
        toValue: 25,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(pressGlow, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(pressBrightness, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [onPressIn]);

  const handlePressOut = useCallback(() => {
    onPressOut?.();
    
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(pressShadow, {
        toValue: 8,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(pressGlow, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(pressBrightness, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [onPressOut]);

  // Animation interpolations
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['8deg', '0deg'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 0],
  });

  const glowOpacity = pressGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const shadowRadius = pressShadow.interpolate({
    inputRange: [8, 25],
    outputRange: [8, 25],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressScale) },
            { translateY: translateYAnim },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    >
      <Pressable
        onPress={() => onPress(member)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {/* Glow Effect Layer */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              backgroundColor: departmentColor,
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Main Card Background */}
        <Animated.View
          style={[
            styles.cardBackground,
            {
              shadowOpacity: pressShadow.interpolate({
                inputRange: [8, 25],
                outputRange: [0.25, 0.6],
              }),
              shadowRadius: shadowRadius,
            },
          ]}
        >
          {/* Top Gradient Banner */}
          <View
            style={[
              styles.gradientBanner,
              { backgroundColor: departmentColor },
            ]}
          >
            <Animated.View
              style={[
                styles.shimmerEffect,
                { opacity: shimmerOpacity },
              ]}
            />
          </View>

          {/* Status Indicator */}
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: availabilityColor },
              ]}
            />
            <Text style={styles.statusText}>{member.availability}</Text>
          </View>

          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <Animated.View
              style={[
                styles.imageWrapper,
                {
                  borderColor: departmentColor,
                  transform: [{ scale: pressScale }],
                },
              ]}
            >
              <Image
                source={{ uri: member.image }}
                style={[
                  styles.profileImage,
                  {
                    transform: [{ scale: pressBrightness }],
                  },
                ]}
                resizeMode="cover"
              />
            </Animated.View>
            
            {/* Decorative Rings */}
            <View
              style={[
                styles.decorativeRing,
                { borderColor: roleColor },
              ]}
            />
            <View
              style={[
                styles.decorativeRingInner,
                { borderColor: departmentColor },
              ]}
            />

            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingValue}>{member.rating}</Text>
            </View>

            {/* Performance Badge */}
            <View
              style={[
                styles.performanceBadge,
                {
                  backgroundColor:
                    member.performance >= 90
                      ? Colors.nature.leafGreen
                      : member.performance >= 80
                      ? Colors.accent.softGold
                      : Colors.accent.gold,
                },
              ]}
            >
              <Text style={styles.performanceValue}>
                {member.performance}%
              </Text>
            </View>
          </View>

          {/* Name Section */}
          <View style={styles.nameSection}>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.name}
            </Text>
            
            {/* Role Badge */}
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleColor + '20' },
              ]}
            >
              <Text
                style={[styles.roleText, { color: roleColor }]}
                numberOfLines={1}
              >
                {member.role}
              </Text>
            </View>
          </View>

          {/* Department Info */}
          <View style={styles.departmentSection}>
            <View
              style={[
                styles.departmentDot,
                { backgroundColor: departmentColor },
              ]}
            />
            <Text style={styles.departmentText} numberOfLines={1}>
              {member.department}
            </Text>
          </View>

          {/* Performance Bar */}
          <View style={styles.performanceSection}>
            <View style={styles.performanceBarBackground}>
              <Animated.View
                style={[
                  styles.performanceBarFill,
                  {
                    width: `${member.performance}%`,
                    backgroundColor:
                      member.performance >= 90
                        ? Colors.nature.leafGreen
                        : member.performance >= 80
                        ? Colors.accent.softGold
                        : Colors.accent.gold,
                  },
                ]}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {member.location}
            </Text>
          </View>

          {/* Skills Preview */}
          <View style={styles.skillsSection}>
            {member.skills.slice(0, 3).map((skill, skillIndex) => (
              <View
                key={skillIndex}
                style={[
                  styles.skillPill,
                  { backgroundColor: departmentColor + '15' },
                ]}
              >
                <Text
                  style={[styles.skillPillText, { color: departmentColor }]}
                  numberOfLines={1}
                >
                  {skill}
                </Text>
              </View>
            ))}
            {member.skills.length > 3 && (
              <View style={[styles.skillPill, styles.skillPillMore]}>
                <Text style={styles.skillPillMoreText}>
                  +{member.skills.length - 3}
                </Text>
              </View>
            )}
          </View>

          {/* Projects Count */}
          <View style={styles.projectsSection}>
            <Text style={styles.projectsIcon}>📁</Text>
            <Text style={styles.projectsCount}>
              {member.completedProjects} projects
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {member.status}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Shadow Layer */}
        <View style={styles.shadowLayer} />
      </Pressable>
    </Animated.View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 16,
    borderRadius: 24,
  },
  pressable: {
    flex: 1,
    position: 'relative',
  },
  glowLayer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 44,
    opacity: 0,
  },
  cardBackground: {
    flex: 1,
    backgroundColor: Colors.background.darkForest,
    borderRadius: 24,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    opacity: 0.12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shimmerEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 9,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  imageSection: {
    marginTop: 25,
    marginBottom: 10,
    position: 'relative',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 2.5,
    backgroundColor: Colors.background.deepBlack,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  decorativeRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 45,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  decorativeRingInner: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 50,
    borderWidth: 1,
    borderStyle: 'dotted',
    opacity: 0.25,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingIcon: {
    fontSize: 9,
    marginRight: 2,
  },
  ratingValue: {
    fontSize: 9,
    color: Colors.accent.softGold,
    fontWeight: '800',
  },
  performanceBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  performanceValue: {
    fontSize: 9,
    color: Colors.text.primary,
    fontWeight: '800',
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  departmentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  departmentDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  departmentText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  performanceSection: {
    width: '100%',
    marginBottom: 6,
  },
  performanceBarBackground: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  locationText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    flex: 1,
  },
  skillsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 6,
  },
  skillPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
    maxWidth: 65,
  },
  skillPillText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  skillPillMore: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillPillMoreText: {
    fontSize: 8,
    color: Colors.text.muted,
    fontWeight: '600',
  },
  projectsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  projectsIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  projectsCount: {
    fontSize: 10,
    color: Colors.text.tertiary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  shadowLayer: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: 8,
    height: 25,
    backgroundColor: 'transparent',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});

export default TeamMemberCard;