// =====================================================
// TARU GUARDIANS — TEAM DIRECTORY
// Leadership · Members · Role Filters · Search
// =====================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  FlatList,
  RefreshControl,
  Easing,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PhotoAvatar from '../../components/PhotoAvatar';
import { Colors } from '../../constants/colors';
import { TeamMember, Department, Project } from '../../types/navigation';
import type { TextStyle } from 'react-native';

// -----------------------------------------------------
// HighlightText — wraps matched search text in a glow
// -----------------------------------------------------
const HighlightText: React.FC<{
  text: string;
  query: string;
  style: TextStyle | TextStyle[];
  numberOfLines?: number;
}> = ({ text, query, style, numberOfLines }) => {
  if (!query.trim()) {
    return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
  }
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) {
    return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
  }
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {before}
      <Text style={styles.highlightMatch}>{match}</Text>
      {after}
    </Text>
  );
};

// -----------------------------------------------------
// Tokens
// -----------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 20;
const AVATAR_SIZE = IS_SMALL ? 54 : 62;
const LEAD_AVATAR = IS_SMALL ? 76 : 86;

const ANIM = {
  duration: { fast: 200, normal: 360, slow: 520, xslow: 760 },
  easing: {
    inOut: Easing.inOut(Easing.cubic),
    out: Easing.out(Easing.cubic),
    soft: Easing.bezier(0.25, 0.1, 0.25, 1),
    overshoot: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
};

// -----------------------------------------------------
// Departments
// -----------------------------------------------------

const DEPARTMENTS: Department[] = [
  { id: 'leadership', name: 'Leadership', icon: '👑', color: '#FFD700', memberCount: 8, description: 'Strategy, direction, stewardship and inter-wing coordination.' },
  { id: 'events', name: 'Events', icon: '🎉', color: '#F97316', memberCount: 15, description: 'Workshops, hackathons, social nights, outreach drives.' },
  { id: 'technology', name: 'Technology', icon: '💻', color: '#38BDF8', memberCount: 20, description: 'App, website, automation and member tooling.' },
  { id: 'design', name: 'Design', icon: '🎨', color: '#F472B6', memberCount: 12, description: 'Visual language, posters, merchandise, motion.' },
  { id: 'marketing', name: 'Outreach', icon: '📣', color: '#06B6D4', memberCount: 10, description: 'Communications, social, storytelling, PR.' },
  { id: 'operations', name: 'Operations', icon: '⚙️', color: '#4ADE80', memberCount: 18, description: 'Logistics, vendors, finance coordination, safety.' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#FBBF24', memberCount: 6, description: 'Budgets, sponsorships, grants, reimbursements.' },
  { id: 'content', name: 'Content', icon: '✍️', color: '#F59E0B', memberCount: 11, description: 'Long-form writing, newsletter, documentation.' },
];

type SortKey = 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'name-asc', label: 'Name · A → Z', icon: '🔤' },
  { key: 'name-desc', label: 'Name · Z → A', icon: '🔡' },
];

// -----------------------------------------------------
// Role filters
// -----------------------------------------------------

const ROLE_FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🌐' },
  { key: 'president', label: 'President', emoji: '🏛️' },
  { key: 'vice-president', label: 'Vice President', emoji: '🤝' },
  { key: 'joint-secretary', label: 'Jt. Secretary', emoji: '📋' },
  { key: 'treasurer', label: 'Treasurer', emoji: '💰' },
  { key: 'tech-head', label: 'Tech Head', emoji: '💻' },
  { key: 'admin-head', label: 'Admin Head', emoji: '⚙️' },
  { key: 'event-head', label: 'Event Head', emoji: '🎉' },
  { key: 'media-head', label: 'Media Head', emoji: '📸' },
  { key: 'content-head', label: 'Content Head', emoji: '✍️' },
  { key: 'pr-head', label: 'PR Head', emoji: '📣' },
  { key: 'program-head', label: 'Program Head', emoji: '🎯' },
  { key: 'membership-head', label: 'Membership Head', emoji: '🌱' },
];

// -----------------------------------------------------
// Extended TeamMember
// -----------------------------------------------------

interface ExtTeamMember extends TeamMember {
  tier: 'lead' | 'core';
  roleKey: string;
  pronouns?: string;
  funFact?: string;
  focusAreas: string[];
  tagline?: string;
  joinedDate: string;
  hoursContributed: number;
  eventsOrganized: number;
  projectsShipped: number;
}

const makeMember = (
  id: number,
  name: string,
  role: string,
  roleKey: string,
  dept: string,
  year: string,
  bio: string,
  skills: string[],
  focusAreas: string[],
  achievements: string[],
  tier: 'lead' | 'core',
  joinedDate: string,
  hoursContributed: number,
  eventsOrganized: number,
  projectsShipped: number,
  opts?: Partial<ExtTeamMember> & { social?: TeamMember['socialLinks'] }
): ExtTeamMember => ({
  id: String(id),
  name,
  role,
  roleKey,
  department: dept,
  year,
  email: opts?.email ?? `${name.split(' ')[0].toLowerCase()}@taruguardians.org`,
  phone: opts?.phone ?? '+91 98XXXXXX' + String(10 + id).padStart(2, '0'),
  imageUrl: opts?.imageUrl ?? '',
  bio,
  skills,
  socialLinks: opts?.social ?? {
    linkedin: `https://linkedin.com/in/${name.split(' ').join('-').toLowerCase()}`,
  },
  achievements,
  projects: opts?.projects ?? [],
  tier,
  pronouns: opts?.pronouns,
  funFact: opts?.funFact,
  focusAreas,
  tagline: opts?.tagline,
  joinedDate,
  hoursContributed,
  eventsOrganized,
  projectsShipped,
});

