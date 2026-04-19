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
// Impact dashboard (sustainability metrics)
// -----------------------------------------------------

interface ImpactMetric {
  id: string;
  emoji: string;
  label: string;
  value: string;
  caption: string;
  trend: 'up' | 'flat' | 'down';
  trendPct: number;
  color: string;
  accent: readonly [string, string, ...string[]];
}

const IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'im-1',
    emoji: '🌳',
    label: 'Saplings planted',
    value: '12,842',
    caption: 'Across 3 campuses and 14 nearby villages, since Aug 2021.',
    trend: 'up',
    trendPct: 11.2,
    color: '#4CAF50',
    accent: ['#0A3F2A', '#0F5C3A'],
  },
  {
    id: 'im-2',
    emoji: '🧪',
    label: 'Survival rate',
    value: '74%',
    caption: 'Measured at 9 months. Target 80% by Dec 2026.',
    trend: 'up',
    trendPct: 4.5,
    color: '#8BC34A',
    accent: ['#103F20', '#195C2E'],
  },
  {
    id: 'im-3',
    emoji: '💨',
    label: 'CO₂ offset / year',
    value: '198 T',
    caption: 'Estimated carbon capture from mature trees at year 10.',
    trend: 'up',
    trendPct: 6.1,
    color: '#66BB6A',
    accent: ['#0A3F30', '#10543F'],
  },
  {
    id: 'im-4',
    emoji: '💧',
    label: 'Water saved',
    value: '3.2 ML',
    caption: 'From rainwater harvesting pits dug alongside plantings.',
    trend: 'up',
    trendPct: 3.0,
    color: '#29B6F6',
    accent: ['#073049', '#0A4A6E'],
  },
  {
    id: 'im-5',
    emoji: '♻️',
    label: 'E-waste diverted',
    value: '1.4 T',
    caption: 'Collected via campus drives; handed to certified recyclers.',
    trend: 'up',
    trendPct: 18.6,
    color: '#FFB74D',
    accent: ['#3E2B0A', '#5A410F'],
  },
  {
    id: 'im-6',
    emoji: '👥',
    label: 'Active members',
    value: '612',
    caption: '6 wings · 4 campuses · avg 3.2 events/member/semester.',
    trend: 'up',
    trendPct: 8.0,
    color: '#AB47BC',
    accent: ['#2A0E3C', '#401458'],
  },
  {
    id: 'im-7',
    emoji: '🏕️',
    label: 'Workshops run',
    value: '248',
    caption: 'Internal + open-campus. Attendance avg 42 per session.',
    trend: 'up',
    trendPct: 9.3,
    color: '#FFD54F',
    accent: ['#3E3112', '#58461C'],
  },
  {
    id: 'im-8',
    emoji: '🛠️',
    label: 'Tools shipped',
    value: '37',
    caption: 'Small utilities used by real teams. 12 open-source on GitHub.',
    trend: 'up',
    trendPct: 12.4,
    color: '#00D4FF',
    accent: ['#053049', '#083E5E'],
  },
];

// -----------------------------------------------------
// Member of the month carousel
// -----------------------------------------------------

interface MemberHighlight {
  id: string;
  name: string;
  role: string;
  wing: string;
  month: string;
  avatar: string;
  palette: readonly [string, string, ...string[]];
  reason: string;
  tags: string[];
  bio: string;
}

const MEMBER_HIGHLIGHTS: MemberHighlight[] = [
  {
    id: 'mh-1',
    name: 'Ananya Pillai',
    role: 'Wing lead · Content',
    wing: 'Content Writer',
    month: 'April 2026',
    avatar: '🌱',
    palette: ['#0A3F2A', '#0F5C3A'],
    reason: 'Shipped the sapling-story long-form; 11k organic reads in 10 days.',
    tags: ['writing', 'longform', 'SEO'],
    bio: 'Third-year English honours, runs the Sunday reading room. Ghazal nerd. Plants succulents badly.',
  },
  {
    id: 'mh-2',
    name: 'Vivaan Shetty',
    role: 'Full-stack · Web/App',
    wing: 'Web/App Development',
    month: 'March 2026',
    avatar: '🛠️',
    palette: ['#053049', '#0A4A6E'],
    reason: 'Rewrote the volunteer portal from scratch; 38% faster, 62% smaller bundle.',
    tags: ['typescript', 'react-native', 'supabase'],
    bio: 'CS second-year. Loves the smell of a clean `git log`. Makes terrible pun-based variable names.',
  },
  {
    id: 'mh-3',
    name: 'Ishita Kalra',
    role: 'Design lead · GD',
    wing: 'Graphic Designer',
    month: 'February 2026',
    avatar: '🎨',
    palette: ['#2A0E3C', '#401458'],
    reason: 'Unified the visual system — logos, templates, event posters, now in a single kit.',
    tags: ['figma', 'type', 'brand'],
    bio: 'Design student from Delhi. Keeps a hand-drawn field journal. Won\'t use Comic Sans even ironically.',
  },
  {
    id: 'mh-4',
    name: 'Aryan Deshmukh',
    role: 'Video lead',
    wing: 'Video Editor',
    month: 'January 2026',
    avatar: '🎬',
    palette: ['#3E2B0A', '#5A410F'],
    reason: 'Edited the 6-min annual recap that anchored the mid-year fundraiser.',
    tags: ['davinci', 'colour', 'sound'],
    bio: 'Mech engineering; film club alum. Shoots on his phone as often as the R5.',
  },
  {
    id: 'mh-5',
    name: 'Mira Joseph',
    role: 'Photo lead',
    wing: 'Photographer',
    month: 'December 2025',
    avatar: '📷',
    palette: ['#10304F', '#134B6E'],
    reason: 'Curated the 200-photo field archive for the sapling-tracker site.',
    tags: ['documentary', 'native-tree', 'archive'],
    bio: 'Bio student. Birder. Knows the names of 140 Indian trees and most of their mood swings.',
  },
  {
    id: 'mh-6',
    name: 'Dhruv Nair',
    role: 'PR lead',
    wing: 'Public Relations',
    month: 'November 2025',
    avatar: '🤝',
    palette: ['#0E3540', '#135063'],
    reason: 'Landed 3 campus-paper features + 2 city-news mentions for Plant-a-Patch.',
    tags: ['outreach', 'press', 'partnerships'],
    bio: 'Political-science final-year. Chai-and-conversation person. Calm during chaos.',
  },
  {
    id: 'mh-7',
    name: 'Kavya Ramanathan',
    role: 'Events ops',
    wing: 'Public Relations',
    month: 'October 2025',
    avatar: '🗓️',
    palette: ['#2B0E3C', '#44125A'],
    reason: 'Ran the 9-city rollout of the open plant-walk, zero budget overrun.',
    tags: ['logistics', 'travel', 'ops'],
    bio: 'MBA first-year. Ex-fest president. Eats spreadsheets for breakfast.',
  },
  {
    id: 'mh-8',
    name: 'Rohit Bansal',
    role: 'ML · Web/App',
    wing: 'Web/App Development',
    month: 'September 2025',
    avatar: '🧠',
    palette: ['#053049', '#0A4A6E'],
    reason: 'Built the sapling-health classifier now used by 14 volunteer teams.',
    tags: ['pytorch', 'mobile-ml', 'datasets'],
    bio: 'AI second-year. Runs the Thursday reading group on fairness. Vegetarian cook.',
  },
  {
    id: 'mh-9',
    name: 'Nivedita Rao',
    role: 'Editorial',
    wing: 'Content Writer',
    month: 'August 2025',
    avatar: '📖',
    palette: ['#102F1C', '#1A4A2C'],
    reason: 'Authored the guardian-handbook — 38-page onboarding PDF, gifted at every orientation.',
    tags: ['handbook', 'onboarding', 'editorial'],
    bio: 'Journalism student from Bengaluru. Runs a tiny zine on the side. Tea over coffee.',
  },
  {
    id: 'mh-10',
    name: 'Kabir Saxena',
    role: 'Motion · GD',
    wing: 'Graphic Designer',
    month: 'July 2025',
    avatar: '✨',
    palette: ['#301055', '#4A1472'],
    reason: 'Designed the motion system — 40+ micro-loops used across social and in-app.',
    tags: ['after-effects', 'motion', 'system'],
    bio: 'Animation student. Builds Lego architecture on weekends. Will over-explain kerning if asked.',
  },
  {
    id: 'mh-11',
    name: 'Shreya Khanna',
    role: 'Reel director',
    wing: 'Video Editor',
    month: 'June 2025',
    avatar: '🎞️',
    palette: ['#3E2B0A', '#5A410F'],
    reason: 'Pitched and ran the \'30 stories in 30 days\' reel series across all wings.',
    tags: ['reels', 'story', 'cadence'],
    bio: 'Film studies. Director-in-training. Keeps a notes app full of one-line dialogue.',
  },
  {
    id: 'mh-12',
    name: 'Advait Kulkarni',
    role: 'Archive · Photo',
    wing: 'Photographer',
    month: 'May 2025',
    avatar: '🗂️',
    palette: ['#0C2F3E', '#125062'],
    reason: 'Rescued 4 years of unlabelled event photos into a searchable tag-based library.',
    tags: ['metadata', 'taxonomy', 'archive'],
    bio: 'Library-science student. Thinks of folders the way most people think of poetry.',
  },
];

// -----------------------------------------------------
// Weekly digest
// -----------------------------------------------------

interface DigestDay {
  id: string;
  day: string;
  date: string;
  summary: string;
  highlight?: string;
  color: string;
}

const WEEKLY_DIGEST: DigestDay[] = [
  { id: 'wd-1', day: 'Mon', date: '15', summary: 'Office hours · Content wing · 6 walk-ins', color: '#4CAF50' },
  { id: 'wd-2', day: 'Tue', date: '16', summary: 'Web/App standup · 2 PRs shipped', highlight: 'Ship', color: '#29B6F6' },
  { id: 'wd-3', day: 'Wed', date: '17', summary: 'Plant walk · 42 guardians · Cubbon Park', highlight: 'Field', color: '#66BB6A' },
  { id: 'wd-4', day: 'Thu', date: '18', summary: 'Reading group · Fair ML · 17 attended', color: '#AB47BC' },
  { id: 'wd-5', day: 'Fri', date: '19', summary: 'No-laptop ritual · Tea + sketchbooks', highlight: 'Ritual', color: '#FFB74D' },
  { id: 'wd-6', day: 'Sat', date: '20', summary: 'GD jam · 6 poster drafts reviewed', color: '#FFD54F' },
  { id: 'wd-7', day: 'Sun', date: '21', summary: 'Digest email goes out · plan next week', highlight: 'Email', color: '#00D4FF' },
];

// -----------------------------------------------------
// Partners / sponsors
// -----------------------------------------------------

interface Partner {
  id: string;
  name: string;
  kind: 'sustainability' | 'tech' | 'campus' | 'media';
  emoji: string;
  blurb: string;
  since: string;
  color: string;
}

const PARTNERS: Partner[] = [
  { id: 'p-1', name: 'Saplings Collective', kind: 'sustainability', emoji: '🌿', blurb: 'Native-species nursery · 4 states.', since: '2022', color: '#4CAF50' },
  { id: 'p-2', name: 'Campus Forests Trust', kind: 'sustainability', emoji: '🌳', blurb: 'Runs the 9-month survivorship audit.', since: '2023', color: '#2E7D32' },
  { id: 'p-3', name: 'Leafline Labs', kind: 'tech', emoji: '🧪', blurb: 'Soil sensors for long-term monitoring.', since: '2024', color: '#66BB6A' },
  { id: 'p-4', name: 'OpenMap India', kind: 'tech', emoji: '🗺️', blurb: 'Basemap + OSM training partner.', since: '2023', color: '#29B6F6' },
  { id: 'p-5', name: 'CodeGarden Co-op', kind: 'tech', emoji: '💻', blurb: 'Workshop partner · open-source mentorship.', since: '2024', color: '#00D4FF' },
  { id: 'p-6', name: 'Mridula College', kind: 'campus', emoji: '🏫', blurb: 'Primary campus chapter since 2021.', since: '2021', color: '#AB47BC' },
  { id: 'p-7', name: 'Vidya Polytechnic', kind: 'campus', emoji: '🏫', blurb: 'Second campus chapter — Hyderabad.', since: '2022', color: '#7E57C2' },
  { id: 'p-8', name: 'The Canopy Press', kind: 'media', emoji: '📰', blurb: 'Student-run city publication; storytelling partner.', since: '2023', color: '#FFD54F' },
  { id: 'p-9', name: 'Rurban Commons', kind: 'sustainability', emoji: '🪴', blurb: 'Village-level plantings · 14 villages.', since: '2022', color: '#43A047' },
  { id: 'p-10', name: 'ReCraft Co.', kind: 'sustainability', emoji: '♻️', blurb: 'E-waste pickup + certified recycling.', since: '2023', color: '#FFB74D' },
  { id: 'p-11', name: 'Open Archive Foundation', kind: 'tech', emoji: '🗄️', blurb: 'Provides our media-archive stack.', since: '2024', color: '#9575CD' },
  { id: 'p-12', name: 'Story Sundays Podcast', kind: 'media', emoji: '🎙️', blurb: 'Monthly interview slot for alumni.', since: '2023', color: '#EF6C00' },
];

// -----------------------------------------------------
// Club values pillars
// -----------------------------------------------------

interface ValuePillar {
  id: string;
  emoji: string;
  title: string;
  body: string;
  color: string;
}

const VALUES: ValuePillar[] = [
  {
    id: 'v-1',
    emoji: '🌱',
    title: 'Plant more than you cut.',
    body: 'Every idea ships with a step that grows something — literal or metaphorical.',
    color: '#4CAF50',
  },
  {
    id: 'v-2',
    emoji: '🛠️',
    title: 'Small tools for real people.',
    body: 'No dashboards nobody reads. Every utility has one named human user.',
    color: '#00D4FF',
  },
  {
    id: 'v-3',
    emoji: '🫶',
    title: 'Kindness at load.',
    body: 'We\'re kind when we\'re tired, not only when it\'s easy. Burnout is a bug.',
    color: '#AB47BC',
  },
  {
    id: 'v-4',
    emoji: '📣',
    title: 'Credit loudly.',
    body: 'First drafts get names. Small wins go on the board. Nobody gets erased.',
    color: '#FFB74D',
  },
  {
    id: 'v-5',
    emoji: '🕯️',
    title: 'Rituals over rules.',
    body: 'Friday no-laptop. Sunday digest. Monthly campfire. Rituals carry us through.',
    color: '#EF6C00',
  },
  {
    id: 'v-6',
    emoji: '📚',
    title: 'Document like we\'ll forget.',
    body: 'Because we will. Handbook, decisions log, post-mortems — written before we sleep.',
    color: '#7E57C2',
  },
];

// -----------------------------------------------------
// Live activity feed (recent actions)
// -----------------------------------------------------

interface FeedItem {
  id: string;
  actor: string;
  verb: string;
  object: string;
  at: string;
  emoji: string;
  color: string;
}

const LIVE_FEED: FeedItem[] = [
  { id: 'lf-1', actor: 'Ananya', verb: 'published', object: 'Sapling-story · long-form', at: '2 min ago', emoji: '✍️', color: '#4CAF50' },
  { id: 'lf-2', actor: 'Rohit', verb: 'opened PR', object: 'Sensor batch-reader v2', at: '14 min ago', emoji: '🔀', color: '#29B6F6' },
  { id: 'lf-3', actor: 'Mira', verb: 'uploaded', object: '37 photos · Cubbon Park walk', at: '38 min ago', emoji: '📷', color: '#AB47BC' },
  { id: 'lf-4', actor: 'Kavya', verb: 'scheduled', object: 'Hyd chapter mixer · Apr 27', at: '1 hr ago', emoji: '🗓️', color: '#EF6C00' },
  { id: 'lf-5', actor: 'Aryan', verb: 'exported', object: 'Reel #24 · editing done', at: '2 hr ago', emoji: '🎬', color: '#FFD54F' },
  { id: 'lf-6', actor: 'Dhruv', verb: 'confirmed', object: 'ReCraft pickup · Friday 10 am', at: '3 hr ago', emoji: '♻️', color: '#FFB74D' },
  { id: 'lf-7', actor: 'Nivedita', verb: 'updated', object: 'Handbook · onboarding page', at: '4 hr ago', emoji: '📖', color: '#66BB6A' },
  { id: 'lf-8', actor: 'Ishita', verb: 'posted draft', object: 'Poster kit · Earth Day', at: '5 hr ago', emoji: '🎨', color: '#7E57C2' },
  { id: 'lf-9', actor: 'Vivaan', verb: 'fixed', object: 'RSVP crash on Android 11', at: '6 hr ago', emoji: '🐛', color: '#00D4FF' },
  { id: 'lf-10', actor: 'Kabir', verb: 'rendered', object: 'Motion loop #44', at: '8 hr ago', emoji: '✨', color: '#9575CD' },
];

// -----------------------------------------------------
// Onboarding path
// -----------------------------------------------------

interface OnboardingStep {
  id: string;
  week: string;
  title: string;
  body: string;
  emoji: string;
  color: string;
  deliverable: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'ob-1', week: 'Week 0',  title: 'Welcome + sign the handbook',          body: 'Read the 12-page handbook. Pick one wing you want to try. Tell your buddy what you are curious about.', emoji: '📖', color: '#22C55E', deliverable: 'Handbook signed · wing chosen' },
  { id: 'ob-2', week: 'Week 1',  title: 'Pair with a buddy · ship small',       body: 'Buddy walks you through one tiny task · a poster, a commit, a crew shift, a 200-word draft.',              emoji: '🤝', color: '#38BDF8', deliverable: 'One small thing shipped' },
  { id: 'ob-3', week: 'Week 2',  title: 'Join a project standup',               body: 'Sit in two standups. Ask one curious question. Nothing more asked of you.',                                  emoji: '🎧', color: '#A78BFA', deliverable: 'Two standups attended' },
  { id: 'ob-4', week: 'Week 3',  title: 'Own a slice',                          body: 'Pick one deliverable on an in-flight project. Your buddy is co-signed on it. You lead · not alone.',           emoji: '🧩', color: '#F59E0B', deliverable: 'Slice owned · PR/poster/story opened' },
  { id: 'ob-5', week: 'Week 4',  title: 'Present in show-and-tell',             body: 'Three-minute show-and-tell to the wing. Mistakes are welcome here · this is the warm-up, not the exam.',      emoji: '🎤', color: '#F472B6', deliverable: 'Ship + present' },
  { id: 'ob-6', week: 'Week 6',  title: 'Start a tiny experiment',              body: 'Propose a 2-week experiment you believe in. Doesn\'t need permission · needs one co-conspirator.',             emoji: '🧪', color: '#EC4899', deliverable: 'Experiment kicked off' },
  { id: 'ob-7', week: 'Week 8',  title: 'Close the loop',                       body: 'Retrospective with your buddy. What worked, what didn\'t, what you want to try next. No grading.',              emoji: '🔄', color: '#6366F1', deliverable: 'Buddy retro written' },
  { id: 'ob-8', week: 'Week 12', title: 'Full member · mentor the next cohort', body: 'Fly on your own wing. Pair with the next first-year. The loop renews. Welcome for good.',                     emoji: '🌱', color: '#16A34A', deliverable: 'Mentor assigned' },
];

// -----------------------------------------------------
// Achievement badges
// -----------------------------------------------------

interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earned: number;
  criteria: string;
}

const BADGES: Badge[] = [
  { id: 'bg-1',  name: 'First Ship',          emoji: '🚢', color: '#22C55E', rarity: 'common',    earned: 412, criteria: 'Ship your first club deliverable in any wing.' },
  { id: 'bg-2',  name: 'Poster Perfect',      emoji: '🎨', color: '#F472B6', rarity: 'uncommon',  earned: 84,  criteria: 'Design posters used in 3+ live events.' },
  { id: 'bg-3',  name: 'Long-form Voice',     emoji: '✍️', color: '#38BDF8', rarity: 'uncommon',  earned: 67,  criteria: 'Publish 5+ long-form pieces on Canopy Press.' },
  { id: 'bg-4',  name: 'Stage Presence',      emoji: '🎤', color: '#A78BFA', rarity: 'uncommon',  earned: 39,  criteria: 'Speak at 3+ main-stage events.' },
  { id: 'bg-5',  name: 'Release Captain',     emoji: '🚀', color: '#00D4FF', rarity: 'rare',      earned: 22,  criteria: 'Lead 3+ app releases without a rollback.' },
  { id: 'bg-6',  name: 'Sapling Sponsor',     emoji: '🌱', color: '#16A34A', rarity: 'rare',      earned: 28,  criteria: 'Plant + care for 25+ saplings across drives.' },
  { id: 'bg-7',  name: 'Zero-Waste Streak',   emoji: '♻️', color: '#84CC16', rarity: 'rare',      earned: 19,  criteria: 'Organise 3 events with <5kg mixed waste each.' },
  { id: 'bg-8',  name: 'Chapter Anchor',      emoji: '📍', color: '#F59E0B', rarity: 'rare',      earned: 11,  criteria: 'Anchor a city chapter for 2+ seasons.' },
  { id: 'bg-9',  name: 'Mentor of the Month', emoji: '🧭', color: '#6366F1', rarity: 'rare',      earned: 15,  criteria: 'Win peer-voted Mentor of the Month.' },
  { id: 'bg-10', name: 'Ten-Year Torch',      emoji: '🔥', color: '#EF4444', rarity: 'legendary', earned: 3,   criteria: 'Stay involved as alumni across 10+ years.' },
  { id: 'bg-11', name: 'Canopy Keeper',       emoji: '🌳', color: '#15803D', rarity: 'legendary', earned: 5,   criteria: 'Plant + confirm 100+ trees that survive 3+ years.' },
  { id: 'bg-12', name: 'Silent Glue',         emoji: '🤲', color: '#D4AF37', rarity: 'legendary', earned: 7,   criteria: 'Nominated 3+ times as "the glue" of their wing.' },
];

// -----------------------------------------------------
// Sustainability scoreboard (quarter view)
// -----------------------------------------------------

interface ScoreboardRow {
  id: string;
  metric: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  unit: string;
  emoji: string;
  color: string;
  target: number;
}

const SCOREBOARD: ScoreboardRow[] = [
  { id: 'sb-1', metric: 'Saplings planted',      q1: 280, q2: 340, q3: 420, q4: 510, unit: 'trees', emoji: '🌱', color: '#22C55E', target: 2000 },
  { id: 'sb-2', metric: 'E-waste collected',     q1: 84,  q2: 102, q3: 118, q4: 146, unit: 'kg',    emoji: '♻️', color: '#84CC16', target: 600 },
  { id: 'sb-3', metric: 'Paper saved · digital', q1: 12000, q2: 13800, q3: 15400, q4: 18200, unit: 'sheets', emoji: '📄', color: '#38BDF8', target: 80000 },
  { id: 'sb-4', metric: 'CO₂ avoided',            q1: 4.2, q2: 5.1, q3: 6.3, q4: 8.8, unit: 't CO₂e', emoji: '🌍', color: '#16A34A', target: 30 },
  { id: 'sb-5', metric: 'Volunteer hours',       q1: 1240, q2: 1590, q3: 1860, q4: 2210, unit: 'hrs', emoji: '⏳', color: '#F59E0B', target: 8000 },
  { id: 'sb-6', metric: 'Reuse · event kits',    q1: 14, q2: 19, q3: 24, q4: 29, unit: 'kits', emoji: '🧰', color: '#A78BFA', target: 100 },
];

