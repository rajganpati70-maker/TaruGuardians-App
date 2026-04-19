// =====================================================
// TARU GUARDIANS — HOME (Premium Landing)
// Hero · stats · announcements · events · spotlights · gallery · timeline · pledges · quick actions
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
  FlatList,
  RefreshControl,
  Modal,
  Alert,
  Linking,
  Platform,
  Share,
  Easing,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { HomeStats, Announcement } from '../../types/navigation';

// -----------------------------------------------------
// Tokens
// -----------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 22;
const HERO_HEIGHT = IS_SMALL ? 260 : 300;

const ANIM = {
  duration: { fast: 200, normal: 360, slow: 520, xslow: 820 },
  easing: {
    inOut: Easing.inOut(Easing.cubic),
    out: Easing.out(Easing.cubic),
    soft: Easing.bezier(0.25, 0.1, 0.25, 1),
    overshoot: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
};

// -----------------------------------------------------
// Hero slides
// -----------------------------------------------------

interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTarget?: string;
  gradient: readonly [string, string, ...string[]];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    eyebrow: '🌿 TARU GUARDIANS',
    title: 'A tech club\nrooted in nature.',
    subtitle:
      'Sustainability × engineering × culture. Ship small. Plant often. Show up for each other.',
    ctaLabel: 'See this week\'s events',
    gradient: ['#042F1A', '#0A3F2A', '#0C5540'],
  },
  {
    id: 'hero-2',
    eyebrow: '🌱 SUSTAINABILITY DRIVE',
    title: '12,000 saplings,\n6 semesters.',
    subtitle:
      '74% survival rate across 3 urban campuses. Curated with native species only.',
    ctaLabel: 'Open impact dashboard',
    gradient: ['#053049', '#064B6E', '#0B6B8F'],
  },
  {
    id: 'hero-3',
    eyebrow: '🧠 TECH FOR GOOD',
    title: 'Build tools,\nnot noise.',
    subtitle:
      'We build small utilities for real people — no dashboards nobody reads, no hype trains.',
    ctaLabel: 'Browse open issues',
    gradient: ['#1C1038', '#2C1A58', '#3F2474'],
  },
  {
    id: 'hero-4',
    eyebrow: '🫶 COMMUNITY',
    title: 'Kindness scales.\nChaos doesn\'t.',
    subtitle:
      'An honest, drama-free space to grow. Office hours, mentor circles, Friday no-laptop rituals.',
    ctaLabel: 'Find a mentor',
    gradient: ['#3A1240', '#531750', '#79266D'],
  },
  {
    id: 'hero-5',
    eyebrow: '🎉 FLAGSHIP',
    title: 'Taru Fest 2026\nis close.',
    subtitle: 'Four days. Six wings. One unforgettable weekend of building + learning + celebrating.',
    ctaLabel: 'Reserve your spot',
    gradient: ['#571607', '#7A1F0E', '#A3291A'],
  },
];

// -----------------------------------------------------
// Stats
// -----------------------------------------------------

interface HomeStatCard {
  id: string;
  label: string;
  value: string;
  caption: string;
  icon: string;
  color: string;
}

const STATS: HomeStatCard[] = [
  { id: 'members', label: 'Members', value: '210+', caption: 'Across 6 wings', icon: '🧑‍🤝‍🧑', color: '#38BDF8' },
  { id: 'events', label: 'Events', value: '148', caption: 'All time', icon: '📅', color: '#4ADE80' },
  { id: 'alumni', label: 'Alumni', value: '520+', caption: 'Giving back', icon: '🎓', color: '#FBBF24' },
  { id: 'trees', label: 'Trees', value: '12,400', caption: 'Planted, 74% alive', icon: '🌳', color: '#22C55E' },
  { id: 'shipped', label: 'Projects', value: '46', caption: 'Shipped, not shelved', icon: '🚀', color: '#A78BFA' },
  { id: 'hours', label: 'Hours', value: '38k+', caption: 'Volunteered', icon: '⏱', color: '#F472B6' },
];

// -----------------------------------------------------
// Announcements
// -----------------------------------------------------

interface ExtAnnouncement extends Announcement {
  pinned?: boolean;
  category: 'event' | 'drive' | 'program' | 'ops' | 'update';
  color: string;
  emoji: string;
}

const ANNOUNCEMENTS: ExtAnnouncement[] = [
  {
    id: 'a-1',
    title: 'Monsoon plantation drive',
    description:
      'June 28 · Cubbon Park. Native species only. 120 saplings, 40 volunteers. Transport + breakfast on us.',
    date: '2026-06-28',
    priority: 'high',
    isNew: true,
    pinned: true,
    category: 'drive',
    color: '#22C55E',
    emoji: '🌱',
  },
  {
    id: 'a-2',
    title: 'Taru Fest 2026 — call for volunteers',
    description: 'We need 60 volunteers across 4 stages. Sign up closes Friday. First-years welcome.',
    date: '2026-06-20',
    priority: 'high',
    isNew: true,
    category: 'event',
    color: '#F97316',
    emoji: '🎉',
  },
  {
    id: 'a-3',
    title: 'New mentor cohort starting',
    description: '14 alumni mentors. 5-week cohort. Free for members. Applications due Tuesday.',
    date: '2026-06-18',
    priority: 'medium',
    isNew: true,
    category: 'program',
    color: '#38BDF8',
    emoji: '🎓',
  },
  {
    id: 'a-4',
    title: 'App v2 beta opens',
    description: 'Offline-first mode, push notifications, dark mode — help us test it.',
    date: '2026-06-16',
    priority: 'medium',
    isNew: false,
    category: 'update',
    color: '#A78BFA',
    emoji: '📱',
  },
  {
    id: 'a-5',
    title: 'Zero-waste catering for workshops',
    description: 'Effective this semester — plates, spoons, banners — all compostable.',
    date: '2026-06-12',
    priority: 'low',
    isNew: false,
    category: 'ops',
    color: '#4ADE80',
    emoji: '♻️',
  },
  {
    id: 'a-6',
    title: 'Annual report (64 pages) now live',
    description: 'Fully transparent: budgets, vendors, survival rates, failures. Read it with chai.',
    date: '2026-06-08',
    priority: 'low',
    isNew: false,
    category: 'ops',
    color: '#FBBF24',
    emoji: '📘',
  },
  {
    id: 'a-7',
    title: 'Leadership workshop — open seats',
    description: 'Sunday at 10 AM, led by alumni from Atlassian + Zoho. 25 seats only.',
    date: '2026-06-06',
    priority: 'medium',
    isNew: false,
    category: 'event',
    color: '#F472B6',
    emoji: '🧭',
  },
  {
    id: 'a-8',
    title: 'Women in Tech dinner (free)',
    description: 'Panel with 4 senior engineers from the alumni network. Food + transport covered.',
    date: '2026-06-04',
    priority: 'medium',
    isNew: false,
    category: 'event',
    color: '#EC4899',
    emoji: '🌸',
  },
];

