// =====================================================
// TARU GUARDIANS — SUGGESTION BOX (Premium Screen)
// Submit · vote · track · trending · roadmap · analytics
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
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Pressable,
  Easing,
  Switch,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Suggestion, SuggestionCategory } from '../../types/navigation';

// -----------------------------------------------------
// Responsive + design tokens
// -----------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 22;

const ANIM = {
  duration: { fast: 200, normal: 360, slow: 540, xslow: 820 },
  easing: {
    inOut: Easing.inOut(Easing.cubic),
    out: Easing.out(Easing.cubic),
    soft: Easing.bezier(0.25, 0.1, 0.25, 1),
    overshoot: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
};

// -----------------------------------------------------
// Categories
// -----------------------------------------------------

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'event',
    name: 'Event Ideas',
    icon: '🎉',
    color: '#F59E0B',
    description: 'Hackathons, workshops, clean-ups, talks, cultural nights.',
  },
  {
    id: 'improvement',
    name: 'Improvements',
    icon: '💡',
    color: '#38BDF8',
    description: 'Make existing programs smoother, clearer, and more inclusive.',
  },
  {
    id: 'partnership',
    name: 'Partnerships',
    icon: '🤝',
    color: '#C084FC',
    description: 'NGOs, companies, alumni, labs and student communities.',
  },
  {
    id: 'program',
    name: 'Programs',
    icon: '📚',
    color: '#4ADE80',
    description: 'New learning paths, mentorship tracks, certification plans.',
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    icon: '🌱',
    color: '#22C55E',
    description: 'Green campus, zero-waste events, climate action.',
  },
  {
    id: 'tech',
    name: 'Tech & Tools',
    icon: '🛠️',
    color: '#2DD4BF',
    description: 'App features, automation, developer tooling.',
  },
  {
    id: 'culture',
    name: 'Club Culture',
    icon: '🫶',
    color: '#F472B6',
    description: 'Inclusivity, mentorship, onboarding, mental-health.',
  },
  {
    id: 'marketing',
    name: 'Outreach',
    icon: '📣',
    color: '#FB7185',
    description: 'Reach, branding, social media, storytelling.',
  },
  {
    id: 'other',
    name: 'Other',
    icon: '💭',
    color: '#94A3B8',
    description: 'Open-ended ideas that don\'t fit any bucket yet.',
  },
];

type FilterStatus = 'all' | 'pending' | 'reviewed' | 'implemented' | 'rejected';
type SortKey =
  | 'most-voted'
  | 'newest'
  | 'oldest'
  | 'priority-high'
  | 'priority-low'
  | 'alphabetical';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'most-voted', label: 'Most upvoted', icon: '🔥' },
  { key: 'newest', label: 'Newest first', icon: '🆕' },
  { key: 'oldest', label: 'Oldest first', icon: '📜' },
  { key: 'priority-high', label: 'Priority · high → low', icon: '🎯' },
  { key: 'priority-low', label: 'Priority · low → high', icon: '🪶' },
  { key: 'alphabetical', label: 'A → Z', icon: '🔤' },
];

const STATUS_META: Record<
  Suggestion['status'],
  { label: string; color: string; icon: string; description: string }
> = {
  pending: {
    label: 'Pending review',
    color: '#F59E0B',
    icon: '⏳',
    description: 'Not reviewed yet by the council.',
  },
  reviewed: {
    label: 'In review',
    color: '#38BDF8',
    icon: '👀',
    description: 'Council is discussing this suggestion.',
  },
  implemented: {
    label: 'Implemented',
    color: '#4ADE80',
    icon: '✅',
    description: 'Already live — thanks for contributing!',
  },
  rejected: {
    label: 'Rejected',
    color: '#F87171',
    icon: '❌',
    description: 'Not a good fit right now. See the council note for details.',
  },
};

const PRIORITY_META: Record<Suggestion['priority'], { label: string; color: string; icon: string }> = {
  high: { label: 'High', color: '#F87171', icon: '🚀' },
  medium: { label: 'Medium', color: '#FBBF24', icon: '⚡' },
  low: { label: 'Low', color: '#A3E635', icon: '🌿' },
};

// -----------------------------------------------------
// Dataset
// -----------------------------------------------------

interface ExtSuggestion extends Suggestion {
  authorName?: string;
  tags: string[];
  upvotedByMe?: boolean;
  commentCount: number;
  reviewedBy?: string;
  reviewerNote?: string;
  estimatedQuarter?: string;
  roadmap?: { label: string; done: boolean }[];
}

const makeSuggestion = (
  id: number,
  category: string,
  title: string,
  description: string,
  priority: Suggestion['priority'],
  status: Suggestion['status'],
  daysAgo: number,
  votes: number,
  tags: string[],
  opts?: Partial<ExtSuggestion>
): ExtSuggestion => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: String(id),
    category,
    title,
    description,
    priority,
    status,
    submittedAt: date.toISOString().split('T')[0],
    votedCount: votes,
    isAnonymous: opts?.isAnonymous ?? false,
    authorName: opts?.authorName,
    tags,
    upvotedByMe: opts?.upvotedByMe ?? false,
    commentCount: opts?.commentCount ?? Math.floor(votes / 6),
    reviewedBy: opts?.reviewedBy,
    reviewerNote: opts?.reviewerNote,
    estimatedQuarter: opts?.estimatedQuarter,
    roadmap: opts?.roadmap,
  };
};

