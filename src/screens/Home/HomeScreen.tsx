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
        {renderQuickWins()}
        {renderQuickActions()}
        {renderAnnouncements()}
        {renderFeaturedEvents()}
        {renderCampusCal()}
        {renderQuarterGoals()}
        {renderImpactRegions()}
        {renderWorkshops()}
        {renderLearningPaths()}
        {renderSavingsLedger()}
        {renderDailyRituals()}
        {renderCommunityShouts()}
        {renderImpactDashboard()}
        {renderScoreboard()}
        {renderWeeklyDigest()}
        {renderMemberHighlights()}
        {renderSpotlights()}
        {renderCollab()}
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
});

export default HomeScreen;
