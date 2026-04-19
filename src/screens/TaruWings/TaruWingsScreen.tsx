// =====================================================
// ULTRA PREMIUM TARU WINGS SCREEN
// WITH 6 NESTED SECTIONS
// HIGH-QUALITY UI - ~2000+ LINES
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Share,
  Linking,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { TaruWingsMember, WingSection } from '../../types/navigation';

// =====================================================
// SCREEN DIMENSIONS
// =====================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isTablet = SCREEN_WIDTH >= 768;

// =====================================================
// ANIMATION CONFIGURATION
// =====================================================

const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    easeInOut: Easing.inOut(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    spring: Easing.spring(1, 80, 10),
  },
};

// =====================================================
// WING SECTIONS DATA
// =====================================================

const WING_SECTIONS: WingSection[] = [
  {
    id: '1',
    name: 'Content Writer',
    icon: '✍️',
    color: '#4CAF50',
    description: 'Create engaging content for social media, blogs, newsletters, and marketing materials. Express your creativity through words.',
    memberCount: 25,
    openPositions: ['Senior Writer', 'Blog Writer', 'Social Media Manager'],
  },
  {
    id: '2',
    name: 'Web/App Development',
    icon: '💻',
    color: '#2196F3',
    description: 'Build amazing websites and mobile applications. Work with cutting-edge technologies to create digital solutions.',
    memberCount: 30,
    openPositions: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
  },
  {
    id: '3',
    name: 'Graphic Designer',
    icon: '🎨',
    color: '#9C27B0',
    description: 'Design stunning visuals, logos, posters, and branding materials. Bring ideas to life through design.',
    memberCount: 20,
    openPositions: ['Logo Designer', 'Brand Designer', 'Motion Graphics'],
  },
  {
    id: '4',
    name: 'Video Editor',
    icon: '🎬',
    color: '#FF5722',
    description: 'Edit videos, create animations, and produce compelling visual content. Tell stories through moving images.',
    memberCount: 15,
    openPositions: ['Video Editor', ' animator', 'Documentarian'],
  },
  {
    id: '5',
    name: 'Photographer',
    icon: '📸',
    color: '#FFC107',
    description: 'Capture beautiful moments and create visual memories. Explore photography across various genres.',
    memberCount: 18,
    openPositions: ['Event Photographer', 'Wildlife Photographer', 'Portrait Photographer'],
  },
  {
    id: '6',
    name: 'Public Relations',
    icon: '🤝',
    color: '#00BCD4',
    description: 'Build relationships with media, partners, and the community. Be the voice of Taru Guardians.',
    memberCount: 22,
    openPositions: ['PR Manager', 'Event Coordinator', 'Community Manager'],
  },
];

// =====================================================
// SAMPLE MEMBERS DATA
// =====================================================

