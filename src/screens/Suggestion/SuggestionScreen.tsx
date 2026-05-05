// =====================================================
// TARU GUARDIANS — SUGGESTION BOX
// Turn your passion into purpose.
// Premium sustainability-themed · ~1500 lines
// =====================================================

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  FlatList,
  Pressable,
  Easing,
  Switch,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Suggestion, SuggestionCategory } from '../../types/navigation';

// ─────────────────────────────────────────────────────
// Layout tokens
// ─────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get('window');
const PAD = SW < 375 ? 14 : 18;
const R = 20;

const ANIM = {
  d: { xs: 160, s: 280, m: 420, l: 600, xl: 900 },
  e: {
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
    spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    soft: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
};

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

type FilterStatus = 'all' | Suggestion['status'];
type SortKey = 'most-voted' | 'newest' | 'trending' | 'implemented';

interface ExtSuggestion extends Suggestion {
  userVoted?: boolean;
  isUserSubmission?: boolean;
  impactTag?: string;
}

// ─────────────────────────────────────────────────────
// Sustainability Categories
// ─────────────────────────────────────────────────────

const CATEGORIES: SuggestionCategory[] = [
  { id: 'all',       name: 'All',          icon: '✦',  color: '#A78BFA', description: 'Every voice matters.' },
  { id: 'climate',   name: 'Climate',      icon: '🌍',  color: '#34D399', description: 'Climate action ideas.' },
  { id: 'greentech', name: 'Green Tech',   icon: '🔋',  color: '#38BDF8', description: 'Sustainable technology.' },
  { id: 'campus',    name: 'Eco Campus',   icon: '🌿',  color: '#86EFAC', description: 'Greener campus life.' },
  { id: 'energy',    name: 'Clean Energy', icon: '☀️',  color: '#FCD34D', description: 'Renewable energy shifts.' },
  { id: 'community', name: 'Community',    icon: '🤝',  color: '#F9A8D4', description: 'People-first initiatives.' },
  { id: 'innovation',name: 'Innovation',   icon: '💡',  color: '#FCA5A5', description: 'Bold new directions.' },
];

// ─────────────────────────────────────────────────────
// Status meta
// ─────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; glow: string }> = {
  pending:     { label: 'Pending',      color: '#FCD34D', glow: 'rgba(252,211,77,0.25)'  },
  'in-review': { label: 'In Review',    color: '#38BDF8', glow: 'rgba(56,189,248,0.25)'  },
  approved:    { label: 'Approved',     color: '#34D399', glow: 'rgba(52,211,153,0.25)'  },
  implemented: { label: 'Implemented',  color: '#A78BFA', glow: 'rgba(167,139,250,0.25)' },
  rejected:    { label: 'Not adopted',  color: '#F87171', glow: 'rgba(248,113,113,0.25)' },
};

// ─────────────────────────────────────────────────────
// Sample suggestions (sustainability themed)
// ─────────────────────────────────────────────────────

const BASE_SUGGESTIONS: ExtSuggestion[] = [
  {
    id: 's1',
    title: 'Solar panels on the club rooftop',
    description:
      'Install small solar panels on the TARU terrace to power our events and reduce grid dependency. Estimated payback: 2 years.',
    category: 'energy',
    status: 'approved',
    priority: 'high',
    votes: 142,
    createdAt: '2025-11-01',
    author: 'Aryan M.',
    anonymous: false,
    tags: ['solar', 'renewable', 'energy'],
    impactTag: '🌟 High Impact',
    userVoted: false,
  },
  {
    id: 's2',
    title: 'Zero-waste hackathon pledge',
    description:
      'All future TARU hackathons should run on zero-waste principles — no single-use plastic, compostable food stalls, and a reuse station.',
    category: 'campus',
    status: 'in-review',
    priority: 'high',
    votes: 98,
    createdAt: '2025-12-10',
    author: 'Priya S.',
    anonymous: false,
    tags: ['zero-waste', 'hackathon', 'campus'],
    impactTag: '♻️ Eco First',
    userVoted: false,
  },
  {
    id: 's3',
    title: 'AI model to track campus carbon footprint',
    description:
      'Build an open-source ML pipeline that measures our campus carbon emissions monthly and surfaces it on the TARU dashboard.',
    category: 'greentech',
    status: 'pending',
    priority: 'medium',
    votes: 77,
    createdAt: '2026-01-05',
    author: 'Kavya R.',
    anonymous: false,
    tags: ['AI', 'carbon', 'data'],
    impactTag: '🔬 Data-Driven',
    userVoted: false,
  },
  {
    id: 's4',
    title: 'Plant a tree for every member milestone',
    description:
      'Every time a member reaches a milestone (project shipped, event led, 6-month mark), TARU plants a tree in their name through a verified NGO.',
    category: 'community',
    status: 'implemented',
    priority: 'medium',
    votes: 203,
    createdAt: '2025-09-15',
    author: 'Dev K.',
    anonymous: false,
    tags: ['trees', 'milestone', 'community'],
    impactTag: '🌳 Already Live',
    userVoted: false,
  },
  {
    id: 's5',
    title: 'Monthly climate reading circle',
    description:
      'A relaxed monthly reading group where members explore one climate book or paper together, then discuss practical local actions.',
    category: 'climate',
    status: 'approved',
    priority: 'low',
    votes: 54,
    createdAt: '2026-02-20',
    author: 'Anonymous',
    anonymous: true,
    tags: ['reading', 'climate', 'culture'],
    impactTag: '📚 Culture Shift',
    userVoted: false,
  },
  {
    id: 's6',
    title: 'Cycle-to-club incentive program',
    description:
      'Members who cycle to TARU events get bonus impact points redeemable for merchandise or event priority. Track via a simple form check-in.',
    category: 'campus',
    status: 'in-review',
    priority: 'medium',
    votes: 89,
    createdAt: '2026-03-01',
    author: 'Siya P.',
    anonymous: false,
    tags: ['cycling', 'transport', 'incentive'],
    impactTag: '🚲 Active Movement',
    userVoted: false,
  },
  {
    id: 's7',
    title: 'Open-source sustainability toolkit',
    description:
      'Create a GitHub-hosted starter kit for college clubs to measure and reduce their environmental impact. TARU leads, others fork.',
    category: 'innovation',
    status: 'pending',
    priority: 'high',
    votes: 115,
    createdAt: '2026-04-10',
    author: 'Rohan T.',
    anonymous: false,
    tags: ['opensource', 'toolkit', 'GitHub'],
    impactTag: '💻 Build It',
    userVoted: false,
  },
];

