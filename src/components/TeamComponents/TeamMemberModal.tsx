// =====================================================
// ULTRA PREMIUM TEAM MEMBER MODAL
// Comprehensive detail view with full profile, stats, achievements
// =====================================================

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { TeamMember } from '../../constants/teamData';
import {
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
} from '../../constants/teamData';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width - 40;

interface TeamMemberModalProps {
  visible: boolean;
  member: TeamMember | null;
  onClose: () => void;
}

// =====================================================
// ANIMATED SECTION COMPONENT
// =====================================================

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay: number;
  style?: object;
}> = ({ children, delay, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// =====================================================
// MAIN MODAL COMPONENT
// =====================================================

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  visible,
  member,
  onClose,
}) => {
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(60)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Inner animations
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const bioOpacity = useRef(new Animated.Value(0)).current;
  const contactOpacity = useRef(new Animated.Value(0)).current;
  const skillsOpacity = useRef(new Animated.Value(0)).current;
  const achievementsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 45,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(headerScale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(statsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(bioOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contactOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(skillsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(achievementsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset inner animations
      headerScale.setValue(0.8);
      statsOpacity.setValue(0);
      bioOpacity.setValue(0);
      contactOpacity.setValue(0);
      skillsOpacity.setValue(0);
      achievementsOpacity.setValue(0);
    }
  }, [visible]);

  // Calculate colors
  const departmentColor = useMemo(() => 
    member ? getDepartmentColor(member.department) : '#00D4FF',
  [member]);
  
  const roleColor = useMemo(() => 
    member ? getRoleColor(member.role) : '#00FF88',
  [member]);
  
  const availabilityColor = useMemo(() => 
    member ? getAvailabilityColor(member.availability) : '#00FF88',
  [member]);
  
  const statusColor = useMemo(() => 
    member ? getStatusColor(member.status) : '#00FF88',
  [member]);

  // Animation interpolations
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '0deg'],
  });

  // Handlers
  const handleEmail = useCallback(() => {
    if (member?.email) {
      Linking.openURL(`mailto:${member.email}`).catch(() => {});
    }
  }, [member?.email]);

  const handleGitHub = useCallback(() => {
    if (member?.github) {
      Linking.openURL(`https://github.com/${member.github}`).catch(() => {});
    }
  }, [member?.github]);

  const handleLinkedIn = useCallback(() => {
    if (member?.linkedin) {
      Linking.openURL(`https://linkedin.com/in/${member.linkedin}`).catch(() => {});
    }
  }, [member?.linkedin]);

  const handleWebsite = useCallback(() => {
    if (member) {
      Linking.openURL(`https://taruguardians.org/team/${member.id}`).catch(() => {});
    }
  }, [member]);

  if (!member) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />

        {/* Modal Container */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideY },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          {/* Top Glow Bar */}
          <View
            style={[styles.glowBar, { backgroundColor: departmentColor }]}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Content ScrollView */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ===================================================== */}
            {/* HEADER SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[
                styles.headerSection,
                { transform: [{ scale: headerScale }] },
              ]}
            >
              {/* Profile Image */}
              <View style={styles.imageContainer}>
                <View
                  style={[
                    styles.imageBorder,
                    { borderColor: departmentColor },
                  ]}
                >
                  <Image
                    source={{ uri: member.image }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
                
                {/* Animated Rings */}
                <Animated.View
                  style={[
                    styles.animatedRing,
                    { borderColor: departmentColor },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.animatedRingInner,
                    { borderColor: roleColor },
                  ]}
                />
                
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: availabilityColor },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {member.availability}
                  </Text>
                </View>
              </View>

              {/* Name */}
              <Text style={styles.memberName}>{member.name}</Text>

              {/* Role Badge */}
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: roleColor + '20' },
                ]}
              >
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                  {member.role}
                </Text>
              </View>

              {/* Department */}
              <View style={styles.departmentContainer}>
                <View
                  style={[
                    styles.departmentDot,
                    { backgroundColor: departmentColor },
                  ]}
                />
                <Text
                  style={[
                    styles.departmentText,
                    { color: departmentColor },
                  ]}
                >
                  {member.department}
                </Text>
              </View>

              {/* Status Tag */}
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: statusColor + '20' },
                ]}
              >
                <Text style={[styles.statusTagText, { color: statusColor }]}>
                  {member.status}
                </Text>
              </View>

              {/* Decorative Row */}
              <View style={styles.decorativeRow}>
                <View
                  style={[
                    styles.decorativeDot,
                    { backgroundColor: departmentColor },
                  ]}
                />
                <View
                  style={[
                    styles.decorativeLine,
                    { backgroundColor: departmentColor },
                  ]}
                />
                <View
                  style={[
                    styles.decorativeDot,
                    { backgroundColor: departmentColor },
                  ]}
                />
              </View>
            </Animated.View>

            {/* ===================================================== */}
            {/* STATS SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.statsSection, { opacity: statsOpacity }]}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: departmentColor },
                    ]}
                  >
                    {member.performance}%
                  </Text>
                  <Text style={styles.statLabel}>Performance</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: roleColor },
                    ]}
                  >
                    {member.completedProjects}
                  </Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: availabilityColor },
                    ]}
                  >
                    ⭐ {member.rating}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: statusColor },
                    ]}
                  >
                    {member.experience}
                  </Text>
                  <Text style={styles.statLabel}>Experience</Text>
                </View>
              </View>
            </Animated.View>

            {/* ===================================================== */}
            {/* BIO SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.section, { opacity: bioOpacity }]}
            >
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{member.bio}</Text>
              </View>
            </Animated.View>

            {/* Quote Section */}
            <Animated.View
              style={[styles.section, { opacity: bioOpacity }]}
            >
              <Text style={styles.sectionTitle}>Favorite Quote</Text>
              <View style={[styles.quoteCard, { borderLeftColor: roleColor }]}>
                <Text style={styles.quoteText}>"{member.quote}"</Text>
              </View>
            </Animated.View>

            {/* Fun Fact Section */}
            <Animated.View
              style={[styles.section, { opacity: bioOpacity }]}
            >
              <Text style={styles.sectionTitle}>Fun Fact</Text>
              <View
                style={[
                  styles.funFactCard,
                  { borderColor: departmentColor + '30' },
                ]}
              >
                <Text style={styles.funFactText}>{member.funFact}</Text>
              </View>
            </Animated.View>

            {/* ===================================================== */}
            {/* CONTACT SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.section, { opacity: contactOpacity }]}
            >
              <Text style={styles.sectionTitle}>Contact</Text>
              
              {/* Email */}
              <TouchableOpacity
                style={styles.contactRow}
                onPress={handleEmail}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: Colors.tech.neonBlue + '20' },
                  ]}
                >
                  <Text style={styles.contactIconText}>✉</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{member.email}</Text>
                </View>
              </TouchableOpacity>

              {/* GitHub */}
              {member.github && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={handleGitHub}
                >
                  <View
                    style={[
                      styles.contactIcon,
                      { backgroundColor: Colors.text.primary + '20' },
                    ]}
                  >
                    <Text style={styles.contactIconText}>GH</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>GitHub</Text>
                    <Text style={styles.contactValue}>@{member.github}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* LinkedIn */}
              {member.linkedin && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={handleLinkedIn}
                >
                  <View
                    style={[
                      styles.contactIcon,
                      { backgroundColor: Colors.tech.electricBlue + '20' },
                    ]}
                  >
                    <Text style={styles.contactIconText}>LI</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>LinkedIn</Text>
                    <Text style={styles.contactValue}>@{member.linkedin}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Location */}
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: Colors.accent.softGold + '20' },
                  ]}
                >
                  <Text style={styles.contactIconText}>📍</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Location</Text>
                  <Text style={styles.contactValue}>{member.location}</Text>
                </View>
              </View>

              {/* Response Time */}
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: Colors.nature.leafGreen + '20' },
                  ]}
                >
                  <Text style={styles.contactIconText}>⏱</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Response Time</Text>
                  <Text style={styles.contactValue}>{member.responseTime}</Text>
                </View>
              </View>

              {/* Join Date */}
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: Colors.accent.gold + '20' },
                  ]}
                >
                  <Text style={styles.contactIconText}>📅</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Join Date</Text>
                  <Text style={styles.contactValue}>{member.joinDate}</Text>
                </View>
              </View>
            </Animated.View>

            {/* ===================================================== */}
            {/* SKILLS SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.section, { opacity: skillsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {member.skills.map((skill, index) => (
                  <View
                    key={index}
                    style={[
                      styles.skillBadge,
                      { backgroundColor: departmentColor + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.skillBadgeText,
                        { color: departmentColor },
                      ]}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Expertise Section */}
            <Animated.View
              style={[styles.section, { opacity: skillsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Expertise</Text>
              <View style={styles.skillsContainer}>
                {member.expertise.map((exp, index) => (
                  <View
                    key={index}
                    style={[
                      styles.skillBadge,
                      { backgroundColor: roleColor + '15' },
                    ]}
                  >
                    <Text
                      style={[styles.skillBadgeText, { color: roleColor }]}
                    >
                      {exp}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Favorite Tech Section */}
            <Animated.View
              style={[styles.section, { opacity: skillsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Favorite Tech</Text>
              <View style={styles.skillsContainer}>
                {member.favoriteTech.map((tech, index) => (
                  <View
                    key={index}
                    style={[
                      styles.techBadge,
                      { backgroundColor: Colors.nature.leafGreen + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.techBadgeText,
                        { color: Colors.nature.leafGreen },
                      ]}
                    >
                      ⚡ {tech}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Languages */}
            <Animated.View
              style={[styles.section, { opacity: skillsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.skillsContainer}>
                {member.languages.map((lang, index) => (
                  <View
                    key={index}
                    style={[
                      styles.languageBadge,
                      { backgroundColor: Colors.tech.electricBlue + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageBadgeText,
                        { color: Colors.tech.electricBlue },
                      ]}
                    >
                      🗣 {lang}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* ===================================================== */}
            {/* PROJECTS SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.section, { opacity: skillsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Projects</Text>
              {member.projects.map((project, index) => (
                <View
                  key={index}
                  style={[
                    styles.projectItem,
                    { borderLeftColor: departmentColor },
                  ]}
                >
                  <View
                    style={[
                      styles.projectDot,
                      { backgroundColor: departmentColor },
                    ]}
                  />
                  <Text style={styles.projectText}>{project}</Text>
                </View>
              ))}
            </Animated.View>

            {/* ===================================================== */}
            {/* ACHIEVEMENTS SECTION */}
            {/* ===================================================== */}
            <Animated.View
              style={[styles.section, { opacity: achievementsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Achievements</Text>
              {member.achievements.map((achievement, index) => (
                <View
                  key={index}
                  style={[
                    styles.achievementItem,
                    { borderColor: Colors.accent.softGold + '20' },
                  ]}
                >
                  <Text style={styles.achievementEmoji}>🏆</Text>
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Certifications */}
            <Animated.View
              style={[styles.section, { opacity: achievementsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.skillsContainer}>
                {member.certifications.map((cert, index) => (
                  <View
                    key={index}
                    style={[
                      styles.certBadge,
                      { backgroundColor: Colors.accent.softGold + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.certBadgeText,
                        { color: Colors.accent.softGold },
                      ]}
                    >
                      ✓ {cert}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Education */}
            <Animated.View
              style={[styles.section, { opacity: achievementsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.educationCard}>
                <Text style={styles.educationIcon}>🎓</Text>
                <Text style={styles.educationText}>{member.education}</Text>
              </View>
            </Animated.View>

            {/* Hobbies */}
            <Animated.View
              style={[styles.section, { opacity: achievementsOpacity }]}
            >
              <Text style={styles.sectionTitle}>Hobbies</Text>
              <View style={styles.skillsContainer}>
                {member.hobbies.map((hobby, index) => (
                  <View
                    key={index}
                    style={[
                      styles.hobbyBadge,
                      { backgroundColor: Colors.tech.neonBlue + '15' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.hobbyBadgeText,
                        { color: Colors.tech.neonBlue },
                      ]}
                    >
                      {hobby}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Bottom Gradient */}
          <View style={styles.bottomGradient} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Modal Container
  modalContainer: {
    width: MODAL_WIDTH,
    maxHeight: height * 0.92,
    backgroundColor: Colors.background.darkForest,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 25,
  },

  // Glow Bar
  glowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    opacity: 0.9,
  },

  // Close Button
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: Colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 18,
    position: 'relative',
  },
  imageBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3.5,
    backgroundColor: Colors.background.deepBlack,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  animatedRing: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 72,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  animatedRingInner: {
    position: 'absolute',
    top: -22,
    left: -22,
    right: -22,
    bottom: -22,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'dotted',
    opacity: 0.25,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.background.darkForest,
  },
  statusBadgeText: {
    fontSize: 10,
    color: Colors.text.primary,
    fontWeight: '800',
  },
  memberName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  roleBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 12,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  departmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  departmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    marginBottom: 18,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  decorativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  decorativeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  decorativeLine: {
    width: 60,
    height: 2.5,
    marginHorizontal: 12,
    borderRadius: 1.5,
  },

  // Stats Section
  statsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  // Bio Card
  bioCard: {
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bioText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 23,
  },

  // Quote Card
  quoteCard: {
    backgroundColor: Colors.tech.neonBlue + '10',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
  },
  quoteText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 23,
  },

  // Fun Fact Card
  funFactCard: {
    backgroundColor: Colors.accent.softGold + '10',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  funFactText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 23,
  },

  // Contact Row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 12,
    padding: 12,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },

  // Skills Container
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Tech Badge
  techBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Language Badge
  languageBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Project Item
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: Colors.background.deepBlack,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  projectText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },

  // Achievement Item
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: Colors.accent.softGold + '10',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  achievementEmoji: {
    fontSize: 22,
    marginRight: 14,
  },
  achievementText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },

  // Cert Badge
  certBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  certBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Education Card
  educationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tech.neonBlue + '10',
    borderRadius: 14,
    padding: 16,
  },
  educationIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  educationText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  // Hobby Badge
  hobbyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hobbyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 40,
  },

  // Bottom Gradient
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: Colors.background.darkForest,
    opacity: 0.95,
  },
});

export default TeamMemberModal;