// -----------------------------------------------------
// Community norms
// -----------------------------------------------------

interface Norm {
  id: string;
  title: string;
  body: string;
  emoji: string;
  color: string;
}

const NORMS: Norm[] = [
  { id: 'nm-1', title: 'Show up honestly',      body: 'Say what you know. Say what you don\'t. Both are allowed here.',                                emoji: '🪞', color: '#38BDF8' },
  { id: 'nm-2', title: 'Rough drafts welcome',  body: 'We review the draft kindly, then push it to the next draft. No first-draft shame.',              emoji: '📝', color: '#F472B6' },
  { id: 'nm-3', title: 'Plan in public',        body: 'Decisions live in channels, not DMs. Future-you (and new members) will thank you.',              emoji: '📣', color: '#F59E0B' },
  { id: 'nm-4', title: 'Default to credit',     body: 'Name the people who shipped the thing. In the caption, in the commit, in the crowd.',            emoji: '🏷️', color: '#22C55E' },
  { id: 'nm-5', title: 'Repair over blame',     body: 'If something breaks, we fix it and write what we learned. Blame is expensive. Fixes are cheap.', emoji: '🧰', color: '#A78BFA' },
  { id: 'nm-6', title: 'Rest is part of work',  body: 'Burn-out is not a badge. Sleep, food, walks. Show up whole.',                                      emoji: '🛌', color: '#6366F1' },
  { id: 'nm-7', title: 'Keep the handbook alive', body: 'See a missing page? Add it. The handbook only works if every cohort edits it.',                emoji: '📖', color: '#0EA5E9' },
];

// -----------------------------------------------------
// Collaboration opportunities
// -----------------------------------------------------

interface CollabOpp {
  id: string;
  title: string;
  wing: string;
  color: string;
  commitment: string;
  lookingFor: string;
  contact: string;
}

const COLLAB_OPPS: CollabOpp[] = [
  { id: 'co-1', title: 'Sapling dashboard · v2 redesign',      wing: 'Web/App',         color: '#00D4FF', commitment: '6–8 hrs/wk · 3 wks', lookingFor: '1 RN dev · 1 product designer', contact: 'build@taruguardians.org' },
  { id: 'co-2', title: 'Canopy Press · monsoon issue',         wing: 'Content',         color: '#4CAF50', commitment: '3–4 hrs/wk · 4 wks', lookingFor: '2 writers · 1 copy editor',     contact: 'press@taruguardians.org' },
  { id: 'co-3', title: 'Earth Day poster kit',                 wing: 'Graphic Design',  color: '#F472B6', commitment: '4 hrs/wk · 2 wks',   lookingFor: '2 designers · 1 illustrator',   contact: 'design@taruguardians.org' },
  { id: 'co-4', title: 'Alumni fireside · reel series',        wing: 'Video',           color: '#FFD54F', commitment: '5 hrs/wk · 3 wks',   lookingFor: '1 editor · 1 motion artist',    contact: 'video@taruguardians.org' },
  { id: 'co-5', title: 'Repair café · photo story',            wing: 'Photography',     color: '#AB47BC', commitment: '2 shoots · half-day', lookingFor: '2 photographers · 1 captioner', contact: 'photo@taruguardians.org' },
  { id: 'co-6', title: 'Sponsor outreach · green partners',    wing: 'Public Relations', color: '#EF6C00', commitment: '3 hrs/wk · 6 wks',   lookingFor: '2 PR leads · 1 researcher',     contact: 'pr@taruguardians.org' },
];

// -----------------------------------------------------
// Resource hub
// -----------------------------------------------------

interface Resource {
  id: string;
  title: string;
  kind: 'handbook' | 'template' | 'deck' | 'tool' | 'guide';
  emoji: string;
  color: string;
  updated: string;
  blurb: string;
  tag: string;
}

const RESOURCES: Resource[] = [
  { id: 'rs-1',  title: 'Club handbook · 2026 ed',           kind: 'handbook', emoji: '📖', color: '#22C55E', updated: 'Apr 12', blurb: '12-page canonical doc · values · norms · how we ship.',                 tag: 'All wings' },
  { id: 'rs-2',  title: 'Event postmortem template',         kind: 'template', emoji: '🧾', color: '#38BDF8', updated: 'Apr 04', blurb: 'Fill-in template we use after every event · 8 prompts · 30 min to run.', tag: 'Events' },
  { id: 'rs-3',  title: 'Poster kit · Canva + Figma',        kind: 'template', emoji: '🎨', color: '#F472B6', updated: 'Mar 29', blurb: 'Grid · type · palette · 4 layouts. Don\'t start from scratch.',          tag: 'Graphic Design' },
  { id: 'rs-4',  title: 'Release-rotation doc · v2',         kind: 'guide',    emoji: '🚀', color: '#00D4FF', updated: 'Mar 21', blurb: 'How we ship the app every Friday · rollback plan · on-call rota.',      tag: 'Web/App' },
  { id: 'rs-5',  title: 'Sapling survey CSV · Q1',           kind: 'tool',     emoji: '📊', color: '#16A34A', updated: 'Mar 14', blurb: 'Clean dataset of every tree we\'ve planted + Q1 survival check.',         tag: 'Sustainability' },
  { id: 'rs-6',  title: 'Alumni fireside deck · template',   kind: 'deck',     emoji: '🪟', color: '#A78BFA', updated: 'Feb 27', blurb: '10-slide template · alumni bio · 3 questions · 1 story.',                tag: 'PR + Events' },
  { id: 'rs-7',  title: 'Video editing · mini-handbook',     kind: 'guide',    emoji: '🎬', color: '#FFD54F', updated: 'Feb 18', blurb: 'DaVinci quickstart · colour · pacing · captions · upload checklist.',   tag: 'Video' },
  { id: 'rs-8',  title: 'Photography consent card',          kind: 'template', emoji: '📷', color: '#AB47BC', updated: 'Feb 04', blurb: 'Printable card we hand at every event · 3 levels of consent.',           tag: 'Photography' },
  { id: 'rs-9',  title: 'Sponsor pitch · one-pager',         kind: 'template', emoji: '🤝', color: '#EF6C00', updated: 'Jan 28', blurb: 'One-page pitch template · numbers · audience · ask. Stop reinventing.', tag: 'Public Relations' },
  { id: 'rs-10', title: 'Content Style Guide · v1.3',        kind: 'handbook', emoji: '🖋️', color: '#4CAF50', updated: 'Jan 14', blurb: 'Tone · voice · house-style rules · what we never say.',                  tag: 'Content' },
];

// -----------------------------------------------------
// Campus calendar preview
// -----------------------------------------------------

interface CalendarPreview {
  id: string;
  day: string;
  label: string;
  chips: { text: string; color: string }[];
}

const CAMPUS_CAL: CalendarPreview[] = [
  { id: 'cc-1', day: 'Mon', label: 'Apr 21', chips: [{ text: 'Standups', color: '#38BDF8' }, { text: 'Canopy Press lay-in', color: '#4CAF50' }] },
  { id: 'cc-2', day: 'Tue', label: 'Apr 22', chips: [{ text: 'Sapling drive · EEE block', color: '#22C55E' }] },
  { id: 'cc-3', day: 'Wed', label: 'Apr 23', chips: [{ text: 'Open design crit', color: '#F472B6' }, { text: 'Alumni office hrs', color: '#FFD54F' }] },
  { id: 'cc-4', day: 'Thu', label: 'Apr 24', chips: [{ text: 'RN weekly', color: '#00D4FF' }] },
  { id: 'cc-5', day: 'Fri', label: 'Apr 25', chips: [{ text: 'Release · v1.3.2', color: '#00D4FF' }, { text: 'Photo walk', color: '#AB47BC' }] },
  { id: 'cc-6', day: 'Sat', label: 'Apr 26', chips: [{ text: 'Repair café', color: '#84CC16' }] },
  { id: 'cc-7', day: 'Sun', label: 'Apr 27', chips: [{ text: 'Hyd chapter mixer', color: '#EF6C00' }] },
];

// -----------------------------------------------------
// Quick wins
// -----------------------------------------------------

interface QuickWin {
  id: string;
  emoji: string;
  label: string;
  value: string;
  color: string;
}

const QUICK_WINS: QuickWin[] = [
  { id: 'qw-1', emoji: '📈', label: 'Reach (7d)', value: '24.8k', color: '#29B6F6' },
  { id: 'qw-2', emoji: '💌', label: 'Signups', value: '+38', color: '#4CAF50' },
  { id: 'qw-3', emoji: '🌳', label: 'Trees this week', value: '162', color: '#66BB6A' },
  { id: 'qw-4', emoji: '🧪', label: 'Experiments live', value: '6', color: '#AB47BC' },
  { id: 'qw-5', emoji: '🛠️', label: 'PRs merged', value: '11', color: '#00D4FF' },
  { id: 'qw-6', emoji: '📝', label: 'Articles shipped', value: '4', color: '#FFD54F' },
  { id: 'qw-7', emoji: '📷', label: 'Photos archived', value: '318', color: '#7E57C2' },
  { id: 'qw-8', emoji: '🎬', label: 'Reels edited', value: '7', color: '#FFB74D' },
];

// -----------------------------------------------------
// Phase 3o: deeper data structures
// -----------------------------------------------------

interface QuarterGoal {
  id: string;
  quarter: string;
  title: string;
  detail: string;
  owner: string;
  status: 'on-track' | 'at-risk' | 'done' | 'planning';
  progress: number;
  color: string;
  emoji: string;
}

const QUARTER_GOALS: QuarterGoal[] = [
  { id: 'qg-1', quarter: 'Q1 · Jan–Mar', title: 'Plant 2,500 saplings', detail: 'Six partner farms · GPS-tagged · 85 % survival review after 90 days.', owner: 'Green Wing', status: 'on-track', progress: 0.72, color: '#22C55E', emoji: '🌳' },
  { id: 'qg-2', quarter: 'Q1 · Jan–Mar', title: 'Ship the new Guardians app', detail: 'Six bottom-tabs live on Play Store closed track · reach internal QA by Feb 28.', owner: 'Web/App Wing', status: 'on-track', progress: 0.88, color: '#00D4FF', emoji: '📱' },
  { id: 'qg-3', quarter: 'Q1 · Jan–Mar', title: '4 campus climate talks', detail: 'Two talks done · two scheduled · slides archived with CC-BY licence.', owner: 'Content Wing', status: 'on-track', progress: 0.5, color: '#F59E0B', emoji: '🎤' },
  { id: 'qg-4', quarter: 'Q1 · Jan–Mar', title: 'E-waste drive · 400 kg', detail: 'Three drop-off points · vendor pickup every fortnight · receipts archived.', owner: 'Ops Wing', status: 'at-risk', progress: 0.41, color: '#EF4444', emoji: '♻️' },
  { id: 'qg-5', quarter: 'Q2 · Apr–Jun', title: 'Launch alumni portal', detail: 'Directory · mentorship matching · 180 alums targeted · respects opt-outs.', owner: 'Alumni Wing', status: 'planning', progress: 0.12, color: '#A855F7', emoji: '🎓' },
  { id: 'qg-6', quarter: 'Q2 · Apr–Jun', title: 'Wing-swap month', detail: 'Every member tries a sister wing for two weeks · debriefs at month-end town hall.', owner: 'All wings', status: 'planning', progress: 0.06, color: '#F472B6', emoji: '🔀' },
  { id: 'qg-7', quarter: 'Q2 · Apr–Jun', title: 'Open a Pune chapter', detail: 'Five founders identified · venue scouted · kickoff target May 18.', owner: 'Chapter Ops', status: 'planning', progress: 0.24, color: '#38BDF8', emoji: '🏙️' },
  { id: 'qg-8', quarter: 'Done · 2024', title: '1,000 saplings in 2024', detail: 'Exceeded · 1,182 recorded across four drives · 88 % survived monsoon.', owner: 'Green Wing', status: 'done', progress: 1, color: '#4ADE80', emoji: '✅' },
  { id: 'qg-9', quarter: 'Done · 2024', title: 'First hackathon: 40 teams', detail: 'Shipped · 48 submissions · 9 projects got seeded into wings.', owner: 'Events', status: 'done', progress: 1, color: '#4ADE80', emoji: '✅' },
  { id: 'qg-10', quarter: 'Done · 2024', title: 'Kota chapter', detail: 'Shipped · 18 members · monthly cadence holding since August.', owner: 'Chapter Ops', status: 'done', progress: 1, color: '#4ADE80', emoji: '✅' },
];

interface ImpactRegion {
  id: string;
  region: string;
  state: string;
  saplings: number;
  members: number;
  partners: number;
  tonsCO2: number;
  lastDriveDate: string;
  nextDriveDate: string;
  note: string;
  color: string;
  emoji: string;
}

const IMPACT_REGIONS: ImpactRegion[] = [
  { id: 'ir-1', region: 'Jaipur metro', state: 'Rajasthan', saplings: 842, members: 58, partners: 6, tonsCO2: 11.7, lastDriveDate: '2026-03-12', nextDriveDate: '2026-04-06', note: 'Two school campuses + riverbank belt · drip plan through summer.', color: '#F59E0B', emoji: '🏜️' },
  { id: 'ir-2', region: 'Kota campus', state: 'Rajasthan', saplings: 512, members: 42, partners: 4, tonsCO2: 7.2, lastDriveDate: '2026-03-01', nextDriveDate: '2026-04-19', note: 'Hostel back-lanes shaded · survival audit scheduled for June.', color: '#22C55E', emoji: '🌳' },
  { id: 'ir-3', region: 'Delhi NCR', state: 'Delhi', saplings: 318, members: 76, partners: 5, tonsCO2: 4.5, lastDriveDate: '2026-02-25', nextDriveDate: '2026-04-11', note: 'Urban micro-forests · pilot with two RWAs · air-quality sensors staged.', color: '#EF4444', emoji: '🏙️' },
  { id: 'ir-4', region: 'Pune belt', state: 'Maharashtra', saplings: 154, members: 22, partners: 2, tonsCO2: 2.2, lastDriveDate: '2026-03-18', nextDriveDate: '2026-05-03', note: 'Chapter in setup · first drive was a scouting run.', color: '#38BDF8', emoji: '🌀' },
  { id: 'ir-5', region: 'Bhopal lake ring', state: 'Madhya Pradesh', saplings: 276, members: 19, partners: 3, tonsCO2: 3.8, lastDriveDate: '2026-03-08', nextDriveDate: '2026-04-26', note: 'Native species list locked · forestry dept signs off on water plan.', color: '#06B6D4', emoji: '💧' },
  { id: 'ir-6', region: 'Ahmedabad', state: 'Gujarat', saplings: 198, members: 14, partners: 2, tonsCO2: 2.8, lastDriveDate: '2026-02-19', nextDriveDate: '2026-04-23', note: 'New chapter · 14 founding members · monthly cadence starting.', color: '#A855F7', emoji: '🌱' },
  { id: 'ir-7', region: 'Bengaluru south', state: 'Karnataka', saplings: 128, members: 18, partners: 2, tonsCO2: 1.8, lastDriveDate: '2026-03-22', nextDriveDate: '2026-05-10', note: 'Campus partner confirmed · waiting on BBMP permit for pavement strip.', color: '#4ADE80', emoji: '🌿' },
];

interface LearningPath {
  id: string;
  title: string;
  level: 'starter' | 'intermediate' | 'advanced';
  hours: number;
  owner: string;
  skills: string[];
  outcome: string;
  color: string;
  emoji: string;
}

const LEARNING_PATHS: LearningPath[] = [
  { id: 'lp-1', title: 'Shipping your first article', level: 'starter', hours: 4, owner: 'Content Wing', skills: ['outlining', 'interview notes', 'editor pass'], outcome: '600–900 word explainer published on the wing blog, with one interview quote.', color: '#F59E0B', emoji: '✍️' },
  { id: 'lp-2', title: 'Mobile UI in React Native', level: 'intermediate', hours: 12, owner: 'Web/App Wing', skills: ['layout + spacing', 'animations', 'ship-ready PR'], outcome: 'Own one full screen on a live repo · code-review before merge.', color: '#00D4FF', emoji: '📱' },
  { id: 'lp-3', title: 'Brand systems in Figma', level: 'intermediate', hours: 8, owner: 'GD Wing', skills: ['type scale', 'colour tokens', 'component library'], outcome: 'Design a mini brand kit · logo + 3 posters + tokens handed off as json.', color: '#F472B6', emoji: '🎨' },
  { id: 'lp-4', title: 'From RAW to reel', level: 'starter', hours: 6, owner: 'Photo Wing', skills: ['ingest + cull', 'lightroom grade', 'export ladder'], outcome: 'Publish a 12-frame event set · each with caption + credit · archived.', color: '#7E57C2', emoji: '📷' },
  { id: 'lp-5', title: 'Cutting a 60-sec recap', level: 'intermediate', hours: 10, owner: 'Video Wing', skills: ['story beats', 'sound design', 'captioning'], outcome: 'Deliver a captioned recap under 60 s · three-track mix · approved by lead.', color: '#FFB74D', emoji: '🎬' },
  { id: 'lp-6', title: 'Getting quoted in press', level: 'advanced', hours: 14, owner: 'PR Wing', skills: ['pitch crafting', 'journalist outreach', 'story angles'], outcome: 'Land one genuine placement in a local or campus publication · no paid promos.', color: '#38BDF8', emoji: '📣' },
  { id: 'lp-7', title: 'Planning a 50-tree drive', level: 'intermediate', hours: 16, owner: 'Green Wing', skills: ['site survey', 'native species', 'water plan'], outcome: 'Co-lead one drive · 85 % survival after 90 days · archived report.', color: '#22C55E', emoji: '🌳' },
  { id: 'lp-8', title: 'Running a crit session', level: 'advanced', hours: 4, owner: 'Any wing lead', skills: ['kind feedback', 'timeboxing', 'decision capture'], outcome: 'Host a 45-min open crit · three artefacts · one clear next-step each.', color: '#A855F7', emoji: '🪞' },
];

interface CommunityShout {
  id: string;
  from: string;
  to: string;
  message: string;
  reason: string;
  date: string;
  color: string;
  emoji: string;
}

const COMMUNITY_SHOUTS: CommunityShout[] = [
  { id: 'cs-1', from: 'Ritu · GD', to: 'Anmol · Web', message: 'Stayed up till 1am fixing the banner export for the drive poster — huge.', reason: 'went above', date: 'today', color: '#F472B6', emoji: '💗' },
  { id: 'cs-2', from: 'Arjun · Events', to: 'Pooja · Volunteer crew', message: 'Held the stage queue together for two hours in the sun. Queen behaviour.', reason: 'anchored ops', date: 'yesterday', color: '#F59E0B', emoji: '👑' },
  { id: 'cs-3', from: 'Maya · PR', to: 'Nikhil · Content', message: 'Your quote sheet saved me ten follow-ups with the journalist. Thank you.', reason: 'made work easier', date: '2 days ago', color: '#38BDF8', emoji: '🤝' },
  { id: 'cs-4', from: 'Iqbal · Photo', to: 'Sneha · Video', message: 'You made my blurry b-roll watchable. Sorcery.', reason: 'rescued a cut', date: '3 days ago', color: '#7E57C2', emoji: '🎬' },
  { id: 'cs-5', from: 'Devika · Green', to: 'Kota chapter', message: 'Eighteen people, monsoon drizzle, zero complaining. You raised the bar.', reason: 'showed up', date: '4 days ago', color: '#22C55E', emoji: '🌳' },
  { id: 'cs-6', from: 'Faraz · Wing lead', to: 'Everyone at Friday crit', message: 'The feedback was kind and sharp at the same time. Keep doing that.', reason: 'culture win', date: '5 days ago', color: '#A855F7', emoji: '🪞' },
  { id: 'cs-7', from: 'Prateek · Alumni', to: 'Riya · 2nd year', message: 'You asked one of the best questions in the talk. Keep writing in.', reason: 'great curiosity', date: '6 days ago', color: '#4ADE80', emoji: '💡' },
  { id: 'cs-8', from: 'Zara · Ops', to: 'Mess + cleaning staff', message: 'Seriously the reason the hackathon survived. Shoutout always.', reason: 'off-screen heroes', date: '1 week ago', color: '#FFB74D', emoji: '🙏' },
];

interface WorkshopEnrollment {
  id: string;
  title: string;
  date: string;
  time: string;
  mode: 'on-campus' | 'hybrid' | 'online';
  seatsTotal: number;
  seatsLeft: number;
  lead: string;
  level: 'open' | 'members' | 'invite';
  color: string;
  emoji: string;
}

const WORKSHOPS: WorkshopEnrollment[] = [
  { id: 'wk-1', title: 'Intro to React Native', date: 'Sat · Apr 20', time: '11:00 – 13:30', mode: 'on-campus', seatsTotal: 40, seatsLeft: 11, lead: 'Anmol · Web', level: 'open', color: '#00D4FF', emoji: '📱' },
  { id: 'wk-2', title: 'Figma tokens end-to-end', date: 'Sun · Apr 21', time: '15:00 – 17:00', mode: 'hybrid', seatsTotal: 35, seatsLeft: 4, lead: 'Ritu · GD', level: 'open', color: '#F472B6', emoji: '🎨' },
  { id: 'wk-3', title: 'Lightroom: grading a reel', date: 'Wed · Apr 24', time: '19:00 – 20:30', mode: 'online', seatsTotal: 120, seatsLeft: 58, lead: 'Iqbal · Photo', level: 'open', color: '#7E57C2', emoji: '📷' },
  { id: 'wk-4', title: 'Podcast editing basics', date: 'Fri · Apr 26', time: '17:00 – 19:00', mode: 'on-campus', seatsTotal: 30, seatsLeft: 6, lead: 'Sneha · Video', level: 'members', color: '#FFB74D', emoji: '🎧' },
  { id: 'wk-5', title: 'Pitching a journalist', date: 'Sat · Apr 27', time: '10:00 – 11:30', mode: 'online', seatsTotal: 80, seatsLeft: 29, lead: 'Maya · PR', level: 'open', color: '#38BDF8', emoji: '📣' },
  { id: 'wk-6', title: 'Planning a 50-tree drive', date: 'Sun · Apr 28', time: '09:00 – 12:00', mode: 'on-campus', seatsTotal: 24, seatsLeft: 0, lead: 'Devika · Green', level: 'members', color: '#22C55E', emoji: '🌳' },
  { id: 'wk-7', title: 'Writing like a human', date: 'Tue · Apr 30', time: '18:00 – 19:30', mode: 'hybrid', seatsTotal: 50, seatsLeft: 17, lead: 'Nikhil · Content', level: 'open', color: '#F59E0B', emoji: '✍️' },
  { id: 'wk-8', title: 'Crit session · open', date: 'Fri · May 03', time: '16:00 – 17:00', mode: 'on-campus', seatsTotal: 20, seatsLeft: 5, lead: 'Faraz · lead', level: 'open', color: '#A855F7', emoji: '🪞' },
];

