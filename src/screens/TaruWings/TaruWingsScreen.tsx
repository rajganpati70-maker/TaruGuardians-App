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
// Growth paths — per wing beginner → core → lead milestones
// -----------------------------------------------------

interface GrowthStep {
  id: string;
  level: 'beginner' | 'contributor' | 'core' | 'lead';
  title: string;
  body: string;
  skills: string[];
  weeks: number;
}

interface WingGrowthPath {
  wingId: string;
  title: string;
  subtitle: string;
  steps: GrowthStep[];
}

const GROWTH_PATHS: WingGrowthPath[] = [
  {
    wingId: 'content',
    title: 'From first draft to editorial lead',
    subtitle: 'No prior writing credits required. We teach the craft in public.',
    steps: [
      { id: 'c-g1', level: 'beginner', title: 'Open notebook', body: 'Write one 300-word post per week for 4 weeks. Any topic. Anything un-PR-friendly.', skills: ['voice', 'drafts'], weeks: 4 },
      { id: 'c-g2', level: 'contributor', title: 'Edit-in-public', body: 'Pair-edit with a senior every Thursday. Ship one article to the club newsletter.', skills: ['editing', 'newsletter', 'feedback'], weeks: 6 },
      { id: 'c-g3', level: 'core', title: 'Own a beat', body: 'Pick a beat (sustainability, alumni, campus ops). Ship at least 2 pieces a month with research cadence.', skills: ['beat', 'research', 'interviewing'], weeks: 10 },
      { id: 'c-g4', level: 'lead', title: 'Editorial lead', body: 'Run a sub-desk. Mentor 3 new writers. Set quarterly storyboards with the PR wing.', skills: ['mentorship', 'strategy', 'storyboarding'], weeks: 16 },
    ],
  },
  {
    wingId: 'webapp',
    title: 'Zero merge to release owner',
    subtitle: 'You will ship by week 2. We will not let you ship alone.',
    steps: [
      { id: 'w-g1', level: 'beginner', title: 'First PR Friday', body: 'Pair with a maintainer. Ship a tiny UI or docs PR. Green CI is the goal.', skills: ['git', 'reading code', 'PR etiquette'], weeks: 2 },
      { id: 'w-g2', level: 'contributor', title: 'Owned feature', body: 'Scope, estimate, ship, document one small feature end-to-end. Write the post-mortem.', skills: ['scoping', 'testing', 'post-mortems'], weeks: 6 },
      { id: 'w-g3', level: 'core', title: 'Release weeks', body: 'Run a release rotation. Triage 50+ issues. Close at least 20 in a week.', skills: ['triage', 'release mgmt', 'on-call'], weeks: 10 },
      { id: 'w-g4', level: 'lead', title: 'Platform ownership', body: 'Own a sub-system (auth, RN bridge, infra, analytics). Mentor 5 contributors. Roadmap it.', skills: ['architecture', 'mentorship', 'roadmaps'], weeks: 20 },
    ],
  },
  {
    wingId: 'gd',
    title: 'From first poster to visual systems',
    subtitle: 'No fine-arts background needed. Strong opinions, held loosely.',
    steps: [
      { id: 'g-g1', level: 'beginner', title: 'Poster practice', body: 'Redraw 10 existing club posters in 4 weeks. Critique each in 1 paragraph.', skills: ['figma', 'type hierarchy', 'grid'], weeks: 4 },
      { id: 'g-g2', level: 'contributor', title: 'Shipped artefact', body: 'Own 1 end-to-end deliverable — poster, reel cover, newsletter header — per week.', skills: ['brand fit', 'export discipline', 'feedback loops'], weeks: 8 },
      { id: 'g-g3', level: 'core', title: 'Design kit owner', body: 'Curate a template kit. Train 3 juniors on it. Review all wing output in a weekly crit.', skills: ['systems', 'crit', 'mentorship'], weeks: 12 },
      { id: 'g-g4', level: 'lead', title: 'Visual systems lead', body: 'Own the brand library — logo, palette, type, motion. Pair with PR on every external surface.', skills: ['brand', 'motion', 'governance'], weeks: 18 },
    ],
  },
  {
    wingId: 'video',
    title: 'Shoot → story → schedule',
    subtitle: 'Phone-first is welcome. We promote taste over gear.',
    steps: [
      { id: 'v-g1', level: 'beginner', title: 'Story of 60 sec', body: 'Produce one 60-second vertical piece every fortnight. Pair with a writer.', skills: ['storyboard', 'cut', 'music licence'], weeks: 4 },
      { id: 'v-g2', level: 'contributor', title: 'Event recap owner', body: 'Take full recap responsibility of 2 events — shoot, cut, caption, ship within 48 hrs.', skills: ['deadline shipping', 'colour', 'sound mix'], weeks: 8 },
      { id: 'v-g3', level: 'core', title: 'Series producer', body: 'Run a recurring series (monthly alumni, weekly field, etc.) with calendar and stats.', skills: ['series pipeline', 'analytics', 'calendar'], weeks: 12 },
      { id: 'v-g4', level: 'lead', title: 'Video wing lead', body: 'Plan the year, budget the gear, rotate the roles, protect the editors from burnout.', skills: ['planning', 'budgeting', 'wellbeing'], weeks: 20 },
    ],
  },
  {
    wingId: 'photo',
    title: 'From phone photographer to archive steward',
    subtitle: 'Kit agnostic. Eye first. Archive discipline next.',
    steps: [
      { id: 'p-g1', level: 'beginner', title: 'Walk and shoot', body: 'Attend 2 photo walks. Submit 20 frames with captions. 5 go to the club feed.', skills: ['composition', 'caption', 'light'], weeks: 3 },
      { id: 'p-g2', level: 'contributor', title: 'Event archive', body: 'Cover 2 events. Turn in tagged, ready-to-use archive within 72 hours of shooting.', skills: ['metadata', 'colour', 'archive'], weeks: 6 },
      { id: 'p-g3', level: 'core', title: 'Beat photographer', body: 'Own a beat (sustainability field, portraits, night). Publish 1 mini-story a month.', skills: ['beat', 'story', 'relationships'], weeks: 12 },
      { id: 'p-g4', level: 'lead', title: 'Archive & photo lead', body: 'Curate the 4-year archive. Publish an annual zine. Train 4 new beat shooters.', skills: ['archive ops', 'zines', 'mentorship'], weeks: 20 },
    ],
  },
  {
    wingId: 'pr',
    title: 'Outreach that doesn\'t burn bridges',
    subtitle: 'We run PR slow, human, and on the record.',
    steps: [
      { id: 'pr-g1', level: 'beginner', title: 'Inbox triage', body: 'Learn the tone guide. Reply to 20 emails under senior review. No cold decks.', skills: ['tone', 'CRM', 'empathy'], weeks: 3 },
      { id: 'pr-g2', level: 'contributor', title: 'Event lead', body: 'Take full ownership of one small event — partners, comms, run-of-show, post-mortem.', skills: ['event ops', 'partners', 'run-of-show'], weeks: 6 },
      { id: 'pr-g3', level: 'core', title: 'Sponsorship cohort', body: 'Run a quarterly sponsor cohort — at-cost, honest, re-inviteable.', skills: ['sponsorship', 'budgets', 'honesty'], weeks: 12 },
      { id: 'pr-g4', level: 'lead', title: 'Wing lead', body: 'Own alumni pipeline, press list, chapter ops, and the 3-year narrative.', skills: ['narrative', 'pipelines', 'trust'], weeks: 24 },
    ],
  },
];

// -----------------------------------------------------
// Awards (per wing)
// -----------------------------------------------------

interface WingAward {
  id: string;
  wingId: string;
  year: string;
  title: string;
  body: string;
  emoji: string;
  color: string;
}

const WING_AWARDS: WingAward[] = [
  { id: 'wa-1', wingId: 'content', year: '2025', title: 'Campus long-form of the year', body: 'Sapling-story piece · 11k organic reads · republished by The Canopy Press.', emoji: '🏆', color: '#F59E0B' },
  { id: 'wa-2', wingId: 'content', year: '2024', title: 'Newsletter of the year', body: 'Open rate 52%. Reply rate 14%. No sponsored content, ever.', emoji: '📨', color: '#FDBA74' },
  { id: 'wa-3', wingId: 'content', year: '2023', title: 'Handbook impact prize', body: '38-page onboarding handbook adopted by 4 partner clubs.', emoji: '📖', color: '#FCD34D' },

  { id: 'wa-4', wingId: 'webapp', year: '2025', title: 'Tool of the year', body: 'Sapling health classifier · used by 14 volunteer teams.', emoji: '🤖', color: '#00D4FF' },
  { id: 'wa-5', wingId: 'webapp', year: '2024', title: 'Open-source award', body: '12 repositories · 480 stars cumulative · 120 PRs by students.', emoji: '⭐', color: '#38BDF8' },
  { id: 'wa-6', wingId: 'webapp', year: '2023', title: 'Best release discipline', body: 'Shipped weekly without a rollback for 27 consecutive weeks.', emoji: '🚀', color: '#6366F1' },

  { id: 'wa-7', wingId: 'gd', year: '2025', title: 'Visual identity of the year', body: 'Unified brand kit — logo, type, motion, export presets.', emoji: '🎨', color: '#A78BFA' },
  { id: 'wa-8', wingId: 'gd', year: '2024', title: 'Best poster series', body: 'Earth Day x 30 — 30 posters in 30 days, co-authored by 12 designers.', emoji: '🖼️', color: '#C084FC' },

  { id: 'wa-9', wingId: 'video', year: '2025', title: 'Annual recap prize', body: 'The 6-minute annual recap anchored the mid-year fundraiser.', emoji: '🎬', color: '#F472B6' },
  { id: 'wa-10', wingId: 'video', year: '2024', title: 'Most-watched reel series', body: '30 stories in 30 days · 1.2M aggregate reach.', emoji: '🎞️', color: '#EC4899' },

  { id: 'wa-11', wingId: 'photo', year: '2025', title: 'Archive steward prize', body: '4 years of unlabelled photos → fully tagged, searchable library.', emoji: '🗂️', color: '#FB7185' },
  { id: 'wa-12', wingId: 'photo', year: '2024', title: 'Photo walk impact', body: '9 photo walks · 4 campuses · 3 alumni hubs.', emoji: '🚶', color: '#F87171' },

  { id: 'wa-13', wingId: 'pr', year: '2025', title: 'Chapter expansion award', body: '3 new city chapters — Bengaluru, Hyderabad, Pune.', emoji: '🏙️', color: '#FBBF24' },
  { id: 'wa-14', wingId: 'pr', year: '2024', title: 'Sponsor cohort award', body: '12 sponsors, 0 conflicts. All reinvited in 2025.', emoji: '🤝', color: '#F59E0B' },
];

// -----------------------------------------------------
// Wing journal (weekly notes)
// -----------------------------------------------------

interface JournalEntry {
  id: string;
  wingId: string;
  weekOf: string;
  title: string;
  body: string;
  wins: string[];
  learnings: string[];
  author: string;
}

const WING_JOURNAL: JournalEntry[] = [
  {
    id: 'jn-1',
    wingId: 'content',
    weekOf: 'Apr 15, 2026',
    title: 'Long-form sapling piece landed',
    body: 'We took three drafts to get there. The second draft was the honest one — but the third let the honesty breathe. 11k reads in ten days, two republications, no weird comments.',
    wins: ['11k organic reads', 'Republished by Canopy Press', '2 interview requests'],
    learnings: ['Draft 2 was honest but rough. Edit 3 kept the honesty, added room to breathe.'],
    author: 'Ananya P.',
  },
  {
    id: 'jn-2',
    wingId: 'webapp',
    weekOf: 'Apr 15, 2026',
    title: 'RN crash on Android 11 fixed',
    body: 'A permissions race in the RSVP flow. Repro on a real Moto G30. 4 first-time contributors paired in to help triage.',
    wins: ['Crash rate down 92% in 24 hours', '4 first-time contributors shipped a fix'],
    learnings: ['Stop assuming emulator behaviour matches real low-end devices.'],
    author: 'Vivaan S.',
  },
  {
    id: 'jn-3',
    wingId: 'gd',
    weekOf: 'Apr 15, 2026',
    title: 'Poster kit sign-off',
    body: 'We shipped the first public poster kit — 12 templates, 3 grids, editable in Figma and Canva. The crit session was gentler than usual. Progress.',
    wins: ['12 templates shipped', 'Zero duplicated jobs this week'],
    learnings: ['Kinder crits produced better posters, not worse.'],
    author: 'Ishita K.',
  },
  {
    id: 'jn-4',
    wingId: 'video',
    weekOf: 'Apr 15, 2026',
    title: 'Reel #24 went viral',
    body: 'Short, grainy, real. No wide angles. Filmed on a OnePlus. 420k views in three days. The club spent the week reminding itself why we don\'t chase virality.',
    wins: ['420k views on Reel #24', '+38 subscribers'],
    learnings: ['Grain wins over gloss when the story is real.'],
    author: 'Aryan D.',
  },
  {
    id: 'jn-5',
    wingId: 'photo',
    weekOf: 'Apr 15, 2026',
    title: 'Cubbon Park sunrise walk',
    body: '35 walkers. Zero flash. Many pauses. We left the bird feeders alone and mostly photographed light on bark.',
    wins: ['35 walkers, most new', '200 photos added to archive', '6 new taggers'],
    learnings: ['Slower walks → better frames.'],
    author: 'Mira J.',
  },
  {
    id: 'jn-6',
    wingId: 'pr',
    weekOf: 'Apr 15, 2026',
    title: 'Sponsor roundtable — at-cost model',
    body: 'We pitched the at-cost sponsor model to six partners over tea. Four opted in. Two opted out — politely, and we kept the bridges.',
    wins: ['4 sponsors confirmed', 'All 6 agreed to stay in touch'],
    learnings: ['Slower outreach keeps more doors open than aggressive decks.'],
    author: 'Dhruv N.',
  },
  {
    id: 'jn-7',
    wingId: 'content',
    weekOf: 'Apr 8, 2026',
    title: 'Handbook v4 shipped',
    body: 'The handbook got a refresh — onboarding page rewritten in plain prose, mentor rota added, email templates inlined for quick copy-paste.',
    wins: ['PDF + on-site version in parity', '11 clubs downloaded v4'],
    learnings: ['Plain prose outperformed bullet lists for first-week members.'],
    author: 'Nivedita R.',
  },
  {
    id: 'jn-8',
    wingId: 'webapp',
    weekOf: 'Apr 8, 2026',
    title: 'Release week triage rotation',
    body: '60 issues triaged in a single week. The rotation kept nobody on-call more than 6 hours.',
    wins: ['22 issues closed', 'Median triage age dropped 3.4 days'],
    learnings: ['Pairing juniors with a maintainer doubled throughput without burning anyone out.'],
    author: 'Rohit B.',
  },
];

// -----------------------------------------------------
// Ship log (recent shipments across all wings)
// -----------------------------------------------------

interface ShipLogItem {
  id: string;
  wingId: string;
  date: string;
  title: string;
  kind: 'article' | 'release' | 'poster' | 'reel' | 'shoot' | 'campaign';
  reach: string;
  emoji: string;
}

const SHIP_LOG: ShipLogItem[] = [
  { id: 'sl-1',  wingId: 'content',  date: 'Apr 18', title: 'Long-form · sapling survival audit',        kind: 'article',   reach: '11.2k reads · 42 shares',       emoji: '✍️' },
  { id: 'sl-2',  wingId: 'webapp',   date: 'Apr 18', title: 'App v1.3.1 · bug-fix release',              kind: 'release',   reach: '3.4k installs · 0 rollbacks',   emoji: '🚀' },
  { id: 'sl-3',  wingId: 'gd',       date: 'Apr 17', title: 'Earth Day poster kit · 12 templates',       kind: 'poster',    reach: '218 downloads · 9 campuses',    emoji: '🎨' },
  { id: 'sl-4',  wingId: 'video',    date: 'Apr 17', title: 'Alumni fireside · reel #44',                kind: 'reel',      reach: '44k views · 3.2k saves',         emoji: '🎬' },
  { id: 'sl-5',  wingId: 'photo',    date: 'Apr 16', title: 'Cubbon Park photo walk · 37 frames',        kind: 'shoot',     reach: '6.8k impressions · 410 likes',   emoji: '📷' },
  { id: 'sl-6',  wingId: 'pr',       date: 'Apr 16', title: 'Earth Day sponsor outreach · 12 calls',     kind: 'campaign',  reach: '5 leads · 2 signed',             emoji: '🤝' },
  { id: 'sl-7',  wingId: 'content',  date: 'Apr 14', title: 'Short · five rooftop farms worth visiting',  kind: 'article',   reach: '6.1k reads · 28 shares',         emoji: '✍️' },
  { id: 'sl-8',  wingId: 'webapp',   date: 'Apr 12', title: 'App v1.3.0 · onboarding revamp',            kind: 'release',   reach: '2.8k installs · crash-free 99.4%', emoji: '🚀' },
  { id: 'sl-9',  wingId: 'gd',       date: 'Apr 11', title: 'Repair café flyer · Kannada + English',      kind: 'poster',    reach: '420 scans · 68 attendees',       emoji: '🎨' },
  { id: 'sl-10', wingId: 'video',    date: 'Apr 10', title: 'Sapling drive · cold-open montage',          kind: 'reel',      reach: '22k views · 1.4k saves',          emoji: '🎬' },
  { id: 'sl-11', wingId: 'photo',    date: 'Apr 09', title: 'Workshop portraits · 14 members',             kind: 'shoot',     reach: '4.2k impressions · 260 likes',   emoji: '📷' },
  { id: 'sl-12', wingId: 'pr',       date: 'Apr 08', title: 'Press mention · local daily',                kind: 'campaign',  reach: '1 print + 1 digital feature',    emoji: '🤝' },
];