// -----------------------------------------------------
// Featured events (trimmed for home)
// -----------------------------------------------------

interface FeaturedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  categoryColor: string;
  description: string;
  seats: { taken: number; total: number };
  priceLabel: string;
}

const FEATURED_EVENTS: FeaturedEvent[] = [
  {
    id: 'e-1',
    title: 'Tech for Nature Hackathon',
    date: 'Fri 26 Jul · 10am',
    location: 'Innovation Hub, Campus C',
    category: 'Hackathon',
    categoryColor: '#38BDF8',
    description: '24-hour hackathon. Mentors from 6 alumni orgs. Food, swag, judge honorarium covered.',
    seats: { taken: 82, total: 100 },
    priceLabel: '₹200 · includes food',
  },
  {
    id: 'e-2',
    title: 'Monsoon Plantation Drive',
    date: 'Sat 28 Jun · 7am',
    location: 'Cubbon Park',
    category: 'Sustainability',
    categoryColor: '#22C55E',
    description: '120 saplings, 40 volunteers, native species only. Transport + breakfast provided.',
    seats: { taken: 37, total: 40 },
    priceLabel: 'Free',
  },
  {
    id: 'e-3',
    title: 'Leadership Workshop',
    date: 'Sun 14 Jul · 10am',
    location: 'Club Room, Block B',
    category: 'Workshop',
    categoryColor: '#F472B6',
    description: 'Hosted by 2 alumni senior engineers. Limited seats. Deep practice, not theory.',
    seats: { taken: 22, total: 25 },
    priceLabel: 'Free',
  },
  {
    id: 'e-4',
    title: 'Photography Walk — Wildlife',
    date: 'Sat 20 Jul · 5am',
    location: 'Bannerghatta Reserve',
    category: 'Photography',
    categoryColor: '#FBBF24',
    description: 'Early morning shoot. Bring your own gear. 1 mentor, 1 biologist, 1 guide.',
    seats: { taken: 17, total: 25 },
    priceLabel: '₹1500 · transport',
  },
  {
    id: 'e-5',
    title: 'Art for Earth Exhibition',
    date: 'Sat 10 Aug · 4pm',
    location: 'Academic Block Atrium',
    category: 'Culture',
    categoryColor: '#A78BFA',
    description: 'Student art centered around nature, climate, change, hope. Submit by 30 Jul.',
    seats: { taken: 8, total: 40 },
    priceLabel: 'Free · open to all',
  },
  {
    id: 'e-6',
    title: 'Open Office Hours — Founders',
    date: 'Every Friday · 5pm',
    location: 'Club Room, Block B',
    category: 'Community',
    categoryColor: '#06B6D4',
    description: 'Bring your idea. Walk out with specific next steps. Alumni founders attend.',
    seats: { taken: 10, total: 20 },
    priceLabel: 'Free',
  },
];

// -----------------------------------------------------
// Quick actions
// -----------------------------------------------------

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  tabTarget?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'q-events', title: 'This week', subtitle: 'What\'s on', icon: '📅', color: '#F97316', tabTarget: 'EventsTab' },
  { id: 'q-wings', title: '6 Wings', subtitle: 'Content · Dev · GD · Video · Photo · PR', icon: '🪶', color: '#38BDF8', tabTarget: 'TaruWingsTab' },
  { id: 'q-team', title: 'The Team', subtitle: '60 members', icon: '🧑‍🤝‍🧑', color: '#4ADE80', tabTarget: 'TeamTab' },
  { id: 'q-alumni', title: 'Alumni', subtitle: '520+ stories', icon: '🎓', color: '#FBBF24', tabTarget: 'AlumniTab' },
  { id: 'q-mentor', title: 'Find a mentor', subtitle: '14 alumni mentors', icon: '🧭', color: '#A78BFA' },
  { id: 'q-idea', title: 'Share an idea', subtitle: 'Go to Suggestion', icon: '💡', color: '#F472B6', tabTarget: 'SuggestionTab' },
  { id: 'q-donate', title: 'Donate / Sponsor', subtitle: 'Transparent ledger', icon: '🤝', color: '#22C55E' },
  { id: 'q-gallery', title: 'Gallery', subtitle: 'Moments from ‘25 - ‘26', icon: '📸', color: '#06B6D4' },
];

// -----------------------------------------------------
// Team spotlight (3 picks)
// -----------------------------------------------------

interface Spotlight {
  id: string;
  name: string;
  role: string;
  department: string;
  tagline: string;
  emoji: string;
  color: string;
}

