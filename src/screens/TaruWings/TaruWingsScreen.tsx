// =====================================================
// TARU GUARDIANS — TARU WINGS (Premium)
// 6 wings · members · projects · open positions · events · analytics
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
import { Colors } from '../../constants/colors';
import { TaruWingsMember, WingSection } from '../../types/navigation';

// -----------------------------------------------------
// Tokens
// -----------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 22;
const AVATAR_SIZE = IS_SMALL ? 52 : 60;

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
// Wings
// -----------------------------------------------------

interface ExtWing extends WingSection {
  tagline: string;
  gradient: readonly [string, string, ...string[]];
  leadId: string;
  totalProjects: number;
  totalEvents: number;
  weeklyHours: number;
  applicationsOpen: boolean;
  tools: string[];
  philosophy: string;
}

const WINGS: ExtWing[] = [
  {
    id: 'content',
    name: 'Content Writer',
    icon: '✍️',
    color: '#F59E0B',
    description:
      'Blog, newsletter, zines, documentation, social captions, research summaries. Words that can\'t be skimmed because they earned the reader.',
    memberCount: 25,
    openPositions: ['Editorial Lead', 'Technical Writer', 'Newsletter Editor', 'Research Synthesiser'],
    tagline: 'Say it clearly. Or cut it.',
    gradient: ['#5A3A00', '#8A5A10', '#C48720'],
    leadId: 'm-1',
    totalProjects: 42,
    totalEvents: 18,
    weeklyHours: 140,
    applicationsOpen: true,
    tools: ['Notion', 'Ghost', 'Grammarly', 'Google Docs', 'Readwise'],
    philosophy: 'One draft = one argument. Kill adjectives. Respect the reader\'s 30 seconds.',
  },
  {
    id: 'webapp',
    name: 'Web/App Development',
    icon: '💻',
    color: '#38BDF8',
    description:
      'Club app, website, event tooling, attendance systems, admin dashboards. Small, useful, kind-to-new-contributors code.',
    memberCount: 30,
    openPositions: ['Frontend Dev (React Native)', 'Backend Dev (Node)', 'DevOps', 'QA & Release', 'Docs Maintainer'],
    tagline: 'Ship small. Ship calm. Don\'t ship ego.',
    gradient: ['#052B3A', '#074A69', '#0A6A95'],
    leadId: 'm-8',
    totalProjects: 28,
    totalEvents: 12,
    weeklyHours: 220,
    applicationsOpen: true,
    tools: ['React Native', 'Expo', 'Node.js', 'Postgres', 'Vercel', 'EAS Build', 'GitHub Actions'],
    philosophy:
      'No cleverness without justification. Every PR explains who it helps. First-timers-welcome is a rule, not a vibe.',
  },
  {
    id: 'gd',
    name: 'Graphic Designer',
    icon: '🎨',
    color: '#F472B6',
    description:
      'Identity, posters, merchandise, illustration, motion stills, brand kits. Calm typography, earthy palettes, one bold accent.',
    memberCount: 20,
    openPositions: ['Lead Identity Designer', 'Illustrator', 'Motion Designer', 'Merch Designer'],
    tagline: 'White space is also content.',
    gradient: ['#4A103A', '#6A1C55', '#8F2F73'],
    leadId: 'm-17',
    totalProjects: 64,
    totalEvents: 20,
    weeklyHours: 180,
    applicationsOpen: true,
    tools: ['Figma', 'Affinity', 'Procreate', 'InDesign', 'After Effects'],
    philosophy: 'Nothing should look "clever". Everything should read quietly first, then land.',
  },
  {
    id: 'video',
    name: 'Video Editor',
    icon: '🎬',
    color: '#EF4444',
    description:
      'Event recaps, documentaries, interviews, reels, workshop tutorials, behind-the-scenes. Honest cuts, simple storytelling.',
    memberCount: 15,
    openPositions: ['Lead Editor', 'Colourist', 'Sound Designer', 'Cinematographer'],
    tagline: 'The edit is the story.',
    gradient: ['#4A0A0A', '#6A1616', '#8F2323'],
    leadId: 'm-24',
    totalProjects: 36,
    totalEvents: 16,
    weeklyHours: 160,
    applicationsOpen: false,
    tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Audition', 'Final Cut'],
    philosophy: 'Every shot earns 2 seconds. Every transition earns 1 reason. No stock music that lies.',
  },
  {
    id: 'photo',
    name: 'Photographer',
    icon: '📸',
    color: '#FBBF24',
    description:
      'Events, portraits, wildlife, campus life, product shots for the merch drops. Patience > equipment.',
    memberCount: 18,
    openPositions: ['Event Lead', 'Portrait Lead', 'Wildlife Lead', 'Archive & Tagging'],
    tagline: 'Wait 8 extra minutes. Take the shot.',
    gradient: ['#3F2A00', '#6A4800', '#966A10'],
    leadId: 'm-30',
    totalProjects: 52,
    totalEvents: 24,
    weeklyHours: 150,
    applicationsOpen: true,
    tools: ['Lightroom', 'Capture One', 'Adobe Bridge', 'Photoshop'],
    philosophy: 'Light first, subject second, composition third. Everything else is taste.',
  },
  {
    id: 'pr',
    name: 'Public Relations',
    icon: '🤝',
    color: '#06B6D4',
    description:
      'Media relations, sponsorships, community partnerships, campus reps, alumni outreach, pre/post-event press.',
    memberCount: 22,
    openPositions: ['Sponsor Relations', 'Community Manager', 'Press Liaison', 'Campus Rep (per campus)'],
    tagline: 'Every partner should feel respected, not sold to.',
    gradient: ['#063445', '#0A5770', '#0F7A99'],
    leadId: 'm-37',
    totalProjects: 38,
    totalEvents: 28,
    weeklyHours: 130,
    applicationsOpen: true,
    tools: ['Airtable', 'Gmail', 'Calendly', 'HubSpot (free tier)', 'Notion CRM'],
    philosophy: 'Every email starts with why-it-matters-to-them. Every no is a maybe-next-semester.',
  },
];

// -----------------------------------------------------
// Projects
// -----------------------------------------------------

interface WingProject {
  id: string;
  wingId: string;
  title: string;
  description: string;
  status: 'live' | 'in-progress' | 'shipped' | 'paused';
  tech: string[];
  contributors: number;
  impact: string;
  startDate: string;
}