const SAMPLE_SUGGESTIONS: ExtSuggestion[] = [
  makeSuggestion(
    1,
    'event',
    'Weekend nature camping + tree plantation',
    'Two-day trip to Nandi Hills with a guided tree-planting session, bonfire night, and an alumni fireside. Bus + food + guides covered by small fee — partially funded from sustainability pledge.',
    'high',
    'reviewed',
    4,
    97,
    ['offline', 'sustainability', 'bonding'],
    {
      authorName: 'Anaya V.',
      commentCount: 12,
      reviewedBy: 'Core Council',
      reviewerNote: 'Looks strong. Pre-budget approval done; awaiting venue confirmation for 3 weekends.',
      estimatedQuarter: '2026 Q2',
      roadmap: [
        { label: 'Shortlist 3 venues', done: true },
        { label: 'Budget + sponsorships', done: true },
        { label: 'Volunteer onboarding', done: false },
        { label: 'Transport + food logistics', done: false },
        { label: 'Post-trip impact report', done: false },
      ],
    }
  ),
  makeSuggestion(
    2,
    'improvement',
    'Better event promotion pipeline',
    'Current event poster → WhatsApp → forget cycle is broken. Proposal: 4-step content calendar + teaser reels + alumni amplification + countdown push notifications 48 hrs pre-event.',
    'medium',
    'reviewed',
    8,
    64,
    ['marketing', 'growth'],
    {
      authorName: 'Ishita R.',
      commentCount: 9,
      reviewedBy: 'Marketing Wing',
      reviewerNote: 'Picking up from next month — pilot with 2 events.',
      estimatedQuarter: '2026 Q2',
      roadmap: [
        { label: 'Create templates', done: true },
        { label: 'Onboard 4 content volunteers', done: true },
        { label: 'Pilot with 2 events', done: false },
        { label: 'Measure reach lift', done: false },
      ],
    }
  ),
  makeSuggestion(
    3,
    'partnership',
    'Local NGO co-run program',
    'Co-design a 6-month "Tech for Good" program with 2 Bangalore-based NGOs (education + sanitation). Students build actual tools they use. Measured impact only.',
    'high',
    'implemented',
    22,
    131,
    ['impact', 'ngo', 'project-based'],
    {
      authorName: 'Lavanya I.',
      commentCount: 23,
      reviewedBy: 'Council + NGO Partners',
      reviewerNote: 'Live since this semester. 34 students onboarded.',
      estimatedQuarter: '2025 Q4',
    }
  ),
  makeSuggestion(
    4,
    'program',
    'Alumni-led mentorship tracks',
    'Launch 5-week structured mentor tracks (product, data, design, research, founders). Alumni host weekly 60-min sessions. Mentees commit to weekly deliverables. Cohort-based.',
    'high',
    'pending',
    2,
    58,
    ['mentorship', 'career'],
    {
      authorName: 'Priya S.',
      commentCount: 7,
    }
  ),
  makeSuggestion(
    5,
    'tech',
    'Mobile app — native push + quick RSVP',
    'Push for event reminders + one-tap RSVP + QR ticket. Reduce attendance drop-offs. Also: "joining from" field to understand club reach.',
    'high',
    'reviewed',
    1,
    112,
    ['app', 'rsvp', 'mobile'],
    {
      authorName: 'Parth S.',
      commentCount: 18,
      reviewedBy: 'Tech Wing',
      reviewerNote: 'Already building. Beta in 4 weeks.',
      estimatedQuarter: '2026 Q2',
      roadmap: [
        { label: 'UX flow locked', done: true },
        { label: 'Push notifications wiring', done: true },
        { label: 'QR scan', done: false },
        { label: 'Beta rollout', done: false },
      ],
    }
  ),
  makeSuggestion(
    6,
    'sustainability',
    'Zero-waste event checklist',
    'Every on-campus event to follow a 10-point zero-waste checklist — no single-use plastic, composting, reusable tableware, measured carbon footprint published after.',
    'medium',
    'reviewed',
    10,
    72,
    ['green', 'policy'],
    {
      authorName: 'Rahul (anon)',
      isAnonymous: true,
      reviewedBy: 'Sustainability Wing',
      reviewerNote: 'Checklist drafted; piloting at upcoming 3 events.',
      estimatedQuarter: '2026 Q2',
    }
  ),
  makeSuggestion(
    7,
    'culture',
    'Mental-health first-aid for lead team',
    'Train all Wing heads on mental-health first-aid. Pair with anonymous support channel. External facilitator once per semester.',
    'high',
    'reviewed',
    15,
    89,
    ['wellbeing', 'inclusion'],
    {
      authorName: 'Anon',
      isAnonymous: true,
      reviewedBy: 'Culture Committee',
      reviewerNote: 'Approved. Facilitator shortlisted.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    8,
    'marketing',
    'YouTube show — Taru Talks (biweekly)',
    '15-min conversation show with alumni + industry guests. One long-form + three shorts per episode. Goal: brand + reach + alumni re-engagement.',
    'medium',
    'pending',
    3,
    47,
    ['video', 'brand'],
    {
      authorName: 'Sana F.',
      commentCount: 6,
    }
  ),
  makeSuggestion(
    9,
    'event',
    'Hackathon with sustainability theme',
    '36-hour hackathon: "climate + community". Teams ship prototype + 2-min pitch video. Alumni mentors for 6 hours checkpoint nights.',
    'high',
    'reviewed',
    6,
    101,
    ['hackathon', 'sustainability'],
    {
      authorName: 'Vikram K.',
      reviewedBy: 'Tech + Sustainability Wings',
      reviewerNote: 'Dates locked for Oct. Sponsorship confirmations pending.',
      estimatedQuarter: '2026 Q4',
      roadmap: [
        { label: 'Sponsors', done: false },
        { label: 'Venue + food', done: true },
        { label: 'Mentor pool', done: true },
        { label: 'Judging criteria', done: false },
      ],
    }
  ),
  makeSuggestion(
    10,
    'improvement',
    'Onboarding — first 2 weeks playbook',
    'New members feel lost in the first fortnight. Proposal: assigned buddy, 7-day challenge, wing demo, and Week-2 feedback huddle.',
    'high',
    'pending',
    1,
    68,
    ['onboarding', 'people'],
    { authorName: 'Komal A.', commentCount: 10 }
  ),
  makeSuggestion(
    11,
    'program',
    'AI labs fortnightly — hands-on',
    'Biweekly 90-minute hands-on AI lab (transformers, vector DBs, agents). Split: 30 theory, 60 lab. Bring-your-laptop. Led by 2 alumni.',
    'medium',
    'reviewed',
    12,
    83,
    ['ai', 'labs'],
    {
      authorName: 'Shalini Y.',
      reviewedBy: 'Tech Wing',
      reviewerNote: 'Semester pilot with 4 sessions.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    12,
    'partnership',
    'Hardware lab @ city maker space',
    'Partner with a local maker space for monthly Saturdays — 3D print, laser, electronics. Esp. useful for PR / Video / GD + cleantech teams.',
    'low',
    'pending',
    9,
    32,
    ['hardware', 'makerspace'],
    { authorName: 'Sanjay R.', commentCount: 3 }
  ),
  makeSuggestion(
    13,
    'tech',
    'In-app anonymous feedback',
    'Anonymous "tell the council" channel in-app. Guaranteed response-within-14-days SLA. Filterable by wing.',
    'high',
    'pending',
    1,
    55,
    ['feedback', 'inclusion'],
    { authorName: 'Anon', isAnonymous: true, commentCount: 4 }
  ),
  makeSuggestion(
    14,
    'sustainability',
    'Plant 2000 native saplings — monsoon drive',
    'Partnered drive during monsoon. Chosen native species only — verified survival rate targeted 70%+ with post-plantation follow-up.',
    'high',
    'reviewed',
    20,
    126,
    ['plantation', 'native-species'],
    {
      authorName: 'Geetika B.',
      reviewedBy: 'Sustainability Wing',
      reviewerNote: 'Venue done. Saplings booked with Nagara Seva.',
      estimatedQuarter: '2026 Q3',
      roadmap: [
        { label: 'Species shortlist', done: true },
        { label: 'Sites confirmation', done: true },
        { label: 'Sponsor logistics', done: false },
        { label: 'Plantation day', done: false },
        { label: '3-month survival report', done: false },
      ],
    }
  ),
  makeSuggestion(
    15,
    'culture',
    'Ladies-in-tech chapter',
    'Dedicated chapter + allies council + monthly rituals. Goal: representation > 40% in event organizers + tech-lead roles within 2 semesters.',
    'high',
    'reviewed',
    18,
    108,
    ['diversity', 'women-in-tech'],
    {
      authorName: 'Divya M.',
      reviewedBy: 'Culture Committee',
      reviewerNote: 'Approved unanimously. Kickoff next month.',
      estimatedQuarter: '2026 Q2',
    }
  ),
  makeSuggestion(
    16,
    'marketing',
    'Campus ambassador program',
    'Short-term ambassadorship for 20 students across 6 colleges — regional chapters. Content templates + training + monthly recognition.',
    'medium',
    'pending',
    5,
    41,
    ['growth', 'community'],
    { authorName: 'Nandini R.', commentCount: 8 }
  ),
  makeSuggestion(
    17,
    'event',
    'Alumni weekend + campus connect',
    'Flagship weekend event: alumni return, run sessions for juniors, share war stories, share leads. Outcome: 10+ alumni mentorship contracts signed live.',
    'medium',
    'reviewed',
    14,
    92,
    ['alumni', 'flagship'],
    {
      authorName: 'Aditya R.',
      reviewedBy: 'Alumni Committee',
      reviewerNote: 'Dates locked. Venue secured. Alumni invites out.',
      estimatedQuarter: '2026 Q4',
    }
  ),
  makeSuggestion(
    18,
    'program',
    'Design fundamentals bootcamp (2 weeks)',
    '2-week mini bootcamp on design fundamentals — typography, colour, information hierarchy, basic motion. Open to non-designers.',
    'low',
    'pending',
    7,
    36,
    ['design', 'bootcamp'],
    { authorName: 'Sneha G.', commentCount: 5 }
  ),
  makeSuggestion(
    19,
    'tech',
    'Internal knowledge base + search',
    'Notion-based internal wiki — searchable; every project mandates "process learnings" page. Tag taxonomy maintained by volunteers.',
    'medium',
    'implemented',
    28,
    58,
    ['knowledge', 'process'],
    {
      authorName: 'Megha S.',
      reviewedBy: 'Tech Wing',
      reviewerNote: 'Live at /wiki. 120+ pages after first month.',
      estimatedQuarter: '2025 Q4',
    }
  ),
  makeSuggestion(
    20,
    'sustainability',
    'Swap-circle: clothes / books / gadgets',
    'Quarterly in-campus swap circle. Bring items you don\'t use, take home items you need. Zero money. Measured: kg of items swapped + landfill avoided.',
    'low',
    'pending',
    4,
    43,
    ['circular', 'reuse'],
    { authorName: 'Anaya V.', commentCount: 3 }
  ),
  makeSuggestion(
    21,
    'partnership',
    'Govt. incubator alignment',
    'Align our founder track with the state govt\'s incubator program — access to seed, mentors, and compliance help.',
    'medium',
    'rejected',
    40,
    22,
    ['govt', 'incubator'],
    {
      authorName: 'Karan M.',
      reviewedBy: 'Council',
      reviewerNote: 'Too much paperwork overhead for this semester. Revisit next year.',
    }
  ),
  makeSuggestion(
    22,
    'culture',
    'No-laptop Friday evenings',
    'Every 2nd Friday evening — 2 hrs — lounge-night in club room. Board games, chai, music. Phone-only-for-photos.',
    'low',
    'pending',
    6,
    29,
    ['social', 'offline'],
    { authorName: 'Tanmay J.', commentCount: 4 }
  ),
  makeSuggestion(
    23,
    'event',
    'Taru Film Night — short film screening',
    'Monthly screening of 3 student short films + 1 guest filmmaker. Q&A with filmmakers. Popcorn on the house.',
    'low',
    'pending',
    3,
    26,
    ['film', 'social'],
    { authorName: 'Ritu S.', commentCount: 1 }
  ),
  makeSuggestion(
    24,
    'improvement',
    'Meeting minutes templates',
    'Every wing meeting → short template, stored in wiki. 1 week SLA. Transparent backlog for members.',
    'medium',
    'implemented',
    50,
    39,
    ['process', 'transparency'],
    {
      authorName: 'Tejas S.',
      reviewedBy: 'Core Council',
      reviewerNote: 'Live, templates on the wiki.',
      estimatedQuarter: '2025 Q4',
    }
  ),
  makeSuggestion(
    25,
    'program',
    'Research reading group',
    'Fortnightly reading group: pick a paper, split into mini teams, present a 10-min summary + 5-min critique.',
    'medium',
    'pending',
    8,
    45,
    ['research', 'reading'],
    { authorName: 'Kavya N.', commentCount: 6 }
  ),
  makeSuggestion(
    26,
    'marketing',
    'Annual impact report — public',
    'Publish an annual impact report (events run, people reached, trees planted, placements) openly. Builds trust + accountability.',
    'medium',
    'pending',
    2,
    51,
    ['transparency', 'brand'],
    { authorName: 'Priyanshi J.', commentCount: 2 }
  ),
  makeSuggestion(
    27,
    'sustainability',
    'Energy audit of club room',
    '1-time student-led energy audit + LEDs + timer-based loads + smart meter. Baseline → show 20% reduction in 3 months.',
    'low',
    'reviewed',
    30,
    34,
    ['energy', 'green'],
    {
      authorName: 'Nisha P.',
      reviewedBy: 'Sustainability Wing',
      reviewerNote: 'Baseline measurement done. Ordering LEDs this month.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    28,
    'tech',
    'Gamified contribution badges',
    'Earn badges for events organized, content published, projects shipped. Visible on profile; unlocks perks (priority RSVP etc).',
    'low',
    'pending',
    11,
    38,
    ['gamification'],
    { authorName: 'Yash A.', commentCount: 3 }
  ),
  makeSuggestion(
    29,
    'event',
    'Cross-college debate series',
    'Structured debates with 2 other colleges — monthly. Topics: technology + ethics + climate + policy.',
    'medium',
    'pending',
    5,
    44,
    ['debate', 'intercollege'],
    { authorName: 'Sana F.', commentCount: 5 }
  ),
  makeSuggestion(
    30,
    'partnership',
    'Rural school tech literacy drive',
    'Quarterly trip to a rural school — basic tech literacy + storytelling with visits to alumni-owned factories if nearby.',
    'high',
    'reviewed',
    18,
    74,
    ['rural', 'education'],
    {
      authorName: 'Sara D.',
      reviewedBy: 'Partnership Wing',
      reviewerNote: 'First trip planned with an NGO partner.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    31,
    'improvement',
    'Clearer role descriptions per wing',
    'Each wing maintains 1-pager role docs. Stops the "what does Content Writer actually do?" confusion.',
    'low',
    'implemented',
    36,
    25,
    ['process', 'roles'],
    {
      authorName: 'Ayaan S.',
      reviewedBy: 'Council',
      reviewerNote: 'Live in wiki.',
      estimatedQuarter: '2025 Q3',
    }
  ),
  makeSuggestion(
    32,
    'program',
    'Founder track — open office hours',
    'Weekly 2-hour office hours for aspiring founders with rotating alumni founders. Bring a problem, leave with concrete next steps.',
    'high',
    'pending',
    2,
    67,
    ['founders', 'office-hours'],
    { authorName: 'Siddharth N.', commentCount: 8 }
  ),
  makeSuggestion(
    33,
    'culture',
    'Intern diaries — social posts by current interns',
    'Interns from alumni companies post 1 short note per week — what they\'re learning, struggling with. Public. Raw. No polish.',
    'low',
    'pending',
    7,
    29,
    ['authentic', 'intern'],
    { authorName: 'Bhoomika D.', commentCount: 3 }
  ),
  makeSuggestion(
    34,
    'marketing',
    'Short-form storytelling library',
    'Build a shared library of student stories (short videos + transcripts). Use for social + recruiting + impact report.',
    'medium',
    'pending',
    6,
    33,
    ['storytelling', 'library'],
    { authorName: 'Ritu S.', commentCount: 2 }
  ),
  makeSuggestion(
    35,
    'tech',
    'Club website redesign',
    'Site looks 2017. Full redesign: faster, cleaner, SEO-friendly. Integrate with alumni directory + live events.',
    'high',
    'reviewed',
    13,
    86,
    ['website', 'brand'],
    {
      authorName: 'Gaurav K.',
      reviewedBy: 'Tech Wing',
      reviewerNote: 'Design phase kickoff next sprint. Alumni designer onboard.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    36,
    'sustainability',
    'Composting setup on campus',
    'Small composting unit — every event\'s organic waste → compost → gardens. Visual transparency on amount composted.',
    'medium',
    'pending',
    10,
    42,
    ['compost', 'zero-waste'],
    { authorName: 'Geetika B.', commentCount: 5 }
  ),
  makeSuggestion(
    37,
    'event',
    'Alumni AMA — async style',
    'Open thread every 2 weeks with 1 alumnus answering anything. 24-hour window. Archived for future members.',
    'low',
    'pending',
    4,
    31,
    ['ama', 'async'],
    { authorName: 'Ashish G.', commentCount: 1 }
  ),
  makeSuggestion(
    38,
    'improvement',
    'Semester KPIs + reviews',
    'Each wing picks 3 semester KPIs. Reviewed at end of semester. Publish outcomes (success + failure).',
    'medium',
    'reviewed',
    22,
    55,
    ['kpi', 'process'],
    {
      authorName: 'Harsh V.',
      reviewedBy: 'Core Council',
      reviewerNote: 'Pilot this semester with wing leads.',
      estimatedQuarter: '2026 Q3',
    }
  ),
  makeSuggestion(
    39,
    'program',
    'Women founders circle',
    'Semester-long circle for women interested in building. Structured curriculum + alumni mentors + showcase at end.',
    'high',
    'pending',
    3,
    61,
    ['women', 'founders'],
    { authorName: 'Bhoomika D.', commentCount: 7 }
  ),
  makeSuggestion(
    40,
    'other',
    'Club jersey re-design',
    'Minimal, earthy, genuinely wearable. Bamboo-blend fabric. Priced close to cost. Limited-edition each year.',
    'low',
    'pending',
    8,
    28,
    ['merchandise'],
    { authorName: 'Komal A.', commentCount: 3 }
  ),
];

// -----------------------------------------------------
// Computed aggregates
// -----------------------------------------------------

const totalSuggestions = () => SAMPLE_SUGGESTIONS.length;
const totalVotes = () => SAMPLE_SUGGESTIONS.reduce((acc, s) => acc + s.votedCount, 0);
const implementedCount = () => SAMPLE_SUGGESTIONS.filter((s) => s.status === 'implemented').length;
const inReviewCount = () => SAMPLE_SUGGESTIONS.filter((s) => s.status === 'reviewed').length;
const pendingCount = () => SAMPLE_SUGGESTIONS.filter((s) => s.status === 'pending').length;

// -----------------------------------------------------
// Trending tags
// -----------------------------------------------------

const TRENDING_TAGS = (() => {
  const m = new Map<string, number>();
  SAMPLE_SUGGESTIONS.forEach((s) => s.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);
})();

// -----------------------------------------------------
// Roadmap aggregation (from implemented/reviewed entries)
// -----------------------------------------------------

const ROADMAP_ITEMS = SAMPLE_SUGGESTIONS
  .filter((s) => !!s.estimatedQuarter)
  .sort((a, b) =>
    (a.estimatedQuarter ?? 'zzz').localeCompare(b.estimatedQuarter ?? 'zzz')
  )
  .slice(0, 14);

// -----------------------------------------------------
// Contributor leaderboard — top voices
// -----------------------------------------------------

interface ContributorStanding {
  id: string;
  name: string;
  avatar: string;
  color: string;
  submitted: number;
  shipped: number;
  votesEarned: number;
  tag: string;
  streak: number;
}

const LEADERBOARD: ContributorStanding[] = [
  { id: 'cb-1', name: 'Ananya Pillai',   avatar: '🌱', color: '#F59E0B', submitted: 18, shipped: 7, votesEarned: 412, tag: 'Content · long-form', streak: 9 },
  { id: 'cb-2', name: 'Vivaan Shetty',   avatar: '🔧', color: '#38BDF8', submitted: 14, shipped: 9, votesEarned: 398, tag: 'Web · release eng',   streak: 12 },
  { id: 'cb-3', name: 'Ishita Kalra',    avatar: '🎨', color: '#F472B6', submitted: 12, shipped: 5, votesEarned: 287, tag: 'Design · motion',     streak: 6 },
  { id: 'cb-4', name: 'Aryan Deshmuk',   avatar: '🎥', color: '#A78BFA', submitted: 10, shipped: 4, votesEarned: 241, tag: 'Video · edit lab',    streak: 4 },
  { id: 'cb-5', name: 'Kavya Iyer',      avatar: '🎟️', color: '#F97316', submitted: 16, shipped: 6, votesEarned: 331, tag: 'Events · ops',        streak: 8 },
  { id: 'cb-6', name: 'Rohit Bansal',    avatar: '💻', color: '#22C55E', submitted: 9,  shipped: 8, votesEarned: 276, tag: 'Web · RN perf',       streak: 11 },
  { id: 'cb-7', name: 'Nivedita Rao',    avatar: '📚', color: '#6366F1', submitted: 11, shipped: 3, votesEarned: 198, tag: 'Research · briefs',   streak: 5 },
  { id: 'cb-8', name: 'Aarav Menon',     avatar: '🌳', color: '#16A34A', submitted: 13, shipped: 5, votesEarned: 254, tag: 'Sustainability',      streak: 10 },
  { id: 'cb-9', name: 'Tanvi Shah',      avatar: '🖼️', color: '#EC4899', submitted: 7,  shipped: 6, votesEarned: 211, tag: 'Design systems',      streak: 3 },
  { id: 'cb-10', name: 'Meera Iyer',     avatar: '🛰️', color: '#0EA5E9', submitted: 8,  shipped: 7, votesEarned: 289, tag: 'Platform · data',     streak: 14 },
];

// -----------------------------------------------------
// Monthly digest — top ideas, shipped count, rejected with care
// -----------------------------------------------------

interface MonthlyDigestRow {
  id: string;
  month: string;
  submitted: number;
  shipped: number;
  rejectedWithCare: number;
  topIdea: string;
  topIdeaVotes: number;
  highlight: string;
}

const MONTHLY_DIGEST: MonthlyDigestRow[] = [
  { id: 'md-1', month: 'Apr 2026', submitted: 58, shipped: 9,  rejectedWithCare: 4, topIdea: 'Monthly repair cafés with e-waste drop-off',    topIdeaVotes: 64, highlight: 'First field-partnered drive shipped in under 18 days.' },
  { id: 'md-2', month: 'Mar 2026', submitted: 71, shipped: 12, rejectedWithCare: 6, topIdea: 'Onboarding playbook for new wings',              topIdeaVotes: 82, highlight: 'Two wings adopted the playbook; onboarding week 3 days shorter.' },
  { id: 'md-3', month: 'Feb 2026', submitted: 49, shipped: 6,  rejectedWithCare: 3, topIdea: 'Open design critiques Wed evenings',              topIdeaVotes: 47, highlight: 'Ran 4 crits; 11 first-time contributors shipped posters.' },
  { id: 'md-4', month: 'Jan 2026', submitted: 65, shipped: 11, rejectedWithCare: 7, topIdea: 'Sustainability benchmark report (quarterly)',     topIdeaVotes: 91, highlight: 'Picked up by The Canopy Press and campus sustainability cell.' },
  { id: 'md-5', month: 'Dec 2025', submitted: 33, shipped: 4,  rejectedWithCare: 2, topIdea: 'Winter zero-waste catering kit',                  topIdeaVotes: 38, highlight: 'Cut winter-fest catering waste by 58% across 3 nights.' },
  { id: 'md-6', month: 'Nov 2025', submitted: 52, shipped: 8,  rejectedWithCare: 5, topIdea: 'RN release-rotation doc for juniors',             topIdeaVotes: 56, highlight: 'Docs merged · first junior-led release shipped week 4.' },
];

// -----------------------------------------------------
// Analytics — category mix, status mix, velocity
// -----------------------------------------------------

interface CategoryAnalytic {
  id: string;
  label: string;
  color: string;
  icon: string;
  count: number;
  shipped: number;
  avgDaysToShip: number;
}

const CATEGORY_ANALYTICS: CategoryAnalytic[] = SUGGESTION_CATEGORIES.map((c) => {
  const inCat = SAMPLE_SUGGESTIONS.filter((s) => s.category === c.id);
  const shipped = inCat.filter((s) => s.status === 'implemented').length;
  const avgDays =
    c.id === 'event' ? 22 :
    c.id === 'improvement' ? 14 :
    c.id === 'partnership' ? 48 :
    c.id === 'technical' ? 19 :
    c.id === 'feature' ? 26 :
    c.id === 'social' ? 11 :
    c.id === 'academic' ? 34 :
    c.id === 'cultural' ? 28 :
    c.id === 'sustainability' ? 16 :
    c.id === 'community' ? 20 : 24;
  return {
    id: c.id,
    label: c.name,
    color: c.color,
    icon: c.icon,
    count: inCat.length,
    shipped,
    avgDaysToShip: avgDays,
  };
});

interface VelocityPoint {
  id: string;
  week: string;
  submitted: number;
  shipped: number;
}

const VELOCITY_SERIES: VelocityPoint[] = [
  { id: 'v-1',  week: 'W16', submitted: 11, shipped: 3 },
  { id: 'v-2',  week: 'W17', submitted: 14, shipped: 4 },
  { id: 'v-3',  week: 'W18', submitted: 9,  shipped: 2 },
  { id: 'v-4',  week: 'W19', submitted: 17, shipped: 6 },
  { id: 'v-5',  week: 'W20', submitted: 13, shipped: 5 },
  { id: 'v-6',  week: 'W21', submitted: 20, shipped: 7 },
  { id: 'v-7',  week: 'W22', submitted: 15, shipped: 4 },
  { id: 'v-8',  week: 'W23', submitted: 18, shipped: 8 },
  { id: 'v-9',  week: 'W24', submitted: 22, shipped: 9 },
  { id: 'v-10', week: 'W25', submitted: 19, shipped: 7 },
  { id: 'v-11', week: 'W26', submitted: 24, shipped: 10 },
  { id: 'v-12', week: 'W27', submitted: 21, shipped: 9 },
];

// -----------------------------------------------------
// Submission tracking — personal idea trail (mock "you")
// -----------------------------------------------------

interface TrackedSubmission {
  id: string;
  title: string;
  submittedOn: string;
  statusPath: { label: string; at: string; done: boolean }[];
  nextStep: string;
  owner: string;
  category: string;
  color: string;
}

const TRACKED_SUBMISSIONS: TrackedSubmission[] = [
  {
    id: 'ts-1',
    title: 'Weekly design crit — open to first-timers',
    submittedOn: 'Mar 28, 2026',
    owner: 'Ishita Kalra',
    category: 'Improvement',
    color: '#38BDF8',
    statusPath: [
      { label: 'Submitted',        at: 'Mar 28', done: true },
      { label: 'Reviewed',         at: 'Apr 01', done: true },
      { label: 'Owner assigned',   at: 'Apr 03', done: true },
      { label: 'In progress',      at: 'Apr 05', done: true },
      { label: 'Shipped · weekly', at: 'Apr 10', done: true },
    ],
    nextStep: 'No next step — running as a standing ritual.',
  },
  {
    id: 'ts-2',
    title: 'E-waste drop-off at monthly repair cafés',
    submittedOn: 'Apr 05, 2026',
    owner: 'Aarav Menon',
    category: 'Sustainability',
    color: '#22C55E',
    statusPath: [
      { label: 'Submitted',       at: 'Apr 05', done: true },
      { label: 'Reviewed',        at: 'Apr 08', done: true },
      { label: 'Vendor scoped',   at: 'Apr 12', done: true },
      { label: 'Pilot planned',   at: 'Apr 18', done: true },
      { label: 'First café',      at: 'Apr 27', done: false },
    ],
    nextStep: 'Confirm volunteers by Apr 22; finalise drop-off bins list.',
  },
  {
    id: 'ts-3',
    title: 'Junior RN release-rotation doc',
    submittedOn: 'Feb 11, 2026',
    owner: 'Rohit Bansal',
    category: 'Technical',
    color: '#F472B6',
    statusPath: [
      { label: 'Submitted',      at: 'Feb 11', done: true },
      { label: 'Reviewed',       at: 'Feb 15', done: true },
      { label: 'Draft · v1',     at: 'Feb 22', done: true },
      { label: 'Crit · v2',      at: 'Mar 04', done: true },
      { label: 'Merged',         at: 'Mar 11', done: true },
    ],
    nextStep: 'Rotate 2 juniors per release; quarterly review in Jun.',
  },
  {
    id: 'ts-4',
    title: 'Quarterly sustainability benchmark report',
    submittedOn: 'Dec 02, 2025',
    owner: 'Nivedita Rao',
    category: 'Research',
    color: '#A78BFA',
    statusPath: [
      { label: 'Submitted',         at: 'Dec 02', done: true },
      { label: 'Reviewed',          at: 'Dec 08', done: true },
      { label: 'Scope agreed',      at: 'Dec 15', done: true },
      { label: 'Q4 draft',          at: 'Jan 20', done: true },
      { label: 'Published · Q1',    at: 'Feb 04', done: true },
      { label: 'Q2 in progress',    at: 'Apr 18', done: false },
    ],
    nextStep: 'Q2 interviews ongoing · publish by May 05.',
  },
];

// =====================================================
// Quarterly retrospective (what worked, what didn't)
// =====================================================

interface RetroBlock {
  id: string;
  quarter: string;
  theme: string;
  worked: string[];
  missed: string[];
  keeping: string[];
  dropping: string[];
  oneBigBet: string;
  color: string;
  emoji: string;
}

const QUARTERLY_RETRO: RetroBlock[] = [
  {
    id: 'qr-1',
    quarter: 'Q1 2026 · Jan–Mar',
    theme: 'Fewer things, finished well',
    emoji: '🧭',
    color: '#22C55E',
    worked: [
      'Two-lane release schedule · weekly + monthly, predictable.',
      'Open crit on Fridays · first-timers stopped self-filtering.',
      'Sapling survival dashboard · actual numbers, not vibes.',
      'Alumni-to-student intros via a 3-question form, not Discord pings.',
    ],
    missed: [
      'Hackathon slipped · tried to fold in three sponsors, lost the thread.',
      'Newsletter died in Feb · nobody owned it, everybody felt guilty.',
      'Sustainability scorecard shipped without the data team on the call.',
    ],
    keeping: [
      'Weekly crit · one non-negotiable meeting per wing.',
      'Monthly repair café with e-waste drop-off.',
      'The three-sentence meeting-notes template.',
    ],
    dropping: [
      '48h hackathons · becoming 60h for too many first-timers.',
      'Co-authored newsletters · moving to one editor per issue.',
      'Multi-wing ‘big bets’ · too much stitching, not enough shipping.',
    ],
    oneBigBet:
      'In Q2, the club takes one real bet — a month-long field residency with three villages, no sponsor deck, no press. Just the work.',
  },
  {
    id: 'qr-2',
    quarter: 'Q4 2025 · Oct–Dec',
    theme: 'Get better at saying no',
    emoji: '🧱',
    color: '#38BDF8',
    worked: [
      'Splash rewrite · nature vibe, paced, never rushes the user.',
      'First alumni relocation grant · ₹18k, four recipients, zero drama.',
      'Pairing junior and senior photographers on every shoot.',
      'Weekly ship-log across wings · read in 90 seconds or skipped.',
    ],
    missed: [
      'Said yes to three campus-wide events in the same week. Nobody ate.',
      'Over-promised on a film crew we didn\'t actually have.',
      'Let a single loud reviewer hold up two design tokens PRs.',
    ],
    keeping: [
      'Public ship-log · one paragraph per wing per week.',
      'Alumni relocation fund · trust-based, private, no form.',
      'Pairing on every shoot · senior owns frame, junior owns pace.',
    ],
    dropping: [
      'Back-to-back events with no room for sleep.',
      'Solo ownership on anything public-facing.',
      'Design reviews with no written ‘walk-away’ option.',
    ],
    oneBigBet:
      'Q1 is going to be about finishing things we already started — not opening new rooms. One residency. One real book.',
  },
  {
    id: 'qr-3',
    quarter: 'Q3 2025 · Jul–Sep',
    theme: 'Make the boring parts visible',
    emoji: '🔦',
    color: '#A78BFA',
    worked: [
      'Published a public finance sheet · what the club spent and why.',
      'Shipped a ‘how we make decisions’ doc · no more inbox politics.',
      'Moved onboarding to 8 weeks with clear weekly deliverables.',
      'First mentorship circles · 6 circles, 41 participants.',
    ],
    missed: [
      'Finance sheet wasn\'t updated in August · trust dipped.',
      'Onboarding week 7 fell off · nobody audited the handoff.',
      'Two circles never met after week 3.',
    ],
    keeping: [
      'Quarterly public finance updates · no surprises, ever.',
      '8-week structured onboarding · single doc, single owner.',
      'Circles that meet · we close the ones that don\'t.',
    ],
    dropping: [
      'Circles that exist on paper only.',
      'Onboarding owned by five different people.',
      'Decisions made in DMs.',
    ],
    oneBigBet:
      'Q4 was about saying no. Not about building more. Turns out we needed the no more than the more.',
  },
];

// =====================================================
// Ownership map (who owns which ongoing commitments)
// =====================================================

interface OwnershipMapEntry {
  id: string;
  area: string;
  primaryOwner: string;
  backupOwner: string;
  cadence: string;
  dueDay: string;
  escalation: string;
  color: string;
  emoji: string;
}

const OWNERSHIP_MAP: OwnershipMapEntry[] = [
  { id: 'om-1', area: 'Weekly ship-log publication',        primaryOwner: 'Ananya P.',  backupOwner: 'Nivedita R.',   cadence: 'Weekly',   dueDay: 'Fri 17:00', escalation: 'Slack #leads if not shipped by 19:00 · Meera steps in.',                                                                                                     emoji: '📰', color: '#4CAF50' },
  { id: 'om-2', area: 'Monthly sapling-survival audit',     primaryOwner: 'Aditi P.',    backupOwner: 'Rohan M.',      cadence: 'Monthly',  dueDay: '1st Sat',   escalation: 'Data team call · if audit is 5+ days late, published numbers get a ‘stale’ banner.',                                                                        emoji: '🌱', color: '#22C55E' },
  { id: 'om-3', area: 'Release rotations · web/app',         primaryOwner: 'Rohit B.',    backupOwner: 'Meera I.',       cadence: 'Weekly',   dueDay: 'Thu 18:00', escalation: 'On-call DM · if release is not shipped by Fri 12:00 the backup owns the next two releases.',                                                                     emoji: '🚢', color: '#00D4FF' },
  { id: 'om-4', area: 'Repair café + e-waste drop-off',       primaryOwner: 'Aarav M.',    backupOwner: 'Farhan S.',      cadence: 'Monthly',  dueDay: 'Last Sun',  escalation: 'Vendor call · if no slot by 20th, skip month + publish why.',                                                                                                 emoji: '♻️', color: '#16A34A' },
  { id: 'om-5', area: 'Weekly design crit',                   primaryOwner: 'Ishita K.',    backupOwner: 'Tanvi S. (alumni)', cadence: 'Weekly', dueDay: 'Fri 16:00', escalation: 'Crit moves to async review in Figma · owner must post by Sun 20:00.',                                                                                         emoji: '🎨', color: '#F472B6' },
  { id: 'om-6', area: 'Monthly public finance sheet',          primaryOwner: 'Kanishka A. (alumni)', backupOwner: 'Anaya V.',   cadence: 'Monthly',  dueDay: '5th',        escalation: 'Finance chat · if 5 days late, leadership pauses new spends till published.',                                                                               emoji: '💸', color: '#F59E0B' },
  { id: 'om-7', area: 'Mentorship circle health-check',        primaryOwner: 'Nivedita R.',  backupOwner: 'Ananya P.',      cadence: 'Monthly',  dueDay: '1st Mon',    escalation: 'Any circle with 0 meetings in 3 weeks is sunset with thanks · no guilt.',                                                                                      emoji: '🫂', color: '#A78BFA' },
  { id: 'om-8', area: 'Alumni grant committee review',         primaryOwner: 'Varun M. (alumni)', backupOwner: 'Saanvi R. (alumni)', cadence: 'Quarterly', dueDay: 'End-quarter', escalation: 'If review misses quarter, committee publishes a ‘delayed’ note + new deadline within 5 days.',                                                                emoji: '🛟', color: '#F59E0B' },
  { id: 'om-9', area: 'Newsletter · one editor per issue',     primaryOwner: 'Rotating',      backupOwner: 'Editor-at-large', cadence: 'Monthly',  dueDay: '15th',       escalation: 'Editor-at-large ships a 500-word issue · no co-authors, no excuses.',                                                                                           emoji: '📝', color: '#64748B' },
  { id: 'om-10', area: 'Photo + video archive · weekly dump', primaryOwner: 'Dhruv R.',      backupOwner: 'Akshara N.',     cadence: 'Weekly',   dueDay: 'Sun 20:00',   escalation: 'If archive is 2+ weeks behind, new shoots pause till archive is current.',                                                                                     emoji: '📸', color: '#F87171' },
];

// =====================================================
// Feedback loop (how feedback becomes change)
// =====================================================

interface FeedbackLoopStage {
  id: string;
  stage: string;
  what: string;
  sla: string;
  who: string;
  example: string;
  color: string;
  emoji: string;
  order: number;
}

const FEEDBACK_LOOP: FeedbackLoopStage[] = [
  { id: 'fl-1', order: 1, stage: 'Capture',             what: 'Anyone can drop a suggestion · app, paper slip at events, or DM to any lead.',                 sla: 'Same day · acknowledged in 24h.', who: 'Any member · routed to a single inbox.',          example: 'Paper slip · ‘Open the Friday crit to first-timers before they self-filter out.’',  emoji: '📥', color: '#38BDF8' },
  { id: 'fl-2', order: 2, stage: 'Sort',                 what: 'Triage team reads the full inbox on Mondays · labels by area + priority · no silent drops.',     sla: 'Within 5 working days.',         who: 'Rotating triage pair · never the same pair twice in a row.', example: 'Crit suggestion → labelled ‘Design · improvement · low-cost’.',                         emoji: '🗂️', color: '#A78BFA' },
  { id: 'fl-3', order: 3, stage: 'Owner',                what: 'Each accepted idea gets an owner · a real name, a real deadline · never ‘the team’.',            sla: 'Within 10 working days of capture.', who: 'Wing lead for the area.',                     example: 'Owner: Ishita K. · deadline: two Fridays out.',                                         emoji: '🧭', color: '#F59E0B' },
  { id: 'fl-4', order: 4, stage: 'Test',                 what: 'Test once, cheaply · a single trial run, not a season-long rollout.',                             sla: 'Within 30 days of owner assignment.', who: 'Owner + one reviewer.',                        example: 'Trial · one Friday · open crit + written feedback · count first-timer submissions.', emoji: '🧪', color: '#22C55E' },
  { id: 'fl-5', order: 5, stage: 'Decide',               what: 'Keep, kill, or keep-with-changes · a written note with numbers · no ambiguous ‘let\'s see’.',    sla: 'Within 10 days of the test.',   who: 'Owner + wing lead · published in the digest.',    example: 'Keep with changes · widen to all three wings · retire gatekeeping language.',            emoji: '🧱', color: '#F472B6' },
  { id: 'fl-6', order: 6, stage: 'Publish',              what: 'The full loop is written up in the monthly digest · who suggested, what changed, what didn\'t.', sla: 'Next monthly digest after the decision.', who: 'Digest editor · one name on it.',          example: 'Monthly digest · ‘Crit is now open to first-timers · suggested by Ishita K. in Jan.’',  emoji: '📰', color: '#64748B' },
  { id: 'fl-7', order: 7, stage: 'Retire',               what: 'Ideas that didn\'t work are retired with a written reason · archive, not a bin.',                  sla: 'Within a quarter of the decision.', who: 'Wing lead · sign-off from leadership.',      example: '‘Solo newsletter’ retired · replaced by one-editor-per-issue model.',                   emoji: '🪦', color: '#EF4444' },
];

// =====================================================
// Component
// =====================================================

// =====================================================
// Phase 3s: deeper suggestion structures
// =====================================================

interface VoterWeight {
  id: string;
  role: string;
  weight: number;
  examples: string;
  color: string;
  emoji: string;
}

const VOTER_WEIGHTS: VoterWeight[] = [
  { id: 'vw-1', role: 'First-year guardians',    weight: 1.0, examples: 'Everyone starts here · one vote equals one voice.',       color: '#94A3B8', emoji: '🌱' },
  { id: 'vw-2', role: 'Contributors · 2+ ships', weight: 1.2, examples: 'Anyone who shipped at least two merged items.',            color: '#22C55E', emoji: '🌿' },
  { id: 'vw-3', role: 'Wing leads',              weight: 1.5, examples: 'Heads of the six wings · small bias toward domain view.',  color: '#F59E0B', emoji: '🪶' },
  { id: 'vw-4', role: 'Operating council',       weight: 1.8, examples: 'Four elected seats · one-year terms.',                     color: '#00D4FF', emoji: '⚓' },
  { id: 'vw-5', role: 'Alumni advisors',         weight: 1.3, examples: 'Past contributors with advisory seats · context matters.', color: '#A78BFA', emoji: '🧭' },
  { id: 'vw-6', role: 'Campus staff allies',     weight: 1.1, examples: 'Faculty / staff allies who chose to be listed.',           color: '#F472B6', emoji: '🎓' },
];

interface EscalationPath {
  id: string;
  level: number;
  name: string;
  whenToUse: string;
  owner: string;
  slaDays: number;
  color: string;
  emoji: string;
}

const ESCALATION_PATHS: EscalationPath[] = [
  { id: 'ep-1', level: 1, name: 'Wing triage',          whenToUse: 'Any suggestion · default route · wing lead acknowledges in 3 days.', owner: 'Wing lead',        slaDays: 3,  color: '#22C55E', emoji: '🟢' },
  { id: 'ep-2', level: 2, name: 'Cross-wing review',    whenToUse: 'When two or more wings are impacted · council picks an owner.',       owner: 'Council pick',     slaDays: 7,  color: '#F59E0B', emoji: '🟡' },
  { id: 'ep-3', level: 3, name: 'Council decision',     whenToUse: 'Budget or policy change · needs a council vote to unblock.',          owner: 'Operating council', slaDays: 14, color: '#F97316', emoji: '🟠' },
  { id: 'ep-4', level: 4, name: 'Trustee sign-off',     whenToUse: 'Safety, legal or funding implications · requires trustee email.',      owner: 'Trustee on-call',  slaDays: 21, color: '#EF4444', emoji: '🔴' },
  { id: 'ep-5', level: 5, name: 'Open town hall',       whenToUse: 'Cultural / values change · put it to the whole club in person.',       owner: 'All members',      slaDays: 30, color: '#A78BFA', emoji: '🏛️' },
];

interface ShippedWin {
  id: string;
  title: string;
  category: string;
  monthsAgo: number;
  impact: string;
  owner: string;
  color: string;
  emoji: string;
}

const SHIPPED_WINS: ShippedWin[] = [
  { id: 'sw-1',  title: 'Reusable mug programme',                  category: 'Sustainability',  monthsAgo: 14, impact: 'Cut ~3,400 paper cups this year alone.',           owner: 'Sustainability wing', color: '#22C55E', emoji: '☕' },
  { id: 'sw-2',  title: 'Late-night workshops · 7–9 pm slots',     category: 'Scheduling',      monthsAgo: 11, impact: 'Day-scholar attendance up from 23% to 61%.',        owner: 'Ops wing',            color: '#00D4FF', emoji: '🌙' },
  { id: 'sw-3',  title: 'Bilingual Hindi + English subtitles',     category: 'Accessibility',   monthsAgo: 9,  impact: 'Twelve more villages watched our last five talks.',  owner: 'Content wing',        color: '#F472B6', emoji: '📝' },
  { id: 'sw-4',  title: 'Quiet hour · one focused hour per day',   category: 'Culture',         monthsAgo: 8,  impact: 'Self-rated deep-work doubled on Wed and Fri.',      owner: 'All wings',           color: '#A78BFA', emoji: '🤫' },
  { id: 'sw-5',  title: 'Pre-event consent flow · written',        category: 'Safety',          monthsAgo: 7,  impact: 'Zero reported photo-consent issues in three events.', owner: 'PR wing',           color: '#F59E0B', emoji: '🤝' },
  { id: 'sw-6',  title: 'Alumni fireside every first Saturday',    category: 'Community',       monthsAgo: 5,  impact: 'Six firesides so far · 420 attendees combined.',     owner: 'Alumni wing',         color: '#38BDF8', emoji: '🔥' },
  { id: 'sw-7',  title: 'Accessibility audit on our own app',      category: 'Accessibility',   monthsAgo: 3,  impact: 'Seventeen issues fixed · contrast + labels + focus.',owner: 'Web/App wing',        color: '#7E57C2', emoji: '♿' },
  { id: 'sw-8',  title: 'Reading-list · one book a month',         category: 'Learning',        monthsAgo: 2,  impact: 'A rolling two-page summary shared each month.',     owner: 'Content wing',        color: '#F87171', emoji: '📚' },
  { id: 'sw-9',  title: 'Sapling sponsorship chart · in-app',      category: 'Sustainability',  monthsAgo: 1,  impact: 'Made the ₹100-per-sapling goal visible.',           owner: 'GD wing',             color: '#22C55E', emoji: '🌳' },
  { id: 'sw-10', title: 'Open gear-desk · sign out anything',      category: 'Operations',      monthsAgo: 1,  impact: 'Zero broken items in four months · trust held.',    owner: 'Ops wing',            color: '#F59E0B', emoji: '🧰' },
];

interface DiscardedSuggestion {
  id: string;
  title: string;
  reason: string;
  respectedBy: string;
  monthsAgo: number;
  color: string;
  emoji: string;
}

const DISCARDED_SUGGESTIONS: DiscardedSuggestion[] = [
  { id: 'ds-1', title: 'Paid premium tier for members',         reason: 'Breaks our free-forever principle for campus clubs.',         respectedBy: 'Council vote · 6 to 0',  monthsAgo: 10, color: '#EF4444', emoji: '💰' },
  { id: 'ds-2', title: 'Leaderboard with public rankings',       reason: 'Turns out ranking is the opposite of community in tests.',    respectedBy: 'Wing-leads discussion',  monthsAgo: 8,  color: '#F97316', emoji: '📊' },
  { id: 'ds-3', title: 'Automatic attendance via face-recog',    reason: 'Privacy risk outweighs the five minutes of time saved.',      respectedBy: 'Trustee note',            monthsAgo: 6,  color: '#A855F7', emoji: '🔒' },
  { id: 'ds-4', title: 'Paid sponsorships in the app feed',      reason: 'We will not sell attention in a campus club app.',            respectedBy: 'Open town hall',          monthsAgo: 5,  color: '#EF4444', emoji: '📣' },
  { id: 'ds-5', title: 'Auto-translate comments in-app',         reason: 'Bad translations hurt nuance · we kept manual bilingual.',    respectedBy: 'Content wing review',     monthsAgo: 4,  color: '#F472B6', emoji: '🈯' },
  { id: 'ds-6', title: 'Offline-only mode with no sync at all',  reason: 'Too easy to lose a week of notes · we picked delayed-sync.',  respectedBy: 'Engineering review',      monthsAgo: 3,  color: '#F59E0B', emoji: '📴' },
];

interface DecisionJournal {
  id: string;
  week: string;
  decision: string;
  context: string;
  revisitIn: string;
  color: string;
  emoji: string;
}

const DECISION_JOURNAL: DecisionJournal[] = [
  { id: 'dj-1', week: 'Week 46 · 2025', decision: 'Keep suggestions public by default',               context: 'A member asked for fully private suggestions · council kept default public + private toggle.', revisitIn: 'Six months',  color: '#00D4FF', emoji: '🗳️' },
  { id: 'dj-2', week: 'Week 48 · 2025', decision: 'Cap campus events at 120 people',                  context: 'Safety audit said our room fire-capacity is 135 · we chose a safety margin of 15 seats.',      revisitIn: 'One year',    color: '#F59E0B', emoji: '🛟' },
  { id: 'dj-3', week: 'Week 02 · 2026', decision: 'No sponsored content in the app feed · ever',      context: 'Clear council decision · revisit only if the club changes governance shape.',                 revisitIn: 'Governance change only', color: '#EF4444', emoji: '🚫' },
  { id: 'dj-4', week: 'Week 06 · 2026', decision: 'Default to reusable mugs · disposable only on ask',context: 'Saw 3,400 cups saved · kept the default · people can still ask for paper if unwell.',           revisitIn: 'One year',    color: '#22C55E', emoji: '☕' },
  { id: 'dj-5', week: 'Week 10 · 2026', decision: 'Open-source all our RN code under MIT',            context: 'Two alumni started using snippets · we kept it open with an MIT header and a thank-you file.', revisitIn: 'One year',    color: '#A78BFA', emoji: '🧾' },
  { id: 'dj-6', week: 'Week 14 · 2026', decision: 'Keep one quiet hour · 2 pm to 3 pm · all wings',   context: 'Helps focus · sticking with it · trying silent-lunch Fridays as an experiment.',                revisitIn: 'Next quarter', color: '#F472B6', emoji: '🤫' },
  { id: 'dj-7', week: 'Week 17 · 2026', decision: 'Accept anonymous suggestions with a rate-limit',   context: 'One per week per IP · not per user · protects psychological safety without opening a spam fire-hose.', revisitIn: 'Six months', color: '#7E57C2', emoji: '🕵️' },
];

interface SuggestionStageTip {
  id: string;
  stage: string;
  tip: string;
  exampleDone: string;
  exampleNot: string;
  color: string;
  emoji: string;
}

const STAGE_TIPS: SuggestionStageTip[] = [
  { id: 'st-1', stage: 'Before you write',   tip: 'Write the one-line outcome first · not the fix.',           exampleDone: 'Newcomers get to the Wi-Fi in under 60 seconds.',          exampleNot: 'Print a bigger poster near the router.',                                color: '#22C55E', emoji: '🎯' },
  { id: 'st-2', stage: 'Picking a category', tip: 'Pick the wing that would ship it · not the one most hurt.', exampleDone: 'Wi-Fi onboarding goes to Ops · not to PR.',                 exampleNot: 'Wi-Fi onboarding goes to PR because guests complained at the expo.', color: '#F59E0B', emoji: '🗂️' },
  { id: 'st-3', stage: 'Writing it',          tip: 'Short problem · short goal · one rough idea is enough.',    exampleDone: '3 lines problem · 3 lines goal · 2 lines of how it might look.', exampleNot: 'A four-paragraph essay.',                                         color: '#F472B6', emoji: '✍️' },
  { id: 'st-4', stage: 'Before submitting',   tip: 'Add one realistic concern · what could make this fail.',    exampleDone: '"If the dorm switches routers · this breaks."',            exampleNot: 'No risks listed · looks too perfect to be honest.',                       color: '#A78BFA', emoji: '🪞' },
  { id: 'st-5', stage: 'Replying to comments',tip: 'Answer the critic first · then the fan.',                   exampleDone: 'First reply addresses the hardest objection with data.',    exampleNot: 'Thanking praise and scrolling past the hard reply.',                       color: '#F87171', emoji: '💬' },
  { id: 'st-6', stage: 'After it ships',      tip: 'Write two lines in the digest · name the helpers.',         exampleDone: '"Shipped · thanks to Meera, Rohit, Anmol."',               exampleNot: 'No retro line · silent merge.',                                           color: '#00D4FF', emoji: '📣' },
];

// =====================================================
// Phase 3y: deeper suggestion structures
// =====================================================

interface DecisionRight {
  id: string;
  scope: string;
  decider: string;
  consulted: string;
  informed: string;
  color: string;
  emoji: string;
}

const DECISION_RIGHTS: DecisionRight[] = [
  { id: 'dr-1', scope: 'Tiny tweak · one-wing fix',                      decider: 'Wing lead',                       consulted: 'One affected member',       informed: 'Digest next month',                 color: '#22C55E', emoji: '🪴' },
  { id: 'dr-2', scope: 'Cross-wing process change',                      decider: 'Core council · simple majority', consulted: 'Every wing lead',           informed: 'Whole club · within 7 days',        color: '#F59E0B', emoji: '🧭' },
  { id: 'dr-3', scope: 'Policy · code of conduct edits',                 decider: 'Council + two alumni advisors',   consulted: 'Open town hall · 14 days',  informed: 'Every member · by email + app',     color: '#A78BFA', emoji: '🛡️' },
  { id: 'dr-4', scope: 'Spend over ₹15k or 10 volunteer hours',          decider: 'Council + budget steward',        consulted: 'Wing that will do the work',informed: 'Published in the monthly digest',   color: '#F472B6', emoji: '💸' },
  { id: 'dr-5', scope: 'New ongoing partnership',                        decider: 'Council + PR lead',               consulted: 'All wings · 1 meet',         informed: 'Partner-side too · written note',    color: '#00D4FF', emoji: '🤝' },
  { id: 'dr-6', scope: 'Event cancellation or postponement',             decider: 'Event owner + one lead',          consulted: 'Everyone with a ticket',     informed: 'App notice + digest + social',       color: '#EF4444', emoji: '⛔' },
  { id: 'dr-7', scope: 'Member pause or step-away',                      decider: 'The member · always',             consulted: 'Wing lead · in private',     informed: 'No one · unless they say so',        color: '#94A3B8', emoji: '🕊️' },
];

interface DisagreeLog {
  id: string;
  topic: string;
  sideA: string;
  sideB: string;
  outcome: 'sideA' | 'sideB' | 'merged' | 'deferred';
  learning: string;
  color: string;
  emoji: string;
}

const DISAGREE_LOG: DisagreeLog[] = [
  { id: 'dl-1', topic: 'Open critique vs. private feedback',    sideA: 'Public crits grow us faster',             sideB: 'Private first · protects beginners',         outcome: 'merged',   learning: 'First crit is private · second is public · with consent.',     color: '#F472B6', emoji: '💬' },
  { id: 'dl-2', topic: 'Hindi-first posters vs. English-first',  sideA: 'Hindi-first for reach',                    sideB: 'English-first for inter-college traction',   outcome: 'merged',   learning: 'Bilingual posters · same size · no hierarchy.',                 color: '#F59E0B', emoji: '📰' },
  { id: 'dl-3', topic: 'Paid speakers vs. honoraria only',        sideA: 'Paid slots attract seniors',               sideB: 'Honoraria keep us honest',                    outcome: 'sideB',    learning: 'Honoraria only · capped · no invoicing.',                      color: '#22C55E', emoji: '🎤' },
  { id: 'dl-4', topic: 'Expanding tabs in the app',              sideA: 'One more tab for ‘Pledges’',               sideB: 'Keep 6 tabs · put it inside Home',            outcome: 'sideB',    learning: 'Six tabs forever · pledges surface inside Home.',              color: '#00D4FF', emoji: '📱' },
  { id: 'dl-5', topic: 'Sponsor branding intensity',             sideA: 'Bigger logos for bigger sponsors',         sideB: 'One size · based on contribution tier',       outcome: 'sideB',    learning: 'One poster size · three tiers · same typography.',             color: '#A78BFA', emoji: '🎛️' },
  { id: 'dl-6', topic: 'Documentary runtime',                     sideA: 'Short cuts travel further',                sideB: 'Long cuts do the emotional work',             outcome: 'merged',   learning: 'One 3-min cut + one 15-min cut · same film, two lives.',       color: '#EF4444', emoji: '🎞️' },
  { id: 'dl-7', topic: 'Open vs. quiet birthday rituals',         sideA: 'Loud · shared on boards',                  sideB: 'Quiet · card only if member agrees',          outcome: 'sideB',    learning: 'Ask the member first · default is quiet.',                     color: '#FFD166', emoji: '🎂' },
];

interface ReturnSignal {
  id: string;
  metric: string;
  measuredBy: string;
  target: string;
  current: string;
  state: 'healthy' | 'watch' | 'at-risk';
  color: string;
  emoji: string;
}

const RETURN_SIGNALS: ReturnSignal[] = [
  { id: 'rs-1', metric: 'Time from idea → decision',      measuredBy: 'Average · last 50 cards',  target: 'Under 14 days',           current: '11.4 days',           state: 'healthy', color: '#22C55E', emoji: '⏱️' },
  { id: 'rs-2', metric: 'Time from decision → ship',      measuredBy: 'Average · last 50 cards',  target: 'Under 45 days',           current: '38 days',             state: 'healthy', color: '#22C55E', emoji: '🚢' },
  { id: 'rs-3', metric: '% ideas that got a reply',        measuredBy: 'Within 72 hours',           target: '100%',                     current: '94%',                 state: 'watch',   color: '#F59E0B', emoji: '🗣️' },
  { id: 'rs-4', metric: '% ideas reversed after trial',    measuredBy: 'Of shipped ideas',          target: '10–25% (healthy reverse)', current: '18%',                 state: 'healthy', color: '#22C55E', emoji: '🔁' },
  { id: 'rs-5', metric: 'Anonymous ratio',                 measuredBy: 'Of new cards',              target: '5–15% (we never push it down)', current: '9%',             state: 'healthy', color: '#22C55E', emoji: '🕵️' },
  { id: 'rs-6', metric: 'First-timer authors',              measuredBy: 'New members · last 30d',    target: '≥ 40%',                    current: '34%',                 state: 'watch',   color: '#F59E0B', emoji: '🌱' },
  { id: 'rs-7', metric: 'Unresolved over 60 days',          measuredBy: 'Any stage',                  target: '0',                         current: '3',                  state: 'at-risk', color: '#EF4444', emoji: '⌛' },
];

interface FeedbackLoop {
  id: string;
  cadence: string;
  ritual: string;
  who: string;
  output: string;
  color: string;
  emoji: string;
}

const FEEDBACK_LOOPS: FeedbackLoop[] = [
  { id: 'fb-1', cadence: 'Weekly',   ritual: 'Idea-triage stand-up · 20 min',          who: 'Council + one rotating member',    output: 'One decision per card touched that week.',                    color: '#00D4FF', emoji: '📋' },
  { id: 'fb-2', cadence: 'Weekly',   ritual: 'Writer\'s desk for rough cards',          who: 'Anyone stuck in drafting',          output: 'A short edit pass · published or retired within 48 h.',         color: '#F472B6', emoji: '✍️' },
  { id: 'fb-3', cadence: 'Monthly',  ritual: 'Digest day · 2-hour write-up',            who: 'Digest editor · one name',          output: 'A public summary · who suggested, what changed, what didn\'t.', color: '#F59E0B', emoji: '📰' },
  { id: 'fb-4', cadence: 'Monthly',  ritual: 'Town hall · open mic, 45 min',            who: 'Anyone in the club',                 output: 'Spoken questions logged · answered within a week.',              color: '#22C55E', emoji: '🎤' },
  { id: 'fb-5', cadence: 'Quarterly',ritual: 'Retro-of-ideas · 60 min',                  who: 'Council + two first-timers',         output: 'Three keep · three kill · three try-bigger.',                   color: '#A78BFA', emoji: '🪞' },
  { id: 'fb-6', cadence: 'Quarterly',ritual: 'Alumni read-back · 30 min over tea',      who: 'Two alumni advisors',                 output: 'Written ‘what would we re-do’ · kept in archive.',              color: '#FFD166', emoji: '🍵' },
  { id: 'fb-7', cadence: 'Yearly',   ritual: 'Decision-right review · 90 min',           who: 'Whole council + alumni',              output: 'Rewritten RACI · one paragraph per scope.',                     color: '#EF4444', emoji: '📜' },
];

interface TrustPromise {
  id: string;
  promise: string;
  why: string;
  how: string;
  color: string;
  emoji: string;
}

const TRUST_PROMISES: TrustPromise[] = [
  { id: 'tp-1', promise: 'Every card gets a human reply within 72 hours',   why: 'Silence kills participation.',                                       how: 'Shared inbox · two rotating members · one ack is enough.',                        color: '#22C55E', emoji: '🗣️' },
  { id: 'tp-2', promise: 'No-one is punished for disagreeing',              why: 'Healthy dissent is rare · we protect it.',                            how: 'Conflict log · quarterly · no names in public.',                                   color: '#00D4FF', emoji: '🕊️' },
  { id: 'tp-3', promise: 'Anonymity stays anonymous',                       why: 'We want quiet truths too.',                                           how: 'Hashed author ID · only two people can see the map · audited twice a year.',      color: '#A78BFA', emoji: '🕵️' },
  { id: 'tp-4', promise: 'Retired ideas don\'t vanish',                     why: 'We learn from what failed.',                                          how: 'Archive channel · with the reason · searchable.',                                  color: '#F87171', emoji: '🪦' },
  { id: 'tp-5', promise: 'Credit is explicit',                               why: 'Silence feels like erasure.',                                         how: 'Every shipped change names one or more authors · sign-off required.',              color: '#F59E0B', emoji: '🏷️' },
  { id: 'tp-6', promise: 'Decision makers say no with reasons',              why: '‘No’ without a reason is cruel.',                                     how: 'Two-sentence reason · in the digest · with a maybe-later tag if relevant.',       color: '#F472B6', emoji: '✋' },
];

interface OpenCallToIdea {
  id: string;
  title: string;
  prompt: string;
  deadline: string;
  wing: string;
  color: string;
  emoji: string;
}

const OPEN_CALLS: OpenCallToIdea[] = [
  { id: 'oc-1', title: 'Campus tree-walk · 2.0',               prompt: 'A fresh script · 40 minutes · inclusive of night-walk.',                     deadline: '12 May',   wing: 'Content + PR',        color: '#22C55E', emoji: '🌳' },
  { id: 'oc-2', title: 'Alumni-in-residence · programme',       prompt: 'How would a one-week alumni visit look · week-long rhythm.',                 deadline: '18 May',   wing: 'PR + Alumni desk',    color: '#A78BFA', emoji: '🎓' },
  { id: 'oc-3', title: 'Poster system · open-source kit',       prompt: 'A shareable kit · so other colleges can make Taru-style posters.',           deadline: '22 May',   wing: 'Design',              color: '#F472B6', emoji: '🖼️' },
  { id: 'oc-4', title: 'First-year on-boarding · kinder flow',  prompt: 'Where does the flow hurt · rewrite the first two weeks.',                    deadline: '30 May',   wing: 'Core + Content',      color: '#F59E0B', emoji: '🪴' },
  { id: 'oc-5', title: 'Accessibility audit · whole app',        prompt: 'A structured pass · talkback, contrast, gesture alternatives.',             deadline: '08 Jun',   wing: 'Web + App',            color: '#00D4FF', emoji: '♿' },
  { id: 'oc-6', title: 'Partners we\'d want to say yes to',      prompt: 'Five orgs · why · ethical fit · what we would offer.',                        deadline: '14 Jun',   wing: 'PR',                    color: '#7E57C2', emoji: '🤝' },
  { id: 'oc-7', title: 'A small, quiet ritual for goodbyes',     prompt: 'One paragraph · what should happen when a member steps away.',               deadline: '22 Jun',   wing: 'Whole team',           color: '#FFD166', emoji: '🕯️' },
];

// =====================================================
// Phase 3ae: deeper suggestion structures — round 2
// =====================================================

interface SuggestionIntake {
  id: string;
  channel: string;
  owner: string;
  response: string;
  cadence: string;
  color: string;
  emoji: string;
}

const SUGGESTION_INTAKES: SuggestionIntake[] = [
  { id: 'sin-1', channel: 'In-app suggestion box',        owner: 'Product council',            response: 'First human reply within 48 hours · always.',              cadence: 'Live',                color: '#00D4FF', emoji: '📥' },
  { id: 'sin-2', channel: 'Anonymous box · physical',     owner: 'Campus council',              response: 'Opened every Monday 10 AM · posted to board by Wednesday.', cadence: 'Weekly',              color: '#A78BFA', emoji: '📮' },
  { id: 'sin-3', channel: 'Open forum · last Friday',     owner: 'Rotating host',                response: 'Top-three suggestions printed + assigned within 7 days.',    cadence: 'Monthly',             color: '#F59E0B', emoji: '🎙️' },
  { id: 'sin-4', channel: 'Hot-chocolate hour · juniors', owner: 'Hospitality crew',              response: 'Nothing is logged · lead carries the themes to the council.', cadence: 'Fortnight',           color: '#F472B6', emoji: '🍫' },
  { id: 'sin-5', channel: 'Alumni first-Friday chai',      owner: 'Alumni council',                response: 'Two-pager typed within a week · shared with whole team.',    cadence: 'Monthly',             color: '#FFD166', emoji: '🍵' },
  { id: 'sin-6', channel: 'Post-event pulse · 24 h',      owner: 'Event owner',                   response: 'Every rating gets a personal reply if they leave a name.',     cadence: 'Per event',           color: '#22C55E', emoji: '📈' },
  { id: 'sin-7', channel: 'Whisper walk · founder',        owner: 'Founder + people lead',         response: 'Private · unlogged · for the hardest feedback.',               cadence: 'On request',           color: '#EF4444', emoji: '🤫' },
];

interface SuggestionTemplate {
  id: string;
  scenario: string;
  template: string;
  useWhen: string;
  color: string;
  emoji: string;
}

const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  { id: 'stp-1', scenario: 'Small bug · cosmetic',        template: '"When I tap X, Y happens · I expected Z. Screenshot attached."',                          useWhen: 'UI misbehaves · not urgent.',          color: '#00D4FF', emoji: '🐞' },
  { id: 'stp-2', scenario: 'Feature idea · new section',   template: '"I often do A manually · because B is missing. A feature that does C would save D time."',  useWhen: 'You repeat a workflow ≥ 3× a week.',  color: '#A78BFA', emoji: '💡' },
  { id: 'stp-3', scenario: 'Policy feedback',              template: '"The current rule around E · hurts F · by causing G. A softer version could look like H."',  useWhen: 'A rule is hurting more than helping.',  color: '#F59E0B', emoji: '🪴' },
  { id: 'stp-4', scenario: 'Event idea',                    template: '"Format: I. Theme: J. Guests: K. Why this: L. One prior example: M."',                     useWhen: 'You want a new kind of event to run.',    color: '#F472B6', emoji: '🎫' },
  { id: 'stp-5', scenario: 'Thank-you · public',             template: '"N did O for me · here\'s what it unlocked. Worth saying out loud."',                      useWhen: 'Someone quietly helped · you want it seen.', color: '#22C55E', emoji: '✨' },
  { id: 'stp-6', scenario: 'Concern · interpersonal',        template: '"I\'d like to talk privately about P · I\'m open to Q format · here\'s a window R."',       useWhen: 'Something feels off between members.',   color: '#EF4444', emoji: '🫀' },
  { id: 'stp-7', scenario: 'Sustainability nudge',           template: '"Our current practice · S · can be greener by · T. Small switch · big over time."',         useWhen: 'You see a habit we can tune.',          color: '#16A34A', emoji: '🌱' },
];

interface SuggestionGuardrail {
  id: string;
  guardrail: string;
  oneLine: string;
  why: string;
  color: string;
  emoji: string;
}

const SUGGESTION_GUARDRAILS: SuggestionGuardrail[] = [
  { id: 'sgr-1', guardrail: 'No name-and-shame',                 oneLine: 'Point at the pattern · not the person.',                  why: 'Feedback dies when it stings · patterns survive when named.',                color: '#EF4444', emoji: '🛡️' },
  { id: 'sgr-2', guardrail: 'No one-line "it\'s broken"',         oneLine: 'Give us steps · screenshot · or a bad day to remember it.', why: 'A good bug report shortens the fix by half.',                                  color: '#00D4FF', emoji: '🔍' },
  { id: 'sgr-3', guardrail: 'Anonymous stays anonymous',         oneLine: 'We don\'t try to decode authorship · ever.',                 why: 'The box works only if the box is trusted.',                                     color: '#A78BFA', emoji: '🔒' },
  { id: 'sgr-4', guardrail: 'Response time beats speed',           oneLine: '48 hours to acknowledge · months to ship is ok.',           why: 'A heard suggestion is already a partial win.',                                 color: '#F59E0B', emoji: '🕰️' },
  { id: 'sgr-5', guardrail: 'We say no with reasons',               oneLine: 'Every rejection comes with the why.',                       why: 'No silent no\'s · no ghosted ideas · a reason is owed.',                        color: '#F472B6', emoji: '🪞' },
  { id: 'sgr-6', guardrail: 'Green always gets the first vote',      oneLine: 'Sustainability suggestions skip the queue · by rule.',       why: 'We are slow on green by default · this corrects it structurally.',             color: '#22C55E', emoji: '🌿' },
  { id: 'sgr-7', guardrail: 'Quiet weeks exist',                       oneLine: 'Suggestion box pauses the week before exams.',               why: 'Everyone deserves a closed loop · not more open threads.',                     color: '#FFD166', emoji: '🌙' },
];

interface SuggestionCase {
  id: string;
  idea: string;
  origin: string;
  outcome: string;
  shippedOn: string;
  daysToShip: number;
  color: string;
  emoji: string;
}

const SUGGESTION_CASES: SuggestionCase[] = [
  { id: 'sc-1', idea: 'Reusable steel cups for all events',        origin: 'Anon box · Apr 2023',         outcome: 'Single-use cups phased out by end of 2023 · saved ₹ 42k · 3,800 cups diverted.',   shippedOn: 'Dec 2023', daysToShip: 242, color: '#22C55E', emoji: '🥤' },
  { id: 'sc-2', idea: 'Mental-health counsellor access · subsidised', origin: 'Forum · Aug 2023',           outcome: 'Three counsellors on panel · alumni-funded · 58 sessions in year one.',              shippedOn: 'Jan 2024', daysToShip: 151, color: '#A78BFA', emoji: '🫀' },
  { id: 'sc-3', idea: 'Newsletter in Hindi · alongside English',      origin: 'Alumni chai · Nov 2022',       outcome: 'Bilingual monthly digest since Feb 2023 · readership up 38%.',                     shippedOn: 'Feb 2023', daysToShip: 93,  color: '#F472B6', emoji: '🗞️' },
  { id: 'sc-4', idea: 'Office hours · leads available to juniors',    origin: 'Forum · Jun 2023',             outcome: 'Each lead · one open hour per week · started July · 126 sessions in six months.',  shippedOn: 'Jul 2023', daysToShip: 34,  color: '#F59E0B', emoji: '🕰️' },
  { id: 'sc-5', idea: 'Accessibility audit · our public events',       origin: 'Anon box · Mar 2023',          outcome: 'Ramp at amphitheatre · captions on live streams · audit repeated annually.',        shippedOn: 'Oct 2023', daysToShip: 214, color: '#00D4FF', emoji: '♿' },
  { id: 'sc-6', idea: 'Rest fund · for members going through grief',   origin: 'Private note · Sep 2023',       outcome: 'Two weeks of paid cover + team\'s care package · used 3× so far.',                 shippedOn: 'Nov 2023', daysToShip: 72,  color: '#EF4444', emoji: '🤍' },
  { id: 'sc-7', idea: 'Photo-credits · every digest photo named',      origin: 'Forum · Jan 2024',             outcome: 'All digests since Feb 2024 carry a credits line · photographers love it.',          shippedOn: 'Feb 2024', daysToShip: 42,  color: '#FFD166', emoji: '📸' },
];

interface SuggestionVoice {
  id: string;
  voice: string;
  said: string;
  about: string;
  color: string;
  emoji: string;
}

const SUGGESTION_VOICES: SuggestionVoice[] = [
  { id: 'sv-1', voice: 'First-year · anon',             said: '"Suggestions actually go somewhere. I didn\'t expect a real reply in my second week."',   about: 'Intake experience',          color: '#00D4FF', emoji: '🫧' },
  { id: 'sv-2', voice: 'Third-year · content',           said: '"The monthly digest lists rejected ideas + why. That honesty kept me from leaving last year."', about: 'Rejections with reasons',    color: '#F472B6', emoji: '🪞' },
  { id: 'sv-3', voice: 'Alumnus · 2019',                  said: '"The first-Friday chai is where the best suggestions come from. Nothing beats face + chai."',  about: 'Alumni feedback loop',       color: '#F59E0B', emoji: '🍵' },
  { id: 'sv-4', voice: 'Staff · mess',                    said: '"They asked us about the menu · and changed it. Small thing. Felt big."',                       about: 'Staff voice in feedback',     color: '#FFD166', emoji: '🍲' },
  { id: 'sv-5', voice: 'Parent · attended event',          said: '"Filled the pulse form · got a call back the next week. I almost forgot I\'d written."',         about: 'Guest feedback reach',        color: '#A78BFA', emoji: '👋' },
  { id: 'sv-6', voice: 'Sustainability committee',          said: '"Green suggestions skip the queue. That one rule changed how fast we decarbonise events."',      about: 'Green priority rule',          color: '#22C55E', emoji: '🌿' },
];

// =====================================================
// Phase 3al: deeper suggestion structures — round 3
// =====================================================

interface SuggestionIntakeWindow {
  id: string;
  window: string;
  openFrom: string;
  theme: string;
  lead: string;
  color: string;
  emoji: string;
}

const SUGG_INTAKE_WINDOWS: SuggestionIntakeWindow[] = [
  { id: 'siw-1', window: 'Monsoon cycle',        openFrom: 'Jul 1 – Jul 20',     theme: 'Campus comfort + rain readiness',           lead: 'Ops + wellness',         color: '#38BDF8', emoji: '🌧️' },
  { id: 'siw-2', window: 'Onboarding cycle',      openFrom: 'Aug 5 – Aug 25',     theme: 'First-year experience · buddy system',     lead: 'People + content',       color: '#F59E0B', emoji: '🌱' },
  { id: 'siw-3', window: 'Festival cycle',        openFrom: 'Sep 15 – Oct 5',     theme: 'Events · partners · inclusion',             lead: 'Events + PR',            color: '#F472B6', emoji: '🎉' },
  { id: 'siw-4', window: 'Winter cycle',           openFrom: 'Nov 20 – Dec 15',    theme: 'Alumni return · bonfire + archive',          lead: 'Alumni + photo',         color: '#EF4444', emoji: '🔥' },
  { id: 'siw-5', window: 'Quiet cycle',             openFrom: 'Jan 20 – Feb 10',    theme: 'Habits · retros · rest · craft',             lead: 'Core council',           color: '#A78BFA', emoji: '🌙' },
  { id: 'siw-6', window: 'Green cycle',             openFrom: 'Mar 10 – Mar 30',    theme: 'Sustainability · saplings · pledges',        lead: 'Green wing',             color: '#22C55E', emoji: '🌿' },
  { id: 'siw-7', window: 'Open cycle',              openFrom: 'Always open',        theme: 'Anything urgent or out-of-cycle',            lead: 'Any lead on rotation',   color: '#FFD166', emoji: '🚪' },
];

interface SuggestionCommitteePick {
  id: string;
  suggestion: string;
  outcome: string;
  shippedOn: string;
  impact: string;
  color: string;
  emoji: string;
}

const SUGG_COMMITTEE_PICKS: SuggestionCommitteePick[] = [
  { id: 'scp-1', suggestion: 'Silent study hour · library',                 outcome: 'Formalised with rotation · 5:30-6:30 PM, three days a week.',    shippedOn: 'Jun 2023',    impact: '30+ regulars · calmer library overall.',                     color: '#A78BFA', emoji: '📚' },
  { id: 'scp-2', suggestion: 'Refill stations across campus',                outcome: '12 refill points installed · map pinned at entry.',                 shippedOn: 'Sep 2022',    impact: 'Single-use bottles down 34% month-on-month.',                color: '#22C55E', emoji: '🚰' },
  { id: 'scp-3', suggestion: 'Cross-wing pairing day · monthly',             outcome: 'Monthly ritual · picker bot pairs people randomly.',                shippedOn: 'Feb 2024',    impact: '62 new collaborations sparked in first quarter.',             color: '#00D4FF', emoji: '🤝' },
  { id: 'scp-4', suggestion: 'Post-event food donation pipeline',             outcome: 'Partnered with local NGO · pickup scheduled within 30 min.',        shippedOn: 'Aug 2023',    impact: '410 kg redirected in year one.',                               color: '#F59E0B', emoji: '🍲' },
  { id: 'scp-5', suggestion: 'Alumni letters wall · Hall of Fame',            outcome: 'Built rotating display · refreshed every quarter.',                 shippedOn: 'Jan 2024',    impact: '52 letters collected · reading corner busy daily.',            color: '#F472B6', emoji: '✉️' },
  { id: 'scp-6', suggestion: 'Clearer buddy pairs for first-years',           outcome: 'New buddy rota · 2 rituals/week · accountability owner.',           shippedOn: 'Aug 2023',    impact: 'Drop-off rate cut · 14→3 in first batch.',                     color: '#FFD166', emoji: '🧭' },
  { id: 'scp-7', suggestion: 'Carbon ledger · published monthly',              outcome: 'Auto-script scrapes ledgers · publishes to /green.',               shippedOn: 'Oct 2023',    impact: 'Vendors opt-in · public accountability rising.',               color: '#16A34A', emoji: '🌍' },
];

interface SuggestionDesignPrinciple {
  id: string;
  principle: string;
  inPractice: string;
  color: string;
  emoji: string;
}

const SUGG_DESIGN_PRINCIPLES: SuggestionDesignPrinciple[] = [
  { id: 'sdp-1', principle: 'Ideas are cheap · ownership is sacred.',                              inPractice: 'Every accepted suggestion has a named human within 48 hours.',                                       color: '#00D4FF', emoji: '🪪' },
  { id: 'sdp-2', principle: 'No suggestion dies in silence.',                                       inPractice: 'Every submission gets a reply · even if the reply is kind and tiny.',                                 color: '#F59E0B', emoji: '📣' },
  { id: 'sdp-3', principle: 'Critique the idea · celebrate the person.',                            inPractice: 'Replies separate technical critique from personal thanks · always.',                                   color: '#F472B6', emoji: '🫂' },
  { id: 'sdp-4', principle: 'Small shipped · before big imagined.',                                 inPractice: 'A 1-week prototype beats a 6-month plan every time.',                                                  color: '#22C55E', emoji: '🚢' },
  { id: 'sdp-5', principle: 'The loudest voice is not the most right.',                              inPractice: 'We sort by thoughtfulness · not by volume · and publish the math.',                                    color: '#A78BFA', emoji: '🎙️' },
  { id: 'sdp-6', principle: 'Trust builds when the no is kind + early.',                             inPractice: 'Closing a suggestion respectfully is a feature · not a failure.',                                      color: '#FFD166', emoji: '🪶' },
  { id: 'sdp-7', principle: 'We audit ourselves · we publish what we learn.',                        inPractice: 'Quarterly retro on the board itself · open notes · open fixes.',                                      color: '#EF4444', emoji: '🔍' },
];

interface SuggestionLifecycle {
  id: string;
  stage: string;
  owner: string;
  sla: string;
  rule: string;
  color: string;
  emoji: string;
}

const SUGG_LIFECYCLE: SuggestionLifecycle[] = [
  { id: 'sgl-1', stage: 'Submit',           owner: 'Anyone · member or alumni',    sla: 'Instant',            rule: 'One idea per submission · clear · kind · with one asked-for outcome.',                          color: '#00D4FF', emoji: '📥' },
  { id: 'sgl-2', stage: 'Triage',            owner: 'On-call suggestion buddy',      sla: 'Within 48 hours',     rule: 'Assign category · priority · pick named owner · send first kind reply.',                          color: '#F59E0B', emoji: '🔍' },
  { id: 'sgl-3', stage: 'Discuss',            owner: 'Named owner + 2 invited',      sla: 'Within 1 week',       rule: 'Scope out · publish decision rights · invite dissent before deciding.',                          color: '#A78BFA', emoji: '🗣️' },
  { id: 'sgl-4', stage: 'Decide',              owner: 'Named owner',                   sla: 'Within 2 weeks',      rule: 'Yes · no · or wait-with-reason · always published in the thread.',                               color: '#F472B6', emoji: '🪧' },
  { id: 'sgl-5', stage: 'Ship or archive',     owner: 'Named owner',                   sla: 'As decided',          rule: 'If ship · scoped · dated · small-shippable · if archive · kindly closed + thanked.',              color: '#22C55E', emoji: '🚀' },
  { id: 'sgl-6', stage: 'Retro',                owner: 'Ops + named owner',              sla: 'Within 1 month of ship', rule: 'Publish what worked · what did not · what we\'d change next · open for comment.',                  color: '#FFD166', emoji: '📝' },
  { id: 'sgl-7', stage: 'Celebrate + credit',   owner: 'PR + hospitality',               sla: 'Within 1 week of ship', rule: 'Credit the submitter + owner publicly · send a handwritten thank-you.',                         color: '#EF4444', emoji: '🫶' },
];

interface SuggestionReviewerDuty {
  id: string;
  duty: string;
  do: string;
  doNot: string;
  color: string;
  emoji: string;
}

const SUGG_REVIEWER_DUTIES: SuggestionReviewerDuty[] = [
  { id: 'srd-1', duty: 'Read every single submission · within 24h',                     do: 'Even if short · even if late · even if tired. One human reads each one.',                     doNot: 'Outsource the read to a bot · that would burn trust fast.',                                   color: '#00D4FF', emoji: '👀' },
  { id: 'srd-2', duty: 'Reply within 48h · even just to say \"seen\"',                  do: 'Kind · short · specific · even a single line keeps trust warm.',                                doNot: 'Leave it open for weeks · that is how good ideas quietly die.',                                color: '#F59E0B', emoji: '💬' },
  { id: 'srd-3', duty: 'Name an owner · or kindly close the thread',                      do: 'If we can own it · name the person · if we can\'t · say so · gently.',                           doNot: 'Ghost the submitter · or leave with a maybe that turns into a never.',                        color: '#F472B6', emoji: '🪪' },
  { id: 'srd-4', duty: 'Publish the decision publicly in the thread',                    do: 'Open · dated · reasoned · link to the retro or next step clearly.',                             doNot: 'Send the decision in DM only · decisions live in the open on the board.',                      color: '#A78BFA', emoji: '📜' },
  { id: 'srd-5', duty: 'Invite dissent before final call',                                  do: 'Pull in one neighbour wing · one alumnus who did this before · listen.',                     doNot: 'Rush the call because it is Friday · Friday is for rest not for rush-calls.',                  color: '#22C55E', emoji: '🪞' },
  { id: 'srd-6', duty: 'Retro every quarter · publish · fix the process',                 do: 'Audit the board · ask who stopped using it · fix the friction.',                                doNot: 'Defend the board · it is not sacred · it is a tool that should serve humans.',               color: '#FFD166', emoji: '🔁' },
];

interface SuggestionWorkedCase {
  id: string;
  title: string;
  submitter: string;
  journey: string;
  outcome: string;
  thanks: string;
  color: string;
  emoji: string;
}

const SUGG_WORKED_CASES: SuggestionWorkedCase[] = [
  { id: 'swc-1', title: 'Silent library · the year we built it',               submitter: 'Rohit + 2022 batch',               journey: 'Proposed as two-week pilot · then a semester pilot · then permanent.',                                         outcome: 'Formal ritual · 30+ regulars · now referenced by two other clubs.',              thanks: 'The library quietly saved two exam seasons worth of nerves.',                          color: '#A78BFA', emoji: '📚' },
  { id: 'swc-2', title: 'Refill stations · and how they paid back',              submitter: 'Tanvi · 2022',                      journey: 'Started with 2 stations · counted single-use bottles weekly · grew to 12.',                                    outcome: 'Plastic volume down 34% · now funded by annual campus budget.',                  thanks: 'A dry-run month of \"bring your own bottle\" made us believers.',                         color: '#22C55E', emoji: '🚰' },
  { id: 'swc-3', title: 'Cross-wing pair day · happy accident',                  submitter: 'Anonymous · first-year, 2023',       journey: 'Idea to mix strangers · pilot made random pairs · it stuck immediately.',                                     outcome: 'Monthly ritual · 62 collaborations in 4 months · two campaigns born here.',       thanks: 'The shy people spoke first · because the icebreaker wasn\'t optional.',                  color: '#00D4FF', emoji: '🤝' },
  { id: 'swc-4', title: 'Food donation pipeline · from leftover to loved',         submitter: 'Sunita didi + events team',          journey: 'Ten events logged leftovers · pipeline drafted with NGO · tested at bonfire.',                                 outcome: '410 kg redirected · three partners onboarded · zero refusals so far.',             thanks: 'The NGO now helps us plan portion sizes · and we help them carry.',                       color: '#F59E0B', emoji: '🍲' },
  { id: 'swc-5', title: 'Letters wall · twelve of us wrote at once',              submitter: 'Alumni committee',                    journey: 'Weekly open-hour · scanning sessions · thousand-letter archive forming.',                                     outcome: 'Rotating wall · 52 letters · reading corner busy daily after class.',              thanks: 'We found letters from 2008 that still read like today.',                                color: '#F472B6', emoji: '✉️' },
];

// =====================================================
// Phase 3ar: deeper suggestion structures — round 4
// =====================================================

interface SuggPitchTemplate {
  id: string;
  kind: string;
  structure: string;
  length: string;
  example: string;
  color: string;
  emoji: string;
}

const SUGG_PITCH_TEMPLATES: SuggPitchTemplate[] = [
  { id: 'spt-1', kind: 'One-paragraph pitch',                structure: 'Problem (1 sentence) · proposal (1) · first step (1) · who owns (1).',                              length: '~80 words',        example: 'Study rooms are full on Thursdays. Book a 90-min library slot for silent work. We\'ll run a 2-week pilot. Lib + Ops owns it.',                                                color: '#00D4FF', emoji: '📝' },
  { id: 'spt-2', kind: 'Letter to council',                     structure: 'Who · what we tried · what we learned · what we propose · with-whom · by-when.',                length: '~300 words',        example: 'We ran weekend coding sprints for a semester. Here is what worked. Here is what didn\'t. Can we make it monthly with Content + PR help?',                                        color: '#F59E0B', emoji: '✉️' },
  { id: 'spt-3', kind: 'Town-hall 90-second pitch',                 structure: 'Hook (10s) · why-now (20s) · proposal (30s) · ask (20s) · thanks (10s).',                          length: '90 seconds spoken',   example: '"Raise hand if you skipped a meal during finals. Food corner during exam weeks. We\'d cover 4 evenings. We need ₹8,000 + 6 volunteers. Done by April?"',                     color: '#A78BFA', emoji: '🎤' },
  { id: 'spt-4', kind: 'Design-dissent memo',                           structure: 'Position · evidence · risks we\'re accepting · alternatives considered · open questions.',             length: '~500 words',          example: '"Proposing we drop feature X. Here are 3 user interviews. Here\'s what we lose. Here\'s what we could try instead. Open to being talked out of it."',                    color: '#F472B6', emoji: '🧭' },
  { id: 'spt-5', kind: 'One-page plan',                                     structure: 'Goal · 3 metrics · 3 milestones · 3 risks · who · budget · first-week plan.',                       length: '1 page, templated',       example: 'Goal: 60 volunteers by May. Metrics: sign-ups, retention, NPS. Milestones: poster / booth / onboarding. Risks: clashing exams. Owner: Meera.',                       color: '#FFD166', emoji: '📄' },
  { id: 'spt-6', kind: 'RFC · request-for-comments',                           structure: 'Context · problem · proposal · tradeoffs · rollout · how to disagree · decision-by.',             length: '~800 words',               example: '"RFC: move weekly standups from Monday to Thursday. Here\'s the thinking. Comment by Friday. Decide Monday."',                                                     color: '#22C55E', emoji: '🧵' },
  { id: 'spt-7', kind: 'Retrospective brief',                                       structure: 'Went well · went badly · lucky · unlucky · what we\'ll change · what we won\'t.',                      length: '~250 words',                  example: '"Bonfire retro · 90 attendees · 14 volunteers · weather held · PA failed. Next: backup PA, earlier food, same ticket price."',                             color: '#EF4444', emoji: '🔄' },
];

interface SuggDecisionGate {
  id: string;
  gate: string;
  check: string;
  owner: string;
  whatNext: string;
  color: string;
  emoji: string;
}

const SUGG_DECISION_GATES: SuggDecisionGate[] = [
  { id: 'sdg-1', gate: 'Gate A · is it worth thinking about',         check: 'Would at least 3 members care? Does it touch an existing pain we\'ve measured?',                      owner: 'Any council member · 20 min',              whatNext: 'If yes → to Gate B. If no → write why · close with a thank-you.',                 color: '#00D4FF', emoji: '🚪' },
  { id: 'sdg-2', gate: 'Gate B · can we learn cheaply',                  check: 'Is there a 1-week pilot or 3-person test that de-risks the idea?',                                        owner: 'Wing lead + suggester',                       whatNext: 'If yes → pilot brief · assign owner · set metric. If no → design a cheaper test first.', color: '#F59E0B', emoji: '🧪' },
  { id: 'sdg-3', gate: 'Gate C · does pilot show signal',                    check: 'Did the metric move? Did the people asked-for show up? Any surprise harms?',                              owner: 'Pilot owner + reviewer pair',                    whatNext: 'If yes → scale plan to Gate D. If no → write learnings · archive honorably.',              color: '#A78BFA', emoji: '📊' },
  { id: 'sdg-4', gate: 'Gate D · do we have hands to scale',                      check: 'Do we have enough owners + budget + time to run it beyond pilot?',                                            owner: 'Council · weekly review',                           whatNext: 'If yes → rollout plan to Gate E. If no → pause · publish "we\'ll try next semester" note.',   color: '#F472B6', emoji: '🙌' },
  { id: 'sdg-5', gate: 'Gate E · is it sustainable for 3 cycles',                     check: 'Can this survive exam week · monsoon · a key person leaving?',                                                     owner: 'Ops lead + wing lead',                                  whatNext: 'If yes → fold into handbook · hand to maintainer. If no → reduce scope to what survives.',         color: '#FFD166', emoji: '🌿' },
  { id: 'sdg-6', gate: 'Gate F · is it safe for the quiet majority',                       check: 'Privacy · consent · cost · access · exclusion · pressure-to-join all reviewed by an outsider.',                         owner: 'Care lead · outside reviewer',                             whatNext: 'Block if a hard-no surfaces · fix before any rollout · no exceptions · document concessions.',      color: '#22C55E', emoji: '🛡️' },
  { id: 'sdg-7', gate: 'Gate G · who is it without',                                            check: 'Does it serve first-years? Non-tech folks? People without devices? People at night?',                                      owner: 'Inclusion reviewer',                                             whatNext: 'If gaps → design fixes before wider launch · note who we couldn\'t reach · keep invite open.',       color: '#EF4444', emoji: '🔎' },
];

interface SuggReviewerPrinciple {
  id: string;
  principle: string;
  whatItMeans: string;
  whatItIsNot: string;
  color: string;
  emoji: string;
}

const SUGG_REVIEWER_PRINCIPLES: SuggReviewerPrinciple[] = [
  { id: 'srp-1', principle: 'Read twice before you reply',                  whatItMeans: 'Understand the proposal on its own terms · re-read once for what you missed · then write back.',                    whatItIsNot: 'Not: skim · react · move on.',                                                         color: '#00D4FF', emoji: '📖' },
  { id: 'srp-2', principle: 'Praise the specific · critique the specific',        whatItMeans: 'Name what works with examples · name what needs work with examples · never generic.',                                  whatItIsNot: 'Not: "great job" · not: "this needs more work."',                                         color: '#F59E0B', emoji: '🎯' },
  { id: 'srp-3', principle: 'Steelman before you push back',                          whatItMeans: 'State the idea\'s strongest version in your own words · then share your disagreement.',                                     whatItIsNot: 'Not: straw-man · not: "have you considered not doing this."',                                color: '#A78BFA', emoji: '🛡️' },
  { id: 'srp-4', principle: 'Surface risks · don\'t hide them in footnotes',                whatItMeans: 'If a decision is risky · say so clearly at the top · flag blockers with a word like "blocker."',                              whatItIsNot: 'Not: buried paragraphs · not: "minor concern" for major issues.',                                color: '#F472B6', emoji: '🚨' },
  { id: 'srp-5', principle: 'Pass judgement on ideas · not on people',                         whatItMeans: 'Critique the proposal · not the person\'s worth · past work · or motives.',                                                       whatItIsNot: 'Not: "this is the kind of thing X always proposes."',                                                     color: '#FFD166', emoji: '⚖️' },
  { id: 'srp-6', principle: 'Close with next-step · never dead-end',                               whatItMeans: 'Every review ends with a sentence about what to try next · or how to close with dignity.',                                            whatItIsNot: 'Not: "this won\'t work."',                                                                           color: '#22C55E', emoji: '➡️' },
  { id: 'srp-7', principle: 'Sign your review',                                                      whatItMeans: 'Reviewers own their words · anonymous is for submitters · not reviewers.',                                                             whatItIsNot: 'Not: anonymous critique.',                                                                             color: '#EF4444', emoji: '🖋️' },
];

interface SuggConflictPath {
  id: string;
  situation: string;
  firstStep: string;
  ifStuck: string;
  ifHarm: string;
  color: string;
  emoji: string;
}

const SUGG_CONFLICT_PATHS: SuggConflictPath[] = [
  { id: 'scp-1', situation: 'Two valid ideas · one budget',                    firstStep: 'Propose a split-pilot · half budget each · shared retro · combined learnings.',                           ifStuck: 'Council gathers both owners · neutral facilitator · decides by reasoned vote.',                          ifHarm: 'If one idea risks excluding members · safety reviewer pauses it · weight not equal.',             color: '#00D4FF', emoji: '⚔️' },
  { id: 'scp-2', situation: 'Disagreement on scope',                                 firstStep: 'Re-read charter together · check what the charter covers · make the delta explicit.',                                 ifStuck: 'Write both scopes as separate proposals · pick one · shelve the other with a returnability note.',       ifHarm: 'If scope creep exhausts team · wing lead halts expansion · resets commitments.',                        color: '#F59E0B', emoji: '🧭' },
  { id: 'scp-3', situation: 'Feedback felt personal',                                     firstStep: 'Give it 24 hours · write what you heard vs what you felt · share with a trusted third.',                                  ifStuck: 'Request a mediated conversation · care lead facilitates · both parties prepare writing first.',              ifHarm: 'If mistreatment · direct to care lead · policy kicks in · no facilitation replaces safeguarding.',    color: '#A78BFA', emoji: '🫱' },
  { id: 'scp-4', situation: 'Wing lead says no · member disagrees',                         firstStep: 'Ask for written rationale · review with member · see if a smaller version survives.',                                      ifStuck: 'Escalate to council · council hears both · decides within 2 weeks · documents.',                                   ifHarm: 'If the no is retaliatory · ombudsperson path available · separate from operations.',                         color: '#F472B6', emoji: '🚪' },
  { id: 'scp-5', situation: 'Confidential proposal leaks',                                        firstStep: 'Acknowledge fast · write to submitter · apologize · investigate quietly.',                                                     ifStuck: 'Ethics lead opens a post-mortem · policy review · remedies · no scapegoats.',                                                ifHarm: 'If harm to submitter · care lead arranges support · costs covered · accountability documented.',             color: '#FFD166', emoji: '🔒' },
  { id: 'scp-6', situation: 'Two wings claim same territory',                                              firstStep: 'Host a joint scoping · one shared doc · one decision owner · second reviewer.',                                                       ifStuck: 'Split into complement roles · named jointly · operational plan published.',                                                             ifHarm: 'If politics over people · council intervenes · values-first · output second.',                                              color: '#22C55E', emoji: '🤝' },
  { id: 'scp-7', situation: 'Outside partner asks us to change values',                                          firstStep: 'Thank them · share the written values doc · ask for what flex they actually need.',                                                         ifStuck: 'Walk away with grace · offer an alt path · keep the door open.',                                                                         ifHarm: 'If pressure continues · leadership takes over · documents · sometimes public refusal is the healthiest option.', color: '#EF4444', emoji: '🕊️' },
];

interface SuggCommunicationCadence {
  id: string;
  cadence: string;
  channel: string;
  audience: string;
  rhythm: string;
  color: string;
  emoji: string;
}

const SUGG_COMM_CADENCES: SuggCommunicationCadence[] = [
  { id: 'sxc-1', cadence: 'Weekly intake digest',         channel: 'Club notice-board + app feed',           audience: 'All members',                   rhythm: 'Monday · 10 AM · 10-line digest · new suggestions · who\'s reviewing what.',                 color: '#00D4FF', emoji: '📬' },
  { id: 'sxc-2', cadence: 'Decision log',                   channel: 'Shared doc + read-only snapshot in app',    audience: 'All members · archived forever',      rhythm: 'Same week as the decision · every decision gets a one-paragraph entry with reasoning.',      color: '#F59E0B', emoji: '🗂️' },
  { id: 'sxc-3', cadence: 'Pilot retro memo',                  channel: 'Long-form post · emailed + in-app',          audience: 'Anyone who opts in',                  rhythm: 'End of each pilot · ~500 words · what worked · what didn\'t · what we\'ll try next.',      color: '#A78BFA', emoji: '🔁' },
  { id: 'sxc-4', cadence: 'Town-hall · open house',                 channel: 'In-person + livestream · recorded',             audience: 'Anyone · including non-members',       rhythm: 'Monthly · first Saturday · 90 min · 40 min open-floor · 50 min structured.',              color: '#F472B6', emoji: '🏛️' },
  { id: 'sxc-5', cadence: 'Anon box pick-up',                            channel: 'Physical box + digital mailbox',                      audience: 'Submitters + reviewers',                        rhythm: 'Tuesday · 6 PM · council reads · routes · responds within 7 days.',                         color: '#FFD166', emoji: '📮' },
  { id: 'sxc-6', cadence: 'Quiet-channel updates',                           channel: 'Opt-in low-volume newsletter',                               audience: 'Folks who prefer reading over meetings',              rhythm: 'Every two weeks · 6-bullet summary · quote · quiet request at the bottom.',                   color: '#22C55E', emoji: '📰' },
  { id: 'sxc-7', cadence: 'Year-end proposal book',                              channel: 'Printed + open PDF',                                              audience: 'Everyone · alumni · future members',                     rhythm: 'Every December · proposals of the year · decisions · outcomes · lessons.',                        color: '#EF4444', emoji: '📖' },
];

// =====================================================
// Phase 3ax: deeper suggestion structures — round 5
// =====================================================

interface SuggestionPilotRecipe {
  id: string;
  name: string;
  scope: string;
  budget: string;
  exitPlan: string;
  color: string;
  emoji: string;
}

const SUGGESTION_PILOT_RECIPES: SuggestionPilotRecipe[] = [
  { id: 'spr-1', name: 'The 2-week test',                        scope: 'Single cohort · one wing · one artefact',                 budget: '₹0–₹2k · whatever is already in the desk drawer',                exitPlan: 'At day 14 · one question asked in a circle · keep · kill · extend 14 more.',                        color: '#00D4FF', emoji: '🧪' },
  { id: 'spr-2', name: 'The 30-day season',                               scope: 'Two wings · one month · clear kpi',                                   budget: '₹5–₹10k · one-time · documented',                                           exitPlan: 'At day 30 · written retro · council vote to continue · refine · or stop with thanks.',                          color: '#F59E0B', emoji: '🌓' },
  { id: 'spr-3', name: 'The one-semester arc',                                          scope: 'Full club · one semester · one proposer',                                              budget: 'Up to ₹25k · quarterly check-ins',                                                        exitPlan: 'End of semester · public retro · keep as rhythm · archive as experiment.',                                          color: '#F472B6', emoji: '🌘' },
  { id: 'spr-4', name: 'The shadow pilot',                                                          scope: 'New idea tested in parallel with existing · no swap',                                                   budget: 'Zero additional · volunteer time only',                                                          exitPlan: 'Compare at month 2 · better outcome wins · no outcome · we sunset quietly.',                                                     color: '#A78BFA', emoji: '👥' },
  { id: 'spr-5', name: 'The silent trial',                                                                     scope: 'One person · one month · no announcement',                                                                         budget: 'Zero · craftperson tries it on themselves',                                                                   exitPlan: 'At month-end · craftperson writes one page · we read aloud · decide together.',                                                              color: '#22C55E', emoji: '🔇' },
  { id: 'spr-6', name: 'The seasonal pop-up',                                                                                 scope: 'One week · festival · high-energy window',                                                                                    budget: 'Small materials cost · shared with one sponsor',                                                                          exitPlan: 'Post-festival · 3 voice-notes · one circle · go/no-go for next festival.',                                                                        color: '#FFD166', emoji: '🎪' },
  { id: 'spr-7', name: 'The partner experiment',                                                                                              scope: 'Co-designed with an NGO or alumni chapter',                                                                                                  budget: 'Grant-funded · ₹15–₹50k · line-item',                                                                                      exitPlan: 'End of engagement · joint retro · joint decision · joint credit.',                                                                                    color: '#EF4444', emoji: '🤝' },
];

interface SuggestionImpactLedger {
  id: string;
  shipped: string;
  cost: string;
  benefit: string;
  followUp: string;
  color: string;
  emoji: string;
}

const SUGGESTION_IMPACT_LEDGER: SuggestionImpactLedger[] = [
  { id: 'sil-1', shipped: 'Moved read-aloud to Fridays',                               cost: '₹0 · changed a habit · took two weeks',                                 benefit: 'Attendance up 60% · ending the week together · calmer Mondays.',                                          followUp: 'Kept · now a tradition · read-aloud has outlived three cohorts.',                          color: '#F59E0B', emoji: '📚' },
  { id: 'sil-2', shipped: 'Replaced disposable cups with steel mugs',                                  cost: '₹18k one-time · 80 mugs · etched numbers',                                              benefit: '~2000 disposable cups avoided per year · ongoing savings · small ritual added.',                                                    followUp: 'Saw 5 mugs lost in 2 years · replacement fund set up · still cheaper than disposables.',                                     color: '#22C55E', emoji: '🥤' },
  { id: 'sil-3', shipped: 'Added a wellness lead role',                                                          cost: '₹0 cash · 3 hours of role-writing · consent of council',                                                           benefit: 'Two members who would have left stayed · three faster grievance responses documented.',                                                          followUp: 'Made permanent in year 2 · has a buddy · documented in playbook.',                                          color: '#EF4444', emoji: '🫖' },
  { id: 'sil-4', shipped: 'Opened grove plots to farewell plantings',                                                                    cost: '₹3k seedlings + ₹5k fence · one Saturday of labour',                                                                  benefit: '40 saplings in year 1 · memory practice for leaving seniors · shared across cohorts.',                                                              followUp: 'Extended to alumni chapters · global grove practice now active.',                                                        color: '#00D4FF', emoji: '🌱' },
  { id: 'sil-5', shipped: 'Created anonymous feedback mailbox',                                                                                    cost: '₹1k · physical box · padlock · card stock',                                                                                         benefit: '18 surfaced concerns in year 1 · 12 acted on · 4 turned into practices · hard truths heard.',                                                             followUp: 'Dual (physical+digital) rolled out · council reviews every two weeks · public summary quarterly.',                                                    color: '#A78BFA', emoji: '📮' },
  { id: 'sil-6', shipped: 'Weekly quiet hour · no-phone · no-laptop',                                                                                             cost: '₹0 · schedule reshuffle only',                                                                                                     benefit: 'Focus reports rising · journal entries gaining depth · hour has become "non-negotiable" for many.',                                                              followUp: 'Duration extended to 90 min · one expression-circle added after · regular attendance.',                                                           color: '#F472B6', emoji: '🤫' },
  { id: 'sil-7', shipped: 'Printed the year-end proposal book',                                                                                                            cost: '₹12k · design + print run of 150',                                                                                                                    benefit: 'Alumni engagement up · used by 4 other clubs as template · archive quality rose.',                                                                                             followUp: 'Annual tradition · redesigned each year · one alumna designs it as gift.',                                                                                      color: '#FFD166', emoji: '📘' },
];

interface SuggestionFollowUpRing {
  id: string;
  after: string;
  checkIn: string;
  signal: string;
  responder: string;
  color: string;
  emoji: string;
}

const SUGGESTION_FOLLOWUP_RINGS: SuggestionFollowUpRing[] = [
  { id: 'sfr-1', after: 'Day 7 after shipping',                             checkIn: 'Short note to proposer · 3 sentences',                             signal: 'How does it feel so far · one line of truth asked for.',                             responder: 'Original reviewer',                                color: '#00D4FF', emoji: '⏱️' },
  { id: 'sfr-2', after: 'Day 30 after shipping',                                        checkIn: 'One-on-one with two users · quick voice call',                                        signal: 'Actually-used or quietly-ignored · willingness to write 3 sentences.',                                        responder: 'Wing lead + craftperson',                                             color: '#22C55E', emoji: '🌱' },
  { id: 'sfr-3', after: 'Day 90 after shipping',                                                    checkIn: 'Cohort-wide note · optional 3-question pulse',                                                     signal: 'Adoption vs. adaptation vs. abandonment · simple label.',                                                      responder: 'Council rotating',                                                            color: '#F472B6', emoji: '📡' },
  { id: 'sfr-4', after: 'Day 180 after shipping',                                                                 checkIn: 'Written mid-life retro · 1-pager',                                                                      signal: 'Keep · refine · retire · one-word verdict with reasons.',                                                                  responder: 'Proposer + wing lead',                                                                 color: '#F59E0B', emoji: '📝' },
  { id: 'sfr-5', after: 'Day 365 after shipping',                                                                             checkIn: 'Birthday retro · circle + shared meal',                                                                                   signal: 'Has this become part of us · or left the building?',                                                                                   responder: 'Whole club · rotating facilitator',                                                                    color: '#A78BFA', emoji: '🎂' },
  { id: 'sfr-6', after: 'Day 730 · second year',                                                                                           checkIn: 'Letter to the next cohort · from the proposer',                                                                                                 signal: 'Does this deserve a permanent sentence in the playbook?',                                                                                                   responder: 'Proposer + council',                                                                                                 color: '#FFD166', emoji: '📜' },
  { id: 'sfr-7', after: 'Day 1000 · legacy review',                                                                                                     checkIn: 'Public archive entry · named · dated',                                                                                                               signal: 'Did it change how we work · or become furniture?',                                                                                                                    responder: 'Archive keeper + council chair',                                                                                                                  color: '#EF4444', emoji: '🗄️' },
];

const SuggestionScreen: React.FC = () => {
  // ------------ State ------------
  const [suggestions, setSuggestions] = useState<ExtSuggestion[]>(SAMPLE_SUGGESTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | Suggestion['priority']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('most-voted');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ExtSuggestion | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // form state
  const [formCategory, setFormCategory] = useState<string>(SUGGESTION_CATEGORIES[0].id);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Suggestion['priority']>('medium');
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const chipAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // -------------- Effects ----------------
  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(chipAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [headerAnim, statsAnim, chipAnim, listAnim]);

  useEffect(() => {
    const target = showDetailModal || showSubmitModal;
    if (target) {
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, friction: 7 }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: ANIM.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalScale.setValue(0.9);
      modalOpacity.setValue(0);
    }
  }, [showDetailModal, showSubmitModal, modalScale, modalOpacity]);

  // -------------- Filtering --------------
  const filtered = useMemo(() => {
    let list = suggestions;

    if (selectedCategory !== 'all')
      list = list.filter((s) => s.category === selectedCategory);
    if (selectedStatus !== 'all') list = list.filter((s) => s.status === selectedStatus);
    if (selectedPriority !== 'all') list = list.filter((s) => s.priority === selectedPriority);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sortKey) {
      case 'most-voted':
        list = [...list].sort((a, b) => b.votedCount - a.votedCount);
        break;
      case 'newest':
        list = [...list].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        break;
      case 'oldest':
        list = [...list].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
        break;
      case 'priority-high':
        list = [...list].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
        break;
      case 'priority-low':
        list = [...list].sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
        break;
      case 'alphabetical':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return list;
  }, [suggestions, selectedCategory, selectedStatus, selectedPriority, searchQuery, sortKey]);

  const hasFilters =
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    searchQuery.trim().length > 0;

  // -------------- Handlers ---------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  }, []);

  const openDetail = useCallback((s: ExtSuggestion) => {
    setSelectedSuggestion(s);
    setShowDetailModal(true);
  }, []);

  const closeDetail = useCallback(() => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedSuggestion(null), 220);
  }, []);

  const handleVote = useCallback((s: ExtSuggestion) => {
    setSuggestions((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              upvotedByMe: !x.upvotedByMe,
              votedCount: x.upvotedByMe ? x.votedCount - 1 : x.votedCount + 1,
            }
          : x
      )
    );
  }, []);

  const handleShareSuggestion = useCallback(async (s: ExtSuggestion) => {
    try {
      await Share.share({
        message: `💡 "${s.title}" — suggestion by ${s.isAnonymous ? 'an anonymous member' : s.authorName ?? 'a Taru Guardian'}.\n\n${s.description}\n\nVote on the Taru Guardians app.`,
      });
    } catch {
      // user cancelled
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSearchQuery('');
  }, []);

  const openSubmit = useCallback(() => setShowSubmitModal(true), []);
  const closeSubmit = useCallback(() => {
    setShowSubmitModal(false);
    setFormTitle('');
    setFormDescription('');
    setFormTags([]);
    setFormTagInput('');
    setFormPriority('medium');
    setFormAnonymous(false);
    setFormCategory(SUGGESTION_CATEGORIES[0].id);
  }, []);

  const addTag = useCallback(() => {
    const t = formTagInput.trim().toLowerCase();
    if (!t) return;
    if (formTags.includes(t)) {
      setFormTagInput('');
      return;
    }
    if (formTags.length >= 5) {
      Alert.alert('Tag limit', 'Up to 5 tags per suggestion.');
      return;
    }
    setFormTags((prev) => [...prev, t]);
    setFormTagInput('');
  }, [formTagInput, formTags]);

  const removeTag = useCallback((tag: string) => {
    setFormTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const submitSuggestion = useCallback(() => {
    if (formTitle.trim().length < 8) {
      Alert.alert('Title too short', 'Please write a clearer title (min 8 characters).');
      return;
    }
    if (formDescription.trim().length < 30) {
      Alert.alert(
        'Description too short',
        'Please describe the idea in more detail (min 30 characters).'
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newSuggestion: ExtSuggestion = {
        id: String(suggestions.length + 1),
        category: formCategory,
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
        votedCount: 1,
        upvotedByMe: true,
        commentCount: 0,
        isAnonymous: formAnonymous,
        authorName: formAnonymous ? undefined : 'You',
        tags: formTags.length > 0 ? formTags : ['new'],
      };
      setSuggestions((prev) => [newSuggestion, ...prev]);
      setSubmitting(false);
      closeSubmit();
      Alert.alert(
        'Submitted',
        'Thanks! Your suggestion is now live. Council will review within 14 days.'
      );
    }, 700);
  }, [
    formCategory,
    formTitle,
    formDescription,
    formPriority,
    formAnonymous,
    formTags,
    suggestions.length,
    closeSubmit,
  ]);

  // -------------- Sub-renderers ----------

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#06141F', '#0A2634', Colors.tech.neonBlue + '44']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeadBlock}>
            <Text style={styles.headerEyebrow}>💡 Taru Guardians</Text>
            <Text style={styles.headerTitle}>Suggestion Box</Text>
            <Text style={styles.headerSubtitle}>
              Anyone can shape the club. Drop an idea · vote · track what gets built.
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="New suggestion"
            onPress={openSubmit}
            style={styles.submitFab}
          >
            <Text style={styles.submitFabText}>＋</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{totalSuggestions()}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#4ADE80' }]}>{implementedCount()}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#38BDF8' }]}>{inReviewCount()}</Text>
            <Text style={styles.statLabel}>In review</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingCount()}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{totalVotes()}</Text>
            <Text style={styles.statLabel}>Votes</Text>
          </View>
        </Animated.View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search title, description, tag…"
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
        </View>

        <View style={styles.quickFilterRow}>
          {(['all', 'pending', 'reviewed', 'implemented', 'rejected'] as FilterStatus[]).map(
            (f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setSelectedStatus(f)}
                style={[
                  styles.statusChip,
                  selectedStatus === f && styles.statusChipActive,
                  f !== 'all' && {
                    borderColor: STATUS_META[f as Suggestion['status']].color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedStatus === f && styles.statusChipTextActive,
                  ]}
                >
                  {f === 'all'
                    ? 'All'
                    : `${STATUS_META[f as Suggestion['status']].icon} ${
                        STATUS_META[f as Suggestion['status']].label
                      }`}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCategoryRail = () => (
    <Animated.View
      style={{
        opacity: chipAnim,
        transform: [
          {
            translateY: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
          },
        ],
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive,
          ]}
        >
          <Text style={styles.categoryIcon}>🌐</Text>
          <Text
            style={[
              styles.categoryLabel,
              selectedCategory === 'all' && styles.categoryLabelActive,
            ]}
          >
            All categories
          </Text>
        </TouchableOpacity>
        {SUGGESTION_CATEGORIES.map((c) => {
          const active = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[
                styles.categoryChip,
                active && { borderColor: c.color, backgroundColor: c.color + '22' },
              ]}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  active && { color: c.color, fontWeight: '800' },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderPriorityRow = () => (
    <View style={styles.priorityRow}>
      <Text style={styles.priorityLabel}>Priority</Text>
      {(['all', 'high', 'medium', 'low'] as const).map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => setSelectedPriority(p)}
          style={[
            styles.priorityChip,
            selectedPriority === p && {
              backgroundColor:
                p === 'all' ? '#ffffff22' : PRIORITY_META[p as Suggestion['priority']].color + '33',
              borderColor:
                p === 'all' ? '#ffffff55' : PRIORITY_META[p as Suggestion['priority']].color,
            },
          ]}
        >
          <Text
            style={[
              styles.priorityChipText,
              selectedPriority === p && { fontWeight: '800' },
            ]}
          >
            {p === 'all' ? 'All' : `${PRIORITY_META[p as Suggestion['priority']].icon} ${p}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTrending = () => {
    if (hasFilters) return null;
    const top = [...suggestions]
      .sort((a, b) => b.votedCount - a.votedCount)
      .slice(0, 5);
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🔥 Trending right now</Text>
          <Text style={styles.sectionCaption}>Top {top.length} by votes</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={IS_TABLET ? 320 : SCREEN_WIDTH * 0.78}
          decelerationRate="fast"
          contentContainerStyle={styles.trendingScroll}
        >
          {top.map((s, idx) => {
            const cat = SUGGESTION_CATEGORIES.find((c) => c.id === s.category);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => openDetail(s)}
                activeOpacity={0.9}
                style={styles.trendingCard}
              >
                <LinearGradient
                  colors={[
                    (cat?.color ?? '#ffffff') + '33',
                    '#0A0F14',
                  ]}
                  style={styles.trendingGradient}
                >
                  <View style={styles.trendingHeaderRow}>
                    <Text style={styles.trendingRank}>#{idx + 1}</Text>
                    <Text style={styles.trendingCategory}>
                      {cat?.icon} {cat?.name}
                    </Text>
                  </View>
                  <Text style={styles.trendingTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                  <Text style={styles.trendingDesc} numberOfLines={3}>
                    {s.description}
                  </Text>
                  <View style={styles.trendingFooter}>
                    <Text style={styles.trendingVotes}>⬆ {s.votedCount} votes</Text>
                    <Text
                      style={[
                        styles.trendingStatus,
                        { color: STATUS_META[s.status].color },
                      ]}
                    >
                      {STATUS_META[s.status].icon} {STATUS_META[s.status].label}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTags = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏷️ Popular tags</Text>
          <Text style={styles.sectionCaption}>{TRENDING_TAGS.length} tags</Text>
        </View>
        <View style={styles.tagCloud}>
          {TRENDING_TAGS.map(([tag, count]) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSearchQuery(tag)}
              style={styles.tagPill}
            >
              <Text style={styles.tagText}>#{tag}</Text>
              <Text style={styles.tagCount}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRoadmap = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🗺️ Quarterly Roadmap</Text>
          <Text style={styles.sectionCaption}>{ROADMAP_ITEMS.length} items tracked</Text>
        </View>
        <View style={styles.roadmapWrap}>
          {ROADMAP_ITEMS.map((r) => {
            const cat = SUGGESTION_CATEGORIES.find((c) => c.id === r.category);
            return (
              <TouchableOpacity
                key={`rm-${r.id}`}
                onPress={() => openDetail(r)}
                style={styles.roadmapItem}
                activeOpacity={0.9}
              >
                <View style={[styles.roadmapIndicator, { backgroundColor: cat?.color ?? '#888' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.roadmapQuarter}>{r.estimatedQuarter}</Text>
                  <Text style={styles.roadmapTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text style={styles.roadmapCaption}>
                    {STATUS_META[r.status].icon} {STATUS_META[r.status].label}
                  </Text>
                </View>
                <Text style={styles.roadmapArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLeaderboard = () => {
    if (hasFilters) return null;
    const sorted = [...LEADERBOARD].sort((a, b) => b.votesEarned - a.votesEarned);
    const medal = (idx: number) => (idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`);
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏆 Contributor leaderboard</Text>
          <Text style={styles.sectionCaption}>By votes earned</Text>
        </View>
        <View style={styles.leaderCard}>
          {sorted.map((c, idx) => (
            <View key={c.id} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>{medal(idx)}</Text>
              <View style={[styles.leaderAvatar, { backgroundColor: c.color + '2A' }]}>
                <Text style={styles.leaderAvatarText}>{c.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderName}>{c.name}</Text>
                <Text style={styles.leaderTag} numberOfLines={1}>{c.tag}</Text>
              </View>
              <View style={styles.leaderMetrics}>
                <Text style={[styles.leaderVotes, { color: c.color }]}>
                  {c.votesEarned}
                </Text>
                <Text style={styles.leaderSub}>
                  {c.submitted} sent · {c.shipped} shipped · 🔥 {c.streak}w
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAnalytics = () => {
    if (hasFilters) return null;
    const maxCount = Math.max(...CATEGORY_ANALYTICS.map((c) => c.count));
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📊 Category mix</Text>
          <Text style={styles.sectionCaption}>Ship rate · avg days</Text>
        </View>
        <View style={styles.analyticsCard}>
          {CATEGORY_ANALYTICS.map((c) => {
            const pct = c.count > 0 ? Math.max(0.06, c.count / maxCount) : 0.06;
            const shipRate = c.count > 0 ? Math.round((c.shipped / c.count) * 100) : 0;
            return (
              <View key={c.id} style={styles.analyticsRow}>
                <View style={styles.analyticsLabelCol}>
                  <Text style={styles.analyticsName}>{c.icon} {c.label}</Text>
                  <Text style={styles.analyticsSub}>
                    {c.count} ideas · {shipRate}% shipped · ~{c.avgDaysToShip}d
                  </Text>
                </View>
                <View style={styles.analyticsBarCol}>
                  <View style={styles.analyticsBarBg}>
                    <View
                      style={[
                        styles.analyticsBarFill,
                        { width: `${Math.round(pct * 100)}%`, backgroundColor: c.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.analyticsValue, { color: c.color }]}>
                    {c.count}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderVelocity = () => {
    if (hasFilters) return null;
    const maxSub = Math.max(...VELOCITY_SERIES.map((v) => v.submitted));
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>⏱ Velocity · 12 weeks</Text>
          <Text style={styles.sectionCaption}>Submitted vs shipped</Text>
        </View>
        <View style={styles.velocityCard}>
          <View style={styles.velocityChart}>
            {VELOCITY_SERIES.map((v) => {
              const subH = Math.max(6, (v.submitted / maxSub) * 120);
              const shipH = Math.max(4, (v.shipped / maxSub) * 120);
              return (
                <View key={v.id} style={styles.velocityCol}>
                  <View style={styles.velocityBarWrap}>
                    <View
                      style={[
                        styles.velocityBarSub,
                        { height: subH, backgroundColor: Colors.tech.neonBlue + '55' },
                      ]}
                    />
                    <View
                      style={[
                        styles.velocityBarShip,
                        { height: shipH, backgroundColor: '#22C55E' },
                      ]}
                    />
                  </View>
                  <Text style={styles.velocityLabel}>{v.week}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.velocityLegendRow}>
            <View style={styles.velocityLegend}>
              <View
                style={[
                  styles.velocityLegendDot,
                  { backgroundColor: Colors.tech.neonBlue + '88' },
                ]}
              />
              <Text style={styles.velocityLegendText}>Submitted</Text>
            </View>
            <View style={styles.velocityLegend}>
              <View style={[styles.velocityLegendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.velocityLegendText}>Shipped</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderMonthlyDigest = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📬 Monthly digest</Text>
          <Text style={styles.sectionCaption}>Last 6 months</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.digestScroll}
        >
          {MONTHLY_DIGEST.map((m) => (
            <View key={m.id} style={styles.digestCard}>
              <LinearGradient
                colors={['#0F1A1F', '#0A0F14']}
                style={styles.digestGradient}
              >
                <Text style={styles.digestMonth}>{m.month}</Text>
                <View style={styles.digestStatsRow}>
                  <View style={styles.digestStat}>
                    <Text style={styles.digestStatValue}>{m.submitted}</Text>
                    <Text style={styles.digestStatLabel}>submitted</Text>
                  </View>
                  <View style={styles.digestStat}>
                    <Text style={[styles.digestStatValue, { color: '#22C55E' }]}>
                      {m.shipped}
                    </Text>
                    <Text style={styles.digestStatLabel}>shipped</Text>
                  </View>
                  <View style={styles.digestStat}>
                    <Text style={[styles.digestStatValue, { color: '#F59E0B' }]}>
                      {m.rejectedWithCare}
                    </Text>
                    <Text style={styles.digestStatLabel}>declined · w/care</Text>
                  </View>
                </View>
                <Text style={styles.digestTopLabel}>Top idea</Text>
                <Text style={styles.digestTopText} numberOfLines={2}>
                  {m.topIdea}
                </Text>
                <Text style={styles.digestTopVotes}>↑ {m.topIdeaVotes} votes</Text>
                <View style={styles.digestHighlightRow}>
                  <Text style={styles.digestHighlight} numberOfLines={3}>
                    {m.highlight}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTracking = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📍 Your submissions</Text>
          <Text style={styles.sectionCaption}>Trail · next step</Text>
        </View>
        {TRACKED_SUBMISSIONS.map((t) => (
          <View key={t.id} style={[styles.trackCard, { borderLeftColor: t.color }]}>
            <View style={styles.trackHeaderRow}>
              <Text style={styles.trackTitle} numberOfLines={2}>{t.title}</Text>
              <View style={[styles.trackCatPill, { backgroundColor: t.color + '2A' }]}>
                <Text style={[styles.trackCatText, { color: t.color }]}>{t.category}</Text>
              </View>
            </View>
            <Text style={styles.trackMeta}>
              Owner: {t.owner} · submitted {t.submittedOn}
            </Text>
            <View style={styles.trackTimeline}>
              {t.statusPath.map((s, idx) => (
                <View key={idx} style={styles.trackStep}>
                  <View
                    style={[
                      styles.trackDot,
                      { backgroundColor: s.done ? t.color : '#ffffff24' },
                    ]}
                  >
                    {s.done ? (
                      <Text style={styles.trackDotCheck}>✓</Text>
                    ) : (
                      <View style={styles.trackDotIdle} />
                    )}
                  </View>
                  {idx < t.statusPath.length - 1 ? (
                    <View
                      style={[
                        styles.trackConnector,
                        { backgroundColor: s.done ? t.color + '88' : '#ffffff16' },
                      ]}
                    />
                  ) : null}
                  <View style={{ flex: 1, paddingBottom: 10 }}>
                    <Text
                      style={[
                        styles.trackStepLabel,
                        { color: s.done ? Colors.text.primary : Colors.text.muted },
                      ]}
                    >
                      {s.label}
                    </Text>
                    <Text style={styles.trackStepAt}>{s.at}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.trackNextRow}>
              <Text style={styles.trackNextLabel}>Next</Text>
              <Text style={styles.trackNextText}>{t.nextStep}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderRow}>
      <Text style={styles.listHeaderTitle}>
        {filtered.length} suggestion{filtered.length === 1 ? '' : 's'}
        {selectedCategory !== 'all'
          ? ` · ${SUGGESTION_CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
          : ''}
      </Text>
      {hasFilters && (
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.listHeaderReset}>Reset filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCard = ({ item, index }: { item: ExtSuggestion; index: number }) => {
    const cat = SUGGESTION_CATEGORIES.find((c) => c.id === item.category);
    const status = STATUS_META[item.status];
    const pr = PRIORITY_META[item.priority];
    return (
      <Animated.View
        style={[
          styles.cardOuter,
          {
            opacity: listAnim,
            transform: [
              {
                translateY: listAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12 + (index % 5) * 2, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => openDetail(item)}
          android_ripple={{ color: (cat?.color ?? '#888') + '33' }}
          style={styles.cardInner}
        >
          <LinearGradient
            colors={[(cat?.color ?? '#888') + '1F', '#0A0F14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.catBadge, { borderColor: cat?.color, backgroundColor: (cat?.color ?? '#888') + '22' }]}>
                <Text style={styles.catBadgeText}>
                  {cat?.icon} {cat?.name}
                </Text>
              </View>
              <Text style={styles.cardDate}>{item.submittedAt}</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </Text>

            <View style={styles.cardTagRow}>
              {item.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardMetaRow}>
              <View style={styles.cardMetaCell}>
                <Text style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.cardMetaText, { color: status.color }]}>
                  {status.icon} {status.label}
                </Text>
              </View>
              <View style={styles.cardMetaCell}>
                <Text style={styles.cardMetaText}>{pr.icon} {pr.label}</Text>
              </View>
              <View style={styles.cardMetaCell}>
                <Text style={styles.cardMetaText}>💬 {item.commentCount}</Text>
              </View>
            </View>

            <View style={styles.cardFooterRow}>
              <TouchableOpacity
                onPress={() => handleVote(item)}
                style={[
                  styles.voteButton,
                  item.upvotedByMe && styles.voteButtonActive,
                ]}
              >
                <Text
                  style={[styles.voteIcon, item.upvotedByMe && { color: '#000' }]}
                >
                  ⬆
                </Text>
                <Text
                  style={[styles.voteCount, item.upvotedByMe && { color: '#000' }]}
                >
                  {item.votedCount}
                </Text>
              </TouchableOpacity>
              <Text style={styles.cardAuthor}>
                {item.isAnonymous ? 'Anonymous' : `by ${item.authorName ?? 'Member'}`}
              </Text>
              <TouchableOpacity onPress={() => handleShareSuggestion(item)}>
                <Text style={styles.shareIcon}>🔗</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🧐</Text>
      <Text style={styles.emptyTitle}>No suggestions match these filters</Text>
      <Text style={styles.emptySubtitle}>Reset filters or be the first to submit an idea here.</Text>
      <View style={styles.emptyRow}>
        <TouchableOpacity style={styles.emptyButtonGhost} onPress={clearFilters}>
          <Text style={styles.emptyButtonGhostText}>Reset filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emptyButton} onPress={openSubmit}>
          <Text style={styles.emptyButtonText}>＋ New suggestion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.cardOuter, { opacity: 0.6 }]}>
          <View style={[styles.cardGradient, styles.skeletonGradient]}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '70%' }]} />
            <View style={[styles.skeletonLine, { width: '50%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{filtered.length} of {suggestions.length} suggestions</Text>
      <Text style={styles.footerText}>💚 Your voice builds this club.</Text>
    </View>
  );

  // -------------- Detail modal -----------
  const renderDetailModal = () => {
    if (!selectedSuggestion) return null;
    const s = selectedSuggestion;
    const cat = SUGGESTION_CATEGORIES.find((c) => c.id === s.category);
    const status = STATUS_META[s.status];
    const pr = PRIORITY_META[s.priority];
    return (
      <Modal
        visible={showDetailModal}
        transparent
        animationType="none"
        onRequestClose={closeDetail}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDetail} />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }], opacity: modalOpacity },
            ]}
          >
            <LinearGradient
              colors={[(cat?.color ?? '#888') + '2A', '#0A0F14']}
              style={styles.modalHero}
            >
              <View style={styles.modalHeroTop}>
                <View
                  style={[
                    styles.catBadge,
                    { borderColor: cat?.color, backgroundColor: (cat?.color ?? '#888') + '22' },
                  ]}
                >
                  <Text style={styles.catBadgeText}>
                    {cat?.icon} {cat?.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeDetail} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{s.title}</Text>
              <Text style={styles.modalMeta}>
                {s.isAnonymous ? 'Anonymous' : `by ${s.authorName ?? 'Member'}`} · {s.submittedAt}
              </Text>

              <View style={styles.modalMetaRow}>
                <View style={[styles.modalMetaPill, { borderColor: status.color }]}>
                  <Text style={{ color: status.color, fontWeight: '700', fontSize: 12 }}>
                    {status.icon} {status.label}
                  </Text>
                </View>
                <View style={[styles.modalMetaPill, { borderColor: pr.color }]}>
                  <Text style={{ color: pr.color, fontWeight: '700', fontSize: 12 }}>
                    {pr.icon} {pr.label} priority
                  </Text>
                </View>
                <View style={styles.modalMetaPill}>
                  <Text style={{ color: Colors.text.primary, fontSize: 12 }}>⬆ {s.votedCount}</Text>
                </View>
                <View style={styles.modalMetaPill}>
                  <Text style={{ color: Colors.text.primary, fontSize: 12 }}>💬 {s.commentCount}</Text>
                </View>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalSectionBody}>{s.description}</Text>
              </View>

              {s.tags.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tags</Text>
                  <View style={styles.tagCloud}>
                    {s.tags.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={styles.tagPill}
                        onPress={() => {
                          setSearchQuery(t);
                          closeDetail();
                        }}
                      >
                        <Text style={styles.tagText}>#{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              {s.reviewerNote ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    Reviewer note · {s.reviewedBy ?? 'Council'}
                  </Text>
                  <View style={styles.noteBlock}>
                    <Text style={styles.noteText}>{s.reviewerNote}</Text>
                    {s.estimatedQuarter ? (
                      <Text style={styles.noteMeta}>ETA: {s.estimatedQuarter}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {s.roadmap && s.roadmap.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Delivery plan</Text>
                  {s.roadmap.map((r, idx) => (
                    <View key={idx} style={styles.checklistRow}>
                      <View
                        style={[
                          styles.checklistDot,
                          r.done
                            ? { backgroundColor: '#4ADE80', borderColor: '#4ADE80' }
                            : { borderColor: '#ffffff55' },
                        ]}
                      >
                        {r.done ? <Text style={styles.checkTick}>✓</Text> : null}
                      </View>
                      <Text
                        style={[
                          styles.checklistText,
                          r.done && { color: Colors.text.muted, textDecorationLine: 'line-through' },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>How is this reviewed?</Text>
                <Text style={styles.modalSectionBody}>
                  Every suggestion is triaged weekly by the relevant Wing lead and the Core Council.
                  You'll get a status update in-app within 14 days, plus a public reviewer note. You
                  can vote to signal priority and comment to help shape execution.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  {
                    backgroundColor: s.upvotedByMe
                      ? Colors.tech.neonBlue
                      : '#ffffff18',
                  },
                ]}
                onPress={() => handleVote(s)}
              >
                <Text
                  style={[
                    styles.modalActionText,
                    { color: s.upvotedByMe ? '#000' : Colors.text.primary },
                  ]}
                >
                  {s.upvotedByMe ? '⬆ Voted' : '⬆ Upvote'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={() => handleShareSuggestion(s)}
              >
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#16A34A' }]}
                onPress={() => {
                  closeDetail();
                  setTimeout(() => openSubmit(), 240);
                }}
              >
                <Text style={styles.modalActionText}>＋ Add related</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // -------------- Submit modal -----------
  const renderSubmitModal = () => (
    <Modal
      visible={showSubmitModal}
      transparent
      animationType="none"
      onRequestClose={closeSubmit}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSubmit} />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }], opacity: modalOpacity },
            ]}
          >
            <LinearGradient
              colors={['#0A2634', '#041018']}
              style={styles.modalHero}
            >
              <View style={styles.modalHeroTop}>
                <Text style={styles.headerEyebrowInv}>📝 New idea</Text>
                <TouchableOpacity onPress={closeSubmit} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>Suggest an improvement</Text>
              <Text style={styles.modalMeta}>
                Clear title + what + why + one concrete next step = 3× more likely to get reviewed.
              </Text>
            </LinearGradient>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 4 }}
                  >
                    {SUGGESTION_CATEGORIES.map((c) => {
                      const active = formCategory === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => setFormCategory(c.id)}
                          style={[
                            styles.formCategoryChip,
                            active && {
                              borderColor: c.color,
                              backgroundColor: c.color + '22',
                            },
                          ]}
                        >
                          <Text style={styles.formCategoryIcon}>{c.icon}</Text>
                          <Text
                            style={[
                              styles.formCategoryLabel,
                              active && { color: c.color, fontWeight: '800' },
                            ]}
                          >
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <Text style={styles.formHelpText}>
                    {SUGGESTION_CATEGORIES.find((c) => c.id === formCategory)?.description}
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formTitle}
                    onChangeText={setFormTitle}
                    placeholder="e.g. Weekend nature camping + tree plantation"
                    placeholderTextColor={Colors.text.muted}
                    maxLength={120}
                  />
                  <Text style={styles.formCounter}>{formTitle.length}/120</Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Describe the idea</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder="What, why, who benefits, and one concrete first step. Min 30 characters."
                    placeholderTextColor={Colors.text.muted}
                    multiline
                    maxLength={700}
                  />
                  <Text style={styles.formCounter}>{formDescription.length}/700</Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Priority</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {(['high', 'medium', 'low'] as Suggestion['priority'][]).map((p) => {
                      const active = formPriority === p;
                      return (
                        <TouchableOpacity
                          key={p}
                          onPress={() => setFormPriority(p)}
                          style={[
                            styles.formPriorityChip,
                            active && {
                              borderColor: PRIORITY_META[p].color,
                              backgroundColor: PRIORITY_META[p].color + '22',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.formPriorityText,
                              active && { color: PRIORITY_META[p].color, fontWeight: '800' },
                            ]}
                          >
                            {PRIORITY_META[p].icon} {PRIORITY_META[p].label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Tags ({formTags.length}/5)</Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={formTagInput}
                      onChangeText={setFormTagInput}
                      placeholder="e.g. sustainability, offline…"
                      placeholderTextColor={Colors.text.muted}
                      onSubmitEditing={addTag}
                      returnKeyType="done"
                      maxLength={20}
                    />
                    <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                      <Text style={styles.tagAddText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  {formTags.length > 0 && (
                    <View style={styles.tagCloud}>
                      {formTags.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={styles.tagPill}
                          onPress={() => removeTag(t)}
                        >
                          <Text style={styles.tagText}>#{t}</Text>
                          <Text style={styles.tagRemove}>✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formSection}>
                  <View style={styles.anonymousRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Submit anonymously?</Text>
                      <Text style={styles.formHelpText}>
                        Council will see the idea but not your name.
                      </Text>
                    </View>
                    <Switch
                      value={formAnonymous}
                      onValueChange={setFormAnonymous}
                      trackColor={{ false: '#ffffff22', true: Colors.tech.neonBlue + '99' }}
                      thumbColor={formAnonymous ? Colors.tech.neonBlue : '#ccc'}
                    />
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333', flex: 1 }]}
                onPress={closeSubmit}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  { backgroundColor: Colors.tech.neonBlue, flex: 1, opacity: submitting ? 0.6 : 1 },
                ]}
                disabled={submitting}
                onPress={submitSuggestion}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>
                  {submitting ? 'Submitting…' : 'Submit idea'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // -------------- Sort sheet -------------
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
            <Text
              style={[styles.sheetLabel, sortKey === opt.key && styles.sheetLabelActive]}
            >
              {opt.label}
            </Text>
            {sortKey === opt.key && <Text style={styles.sheetCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

  // -------------- Main render ------------
  const renderQuarterlyRetro = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Quarterly retrospective</Text>
        <Text style={styles.sectionCaption}>What worked · what didn't</Text>
      </View>
      {QUARTERLY_RETRO.map((r) => (
        <View key={r.id} style={[styles.retroCard, { borderLeftColor: r.color }]}>
          <View style={styles.retroHeaderRow}>
            <Text style={styles.retroEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.retroQuarter}>{r.quarter}</Text>
              <Text style={styles.retroTheme} numberOfLines={2}>{r.theme}</Text>
            </View>
          </View>

          <Text style={[styles.retroGroupLabel, { color: '#22C55E' }]}>WORKED</Text>
          {r.worked.map((w, i) => (
            <View key={`w-${i}`} style={styles.retroItemRow}>
              <Text style={[styles.retroBullet, { color: '#22C55E' }]}>•</Text>
              <Text style={styles.retroItemText}>{w}</Text>
            </View>
          ))}

          <Text style={[styles.retroGroupLabel, { color: '#F87171' }]}>MISSED</Text>
          {r.missed.map((m, i) => (
            <View key={`m-${i}`} style={styles.retroItemRow}>
              <Text style={[styles.retroBullet, { color: '#F87171' }]}>•</Text>
              <Text style={styles.retroItemText}>{m}</Text>
            </View>
          ))}

          <View style={styles.retroSplitRow}>
            <View style={styles.retroSplitCol}>
              <Text style={[styles.retroGroupLabel, { color: '#38BDF8' }]}>KEEPING</Text>
              {r.keeping.map((k, i) => (
                <Text key={`k-${i}`} style={styles.retroSplitText} numberOfLines={3}>• {k}</Text>
              ))}
            </View>
            <View style={styles.retroSplitCol}>
              <Text style={[styles.retroGroupLabel, { color: '#F472B6' }]}>DROPPING</Text>
              {r.dropping.map((d, i) => (
                <Text key={`d-${i}`} style={styles.retroSplitText} numberOfLines={3}>• {d}</Text>
              ))}
            </View>
          </View>

          <View style={[styles.retroBetBox, { borderColor: r.color + '55' }]}>
            <Text style={[styles.retroBetLabel, { color: r.color }]}>ONE BIG BET</Text>
            <Text style={styles.retroBetText}>{r.oneBigBet}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderOwnershipMap = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗺️ Ownership map</Text>
        <Text style={styles.sectionCaption}>Who owns what · no ‘the team’</Text>
      </View>
      {OWNERSHIP_MAP.map((o) => (
        <View key={o.id} style={[styles.ownerRow, { borderLeftColor: o.color }]}>
          <Text style={styles.ownerEmoji}>{o.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.ownerHeaderRow}>
              <Text style={styles.ownerArea} numberOfLines={2}>{o.area}</Text>
              <Text style={[styles.ownerCadence, { color: o.color }]}>{o.cadence}</Text>
            </View>
            <Text style={styles.ownerNames}>
              <Text style={styles.ownerLabelText}>Owner · </Text>
              {o.primaryOwner} <Text style={styles.ownerLabelText}>·  backup ·</Text> {o.backupOwner}
            </Text>
            <Text style={styles.ownerDue}>Due: {o.dueDay}</Text>
            <Text style={styles.ownerEscalation} numberOfLines={3}>↳ {o.escalation}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFeedbackLoop = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔁 Feedback loop</Text>
        <Text style={styles.sectionCaption}>How a slip becomes a change</Text>
      </View>
      {FEEDBACK_LOOP.map((f, idx) => (
        <View key={f.id} style={styles.loopCard}>
          <View style={styles.loopRailCol}>
            <View style={[styles.loopDot, { backgroundColor: f.color }]}>
              <Text style={styles.loopDotNum}>{f.order}</Text>
            </View>
            {idx < FEEDBACK_LOOP.length - 1 ? (
              <View style={[styles.loopConnector, { backgroundColor: f.color + '44' }]} />
            ) : null}
          </View>
          <View style={[styles.loopBody, { borderLeftColor: f.color }]}>
            <View style={styles.loopHeaderRow}>
              <Text style={styles.loopEmoji}>{f.emoji}</Text>
              <Text style={styles.loopStage}>{f.stage}</Text>
              <Text style={[styles.loopSla, { color: f.color }]}>{f.sla}</Text>
            </View>
            <Text style={styles.loopWhat} numberOfLines={4}>{f.what}</Text>
            <Text style={styles.loopWho}>Who · {f.who}</Text>
            <View style={styles.loopExampleBox}>
              <Text style={styles.loopExampleLabel}>EXAMPLE</Text>
              <Text style={styles.loopExample} numberOfLines={3}>{f.example}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderVoterWeights = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗳️ How we weight votes</Text>
        <Text style={styles.sectionCaption}>transparent on purpose</Text>
      </View>
      {VOTER_WEIGHTS.map((v) => (
        <View key={v.id} style={[styles.vwRow, { borderLeftColor: v.color }]}>
          <Text style={styles.vwEmoji}>{v.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.vwTopRow}>
              <Text style={styles.vwRole} numberOfLines={1}>{v.role}</Text>
              <Text style={[styles.vwWeight, { color: v.color }]}>×{v.weight.toFixed(1)}</Text>
            </View>
            <Text style={styles.vwExamples} numberOfLines={2}>{v.examples}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEscalation = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>⛰️ When a suggestion gets stuck</Text>
        <Text style={styles.sectionCaption}>five clear steps · no dead-ends</Text>
      </View>
      {ESCALATION_PATHS.map((e) => (
        <View key={e.id} style={[styles.epCard, { borderLeftColor: e.color }]}>
          <View style={styles.epTopRow}>
            <Text style={styles.epEmoji}>{e.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.epLvlRow}>
                <Text style={styles.epLvl}>Level {e.level}</Text>
                <Text style={[styles.epSla, { color: e.color }]}>{e.slaDays}d SLA</Text>
              </View>
              <Text style={styles.epName}>{e.name}</Text>
            </View>
          </View>
          <Text style={styles.epWhen} numberOfLines={3}>{e.whenToUse}</Text>
          <Text style={styles.epOwner}>owner · {e.owner}</Text>
        </View>
      ))}
    </View>
  );

  const renderShippedWins = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🏆 Things that actually shipped</Text>
        <Text style={styles.sectionCaption}>{SHIPPED_WINS.length} recent wins</Text>
      </View>
      {SHIPPED_WINS.map((s) => (
        <View key={s.id} style={[styles.swCard, { borderLeftColor: s.color }]}>
          <Text style={styles.swEmoji}>{s.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.swTopRow}>
              <Text style={styles.swTitle} numberOfLines={2}>{s.title}</Text>
              <Text style={styles.swMonths}>{s.monthsAgo}mo</Text>
            </View>
            <Text style={styles.swCategory}>{s.category} · {s.owner}</Text>
            <Text style={styles.swImpact} numberOfLines={2}>{s.impact}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDiscarded = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🪨 Suggestions we respectfully declined</Text>
        <Text style={styles.sectionCaption}>{DISCARDED_SUGGESTIONS.length} with reasons</Text>
      </View>
      {DISCARDED_SUGGESTIONS.map((d) => (
        <View key={d.id} style={[styles.dsCard, { borderLeftColor: d.color }]}>
          <View style={styles.dsTopRow}>
            <Text style={styles.dsEmoji}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dsTitle} numberOfLines={2}>{d.title}</Text>
              <Text style={styles.dsAgo}>{d.monthsAgo} months ago</Text>
            </View>
          </View>
          <Text style={styles.dsReason} numberOfLines={3}>{d.reason}</Text>
          <Text style={styles.dsRespectedBy}>decided via · {d.respectedBy}</Text>
        </View>
      ))}
    </View>
  );

  const renderDecisionJournal = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📓 Decision journal</Text>
        <Text style={styles.sectionCaption}>{DECISION_JOURNAL.length} entries · revisit dates set</Text>
      </View>
      {DECISION_JOURNAL.map((j) => (
        <View key={j.id} style={[styles.djCard, { borderLeftColor: j.color }]}>
          <View style={styles.djTopRow}>
            <Text style={styles.djEmoji}>{j.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.djWeek}>{j.week}</Text>
              <Text style={styles.djDecision} numberOfLines={2}>{j.decision}</Text>
            </View>
          </View>
          <Text style={styles.djContext} numberOfLines={3}>{j.context}</Text>
          <Text style={styles.djRevisit}>revisit · {j.revisitIn}</Text>
        </View>
      ))}
    </View>
  );

  const renderStageTips = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Tips for each stage</Text>
        <Text style={styles.sectionCaption}>writing · replying · shipping</Text>
      </View>
      {STAGE_TIPS.map((t) => (
        <View key={t.id} style={[styles.tipCard, { borderLeftColor: t.color }]}>
          <View style={styles.tipTopRow}>
            <Text style={styles.tipEmoji}>{t.emoji}</Text>
            <Text style={styles.tipStage}>{t.stage}</Text>
          </View>
          <Text style={styles.tipBody} numberOfLines={3}>{t.tip}</Text>
          <View style={styles.tipExRow}>
            <View style={styles.tipExCol}>
              <Text style={[styles.tipExLabel, { color: '#22C55E' }]}>DO</Text>
              <Text style={styles.tipExDone} numberOfLines={3}>{t.exampleDone}</Text>
            </View>
            <View style={styles.tipExCol}>
              <Text style={[styles.tipExLabel, { color: '#EF4444' }]}>NOT</Text>
              <Text style={styles.tipExNot} numberOfLines={3}>{t.exampleNot}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3y deeper blocks ------
  const renderDecisionRights = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📜 Decision rights · who calls what</Text>
        <Text style={styles.sectionCaption}>{DECISION_RIGHTS.length} scopes</Text>
      </View>
      {DECISION_RIGHTS.map((d) => (
        <View key={d.id} style={[styles.drCard, { borderLeftColor: d.color }]}>
          <View style={styles.drTopRow}>
            <Text style={styles.drEmoji}>{d.emoji}</Text>
            <Text style={styles.drScope} numberOfLines={2}>{d.scope}</Text>
          </View>
          <View style={styles.drKvRow}>
            <Text style={styles.drKey}>DECIDES</Text>
            <Text style={styles.drVal} numberOfLines={1}>{d.decider}</Text>
          </View>
          <View style={styles.drKvRow}>
            <Text style={styles.drKey}>CONSULTS</Text>
            <Text style={styles.drVal} numberOfLines={1}>{d.consulted}</Text>
          </View>
          <View style={styles.drKvRow}>
            <Text style={styles.drKey}>INFORMS</Text>
            <Text style={styles.drVal} numberOfLines={1}>{d.informed}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDisagreeLog = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>💬 Disagree-log · healthy dissent</Text>
        <Text style={styles.sectionCaption}>{DISAGREE_LOG.length} resolved</Text>
      </View>
      {DISAGREE_LOG.map((d) => {
        const oColor =
          d.outcome === 'merged' ? '#A78BFA' :
          d.outcome === 'sideA' ? '#00D4FF' :
          d.outcome === 'sideB' ? '#22C55E' : '#94A3B8';
        return (
          <View key={d.id} style={[styles.dlCard, { borderLeftColor: d.color }]}>
            <View style={styles.dlTopRow}>
              <Text style={styles.dlEmoji}>{d.emoji}</Text>
              <Text style={styles.dlTopic} numberOfLines={2}>{d.topic}</Text>
              <View
                style={[
                  styles.dlOutcome,
                  { backgroundColor: oColor + '22', borderColor: oColor + '66' },
                ]}
              >
                <Text style={[styles.dlOutcomeText, { color: oColor }]}>{d.outcome}</Text>
              </View>
            </View>
            <View style={styles.dlSideRow}>
              <View style={styles.dlSideCol}>
                <Text style={[styles.dlSideLabel, { color: '#00D4FF' }]}>A</Text>
                <Text style={styles.dlSideText} numberOfLines={3}>{d.sideA}</Text>
              </View>
              <View style={styles.dlSideCol}>
                <Text style={[styles.dlSideLabel, { color: '#22C55E' }]}>B</Text>
                <Text style={styles.dlSideText} numberOfLines={3}>{d.sideB}</Text>
              </View>
            </View>
            <Text style={styles.dlLearning} numberOfLines={2}>{d.learning}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderReturnSignals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📈 Return signals · health dashboard</Text>
        <Text style={styles.sectionCaption}>watched monthly</Text>
      </View>
      {RETURN_SIGNALS.map((r) => {
        const sColor =
          r.state === 'healthy' ? '#22C55E' :
          r.state === 'watch' ? '#F59E0B' : '#EF4444';
        return (
          <View key={r.id} style={[styles.rsCard, { borderLeftColor: sColor }]}>
            <View style={styles.rsTopRow}>
              <Text style={styles.rsEmoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rsMetric} numberOfLines={1}>{r.metric}</Text>
                <Text style={styles.rsMeasured} numberOfLines={1}>{r.measuredBy}</Text>
              </View>
              <View
                style={[
                  styles.rsStatePill,
                  { backgroundColor: sColor + '22', borderColor: sColor + '66' },
                ]}
              >
                <Text style={[styles.rsStateText, { color: sColor }]}>{r.state}</Text>
              </View>
            </View>
            <View style={styles.rsKvRow}>
              <Text style={styles.rsKey}>TARGET</Text>
              <Text style={styles.rsVal} numberOfLines={1}>{r.target}</Text>
            </View>
            <View style={styles.rsKvRow}>
              <Text style={styles.rsKey}>NOW</Text>
              <Text style={[styles.rsVal, { color: sColor }]} numberOfLines={1}>{r.current}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderFeedbackLoops = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔁 Feedback loops · rituals</Text>
        <Text style={styles.sectionCaption}>{FEEDBACK_LOOPS.length} cadences</Text>
      </View>
      {FEEDBACK_LOOPS.map((f) => (
        <View key={f.id} style={[styles.flpCard, { borderLeftColor: f.color }]}>
          <View style={styles.flpTopRow}>
            <Text style={styles.flpEmoji}>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.flpCadence, { color: f.color }]}>{f.cadence}</Text>
              <Text style={styles.flpRitual} numberOfLines={2}>{f.ritual}</Text>
            </View>
          </View>
          <Text style={styles.flpWho} numberOfLines={1}>{f.who}</Text>
          <Text style={styles.flpOutput} numberOfLines={3}>→ {f.output}</Text>
        </View>
      ))}
    </View>
  );

  const renderTrustPromises = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🫶 Trust promises · what we'll hold</Text>
        <Text style={styles.sectionCaption}>{TRUST_PROMISES.length} quiet vows</Text>
      </View>
      {TRUST_PROMISES.map((t) => (
        <View key={t.id} style={[styles.tpCard, { borderLeftColor: t.color }]}>
          <View style={styles.tpTopRow}>
            <Text style={styles.tpEmoji}>{t.emoji}</Text>
            <Text style={styles.tpPromise} numberOfLines={2}>{t.promise}</Text>
          </View>
          <Text style={styles.tpWhy} numberOfLines={2}>why · {t.why}</Text>
          <Text style={styles.tpHow} numberOfLines={3}>how · {t.how}</Text>
        </View>
      ))}
    </View>
  );

  const renderOpenCalls = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📣 Open calls · we'd love ideas on</Text>
        <Text style={styles.sectionCaption}>{OPEN_CALLS.length} prompts</Text>
      </View>
      {OPEN_CALLS.map((o) => (
        <View key={o.id} style={[styles.ocRow, { borderLeftColor: o.color }]}>
          <Text style={styles.ocEmoji}>{o.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.ocTopRow}>
              <Text style={styles.ocTitle} numberOfLines={1}>{o.title}</Text>
              <Text style={[styles.ocDeadline, { color: o.color }]}>{o.deadline}</Text>
            </View>
            <Text style={styles.ocPrompt} numberOfLines={2}>{o.prompt}</Text>
            <Text style={styles.ocWing} numberOfLines={1}>{o.wing}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3ae blocks ------
  const renderIntakes = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📥 Intake channels · where feedback enters</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_INTAKES.length} channels</Text>
      </View>
      {SUGGESTION_INTAKES.map((i) => (
        <View key={i.id} style={[styles.sinCard, { borderLeftColor: i.color }]}>
          <View style={styles.sinTopRow}>
            <Text style={styles.sinEmoji}>{i.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sinChannel} numberOfLines={1}>{i.channel}</Text>
              <Text style={styles.sinOwner} numberOfLines={1}>owner · {i.owner}</Text>
            </View>
            <Text style={[styles.sinCadence, { color: i.color }]}>{i.cadence}</Text>
          </View>
          <Text style={styles.sinResponse} numberOfLines={2}>↳ {i.response}</Text>
        </View>
      ))}
    </View>
  );

  const renderTemplates = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧩 Templates · copy + edit</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_TEMPLATES.length} templates</Text>
      </View>
      {SUGGESTION_TEMPLATES.map((t) => (
        <View key={t.id} style={[styles.stpCard, { borderLeftColor: t.color }]}>
          <View style={styles.stpTopRow}>
            <Text style={styles.stpEmoji}>{t.emoji}</Text>
            <Text style={styles.stpScenario} numberOfLines={1}>{t.scenario}</Text>
          </View>
          <Text style={styles.stpTemplate} numberOfLines={3}>{t.template}</Text>
          <Text style={styles.stpUseWhen} numberOfLines={2}>use when · {t.useWhen}</Text>
        </View>
      ))}
    </View>
  );

  const renderGuardrails = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🛡️ Guardrails · rules of the box</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_GUARDRAILS.length} rules</Text>
      </View>
      {SUGGESTION_GUARDRAILS.map((g) => (
        <View key={g.id} style={[styles.sgrCard, { borderLeftColor: g.color }]}>
          <View style={styles.sgrTopRow}>
            <Text style={styles.sgrEmoji}>{g.emoji}</Text>
            <Text style={styles.sgrGuardrail} numberOfLines={2}>{g.guardrail}</Text>
          </View>
          <Text style={[styles.sgrOneLine, { color: g.color }]} numberOfLines={2}>{g.oneLine}</Text>
          <Text style={styles.sgrWhy} numberOfLines={3}>→ {g.why}</Text>
        </View>
      ))}
    </View>
  );

  const renderCases = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📚 Case files · real shipped ideas</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_CASES.length} cases</Text>
      </View>
      {SUGGESTION_CASES.map((c) => (
        <View key={c.id} style={[styles.scCard, { borderLeftColor: c.color }]}>
          <View style={styles.scTopRow}>
            <Text style={styles.scEmoji}>{c.emoji}</Text>
            <Text style={styles.scIdea} numberOfLines={2}>{c.idea}</Text>
          </View>
          <View style={styles.scMetaRow}>
            <Text style={styles.scMetaLabel}>origin · <Text style={styles.scMetaValue}>{c.origin}</Text></Text>
            <Text style={styles.scMetaLabel}>shipped · <Text style={[styles.scMetaValue, { color: c.color }]}>{c.shippedOn}</Text></Text>
          </View>
          <Text style={styles.scOutcome} numberOfLines={3}>→ {c.outcome}</Text>
          <View style={[styles.scDaysPill, { borderColor: c.color + '66', backgroundColor: c.color + '18' }]}>
            <Text style={[styles.scDaysText, { color: c.color }]}>{c.daysToShip} days from idea to live</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderVoices = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗣️ Voices · whose feedback we heard</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_VOICES.length} voices</Text>
      </View>
      {SUGGESTION_VOICES.map((v) => (
        <View key={v.id} style={[styles.svCard, { borderLeftColor: v.color }]}>
          <View style={styles.svTopRow}>
            <Text style={styles.svEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.svVoice} numberOfLines={1}>{v.voice}</Text>
              <Text style={[styles.svAbout, { color: v.color }]}>about · {v.about}</Text>
            </View>
          </View>
          <Text style={styles.svSaid} numberOfLines={4}>{v.said}</Text>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3al: round 3 suggestion blocks ------
  const renderIntakeWindows = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗓️ Intake windows · when we open the board widest</Text>
        <Text style={styles.sectionCaption}>{SUGG_INTAKE_WINDOWS.length} cycles</Text>
      </View>
      {SUGG_INTAKE_WINDOWS.map((w) => (
        <View key={w.id} style={[styles.siwCard, { borderLeftColor: w.color }]}>
          <View style={styles.siwTopRow}>
            <Text style={styles.siwEmoji}>{w.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.siwWindow} numberOfLines={1}>{w.window}</Text>
              <Text style={[styles.siwOpen, { color: w.color }]}>{w.openFrom}</Text>
            </View>
          </View>
          <Text style={styles.siwTheme} numberOfLines={2}>theme · {w.theme}</Text>
          <Text style={styles.siwLead} numberOfLines={1}>lead · {w.lead}</Text>
        </View>
      ))}
    </View>
  );

  const renderCommitteePicks = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🏅 Committee picks · from board to real life</Text>
        <Text style={styles.sectionCaption}>{SUGG_COMMITTEE_PICKS.length} picks</Text>
      </View>
      {SUGG_COMMITTEE_PICKS.map((p) => (
        <View key={p.id} style={[styles.scpCard, { borderLeftColor: p.color }]}>
          <View style={styles.scpTopRow}>
            <Text style={styles.scpEmoji}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scpSuggestion} numberOfLines={2}>{p.suggestion}</Text>
              <Text style={[styles.scpShipped, { color: p.color }]}>shipped · {p.shippedOn}</Text>
            </View>
          </View>
          <Text style={styles.scpOutcome} numberOfLines={3}>{p.outcome}</Text>
          <Text style={styles.scpImpact} numberOfLines={2}>impact · {p.impact}</Text>
        </View>
      ))}
    </View>
  );

  const renderDesignPrinciples = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Design principles for the board</Text>
        <Text style={styles.sectionCaption}>{SUGG_DESIGN_PRINCIPLES.length} principles</Text>
      </View>
      {SUGG_DESIGN_PRINCIPLES.map((p) => (
        <View key={p.id} style={[styles.sdpCard, { borderLeftColor: p.color }]}>
          <View style={styles.sdpTopRow}>
            <Text style={styles.sdpEmoji}>{p.emoji}</Text>
            <Text style={[styles.sdpPrinciple, { color: p.color }]} numberOfLines={2}>{p.principle}</Text>
          </View>
          <Text style={styles.sdpInPractice} numberOfLines={3}>in practice · {p.inPractice}</Text>
        </View>
      ))}
    </View>
  );

  const renderLifecycleStages = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔁 Lifecycle · submit to celebrate</Text>
        <Text style={styles.sectionCaption}>{SUGG_LIFECYCLE.length} stages</Text>
      </View>
      {SUGG_LIFECYCLE.map((s, i) => (
        <View key={s.id} style={[styles.sglCard, { borderLeftColor: s.color }]}>
          <View style={styles.sglTopRow}>
            <Text style={[styles.sglStep, { color: s.color }]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.sglEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sglStage} numberOfLines={1}>{s.stage}</Text>
              <Text style={styles.sglSla} numberOfLines={1}>sla · {s.sla}</Text>
            </View>
          </View>
          <Text style={styles.sglOwner} numberOfLines={1}>owner · {s.owner}</Text>
          <Text style={styles.sglRule} numberOfLines={3}>{s.rule}</Text>
        </View>
      ))}
    </View>
  );

  const renderReviewerDuties = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🫱 Reviewer duties · do · don&apos;t</Text>
        <Text style={styles.sectionCaption}>{SUGG_REVIEWER_DUTIES.length} duties</Text>
      </View>
      {SUGG_REVIEWER_DUTIES.map((d) => (
        <View key={d.id} style={[styles.srdCard, { borderLeftColor: d.color }]}>
          <View style={styles.srdTopRow}>
            <Text style={styles.srdEmoji}>{d.emoji}</Text>
            <Text style={styles.srdDuty} numberOfLines={2}>{d.duty}</Text>
          </View>
          <Text style={styles.srdDo} numberOfLines={2}>do · {d.do}</Text>
          <Text style={styles.srdDoNot} numberOfLines={2}>don&apos;t · {d.doNot}</Text>
        </View>
      ))}
    </View>
  );

  const renderWorkedCases = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📖 Worked cases · the whole journey, told honestly</Text>
        <Text style={styles.sectionCaption}>{SUGG_WORKED_CASES.length} cases</Text>
      </View>
      {SUGG_WORKED_CASES.map((c) => (
        <View key={c.id} style={[styles.swcCard, { borderLeftColor: c.color }]}>
          <View style={styles.swcTopRow}>
            <Text style={styles.swcEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.swcTitle} numberOfLines={2}>{c.title}</Text>
              <Text style={[styles.swcSubmitter, { color: c.color }]} numberOfLines={1}>by · {c.submitter}</Text>
            </View>
          </View>
          <Text style={styles.swcJourney} numberOfLines={3}>journey · {c.journey}</Text>
          <Text style={styles.swcOutcome} numberOfLines={3}>outcome · {c.outcome}</Text>
          <Text style={styles.swcThanks} numberOfLines={2}>{c.thanks}</Text>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3ar: round 4 suggestion blocks ------
  const renderSuggPitchTemplates = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📝 Pitch templates · how to write a proposal that lands</Text>
        <Text style={styles.sectionCaption}>{SUGG_PITCH_TEMPLATES.length} templates</Text>
      </View>
      {SUGG_PITCH_TEMPLATES.map((t) => (
        <View key={t.id} style={[styles.sptCard, { borderLeftColor: t.color }]}>
          <View style={styles.sptTopRow}>
            <Text style={styles.sptEmoji}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sptKind} numberOfLines={1}>{t.kind}</Text>
              <Text style={[styles.sptLength, { color: t.color }]}>{t.length}</Text>
            </View>
          </View>
          <Text style={styles.sptStructure} numberOfLines={3}>structure · {t.structure}</Text>
          <Text style={styles.sptExample} numberOfLines={4}>e.g. {t.example}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggDecisionGates = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🚪 Decision gates · seven doors a proposal walks through</Text>
        <Text style={styles.sectionCaption}>{SUGG_DECISION_GATES.length} gates</Text>
      </View>
      {SUGG_DECISION_GATES.map((g) => (
        <View key={g.id} style={[styles.sdgCard, { borderLeftColor: g.color }]}>
          <View style={styles.sdgTopRow}>
            <Text style={styles.sdgEmoji}>{g.emoji}</Text>
            <Text style={styles.sdgGate} numberOfLines={2}>{g.gate}</Text>
          </View>
          <Text style={styles.sdgCheck} numberOfLines={3}>check · {g.check}</Text>
          <Text style={[styles.sdgOwner, { color: g.color }]} numberOfLines={1}>owner · {g.owner}</Text>
          <Text style={styles.sdgNext} numberOfLines={3}>next · {g.whatNext}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggReviewerPrinciples = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📖 Reviewer principles · how we read each other&apos;s proposals</Text>
        <Text style={styles.sectionCaption}>{SUGG_REVIEWER_PRINCIPLES.length} principles</Text>
      </View>
      {SUGG_REVIEWER_PRINCIPLES.map((p) => (
        <View key={p.id} style={[styles.srpCard, { borderLeftColor: p.color }]}>
          <View style={styles.srpTopRow}>
            <Text style={styles.srpEmoji}>{p.emoji}</Text>
            <Text style={styles.srpPrinciple} numberOfLines={2}>{p.principle}</Text>
          </View>
          <Text style={styles.srpMeans} numberOfLines={3}>means · {p.whatItMeans}</Text>
          <Text style={[styles.srpNot, { color: p.color }]} numberOfLines={2}>{p.whatItIsNot}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggConflictPaths = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>⚔️ Conflict paths · what to do when ideas collide</Text>
        <Text style={styles.sectionCaption}>{SUGG_CONFLICT_PATHS.length} paths</Text>
      </View>
      {SUGG_CONFLICT_PATHS.map((c) => (
        <View key={c.id} style={[styles.scp2Card, { borderLeftColor: c.color }]}>
          <View style={styles.scp2TopRow}>
            <Text style={styles.scp2Emoji}>{c.emoji}</Text>
            <Text style={styles.scp2Situation} numberOfLines={2}>{c.situation}</Text>
          </View>
          <Text style={styles.scp2First} numberOfLines={3}>first · {c.firstStep}</Text>
          <Text style={[styles.scp2Stuck, { color: c.color }]} numberOfLines={3}>if stuck · {c.ifStuck}</Text>
          <Text style={styles.scp2Harm} numberOfLines={3}>if harm · {c.ifHarm}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggCommCadences = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📬 Communication cadences · how we stay transparent</Text>
        <Text style={styles.sectionCaption}>{SUGG_COMM_CADENCES.length} cadences</Text>
      </View>
      {SUGG_COMM_CADENCES.map((c) => (
        <View key={c.id} style={[styles.sxcCard, { borderLeftColor: c.color }]}>
          <View style={styles.sxcTopRow}>
            <Text style={styles.sxcEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sxcCadence} numberOfLines={1}>{c.cadence}</Text>
              <Text style={[styles.sxcChannel, { color: c.color }]} numberOfLines={1}>{c.channel}</Text>
            </View>
          </View>
          <Text style={styles.sxcAudience} numberOfLines={1}>for · {c.audience}</Text>
          <Text style={styles.sxcRhythm} numberOfLines={3}>rhythm · {c.rhythm}</Text>
        </View>
      ))}
    </View>
  );

  // ------ Phase 3ax: round 5 suggestion blocks ------
  const renderSuggPilotRecipes = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧪 Pilot recipes · small tests before big changes</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_PILOT_RECIPES.length} recipes</Text>
      </View>
      {SUGGESTION_PILOT_RECIPES.map((p) => (
        <View key={p.id} style={[styles.sprCard, { borderLeftColor: p.color }]}>
          <View style={styles.sprTopRow}>
            <Text style={styles.sprEmoji}>{p.emoji}</Text>
            <Text style={styles.sprName} numberOfLines={1}>{p.name}</Text>
          </View>
          <Text style={[styles.sprScope, { color: p.color }]} numberOfLines={2}>scope · {p.scope}</Text>
          <Text style={styles.sprBudget} numberOfLines={2}>budget · {p.budget}</Text>
          <Text style={styles.sprExit} numberOfLines={3}>exit plan · {p.exitPlan}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggImpactLedger = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📒 Impact ledger · what shipped actually changed</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_IMPACT_LEDGER.length} entries</Text>
      </View>
      {SUGGESTION_IMPACT_LEDGER.map((i) => (
        <View key={i.id} style={[styles.silCard, { borderLeftColor: i.color }]}>
          <View style={styles.silTopRow}>
            <Text style={styles.silEmoji}>{i.emoji}</Text>
            <Text style={styles.silShipped} numberOfLines={2}>{i.shipped}</Text>
          </View>
          <Text style={[styles.silCost, { color: i.color }]} numberOfLines={2}>cost · {i.cost}</Text>
          <Text style={styles.silBenefit} numberOfLines={3}>benefit · {i.benefit}</Text>
          <Text style={styles.silFollowUp} numberOfLines={2}>follow-up · {i.followUp}</Text>
        </View>
      ))}
    </View>
  );

  const renderSuggFollowUpRings = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📡 Follow-up rings · we check back · we don&apos;t vanish</Text>
        <Text style={styles.sectionCaption}>{SUGGESTION_FOLLOWUP_RINGS.length} rings</Text>
      </View>
      {SUGGESTION_FOLLOWUP_RINGS.map((r) => (
        <View key={r.id} style={[styles.sfrCard, { borderLeftColor: r.color }]}>
          <View style={styles.sfrTopRow}>
            <Text style={styles.sfrEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sfrAfter} numberOfLines={1}>{r.after}</Text>
              <Text style={[styles.sfrCheckIn, { color: r.color }]} numberOfLines={1}>{r.checkIn}</Text>
            </View>
          </View>
          <Text style={styles.sfrSignal} numberOfLines={2}>signal · {r.signal}</Text>
          <Text style={styles.sfrResponder} numberOfLines={1}>responder · {r.responder}</Text>
        </View>
      ))}
    </View>
  );

  const listHeader = (
    <View>
      {renderHeader()}
      {renderCategoryRail()}
      {renderPriorityRow()}
      {renderIntakes()}
      {renderTrending()}
      {renderLeaderboard()}
      {renderTags()}
      {renderTemplates()}
      {renderAnalytics()}
      {renderReturnSignals()}
      {renderVelocity()}
      {renderVoterWeights()}
      {renderDecisionRights()}
      {renderGuardrails()}
      {renderEscalation()}
      {renderStageTips()}
      {renderMonthlyDigest()}
      {renderTracking()}
      {renderShippedWins()}
      {renderCases()}
      {renderDiscarded()}
      {renderDecisionJournal()}
      {renderDisagreeLog()}
      {renderQuarterlyRetro()}
      {renderOwnershipMap()}
      {renderFeedbackLoops()}
      {renderFeedbackLoop()}
      {renderVoices()}
      {renderTrustPromises()}
      {renderRoadmap()}
      {renderOpenCalls()}
      {renderIntakeWindows()}
      {renderCommitteePicks()}
      {renderDesignPrinciples()}
      {renderLifecycleStages()}
      {renderReviewerDuties()}
      {renderWorkedCases()}
      {renderSuggPitchTemplates()}
      {renderSuggDecisionGates()}
      {renderSuggReviewerPrinciples()}
      {renderSuggConflictPaths()}
      {renderSuggCommCadences()}
      {renderSuggPilotRecipes()}
      {renderSuggImpactLedger()}
      {renderSuggFollowUpRings()}
      {renderListHeader()}
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
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmpty}
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
      {renderDetailModal()}
      {renderSubmitModal()}
      {renderSortSheet()}
    </SafeAreaView>
  );
};

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

const priorityWeight = (p: Suggestion['priority']) =>
  p === 'high' ? 3 : p === 'medium' ? 2 : 1;

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollRoot: { flex: 1 },
  listContent: { paddingBottom: 100 },

  // Header
  headerContainer: { overflow: 'hidden', marginBottom: 4 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 16 : 28,
    paddingBottom: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeadBlock: { flex: 1, paddingRight: 10 },
  headerEyebrow: {
    fontSize: 12,
    color: Colors.tech.neonBlue,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  headerEyebrowInv: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: IS_SMALL ? 26 : 30,
    color: Colors.text.primary,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },

  submitFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.tech.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.tech.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  submitFabText: { color: '#000', fontSize: 28, fontWeight: '900' },

  // Stats row
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

  // Search bar
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
    marginLeft: 4,
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

  // Status chips
  quickFilterRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusChip: {
    backgroundColor: '#ffffff0F',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  statusChipActive: { backgroundColor: '#ffffff22' },
  statusChipText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  statusChipTextActive: { color: Colors.text.primary, fontWeight: '800' },

  // Category rail
  categoryScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 12, paddingBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff0A',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    borderColor: Colors.tech.neonBlue,
    backgroundColor: Colors.tech.neonBlue + '22',
  },
  categoryIcon: { fontSize: 14, marginRight: 6 },
  categoryLabel: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  categoryLabelActive: { color: Colors.tech.neonBlue, fontWeight: '800' },

  // Priority row
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 10,
  },
  priorityLabel: { color: Colors.text.muted, fontSize: 11, marginRight: 8 },
  priorityChip: {
    backgroundColor: '#ffffff08',
    borderWidth: 1,
    borderColor: '#ffffff18',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  priorityChipText: { color: Colors.text.secondary, fontSize: 11, textTransform: 'capitalize' },

  // Sections
  sectionBlock: { paddingTop: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionCaption: { color: Colors.text.muted, fontSize: 12 },

  // Trending
  trendingScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING * 2 },
  trendingCard: {
    width: IS_TABLET ? 310 : SCREEN_WIDTH * 0.78,
    marginRight: 12,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  trendingGradient: {
    padding: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
    minHeight: 200,
  },
  trendingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendingRank: { color: Colors.accent.softGold, fontSize: 13, fontWeight: '800' },
  trendingCategory: { color: Colors.text.muted, fontSize: 11 },
  trendingTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginTop: 10 },
  trendingDesc: { color: Colors.text.secondary, fontSize: 12, marginTop: 8, lineHeight: 18 },
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  trendingVotes: { color: Colors.accent.softGold, fontSize: 12, fontWeight: '800' },
  trendingStatus: { fontSize: 11, fontWeight: '700' },

  // Tags
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: HORIZONTAL_PADDING },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { color: Colors.text.primary, fontSize: 11, fontWeight: '600' },
  tagCount: { color: Colors.text.muted, fontSize: 10, marginLeft: 5 },
  tagRemove: { color: Colors.text.muted, fontSize: 10, marginLeft: 6 },

  // Roadmap
  roadmapWrap: { paddingHorizontal: HORIZONTAL_PADDING },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  roadmapIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  roadmapQuarter: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },
  roadmapTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  roadmapCaption: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  roadmapArrow: { color: Colors.text.muted, fontSize: 22, marginLeft: 6 },

  // List header
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 18,
    paddingBottom: 6,
  },
  listHeaderTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '700', flex: 1 },
  listHeaderReset: { color: '#FBA5A5', fontSize: 12, fontWeight: '700' },

  // Card
  cardOuter: { paddingHorizontal: HORIZONTAL_PADDING, marginTop: 10 },
  cardInner: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  cardGradient: {
    padding: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catBadgeText: { color: Colors.text.primary, fontSize: 11, fontWeight: '700' },
  cardDate: { color: Colors.text.muted, fontSize: 11 },
  cardTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginTop: 10 },
  cardDescription: { color: Colors.text.secondary, fontSize: 12, marginTop: 6, lineHeight: 18 },
  cardTagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  cardTag: {
    backgroundColor: '#ffffff10',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 4,
  },
  cardTagText: { color: Colors.text.muted, fontSize: 10 },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  cardMetaCell: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  cardMetaText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  voteButtonActive: {
    backgroundColor: Colors.tech.neonBlue,
    borderColor: Colors.tech.neonBlue,
  },
  voteIcon: { fontSize: 14, color: Colors.text.primary, marginRight: 4, fontWeight: '800' },
  voteCount: { color: Colors.text.primary, fontWeight: '800' },
  cardAuthor: { color: Colors.text.muted, fontSize: 11 },
  shareIcon: { fontSize: 18, color: Colors.text.muted },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { color: Colors.text.muted, fontSize: 13, textAlign: 'center', marginBottom: 14 },
  emptyRow: { flexDirection: 'row' },
  emptyButton: {
    backgroundColor: Colors.tech.neonBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#000', fontWeight: '800' },
  emptyButtonGhost: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff33',
    marginRight: 10,
  },
  emptyButtonGhostText: { color: Colors.text.primary, fontWeight: '700' },

  // Skeleton
  skeletonGradient: { backgroundColor: '#0E1418', borderColor: '#ffffff0A' },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff12',
    marginVertical: 6,
  },

  // Footer
  footer: { alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
  footerText: { color: Colors.text.muted, fontSize: 11, marginVertical: 2 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.92,
    backgroundColor: '#0A0F14',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalHero: { padding: 18, paddingTop: 22 },
  modalHeroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  modalMeta: { color: Colors.text.muted, fontSize: 12, marginTop: 4 },
  modalMetaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  modalMetaPill: {
    borderWidth: 1,
    borderColor: '#ffffff33',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { color: Colors.text.primary, fontSize: 16 },

  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 16, paddingBottom: 24 },
  modalSection: { marginBottom: 18 },
  modalSectionTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  modalSectionBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20 },
  noteBlock: {
    padding: 12,
    backgroundColor: '#ffffff08',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.softGold,
    borderRadius: 10,
  },
  noteText: { color: Colors.text.primary, fontSize: 13, lineHeight: 20 },
  noteMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 8 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checklistDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTick: { color: '#000', fontSize: 11, fontWeight: '900' },
  checklistText: { color: Colors.text.primary, fontSize: 13, flex: 1 },

  modalActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
  },
  modalAction: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Submit form
  formSection: { marginBottom: 18 },
  formLabel: { color: Colors.text.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  formHelpText: { color: Colors.text.muted, fontSize: 11, marginTop: 6 },
  formInput: {
    backgroundColor: '#ffffff0E',
    color: Colors.text.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  formTextarea: { minHeight: 110, textAlignVertical: 'top' },
  formCounter: { color: Colors.text.muted, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  formCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff0A',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
  },
  formCategoryIcon: { fontSize: 12, marginRight: 5 },
  formCategoryLabel: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  formPriorityChip: {
    borderWidth: 1,
    borderColor: '#ffffff22',
    backgroundColor: '#ffffff0A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  formPriorityText: { color: Colors.text.primary, fontSize: 12, textTransform: 'capitalize' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center' },
  tagAddBtn: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 12,
  },
  tagAddText: { color: '#000', fontWeight: '800' },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff0A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },

  // Sheet
  sheetBackdrop: { flex: 1, backgroundColor: '#000000AA' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0F14',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    borderTopWidth: 1,
    borderColor: '#ffffff18',
  },
  sheetTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  sheetIcon: { fontSize: 16, marginRight: 10 },
  sheetLabel: { flex: 1, color: Colors.text.secondary, fontSize: 13 },
  sheetLabelActive: { color: Colors.tech.neonBlue, fontWeight: '800' },
  sheetCheck: { color: Colors.tech.neonBlue, fontSize: 16, fontWeight: '800' },

  // Leaderboard
  leaderCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0E',
  },
  leaderRank: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '900',
    width: 36,
    textAlign: 'center',
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leaderAvatarText: { fontSize: 18 },
  leaderName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  leaderTag: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  leaderMetrics: { alignItems: 'flex-end' },
  leaderVotes: { fontSize: 15, fontWeight: '900' },
  leaderSub: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },

  // Analytics (shared w/ velocity)
  analyticsCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0E',
  },
  analyticsLabelCol: { width: IS_SMALL ? 130 : 150, marginRight: 10 },
  analyticsName: { color: Colors.text.primary, fontSize: 12, fontWeight: '800' },
  analyticsSub: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  analyticsBarCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  analyticsBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#ffffff12',
    borderRadius: 6,
    overflow: 'hidden',
  },
  analyticsBarFill: { height: 8, borderRadius: 6 },
  analyticsValue: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 10,
    minWidth: 36,
    textAlign: 'right',
  },

  // Velocity
  velocityCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  velocityChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    justifyContent: 'space-between',
  },
  velocityCol: { flex: 1, alignItems: 'center' },
  velocityBarWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    justifyContent: 'center',
  },
  velocityBarSub: {
    width: 6,
    marginRight: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  velocityBarShip: {
    width: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  velocityLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    marginTop: 6,
    fontWeight: '700',
  },
  velocityLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  velocityLegend: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  velocityLegendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  velocityLegendText: { color: Colors.text.secondary, fontSize: 11 },

  // Monthly digest
  digestScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10, paddingBottom: 6 },
  digestCard: { width: IS_SMALL ? 240 : 270, marginRight: 12 },
  digestGradient: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 280,
  },
  digestMonth: { color: Colors.text.primary, fontSize: 16, fontWeight: '900' },
  digestStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  digestStat: { flex: 1, alignItems: 'center' },
  digestStatValue: { color: Colors.text.primary, fontSize: 18, fontWeight: '900' },
  digestStatLabel: { color: Colors.text.muted, fontSize: 9, marginTop: 2, textAlign: 'center' },
  digestTopLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
  },
  digestTopText: { color: Colors.text.primary, fontSize: 12, marginTop: 4, fontWeight: '700', lineHeight: 17 },
  digestTopVotes: { color: Colors.accent.softGold, fontSize: 11, marginTop: 4, fontWeight: '800' },
  digestHighlightRow: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#ffffff0E' },
  digestHighlight: { color: Colors.text.secondary, fontSize: 11, fontStyle: 'italic', lineHeight: 15 },

  // Submission tracking
  trackCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  trackHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  trackTitle: { flex: 1, color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  trackCatPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  trackCatText: { fontSize: 10, fontWeight: '800' },
  trackMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  trackTimeline: { marginTop: 12 },
  trackStep: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative', paddingLeft: 2 },
  trackDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  trackDotCheck: { color: '#000', fontSize: 10, fontWeight: '900' },
  trackDotIdle: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff33' },
  trackConnector: {
    position: 'absolute',
    left: 9,
    top: 18,
    width: 2,
    height: 18,
  },
  trackStepLabel: { fontSize: 12, fontWeight: '700' },
  trackStepAt: { color: Colors.text.muted, fontSize: 10, marginTop: 1 },
  trackNextRow: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff0E',
  },
  trackNextLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trackNextText: { color: Colors.text.secondary, fontSize: 12, marginTop: 3, lineHeight: 16 },

  // Quarterly retro
  retroCard: {
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
  },
  retroHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  retroEmoji: { fontSize: 22, marginRight: 10 },
  retroQuarter: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  retroTheme: { color: Colors.text.secondary, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  retroGroupLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 4,
  },
  retroItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  retroBullet: { fontSize: 12, marginRight: 6, marginTop: 1 },
  retroItemText: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
  },
  retroSplitRow: { flexDirection: 'row', marginTop: 8, marginHorizontal: -6 },
  retroSplitCol: { flex: 1, paddingHorizontal: 6 },
  retroSplitText: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  retroBetBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  retroBetLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  retroBetText: {
    color: Colors.text.primary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  // Ownership map
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  ownerEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  ownerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerArea: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  ownerCadence: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginLeft: 6 },
  ownerNames: { color: Colors.text.secondary, fontSize: 12, marginTop: 4 },
  ownerLabelText: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },
  ownerDue: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  ownerEscalation: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },

  // Feedback loop
  loopCard: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  loopRailCol: {
    width: 32,
    alignItems: 'center',
  },
  loopDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loopDotNum: { color: '#001018', fontSize: 11, fontWeight: '900' },
  loopConnector: { flex: 1, width: 2, marginTop: 2 },
  loopBody: {
    flex: 1,
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginLeft: 6,
    borderLeftWidth: 3,
  },
  loopHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  loopEmoji: { fontSize: 16, marginRight: 6 },
  loopStage: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  loopSla: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  loopWhat: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  loopWho: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  loopExampleBox: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 8,
  },
  loopExampleLabel: {
    color: Colors.tech.neonBlue,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  loopExample: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },

  // Voter weights
  vwRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  vwEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  vwTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vwRole: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  vwWeight: { fontSize: 15, fontWeight: '900', marginLeft: 8 },
  vwExamples: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },

  // Escalation
  epCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  epTopRow: { flexDirection: 'row', alignItems: 'center' },
  epEmoji: { fontSize: 22, marginRight: 10 },
  epLvlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  epLvl: { color: Colors.text.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  epSla: { fontSize: 10, fontWeight: '900' },
  epName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 2 },
  epWhen: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  epOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 6, fontStyle: 'italic' },

  // Shipped wins
  swCard: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  swEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  swTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  swTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  swMonths: { color: Colors.text.muted, fontSize: 10, fontWeight: '700', marginLeft: 8 },
  swCategory: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  swImpact: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },

  // Discarded
  dsCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  dsTopRow: { flexDirection: 'row', alignItems: 'center' },
  dsEmoji: { fontSize: 22, marginRight: 10 },
  dsTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  dsAgo: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  dsReason: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  dsRespectedBy: { color: Colors.text.muted, fontSize: 10, marginTop: 6, fontStyle: 'italic' },

  // Decision journal
  djCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  djTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  djEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  djWeek: { color: Colors.text.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  djDecision: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 2, lineHeight: 17 },
  djContext: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  djRevisit: { color: Colors.tech.neonBlue, fontSize: 10, marginTop: 6, fontWeight: '700' },

  // Stage tips
  tipCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  tipTopRow: { flexDirection: 'row', alignItems: 'center' },
  tipEmoji: { fontSize: 22, marginRight: 10 },
  tipStage: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  tipBody: { color: Colors.text.secondary, fontSize: 12, lineHeight: 16, marginTop: 8 },
  tipExRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
  tipExCol: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 8 },
  tipExLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  tipExDone: { color: Colors.text.primary, fontSize: 10, lineHeight: 13 },
  tipExNot: { color: Colors.text.muted, fontSize: 10, lineHeight: 13, fontStyle: 'italic' },

  // --- Phase 3y: decision rights ---
  drCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  drTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  drEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  drScope: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  drKvRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, paddingLeft: 32 },
  drKey: { color: Colors.text.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, width: 74 },
  drVal: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, flex: 1 },

  // --- Phase 3y: disagree log ---
  dlCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  dlTopRow: { flexDirection: 'row', alignItems: 'center' },
  dlEmoji: { fontSize: 20, marginRight: 10 },
  dlTopic: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  dlOutcome: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  dlOutcomeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  dlSideRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  dlSideCol: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8 },
  dlSideLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  dlSideText: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  dlLearning: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 10, fontStyle: 'italic' },

  // --- Phase 3y: return signals ---
  rsCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  rsTopRow: { flexDirection: 'row', alignItems: 'center' },
  rsEmoji: { fontSize: 20, marginRight: 10 },
  rsMetric: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  rsMeasured: { color: Colors.text.muted, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  rsStatePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  rsStateText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  rsKvRow: { flexDirection: 'row', marginTop: 6, paddingLeft: 30 },
  rsKey: { color: Colors.text.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, width: 60 },
  rsVal: { color: Colors.text.secondary, fontSize: 11, flex: 1 },

  // --- Phase 3y: feedback loops ---
  flpCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  flpTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  flpEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  flpCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  flpRitual: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 2, lineHeight: 17 },
  flpWho: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700', marginTop: 6, paddingLeft: 32 },
  flpOutput: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3y: trust promises ---
  tpCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  tpTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tpEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  tpPromise: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  tpWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },
  tpHow: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 32 },

  // --- Phase 3y: open calls ---
  ocRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  ocEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  ocTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ocTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  ocDeadline: { fontSize: 11, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  ocPrompt: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  ocWing: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // --- Phase 3ae: intakes ---
  sinCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  sinTopRow: { flexDirection: 'row', alignItems: 'center' },
  sinEmoji: { fontSize: 22, marginRight: 10 },
  sinChannel: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  sinOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  sinCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 8 },
  sinResponse: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ae: templates ---
  stpCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  stpTopRow: { flexDirection: 'row', alignItems: 'center' },
  stpEmoji: { fontSize: 22, marginRight: 10 },
  stpScenario: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  stpTemplate: { color: Colors.text.primary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32, fontStyle: 'italic' },
  stpUseWhen: { color: Colors.text.muted, fontSize: 10, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ae: guardrails ---
  sgrCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  sgrTopRow: { flexDirection: 'row', alignItems: 'center' },
  sgrEmoji: { fontSize: 22, marginRight: 10 },
  sgrGuardrail: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  sgrOneLine: { fontSize: 12, fontWeight: '700', marginTop: 6, paddingLeft: 32, fontStyle: 'italic' },
  sgrWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3ae: cases ---
  scCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  scTopRow: { flexDirection: 'row', alignItems: 'center' },
  scEmoji: { fontSize: 22, marginRight: 10 },
  scIdea: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  scMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingLeft: 32 },
  scMetaLabel: { color: Colors.text.muted, fontSize: 10 },
  scMetaValue: { color: Colors.text.primary, fontSize: 11, fontWeight: '800' },
  scOutcome: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },
  scDaysPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 32,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  scDaysText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  // --- Phase 3ae: voices ---
  svCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  svTopRow: { flexDirection: 'row', alignItems: 'center' },
  svEmoji: { fontSize: 22, marginRight: 10 },
  svVoice: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  svAbout: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  svSaid: { color: Colors.text.secondary, fontSize: 12, lineHeight: 16, marginTop: 8, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3al: intake windows ---
  siwCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  siwTopRow: { flexDirection: 'row', alignItems: 'center' },
  siwEmoji: { fontSize: 22, marginRight: 10 },
  siwWindow: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  siwOpen: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  siwTheme: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  siwLead: { color: Colors.text.muted, fontSize: 11, marginTop: 3, paddingLeft: 32 },

  // --- Phase 3al: committee picks ---
  scpCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  scpTopRow: { flexDirection: 'row', alignItems: 'center' },
  scpEmoji: { fontSize: 22, marginRight: 10 },
  scpSuggestion: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  scpShipped: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 2, textTransform: 'uppercase' },
  scpOutcome: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  scpImpact: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3al: design principles ---
  sdpCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sdpTopRow: { flexDirection: 'row', alignItems: 'center' },
  sdpEmoji: { fontSize: 22, marginRight: 10 },
  sdpPrinciple: { fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  sdpInPractice: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },

  // --- Phase 3al: lifecycle stages ---
  sglCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sglTopRow: { flexDirection: 'row', alignItems: 'center' },
  sglStep: { fontSize: 14, fontWeight: '900', marginRight: 10, letterSpacing: 0.5 },
  sglEmoji: { fontSize: 20, marginRight: 10 },
  sglStage: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  sglSla: { color: Colors.accent.softGold, fontSize: 11, fontWeight: '700', marginTop: 2 },
  sglOwner: { color: Colors.text.muted, fontSize: 11, marginTop: 8, paddingLeft: 48 },
  sglRule: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 48 },

  // --- Phase 3al: reviewer duties ---
  srdCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  srdTopRow: { flexDirection: 'row', alignItems: 'center' },
  srdEmoji: { fontSize: 22, marginRight: 10 },
  srdDuty: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  srdDo: { color: '#22C55E', fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  srdDoNot: { color: '#F87171', fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 32 },

  // --- Phase 3al: worked cases ---
  swcCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 14, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  swcTopRow: { flexDirection: 'row', alignItems: 'center' },
  swcEmoji: { fontSize: 24, marginRight: 10 },
  swcTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', lineHeight: 17 },
  swcSubmitter: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  swcJourney: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 10, paddingLeft: 34 },
  swcOutcome: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 3, paddingLeft: 34 },
  swcThanks: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 34, fontStyle: 'italic' },

  // --- Phase 3ar: pitch templates ---
  sptCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sptTopRow: { flexDirection: 'row', alignItems: 'center' },
  sptEmoji: { fontSize: 22, marginRight: 10 },
  sptKind: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  sptLength: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  sptStructure: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  sptExample: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ar: decision gates ---
  sdgCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sdgTopRow: { flexDirection: 'row', alignItems: 'center' },
  sdgEmoji: { fontSize: 22, marginRight: 10 },
  sdgGate: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1, lineHeight: 17 },
  sdgCheck: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  sdgOwner: { fontSize: 11, marginTop: 4, paddingLeft: 32, fontWeight: '700' },
  sdgNext: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3ar: reviewer principles ---
  srpCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  srpTopRow: { flexDirection: 'row', alignItems: 'center' },
  srpEmoji: { fontSize: 22, marginRight: 10 },
  srpPrinciple: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1, lineHeight: 17 },
  srpMeans: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  srpNot: { fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ar: conflict paths ---
  scp2Card: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  scp2TopRow: { flexDirection: 'row', alignItems: 'center' },
  scp2Emoji: { fontSize: 22, marginRight: 10 },
  scp2Situation: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1, lineHeight: 17 },
  scp2First: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  scp2Stuck: { fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontWeight: '700' },
  scp2Harm: { color: '#F87171', fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ar: communication cadences ---
  sxcCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sxcTopRow: { flexDirection: 'row', alignItems: 'center' },
  sxcEmoji: { fontSize: 22, marginRight: 10 },
  sxcCadence: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  sxcChannel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  sxcAudience: { color: Colors.text.muted, fontSize: 11, marginTop: 8, paddingLeft: 32 },
  sxcRhythm: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3ax: pilot recipes ---
  sprCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sprTopRow: { flexDirection: 'row', alignItems: 'center' },
  sprEmoji: { fontSize: 22, marginRight: 10 },
  sprName: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1 },
  sprScope: { fontSize: 11, fontWeight: '700', marginTop: 8, paddingLeft: 32 },
  sprBudget: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },
  sprExit: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ax: impact ledger ---
  silCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  silTopRow: { flexDirection: 'row', alignItems: 'center' },
  silEmoji: { fontSize: 22, marginRight: 10 },
  silShipped: { color: Colors.text.primary, fontSize: 13, fontWeight: '900', flex: 1, lineHeight: 17 },
  silCost: { fontSize: 11, fontWeight: '700', marginTop: 8, paddingLeft: 32 },
  silBenefit: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },
  silFollowUp: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ax: follow-up rings ---
  sfrCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginHorizontal: HORIZONTAL_PADDING, marginBottom: 10, borderLeftWidth: 3 },
  sfrTopRow: { flexDirection: 'row', alignItems: 'center' },
  sfrEmoji: { fontSize: 22, marginRight: 10 },
  sfrAfter: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  sfrCheckIn: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  sfrSignal: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  sfrResponder: { color: Colors.text.muted, fontSize: 11, marginTop: 4, paddingLeft: 32 },
});

export default SuggestionScreen;