const SPOTLIGHTS: Spotlight[] = [
  {
    id: 'sp-1',
    name: 'Diya Mishra',
    role: 'Sustainability Head',
    department: 'Sustainability',
    tagline: 'Grow slow. Grow native. (And yes — track survival rates.)',
    emoji: '🌱',
    color: '#22C55E',
  },
  {
    id: 'sp-2',
    name: 'Raj Mehra',
    role: 'Tech Head',
    department: 'Technology',
    tagline: 'The best feature is shipped. Small tools, big joy.',
    emoji: '💻',
    color: '#38BDF8',
  },
  {
    id: 'sp-3',
    name: 'Neha Gupta',
    role: 'Design Head',
    department: 'Design',
    tagline: 'Soft colors. Strong opinions. Earthy palettes. One bold accent.',
    emoji: '🎨',
    color: '#F472B6',
  },
];

// -----------------------------------------------------
// Testimonials
// -----------------------------------------------------

interface Testimonial {
  id: string;
  name: string;
  role: string;
  body: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Kavya Nair',
    role: '1st-year · Research',
    body: 'I joined for the hackathons, I stayed for the people. They expect you to show up, not to be polished.',
    avatarColor: '#F472B6',
  },
  {
    id: 't-2',
    name: 'Mayank Desai',
    role: '2nd-year · Tech · Data',
    body: 'Got my first real PR merged here. Now I mentor two juniors. Closing the loop feels great.',
    avatarColor: '#38BDF8',
  },
  {
    id: 't-3',
    name: 'Pooja Bhalla',
    role: '3rd-year · Sustainability',
    body: 'I used to think "sustainability club" meant posters and drives. Here we also do measurement, policy, follow-up visits.',
    avatarColor: '#22C55E',
  },
  {
    id: 't-4',
    name: 'Shaurya Taneja',
    role: '3rd-year · Content · Editorial',
    body: 'Nobody is too senior to edit your draft. Everybody is too kind to ghost your draft.',
    avatarColor: '#FBBF24',
  },
  {
    id: 't-5',
    name: 'Dev Shukla',
    role: '1st-year · Events',
    body: 'My first event was chaos. My second was calm. The difference? Real mentoring from seniors.',
    avatarColor: '#A78BFA',
  },
];

// -----------------------------------------------------
// Gallery
// -----------------------------------------------------

interface GalleryItem {
  id: string;
  caption: string;
  color: string;
  emoji: string;
  date: string;
}

const GALLERY: GalleryItem[] = [
  { id: 'g-1', caption: 'Monsoon drive · Cubbon', color: '#22C55E', emoji: '🌱', date: 'Jun 2025' },
  { id: 'g-2', caption: 'Hackathon finale', color: '#38BDF8', emoji: '🏆', date: 'Apr 2025' },
  { id: 'g-3', caption: 'Alumni meetup', color: '#FBBF24', emoji: '🎓', date: 'Mar 2025' },
  { id: 'g-4', caption: 'Campus cleanup', color: '#4ADE80', emoji: '🧹', date: 'Feb 2025' },
  { id: 'g-5', caption: 'Ladies in Tech dinner', color: '#EC4899', emoji: '🌸', date: 'Jan 2025' },
  { id: 'g-6', caption: 'Zine print night', color: '#A78BFA', emoji: '📚', date: 'Dec 2024' },
  { id: 'g-7', caption: 'Tree survival audit', color: '#22C55E', emoji: '🌲', date: 'Nov 2024' },
  { id: 'g-8', caption: 'Founders office hours', color: '#06B6D4', emoji: '💡', date: 'Oct 2024' },
  { id: 'g-9', caption: 'Photography walk', color: '#FBBF24', emoji: '📸', date: 'Sep 2024' },
  { id: 'g-10', caption: 'Cultural night', color: '#F472B6', emoji: '🎶', date: 'Sep 2024' },
];

// -----------------------------------------------------
// Sustainability timeline
// -----------------------------------------------------

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  body: string;
  color: string;
}

const TIMELINE: TimelineItem[] = [
  {
    id: 'tl-1',
    year: '2022',
    title: 'Club rebooted',
    body: 'Handed over to a new leadership team. 12 active members at the start.',
    color: '#94A3B8',
  },
  {
    id: 'tl-2',
    year: '2023',
    title: 'First plantation drive',
    body: '1,800 saplings across 2 urban campuses. Survival rate measured for the first time.',
    color: '#4ADE80',
  },
  {
    id: 'tl-3',
    year: '2024',
    title: 'Tech wing founded',
    body: 'React Native club app v0. Built-in 2 weeks. 120 members onboarded.',
    color: '#38BDF8',
  },
  {
    id: 'tl-4',
    year: '2024',
    title: 'Alumni mentor circle',
    body: '14 alumni signed up. 200+ one-on-one sessions.',
    color: '#FBBF24',
  },
  {
    id: 'tl-5',
    year: '2025',
    title: 'Annual report — public',
    body: '64 pages. Transparent budgets. First time any student body here has done this.',
    color: '#A78BFA',
  },
  {
    id: 'tl-6',
    year: '2025',
    title: 'Taru Fest — first edition',
    body: '2,000 footfalls. 4 days. 6 wings. One calm run-of-show spreadsheet.',
    color: '#F97316',
  },
  {
    id: 'tl-7',
    year: '2026',
    title: 'App v2',
    body: 'Offline mode, push, dark theme, attendance automation. You\'re looking at it.',
    color: '#22C55E',
  },
];

// -----------------------------------------------------
// Pledges (sustainability)
// -----------------------------------------------------

interface Pledge {
  id: string;
  title: string;
  body: string;
  target: string;
  progress: number;
  color: string;
}

const PLEDGES: Pledge[] = [
  {
    id: 'p-1',
    title: 'Native saplings',
    body: 'Only local species. Tracked monthly for 2 years after plantation.',
    target: '20,000 by 2027',
    progress: 0.62,
    color: '#22C55E',
  },
  {
    id: 'p-2',
    title: 'Zero-waste events',
    body: 'Compostable cutlery, digital banners, no single-use plastic.',
    target: '100% of events',
    progress: 0.81,
    color: '#4ADE80',
  },
  {
    id: 'p-3',
    title: 'Open budgets',
    body: 'Every rupee spent is listed in the annual report.',
    target: 'Every year, forever',
    progress: 1.0,
    color: '#FBBF24',
  },
  {
    id: 'p-4',
    title: 'Women in Tech seats',
    body: 'At least 40% women-identifying members in every technical cohort.',
    target: '40% minimum',
    progress: 0.46,
    color: '#EC4899',
  },
  {
    id: 'p-5',
    title: 'Mental-health support',
    body: 'All wing heads MHFA-trained. Anonymous support channel open 24/7.',
    target: '10/10 wing heads',
    progress: 0.9,
    color: '#A78BFA',
  },
];