const PROJECTS: WingProject[] = [
  // Content
  { id: 'p-c1', wingId: 'content', title: 'Annual Impact Report 2025', description: '64-page transparent report. Every rupee, every tree, every failure.', status: 'shipped', tech: ['Notion', 'Figma'], contributors: 6, impact: '2,400 reads · 180 shares', startDate: '2025-05-10' },
  { id: 'p-c2', wingId: 'content', title: 'Weekly Digest (Sunday mornings)', description: '52 editions a year. <4% unsubscribe. Plain text on purpose.', status: 'live', tech: ['Ghost', 'Buttondown'], contributors: 4, impact: '1,100 subs · 62% open rate', startDate: '2024-09-01' },
  { id: 'p-c3', wingId: 'content', title: 'Onboarding handbook rewrite', description: '48 → 16 pages. First-year readable in one sitting.', status: 'shipped', tech: ['Notion'], contributors: 3, impact: 'New member ramp-up 7d → 3d', startDate: '2025-07-20' },
  { id: 'p-c4', wingId: 'content', title: 'Case-study series (8 alumni)', description: 'Long-form stories — how they went from first-year to offer letter.', status: 'in-progress', tech: ['Ghost'], contributors: 5, impact: '3 published · 5 in draft', startDate: '2026-02-01' },
  { id: 'p-c5', wingId: 'content', title: 'Sustainability glossary', description: 'Plain-English explainers for 90 terms. Footer references every source.', status: 'in-progress', tech: ['Notion'], contributors: 4, impact: '62/90 drafted', startDate: '2026-04-14' },

  // Web/App
  { id: 'p-w1', wingId: 'webapp', title: 'Club app v2 (this app)', description: 'Offline-first, push notifications, dark theme, attendance automation.', status: 'in-progress', tech: ['React Native', 'Expo', 'EAS'], contributors: 9, impact: 'App-wide — ~200 users', startDate: '2025-12-02' },
  { id: 'p-w2', wingId: 'webapp', title: 'Event sign-up form v3', description: 'QR entry, real-time seats, automatic waitlist.', status: 'shipped', tech: ['Next.js', 'Supabase'], contributors: 5, impact: '27 events · 4,600 sign-ups', startDate: '2025-04-01' },
  { id: 'p-w3', wingId: 'webapp', title: 'Attendance CLI for wing heads', description: 'Scan & go. Exports to XLSX. Offline friendly.', status: 'shipped', tech: ['Tauri', 'Rust'], contributors: 2, impact: '10 heads use it weekly', startDate: '2025-08-18' },
  { id: 'p-w4', wingId: 'webapp', title: 'Alumni directory search', description: 'Fuzzy search across 520 alumni + sector + year + company filters.', status: 'live', tech: ['Next.js', 'TypeScript'], contributors: 3, impact: '~40 searches per day', startDate: '2025-11-05' },
  { id: 'p-w5', wingId: 'webapp', title: 'Club.yaml — single source of truth', description: 'Members, events, budgets, sponsors — one YAML. PR to update.', status: 'in-progress', tech: ['YAML', 'GitHub Actions'], contributors: 4, impact: '~60% of data migrated', startDate: '2026-01-10' },
  { id: 'p-w6', wingId: 'webapp', title: 'Onboarding bot (Telegram)', description: 'Answers FAQs, posts weekly digest, pings inactive members weekly.', status: 'live', tech: ['Node.js', 'Telegraf'], contributors: 2, impact: '~150 weekly messages', startDate: '2025-03-02' },

  // GD
  { id: 'p-g1', wingId: 'gd', title: 'Club identity v3 (2026)', description: 'New wordmark, 12-colour palette, typography system, usage rules.', status: 'shipped', tech: ['Figma', 'Affinity'], contributors: 5, impact: 'Adopted by all 6 wings', startDate: '2025-11-25' },
  { id: 'p-g2', wingId: 'gd', title: 'Taru Fest 2026 key art', description: '4 variants — hero, social, tees, tickets. Hand-illustrated layer on vector base.', status: 'in-progress', tech: ['Procreate', 'Illustrator'], contributors: 4, impact: 'Launch in 3 weeks', startDate: '2026-03-20' },
  { id: 'p-g3', wingId: 'gd', title: 'Annual merchandise drop', description: 'T-shirts, tote, sticker packs — 100% cotton, 100% campus production.', status: 'shipped', tech: ['Illustrator'], contributors: 3, impact: '420 units sold · fully refunded on defects', startDate: '2025-09-10' },
  { id: 'p-g4', wingId: 'gd', title: 'Posters-for-every-event template kit', description: '12 editable templates. Anyone can remix in Figma.', status: 'live', tech: ['Figma'], contributors: 2, impact: '120+ remixes', startDate: '2025-06-15' },
  { id: 'p-g5', wingId: 'gd', title: 'Illustrated member avatar library', description: '60 hand-drawn avatars for the member directory.', status: 'shipped', tech: ['Procreate', 'Affinity'], contributors: 3, impact: 'Used on app + website', startDate: '2025-12-01' },

  // Video
  { id: 'p-v1', wingId: 'video', title: 'Plantation drive docu (7 min)', description: 'Cut from 9 hours of footage. 4 alumni voices layered through.', status: 'shipped', tech: ['DaVinci Resolve', 'Audition'], contributors: 5, impact: '12k views · shared by 2 NGOs', startDate: '2025-07-30' },
  { id: 'p-v2', wingId: 'video', title: 'Alumni interview series (8 eps)', description: 'Honest conversations, unfiltered edits. Each 12–18 min.', status: 'in-progress', tech: ['Premiere Pro'], contributors: 4, impact: '3/8 live · avg 1800 views', startDate: '2026-01-05' },
  { id: 'p-v3', wingId: 'video', title: 'Recap reels (weekly)', description: 'Saturday shoot → Sunday noon post. 45-sec reels.', status: 'live', tech: ['Premiere Rush'], contributors: 3, impact: '28 reels · avg 2200 views', startDate: '2025-09-22' },
  { id: 'p-v4', wingId: 'video', title: 'Tutorial library (10 vids)', description: 'Short how-tos on Figma, Notion, pitching, hosting.', status: 'in-progress', tech: ['Premiere Pro', 'Audition'], contributors: 4, impact: '6/10 done', startDate: '2026-02-18' },

  // Photo
  { id: 'p-ph1', wingId: 'photo', title: 'Campus portraits (60 members)', description: 'Natural light, consistent frame. Used across app + website.', status: 'shipped', tech: ['Lightroom'], contributors: 2, impact: 'All 60 members covered', startDate: '2025-09-05' },
  { id: 'p-ph2', wingId: 'photo', title: 'Wildlife calendar 2026', description: '12 curated images from 4 shoots in reserves across Karnataka.', status: 'shipped', tech: ['Lightroom', 'Photoshop'], contributors: 3, impact: '200 prints sold', startDate: '2025-10-18' },
  { id: 'p-ph3', wingId: 'photo', title: 'Event archive 2022–2026', description: 'Tagged, searchable, captioned archive of every club event.', status: 'in-progress', tech: ['Lightroom', 'Bridge'], contributors: 4, impact: '~14,000 photos · 68% tagged', startDate: '2025-08-02' },
  { id: 'p-ph4', wingId: 'photo', title: 'Portrait gift card program', description: 'Free portrait sessions for graduating members. 10 slots/yr.', status: 'live', tech: ['Lightroom'], contributors: 2, impact: '6 done this year', startDate: '2025-04-11' },

  // PR
  { id: 'p-pr1', wingId: 'pr', title: 'Sponsor handbook', description: '12-page PDF with tiers, deliverables, ledger screenshot.', status: 'shipped', tech: ['Notion', 'Canva'], contributors: 3, impact: '6 sponsors signed', startDate: '2025-10-01' },
  { id: 'p-pr2', wingId: 'pr', title: 'Alumni advisor board', description: '9 alumni mentors across 4 industries. Quarterly check-ins.', status: 'live', tech: ['Airtable'], contributors: 2, impact: 'Avg 8.6/10 satisfaction', startDate: '2025-02-14' },
  { id: 'p-pr3', wingId: 'pr', title: 'Press kit — Taru Fest', description: 'Downloadable kit — logos, photos, quotes, schedule.', status: 'in-progress', tech: ['Notion'], contributors: 3, impact: 'Launching next week', startDate: '2026-04-20' },
  { id: 'p-pr4', wingId: 'pr', title: 'Community partner directory', description: '22 NGOs we partner with — status, scope, contact, last contacted.', status: 'live', tech: ['Airtable'], contributors: 2, impact: '22/22 alive', startDate: '2025-06-05' },
  { id: 'p-pr5', wingId: 'pr', title: 'Campus rep program', description: '5 reps across 3 campuses. Weekly standup. Monthly dinner on us.', status: 'live', tech: ['Notion'], contributors: 4, impact: '5/5 active · 0 attrition', startDate: '2025-07-12' },
];