interface SavingsRecord {
  id: string;
  label: string;
  unit: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  hint: string;
  color: string;
  emoji: string;
}

const SAVINGS_LEDGER: SavingsRecord[] = [
  { id: 'sv-1', label: 'CO₂ absorbed (est.)', unit: 'tonnes CO₂e', value: '34.1', change: '+2.8 this month', trend: 'up', hint: 'Based on 2,500+ trees averaged by species mix + age.', color: '#22C55E', emoji: '🌿' },
  { id: 'sv-2', label: 'E-waste diverted', unit: 'kg', value: '412', change: '+38 this month', trend: 'up', hint: 'Vendor receipts archived · nothing goes to landfill.', color: '#06B6D4', emoji: '♻️' },
  { id: 'sv-3', label: 'Water saved (drip plan)', unit: 'kL', value: '78', change: '+6 this month', trend: 'up', hint: 'Drip vs flood across three sites · conservative estimate.', color: '#38BDF8', emoji: '💧' },
  { id: 'sv-4', label: 'Paper saved (digital first)', unit: 'reams', value: '62', change: '+4 this quarter', trend: 'up', hint: 'All registrations + tickets digital · receipts emailed.', color: '#F59E0B', emoji: '📄' },
  { id: 'sv-5', label: 'Reusable cups in rotation', unit: 'cups', value: '380', change: 'flat', trend: 'flat', hint: '2 steel mugs per member + 150 shared at events.', color: '#A855F7', emoji: '☕' },
  { id: 'sv-6', label: 'Km travelled shared / solo', unit: 'ratio', value: '3.4×', change: '+0.3 this month', trend: 'up', hint: 'Carpools + shuttles vs solo rides to drives.', color: '#EF4444', emoji: '🚗' },
];

interface DailyRitual {
  id: string;
  time: string;
  title: string;
  detail: string;
  lead: string;
  color: string;
  emoji: string;
}