// -----------------------------------------------------
// Real Members Dataset
// Top 6 → Leadership (tier: lead)
// Remaining 13 → Members with /Lead (tier: core)
// -----------------------------------------------------

const TEAM_MEMBERS: ExtTeamMember[] = [
  // ---- LEADERSHIP (Top 6) ----
  makeMember(
    1, 'Prakash Kumar', 'President', 'president', 'leadership', '2024',
    'Leads Taru Guardians with vision and purpose. Drives strategy, culture, and collaboration across all wings to build a club that compounds over time.',
    ['Strategy', 'Public Speaking', 'Governance', 'Stakeholder Mgmt'],
    ['Annual roadmap', 'Alumni relations', 'Governance'],
    ['Founded key club initiatives', 'Led 3 national-level summits', 'Young Environmentalist Recognition'],
    'lead', '2022-08-15', 1240, 38, 7,
    { tagline: 'Every tree we plant is a promise we keep.', funFact: 'Can identify 80+ native tree species by sight.' }
  ),
  makeMember(
    2, 'Mukul Anand', 'Vice President', 'vice-president', 'leadership', '2024',
    'Partners with the President to drive day-to-day operations and ensure every wing stays aligned, energized, and well-supported.',
    ['Operations', 'Facilitation', 'People Ops', 'Planning'],
    ['Onboarding', 'Inter-wing coordination', 'Culture'],
    ['Excellence in Leadership Award', 'Led cross-wing collaboration overhaul'],
    'lead', '2022-09-01', 1160, 30, 5,
    { tagline: 'Good teams win quietly.', funFact: 'Organized 20+ club-wide sessions.' }
  ),
  makeMember(
    3, 'Akshat Thakur', 'Joint Secretary', 'joint-secretary', 'leadership', '2024',
    'Manages documentation, records, and coordination across the club. Ensures every decision is captured, shared, and acted upon.',
    ['Documentation', 'Coordination', 'Process Design', 'Writing'],
    ['Records', 'Meeting minutes', 'Correspondence'],
    ['Digitized entire club archive', 'Implemented meeting notes system'],
    'lead', '2023-01-12', 820, 18, 4,
    { tagline: 'Well-written records outlive the people who wrote them.', funFact: 'Never missed a meeting in 3 semesters.' }
  ),
  makeMember(
    4, 'Kriti Divyansha', 'Joint Secretary', 'joint-secretary', 'leadership', '2024',
    'Works alongside Akshat to keep the club\'s communication clear, timely, and inclusive. Bridges wings and ensures nothing falls through the cracks.',
    ['Communication', 'Coordination', 'Writing', 'Outreach'],
    ['Internal comms', 'Cross-wing liaison', 'Documentation'],
    ['Launched club-wide announcements system', 'Improved onboarding communications'],
    'lead', '2023-03-20', 780, 24, 3,
    { tagline: 'Clarity is kindness.', funFact: 'Writes personalized welcome notes for every new member.' }
  ),
  makeMember(
    5, 'Pushkar Aditya', 'Treasurer', 'treasurer', 'finance', '2024',
    'Oversees the club\'s finances with precision and transparency. Manages budgets, tracks expenses, and ensures every rupee serves the mission.',
    ['Budgeting', 'Finance', 'Audit', 'Sponsorships'],
    ['Annual budget', 'Sponsorship pipeline', 'Expense tracking'],
    ['Secured major sponsorships', 'Introduced open-book spending model'],
    'lead', '2022-09-10', 860, 14, 3,
    { tagline: 'Transparent books build trust.', funFact: 'Managed ₹5L+ in annual club budget.' }
  ),
  makeMember(
    6, 'Santripti', 'Treasurer', 'treasurer', 'finance', '2024',
    'Co-manages finances alongside Pushkar. Handles reimbursements, vendor payments, and ensures the club is never cash-blocked on a good idea.',
    ['Finance', 'Reimbursements', 'Vendor Relations', 'Reporting'],
    ['Reimbursements', 'Vendor payments', 'Financial reporting'],
    ['Zero payment delays in 2 semesters', 'Streamlined reimbursement workflow'],
    'lead', '2022-10-05', 740, 12, 2,
    { tagline: 'Money in the right place at the right time.', funFact: 'Processes every reimbursement within 48 hours.' }
  ),

  // ---- MEMBERS (with /Lead) ----
  makeMember(
    7, 'Aashish Kishore', 'Tech Head · Lead', 'tech-head', 'technology', '2025',
    'Leads all technology initiatives — from the club app to internal tools and automations. Keeps the digital backbone of Taru Guardians running smoothly.',
    ['React Native', 'TypeScript', 'Node.js', 'CI/CD', 'Automation'],
    ['App platform', 'Dev tooling', 'Automation pipelines'],
    ['Built club app from scratch', 'Shipped 9+ internal tools'],
    'core', '2023-01-12', 960, 18, 9,
    { tagline: 'Ship it. Then make it better.', social: { linkedin: 'https://linkedin.com/in/aashish-kishore', github: 'https://github.com/aashishkishore' } }
  ),
  makeMember(
    8, 'Ritik Kumar', 'Administrative Head · Lead', 'admin-head', 'operations', '2025',
    'Manages all administrative functions — space booking, logistics, compliance, and the hundred behind-the-scenes tasks that make everything run on time.',
    ['Administration', 'Logistics', 'Compliance', 'Scheduling'],
    ['Space management', 'Event logistics', 'Compliance'],
    ['Zero-incident logistics record', 'Streamlined admin processes'],
    'core', '2023-03-20', 820, 22, 2,
    { tagline: 'Admin is the spine of everything.' }
  ),
  makeMember(
    9, 'Hrithik Bhadani', 'Event & Management Head · Lead', 'event-head', 'events', '2025',
    'Plans and executes flagship events. Brings structure to chaos and makes every event feel effortless for attendees while being intensely prepared behind the scenes.',
    ['Event Ops', 'Run-of-Show', 'Budgeting', 'Vendor Mgmt'],
    ['Flagship events', 'Hackathons', 'Summits'],
    ['Run 6 major events zero-incident', 'Best Event Design Award'],
    'core', '2023-06-10', 980, 36, 4,
    { tagline: 'Great events look easy. They aren\'t.' }
  ),
  makeMember(
    10, 'Namya Singh', 'Event & Management Head · Lead', 'event-head', 'events', '2025',
    'Partners with Hrithik to create memorable, well-run events. Focuses on participant experience, volunteer coordination, and post-event learning.',
    ['Facilitation', 'Volunteer Mgmt', 'Audience Experience', 'Ops'],
    ['Participant experience', 'Volunteer ops', 'Event debrief'],
    ['Coordinated 200+ volunteer hours', 'Designed attendee experience framework'],
    'core', '2023-08-05', 840, 28, 3,
    { tagline: 'The attendee\'s experience is the whole product.' }
  ),
  makeMember(
    11, 'Manyata Manas', 'Media Head · Lead', 'media-head', 'design', '2025',
    'Leads all media production — photography, videography, and visual storytelling. Ensures every club moment is captured beautifully and shared powerfully.',
    ['Photography', 'Video Production', 'Storytelling', 'Adobe Suite'],
    ['Photo coverage', 'Video reels', 'Visual archives'],
    ['Shot 50+ events', 'Built visual identity for 3 campaigns'],
    'core', '2023-09-18', 720, 20, 5,
    { tagline: 'Every frame tells a story worth keeping.' }
  ),
  makeMember(
    12, 'Sneh Raj', 'Media Head · Lead', 'media-head', 'design', '2025',
    'Co-leads media with Manyata. Specializes in motion graphics and social media content that amplifies Taru Guardians\' reach and voice.',
    ['Motion Graphics', 'Social Media', 'After Effects', 'Reels'],
    ['Motion content', 'Social posts', 'Event reels'],
    ['3 viral reels (> 50k views)', 'Built motion style guide'],
    'core', '2023-10-02', 640, 16, 4,
    { tagline: 'Motion makes the message stick.' }
  ),
  makeMember(
    13, 'Sarthak Kumar', 'Content Head · Lead', 'content-head', 'content', '2025',
    'Leads content strategy and editorial direction. From long-form articles to newsletters, ensures Taru Guardians communicates with clarity and depth.',
    ['Editorial', 'Copywriting', 'Content Strategy', 'Newsletter'],
    ['Newsletter', 'Long-form features', 'Content calendar'],
    ['Published 28 long-form pieces', 'Launched alumni newsletter'],
    'core', '2023-10-15', 680, 10, 3,
    { tagline: 'Words that last are words that are true.' }
  ),
  makeMember(
    14, 'Keshav Sarkar', 'Content Head · Lead', 'content-head', 'content', '2025',
    'Partners with Sarthak on content production. Focuses on documentation, event write-ups, and building the club\'s institutional memory through writing.',
    ['Documentation', 'Technical Writing', 'Knowledge Mgmt', 'Editing'],
    ['Event documentation', 'Wiki', 'Runbooks'],
    ['Built club-wide knowledge base', 'Documented 40+ events'],
    'core', '2023-11-02', 560, 8, 2,
    { tagline: 'Documentation is a love letter to future members.' }
  ),
  makeMember(
    15, 'Saikat Bhattacharya', 'PR Head · Lead', 'pr-head', 'marketing', '2025',
    'Leads external communications and public relations. Builds partnerships, manages press, and ensures Taru Guardians is well-represented beyond campus.',
    ['PR', 'Media Relations', 'Partnerships', 'Press Kits'],
    ['Press relations', 'Sponsor outreach', 'Brand amplification'],
    ['Secured coverage in 4 national outlets', 'Closed 8 brand partnerships'],
    'core', '2023-08-22', 740, 15, 3,
    { tagline: 'Your reputation is your most compoundable asset.' }
  ),
  makeMember(
    16, 'Nakshatra Sarkar', 'PR Head · Lead', 'pr-head', 'marketing', '2025',
    'Works alongside Saikat to build Taru Guardians\' public presence. Manages social listening, alumni outreach, and campus media relationships.',
    ['Social Strategy', 'Alumni Relations', 'Brand Strategy', 'Outreach'],
    ['Social presence', 'Alumni engagement', 'Media outreach'],
    ['Grew IG reach 3×', 'Launched alumni amplification program'],
    'core', '2023-09-10', 620, 12, 2,
    { tagline: 'Relationships before reach.' }
  ),
  makeMember(
    17, 'Piyali Nath', 'Program Head · Lead', 'program-head', 'operations', '2025',
    'Designs and manages the club\'s programs — workshops, learning tracks, and capability-building initiatives that make members grow, not just participate.',
    ['Program Design', 'Facilitation', 'Curriculum', 'Mentorship'],
    ['Workshop series', 'Learning tracks', 'Member growth'],
    ['Designed 12+ learning programs', 'Led 3 cross-wing capability workshops'],
    'core', '2023-11-22', 700, 18, 4,
    { tagline: 'Programs should change people, not just fill a calendar.' }
  ),
  makeMember(
    18, 'Pawan Gope', 'Membership Head · Lead', 'membership-head', 'leadership', '2025',
    'Manages the full membership lifecycle — from recruitment drives and onboarding to retention and culture-building. Keeps the community healthy and growing.',
    ['Recruitment', 'Onboarding', 'Community Building', 'CRM'],
    ['Recruitment drives', 'Onboarding experience', 'Retention'],
    ['Onboarded 60+ members in one semester', 'Zero-friction onboarding process'],
    'core', '2023-12-08', 660, 14, 2,
    { tagline: 'Great communities are built one welcome at a time.' }
  ),
  makeMember(
    19, 'Abhijit Choudhury', 'Membership Head · Lead', 'membership-head', 'leadership', '2025',
    'Works with Pawan to grow and nurture Taru Guardians\' membership. Focuses on alumni connections, peer support, and making every member feel they belong.',
    ['Alumni Relations', 'Peer Support', 'Community Design', 'Engagement'],
    ['Alumni engagement', 'Peer programs', 'Community wellbeing'],
    ['Engaged 400+ alumni', 'Built peer buddy system'],
    'core', '2024-01-15', 580, 10, 1,
    { tagline: 'A club is only as strong as how its people feel inside it.' }
  ),
];