// -----------------------------------------------------
// Members (per-wing dataset)
// -----------------------------------------------------

const M = (
  id: string,
  name: string,
  role: string,
  wing: string,
  year: string,
  bio: string,
  skills: string[],
  opts?: { email?: string; portfolio?: string; imageUrl?: string }
): TaruWingsMember => ({
  id,
  name,
  role,
  wing,
  year,
  imageUrl: opts?.imageUrl ?? '',
  bio,
  email: opts?.email ?? `${name.toLowerCase().split(' ').join('.')}@taruguardians.org`,
  skills,
  portfolio: opts?.portfolio,
});

const MEMBERS: TaruWingsMember[] = [
  // Content
  M('m-1', 'Aarav Sharma', 'Editorial Lead', 'Content Writer', '2024', 'Edits with a scalpel. Ships short drafts with teeth.', ['Copywriting', 'Editing', 'Long-form', 'SEO']),
  M('m-2', 'Priya Patel', 'Senior Writer', 'Content Writer', '2025', 'Loves building arguments, not threads.', ['Newsletter', 'Research', 'Editing']),
  M('m-3', 'Kavya Nair', 'Research Synth.', 'Content Writer', '2026', 'First-year. Already flagged 3 dead links in the last report.', ['Research', 'Citations', 'Notion']),
  M('m-4', 'Shaurya Taneja', 'Technical Writer', 'Content Writer', '2025', 'Turns engineering RFCs into paragraphs humans read.', ['Technical writing', 'API docs', 'Notion']),
  M('m-5', 'Maanas Yadav', 'Docs Maintainer', 'Content Writer', '2025', 'Guardrails for every repo README.', ['Docs', 'Markdown', 'Diátaxis']),
  M('m-6', 'Ira Singhania', 'Social Captions', 'Content Writer', '2026', 'Caption-first mind.', ['Copy', 'Insta', 'Tone']),
  M('m-7', 'Ritwik Joshi', 'Newsletter Editor', 'Content Writer', '2025', 'Weekly digest never misses a Sunday.', ['Ghost', 'Editorial', 'Tone']),

  // Web/App
  M('m-8', 'Raj Mehra', 'Tech Lead', 'Web/App Development', '2024', 'Full-stack. Hates clever code. Loves small PRs.', ['React Native', 'Node.js', 'Postgres', 'TypeScript']),
  M('m-9', 'Ananya Singh', 'Frontend Dev', 'Web/App Development', '2025', 'Accessibility first. Speed second. Cleverness last.', ['React', 'React Native', 'a11y']),
  M('m-10', 'Mayank Desai', 'Backend Dev', 'Web/App Development', '2025', 'Query plans on whiteboards.', ['Node.js', 'Postgres', 'Redis']),
  M('m-11', 'Dev Shukla', 'QA & Release', 'Web/App Development', '2026', 'First-year. Already caught 9 regressions.', ['QA', 'Playwright', 'Jest']),
  M('m-12', 'Rhea Kapoor', 'DevOps', 'Web/App Development', '2024', 'Green builds every day.', ['GitHub Actions', 'Docker', 'Fly.io']),
  M('m-13', 'Siddhanth Rao', 'Backend Dev', 'Web/App Development', '2025', 'Calm on-call. Writes runbooks.', ['Node.js', 'Postgres', 'Observability']),
  M('m-14', 'Neel Saxena', 'Mobile Dev', 'Web/App Development', '2025', 'Bundle size obsessive.', ['React Native', 'Expo', 'Hermes']),
  M('m-15', 'Veda Iyer', 'Frontend Dev', 'Web/App Development', '2026', 'First-year. Owns the onboarding flow already.', ['React Native', 'Animations']),
  M('m-16', 'Tanvi Arora', 'Data Eng', 'Web/App Development', '2024', 'One dashboard to rule them all.', ['Airflow', 'Python', 'dbt']),

  // GD
  M('m-17', 'Neha Gupta', 'Design Head', 'Graphic Designer', '2024', 'Brand guardian. Soft-spoken, strong NOs.', ['Figma', 'Brand', 'Typography']),
  M('m-18', 'Aryan Malhotra', 'Illustrator', 'Graphic Designer', '2025', 'Illustrates every single hero.', ['Procreate', 'Illustration']),
  M('m-19', 'Ishita Rawat', 'Motion', 'Graphic Designer', '2025', '12-frame loops or nothing.', ['After Effects', 'Motion']),
  M('m-20', 'Keshav Dua', 'Merch', 'Graphic Designer', '2025', 'Every stitch is a design decision.', ['Apparel', 'Illustrator']),
  M('m-21', 'Zara Nasreen', 'Poster Lead', 'Graphic Designer', '2026', 'Typography nerd. First-year.', ['Typography', 'Figma']),
  M('m-22', 'Mihir Tandon', 'Identity Dev', 'Graphic Designer', '2025', 'Style-guide author.', ['Brand', 'Style guides']),
  M('m-23', 'Ayesha Khan', 'Motion & Stickers', 'Graphic Designer', '2026', 'Stickers people keep.', ['Procreate', 'After Effects']),

  // Video
  M('m-24', 'Siddharth Arora', 'Lead Editor', 'Video Editor', '2024', 'Cuts with taste. No overlays for overlays.', ['Premiere', 'DaVinci', 'Sound']),
  M('m-25', 'Pooja Bhalla', 'Documentarian', 'Video Editor', '2025', 'Asks the second question.', ['Documentary', 'Interviews']),
  M('m-26', 'Arnav Chakraborty', 'Colourist', 'Video Editor', '2025', 'Calm, warm, consistent grade.', ['DaVinci', 'Colour']),
  M('m-27', 'Mira Kapoor', 'Sound Designer', 'Video Editor', '2024', 'Dialogue-first mixes.', ['Audition', 'Pro Tools']),
  M('m-28', 'Raghav Sood', 'Reel Editor', 'Video Editor', '2026', 'First-year. Ships the Sunday recap reel.', ['Premiere Rush', 'CapCut']),
  M('m-29', 'Noor Bhatia', 'Cinematographer', 'Video Editor', '2025', 'Handheld, kind light.', ['A7iii', 'Lenses']),

  // Photo
  M('m-30', 'Vivaan Bose', 'Photo Lead', 'Photographer', '2024', 'Event lead. 150 events covered.', ['Lightroom', 'Event']),
  M('m-31', 'Anika Mehrotra', 'Wildlife', 'Photographer', '2025', 'Patient. Writes field journals.', ['Wildlife', 'Lightroom']),
  M('m-32', 'Rishab Chowdhury', 'Portraits', 'Photographer', '2024', 'Natural-light purist.', ['Portraits', '50mm prime']),
  M('m-33', 'Tara Jadhav', 'Street/Campus', 'Photographer', '2025', 'Candid campus life.', ['Street', 'Campus life']),
  M('m-34', 'Aditya Sengupta', 'Product / Merch', 'Photographer', '2025', 'Shoots every merch batch.', ['Product', 'Lighting']),
  M('m-35', 'Ridhi Khurana', 'Archivist', 'Photographer', '2026', 'First-year. Tagging every old photo.', ['Archive', 'Metadata']),
  M('m-36', 'Harshit Dubey', 'BTS / Video-for-Photo', 'Photographer', '2025', 'Behind-the-scenes coverage.', ['Film SLR', 'BTS']),

  // PR
  M('m-37', 'Nikhil Rathi', 'PR Lead', 'Public Relations', '2024', 'Owns sponsor relationships. Writes honest follow-ups.', ['Sponsors', 'Negotiation']),
  M('m-38', 'Sanchita Bose', 'Community Manager', 'Public Relations', '2025', 'Runs Discord, Telegram, Slack handoffs.', ['Community', 'Moderation']),
  M('m-39', 'Kunal Sikri', 'Press Liaison', 'Public Relations', '2025', 'Media contacts. Press kits.', ['Media', 'Writing']),
  M('m-40', 'Anvi Pillai', 'Campus Rep', 'Public Relations', '2026', 'First-year. Campus C point of contact.', ['Ops', 'Comms']),
  M('m-41', 'Harsh Vardhan', 'Sponsor Lead', 'Public Relations', '2024', 'Runs the 6-sponsor cohort for Taru Fest.', ['Sales', 'Sponsors']),
  M('m-42', 'Devika Mathur', 'Alumni Outreach', 'Public Relations', '2025', 'Keeps 520 alumni warm.', ['Outreach', 'CRM']),
];

