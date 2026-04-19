// =====================================================
// ULTRA PREMIUM TEAM ANALYTICS SCREEN
// Advanced team statistics, charts, and insights
// =====================================================

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Easing,
  Image,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  Pressable,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Colors } from '../constants/colors';
import {
  teamMembers,
  TeamMember,
  teamStats,
  departmentStats,
  locationStats,
  roleStats,
  getDepartmentColor,
  getRoleColor,
  getAvailabilityColor,
  getStatusColor,
  getTopPerformers,
  getMostActive,
  getHighestRated,
  getAvailableMembers,
} from '../constants/teamData';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = width;

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

interface LeaderboardEntry {
  rank: number;
  member: TeamMember;
  score: number;
}

// =====================================================
// ANIMATED PROGRESS BAR COMPONENT
// =====================================================

const AnimatedProgressBar: React.FC<{
  progress: number;
  color: string;
  height?: number;
  animated?: boolean;
  index?: number;
}> = ({ progress, color, height = 8, animated = true, index = 0 }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const delay = index * 100;
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      progressAnim.setValue(progress);
      opacityAnim.setValue(1);
    }
  }, [progress, animated, index]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.progressBarContainer,
        { opacity: opacityAnim, height },
      ]}
    >
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            backgroundColor: color,
            width: widthInterpolate,
          },
        ]}
      />
    </Animated.View>
  );
};

// =====================================================
// STATS CARD COMPONENT
// =====================================================

const AnalyticsStatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: string;
  color: string;
  index: number;
  onPress?: () => void;
}> = ({ title, value, subtitle, change, icon, color, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.analyticsStatsCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.analyticsStatsCardPressable}>
        <View style={[styles.analyticsStatsIconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.analyticsStatsIcon}>{icon}</Text>
        </View>
        <View style={styles.analyticsStatsContent}>
          <Text style={styles.analyticsStatsValue}>{value}</Text>
          <Text style={styles.analyticsStatsTitle}>{title}</Text>
          {subtitle && <Text style={styles.analyticsStatsSubtitle}>{subtitle}</Text>}
          {change !== undefined && (
            <View style={styles.analyticsStatsChangeRow}>
              <Text
                style={[
                  styles.analyticsStatsChange,
                  { color: change >= 0 ? Colors.nature.leafGreen : Colors.accent.gold },
                ]}
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </Text>
              <Text style={styles.analyticsStatsChangeLabel}>vs last month</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// =====================================================
// DEPARTMENT DISTRIBUTION CHART
// =====================================================

const DepartmentChart: React.FC<{
  departments: typeof departmentStats;
}> = ({ departments }) => {
  const total = departments.reduce((acc, d) => acc + d.count, 0);

  return (
    <View style={styles.departmentChartContainer}>
      <Text style={styles.chartTitle}>Department Distribution</Text>
      <View style={styles.chartContent}>
        {departments.map((dept, index) => {
          const percentage = (dept.count / total) * 100;
          return (
            <View key={dept.name} style={styles.departmentChartItem}>
              <View style={styles.departmentChartHeader}>
                <View style={styles.departmentChartLabelRow}>
                  <View style={[styles.departmentDot, { backgroundColor: dept.color }]} />
                  <Text style={styles.departmentChartLabel}>{dept.name}</Text>
                </View>
                <Text style={styles.departmentChartValue}>
                  {dept.count} ({percentage.toFixed(1)}%)
                </Text>
              </View>
              <AnimatedProgressBar
                progress={percentage}
                color={dept.color}
                height={6}
                index={index}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

// =====================================================
// LEADERBOARD COMPONENT
// =====================================================

const TeamLeaderboard: React.FC<{
  title: string;
  members: TeamMember[];
  sortBy: 'performance' | 'projects' | 'rating';
  icon: string;
  color: string;
}> = ({ title, members, sortBy, icon, color }) => {
  const sortedMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => {
        switch (sortBy) {
          case 'performance':
            return b.performance - a.performance;
          case 'projects':
            return b.completedProjects - a.completedProjects;
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      })
      .slice(0, 5);
  }, [members, sortBy]);

  const getScore = (member: TeamMember): number => {
    switch (sortBy) {
      case 'performance':
        return member.performance;
      case 'projects':
        return member.completedProjects;
      case 'rating':
        return Math.round(member.rating * 20);
      default:
        return 0;
    }
  };

  return (
    <View style={styles.leaderboardContainer}>
      <View style={styles.leaderboardHeader}>
        <View style={[styles.leaderboardIconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.leaderboardIcon}>{icon}</Text>
        </View>
        <Text style={styles.leaderboardTitle}>{title}</Text>
      </View>

      {sortedMembers.map((member, index) => (
        <Animated.View
          key={member.id}
          style={styles.leaderboardItem}
        >
          <View style={styles.leaderboardRank}>
            {index === 0 ? (
              <Text style={styles.leaderboardMedal}>🥇</Text>
            ) : index === 1 ? (
              <Text style={styles.leaderboardMedal}>🥈</Text>
            ) : index === 2 ? (
              <Text style={styles.leaderboardMedal}>🥉</Text>
            ) : (
              <Text style={styles.leaderboardRankNumber}>{index + 1}</Text>
            )}
          </View>

          <Image
            source={{ uri: member.image }}
            style={styles.leaderboardImage}
          />

          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardName} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={styles.leaderboardRole} numberOfLines={1}>
              {member.role}
            </Text>
          </View>

          <View style={styles.leaderboardScore}>
            <Text style={[styles.leaderboardScoreValue, { color }]}>
              {getScore(member)}
            </Text>
            <Text style={styles.leaderboardScoreLabel}>
              {sortBy === 'rating' ? 'pts' : sortBy}
            </Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

// =====================================================
// SKILLS CLOUD COMPONENT
// =====================================================

const SkillsCloud: React.FC<{
  members: TeamMember[];
}> = ({ members }) => {
  const skillsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(member => {
      member.skills.forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [members]);

  const maxCount = Math.max(...skillsCount.map(s => s[1]));

  return (
    <View style={styles.skillsCloudContainer}>
      <Text style={styles.chartTitle}>Top Skills</Text>
      <View style={styles.skillsCloudContent}>
        {skillsCount.map(([skill, count], index) => {
          const size = 12 + (count / maxCount) * 16;
          const opacity = 0.6 + (count / maxCount) * 0.4;
          return (
            <View
              key={skill}
              style={[
                styles.skillCloudItem,
                {
                  paddingHorizontal: 12 + (count / maxCount) * 8,
                  paddingVertical: 6 + (count / maxCount) * 6,
                  opacity,
                },
              ]}
            >
              <Text
                style={[
                  styles.skillCloudText,
                  { fontSize: size },
                ]}
              >
                {skill}
              </Text>
              <Text style={styles.skillCloudCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// =====================================================
// LOCATION MAP COMPONENT (Text-based)
// =====================================================

const LocationMap: React.FC<{
  locations: typeof locationStats;
}> = ({ locations }) => {
  return (
    <View style={styles.locationMapContainer}>
      <Text style={styles.chartTitle}>Team Locations</Text>
      <View style={styles.locationMapContent}>
        {locations.slice(0, 8).map((loc, index) => (
          <View key={loc.location} style={styles.locationMapItem}>
            <Text style={styles.locationMapIcon}>📍</Text>
            <Text style={styles.locationMapText} numberOfLines={1}>
              {loc.location}
            </Text>
            <View style={styles.locationMapBarContainer}>
              <View
                style={[
                  styles.locationMapBar,
                  {
                    width: `${(loc.count / locations[0].count) * 100}%`,
                    backgroundColor: Colors.tech.neonBlue,
                  },
                ]}
              />
            </View>
            <Text style={styles.locationMapCount}>{loc.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// PERFORMANCE DISTRIBUTION COMPONENT
// =====================================================

const PerformanceDistribution: React.FC<{
  members: TeamMember[];
}> = ({ members }) => {
  const distribution = useMemo(() => {
    const ranges = [
      { min: 90, max: 100, label: '90-100%', color: Colors.nature.leafGreen },
      { min: 80, max: 89, label: '80-89%', color: Colors.accent.softGold },
      { min: 70, max: 79, label: '70-79%', color: Colors.accent.gold },
      { min: 0, max: 69, label: '<70%', color: Colors.accent.gold },
    ];

    return ranges.map(range => ({
      ...range,
      count: members.filter(m => m.performance >= range.min && m.performance <= range.max).length,
      percentage: (members.filter(m => m.performance >= range.min && m.performance <= range.max).length / members.length) * 100,
    }));
  }, [members]);

  return (
    <View style={styles.performanceDistributionContainer}>
      <Text style={styles.chartTitle}>Performance Distribution</Text>
      <View style={styles.performanceDistributionContent}>
        {distribution.map((item, index) => (
          <View key={item.label} style={styles.performanceDistributionItem}>
            <View style={styles.performanceDistributionHeader}>
              <View style={[styles.performanceDot, { backgroundColor: item.color }]} />
              <Text style={styles.performanceLabel}>{item.label}</Text>
              <Text style={styles.performanceValue}>
                {item.count} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
            <AnimatedProgressBar
              progress={item.percentage}
              color={item.color}
              height={10}
              index={index}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// TIMELINE COMPONENT
// =====================================================

const TeamTimeline: React.FC<{
  members: TeamMember[];
}> = ({ members }) => {
  const joinDates = useMemo(() => {
    const sorted = [...members]
      .sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime())
      .slice(-10);
    return sorted.map(m => ({
      member: m,
      date: new Date(m.joinDate),
      month: new Date(m.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }));
  }, [members]);

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.chartTitle}>Recent Team Additions</Text>
      <View style={styles.timelineContent}>
        {joinDates.map((item, index) => (
          <View key={item.member.id} style={styles.timelineItem}>
            <View style={styles.timelineDotContainer}>
              <View style={styles.timelineDot} />
              {index < joinDates.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContentWrapper}>
              <Image
                source={{ uri: item.member.image }}
                style={styles.timelineImage}
              />
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineName}>{item.member.name}</Text>
                <Text style={styles.timelineRole}>{item.member.role}</Text>
              </View>
              <Text style={styles.timelineDate}>{item.month}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// QUICK ACTIONS COMPONENT
// =====================================================

const QuickActionsPanel: React.FC<{
  onRefresh: () => void;
  onExport: () => void;
  onShare: () => void;
}> = ({ onRefresh, onExport, onShare }) => {
  const actions = [
    { icon: '🔄', label: 'Refresh', onPress: onRefresh, color: Colors.tech.neonBlue },
    { icon: '📊', label: 'Export', onPress: onExport, color: Colors.nature.leafGreen },
    { icon: '📤', label: 'Share', onPress: onShare, color: Colors.accent.softGold },
    { icon: '📧', label: 'Email', onPress: () => {}, color: Colors.tech.electricBlue },
    { icon: '📋', label: 'Copy List', onPress: () => {}, color: Colors.accent.gold },
    { icon: '🔍', label: 'Search', onPress: () => {}, color: Colors.nature.vine },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.chartTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionButton}
            onPress={action.onPress}
          >
            <View style={[styles.quickActionIconContainer, { backgroundColor: action.color + '20' }]}>
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// FILTERED INSIGHTS COMPONENT
// =====================================================

const InsightsPanel: React.FC<{
  members: TeamMember[];
}> = ({ members }) => {
  const insights = useMemo(() => [
    {
      icon: '⭐',
      title: 'Top Performers',
      value: `${members.filter(m => m.performance >= 90).length} members`,
      subtitle: 'Above 90% performance',
    },
    {
      icon: '🚀',
      title: 'Most Active',
      value: `${members.filter(m => m.completedProjects >= 20).length} members`,
      subtitle: '20+ projects completed',
    },
    {
      icon: '🌍',
      title: 'Remote Workers',
      value: `${members.filter(m => m.status === 'Remote').length} members`,
      subtitle: 'Working remotely',
    },
    {
      icon: '✅',
      title: 'Available Now',
      value: `${members.filter(m => m.availability === 'Available').length} members`,
      subtitle: 'Ready to collaborate',
    },
    {
      icon: '🎓',
      title: 'Certified',
      value: `${members.filter(m => m.certifications.length > 0).length} members`,
      subtitle: 'Has certifications',
    },
    {
      icon: '💼',
      title: 'Experienced',
      value: `${members.filter(m => parseInt(m.experience) >= 5).length} members`,
      subtitle: '5+ years experience',
    },
  ], [members]);

  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.chartTitle}>Team Insights</Text>
      <View style={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// =====================================================
// MAIN ANALYTICS SCREEN
// =====================================================

const TeamAnalyticsScreen: React.FC<{
  onBack?: () => void;
}> = ({ onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Animation refs
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleExport = useCallback(() => {
    Alert.alert('Export Data', 'Choose export format:', [
      { text: 'CSV', onPress: () => Alert.alert('Exported', 'CSV file generated!') },
      { text: 'PDF', onPress: () => Alert.alert('Exported', 'PDF report generated!') },
      { text: 'JSON', onPress: () => Alert.alert('Exported', 'JSON data exported!') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `TaruGuardians Analytics:\n- ${teamStats.totalMembers} Team Members\n- ${teamStats.departments} Departments\n- ${teamStats.activeProjects} Active Projects\n- ${teamStats.remoteWorkers} Remote Workers`,
        title: 'Team Analytics',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, []);

  const metrics: AnalyticsMetric[] = [
    { id: 'members', title: 'Total Members', value: teamStats.totalMembers, change: 12, trend: 'up', icon: '👥' },
    { id: 'projects', title: 'Active Projects', value: teamStats.activeProjects, change: 5, trend: 'up', icon: '🚀' },
    { id: 'completed', title: 'Completed', value: teamStats.completedProjects, change: 23, trend: 'up', icon: '✅' },
    { id: 'avg_perf', title: 'Avg Performance', value: `${teamStats.avgPerformance}%`, change: 3, trend: 'up', icon: '📈' },
    { id: 'remote', title: 'Remote', value: teamStats.remoteWorkers, change: -2, trend: 'down', icon: '🏠' },
    { id: 'rating', title: 'Avg Rating', value: teamStats.avgRating, change: 0.2, trend: 'up', icon: '⭐' },
  ];

  return (
    <View style={styles.analyticsMainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.deepBlack} />

      <ScrollView
        style={styles.analyticsScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.tech.neonBlue}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.analyticsHeader,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          {onBack && (
            <TouchableOpacity style={styles.analyticsBackButton} onPress={onBack}>
              <Text style={styles.analyticsBackButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.analyticsTitle}>Team Analytics</Text>
          <Text style={styles.analyticsSubtitle}>
            Comprehensive insights and statistics
          </Text>
        </Animated.View>

        {/* Quick Actions */}
        <QuickActionsPanel
          onRefresh={onRefresh}
          onExport={handleExport}
          onShare={handleShare}
        />

        {/* Metrics Grid */}
        <View style={styles.metricsSection}>
          <Text style={styles.chartTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <AnalyticsStatsCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                icon={metric.icon}
                color={
                  metric.id === 'members' ? Colors.tech.neonBlue :
                  metric.id === 'projects' ? Colors.nature.leafGreen :
                  metric.id === 'completed' ? Colors.accent.softGold :
                  metric.id === 'remote' ? Colors.tech.electricBlue :
                  Colors.accent.gold
                }
                index={index}
                onPress={() => setSelectedMetric(metric.id)}
              />
            ))}
          </View>
        </View>

        {/* Department Distribution */}
        <DepartmentChart departments={departmentStats} />

        {/* Insights Panel */}
        <InsightsPanel members={teamMembers} />

        {/* Performance Distribution */}
        <PerformanceDistribution members={teamMembers} />

        {/* Skills Cloud */}
        <SkillsCloud members={teamMembers} />

        {/* Leaderboards */}
        <TeamLeaderboard
          title="🏆 Top Performers"
          members={teamMembers}
          sortBy="performance"
          icon="🏆"
          color={Colors.accent.softGold}
        />

        <TeamLeaderboard
          title="🚀 Most Active"
          members={teamMembers}
          sortBy="projects"
          icon="🚀"
          color={Colors.nature.leafGreen}
        />

        <TeamLeaderboard
          title="⭐ Highest Rated"
          members={teamMembers}
          sortBy="rating"
          icon="⭐"
          color={Colors.tech.neonBlue}
        />

        {/* Location Map */}
        <LocationMap locations={locationStats} />

        {/* Timeline */}
        <TeamTimeline members={teamMembers} />

        {/* Bottom Spacing */}
        <View style={styles.analyticsBottomSpacer} />
      </ScrollView>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // Main Container
  analyticsMainContainer: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
  analyticsScrollView: {
    flex: 1,
  },

  // Header
  analyticsHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  analyticsBackButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.darkForest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsBackButtonText: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '300',
  },
  analyticsTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.primary,
    textShadowColor: Colors.glow.greenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 8,
  },

  // Chart Title
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 20,
    marginTop: 24,
  },

  // Progress Bar
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },

  // Analytics Stats Card
  analyticsStatsCard: {
    width: '48%',
    marginBottom: 12,
  },
  analyticsStatsCardPressable: {
    backgroundColor: Colors.background.darkForest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  analyticsStatsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsStatsIcon: {
    fontSize: 20,
  },
  analyticsStatsContent: {},
  analyticsStatsValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  analyticsStatsTitle: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  analyticsStatsSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
  },
  analyticsStatsChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  analyticsStatsChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  analyticsStatsChangeLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    marginLeft: 6,
  },

  // Metrics Section
  metricsSection: {
    paddingHorizontal: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Department Chart
  departmentChartContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chartContent: {},
  departmentChartItem: {
    marginBottom: 16,
  },
  departmentChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  departmentChartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  departmentChartLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  departmentChartValue: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },

  // Leaderboard
  leaderboardContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardIcon: {
    fontSize: 18,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  leaderboardRank: {
    width: 32,
    alignItems: 'center',
  },
  leaderboardMedal: {
    fontSize: 20,
  },
  leaderboardRankNumber: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  leaderboardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  leaderboardRole: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  leaderboardScore: {
    alignItems: 'flex-end',
  },
  leaderboardScoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  leaderboardScoreLabel: {
    fontSize: 10,
    color: Colors.text.muted,
  },

  // Skills Cloud
  skillsCloudContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  skillsCloudContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillCloudItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    margin: 4,
  },
  skillCloudText: {
    color: Colors.tech.neonBlue,
    fontWeight: '600',
  },
  skillCloudCount: {
    fontSize: 10,
    color: Colors.text.muted,
    textAlign: 'center',
  },

  // Location Map
  locationMapContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  locationMapContent: {},
  locationMapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationMapIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  locationMapText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  locationMapBarContainer: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  locationMapBar: {
    height: '100%',
    borderRadius: 3,
  },
  locationMapCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },

  // Performance Distribution
  performanceDistributionContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  performanceDistributionContent: {},
  performanceDistributionItem: {
    marginBottom: 16,
  },
  performanceDistributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  performanceLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  performanceValue: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },

  // Timeline
  timelineContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineContent: {},
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDotContainer: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.tech.neonBlue,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.tech.neonBlue + '30',
    marginTop: 4,
  },
  timelineContentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: Colors.background.deepBlack,
    padding: 12,
    borderRadius: 12,
  },
  timelineImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timelineRole: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  timelineDate: {
    fontSize: 12,
    color: Colors.text.muted,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },

  // Insights
  insightsContainer: {
    backgroundColor: Colors.background.darkForest,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.background.deepBlack,
    padding: 12,
    borderRadius: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  insightTitle: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  insightSubtitle: {
    fontSize: 9,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },

  // Bottom Spacer
  analyticsBottomSpacer: {
    height: 100,
  },
});

export default TeamAnalyticsScreen;