// -----------------------------------------------------
// Mentorship circles (per-wing peer groups)
// -----------------------------------------------------

interface MentorshipCircle {
  id: string;
  wingId: string;
  name: string;
  day: string;
  time: string;
  host: string;
  members: number;
  cadence: string;
  topic: string;
  color: string;
}

const MENTORSHIP_CIRCLES: MentorshipCircle[] = [
  { id: 'mc-1',  wingId: 'content',  name: 'Draft Club',         day: 'Tue', time: '18:00', host: 'Ananya P.',     members: 14, cadence: 'Weekly',   topic: 'Read each other\'s drafts · gentle edits only', color: '#4CAF50' },
  { id: 'mc-2',  wingId: 'content',  name: 'Voice Lab',          day: 'Fri', time: '17:30', host: 'Nivedita S.',   members: 9,  cadence: 'Bi-weekly', topic: 'Find your voice · 5-min read-alouds',           color: '#66BB6A' },
  { id: 'mc-3',  wingId: 'webapp',   name: 'Pair Up',            day: 'Mon', time: '19:00', host: 'Rohit B.',      members: 18, cadence: 'Weekly',   topic: 'Ship a tiny commit together · any stack',       color: '#00D4FF' },
  { id: 'mc-4',  wingId: 'webapp',   name: 'Architecture Tea',   day: 'Thu', time: '18:30', host: 'Meera I.',      members: 11, cadence: 'Monthly',  topic: 'One diagram · one decision · one 10-min chat',  color: '#29B6F6' },
  { id: 'mc-5',  wingId: 'gd',       name: 'Crit Kindly',        day: 'Wed', time: '18:00', host: 'Ishita D.',     members: 16, cadence: 'Weekly',   topic: 'Bring a draft · leave with 3 suggestions',      color: '#F472B6' },
  { id: 'mc-6',  wingId: 'gd',       name: 'Type Tuesday',       day: 'Tue', time: '17:00', host: 'Kabir M.',      members: 8,  cadence: 'Bi-weekly', topic: 'Type pairings · poster typography',             color: '#AB47BC' },
  { id: 'mc-7',  wingId: 'video',    name: 'Cut Together',       day: 'Fri', time: '18:00', host: 'Aryan V.',      members: 12, cadence: 'Weekly',   topic: 'Edit a 60-sec reel · together · ship it',       color: '#FFD54F' },
  { id: 'mc-8',  wingId: 'photo',    name: 'Photo Walk',         day: 'Sun', time: '07:00', host: 'Mira J.',       members: 17, cadence: 'Weekly',   topic: 'Early light · 2-hr walk · 30-frame debrief',    color: '#AB47BC' },
  { id: 'mc-9',  wingId: 'pr',       name: 'Outreach Office',    day: 'Mon', time: '17:30', host: 'Kavya R.',      members: 10, cadence: 'Weekly',   topic: 'Practise cold calls · template swap',           color: '#EF6C00' },
  { id: 'mc-10', wingId: 'pr',       name: 'Speak-up Circle',    day: 'Thu', time: '18:00', host: 'Dhruv G.',      members: 9,  cadence: 'Bi-weekly', topic: 'Practise 3-min pitches · get kind feedback',    color: '#FFB74D' },
];

// -----------------------------------------------------
// Learning library (curated resources per wing)
// -----------------------------------------------------

interface LearningItem {
  id: string;
  wingId: string;
  title: string;
  kind: 'read' | 'watch' | 'exercise' | 'course' | 'talk';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  curator: string;
  why: string;
}

const LEARNING_ITEMS: LearningItem[] = [
  { id: 'lr-1',  wingId: 'content', title: 'The arc of a reported piece',        kind: 'read',     duration: '14 min', level: 'beginner',     curator: 'Ananya P.', why: 'Shortest useful piece on the shape of a story.' },
  { id: 'lr-2',  wingId: 'content', title: 'Writing for warm tone',              kind: 'exercise', duration: '30 min', level: 'beginner',     curator: 'Nivedita S.', why: '5 prompts · no wrong answers · ship a draft.' },
  { id: 'lr-3',  wingId: 'content', title: 'Interview craft · long-form',         kind: 'talk',     duration: '45 min', level: 'intermediate', curator: 'Club archive', why: 'Alumni deep-dive recorded in 2024.' },
  { id: 'lr-4',  wingId: 'webapp',  title: 'React Native · the parts that stick', kind: 'read',     duration: '22 min', level: 'beginner',     curator: 'Rohit B.',  why: 'What matters in year-one · what to skip.' },
  { id: 'lr-5',  wingId: 'webapp',  title: 'Ship Fridays · case study',            kind: 'talk',     duration: '30 min', level: 'intermediate', curator: 'Meera I.',  why: 'How we went from panic releases to calm ones.' },
  { id: 'lr-6',  wingId: 'webapp',  title: 'Android 11 debugging · hands-on',      kind: 'course',   duration: '2 hrs',  level: 'advanced',     curator: 'Vivaan S.', why: 'Real low-end device traces. No emulator shortcuts.' },
  { id: 'lr-7',  wingId: 'gd',      title: 'Typography kindness · 20 rules',       kind: 'read',     duration: '18 min', level: 'beginner',     curator: 'Ishita D.', why: 'The rules we actually follow in the club.' },
  { id: 'lr-8',  wingId: 'gd',      title: 'Poster grid workout',                  kind: 'exercise', duration: '45 min', level: 'intermediate', curator: 'Kabir M.',  why: 'Build 3 posters from one grid. No design ego.' },
  { id: 'lr-9',  wingId: 'video',   title: 'Pacing a 60-sec reel',                 kind: 'watch',    duration: '10 min', level: 'beginner',     curator: 'Aryan V.',  why: 'How to know when to cut · when to breathe.' },
  { id: 'lr-10', wingId: 'video',   title: 'Sound first · picture second',         kind: 'talk',     duration: '28 min', level: 'intermediate', curator: 'Alumni guest', why: 'The single best switch you can make this year.' },
  { id: 'lr-11', wingId: 'photo',   title: 'Available light · for field work',     kind: 'read',     duration: '16 min', level: 'beginner',     curator: 'Mira J.',   why: 'No flash, no problem. Natural-light playbook.' },
  { id: 'lr-12', wingId: 'photo',   title: 'Consent-led portraits',                kind: 'talk',     duration: '24 min', level: 'intermediate', curator: 'Mira J.',   why: 'How we ask permission · why it matters.' },
  { id: 'lr-13', wingId: 'pr',      title: 'Warm cold-call template',              kind: 'read',     duration: '9 min',  level: 'beginner',     curator: 'Kavya R.',  why: 'Replace awkward outreach with honest openers.' },
  { id: 'lr-14', wingId: 'pr',      title: 'One-pager that reads itself',          kind: 'exercise', duration: '35 min', level: 'intermediate', curator: 'Dhruv G.',  why: 'Build a sponsor one-pager from our template.' },
  { id: 'lr-15', wingId: 'pr',      title: 'Handling a press mention',             kind: 'talk',     duration: '20 min', level: 'advanced',     curator: 'Club archive', why: 'What to do in the 48 hours after a journalist calls.' },
];

// -----------------------------------------------------
// Wing rituals (weekly/monthly constants per wing)
// -----------------------------------------------------

interface WingRitual {
  id: string;
  wingId: string;
  ritual: string;
  when: string;
  why: string;
  emoji: string;
}

const WING_RITUALS: WingRitual[] = [
  { id: 'wr-1',  wingId: 'content', ritual: 'Monday draft swap',          when: 'Mon · 18:00', why: 'Drop your latest · leave with 3 reader notes.',       emoji: '📝' },
  { id: 'wr-2',  wingId: 'content', ritual: 'Friday read-aloud',          when: 'Fri · 17:30', why: 'Read your closing line aloud. The room votes.',       emoji: '🔊' },
  { id: 'wr-3',  wingId: 'webapp',  ritual: 'Release Friday',              when: 'Fri · 16:00', why: 'Ship the app · one captain · rollback plan ready.',   emoji: '🚀' },
  { id: 'wr-4',  wingId: 'webapp',  ritual: 'Pair-up Monday',              when: 'Mon · 19:00', why: 'Pair 45 min · ship a tiny commit · write the PR.',    emoji: '🤝' },
  { id: 'wr-5',  wingId: 'gd',      ritual: 'Kind crit Wednesday',         when: 'Wed · 18:00', why: 'Bring a draft · leave with 3 warm suggestions.',      emoji: '🎨' },
  { id: 'wr-6',  wingId: 'gd',      ritual: 'Poster Friday',               when: 'Fri · 17:00', why: 'Ship one poster · any purpose · real constraints.',   emoji: '🖼️' },
  { id: 'wr-7',  wingId: 'video',   ritual: 'Cut-together Friday',          when: 'Fri · 18:00', why: 'Edit a 60-sec reel in one room · finish together.',   emoji: '🎬' },
  { id: 'wr-8',  wingId: 'video',   ritual: 'Monthly reel awards',          when: 'Last Sat',    why: 'Peer-voted best reel · travelling trophy · hugs.',     emoji: '🏆' },
  { id: 'wr-9',  wingId: 'photo',   ritual: 'Sunday walk',                  when: 'Sun · 07:00', why: 'Early light · 2-hour walk · 30-frame debrief.',       emoji: '🚶' },
  { id: 'wr-10', wingId: 'photo',   ritual: 'Monthly print-and-pin',        when: 'Last Fri',    why: 'Print one frame. Pin it in the clubroom. Trust it.',  emoji: '📌' },
  { id: 'wr-11', wingId: 'pr',      ritual: 'Outreach office hours',        when: 'Mon · 17:30', why: 'Practise cold calls · swap templates · debrief.',     emoji: '☎️' },
  { id: 'wr-12', wingId: 'pr',      ritual: 'Quarterly press review',       when: 'Last Thu',    why: 'Count the warm mentions · name the quiet wins.',      emoji: '📰' },
];

// -----------------------------------------------------
// Phase 3p: deeper per-wing data
// -----------------------------------------------------

interface WingPlaybookStep {
  id: string;
  wingId: string;
  stage: string;
  title: string;
  detail: string;
  output: string;
  emoji: string;
  color: string;
}

const WING_PLAYBOOK: WingPlaybookStep[] = [
  { id: 'pb-c-1', wingId: 'content', stage: '1 · brief', title: 'Ten-minute brief', detail: 'One sentence purpose, one sentence audience, one sentence success.', output: 'brief.md in the draft repo', emoji: '🧭', color: '#F59E0B' },
  { id: 'pb-c-2', wingId: 'content', stage: '2 · outline', title: 'Outline before prose', detail: 'Headlines first · then one bullet per paragraph · read aloud.', output: 'outline in the shared doc', emoji: '🗂️', color: '#F59E0B' },
  { id: 'pb-c-3', wingId: 'content', stage: '3 · draft', title: 'Short first draft', detail: 'Aim for 80 % of the final length · leave gaps for quotes.', output: 'draft v1 with TK markers', emoji: '✍️', color: '#F59E0B' },
  { id: 'pb-c-4', wingId: 'content', stage: '4 · review', title: 'Editor pass + one reader', detail: 'Editor cuts · a non-expert reader flags any confusion.', output: 'comments on the draft', emoji: '🪞', color: '#F59E0B' },
  { id: 'pb-c-5', wingId: 'content', stage: '5 · ship', title: 'Publish + archive', detail: 'Post · cross-link in weekly digest · archive source in repo.', output: 'published + archived', emoji: '🚀', color: '#F59E0B' },
  { id: 'pb-w-1', wingId: 'web', stage: '1 · spec', title: 'Spec before code', detail: 'One-page spec · user · screens · edge cases · success metric.', output: 'spec.md + rough figma', emoji: '📝', color: '#00D4FF' },
  { id: 'pb-w-2', wingId: 'web', stage: '2 · scaffold', title: 'Scaffold with the real routes', detail: 'Real navigation, real empty states, dummy data. No Lorem Ipsum.', output: 'compiles · runs · empty', emoji: '🧱', color: '#00D4FF' },
  { id: 'pb-w-3', wingId: 'web', stage: '3 · wire', title: 'Wire real data', detail: 'Fetchers or mocks · loading + error states · accessible labels.', output: 'feature works · logs clean', emoji: '🔌', color: '#00D4FF' },
  { id: 'pb-w-4', wingId: 'web', stage: '4 · polish', title: 'Polish pass', detail: 'Spacing · typography · dark-mode check · a11y sweep.', output: 'screenshots for review', emoji: '✨', color: '#00D4FF' },
  { id: 'pb-w-5', wingId: 'web', stage: '5 · ship', title: 'Ship behind a flag', detail: 'Release notes · changelog entry · internal flag · soft rollout.', output: 'live · tracked · reversible', emoji: '🛳️', color: '#00D4FF' },
  { id: 'pb-g-1', wingId: 'gd', stage: '1 · moodboard', title: 'Five references', detail: 'Three to steal from · two to avoid · shared in the wing channel.', output: 'moodboard link', emoji: '🖼️', color: '#F472B6' },
  { id: 'pb-g-2', wingId: 'gd', stage: '2 · sketch', title: 'Sketch on paper first', detail: 'Hand-draw three directions before opening Figma.', output: 'photo of sketches', emoji: '✏️', color: '#F472B6' },
  { id: 'pb-g-3', wingId: 'gd', stage: '3 · build', title: 'Build in the system', detail: 'Use tokens · reuse components · no one-off styles.', output: 'tokens + artboards', emoji: '🎨', color: '#F472B6' },
  { id: 'pb-g-4', wingId: 'gd', stage: '4 · crit', title: 'Open crit', detail: '45 min · kind + sharp · one decision per piece.', output: 'revision checklist', emoji: '🪞', color: '#F472B6' },
  { id: 'pb-g-5', wingId: 'gd', stage: '5 · export', title: 'Export ladder', detail: 'Web · social · print · source file archived with licences.', output: 'exports · archived', emoji: '📦', color: '#F472B6' },
  { id: 'pb-v-1', wingId: 'video', stage: '1 · story', title: 'Three-beat story', detail: 'Hook · climb · land · written on one card.', output: 'story card', emoji: '🎞️', color: '#FFB74D' },
  { id: 'pb-v-2', wingId: 'video', stage: '2 · assembly', title: 'Rough assembly', detail: 'Selects only · full-length clips · no music yet.', output: 'assembly v1', emoji: '✂️', color: '#FFB74D' },
  { id: 'pb-v-3', wingId: 'video', stage: '3 · cut', title: 'Pace + sound design', detail: 'Cut to the breath · two-track mix · subtitles drafted.', output: 'cut v2', emoji: '🎧', color: '#FFB74D' },
  { id: 'pb-v-4', wingId: 'video', stage: '4 · grade', title: 'Colour grade', detail: 'Match shots · subtle grade · export test on a phone screen.', output: 'grade v1', emoji: '🎨', color: '#FFB74D' },
  { id: 'pb-v-5', wingId: 'video', stage: '5 · caption', title: 'Captions + credits', detail: 'Burn-in captions · credits · delivery ladders per platform.', output: 'final masters', emoji: '🏁', color: '#FFB74D' },
  { id: 'pb-p-1', wingId: 'photo', stage: '1 · prep', title: 'Shot list before the event', detail: 'Twelve must-haves · five wild-cards · light test frames.', output: 'shot list pinned', emoji: '📋', color: '#7E57C2' },
  { id: 'pb-p-2', wingId: 'photo', stage: '2 · shoot', title: 'Ingest at end of day', detail: 'Back-up to two drives · rate 3★+ · cull the rest.', output: 'culled set', emoji: '📷', color: '#7E57C2' },
  { id: 'pb-p-3', wingId: 'photo', stage: '3 · edit', title: 'Lightroom pass', detail: 'Global grade · hero frames polished · consistent ladder.', output: 'graded set', emoji: '💡', color: '#7E57C2' },
  { id: 'pb-p-4', wingId: 'photo', stage: '4 · caption', title: 'Caption + credit', detail: 'Who, what, when · credit the subject · licences checked.', output: 'captioned exports', emoji: '📝', color: '#7E57C2' },
  { id: 'pb-p-5', wingId: 'photo', stage: '5 · archive', title: 'Archive the set', detail: 'Folder per event · RAW separately · shared drive linked.', output: 'archived set', emoji: '🗃️', color: '#7E57C2' },
  { id: 'pb-r-1', wingId: 'pr', stage: '1 · angle', title: 'Find the angle', detail: 'Not the news · the story under it · written in one line.', output: 'angle card', emoji: '🧭', color: '#38BDF8' },
  { id: 'pb-r-2', wingId: 'pr', stage: '2 · list', title: 'Journalist list of 12', detail: 'Real beats · recent bylines · one-line personal note.', output: 'list.md in repo', emoji: '📇', color: '#38BDF8' },
  { id: 'pb-r-3', wingId: 'pr', stage: '3 · pitch', title: 'Short pitch', detail: '120 words · subject line is the news · offer quotes + visuals.', output: 'pitch.eml draft', emoji: '✉️', color: '#38BDF8' },
  { id: 'pb-r-4', wingId: 'pr', stage: '4 · follow', title: 'Follow-up with care', detail: 'Once · after three days · add one fresh fact.', output: 'follow-ups tracked', emoji: '🔁', color: '#38BDF8' },
  { id: 'pb-r-5', wingId: 'pr', stage: '5 · archive', title: 'Archive the win (or no)', detail: 'Clip the piece · thank the journalist · no bragging in channel.', output: 'archive entry', emoji: '🗄️', color: '#38BDF8' },
];