// -----------------------------------------------------
// FAQ
// -----------------------------------------------------

interface FAQ {
  id: string;
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQ[] = [
  {
    id: 'f-1',
    q: 'I\'m a first-year. Can I join mid-semester?',
    a: 'Yes. We onboard continuously. Apply, tell us what you care about, and the nearest wing head reaches out in 3 working days.',
  },
  {
    id: 'f-2',
    q: 'Do I have to pick one wing?',
    a: 'No. You get a primary wing for accountability, but events and office hours are open across all 6.',
  },
  {
    id: 'f-3',
    q: 'How much time per week?',
    a: 'Roughly 3 hours for members, 6-8 for core, 10-12 for leads. Nobody will guilt-trip you — we track load and redistribute.',
  },
  {
    id: 'f-4',
    q: 'Can I invite a friend from another college?',
    a: 'Most of our events are open-campus. Share the link. Some smaller workshops are member-first with waiting-list.',
  },
  {
    id: 'f-5',
    q: 'Is there a cost?',
    a: 'Membership is free. Some offsite events (treks, photo walks, travel) are paid at cost and subsidised for need-based members.',
  },
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

const HomeScreen: React.FC = () => {
  // ------ State ------
  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [announcementFilter, setAnnouncementFilter] = useState<ExtAnnouncement['category'] | 'all'>('all');
  const [showQuickActionSheet, setShowQuickActionSheet] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FeaturedEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ExtAnnouncement | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // ------ Animations ------
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroRef = useRef<FlatList<HeroSlide>>(null);
  const statsAnim = useRef(new Animated.Value(0)).current;
  const rowStagger = useRef(new Animated.Value(0)).current;
  const eventModalScale = useRef(new Animated.Value(0.9)).current;
  const announcementModalScale = useRef(new Animated.Value(0.9)).current;

  // Auto-rotate hero
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => {
        const next = (i + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 5200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(statsAnim, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
      Animated.timing(rowStagger, { toValue: 1, duration: ANIM.duration.slow, easing: ANIM.easing.out, useNativeDriver: true }),
    ]).start();
  }, [statsAnim, rowStagger]);

  useEffect(() => {
    if (showEventModal) {
      Animated.spring(eventModalScale, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    } else {
      eventModalScale.setValue(0.9);
    }
  }, [showEventModal, eventModalScale]);

  useEffect(() => {
    if (showAnnouncementModal) {
      Animated.spring(announcementModalScale, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    } else {
      announcementModalScale.setValue(0.9);
    }
  }, [showAnnouncementModal, announcementModalScale]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  }, []);

  const onHeroScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      heroScrollX.setValue(x);
      const idx = Math.round(x / SCREEN_WIDTH);
      if (idx !== heroIndex) setHeroIndex(idx);
    },
    [heroScrollX, heroIndex]
  );

  const openEvent = useCallback((e: FeaturedEvent) => {
    setSelectedEvent(e);
    setShowEventModal(true);
  }, []);

  const closeEvent = useCallback(() => {
    setShowEventModal(false);
    setTimeout(() => setSelectedEvent(null), 200);
  }, []);

  const openAnnouncement = useCallback((a: ExtAnnouncement) => {
    setSelectedAnnouncement(a);
    setShowAnnouncementModal(true);
  }, []);

  const closeAnnouncement = useCallback(() => {
    setShowAnnouncementModal(false);
    setTimeout(() => setSelectedAnnouncement(null), 200);
  }, []);