const DAILY_RITUALS: DailyRitual[] = [
  { id: 'dr-1', time: '09:30', title: 'Inbox zero', detail: 'One pass through shared inbox · assign or archive · no re-reading.', lead: 'Ops on rota', color: '#38BDF8', emoji: '📥' },
  { id: 'dr-2', time: '12:00', title: 'Standup (15 min)', detail: 'What moved · what is stuck · what I need · no status theatre.', lead: 'All wings on call', color: '#22C55E', emoji: '🧭' },
  { id: 'dr-3', time: '16:00', title: 'Ship or drop', detail: 'Anything older than 7 days without a next step gets dropped.', lead: 'Wing leads', color: '#F59E0B', emoji: '🚀' },
  { id: 'dr-4', time: '17:30', title: 'Friday crit (weekly)', detail: '45 min · three artefacts · kind + sharp feedback · one decision each.', lead: 'Faraz', color: '#A855F7', emoji: '🪞' },
  { id: 'dr-5', time: '20:00', title: 'Wrap + lights off', detail: 'One line per person in channel · what made the day better?', lead: 'Everyone', color: '#F472B6', emoji: '🌙' },
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

// =====================================================
// Phase 3v: deeper home structures
// =====================================================

interface WeatherToday {
  id: string;
  hour: string;
  tempC: number;
  condition: string;
  wind: string;
  aqi: number;
  emoji: string;
  color: string;
}

const WEATHER_TODAY: WeatherToday[] = [
  { id: 'wt-1', hour: '07:00', tempC: 19, condition: 'Cool + clear',   wind: '6 km/h NW',  aqi: 38, emoji: '🌤️', color: '#38BDF8' },
  { id: 'wt-2', hour: '10:00', tempC: 24, condition: 'Soft sun',       wind: '9 km/h N',   aqi: 46, emoji: '☀️',  color: '#FDE047' },
  { id: 'wt-3', hour: '13:00', tempC: 29, condition: 'Warm',           wind: '12 km/h NE', aqi: 58, emoji: '🌞',  color: '#F59E0B' },
  { id: 'wt-4', hour: '16:00', tempC: 27, condition: 'Partly cloudy',  wind: '10 km/h E',  aqi: 51, emoji: '⛅',  color: '#F59E0B' },
  { id: 'wt-5', hour: '19:00', tempC: 22, condition: 'Cool evening',   wind: '7 km/h SE',  aqi: 42, emoji: '🌇',  color: '#A78BFA' },
  { id: 'wt-6', hour: '22:00', tempC: 19, condition: 'Clear + calm',   wind: '5 km/h S',   aqi: 35, emoji: '🌌',  color: '#7E57C2' },
];

interface SaplingProgram {
  id: string;
  site: string;
  species: string;
  plantedCount: number;
  aliveCount: number;
  lastVisit: string;
  steward: string;
  color: string;
  emoji: string;
}

const SAPLING_PROGRAMS: SaplingProgram[] = [
  { id: 'sp-1', site: 'Campus west slope',          species: 'Neem · amla · moringa',     plantedCount: 240, aliveCount: 216, lastVisit: '2 days ago',  steward: 'Rahul · sapling wing',     color: '#22C55E', emoji: '🌳' },
  { id: 'sp-2', site: 'Dorm-B courtyard',           species: 'Guava · curry leaf · bel',  plantedCount: 85,  aliveCount: 82,  lastVisit: '5 days ago',  steward: 'Meera · sapling wing',      color: '#22C55E', emoji: '🌱' },
  { id: 'sp-3', site: 'Village · Kokare',           species: 'Jamun · mahua · teak',      plantedCount: 420, aliveCount: 371, lastVisit: '3 weeks ago', steward: 'Priya · field ops',         color: '#22C55E', emoji: '🌲' },
  { id: 'sp-4', site: 'Riverbank · Krishna',        species: 'Arjuna · banyan · peepal',  plantedCount: 180, aliveCount: 168, lastVisit: '6 weeks ago', steward: 'Rohit · field ops',         color: '#22C55E', emoji: '🌿' },
  { id: 'sp-5', site: 'School · Chandrapur',        species: 'Tamarind · lime · chiku',   plantedCount: 95,  aliveCount: 92,  lastVisit: '2 months ago', steward: 'Anmol · alumni network',   color: '#22C55E', emoji: '🍋' },
  { id: 'sp-6', site: 'Highway · KM 42 median',     species: 'Gulmohar · bottle-brush',   plantedCount: 60,  aliveCount: 54,  lastVisit: '4 weeks ago', steward: 'Tanvi · road-side crew',    color: '#F59E0B', emoji: '🌺' },
  { id: 'sp-7', site: 'Pond edge · Doddaballapur',  species: 'Bamboo · jamun · cashew',   plantedCount: 140, aliveCount: 131, lastVisit: '7 weeks ago', steward: 'Sanjana · partner NGO',    color: '#22C55E', emoji: '🎋' },
  { id: 'sp-8', site: 'Rooftop · main block',       species: 'Curry · basil · lemongrass', plantedCount: 48, aliveCount: 46,  lastVisit: 'Yesterday',    steward: 'Dev + botany dept',         color: '#38BDF8', emoji: '🌿' },
];

interface MentorHour {
  id: string;
  mentor: string;
  role: string;
  day: string;
  window: string;
  topic: string;
  mode: 'in-person' | 'online';
  capacity: number;
  color: string;
  emoji: string;
}

const MENTOR_HOURS: MentorHour[] = [
  { id: 'mh-1', mentor: 'Meera Iyer',      role: 'Alumni · climate-tech',   day: 'Tue', window: '18:30–19:30', topic: 'Field engineering + first jobs',  mode: 'online',     capacity: 4, color: '#38BDF8', emoji: '🧪' },
  { id: 'mh-2', mentor: 'Tanvi Shah',      role: 'Alumni · design',         day: 'Wed', window: '19:00–20:00', topic: 'Portfolio reviews · 20 min each',  mode: 'online',     capacity: 3, color: '#F472B6', emoji: '🎨' },
  { id: 'mh-3', mentor: 'Rohit Kapoor',    role: 'Alumni · climate policy', day: 'Thu', window: '17:00–18:00', topic: 'Writing for policy audiences',     mode: 'in-person',  capacity: 6, color: '#A78BFA', emoji: '📜' },
  { id: 'mh-4', mentor: 'Anmol Sethi',     role: 'Alumni · hardware',       day: 'Fri', window: '16:00–17:00', topic: 'PCB first builds · live debug',    mode: 'in-person',  capacity: 4, color: '#00D4FF', emoji: '🔌' },
  { id: 'mh-5', mentor: 'Sanjana Pillai',  role: 'Alumni · product',        day: 'Sat', window: '10:00–11:00', topic: 'Interviews · offer negotiation',   mode: 'online',     capacity: 5, color: '#FFD166', emoji: '💼' },
  { id: 'mh-6', mentor: 'Dev Narayan',     role: 'Alumni · ML research',    day: 'Sat', window: '15:00–16:00', topic: 'Paper reading · two papers',        mode: 'online',     capacity: 8, color: '#7E57C2', emoji: '📚' },
  { id: 'mh-7', mentor: 'Priya Ghosh',     role: 'Faculty · ecology',       day: 'Sun', window: '09:30–10:30', topic: 'Walk the campus trees · in-person', mode: 'in-person', capacity: 12, color: '#22C55E', emoji: '🌳' },
];

interface RecommendedRead {
  id: string;
  title: string;
  author: string;
  kind: 'book' | 'essay' | 'paper' | 'talk';
  minutes: number;
  why: string;
  color: string;
  emoji: string;
}

const RECOMMENDED_READS: RecommendedRead[] = [
  { id: 'rr-1', title: 'The hidden life of trees',              author: 'Peter Wohlleben',        kind: 'book',  minutes: 360, why: 'Roots us in the long, quiet time-scale of forests.',    color: '#22C55E', emoji: '🌳' },
  { id: 'rr-2', title: 'Braiding sweetgrass',                   author: 'Robin Wall Kimmerer',    kind: 'book',  minutes: 400, why: 'Science + indigenous knowledge woven with care.',        color: '#F472B6', emoji: '🌾' },
  { id: 'rr-3', title: 'On bullshit (essay)',                    author: 'Harry Frankfurt',        kind: 'essay', minutes: 25,  why: 'A short read that made our content wing write cleaner.', color: '#A78BFA', emoji: '🧠' },
  { id: 'rr-4', title: 'How forests think',                      author: 'Eduardo Kohn',           kind: 'book',  minutes: 420, why: 'Pairs well with field work · changes your eye for a walk.', color: '#7E57C2', emoji: '🦉' },
  { id: 'rr-5', title: 'AlphaFold · a look at the paper',        author: 'DeepMind · Nature 2021', kind: 'paper', minutes: 60,  why: 'Good example of careful science writing · for our wings.', color: '#00D4FF', emoji: '🧬' },
  { id: 'rr-6', title: 'Do things that don\'t scale (essay)',    author: 'Paul Graham',            kind: 'essay', minutes: 18,  why: 'A gift to any small team that feels late.',                color: '#F59E0B', emoji: '✍️' },
  { id: 'rr-7', title: 'Last tango (short film · talk)',          author: 'Sam Mendes',             kind: 'talk',  minutes: 35,  why: 'How to tell a story in under two minutes.',               color: '#F87171', emoji: '🎬' },
  { id: 'rr-8', title: 'The carbon footprint of our cities',     author: 'Vaclav Smil',            kind: 'book',  minutes: 340, why: 'Numbers-first · cuts through feel-good framing.',         color: '#F59E0B', emoji: '🏙️' },
  { id: 'rr-9', title: 'A short history of nearly everything',   author: 'Bill Bryson',            kind: 'book',  minutes: 520, why: 'Wide + warm · good for first-years.',                      color: '#38BDF8', emoji: '🌏' },
  { id: 'rr-10', title: 'Living with elephants (paper + film)',  author: 'Sanjay Gubbi · IISc',    kind: 'paper', minutes: 55,  why: 'Pairs science with field photography · models what we want.', color: '#22C55E', emoji: '🐘' },
];

interface VolunteerSlot {
  id: string;
  drive: string;
  date: string;
  slot: string;
  seats: number;
  filled: number;
  kind: 'field' | 'campus' | 'remote';
  color: string;
  emoji: string;
}

const VOLUNTEER_SLOTS: VolunteerSlot[] = [
  { id: 'vs-1',  drive: 'Tree walk · campus south',     date: '14 Apr · Sat', slot: '07:00–09:00', seats: 20, filled: 14, kind: 'campus', color: '#22C55E', emoji: '🚶' },
  { id: 'vs-2',  drive: 'E-waste collection drive',     date: '16 Apr · Mon', slot: '16:00–19:00', seats: 12, filled: 10, kind: 'campus', color: '#F59E0B', emoji: '🔋' },
  { id: 'vs-3',  drive: 'Sapling field visit · Kokare', date: '20 Apr · Fri', slot: '06:30–14:00', seats: 18, filled: 12, kind: 'field',  color: '#22C55E', emoji: '🌱' },
  { id: 'vs-4',  drive: 'Caption + upload · reels',     date: 'Any · this week', slot: '2h block',  seats: 10, filled: 6,  kind: 'remote', color: '#A78BFA', emoji: '📝' },
  { id: 'vs-5',  drive: 'Library shelving · science',   date: '22 Apr · Sun', slot: '10:00–12:00', seats: 14, filled: 9,  kind: 'campus', color: '#38BDF8', emoji: '📚' },
  { id: 'vs-6',  drive: 'Pond clean-up · village',      date: '28 Apr · Sat', slot: '05:30–11:00', seats: 22, filled: 8,  kind: 'field',  color: '#22C55E', emoji: '🪣' },
  { id: 'vs-7',  drive: 'Newsletter proof-read',         date: '15 Apr · Sun', slot: '1h block',   seats: 6,  filled: 4,  kind: 'remote', color: '#F472B6', emoji: '📰' },
  { id: 'vs-8',  drive: 'Kids coding hour · school',     date: '19 Apr · Thu', slot: '10:00–11:30', seats: 8,  filled: 5,  kind: 'field',  color: '#00D4FF', emoji: '👩‍💻' },
  { id: 'vs-9',  drive: 'Compost turn · Sunday garden',  date: '21 Apr · Sun', slot: '08:00–09:30', seats: 10, filled: 7,  kind: 'campus', color: '#F59E0B', emoji: '🍂' },
];

interface EcoHabit {
  id: string;
  habit: string;
  streakWeeks: number;
  co2SavedKg: number;
  detail: string;
  color: string;
  emoji: string;
}

const ECO_HABITS: EcoHabit[] = [
  { id: 'eh-1', habit: 'Carry your own bottle',          streakWeeks: 18, co2SavedKg: 24,  detail: 'About 240 disposable bottles avoided per person this term.', color: '#38BDF8', emoji: '🫙' },
  { id: 'eh-2', habit: 'Walk + transit first',           streakWeeks: 26, co2SavedKg: 140, detail: 'Car rides swapped for metro + walks · track your weeks.',    color: '#A78BFA', emoji: '🚆' },
  { id: 'eh-3', habit: 'Meat-free two days a week',      streakWeeks: 14, co2SavedKg: 62,  detail: 'Two Tuesdays + Fridays · mess has options listed.',          color: '#F472B6', emoji: '🥗' },
  { id: 'eh-4', habit: 'Segregate wet + dry + e-waste',  streakWeeks: 30, co2SavedKg: 18,  detail: 'Three bins on every floor · guide sheet posted.',             color: '#22C55E', emoji: '♻️' },
  { id: 'eh-5', habit: 'Two-minute shower challenge',     streakWeeks: 10, co2SavedKg: 12,  detail: 'Smaller geyser draw · hot-water bill down 22%.',              color: '#38BDF8', emoji: '🚿' },
  { id: 'eh-6', habit: 'Paper-free submissions',         streakWeeks: 12, co2SavedKg: 8,   detail: 'Only three courses still ask for printed copies.',            color: '#F59E0B', emoji: '📄' },
  { id: 'eh-7', habit: 'Second-hand first',              streakWeeks: 6,  co2SavedKg: 14,  detail: 'Gear desk + book swap · cuts new purchases by a lot.',       color: '#FFD166', emoji: '🛒' },
  { id: 'eh-8', habit: 'Adopt one campus tree · a year', streakWeeks: 22, co2SavedKg: 20,  detail: 'Water · mulch · a note when it flowers.',                      color: '#22C55E', emoji: '🌳' },
];

interface TrailMarker {
  id: string;
  name: string;
  distanceKm: number;
  elevationM: number;
  minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
  emoji: string;
}

const TRAIL_MARKERS: TrailMarker[] = [
  { id: 'tr-1', name: 'Sunrise rocks loop',          distanceKm: 1.8, elevationM: 60,  minutes: 35,  difficulty: 'easy',   color: '#22C55E', emoji: '🪨' },
  { id: 'tr-2', name: 'Banyan grove + bench',        distanceKm: 2.4, elevationM: 40,  minutes: 45,  difficulty: 'easy',   color: '#22C55E', emoji: '🌳' },
  { id: 'tr-3', name: 'Pond trail · west',           distanceKm: 3.6, elevationM: 85,  minutes: 65,  difficulty: 'medium', color: '#F59E0B', emoji: '🪷' },
  { id: 'tr-4', name: 'Ridge walk · north',          distanceKm: 4.2, elevationM: 120, minutes: 80,  difficulty: 'medium', color: '#F59E0B', emoji: '🗻' },
  { id: 'tr-5', name: 'Hilltop temple · steep',      distanceKm: 5.0, elevationM: 220, minutes: 110, difficulty: 'hard',   color: '#EF4444', emoji: '⛰️' },
  { id: 'tr-6', name: 'Stream crossing · rocky',     distanceKm: 3.2, elevationM: 95,  minutes: 70,  difficulty: 'medium', color: '#38BDF8', emoji: '💧' },
  { id: 'tr-7', name: 'Butterfly meadow · gentle',   distanceKm: 2.0, elevationM: 20,  minutes: 40,  difficulty: 'easy',   color: '#F472B6', emoji: '🦋' },
  { id: 'tr-8', name: 'Owl-hoot evening loop',       distanceKm: 2.8, elevationM: 55,  minutes: 55,  difficulty: 'easy',   color: '#7E57C2', emoji: '🦉' },
];

// =====================================================
// Phase 3ab: deeper home structures — round 2
// =====================================================

interface CampusRitualHome {
  id: string;
  ritual: string;
  day: string;
  time: string;
  where: string;
  why: string;
  color: string;
  emoji: string;
}

const CAMPUS_RITUALS_HOME: CampusRitualHome[] = [
  { id: 'crh-1', ritual: 'Sunrise walk · silent 10',         day: 'Tue + Fri',    time: '5:55 AM',  where: 'Old banyan gate',      why: 'Wake together without words · listen to the birds decide for us.',       color: '#F59E0B', emoji: '🌅' },
  { id: 'crh-2', ritual: 'Wing mixer · hot chai',             day: 'Wed',          time: '6:30 PM',  where: 'Courtyard kettle',     why: 'Two wings at a time · one shared cup · fifteen quiet minutes.',            color: '#22C55E', emoji: '🍵' },
  { id: 'crh-3', ritual: 'Reading hour · phones face-down',   day: 'Thu',          time: '8:00 PM',  where: 'Library lawn',         why: 'No small talk · one book · one candle · one hour.',                        color: '#A78BFA', emoji: '📖' },
  { id: 'crh-4', ritual: 'Saturday seed-bomb factory',         day: 'Sat',          time: '10:00 AM', where: 'Green shed',            why: '50 seed bombs before lunch · we toss them on the Sunday walk.',            color: '#16A34A', emoji: '🌱' },
  { id: 'crh-5', ritual: 'Sunday slow supper · potluck',       day: 'Sun',          time: '7:30 PM',  where: 'Mess hall · table 4',   why: 'Everyone brings one dish · sit with someone new · no phones.',             color: '#F472B6', emoji: '🍲' },
  { id: 'crh-6', ritual: 'Full-moon poetry · open mic',        day: 'Full moon',    time: '8:45 PM',  where: 'Amphitheatre steps',    why: 'Read a poem you love · or one you wrote · either is welcome.',              color: '#00D4FF', emoji: '🌕' },
  { id: 'crh-7', ritual: 'Monsoon playlist · one speaker',     day: 'First rain',   time: '5:15 PM',  where: 'Verandah step 3',       why: 'First real rain · one speaker · everyone adds one song.',                  color: '#38BDF8', emoji: '🎧' },
];

interface SeasonMoment {
  id: string;
  season: 'spring' | 'monsoon' | 'autumn' | 'winter';
  moment: string;
  detail: string;
  color: string;
  emoji: string;
}

const SEASON_MOMENTS: SeasonMoment[] = [
  { id: 'sm-1',  season: 'spring',  moment: 'Yellow amaltas bloom',               detail: 'Late March · the old gate tree drops gold over the path to the amphitheatre.',                color: '#FFD166', emoji: '🌼' },
  { id: 'sm-2',  season: 'spring',  moment: 'Sapling plant · west-corner',         detail: 'First Saturday of April · 20 saplings go in · one per first-year.',                             color: '#22C55E', emoji: '🌱' },
  { id: 'sm-3',  season: 'monsoon', moment: 'First puddle races',                   detail: 'Paper boats · first real downpour · juniors usually win.',                                       color: '#38BDF8', emoji: '🌧️' },
  { id: 'sm-4',  season: 'monsoon', moment: 'Pakora + poetry night',                detail: 'Mess kitchen opens up · hot pakoras · wet chappals lined up outside.',                            color: '#F59E0B', emoji: '🫕' },
  { id: 'sm-5',  season: 'autumn',  moment: 'Kite day · Sunday tradition',          detail: 'Third Sunday of October · everyone brings a kite · we share the string.',                        color: '#A78BFA', emoji: '🪁' },
  { id: 'sm-6',  season: 'autumn',  moment: 'Leaf-fall photo walk',                  detail: 'Evening light · fallen banyan leaves · one roll of film per person · develop together.',         color: '#F472B6', emoji: '🍂' },
  { id: 'sm-7',  season: 'winter',  moment: 'Bonfire + alumni return',               detail: 'Last Friday of December · old members come home · no speeches · only stories.',                  color: '#EF4444', emoji: '🔥' },
  { id: 'sm-8',  season: 'winter',  moment: 'Fog hike · before sunrise',              detail: 'Early January · flashlights on · no torches needed after the ridge.',                            color: '#60A5FA', emoji: '🌫️' },
];

interface LocalHero {
  id: string;
  name: string;
  role: string;
  story: string;
  learned: string;
  color: string;
  emoji: string;
}

const LOCAL_HEROES: LocalHero[] = [
  { id: 'lh-1', name: 'Ramu chacha',         role: 'Campus gardener · 28 years',          story: 'Plants every tree you walk under · knows each one by flowering week.',                         learned: 'Name every tree · then the tree calls you back.',                color: '#22C55E', emoji: '🌳' },
  { id: 'lh-2', name: 'Sunita didi',         role: 'Mess cook · lifetime member',          story: 'Cooked through every exam season · quietly sets aside a plate for late-night poetry nights.', learned: 'Food is how a place says it loves you.',                          color: '#F59E0B', emoji: '🍲' },
  { id: 'lh-3', name: 'Arun uncle',          role: 'Carpenter · mends every bench',       story: 'Fixes every broken step · never asks who broke it · always uses offcut wood.',                   learned: 'Repair quietly · credit isn\'t the point.',                     color: '#A78BFA', emoji: '🔨' },
  { id: 'lh-4', name: 'Rekha aunty',         role: 'Library keeper',                       story: 'Keeps late-return slips in her drawer forever · has read every book twice.',                     learned: 'Patience is a form of teaching.',                                color: '#00D4FF', emoji: '📚' },
  { id: 'lh-5', name: 'Mahesh bhaiya',       role: 'Night guard · storyteller',            story: 'Walks the full perimeter at 2 AM · always has a joke when we sneak out to the lawn.',           learned: 'Kindness and duty can share the same uniform.',                  color: '#F472B6', emoji: '🛡️' },
  { id: 'lh-6', name: 'Lata aunty',          role: 'Tea-stall founder · corner gate',      story: 'Thirty years of chai · half the lessons on this campus happened on her plastic stools.',        learned: 'The best classrooms don\'t look like classrooms.',              color: '#FFD166', emoji: '🍵' },
];

interface GuardianHabit {
  id: string;
  habit: string;
  details: string;
  streak: number;
  cadence: 'daily' | 'weekly' | 'monthly';
  color: string;
  emoji: string;
}

const GUARDIAN_HABITS: GuardianHabit[] = [
  { id: 'gh-1',  habit: 'Pick up one piece of plastic per day',            details: 'From the path you walked in on · takes 6 seconds · worth more than it sounds.',             streak: 42, cadence: 'daily',   color: '#22C55E', emoji: '🚯' },
  { id: 'gh-2',  habit: 'Refill · don\'t buy',                              details: 'Carry a bottle · the coolers near mess + library are filtered.',                                streak: 70, cadence: 'daily',   color: '#38BDF8', emoji: '💧' },
  { id: 'gh-3',  habit: 'Two-minute tidy · shared spaces',                  details: 'Leave the lounge better than you found it · two minutes is enough.',                           streak: 28, cadence: 'daily',   color: '#F472B6', emoji: '🪴' },
  { id: 'gh-4',  habit: 'Write one postcard · hand-delivered',              details: 'Once a week · to a member you haven\'t said thanks to yet.',                                  streak: 9,  cadence: 'weekly',  color: '#FFD166', emoji: '✉️' },
  { id: 'gh-5',  habit: 'Read one thing outside your wing',                  details: 'One article · one poem · one repo · a brain needs cross-winds.',                                streak: 12, cadence: 'weekly',  color: '#A78BFA', emoji: '📚' },
  { id: 'gh-6',  habit: 'Sapling check-in · the tree you planted',           details: 'Visit it · water if dry · note how it changed · tag it in the digest.',                        streak: 4,  cadence: 'monthly', color: '#16A34A', emoji: '🌱' },
  { id: 'gh-7',  habit: 'Mentor a first-year · 30 minutes',                  details: 'Coffee · bench · no agenda · ask more than you answer.',                                        streak: 3,  cadence: 'monthly', color: '#00D4FF', emoji: '🤝' },
  { id: 'gh-8',  habit: 'Power-down Sundays',                                details: 'All-club shared rest day · no posts · no DMs · unless it\'s a poem or a photo.',              streak: 15, cadence: 'weekly',  color: '#EF4444', emoji: '📴' },
];

interface ClubValue {
  id: string;
  value: string;
  oneLine: string;
  livesAs: string;
  color: string;
  emoji: string;
}

const CLUB_VALUES: ClubValue[] = [
  { id: 'cv-1', value: 'Care first · then craft',               oneLine: 'No one ships hurt.',                                 livesAs: 'Pair rule · critique is feedback on pages, never on people.',                   color: '#F472B6', emoji: '🫶' },
  { id: 'cv-2', value: 'Quiet excellence',                        oneLine: 'Loud is not the same as good.',                     livesAs: 'We don\'t announce what we haven\'t delivered.',                                  color: '#00D4FF', emoji: '🪞' },
  { id: 'cv-3', value: 'Small consistent acts',                  oneLine: 'Ten consistent days > one loud night.',               livesAs: 'Weekly digests · weekly retros · weekly walks · over 7 years.',                color: '#22C55E', emoji: '🌱' },
  { id: 'cv-4', value: 'Leave it greener',                        oneLine: 'The place should miss you · not be tired of you.',    livesAs: 'Sapling per drive · reusable mugs · no single-use merch.',                     color: '#16A34A', emoji: '🌿' },
  { id: 'cv-5', value: 'Everyone\'s first story',                  oneLine: 'The first poem · the first PR · the first talk.',     livesAs: 'Open mic first slot is always a first-timer · we start with them.',            color: '#FFD166', emoji: '✨' },
  { id: 'cv-6', value: 'The door stays open',                     oneLine: 'You can leave and still belong.',                    livesAs: 'Alumni chai on the first Friday · pause paths · return paths · no guilt.',      color: '#A78BFA', emoji: '🚪' },
];

interface WeeklyFocus {
  id: string;
  week: string;
  theme: string;
  anchor: string;
  color: string;
  emoji: string;
}

const WEEKLY_FOCUSES: WeeklyFocus[] = [
  { id: 'wf-1', week: 'This week',      theme: 'Ship small · ship often',               anchor: 'Every wing ships one small thing · no matter how tiny.',                            color: '#00D4FF', emoji: '🚢' },
  { id: 'wf-2', week: 'Next week',      theme: 'Crit with love',                         anchor: 'Open crit Fridays · three pieces per wing · two kind specific notes each.',        color: '#F472B6', emoji: '🪞' },
  { id: 'wf-3', week: 'Week + 2',       theme: 'Clean desk · clear cache',               anchor: 'Tidy your shared folders · archive what\'s done · name what\'s open.',            color: '#A78BFA', emoji: '🗄️' },
  { id: 'wf-4', week: 'Week + 3',       theme: 'Green drive',                             anchor: 'Plant · pick · pair · one action each before Sunday.',                              color: '#22C55E', emoji: '🌱' },
  { id: 'wf-5', week: 'Week + 4',       theme: 'Cross-wing pair day',                    anchor: 'Pair with someone from another wing · tiny task · one story each.',                 color: '#FFD166', emoji: '🤝' },
  { id: 'wf-6', week: 'Week + 5',       theme: 'Write what you learned',                 anchor: 'One paragraph · one wing · goes into the weekly digest.',                            color: '#F59E0B', emoji: '✍️' },
  { id: 'wf-7', week: 'Week + 6',       theme: 'Rest + reset',                            anchor: 'Sunday off · nothing shipped · digital-off Saturday · reading Sunday.',             color: '#EF4444', emoji: '🌙' },
];

// =====================================================
// Phase 3ai: deeper home structures — round 3
// =====================================================

interface MorningPulseItem {
  id: string;
  title: string;
  detail: string;
  hint: string;
  color: string;
  emoji: string;
}

const MORNING_PULSES: MorningPulseItem[] = [
  { id: 'mp-1', title: 'Sunrise · 6:02 AM',            detail: 'Dawn chorus from the banyan · 14 bird species logged this week.',         hint: 'Walk quietly past the gate · they notice.',                color: '#F59E0B', emoji: '🌅' },
  { id: 'mp-2', title: 'Wake nudge · 6:30 AM',           detail: 'Kettle on in the courtyard · two wings rotate duty · chai for twenty.',   hint: 'Bring a mug · leave it washed.',                             color: '#D4AF37', emoji: '🍵' },
  { id: 'mp-3', title: 'Stretch circle · 6:45 AM',       detail: 'Ten minutes · old banyan shade · no music · just breath.',                    hint: 'Back-bends for the spine · neck rolls for the phone necks.', color: '#22C55E', emoji: '🧘' },
  { id: 'mp-4', title: 'Green sweep · 7:00 AM',          detail: 'Two people · bin to bin · litter audit logged in #green-signals.',          hint: 'Gloves by the shed · log weight on the scale.',              color: '#16A34A', emoji: '🧹' },
  { id: 'mp-5', title: 'Breakfast mingle · 7:30 AM',     detail: 'Mess hall · no phones rule · sit with someone from another wing.',           hint: 'Extra filter coffee today · Sunita didi\'s batch.',           color: '#F472B6', emoji: '🫖' },
  { id: 'mp-6', title: 'Study circle · 8:00 AM',          detail: 'Library lawn · silent hour · rule is one book · no screens.',               hint: 'Sit on the stone bench side · quieter corner.',              color: '#A78BFA', emoji: '📖' },
];

interface GratitudeWall {
  id: string;
  name: string;
  to: string;
  line: string;
  day: string;
  color: string;
  emoji: string;
}

const GRATITUDE_WALL: GratitudeWall[] = [
  { id: 'gw-1', name: 'Riya P.',     to: 'Sameer M.',          line: 'Reviewed my PR at 11 PM so it could go out Monday · legend.',            day: 'Tuesday',       color: '#00D4FF', emoji: '🛰️' },
  { id: 'gw-2', name: 'Arnav G.',    to: 'Zara S. · alumnus',  line: 'Three-line note on my reel cuts saved me two days of guessing.',        day: 'Wednesday',     color: '#A78BFA', emoji: '🎞️' },
  { id: 'gw-3', name: 'Kavya I.',    to: 'Priya N. · alumna',  line: 'The voice-note feedback made me rewrite my opener · it finally sings.',   day: 'Friday',        color: '#F59E0B', emoji: '📝' },
  { id: 'gw-4', name: 'Nila T.',     to: 'Ananya R. · alumna', line: 'Crit on my poster · no sugar · I ended up doing four more variants.',   day: 'Saturday',      color: '#F472B6', emoji: '🎨' },
  { id: 'gw-5', name: 'Meera V.',    to: 'Arjun K. · alumnus', line: 'Walked me through metering the last light at the grove · perfect now.', day: 'Sunday',        color: '#22C55E', emoji: '📷' },
  { id: 'gw-6', name: 'Tanish C.',   to: 'Dev P. · alumnus',   line: 'Connected me to the campus paper · first byline dropping this week.',    day: 'Monday',        color: '#FFD166', emoji: '📰' },
  { id: 'gw-7', name: 'Whole club',  to: 'Ramu chacha',        line: 'Planted the twelve-thousandth sapling with us · patience has a face.',    day: 'Sunday',        color: '#16A34A', emoji: '🌳' },
];

interface CarbonSavingTile {
  id: string;
  label: string;
  thisMonth: string;
  cumulative: string;
  method: string;
  color: string;
  emoji: string;
}

const CARBON_SAVINGS: CarbonSavingTile[] = [
  { id: 'cs-1', label: 'Single-use plastic avoided',            thisMonth: '34 kg',           cumulative: '2,880 kg · 2 yrs', method: 'Refill stations · steel bottles · daily audit by green captains.',      color: '#22C55E', emoji: '🧴' },
  { id: 'cs-2', label: 'Paper printed saved',                   thisMonth: '142 reams',        cumulative: '18,430 reams',     method: 'Design system forces digital-first · print only with approval.',           color: '#F59E0B', emoji: '📄' },
  { id: 'cs-3', label: 'Event carbon offset',                   thisMonth: '0.8 tCO₂',         cumulative: '26.4 tCO₂',        method: 'Vendors scored on distance · leftover food donated · bike incentives.',  color: '#16A34A', emoji: '🌍' },
  { id: 'cs-4', label: 'Food waste cut',                         thisMonth: '41 kg',             cumulative: '6,120 kg',         method: 'Weighed post-event · mess feedback loop · portion tuning monthly.',        color: '#F472B6', emoji: '🍲' },
  { id: 'cs-5', label: 'Electricity saved vs baseline',           thisMonth: '620 kWh',          cumulative: '48,000 kWh',       method: 'LED retrofit · solar socket stack · timer-based workshop lights.',          color: '#FFD166', emoji: '💡' },
  { id: 'cs-6', label: 'Trees planted · survival 92%',            thisMonth: '140',               cumulative: '12,400',            method: 'Native species only · survival audit every six months by photo logs.',     color: '#22C55E', emoji: '🌳' },
];

interface PledgeStreakRow {
  id: string;
  pledge: string;
  streakDays: number;
  keptToday: number;
  total: number;
  color: string;
  emoji: string;
}

const PLEDGE_STREAKS: PledgeStreakRow[] = [
  { id: 'ps-1', pledge: 'Carry a steel bottle',                  streakDays: 184, keptToday: 198, total: 210, color: '#22C55E', emoji: '💧' },
  { id: 'ps-2', pledge: 'One tree photo a week',                  streakDays: 96,  keptToday: 168, total: 210, color: '#16A34A', emoji: '📷' },
  { id: 'ps-3', pledge: 'Walk/cycle within 2 km',                  streakDays: 212, keptToday: 186, total: 210, color: '#F59E0B', emoji: '🚲' },
  { id: 'ps-4', pledge: 'No single-use cutlery',                   streakDays: 140, keptToday: 174, total: 210, color: '#F472B6', emoji: '🍴' },
  { id: 'ps-5', pledge: 'Refuse print · unless needed',              streakDays: 278, keptToday: 190, total: 210, color: '#A78BFA', emoji: '📄' },
  { id: 'ps-6', pledge: 'Compost mess scraps · weekly rota',         streakDays: 162, keptToday: 180, total: 210, color: '#22C55E', emoji: '🍃' },
  { id: 'ps-7', pledge: 'Phone-off dinners',                        streakDays: 88,  keptToday: 154, total: 210, color: '#FFD166', emoji: '🫂' },
];

interface QuietHourSlot {
  id: string;
  range: string;
  where: string;
  rule: string;
  host: string;
  color: string;
  emoji: string;
}

const QUIET_HOURS: QuietHourSlot[] = [
  { id: 'qh-1', range: '5:45 – 6:45 AM', where: 'Old banyan grove',        rule: 'Walking only · no phones · greet without speaking.',                       host: 'Rotating wing lead',    color: '#F59E0B', emoji: '🌅' },
  { id: 'qh-2', range: '12:30 – 1:30 PM', where: 'Library quiet wing',       rule: 'Reading only · no typing · phones to the rack at the door.',             host: 'Library volunteer',      color: '#A78BFA', emoji: '📚' },
  { id: 'qh-3', range: '4:30 – 5:30 PM', where: 'Green shed',              rule: 'Hands-work only · gardening · no meetings · no phones.',                 host: 'Ramu chacha',             color: '#22C55E', emoji: '🌿' },
  { id: 'qh-4', range: '8:00 – 9:00 PM', where: 'Amphitheatre steps',       rule: 'Reading + journaling · one candle · no phones · leave by 9.',            host: 'Alumni rotation',        color: '#FFD166', emoji: '🕯️' },
  { id: 'qh-5', range: '10:00 – 10:30 PM', where: 'Roof garden',             rule: 'Stargazing · silent · no torches · red-filter lights only.',             host: 'Astronomy circle',       color: '#60A5FA', emoji: '🌌' },
  { id: 'qh-6', range: '11:00 – 11:30 PM', where: 'Dorm corridor · A-block',  rule: 'Lights out · whisper-only · rule enforced kindly by the seniors.',         host: 'Warden + senior',        color: '#6366F1', emoji: '🌙' },
];

interface PlantingDiary {
  id: string;
  species: string;
  location: string;
  plantedOn: string;
  guardian: string;
  status: string;
  color: string;
  emoji: string;
}

const PLANTING_DIARY: PlantingDiary[] = [
  { id: 'pd-1', species: 'Neem · Azadirachta indica',           location: 'West fence · row 3',      plantedOn: 'Jul 2023',    guardian: 'Kavya + first-years · batch 24',   status: 'Healthy · 2.1 m tall',   color: '#22C55E', emoji: '🌳' },
  { id: 'pd-2', species: 'Peepal · Ficus religiosa',             location: 'Courtyard centre',        plantedOn: 'Aug 2022',    guardian: 'Riya + Ramu chacha',                status: 'Thriving · bird visit log',  color: '#16A34A', emoji: '🌿' },
  { id: 'pd-3', species: 'Amaltas · Cassia fistula',             location: 'Amphitheatre edge',      plantedOn: 'Mar 2022',    guardian: 'Nila · design wing',                 status: 'Bloomed March 2024',       color: '#FFD166', emoji: '🌼' },
  { id: 'pd-4', species: 'Gulmohar · Delonix regia',             location: 'Gate approach · north',    plantedOn: 'Jun 2021',    guardian: 'Sameer + tech wing',                 status: 'Bloomed May 2024 · first time', color: '#EF4444', emoji: '🌺' },
  { id: 'pd-5', species: 'Banyan sapling · Ficus benghalensis', location: 'Old grove extension',   plantedOn: 'Sep 2023',    guardian: 'Alumni batch 2017',                  status: 'Aerial roots starting',    color: '#22C55E', emoji: '🌳' },
  { id: 'pd-6', species: 'Mango · Mangifera indica',             location: 'Mess garden · south bed',   plantedOn: 'Jul 2022',    guardian: 'Sunita didi + mess team',             status: 'First fruit summer 2025',  color: '#F59E0B', emoji: '🥭' },
  { id: 'pd-7', species: 'Jamun · Syzygium cumini',               location: 'Library lawn · back',       plantedOn: 'Aug 2021',    guardian: 'Photo wing · class of 2023',          status: 'Fruits attracting barbets', color: '#6366F1', emoji: '🫐' },
];

interface GuardianCovenant {
  id: string;
  promise: string;
  because: string;
  color: string;
  emoji: string;
}

const GUARDIAN_COVENANTS: GuardianCovenant[] = [
  { id: 'gc-1', promise: 'We leave every place greener than we found it.',                           because: 'Even if the mess was not ours · the next walker thanks us.',                          color: '#22C55E', emoji: '🌿' },
  { id: 'gc-2', promise: 'We credit the alumni who opened the door.',                                 because: 'Names matter · especially when they are not in the room.',                              color: '#FFD166', emoji: '🫶' },
  { id: 'gc-3', promise: 'We share tools · we do not hoard logins.',                                  because: 'Knowledge that one person guards dies with that person.',                              color: '#00D4FF', emoji: '🔑' },
  { id: 'gc-4', promise: 'We name the junior who helped · before the senior who approved.',         because: 'Credit flows downward · responsibility flows upward.',                                color: '#F472B6', emoji: '📣' },
  { id: 'gc-5', promise: 'We say no kindly · early · clearly.',                                       because: 'A late no is more expensive than an early no.',                                         color: '#F59E0B', emoji: '🪶' },
  { id: 'gc-6', promise: 'We prefer small · shipped · honest work over big · unshipped · perfect.',   because: 'The club\'s strength is its steady drumbeat.',                                        color: '#A78BFA', emoji: '🥁' },
  { id: 'gc-7', promise: 'We keep the grove · always.',                                               because: 'The trees were here before us · will be here after · we are only caretakers.',          color: '#16A34A', emoji: '🌳' },
];

// =====================================================
// Phase 3ao: deeper home structures — round 4
// =====================================================

interface HomeDailyBeacon {
  id: string;
  slot: string;
  beacon: string;
  intention: string;
  color: string;
  emoji: string;
}

const HOME_DAILY_BEACONS: HomeDailyBeacon[] = [
  { id: 'hdb-1', slot: '05:30 · predawn',     beacon: 'Forest wake',                intention: 'Birds before people · walk with one breath per step · notice three trees.',            color: '#22C55E', emoji: '🌄' },
  { id: 'hdb-2', slot: '07:00 · sunrise',      beacon: 'Grove loop',                 intention: 'Ten-minute loop · water one sapling · nod to the gardener · nothing to prove.',        color: '#F59E0B', emoji: '☀️' },
  { id: 'hdb-3', slot: '10:30 · morning',       beacon: 'Desk check-in',             intention: 'One true line on the shared board · three deep-work blocks · no heroics.',             color: '#00D4FF', emoji: '💼' },
  { id: 'hdb-4', slot: '13:00 · midday',        beacon: 'Slow lunch',                intention: 'Eat slowly · away from the screen · one real conversation · no Slack.',                color: '#F472B6', emoji: '🍲' },
  { id: 'hdb-5', slot: '16:00 · afternoon',      beacon: 'Garden break',               intention: 'Ten-minute weed · two-minute water · hands in soil · mind returns.',                   color: '#16A34A', emoji: '🪴' },
  { id: 'hdb-6', slot: '19:30 · evening',         beacon: 'Lamp-light read',            intention: 'Lamp · one page of something old · tea · phone on the other room\'s shelf.',            color: '#A78BFA', emoji: '📖' },
  { id: 'hdb-7', slot: '22:00 · night',            beacon: 'Stargaze',                    intention: 'Roof · blanket · look up for five minutes · remember how small today was.',               color: '#FFD166', emoji: '🌌' },
];

interface HomeSeasonalRitual {
  id: string;
  season: string;
  ritual: string;
  tokens: string;
  keeper: string;
  color: string;
  emoji: string;
}

const HOME_SEASONAL_RITUALS: HomeSeasonalRitual[] = [
  { id: 'hsr-1', season: 'Spring · Vasant',      ritual: 'Open-sowing day · 2000 saplings handed out with letters from alumni.',                    tokens: 'Terracotta pot · handwritten letter · one sapling · one song.',      keeper: 'Green wing · Rehan',     color: '#22C55E', emoji: '🌸' },
  { id: 'hsr-2', season: 'Summer · Grishma',       ritual: 'Campus cooling walk · shade-map audit · water dispenser refills around campus.',           tokens: 'Neem garland · a bottle of mitti-cooled water · a paper fan.',          keeper: 'Ops · Nidhi',             color: '#F59E0B', emoji: '🌞' },
  { id: 'hsr-3', season: 'Monsoon · Varsha',         ritual: 'Rain bonfire inside the atrium · wet hair · chai · open mic for memories from the year.', tokens: 'A puddle photo · a damp marigold · a cup of ginger chai · one read-aloud.', keeper: 'Community · Meera',       color: '#00D4FF', emoji: '🌧️' },
  { id: 'hsr-4', season: 'Autumn · Sharad',            ritual: 'Leaf-fall walk · collect a dry leaf · press it in a shared book · add a sentence of the year.', tokens: 'Pressed leaf · typed sentence · one archive entry · one thank-you.',  keeper: 'Content · Priya',          color: '#FFD166', emoji: '🍂' },
  { id: 'hsr-5', season: 'Pre-winter · Hemant',          ritual: 'Sweater drive · alumni send warm things back to campus · students pick what fits.',         tokens: 'Alumni sweater · handwritten thank-you · a photograph pinned up.',    keeper: 'Alumni · Kabir',            color: '#F472B6', emoji: '🧣' },
  { id: 'hsr-6', season: 'Winter · Shishir',               ritual: 'Library lantern nights · shared reading · soft music · quiet writing alongside.',             tokens: 'Lantern · a shared poem · one soft blanket · hot cocoa in clay cups.',  keeper: 'Library · elders',          color: '#A78BFA', emoji: '🕯️' },
  { id: 'hsr-7', season: 'Late winter · Shishiranta',      ritual: 'New-year letter · write to last-year you · open the letter kept from two years ago.',           tokens: 'One letter · one envelope · one seal · one hidden truth between.',   keeper: 'Everyone · self',             color: '#EF4444', emoji: '✉️' },
];

interface HomeCampusGrove {
  id: string;
  tree: string;
  ageYears: string;
  planter: string;
  story: string;
  color: string;
  emoji: string;
}

const HOME_CAMPUS_GROVES: HomeCampusGrove[] = [
  { id: 'hcg-1', tree: 'Banyan by the library',          ageYears: '~78 years',   planter: 'Grandmother Leela · founding librarian',  story: 'Reading room was built around it · we kept the arch low to honour the roots.',             color: '#16A34A', emoji: '🌳' },
  { id: 'hcg-2', tree: 'Neem beside the tuck shop',        ageYears: '~42 years',   planter: 'Class of 1982 · farewell ritual',           story: 'Graduating batches pin one letter each year · the bark holds a decade of stories.',           color: '#22C55E', emoji: '🌿' },
  { id: 'hcg-3', tree: 'Tamarind near the sports field',    ageYears: '~55 years',   planter: 'Coach Rahim · for summer shade',             story: 'Before every tournament · team sits under it · a quiet circle · no pep talks.',                color: '#F59E0B', emoji: '🌱' },
  { id: 'hcg-4', tree: 'Gulmohar at the gate',                ageYears: '~31 years',   planter: 'Class of 1995 · convocation plant',           story: 'Flowers every May · we photograph alumni returning under it · the gate itself is an event.',  color: '#EF4444', emoji: '🌺' },
  { id: 'hcg-5', tree: 'Peepal near the dorm',                 ageYears: '~65 years',   planter: 'Temple priest Raghavanji',                      story: 'Dorms keep a window open toward it · freshers are walked past it on first day.',              color: '#A78BFA', emoji: '🍃' },
  { id: 'hcg-6', tree: 'Ashoka along the walkway',              ageYears: '~22 years',   planter: 'Class of 2004 · sustainability week',            story: 'A long line of them · we prune gently · the walk under it is the longest in campus.',        color: '#F472B6', emoji: '🌲' },
  { id: 'hcg-7', tree: 'Fig behind the mess',                     ageYears: '~48 years',   planter: 'Gardener Anand-ji · quiet initiative',            story: 'Birds more than fruit · mornings · we\'re told · listen for the little ones before sunrise.',    color: '#FFD166', emoji: '🌾' },
];

interface HomeKindlingKit {
  id: string;
  kit: string;
  contents: string;
  useWhen: string;
  learning: string;
  color: string;
  emoji: string;
}

const HOME_KINDLING_KITS: HomeKindlingKit[] = [
  { id: 'hkk-1', kit: 'First-day buddy kit',               contents: 'Campus map · a fold with first-7-days · a phone list · a chai coupon · an alumni letter.',                       useWhen: 'Day one · every new member · given by a senior · not left on a desk.',                  learning: 'The club feels like a person · not an app · from minute one.',                             color: '#F59E0B', emoji: '🎒' },
  { id: 'hkk-2', kit: 'Night-owl warmth kit',                contents: 'A thermos of chai · a small lamp · a chocolate bar · earplugs · a thank-you note · a two-minute break card.',  useWhen: 'Late nights before deadlines · on the shared desk · for whoever stayed.',                learning: 'We reward staying · we honour going home too · both are allowed.',                          color: '#A78BFA', emoji: '🔦' },
  { id: 'hkk-3', kit: 'Rainy-day comfort kit',                 contents: 'Small towels · ginger-tea sachet · dry kurta · tissue pack · a book of short stories.',                         useWhen: 'Monsoon walk-ins · reception desk · first-come · no sign-ins.',                           learning: 'Weather is not an obstacle · it is part of what we do.',                                     color: '#00D4FF', emoji: '☂️' },
  { id: 'hkk-4', kit: 'Stage-fright calm kit',                  contents: 'Water · lozenges · a small quote card · earphones with two-minute calm track · a grounding-squeeze ball.',   useWhen: 'Backstage · 10 minutes before a speaker walks on · handed by the MC.',                    learning: 'Anxiety is normal · kit-first · feeling-second · stage is last.',                           color: '#F472B6', emoji: '🎤' },
  { id: 'hkk-5', kit: 'Exam-week keep-going kit',                contents: 'Nuts · fruits · a playlist card · a walk-map · alumni "you will survive this" letter · 5-minute yoga card.', useWhen: 'Exam week · library entrance · pickable · self-refilled by alumni.',                       learning: 'We were held · we hold · it is how the batch after us passes.',                             color: '#22C55E', emoji: '🍎' },
  { id: 'hkk-6', kit: 'Post-event thank-you kit',                 contents: 'Folded card · tea sachet · sticker · alumni-written "you showed up" note · photo strip after recap.',          useWhen: 'Day after a big event · ops table · every volunteer takes one.',                           learning: 'We close the loop · volunteers are not forgotten · gratitude has a shelf.',                  color: '#FFD166', emoji: '🎁' },
  { id: 'hkk-7', kit: 'Leaving-campus kit',                         contents: 'Alumni-badge · a campus-fig-leaf · handwritten council letter · a sapling in a pot · one photo from day one.', useWhen: 'Convocation day · doorway · before the family photo.',                                     learning: 'Leaving is not losing · the grove remembers · you carry a cutting.',                        color: '#EF4444', emoji: '📦' },
];

interface HomeQuietWin {
  id: string;
  win: string;
  quiet: string;
  who: string;
  color: string;
  emoji: string;
}

const HOME_QUIET_WINS: HomeQuietWin[] = [
  { id: 'hqw-1', win: 'Someone stayed back to help a junior debug · past midnight · with no fanfare.',            quiet: 'No slack message · just quiet · the junior passed exam · the senior never mentioned it.',   who: 'Senior dev · 2023 batch · unnamed on purpose',      color: '#00D4FF', emoji: '🫱' },
  { id: 'hqw-2', win: 'A graphic designer redid the alumni poster · at 3 AM · because she noticed a typo.',       quiet: 'The next-morning version was better · she deleted her "sorry" message · it was already fine.', who: 'GD member · 2024 batch · caught a typo',           color: '#F472B6', emoji: '🖌️' },
  { id: 'hqw-3', win: 'The photo wing quietly printed 14 frames of the last event · pinned on the library wall.',  quiet: 'No post · no announcement · alumni noticed · smiled · walked past · said thank you in person.', who: 'Photo wing · anonymous curator',                   color: '#22C55E', emoji: '🖼️' },
  { id: 'hqw-4', win: 'Someone rewrote the onboarding doc · clearer · kinder · now juniors don\'t get lost.',       quiet: 'They slipped it into the shared drive · didn\'t announce · we noticed through the joy of the juniors.', who: 'Web wing · care-first junior',                   color: '#F59E0B', emoji: '📘' },
  { id: 'hqw-5', win: 'A PR lead declined a pitch that would have hurt a small venue · quietly · kindly.',          quiet: 'A one-line email · respectful · the venue sent a thank-you card a month later.',             who: 'PR lead · quiet dissent',                          color: '#FFD166', emoji: '✉️' },
  { id: 'hqw-6', win: 'The ops team fixed the hall AC the day before an event · at midnight · with their own tools.', quiet: 'The speakers never knew · the audience smiled · the ops team was asleep by the time we thanked them.', who: 'Ops · late-night team',                     color: '#EF4444', emoji: '🛠️' },
  { id: 'hqw-7', win: 'An alumna flew in · paid her own ticket · to mentor juniors on a Saturday.',                   quiet: 'She left the same night · didn\'t ask for recognition · left one handwritten card in the council mailbox.', who: 'Alumna · 2019 batch · distance no barrier',    color: '#A78BFA', emoji: '✈️' },
];

interface HomeFounderNote {
  id: string;
  year: string;
  excerpt: string;
  writer: string;
  color: string;
  emoji: string;
}

const HOME_FOUNDER_NOTES: HomeFounderNote[] = [
  { id: 'hfn-1', year: '1998', excerpt: 'We started with four chairs · one broken table · and a plan that was mostly a wish. I remember writing "we will be kind first" on the back of a book cover. It is the thing I am still proudest of.', writer: 'Shreya R. · co-founder',          color: '#F59E0B', emoji: '🪑' },
  { id: 'hfn-2', year: '2003', excerpt: 'The first grove day · sixty saplings · a storm cloud · nobody left. We planted in the rain · because waiting felt wrong. The grove that came up was the crookedest · most alive thing I have ever seen grow.', writer: 'Arjun M. · founding tree-keeper', color: '#22C55E', emoji: '🌳' },
  { id: 'hfn-3', year: '2008', excerpt: 'We started refusing sponsors who wanted to speak from stage about themselves. It lost us a year of budget. It bought us a decade of trust. I still think about that trade every August.', writer: 'Priya N. · council chair',         color: '#00D4FF', emoji: '🤝' },
  { id: 'hfn-4', year: '2014', excerpt: 'A junior cried backstage before her first talk. I sat with her for 20 minutes. She went on. The room stood up. That was the moment I knew the club had become something larger than any of us.', writer: 'Meera V. · mentor',               color: '#F472B6', emoji: '🎤' },
  { id: 'hfn-5', year: '2019', excerpt: 'The reunion weekend · 200 alumni · we had planned for 50. The hall was too small. We moved outside · under the banyan. It was the first time I saw the tree as a venue · and I cried a little.', writer: 'Rehan K. · alumni lead',          color: '#A78BFA', emoji: '🌳' },
  { id: 'hfn-6', year: '2022', excerpt: 'Came back post-covid · the grove had grown four feet in two years. Nobody tended it much. Nature did its thing. I learned to trust the club the way we trust the grove. It grows even when we are distracted.', writer: 'Kabir S. · returning council',   color: '#FFD166', emoji: '🌱' },
  { id: 'hfn-7', year: '2025', excerpt: 'Watched a first-year teach a fresher how to mount a poster · the way I had taught her · the way someone had taught me. Three generations in one gesture. The grove grows by passing a thing on · gently.', writer: 'Nidhi P. · incumbent lead',   color: '#EF4444', emoji: '🪔' },
];

// =====================================================
// Phase 3at: deeper home structures — round 5
// =====================================================

interface HomeDawnRitual {
  id: string;
  name: string;
  window: string;
  practice: string;
  color: string;
  emoji: string;
}

const HOME_DAWN_RITUALS: HomeDawnRitual[] = [
  { id: 'hdr-1', name: 'Sapling check · first hour',            window: '6:30–7:30 AM · Mon–Fri',       practice: 'Two members walk the grove · water new saplings · write one line in the log.',                color: '#22C55E', emoji: '🌿' },
  { id: 'hdr-2', name: 'Quiet desk · before the rush',             window: '7:00–8:00 AM · daily',           practice: 'Anyone can sit · no talking · no laptops · just notebooks · tea in the corner.',                    color: '#00D4FF', emoji: '📓' },
  { id: 'hdr-3', name: 'Bird log · birdsong count',                  window: '6:45–7:15 AM · weekends',           practice: 'Count species heard in 30 min · photo if possible · post to community board.',                         color: '#A78BFA', emoji: '🐦' },
  { id: 'hdr-4', name: 'Fresh-water refill run',                         window: '7:15 AM · daily',                     practice: 'Refill the two water coolers · clean the filters · replace paper cups with the steel rack.',              color: '#F472B6', emoji: '🚰' },
  { id: 'hdr-5', name: 'Reading hour · before class',                        window: '7:30–8:30 AM · Mon/Wed/Fri',            practice: 'One member reads aloud from a shared book · 20 min · followed by 20 min silent reading.',                      color: '#FFD166', emoji: '📖' },
  { id: 'hdr-6', name: 'Mentor office hour · walk-in',                             window: '8:00–9:00 AM · Tue/Thu',                       practice: 'Open-door · any member · any question · 15-min slots · coffee provided.',                                          color: '#F59E0B', emoji: '🪑' },
  { id: 'hdr-7', name: 'Morning roll-call · light check-in',                              window: '9:00 AM · daily',                                   practice: 'One-word check-in · weather report · one thing you are looking forward to today.',                                     color: '#EF4444', emoji: '🌅' },
];

interface HomeDuskRitual {
  id: string;
  name: string;
  window: string;
  practice: string;
  color: string;
  emoji: string;
}

const HOME_DUSK_RITUALS: HomeDuskRitual[] = [
  { id: 'hdk-1', name: 'Sunset pause · all screens off',              window: '6:00 PM · daily',                  practice: 'Five minutes · anyone walking out can pause · watch the sky · not required · open to all.',                  color: '#F59E0B', emoji: '🌅' },
  { id: 'hdk-2', name: 'Close-up of the grove',                          window: '6:30 PM · Sun–Thu',                 practice: 'Walk the grove · check for pest damage · water if soil dry · lock the back gate.',                             color: '#22C55E', emoji: '🌳' },
  { id: 'hdk-3', name: 'Newspaper of the day · read aloud',                    window: '7:00–7:30 PM · Tue/Thu',              practice: 'One headline · one editorial · one positive story · discussion 10 min · tea after.',                                  color: '#00D4FF', emoji: '📰' },
  { id: 'hdk-4', name: 'Thank-you writing',                                         window: '7:30 PM · Fri',                         practice: 'Write a 3-line thank-you to someone from the week · post card · or hand-delivered next day.',                                color: '#F472B6', emoji: '💌' },
  { id: 'hdk-5', name: 'Silence before sleep · campus wide',                              window: '9:00 PM · daily',                        practice: 'Ten minutes · lights low · music off · a shared silence that settles the club.',                                                color: '#A78BFA', emoji: '🌙' },
  { id: 'hdk-6', name: 'Night-walk home · buddy rule',                                          window: '9:30–10:00 PM · daily',                       practice: 'No one walks back alone · buddies assigned by rotating list · routes checked for light + safety.',                          color: '#FFD166', emoji: '🫱' },
  { id: 'hdk-7', name: 'Log of the day · one line',                                                  window: '10:00 PM · daily',                                  practice: 'Council member writes one line in the day-log · what happened · what mattered · what to remember.',                              color: '#EF4444', emoji: '📔' },
];

interface HomeMicroMoment {
  id: string;
  moment: string;
  where: string;
  whenYouNotice: string;
  color: string;
  emoji: string;
}

const HOME_MICRO_MOMENTS: HomeMicroMoment[] = [
  { id: 'hmm-1', moment: 'The jasmine flowers at the side gate',                   where: 'Side gate · near the workshop shed',                         whenYouNotice: 'Late Feb to April · strongest after 4 PM · a short walk past them changes the hour.',                    color: '#F472B6', emoji: '🌸' },
  { id: 'hmm-2', moment: 'The old fan creak in room 204',                                 where: 'Room 204 · third fan from the door',                                whenYouNotice: 'June heat · between 2 and 3 PM · it keeps time better than the clock.',                                            color: '#F59E0B', emoji: '🌀' },
  { id: 'hmm-3', moment: 'The cricket chirp at the lawn edge',                                      where: 'Back lawn · under the gulmohar tree',                                     whenYouNotice: 'Early monsoon · 7 PM onward · it returns every year · one of our oldest residents.',                                  color: '#22C55E', emoji: '🦗' },
  { id: 'hmm-4', moment: 'The bell from the nearby temple',                                                  where: 'From the east boundary wall',                                                    whenYouNotice: 'Every morning at 7 AM · carries through if the wind is from the east · marks the start of the grove walk.',                 color: '#00D4FF', emoji: '🔔' },
  { id: 'hmm-5', moment: 'The paper-plane shadow on the library wall',                                                 where: 'South-facing window · library annex',                                                        whenYouNotice: 'Between 11 AM and 1 PM · on clear days · from the window grille · it looks like a bird flying',                      color: '#A78BFA', emoji: '📐' },
  { id: 'hmm-6', moment: 'The rain-smell from the east fields',                                                              where: 'Beyond the green gate · open playground',                                                                 whenYouNotice: 'First rain of the season · 15 min before clouds arrive · it travels in on the wind like a warning.',                     color: '#FFD166', emoji: '🌧️' },
  { id: 'hmm-7', moment: 'The pencil-on-wood sound from the carpenter\'s stall',                                                            where: 'Shop outside the back gate',                                                                                whenYouNotice: 'Saturday mornings · between 9 and 11 · it is the sound of things being mended · worth a visit',                            color: '#EF4444', emoji: '🪚' },
];

interface HomeSimplePractice {
  id: string;
  name: string;
  daily: string;
  monthly: string;
  color: string;
  emoji: string;
}

const HOME_SIMPLE_PRACTICES: HomeSimplePractice[] = [
  { id: 'hsp-1', name: 'Carry a reusable cup',              daily: 'One cup · washed · carried everywhere · refill from campus water points.',                          monthly: 'Track number of disposable cups avoided · share total on the guardian board.',                            color: '#22C55E', emoji: '🥤' },
  { id: 'hsp-2', name: 'Write one note a week',                  daily: 'Not to-dos · to someone · short · a thank-you · or a "I thought of you" ·.',                              monthly: 'Aim for 4 · keep carbon copy in the note-keeper · read at reunions.',                                          color: '#F472B6', emoji: '💌' },
  { id: 'hsp-3', name: 'Walk without a phone · 15 min',                   daily: 'After lunch · 15 min · phone in locker · ground under feet · pay attention to things.',                               monthly: 'Report back one thing you noticed · share on the micro-moments board.',                                              color: '#F59E0B', emoji: '🚶' },
  { id: 'hsp-4', name: 'Read a paper newspaper',                                daily: 'Library has 4 · turn the pages · fold it · pass it on · don\'t scroll past.',                                           monthly: 'Pin one story that mattered · write 3 lines about it · share in weekly digest.',                                         color: '#00D4FF', emoji: '📰' },
  { id: 'hsp-5', name: 'Say hello to 3 people',                                       daily: 'Three new-ish folks · not your circle · eye-contact · a real hello · no phones.',                                                monthly: 'Count · share highest reach · set next-month goal · kindness scales.',                                                        color: '#A78BFA', emoji: '👋' },
  { id: 'hsp-6', name: 'Put one thing back you didn\'t use',                                    daily: 'Book · cup · chair · cable · anything · before you leave · restore the space.',                                                     monthly: 'Volunteer 1 hr in the restore corner · help others un-do the day.',                                                          color: '#FFD166', emoji: '↩️' },
  { id: 'hsp-7', name: 'Water something alive',                                                      daily: 'One plant · one bird bowl · one tree · sometimes nothing needs water · go anyway · notice.',                                                    monthly: 'Log on the grove board · keep the grove schedule honest · rotate the task.',                                                                color: '#EF4444', emoji: '💧' },
];

interface HomeKindnessLedger {
  id: string;
  deed: string;
  doer: string;
  witnessed: string;
  color: string;
  emoji: string;
}

const HOME_KINDNESS_LEDGER: HomeKindnessLedger[] = [
  { id: 'hkl-1', deed: 'Carried 7 chairs up four flights · alone · because the volunteer team was short',                      doer: 'Aarav · 2nd year · web wing',                           witnessed: 'By two councillors who tried to help · he said "I started · I\'ll finish" · and did.',                    color: '#00D4FF', emoji: '🪑' },
  { id: 'hkl-2', deed: 'Stayed back after a workshop to clean · when nobody had asked',                                           doer: 'Meera · 1st year · content wing',                            witnessed: 'By the security uncle at 10 PM · who brought her tea · she refused · he insisted · they sat together · he talked about his grandkids.',  color: '#F59E0B', emoji: '🧹' },
  { id: 'hkl-3', deed: 'Wrote 30 handwritten thank-you notes after the bonfire · took four evenings',                                   doer: 'Rehan · council chair',                                              witnessed: 'By the postman who realized what was happening · gave a small discount on stamps · asked to see one note · cried a little.',                   color: '#A78BFA', emoji: '💌' },
  { id: 'hkl-4', deed: 'Gave up his seat on the stage panel to a first-year speaker · without being asked',                                   doer: 'Kabir · senior · PR wing',                                                   witnessed: 'By the audience · who clapped for the swap more than for any talk that day · it became the moment of the event.',                                     color: '#F472B6', emoji: '🎤' },
  { id: 'hkl-5', deed: 'Bought groceries for a classmate going through a hard week · didn\'t tell anyone',                                              doer: 'Tanvi · graphic design wing',                                                          witnessed: 'By the classmate · 6 months later · who mentioned it once · and Tanvi denied it · smiled · and deflected · which is how we do it.',                  color: '#FFD166', emoji: '🛒' },
  { id: 'hkl-6', deed: 'Stayed up till 3 AM on exam week helping a junior debug · went to her own exam on 2 hrs sleep · didn\'t complain',                             doer: 'Priya · 4th year · app wing',                                                                     witnessed: 'By the junior who passed · who topped the class · who wrote Priya a long letter that now hangs in the mentor corner.',                                    color: '#22C55E', emoji: '💻' },
  { id: 'hkl-7', deed: 'Walked a stranger home from campus late at night · 2 km out of way · because it was safer',                                                            doer: 'Nidhi · alumni · visiting for event',                                                                            witnessed: 'By the stranger who sent a thank-you card a week later · enclosed ₹500 · we forwarded to the safe-walk fund · never told Nidhi who lives in another city.', color: '#EF4444', emoji: '🫱' },
];

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

  // ------ Impact dashboard ------
  const renderImpactDashboard = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌍 Impact dashboard</Text>
        <Text style={styles.sectionCaption}>Live · last 12 months</Text>
      </View>
      <View style={styles.impactGrid}>
        {IMPACT_METRICS.map((m) => (
          <View key={m.id} style={styles.impactCell}>
            <LinearGradient colors={m.accent} style={styles.impactGradient}>
              <View style={styles.impactTopRow}>
                <Text style={styles.impactEmoji}>{m.emoji}</Text>
                <View
                  style={[
                    styles.impactTrendPill,
                    {
                      backgroundColor:
                        m.trend === 'up' ? '#0B3F2A' : m.trend === 'down' ? '#3F0B14' : '#1A1A1A',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.impactTrendText,
                      {
                        color:
                          m.trend === 'up' ? '#66BB6A' : m.trend === 'down' ? '#EF5350' : '#BDBDBD',
                      },
                    ]}
                  >
                    {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '●'} {m.trendPct.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <Text style={[styles.impactValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.impactLabel}>{m.label}</Text>
              <Text style={styles.impactCaption} numberOfLines={3}>
                {m.caption}
              </Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );

  // ------ Weekly digest ------
  const renderWeeklyDigest = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📆 Weekly digest</Text>
        <Text style={styles.sectionCaption}>April 15 – 21</Text>
      </View>
      <View style={styles.digestCard}>
        {WEEKLY_DIGEST.map((d) => (
          <View key={d.id} style={styles.digestRow}>
            <View style={[styles.digestBadge, { backgroundColor: d.color + '33' }]}>
              <Text style={[styles.digestBadgeDay, { color: d.color }]}>{d.day}</Text>
              <Text style={styles.digestBadgeDate}>{d.date}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.digestSummary}>{d.summary}</Text>
              {d.highlight ? (
                <Text style={[styles.digestHighlight, { color: d.color }]}>{d.highlight}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // ------ Quick wins ------
  const renderQuickWins = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>⚡ Quick wins</Text>
        <Text style={styles.sectionCaption}>Past 7 days</Text>
      </View>
      <View style={styles.winsGrid}>
        {QUICK_WINS.map((w) => (
          <View key={w.id} style={styles.winCell}>
            <Text style={styles.winEmoji}>{w.emoji}</Text>
            <Text style={[styles.winValue, { color: w.color }]}>{w.value}</Text>
            <Text style={styles.winLabel}>{w.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ------ Member of the month carousel ------
  const renderMemberHighlights = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>✨ Member of the month</Text>
        <Text style={styles.sectionCaption}>{MEMBER_HIGHLIGHTS.length} stories</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.memberScroll}
      >
        {MEMBER_HIGHLIGHTS.map((m) => (
          <View key={m.id} style={styles.memberCard}>
            <LinearGradient colors={m.palette} style={styles.memberGradient}>
              <View style={styles.memberTopRow}>
                <Text style={styles.memberMonth}>{m.month}</Text>
                <Text style={styles.memberAvatar}>{m.avatar}</Text>
              </View>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberRole}>{m.role}</Text>
              <Text style={styles.memberWing}>🌿 {m.wing}</Text>
              <Text style={styles.memberReason} numberOfLines={3}>
                “{m.reason}”
              </Text>
              <View style={styles.memberTagRow}>
                {m.tags.map((t) => (
                  <View key={t} style={styles.memberTagPill}>
                    <Text style={styles.memberTagText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.memberBio} numberOfLines={3}>
                {m.bio}
              </Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ------ Values pillars ------
  const renderValues = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 What we stand for</Text>
        <Text style={styles.sectionCaption}>6 pillars</Text>
      </View>
      <View style={styles.valuesGrid}>
        {VALUES.map((v) => (
          <View key={v.id} style={styles.valueCard}>
            <View style={[styles.valueBadge, { backgroundColor: v.color + '22' }]}>
              <Text style={styles.valueEmoji}>{v.emoji}</Text>
            </View>
            <Text style={[styles.valueTitle, { color: v.color }]}>{v.title}</Text>
            <Text style={styles.valueBody}>{v.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ------ Partners ------
  const renderPartners = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤝 Partners & collectives</Text>
        <Text style={styles.sectionCaption}>{PARTNERS.length} orgs</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.partnerScroll}
      >
        {PARTNERS.map((p) => (
          <View key={p.id} style={styles.partnerCard}>
            <View style={[styles.partnerEmojiBox, { backgroundColor: p.color + '22' }]}>
              <Text style={styles.partnerEmoji}>{p.emoji}</Text>
            </View>
            <Text style={styles.partnerName}>{p.name}</Text>
            <Text style={[styles.partnerKind, { color: p.color }]}>{p.kind}</Text>
            <Text style={styles.partnerBlurb} numberOfLines={3}>
              {p.blurb}
            </Text>
            <Text style={styles.partnerSince}>Partner since {p.since}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ------ Live feed ------
  const renderLiveFeed = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📡 Live from the club</Text>
        <Text style={styles.sectionCaption}>Auto-refresh</Text>
      </View>
      <View style={styles.feedCard}>
        {LIVE_FEED.map((f) => (
          <View key={f.id} style={styles.feedRow}>
            <View style={[styles.feedIcon, { backgroundColor: f.color + '33' }]}>
              <Text style={styles.feedEmoji}>{f.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedLine}>
                <Text style={styles.feedActor}>{f.actor} </Text>
                {f.verb}{' '}
                <Text style={styles.feedObject}>{f.object}</Text>
              </Text>
              <Text style={styles.feedAt}>{f.at}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // ------ Event modal ------
  const renderOnboarding = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌿 Your first 12 weeks</Text>
        <Text style={styles.sectionCaption}>Onboarding · kind pace</Text>
      </View>
      {ONBOARDING_STEPS.map((s, idx) => (
        <View key={s.id} style={styles.obRow}>
          <View style={[styles.obDot, { backgroundColor: s.color }]}>
            <Text style={styles.obDotEmoji}>{s.emoji}</Text>
          </View>
          {idx < ONBOARDING_STEPS.length - 1 ? (
            <View style={[styles.obConnector, { backgroundColor: s.color + '55' }]} />
          ) : null}
          <View style={styles.obCard}>
            <View style={styles.obHeaderRow}>
              <Text style={[styles.obWeek, { color: s.color }]}>{s.week}</Text>
              <Text style={styles.obTitle}>{s.title}</Text>
            </View>
            <Text style={styles.obBody}>{s.body}</Text>
            <View style={styles.obDeliverableRow}>
              <Text style={styles.obDeliverableLabel}>Deliverable</Text>
              <Text style={styles.obDeliverable}>{s.deliverable}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBadges = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🏅 Achievement badges</Text>
        <Text style={styles.sectionCaption}>{BADGES.length} · earn at your pace</Text>
      </View>
      <View style={styles.badgesGrid}>
        {BADGES.map((b) => (
          <View key={b.id} style={styles.badgeCard}>
            <View
              style={[
                styles.badgeOrb,
                {
                  backgroundColor: b.color + '22',
                  borderColor: b.color,
                },
              ]}
            >
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>{b.name}</Text>
            <Text
              style={[
                styles.badgeRarity,
                {
                  color:
                    b.rarity === 'legendary'
                      ? '#F59E0B'
                      : b.rarity === 'rare'
                        ? '#A78BFA'
                        : b.rarity === 'uncommon'
                          ? '#38BDF8'
                          : '#94A3B8',
                },
              ]}
            >
              {b.rarity.toUpperCase()} · {b.earned}
            </Text>
            <Text style={styles.badgeCrit} numberOfLines={3}>{b.criteria}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderScoreboard = () => {
    const maxes = SCOREBOARD.map((r) => Math.max(r.q1, r.q2, r.q3, r.q4));
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>♻️ Sustainability scoreboard</Text>
          <Text style={styles.sectionCaption}>Q1–Q4 · toward annual target</Text>
        </View>
        {SCOREBOARD.map((r, idx) => {
          const max = maxes[idx] || 1;
          const pctTarget = Math.min(1, (r.q1 + r.q2 + r.q3 + r.q4) / r.target);
          return (
            <View key={r.id} style={styles.sbRow}>
              <View style={styles.sbLabelRow}>
                <Text style={styles.sbEmoji}>{r.emoji}</Text>
                <Text style={styles.sbMetric}>{r.metric}</Text>
                <Text style={[styles.sbPct, { color: r.color }]}>
                  {Math.round(pctTarget * 100)}% of {r.target.toLocaleString()}
                </Text>
              </View>
              <View style={styles.sbBars}>
                {[
                  { k: 'Q1', v: r.q1 },
                  { k: 'Q2', v: r.q2 },
                  { k: 'Q3', v: r.q3 },
                  { k: 'Q4', v: r.q4 },
                ].map((q) => {
                  const h = Math.max(6, (q.v / max) * 60);
                  return (
                    <View key={q.k} style={styles.sbCol}>
                      <View
                        style={[
                          styles.sbBar,
                          { height: h, backgroundColor: r.color },
                        ]}
                      />
                      <Text style={styles.sbColLabel}>{q.k}</Text>
                      <Text style={styles.sbColValue}>
                        {q.v >= 1000 ? `${(q.v / 1000).toFixed(1)}k` : q.v}
                        {r.unit === 'kg' || r.unit === 'hrs' ? '' : ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderNorms = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🪞 Community norms</Text>
        <Text style={styles.sectionCaption}>How we behave with each other</Text>
      </View>
      {NORMS.map((n) => (
        <View key={n.id} style={[styles.normCard, { borderLeftColor: n.color }]}>
          <Text style={styles.normEmoji}>{n.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.normTitle}>{n.title}</Text>
            <Text style={styles.normBody}>{n.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCollab = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤝 Open collabs</Text>
        <Text style={styles.sectionCaption}>Pitch in · ship together</Text>
      </View>
      {COLLAB_OPPS.map((c) => (
        <View key={c.id} style={[styles.collabCard, { borderLeftColor: c.color }]}>
          <View style={styles.collabHeaderRow}>
            <Text style={styles.collabTitle} numberOfLines={2}>{c.title}</Text>
            <View style={[styles.collabWingPill, { backgroundColor: c.color + '2A' }]}>
              <Text style={[styles.collabWingText, { color: c.color }]}>{c.wing}</Text>
            </View>
          </View>
          <Text style={styles.collabMeta}>{c.commitment}</Text>
          <Text style={styles.collabLookingFor}>Looking for: {c.lookingFor}</Text>
          <Text style={styles.collabContact}>📬 {c.contact}</Text>
        </View>
      ))}
    </View>
  );

  const renderResources = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📚 Resource hub</Text>
        <Text style={styles.sectionCaption}>{RESOURCES.length} · templates · guides · decks</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.resourceScroll}
      >
        {RESOURCES.map((r) => (
          <View key={r.id} style={styles.resourceCard}>
            <View style={[styles.resourceIconWrap, { backgroundColor: r.color + '2A' }]}>
              <Text style={styles.resourceEmoji}>{r.emoji}</Text>
            </View>
            <Text style={[styles.resourceKind, { color: r.color }]}>
              {r.kind.toUpperCase()}
            </Text>
            <Text style={styles.resourceTitle} numberOfLines={2}>{r.title}</Text>
            <Text style={styles.resourceBlurb} numberOfLines={3}>{r.blurb}</Text>
            <View style={styles.resourceFootRow}>
              <Text style={styles.resourceTag}>{r.tag}</Text>
              <Text style={styles.resourceUpdated}>upd. {r.updated}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCampusCal = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗓️ This week on campus</Text>
        <Text style={styles.sectionCaption}>Week of {CAMPUS_CAL[0].label}</Text>
      </View>
      <View style={styles.calGrid}>
        {CAMPUS_CAL.map((c) => (
          <View key={c.id} style={styles.calRow}>
            <View style={styles.calDayCol}>
              <Text style={styles.calDay}>{c.day}</Text>
              <Text style={styles.calLabel}>{c.label}</Text>
            </View>
            <View style={styles.calChipCol}>
              {c.chips.length === 0 ? (
                <Text style={styles.calEmpty}>— open —</Text>
              ) : (
                c.chips.map((ch) => (
                  <View
                    key={ch.text}
                    style={[styles.calChip, { backgroundColor: ch.color + '22', borderColor: ch.color + '55' }]}
                  >
                    <Text style={[styles.calChipText, { color: ch.color }]} numberOfLines={1}>
                      {ch.text}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderQuarterGoals = () => {
    const active = QUARTER_GOALS.filter((g) => g.status !== 'done');
    const done = QUARTER_GOALS.filter((g) => g.status === 'done');
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎯 Goals we are tracking</Text>
          <Text style={styles.sectionCaption}>
            {active.length} active · {done.length} shipped
          </Text>
        </View>
        {active.map((g) => (
          <View key={g.id} style={[styles.goalCard, { borderLeftColor: g.color }]}>
            <View style={styles.goalTopRow}>
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.goalTitleRow}>
                  <Text style={styles.goalTitle} numberOfLines={2}>{g.title}</Text>
                  <View
                    style={[
                      styles.goalStatusPill,
                      {
                        backgroundColor:
                          g.status === 'on-track'
                            ? 'rgba(34,197,94,0.18)'
                            : g.status === 'at-risk'
                            ? 'rgba(239,68,68,0.18)'
                            : 'rgba(168,85,247,0.18)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.goalStatusText,
                        {
                          color:
                            g.status === 'on-track'
                              ? '#22C55E'
                              : g.status === 'at-risk'
                              ? '#EF4444'
                              : '#A855F7',
                        },
                      ]}
                    >
                      {g.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalQuarter}>{g.quarter} · {g.owner}</Text>
              </View>
            </View>
            <Text style={styles.goalDetail}>{g.detail}</Text>
            <View style={styles.goalBarTrack}>
              <View
                style={[
                  styles.goalBarFill,
                  { width: `${Math.round(g.progress * 100)}%`, backgroundColor: g.color },
                ]}
              />
            </View>
            <Text style={styles.goalPct}>{Math.round(g.progress * 100)}% complete</Text>
          </View>
        ))}
        <View style={styles.goalDoneRow}>
          {done.map((g) => (
            <View key={g.id} style={styles.goalDonePill}>
              <Text style={styles.goalDoneEmoji}>{g.emoji}</Text>
              <Text style={styles.goalDoneText} numberOfLines={1}>{g.title}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderImpactRegions = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗺️ Impact by region</Text>
        <Text style={styles.sectionCaption}>
          {IMPACT_REGIONS.reduce((a, r) => a + r.saplings, 0)} saplings · {IMPACT_REGIONS.length} regions
        </Text>
      </View>
      {IMPACT_REGIONS.map((r) => (
        <View key={r.id} style={[styles.regionCard, { borderLeftColor: r.color }]}>
          <View style={styles.regionTopRow}>
            <Text style={styles.regionEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.regionTitle} numberOfLines={1}>{r.region}</Text>
              <Text style={styles.regionState}>{r.state}</Text>
            </View>
            <Text style={[styles.regionCount, { color: r.color }]}>{r.saplings}</Text>
          </View>
          <View style={styles.regionStatsRow}>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatValue}>{r.members}</Text>
              <Text style={styles.regionStatLabel}>members</Text>
            </View>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatValue}>{r.partners}</Text>
              <Text style={styles.regionStatLabel}>partners</Text>
            </View>
            <View style={styles.regionStat}>
              <Text style={styles.regionStatValue}>{r.tonsCO2}t</Text>
              <Text style={styles.regionStatLabel}>CO₂e</Text>
            </View>
          </View>
          <Text style={styles.regionNote} numberOfLines={2}>{r.note}</Text>
          <View style={styles.regionDateRow}>
            <Text style={styles.regionDate}>last · {r.lastDriveDate}</Text>
            <Text style={styles.regionDate}>next · {r.nextDriveDate}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderLearningPaths = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Learning paths</Text>
        <Text style={styles.sectionCaption}>{LEARNING_PATHS.length} structured tracks · self-paced</Text>
      </View>
      {LEARNING_PATHS.map((lp) => (
        <View key={lp.id} style={[styles.lpCard, { borderLeftColor: lp.color }]}>
          <View style={styles.lpTopRow}>
            <Text style={styles.lpEmoji}>{lp.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lpTitle} numberOfLines={2}>{lp.title}</Text>
              <Text style={styles.lpMeta}>
                {lp.level} · {lp.hours}h · {lp.owner}
              </Text>
            </View>
          </View>
          <View style={styles.lpSkillRow}>
            {lp.skills.map((s) => (
              <View key={s} style={[styles.lpSkillPill, { borderColor: lp.color + '55' }]}>
                <Text style={[styles.lpSkillText, { color: lp.color }]}>{s}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.lpOutcome} numberOfLines={3}>Outcome · {lp.outcome}</Text>
        </View>
      ))}
    </View>
  );

  const renderCommunityShouts = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>💗 Community shoutouts</Text>
        <Text style={styles.sectionCaption}>Kind + specific · posted this week</Text>
      </View>
      {COMMUNITY_SHOUTS.map((s) => (
        <View key={s.id} style={[styles.shoutCard, { borderLeftColor: s.color }]}>
          <View style={styles.shoutTopRow}>
            <Text style={styles.shoutEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shoutHeader} numberOfLines={1}>
                <Text style={styles.shoutFrom}>{s.from}</Text>
                <Text style={styles.shoutArrow}>  →  </Text>
                <Text style={styles.shoutTo}>{s.to}</Text>
              </Text>
              <Text style={styles.shoutReason}>{s.reason} · {s.date}</Text>
            </View>
          </View>
          <Text style={styles.shoutMessage} numberOfLines={4}>&ldquo;{s.message}&rdquo;</Text>
        </View>
      ))}
    </View>
  );

  const renderWorkshops = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🎓 Open workshops</Text>
        <Text style={styles.sectionCaption}>
          {WORKSHOPS.filter((w) => w.seatsLeft > 0).length} seats open · enrollment is free
        </Text>
      </View>
      {WORKSHOPS.map((w) => {
        const pct = (w.seatsTotal - w.seatsLeft) / w.seatsTotal;
        const full = w.seatsLeft === 0;
        return (
          <View key={w.id} style={[styles.wsCard, { borderLeftColor: w.color }]}>
            <View style={styles.wsTopRow}>
              <Text style={styles.wsEmoji}>{w.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wsTitle} numberOfLines={2}>{w.title}</Text>
                <Text style={styles.wsMeta}>{w.date} · {w.time} · {w.mode}</Text>
              </View>
              <View
                style={[
                  styles.wsLevelPill,
                  {
                    backgroundColor:
                      w.level === 'open'
                        ? 'rgba(34,197,94,0.18)'
                        : w.level === 'members'
                        ? 'rgba(168,85,247,0.18)'
                        : 'rgba(239,68,68,0.18)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.wsLevelText,
                    {
                      color:
                        w.level === 'open'
                          ? '#22C55E'
                          : w.level === 'members'
                          ? '#A855F7'
                          : '#EF4444',
                    },
                  ]}
                >
                  {w.level}
                </Text>
              </View>
            </View>
            <Text style={styles.wsLead}>Led by {w.lead}</Text>
            <View style={styles.wsBarTrack}>
              <View
                style={[
                  styles.wsBarFill,
                  { width: `${Math.round(pct * 100)}%`, backgroundColor: w.color },
                ]}
              />
            </View>
            <Text style={[styles.wsSeat, { color: full ? '#EF4444' : Colors.text.muted }]}>
              {full ? 'seats full · join waitlist' : `${w.seatsLeft} / ${w.seatsTotal} seats left`}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderSavingsLedger = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌿 Sustainability ledger</Text>
        <Text style={styles.sectionCaption}>{SAVINGS_LEDGER.length} metrics · numbers we can defend</Text>
      </View>
      {SAVINGS_LEDGER.map((s) => (
        <View key={s.id} style={[styles.ledgerRow, { borderLeftColor: s.color }]}>
          <Text style={styles.ledgerEmoji}>{s.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.ledgerTopRow}>
              <Text style={styles.ledgerLabel} numberOfLines={1}>{s.label}</Text>
              <Text style={[styles.ledgerValue, { color: s.color }]}>
                {s.value} {s.unit}
              </Text>
            </View>
            <Text style={styles.ledgerHint} numberOfLines={2}>{s.hint}</Text>
            <Text
              style={[
                styles.ledgerChange,
                {
                  color:
                    s.trend === 'up' ? '#22C55E' : s.trend === 'down' ? '#EF4444' : '#94A3B8',
                },
              ]}
            >
              {s.trend === 'up' ? '↑ ' : s.trend === 'down' ? '↓ ' : '· '}
              {s.change}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDailyRituals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🕰️ A day inside the club</Text>
        <Text style={styles.sectionCaption}>{DAILY_RITUALS.length} rituals · light on process</Text>
      </View>
      {DAILY_RITUALS.map((r) => (
        <View key={r.id} style={[styles.ritualRow, { borderLeftColor: r.color }]}>
          <View style={styles.ritualTimeCol}>
            <Text style={[styles.ritualTime, { color: r.color }]}>{r.time}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.ritualTopRow}>
              <Text style={styles.ritualEmoji}>{r.emoji}</Text>
              <Text style={styles.ritualTitle} numberOfLines={1}>{r.title}</Text>
            </View>
            <Text style={styles.ritualDetail} numberOfLines={2}>{r.detail}</Text>
            <Text style={styles.ritualLead}>{r.lead}</Text>
          </View>
        </View>
      ))}
    </View>
  );

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

  // ------ Phase 3v deeper home blocks ------
  const renderWeatherStrip = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌤️ Today's sky · your hours</Text>
        <Text style={styles.sectionCaption}>plan a walk around it</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, gap: 10 }}
      >
        {WEATHER_TODAY.map((w) => (
          <View
            key={w.id}
            style={[styles.weatherCard, { borderColor: w.color + '55' }]}
          >
            <Text style={styles.weatherHour}>{w.hour}</Text>
            <Text style={styles.weatherEmoji}>{w.emoji}</Text>
            <Text style={[styles.weatherTemp, { color: w.color }]}>{w.tempC}°C</Text>
            <Text style={styles.weatherCond} numberOfLines={1}>{w.condition}</Text>
            <Text style={styles.weatherMeta} numberOfLines={1}>{w.wind}</Text>
            <View style={styles.weatherAqiRow}>
              <Text style={styles.weatherAqiLabel}>AQI</Text>
              <Text
                style={[
                  styles.weatherAqiVal,
                  { color: w.aqi < 50 ? '#22C55E' : w.aqi < 100 ? '#F59E0B' : '#EF4444' },
                ]}
              >
                {w.aqi}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSaplingPrograms = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌳 Sapling programs · live status</Text>
        <Text style={styles.sectionCaption}>{SAPLING_PROGRAMS.length} sites</Text>
      </View>
      {SAPLING_PROGRAMS.map((s) => {
        const survival = Math.round((s.aliveCount / s.plantedCount) * 100);
        return (
          <View key={s.id} style={[styles.spCard, { borderLeftColor: s.color }]}>
            <View style={styles.spTopRow}>
              <Text style={styles.spEmoji}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.spSite} numberOfLines={1}>{s.site}</Text>
                <Text style={styles.spSpecies} numberOfLines={1}>{s.species}</Text>
              </View>
              <View style={styles.spStatsCol}>
                <Text style={[styles.spSurvival, { color: s.color }]}>{survival}%</Text>
                <Text style={styles.spSurvivalLabel}>alive</Text>
              </View>
            </View>
            <View style={styles.spBarBg}>
              <View
                style={[styles.spBarFill, { width: `${survival}%`, backgroundColor: s.color }]}
              />
            </View>
            <View style={styles.spFootRow}>
              <Text style={styles.spMeta}>{s.aliveCount}/{s.plantedCount} alive</Text>
              <Text style={styles.spMeta}>last visit · {s.lastVisit}</Text>
            </View>
            <Text style={styles.spSteward}>steward · {s.steward}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderMentorHours = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Alumni office hours</Text>
        <Text style={styles.sectionCaption}>book a slot</Text>
      </View>
      {MENTOR_HOURS.map((m) => (
        <View key={m.id} style={[styles.mhRow, { borderLeftColor: m.color }]}>
          <Text style={styles.mhEmoji}>{m.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.mhTopRow}>
              <Text style={styles.mhMentor} numberOfLines={1}>{m.mentor}</Text>
              <Text style={[styles.mhDay, { color: m.color }]}>{m.day} · {m.window}</Text>
            </View>
            <Text style={styles.mhRole} numberOfLines={1}>{m.role}</Text>
            <Text style={styles.mhTopic} numberOfLines={2}>{m.topic}</Text>
            <View style={styles.mhMetaRow}>
              <View
                style={[
                  styles.mhMode,
                  {
                    backgroundColor: m.mode === 'online' ? '#0E7490' + '33' : '#22C55E' + '33',
                    borderColor: m.mode === 'online' ? '#0E7490' : '#22C55E',
                  },
                ]}
              >
                <Text style={styles.mhModeText}>{m.mode}</Text>
              </View>
              <Text style={styles.mhCap}>{m.capacity} seats</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecommendedReads = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📚 Reading list · the club's shelf</Text>
        <Text style={styles.sectionCaption}>{RECOMMENDED_READS.length} picks</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, gap: 12 }}
      >
        {RECOMMENDED_READS.map((r) => (
          <View
            key={r.id}
            style={[styles.rrCard, { borderColor: r.color + '55' }]}
          >
            <Text style={styles.rrEmoji}>{r.emoji}</Text>
            <Text style={[styles.rrKind, { color: r.color }]}>{r.kind.toUpperCase()}</Text>
            <Text style={styles.rrTitle} numberOfLines={3}>{r.title}</Text>
            <Text style={styles.rrAuthor} numberOfLines={1}>by {r.author}</Text>
            <Text style={styles.rrMin}>{r.minutes} min</Text>
            <Text style={styles.rrWhy} numberOfLines={3}>{r.why}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderVolunteerSlots = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🙋 Volunteer slots this week</Text>
        <Text style={styles.sectionCaption}>tap · claim a slot</Text>
      </View>
      {VOLUNTEER_SLOTS.map((v) => {
        const pct = Math.round((v.filled / v.seats) * 100);
        return (
          <View key={v.id} style={[styles.vsRow, { borderLeftColor: v.color }]}>
            <Text style={styles.vsEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.vsTopRow}>
                <Text style={styles.vsDrive} numberOfLines={1}>{v.drive}</Text>
                <View
                  style={[
                    styles.vsKindPill,
                    {
                      backgroundColor: v.color + '22',
                      borderColor: v.color + '66',
                    },
                  ]}
                >
                  <Text style={[styles.vsKindText, { color: v.color }]}>{v.kind}</Text>
                </View>
              </View>
              <Text style={styles.vsDate} numberOfLines={1}>{v.date} · {v.slot}</Text>
              <View style={styles.vsBarBg}>
                <View
                  style={[styles.vsBarFill, { width: `${pct}%`, backgroundColor: v.color }]}
                />
              </View>
              <Text style={styles.vsSeats}>{v.filled}/{v.seats} filled</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderEcoHabits = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌿 Eco habits · our rolling streaks</Text>
        <Text style={styles.sectionCaption}>group averages</Text>
      </View>
      {ECO_HABITS.map((h) => (
        <View key={h.id} style={[styles.ehCard, { borderLeftColor: h.color }]}>
          <View style={styles.ehTopRow}>
            <Text style={styles.ehEmoji}>{h.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ehHabit} numberOfLines={2}>{h.habit}</Text>
              <Text style={styles.ehDetail} numberOfLines={2}>{h.detail}</Text>
            </View>
          </View>
          <View style={styles.ehFootRow}>
            <Text style={[styles.ehStreak, { color: h.color }]}>{h.streakWeeks} wks</Text>
            <Text style={styles.ehCo2}>−{h.co2SavedKg} kg CO₂</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTrails = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🥾 Campus walking trails</Text>
        <Text style={styles.sectionCaption}>{TRAIL_MARKERS.length} routes</Text>
      </View>
      {TRAIL_MARKERS.map((t) => (
        <View key={t.id} style={[styles.trCard, { borderLeftColor: t.color }]}>
          <Text style={styles.trEmoji}>{t.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.trName} numberOfLines={1}>{t.name}</Text>
            <Text style={styles.trMeta} numberOfLines={1}>
              {t.distanceKm} km · {t.elevationM} m gain · {t.minutes} min
            </Text>
          </View>
          <View
            style={[
              styles.trDiff,
              {
                backgroundColor: t.color + '22',
                borderColor: t.color + '66',
              },
            ]}
          >
            <Text style={[styles.trDiffText, { color: t.color }]}>{t.difficulty}</Text>
          </View>
        </View>
      ))}
    </View>
  );

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

  // ------ Phase 3ab blocks ------
  // ------ Phase 3ai: round 3 deeper home blocks ------
  const renderMorningPulses = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌅 Morning pulse · the campus wakes up</Text>
        <Text style={styles.sectionCaption}>{MORNING_PULSES.length} beats</Text>
      </View>
      {MORNING_PULSES.map((m) => (
        <View key={m.id} style={[styles.mpCard, { borderLeftColor: m.color }]}>
          <View style={styles.mpTopRow}>
            <Text style={styles.mpEmoji}>{m.emoji}</Text>
            <Text style={styles.mpTitle} numberOfLines={1}>{m.title}</Text>
          </View>
          <Text style={styles.mpDetail} numberOfLines={3}>{m.detail}</Text>
          <Text style={styles.mpHint} numberOfLines={2}>↳ {m.hint}</Text>
        </View>
      ))}
    </View>
  );

  const renderQuietHours = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤫 Quiet hours · places the phone goes down</Text>
        <Text style={styles.sectionCaption}>{QUIET_HOURS.length} slots</Text>
      </View>
      {QUIET_HOURS.map((q) => (
        <View key={q.id} style={[styles.qhCard, { borderLeftColor: q.color }]}>
          <View style={styles.qhTopRow}>
            <Text style={styles.qhEmoji}>{q.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.qhRange} numberOfLines={1}>{q.range}</Text>
              <Text style={styles.qhWhere} numberOfLines={1}>{q.where}</Text>
            </View>
          </View>
          <Text style={styles.qhRule} numberOfLines={3}>{q.rule}</Text>
          <Text style={styles.qhHost} numberOfLines={1}>hosted by {q.host}</Text>
        </View>
      ))}
    </View>
  );

  const renderPlantingDiary = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌳 Planting diary · what we planted · still alive</Text>
        <Text style={styles.sectionCaption}>{PLANTING_DIARY.length} entries</Text>
      </View>
      {PLANTING_DIARY.map((p) => (
        <View key={p.id} style={[styles.pdCard, { borderLeftColor: p.color }]}>
          <View style={styles.pdTopRow}>
            <Text style={styles.pdEmoji}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pdSpecies} numberOfLines={1}>{p.species}</Text>
              <Text style={styles.pdLoc} numberOfLines={1}>{p.location}</Text>
            </View>
            <Text style={[styles.pdDate, { color: p.color }]}>{p.plantedOn}</Text>
          </View>
          <Text style={styles.pdGuardian} numberOfLines={1}>Guardian · {p.guardian}</Text>
          <Text style={styles.pdStatus} numberOfLines={1}>Status · {p.status}</Text>
        </View>
      ))}
    </View>
  );

  const renderCarbonSavings = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌍 Carbon ledger · what we actually saved</Text>
        <Text style={styles.sectionCaption}>{CARBON_SAVINGS.length} tiles</Text>
      </View>
      {CARBON_SAVINGS.map((c) => (
        <View key={c.id} style={[styles.csCard, { borderLeftColor: c.color }]}>
          <View style={styles.csTopRow}>
            <Text style={styles.csEmoji}>{c.emoji}</Text>
            <Text style={styles.csLabel} numberOfLines={2}>{c.label}</Text>
          </View>
          <View style={styles.csMetricRow}>
            <View style={styles.csMetricCol}>
              <Text style={styles.csMetricLabel}>THIS MONTH</Text>
              <Text style={[styles.csMetricValue, { color: c.color }]}>{c.thisMonth}</Text>
            </View>
            <View style={styles.csMetricCol}>
              <Text style={styles.csMetricLabel}>CUMULATIVE</Text>
              <Text style={[styles.csMetricValue, { color: c.color }]}>{c.cumulative}</Text>
            </View>
          </View>
          <Text style={styles.csMethod} numberOfLines={2}>↳ {c.method}</Text>
        </View>
      ))}
    </View>
  );

  const renderPledgeStreaks = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔥 Pledge streaks · what we keep going</Text>
        <Text style={styles.sectionCaption}>{PLEDGE_STREAKS.length} pledges</Text>
      </View>
      {PLEDGE_STREAKS.map((s) => {
        const pct = Math.min(100, Math.round((s.keptToday / s.total) * 100));
        return (
          <View key={s.id} style={[styles.psCard, { borderLeftColor: s.color }]}>
            <View style={styles.psTopRow}>
              <Text style={styles.psEmoji}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.psPledge} numberOfLines={2}>{s.pledge}</Text>
                <Text style={styles.psStreak}>{s.streakDays}-day club streak</Text>
              </View>
              <Text style={[styles.psPct, { color: s.color }]}>{pct}%</Text>
            </View>
            <View style={styles.psBarBg}>
              <View style={[styles.psBarFill, { width: `${pct}%`, backgroundColor: s.color }]} />
            </View>
            <Text style={styles.psKept}>{s.keptToday} / {s.total} guardians kept it today</Text>
          </View>
        );
      })}
    </View>
  );

  const renderGratitudeWall = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🫶 Gratitude wall · this weeks thank-yous</Text>
        <Text style={styles.sectionCaption}>{GRATITUDE_WALL.length} notes</Text>
      </View>
      {GRATITUDE_WALL.map((g) => (
        <View key={g.id} style={[styles.gwCard, { borderLeftColor: g.color }]}>
          <View style={styles.gwTopRow}>
            <Text style={styles.gwEmoji}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gwFrom} numberOfLines={1}>{g.name} → {g.to}</Text>
              <Text style={[styles.gwDay, { color: g.color }]}>{g.day}</Text>
            </View>
          </View>
          <Text style={styles.gwLine} numberOfLines={3}>"{g.line}"</Text>
        </View>
      ))}
    </View>
  );

  const renderGuardianCovenants = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤝 Guardian covenants · how we hold this place</Text>
        <Text style={styles.sectionCaption}>{GUARDIAN_COVENANTS.length} promises</Text>
      </View>
      {GUARDIAN_COVENANTS.map((g) => (
        <View key={g.id} style={[styles.gcCard, { borderLeftColor: g.color }]}>
          <View style={styles.gcTopRow}>
            <Text style={styles.gcEmoji}>{g.emoji}</Text>
            <Text style={styles.gcPromise} numberOfLines={3}>{g.promise}</Text>
          </View>
          <Text style={styles.gcBecause} numberOfLines={3}>because · {g.because}</Text>
        </View>
      ))}
    </View>
  );

  const renderCampusRituals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🕯️ Campus rituals · we keep them</Text>
        <Text style={styles.sectionCaption}>{CAMPUS_RITUALS_HOME.length} rituals</Text>
      </View>
      {CAMPUS_RITUALS_HOME.map((c) => (
        <View key={c.id} style={[styles.crhCard, { borderLeftColor: c.color }]}>
          <View style={styles.crhTopRow}>
            <Text style={styles.crhEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.crhRitual} numberOfLines={2}>{c.ritual}</Text>
              <Text style={styles.crhWhen} numberOfLines={1}>
                <Text style={[styles.crhDay, { color: c.color }]}>{c.day}</Text>
                {'  ·  '}{c.time}{'  ·  '}{c.where}
              </Text>
            </View>
          </View>
          <Text style={styles.crhWhy} numberOfLines={2}>{c.why}</Text>
        </View>
      ))}
    </View>
  );

  const renderSeasonMoments = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🍃 Seasons · moments we wait for</Text>
        <Text style={styles.sectionCaption}>{SEASON_MOMENTS.length} moments</Text>
      </View>
      {SEASON_MOMENTS.map((s) => (
        <View key={s.id} style={[styles.smCard, { borderLeftColor: s.color }]}>
          <View style={styles.smTopRow}>
            <Text style={styles.smEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.smMoment} numberOfLines={1}>{s.moment}</Text>
              <Text style={[styles.smSeason, { color: s.color }]}>{s.season}</Text>
            </View>
          </View>
          <Text style={styles.smDetail} numberOfLines={3}>{s.detail}</Text>
        </View>
      ))}
    </View>
  );

  const renderLocalHeroes = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌟 Local heroes · not on the poster</Text>
        <Text style={styles.sectionCaption}>{LOCAL_HEROES.length} people</Text>
      </View>
      {LOCAL_HEROES.map((h) => (
        <View key={h.id} style={[styles.lhCard, { borderLeftColor: h.color }]}>
          <View style={styles.lhTopRow}>
            <Text style={styles.lhEmoji}>{h.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lhName} numberOfLines={1}>{h.name}</Text>
              <Text style={styles.lhRole} numberOfLines={1}>{h.role}</Text>
            </View>
          </View>
          <Text style={styles.lhStory} numberOfLines={3}>{h.story}</Text>
          <Text style={styles.lhLearned} numberOfLines={2}>→ {h.learned}</Text>
        </View>
      ))}
    </View>
  );

  const renderGuardianHabits = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌿 Guardian habits · streaks</Text>
        <Text style={styles.sectionCaption}>{GUARDIAN_HABITS.length} habits</Text>
      </View>
      {GUARDIAN_HABITS.map((h) => (
        <View key={h.id} style={[styles.ghCard, { borderLeftColor: h.color }]}>
          <View style={styles.ghTopRow}>
            <Text style={styles.ghEmoji}>{h.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ghHabit} numberOfLines={2}>{h.habit}</Text>
              <Text style={styles.ghCadence}>{h.cadence}</Text>
            </View>
            <Text style={[styles.ghStreak, { color: h.color }]}>{h.streak}🔥</Text>
          </View>
          <Text style={styles.ghDetail} numberOfLines={2}>{h.details}</Text>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3at: round 5 home blocks ------
  const renderDawnRituals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌅 Dawn rituals · how the club wakes up</Text>
        <Text style={styles.sectionCaption}>{HOME_DAWN_RITUALS.length} rituals</Text>
      </View>
      {HOME_DAWN_RITUALS.map((r) => (
        <View key={r.id} style={[styles.hdrCard, { borderLeftColor: r.color }]}>
          <View style={styles.hdrTopRow}>
            <Text style={styles.hdrEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hdrName} numberOfLines={1}>{r.name}</Text>
              <Text style={[styles.hdrWindow, { color: r.color }]}>{r.window}</Text>
            </View>
          </View>
          <Text style={styles.hdrPractice} numberOfLines={3}>{r.practice}</Text>
        </View>
      ))}
    </View>
  );

  const renderDuskRituals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌙 Dusk rituals · how the club settles</Text>
        <Text style={styles.sectionCaption}>{HOME_DUSK_RITUALS.length} rituals</Text>
      </View>
      {HOME_DUSK_RITUALS.map((r) => (
        <View key={r.id} style={[styles.hdkCard, { borderLeftColor: r.color }]}>
          <View style={styles.hdkTopRow}>
            <Text style={styles.hdkEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hdkName} numberOfLines={1}>{r.name}</Text>
              <Text style={[styles.hdkWindow, { color: r.color }]}>{r.window}</Text>
            </View>
          </View>
          <Text style={styles.hdkPractice} numberOfLines={3}>{r.practice}</Text>
        </View>
      ))}
    </View>
  );

  const renderMicroMoments = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌸 Micro-moments · small things we keep noticing</Text>
        <Text style={styles.sectionCaption}>{HOME_MICRO_MOMENTS.length} moments</Text>
      </View>
      {HOME_MICRO_MOMENTS.map((m) => (
        <View key={m.id} style={[styles.hmmCard, { borderLeftColor: m.color }]}>
          <View style={styles.hmmTopRow}>
            <Text style={styles.hmmEmoji}>{m.emoji}</Text>
            <Text style={styles.hmmMoment} numberOfLines={2}>{m.moment}</Text>
          </View>
          <Text style={[styles.hmmWhere, { color: m.color }]} numberOfLines={1}>{m.where}</Text>
          <Text style={styles.hmmWhen} numberOfLines={3}>{m.whenYouNotice}</Text>
        </View>
      ))}
    </View>
  );

  const renderSimplePractices = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>✨ Simple practices · seven habits we quietly hold</Text>
        <Text style={styles.sectionCaption}>{HOME_SIMPLE_PRACTICES.length} practices</Text>
      </View>
      {HOME_SIMPLE_PRACTICES.map((p) => (
        <View key={p.id} style={[styles.hspCard, { borderLeftColor: p.color }]}>
          <View style={styles.hspTopRow}>
            <Text style={styles.hspEmoji}>{p.emoji}</Text>
            <Text style={styles.hspName} numberOfLines={1}>{p.name}</Text>
          </View>
          <Text style={styles.hspDaily} numberOfLines={3}>daily · {p.daily}</Text>
          <Text style={[styles.hspMonthly, { color: p.color }]} numberOfLines={2}>monthly · {p.monthly}</Text>
        </View>
      ))}
    </View>
  );

  const renderKindnessLedger = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🫱 Kindness ledger · small acts we don&apos;t forget</Text>
        <Text style={styles.sectionCaption}>{HOME_KINDNESS_LEDGER.length} entries</Text>
      </View>
      {HOME_KINDNESS_LEDGER.map((k) => (
        <View key={k.id} style={[styles.hklCard, { borderLeftColor: k.color }]}>
          <View style={styles.hklTopRow}>
            <Text style={styles.hklEmoji}>{k.emoji}</Text>
            <Text style={styles.hklDeed} numberOfLines={3}>{k.deed}</Text>
          </View>
          <Text style={[styles.hklDoer, { color: k.color }]} numberOfLines={1}>— {k.doer}</Text>
          <Text style={styles.hklWitnessed} numberOfLines={4}>{k.witnessed}</Text>
        </View>
      ))}
    </View>
  );

  const renderDailyBeacons = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🕯️ Daily beacons · a soft day-shape</Text>
        <Text style={styles.sectionCaption}>{HOME_DAILY_BEACONS.length} slots</Text>
      </View>
      {HOME_DAILY_BEACONS.map((b) => (
        <View key={b.id} style={[styles.hdbCard, { borderLeftColor: b.color }]}>
          <View style={styles.hdbTopRow}>
            <Text style={[styles.hdbSlot, { color: b.color }]}>{b.slot}</Text>
            <Text style={styles.hdbEmoji}>{b.emoji}</Text>
            <Text style={styles.hdbBeacon} numberOfLines={1}>{b.beacon}</Text>
          </View>
          <Text style={styles.hdbIntention} numberOfLines={2}>{b.intention}</Text>
        </View>
      ))}
    </View>
  );

  const renderSeasonalRituals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🪔 Seasonal rituals · our year in tokens</Text>
        <Text style={styles.sectionCaption}>{HOME_SEASONAL_RITUALS.length} seasons</Text>
      </View>
      {HOME_SEASONAL_RITUALS.map((s) => (
        <View key={s.id} style={[styles.hsrCard, { borderLeftColor: s.color }]}>
          <View style={styles.hsrTopRow}>
            <Text style={[styles.hsrSeason, { color: s.color }]}>{s.season}</Text>
            <Text style={styles.hsrEmoji}>{s.emoji}</Text>
          </View>
          <Text style={styles.hsrRitual} numberOfLines={3}>{s.ritual}</Text>
          <Text style={styles.hsrTokens} numberOfLines={2}>tokens · {s.tokens}</Text>
          <Text style={styles.hsrKeeper} numberOfLines={1}>keeper · {s.keeper}</Text>
        </View>
      ))}
    </View>
  );

  const renderCampusGroves = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌳 Campus grove · trees we are in conversation with</Text>
        <Text style={styles.sectionCaption}>{HOME_CAMPUS_GROVES.length} trees</Text>
      </View>
      {HOME_CAMPUS_GROVES.map((g) => (
        <View key={g.id} style={[styles.hcgCard, { borderLeftColor: g.color }]}>
          <View style={styles.hcgTopRow}>
            <Text style={styles.hcgEmoji}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hcgTree} numberOfLines={1}>{g.tree}</Text>
              <Text style={[styles.hcgAge, { color: g.color }]}>{g.ageYears}</Text>
            </View>
          </View>
          <Text style={styles.hcgPlanter} numberOfLines={1}>planter · {g.planter}</Text>
          <Text style={styles.hcgStory} numberOfLines={3}>{g.story}</Text>
        </View>
      ))}
    </View>
  );

  const renderKindlingKits = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🎒 Kindling kits · what we pre-pack for each other</Text>
        <Text style={styles.sectionCaption}>{HOME_KINDLING_KITS.length} kits</Text>
      </View>
      {HOME_KINDLING_KITS.map((k) => (
        <View key={k.id} style={[styles.hkkCard, { borderLeftColor: k.color }]}>
          <View style={styles.hkkTopRow}>
            <Text style={styles.hkkEmoji}>{k.emoji}</Text>
            <Text style={styles.hkkKit} numberOfLines={1}>{k.kit}</Text>
          </View>
          <Text style={styles.hkkContents} numberOfLines={3}>contents · {k.contents}</Text>
          <Text style={styles.hkkWhen} numberOfLines={2}>use · {k.useWhen}</Text>
          <Text style={[styles.hkkLearning, { color: k.color }]} numberOfLines={2}>learning · {k.learning}</Text>
        </View>
      ))}
    </View>
  );

  const renderQuietWins = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤫 Quiet wins · the stories we did not post</Text>
        <Text style={styles.sectionCaption}>{HOME_QUIET_WINS.length} wins</Text>
      </View>
      {HOME_QUIET_WINS.map((w) => (
        <View key={w.id} style={[styles.hqwCard, { borderLeftColor: w.color }]}>
          <View style={styles.hqwTopRow}>
            <Text style={styles.hqwEmoji}>{w.emoji}</Text>
            <Text style={styles.hqwWin} numberOfLines={3}>{w.win}</Text>
          </View>
          <Text style={styles.hqwQuiet} numberOfLines={3}>{w.quiet}</Text>
          <Text style={styles.hqwWho} numberOfLines={1}>— {w.who}</Text>
        </View>
      ))}
    </View>
  );

  const renderFounderNotes = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🪔 Founder notes · lanterns from different years</Text>
        <Text style={styles.sectionCaption}>{HOME_FOUNDER_NOTES.length} notes</Text>
      </View>
      {HOME_FOUNDER_NOTES.map((n) => (
        <View key={n.id} style={[styles.hfnCard, { borderLeftColor: n.color }]}>
          <View style={styles.hfnTopRow}>
            <Text style={[styles.hfnYear, { color: n.color }]}>{n.year}</Text>
            <Text style={styles.hfnEmoji}>{n.emoji}</Text>
          </View>
          <Text style={styles.hfnExcerpt} numberOfLines={6}>{n.excerpt}</Text>
          <Text style={styles.hfnWriter} numberOfLines={1}>— {n.writer}</Text>
        </View>
      ))}
    </View>
  );

  const renderClubValues = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🪴 Values · how we actually behave</Text>
        <Text style={styles.sectionCaption}>{CLUB_VALUES.length} values</Text>
      </View>
      {CLUB_VALUES.map((v) => (
        <View key={v.id} style={[styles.cvCard, { borderLeftColor: v.color }]}>
          <View style={styles.cvTopRow}>
            <Text style={styles.cvEmoji}>{v.emoji}</Text>
            <Text style={styles.cvValue} numberOfLines={2}>{v.value}</Text>
          </View>
          <Text style={[styles.cvOneLine, { color: v.color }]} numberOfLines={2}>{v.oneLine}</Text>
          <Text style={styles.cvLivesAs} numberOfLines={3}>lives as · {v.livesAs}</Text>
        </View>
      ))}
    </View>
  );

  const renderWeeklyFocus = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🎯 Weekly focus · next six weeks</Text>
        <Text style={styles.sectionCaption}>{WEEKLY_FOCUSES.length} weeks</Text>
      </View>
      {WEEKLY_FOCUSES.map((w) => (
        <View key={w.id} style={[styles.wfRow, { borderLeftColor: w.color }]}>
          <View style={styles.wfLabelCol}>
            <Text style={[styles.wfWeek, { color: w.color }]}>{w.week}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.wfTopRow}>
              <Text style={styles.wfEmoji}>{w.emoji}</Text>
              <Text style={styles.wfTheme} numberOfLines={2}>{w.theme}</Text>
            </View>
            <Text style={styles.wfAnchor} numberOfLines={2}>→ {w.anchor}</Text>
          </View>
        </View>
      ))}
    </View>
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
        {renderWeatherStrip()}
        {renderWeeklyFocus()}
        {renderQuickWins()}
        {renderQuickActions()}
        {renderAnnouncements()}
        {renderFeaturedEvents()}
        {renderCampusCal()}
        {renderCampusRituals()}
        {renderMorningPulses()}
        {renderQuietHours()}
        {renderSaplingPrograms()}
        {renderPlantingDiary()}
        {renderVolunteerSlots()}
        {renderMentorHours()}
        {renderRecommendedReads()}
        {renderEcoHabits()}
        {renderGuardianHabits()}
        {renderTrails()}
        {renderSeasonMoments()}
        {renderQuarterGoals()}
        {renderImpactRegions()}
        {renderWorkshops()}
        {renderLearningPaths()}
        {renderSavingsLedger()}
        {renderDailyRituals()}
        {renderCommunityShouts()}
        {renderImpactDashboard()}
        {renderCarbonSavings()}
        {renderPledgeStreaks()}
        {renderScoreboard()}
        {renderWeeklyDigest()}
        {renderMemberHighlights()}
        {renderLocalHeroes()}
        {renderGratitudeWall()}
        {renderGuardianCovenants()}
        {renderDailyBeacons()}
        {renderSeasonalRituals()}
        {renderCampusGroves()}
        {renderKindlingKits()}
        {renderQuietWins()}
        {renderFounderNotes()}
        {renderDawnRituals()}
        {renderDuskRituals()}
        {renderMicroMoments()}
        {renderSimplePractices()}
        {renderKindnessLedger()}
        {renderSpotlights()}
        {renderCollab()}
        {renderClubValues()}
        {renderValues()}
        {renderNorms()}
        {renderLiveFeed()}
        {renderTestimonials()}
        {renderGallery()}
        {renderBadges()}
        {renderOnboarding()}
        {renderResources()}
        {renderPartners()}
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

  // Impact dashboard
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING - 4,
  },
  impactCell: {
    width: IS_TABLET ? '33.333%' : '50%',
    padding: 4,
  },
  impactGradient: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff14',
    minHeight: 148,
  },
  impactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactEmoji: { fontSize: 22 },
  impactTrendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  impactTrendText: { fontSize: 10, fontWeight: '800' },
  impactValue: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  impactLabel: { color: Colors.text.primary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  impactCaption: { color: Colors.text.muted, fontSize: 11, marginTop: 6, lineHeight: 15 },

  // Weekly digest
  digestCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  digestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0E',
  },
  digestBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  digestBadgeDay: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  digestBadgeDate: { color: Colors.text.primary, fontSize: 15, fontWeight: '900' },
  digestSummary: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },
  digestHighlight: { fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 0.6 },

  // Quick wins
  winsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING - 4,
  },
  winCell: {
    width: IS_TABLET ? '25%' : '50%',
    padding: 4,
  },
  winEmoji: { fontSize: 22, marginBottom: 6 },
  winValue: { fontSize: 20, fontWeight: '900' },
  winLabel: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Member highlights
  memberScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10 },
  memberCard: {
    width: IS_SMALL ? 260 : 300,
    marginRight: 14,
  },
  memberGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 260,
  },
  memberTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberMonth: { color: Colors.accent.softGold, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  memberAvatar: { fontSize: 28 },
  memberName: { color: Colors.text.primary, fontSize: 18, fontWeight: '900', marginTop: 10 },
  memberRole: { color: Colors.text.secondary, fontSize: 12, marginTop: 2, fontWeight: '600' },
  memberWing: { color: Colors.tech.neonBlue, fontSize: 11, marginTop: 6, fontWeight: '700' },
  memberReason: {
    color: Colors.text.primary,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  memberTagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  memberTagPill: {
    backgroundColor: '#ffffff14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginTop: 4,
  },
  memberTagText: { color: Colors.text.secondary, fontSize: 10, fontWeight: '700' },
  memberBio: { color: Colors.text.muted, fontSize: 11, marginTop: 10, lineHeight: 15 },

  // Values pillars
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING - 4,
  },
  valueCard: {
    width: IS_TABLET ? '33.333%' : '50%',
    padding: 4,
  },
  valueBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueEmoji: { fontSize: 20 },
  valueTitle: { fontSize: 13, fontWeight: '900', marginTop: 10 },
  valueBody: { color: Colors.text.secondary, fontSize: 11, marginTop: 4, lineHeight: 15 },

  // Partners
  partnerScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10 },
  partnerCard: {
    width: 200,
    marginRight: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0D141B',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  partnerEmojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerEmoji: { fontSize: 20 },
  partnerName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 10 },
  partnerKind: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 2, textTransform: 'uppercase' },
  partnerBlurb: { color: Colors.text.secondary, fontSize: 11, marginTop: 6, lineHeight: 15 },
  partnerSince: { color: Colors.text.muted, fontSize: 10, marginTop: 8 },

  // Live feed
  feedCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0E',
  },
  feedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  feedEmoji: { fontSize: 16 },
  feedLine: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17 },
  feedActor: { color: Colors.text.primary, fontWeight: '800' },
  feedObject: { color: Colors.text.primary, fontWeight: '700' },
  feedAt: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },

  // Onboarding
  obRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    position: 'relative',
  },
  obDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  obDotEmoji: { fontSize: 18 },
  obConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    bottom: -6,
  },
  obCard: {
    flex: 1,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff0D',
  },
  obHeaderRow: { flexDirection: 'row', alignItems: 'baseline' },
  obWeek: { fontSize: 11, fontWeight: '800', marginRight: 8 },
  obTitle: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  obBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  obDeliverableRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ffffff12',
  },
  obDeliverableLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  obDeliverable: {
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  // Badges
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  badgeCard: {
    width: '33.333%',
    padding: 4,
    alignItems: 'center',
  },
  badgeOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeEmoji: { fontSize: 22 },
  badgeName: {
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  badgeRarity: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  badgeCrit: {
    color: Colors.text.muted,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 4,
    textAlign: 'center',
  },

  // Scoreboard
  sbRow: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffff0D',
  },
  sbLabelRow: { flexDirection: 'row', alignItems: 'center' },
  sbEmoji: { fontSize: 16, marginRight: 6 },
  sbMetric: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sbPct: { fontSize: 11, fontWeight: '800' },
  sbBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
    height: 80,
  },
  sbCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sbBar: { width: 22, borderRadius: 6 },
  sbColLabel: { color: Colors.text.muted, fontSize: 9, marginTop: 4 },
  sbColValue: { color: Colors.text.primary, fontSize: 10, fontWeight: '700' },

  // Norms
  normCard: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  normEmoji: { fontSize: 20, marginRight: 10 },
  normTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  normBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  // Collab
  collabCard: {
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  collabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  collabTitle: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  collabWingPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  collabWingText: { fontSize: 10, fontWeight: '800' },
  collabMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 6 },
  collabLookingFor: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  collabContact: {
    color: Colors.tech.neonBlue,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // Resources
  resourceScroll: { paddingRight: 10, paddingBottom: 4 },
  resourceCard: {
    width: 200,
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ffffff0F',
  },
  resourceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceEmoji: { fontSize: 20 },
  resourceKind: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
  },
  resourceTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  resourceBlurb: {
    color: Colors.text.muted,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
  },
  resourceFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resourceTag: { color: Colors.text.secondary, fontSize: 10, fontWeight: '700' },
  resourceUpdated: { color: Colors.text.muted, fontSize: 10 },

  // Campus cal
  calGrid: { marginTop: 4 },
  calRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ffffff10',
  },
  calDayCol: {
    width: 56,
    alignItems: 'flex-start',
  },
  calDay: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  calLabel: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  calChipCol: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  calChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  calChipText: { fontSize: 10, fontWeight: '700' },
  calEmpty: { color: Colors.text.muted, fontSize: 11, fontStyle: 'italic' },

  // Goals
  goalCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  goalTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  goalEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', flex: 1, lineHeight: 18 },
  goalStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  goalStatusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  goalQuarter: { color: Colors.text.muted, fontSize: 11, marginTop: 3 },
  goalDetail: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 8 },
  goalBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  goalBarFill: { height: '100%', borderRadius: 3 },
  goalPct: { color: Colors.text.muted, fontSize: 10, marginTop: 5 },
  goalDoneRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  goalDonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.28)',
  },
  goalDoneEmoji: { fontSize: 12, marginRight: 5 },
  goalDoneText: { color: '#4ADE80', fontSize: 11, fontWeight: '700' },

  // Impact regions
  regionCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  regionTopRow: { flexDirection: 'row', alignItems: 'center' },
  regionEmoji: { fontSize: 24, marginRight: 10 },
  regionTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  regionState: { color: Colors.text.muted, fontSize: 11, marginTop: 1 },
  regionCount: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  regionStatsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  regionStat: { flex: 1, alignItems: 'center' },
  regionStatValue: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  regionStatLabel: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  regionNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  regionDateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  regionDate: { color: Colors.text.muted, fontSize: 10 },

  // Learning paths
  lpCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  lpTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  lpEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  lpTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  lpMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 3 },
  lpSkillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  lpSkillPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  lpSkillText: { fontSize: 10, fontWeight: '700' },
  lpOutcome: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },

  // Shoutouts
  shoutCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  shoutTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  shoutEmoji: { fontSize: 18, marginRight: 10, marginTop: 2 },
  shoutHeader: { color: Colors.text.primary, fontSize: 12 },
  shoutFrom: { color: Colors.text.primary, fontSize: 12, fontWeight: '800' },
  shoutArrow: { color: Colors.text.muted, fontSize: 12 },
  shoutTo: { color: Colors.tech.neonBlue, fontSize: 12, fontWeight: '700' },
  shoutReason: { color: Colors.text.muted, fontSize: 10, marginTop: 3 },
  shoutMessage: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Workshops
  wsCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  wsTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wsEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  wsTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wsMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 3 },
  wsLevelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  wsLevelText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  wsLead: { color: Colors.text.secondary, fontSize: 11, marginTop: 6 },
  wsBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  wsBarFill: { height: '100%', borderRadius: 3 },
  wsSeat: { fontSize: 10, marginTop: 5, fontWeight: '700' },

  // Savings
  ledgerRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  ledgerEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  ledgerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ledgerLabel: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  ledgerValue: { fontSize: 12, fontWeight: '800', marginLeft: 8 },
  ledgerHint: { color: Colors.text.muted, fontSize: 11, marginTop: 3, lineHeight: 15 },
  ledgerChange: { fontSize: 11, marginTop: 4, fontWeight: '700' },

  // Rituals
  ritualRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  ritualTimeCol: { width: 50, marginRight: 10 },
  ritualTime: { fontSize: 13, fontWeight: '900' },
  ritualTopRow: { flexDirection: 'row', alignItems: 'center' },
  ritualEmoji: { fontSize: 16, marginRight: 6 },
  ritualTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  ritualDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  ritualLead: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // --- Phase 3v: weather ---
  weatherCard: {
    width: 110,
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  weatherHour: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  weatherEmoji: { fontSize: 28, marginTop: 4 },
  weatherTemp: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  weatherCond: { color: Colors.text.secondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
  weatherMeta: { color: Colors.text.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  weatherAqiRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  weatherAqiLabel: { color: Colors.text.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  weatherAqiVal: { fontSize: 12, fontWeight: '900' },

  // --- Phase 3v: saplings ---
  spCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  spTopRow: { flexDirection: 'row', alignItems: 'center' },
  spEmoji: { fontSize: 22, marginRight: 10 },
  spSite: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  spSpecies: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  spStatsCol: { alignItems: 'flex-end', marginLeft: 8 },
  spSurvival: { fontSize: 18, fontWeight: '900' },
  spSurvivalLabel: { color: Colors.text.muted, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  spBarBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 10, overflow: 'hidden' },
  spBarFill: { height: 4, borderRadius: 2 },
  spFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  spMeta: { color: Colors.text.muted, fontSize: 10 },
  spSteward: { color: Colors.text.muted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },

  // --- Phase 3v: mentor hours ---
  mhRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  mhEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  mhTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mhMentor: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  mhDay: { fontSize: 11, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  mhRole: { color: Colors.text.muted, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  mhTopic: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },
  mhMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  mhMode: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  mhModeText: { color: Colors.text.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  mhCap: { color: Colors.text.muted, fontSize: 10 },

  // --- Phase 3v: recommended reads ---
  rrCard: {
    width: 180,
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  rrEmoji: { fontSize: 28 },
  rrKind: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 6 },
  rrTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17, marginTop: 4 },
  rrAuthor: { color: Colors.text.muted, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  rrMin: { color: Colors.text.secondary, fontSize: 10, marginTop: 6 },
  rrWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },

  // --- Phase 3v: volunteer slots ---
  vsRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  vsEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  vsTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vsDrive: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  vsKindPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
    borderWidth: 1,
  },
  vsKindText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  vsDate: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  vsBarBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 8, overflow: 'hidden' },
  vsBarFill: { height: 4, borderRadius: 2 },
  vsSeats: { color: Colors.text.secondary, fontSize: 10, marginTop: 4 },

  // --- Phase 3v: eco habits ---
  ehCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  ehTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ehEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  ehHabit: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  ehDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  ehFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingLeft: 32 },
  ehStreak: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  ehCo2: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },

  // --- Phase 3v: trails ---
  trCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  trEmoji: { fontSize: 22, marginRight: 10 },
  trName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  trMeta: { color: Colors.text.secondary, fontSize: 11, marginTop: 3 },
  trDiff: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
    borderWidth: 1,
  },
  trDiffText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },

  // --- Phase 3ab: campus rituals ---
  crhCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  crhTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  crhEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  crhRitual: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  crhWhen: { color: Colors.text.secondary, fontSize: 11, marginTop: 3 },
  crhDay: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  crhWhy: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ab: seasons ---
  smCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  smTopRow: { flexDirection: 'row', alignItems: 'center' },
  smEmoji: { fontSize: 22, marginRight: 10 },
  smMoment: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  smSeason: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  smDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ab: local heroes ---
  lhCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  lhTopRow: { flexDirection: 'row', alignItems: 'center' },
  lhEmoji: { fontSize: 24, marginRight: 10 },
  lhName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  lhRole: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700', marginTop: 2 },
  lhStory: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 34 },
  lhLearned: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 34, fontStyle: 'italic' },

  // --- Phase 3ab: guardian habits ---
  ghCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  ghTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  ghEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  ghHabit: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  ghCadence: { color: Colors.text.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  ghStreak: { fontSize: 14, fontWeight: '900', marginLeft: 8 },
  ghDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ab: club values ---
  cvCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  cvTopRow: { flexDirection: 'row', alignItems: 'center' },
  cvEmoji: { fontSize: 22, marginRight: 10 },
  cvValue: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  cvOneLine: { fontSize: 12, fontWeight: '700', marginTop: 6, paddingLeft: 32, fontStyle: 'italic' },
  cvLivesAs: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3ab: weekly focus ---
  wfRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  wfLabelCol: { width: 68, marginRight: 10, paddingTop: 2 },
  wfWeek: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  wfTopRow: { flexDirection: 'row', alignItems: 'center' },
  wfEmoji: { fontSize: 18, marginRight: 8 },
  wfTheme: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  wfAnchor: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },

  // --- Phase 3ai: morning pulses ---
  mpCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  mpTopRow: { flexDirection: 'row', alignItems: 'center' },
  mpEmoji: { fontSize: 20, marginRight: 10 },
  mpTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1 },
  mpDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 30 },
  mpHint: { color: Colors.accent.softGold, fontSize: 10, lineHeight: 14, marginTop: 4, paddingLeft: 30, fontStyle: 'italic' },

  // --- Phase 3ai: quiet hours ---
  qhCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  qhTopRow: { flexDirection: 'row', alignItems: 'center' },
  qhEmoji: { fontSize: 20, marginRight: 10 },
  qhRange: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  qhWhere: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  qhRule: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 30 },
  qhHost: { color: Colors.text.muted, fontSize: 10, marginTop: 4, paddingLeft: 30, fontStyle: 'italic' },

  // --- Phase 3ai: planting diary ---
  pdCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  pdTopRow: { flexDirection: 'row', alignItems: 'center' },
  pdEmoji: { fontSize: 20, marginRight: 10 },
  pdSpecies: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  pdLoc: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  pdDate: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 8 },
  pdGuardian: { color: Colors.text.secondary, fontSize: 11, marginTop: 6, paddingLeft: 30 },
  pdStatus: { color: Colors.nature.leafGreen, fontSize: 11, marginTop: 2, paddingLeft: 30, fontWeight: '700' },

  // --- Phase 3ai: carbon savings ---
  csCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  csTopRow: { flexDirection: 'row', alignItems: 'center' },
  csEmoji: { fontSize: 20, marginRight: 10 },
  csLabel: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  csMetricRow: { flexDirection: 'row', marginTop: 10, paddingLeft: 30 },
  csMetricCol: { flex: 1 },
  csMetricLabel: { color: Colors.text.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  csMetricValue: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  csMethod: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 30 },

  // --- Phase 3ai: pledge streaks ---
  psCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  psTopRow: { flexDirection: 'row', alignItems: 'center' },
  psEmoji: { fontSize: 20, marginRight: 10 },
  psPledge: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  psStreak: { color: Colors.accent.softGold, fontSize: 10, fontWeight: '700', marginTop: 2 },
  psPct: { fontSize: 17, fontWeight: '900', marginLeft: 8 },
  psBarBg: { height: 6, backgroundColor: '#1A2330', borderRadius: 3, marginTop: 8, marginLeft: 30, overflow: 'hidden' },
  psBarFill: { height: '100%', borderRadius: 3 },
  psKept: { color: Colors.text.muted, fontSize: 10, marginTop: 4, paddingLeft: 30 },

  // --- Phase 3ai: gratitude wall ---
  gwCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  gwTopRow: { flexDirection: 'row', alignItems: 'center' },
  gwEmoji: { fontSize: 20, marginRight: 10 },
  gwFrom: { color: Colors.text.primary, fontSize: 12, fontWeight: '800' },
  gwDay: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  gwLine: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 8, paddingLeft: 30, fontStyle: 'italic' },

  // --- Phase 3ai: guardian covenants ---
  gcCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  gcTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  gcEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  gcPromise: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  gcBecause: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 30, fontStyle: 'italic' },

  // --- Phase 3ao: daily beacons ---
  hdbCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hdbTopRow: { flexDirection: 'row', alignItems: 'center' },
  hdbSlot: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5, marginRight: 10, width: 100 },
  hdbEmoji: { fontSize: 20, marginRight: 8 },
  hdbBeacon: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  hdbIntention: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 40 },

  // --- Phase 3ao: seasonal rituals ---
  hsrCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 14, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hsrTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hsrSeason: { fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  hsrEmoji: { fontSize: 24 },
  hsrRitual: { color: Colors.text.primary, fontSize: 13, lineHeight: 17, marginTop: 8 },
  hsrTokens: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },
  hsrKeeper: { color: Colors.text.muted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },

  // --- Phase 3ao: campus groves ---
  hcgCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hcgTopRow: { flexDirection: 'row', alignItems: 'center' },
  hcgEmoji: { fontSize: 24, marginRight: 10 },
  hcgTree: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  hcgAge: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  hcgPlanter: { color: Colors.text.muted, fontSize: 11, marginTop: 8, paddingLeft: 34 },
  hcgStory: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 34 },

  // --- Phase 3ao: kindling kits ---
  hkkCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hkkTopRow: { flexDirection: 'row', alignItems: 'center' },
  hkkEmoji: { fontSize: 22, marginRight: 10 },
  hkkKit: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1 },
  hkkContents: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  hkkWhen: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 32 },
  hkkLearning: { fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ao: quiet wins ---
  hqwCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hqwTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hqwEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  hqwWin: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  hqwQuiet: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32, fontStyle: 'italic' },
  hqwWho: { color: Colors.text.muted, fontSize: 11, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ao: founder notes ---
  hfnCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 14, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hfnTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hfnYear: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  hfnEmoji: { fontSize: 24 },
  hfnExcerpt: { color: Colors.text.primary, fontSize: 13, lineHeight: 19, marginTop: 10, fontStyle: 'italic' },
  hfnWriter: { color: Colors.accent.softGold, fontSize: 11, marginTop: 8, fontWeight: '700' },

  // --- Phase 3at: dawn rituals ---
  hdrCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hdrTopRow: { flexDirection: 'row', alignItems: 'center' },
  hdrEmoji: { fontSize: 22, marginRight: 10 },
  hdrName: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  hdrWindow: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  hdrPractice: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },

  // --- Phase 3at: dusk rituals ---
  hdkCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hdkTopRow: { flexDirection: 'row', alignItems: 'center' },
  hdkEmoji: { fontSize: 22, marginRight: 10 },
  hdkName: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  hdkWindow: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  hdkPractice: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },

  // --- Phase 3at: micro-moments ---
  hmmCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hmmTopRow: { flexDirection: 'row', alignItems: 'center' },
  hmmEmoji: { fontSize: 22, marginRight: 10 },
  hmmMoment: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1, lineHeight: 17 },
  hmmWhere: { fontSize: 11, fontWeight: '700', marginTop: 8, paddingLeft: 32 },
  hmmWhen: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3at: simple practices ---
  hspCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hspTopRow: { flexDirection: 'row', alignItems: 'center' },
  hspEmoji: { fontSize: 22, marginRight: 10 },
  hspName: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1 },
  hspDaily: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  hspMonthly: { fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontWeight: '700' },

  // --- Phase 3at: kindness ledger ---
  hklCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 14, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  hklTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hklEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  hklDeed: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  hklDoer: { fontSize: 11, marginTop: 8, fontWeight: '800', paddingLeft: 32 },
  hklWitnessed: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },
});

export default HomeScreen;