const SAMPLE_MEMBERS: TaruWingsMember[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Content Head',
    wing: 'Content Writer',
    year: '2024',
    imageUrl: 'https://example.com/aarav.jpg',
    bio: 'Passionate writer with 5+ years of experience in content creation.',
    email: 'aarav@taruguardians.org',
    skills: ['Copywriting', 'SEO', ' storytelling'],
    portfolio: 'https://portfolio.com/aarav',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Senior Writer',
    wing: 'Content Writer',
    year: '2025',
    imageUrl: 'https://example.com/priya.jpg',
    bio: 'Love crafting compelling narratives that inspire action.',
    email: 'priya@taruguardians.org',
    skills: ['Blog Writing', 'Social Media', 'Email Marketing'],
  },
  {
    id: '3',
    name: 'Raj Mehra',
    role: 'Tech Lead',
    wing: 'Web/App Development',
    year: '2024',
    imageUrl: 'https://example.com/raj.jpg',
    bio: 'Full-stack developer passionate about building great web apps.',
    email: 'raj@taruguardians.org',
    skills: ['React', 'Node.js', 'Python', 'Flutter'],
    portfolio: 'https://portfolio.com/raj',
  },
  {
    id: '4',
    name: 'Ananya Singh',
    role: 'Frontend Developer',
    wing: 'Web/App Development',
    year: '2025',
    imageUrl: 'https://example.com/ananya.jpg',
    bio: 'Creating beautiful and intuitive user interfaces.',
    email: 'ananya@taruguardians.org',
    skills: ['React Native', 'React', 'CSS', 'Figma'],
  },
  {
    id: '5',
    name: 'Kunal Verma',
    role: 'UI/UX Designer',
    wing: 'Web/App Development',
    year: '2025',
    imageUrl: 'https://example.com/kunal.jpg',
    bio: 'Designing user-centered experiences that delight users.',
    email: 'kunal@taruguardians.org',
    skills: ['Figma', 'User Research', 'Prototyping'],
  },
  {
    id: '6',
    name: 'Neha Gupta',
    role: 'Design Lead',
    wing: 'Graphic Designer',
    year: '2024',
    imageUrl: 'https://example.com/neha.jpg',
    bio: 'Award-winning graphic designer with a passion for visual storytelling.',
    email: 'neha@taruguardians.org',
    skills: ['Illustrator', 'Photoshop', 'Brand Design'],
    portfolio: 'https://behance.net/neha',
  },
  {
    id: '7',
    name: 'Arjun Kapoor',
    role: 'Senior Designer',
    wing: 'Graphic Designer',
    year: '2025',
    imageUrl: 'https://example.com/arjun.jpg',
    bio: 'Creating visual identities that make brands memorable.',
    email: 'arjun@taruguardians.org',
    skills: ['Logo Design', 'Packaging', 'Print Design'],
  },
  {
    id: '8',
    name: 'Sanya Malhotra',
    role: 'Motion Designer',
    wing: 'Graphic Designer',
    year: '2025',
    imageUrl: 'https://example.com/sanya.jpg',
    bio: 'Bringing designs to life through animation.',
    email: 'sanya@taruguardians.org',
    skills: ['After Effects', 'Motion Graphics', '3D'],
  },
  {
    id: '9',
    name: 'Vikram Singh',
    role: 'Video Lead',
    wing: 'Video Editor',
    year: '2024',
    imageUrl: 'https://example.com/vikram.jpg',
    bio: 'Professional video editor with expertise in documentary filmmaking.',
    email: 'vikram@taruguardians.org',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading'],
    portfolio: 'https://vimeo.com/vikram',
  },
  {
    id: '10',
    name: 'Ira Jain',
    role: 'Senior Editor',
    wing: 'Video Editor',
    year: '2025',
    imageUrl: 'https://example.com/ira.jpg',
    bio: 'Crafting compelling stories through video editing.',
    email: 'ira@taruguardians.org',
    skills: ['Final Cut', 'Sound Design', 'VFX'],
  },
  {
    id: '11',
    name: 'Aditya Roy',
    role: 'Animator',
    wing: 'Video Editor',
    year: '2025',
    imageUrl: 'https://example.com/aditya.jpg',
    bio: 'Creating animations that captivate audiences.',
    email: 'aditya@taruguardians.org',
    skills: ['Maya', 'Blender', '2D Animation'],
  },
  {
    id: '12',
    name: 'Meera Shah',
    role: 'Photo Lead',
    wing: 'Photographer',
    year: '2024',
    imageUrl: 'https://example.com/meera.jpg',
    bio: 'Award-winning wildlife and nature photographer.',
    email: 'meera@taruguardians.org',
    skills: ['Wildlife', 'Landscape', 'Portrait'],
    portfolio: 'https://instagram.com/meera',
  },
  {
    id: '13',
    name: 'Rohan Khanna',
    role: 'Event Photographer',
    wing: 'Photographer',
    year: '2025',
    imageUrl: 'https://example.com/rohan.jpg',
    bio: 'Capturing memorable moments at events.',
    email: 'rohan@taruguardians.org',
    skills: ['Event Photography', 'Portrait', 'Street'],
  },
  {
    id: '14',
    name: 'Akira Patel',
    role: 'Portrait Photographer',
    wing: 'Photographer',
    year: '2025',
    imageUrl: 'https://example.com/akira.jpg',
    bio: 'Specializing in portrait and fashion photography.',
    email: 'akira@taruguardians.org',
    skills: ['Portrait', 'Fashion', 'Studio'],
  },
  {
    id: '15',
    name: 'Dhruv Mehta',
    role: 'PR Head',
    wing: 'Public Relations',
    year: '2024',
    imageUrl: 'https://example.com/dhruv.jpg',
    bio: 'Building strong relationships with media and partners.',
    email: 'dhruv@taruguardians.org',
    skills: ['Media Relations', 'Networking', 'Communication'],
  },
  {
    id: '16',
    name: 'Sofia Ahmed',
    role: 'Events Coordinator',
    wing: 'Public Relations',
    year: '2025',
    imageUrl: 'https://example.com/sofia.jpg',
    bio: 'Organizing successful events and gatherings.',
    email: 'sofia@taruguardians.org',
    skills: ['Event Planning', 'Coordination', 'Marketing'],
  },
  {
    id: '17',
    name: 'Ishaan Reddy',
    role: 'Community Manager',
    wing: 'Public Relations',
    year: '2025',
    imageUrl: 'https://example.com/ishaan.jpg',
    bio: 'Building and engaging our community online.',
    email: 'ishaan@taruguardians.org',
    skills: ['Social Media', 'Community Management', 'Content'],
  },
  {
    id: '18',
    name: 'Zoya Khan',
    role: 'Senior Writer',
    wing: 'Content Writer',
    year: '2025',
    imageUrl: 'https://example.com/zoya.jpg',
    bio: 'Creating content that resonates with audiences.',
    email: 'zoya@taruguardians.org',
    skills: ['Creative Writing', 'Editing', 'Research'],
  },
];

