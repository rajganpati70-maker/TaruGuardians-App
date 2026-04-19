// =====================================================
// ULTRA PREMIUM TEAM SCREEN
// Premium grid-based team showcase with smooth scrolling
// Advanced Features: Search, Filter, Sort, Stats, Animations
// =====================================================

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
  Alert,
  Share,
} from 'react-native';
import { Colors } from '../constants/colors';
import {
  teamMembers,
  TeamMember,
  teamStats,
  departmentStats,
  filterOptions,
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
  searchMembers,
  sortByName,
  sortByPerformance,
  sortByRating,
  sortByProjects,
} from '../constants/teamData';
import TeamMemberCard from '../components/TeamComponents/TeamMemberCard';
import TeamMemberModal from '../components/TeamComponents/TeamMemberModal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = width;
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CARD_HEIGHT = 260;

interface TeamScreenProps {
  onBack?: () => void;
  isModal?: boolean;
}

interface FilterState {
  department: string | null;
  role: string | null;
  location: string | null;
  availability: string | null;
  status: string | null;
}

interface SortOption {
  label: string;
  value: 'name' | 'performance' | 'rating' | 'projects';
  ascending: boolean;
}

// =====================================================
// PREMIUM ANIMATED SEARCH HEADER COMPONENT
// =====================================================

const AnimatedSearchHeader: React.FC<{
  visible: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClose: () => void;
  onClearSearch: () => void;
}> = ({ visible, searchQuery, onSearchChange, onClose, onClearSearch }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
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
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.searchHeaderContainer,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View style={styles.searchInputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInputField}
          placeholder="Search by name, role, skill..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={onClearSearch}
            style={styles.clearSearchButton}
          >
            <Text style={styles.clearSearchIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.cancelSearchButton}
      >
        <Text style={styles.cancelSearchText}>Cancel</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// =====================================================
// PREMIUM STATS CARD COMPONENT
// =====================================================

const PremiumStatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  index: number;
  onPress?: () => void;
}> = ({ title, value, subtitle, color, index, onPress }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const delay = index * 120;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statsCardContainer,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.statsCardPressable}>
        <View style={[styles.statsCardGlow, { backgroundColor: color }]} />
        <View style={styles.statsCardContent}>
          <Text style={[styles.statsCardValue, { color }]}>{value}</Text>
          <Text style={styles.statsCardTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.statsCardSubtitle}>{subtitle}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// =====================================================
// PREMIUM DEPARTMENT FILTER TABS
// =====================================================