// -----------------------------------------------------
// Wing events
// -----------------------------------------------------

interface WingEvent {
  id: string;
  wingId: string;
  title: string;
  date: string;
  attendees: number;
  recap: string;
}

const WING_EVENTS: WingEvent[] = [
  { id: 'we-1', wingId: 'content', title: 'Writing-for-tech workshop', date: '2026-05-18', attendees: 46, recap: '3 alumni mentors. Edit-live session.' },
  { id: 'we-2', wingId: 'content', title: 'Newsletter doctor', date: '2026-04-10', attendees: 22, recap: 'Reviewed 9 student newsletters.' },
  { id: 'we-3', wingId: 'content', title: 'Zine print night', date: '2026-03-02', attendees: 30, recap: 'Printed 45 zines on campus.' },

  { id: 'we-4', wingId: 'webapp', title: 'First-PR Friday', date: '2026-05-17', attendees: 38, recap: '11 merged PRs. 8 first-timers.' },
  { id: 'we-5', wingId: 'webapp', title: 'Hackathon: tools-that-stay', date: '2026-04-26', attendees: 96, recap: '6 projects. 3 adopted by the club.' },
  { id: 'we-6', wingId: 'webapp', title: 'Release week triage', date: '2026-03-30', attendees: 14, recap: '60 issues triaged. 22 closed.' },

  { id: 'we-7', wingId: 'gd', title: 'Poster-a-day challenge', date: '2026-05-03', attendees: 42, recap: '5-day challenge. 210 posters submitted.' },
  { id: 'we-8', wingId: 'gd', title: 'Typography crit', date: '2026-04-19', attendees: 18, recap: 'Slower, kinder crits. Felt different.' },

  { id: 'we-9', wingId: 'video', title: 'Story-shoot-edit sprint', date: '2026-05-10', attendees: 25, recap: '4 teams. 5-min short films by Sunday.' },
  { id: 'we-10', wingId: 'video', title: 'Colour grading live session', date: '2026-04-05', attendees: 21, recap: 'Base LUTs, node trees, skin tones.' },

  { id: 'we-11', wingId: 'photo', title: 'Photo walk — Cubbon', date: '2026-05-04', attendees: 35, recap: 'Sunrise. Zero flash. Lots of patience.' },
  { id: 'we-12', wingId: 'photo', title: 'Portraits marathon', date: '2026-04-12', attendees: 28, recap: '60 portraits in one day.' },

  { id: 'we-13', wingId: 'pr', title: 'Sponsor roundtable', date: '2026-05-20', attendees: 14, recap: '6 sponsors · 2-hour honest discussion.' },
  { id: 'we-14', wingId: 'pr', title: 'Alumni dinner', date: '2026-04-02', attendees: 60, recap: '20+ alumni. Catering kept vegan.' },
];

// -----------------------------------------------------
// Impact / analytics
// -----------------------------------------------------

interface WingMetric {
  id: string;
  label: string;
  icon: string;
  color: string;
  value: (w: ExtWing) => string;
}