// =====================================================
// MAIN TARU WINGS SCREEN COMPONENT
// =====================================================

const TaruWingsScreen: React.FC = () => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const [selectedWing, setSelectedWing] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<TaruWingsMember[]>(SAMPLE_MEMBERS);
  const [filteredMembers, setFilteredMembers] = useState<TaruWingsMember[]>(SAMPLE_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<TaruWingsMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationWing, setApplicationWing] = useState<WingSection | null>(null);

  // =====================================================
  // ANIMATION REFS
  // =====================================================

  const animationValues = useRef(
    Array.from({ length: 20 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(50),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Section transition animation
  const sectionTransition = useRef(new Animated.Value(0)).current;

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    startStaggeredAnimations();
  }, []);

  useEffect(() => {
    // Filter members based on selected wing and search
    filterMembers();
  }, [selectedWing, searchQuery, members]);

  useEffect(() => {
    // Animate section transition
    Animated.timing(sectionTransition, {
      toValue: 1,
      duration: ANIMATION_CONFIG.duration.normal,
      useNativeDriver: true,
    }).start(() => {
      sectionTransition.setValue(0);
    });
  }, [selectedWing]);

  const startStaggeredAnimations = () => {
    animationValues.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: ANIMATION_CONFIG.duration.slow,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: ANIMATION_CONFIG.duration.slow,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: ANIMATION_CONFIG.duration.slow,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // =====================================================
  // CALLBACKS
  // =====================================================

  const filterMembers = () => {
    let filtered = members;

    // Filter by wing
    if (selectedWing !== 'all') {
      const wing = WING_SECTIONS.find((w) => w.id === selectedWing);
      if (wing) {
        filtered = filtered.filter((m) => m.wing === wing.name);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query) ||
          m.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    setFilteredMembers(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleWingSelect = (wingId: string) => {
    setSelectedWing(wingId);
  };

  const handleMemberPress = (member: TaruWingsMember) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleApply = (wing: WingSection) => {
    setApplicationWing(wing);
    setShowApplicationModal(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Join Taru Wings - Where your skills make a difference!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContact = (member: TaruWingsMember) => {
    Linking.openURL(`mailto:${member.email}`);
  };

  const handleViewPortfolio = (member: TaruWingsMember) => {
    if (member.portfolio) {
      Linking.openURL(member.portfolio);
    }
  };

  const submitApplication = () => {
    Alert.alert(
      'Application Submitted!',
      `Thank you for your interest in joining ${applicationWing?.name}. We will review your application and get back to you soon.`,
      [{ text: 'OK', onPress: () => setShowApplicationModal(false) }]
    );
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animationValues[0].opacity,
          transform: [{ translateY: animationValues[0].translateY }],
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.background.deepBlack, Colors.primary.deepGreen]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>🌿 Taru Wings</Text>
            <Text style={styles.subTitle}>Showcase Your Skills</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{WING_SECTIONS.length}</Text>
              <Text style={styles.statLabel}>Wings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{members.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Open Roles</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search members or skills..."
              placeholderTextColor={Colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderWingTabs = () => (
    <Animated.View
      style={[
        styles.tabsContainer,
        {
          opacity: animationValues[1].opacity,
          transform: [{ translateY: animationValues[1].translateY }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedWing === 'all' && styles.activeTabButton,
          ]}
          onPress={() => handleWingSelect('all')}
        >
          <Text style={styles.tabIcon}>🌟</Text>
          <Text
            style={[
              styles.tabText,
              selectedWing === 'all' && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {WING_SECTIONS.map((wing) => (
          <TouchableOpacity
            key={wing.id}
            style={[
              styles.tabButton,
              selectedWing === wing.id && styles.activeTabButton,
              selectedWing === wing.id && { backgroundColor: wing.color },
            ]}
            onPress={() => handleWingSelect(wing.id)}
          >
            <Text style={styles.tabIcon}>{wing.icon}</Text>
            <Text
              style={[
                styles.tabText,
                selectedWing === wing.id && styles.activeTabText,
              ]}
              numberOfLines={1}
            >
              {wing.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderWingCards = () => (
    <View style={styles.wingCardsContainer}>
      {WING_SECTIONS.map((wing, index) => (
        <Animated.View
          key={wing.id}
          style={[
            styles.wingCardContainer,
            {
              opacity: animationValues[index + 2]?.opacity || animationValues[0].opacity,
              transform: [
                { translateY: animationValues[index + 2]?.translateY || animationValues[0].translateY },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.wingCard,
              { borderLeftColor: wing.color },
            ]}
            onPress={() => handleWingSelect(wing.id)}
          >
            <View style={[styles.wingIconContainer, { backgroundColor: wing.color + '20' }]}>
              <Text style={styles.wingIcon}>{wing.icon}</Text>
            </View>
            <View style={styles.wingContent}>
              <Text style={styles.wingTitle}>{wing.name}</Text>
              <Text style={styles.wingDescription} numberOfLines={2}>
                {wing.description}
              </Text>
              <View style={styles.wingStats}>
                <Text style={styles.wingMemberCount}>👥 {wing.memberCount} members</Text>
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: wing.color }]}
                  onPress={() => handleApply(wing)}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );

  const renderMembersSection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: animationValues[8].opacity,
          transform: [{ translateY: animationValues[8].translateY }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedWing === 'all'
            ? 'All Members'
            : WING_SECTIONS.find((w) => w.id === selectedWing)?.name + ' Members'}
        </Text>
        <Text style={styles.memberCountText}>{filteredMembers.length} members</Text>
      </View>

      {filteredMembers.length > 0 ? (
        <View style={styles.membersGrid}>
          {filteredMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              style={[
                styles.memberCardWrapper,
                {
                  opacity: animationValues[index + 9]?.opacity || animationValues[0].opacity,
                  transform: [
                    { scale: animationValues[index + 9]?.scale || animationValues[0].scale },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.memberCard}
                onPress={() => handleMemberPress(member)}
              >
                <View style={styles.memberImageContainer}>
                  <View style={styles.memberImagePlaceholder}>
                    <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                  </View>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text
                  style={[
                    styles.memberRole,
                    {
                      color:
                        WING_SECTIONS.find((w) => w.name === member.wing)?.color ||
                        Colors.tech.neonBlue,
                    },
                  ]}
                >
                  {member.role}
                </Text>
                <Text style={styles.memberYear}>Class of {member.year}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Members Found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderJoinSection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: animationValues[15].opacity,
          transform: [{ translateY: animationValues[15].translateY }],
        },
      ]}
    >
      <View style={styles.joinSectionHeader}>
        <Text style={styles.sectionTitle}>🎯 Join a Wing</Text>
      </View>
      <View style={styles.joinCard}>
        <Text style={styles.joinTitle}>
          Ready to contribute your skills?
        </Text>
        <Text style={styles.joinDescription}>
          Browse through our wings and find the perfect fit for your skills.
          Each wing offers unique opportunities to learn and grow.
        </Text>
        <TouchableOpacity style={styles.joinButton} onPress={handleShare}>
          <Text style={styles.joinButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMemberModal = () => (
    <Modal
      visible={showMemberModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowMemberModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Member Profile</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMemberModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedMember && (
            <ScrollView style={styles.modalBody}>
              {/* Profile Header */}
              <View style={styles.modalProfileHeader}>
                <View style={styles.modalProfileImage}>
                  <Text style={styles.modalProfileInitial}>
                    {selectedMember.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.modalMemberName}>{selectedMember.name}</Text>
                <Text
                  style={[
                    styles.modalMemberRole,
                    {
                      color:
                        WING_SECTIONS.find((w) => w.name === selectedMember.wing)
                          ?.color || Colors.tech.neonBlue,
                    },
                  ]}
                >
                  {selectedMember.role} • {selectedMember.wing}
                </Text>
                <Text style={styles.modalMemberYear}>Class of {selectedMember.year}</Text>
              </View>

              {/* Bio */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>About</Text>
                <Text style={styles.modalBio}>{selectedMember.bio}</Text>
              </View>

              {/* Skills */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {selectedMember.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleContact(selectedMember)}
                >
                  <Text style={styles.modalActionIcon}>📧</Text>
                  <Text style={styles.modalActionText}>Email</Text>
                </TouchableOpacity>
                {selectedMember.portfolio && (
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => handleViewPortfolio(selectedMember)}
                  >
                    <Text style={styles.modalActionIcon}>🌐</Text>
                    <Text style={styles.modalActionText}>Portfolio</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderApplicationModal = () => (
    <Modal
      visible={showApplicationModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowApplicationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join {applicationWing?.name}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowApplicationModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {applicationWing && (
              <>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationIcon}>{applicationWing.icon}</Text>
                  <Text style={styles.applicationTitle}>{applicationWing.name}</Text>
                  <Text style={styles.applicationDescription}>
                    {applicationWing.description}
                  </Text>
                </View>

                <View style={styles.openPositionsSection}>
                  <Text style={styles.modalSectionTitle}>Open Positions</Text>
                  {applicationWing.openPositions.map((position, index) => (
                    <View key={index} style={styles.positionItem}>
                      <Text style={styles.positionBullet}>•</Text>
                      <Text style={styles.positionText}>{position}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.requirementsSection}>
                  <Text style={styles.modalSectionTitle}>Requirements</Text>
                  <Text style={styles.requirementText}>
                    • Passion for environmental conservation
                  </Text>
                  <Text style={styles.requirementText}>
                    • Willingness to learn and contribute
                  </Text>
                  <Text style={styles.requirementText}>
                    • Good communication skills
                  </Text>
                  <Text style={styles.requirementText}>
                    • Team spirit and collaboration
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitApplication}
                >
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.deepBlack} />
      {renderHeader()}
      {renderWingTabs()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.tech.neonBlue}
            colors={[Colors.tech.neonBlue]}
          />
        }
      >
        {selectedWing === 'all' && renderWingCards()}
        {renderMembersSection()}
        {renderJoinSection()}
      </ScrollView>
      {renderMemberModal()}
      {renderApplicationModal()}
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =====================================================
  // CONTAINER STYLES
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  // =====================================================
  // HEADER STYLES
  // =====================================================

  headerContainer: {
    marginBottom: 15,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {},
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: isSmallScreen ? 26 : 30,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '700',
    color: Colors.tech.neonBlue,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.text.muted,
    opacity: 0.3,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.text.secondary,
    padding: 5,
  },

  // =====================================================
  // TABS STYLES
  // =====================================================

  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: Colors.background.darkGreen,
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: Colors.tech.neonBlue,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.primary,
  },

  // =====================================================
  // WING CARDS STYLES
  // =====================================================

  wingCardsContainer: {
    marginBottom: 20,
  },
  wingCardContainer: {
    marginBottom: 15,
  },
  wingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 15,
    padding: 15,
    borderLeftWidth: 4,
  },
  wingIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  wingIcon: {
    fontSize: 28,
  },
  wingContent: {
    flex: 1,
  },
  wingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  wingDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  wingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wingMemberCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  applyButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // =====================================================
  // SECTION STYLES
  // =====================================================

  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  memberCountText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // =====================================================
  // MEMBERS GRID STYLES
  // =====================================================

  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memberCardWrapper: {
    width: (SCREEN_WIDTH - 50) / 2,
    marginBottom: 15,
  },
  memberCard: {
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  memberImageContainer: {
    marginBottom: 10,
  },
  memberImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.deepGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  memberYear: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 3,
    textAlign: 'center',
  },

  // =====================================================
  // EMPTY STATE
  // =====================================================

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // =====================================================
  // JOIN SECTION
  // =====================================================

  joinSectionHeader: {
    marginBottom: 15,
  },
  joinCard: {
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  joinTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  joinDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: Colors.tech.neonBlue,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // =====================================================
  // MODAL STYLES
  // =====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.darkGreen,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.text.muted,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: Colors.background.deepBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  modalBody: {
    padding: 20,
  },
  modalProfileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.deepGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalProfileInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalMemberName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  modalMemberRole: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  modalMemberYear: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  modalBio: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: Colors.tech.neonBlue,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  modalActionButton: {
    alignItems: 'center',
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 12,
    padding: 15,
    width: 100,
  },
  modalActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  modalActionText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },

  // =====================================================
  // APPLICATION MODAL STYLES
  // =====================================================

  applicationInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  applicationIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  applicationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  applicationDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  openPositionsSection: {
    marginBottom: 20,
  },
  positionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionBullet: {
    fontSize: 14,
    color: Colors.tech.neonBlue,
    marginRight: 8,
  },
  positionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  requirementsSection: {
    marginBottom: 25,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: Colors.tech.neonBlue,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});

// =====================================================
// EXPORT
// =====================================================

export default TaruWingsScreen;