  const submitNewsletter = useCallback(() => {
    if (newsletterStatus === 'submitting') return;
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(newsletterEmail.trim())) {
      Alert.alert('Hmm — that email looks off', 'Try again with a valid email address.');
      return;
    }
    setNewsletterStatus('submitting');
    setTimeout(() => {
      setNewsletterStatus('done');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 2500);
    }, 900);
  }, [newsletterEmail, newsletterStatus]);

  const shareClub = useCallback(async () => {
    try {
      await Share.share({
        message:
          '🌿 Taru Guardians — tech × sustainability student club. Events, projects, mentorship and community. Check it out.',
      });
    } catch {
      /* cancelled */
    }
  }, []);

  const filteredAnnouncements = useMemo(() => {
    if (announcementFilter === 'all') return ANNOUNCEMENTS;
    return ANNOUNCEMENTS.filter((a) => a.category === announcementFilter);
  }, [announcementFilter]);

  // ------ Sub-renderers ------
  const renderHeroSlide = ({ item }: { item: HeroSlide }) => (
    <View style={styles.heroSlide}>
      <LinearGradient colors={item.gradient} style={styles.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.heroEyebrow}>{item.eyebrow}</Text>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.heroCta}>
          <Text style={styles.heroCtaText}>{item.ctaLabel}  →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderHero = () => (
    <View style={styles.heroBlock}>
      <Animated.FlatList
        ref={heroRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={HERO_SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderHeroSlide}
        onScroll={onHeroScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.heroDots}>
        {HERO_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.heroDot,
              i === heroIndex && styles.heroDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderStats = () => (
    <Animated.View
      style={[
        styles.statsBlock,
        {
          opacity: statsAnim,
          transform: [
            {
              translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      <FlatList
        data={STATS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScroll}
        renderItem={({ item }) => (
          <View style={[styles.statCard, { borderColor: item.color + '55' }]}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statCaption}>{item.caption}</Text>
          </View>
        )}
      />
    </Animated.View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>⚡ Quick actions</Text>
        <TouchableOpacity onPress={() => setShowQuickActionSheet(true)}>
          <Text style={styles.sectionCaption}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickActionGrid}>
        {QUICK_ACTIONS.slice(0, 6).map((a) => (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.9}
            style={[styles.quickActionCard, { borderColor: a.color + '55' }]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: a.color + '22' }]}>
              <Text style={styles.quickActionEmoji}>{a.icon}</Text>
            </View>
            <Text style={styles.quickActionTitle}>{a.title}</Text>
            <Text style={styles.quickActionSubtitle} numberOfLines={2}>
              {a.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAnnouncements = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📣 Announcements</Text>
        <Text style={styles.sectionCaption}>{ANNOUNCEMENTS.length} live</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['all', 'event', 'drive', 'program', 'ops', 'update'] as const).map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setAnnouncementFilter(c)}
            style={[
              styles.filterChip,
              announcementFilter === c && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                announcementFilter === c && styles.filterChipTextActive,
              ]}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredAnnouncements.map((a) => (
        <TouchableOpacity
          key={a.id}
          onPress={() => openAnnouncement(a)}
          activeOpacity={0.9}
          style={[styles.announceCard, { borderLeftColor: a.color }]}
        >
          <View style={styles.announceTopRow}>
            <Text style={styles.announceEmoji}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.announceTitleRow}>
                <Text style={styles.announceTitle} numberOfLines={1}>
                  {a.title}
                </Text>
                {a.pinned ? (
                  <Text style={styles.announcePinned}>📌</Text>
                ) : a.isNew ? (
                  <View style={styles.announceNewPill}>
                    <Text style={styles.announceNewPillText}>NEW</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.announceDate}>
                {new Date(a.date).toDateString().slice(0, 15)} ·{' '}
                {a.priority === 'high' ? '🔥 High' : a.priority === 'medium' ? 'Medium' : 'Low'} priority
              </Text>
            </View>
          </View>
          <Text style={styles.announceDescription} numberOfLines={2}>
            {a.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFeaturedEvents = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📅 Featured events</Text>
        <Text style={styles.sectionCaption}>Next 4 weeks</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.8}
        decelerationRate="fast"
        contentContainerStyle={styles.eventScroll}
      >
        {FEATURED_EVENTS.map((e) => {
          const pct = e.seats.taken / e.seats.total;
          return (
            <TouchableOpacity
              key={e.id}
              onPress={() => openEvent(e)}
              activeOpacity={0.9}
              style={styles.eventCard}
            >
              <LinearGradient
                colors={[e.categoryColor + '55', '#0A0F14']}
                style={styles.eventGradient}
              >
                <View style={[styles.eventCategoryPill, { backgroundColor: e.categoryColor }]}>
                  <Text style={styles.eventCategoryText}>{e.category}</Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {e.title}
                </Text>
                <Text style={styles.eventDate}>{e.date}</Text>
                <Text style={styles.eventLocation} numberOfLines={1}>
                  📍 {e.location}
                </Text>
                <Text style={styles.eventDescription} numberOfLines={3}>
                  {e.description}
                </Text>
                <View style={styles.eventSeatRow}>
                  <View style={styles.eventSeatBar}>
                    <View
                      style={[
                        styles.eventSeatFill,
                        { width: `${Math.round(pct * 100)}%`, backgroundColor: e.categoryColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.eventSeatText}>
                    {e.seats.taken}/{e.seats.total}
                  </Text>
                </View>
                <Text style={styles.eventPrice}>{e.priceLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSpotlights = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔆 Team spotlight</Text>
        <Text style={styles.sectionCaption}>This week</Text>
      </View>
      <View style={styles.spotlightGrid}>
        {SPOTLIGHTS.map((s) => (
          <View key={s.id} style={styles.spotlightCard}>
            <LinearGradient
              colors={[s.color + '33', '#0A0F14']}
              style={styles.spotlightGradient}
            >
              <View style={[styles.spotlightAvatar, { backgroundColor: s.color + '33' }]}>
                <Text style={styles.spotlightEmoji}>{s.emoji}</Text>
              </View>
              <Text style={styles.spotlightName}>{s.name}</Text>
              <Text style={styles.spotlightRole}>{s.role}</Text>
              <Text style={styles.spotlightDept}>{s.department}</Text>
              <Text style={styles.spotlightTagline}>"{s.tagline}"</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTestimonials = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>💬 What members say</Text>
        <Text style={styles.sectionCaption}>Unedited</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.8}
        decelerationRate="fast"
        contentContainerStyle={styles.testimonialScroll}
      >
        {TESTIMONIALS.map((t) => (
          <View key={t.id} style={styles.testimonialCard}>
            <View style={[styles.testimonialAvatar, { backgroundColor: t.avatarColor + '33' }]}>
              <Text style={styles.testimonialAvatarText}>
                {t.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            <Text style={styles.testimonialBody}>"{t.body}"</Text>
            <Text style={styles.testimonialName}>— {t.name}</Text>
            <Text style={styles.testimonialRole}>{t.role}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderGallery = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📸 Gallery</Text>
        <Text style={styles.sectionCaption}>Moments</Text>
      </View>
      <View style={styles.galleryGrid}>
        {GALLERY.map((g) => (
          <TouchableOpacity
            key={g.id}
            activeOpacity={0.85}
            style={[styles.galleryCell, { backgroundColor: g.color + '22', borderColor: g.color + '55' }]}
          >
            <Text style={styles.galleryEmoji}>{g.emoji}</Text>
            <Text style={styles.galleryCaption} numberOfLines={1}>
              {g.caption}
            </Text>
            <Text style={styles.galleryDate}>{g.date}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Our timeline</Text>
        <Text style={styles.sectionCaption}>2022 → now</Text>
      </View>
      <View style={styles.timelineContainer}>
        {TIMELINE.map((t, idx) => (
          <View key={t.id} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, { backgroundColor: t.color }]} />
              {idx !== TIMELINE.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.timelineYear}>{t.year}</Text>
              <Text style={styles.timelineTitle}>{t.title}</Text>
              <Text style={styles.timelineBody}>{t.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPledges = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌿 Our pledges</Text>
        <Text style={styles.sectionCaption}>Accountable</Text>
      </View>
      {PLEDGES.map((p) => (
        <View key={p.id} style={styles.pledgeCard}>
          <View style={styles.pledgeHeaderRow}>
            <Text style={styles.pledgeTitle}>{p.title}</Text>
            <Text style={[styles.pledgeTarget, { color: p.color }]}>{p.target}</Text>
          </View>
          <Text style={styles.pledgeBody}>{p.body}</Text>
          <View style={styles.pledgeProgressBg}>
            <View
              style={[
                styles.pledgeProgressFill,
                { width: `${Math.round(p.progress * 100)}%`, backgroundColor: p.color },
              ]}
            />
          </View>
          <Text style={styles.pledgeProgressLabel}>
            {Math.round(p.progress * 100)}% done
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFAQ = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>❓ Frequently asked</Text>
        <Text style={styles.sectionCaption}>{FAQ_ITEMS.length} Q&A</Text>
      </View>
      {FAQ_ITEMS.map((f) => {
        const expanded = expandedFAQ === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.9}
            onPress={() => setExpandedFAQ(expanded ? null : f.id)}
            style={styles.faqCard}
          >
            <View style={styles.faqQuestionRow}>
              <Text style={styles.faqQuestion}>{f.q}</Text>
              <Text style={styles.faqToggle}>{expanded ? '−' : '+'}</Text>
            </View>
            {expanded ? <Text style={styles.faqAnswer}>{f.a}</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderNewsletter = () => (
    <View style={styles.newsletterBlock}>
      <LinearGradient colors={['#052B1E', '#0A4D37']} style={styles.newsletterGradient}>
        <Text style={styles.newsletterTitle}>📩 Weekly digest</Text>
        <Text style={styles.newsletterBody}>
          1 email every Sunday. What\'s new, what we learnt, what\'s open for the week. No spam, ever.
        </Text>
        <View style={styles.newsletterForm}>
          <TextInput
            value={newsletterEmail}
            onChangeText={setNewsletterEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.newsletterInput}
            editable={newsletterStatus !== 'submitting'}
          />
          <TouchableOpacity
            onPress={submitNewsletter}
            disabled={newsletterStatus === 'submitting'}
            style={[
              styles.newsletterBtn,
              newsletterStatus === 'submitting' && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.newsletterBtnText}>
              {newsletterStatus === 'submitting'
                ? '…sending'
                : newsletterStatus === 'done'
                ? 'Subscribed ✓'
                : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderShareBand = () => (
    <View style={styles.shareBand}>
      <Text style={styles.shareLine}>Know someone who\'d love this?</Text>
      <TouchableOpacity style={styles.shareBtn} onPress={shareClub}>
        <Text style={styles.shareBtnText}>↗ Share Taru</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerLine}>🌿 Taru Guardians</Text>
      <Text style={styles.footerSmall}>Built by students, for students.</Text>
      <Text style={styles.footerSmall}>App v2 · 2026 · Open source</Text>
    </View>
  );

  // ------ Event modal ------
  const renderEventModal = () => {
    if (!selectedEvent) return null;
    const e = selectedEvent;
    const pct = e.seats.taken / e.seats.total;
    return (
      <Modal visible={showEventModal} transparent animationType="fade" onRequestClose={closeEvent}>
        <Animated.View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeEvent} />
          <Animated.View style={[styles.modalContent, { transform: [{ scale: eventModalScale }] }]}>
            <LinearGradient colors={[e.categoryColor + '44', '#0A0F14']} style={styles.modalHero}>
              <View style={styles.modalHeroTop}>
                <View style={[styles.modalBadge, { backgroundColor: e.categoryColor }]}>
                  <Text style={styles.modalBadgeText}>{e.category}</Text>
                </View>
                <TouchableOpacity onPress={closeEvent} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{e.title}</Text>
              <Text style={styles.modalDate}>{e.date}</Text>
              <Text style={styles.modalLocation}>📍 {e.location}</Text>
            </LinearGradient>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalBody}>{e.description}</Text>
              <View style={styles.modalSeatBlock}>
                <View style={styles.modalSeatRow}>
                  <Text style={styles.modalSeatLabel}>Seats</Text>
                  <Text style={styles.modalSeatValue}>
                    {e.seats.taken} / {e.seats.total}
                  </Text>
                </View>
                <View style={styles.modalSeatBar}>
                  <View
                    style={[
                      styles.modalSeatFill,
                      { width: `${Math.round(pct * 100)}%`, backgroundColor: e.categoryColor },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.modalPrice}>Ticket: {e.priceLabel}</Text>
              <Text style={styles.modalMeta}>
                Full calendar, map, organiser contact and full speaker list lives on the Events tab.
              </Text>
            </ScrollView>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: e.categoryColor }]}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `📅 ${e.title}\n${e.date} · ${e.location}\n\n${e.description}`,
                    });
                  } catch {
                    /* cancelled */
                  }
                }}
              >
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // ------ Announcement modal ------
  const renderAnnouncementModal = () => {
    if (!selectedAnnouncement) return null;
    const a = selectedAnnouncement;
    return (
      <Modal visible={showAnnouncementModal} transparent animationType="fade" onRequestClose={closeAnnouncement}>
        <Animated.View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAnnouncement} />
          <Animated.View style={[styles.modalContent, { transform: [{ scale: announcementModalScale }] }]}>
            <LinearGradient colors={[a.color + '44', '#0A0F14']} style={styles.modalHero}>
              <View style={styles.modalHeroTop}>
                <View style={[styles.modalBadge, { backgroundColor: a.color }]}>
                  <Text style={styles.modalBadgeText}>
                    {a.emoji} {a.category.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeAnnouncement} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{a.title}</Text>
              <Text style={styles.modalDate}>{new Date(a.date).toDateString()}</Text>
              <Text style={styles.modalLocation}>
                {a.priority === 'high' ? '🔥 High priority' : a.priority === 'medium' ? 'Medium priority' : 'Low priority'}
              </Text>
            </LinearGradient>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalBody}>{a.description}</Text>
              <Text style={styles.modalMeta}>
                Updates and discussion happen in the club's main channel. The latest pinned message
                has the sign-up + logistics.
              </Text>
            </ScrollView>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: a.color }]}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `📣 ${a.title}\n${new Date(a.date).toDateString()}\n\n${a.description}`,
                    });
                  } catch {
                    /* cancelled */
                  }
                }}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={closeAnnouncement}
              >
                <Text style={styles.modalActionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // ------ Quick-action sheet ------
  const renderQuickActionSheet = () => (
    <Modal
      visible={showQuickActionSheet}
      transparent
      animationType="fade"
      onRequestClose={() => setShowQuickActionSheet(false)}
    >
      <Pressable style={styles.sheetBackdrop} onPress={() => setShowQuickActionSheet(false)} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>All actions</Text>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => setShowQuickActionSheet(false)}
            style={styles.sheetRow}
          >
            <View style={[styles.sheetIcon, { backgroundColor: a.color + '22' }]}>
              <Text style={styles.sheetEmoji}>{a.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetLabel}>{a.title}</Text>
              <Text style={styles.sheetSub}>{a.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

  // ------ Main ------
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
        translucent={Platform.OS === 'android'}
      />
      <ScrollView
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
        {renderHero()}
        {renderStats()}
        {renderQuickActions()}
        {renderAnnouncements()}
        {renderFeaturedEvents()}
        {renderSpotlights()}
        {renderTestimonials()}
        {renderGallery()}
        {renderTimeline()}
        {renderPledges()}
        {renderFAQ()}
        {renderNewsletter()}
        {renderShareBand()}
        {renderFooter()}
      </ScrollView>
      {renderEventModal()}
      {renderAnnouncementModal()}
      {renderQuickActionSheet()}
    </SafeAreaView>
  );
};

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollContent: { paddingBottom: 100 },

  // Hero
  heroBlock: { height: HERO_HEIGHT + 30 },
  heroSlide: { width: SCREEN_WIDTH, height: HERO_HEIGHT },
  heroGradient: {
    flex: 1,
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: 10,
    borderRadius: CARD_RADIUS,
    padding: 22,
    justifyContent: 'space-between',
  },
  heroEyebrow: { fontSize: 11, color: '#ffffffAA', letterSpacing: 2, fontWeight: '800' },
  heroTitle: { fontSize: IS_SMALL ? 26 : 30, color: '#fff', fontWeight: '900', marginTop: 10, lineHeight: IS_SMALL ? 32 : 36 },
  heroSubtitle: { fontSize: 13, color: '#ffffffCC', lineHeight: 20, marginTop: 10 },
  heroCta: {
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: '#ffffff22',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  heroCtaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroDots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 12,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff33',
    marginHorizontal: 3,
  },
  heroDotActive: { backgroundColor: Colors.tech.neonBlue, width: 14 },

  // Stats
  statsBlock: { paddingTop: 22 },
  statsScroll: { paddingHorizontal: HORIZONTAL_PADDING },
  statCard: {
    width: 130,
    backgroundColor: '#0B1118',
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  statLabel: { color: Colors.text.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  statCaption: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Section blocks
  sectionBlock: { paddingTop: 24, paddingHorizontal: HORIZONTAL_PADDING },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  sectionCaption: { color: Colors.text.muted, fontSize: 12 },

  // Quick actions
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickActionCard: {
    width: IS_TABLET ? (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 32) / 4 : (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 16) / 2,
    backgroundColor: '#0B1118',
    borderRadius: 18,
    padding: 14,
    margin: 4,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: { fontSize: 20 },
  quickActionTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  quickActionSubtitle: { color: Colors.text.secondary, fontSize: 11, marginTop: 4, lineHeight: 15 },

  // Announcements
  filterRow: { paddingVertical: 6 },
  filterChip: {
    backgroundColor: '#ffffff08',
    borderColor: '#ffffff22',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.tech.neonBlue + '22', borderColor: Colors.tech.neonBlue },
  filterChipText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  filterChipTextActive: { color: Colors.tech.neonBlue, fontWeight: '800' },
  announceCard: {
    backgroundColor: '#0B1118',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginTop: 8,
  },
  announceTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  announceEmoji: { fontSize: 22, marginRight: 10 },
  announceTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  announceTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', flex: 1 },
  announcePinned: { color: Colors.accent.softGold, fontSize: 14, marginLeft: 8 },
  announceNewPill: {
    backgroundColor: Colors.tech.neonBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  announceNewPillText: { color: '#000', fontSize: 9, fontWeight: '900' },
  announceDate: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  announceDescription: { color: Colors.text.secondary, fontSize: 12, marginTop: 8, lineHeight: 17 },

  // Featured events
  eventScroll: { paddingRight: HORIZONTAL_PADDING },
  eventCard: { width: SCREEN_WIDTH * 0.78, marginRight: 12, borderRadius: CARD_RADIUS, overflow: 'hidden' },
  eventGradient: { padding: 16, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: '#ffffff12' },
  eventCategoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  eventCategoryText: { color: '#000', fontSize: 10, fontWeight: '800' },
  eventTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '800', marginTop: 10 },
  eventDate: { color: Colors.accent.softGold, fontSize: 12, fontWeight: '700', marginTop: 4 },
  eventLocation: { color: Colors.text.secondary, fontSize: 12, marginTop: 2 },
  eventDescription: { color: Colors.text.secondary, fontSize: 12, marginTop: 8, lineHeight: 17 },
  eventSeatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  eventSeatBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff14',
    marginRight: 8,
    overflow: 'hidden',
  },
  eventSeatFill: { height: '100%', borderRadius: 3 },
  eventSeatText: { color: Colors.text.muted, fontSize: 11 },
  eventPrice: { color: Colors.text.primary, fontSize: 12, marginTop: 8, fontWeight: '700' },

  // Spotlights
  spotlightGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  spotlightCard: {
    width: IS_TABLET ? (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 24) / 3 : (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 8),
    margin: 4,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  spotlightGradient: { padding: 14, borderWidth: 1, borderColor: '#ffffff12', borderRadius: CARD_RADIUS, alignItems: 'center' },
  spotlightAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  spotlightEmoji: { fontSize: 24 },
  spotlightName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  spotlightRole: { color: Colors.accent.softGold, fontSize: 12, marginTop: 2, fontWeight: '700' },
  spotlightDept: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  spotlightTagline: { color: Colors.text.secondary, fontStyle: 'italic', fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 17 },

  // Testimonials
  testimonialScroll: { paddingRight: HORIZONTAL_PADDING },
  testimonialCard: {
    width: SCREEN_WIDTH * 0.78,
    marginRight: 12,
    backgroundColor: '#0B1118',
    borderWidth: 1,
    borderColor: '#ffffff12',
    padding: 16,
    borderRadius: CARD_RADIUS,
  },
  testimonialAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  testimonialAvatarText: { color: Colors.text.primary, fontWeight: '800' },
  testimonialBody: { color: Colors.text.primary, fontSize: 13, lineHeight: 19, marginTop: 12 },
  testimonialName: { color: Colors.accent.softGold, fontSize: 12, marginTop: 10, fontWeight: '700' },
  testimonialRole: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Gallery
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  galleryCell: {
    width: IS_TABLET ? (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 32) / 4 : (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 24) / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  galleryEmoji: { fontSize: 22, alignSelf: 'flex-start' },
  galleryCaption: { color: Colors.text.primary, fontSize: 11, fontWeight: '700' },
  galleryDate: { color: Colors.text.muted, fontSize: 10 },

  // Timeline
  timelineContainer: { marginTop: 6 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#ffffff18', marginTop: 4 },
  timelineRight: { flex: 1, paddingLeft: 10, paddingBottom: 16 },
  timelineYear: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },
  timelineTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', marginTop: 2 },
  timelineBody: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 3 },

  // Pledges
  pledgeCard: {
    backgroundColor: '#0B1118',
    padding: 14,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  pledgeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pledgeTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  pledgeTarget: { fontSize: 11, fontWeight: '800' },
  pledgeBody: { color: Colors.text.secondary, fontSize: 12, marginTop: 6, lineHeight: 17 },
  pledgeProgressBg: { height: 6, borderRadius: 3, backgroundColor: '#ffffff14', marginTop: 10, overflow: 'hidden' },
  pledgeProgressFill: { height: '100%', borderRadius: 3 },
  pledgeProgressLabel: { color: Colors.text.muted, fontSize: 11, marginTop: 6 },

  // FAQ
  faqCard: {
    backgroundColor: '#0B1118',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffffff0F',
  },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { color: Colors.text.primary, fontSize: 13, fontWeight: '700', flex: 1 },
  faqToggle: { color: Colors.tech.neonBlue, fontSize: 18, fontWeight: '900', marginLeft: 8 },
  faqAnswer: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 8 },

  // Newsletter
  newsletterBlock: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 28 },
  newsletterGradient: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  newsletterTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '900' },
  newsletterBody: { color: Colors.text.secondary, fontSize: 12, marginTop: 6, lineHeight: 17 },
  newsletterForm: { flexDirection: 'row', marginTop: 12 },
  newsletterInput: {
    flex: 1,
    backgroundColor: '#ffffff12',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text.primary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ffffff1F',
  },
  newsletterBtn: {
    backgroundColor: Colors.accent.softGold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsletterBtnText: { color: '#000', fontWeight: '800', fontSize: 12 },

  // Share band
  shareBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 22,
  },
  shareLine: { color: Colors.text.secondary, fontSize: 12 },
  shareBtn: {
    backgroundColor: '#ffffff12',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shareBtnText: { color: Colors.text.primary, fontSize: 12, fontWeight: '700' },

  // Footer
  footer: { alignItems: 'center', paddingTop: 30, paddingBottom: 30 },
  footerLine: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  footerSmall: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'center', padding: 20 },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#0A0F14',
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalHero: { padding: 20 },
  modalHeroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: Colors.text.primary, fontSize: 16 },
  modalTitle: { color: Colors.text.primary, fontSize: 22, fontWeight: '900', marginTop: 14 },
  modalDate: { color: Colors.accent.softGold, fontSize: 12, marginTop: 6, fontWeight: '700' },
  modalLocation: { color: Colors.text.secondary, fontSize: 12, marginTop: 4 },

  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 18 },
  modalBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20 },
  modalSeatBlock: { marginTop: 14 },
  modalSeatRow: { flexDirection: 'row', justifyContent: 'space-between' },
  modalSeatLabel: { color: Colors.text.muted, fontSize: 11 },
  modalSeatValue: { color: Colors.text.primary, fontSize: 12, fontWeight: '700' },
  modalSeatBar: { height: 6, borderRadius: 3, backgroundColor: '#ffffff14', marginTop: 6, overflow: 'hidden' },
  modalSeatFill: { height: '100%', borderRadius: 3 },
  modalPrice: { color: Colors.text.primary, fontSize: 13, marginTop: 10, fontWeight: '700' },
  modalMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 14, lineHeight: 16 },

  modalActionRow: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
  },
  modalAction: { flex: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  modalActionText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Quick-action sheet
  sheetBackdrop: { flex: 1, backgroundColor: '#000000AA' },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#0A0F14',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  sheetTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  sheetIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sheetEmoji: { fontSize: 18 },
  sheetLabel: { color: Colors.text.primary, fontSize: 14, fontWeight: '700' },
  sheetSub: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
});

export default HomeScreen;
