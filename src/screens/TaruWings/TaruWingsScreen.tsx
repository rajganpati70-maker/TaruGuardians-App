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
      {renderGrowthPathBlock()}
      {renderOpenRoles()}
      {renderProjectsBlock()}
      {renderShipLogBlock()}
      {renderAwardsBlock()}
      {renderEventsBlock()}
      {renderRitualsBlock()}
      {renderCirclesBlock()}
      {renderLearningBlock()}
      {renderJournalBlock()}
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
});

export default TaruWingsScreen;