// -----------------------------------------------------
// Computed aggregates
// -----------------------------------------------------

const totalMembers = TEAM_MEMBERS.length;
const totalHours = TEAM_MEMBERS.reduce((acc, m) => acc + m.hoursContributed, 0);
const totalEventsOrganized = TEAM_MEMBERS.reduce((acc, m) => acc + m.eventsOrganized, 0);
const totalProjectsShipped = TEAM_MEMBERS.reduce((acc, m) => acc + m.projectsShipped, 0);
const leadershipMembers = TEAM_MEMBERS.filter((m) => m.tier === 'lead');

// =====================================================
// Component
// =====================================================

const TeamScreen: React.FC = () => {
  // ------ State ------
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tierFilter, setTierFilter] = useState<'all' | 'lead' | 'member'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<ExtTeamMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ------ Animations ------
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const chipAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.timing(headerAnim, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
      Animated.timing(statsAnim, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
      Animated.timing(chipAnim, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
      Animated.timing(gridAnim, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [headerAnim, statsAnim, chipAnim, gridAnim]);

  useEffect(() => {
    if (showMemberModal) {
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, friction: 7 }),
        Animated.timing(modalOpacity, { toValue: 1, duration: ANIM.duration.fast, useNativeDriver: true }),
      ]).start();
    } else {
      modalScale.setValue(0.9);
      modalOpacity.setValue(0);
    }
  }, [showMemberModal, modalScale, modalOpacity]);

  // ------ Filtering ------
  const matchesRole = useCallback((m: ExtTeamMember) =>
    roleFilter === 'all' || m.roleKey === roleFilter, [roleFilter]);

  const matchesSearch = useCallback((m: ExtTeamMember) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q)) ||
      m.focusAreas.some((f) => f.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredLeads = useMemo(() =>
    leadershipMembers.filter(matchesRole).filter(matchesSearch),
    [matchesRole, matchesSearch]);

  const filteredMembers = useMemo(() => {
    let list = TEAM_MEMBERS.filter((m) => m.tier === 'core')
      .filter(matchesRole)
      .filter(matchesSearch);
    if (sortKey === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [matchesRole, matchesSearch, sortKey]);

  const showLeadSection = tierFilter !== 'member';
  const showMemberGrid = tierFilter !== 'lead';
  const gridData = showMemberGrid ? filteredMembers : [];

  const hasFilters = tierFilter !== 'all' || roleFilter !== 'all' || searchQuery.trim().length > 0;

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TEAM_MEMBERS.length };
    TEAM_MEMBERS.forEach((m) => {
      counts[m.roleKey] = (counts[m.roleKey] ?? 0) + 1;
    });
    return counts;
  }, []);

  // ------ Handlers ------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  }, []);

  const openMember = useCallback((m: ExtTeamMember) => {
    setSelectedMember(m);
    setShowMemberModal(true);
  }, []);

  const closeMember = useCallback(() => {
    setShowMemberModal(false);
    setTimeout(() => setSelectedMember(null), 220);
  }, []);

  const clearFilters = useCallback(() => {
    setTierFilter('all');
    setRoleFilter('all');
    setSearchQuery('');
  }, []);

  const openUrl = useCallback(async (url?: string) => {
    if (!url) return;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Cannot open link', url);
    } catch {
      Alert.alert('Cannot open link', url);
    }
  }, []);

  const shareMember = useCallback(async (m: ExtTeamMember) => {
    try {
      await Share.share({
        message: `👋 Meet ${m.name} — ${m.role} · Taru Guardians.\n\n"${m.bio}"\n\nConnect: ${m.email}`,
      });
    } catch {
      // user cancelled
    }
  }, []);

  // ------ Sub-renderers ------
  const renderHeader = () => (
    <Animated.View
      style={{
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
      }}
    >
      <LinearGradient
        colors={['#06141F', '#0A2634', '#081D2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>🌳 Taru Guardians</Text>
            <Text style={styles.headerTitle}>Meet the Team</Text>
            <Text style={styles.headerSubtitle}>
              {totalMembers} leadership members · one mission · countless hours.
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name, role, skill…"
            placeholderTextColor={Colors.text.muted}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortMenu(true)}>
            <Text style={styles.sortBtnText}>⇅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
          >
            <Text style={styles.sortBtnText}>{viewMode === 'grid' ? '▦' : '☰'}</Text>
          </TouchableOpacity>
        </View>

        {/* Tier filter: All | Leads | Members */}
        <View style={[styles.tierRow, { marginBottom: 10 }]}>
          {(['all', 'lead', 'member'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTierFilter(t)}
              style={[styles.tierChip, tierFilter === t && styles.tierChipActive]}
            >
              <Text style={[styles.tierChipText, tierFilter === t && styles.tierChipTextActive]}>
                {t === 'all' ? '🌐 All' : t === 'lead' ? '👑 Leads' : '🌱 Members'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Role filter chips — below the gradient */}
      <Animated.View
        style={[
          styles.roleFilterWrap,
          {
            opacity: chipAnim,
            transform: [{ translateY: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roleFilterScroll}
        >
          {ROLE_FILTERS.map((rf) => {
            const active = roleFilter === rf.key;
            const count = roleCounts[rf.key] ?? 0;
            return (
              <TouchableOpacity
                key={rf.key}
                onPress={() => setRoleFilter(rf.key)}
                style={[styles.roleChip, active && styles.roleChipActive]}
              >
                <Text style={styles.roleChipEmoji}>{rf.emoji}</Text>
                <Text style={[styles.roleChipLabel, active && styles.roleChipLabelActive]}>
                  {rf.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.roleChipBadge, active && styles.roleChipBadgeActive]}>
                    <Text style={[styles.roleChipBadgeText, active && styles.roleChipBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );

  const renderLeadershipBoard = () => {
    if (!showLeadSection) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>👑 Leadership</Text>
          <Text style={styles.sectionCaption}>{filteredLeads.length} leads</Text>
        </View>
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No leads match</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
              <Text style={styles.emptyButtonText}>Reset filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={IS_TABLET ? 280 : SCREEN_WIDTH * 0.7}
            decelerationRate="fast"
            contentContainerStyle={styles.leaderScroll}
          >
            {filteredLeads.map((m) => {
              const dept = DEPARTMENTS.find((d) => d.id === m.department);
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => openMember(m)}
                  activeOpacity={0.9}
                  style={styles.leaderCard}
                >
                  <LinearGradient
                    colors={[(dept?.color ?? '#ffffff') + '33', '#0A0F14']}
                    style={styles.leaderGradient}
                  >
                    <View style={styles.leaderAvatarRow}>
                      <PhotoAvatar
                        name={m.name}
                        color={dept?.color ?? '#FFD700'}
                        size="lg"
                        isFeatured={m.tier === 'lead'}
                        showParticles
                      />
                    </View>
                    <HighlightText text={m.name} query={searchQuery} style={styles.leaderName} numberOfLines={1} />
                    <HighlightText text={m.role} query={searchQuery} style={styles.leaderRole} numberOfLines={1} />
                    {m.tagline ? (
                      <Text style={styles.leaderTagline} numberOfLines={2}>"{m.tagline}"</Text>
                    ) : null}
                    <View style={styles.leaderMetaRow}>
                      <Text style={styles.leaderMeta}>⏱ {m.hoursContributed} hrs</Text>
                      <Text style={styles.leaderMeta}>📅 {m.eventsOrganized}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderRow}>
      <Text style={styles.listHeaderTitle}>
        {showMemberGrid
          ? `${filteredMembers.length} member${filteredMembers.length === 1 ? '' : 's'} · /Lead`
          : ''}
      </Text>
      {hasFilters && (
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.listHeaderReset}>Reset filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGridCard = ({ item, index }: { item: ExtTeamMember; index: number }) => {
    const dept = DEPARTMENTS.find((d) => d.id === item.department);
    return (
      <Animated.View
        style={[
          styles.gridCell,
          {
            opacity: gridAnim,
            transform: [
              {
                translateY: gridAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18 + (index % 5) * 2, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => openMember(item)}
          android_ripple={{ color: (dept?.color ?? '#888') + '33' }}
          style={styles.cardInner}
        >
          <LinearGradient
            colors={[(dept?.color ?? '#888') + '1F', '#0A0F14']}
            style={styles.cardGradient}
          >
            <View style={styles.cardAvatarRow}>
              <PhotoAvatar
                name={item.name}
                color={dept?.color ?? Colors.tech.neonBlue}
                size="md"
                isFeatured={item.tier === 'lead'}
              />
              <View style={[styles.tierBadge, { backgroundColor: '#38BDF833', borderColor: '#38BDF8' }]}>
                <Text style={[styles.tierBadgeText, { color: '#38BDF8' }]}>⭐ Lead</Text>
              </View>
            </View>

            <HighlightText text={item.name} query={searchQuery} style={styles.cardName} numberOfLines={1} />
            <HighlightText text={item.role} query={searchQuery} style={styles.cardRole} numberOfLines={1} />
            <Text style={styles.cardDept} numberOfLines={1}>
              {dept?.icon} {dept?.name}
            </Text>

            <View style={styles.cardSkillRow}>
              {item.skills.slice(0, 3).map((s) => (
                <View key={s} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMeta}>⏱ {item.hoursContributed}</Text>
              <Text style={styles.cardMeta}>📅 {item.eventsOrganized}</Text>
              <Text style={styles.cardMeta}>🚀 {item.projectsShipped}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  const renderListCard = ({ item, index }: { item: ExtTeamMember; index: number }) => {
    const dept = DEPARTMENTS.find((d) => d.id === item.department);
    return (
      <Animated.View
        style={[
          styles.listCardOuter,
          {
            opacity: gridAnim,
            transform: [
              {
                translateY: gridAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12 + (index % 5) * 2, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => openMember(item)}
          android_ripple={{ color: (dept?.color ?? '#888') + '33' }}
          style={styles.cardInner}
        >
          <View style={styles.listCardInnerRow}>
            <PhotoAvatar
              name={item.name}
              color={dept?.color ?? Colors.tech.neonBlue}
              size="sm"
              containerStyle={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <HighlightText text={item.name} query={searchQuery} style={styles.listName} />
              <HighlightText
                text={`${item.role} · ${dept?.name ?? ''}`}
                query={searchQuery}
                style={styles.listRole}
                numberOfLines={1}
              />
              <Text style={styles.listBio} numberOfLines={2}>{item.bio}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.listHours}>{item.hoursContributed}h</Text>
              <Text style={styles.listYear}>Batch {item.year}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🙈</Text>
      <Text style={styles.emptyTitle}>No members match these filters</Text>
      <Text style={styles.emptySubtitle}>Try a broader role or reset filters.</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
        <Text style={styles.emptyButtonText}>Reset filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSkeleton = () => (
    <View style={{ paddingTop: 20 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.listCardOuter, { opacity: 0.6 }]}>
          <View style={[styles.cardGradient, styles.skeletonGradient]}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '60%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Showing {filteredMembers.length + filteredLeads.length} of {totalMembers} members.</Text>
      <Text style={styles.footerText}>Built with care, one semester at a time. 🌱</Text>
    </View>
  );

  // ------ Detail modal ------
  const renderMemberModal = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    const dept = DEPARTMENTS.find((d) => d.id === m.department);
    return (
      <Modal
        visible={showMemberModal}
        transparent
        animationType="none"
        onRequestClose={closeMember}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMember} />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }], opacity: modalOpacity },
            ]}
          >
            <LinearGradient
              colors={[(dept?.color ?? '#888') + '33', '#0A0F14']}
              style={styles.modalHero}
            >
              <View style={styles.modalHeroTop}>
                <View
                  style={[
                    styles.catBadge,
                    {
                      borderColor: dept?.color,
                      backgroundColor: (dept?.color ?? '#888') + '22',
                    },
                  ]}
                >
                  <Text style={styles.catBadgeText}>
                    {dept?.icon} {dept?.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeMember} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalAvatarWrap}>
                <PhotoAvatar
                  name={m.name}
                  color={dept?.color ?? Colors.tech.neonBlue}
                  size="xl"
                  isFeatured={m.tier === 'lead'}
                  showParticles
                />
              </View>

              <Text style={styles.modalTitle}>{m.name}</Text>
              <Text style={styles.modalRole}>{m.role}</Text>
              {m.tagline ? <Text style={styles.modalTagline}>"{m.tagline}"</Text> : null}

              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaPill}>
                  <Text style={styles.modalMetaText}>Batch {m.year}</Text>
                </View>
                <View style={styles.modalMetaPill}>
                  <Text style={styles.modalMetaText}>
                    {m.tier === 'lead' ? '👑 Lead' : '⭐ Lead Member'}
                  </Text>
                </View>
                {m.pronouns ? (
                  <View style={styles.modalMetaPill}>
                    <Text style={styles.modalMetaText}>{m.pronouns}</Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>About</Text>
                <Text style={styles.modalSectionBody}>{m.bio}</Text>
                {m.funFact ? (
                  <View style={styles.funFactBox}>
                    <Text style={styles.funFactTitle}>💫 Fun fact</Text>
                    <Text style={styles.funFactText}>{m.funFact}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Impact</Text>
                <View style={styles.impactRow}>
                  <View style={styles.impactCell}>
                    <Text style={styles.impactValue}>{m.hoursContributed}</Text>
                    <Text style={styles.impactLabel}>Hours</Text>
                  </View>
                  <View style={styles.impactDivider} />
                  <View style={styles.impactCell}>
                    <Text style={[styles.impactValue, { color: '#4ADE80' }]}>{m.eventsOrganized}</Text>
                    <Text style={styles.impactLabel}>Events</Text>
                  </View>
                  <View style={styles.impactDivider} />
                  <View style={styles.impactCell}>
                    <Text style={[styles.impactValue, { color: '#38BDF8' }]}>{m.projectsShipped}</Text>
                    <Text style={styles.impactLabel}>Projects</Text>
                  </View>
                </View>
                <Text style={styles.joinedText}>Joined the club on {m.joinedDate}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Focus areas</Text>
                <View style={styles.tagCloud}>
                  {m.focusAreas.map((f) => (
                    <View key={f} style={styles.tagPill}>
                      <Text style={styles.tagText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Skills</Text>
                <View style={styles.tagCloud}>
                  {m.skills.map((s) => (
                    <View key={s} style={[styles.tagPill, { borderColor: Colors.tech.neonBlue + '55' }]}>
                      <Text style={[styles.tagText, { color: Colors.tech.neonBlue }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {m.achievements.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Achievements</Text>
                  {m.achievements.map((a, i) => (
                    <View key={i} style={styles.achievementRow}>
                      <Text style={styles.achievementBullet}>🏆</Text>
                      <Text style={styles.achievementText}>{a}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Connect</Text>
                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(`mailto:${m.email}`)}>
                    <Text style={styles.socialBtnText}>✉ Email</Text>
                  </TouchableOpacity>
                  {m.socialLinks.linkedin ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.linkedin)}>
                      <Text style={styles.socialBtnText}>in · LinkedIn</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.github ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.github)}>
                      <Text style={styles.socialBtnText}>⎇ GitHub</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.instagram ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.instagram)}>
                      <Text style={styles.socialBtnText}>Instagram</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.twitter ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.twitter)}>
                      <Text style={styles.socialBtnText}>𝕏 · Twitter</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.portfolio ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.portfolio)}>
                      <Text style={styles.socialBtnText}>Portfolio</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: Colors.tech.neonBlue }]}
                onPress={() => openUrl(`mailto:${m.email}`)}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>✉ Reach out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={() => shareMember(m)}
              >
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderSortSheet = () => (
    <Modal
      visible={showSortMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <Pressable style={styles.sheetBackdrop} onPress={() => setShowSortMenu(false)} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Sort by</Text>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => {
              setSortKey(opt.key);
              setShowSortMenu(false);
            }}
            style={styles.sheetRow}
          >
            <Text style={styles.sheetIcon}>{opt.icon}</Text>
            <Text style={[styles.sheetLabel, sortKey === opt.key && styles.sheetLabelActive]}>
              {opt.label}
            </Text>
            {sortKey === opt.key && <Text style={styles.sheetCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

  // ------ Main ------
  const listHeader = (
    <View>
      {renderHeader()}
      {renderLeadershipBoard()}
      {showMemberGrid && renderListHeader()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
        translucent={Platform.OS === 'android'}
      />
      {loading ? (
        <ScrollView style={styles.scrollRoot}>
          {renderHeader()}
          {renderSkeleton()}
        </ScrollView>
      ) : (
        <FlatList
          data={gridData}
          key={viewMode}
          keyExtractor={(item) => item.id}
          numColumns={1}
          renderItem={viewMode === 'grid' ? renderGridCard : renderListCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={showMemberGrid ? renderEmpty : undefined}
          ListFooterComponent={renderFooter}
          initialNumToRender={8}
          windowSize={9}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.tech.neonBlue}
              colors={[Colors.tech.neonBlue]}
            />
          }
        />
      )}
      {renderMemberModal()}
      {renderSortSheet()}
    </SafeAreaView>
  );
};

// =====================================================
// Styles — unchanged from original design
// =====================================================

const styles = StyleSheet.create({
  highlightMatch: {
    backgroundColor: '#FBBF2444',
    color: '#FBBF24',
    borderRadius: 3,
    fontWeight: '800',
  },
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollRoot: { flex: 1 },
  listContent: { paddingBottom: 100 },

  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 16 : 28,
    paddingBottom: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: { marginBottom: 12 },
  headerEyebrow: { fontSize: 12, color: Colors.tech.neonBlue, fontWeight: '700', letterSpacing: 1.1 },
  headerTitle: { fontSize: IS_SMALL ? 26 : 30, color: Colors.text.primary, fontWeight: '800', marginTop: 4 },
  headerSubtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 6, lineHeight: 18 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff08',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff1A',
  },
  statCell: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: '#ffffff1F' },
  statValue: { fontSize: IS_SMALL ? 15 : 17, fontWeight: '800', color: Colors.text.primary },
  statLabel: { fontSize: 10, color: Colors.text.secondary, marginTop: 2 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff12',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 14, padding: 0 },
  clearIcon: { fontSize: 14, color: Colors.text.muted, paddingHorizontal: 6 },
  sortBtn: {
    marginLeft: 6,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ffffff12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  sortBtnText: { fontSize: 16, color: Colors.text.primary },

  // Tier chips
  tierRow: { flexDirection: 'row' },
  tierChip: {
    backgroundColor: '#ffffff0A',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
  },
  tierChipActive: { backgroundColor: '#ffffff22' },
  tierChipText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  tierChipTextActive: { color: Colors.text.primary, fontWeight: '800' },

  // Role filter chips
  roleFilterWrap: {
    backgroundColor: '#06141F',
    paddingBottom: 8,
  },
  roleFilterScroll: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 10,
    paddingBottom: 4,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff0A',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },
  roleChipActive: {
    borderColor: Colors.tech.neonBlue,
    backgroundColor: Colors.tech.neonBlue + '22',
  },
  roleChipEmoji: { fontSize: 13, marginRight: 5 },
  roleChipLabel: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  roleChipLabelActive: { color: Colors.tech.neonBlue, fontWeight: '800' },
  roleChipBadge: {
    marginLeft: 6,
    backgroundColor: '#ffffff18',
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  roleChipBadgeActive: {
    backgroundColor: Colors.tech.neonBlue + '33',
  },
  roleChipBadgeText: {
    color: Colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  roleChipBadgeTextActive: {
    color: Colors.tech.neonBlue,
  },

  // Section blocks
  sectionBlock: { paddingTop: 22 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
  },
  sectionTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  sectionCaption: { color: Colors.text.muted, fontSize: 12 },

  // Leadership cards
  leaderScroll: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingRight: HORIZONTAL_PADDING * 2,
  },
  leaderCard: {
    width: IS_TABLET ? 270 : SCREEN_WIDTH * 0.7,
    marginRight: 12,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  leaderGradient: {
    padding: 16,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
    alignItems: 'center',
    minHeight: 220,
  },
  leaderAvatarRow: { alignItems: 'center', marginBottom: 10 },
  leaderAvatar: { alignItems: 'center', justifyContent: 'center' },
  leaderAvatarText: { color: '#000', fontSize: 22, fontWeight: '900' },
  leaderName: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginTop: 4 },
  leaderRole: { color: Colors.accent.softGold, fontSize: 12, marginTop: 2, fontWeight: '700' },
  leaderTagline: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  leaderMetaRow: { flexDirection: 'row', marginTop: 10 },
  leaderMeta: { color: Colors.text.muted, fontSize: 11, marginHorizontal: 6 },

  // Filter / list header
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 22,
    paddingBottom: 6,
  },
  listHeaderTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '700', flex: 1 },
  listHeaderReset: { color: '#FBA5A5', fontSize: 12, fontWeight: '700' },

  // Grid cells
  gridCell: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: 10,
  },
  cardInner: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  cardGradient: {
    padding: 12,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  cardAvatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: { color: Colors.text.primary, fontWeight: '800', fontSize: 18 },
  tierBadge: {
    backgroundColor: '#FBBF2433',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tierBadgeText: { color: '#FBBF24', fontSize: 10, fontWeight: '800' },
  cardName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', marginTop: 10 },
  cardRole: { color: Colors.accent.softGold, fontSize: 12, marginTop: 2, fontWeight: '600' },
  cardDept: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  cardSkillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  skillPill: {
    backgroundColor: '#ffffff12',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 4,
  },
  skillPillText: { color: Colors.text.primary, fontSize: 10 },
  cardMetaRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  cardMeta: { color: Colors.text.muted, fontSize: 11 },

  // List card
  listCardOuter: { paddingHorizontal: HORIZONTAL_PADDING, marginTop: 10 },
  listCardInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0B1118',
    padding: 12,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listAvatarText: { color: Colors.text.primary, fontSize: 16, fontWeight: '800' },
  listName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  listRole: { color: Colors.accent.softGold, fontSize: 12, marginTop: 2 },
  listBio: { color: Colors.text.secondary, fontSize: 12, marginTop: 4, lineHeight: 16 },
  listHours: { color: Colors.tech.neonBlue, fontSize: 12, fontWeight: '800' },
  listYear: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Empty / skeleton / footer
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { color: Colors.text.muted, fontSize: 13, textAlign: 'center', marginBottom: 14 },
  emptyButton: {
    backgroundColor: Colors.tech.neonBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#000', fontWeight: '800' },
  skeletonGradient: { backgroundColor: '#0E1418', borderColor: '#ffffff0A' },
  skeletonLine: { height: 10, borderRadius: 5, backgroundColor: '#ffffff12', marginVertical: 6 },
  footer: { alignItems: 'center', paddingTop: 24, paddingBottom: 40 },
  footerText: { color: Colors.text.muted, fontSize: 11, marginVertical: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.92,
    backgroundColor: '#0A0F14',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalHero: { padding: 20, paddingTop: 24, alignItems: 'center' },
  modalHeroTop: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  catBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { color: Colors.text.primary, fontSize: 11, fontWeight: '700' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: Colors.text.primary, fontSize: 16 },
  modalAvatarWrap: { marginTop: 16 },
  modalAvatar: {
    width: 104, height: 104, borderRadius: 52,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#ffffff22',
  },
  modalAvatarText: { color: Colors.text.primary, fontSize: 30, fontWeight: '900' },
  modalTitle: { color: Colors.text.primary, fontSize: 22, fontWeight: '900', marginTop: 10 },
  modalRole: { color: Colors.accent.softGold, fontSize: 13, fontWeight: '700', marginTop: 4 },
  modalTagline: {
    color: Colors.text.secondary, fontStyle: 'italic', fontSize: 12,
    textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 12,
  },
  modalMetaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' },
  modalMetaPill: {
    borderWidth: 1, borderColor: '#ffffff33', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 3, marginBottom: 4,
  },
  modalMetaText: { color: Colors.text.primary, fontSize: 11 },
  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 16, paddingBottom: 20 },
  modalSection: { marginBottom: 18 },
  modalSectionTitle: {
    color: Colors.text.primary, fontSize: 13, fontWeight: '800',
    letterSpacing: 0.4, marginBottom: 6,
  },
  modalSectionBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20 },
  funFactBox: {
    marginTop: 12, padding: 12, backgroundColor: '#ffffff08',
    borderRadius: 12, borderLeftWidth: 3, borderLeftColor: Colors.accent.softGold,
  },
  funFactTitle: { color: Colors.accent.softGold, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  funFactText: { color: Colors.text.primary, fontSize: 13 },
  impactRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff08',
    borderRadius: 14, paddingVertical: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#ffffff14',
  },
  impactCell: { flex: 1, alignItems: 'center' },
  impactDivider: { width: 1, height: 28, backgroundColor: '#ffffff1F' },
  impactValue: { color: Colors.text.primary, fontSize: 17, fontWeight: '800' },
  impactLabel: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  joinedText: { color: Colors.text.muted, fontSize: 11, marginTop: 8, textAlign: 'center' },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap' },
  tagPill: {
    backgroundColor: '#ffffff10', borderWidth: 1, borderColor: '#ffffff22',
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10,
    marginRight: 6, marginBottom: 6,
  },
  tagText: { color: Colors.text.primary, fontSize: 11 },
  achievementRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6 },
  achievementBullet: { color: Colors.accent.softGold, fontSize: 14, marginRight: 8, marginTop: 1 },
  achievementText: { color: Colors.text.secondary, fontSize: 13, flex: 1, lineHeight: 18 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap' },
  socialBtn: {
    backgroundColor: '#ffffff10', borderWidth: 1, borderColor: '#ffffff22',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    marginRight: 6, marginBottom: 6,
  },
  socialBtnText: { color: Colors.text.primary, fontSize: 12, fontWeight: '700' },
  modalActionRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#ffffff18',
  },
  modalAction: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    marginRight: 8, alignItems: 'center', justifyContent: 'center',
  },
  modalActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Sort sheet
  sheetBackdrop: { flex: 1, backgroundColor: '#000000AA' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#0A0F14', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 18, borderTopWidth: 1, borderColor: '#ffffff18',
  },
  sheetTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ffffff0F',
  },
  sheetIcon: { fontSize: 16, marginRight: 10 },
  sheetLabel: { flex: 1, color: Colors.text.secondary, fontSize: 13 },
  sheetLabelActive: { color: Colors.tech.neonBlue, fontWeight: '800' },
  sheetCheck: { color: Colors.tech.neonBlue, fontSize: 16, fontWeight: '800' },
});

export default TeamScreen;