interface StudioGear {
  id: string;
  wingId: string;
  name: string;
  role: string;
  available: boolean;
  owner: string;
  note: string;
  emoji: string;
  color: string;
}

const STUDIO_GEAR: StudioGear[] = [
  { id: 'sg-1', wingId: 'video', name: 'Sony A7 IV · body', role: 'Primary camera · interviews + b-roll', available: true, owner: 'club-owned', note: 'Comes with two batteries · SD-card is personal responsibility.', emoji: '📸', color: '#FFB74D' },
  { id: 'sg-2', wingId: 'video', name: 'Sigma 24-70 f/2.8', role: 'Workhorse lens', available: true, owner: 'club-owned', note: 'Check for dust before and after every shoot.', emoji: '🔭', color: '#FFB74D' },
  { id: 'sg-3', wingId: 'video', name: 'Rode Wireless GO II', role: 'Lavalier set · two transmitters', available: false, owner: 'on loan till Apr 21', note: 'Track in the loans sheet · rechargers stay in the studio.', emoji: '🎤', color: '#FFB74D' },
  { id: 'sg-4', wingId: 'video', name: 'DJI RS 3 Mini', role: 'Gimbal for handheld moves', available: true, owner: 'club-owned', note: 'Calibrate at the start of every shoot day · weekly review.', emoji: '🎥', color: '#FFB74D' },
  { id: 'sg-5', wingId: 'photo', name: 'Fujifilm X-T5', role: 'Primary photo body', available: true, owner: 'club-owned', note: 'Lens kit in the cream bag · grip strap stays with the camera.', emoji: '📷', color: '#7E57C2' },
  { id: 'sg-6', wingId: 'photo', name: 'Godox AD200 Pro × 2', role: 'Portable strobes', available: true, owner: 'club-owned', note: 'Always test-fire at base before leaving campus.', emoji: '💡', color: '#7E57C2' },
  { id: 'sg-7', wingId: 'photo', name: 'Peak Design tripod', role: 'Low-light + group shots', available: true, owner: 'club-owned', note: 'Extend one leg first to balance · bubble level on the head.', emoji: '🦿', color: '#7E57C2' },
  { id: 'sg-8', wingId: 'gd', name: 'Wacom One pen display', role: 'Digital sketch + illustration', available: true, owner: 'club-owned', note: 'USB-C cable lives in the side drawer · label it before use.', emoji: '🖌️', color: '#F472B6' },
  { id: 'sg-9', wingId: 'gd', name: 'Epson printer · A3+', role: 'Poster + zine proofs', available: true, owner: 'club-owned', note: 'Use the draft setting first · colour-managed profile is pinned.', emoji: '🖨️', color: '#F472B6' },
  { id: 'sg-10', wingId: 'web', name: 'Redmi Note 12 · test device', role: 'Android QA target · low-end', available: true, owner: 'club-owned', note: 'Keep developer options ON · do not add personal accounts.', emoji: '📱', color: '#00D4FF' },
  { id: 'sg-11', wingId: 'web', name: 'iPhone 13 · test device', role: 'iOS QA target', available: true, owner: 'club-owned', note: 'Safari web-inspector enabled · auto-lock set to 15 min.', emoji: '📱', color: '#00D4FF' },
  { id: 'sg-12', wingId: 'web', name: 'USB-C hub · 7-in-1', role: 'Travel hub for demo days', available: true, owner: 'club-owned', note: 'Only keep in bag during events · always back in drawer next day.', emoji: '🔌', color: '#00D4FF' },
  { id: 'sg-13', wingId: 'pr', name: 'Zoom H6 field recorder', role: 'Backup audio · press meets', available: true, owner: 'club-owned', note: 'Format card fresh · check battery bar before leaving.', emoji: '🎙️', color: '#38BDF8' },
  { id: 'sg-14', wingId: 'content', name: 'Moleskine notebooks × 10', role: 'Field notebooks for reporters', available: true, owner: 'club-owned', note: 'Sign one out · return when full · archived in the cabinet.', emoji: '📓', color: '#F59E0B' },
];

interface WingRetroNote {
  id: string;
  wingId: string;
  month: string;
  kept: string[];
  dropped: string[];
  trying: string[];
  mood: 'calm' | 'stretched' | 'humming' | 'tired';
  color: string;
  emoji: string;
}

const WING_RETROS: WingRetroNote[] = [
  { id: 'wr-c', wingId: 'content', month: 'March 2026', kept: ['Weekly explainer on Friday', 'Editor pass before anything goes live', 'Archive source in the draft repo'], dropped: ['Twitter thread auto-generation · read like filler', 'Daily 500-word target · quality slipped'], trying: ['One long essay per month · assigned to one person', 'Guest drafts from alumni every fortnight'], mood: 'humming', color: '#F59E0B', emoji: '✍️' },
  { id: 'wr-w', wingId: 'web', month: 'March 2026', kept: ['Spec before code · kept scope honest', 'PR reviewers rotate so no one gets stuck', 'Ship behind a flag · rolled back twice, saved us'], dropped: ['Skipping a11y sweep to ship faster', 'Long Slack threads instead of a tiny meeting'], trying: ['15-min stand-up at noon instead of text updates', 'Paired review on Fridays for 30 min'], mood: 'humming', color: '#00D4FF', emoji: '📱' },
  { id: 'wr-g', wingId: 'gd', month: 'March 2026', kept: ['Sketch before Figma · saved a lot of redo', 'Token library stayed the source of truth', 'Open crit every Friday · attendance stayed high'], dropped: ['Personal style overrides on posters', 'Last-minute font swaps'], trying: ['Shared asset-export checklist', 'Co-owned brand guidelines doc'], mood: 'calm', color: '#F472B6', emoji: '🎨' },
  { id: 'wr-v', wingId: 'video', month: 'March 2026', kept: ['Three-beat story card · every project used it', 'Ingest at end of day · no lost footage', 'Captions burnt-in · reach improved'], dropped: ['Over-ambitious music edits · took too long', 'Solo colour grading · ended up inconsistent'], trying: ['Paired colour passes on bigger cuts', 'Shorter 30-sec recaps as default output'], mood: 'stretched', color: '#FFB74D', emoji: '🎬' },
  { id: 'wr-p', wingId: 'photo', month: 'March 2026', kept: ['Shot list before every event', 'Culled set before going home', 'Captions within 48 h'], dropped: ['Over-editing in Lightroom', 'Posting raw un-credited photos anywhere'], trying: ['One printed frame per month on the wall', 'Buddy-cull system for large sets'], mood: 'humming', color: '#7E57C2', emoji: '📷' },
  { id: 'wr-r', wingId: 'pr', month: 'March 2026', kept: ['Short pitches · 120 words or less', 'One follow-up · three days apart', 'Archived every outcome'], dropped: ['Cold mass-emails with no research', 'Chasing vanity publications'], trying: ['Warm-intro swaps with alumni', 'Quarterly press review instead of monthly'], mood: 'calm', color: '#38BDF8', emoji: '📣' },
];

interface CrossWingCollab {
  id: string;
  title: string;
  wings: string[];
  ask: string;
  benefit: string;
  status: 'live' | 'planned' | 'on-hold';
  lead: string;
  color: string;
  emoji: string;
}

const CROSS_WING_COLLABS: CrossWingCollab[] = [
  { id: 'cc-1', title: 'Drive recap pack', wings: ['video', 'photo', 'content'], ask: 'One event · one reel · eight photos · one 400-word note.', benefit: 'Post within 48 h · never more than a week late.', status: 'live', lead: 'Sneha · Video', color: '#FFB74D', emoji: '🎬' },
  { id: 'cc-2', title: 'App launch sprint', wings: ['web', 'gd', 'pr'], ask: 'Six-week cadence · design tokens · press embargo plan.', benefit: 'Launch without last-night panic · clean hand-off.', status: 'live', lead: 'Anmol · Web', color: '#00D4FF', emoji: '📱' },
  { id: 'cc-3', title: 'Alumni spotlight series', wings: ['content', 'photo', 'pr'], ask: '15-min interview · one portrait · one 600-word profile.', benefit: 'Alumni engagement without guilt · one profile per fortnight.', status: 'live', lead: 'Nikhil · Content', color: '#F59E0B', emoji: '🎓' },
  { id: 'cc-4', title: 'Climate explainer board', wings: ['gd', 'content', 'video'], ask: 'One illustration · one 90-sec video · one 500-word post.', benefit: 'A consistent voice across channels · stays up for a month.', status: 'planned', lead: 'Ritu · GD', color: '#F472B6', emoji: '🌍' },
  { id: 'cc-5', title: 'Hackathon press kit', wings: ['pr', 'gd', 'content', 'web'], ask: 'Landing page · press release · social cards · brief video.', benefit: 'Reduced chaos week of event · media coverage easier.', status: 'planned', lead: 'Maya · PR', color: '#38BDF8', emoji: '📣' },
  { id: 'cc-6', title: 'Sustainability report · 2026', wings: ['content', 'gd', 'web'], ask: 'Data collection · illustration system · static microsite.', benefit: 'Annual public document · cited by partners.', status: 'on-hold', lead: 'Faraz · lead', color: '#22C55E', emoji: '📊' },
];

interface WingDirectoryLink {
  id: string;
  wingId: string;
  name: string;
  urlHint: string;
  trust: 'core' | 'recommended' | 'optional';
  note: string;
  color: string;
  emoji: string;
}