const DepartmentFilterTabs: React.FC<{
  selected: string | null;
  onSelect: (dept: string | null) => void;
  departments: typeof departmentStats;
}> = ({ selected, onSelect, departments }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <View style={styles.departmentFilterContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.departmentScrollContent}
        decelerationRate="fast"
        snapToInterval={100}
      >
        <TouchableOpacity
          style={[
            styles.departmentTabItem,
            !selected && styles.departmentTabSelected,
          ]}
          onPress={() => onSelect(null)}
        >
          <View
            style={[
              styles.departmentTabDot,
              !selected && { backgroundColor: Colors.tech.neonBlue },
            ]}
          />
          <Text
            style={[
              styles.departmentTabLabel,
              !selected && styles.departmentTabLabelSelected,
            ]}
          >
            All ({teamMembers.length})
          </Text>
        </TouchableOpacity>

        {departments.slice(0, showAll ? departments.length : 6).map((dept) => (
          <TouchableOpacity
            key={dept.name}
            style={[
              styles.departmentTabItem,
              selected === dept.name && styles.departmentTabSelected,
              selected === dept.name && { borderColor: dept.color },
            ]}
            onPress={() =>
              onSelect(dept.name === selected ? null : dept.name)
            }
          >
            <View
              style={[
                styles.departmentTabDot,
                { backgroundColor: dept.color },
              ]}
            />
            <Text
              style={[
                styles.departmentTabLabel,
                selected === dept.name && {
                  color: dept.color,
                },
              ]}
            >
              {dept.name} ({dept.count})
            </Text>
          </TouchableOpacity>
        ))}

        {departments.length > 6 && (
          <TouchableOpacity
            style={styles.departmentTabItem}
            onPress={() => setShowAll(!showAll)}
          >
            <Text style={styles.departmentTabLabel}>
              {showAll ? 'Show Less' : `+${departments.length - 6} More`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// =====================================================
// PREMIUM SORT OPTIONS COMPONENT
// =====================================================

const SortOptionsPanel: React.FC<{
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  visible: boolean;
}> = ({ selected, onSelect, visible }) => {
  if (!visible) return null;

  const options: SortOption[] = [
    { label: 'Name', value: 'name', ascending: true },
    { label: 'Name (Z-A)', value: 'name', ascending: false },
    { label: 'Performance ↑', value: 'performance', ascending: true },
    { label: 'Performance ↓', value: 'performance', ascending: false },
    { label: 'Rating ↑', value: 'rating', ascending: true },
    { label: 'Rating ↓', value: 'rating', ascending: false },
    { label: 'Projects ↑', value: 'projects', ascending: true },
    { label: 'Projects ↓', value: 'projects', ascending: false },
  ];

  return (
    <View style={styles.sortOptionsPanel}>
      <Text style={styles.sortOptionsTitle}>Sort By</Text>
      <View style={styles.sortOptionsGrid}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sortOptionButton,
              selected.value === option.value &&
                selected.ascending === option.ascending &&
                styles.sortOptionSelected,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.sortOptionLabel,
                selected.value === option.value &&
                  selected.ascending === option.ascending &&
                  styles.sortOptionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// PREMIUM VIEW MODE TOGGLE
// =====================================================

const ViewModeToggle: React.FC<{
  isGrid: boolean;
  onToggle: () => void;
}> = ({ isGrid, onToggle }) => {
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isGrid ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isGrid]);

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <Pressable onPress={onToggle} style={styles.viewModeContainer}>
      <View style={styles.viewModeBackground}>
        <Animated.View
          style={[
            styles.viewModeIndicator,
            { transform: [{ translateX }] },
          ]}
        />
        <Text style={styles.viewModeIcon}>▦</Text>
        <Text style={styles.viewModeIcon}>☰</Text>
      </View>
    </Pressable>
  );
};

// =====================================================
// PREMIUM FILTER MODAL
// =====================================================

const FilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}> = ({ visible, onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      department: null,
      role: null,
      location: null,
      availability: null,
      status: null,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.filterOverlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.filterOverlayPressable} onPress={onClose} />
        <Animated.View
          style={[
            styles.filterModalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalContent}>
            {/* Department Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Department</Text>
              <View style={styles.filterOptions}>
                {filterOptions.departments.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.filterOption,
                      localFilters.department === dept && {
                        backgroundColor: getDepartmentColor(dept) + '20',
                        borderColor: getDepartmentColor(dept),
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        department:
                          localFilters.department === dept ? null : dept,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        localFilters.department === dept && {
                          color: getDepartmentColor(dept),
                        },
                      ]}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Availability Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Availability</Text>
              <View style={styles.filterOptions}>
                {filterOptions.availability.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      localFilters.availability === status && {
                        backgroundColor:
                          getAvailabilityColor(status) + '20',
                        borderColor: getAvailabilityColor(status),
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        availability:
                          localFilters.availability === status ? null : status,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        localFilters.availability === status && {
                          color: getAvailabilityColor(status),
                        },
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {filterOptions.status.map((stat) => (
                  <TouchableOpacity
                    key={stat}
                    style={[
                      styles.filterOption,
                      localFilters.status === stat && {
                        backgroundColor: getStatusColor(stat) + '20',
                        borderColor: getStatusColor(stat),
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        status: localFilters.status === stat ? null : stat,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        localFilters.status === stat && {
                          color: getStatusColor(stat),
                        },
                      ]}
                    >
                      {stat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              style={styles.filterCancelButton}
              onPress={onClose}
            >
              <Text style={styles.filterCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterApplyButton}
              onPress={handleApply}
            >
              <Text style={styles.filterApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// =====================================================
// MAIN TEAM SCREEN COMPONENT
// =====================================================

const TeamScreen: React.FC<TeamScreenProps> = ({ onBack, isModal = false }) => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>({
    label: 'Name',
    value: 'name',
    ascending: true,
  });
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    department: null,
    role: null,
    location: null,
    availability: null,
    status: null,
  });
  const [selectedStatsIndex, setSelectedStatsIndex] = useState<number | null>(null);
  const [showTeamInfo, setShowTeamInfo] = useState(false);

  // =====================================================
  // ANIMATION REFS
  // =====================================================
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-40)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(30)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;

  // =====================================================
  // ANIMATED BACKGROUND PARTICLES
  // =====================================================
  useEffect(() => {
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  // =====================================================
  // ENTRANCE ANIMATION
  // =====================================================
  useEffect(() => {
    Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      // Stats animation
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(statsTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // FAB animation
      Animated.spring(fabScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =====================================================
  // FILTERED AND SORTED MEMBERS
  // =====================================================
  const filteredMembers = useMemo(() => {
    let result = teamMembers;

    // Apply search
    if (searchQuery.trim()) {
      result = searchMembers(searchQuery);
    }

    // Apply department filter
    if (selectedDepartment) {
      result = result.filter((m) => m.department === selectedDepartment);
    }

    // Apply additional filters
    if (filters.availability) {
      result = result.filter((m) => m.availability === filters.availability);
    }
    if (filters.status) {
      result = result.filter((m) => m.status === filters.status);
    }
    if (filters.department) {
      result = result.filter((m) => m.department === filters.department);
    }

    // Apply sorting
    switch (sortOption.value) {
      case 'name':
        result = [...result].sort((a, b) =>
          sortOption.ascending
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case 'performance':
        result = [...result].sort((a, b) =>
          sortOption.ascending
            ? a.performance - b.performance
            : b.performance - a.performance
        );
        break;
      case 'rating':
        result = [...result].sort((a, b) =>
          sortOption.ascending ? a.rating - b.rating : b.rating - a.rating
        );
        break;
      case 'projects':
        result = [...result].sort((a, b) =>
          sortOption.ascending
            ? a.completedProjects - b.completedProjects
            : b.completedProjects - a.completedProjects
        );
        break;
    }

    return result;
  }, [searchQuery, selectedDepartment, filters, sortOption]);

  // =====================================================
  // HANDLER FUNCTIONS
  // =====================================================
  const handleMemberPress = useCallback((member: TeamMember) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedMember(member);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModalVisible(false);
    setTimeout(() => setSelectedMember(null), 300);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Refreshed', 'Team data has been updated!');
    }, 1500);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  const handleSortSelect = useCallback((option: SortOption) => {
    setSortOption(option);
    setShowSortOptions(false);
  }, []);

  const handleDepartmentSelect = useCallback((dept: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDepartment(dept);
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters(newFilters);
  }, []);

  const handleStatsPress = useCallback((index: number) => {
    setSelectedStatsIndex(index);
    // Show different info based on stats index
    switch (index) {
      case 0:
        Alert.alert('Total Members', `We have ${teamStats.totalMembers} amazing team members!`);
        break;
      case 1:
        Alert.alert('Departments', `Our team is organized across ${teamStats.departments} departments.`);
        break;
      case 2:
        Alert.alert('Active Projects', `Currently working on ${teamStats.activeProjects} exciting projects!`);
        break;
      case 3:
        Alert.alert('Remote Workers', `${teamStats.remoteWorkers} team members work remotely!`);
        break;
    }
    setTimeout(() => setSelectedStatsIndex(null), 500);
  }, []);

  const handleShareTeam = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out the amazing TaruGuardians team! We have ${teamStats.totalMembers} members across ${teamStats.departments} departments. 🌳♻️`,
        title: 'TaruGuardians Team',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, []);

  // =====================================================
  // PARTICLE ANIMATION VALUES
  // =====================================================
  const particle1TranslateY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  const particle2TranslateX = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const particle3TranslateY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const particle4TranslateY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  // =====================================================
  // RENDER FUNCTIONS
  // =====================================================

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.screenHeader,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      {/* Particles Background */}
      <View style={styles.particlesContainer}>
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            { transform: [{ translateY: particle1TranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            { transform: [{ translateX: particle2TranslateX }] },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            { transform: [{ translateY: particle3TranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle4,
            { transform: [{ translateY: particle4TranslateY }] },
          ]}
        />
        <Animated.View style={[styles.particle, styles.particle5]} />
      </View>

      {/* Header Content */}
      <View style={styles.headerContent}>
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={onBack}
          >
            <View style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Header Actions */}
        <View style={styles.headerActionsContainer}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Text style={styles.headerActionIcon}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={styles.headerActionIcon}>⇅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.headerActionIcon}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleShareTeam}
          >
            <Text style={styles.headerActionIcon}>📤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => setShowTeamInfo(!showTeamInfo)}
          >
            <Text style={styles.headerActionIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Search Header */}
        {showSearch && (
          <AnimatedSearchHeader
            visible={showSearch}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClose={() => setShowSearch(false)}
            onClearSearch={handleClearSearch}
          />
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrapper}>
            <View style={styles.logoTreeTrunk}>
              <View style={styles.logoTreeTrunkInner} />
            </View>
            <View style={styles.logoTreeCanopy}>
              <View style={[styles.logoCanopyLayer, styles.logoCanopyTop]} />
              <View style={[styles.logoCanopyLayer, styles.logoCanopyMiddle]} />
              <View style={[styles.logoCanopyLayer, styles.logoCanopyBottom]} />
            </View>
            <View style={styles.logoShield}>
              <View style={styles.logoShieldInner} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.headerMainTitle}>Our Team</Text>
        <Text style={styles.headerSubtitle}>
          Meet the incredible minds behind TaruGuardians
        </Text>

        {/* Expanded Team Info */}
        {showTeamInfo && (
          <Animated.View style={styles.teamInfoExpanded}>
            <View style={styles.teamInfoRow}>
              <Text style={styles.teamInfoLabel}>Established:</Text>
              <Text style={styles.teamInfoValue}>2019</Text>
            </View>
            <View style={styles.teamInfoRow}>
              <Text style={styles.teamInfoLabel}>Mission:</Text>
              <Text style={styles.teamInfoValue}>Preserving Nature</Text>
            </View>
            <View style={styles.teamInfoRow}>
              <Text style={styles.teamInfoLabel}>Vision:</Text>
              <Text style={styles.teamInfoValue}>Green Future</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Stats Row */}
      <Animated.View
        style={[
          styles.statsRowContainer,
          {
            opacity: statsOpacity,
            transform: [{ translateY: statsTranslateY }],
          },
        ]}
      >
        <View style={styles.statsRowInner}>
          <PremiumStatsCard
            title="Members"
            value={teamStats.totalMembers}
            color={Colors.tech.neonBlue}
            index={0}
            onPress={() => handleStatsPress(0)}
          />
          <PremiumStatsCard
            title="Departments"
            value={teamStats.departments}
            color={Colors.nature.leafGreen}
            index={1}
            onPress={() => handleStatsPress(1)}
          />
          <PremiumStatsCard
            title="Active"
            value={teamStats.activeProjects}
            color={Colors.accent.softGold}
            index={2}
            onPress={() => handleStatsPress(2)}
          />
          <PremiumStatsCard
            title="Remote"
            value={teamStats.remoteWorkers}
            color={Colors.tech.electricBlue}
            index={3}
            onPress={() => handleStatsPress(3)}
          />
        </View>
      </Animated.View>

      {/* Sort Options Panel */}
      <SortOptionsPanel
        visible={showSortOptions}
        selected={sortOption}
        onSelect={handleSortSelect}
      />

      {/* Department Filter */}
      <Animated.View
        style={[
          styles.departmentFilterWrapper,
          { opacity: statsOpacity },
        ]}
      >
        <DepartmentFilterTabs
          selected={selectedDepartment}
          onSelect={handleDepartmentSelect}
          departments={departmentStats}
        />
      </Animated.View>

      {/* Results Count */}
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCountText}>
          Showing {filteredMembers.length} of {teamMembers.length} members
        </Text>
        {searchQuery && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Text style={styles.clearSearchLink}>Clear search</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Filters Badge */}
      {(filters.availability || filters.status || filters.department) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
          <View style={styles.activeFiltersList}>
            {filters.department && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filters.department}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, department: null })}
                >
                  <Text style={styles.filterBadgeRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {filters.availability && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filters.availability}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, availability: null })}
                >
                  <Text style={styles.filterBadgeRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {filters.status && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filters.status}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, status: null })}
                >
                  <Text style={styles.filterBadgeRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={() =>
                setFilters({
                  department: null,
                  role: null,
                  location: null,
                  availability: null,
                  status: null,
                })
              }
            >
              <Text style={styles.clearAllFilters}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header Decorative Line */}
      <View style={styles.headerDecorativeLine}>
        <View style={styles.headerDecorativeLineInner} />
      </View>
    </Animated.View>
  );

  // =====================================================
  // RENDER ITEM
  // =====================================================
  const renderItem = useCallback(
    ({ item, index }: { item: TeamMember; index: number }) => (
      <View style={styles.cardWrapperItem}>
        <TeamMemberCard
          member={item}
          index={index}
          onPress={handleMemberPress}
        />
      </View>
    ),
    [handleMemberPress]
  );

  // =====================================================
  // KEY EXTRACTOR
  // =====================================================
  const keyExtractor = useCallback((item: TeamMember) => item.id, []);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
      />

      {/* Animated Background */}
      <View style={styles.backgroundGradientLayer}>
        <View style={styles.backgroundPatternLayer} />
      </View>

      {/* Main Content FlatList */}
      <FlatList
        data={filteredMembers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.tech.neonBlue}
            colors={[Colors.tech.neonBlue]}
          />
        }
        columnWrapperStyle={styles.columnWrapperStyle}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT + 20,
          offset: (CARD_HEIGHT + 20) * Math.floor(index / 2),
          index,
        })}
      />

      {/* Member Detail Modal */}
      <TeamMemberModal
        visible={modalVisible}
        member={selectedMember}
        onClose={handleCloseModal}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.floatingActionButton,
          {
            transform: [
              { scale: fabScale },
              {
                rotate: fabRotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingActionButtonInner}
          onPress={() => {
            // Quick actions menu
            Alert.alert(
              'Quick Actions',
              'Choose an action',
              [
                {
                  text: 'Share Team',
                  onPress: handleShareTeam,
                },
                {
                  text: 'Refresh',
                  onPress: onRefresh,
                },
                {
                  text: 'Search',
                  onPress: () => setShowSearch(true),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
          }}
        >
          <Text style={styles.floatingActionIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =====================================================
  // MAIN CONTAINER
  // =====================================================
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
  backgroundGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.darkGreen,
  },
  backgroundPatternLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    backgroundColor: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      ${Colors.tech.neonBlue}10 20px,
      ${Colors.tech.neonBlue}10 40px
    )`,
  },

  // =====================================================
  // LIST CONTENT
  // =====================================================
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
  cardWrapperItem: {
    flex: 1,
    maxWidth: (SCREEN_WIDTH - 48) / 2,
    marginHorizontal: CARD_MARGIN,
  },

  // =====================================================
  // HEADER
  // =====================================================
  screenHeader: {
    marginBottom: 20,
    position: 'relative',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  particle1: {
    width: 300,
    height: 300,
    backgroundColor: Colors.tech.neonBlue,
    opacity: 0.07,
    top: -100,
    left: -80,
  },
  particle2: {
    width: 200,
    height: 200,
    backgroundColor: Colors.nature.leafGreen,
    opacity: 0.05,
    top: 40,
    right: -50,
  },
  particle3: {
    width: 150,
    height: 150,
    backgroundColor: Colors.accent.softGold,
    opacity: 0.04,
    bottom: 30,
    left: 80,
  },
  particle4: {
    width: 100,
    height: 100,
    backgroundColor: Colors.tech.electricBlue,
    opacity: 0.03,
    top: 120,
    left: -30,
  },
  particle5: {
    width: 80,
    height: 80,
    backgroundColor: Colors.nature.vine,
    opacity: 0.05,
    bottom: 100,
    right: 60,
  },

  // =====================================================
  // HEADER CONTENT
  // =====================================================
  headerContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 15,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.darkForest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: Colors.text.primary,
    fontSize: 26,
    fontWeight: '300',
  },
  headerActionsContainer: {
    position: 'absolute',
    top: 15,
    right: 16,
    flexDirection: 'row',
    zIndex: 10,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.darkForest,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerActionIcon: {
    fontSize: 18,
  },

  // =====================================================
  // SEARCH HEADER
  // =====================================================
  searchHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '30',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInputField: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 10,
  },
  clearSearchIcon: {
    color: Colors.text.muted,
    fontSize: 14,
  },
  cancelSearchButton: {
    marginLeft: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  cancelSearchText: {
    color: Colors.tech.neonBlue,
    fontSize: 14,
    fontWeight: '600',
  },

  // =====================================================
  // LOGO
  // =====================================================
  logoContainer: {
    marginBottom: 22,
  },
  logoIconWrapper: {
    width: 65,
    height: 75,
    position: 'relative',
  },
  logoTreeTrunk: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    width: 17,
    height: 32,
    backgroundColor: Colors.nature.bark,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTreeTrunkInner: {
    width: 7,
    height: 26,
    backgroundColor: Colors.nature.wood,
    borderRadius: 2,
  },
  logoTreeCanopy: {
    position: 'absolute',
    top: 0,
    left: 6,
    width: 53,
    height: 53,
  },
  logoCanopyLayer: {
    position: 'absolute',
    borderRadius: 26,
  },
  logoCanopyTop: {
    width: 46,
    height: 30,
    top: 0,
    left: 3,
    backgroundColor: Colors.nature.leafGreen,
  },
  logoCanopyMiddle: {
    width: 53,
    height: 27,
    top: 13,
    left: 0,
    backgroundColor: Colors.nature.leafLight,
  },
  logoCanopyBottom: {
    width: 40,
    height: 19,
    top: 30,
    left: 6,
    backgroundColor: Colors.nature.vine,
  },
  logoShield: {
    position: 'absolute',
    bottom: 14,
    right: -6,
    width: 26,
    height: 32,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 4,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  logoShieldInner: {
    width: 13,
    height: 15,
    backgroundColor: Colors.text.primary,
    borderRadius: 2,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },

  // =====================================================
  // HEADER TITLE
  // =====================================================
  headerMainTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: Colors.glow.greenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 21,
  },

  // =====================================================
  // TEAM INFO EXPANDED
  // =====================================================
  teamInfoExpanded: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  teamInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  teamInfoLabel: {
    color: Colors.text.tertiary,
    fontSize: 13,
    fontWeight: '600',
  },
  teamInfoValue: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '500',
  },

  // =====================================================
  // STATS ROW
  // =====================================================
  statsRowContainer: {
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  statsRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsCardPressable: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    opacity: 0.8,
  },
  statsCardContent: {
    alignItems: 'center',
  },
  statsCardValue: {
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statsCardTitle: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsCardSubtitle: {
    fontSize: 9,
    color: Colors.text.muted,
    marginTop: 2,
  },

  // =====================================================
  // SORT OPTIONS
  // =====================================================
  sortOptionsPanel: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 14,
    marginBottom: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sortOptionsTitle: {
    color: Colors.text.tertiary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionSelected: {
    backgroundColor: Colors.tech.neonBlue + '20',
    borderColor: Colors.tech.neonBlue,
  },
  sortOptionLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  sortOptionLabelSelected: {
    color: Colors.tech.neonBlue,
    fontWeight: '700',
  },

  // =====================================================
  // DEPARTMENT FILTER
  // =====================================================
  departmentFilterWrapper: {
    marginBottom: 16,
  },
  departmentFilterContainer: {
    marginHorizontal: -16,
  },
  departmentScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  departmentTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: Colors.background.darkForest,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  departmentTabSelected: {
    backgroundColor: Colors.tech.neonBlue + '15',
    borderColor: Colors.tech.neonBlue,
  },
  departmentTabDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8,
  },
  departmentTabLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  departmentTabLabelSelected: {
    color: Colors.tech.neonBlue,
    fontWeight: '700',
  },

  // =====================================================
  // RESULTS COUNT
  // =====================================================
  resultsCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsCountText: {
    color: Colors.text.tertiary,
    fontSize: 12,
  },
  clearSearchLink: {
    color: Colors.tech.neonBlue,
    fontSize: 12,
    fontWeight: '600',
  },

  // =====================================================
  // ACTIVE FILTERS
  // =====================================================
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  activeFiltersLabel: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginRight: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tech.neonBlue + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  filterBadgeText: {
    color: Colors.tech.neonBlue,
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  filterBadgeRemove: {
    color: Colors.tech.neonBlue,
    fontSize: 10,
    fontWeight: '700',
  },
  clearAllFilters: {
    color: Colors.accent.gold,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },

  // =====================================================
  // HEADER DECORATIVE LINE
  // =====================================================
  headerDecorativeLine: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerDecorativeLineInner: {
    width: 90,
    height: 4,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 2,
  },

  // =====================================================
  // FILTER MODAL
  // =====================================================
  filterOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark80,
    justifyContent: 'flex-end',
  },
  filterOverlayPressable: {
    flex: 1,
  },
  filterModalContainer: {
    backgroundColor: Colors.background.darkForest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  filterResetText: {
    fontSize: 14,
    color: Colors.accent.gold,
    fontWeight: '600',
  },
  filterModalContent: {
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.tertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionText: {
    color: Colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    alignItems: 'center',
  },
  filterCancelText: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.tech.neonBlue,
    marginLeft: 10,
    alignItems: 'center',
  },
  filterApplyText: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  // =====================================================
  // VIEW MODE TOGGLE
  // =====================================================
  viewModeContainer: {
    marginLeft: 8,
  },
  viewModeBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewModeIndicator: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tech.neonBlue + '30',
    left: 4,
  },
  viewModeIcon: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: Colors.text.secondary,
  },

  // =====================================================
  // FLOATING ACTION BUTTON
  // =====================================================
  floatingActionButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  floatingActionButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.tech.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  floatingActionIcon: {
    fontSize: 32,
    color: Colors.text.primary,
    fontWeight: '300',
  },
});

export default TeamScreen;