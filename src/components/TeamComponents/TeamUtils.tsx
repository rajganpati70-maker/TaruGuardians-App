// =====================================================
// ULTRA PREMIUM TEAM UTILITY COMPONENTS
// Additional helper components for team screen functionality
// =====================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  FlatList,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Colors } from '../../constants/colors';
import {
  teamMembers,
  TeamMember,
  teamStats,
  filterOptions,
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
} from '../../constants/teamData';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = width;

// =====================================================
// TYPE DEFINITIONS
// =====================================================

interface NotificationItem {
  id: string;
  type: 'achievement' | 'project' | 'member' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

interface FilterChip {
  label: string;
  value: string;
  active: boolean;
  color: string;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  results: number;
}

// =====================================================
// NOTIFICATION PANEL COMPONENT
// =====================================================

const NotificationPanel: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const notifications: NotificationItem[] = useMemo(() => [
    {
      id: '1',
      type: 'achievement',
      title: 'New Achievement',
      message: 'Alex Chen completed 50 projects!',
      timestamp: '2 hours ago',
      read: false,
      icon: '🏆',
    },
    {
      id: '2',
      type: 'project',
      title: 'Project Milestone',
      message: 'Mobile App v2 reached 10K downloads',
      timestamp: '5 hours ago',
      read: false,
      icon: '🚀',
    },
    {
      id: '3',
      type: 'member',
      title: 'New Member',
      message: 'Sarah Kim joined the Design team',
      timestamp: '1 day ago',
      read: true,
      icon: '👋',
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'New features have been deployed',
      timestamp: '2 days ago',
      read: true,
      icon: '⚙️',
    },
    {
      id: '5',
      type: 'achievement',
      title: 'Team Award',
      message: 'Engineering team won Best Innovators',
      timestamp: '3 days ago',
      read: true,
      icon: '⭐',
    },
  ], []);

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

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}>
      <View style={[styles.notificationIconContainer, { backgroundColor: item.type === 'achievement' ? Colors.accent.softGold + '20' : item.type === 'project' ? Colors.nature.leafGreen + '20' : Colors.tech.neonBlue + '20' }]}>
        <Text style={styles.notificationIcon}>{item.icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
      </View>
      {!item.read && <View style={styles.notificationDot} />}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.notificationOverlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.notificationOverlayPressable} onPress={onClose} />
        <Animated.View
          style={[
            styles.notificationContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationHeaderTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.notificationCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationList}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// =====================================================
// FILTER CHIPS COMPONENT
// =====================================================

const FilterChips: React.FC<{
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  color?: string;
}> = ({ label, options, selected, onSelect, color = Colors.tech.neonBlue }) => {
  return (
    <View style={styles.filterChipsContainer}>
      <Text style={styles.filterChipsLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, !selected && styles.filterChipSelected]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.filterChipText, !selected && styles.filterChipTextSelected]}>
            All
          </Text>
        </TouchableOpacity>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              selected === option && styles.filterChipSelected,
              selected === option && { borderColor: color },
            ]}
            onPress={() => onSelect(selected === option ? null : option)}
          >
            <Text
              style={[
                styles.filterChipText,
                selected === option && { color },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// =====================================================
// SORT DROPDOWN COMPONENT
// =====================================================

const SortDropdown: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (field: string, direction: 'asc' | 'desc') => void;
  currentSort: SortConfig;
}> = ({ visible, onClose, onSelect, currentSort }) => {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const sortOptions = [
    { field: 'name', label: 'Name', icon: '👤' },
    { field: 'performance', label: 'Performance', icon: '📊' },
    { field: 'rating', label: 'Rating', icon: '⭐' },
    { field: 'projects', label: 'Projects', icon: '📁' },
    { field: 'joinDate', label: 'Join Date', icon: '📅' },
    { field: 'experience', label: 'Experience', icon: '💼' },
  ];

  if (!visible) return null;

  return (
    <Animated.View style={[styles.sortDropdown, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.sortDropdownTitle}>Sort By</Text>
      {sortOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.sortDropdownItem,
            currentSort.field === option.field && styles.sortDropdownItemActive,
          ]}
          onPress={() => {
            const newDirection = currentSort.field === option.field && currentSort.direction === 'desc' ? 'asc' : 'desc';
            onSelect(option.field, newDirection);
            onClose();
          }}
        >
          <Text style={styles.sortDropdownIcon}>{option.icon}</Text>
          <Text style={[
            styles.sortDropdownLabel,
            currentSort.field === option.field && styles.sortDropdownLabelActive,
          ]}>
            {option.label}
          </Text>
          {currentSort.field === option.field && (
            <Text style={styles.sortDropdownDirection}>
              {currentSort.direction === 'asc' ? '↑' : '↓'}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

// =====================================================
// SEARCH BAR COMPONENT
// =====================================================

const TeamSearchBar: React.FC<{
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  showHistory?: boolean;
  onHistorySelect?: (query: string) => void;
}> = ({
  value,
  onChange,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Search team members...',
  showHistory = true,
  onHistorySelect,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([
    { query: 'developer', timestamp: new Date(), results: 12 },
    { query: 'design', timestamp: new Date(), results: 8 },
    { query: 'engineer', timestamp: new Date(), results: 15 },
  ]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleHistoryItemPress = useCallback((item: SearchHistoryItem) => {
    onChange(item.query);
    onHistorySelect?.(item.query);
  }, [onChange, onHistorySelect]);

  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return (
    <View style={styles.searchBarContainer}>
      <View style={[styles.searchBarInputContainer, isFocused && styles.searchBarFocused]}>
        <Text style={styles.searchBarIcon}>🔍</Text>
        <TextInput
          style={styles.searchBarInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.searchBarClearButton}>
            <Text style={styles.searchBarClearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showHistory && isFocused && value.length === 0 && searchHistory.length > 0 && (
        <View style={styles.searchHistoryContainer}>
          <View style={styles.searchHistoryHeader}>
            <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.searchHistoryClear}>Clear</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.searchHistoryItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <Text style={styles.searchHistoryIcon}>🕐</Text>
              <View style={styles.searchHistoryContent}>
                <Text style={styles.searchHistoryQuery}>{item.query}</Text>
                <Text style={styles.searchHistoryResults}>{item.results} results</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// =====================================================
// BULK ACTION BAR COMPONENT
// =====================================================

const BulkActionBar: React.FC<{
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  selectedMembers: TeamMember[];
  visible: boolean;
}> = ({ selectedCount, onClearSelection, onSelectAll, selectedMembers, visible }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 100,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Selected ${selectedCount} team members:\n\n${selectedMembers.map(m => `• ${m.name} - ${m.role}`).join('\n')}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [selectedCount, selectedMembers]);

  const handleExport = useCallback(() => {
    Alert.alert('Export Selected', 'Export data for selected members?', [
      { text: 'CSV', onPress: () => Alert.alert('Exported', 'CSV file created!') },
      { text: 'JSON', onPress: () => Alert.alert('Exported', 'JSON file created!') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [selectedCount]);

  const handleEmail = useCallback(() => {
    const emails = selectedMembers.map(m => m.email).join(',');
    Alert.alert('Email Selected', `Compose email to ${selectedCount} members?`, [
      { text: 'Yes', onPress: () => Linking.openURL(`mailto:${emails}`) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [selectedCount]);

  if (!visible || selectedCount === 0) return null;

  return (
    <Animated.View style={[styles.bulkActionBar, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.bulkActionBarContent}>
        <Text style={styles.bulkActionBarCount}>{selectedCount} selected</Text>
        <View style={styles.bulkActionBarButtons}>
          <TouchableOpacity style={styles.bulkActionButton} onPress={onSelectAll}>
            <Text style={styles.bulkActionButtonIcon}>✓</Text>
            <Text style={styles.bulkActionButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionButton} onPress={handleEmail}>
            <Text style={styles.bulkActionButtonIcon}>✉</Text>
            <Text style={styles.bulkActionButtonText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionButton} onPress={handleShare}>
            <Text style={styles.bulkActionButtonIcon}>📤</Text>
            <Text style={styles.bulkActionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionButton} onPress={handleExport}>
            <Text style={styles.bulkActionButtonIcon}>📊</Text>
            <Text style={styles.bulkActionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionButton} onPress={onClearSelection}>
            <Text style={styles.bulkActionButtonIcon}>✕</Text>
            <Text style={styles.bulkActionButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// =====================================================
// EMPTY STATE COMPONENT
// =====================================================

const EmptyState: React.FC<{
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, message, actionLabel, onAction }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyStateContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={onAction}>
          <Text style={styles.emptyStateButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// =====================================================
// LOADING SKELETON COMPONENT
// =====================================================

const LoadingSkeleton: React.FC<{
  count?: number;
  type?: 'card' | 'list' | 'detail';
}> = ({ count = 6, type = 'card' }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderCard = () => (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <Animated.View style={[styles.skeletonTitle, { opacity }]} />
      <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
      <Animated.View style={[styles.skeletonText, { opacity }]} />
    </View>
  );

  const renderList = () => (
    <View style={styles.skeletonListItem}>
      <Animated.View style={[styles.skeletonListImage, { opacity }]} />
      <View style={styles.skeletonListContent}>
        <Animated.View style={[styles.skeletonListTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonListSubtitle, { opacity }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          {type === 'card' && renderCard()}
          {type === 'list' && renderList()}
        </View>
      ))}
    </View>
  );
};

// =====================================================
// TOAST NOTIFICATION COMPONENT
// =====================================================

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onHide: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({ visible, message, type, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
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

      // Auto hide after 3 seconds
      setTimeout(onHide, 3000);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
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

  const getTypeColor = () => {
    switch (type) {
      case 'success': return Colors.nature.leafGreen;
      case 'error': return Colors.accent.gold;
      case 'warning': return Colors.accent.softGold;
      default: return Colors.tech.neonBlue;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: getTypeColor(),
        },
      ]}
    >
      <View style={[styles.toastIconContainer, { backgroundColor: getTypeColor() + '20' }]}>
        <Text style={[styles.toastIcon, { color: getTypeColor() }]}>{getIcon()}</Text>
      </View>
      <Text style={styles.toastMessage}>{message}</Text>
    </Animated.View>
  );
};

// =====================================================
// SELECT ALL TOGGLE COMPONENT
// =====================================================

const SelectAllToggle: React.FC<{
  selected: number;
  total: number;
  onToggle: () => void;
  isAllSelected: boolean;
}> = ({ selected, total, onToggle, isAllSelected }) => {
  return (
    <TouchableOpacity style={styles.selectAllContainer} onPress={onToggle}>
      <View style={[styles.selectAllCheckbox, isAllSelected && styles.selectAllChecked]}>
        {isAllSelected && <Text style={styles.selectAllCheckmark}>✓</Text>}
      </View>
      <Text style={styles.selectAllText}>
        {isAllSelected ? 'Deselect All' : `Select All (${total})`}
      </Text>
      {selected > 0 && !isAllSelected && (
        <Text style={styles.selectAllSelected}>({selected} selected)</Text>
      )}
    </TouchableOpacity>
  );
};

// =====================================================
// PAGINATION COMPONENT
// =====================================================

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Text style={styles.paginationButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.paginationNumbers}>
        {getPageNumbers().map((page, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationNumber,
              page === currentPage && styles.paginationNumberActive,
            ]}
            onPress={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page !== 'number'}
          >
            <Text
              style={[
                styles.paginationNumberText,
                page === currentPage && styles.paginationNumberTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Text style={styles.paginationButtonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

// =====================================================
// EXPORT STYLES
// =====================================================

const styles = StyleSheet.create({
  // Notification Panel
  notificationOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark60,
    justifyContent: 'flex-start',
  },
  notificationOverlayPressable: {
    flex: 1,
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.darkForest,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    maxHeight: height * 0.7,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  notificationHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  notificationCloseButton: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  notificationList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.deepBlack,
    borderRadius: 14,
    marginBottom: 12,
  },
  notificationItemUnread: {
    backgroundColor: Colors.tech.neonBlue + '10',
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '30',
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  notificationTimestamp: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.tech.neonBlue,
  },

  // Filter Chips
  filterChipsContainer: {
    marginVertical: 12,
  },
  filterChipsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.tertiary,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background.darkForest,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: Colors.tech.neonBlue + '15',
    borderColor: Colors.tech.neonBlue,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: Colors.tech.neonBlue,
    fontWeight: '700',
  },

  // Sort Dropdown
  sortDropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: Colors.background.darkForest,
    borderRadius: 16,
    padding: 16,
    zIndex: 100,
    minWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  sortDropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.tertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sortDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sortDropdownItemActive: {
    backgroundColor: Colors.tech.neonBlue + '15',
  },
  sortDropdownIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  sortDropdownLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sortDropdownLabelActive: {
    color: Colors.tech.neonBlue,
    fontWeight: '600',
  },
  sortDropdownDirection: {
    fontSize: 14,
    color: Colors.tech.neonBlue,
    fontWeight: '700',
  },

  // Search Bar
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBarFocused: {
    borderColor: Colors.tech.neonBlue,
  },
  searchBarIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  searchBarClearButton: {
    padding: 8,
  },
  searchBarClearIcon: {
    color: Colors.text.muted,
    fontSize: 14,
  },
  searchHistoryContainer: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 14,
    marginTop: 8,
    padding: 16,
  },
  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.tertiary,
  },
  searchHistoryClear: {
    fontSize: 13,
    color: Colors.tech.neonBlue,
    fontWeight: '600',
  },
  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  searchHistoryIcon: {
    fontSize: 14,
    marginRight: 12,
    color: Colors.text.muted,
  },
  searchHistoryContent: {
    flex: 1,
  },
  searchHistoryQuery: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  searchHistoryResults: {
    fontSize: 12,
    color: Colors.text.muted,
  },

  // Bulk Action Bar
  bulkActionBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.background.darkForest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '30',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  bulkActionBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkActionBarCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  bulkActionBarButtons: {
    flexDirection: 'row',
  },
  bulkActionButton: {
    alignItems: 'center',
    marginLeft: 16,
    padding: 8,
  },
  bulkActionButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  bulkActionButtonText: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 14,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },

  // Loading Skeleton
  skeletonContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 16,
    padding: 16,
    margin: 8,
  },
  skeletonImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.text.muted,
    marginBottom: 12,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: Colors.text.muted,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: Colors.text.muted,
    borderRadius: 4,
    marginBottom: 8,
    width: '50%',
  },
  skeletonText: {
    height: 12,
    backgroundColor: Colors.text.muted,
    borderRadius: 4,
    width: '90%',
  },
  skeletonListItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 12,
    padding: 12,
    margin: 8,
  },
  skeletonListImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.text.muted,
  },
  skeletonListContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonListTitle: {
    height: 16,
    backgroundColor: Colors.text.muted,
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonListSubtitle: {
    height: 12,
    backgroundColor: Colors.text.muted,
    borderRadius: 4,
    width: '40%',
  },

  // Toast Notification
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkForest,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  toastIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },

  // Select All Toggle
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectAllCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.text.muted,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectAllChecked: {
    backgroundColor: Colors.tech.neonBlue,
    borderColor: Colors.tech.neonBlue,
  },
  selectAllCheckmark: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  selectAllText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectAllSelected: {
    fontSize: 12,
    color: Colors.text.muted,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.darkForest,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  paginationNumbers: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  paginationNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  paginationNumberActive: {
    backgroundColor: Colors.tech.neonBlue,
  },
  paginationNumberText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  paginationNumberTextActive: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
});

// =====================================================
// EXPORTS
// =====================================================

export {
  NotificationPanel,
  FilterChips,
  SortDropdown,
  TeamSearchBar,
  BulkActionBar,
  EmptyState,
  LoadingSkeleton,
  ToastNotification,
  SelectAllToggle,
  PaginationControls,
};

export default {
  NotificationPanel,
  FilterChips,
  SortDropdown,
  TeamSearchBar,
  BulkActionBar,
  EmptyState,
  LoadingSkeleton,
  ToastNotification,
  SelectAllToggle,
  PaginationControls,
};