const WING_DIRECTORY: WingDirectoryLink[] = [
  { id: 'dl-c-1', wingId: 'content', name: 'Editorial calendar', urlHint: 'shared / notion · /content/cal', trust: 'core', note: 'All publication dates + owners live here.', color: '#F59E0B', emoji: '🗓️' },
  { id: 'dl-c-2', wingId: 'content', name: 'Style guide · v3', urlHint: 'shared / docs · /content/style-v3', trust: 'core', note: 'Voice · punctuation · British spellings · no exclaimation marks.', color: '#F59E0B', emoji: '📐' },
  { id: 'dl-c-3', wingId: 'content', name: 'Source log', urlHint: 'repo · /content/sources', trust: 'recommended', note: 'Every quote links back to a recording or written consent.', color: '#F59E0B', emoji: '🔗' },
  { id: 'dl-w-1', wingId: 'web', name: 'App repo', urlHint: 'github · /web/app', trust: 'core', note: 'Main branch protected · PRs need two reviewers.', color: '#00D4FF', emoji: '🛠️' },
  { id: 'dl-w-2', wingId: 'web', name: 'Spec board', urlHint: 'shared / notion · /web/specs', trust: 'core', note: 'Every feature has a one-page spec before code starts.', color: '#00D4FF', emoji: '📝' },
  { id: 'dl-w-3', wingId: 'web', name: 'Release log', urlHint: 'repo · /web/releases', trust: 'recommended', note: 'Rollbacks documented · post-mortems linked.', color: '#00D4FF', emoji: '📜' },
  { id: 'dl-g-1', wingId: 'gd', name: 'Brand tokens · v4', urlHint: 'figma · tokens-v4', trust: 'core', note: 'All new work references tokens · no new hex codes in files.', color: '#F472B6', emoji: '🎨' },
  { id: 'dl-g-2', wingId: 'gd', name: 'Asset library', urlHint: 'figma · library/main', trust: 'core', note: 'Master components live here · clone to branch for experiments.', color: '#F472B6', emoji: '🧰' },
  { id: 'dl-g-3', wingId: 'gd', name: 'Export checklist', urlHint: 'shared / docs · /gd/exports', trust: 'recommended', note: 'Web / social / print · naming convention · licence check.', color: '#F472B6', emoji: '📦' },
  { id: 'dl-v-1', wingId: 'video', name: 'Edit project folder', urlHint: 'drive · /video/edits/2026', trust: 'core', note: 'Nothing lives only on a personal laptop.', color: '#FFB74D', emoji: '📁' },
  { id: 'dl-v-2', wingId: 'video', name: 'Music licences', urlHint: 'shared / docs · /video/music', trust: 'core', note: 'Only tracks listed here can be used in public cuts.', color: '#FFB74D', emoji: '🎶' },
  { id: 'dl-p-1', wingId: 'photo', name: 'Event archive', urlHint: 'drive · /photo/events', trust: 'core', note: 'Graded + captioned sets only · RAWs live separately.', color: '#7E57C2', emoji: '🗃️' },
  { id: 'dl-p-2', wingId: 'photo', name: 'Consent register', urlHint: 'shared / docs · /photo/consent', trust: 'core', note: 'Anyone can ask to be removed · we act within 24 h.', color: '#7E57C2', emoji: '🤝' },
  { id: 'dl-r-1', wingId: 'pr', name: 'Journalist list', urlHint: 'repo · /pr/list', trust: 'core', note: 'Updated monthly · personal notes · do-not-pitch flags.', color: '#38BDF8', emoji: '📇' },
  { id: 'dl-r-2', wingId: 'pr', name: 'Press archive', urlHint: 'shared / docs · /pr/archive', trust: 'recommended', note: 'Every mention clipped · embargoes respected.', color: '#38BDF8', emoji: '🗞️' },
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

// =====================================================
// Phase 3u: deeper wing structures
// =====================================================

interface WingOKR {
  id: string;
  wingId: string;
  objective: string;
  kr1: string;
  kr2: string;
  kr3: string;
  progress: number;
  color: string;
  emoji: string;
}

const WING_OKRS: WingOKR[] = [
  { id: 'okr-content-1',  wingId: 'content',  objective: 'Publish a steady, bilingual library',              kr1: 'Ship 12 long-form pieces this term',     kr2: 'Hindi subtitles on every video',        kr3: 'Cut avg piece time from 18d to 12d',   progress: 0.64, color: '#F59E0B', emoji: '📝' },
  { id: 'okr-content-2',  wingId: 'content',  objective: 'Make reading a weekly habit inside the wing',      kr1: 'Run a reading club · 16 weeks',          kr2: 'Two book summaries on the app',          kr3: 'Guest authors · four hosted',           progress: 0.52, color: '#F59E0B', emoji: '📚' },
  { id: 'okr-web-1',      wingId: 'web',      objective: 'Ship the v1.3 app to the Play Store',              kr1: 'Close all P1 bugs',                      kr2: 'Android 9+ supported cleanly',           kr3: 'Crash-free sessions > 99.2%',           progress: 0.74, color: '#00D4FF', emoji: '📱' },
  { id: 'okr-web-2',      wingId: 'web',      objective: 'Make the site measurably accessible',              kr1: 'Lighthouse a11y ≥ 95 on all pages',      kr2: 'Zero contrast issues on the home tab',   kr3: 'Focus-trap fixes on all modals',        progress: 0.58, color: '#00D4FF', emoji: '♿' },
  { id: 'okr-gd-1',       wingId: 'gd',       objective: 'Tighten the visual system',                        kr1: 'Color tokens shipped · 18 tokens',       kr2: 'Type scale agreed · 7 sizes',            kr3: 'Component library in Figma · 40+',      progress: 0.68, color: '#F472B6', emoji: '🎨' },
  { id: 'okr-gd-2',       wingId: 'gd',       objective: 'Faster turnaround · without burnout',              kr1: 'Avg ticket close < 4 days',              kr2: 'No overnight work · tracked weekly',     kr3: 'Two office-hours per week',             progress: 0.44, color: '#F472B6', emoji: '🧘' },
  { id: 'okr-video-1',    wingId: 'video',    objective: 'Build a reel-first short pipeline',                kr1: 'Ship 24 reels this term',                kr2: 'Avg edit time < 90 min',                 kr3: 'Three reels per event · minimum',       progress: 0.71, color: '#A78BFA', emoji: '🎬' },
  { id: 'okr-photo-1',    wingId: 'photo',    objective: 'Tell the year in 100 photographs',                 kr1: 'Shoot 1000 frames · keep 100',           kr2: 'Caption every keeper',                   kr3: 'Gallery night · once a term',           progress: 0.62, color: '#22C55E', emoji: '📸' },
  { id: 'okr-pr-1',       wingId: 'pr',       objective: 'Make new members feel at home in two weeks',       kr1: 'Buddy assigned in < 48h',                kr2: 'Four newcomer dinners this term',        kr3: 'First-month NPS ≥ 60',                  progress: 0.55, color: '#FFD166', emoji: '🤝' },
];

interface DeliverableTemplate {
  id: string;
  wingId: string;
  name: string;
  purpose: string;
  steps: string[];
  ownerRole: string;
  color: string;
  emoji: string;
}

const DELIVERABLE_TEMPLATES: DeliverableTemplate[] = [
  {
    id: 'tpl-c-1',
    wingId: 'content',
    name: 'Long-form article · 1200-1800 words',
    purpose: 'A piece that can also live outside the app · fair on its own.',
    steps: ['One-paragraph brief', 'Outline review with an editor', 'Draft · single pass', 'Edit pass · 24h later', 'Publish + thank the reviewer'],
    ownerRole: 'Any content writer',
    color: '#F59E0B',
    emoji: '📝',
  },
  {
    id: 'tpl-c-2',
    wingId: 'content',
    name: 'Explainer thread · 8 tweets',
    purpose: 'A public explainer that stands alone on a timeline.',
    steps: ['Thesis in one tweet', 'Three facts · one per tweet', 'One image tweet', 'Two \"so what\" tweets', 'Call-to-action tweet'],
    ownerRole: 'Any content writer',
    color: '#F59E0B',
    emoji: '🧵',
  },
  {
    id: 'tpl-w-1',
    wingId: 'web',
    name: 'Feature PR · 1-2 screens',
    purpose: 'A focused change that ships end-to-end in one PR.',
    steps: ['Design link in the PR body', 'Types + hook first', 'UI second', 'Lint + tsc clean', 'Self-review · 24h cooldown'],
    ownerRole: 'Web/App engineer',
    color: '#00D4FF',
    emoji: '🧱',
  },
  {
    id: 'tpl-gd-1',
    wingId: 'gd',
    name: 'Event key-visual · 1 frame',
    purpose: 'A single hero image for a single event.',
    steps: ['Mood-board · 5 refs', 'Rough · grey-scale', 'Color pass', 'Two variations', 'Export + specs'],
    ownerRole: 'Graphic designer',
    color: '#F472B6',
    emoji: '🎨',
  },
  {
    id: 'tpl-v-1',
    wingId: 'video',
    name: 'Event recap · 90 seconds',
    purpose: 'A reel-first recap that works without audio.',
    steps: ['Selects · 40 clips max', 'Audio-first edit', 'Captions on everything', 'Export 4k + 1080', 'Post + tag speakers'],
    ownerRole: 'Video editor',
    color: '#A78BFA',
    emoji: '🎬',
  },
  {
    id: 'tpl-p-1',
    wingId: 'photo',
    name: 'Event photo-set · 30 keepers',
    purpose: 'A tight edit that tells the event honestly.',
    steps: ['Shoot · 800-1200 frames', 'Cull to 80', 'Edit to 30', 'Caption each keeper', 'Deliver in 48h'],
    ownerRole: 'Photographer',
    color: '#22C55E',
    emoji: '📸',
  },
  {
    id: 'tpl-pr-1',
    wingId: 'pr',
    name: 'Weekly newsletter · 600 words',
    purpose: 'A short weekly note that the club actually wants to read.',
    steps: ['Three headlines', 'One spotlight', 'Two events ahead', 'One thank-you line', 'Send Sunday 7 pm'],
    ownerRole: 'PR wing writer',
    color: '#FFD166',
    emoji: '📣',
  },
];

interface OnrampStep {
  id: string;
  wingId: string;
  day: string;
  action: string;
  owner: string;
  color: string;
  emoji: string;
}

const ONRAMP_STEPS: OnrampStep[] = [
  { id: 'or-c-1',  wingId: 'content', day: 'Day 1',  action: 'Read three published pieces · pick one you admire.',                  owner: 'Newcomer',   color: '#F59E0B', emoji: '📖' },
  { id: 'or-c-2',  wingId: 'content', day: 'Day 2',  action: 'Draft a 200-word note · why you picked that piece.',                   owner: 'Newcomer',   color: '#F59E0B', emoji: '✏️' },
  { id: 'or-c-3',  wingId: 'content', day: 'Day 5',  action: 'Shadow an editor for one full edit pass.',                              owner: 'Wing lead',   color: '#F59E0B', emoji: '👀' },
  { id: 'or-c-4',  wingId: 'content', day: 'Day 10', action: 'Co-write a small piece · 600 words · with a buddy.',                    owner: 'Buddy',       color: '#F59E0B', emoji: '🤝' },
  { id: 'or-c-5',  wingId: 'content', day: 'Day 21', action: 'Solo ship your first 800-word piece · with editor backup.',             owner: 'Newcomer',   color: '#F59E0B', emoji: '🚀' },
  { id: 'or-w-1',  wingId: 'web',     day: 'Day 1',  action: 'Clone the repo · install deps · run it on your phone.',                owner: 'Newcomer',   color: '#00D4FF', emoji: '📱' },
  { id: 'or-w-2',  wingId: 'web',     day: 'Day 3',  action: 'Pair-debug an open good-first-issue with a mentor.',                    owner: 'Mentor',      color: '#00D4FF', emoji: '🛠️' },
  { id: 'or-w-3',  wingId: 'web',     day: 'Day 7',  action: 'Open your first PR · tiny · something you actually care about.',        owner: 'Newcomer',   color: '#00D4FF', emoji: '🧱' },
  { id: 'or-w-4',  wingId: 'web',     day: 'Day 14', action: 'Review one teammate\'s PR · ask at least one good question.',           owner: 'Newcomer',   color: '#00D4FF', emoji: '🔍' },
  { id: 'or-gd-1', wingId: 'gd',      day: 'Day 1',  action: 'Browse the tokens doc · mark three you don\'t understand.',             owner: 'Newcomer',   color: '#F472B6', emoji: '🎨' },
  { id: 'or-gd-2', wingId: 'gd',      day: 'Day 4',  action: 'Redo an old poster using the token system.',                             owner: 'Newcomer',   color: '#F472B6', emoji: '🖼️' },
  { id: 'or-gd-3', wingId: 'gd',      day: 'Day 10', action: 'Present the redo in crit · take two notes.',                             owner: 'Newcomer',   color: '#F472B6', emoji: '💬' },
  { id: 'or-v-1',  wingId: 'video',   day: 'Day 1',  action: 'Cut a 30-sec teaser using rushes a senior hands you.',                  owner: 'Newcomer',   color: '#A78BFA', emoji: '✂️' },
  { id: 'or-v-2',  wingId: 'video',   day: 'Day 5',  action: 'Sit in on one shoot · take notes on rigging + lighting.',               owner: 'Newcomer',   color: '#A78BFA', emoji: '🎥' },
  { id: 'or-p-1',  wingId: 'photo',   day: 'Day 1',  action: 'Shoot 100 frames · no mission · just look.',                             owner: 'Newcomer',   color: '#22C55E', emoji: '📷' },
  { id: 'or-p-2',  wingId: 'photo',   day: 'Day 5',  action: 'Cull to 10 · get a crit · accept the harder feedback first.',           owner: 'Newcomer',   color: '#22C55E', emoji: '🔎' },
  { id: 'or-pr-1', wingId: 'pr',      day: 'Day 1',  action: 'Read the last three newsletters end-to-end.',                           owner: 'Newcomer',   color: '#FFD166', emoji: '📰' },
  { id: 'or-pr-2', wingId: 'pr',      day: 'Day 4',  action: 'Co-draft one newsletter section with a senior.',                        owner: 'Senior',      color: '#FFD166', emoji: '✍️' },
];

interface ShowcaseLink {
  id: string;
  wingId: string;
  title: string;
  venue: string;
  year: number;
  medium: 'article' | 'talk' | 'app' | 'film' | 'photoset' | 'series';
  kind: 'internal' | 'external';
  color: string;
  emoji: string;
}

const SHOWCASE_LINKS: ShowcaseLink[] = [
  { id: 'sl-c-1',  wingId: 'content', title: 'What rain means when the terrace roof is tin',           venue: 'Scroll.in',                       year: 2025, medium: 'article',  kind: 'external', color: '#F59E0B', emoji: '📰' },
  { id: 'sl-c-2',  wingId: 'content', title: 'A quiet guide · how to write a grant without lying',     venue: 'Stanford SSIR',                   year: 2025, medium: 'article',  kind: 'external', color: '#F59E0B', emoji: '📰' },
  { id: 'sl-w-1',  wingId: 'web',     title: 'Taru Guardians · v1.3 · Android',                         venue: 'Play Store · internal track',     year: 2026, medium: 'app',      kind: 'internal', color: '#00D4FF', emoji: '📱' },
  { id: 'sl-w-2',  wingId: 'web',     title: 'What release rotations taught our tiny team',             venue: 'GitHub Universe · lightning',     year: 2024, medium: 'talk',     kind: 'external', color: '#00D4FF', emoji: '🎤' },
  { id: 'sl-gd-1', wingId: 'gd',      title: 'Field-guide · 12 posters · one year',                     venue: 'Campus main hall · gallery',      year: 2025, medium: 'series',   kind: 'internal', color: '#F472B6', emoji: '🖼️' },
  { id: 'sl-gd-2', wingId: 'gd',      title: 'Designing for the last user · a talk',                    venue: 'Config · Figma',                  year: 2026, medium: 'talk',     kind: 'external', color: '#F472B6', emoji: '🎤' },
  { id: 'sl-v-1',  wingId: 'video',   title: 'Year-in-review reel · 90 seconds',                        venue: 'Club Instagram',                  year: 2025, medium: 'film',     kind: 'external', color: '#A78BFA', emoji: '🎬' },
  { id: 'sl-v-2',  wingId: 'video',   title: 'Sapling · a short film',                                  venue: 'Short-film fest · Dharamshala',   year: 2024, medium: 'film',     kind: 'external', color: '#A78BFA', emoji: '🎥' },
  { id: 'sl-p-1',  wingId: 'photo',   title: 'Terrace light · 40 frames',                                venue: 'Club gallery night',              year: 2025, medium: 'photoset', kind: 'internal', color: '#22C55E', emoji: '📸' },
  { id: 'sl-p-2',  wingId: 'photo',   title: 'Rain on the landslide · five-village photo essay',        venue: 'Environment & Urbanization',      year: 2025, medium: 'photoset', kind: 'external', color: '#22C55E', emoji: '🏞️' },
  { id: 'sl-pr-1', wingId: 'pr',      title: 'Weekly letters · 52 issues · one year',                    venue: 'Email list · 2,200 readers',      year: 2025, medium: 'series',   kind: 'external', color: '#FFD166', emoji: '📧' },
];

interface WingFeedbackNorm {
  id: string;
  wingId: string;
  principle: string;
  detail: string;
  example: string;
  color: string;
  emoji: string;
}

const FEEDBACK_NORMS: WingFeedbackNorm[] = [
  { id: 'fn-c-1',  wingId: 'content', principle: 'Edit the sentence · not the writer',              detail: 'Talk about the line on the page · not the person who wrote it.',                  example: '"This sentence hides the verb" · not · "you always hide verbs".',      color: '#F59E0B', emoji: '✏️' },
  { id: 'fn-c-2',  wingId: 'content', principle: 'Question first · then suggest',                   detail: 'Ask what the writer wanted before handing them your fix.',                          example: '"What did you want the reader to feel here?" · then suggest.',           color: '#F59E0B', emoji: '❓' },
  { id: 'fn-w-1',  wingId: 'web',     principle: 'Small PRs · small feedback',                      detail: 'Ship small · so the feedback can stay specific + fast.',                            example: '"Rename this hook" · on a 30-line PR · not on a 600-line one.',         color: '#00D4FF', emoji: '🧱' },
  { id: 'fn-w-2',  wingId: 'web',     principle: 'Code review is a conversation · not a judgement', detail: 'A comment is a question unless the author + reviewer both agree it is a must.',    example: '"Could we extract this?" · then listen before insisting.',              color: '#00D4FF', emoji: '💬' },
  { id: 'fn-gd-1', wingId: 'gd',      principle: 'Crit with the brief in hand',                     detail: 'Every critique starts by reading the brief again · out loud.',                     example: '"The brief asked for calm · this is loud · is that on purpose?"',      color: '#F472B6', emoji: '🪞' },
  { id: 'fn-v-1',  wingId: 'video',   principle: 'Rough cuts are for reactions · not sentences',    detail: 'At rough-cut stage we only note feelings · not frame-by-frame.',                    example: '"I felt lost at 0:45" · not · "trim that to 4 frames".',                color: '#A78BFA', emoji: '🎬' },
  { id: 'fn-p-1',  wingId: 'photo',   principle: 'One keeper · two cuts',                           detail: 'When you crit · pick one photo to praise before cutting two.',                      example: '"This one · yes · the others · no · here\'s why".',                      color: '#22C55E', emoji: '📸' },
  { id: 'fn-pr-1', wingId: 'pr',      principle: 'Feedback in person · not in comments',            detail: 'We say the hard thing face-to-face · never only in a doc comment.',                 example: 'A five-minute call · not a three-comment thread.',                        color: '#FFD166', emoji: '🗣️' },
];

// =====================================================
// Phase 3aa: deeper wing structures — round 2
// =====================================================

interface WingToolStack {
  id: string;
  wingId: string;
  tool: string;
  role: string;
  license: 'free' | 'student' | 'paid';
  note: string;
  color: string;
  emoji: string;
}

const WING_TOOLS: WingToolStack[] = [
  { id: 'wt-c-1',  wingId: 'content', tool: 'Google Docs',                     role: 'Drafting + tracked edits',             license: 'free',    note: 'One doc per piece · history kept for 90 days.',          color: '#F59E0B', emoji: '📝' },
  { id: 'wt-c-2',  wingId: 'content', tool: 'Hemingway Editor',                role: 'Readability check',                     license: 'free',    note: 'Every long piece run through before publish.',          color: '#F59E0B', emoji: '📏' },
  { id: 'wt-w-1',  wingId: 'web',     tool: 'VS Code + GitHub',                role: 'Code + reviews',                        license: 'free',    note: 'One main branch per repo · PRs under 300 lines.',       color: '#00D4FF', emoji: '💻' },
  { id: 'wt-w-2',  wingId: 'web',     tool: 'Expo Go · EAS Build',             role: 'Mobile iteration',                      license: 'free',    note: 'Dev builds on-device within 10 min.',                   color: '#00D4FF', emoji: '📲' },
  { id: 'wt-w-3',  wingId: 'web',     tool: 'Sentry',                           role: 'Crash + error tracking',                license: 'student', note: 'First 5k events/month covered by student plan.',       color: '#00D4FF', emoji: '🛰️' },
  { id: 'wt-gd-1', wingId: 'gd',      tool: 'Figma · community plan',            role: 'Design + handoff',                       license: 'free',    note: 'One team · every wing has read access to the library.',  color: '#F472B6', emoji: '🎨' },
  { id: 'wt-gd-2', wingId: 'gd',      tool: 'Affinity Designer',                role: 'Print + poster work',                    license: 'paid',    note: 'One-time license · shared iPad · booked via calendar.',   color: '#F472B6', emoji: '🖼️' },
  { id: 'wt-v-1',  wingId: 'video',   tool: 'DaVinci Resolve',                  role: 'Edit + colour',                          license: 'free',    note: 'Free tier covers everything we ship short of 8K.',       color: '#A78BFA', emoji: '🎞️' },
  { id: 'wt-v-2',  wingId: 'video',   tool: 'Audacity',                         role: 'Audio clean + mix',                      license: 'free',    note: 'Denoise · normalise · exported at −14 LUFS.',            color: '#A78BFA', emoji: '🔊' },
  { id: 'wt-p-1',  wingId: 'photo',   tool: 'Lightroom · student',              role: 'Catalogue + RAW edit',                    license: 'student', note: '1 TB cloud · backed up within 24 h of shoot.',          color: '#22C55E', emoji: '🖼️' },
  { id: 'wt-p-2',  wingId: 'photo',   tool: 'Capture One · rented',              role: 'Tethered shoots',                         license: 'paid',    note: 'Rented only during product shoots · shared login.',      color: '#22C55E', emoji: '📷' },
  { id: 'wt-pr-1', wingId: 'pr',      tool: 'Notion',                           role: 'Press kit + partner tracker',            license: 'free',    note: 'Public read-only link per partner · renewed yearly.',   color: '#FFD166', emoji: '🗂️' },
];

interface WingRetroSignal {
  id: string;
  wingId: string;
  signal: string;
  tone: 'keep' | 'tune' | 'stop';
  note: string;
  color: string;
  emoji: string;
}

const WING_RETRO_SIGNALS: WingRetroSignal[] = [
  { id: 'wrs-c-1',  wingId: 'content', signal: 'First drafts land within 3 days of brief',        tone: 'keep', note: 'Nobody waits more than a weekend to start editing.',                   color: '#22C55E', emoji: '🌱' },
  { id: 'wrs-c-2',  wingId: 'content', signal: 'Readability scores creeping higher · fewer 7th-grade pieces', tone: 'tune', note: 'Aim for grade-7 on campus-wide posts.',                    color: '#F59E0B', emoji: '📏' },
  { id: 'wrs-w-1',  wingId: 'web',     signal: 'Median PR review under 24 h',                      tone: 'keep', note: 'Two reviewers on every PR · fast but careful.',                       color: '#22C55E', emoji: '🛰️' },
  { id: 'wrs-w-2',  wingId: 'web',     signal: 'Sentry events quiet · below 50/week',              tone: 'keep', note: 'Crashes triaged within 48 h.',                                          color: '#22C55E', emoji: '🧯' },
  { id: 'wrs-gd-1', wingId: 'gd',      signal: 'Poster approvals needing > 3 rounds',              tone: 'tune', note: 'Add a pre-crit · 15 min · before first export.',                      color: '#F59E0B', emoji: '🪞' },
  { id: 'wrs-v-1',  wingId: 'video',   signal: 'Weekly reel views plateauing',                      tone: 'tune', note: 'Try 3-min cut + 30-sec cut · not just one.',                           color: '#F59E0B', emoji: '📈' },
  { id: 'wrs-p-1',  wingId: 'photo',   signal: 'Keeper ratio dropped under 10%',                     tone: 'stop', note: 'Pause self-led shoots · pair with a senior for two weeks.',            color: '#EF4444', emoji: '📉' },
  { id: 'wrs-pr-1', wingId: 'pr',      signal: 'Two new partners reached out unsolicited',           tone: 'keep', note: 'Press kit is doing its work · share broadly.',                          color: '#22C55E', emoji: '🤝' },
];

interface WingExitPath {
  id: string;
  wingId: string;
  situation: string;
  step: string;
  handoff: string;
  color: string;
  emoji: string;
}

const WING_EXIT_PATHS: WingExitPath[] = [
  { id: 'we-c-1',  wingId: 'content', situation: 'Writing no longer fits · want to try design',   step: 'Talk to content lead + GD lead · 1 week trial on GD tasks.',              handoff: 'Any open drafts go to the editor of the month.',              color: '#F472B6', emoji: '🔄' },
  { id: 'we-w-1',  wingId: 'web',     situation: 'Exams pressing · need to pause',                 step: 'Pause · not leave · write one-pager on what you were building.',          handoff: 'Open PRs closed with a pickup-note · reviewer takes over.',  color: '#F59E0B', emoji: '⏸️' },
  { id: 'we-w-2',  wingId: 'web',     situation: 'Graduating · keeping ties loose',                 step: 'Two-week shadow · a junior pairs with you on the repos you own.',         handoff: 'Credentials rotated · you become advisor-on-call.',          color: '#A78BFA', emoji: '🎓' },
  { id: 'we-gd-1', wingId: 'gd',      situation: 'Time-squeeze · can still mentor',                 step: 'Move to mentor rota · one crit a week · no weekly deliverables.',         handoff: 'Active projects handed to pair + brief one-pager.',          color: '#F472B6', emoji: '🧭' },
  { id: 'we-v-1',  wingId: 'video',   situation: 'Internship landed · leaving for 3 months',         step: 'Document your edit template · hand off to a junior.',                      handoff: 'Raw footage stays on shared drive · label folder "ping-on-return".', color: '#A78BFA', emoji: '🎒' },
  { id: 'we-p-1',  wingId: 'photo',   situation: 'Not photographing anymore · want to archive',     step: 'Tag your work · move to archive folder · keep watermark.',                 handoff: 'Someone else cares for the contact sheet + future reprints.', color: '#22C55E', emoji: '📂' },
  { id: 'we-pr-1', wingId: 'pr',      situation: 'Partner-facing role burning you out',              step: 'Move to internal PR (alumni · digest) · 1 month cooldown.',              handoff: 'Active partners handed over with a warm introduction.',        color: '#FFD166', emoji: '🫶' },
];

interface WingReference {
  id: string;
  wingId: string;
  title: string;
  author: string;
  why: string;
  color: string;
  emoji: string;
}

const WING_REFERENCES: WingReference[] = [
  { id: 'wrf-c-1',  wingId: 'content', title: 'On Writing Well',                    author: 'William Zinsser',             why: 'Trims ornament · keeps the sentence honest.',               color: '#F59E0B', emoji: '📚' },
  { id: 'wrf-c-2',  wingId: 'content', title: 'Bird by Bird',                         author: 'Anne Lamott',                 why: 'Teaches us to ship rough first drafts.',                   color: '#F59E0B', emoji: '📖' },
  { id: 'wrf-w-1',  wingId: 'web',     title: 'A Philosophy of Software Design',    author: 'John Ousterhout',              why: 'Short · on module depth · changes how we write functions.', color: '#00D4FF', emoji: '🏛️' },
  { id: 'wrf-w-2',  wingId: 'web',     title: 'Refactoring · 2nd edition',           author: 'Martin Fowler',                why: 'Names to safe small changes we were already doing.',      color: '#00D4FF', emoji: '🔧' },
  { id: 'wrf-gd-1', wingId: 'gd',      title: 'Grid Systems in Graphic Design',      author: 'Josef Müller-Brockmann',       why: 'Calms every chaotic poster we make.',                      color: '#F472B6', emoji: '🖼️' },
  { id: 'wrf-gd-2', wingId: 'gd',      title: 'Thinking with Type',                  author: 'Ellen Lupton',                 why: 'Typography you will use in every single poster.',         color: '#F472B6', emoji: '🔤' },
  { id: 'wrf-v-1',  wingId: 'video',   title: 'In the Blink of an Eye',                author: 'Walter Murch',                 why: 'Cut on feeling · not just on beat.',                        color: '#A78BFA', emoji: '🎬' },
  { id: 'wrf-p-1',  wingId: 'photo',   title: 'Understanding Exposure',                author: 'Bryan Peterson',                why: 'A working language for light.',                             color: '#22C55E', emoji: '📸' },
  { id: 'wrf-pr-1', wingId: 'pr',      title: 'Made to Stick',                         author: 'Chip + Dan Heath',             why: 'Why some stories survive the inbox.',                       color: '#FFD166', emoji: '📮' },
];

interface WingCollabRitual {
  id: string;
  wingId: string;
  ritual: string;
  cadence: string;
  who: string;
  output: string;
  color: string;
  emoji: string;
}

const WING_COLLAB_RITUALS: WingCollabRitual[] = [
  { id: 'wcr-c-1',  wingId: 'content', ritual: 'Writer\'s desk · rough-cut Mondays',    cadence: 'Weekly · 45 min',   who: 'All content + one GD',                 output: 'Every rough draft gets a first reaction + a rewrite note.',       color: '#F59E0B', emoji: '✍️' },
  { id: 'wcr-w-1',  wingId: 'web',      ritual: 'Pair-up Wednesdays',                   cadence: 'Weekly · 60 min',   who: 'Two devs · one from another wing',      output: 'One tiny PR paired + shipped · other wing gets a peek.',            color: '#00D4FF', emoji: '🧑\u200d💻' },
  { id: 'wcr-w-2',  wingId: 'web',      ritual: 'Release day · quiet',                   cadence: 'Fortnight · 20 min', who: 'Release buddy + on-call',              output: 'Release notes + next-two-weeks plan · signed off by lead.',          color: '#00D4FF', emoji: '🚢' },
  { id: 'wcr-gd-1', wingId: 'gd',        ritual: 'Open crit Fridays',                    cadence: 'Weekly · 50 min',   who: 'GD + photo + one content',             output: '3 pieces · 2 take-aways each · no silent dismissals.',              color: '#F472B6', emoji: '🖼️' },
  { id: 'wcr-v-1',  wingId: 'video',    ritual: 'Playback Tuesdays',                      cadence: 'Weekly · 40 min',   who: 'Video + photo + content',               output: 'Rough cuts watched in silence · notes in a doc · 24 h follow-up.',   color: '#A78BFA', emoji: '📽️' },
  { id: 'wcr-p-1',  wingId: 'photo',    ritual: 'Contact-sheet Saturdays',                cadence: 'Weekly · 30 min',   who: 'Photo + GD',                           output: 'Three keepers / ten · agreed in the same room.',                     color: '#22C55E', emoji: '📇' },
  { id: 'wcr-pr-1', wingId: 'pr',       ritual: 'Press-kit refresh',                     cadence: 'Monthly · 30 min',  who: 'PR + content',                         output: 'Two lines updated · dates refreshed · new sapling count in.',       color: '#FFD166', emoji: '📰' },
];

// =====================================================
// Phase 3ah: deeper wing structures — round 3
// =====================================================

interface WingCraftDrill {
  id: string;
  wingId: string;
  drill: string;
  cadence: string;
  goal: string;
  checkIn: string;
  color: string;
  emoji: string;
}

const WING_CRAFT_DRILLS: WingCraftDrill[] = [
  { id: 'wcd-c-1',   wingId: 'content', drill: 'Warm-up · 100-word cold open',             cadence: 'Daily · 10 min',  goal: 'Start any piece without staring · first sentence already written.',     checkIn: 'Paste into #content-warm-ups.',                      color: '#F59E0B', emoji: '📝' },
  { id: 'wcd-c-2',   wingId: 'content', drill: 'Red-pen swap · edit a peer\'s draft',        cadence: 'Weekly',          goal: 'Cut 15% words · keep all the meaning.',                                     checkIn: 'Diff shared on Friday sync.',                        color: '#F59E0B', emoji: '✂️' },
  { id: 'wcd-w-1',   wingId: 'web',     drill: 'Unit test before the fix',                 cadence: 'Per bug',         goal: 'No bug is closed without a regression test that fails then passes.',      checkIn: 'PR template line 3 is non-negotiable.',             color: '#00D4FF', emoji: '🧪' },
  { id: 'wcd-w-2',   wingId: 'web',     drill: 'Profiling Wednesday · 45 min',              cadence: 'Weekly',          goal: 'Find the slowest 3 routes · fix or file one.',                              checkIn: 'Lighthouse + React DevTools screenshot.',           color: '#00D4FF', emoji: '⚡' },
  { id: 'wcd-gd-1',  wingId: 'gd',      drill: 'Five variants before picking one',          cadence: 'Per poster',      goal: 'Force options · never settle on the first idea.',                           checkIn: 'Five boards in #gd-variants before pre-crit.',       color: '#F472B6', emoji: '🎛️' },
  { id: 'wcd-gd-2',  wingId: 'gd',      drill: 'Type-only Tuesday',                          cadence: 'Weekly',          goal: 'Design with zero images · learn hierarchy through type.',                   checkIn: 'One layout pinned in Figma.',                        color: '#F472B6', emoji: '🅰️' },
  { id: 'wcd-v-1',   wingId: 'video',   drill: 'Cut-to-music match practice',                 cadence: 'Weekly',          goal: 'Read a waveform · land cuts on the beat without nudging.',                  checkIn: 'Share 20-sec sample · no colour · no FX.',           color: '#A78BFA', emoji: '🎞️' },
  { id: 'wcd-v-2',   wingId: 'video',   drill: 'One-minute story frame · 3 shots',            cadence: 'Fortnight',       goal: 'Tell something real in 60 s with no voiceover.',                             checkIn: 'Pinned in #video-60s.',                              color: '#A78BFA', emoji: '🎬' },
  { id: 'wcd-p-1',   wingId: 'photo',   drill: 'Single prime lens · half day',                cadence: 'Monthly',         goal: 'Compose with feet · not zoom · retrain the frame.',                         checkIn: 'Ten favourite frames uploaded.',                    color: '#22C55E', emoji: '📷' },
  { id: 'wcd-p-2',   wingId: 'photo',   drill: 'Manual mode · no auto assist',                cadence: 'Weekly',          goal: 'Feel the triangle · ISO / shutter / aperture balance by instinct.',          checkIn: 'EXIF in the end-of-week upload.',                    color: '#22C55E', emoji: '⚙️' },
  { id: 'wcd-pr-1',  wingId: 'pr',      drill: 'Rewrite one pitch into three lengths',        cadence: 'Weekly',          goal: 'Same story · 60 / 150 / 400 words · pick the right one for the outlet.',    checkIn: 'Trio posted to #pr-desk.',                           color: '#FFD166', emoji: '✉️' },
  { id: 'wcd-pr-2',  wingId: 'pr',      drill: 'Cold-message · twenty-a-day · one week',      cadence: 'Quarterly sprint', goal: 'Get comfortable hearing "no" · then "maybe" · then "yes".',                checkIn: 'Log in shared tracker · no ghosts.',                color: '#FFD166', emoji: '🗞️' },
];

interface WingOutputPromise {
  id: string;
  wingId: string;
  output: string;
  cadence: string;
  sla: string;
  owner: string;
  color: string;
  emoji: string;
}

const WING_OUTPUT_PROMISES: WingOutputPromise[] = [
  { id: 'wop-c-1',   wingId: 'content', output: 'Weekly digest · 600 words',                   cadence: 'Every Monday',      sla: 'Published by 10 AM · no exception.',                                      owner: 'Content lead',        color: '#F59E0B', emoji: '📨' },
  { id: 'wop-c-2',   wingId: 'content', output: 'Event recap blog · 800-1200 words',            cadence: 'Within 10 days of event', sla: 'Draft in 3 days · review 3 days · ship 4 days.',                       owner: 'Content + Photo',      color: '#F59E0B', emoji: '📝' },
  { id: 'wop-w-1',   wingId: 'web',     output: 'Public status page · uptime + incidents',      cadence: 'Live',               sla: 'Updated within 5 min of an incident · post-mortem in 72 h.',            owner: 'Web lead · on-call',  color: '#00D4FF', emoji: '🛰️' },
  { id: 'wop-w-2',   wingId: 'web',     output: 'Release notes · after every ship',               cadence: 'Per release',         sla: 'In the PR description · doubled up in #ship-log.',                        owner: 'PR author',             color: '#00D4FF', emoji: '📦' },
  { id: 'wop-gd-1',  wingId: 'gd',      output: 'Event poster pack · digital + print',            cadence: 'Per event',           sla: 'Final pack 7 days before the event · 2 rounds of crit min.',              owner: 'Design lead',           color: '#F472B6', emoji: '🎨' },
  { id: 'wop-gd-2',  wingId: 'gd',      output: 'Brand library updates',                           cadence: 'Monthly',             sla: 'Diff posted in #design-decisions · deprecations listed.',                owner: 'Design lead',           color: '#F472B6', emoji: '📚' },
  { id: 'wop-v-1',   wingId: 'video',   output: 'Event reel · horizontal + vertical',              cadence: 'Per event',           sla: 'First cut in 5 days · final in 10 · published in 12.',                     owner: 'Video lead',            color: '#A78BFA', emoji: '🎞️' },
  { id: 'wop-v-2',   wingId: 'video',   output: 'Member spotlight · 90-sec portrait',             cadence: 'Quarterly',           sla: 'Consent signed · subtitles burned · two cuts delivered.',                owner: 'Video + PR',             color: '#A78BFA', emoji: '🎬' },
  { id: 'wop-p-1',   wingId: 'photo',   output: 'Event photo set · culled + edited',                cadence: 'Per event',           sla: '48 h to culled proof · 5 days to final · all in shared drive.',             owner: 'Photo lead',            color: '#22C55E', emoji: '📸' },
  { id: 'wop-p-2',   wingId: 'photo',   output: 'Headshot refresh · leadership rotation',             cadence: 'Half-yearly',         sla: '15-min session per person · delivered in 72 h · two crops each.',          owner: 'Photo lead',            color: '#22C55E', emoji: '🖼️' },
  { id: 'wop-pr-1',  wingId: 'pr',      output: 'Quarterly press kit · latest numbers',              cadence: 'Quarterly',           sla: 'Zero stale stats · every claim linked to a source.',                       owner: 'PR lead',               color: '#FFD166', emoji: '📰' },
  { id: 'wop-pr-2',  wingId: 'pr',      output: 'Partner report · per sponsor',                     cadence: 'After campaign',      sla: '14 days after wrap · signed + sealed · on letterhead.',                    owner: 'PR + Ops',             color: '#FFD166', emoji: '📄' },
];

interface WingCraftBook {
  id: string;
  wingId: string;
  title: string;
  author: string;
  why: string;
  color: string;
  emoji: string;
}

const WING_CRAFT_BOOKS: WingCraftBook[] = [
  { id: 'wcb-c-1',   wingId: 'content', title: 'On Writing Well',                          author: 'William Zinsser',        why: 'Clearest writing about clear writing · compulsory read year-one.',          color: '#F59E0B', emoji: '📚' },
  { id: 'wcb-c-2',   wingId: 'content', title: 'The Elements of Style',                    author: 'Strunk & White',        why: 'Little book · big habits · annotated copy floats around the desk.',         color: '#F59E0B', emoji: '📖' },
  { id: 'wcb-w-1',   wingId: 'web',     title: 'The Pragmatic Programmer',                 author: 'Hunt & Thomas',          why: 'We re-read the \"Broken Windows\" chapter every retro.',                      color: '#00D4FF', emoji: '💻' },
  { id: 'wcb-w-2',   wingId: 'web',     title: 'Designing Data-Intensive Applications',     author: 'Martin Kleppmann',       why: 'Even a campus app should respect data · we quote chapter 5 a lot.',          color: '#00D4FF', emoji: '📘' },
  { id: 'wcb-gd-1',  wingId: 'gd',      title: 'Thinking with Type',                        author: 'Ellen Lupton',           why: 'Every type-only Tuesday starts with a page from this.',                     color: '#F472B6', emoji: '🅰️' },
  { id: 'wcb-gd-2',  wingId: 'gd',      title: 'Grid Systems in Graphic Design',             author: 'Josef Müller-Brockmann', why: 'Our poster grid is a respectful descendant of Müller-Brockmann.',          color: '#F472B6', emoji: '📐' },
  { id: 'wcb-v-1',   wingId: 'video',   title: 'In the Blink of an Eye',                    author: 'Walter Murch',           why: 'Every cut deserves a reason · this book gives us the vocabulary.',         color: '#A78BFA', emoji: '🎞️' },
  { id: 'wcb-p-1',   wingId: 'photo',   title: 'Understanding Exposure',                    author: 'Bryan Peterson',          why: 'Year-one juniors read this before touching manual mode.',                  color: '#22C55E', emoji: '📷' },
  { id: 'wcb-p-2',   wingId: 'photo',   title: 'On Photography',                            author: 'Susan Sontag',            why: 'Reminds us that a camera is a choice · not a default.',                    color: '#22C55E', emoji: '📘' },
  { id: 'wcb-pr-1',  wingId: 'pr',      title: 'Made to Stick',                            author: 'Heath & Heath',           why: 'Our pitch-clinic week is built on the SUCCESs model.',                      color: '#FFD166', emoji: '💡' },
  { id: 'wcb-pr-2',  wingId: 'pr',      title: 'Trust Me · I\'m Lying',                   author: 'Ryan Holiday',            why: 'So we know what not to do when tempted.',                                  color: '#FFD166', emoji: '📰' },
];

interface WingBrotherWing {
  id: string;
  wingId: string;
  partnerWing: string;
  collab: string;
  cadence: string;
  color: string;
  emoji: string;
}

const WING_BROTHER_WINGS: WingBrotherWing[] = [
  { id: 'wbw-c-1',   wingId: 'content', partnerWing: 'Graphic Design',      collab: 'Recap blogs get a tailored thumbnail · not stock.',              cadence: 'Per piece',      color: '#F472B6', emoji: '🖼️' },
  { id: 'wbw-c-2',   wingId: 'content', partnerWing: 'Public Relations',     collab: 'Long-form · syndicated + co-branded with partner outlets.',     cadence: 'Monthly',         color: '#FFD166', emoji: '🤝' },
  { id: 'wbw-w-1',   wingId: 'web',     partnerWing: 'Photography',          collab: 'Lazy-loaded gallery + auto-captioning from photo metadata.',    cadence: 'Quarterly',       color: '#22C55E', emoji: '🔗' },
  { id: 'wbw-w-2',   wingId: 'web',     partnerWing: 'Content Writing',       collab: 'CMS for content · zero HTML edits · writers own publish.',    cadence: 'Continuous',      color: '#F59E0B', emoji: '✍️' },
  { id: 'wbw-gd-1',  wingId: 'gd',      partnerWing: 'Video',                collab: 'Design the end-card · poster · subtitle chyrons together.',     cadence: 'Per event',       color: '#A78BFA', emoji: '🎬' },
  { id: 'wbw-gd-2',  wingId: 'gd',      partnerWing: 'PR',                   collab: 'Press kit · sponsor deck · one visual language.',               cadence: 'Quarterly',       color: '#FFD166', emoji: '📰' },
  { id: 'wbw-v-1',   wingId: 'video',   partnerWing: 'Photography',           collab: 'Shared shoot days · video B-roll from photo crew angles.',     cadence: 'Per event',       color: '#22C55E', emoji: '📸' },
  { id: 'wbw-p-1',   wingId: 'photo',   partnerWing: 'Content',              collab: 'Photo-forward long reads · captions written in-house.',         cadence: 'Monthly',         color: '#F59E0B', emoji: '📝' },
  { id: 'wbw-pr-1',  wingId: 'pr',      partnerWing: 'All wings',             collab: 'Monthly story meeting · pitches sourced from every desk.',      cadence: 'Monthly',          color: '#00D4FF', emoji: '📰' },
];

interface WingGreenCommitment {
  id: string;
  wingId: string;
  commitment: string;
  measure: string;
  color: string;
  emoji: string;
}

const WING_GREEN_COMMITMENTS: WingGreenCommitment[] = [
  { id: 'wgc-c-1',   wingId: 'content', commitment: 'Every long piece links one habit people can adopt this week.',        measure: 'Audit in quarterly review · target ≥ 80% of pieces.',         color: '#22C55E', emoji: '🌿' },
  { id: 'wgc-w-1',   wingId: 'web',     commitment: 'Page weight under 1.2 MB · 90% of routes.',                            measure: 'Lighthouse weekly · dashboard for all-green check-marks.',   color: '#22C55E', emoji: '🌱' },
  { id: 'wgc-w-2',   wingId: 'web',     commitment: 'Image pipeline · WebP/AVIF default · no unoptimised PNG.',                 measure: 'CI check rejects PRs with raw PNGs > 200 KB.',                  color: '#22C55E', emoji: '🪴' },
  { id: 'wgc-gd-1',  wingId: 'gd',      commitment: 'Posters reuse 80% of components · no fresh rasters each time.',            measure: 'Library usage report · monthly.',                              color: '#22C55E', emoji: '🌳' },
  { id: 'wgc-gd-2',  wingId: 'gd',      commitment: 'Print only on FSC-certified paper · both sides · soy ink.',                 measure: 'Invoice audit · zero non-FSC purchases in 2024.',             color: '#22C55E', emoji: '🪧' },
  { id: 'wgc-v-1',   wingId: 'video',   commitment: 'Render farm runs only on solar-hour block · 10 AM – 3 PM.',                 measure: 'Queue log + solar-feed data matched monthly.',                 color: '#22C55E', emoji: '☀️' },
  { id: 'wgc-p-1',   wingId: 'photo',   commitment: 'Batteries only charged on campus solar socket · bank C.',                  measure: 'Shared log of charging hours.',                                color: '#22C55E', emoji: '🔋' },
  { id: 'wgc-p-2',   wingId: 'photo',   commitment: 'No drones over nesting sites · March to July · honoured.',                  measure: 'Shoot planner blocks zone auto-flags.',                       color: '#22C55E', emoji: '🕊️' },
  { id: 'wgc-pr-1',  wingId: 'pr',      commitment: 'Only partner with groups that publish a carbon report.',                   measure: 'Quarterly vendor review · exceptions logged + explained.',     color: '#22C55E', emoji: '🌍' },
];

interface WingElderLoop {
  id: string;
  wingId: string;
  elder: string;
  role: string;
  cadence: string;
  reachOut: string;
  color: string;
  emoji: string;
}

const WING_ELDER_LOOPS: WingElderLoop[] = [
  { id: 'wel-c-1',   wingId: 'content', elder: 'Priya N. · 2017',          role: 'Former content lead · now at Wired',          cadence: 'Monthly · 30 min',     reachOut: 'Book via alumni calendar · 48-h notice.',          color: '#F59E0B', emoji: '📝' },
  { id: 'wel-w-1',   wingId: 'web',     elder: 'Rahul M. · 2012',          role: 'Founding engineer · backend',                  cadence: 'Fortnight · async',    reachOut: 'PR tag @rahul-m for design reviews.',              color: '#00D4FF', emoji: '💻' },
  { id: 'wel-w-2',   wingId: 'web',     elder: 'Ritika B. · 2019',         role: 'Mobile · Flutter + RN',                         cadence: 'Monthly',              reachOut: 'DM · answers within 24 h most weeks.',             color: '#00D4FF', emoji: '📲' },
  { id: 'wel-gd-1',  wingId: 'gd',      elder: 'Ananya R. · 2016',         role: 'Senior designer · Atlassian',                    cadence: 'Monthly crit',         reachOut: 'Friday crits · last Friday of the month.',          color: '#F472B6', emoji: '🎨' },
  { id: 'wel-v-1',   wingId: 'video',   elder: 'Zara S. · 2020',            role: 'Documentary editor · National Geographic',      cadence: 'Quarterly',             reachOut: 'Review reel · one minute · one-page notes.',       color: '#A78BFA', emoji: '🎞️' },
  { id: 'wel-p-1',   wingId: 'photo',   elder: 'Arjun K. · 2014',           role: 'Wildlife photographer · WWF India',              cadence: 'Per expedition',        reachOut: 'Pre-trip scouting calls · always.',                  color: '#22C55E', emoji: '📷' },
  { id: 'wel-pr-1',  wingId: 'pr',      elder: 'Dev P. · 2018',             role: 'Head of comms · solar startup',                   cadence: 'Monthly',               reachOut: 'Story meetings · first Wednesday.',                  color: '#FFD166', emoji: '📰' },
];

interface WingFirstShippedMoment {
  id: string;
  wingId: string;
  moment: string;
  who: string;
  when: string;
  color: string;
  emoji: string;
}

const WING_FIRST_SHIPPED: WingFirstShippedMoment[] = [
  { id: 'wfs-c-1',   wingId: 'content', moment: 'First published piece · tree-walk recap · 612 words',          who: 'Kavya I. · first-year',   when: 'Oct 2024',      color: '#F59E0B', emoji: '📰' },
  { id: 'wfs-w-1',   wingId: 'web',     moment: 'First merged PR · navigation accessibility fix',                who: 'Sameer M. · first-year',  when: 'Sep 2024',       color: '#00D4FF', emoji: '💻' },
  { id: 'wfs-w-2',   wingId: 'web',     moment: 'First shipped feature · sapling tracker widget',                who: 'Riya P. · second-year',   when: 'Nov 2024',       color: '#00D4FF', emoji: '🌱' },
  { id: 'wfs-gd-1',  wingId: 'gd',      moment: 'First approved poster · monsoon meet · 3 variants',              who: 'Nila T. · first-year',    when: 'Jul 2024',       color: '#F472B6', emoji: '🎨' },
  { id: 'wfs-v-1',   wingId: 'video',   moment: 'First edited reel · founders\' day · 94-sec horizontal cut',     who: 'Arnav G. · first-year',   when: 'Aug 2024',       color: '#A78BFA', emoji: '🎞️' },
  { id: 'wfs-p-1',   wingId: 'photo',   moment: 'First published photo essay · grove at dawn · 18 frames',       who: 'Meera V. · first-year',   when: 'Oct 2024',       color: '#22C55E', emoji: '📸' },
  { id: 'wfs-pr-1',  wingId: 'pr',      moment: 'First landed story · campus podcast · 12-min episode',           who: 'Tanish C. · first-year',  when: 'Dec 2024',       color: '#FFD166', emoji: '📰' },
];

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

  const renderGrowthPathBlock = () => {
    if (!selectedWing) return null;
    const path = GROWTH_PATHS.find((p) => p.wingId === selectedWing.id);
    if (!path) return null;
    const levelColor: Record<GrowthStep['level'], string> = {
      beginner: '#4ADE80',
      contributor: '#38BDF8',
      core: '#A78BFA',
      lead: '#F59E0B',
    };
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌱 Growth path</Text>
          <Text style={styles.sectionCaption}>{path.steps.length} milestones</Text>
        </View>
        <Text style={styles.growthTitle}>{path.title}</Text>
        <Text style={styles.growthSubtitle}>{path.subtitle}</Text>
        <View style={styles.growthTimeline}>
          {path.steps.map((s, idx) => (
            <View key={s.id} style={styles.growthStep}>
              <View
                style={[
                  styles.growthDot,
                  { backgroundColor: levelColor[s.level] },
                ]}
              />
              {idx < path.steps.length - 1 ? (
                <View style={styles.growthConnector} />
              ) : null}
              <View style={styles.growthBody}>
                <View style={styles.growthRow}>
                  <View
                    style={[
                      styles.growthLevelPill,
                      { backgroundColor: levelColor[s.level] + '22' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.growthLevelText,
                        { color: levelColor[s.level] },
                      ]}
                    >
                      {s.level.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.growthWeeks}>{s.weeks} wks</Text>
                </View>
                <Text style={styles.growthStepTitle}>{s.title}</Text>
                <Text style={styles.growthStepBody}>{s.body}</Text>
                <View style={styles.growthSkillsRow}>
                  {s.skills.map((sk) => (
                    <View key={sk} style={styles.growthSkillPill}>
                      <Text style={styles.growthSkillText}>{sk}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAwardsBlock = () => {
    if (!selectedWing) return null;
    const awards = WING_AWARDS.filter((a) => a.wingId === selectedWing.id);
    if (awards.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏅 Awards & recognition</Text>
          <Text style={styles.sectionCaption}>{awards.length} honoured</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.awardsScroll}
        >
          {awards.map((a) => (
            <View key={a.id} style={styles.awardCard}>
              <LinearGradient
                colors={[a.color + '33', '#0A0F14']}
                style={styles.awardGradient}
              >
                <View style={styles.awardTopRow}>
                  <Text style={styles.awardEmoji}>{a.emoji}</Text>
                  <View style={[styles.awardYearPill, { backgroundColor: a.color + '22' }]}>
                    <Text style={[styles.awardYearText, { color: a.color }]}>{a.year}</Text>
                  </View>
                </View>
                <Text style={styles.awardTitle}>{a.title}</Text>
                <Text style={styles.awardBody}>{a.body}</Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderJournalBlock = () => {
    if (!selectedWing) return null;
    const entries = WING_JOURNAL.filter((j) => j.wingId === selectedWing.id);
    if (entries.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📝 Wing journal</Text>
          <Text style={styles.sectionCaption}>{entries.length} entries</Text>
        </View>
        {entries.map((j) => (
          <View
            key={j.id}
            style={[
              styles.journalCard,
              { borderLeftColor: selectedWing.color },
            ]}
          >
            <View style={styles.journalHeaderRow}>
              <Text style={styles.journalWeek}>{j.weekOf}</Text>
              <Text style={styles.journalAuthor}>— {j.author}</Text>
            </View>
            <Text style={styles.journalTitle}>{j.title}</Text>
            <Text style={styles.journalBody}>{j.body}</Text>
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionLabel}>✨ Wins</Text>
              {j.wins.map((w, i) => (
                <Text key={`${j.id}-w-${i}`} style={styles.journalBullet}>
                  • {w}
                </Text>
              ))}
            </View>
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionLabel}>🔎 Learnings</Text>
              {j.learnings.map((l, i) => (
                <Text key={`${j.id}-l-${i}`} style={styles.journalBullet}>
                  • {l}
                </Text>
              ))}
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

  const renderShipLogBlock = () => {
    if (!selectedWing) return null;
    const items = SHIP_LOG.filter((s) => s.wingId === selectedWing.id);
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📦 Ship log</Text>
          <Text style={styles.sectionCaption}>Recent shipments</Text>
        </View>
        {items.map((s) => (
          <View key={s.id} style={styles.shipRow}>
            <Text style={styles.shipEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.shipTitle} numberOfLines={2}>{s.title}</Text>
              <Text style={styles.shipReach}>{s.reach}</Text>
            </View>
            <View style={styles.shipRightCol}>
              <Text style={styles.shipDate}>{s.date}</Text>
              <Text style={styles.shipKind}>{s.kind}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCirclesBlock = () => {
    if (!selectedWing) return null;
    const items = MENTORSHIP_CIRCLES.filter((c) => c.wingId === selectedWing.id);
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧭 Mentorship circles</Text>
          <Text style={styles.sectionCaption}>Peer groups · open to all</Text>
        </View>
        {items.map((c) => (
          <View key={c.id} style={[styles.circleCard, { borderLeftColor: c.color }]}>
            <View style={styles.circleHeaderRow}>
              <Text style={styles.circleName}>{c.name}</Text>
              <Text style={[styles.circleCadence, { color: c.color }]}>{c.cadence}</Text>
            </View>
            <Text style={styles.circleTopic}>{c.topic}</Text>
            <View style={styles.circleFootRow}>
              <Text style={styles.circleMeta}>
                {c.day} · {c.time} · host {c.host}
              </Text>
              <Text style={styles.circleMembers}>{c.members} in circle</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLearningBlock = () => {
    if (!selectedWing) return null;
    const items = LEARNING_ITEMS.filter((l) => l.wingId === selectedWing.id);
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📚 Learning library</Text>
          <Text style={styles.sectionCaption}>Curated · {items.length} items</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.learningScroll}
        >
          {items.map((l) => (
            <View key={l.id} style={styles.learnCard}>
              <View style={styles.learnBadgeRow}>
                <Text style={styles.learnKind}>{l.kind.toUpperCase()}</Text>
                <Text style={styles.learnDuration}>{l.duration}</Text>
              </View>
              <Text style={styles.learnTitle} numberOfLines={3}>{l.title}</Text>
              <Text style={styles.learnWhy} numberOfLines={3}>{l.why}</Text>
              <View style={styles.learnFootRow}>
                <Text style={styles.learnLevel}>{l.level}</Text>
                <Text style={styles.learnCurator}>by {l.curator}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRitualsBlock = () => {
    if (!selectedWing) return null;
    const items = WING_RITUALS.filter((r) => r.wingId === selectedWing.id);
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🕯️ Weekly rituals</Text>
          <Text style={styles.sectionCaption}>What we always do</Text>
        </View>
        <View style={styles.ritualGrid}>
          {items.map((r) => (
            <View key={r.id} style={styles.ritualCard}>
              <Text style={styles.ritualEmoji}>{r.emoji}</Text>
              <Text style={styles.ritualName} numberOfLines={2}>{r.ritual}</Text>
              <Text style={styles.ritualWhen}>{r.when}</Text>
              <Text style={styles.ritualWhy} numberOfLines={3}>{r.why}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPlaybookBlock = () => {
    if (!selectedWing) return null;
    const steps = WING_PLAYBOOK.filter((p) => p.wingId === selectedWing.id);
    if (steps.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📘 How this wing ships work</Text>
          <Text style={styles.sectionCaption}>{steps.length}-step playbook</Text>
        </View>
        {steps.map((s) => (
          <View key={s.id} style={[styles.pbCard, { borderLeftColor: s.color }]}>
            <View style={styles.pbTopRow}>
              <Text style={styles.pbEmoji}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pbStage, { color: s.color }]}>{s.stage}</Text>
                <Text style={styles.pbTitle} numberOfLines={1}>{s.title}</Text>
              </View>
            </View>
            <Text style={styles.pbDetail} numberOfLines={3}>{s.detail}</Text>
            <View style={styles.pbOutputRow}>
              <Text style={styles.pbOutputLabel}>output</Text>
              <Text style={styles.pbOutputText} numberOfLines={1}>{s.output}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderGearBlock = () => {
    if (!selectedWing) return null;
    const gear = STUDIO_GEAR.filter((g) => g.wingId === selectedWing.id);
    if (gear.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎛️ Studio gear</Text>
          <Text style={styles.sectionCaption}>
            {gear.filter((g) => g.available).length} / {gear.length} available
          </Text>
        </View>
        {gear.map((g) => (
          <View key={g.id} style={[styles.gearRow, { borderLeftColor: g.color }]}>
            <Text style={styles.gearEmoji}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.gearTopRow}>
                <Text style={styles.gearName} numberOfLines={1}>{g.name}</Text>
                <View
                  style={[
                    styles.gearPill,
                    {
                      backgroundColor: g.available
                        ? 'rgba(34,197,94,0.18)'
                        : 'rgba(239,68,68,0.18)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gearPillText,
                      { color: g.available ? '#22C55E' : '#EF4444' },
                    ]}
                  >
                    {g.available ? 'free' : 'on loan'}
                  </Text>
                </View>
              </View>
              <Text style={styles.gearRole}>{g.role}</Text>
              <Text style={styles.gearNote} numberOfLines={2}>{g.note}</Text>
              <Text style={styles.gearOwner}>{g.owner}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRetroBlock = () => {
    if (!selectedWing) return null;
    const retro = WING_RETROS.find((r) => r.wingId === selectedWing.id);
    if (!retro) return null;
    const moodColors: Record<WingRetroNote['mood'], string> = {
      calm: '#22C55E',
      humming: '#38BDF8',
      stretched: '#F59E0B',
      tired: '#EF4444',
    };
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🪞 Last month · retro</Text>
          <View
            style={[
              styles.retroMoodPill,
              { backgroundColor: moodColors[retro.mood] + '26' },
            ]}
          >
            <Text style={[styles.retroMoodText, { color: moodColors[retro.mood] }]}>
              {retro.mood}
            </Text>
          </View>
        </View>
        <Text style={styles.retroMonth}>{retro.month}</Text>
        <View style={[styles.retroBlock, { borderLeftColor: '#22C55E' }]}>
          <Text style={[styles.retroLabel, { color: '#22C55E' }]}>keeping</Text>
          {retro.kept.map((k, i) => (
            <Text key={`k-${i}`} style={styles.retroLine}>· {k}</Text>
          ))}
        </View>
        <View style={[styles.retroBlock, { borderLeftColor: '#EF4444' }]}>
          <Text style={[styles.retroLabel, { color: '#EF4444' }]}>dropping</Text>
          {retro.dropped.map((d, i) => (
            <Text key={`d-${i}`} style={styles.retroLine}>· {d}</Text>
          ))}
        </View>
        <View style={[styles.retroBlock, { borderLeftColor: '#A855F7' }]}>
          <Text style={[styles.retroLabel, { color: '#A855F7' }]}>trying next</Text>
          {retro.trying.map((t, i) => (
            <Text key={`t-${i}`} style={styles.retroLine}>· {t}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderCollabBlock = () => {
    if (!selectedWing) return null;
    const collabs = CROSS_WING_COLLABS.filter((c) => c.wings.includes(selectedWing.id));
    if (collabs.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🤝 Sister-wing collabs</Text>
          <Text style={styles.sectionCaption}>{collabs.length} active or planned</Text>
        </View>
        {collabs.map((c) => (
          <View key={c.id} style={[styles.collabCard, { borderLeftColor: c.color }]}>
            <View style={styles.collabTopRow}>
              <Text style={styles.collabEmoji}>{c.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.collabTitle} numberOfLines={1}>{c.title}</Text>
                <Text style={styles.collabWings}>
                  with · {c.wings.filter((w) => w !== selectedWing.id).join(' · ')}
                </Text>
              </View>
              <View
                style={[
                  styles.collabStatusPill,
                  {
                    backgroundColor:
                      c.status === 'live'
                        ? 'rgba(34,197,94,0.18)'
                        : c.status === 'planned'
                        ? 'rgba(56,189,248,0.18)'
                        : 'rgba(239,68,68,0.18)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.collabStatusText,
                    {
                      color:
                        c.status === 'live'
                          ? '#22C55E'
                          : c.status === 'planned'
                          ? '#38BDF8'
                          : '#EF4444',
                    },
                  ]}
                >
                  {c.status}
                </Text>
              </View>
            </View>
            <Text style={styles.collabAsk} numberOfLines={3}>ask · {c.ask}</Text>
            <Text style={styles.collabBenefit} numberOfLines={3}>benefit · {c.benefit}</Text>
            <Text style={styles.collabLead}>led by {c.lead}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDirectoryBlock = () => {
    if (!selectedWing) return null;
    const links = WING_DIRECTORY.filter((l) => l.wingId === selectedWing.id);
    if (links.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🗂️ Wing directory</Text>
          <Text style={styles.sectionCaption}>links + docs we live by</Text>
        </View>
        {links.map((l) => (
          <View key={l.id} style={[styles.dirRow, { borderLeftColor: l.color }]}>
            <Text style={styles.dirEmoji}>{l.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.dirTopRow}>
                <Text style={styles.dirName} numberOfLines={1}>{l.name}</Text>
                <Text
                  style={[
                    styles.dirTrust,
                    {
                      color:
                        l.trust === 'core'
                          ? '#22C55E'
                          : l.trust === 'recommended'
                          ? '#38BDF8'
                          : '#94A3B8',
                    },
                  ]}
                >
                  {l.trust}
                </Text>
              </View>
              <Text style={styles.dirHint} numberOfLines={1}>{l.urlHint}</Text>
              <Text style={styles.dirNote} numberOfLines={2}>{l.note}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOKRsBlock = () => {
    if (!selectedWing) return null;
    const okrs = WING_OKRS.filter((o) => o.wingId === selectedWing.id);
    if (okrs.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎯 This term's OKRs</Text>
          <Text style={styles.sectionCaption}>{okrs.length} objectives</Text>
        </View>
        {okrs.map((o) => (
          <View key={o.id} style={[styles.okrCard, { borderLeftColor: o.color }]}>
            <View style={styles.okrTopRow}>
              <Text style={styles.okrEmoji}>{o.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.okrObjective} numberOfLines={2}>{o.objective}</Text>
                <Text style={[styles.okrProgress, { color: o.color }]}>
                  {Math.round(o.progress * 100)}% · mid-term
                </Text>
              </View>
            </View>
            <View style={styles.okrKrRow}>
              <Text style={styles.okrKrBullet}>·</Text>
              <Text style={styles.okrKrText} numberOfLines={2}>{o.kr1}</Text>
            </View>
            <View style={styles.okrKrRow}>
              <Text style={styles.okrKrBullet}>·</Text>
              <Text style={styles.okrKrText} numberOfLines={2}>{o.kr2}</Text>
            </View>
            <View style={styles.okrKrRow}>
              <Text style={styles.okrKrBullet}>·</Text>
              <Text style={styles.okrKrText} numberOfLines={2}>{o.kr3}</Text>
            </View>
            <View style={styles.okrBarBg}>
              <View
                style={[
                  styles.okrBarFill,
                  { width: `${Math.round(o.progress * 100)}%`, backgroundColor: o.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTemplatesBlock = () => {
    if (!selectedWing) return null;
    const templates = DELIVERABLE_TEMPLATES.filter((t) => t.wingId === selectedWing.id);
    if (templates.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧩 Deliverable templates</Text>
          <Text style={styles.sectionCaption}>{templates.length} ready to reuse</Text>
        </View>
        {templates.map((t) => (
          <View key={t.id} style={[styles.tplCard, { borderLeftColor: t.color }]}>
            <View style={styles.tplTopRow}>
              <Text style={styles.tplEmoji}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tplName} numberOfLines={2}>{t.name}</Text>
                <Text style={styles.tplOwner} numberOfLines={1}>owner · {t.ownerRole}</Text>
              </View>
            </View>
            <Text style={styles.tplPurpose} numberOfLines={3}>{t.purpose}</Text>
            {t.steps.map((s, i) => (
              <View key={i} style={styles.tplStepRow}>
                <Text style={[styles.tplStepIdx, { color: t.color }]}>{i + 1}</Text>
                <Text style={styles.tplStepText} numberOfLines={2}>{s}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderOnrampBlock = () => {
    if (!selectedWing) return null;
    const steps = ONRAMP_STEPS.filter((s) => s.wingId === selectedWing.id);
    if (steps.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🛤️ On-ramp · first 21 days</Text>
          <Text style={styles.sectionCaption}>{steps.length} steps</Text>
        </View>
        {steps.map((s) => (
          <View key={s.id} style={[styles.onrRow, { borderLeftColor: s.color }]}>
            <View style={styles.onrDayCol}>
              <Text style={[styles.onrDay, { color: s.color }]}>{s.day}</Text>
              <Text style={styles.onrEmoji}>{s.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.onrAction} numberOfLines={3}>{s.action}</Text>
              <Text style={styles.onrOwner} numberOfLines={1}>by · {s.owner}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderShowcaseBlock = () => {
    if (!selectedWing) return null;
    const items = SHOWCASE_LINKS.filter((s) => s.wingId === selectedWing.id);
    if (items.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏅 Showcase · work we'd show a stranger</Text>
          <Text style={styles.sectionCaption}>{items.length} entries</Text>
        </View>
        {items.map((s) => (
          <View key={s.id} style={[styles.scCard, { borderLeftColor: s.color }]}>
            <Text style={styles.scEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scTitle} numberOfLines={2}>{s.title}</Text>
              <Text style={styles.scVenue} numberOfLines={1}>{s.venue} · {s.year}</Text>
              <View style={styles.scPillRow}>
                <View
                  style={[
                    styles.scPill,
                    { backgroundColor: s.color + '22', borderColor: s.color + '55' },
                  ]}
                >
                  <Text style={[styles.scPillText, { color: s.color }]}>{s.medium}</Text>
                </View>
                <View style={styles.scPill}>
                  <Text style={styles.scPillText}>{s.kind}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderFeedbackNormsBlock = () => {
    if (!selectedWing) return null;
    const norms = FEEDBACK_NORMS.filter((f) => f.wingId === selectedWing.id);
    if (norms.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🪞 How we give feedback here</Text>
          <Text style={styles.sectionCaption}>{norms.length} norms</Text>
        </View>
        {norms.map((f) => (
          <View key={f.id} style={[styles.fnCard, { borderLeftColor: f.color }]}>
            <View style={styles.fnTopRow}>
              <Text style={styles.fnEmoji}>{f.emoji}</Text>
              <Text style={styles.fnPrinciple} numberOfLines={2}>{f.principle}</Text>
            </View>
            <Text style={styles.fnDetail} numberOfLines={3}>{f.detail}</Text>
            <Text style={styles.fnExample} numberOfLines={2}>e.g. · {f.example}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ------ Phase 3aa: deeper wing blocks ------
  const renderWingToolsBlock = () => {
    if (!selectedWing) return null;
    const tools = WING_TOOLS.filter((t) => t.wingId === selectedWing.id);
    if (tools.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧰 Tool stack · what we actually use</Text>
          <Text style={styles.sectionCaption}>{tools.length} tools</Text>
        </View>
        {tools.map((t) => {
          const lColor =
            t.license === 'free' ? '#22C55E' :
            t.license === 'student' ? '#00D4FF' : '#F59E0B';
          return (
            <View key={t.id} style={[styles.wtCard, { borderLeftColor: t.color }]}>
              <View style={styles.wtTopRow}>
                <Text style={styles.wtEmoji}>{t.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wtTool} numberOfLines={1}>{t.tool}</Text>
                  <Text style={styles.wtRole} numberOfLines={1}>{t.role}</Text>
                </View>
                <View
                  style={[
                    styles.wtLicensePill,
                    { backgroundColor: lColor + '22', borderColor: lColor + '66' },
                  ]}
                >
                  <Text style={[styles.wtLicenseText, { color: lColor }]}>{t.license}</Text>
                </View>
              </View>
              <Text style={styles.wtNote} numberOfLines={2}>{t.note}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderWingRetroSignalsBlock = () => {
    if (!selectedWing) return null;
    const sigs = WING_RETRO_SIGNALS.filter((s) => s.wingId === selectedWing.id);
    if (sigs.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📡 Retro signals · what we watch</Text>
          <Text style={styles.sectionCaption}>{sigs.length} signals</Text>
        </View>
        {sigs.map((s) => {
          const tColor =
            s.tone === 'keep' ? '#22C55E' :
            s.tone === 'tune' ? '#F59E0B' : '#EF4444';
          return (
            <View key={s.id} style={[styles.wrsCard, { borderLeftColor: tColor }]}>
              <View style={styles.wrsTopRow}>
                <Text style={styles.wrsEmoji}>{s.emoji}</Text>
                <Text style={styles.wrsSignal} numberOfLines={2}>{s.signal}</Text>
                <View
                  style={[
                    styles.wrsTonePill,
                    { backgroundColor: tColor + '22', borderColor: tColor + '66' },
                  ]}
                >
                  <Text style={[styles.wrsToneText, { color: tColor }]}>{s.tone}</Text>
                </View>
              </View>
              <Text style={styles.wrsNote} numberOfLines={2}>{s.note}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderWingExitPathsBlock = () => {
    if (!selectedWing) return null;
    const paths = WING_EXIT_PATHS.filter((e) => e.wingId === selectedWing.id);
    if (paths.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🕊️ Graceful exits · when to pause / leave</Text>
          <Text style={styles.sectionCaption}>{paths.length} paths</Text>
        </View>
        {paths.map((p) => (
          <View key={p.id} style={[styles.weCard, { borderLeftColor: p.color }]}>
            <View style={styles.weTopRow}>
              <Text style={styles.weEmoji}>{p.emoji}</Text>
              <Text style={styles.weSituation} numberOfLines={2}>{p.situation}</Text>
            </View>
            <Text style={styles.weStep} numberOfLines={3}>→ {p.step}</Text>
            <Text style={styles.weHandoff} numberOfLines={2}>handoff · {p.handoff}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingReferencesBlock = () => {
    if (!selectedWing) return null;
    const refs = WING_REFERENCES.filter((r) => r.wingId === selectedWing.id);
    if (refs.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📚 References · we keep close</Text>
          <Text style={styles.sectionCaption}>{refs.length} reads</Text>
        </View>
        {refs.map((r) => (
          <View key={r.id} style={[styles.wrfCard, { borderLeftColor: r.color }]}>
            <View style={styles.wrfTopRow}>
              <Text style={styles.wrfEmoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wrfTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.wrfAuthor} numberOfLines={1}>{r.author}</Text>
              </View>
            </View>
            <Text style={styles.wrfWhy} numberOfLines={2}>{r.why}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingCollabRitualsBlock = () => {
    if (!selectedWing) return null;
    const rituals = WING_COLLAB_RITUALS.filter((c) => c.wingId === selectedWing.id);
    if (rituals.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎼 Collab rituals · how we gather</Text>
          <Text style={styles.sectionCaption}>{rituals.length} rituals</Text>
        </View>
        {rituals.map((r) => (
          <View key={r.id} style={[styles.wcrCard, { borderLeftColor: r.color }]}>
            <View style={styles.wcrTopRow}>
              <Text style={styles.wcrEmoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wcrRitual} numberOfLines={2}>{r.ritual}</Text>
                <Text style={[styles.wcrCadence, { color: r.color }]}>{r.cadence}</Text>
              </View>
            </View>
            <Text style={styles.wcrWho} numberOfLines={1}>who · {r.who}</Text>
            <Text style={styles.wcrOutput} numberOfLines={3}>→ {r.output}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ------ Phase 3ah: round 3 deeper wing blocks ------
  const renderWingCraftDrillsBlock = () => {
    if (!selectedWing) return null;
    const drills = WING_CRAFT_DRILLS.filter((d) => d.wingId === selectedWing.id);
    if (drills.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏋️ Craft drills · how we keep our hands sharp</Text>
          <Text style={styles.sectionCaption}>{drills.length} drills</Text>
        </View>
        {drills.map((d) => (
          <View key={d.id} style={[styles.wcdCard, { borderLeftColor: d.color }]}>
            <View style={styles.wcdTopRow}>
              <Text style={styles.wcdEmoji}>{d.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wcdName} numberOfLines={2}>{d.drill}</Text>
                <Text style={[styles.wcdCadence, { color: d.color }]}>{d.cadence}</Text>
              </View>
            </View>
            <Text style={styles.wcdGoal} numberOfLines={3}>→ {d.goal}</Text>
            <Text style={styles.wcdCheckIn} numberOfLines={2}>✅ {d.checkIn}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingOutputPromisesBlock = () => {
    if (!selectedWing) return null;
    const promises = WING_OUTPUT_PROMISES.filter((p) => p.wingId === selectedWing.id);
    if (promises.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📦 Output promises · what we ship on time</Text>
          <Text style={styles.sectionCaption}>{promises.length} promises</Text>
        </View>
        {promises.map((p) => (
          <View key={p.id} style={[styles.wopCard, { borderLeftColor: p.color }]}>
            <View style={styles.wopTopRow}>
              <Text style={styles.wopEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wopOutput} numberOfLines={2}>{p.output}</Text>
                <Text style={[styles.wopCadence, { color: p.color }]}>{p.cadence}</Text>
              </View>
            </View>
            <Text style={styles.wopSla} numberOfLines={2}>SLA · {p.sla}</Text>
            <Text style={styles.wopOwner} numberOfLines={1}>— {p.owner}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingCraftBooksBlock = () => {
    if (!selectedWing) return null;
    const books = WING_CRAFT_BOOKS.filter((b) => b.wingId === selectedWing.id);
    if (books.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📚 Craft bookshelf · reads we come back to</Text>
          <Text style={styles.sectionCaption}>{books.length} books</Text>
        </View>
        {books.map((b) => (
          <View key={b.id} style={[styles.wcbCard, { borderLeftColor: b.color }]}>
            <View style={styles.wcbTopRow}>
              <Text style={styles.wcbEmoji}>{b.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wcbTitle} numberOfLines={2}>{b.title}</Text>
                <Text style={styles.wcbAuthor} numberOfLines={1}>— {b.author}</Text>
              </View>
            </View>
            <Text style={styles.wcbWhy} numberOfLines={3}>{b.why}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingBrotherWingsBlock = () => {
    if (!selectedWing) return null;
    const bros = WING_BROTHER_WINGS.filter((w) => w.wingId === selectedWing.id);
    if (bros.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🔗 Brother wings · who we lean on</Text>
          <Text style={styles.sectionCaption}>{bros.length} partners</Text>
        </View>
        {bros.map((w) => (
          <View key={w.id} style={[styles.wbwCard, { borderLeftColor: w.color }]}>
            <View style={styles.wbwTopRow}>
              <Text style={styles.wbwEmoji}>{w.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wbwPartner} numberOfLines={1}>{w.partnerWing}</Text>
                <Text style={[styles.wbwCadence, { color: w.color }]}>{w.cadence}</Text>
              </View>
            </View>
            <Text style={styles.wbwCollab} numberOfLines={3}>→ {w.collab}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingGreenCommitmentsBlock = () => {
    if (!selectedWing) return null;
    const commits = WING_GREEN_COMMITMENTS.filter((g) => g.wingId === selectedWing.id);
    if (commits.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌿 Green commitments · this wing keeps</Text>
          <Text style={styles.sectionCaption}>{commits.length} pledges</Text>
        </View>
        {commits.map((g) => (
          <View key={g.id} style={[styles.wgcCard, { borderLeftColor: g.color }]}>
            <View style={styles.wgcTopRow}>
              <Text style={styles.wgcEmoji}>{g.emoji}</Text>
              <Text style={styles.wgcCommit} numberOfLines={3}>{g.commitment}</Text>
            </View>
            <Text style={styles.wgcMeasure} numberOfLines={2}>↳ {g.measure}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingElderLoopsBlock = () => {
    if (!selectedWing) return null;
    const elders = WING_ELDER_LOOPS.filter((e) => e.wingId === selectedWing.id);
    if (elders.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🫶 Elder loops · alumni who still hold the door</Text>
          <Text style={styles.sectionCaption}>{elders.length} elders</Text>
        </View>
        {elders.map((e) => (
          <View key={e.id} style={[styles.welCard, { borderLeftColor: e.color }]}>
            <View style={styles.welTopRow}>
              <Text style={styles.welEmoji}>{e.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.welElder} numberOfLines={1}>{e.elder}</Text>
                <Text style={styles.welRole} numberOfLines={1}>{e.role}</Text>
              </View>
              <Text style={[styles.welCadence, { color: e.color }]} numberOfLines={1}>{e.cadence}</Text>
            </View>
            <Text style={styles.welReach} numberOfLines={2}>→ {e.reachOut}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWingFirstShippedBlock = () => {
    if (!selectedWing) return null;
    const firsts = WING_FIRST_SHIPPED.filter((f) => f.wingId === selectedWing.id);
    if (firsts.length === 0) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎉 First ships · people we remember starting</Text>
          <Text style={styles.sectionCaption}>{firsts.length} moments</Text>
        </View>
        {firsts.map((f) => (
          <View key={f.id} style={[styles.wfsCard, { borderLeftColor: f.color }]}>
            <View style={styles.wfsTopRow}>
              <Text style={styles.wfsEmoji}>{f.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wfsMoment} numberOfLines={2}>{f.moment}</Text>
                <Text style={styles.wfsWho} numberOfLines={1}>{f.who} · <Text style={[styles.wfsWhen, { color: f.color }]}>{f.when}</Text></Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

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
      {renderWingToolsBlock()}
      {renderWingCraftDrillsBlock()}
      {renderWingOutputPromisesBlock()}
      {renderOKRsBlock()}
      {renderGrowthPathBlock()}
      {renderOnrampBlock()}
      {renderPlaybookBlock()}
      {renderTemplatesBlock()}
      {renderOpenRoles()}
      {renderProjectsBlock()}
      {renderShipLogBlock()}
      {renderGearBlock()}
      {renderFeedbackNormsBlock()}
      {renderWingRetroSignalsBlock()}
      {renderRetroBlock()}
      {renderCollabBlock()}
      {renderWingCollabRitualsBlock()}
      {renderWingBrotherWingsBlock()}
      {renderWingGreenCommitmentsBlock()}
      {renderAwardsBlock()}
      {renderShowcaseBlock()}
      {renderEventsBlock()}
      {renderRitualsBlock()}
      {renderCirclesBlock()}
      {renderLearningBlock()}
      {renderWingCraftBooksBlock()}
      {renderWingReferencesBlock()}
      {renderWingElderLoopsBlock()}
      {renderDirectoryBlock()}
      {renderWingFirstShippedBlock()}
      {renderJournalBlock()}
      {renderWingExitPathsBlock()}
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

  // Growth path
  growthTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 4,
  },
  growthSubtitle: {
    color: Colors.text.secondary,
    fontSize: 12,
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 4,
    lineHeight: 17,
  },
  growthTimeline: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 14,
  },
  growthStep: {
    flexDirection: 'row',
    paddingLeft: 4,
    paddingBottom: 18,
  },
  growthDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 4,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#0A0F14',
  },
  growthConnector: {
    position: 'absolute',
    left: 10,
    top: 20,
    bottom: -4,
    width: 2,
    backgroundColor: '#ffffff14',
  },
  growthBody: { flex: 1 },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  growthLevelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  growthLevelText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  growthWeeks: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },
  growthStepTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  growthStepBody: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  growthSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  growthSkillPill: {
    backgroundColor: '#ffffff12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginTop: 4,
  },
  growthSkillText: { color: Colors.text.secondary, fontSize: 10, fontWeight: '700' },

  // Awards
  awardsScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10 },
  awardCard: { width: 240, marginRight: 12 },
  awardGradient: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 140,
  },
  awardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  awardEmoji: { fontSize: 24 },
  awardYearPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  awardYearText: { fontSize: 10, fontWeight: '800' },
  awardTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  awardBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },

  // Journal
  journalCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  journalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  journalWeek: { color: Colors.text.muted, fontSize: 11, fontWeight: '700' },
  journalAuthor: { color: Colors.text.muted, fontSize: 11 },
  journalTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  journalBody: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  journalSection: { marginTop: 8 },
  journalSectionLabel: {
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  journalBullet: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
  },

  // Ship log
  shipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff0E',
  },
  shipEmoji: { fontSize: 20, marginRight: 10 },
  shipTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  shipReach: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 3,
  },
  shipRightCol: { alignItems: 'flex-end', marginLeft: 8 },
  shipDate: {
    color: Colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  shipKind: {
    color: Colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },

  // Mentorship circles
  circleCard: {
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  circleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleName: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  circleCadence: { fontSize: 11, fontWeight: '800' },
  circleTopic: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  circleFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  circleMeta: { color: Colors.text.muted, fontSize: 10 },
  circleMembers: { color: Colors.text.primary, fontSize: 10, fontWeight: '800' },

  // Learning library
  learningScroll: { paddingRight: 10, paddingBottom: 4 },
  learnCard: {
    width: 220,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ffffff0E',
  },
  learnBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learnKind: {
    color: Colors.tech.neonBlue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  learnDuration: {
    color: Colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  learnTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  learnWhy: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 14,
  },
  learnFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  learnLevel: {
    color: Colors.accent.softGold,
    fontSize: 10,
    fontWeight: '800',
  },
  learnCurator: {
    color: Colors.text.muted,
    fontSize: 10,
  },

  // Rituals
  ritualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  ritualCard: {
    width: '50%',
    padding: 4,
  },
  ritualEmoji: { fontSize: 18 },
  ritualName: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  ritualWhen: {
    color: Colors.tech.neonBlue,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  ritualWhy: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },

  // Playbook
  pbCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  pbTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  pbEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  pbStage: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  pbTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 2 },
  pbDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  pbOutputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  pbOutputLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginRight: 6,
  },
  pbOutputText: { color: Colors.text.secondary, fontSize: 11, flex: 1 },

  // Gear
  gearRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  gearEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  gearTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gearName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  gearPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
  },
  gearPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  gearRole: { color: Colors.text.secondary, fontSize: 11, marginTop: 3 },
  gearNote: { color: Colors.text.muted, fontSize: 10, marginTop: 5, lineHeight: 14 },
  gearOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // Retro
  retroMoodPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  retroMoodText: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  retroMonth: { color: Colors.text.muted, fontSize: 11, marginBottom: 8 },
  retroBlock: {
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  retroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  retroLine: { color: Colors.text.secondary, fontSize: 12, lineHeight: 17, marginBottom: 3 },

  // Collab
  collabCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  collabTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  collabEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  collabTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  collabWings: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  collabStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 8,
  },
  collabStatusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  collabAsk: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  collabBenefit: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  collabLead: { color: Colors.text.muted, fontSize: 10, marginTop: 6, fontStyle: 'italic' },

  // Directory
  dirRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  dirEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  dirTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dirName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  dirTrust: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  dirHint: { color: Colors.tech.neonBlue, fontSize: 11, marginTop: 3, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  dirNote: { color: Colors.text.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },

  // OKRs
  okrCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  okrTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  okrEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  okrObjective: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  okrProgress: { fontSize: 11, fontWeight: '900', marginTop: 4, letterSpacing: 0.5 },
  okrKrRow: { flexDirection: 'row', marginTop: 6, paddingLeft: 32 },
  okrKrBullet: { color: Colors.text.muted, fontSize: 12, marginRight: 6 },
  okrKrText: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, flex: 1 },
  okrBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 10,
    overflow: 'hidden',
  },
  okrBarFill: { height: 4, borderRadius: 2 },

  // Templates
  tplCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  tplTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tplEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  tplName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  tplOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  tplPurpose: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  tplStepRow: { flexDirection: 'row', marginTop: 6, paddingLeft: 4 },
  tplStepIdx: { fontSize: 12, fontWeight: '900', marginRight: 8, width: 16 },
  tplStepText: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, flex: 1 },

  // On-ramp
  onrRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  onrDayCol: { width: 64, alignItems: 'flex-start', marginRight: 10 },
  onrDay: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  onrEmoji: { fontSize: 20, marginTop: 4 },
  onrAction: { color: Colors.text.primary, fontSize: 12, lineHeight: 16 },
  onrOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // Showcase
  scCard: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  scEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  scTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  scVenue: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  scPillRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  scPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scPillText: { color: Colors.text.secondary, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },

  // Feedback norms
  fnCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  fnTopRow: { flexDirection: 'row', alignItems: 'center' },
  fnEmoji: { fontSize: 22, marginRight: 10 },
  fnPrinciple: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  fnDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  fnExample: { color: Colors.text.muted, fontSize: 11, lineHeight: 15, marginTop: 6, fontStyle: 'italic' },

  // --- Phase 3aa: wing tool stack ---
  wtCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  wtTopRow: { flexDirection: 'row', alignItems: 'center' },
  wtEmoji: { fontSize: 22, marginRight: 10 },
  wtTool: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  wtRole: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  wtLicensePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  wtLicenseText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  wtNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },

  // --- Phase 3aa: wing retro signals ---
  wrsCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  wrsTopRow: { flexDirection: 'row', alignItems: 'center' },
  wrsEmoji: { fontSize: 20, marginRight: 10 },
  wrsSignal: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  wrsTonePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  wrsToneText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  wrsNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 30 },

  // --- Phase 3aa: wing exits ---
  weCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  weTopRow: { flexDirection: 'row', alignItems: 'center' },
  weEmoji: { fontSize: 22, marginRight: 10 },
  weSituation: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  weStep: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },
  weHandoff: { color: Colors.text.muted, fontSize: 11, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3aa: wing references ---
  wrfCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  wrfTopRow: { flexDirection: 'row', alignItems: 'center' },
  wrfEmoji: { fontSize: 22, marginRight: 10 },
  wrfTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  wrfAuthor: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700', marginTop: 2 },
  wrfWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3aa: wing collab rituals ---
  wcrCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  wcrTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wcrEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  wcrRitual: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wcrCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  wcrWho: { color: Colors.text.muted, fontSize: 11, marginTop: 6, paddingLeft: 32 },
  wcrOutput: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32 },

  // --- Phase 3ah: craft drills ---
  wcdCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wcdTopRow: { flexDirection: 'row', alignItems: 'center' },
  wcdEmoji: { fontSize: 22, marginRight: 10 },
  wcdName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wcdCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  wcdGoal: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  wcdCheckIn: { color: Colors.accent.softGold, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ah: output promises ---
  wopCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wopTopRow: { flexDirection: 'row', alignItems: 'center' },
  wopEmoji: { fontSize: 22, marginRight: 10 },
  wopOutput: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wopCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  wopSla: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },
  wopOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 4, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ah: craft books ---
  wcbCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wcbTopRow: { flexDirection: 'row', alignItems: 'center' },
  wcbEmoji: { fontSize: 22, marginRight: 10 },
  wcbTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wcbAuthor: { color: Colors.text.muted, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  wcbWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8, paddingLeft: 32 },

  // --- Phase 3ah: brother wings ---
  wbwCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wbwTopRow: { flexDirection: 'row', alignItems: 'center' },
  wbwEmoji: { fontSize: 22, marginRight: 10 },
  wbwPartner: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  wbwCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  wbwCollab: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ah: green commitments ---
  wgcCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wgcTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wgcEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  wgcCommit: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  wgcMeasure: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32, fontStyle: 'italic' },

  // --- Phase 3ah: elder loops ---
  welCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  welTopRow: { flexDirection: 'row', alignItems: 'center' },
  welEmoji: { fontSize: 22, marginRight: 10 },
  welElder: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  welRole: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  welCadence: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 8 },
  welReach: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6, paddingLeft: 32 },

  // --- Phase 3ah: first shipped ---
  wfsCard: { backgroundColor: '#0D141B', borderRadius: 14, padding: 12, marginBottom: 10, borderLeftWidth: 3 },
  wfsTopRow: { flexDirection: 'row', alignItems: 'center' },
  wfsEmoji: { fontSize: 22, marginRight: 10 },
  wfsMoment: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  wfsWho: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  wfsWhen: { fontSize: 11, fontWeight: '900' },
});

export default TaruWingsScreen;