const METRICS: WingMetric[] = [
  { id: 'members', label: 'Members', icon: '🧑‍🤝‍🧑', color: '#38BDF8', value: (w) => `${w.memberCount}` },
  { id: 'projects', label: 'Projects', icon: '🚀', color: '#A78BFA', value: (w) => `${w.totalProjects}` },
  { id: 'events', label: 'Events', icon: '📅', color: '#4ADE80', value: (w) => `${w.totalEvents}` },
  { id: 'hours', label: 'Hours / wk', icon: '⏱', color: '#F472B6', value: (w) => `${w.weeklyHours}` },
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

const TaruWingsScreen: React.FC = () => {
  const [selectedWingId, setSelectedWingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TaruWingsMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<WingProject | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyReason, setApplyReason] = useState('');
  const [applyPosition, setApplyPosition] = useState<string | null>(null);
  const [applySent, setApplySent] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const memberModalScale = useRef(new Animated.Value(0.9)).current;
  const projectModalScale = useRef(new Animated.Value(0.9)).current;
  const applyModalScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: ANIM.duration.slow,
      easing: ANIM.easing.out,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  useEffect(() => {
    if (showMemberModal) {
      Animated.spring(memberModalScale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    } else {
      memberModalScale.setValue(0.9);
    }
  }, [showMemberModal, memberModalScale]);

  useEffect(() => {
    if (showProjectModal) {
      Animated.spring(projectModalScale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    } else {
      projectModalScale.setValue(0.9);
    }
  }, [showProjectModal, projectModalScale]);

  useEffect(() => {
    if (showApplyModal) {
      Animated.spring(applyModalScale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    } else {
      applyModalScale.setValue(0.9);
      setApplySent(false);
    }
  }, [showApplyModal, applyModalScale]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1100);
  }, []);

  const totalMembers = useMemo(() => WINGS.reduce((a, w) => a + w.memberCount, 0), []);
  const totalProjects = useMemo(() => WINGS.reduce((a, w) => a + w.totalProjects, 0), []);
  const totalEvents = useMemo(() => WINGS.reduce((a, w) => a + w.totalEvents, 0), []);

  const selectedWing = useMemo(
    () => (selectedWingId ? WINGS.find((w) => w.id === selectedWingId) ?? null : null),
    [selectedWingId]
  );

  const wingMembers = useMemo(() => {
    if (!selectedWing) return [];
    const list = MEMBERS.filter((m) => m.wing === selectedWing.name);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [selectedWing, searchQuery]);

  const wingProjects = useMemo(() => {
    if (!selectedWing) return [];
    return PROJECTS.filter((p) => p.wingId === selectedWing.id);
  }, [selectedWing]);

  const wingEvents = useMemo(() => {
    if (!selectedWing) return [];
    return WING_EVENTS.filter((e) => e.wingId === selectedWing.id);
  }, [selectedWing]);

  const onOpenWing = useCallback((id: string) => {
    setSelectedWingId(id);
    setSearchQuery('');
  }, []);

  const onBackToIndex = useCallback(() => {
    setSelectedWingId(null);
  }, []);

  const onOpenMember = useCallback((m: TaruWingsMember) => {
    setSelectedMember(m);
    setShowMemberModal(true);
  }, []);

  const onCloseMember = useCallback(() => {
    setShowMemberModal(false);
    setTimeout(() => setSelectedMember(null), 200);
  }, []);

  const onOpenProject = useCallback((p: WingProject) => {
    setSelectedProject(p);
    setShowProjectModal(true);
  }, []);

  const onCloseProject = useCallback(() => {
    setShowProjectModal(false);
    setTimeout(() => setSelectedProject(null), 200);
  }, []);

  const onApplyPosition = useCallback((pos: string) => {
    setApplyPosition(pos);
    setShowApplyModal(true);
  }, []);

  const submitApply = useCallback(() => {
    if (!applyName.trim() || !/^\S+@\S+\.\S+$/.test(applyEmail.trim()) || applyReason.trim().length < 30) {
      Alert.alert(
        'Almost there',
        'Name, valid email and a 30+ character reason are required.'
      );
      return;
    }
    setApplySent(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplyName('');
      setApplyEmail('');
      setApplyReason('');
    }, 1200);
  }, [applyName, applyEmail, applyReason]);

  // ----- Renderers -----

  const renderIndexHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-14, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={['#07110C', '#0E2118']} style={styles.headerGradient}>
        <Text style={styles.headerEyebrow}>🪶 TARU WINGS</Text>
        <Text style={styles.headerTitle}>Six wings. One nest.</Text>
        <Text style={styles.headerBody}>
          Specialised crews inside the club. Pick where you want to grow — move between them freely.
        </Text>
        <View style={styles.headerStatsRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{WINGS.length}</Text>
            <Text style={styles.headerStatLabel}>Wings</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{totalMembers}</Text>
            <Text style={styles.headerStatLabel}>Members</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{totalProjects}</Text>
            <Text style={styles.headerStatLabel}>Projects</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{totalEvents}</Text>
            <Text style={styles.headerStatLabel}>Events</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderWingCard = (w: ExtWing) => (
    <TouchableOpacity
      key={w.id}
      activeOpacity={0.9}
      onPress={() => onOpenWing(w.id)}
      style={styles.wingCardWrap}
    >
      <LinearGradient colors={w.gradient} style={styles.wingCardGradient}>
        <View style={styles.wingCardRow}>
          <View style={[styles.wingIconCircle, { backgroundColor: w.color + '55' }]}>
            <Text style={styles.wingIcon}>{w.icon}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.wingCardName}>{w.name}</Text>
            <Text style={styles.wingCardTagline}>{w.tagline}</Text>
          </View>
          {w.applicationsOpen ? (
            <View style={styles.openPill}>
              <Text style={styles.openPillText}>OPEN</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.wingCardDesc} numberOfLines={3}>
          {w.description}
        </Text>
        <View style={styles.wingCardFooter}>
          <Text style={styles.wingCardFooterItem}>👥 {w.memberCount}</Text>
          <Text style={styles.wingCardFooterItem}>🚀 {w.totalProjects}</Text>
          <Text style={styles.wingCardFooterItem}>📅 {w.totalEvents}</Text>
          <Text style={styles.wingCardFooterItem}>⏱ {w.weeklyHours}/wk</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderIndex = () => (
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
      {renderIndexHeader()}

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🔍 Pick a wing</Text>
          <Text style={styles.sectionCaption}>Tap to open</Text>
        </View>
        {WINGS.map((w) => renderWingCard(w))}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌱 How wings work</Text>
          <Text style={styles.sectionCaption}>1 min read</Text>
        </View>
        <View style={styles.processCard}>
          <Text style={styles.processHeading}>The cadence</Text>
          <Text style={styles.processBody}>
            Each wing runs on a 4-week loop: Mon standup · Wed crit/review · Fri ship · Sat
            retro. You own one clear deliverable per loop — that\'s it. Nothing else on your
            plate.
          </Text>
          <View style={styles.processListBlock}>
            <Text style={styles.processPoint}>• No surprise work after 8 pm. Ever.</Text>
            <Text style={styles.processPoint}>• Any member can call a pause on a project without explanation.</Text>
            <Text style={styles.processPoint}>• Every wing has 2 office-hour windows per week.</Text>
            <Text style={styles.processPoint}>• First-years always pair with a senior on their first 3 loops.</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🤝 Open for applications</Text>
          <Text style={styles.sectionCaption}>
            {WINGS.filter((w) => w.applicationsOpen).length} wings hiring
          </Text>
        </View>
        {WINGS.filter((w) => w.applicationsOpen).map((w) => (
          <View key={w.id} style={[styles.openWingCard, { borderColor: w.color + '66' }]}>
            <View style={styles.openWingHeader}>
              <Text style={styles.openWingName}>{w.icon}  {w.name}</Text>
              <Text style={[styles.openWingBadge, { color: w.color }]}>
                {w.openPositions.length} roles
              </Text>
            </View>
            {w.openPositions.slice(0, 3).map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[styles.openPosRow, { borderLeftColor: w.color }]}
                onPress={() => onApplyPosition(pos)}
              >
                <Text style={styles.openPosName}>{pos}</Text>
                <Text style={styles.openPosArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {w.openPositions.length > 3 ? (
              <Text style={styles.openPosMore}>+{w.openPositions.length - 3} more</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>💬 Ethos across wings</Text>
          <Text style={styles.sectionCaption}>Shared values</Text>
        </View>
        <View style={styles.ethosList}>
          <View style={styles.ethosPillar}>
            <Text style={styles.ethosPillarEmoji}>🌿</Text>
            <Text style={styles.ethosPillarTitle}>Sustainability first</Text>
            <Text style={styles.ethosPillarBody}>
              Every deliverable checks: paperless draft, compostable vendor, re-usable templates.
            </Text>
          </View>
          <View style={styles.ethosPillar}>
            <Text style={styles.ethosPillarEmoji}>🫶</Text>
            <Text style={styles.ethosPillarTitle}>Calm by default</Text>
            <Text style={styles.ethosPillarBody}>
              No cold DMs at midnight. No surprise escalations. Write to the group channel first.
            </Text>
          </View>
          <View style={styles.ethosPillar}>
            <Text style={styles.ethosPillarEmoji}>📜</Text>
            <Text style={styles.ethosPillarTitle}>Credit openly</Text>
            <Text style={styles.ethosPillarBody}>
              Every artefact names all contributors — including first-years and one-time helpers.
            </Text>
          </View>
          <View style={styles.ethosPillar}>
            <Text style={styles.ethosPillarEmoji}>🔁</Text>
            <Text style={styles.ethosPillarTitle}>Make it reusable</Text>
            <Text style={styles.ethosPillarBody}>
              We always produce a template alongside the artefact. Next person starts at step 2.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderWingDetailHeader = () => {
    if (!selectedWing) return null;
    const w = selectedWing;
    return (
      <View style={styles.detailHeader}>
        <LinearGradient colors={w.gradient} style={styles.detailHeaderGradient}>
          <TouchableOpacity onPress={onBackToIndex} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←  All wings</Text>
          </TouchableOpacity>
          <View style={styles.detailTopRow}>
            <View style={[styles.detailIconCircle, { backgroundColor: w.color + '55' }]}>
              <Text style={styles.detailIcon}>{w.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.detailName}>{w.name}</Text>
              <Text style={styles.detailTagline}>{w.tagline}</Text>
            </View>
          </View>
          <Text style={styles.detailDesc}>{w.description}</Text>
          <Text style={styles.detailPhilosophy}>\"{w.philosophy}\"</Text>
          <View style={styles.metricsRow}>
            {METRICS.map((metric) => (
              <View
                key={metric.id}
                style={[styles.metricCard, { borderColor: metric.color + '55' }]}
              >
                <Text style={styles.metricIcon}>{metric.icon}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {metric.value(w)}
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderToolsBlock = () => {
    if (!selectedWing) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧰 Tools we use</Text>
          <Text style={styles.sectionCaption}>{selectedWing.tools.length} tools</Text>
        </View>
        <View style={styles.toolsWrap}>
          {selectedWing.tools.map((t) => (
            <View key={t} style={[styles.toolPill, { borderColor: selectedWing.color + '66' }]}>
              <Text style={[styles.toolPillText, { color: selectedWing.color }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOpenRoles = () => {
    if (!selectedWing) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            🤝 Open roles {selectedWing.applicationsOpen ? '' : '(currently closed)'}
          </Text>
          <Text style={styles.sectionCaption}>
            {selectedWing.openPositions.length} {selectedWing.openPositions.length === 1 ? 'role' : 'roles'}
          </Text>
        </View>
        {selectedWing.openPositions.map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[styles.openPosRow, { borderLeftColor: selectedWing.color }]}
            onPress={() => selectedWing.applicationsOpen && onApplyPosition(pos)}
            disabled={!selectedWing.applicationsOpen}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.openPosName}>{pos}</Text>
              <Text style={styles.openPosHint}>
                {selectedWing.applicationsOpen ? 'Tap to apply' : 'Next cohort in 4 weeks'}
              </Text>
            </View>
            <Text style={styles.openPosArrow}>
              {selectedWing.applicationsOpen ? '→' : '•'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchWrap}>
      <TextInput
        placeholder="Search members, roles, skills"
        placeholderTextColor={Colors.text.muted}
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 ? (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
          <Text style={styles.searchClearText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderMemberRow = ({ item }: { item: TaruWingsMember }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onOpenMember(item)}
      style={styles.memberRow}
    >
      <View
        style={[
          styles.memberAvatar,
          {
            backgroundColor: selectedWing
              ? selectedWing.color + '33'
              : Colors.tech.neonBlue + '33',
          },
        ]}
      >
        <Text style={styles.memberAvatarText}>
          {item.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
        <Text style={styles.memberBio} numberOfLines={2}>
          {item.bio}
        </Text>
        <View style={styles.memberSkillsRow}>
          {item.skills.slice(0, 3).map((s) => (
            <View key={s} style={styles.memberSkillPill}>
              <Text style={styles.memberSkillText}>{s}</Text>
            </View>
          ))}
          {item.skills.length > 3 ? (
            <Text style={styles.memberSkillMore}>+{item.skills.length - 3}</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.memberYear}>{item.year}</Text>
    </TouchableOpacity>
  );

  const renderMembersBlock = () => {
    if (!selectedWing) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>👥 Members</Text>
          <Text style={styles.sectionCaption}>{wingMembers.length} shown</Text>
        </View>
        {renderSearchBar()}
        {wingMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matches. Try a different keyword.</Text>
          </View>
        ) : (
          wingMembers.map((m) => (
            <View key={m.id}>{renderMemberRow({ item: m })}</View>
          ))
        )}
      </View>
    );
  };

  const renderProjectsBlock = () => {
    if (!selectedWing) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🚀 Projects</Text>
          <Text style={styles.sectionCaption}>{wingProjects.length} total</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH * 0.82}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: HORIZONTAL_PADDING }}
        >
          {wingProjects.map((p) => {
            const statusColor =
              p.status === 'live'
                ? '#22C55E'
                : p.status === 'shipped'
                ? '#38BDF8'
                : p.status === 'in-progress'
                ? '#FBBF24'
                : '#94A3B8';
            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.9}
                onPress={() => onOpenProject(p)}
                style={styles.projectCard}
              >
                <LinearGradient
                  colors={[selectedWing.color + '33', '#08100B']}
                  style={styles.projectGradient}
                >
                  <View style={styles.projectHeaderRow}>
                    <View style={[styles.projectStatusPill, { backgroundColor: statusColor }]}>
                      <Text style={styles.projectStatusText}>{p.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.projectContrib}>{p.contributors} contrib.</Text>
                  </View>
                  <Text style={styles.projectTitle} numberOfLines={2}>
                    {p.title}
                  </Text>
                  <Text style={styles.projectDesc} numberOfLines={3}>
                    {p.description}
                  </Text>
                  <View style={styles.projectTechRow}>
                    {p.tech.slice(0, 3).map((t) => (
                      <View key={t} style={styles.projectTechPill}>
                        <Text style={styles.projectTechText}>{t}</Text>
                      </View>
                    ))}
                    {p.tech.length > 3 ? (
                      <Text style={styles.projectTechMore}>+{p.tech.length - 3}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.projectImpact}>
                    <Text style={styles.projectImpactLabel}>Impact · </Text>
                    {p.impact}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderEventsBlock = () => {
    if (!selectedWing) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📅 Recent events</Text>
          <Text style={styles.sectionCaption}>{wingEvents.length} events</Text>
        </View>
        {wingEvents.map((e) => (
          <View
            key={e.id}
            style={[styles.eventRow, { borderLeftColor: selectedWing.color }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.eventRowTitle}>{e.title}</Text>
              <Text style={styles.eventRowDate}>
                {new Date(e.date).toDateString()} · {e.attendees} attendees
              </Text>
              <Text style={styles.eventRowRecap}>{e.recap}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMemberModal = () => {
    if (!selectedMember) return null;
    const m = selectedMember;
    const wing = WINGS.find((w) => w.name === m.wing);
    return (
      <Modal visible={showMemberModal} transparent animationType="fade" onRequestClose={onCloseMember}>
        <Animated.View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseMember} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: memberModalScale }] }]}
          >
            <LinearGradient
              colors={[wing ? wing.color + '55' : '#111', '#0A0F14']}
              style={styles.modalHero}
            >
              <View style={styles.modalTopRow}>
                <View
                  style={[
                    styles.modalAvatar,
                    { backgroundColor: wing ? wing.color + '33' : '#333' },
                  ]}
                >
                  <Text style={styles.modalAvatarText}>
                    {m.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={onCloseMember} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalName}>{m.name}</Text>
              <Text style={styles.modalRole}>{m.role}</Text>
              <Text style={styles.modalDept}>
                {m.wing} · Class of {m.year}
              </Text>
            </LinearGradient>
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalBody}>{m.bio}</Text>
              <Text style={styles.modalSectionTitle}>🎯 Skills</Text>
              <View style={styles.modalSkillsWrap}>
                {m.skills.map((s) => (
                  <View key={s} style={styles.modalSkillPill}>
                    <Text style={styles.modalSkillText}>{s}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.modalSectionTitle}>📫 Reach out</Text>
              <Text style={styles.modalContactLine}>{m.email}</Text>
              {m.portfolio ? (
                <Text style={styles.modalContactLine}>{m.portfolio}</Text>
              ) : null}
            </ScrollView>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  { backgroundColor: wing ? wing.color : Colors.tech.neonBlue },
                ]}
                onPress={() => Linking.openURL(`mailto:${m.email}`)}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Check out ${m.name} — ${m.role} (${m.wing}) at Taru Guardians. ${m.bio}`,
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

  const renderProjectModal = () => {
    if (!selectedProject) return null;
    const p = selectedProject;
    const wing = WINGS.find((w) => w.id === p.wingId);
    const statusColor =
      p.status === 'live'
        ? '#22C55E'
        : p.status === 'shipped'
        ? '#38BDF8'
        : p.status === 'in-progress'
        ? '#FBBF24'
        : '#94A3B8';
    return (
      <Modal visible={showProjectModal} transparent animationType="fade" onRequestClose={onCloseProject}>
        <Animated.View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCloseProject} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: projectModalScale }] }]}
          >
            <LinearGradient
              colors={[wing ? wing.color + '44' : '#111', '#0A0F14']}
              style={styles.modalHero}
            >
              <View style={styles.modalHeroTopRow}>
                <View style={[styles.modalBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.modalBadgeText}>{p.status.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={onCloseProject} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalName}>{p.title}</Text>
              <Text style={styles.modalRole}>{wing?.name ?? ''}</Text>
              <Text style={styles.modalDept}>
                {p.contributors} contributors · Started {p.startDate}
              </Text>
            </LinearGradient>
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalBody}>{p.description}</Text>
              <Text style={styles.modalSectionTitle}>🧠 Tech stack</Text>
              <View style={styles.modalSkillsWrap}>
                {p.tech.map((t) => (
                  <View key={t} style={styles.modalSkillPill}>
                    <Text style={styles.modalSkillText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.modalSectionTitle}>🌱 Impact</Text>
              <Text style={styles.modalBody}>{p.impact}</Text>
            </ScrollView>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[
                  styles.modalAction,
                  { backgroundColor: wing ? wing.color : Colors.tech.neonBlue },
                ]}
                onPress={onCloseProject}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderApplyModal = () => (
    <Modal
      visible={showApplyModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowApplyModal(false)}
    >
      <Animated.View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowApplyModal(false)} />
        <Animated.View
          style={[styles.modalContent, { transform: [{ scale: applyModalScale }] }]}
        >
          <LinearGradient colors={['#042F1A', '#0A4B2F']} style={styles.modalHero}>
            <View style={styles.modalHeroTopRow}>
              <Text style={styles.applyEyebrow}>🤝 APPLY</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalName}>{applyPosition ?? 'Open role'}</Text>
            <Text style={styles.modalDept}>
              We\'ll reply in 3 working days. No form, no fuss.
            </Text>
          </LinearGradient>
          {applySent ? (
            <View style={styles.applySuccess}>
              <Text style={styles.applySuccessEmoji}>🎉</Text>
              <Text style={styles.applySuccessText}>Application sent!</Text>
              <Text style={styles.applySuccessSub}>We\'ll write back from a real human inbox.</Text>
            </View>
          ) : (
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalSectionTitle}>👤 Name</Text>
              <TextInput
                value={applyName}
                onChangeText={setApplyName}
                placeholder="Your full name"
                placeholderTextColor={Colors.text.muted}
                style={styles.applyInput}
              />
              <Text style={styles.modalSectionTitle}>✉️ Email</Text>
              <TextInput
                value={applyEmail}
                onChangeText={setApplyEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.text.muted}
                style={styles.applyInput}
              />
              <Text style={styles.modalSectionTitle}>🙂 Why this wing?</Text>
              <TextInput
                value={applyReason}
                onChangeText={setApplyReason}
                placeholder="Two honest lines — we read every one."
                placeholderTextColor={Colors.text.muted}
                style={[styles.applyInput, { height: 90, textAlignVertical: 'top' }]}
                multiline
              />
              <Text style={styles.applyCharCount}>
                {applyReason.length} chars · min 30
              </Text>
            </ScrollView>
          )}
          {!applySent && (
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: Colors.accent.softGold }]}
                onPress={submitApply}
              >
                <Text style={[styles.modalActionText, { color: '#000' }]}>Send application</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: '#333' }]}
                onPress={() => setShowApplyModal(false)}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  const renderDetail = () => (
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
      {renderWingDetailHeader()}
      {renderToolsBlock()}
      {renderOpenRoles()}
      {renderProjectsBlock()}
      {renderEventsBlock()}
      {renderMembersBlock()}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
        translucent={Platform.OS === 'android'}
      />
      {selectedWing ? renderDetail() : renderIndex()}
      {renderMemberModal()}
      {renderProjectModal()}
      {renderApplyModal()}
    </SafeAreaView>
  );
};

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollContent: { paddingBottom: 120 },

  // Index header
  header: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 8 },
  headerGradient: { borderRadius: CARD_RADIUS, padding: 20, borderWidth: 1, borderColor: '#ffffff10' },
  headerEyebrow: { fontSize: 11, color: '#ffffffAA', letterSpacing: 2, fontWeight: '800' },
  headerTitle: { fontSize: IS_SMALL ? 24 : 28, color: '#fff', fontWeight: '900', marginTop: 10 },
  headerBody: { fontSize: 13, color: '#ffffffCC', lineHeight: 20, marginTop: 8 },
  headerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#00000044',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerStat: { alignItems: 'center', minWidth: 50 },
  headerStatValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerStatLabel: { color: '#ffffff99', fontSize: 10, marginTop: 2 },
  headerDivider: { width: 1, height: 20, backgroundColor: '#ffffff22' },

  // Sections
  sectionBlock: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  sectionTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '800' },
  sectionCaption: { color: Colors.text.muted, fontSize: 12 },

  // Wing card
  wingCardWrap: { borderRadius: CARD_RADIUS, overflow: 'hidden', marginBottom: 12 },
  wingCardGradient: { padding: 16, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: '#ffffff12' },
  wingCardRow: { flexDirection: 'row', alignItems: 'center' },
  wingIconCircle: {
    width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  wingIcon: { fontSize: 26 },
  wingCardName: { color: '#fff', fontSize: 17, fontWeight: '900' },
  wingCardTagline: { color: '#ffffffCC', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  openPill: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  openPillText: { color: '#000', fontSize: 10, fontWeight: '900' },
  wingCardDesc: { color: '#ffffffDD', fontSize: 13, lineHeight: 19, marginTop: 12 },
  wingCardFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff22',
    justifyContent: 'space-between',
  },
  wingCardFooterItem: { color: '#ffffffDD', fontSize: 12, fontWeight: '700' },

  // Process card
  processCard: {
    backgroundColor: '#0B1118',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  processHeading: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  processBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 19, marginTop: 8 },
  processListBlock: { marginTop: 12 },
  processPoint: { color: Colors.text.secondary, fontSize: 12, lineHeight: 19, marginTop: 4 },

  // Open wing card
  openWingCard: {
    backgroundColor: '#0B1118',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  openWingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openWingName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  openWingBadge: { fontSize: 11, fontWeight: '800' },
  openPosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1720',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    marginTop: 8,
  },
  openPosName: { color: Colors.text.primary, fontSize: 13, fontWeight: '700' },
  openPosHint: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  openPosArrow: { color: Colors.accent.softGold, fontSize: 16, fontWeight: '900' },
  openPosMore: { color: Colors.text.muted, fontSize: 11, marginTop: 6 },

  // Ethos
  ethosList: { marginTop: 6 },
  ethosPillar: {
    backgroundColor: '#0B1118',
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  ethosPillarEmoji: { fontSize: 22 },
  ethosPillarTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', marginTop: 4 },
  ethosPillarBody: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 4 },

  // Detail header
  detailHeader: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 8 },
  detailHeaderGradient: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#00000066',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  backBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  detailTopRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  detailIconCircle: {
    width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  detailIcon: { fontSize: 30 },
  detailName: { color: '#fff', fontSize: IS_SMALL ? 22 : 26, fontWeight: '900' },
  detailTagline: { color: '#ffffffCC', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  detailDesc: { color: '#ffffffDD', fontSize: 13, lineHeight: 19, marginTop: 12 },
  detailPhilosophy: {
    color: '#ffffffAA',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Metrics
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  metricCard: {
    flex: 1,
    marginHorizontal: 2,
    padding: 10,
    backgroundColor: '#00000044',
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricIcon: { fontSize: 16 },
  metricValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  metricLabel: { color: '#ffffffAA', fontSize: 10, marginTop: 2 },

  // Tools
  toolsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  toolPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    margin: 3,
  },
  toolPillText: { fontSize: 11, fontWeight: '800' },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text.primary,
  },
  searchClear: { marginLeft: 8, padding: 6 },
  searchClearText: { color: Colors.text.muted, fontSize: 14 },

  // Member row
  memberRow: {
    flexDirection: 'row',
    backgroundColor: '#0B1118',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff0F',
  },
  memberAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: { color: Colors.text.primary, fontWeight: '800' },
  memberName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  memberRole: { color: Colors.accent.softGold, fontSize: 12, fontWeight: '700', marginTop: 2 },
  memberBio: { color: Colors.text.secondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  memberSkillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  memberSkillPill: {
    backgroundColor: Colors.tech.neonBlue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  memberSkillText: { color: Colors.tech.neonBlue, fontSize: 10, fontWeight: '700' },
  memberSkillMore: { color: Colors.text.muted, fontSize: 10 },
  memberYear: { color: Colors.text.muted, fontSize: 11, marginLeft: 8 },

  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { color: Colors.text.muted, fontSize: 12 },

  // Project card
  projectCard: { width: SCREEN_WIDTH * 0.78, marginRight: 12, borderRadius: CARD_RADIUS, overflow: 'hidden' },
  projectGradient: { padding: 16, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: '#ffffff12' },
  projectHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  projectStatusText: { color: '#000', fontSize: 10, fontWeight: '900' },
  projectContrib: { color: Colors.text.muted, fontSize: 11 },
  projectTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '800', marginTop: 10 },
  projectDesc: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginTop: 6 },
  projectTechRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  projectTechPill: {
    backgroundColor: '#ffffff12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  projectTechText: { color: Colors.text.primary, fontSize: 10, fontWeight: '600' },
  projectTechMore: { color: Colors.text.muted, fontSize: 10, alignSelf: 'center' },
  projectImpact: { color: Colors.text.secondary, fontSize: 11, marginTop: 10 },
  projectImpactLabel: { color: Colors.accent.softGold, fontWeight: '700' },

  // Event row
  eventRow: {
    backgroundColor: '#0B1118',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    marginBottom: 8,
    flexDirection: 'row',
  },
  eventRowTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  eventRowDate: { color: Colors.accent.softGold, fontSize: 11, marginTop: 4, fontWeight: '700' },
  eventRowRecap: { color: Colors.text.secondary, fontSize: 12, marginTop: 4, lineHeight: 17 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000DD', justifyContent: 'center', padding: 20 },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#0A0F14',
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalHero: { padding: 20 },
  modalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalHeroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalAvatar: {
    width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center',
  },
  modalAvatarText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  modalClose: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16 },
  modalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
  modalName: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 14 },
  modalRole: { color: Colors.accent.softGold, fontSize: 13, fontWeight: '700', marginTop: 4 },
  modalDept: { color: '#ffffffCC', fontSize: 12, marginTop: 2 },

  modalScrollContent: { padding: 18 },
  modalBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20 },
  modalSectionTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 16 },
  modalSkillsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  modalSkillPill: {
    backgroundColor: Colors.tech.neonBlue + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  modalSkillText: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700' },
  modalContactLine: { color: Colors.text.secondary, fontSize: 12, marginTop: 6 },

  modalActionRow: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
  },
  modalAction: { flex: 1, padding: 12, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  modalActionText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Apply
  applyEyebrow: { color: '#ffffffAA', letterSpacing: 2, fontWeight: '800', fontSize: 11 },
  applyInput: {
    backgroundColor: '#ffffff14',
    borderWidth: 1,
    borderColor: '#ffffff24',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text.primary,
    marginTop: 8,
  },
  applyCharCount: { color: Colors.text.muted, fontSize: 11, marginTop: 6, textAlign: 'right' },
  applySuccess: { alignItems: 'center', padding: 30 },
  applySuccessEmoji: { fontSize: 36 },
  applySuccessText: { color: Colors.text.primary, fontSize: 16, fontWeight: '800', marginTop: 10 },
  applySuccessSub: { color: Colors.text.muted, fontSize: 12, marginTop: 6, textAlign: 'center' },
});

export default TaruWingsScreen;