// ─────────────────────────────────────────────────────
// Impact stats config
// ─────────────────────────────────────────────────────

const IMPACT_STATS = [
  { value: '12,400', label: 'Trees Planted', icon: '🌳', color: '#34D399' },
  { value: '46',     label: 'Ideas Shipped',  icon: '🚀', color: '#38BDF8' },
  { value: '210+',   label: 'Voices Heard',   icon: '🎙️', color: '#A78BFA' },
  { value: '14d',    label: 'Avg Response',   icon: '⚡',  color: '#FCD34D' },
];

// ─────────────────────────────────────────────────────
// Sub-component: PulseRing
// ─────────────────────────────────────────────────────

const PulseRing: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.5, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─────────────────────────────────────────────────────
// Sub-component: FloatingOrb
// ─────────────────────────────────────────────────────

const FloatingOrb: React.FC<{ x: number; y: number; color: string; size: number; delay: number }> = ({
  x, y, color, size, delay,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacityVal = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -14, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacityVal, { toValue: 0.35, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacityVal, { toValue: 0.18, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityVal,
        transform: [{ translateY }],
      }}
    />
  );
};

// ─────────────────────────────────────────────────────
// Sub-component: ImpactStatCard
// ─────────────────────────────────────────────────────

const ImpactStatCard: React.FC<{
  stat: typeof IMPACT_STATS[0];
  index: number;
}> = ({ stat, index }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    anim.setValue(1);
  }, []);

  return (
    <Animated.View
      style={[
        ss.impactCard,
        {
          opacity: anim,
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={ss.impactCardGrad}
      >
        <Text style={ss.impactIcon}>{stat.icon}</Text>
        <Text style={[ss.impactValue, { color: stat.color }]}>{stat.value}</Text>
        <Text style={ss.impactLabel}>{stat.label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────
// Sub-component: CategoryChip
// ─────────────────────────────────────────────────────

const CategoryChip: React.FC<{
  cat: SuggestionCategory;
  active: boolean;
  onPress: () => void;
}> = ({ cat, active, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, easing: ANIM.e.spring, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={
            active
              ? [`${cat.color}33`, `${cat.color}18`]
              : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
          }
          style={[
            ss.chip,
            active && { borderColor: `${cat.color}88`, borderWidth: 1.5 },
          ]}
        >
          <Text style={ss.chipIcon}>{cat.icon}</Text>
          <Text style={[ss.chipLabel, active && { color: cat.color }]}>{cat.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────
// Sub-component: SuggCard
// ─────────────────────────────────────────────────────

const SuggCard: React.FC<{
  item: ExtSuggestion;
  index: number;
  onVote: (id: string) => void;
  onOpen: (item: ExtSuggestion) => void;
}> = ({ item, index, onVote, onOpen }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const voteScale = useRef(new Animated.Value(1)).current;
  const meta = STATUS_META[item.status] ?? STATUS_META.pending;
  const cat = CATEGORIES.find(c => c.id === item.category) ?? CATEGORIES[0];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: ANIM.d.l,
      delay: index * 90,
      easing: ANIM.e.out,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVote = () => {
    Animated.sequence([
      Animated.timing(voteScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(voteScale, { toValue: 1, duration: 220, easing: ANIM.e.spring, useNativeDriver: true }),
    ]).start();
    onVote(item.id);
  };

  return (
    <Animated.View
      style={[
        ss.cardWrap,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={() => onOpen(item)} activeOpacity={0.88}>
        <View style={[ss.card, { shadowColor: meta.glow }]}>
          {/* Glow border accent */}
          <View style={[ss.cardAccentBar, { backgroundColor: meta.color }]} />

          {/* Top row */}
          <View style={ss.cardTopRow}>
            {/* Category pill */}
            <View style={[ss.catPill, { backgroundColor: `${cat.color}22` }]}>
              <Text style={ss.catPillIcon}>{cat.icon}</Text>
              <Text style={[ss.catPillLabel, { color: cat.color }]}>{cat.name}</Text>
            </View>

            {/* Status badge */}
            <View style={[ss.statusBadge, { backgroundColor: meta.glow }]}>
              <View style={[ss.statusDot, { backgroundColor: meta.color }]} />
              <Text style={[ss.statusLabel, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={ss.cardTitle} numberOfLines={2}>{item.title}</Text>

          {/* Description */}
          <Text style={ss.cardDesc} numberOfLines={2}>{item.description}</Text>

          {/* Impact tag */}
          {item.impactTag ? (
            <View style={ss.impactTagRow}>
              <Text style={ss.impactTagText}>{item.impactTag}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {item.tags && item.tags.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ss.tagsRow}>
              {item.tags.slice(0, 4).map(t => (
                <View key={t} style={ss.tag}>
                  <Text style={ss.tagText}>#{t}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          {/* Bottom row */}
          <View style={ss.cardBottom}>
            {/* Author */}
            <Text style={ss.cardAuthor}>
              {item.anonymous ? '🌿 Anonymous' : `✦ ${item.author}`}
            </Text>

            {/* Vote button */}
            <TouchableOpacity onPress={handleVote} activeOpacity={0.8} style={ss.voteBtn}>
              <Animated.View style={{ transform: [{ scale: voteScale }] }}>
                <LinearGradient
                  colors={
                    item.userVoted
                      ? ['#34D399', '#059669']
                      : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                  }
                  style={ss.voteBtnInner}
                >
                  <Text style={ss.voteArrow}>{item.userVoted ? '▲' : '△'}</Text>
                  <Text style={[ss.voteCount, item.userVoted && { color: '#fff' }]}>
                    {item.votes}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────

const SuggestionScreen: React.FC = () => {
  // ── State ──────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<ExtSuggestion[]>(BASE_SUGGESTIONS);
  const [userSubmissions, setUserSubmissions] = useState<ExtSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('most-voted');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ExtSuggestion | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<ExtSuggestion | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // form state
  const [formCategory, setFormCategory] = useState('climate');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Suggestion['priority']>('medium');
  const [formAnon, setFormAnon] = useState(false);
  const [formTagInput, setFormTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ── Animation refs ─────────────────────────────────
  const headerAnim    = useRef(new Animated.Value(1)).current;
  const impactAnim    = useRef(new Animated.Value(1)).current;
  const chipAnim      = useRef(new Animated.Value(1)).current;
  const fabScale      = useRef(new Animated.Value(1)).current;
  const fabGlow       = useRef(new Animated.Value(0)).current;
  const successScale  = useRef(new Animated.Value(0.8)).current;
  const successOpacity= useRef(new Animated.Value(0)).current;
  const modalOpacity  = useRef(new Animated.Value(0)).current;
  const modalSlide    = useRef(new Animated.Value(60)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  // ── Entry animations ───────────────────────────────
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, { toValue: 1, duration: ANIM.d.l, easing: ANIM.e.out, useNativeDriver: true }),
      Animated.timing(impactAnim, { toValue: 1, duration: ANIM.d.l, easing: ANIM.e.out, useNativeDriver: true }),
      Animated.timing(chipAnim,   { toValue: 1, duration: ANIM.d.l, easing: ANIM.e.out, useNativeDriver: true }),
    ]).start();
  }, []);

  // FAB breathing glow
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(fabGlow, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Filtered + display data ────────────────────────
  const filtered = useMemo(() => {
    let list = [...suggestions];

    if (selectedCategory !== 'all') {
      list = list.filter(s => s.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      list = list.filter(s => s.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }

    switch (sortKey) {
      case 'most-voted':  list.sort((a, b) => b.votes - a.votes); break;
      case 'newest':      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'trending':    list.sort((a, b) => (b.votes * 0.7) - (a.votes * 0.7)); break;
      case 'implemented': list = list.filter(s => s.status === 'implemented'); break;
    }

    return list;
  }, [suggestions, selectedCategory, selectedStatus, searchQuery, sortKey]);

  const displayData = useMemo(() => {
    const userIds = new Set(userSubmissions.map(u => u.id));
    const sampleLast3 = filtered.filter(s => !userIds.has(s.id)).slice(-3);
    return [...userSubmissions, ...sampleLast3];
  }, [userSubmissions, filtered]);

  // ── Handlers ───────────────────────────────────────
  const handleVote = useCallback((id: string) => {
    setSuggestions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, votes: s.userVoted ? s.votes - 1 : s.votes + 1, userVoted: !s.userVoted }
          : s
      )
    );
    setUserSubmissions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, votes: s.userVoted ? s.votes - 1 : s.votes + 1, userVoted: !s.userVoted }
          : s
      )
    );
  }, []);

  const handleOpenDetail = useCallback((item: ExtSuggestion) => {
    setSelectedSuggestion(item);
    setShowDetailModal(true);
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 1, duration: ANIM.d.m, useNativeDriver: true }),
      Animated.timing(modalSlide,   { toValue: 0, duration: ANIM.d.m, easing: ANIM.e.spring, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCloseDetail = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 0, duration: ANIM.d.s, useNativeDriver: true }),
      Animated.timing(modalSlide,   { toValue: 60, duration: ANIM.d.s, useNativeDriver: true }),
    ]).start(() => {
      setShowDetailModal(false);
      setSelectedSuggestion(null);
    });
  }, []);

  const openSubmit = () => {
    setShowSubmitModal(true);
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 200, easing: ANIM.e.spring, useNativeDriver: true }),
    ]).start();
  };

  const closeSubmit = () => {
    setShowSubmitModal(false);
    setFormTitle('');
    setFormDesc('');
    setFormTags([]);
    setFormTagInput('');
    setFormPriority('medium');
    setFormAnon(false);
  };

  const addTag = () => {
    const t = formTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !formTags.includes(t) && formTags.length < 5) {
      setFormTags(prev => [...prev, t]);
      setFormTagInput('');
    }
  };

  const removeTag = (tag: string) => setFormTags(prev => prev.filter(t => t !== tag));

  const submitSuggestion = async () => {
    if (!formTitle.trim() || formTitle.trim().length < 5) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    const newSugg: ExtSuggestion = {
      id: `user-${Date.now()}`,
      title: formTitle.trim(),
      description: formDesc.trim() || 'No description provided.',
      category: formCategory,
      status: 'pending',
      priority: formPriority,
      votes: 1,
      createdAt: new Date().toISOString().split('T')[0],
      author: formAnon ? 'Anonymous' : 'You',
      anonymous: formAnon,
      tags: formTags,
      userVoted: true,
      isUserSubmission: true,
      impactTag: '🌱 Just submitted',
    };

    setUserSubmissions(prev => [newSugg, ...prev]);
    setLastSubmitted(newSugg);
    setSubmitting(false);
    closeSubmit();

    // Trigger success card
    setShowSuccessCard(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: ANIM.d.m, useNativeDriver: true }),
    ]).start();
  };

  const dismissSuccess = () => {
    Animated.parallel([
      Animated.timing(successOpacity, { toValue: 0, duration: ANIM.d.s, useNativeDriver: true }),
      Animated.timing(successScale, { toValue: 0.85, duration: ANIM.d.s, useNativeDriver: true }),
    ]).start(() => {
      setShowSuccessCard(false);
      successScale.setValue(0.8);
      successOpacity.setValue(0);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  // ── Render: Header ─────────────────────────────────
  const renderHeader = () => (
    <Animated.View
      style={[
        ss.headerWrap,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}
    >
      <LinearGradient
        colors={['#0A1A12', '#050F0A', '#000000']}
        style={ss.headerGrad}
      >
        {/* Floating orbs */}
        <FloatingOrb x={SW * 0.7} y={10}  color="#34D399" size={80}  delay={0}    />
        <FloatingOrb x={SW * 0.1} y={30}  color="#38BDF8" size={55}  delay={600}  />
        <FloatingOrb x={SW * 0.5} y={55}  color="#A78BFA" size={40}  delay={1200} />

        {/* Top tag */}
        <View style={ss.headerTag}>
          <View style={ss.headerTagDot} />
          <Text style={ss.headerTagText}>TARU GUARDIANS · VOICES</Text>
        </View>

        {/* Main heading */}
        <Text style={ss.headerTitle}>Suggestion{'\n'}Box</Text>

        {/* Tagline */}
        <View style={ss.taglineRow}>
          <LinearGradient
            colors={['#34D399', '#38BDF8', '#A78BFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={ss.taglineGrad}
          >
            <Text style={ss.taglineText}>Turn your passion into purpose.</Text>
          </LinearGradient>
        </View>

        <Text style={ss.headerSub}>
          Every idea matters. Submit yours — the council reviews within 14 days.
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  // ── Render: Impact Banner ──────────────────────────
  const renderImpactBanner = () => (
    <Animated.View
      style={[
        ss.impactWrap,
        {
          opacity: impactAnim,
          transform: [{ translateY: impactAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
    >
      <View style={ss.impactHeader}>
        <Text style={ss.impactHeaderTitle}>Our Collective Impact</Text>
        <Text style={ss.impactHeaderSub}>Ideas that changed things.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ss.impactRow}>
        {IMPACT_STATS.map((stat, i) => (
          <ImpactStatCard key={stat.label} stat={stat} index={i} />
        ))}
      </ScrollView>
    </Animated.View>
  );

  // ── Render: Category Row ───────────────────────────
  const renderCategories = () => (
    <Animated.View
      style={[
        ss.catWrap,
        {
          opacity: chipAnim,
          transform: [{ translateY: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ss.catRow}>
        {CATEGORIES.map(cat => (
          <CategoryChip
            key={cat.id}
            cat={cat}
            active={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );

  // ── Render: Search + Sort Row ──────────────────────
  const renderSearchSort = () => (
    <View style={ss.searchSortRow}>
      <Animated.View
        style={[
          ss.searchWrap,
          {
            borderColor: searchFocusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255,255,255,0.1)', '#34D399'],
            }),
          },
        ]}
      >
        <Text style={ss.searchIcon}>🔍</Text>
        <TextInput
          style={ss.searchInput}
          placeholder="Search ideas…"
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => Animated.timing(searchFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
          onBlur={() => Animated.timing(searchFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={ss.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <TouchableOpacity onPress={() => setShowSortSheet(true)} style={ss.sortBtn}>
        <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']} style={ss.sortBtnInner}>
          <Text style={ss.sortIcon}>⇅</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Render: List Header ────────────────────────────
  const renderListHeader = () => (
    <View>
      {renderHeader()}
      {renderImpactBanner()}
      {renderCategories()}
      {renderSearchSort()}
      <View style={ss.listTitleRow}>
        <Text style={ss.listTitle}>
          {selectedCategory === 'all' ? 'Top Suggestions' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </Text>
        <Text style={ss.listCount}>{displayData.length} ideas</Text>
      </View>
    </View>
  );

  // ── Render: Empty ──────────────────────────────────
  const renderEmpty = () => (
    <View style={ss.emptyWrap}>
      <Text style={ss.emptyIcon}>🌱</Text>
      <Text style={ss.emptyTitle}>No ideas yet here.</Text>
      <Text style={ss.emptySub}>Be the first to plant a seed.</Text>
      <TouchableOpacity onPress={openSubmit} style={ss.emptyBtn}>
        <LinearGradient colors={['#34D399', '#059669']} style={ss.emptyBtnInner}>
          <Text style={ss.emptyBtnText}>Submit an idea</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Render: Sort Sheet ─────────────────────────────
  const renderSortSheet = () => (
    <Modal visible={showSortSheet} transparent animationType="slide" onRequestClose={() => setShowSortSheet(false)}>
      <TouchableWithoutFeedback onPress={() => setShowSortSheet(false)}>
        <View style={ss.sheetBackdrop} />
      </TouchableWithoutFeedback>
      <View style={ss.sheet}>
        <View style={ss.sheetHandle} />
        <Text style={ss.sheetTitle}>Sort By</Text>
        {(['most-voted', 'newest', 'trending', 'implemented'] as SortKey[]).map(k => (
          <TouchableOpacity
            key={k}
            style={[ss.sheetItem, sortKey === k && ss.sheetItemActive]}
            onPress={() => { setSortKey(k); setShowSortSheet(false); }}
          >
            <Text style={[ss.sheetItemText, sortKey === k && { color: '#34D399' }]}>
              {k === 'most-voted' ? '▲ Most Voted' : k === 'newest' ? '✦ Newest' : k === 'trending' ? '🔥 Trending' : '✅ Implemented'}
            </Text>
            {sortKey === k && <Text style={ss.sheetCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

  // ── Render: Submit Modal ───────────────────────────
  const renderSubmitModal = () => (
    <Modal visible={showSubmitModal} transparent animationType="slide" onRequestClose={closeSubmit}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={closeSubmit}>
          <View style={ss.submitBackdrop} />
        </TouchableWithoutFeedback>

        <View style={ss.submitSheet}>
          <LinearGradient colors={['#0D1A12', '#080F0A', '#050808']} style={ss.submitSheetGrad}>
            {/* Handle */}
            <View style={ss.sheetHandle} />

            {/* Header */}
            <View style={ss.submitHeader}>
              <View>
                <Text style={ss.submitTitle}>New Idea 🌿</Text>
                <Text style={ss.submitTagline}>Turn your passion into purpose.</Text>
              </View>
              <TouchableOpacity onPress={closeSubmit} style={ss.submitClose}>
                <Text style={ss.submitCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Category picker */}
              <Text style={ss.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ss.formCatRow}>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFormCategory(cat.id)}
                    style={[
                      ss.formCatChip,
                      formCategory === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}18` },
                    ]}
                  >
                    <Text style={ss.formCatIcon}>{cat.icon}</Text>
                    <Text style={[ss.formCatLabel, formCategory === cat.id && { color: cat.color }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text style={ss.fieldLabel}>Idea Title *</Text>
              <TextInput
                style={ss.textInput}
                placeholder="e.g. Solar panels on the terrace…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={formTitle}
                onChangeText={setFormTitle}
                maxLength={100}
              />
              <Text style={ss.charCount}>{formTitle.length}/100</Text>

              {/* Description */}
              <Text style={ss.fieldLabel}>Describe your idea</Text>
              <TextInput
                style={[ss.textInput, ss.textArea]}
                placeholder="What problem does it solve? How would it work? Who benefits?"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={formDesc}
                onChangeText={setFormDesc}
                multiline
                maxLength={400}
                textAlignVertical="top"
              />
              <Text style={ss.charCount}>{formDesc.length}/400</Text>

              {/* Priority */}
              <Text style={ss.fieldLabel}>Priority</Text>
              <View style={ss.priorityRow}>
                {(['low', 'medium', 'high'] as Suggestion['priority'][]).map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setFormPriority(p)}
                    style={[
                      ss.priorityBtn,
                      formPriority === p && {
                        borderColor: p === 'high' ? '#F87171' : p === 'medium' ? '#FCD34D' : '#86EFAC',
                        backgroundColor: p === 'high' ? '#F8717122' : p === 'medium' ? '#FCD34D22' : '#86EFAC22',
                      },
                    ]}
                  >
                    <Text style={[
                      ss.priorityLabel,
                      formPriority === p && {
                        color: p === 'high' ? '#F87171' : p === 'medium' ? '#FCD34D' : '#86EFAC',
                      },
                    ]}>
                      {p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Medium' : '🟢 Low'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tags */}
              <Text style={ss.fieldLabel}>Tags (optional)</Text>
              <View style={ss.tagInputRow}>
                <TextInput
                  style={[ss.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="e.g. solar, campus…"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={formTagInput}
                  onChangeText={setFormTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addTag} style={ss.tagAddBtn}>
                  <Text style={ss.tagAddText}>+</Text>
                </TouchableOpacity>
              </View>
              {formTags.length > 0 && (
                <View style={ss.formTagsWrap}>
                  {formTags.map(t => (
                    <TouchableOpacity key={t} onPress={() => removeTag(t)} style={ss.formTag}>
                      <Text style={ss.formTagText}>#{t} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Anonymous toggle */}
              <View style={ss.anonRow}>
                <View>
                  <Text style={ss.anonLabel}>Submit anonymously</Text>
                  <Text style={ss.anonSub}>Your name won't be shown on the card.</Text>
                </View>
                <Switch
                  value={formAnon}
                  onValueChange={setFormAnon}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#34D399' }}
                  thumbColor="#fff"
                />
              </View>

              {/* Submit button */}
              <TouchableOpacity
                onPress={submitSuggestion}
                disabled={submitting || formTitle.trim().length < 5}
                style={[ss.submitBtnWrap, (submitting || formTitle.trim().length < 5) && { opacity: 0.45 }]}
              >
                <LinearGradient colors={['#34D399', '#059669']} style={ss.submitBtnGrad}>
                  <Text style={ss.submitBtnText}>
                    {submitting ? 'Submitting…' : '🌿 Submit Idea'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={ss.submitFooter}>
                Council reviews within 14 days · you'll see status updates in this list.
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ── Render: Success Card ───────────────────────────
  const renderSuccessCard = () => (
    <Modal visible={showSuccessCard} transparent animationType="none" onRequestClose={dismissSuccess}>
      <View style={ss.successBackdrop}>
        <Animated.View
          style={[
            ss.successCard,
            { opacity: successOpacity, transform: [{ scale: successScale }] },
          ]}
        >
          <LinearGradient colors={['#0D1F16', '#050F0A']} style={ss.successCardGrad}>
            {/* Pulse rings */}
            <View style={ss.successIconWrap}>
              <PulseRing color="#34D399" size={90} />
              <PulseRing color="#38BDF8" size={70} />
              <View style={ss.successIconCircle}>
                <Text style={ss.successIconText}>✓</Text>
              </View>
            </View>

            <Text style={ss.successHeading}>Idea submitted!</Text>
            <Text style={ss.successTitle}>{lastSubmitted?.title}</Text>
            <Text style={ss.successSub}>
              Turn your passion into purpose — the council reviews within 14 days.
            </Text>

            <View style={ss.successActions}>
              <TouchableOpacity
                onPress={dismissSuccess}
                style={ss.successViewBtn}
              >
                <LinearGradient colors={['#34D399', '#059669']} style={ss.successBtnGrad}>
                  <Text style={ss.successViewBtnText}>View in list</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={dismissSuccess} style={ss.successDismissBtn}>
                <Text style={ss.successDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  // ── Render: Detail Modal ───────────────────────────
  const renderDetailModal = () => {
    if (!selectedSuggestion) return null;
    const meta = STATUS_META[selectedSuggestion.status] ?? STATUS_META.pending;
    const cat = CATEGORIES.find(c => c.id === selectedSuggestion.category) ?? CATEGORIES[0];
    return (
      <Modal visible={showDetailModal} transparent animationType="none" onRequestClose={handleCloseDetail}>
        <TouchableWithoutFeedback onPress={handleCloseDetail}>
          <Animated.View style={[ss.detailBackdrop, { opacity: modalOpacity }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            ss.detailSheet,
            { transform: [{ translateY: modalSlide }], opacity: modalOpacity },
          ]}
        >
          <LinearGradient colors={['#0D1A12', '#060E08', '#030608']} style={ss.detailGrad}>
            <View style={ss.sheetHandle} />

            {/* Status glow bar */}
            <View style={[ss.detailGlowBar, { backgroundColor: meta.color }]} />

            {/* Cat + status row */}
            <View style={ss.detailTopRow}>
              <View style={[ss.catPill, { backgroundColor: `${cat.color}22` }]}>
                <Text style={ss.catPillIcon}>{cat.icon}</Text>
                <Text style={[ss.catPillLabel, { color: cat.color }]}>{cat.name}</Text>
              </View>
              <View style={[ss.statusBadge, { backgroundColor: meta.glow }]}>
                <View style={[ss.statusDot, { backgroundColor: meta.color }]} />
                <Text style={[ss.statusLabel, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={ss.detailTitle}>{selectedSuggestion.title}</Text>
              <Text style={ss.detailDesc}>{selectedSuggestion.description}</Text>

              {selectedSuggestion.impactTag ? (
                <View style={ss.detailImpactTag}>
                  <Text style={ss.detailImpactTagText}>{selectedSuggestion.impactTag}</Text>
                </View>
              ) : null}

              {selectedSuggestion.tags && selectedSuggestion.tags.length > 0 ? (
                <View style={ss.detailTagsRow}>
                  {selectedSuggestion.tags.map(t => (
                    <View key={t} style={ss.tag}><Text style={ss.tagText}>#{t}</Text></View>
                  ))}
                </View>
              ) : null}

              <View style={ss.detailMeta}>
                <Text style={ss.detailMetaItem}>
                  👤 {selectedSuggestion.anonymous ? 'Anonymous' : selectedSuggestion.author}
                </Text>
                <Text style={ss.detailMetaItem}>📅 {selectedSuggestion.createdAt}</Text>
                <Text style={ss.detailMetaItem}>▲ {selectedSuggestion.votes} votes</Text>
                <Text style={ss.detailMetaItem}>
                  🔺 Priority: {selectedSuggestion.priority}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => { handleVote(selectedSuggestion.id); handleCloseDetail(); }}
                style={ss.detailVoteBtn}
              >
                <LinearGradient
                  colors={selectedSuggestion.userVoted ? ['#F87171', '#B91C1C'] : ['#34D399', '#059669']}
                  style={ss.detailVoteBtnGrad}
                >
                  <Text style={ss.detailVoteBtnText}>
                    {selectedSuggestion.userVoted ? '▼ Remove vote' : '▲ Upvote this idea'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </Modal>
    );
  };

  // ── FAB ───────────────────────────────────────────
  const renderFAB = () => (
    <Animated.View
      style={[
        ss.fabWrap,
        {
          transform: [{ scale: fabScale }],
          shadowOpacity: fabGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
        },
      ]}
    >
      <TouchableOpacity onPress={openSubmit} activeOpacity={0.85}>
        <LinearGradient colors={['#34D399', '#059669', '#047857']} style={ss.fab}>
          <Text style={ss.fabIcon}>＋</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  // ── Main Render ────────────────────────────────────
  return (
    <SafeAreaView style={ss.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <FlatList
        data={displayData}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <SuggCard item={item} index={index} onVote={handleVote} onOpen={handleOpenDetail} />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={ss.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#34D399"
            colors={['#34D399']}
          />
        }
      />

      {renderFAB()}
      {renderSortSheet()}
      {renderSubmitModal()}
      {renderSuccessCard()}
      {renderDetailModal()}
    </SafeAreaView>
  );
};

export default SuggestionScreen;

// ─────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────

const ss = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 120,
  },

  // ── Header ────────────────────────────────────────
  headerWrap: {
    marginBottom: 4,
  },
  headerGrad: {
    paddingTop: 28,
    paddingHorizontal: PAD,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 7,
  },
  headerTagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.45)',
  },
  headerTitle: {
    fontSize: SW < 375 ? 42 : 52,
    fontWeight: '800',
    color: '#fff',
    lineHeight: SW < 375 ? 48 : 58,
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  taglineRow: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderRadius: 6,
    overflow: 'hidden',
  },
  taglineGrad: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
    maxWidth: SW * 0.75,
  },

  // ── Impact Banner ─────────────────────────────────
  impactWrap: {
    marginHorizontal: PAD,
    marginBottom: 20,
    borderRadius: R,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  impactHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  impactHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  impactHeaderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  impactRow: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  impactCard: {
    width: 110,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  impactCardGrad: {
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  impactIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  impactLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── Category chips ────────────────────────────────
  catWrap: {
    marginBottom: 14,
  },
  catRow: {
    paddingHorizontal: PAD,
    gap: 9,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 5,
  },
  chipIcon: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },

  // ── Search + Sort ─────────────────────────────────
  searchSortRow: {
    flexDirection: 'row',
    paddingHorizontal: PAD,
    marginBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 14,
  },
  searchClear: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    padding: 4,
  },
  sortBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sortBtnInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sortIcon: {
    fontSize: 18,
    color: '#fff',
  },

  // ── List title ────────────────────────────────────
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PAD,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  listCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },

  // ── Suggestion Card ───────────────────────────────
  cardWrap: {
    marginHorizontal: PAD,
    marginBottom: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: R,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardAccentBar: {
    height: 3,
    width: '100%',
    opacity: 0.7,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 50,
    gap: 4,
  },
  catPillIcon: {
    fontSize: 11,
  },
  catPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 50,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  impactTagRow: {
    marginHorizontal: 14,
    marginBottom: 8,
  },
  impactTagText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  tagsRow: {
    marginLeft: 14,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 50,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  cardAuthor: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  voteBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  voteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    gap: 5,
  },
  voteArrow: {
    fontSize: 11,
    color: '#fff',
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },

  // ── Empty State ───────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  emptyBtnInner: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 50,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Sort Sheet ────────────────────────────────────
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D1A12',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sheetItemActive: {
    borderColor: 'rgba(52,211,153,0.2)',
  },
  sheetItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  sheetCheck: {
    fontSize: 16,
    color: '#34D399',
    fontWeight: '700',
  },

  // ── Submit Modal ──────────────────────────────────
  submitBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  submitSheet: {
    maxHeight: SH * 0.92,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  submitSheetGrad: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    marginTop: 8,
  },
  submitTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  submitTagline: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600',
    marginTop: 3,
  },
  submitClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitCloseText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  formCatRow: {
    marginBottom: 4,
  },
  formCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
    gap: 5,
  },
  formCatIcon: {
    fontSize: 13,
  },
  formCatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 13,
  },
  charCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'right',
    marginBottom: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  tagAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52,211,153,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  tagAddText: {
    fontSize: 22,
    color: '#34D399',
    fontWeight: '300',
    lineHeight: 26,
  },
  formTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  formTag: {
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderRadius: 50,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
  },
  formTagText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  anonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  anonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  anonSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  submitBtnWrap: {
    marginTop: 22,
    borderRadius: 50,
    overflow: 'hidden',
  },
  submitBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 50,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  submitFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 14,
    lineHeight: 16,
  },

  // ── Success Card ──────────────────────────────────
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
  },
  successCardGrad: {
    padding: 32,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  successIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 8,
  },
  successIconText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
  },
  successHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34D399',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  successSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 26,
    fontStyle: 'italic',
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  successViewBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  successBtnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 50,
  },
  successViewBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  successDismissBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  successDismissText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },

  // ── Detail Modal ──────────────────────────────────
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  detailSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SH * 0.85,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  detailGrad: {
    padding: 20,
    paddingBottom: 40,
    flex: 1,
  },
  detailGlowBar: {
    height: 3,
    width: 60,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 27,
    marginBottom: 10,
  },
  detailDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    marginBottom: 14,
  },
  detailImpactTag: {
    marginBottom: 10,
  },
  detailImpactTagText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '700',
  },
  detailTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  detailMeta: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  detailMetaItem: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  detailVoteBtn: {
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  detailVoteBtnGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 50,
  },
  detailVoteBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  // ── FAB ───────────────────────────────────────────
  fabWrap: {
    position: 'absolute',
    bottom: 30,
    right: 22,
    borderRadius: 50,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
});
