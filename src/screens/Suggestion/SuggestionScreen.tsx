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

  const listHeader = (
    <View>
      {renderHeader()}
      {renderCategoryRail()}
      {renderPriorityRow()}
      {renderTrending()}
      {renderLeaderboard()}
      {renderTags()}
      {renderAnalytics()}
      {renderVelocity()}
      {renderMonthlyDigest()}
      {renderTracking()}
      {renderQuarterlyRetro()}
      {renderOwnershipMap()}
      {renderFeedbackLoop()}
      {renderRoadmap()}
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
});

export default SuggestionScreen;
