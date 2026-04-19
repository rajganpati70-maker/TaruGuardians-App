// =====================================================
// TARU GUARDIANS — TEAM DIRECTORY (Premium)
// Departments · leadership · members · projects · analytics
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
import { TeamMember, Department, Project } from '../../types/navigation';

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
  { id: 'research', name: 'Research', icon: '🔬', color: '#A78BFA', memberCount: 12, description: 'Policy briefs, sustainability benchmarks, whitepapers.' },
  { id: 'sustainability', name: 'Sustainability', icon: '🌱', color: '#22C55E', memberCount: 14, description: 'Campus greening, zero-waste, plantation drives.' },
  { id: 'content', name: 'Content', icon: '✍️', color: '#F59E0B', memberCount: 11, description: 'Long-form writing, newsletter, documentation.' },
];

type DeptId = typeof DEPARTMENTS[number]['id'] | 'all';
type SortKey = 'name-asc' | 'name-desc' | 'year-recent' | 'year-oldest' | 'dept-asc';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'name-asc', label: 'Name · A → Z', icon: '🔤' },
  { key: 'name-desc', label: 'Name · Z → A', icon: '🔡' },
  { key: 'year-recent', label: 'Year · newest first', icon: '🆕' },
  { key: 'year-oldest', label: 'Year · oldest first', icon: '📜' },
  { key: 'dept-asc', label: 'Department · A → Z', icon: '🏛️' },
];

// -----------------------------------------------------
// Extended TeamMember
// -----------------------------------------------------

interface ExtTeamMember extends TeamMember {
  tier: 'lead' | 'core' | 'member';
  pronouns?: string;
  availability?: 'active' | 'light-load' | 'mentor-only';
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
  dept: string,
  year: string,
  bio: string,
  skills: string[],
  focusAreas: string[],
  achievements: string[],
  tier: 'lead' | 'core' | 'member',
  joinedDate: string,
  hoursContributed: number,
  eventsOrganized: number,
  projectsShipped: number,
  opts?: Partial<ExtTeamMember> & { social?: TeamMember['socialLinks'] }
): ExtTeamMember => ({
  id: String(id),
  name,
  role,
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
  availability: opts?.availability ?? 'active',
  funFact: opts?.funFact,
  focusAreas,
  tagline: opts?.tagline,
  joinedDate,
  hoursContributed,
  eventsOrganized,
  projectsShipped,
});

const P = (id: number, title: string, description: string, category: string, technologies: string[], status: Project['status'], startDate: string, teamSize: number, endDate?: string): Project => ({
  id: String(id),
  title,
  description,
  category,
  imageUrl: '',
  technologies,
  status,
  startDate,
  endDate,
  teamSize,
});

// -----------------------------------------------------
// Members dataset (~60 entries)
// -----------------------------------------------------

const TEAM_MEMBERS: ExtTeamMember[] = [
  // Leadership — tier: lead
  makeMember(
    1, 'Aarav Sharma', 'President', 'leadership', '2024',
    'Building a calm, collaborative leadership table. Believes a club compounds when members feel safe to disagree loudly and ship quietly.',
    ['Strategy', 'Public Speaking', 'People Ops', 'Stakeholder Mgmt'],
    ['Annual roadmap', 'Alumni relations', 'Governance'],
    ['Young Environmentalist Award 2025', '40 Under 40 Campus List', 'Hosted 3 national-level summits'],
    'lead', '2022-08-15', 1240, 38, 7,
    {
      pronouns: 'he/him',
      availability: 'active',
      tagline: 'Nice people, big bets.',
      funFact: 'Runs 10km every Sunday — has never missed one in 3 years.',
      social: { linkedin: 'https://linkedin.com/in/aarav-sharma', twitter: 'https://twitter.com/aaravsharma' },
      projects: [
        P(101, 'Annual Impact Report', 'Published first public annual report — 64 pages, open to all.', 'Governance', ['Notion', 'Figma'], 'completed', '2025-04-01', 6, '2025-06-20'),
        P(102, 'Alumni Mentorship Program', 'Launched paid-mentorship-free 5-week alumni track.', 'Programs', ['Airtable', 'Calendly'], 'ongoing', '2025-09-10', 12),
      ],
    }
  ),
  makeMember(
    2, 'Priya Patel', 'Vice President', 'leadership', '2024',
    'Recovering perfectionist. Currently obsessed with making onboarding the best 14 days of a new member\'s semester.',
    ['Operations', 'Facilitation', 'Conflict Mediation', 'Writing'],
    ['Onboarding', 'Weekly cadence', 'Culture'],
    ['Excellence in Leadership Award', 'Led Diversity & Inclusion overhaul'],
    'lead', '2022-09-01', 1160, 30, 5,
    { pronouns: 'she/her', tagline: 'Kindness scales. Chaos doesn\'t.', funFact: 'Has organised 40+ book-club sessions since Class 9.' }
  ),
  makeMember(
    3, 'Raj Mehra', 'Tech Head', 'technology', '2025',
    'Full-stack engineer with a soft spot for small open-source tools. Ships weekly.',
    ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'CI/CD'],
    ['App platform', 'Dev tooling', 'Automation'],
    ['Tech Innovator Award', 'Built club app v1 in a weekend'],
    'lead', '2023-01-12', 960, 18, 9,
    {
      social: { linkedin: 'https://linkedin.com/in/raj-mehra', github: 'https://github.com/rajmehra', portfolio: 'https://raj.dev' },
      tagline: 'The best feature is shipped.',
      funFact: 'Has 3 AUR packages + 1 weekend compiler project.',
      projects: [
        P(201, 'Taru App v1', 'React Native club app with 6-tab nav, offline mode, push.', 'Platform', ['React Native', 'Expo', 'TS'], 'ongoing', '2025-08-01', 5),
        P(202, 'Attendance automator', 'QR + NFC attendance, no more google-forms chaos.', 'Internal', ['React', 'Supabase'], 'completed', '2025-01-10', 3, '2025-03-05'),
      ],
    }
  ),
  makeMember(
    4, 'Ananya Singh', 'Events Head', 'events', '2025',
    'Loves run-of-show spreadsheets more than she\'ll admit. Absolute magician with last-minute changes.',
    ['Event Ops', 'Budgeting', 'Vendor Mgmt', 'Logistics'],
    ['Hackathons', 'Flagship summits', 'Outreach drives'],
    ['Best Event Award 2025', 'Zero-incident record across 14 events'],
    'lead', '2023-03-20', 1080, 42, 4,
    { pronouns: 'she/her', tagline: 'Run-of-show is a love language.' }
  ),
  makeMember(
    5, 'Kunal Verma', 'Outreach Head', 'marketing', '2024',
    'Turns complicated stories into two-sentence pitches. Journalism brain, designer eyes.',
    ['Copywriting', 'Social Strategy', 'PR', 'Partnerships'],
    ['Instagram presence', 'Press kits', 'Alumni amplification'],
    ['Best Outreach Award', 'Grew IG follower base 4×'],
    'lead', '2022-10-05', 820, 24, 6
  ),
  makeMember(
    6, 'Neha Gupta', 'Design Head', 'design', '2025',
    'Believes in earthy palettes, generous whitespace, and one bold color per campaign.',
    ['Figma', 'Illustration', 'Motion', 'Typography', 'Brand'],
    ['Identity system', 'Merchandise', 'Motion reels'],
    ['Best Design Award', 'Club rebrand 2025 lead'],
    'lead', '2023-05-15', 910, 20, 8,
    {
      social: { behance: 'https://behance.net/nehagupta', dribbble: 'https://dribbble.com/nehagupta', instagram: 'https://instagram.com/neha.design' },
      tagline: 'Soft colors. Strong opinions.',
    }
  ),
  makeMember(
    7, 'Arjun Kapoor', 'Finance Head', 'finance', '2024',
    'Transparent spreadsheets, ruthless about receipts. Also loves a good chai break.',
    ['Budgeting', 'Grant Writing', 'Audit', 'Negotiation'],
    ['Annual budget', 'Sponsor deals', 'Member reimbursements'],
    ['Secured 3 major sponsorships', 'Introduced open-book spending'],
    'lead', '2022-09-10', 720, 14, 3
  ),
  makeMember(
    8, 'Diya Mishra', 'Sustainability Head', 'sustainability', '2024',
    'Natural-species nerd. Tracks survival rates of every sapling planted by the club.',
    ['Ecological Planning', 'Community Mobilization', 'Policy'],
    ['Plantation drives', 'Zero-waste events', 'Policy briefs'],
    ['Planted 3,200+ native trees', 'Student Environmentalist Award'],
    'lead', '2022-07-22', 1040, 28, 5,
    { tagline: 'Grow slow. Grow native.', funFact: 'Can ID 120+ native tree species at sight.' }
  ),

  // Core — tier: core
  makeMember(
    9, 'Ishaan Roy', 'Events Lead · Hackathons', 'events', '2025',
    'Has run 4 hackathons. Swears by a 6-point run-of-show doc template.',
    ['Event Ops', 'Hackathon Format Design', 'Mentor Matching'],
    ['Hackathons', 'Judging panels'],
    ['Ran 4 hackathons zero-incident'],
    'core', '2023-09-18', 560, 14, 3
  ),
  makeMember(
    10, 'Sara Rehman', 'Events Lead · Workshops', 'events', '2025',
    'Curious about how strangers go from RSVPing to becoming a close team in a 4-hour workshop.',
    ['Facilitation', 'Content Design', 'Audience Research'],
    ['Workshops', 'Masterclasses'],
    ['Designed 12 sold-out workshops'],
    'core', '2023-10-02', 520, 12, 2
  ),
  makeMember(
    11, 'Parth Sinha', 'Tech · Backend', 'technology', '2025',
    'Databases + API design nerd. Always reads the migration script before the PR description.',
    ['Node.js', 'PostgreSQL', 'API Design', 'Testing'],
    ['API', 'Integrations'],
    ['Built 14 internal services'],
    'core', '2024-01-10', 620, 6, 5
  ),
  makeMember(
    12, 'Meher Kaur', 'Tech · Mobile', 'technology', '2026',
    'iOS & Android. Learning Kotlin Multiplatform on weekends.',
    ['Swift', 'Kotlin', 'React Native', 'Accessibility'],
    ['Mobile app', 'A11y'],
    ['Shipped 3 mobile releases'],
    'core', '2024-08-05', 410, 4, 4
  ),
  makeMember(
    13, 'Ayaan Shah', 'Tech · Web', 'technology', '2025',
    'Next.js + Tailwind fan. Cares deeply about lighthouse scores.',
    ['Next.js', 'Tailwind', 'Lighthouse', 'SEO'],
    ['Website'],
    ['Moved site from 52 → 97 perf'],
    'core', '2023-11-22', 530, 5, 3
  ),
  makeMember(
    14, 'Ridhi Nair', 'Design · UI/UX', 'design', '2026',
    'Obsessed with motion. Spends weekends making micro-interactions.',
    ['Figma', 'Motion Design', 'Prototyping'],
    ['Product design', 'Prototypes'],
    ['Built internal icon library'],
    'core', '2024-07-14', 430, 3, 4
  ),
  makeMember(
    15, 'Pranav Das', 'Design · Brand', 'design', '2025',
    'Typography first, always. Zine maker on weekends.',
    ['Brand Identity', 'Editorial Design', 'Print'],
    ['Brand', 'Print'],
    ['Redesigned annual report'],
    'core', '2023-08-30', 480, 7, 2
  ),
  makeMember(
    16, 'Tanvi Rao', 'Design · Motion', 'design', '2026',
    'After Effects + Lottie. Cares about animation that earns its place.',
    ['After Effects', 'Lottie', 'Frame.io'],
    ['Motion', 'Explainers'],
    ['Created intro reel for 3 flagship events'],
    'core', '2024-10-02', 320, 3, 2
  ),
  makeMember(
    17, 'Kabir Malhotra', 'Outreach · Social', 'marketing', '2025',
    'Sticks to schedule. Makes decks that get sent, not shelved.',
    ['Content Strategy', 'Instagram', 'Copywriting'],
    ['Social media', 'Content calendar'],
    ['Grew reach 3×'],
    'core', '2023-10-12', 440, 9, 2
  ),
  makeMember(
    18, 'Sneha Jain', 'Outreach · PR', 'marketing', '2025',
    'Built the alumni newsletter from zero. Now sent to 600+ alumni.',
    ['PR', 'Newsletter', 'Press Relations'],
    ['Alumni newsletter', 'Press'],
    ['Secured media coverage in 4 national outlets'],
    'core', '2023-12-08', 360, 7, 1
  ),
  makeMember(
    19, 'Aman Choudhary', 'Operations · Logistics', 'operations', '2025',
    'Makes sure the coffee is brewed, the cables are tucked, and the AV works before doors open.',
    ['Logistics', 'Vendor Mgmt', 'AV'],
    ['Event logistics', 'Vendor ops'],
    ['Zero AV failures in 20 events'],
    'core', '2023-09-10', 610, 20, 1
  ),
  makeMember(
    20, 'Tanya Khan', 'Operations · Procurement', 'operations', '2026',
    'Has a rolodex of vendors for anything from banners to drone rentals.',
    ['Procurement', 'Negotiation', 'Inventory'],
    ['Procurement', 'Inventory'],
    ['Cut vendor costs 18%'],
    'core', '2024-09-20', 290, 8, 0
  ),
  makeMember(
    21, 'Aditya Jain', 'Research · Policy', 'research', '2024',
    'Fancy about citations. Writes one-pager policy briefs for state-level consultations.',
    ['Policy Research', 'Writing', 'Interviews'],
    ['Policy', 'Research'],
    ['Published 4 policy briefs'],
    'core', '2022-08-30', 540, 4, 3
  ),
  makeMember(
    22, 'Bhoomika Desai', 'Research · Data', 'research', '2026',
    'Spreadsheets → insights → decisions. Loves an honest bar chart.',
    ['Data Analysis', 'SQL', 'Storytelling'],
    ['Member analytics', 'Dashboards'],
    ['Built weekly analytics dashboard'],
    'core', '2024-11-05', 240, 3, 1
  ),
  makeMember(
    23, 'Shaurya Taneja', 'Content · Editorial', 'content', '2025',
    'Long-form writer. Finishes three drafts before the first review.',
    ['Editorial', 'Copywriting', 'Interviews'],
    ['Newsletter', 'Features'],
    ['Wrote 28 long-form pieces'],
    'core', '2023-10-15', 420, 5, 2
  ),
  makeMember(
    24, 'Anika Gupta', 'Content · Documentation', 'content', '2025',
    'Believes documentation is a love letter to future members.',
    ['Technical Writing', 'Knowledge Mgmt', 'Notion'],
    ['Wiki', 'Runbooks'],
    ['Shipped club-wide knowledge base'],
    'core', '2023-11-02', 380, 3, 2
  ),
  makeMember(
    25, 'Rohit Iyer', 'Finance · Sponsorships', 'finance', '2025',
    'Can pitch a sponsor in 90 seconds and still pick up the tab at dinner.',
    ['Sponsorship', 'Negotiation', 'Deal Memos'],
    ['Sponsor pipeline'],
    ['Closed 8 sponsor deals'],
    'core', '2023-08-12', 320, 6, 1
  ),
  makeMember(
    26, 'Simran Kaur', 'Sustainability · Drives', 'sustainability', '2025',
    'Leads monsoon plantation drives. Tracks survival rates like a hawk.',
    ['Project Management', 'Field Ops', 'Monitoring'],
    ['Plantation', 'Field drives'],
    ['Planted 1,200 native saplings with 74% survival'],
    'core', '2023-07-04', 470, 8, 2
  ),

  // Members — tier: member
  makeMember(
    27, 'Harsh Vardhan', 'Design', 'design', '2027',
    'New to the team, already the go-to for quick poster requests.',
    ['Figma', 'Illustration'],
    ['Posters'],
    ['Designed 30+ posters in first semester'],
    'member', '2025-08-10', 90, 1, 0
  ),
  makeMember(
    28, 'Kavya Nair', 'Research', 'research', '2027',
    'First-year nerd for behavioral economics.',
    ['Research', 'Interviews'],
    ['Fieldwork'],
    ['Assisted on 2 policy papers'],
    'member', '2025-08-11', 78, 0, 0
  ),
  makeMember(
    29, 'Ritu Shah', 'Content', 'content', '2027',
    'Writes one essay a week. Calls them "muscle memory for better writing".',
    ['Writing', 'Editing'],
    ['Blog', 'Essays'],
    ['Published 10 essays on the blog'],
    'member', '2025-08-08', 85, 1, 0
  ),
  makeMember(
    30, 'Gaurav Kapoor', 'Technology', 'technology', '2027',
    'Self-learned Python in Class 11, now mentoring juniors in JS.',
    ['Python', 'JavaScript', 'Algorithms'],
    ['Tutorials'],
    ['Mentors 8 juniors'],
    'member', '2025-08-12', 110, 2, 1
  ),
  makeMember(
    31, 'Nandini Rao', 'Outreach', 'marketing', '2026',
    'Instagram reels queen. Watches 2 hrs of trends every Sunday.',
    ['Video Editing', 'Reels'],
    ['Short form video'],
    ['Made 3 viral reels (> 50k views)'],
    'member', '2024-10-02', 180, 2, 0
  ),
  makeMember(
    32, 'Yash Agarwal', 'Events', 'events', '2027',
    'First-year volunteer. Runs 4 different clubs, somehow finds time for all.',
    ['Coordination', 'Hospitality'],
    ['Volunteer Ops'],
    ['Led first-year freshers orientation'],
    'member', '2025-08-09', 70, 1, 0
  ),
  makeMember(
    33, 'Sanjay Rathore', 'Operations', 'operations', '2026',
    'Quiet executor. Gets things done without drama.',
    ['Logistics', 'Inventory'],
    ['Ops'],
    ['Streamlined event checklist'],
    'member', '2024-09-16', 220, 4, 0
  ),
  makeMember(
    34, 'Megha Sinha', 'Operations', 'operations', '2025',
    'Spreadsheets are her love language.',
    ['Excel', 'Scheduling'],
    ['Scheduling'],
    ['Wrangled master event calendar'],
    'member', '2023-11-12', 280, 5, 1
  ),
  makeMember(
    35, 'Rahul Das', 'Technology', 'technology', '2027',
    'QA enthusiast. Writes tests for fun.',
    ['QA', 'Testing', 'Cypress'],
    ['QA'],
    ['Wrote 80+ end-to-end tests'],
    'member', '2025-08-05', 130, 0, 2
  ),
  makeMember(
    36, 'Komal Anand', 'Content', 'content', '2026',
    'Transcribes event recordings within 48 hrs. A hidden gem.',
    ['Transcription', 'Editing'],
    ['Documentation'],
    ['Transcribed 30 events'],
    'member', '2024-10-18', 170, 0, 1
  ),
  makeMember(
    37, 'Tanmay Joshi', 'Culture Committee', 'leadership', '2025',
    'Makes sure the club room feels welcoming. Brings snacks every Thursday.',
    ['Community', 'Facilitation'],
    ['Culture'],
    ['Started "no-laptop Fridays"'],
    'core', '2023-09-01', 350, 10, 0
  ),
  makeMember(
    38, 'Priyanshi Jain', 'Outreach · Partnerships', 'marketing', '2025',
    'Loves alumni connection drives.',
    ['Partnerships', 'CRM'],
    ['Partnerships'],
    ['Signed 6 alumni MOUs'],
    'core', '2023-08-18', 330, 6, 0
  ),
  makeMember(
    39, 'Geetika Bhattacharya', 'Sustainability · Awareness', 'sustainability', '2026',
    'Runs monthly campus walks to identify invasive vs native species.',
    ['Biology', 'Community Mobilization'],
    ['Plantation awareness'],
    ['Led 8 campus walks'],
    'member', '2024-08-20', 210, 3, 1
  ),
  makeMember(
    40, 'Siddharth Nadkarni', 'Founders Track Lead', 'leadership', '2024',
    'Angel-invested by his uncle. Laughs about it. Now runs founders-track office hours.',
    ['Entrepreneurship', 'Pitching', 'Finance'],
    ['Founders', 'Office hours'],
    ['Hosted 24 office hours'],
    'core', '2022-10-25', 590, 12, 2
  ),
  makeMember(
    41, 'Shalini Yadav', 'Tech · ML', 'technology', '2025',
    'PyTorch nerd. Writes tutorials nobody reads until they hit a bug, and then they thank her.',
    ['Python', 'PyTorch', 'LLMs'],
    ['ML/LLMs'],
    ['Hosted 3 AI labs'],
    'core', '2023-11-22', 400, 4, 2
  ),
  makeMember(
    42, 'Sana Fatima', 'Outreach · Brand', 'marketing', '2026',
    'Thinks brand = 100 tiny decisions done consistently.',
    ['Brand Strategy', 'Copywriting'],
    ['Brand'],
    ['Rewrote mission statement'],
    'core', '2024-09-18', 270, 3, 0
  ),
  makeMember(
    43, 'Karan Mehra', 'Founders Track', 'leadership', '2025',
    'Second-time founder. First one failed hard, teaches the lessons now.',
    ['Product', 'Founding Stories'],
    ['Founders'],
    ['Mentored 6 teams'],
    'core', '2023-09-25', 300, 5, 0
  ),
  makeMember(
    44, 'Nisha Patel', 'Sustainability · Energy', 'sustainability', '2025',
    'Energy-audit enthusiast. Thinks LEDs are underrated.',
    ['Energy Engineering', 'Measurement'],
    ['Energy'],
    ['Reduced club room energy 22%'],
    'core', '2023-09-15', 280, 5, 1
  ),
  makeMember(
    45, 'Vikram Khanna', 'Events · Hackathons', 'events', '2026',
    'Hackathon mentor pool organizer.',
    ['Hackathons', 'Mentor Ops'],
    ['Hackathons'],
    ['Built 40-person mentor pool'],
    'member', '2024-10-15', 230, 4, 0
  ),
  makeMember(
    46, 'Lavanya Iyer', 'Partnerships · NGO', 'marketing', '2025',
    'Bridges NGO + club. Her co-designed programs have run 6 semesters.',
    ['NGO Partnerships', 'Program Design'],
    ['NGO partnerships'],
    ['Launched Tech for Good with 2 NGOs'],
    'core', '2023-08-22', 420, 8, 2
  ),
  makeMember(
    47, 'Parinita Deshpande', 'Design · Print', 'design', '2027',
    'Risograph enthusiast. Makes zines for every major campaign.',
    ['Print', 'Zines', 'Riso'],
    ['Print design'],
    ['Made 4 zines'],
    'member', '2025-08-04', 95, 1, 0
  ),
  makeMember(
    48, 'Harshita Sen', 'Research · Climate', 'research', '2025',
    'Focused on regional climate resilience policy.',
    ['Climate Research', 'GIS', 'Writing'],
    ['Climate'],
    ['Co-authored regional climate brief'],
    'core', '2023-08-18', 360, 3, 2
  ),
  makeMember(
    49, 'Nandita Rao', 'Operations · Safety', 'operations', '2026',
    'First-aid trained. Runs the safety briefing before every event.',
    ['Safety', 'First Aid'],
    ['Safety'],
    ['Zero safety incidents in 18 events'],
    'core', '2024-09-05', 240, 6, 0
  ),
  makeMember(
    50, 'Tejas Shetty', 'Operations · Process', 'operations', '2024',
    'Writes meeting minutes like a pro. Single-handedly saved years of institutional memory.',
    ['Process Design', 'Minutes', 'Docs'],
    ['Process'],
    ['Rolled out meeting-minutes template club-wide'],
    'core', '2022-09-25', 520, 12, 1
  ),
  makeMember(
    51, 'Bhoomika Dewan', 'Women In Tech Chair', 'leadership', '2025',
    'Community-first. Started the Ladies-in-Tech chapter.',
    ['Community Design', 'Mentorship'],
    ['Ladies in Tech'],
    ['Founded LIT chapter'],
    'core', '2023-08-05', 360, 9, 1
  ),
  makeMember(
    52, 'Divya Menon', 'Inclusion Lead', 'leadership', '2024',
    'Mental-health first-aid trained. Runs anonymous support channel.',
    ['Counseling', 'Community'],
    ['Wellbeing'],
    ['Trained 10 wing heads in MHFA'],
    'core', '2022-10-05', 420, 7, 0
  ),
  makeMember(
    53, 'Dev Shukla', 'Newcomer', 'events', '2027',
    'Joined 2 months ago. Already volunteers every weekend.',
    ['Hospitality', 'Volunteer Ops'],
    ['Volunteer ops'],
    ['Volunteered at 6 events'],
    'member', '2025-09-15', 48, 2, 0
  ),
  makeMember(
    54, 'Anaya Verma', 'Content · Creative', 'content', '2026',
    'Writes fiction on weekends. Brings that energy to club newsletters.',
    ['Creative Writing', 'Newsletter'],
    ['Newsletter'],
    ['Redesigned newsletter format'],
    'core', '2024-09-14', 290, 3, 1
  ),
  makeMember(
    55, 'Aditya Rao', 'Alumni Relations', 'leadership', '2025',
    'Keeps 600+ alumni engaged. Writes quarterly updates.',
    ['Alumni Relations', 'CRM'],
    ['Alumni'],
    ['Planned alumni weekend'],
    'core', '2023-08-20', 440, 7, 2
  ),
  makeMember(
    56, 'Mitali Chopra', 'Design · Illustrator', 'design', '2027',
    'Sketches everything before going digital.',
    ['Illustration', 'Sketching'],
    ['Illustrations'],
    ['Made 20+ custom illustrations'],
    'member', '2025-08-22', 82, 1, 0
  ),
  makeMember(
    57, 'Ashish Gokhale', 'Research Lead · Economics', 'research', '2024',
    'Eco grad. Writes crisp 2-pagers. Never goes past 2 pages.',
    ['Economics', 'Writing'],
    ['Research'],
    ['Co-led 2 sector studies'],
    'core', '2022-09-12', 380, 2, 2
  ),
  makeMember(
    58, 'Shruti Bansal', 'Marketing Lead · Video', 'marketing', '2026',
    'Directs the club short-film projects.',
    ['Filmmaking', 'Production'],
    ['Video'],
    ['Directed 3 short films'],
    'core', '2024-08-18', 260, 4, 2
  ),
  makeMember(
    59, 'Mayank Desai', 'Tech · Data', 'technology', '2025',
    'Loves dbt + Looker. Dreams of a world where everyone trusts their dashboards.',
    ['SQL', 'dbt', 'Looker'],
    ['Analytics'],
    ['Shipped 3 analytics dashboards'],
    'core', '2023-10-28', 360, 3, 3
  ),
  makeMember(
    60, 'Pooja Bhalla', 'Sustainability · Food', 'sustainability', '2026',
    'Built the zero-waste catering checklist.',
    ['Sustainability', 'Catering'],
    ['Zero-waste catering'],
    ['Cut event food waste 60%'],
    'core', '2024-08-30', 220, 5, 0
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
const coreMembers = TEAM_MEMBERS.filter((m) => m.tier === 'core');
const everyoneElse = TEAM_MEMBERS.filter((m) => m.tier === 'member');

const departmentCounts: Record<string, number> = DEPARTMENTS.reduce((acc, d) => {
  acc[d.id] = TEAM_MEMBERS.filter((m) => m.department === d.id).length;
  return acc;
}, {} as Record<string, number>);

// -----------------------------------------------------
// Department analytics
// -----------------------------------------------------

interface DeptAnalytic {
  id: string;
  name: string;
  color: string;
  headcount: number;
  hours: number;
  events: number;
  projects: number;
  avgHoursPerMember: number;
  projectsPerMember: number;
  retention: number;
}

const DEPT_ANALYTICS: DeptAnalytic[] = DEPARTMENTS.map((d) => {
  const members = TEAM_MEMBERS.filter((m) => m.department === d.id);
  const hc = members.length || 1;
  const hours = members.reduce((acc, m) => acc + m.hoursContributed, 0);
  const events = members.reduce((acc, m) => acc + m.eventsOrganized, 0);
  const projects = members.reduce((acc, m) => acc + m.projectsShipped, 0);
  return {
    id: d.id,
    name: d.name,
    color: d.color,
    headcount: members.length,
    hours,
    events,
    projects,
    avgHoursPerMember: Math.round(hours / hc),
    projectsPerMember: Number((projects / hc).toFixed(2)),
    retention:
      d.id === 'leadership' ? 98 :
      d.id === 'events' ? 86 :
      d.id === 'technology' ? 91 :
      d.id === 'design' ? 88 :
      d.id === 'marketing' ? 82 :
      d.id === 'operations' ? 84 :
      d.id === 'finance' ? 90 :
      d.id === 'research' ? 85 :
      d.id === 'sustainability' ? 93 : 87,
  };
});

// -----------------------------------------------------
// Mentorship tree — who mentors whom
// -----------------------------------------------------

interface MentorshipNode {
  mentorId: string;
  menteeIds: string[];
  cadence: string;
  focus: string;
}

const MENTORSHIP_TREE: MentorshipNode[] = [
  { mentorId: 'tm-1', menteeIds: ['tm-11', 'tm-12', 'tm-21'], cadence: 'Weekly 1:1 · Wed 6pm', focus: 'Leadership rotation · delegation · feedback craft.' },
  { mentorId: 'tm-2', menteeIds: ['tm-13', 'tm-22'], cadence: 'Bi-weekly · Fri', focus: 'Event ops playbook · on-the-day command.' },
  { mentorId: 'tm-3', menteeIds: ['tm-14', 'tm-23', 'tm-24'], cadence: 'Weekly pair-programming · Tue', focus: 'RN performance · release discipline · triage.' },
  { mentorId: 'tm-4', menteeIds: ['tm-15', 'tm-25'], cadence: 'Fortnightly crits', focus: 'Design systems · motion fluency.' },
  { mentorId: 'tm-5', menteeIds: ['tm-16', 'tm-26'], cadence: 'Weekly story-lab', focus: 'Long-form editorial · newsletter cadence.' },
  { mentorId: 'tm-6', menteeIds: ['tm-17', 'tm-27'], cadence: 'Weekly stand-up', focus: 'Budget discipline · vendor trust.' },
  { mentorId: 'tm-7', menteeIds: ['tm-18', 'tm-28'], cadence: 'Monthly portfolio review', focus: 'Grant writing · research briefs.' },
  { mentorId: 'tm-8', menteeIds: ['tm-19', 'tm-20', 'tm-29'], cadence: 'Tue & Sat field pairing', focus: 'Plantation drives · campus ops safety.' },
];

// -----------------------------------------------------
// Member testimonials
// -----------------------------------------------------

interface TeamTestimonial {
  id: string;
  authorId: string;
  author: string;
  role: string;
  dept: string;
  color: string;
  body: string;
  joined: string;
}

const TEAM_TESTIMONIALS: TeamTestimonial[] = [
  {
    id: 'tt-1',
    authorId: 'tm-11',
    author: 'Kavya Iyer',
    role: 'Event ops',
    dept: 'Events',
    color: '#F97316',
    body: 'Joined with 0 event experience. 8 months later I was running a 400-person hackathon — with a proper run-of-show and a team I trusted. Nobody here lets you hide. Kindly.',
    joined: 'Aug 2024',
  },
  {
    id: 'tt-2',
    authorId: 'tm-13',
    author: 'Rohit Bansal',
    role: 'RN contributor',
    dept: 'Technology',
    color: '#38BDF8',
    body: 'My first merged PR was 3 lines. The maintainer spent 40 minutes reviewing it. A year later I ran release rotations. The mentorship is real.',
    joined: 'Oct 2023',
  },
  {
    id: 'tt-3',
    authorId: 'tm-14',
    author: 'Ishita Kalra',
    role: 'Visual designer',
    dept: 'Design',
    color: '#F472B6',
    body: 'I came in from fine-arts, not tech. The club didn\'t treat me like a decoration. My posters got critiqued like code — kindly, honestly, and with a trail.',
    joined: 'Jan 2024',
  },
  {
    id: 'tt-4',
    authorId: 'tm-16',
    author: 'Ananya Pillai',
    role: 'Content lead',
    dept: 'Content',
    color: '#F59E0B',
    body: 'I wrote three drafts of my first article. The editor didn\'t rewrite it; she made me sit with it. I still use that practice every time I write.',
    joined: 'Feb 2023',
  },
  {
    id: 'tt-5',
    authorId: 'tm-18',
    author: 'Nivedita Rao',
    role: 'Researcher',
    dept: 'Research',
    color: '#A78BFA',
    body: 'The research wing taught me that a good brief is more honest than a good deck. Our sustainability benchmarks now feed three campus policies.',
    joined: 'Sep 2023',
  },
  {
    id: 'tt-6',
    authorId: 'tm-19',
    author: 'Aarav Menon',
    role: 'Sustainability lead',
    dept: 'Sustainability',
    color: '#22C55E',
    body: 'First plantation drive: 12 people. Second: 28. Twelfth: 180. Real impact compounds. So does trust.',
    joined: 'Jun 2022',
  },
];

// -----------------------------------------------------
// Apply-to-join form data
// -----------------------------------------------------

interface ApplyStep {
  id: string;
  emoji: string;
  title: string;
  body: string;
}

const APPLY_STEPS: ApplyStep[] = [
  { id: 'as-1', emoji: '📝', title: 'Fill the form', body: 'Name, wing of interest, one short paragraph on why Taru.' },
  { id: 'as-2', emoji: '☕', title: 'Coffee chat', body: 'A 20-minute chat with a wing member. No stakes. We actually listen.' },
  { id: 'as-3', emoji: '🔧', title: 'Tiny onboarding task', body: 'A real — but small — task in your wing of choice. Paired with a senior.' },
  { id: 'as-4', emoji: '🌱', title: 'Orientation week', body: 'Meet the council, the rituals, the handbook, the tools. No rush.' },
  { id: 'as-5', emoji: '🤝', title: 'Welcome email', body: 'You get a personal note, a pair, and a first project in under 2 weeks.' },
];

// -----------------------------------------------------
// On-call rota (this week)
// -----------------------------------------------------

interface OnCallEntry {
  id: string;
  day: string;
  date: string;
  name: string;
  wing: string;
  color: string;
  backup: string;
  hours: string;
}

const ON_CALL: OnCallEntry[] = [
  { id: 'oc-1', day: 'Mon', date: 'Apr 21', name: 'Rohit B.',    wing: 'Web/App',  color: '#00D4FF', backup: 'Meera I.',    hours: '09:00 – 18:00' },
  { id: 'oc-2', day: 'Tue', date: 'Apr 22', name: 'Ishita D.',   wing: 'GD',       color: '#F472B6', backup: 'Kabir M.',    hours: '10:00 – 17:00' },
  { id: 'oc-3', day: 'Wed', date: 'Apr 23', name: 'Ananya P.',   wing: 'Content',  color: '#4CAF50', backup: 'Nivedita S.', hours: '09:30 – 17:30' },
  { id: 'oc-4', day: 'Thu', date: 'Apr 24', name: 'Aryan V.',    wing: 'Video',    color: '#FFD54F', backup: 'Alia N.',     hours: '10:00 – 18:00' },
  { id: 'oc-5', day: 'Fri', date: 'Apr 25', name: 'Vivaan S.',   wing: 'Web/App',  color: '#00D4FF', backup: 'Meera I.',    hours: '09:00 – 18:00 (release)' },
  { id: 'oc-6', day: 'Sat', date: 'Apr 26', name: 'Mira J.',     wing: 'Photo',    color: '#AB47BC', backup: 'Dhruv G.',    hours: '07:00 – 12:00' },
  { id: 'oc-7', day: 'Sun', date: 'Apr 27', name: 'Kavya R.',    wing: 'PR',       color: '#EF6C00', backup: 'Dhruv G.',    hours: '11:00 – 16:00' },
];

// -----------------------------------------------------
// Standup log
// -----------------------------------------------------

interface StandupEntry {
  id: string;
  date: string;
  author: string;
  wing: string;
  yesterday: string;
  today: string;
  block: string;
  color: string;
}

const STANDUPS: StandupEntry[] = [
  { id: 'su-1', date: 'Apr 19', author: 'Ananya P.',  wing: 'Content', color: '#4CAF50', yesterday: 'Closed first draft of sapling-survival long-form · 2k words.',                        today: 'Edit pass 2 · read-aloud with Nivedita at 17:30.', block: 'Need 3 more quotes from the field team.' },
  { id: 'su-2', date: 'Apr 19', author: 'Rohit B.',   wing: 'Web/App', color: '#00D4FF', yesterday: 'Triaged 14 RN issues · merged 4 small PRs · cut v1.3.1 candidate build.',                today: 'Candidate soak test · open Friday release PR.',     block: 'Android 11 crash still on Moto G30 · need one more repro.' },
  { id: 'su-3', date: 'Apr 19', author: 'Ishita D.',  wing: 'GD',      color: '#F472B6', yesterday: 'Repair café flyer v2 · Kannada + English locked.',                                        today: 'Earth Day poster kit export · 12 templates.',       block: 'None.' },
  { id: 'su-4', date: 'Apr 19', author: 'Aryan V.',   wing: 'Video',   color: '#FFD54F', yesterday: 'Reel #44 second cut · alumni fireside recording loaded.',                                today: 'Sound pass · deliver to press@ by 20:00.',           block: 'Waiting on thumbnails from GD.' },
  { id: 'su-5', date: 'Apr 19', author: 'Mira J.',    wing: 'Photo',   color: '#AB47BC', yesterday: 'Cubbon Park walk · 37 frames, 12 picks, 6 shortlisted.',                                today: 'Write photo-story captions · share draft with Ananya.', block: 'None.' },
  { id: 'su-6', date: 'Apr 19', author: 'Kavya R.',   wing: 'PR',      color: '#EF6C00', yesterday: 'Sponsor outreach batch · 12 calls · 2 warm leads.',                                     today: 'Follow up with Canopy Partners · finalize sponsor pitch.', block: 'Awaiting sponsor pitch template sign-off from council.' },
  { id: 'su-7', date: 'Apr 19', author: 'Meera I.',   wing: 'Web/App', color: '#00D4FF', yesterday: 'Architecture Tea · 8 members · decided on tanstack query for v1.4.',                     today: 'Spike on cache layer · write 1-pager for review.',  block: 'None.' },
  { id: 'su-8', date: 'Apr 19', author: 'Nivedita S.', wing: 'Content', color: '#66BB6A', yesterday: 'Monsoon issue editorial planning · 6 writers assigned.',                                today: 'Review drafts · open Voice Lab session.',            block: 'Still waiting on one alumni interview slot.' },
];

// -----------------------------------------------------
// Club traditions
// -----------------------------------------------------

interface Tradition {
  id: string;
  title: string;
  body: string;
  cadence: string;
  emoji: string;
  color: string;
}

const TRADITIONS: Tradition[] = [
  { id: 'td-1', title: 'First-Friday show-and-tell',      cadence: 'Monthly',   body: 'Every first Friday · three-minute show-and-tell per wing. Drafts welcome.',                    emoji: '🎤', color: '#4CAF50' },
  { id: 'td-2', title: 'Handbook Day',                    cadence: 'Quarterly', body: 'One full afternoon to edit the handbook together. Snacks. No outcomes required.',            emoji: '📖', color: '#22C55E' },
  { id: 'td-3', title: 'Sapling-season kick-off',         cadence: 'Yearly',    body: 'First planting drive of the season · whole club shows up · alumni join virtually.',          emoji: '🌱', color: '#16A34A' },
  { id: 'td-4', title: 'Crit Kindly week',                cadence: 'Yearly',    body: 'A full week of warm critique across wings. You bring a draft · leave with 3 reader notes.', emoji: '🤲', color: '#F472B6' },
  { id: 'td-5', title: 'Annual alumni fireside',          cadence: 'Yearly',    body: 'Five alumni · five stories · one long evening · open to the whole campus.',                  emoji: '🔥', color: '#EF4444' },
  { id: 'td-6', title: 'Quiet hour',                       cadence: 'Weekly',    body: 'One hour on Thursday where nobody pings anyone · deep work or a walk · either is fine.',   emoji: '🌙', color: '#A78BFA' },
  { id: 'td-7', title: 'Weekly ship-and-thank',            cadence: 'Weekly',    body: 'Friday closeout · name what shipped · name who made it possible · end on a thank-you.',     emoji: '🙏', color: '#F59E0B' },
  { id: 'td-8', title: 'New-wing taster',                  cadence: 'Seasonal',  body: 'Every season you can shadow a wing you don\'t belong to · no commitment · just curiosity.', emoji: '👀', color: '#38BDF8' },
];

// -----------------------------------------------------
// Wall of thanks
// -----------------------------------------------------

interface ThankEntry {
  id: string;
  date: string;
  from: string;
  to: string;
  note: string;
  wing: string;
  color: string;
}

const THANKS: ThankEntry[] = [
  { id: 'th-1', date: 'Apr 19', from: 'Rohit B.',    to: 'Meera I.',     wing: 'Web/App', color: '#00D4FF', note: 'Thanks for staying late to untangle the RSVP permissions race. That was not a small thing.' },
  { id: 'th-2', date: 'Apr 18', from: 'Ananya P.',   to: 'Nivedita S.',  wing: 'Content', color: '#4CAF50', note: 'Your edit pass saved the sapling piece. Kept the honesty, cut the fluff.' },
  { id: 'th-3', date: 'Apr 18', from: 'Ishita D.',   to: 'Kabir M.',     wing: 'GD',      color: '#F472B6', note: 'Typography crit this Wednesday was the gentlest I\'ve seen. Thank you for holding the room.' },
  { id: 'th-4', date: 'Apr 17', from: 'Kavya R.',    to: 'Dhruv G.',     wing: 'PR',      color: '#EF6C00', note: 'You took over the cold call when I lost my voice. You sounded more me than me.' },
  { id: 'th-5', date: 'Apr 16', from: 'Aryan V.',    to: 'Alia N.',      wing: 'Video',   color: '#FFD54F', note: 'Your sound pass made the reel land. It felt like breathing.' },
  { id: 'th-6', date: 'Apr 15', from: 'Mira J.',     to: 'Riya G.',      wing: 'Photo',   color: '#AB47BC', note: 'First-year carrying the backup body all morning. You stuck with us till the light went bad.' },
  { id: 'th-7', date: 'Apr 15', from: 'Vivaan S.',   to: 'Rohit B.',     wing: 'Web/App', color: '#00D4FF', note: 'You could have fixed this yourself in ten minutes. You taught me instead. Thank you.' },
  { id: 'th-8', date: 'Apr 14', from: 'Alia N.',     to: 'Mira J.',      wing: 'Photo',   color: '#AB47BC', note: 'Sunday walk · your print-and-pin ritual is the thing that actually kept me coming.' },
  { id: 'th-9', date: 'Apr 14', from: 'Nivedita S.', to: 'Ananya P.',    wing: 'Content', color: '#4CAF50', note: 'You read my draft twice without me asking. That\'s how you learn someone\'s voice.' },
  { id: 'th-10', date: 'Apr 13', from: 'Kabir M.',    to: 'Ishita D.',    wing: 'GD',      color: '#F472B6', note: 'Thanks for telling me the kerning was fine. It wasn\'t. I fixed it anyway. But I appreciated the kindness.' },
];

// -----------------------------------------------------
// Team values (tiny, steady-state)
// -----------------------------------------------------

interface TeamValue {
  id: string;
  value: string;
  body: string;
  emoji: string;
  color: string;
}

const TEAM_VALUES: TeamValue[] = [
  { id: 'tv-1', value: 'Ship humane software',       body: 'Fast enough to learn from · slow enough to not break people.',     emoji: '💚', color: '#22C55E' },
  { id: 'tv-2', value: 'Mentor by default',           body: 'If you know it · teach it. If you don\'t · ask without shame.',      emoji: '🧭', color: '#38BDF8' },
  { id: 'tv-3', value: 'Explain the why',             body: 'Write the doc. Link the decision. Future-you will thank you.',      emoji: '📎', color: '#A78BFA' },
  { id: 'tv-4', value: 'Credit loudly',                body: 'Name who helped. In the commit · in the caption · in the crowd.',    emoji: '🏷️', color: '#F59E0B' },
  { id: 'tv-5', value: 'Repair over blame',            body: 'Broken things get fixed. Postmortems teach. Shame does not.',         emoji: '🧰', color: '#EF4444' },
  { id: 'tv-6', value: 'Rest is part of work',         body: 'Burnout is not a badge. Sleep · walks · friends · food.',             emoji: '🛌', color: '#6366F1' },
];

// -----------------------------------------------------
// Component
// -----------------------------------------------------

const TeamScreen: React.FC = () => {
  // ------ State ------
  const [selectedDept, setSelectedDept] = useState<DeptId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tierFilter, setTierFilter] = useState<'all' | 'lead' | 'core' | 'member'>('all');
  const [onlyMentors, setOnlyMentors] = useState(false);
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
  const filtered = useMemo(() => {
    let list: ExtTeamMember[] = TEAM_MEMBERS;

    if (selectedDept !== 'all') list = list.filter((m) => m.department === selectedDept);
    if (tierFilter !== 'all') list = list.filter((m) => m.tier === tierFilter);
    if (onlyMentors) list = list.filter((m) => m.availability !== 'light-load');

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.bio.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q)) ||
          m.focusAreas.some((f) => f.toLowerCase().includes(q))
      );
    }

    switch (sortKey) {
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'year-recent':
        list = [...list].sort((a, b) => Number(b.year) - Number(a.year));
        break;
      case 'year-oldest':
        list = [...list].sort((a, b) => Number(a.year) - Number(b.year));
        break;
      case 'dept-asc':
        list = [...list].sort((a, b) => a.department.localeCompare(b.department));
        break;
    }

    return list;
  }, [selectedDept, tierFilter, onlyMentors, searchQuery, sortKey]);

  const hasFilters =
    selectedDept !== 'all' ||
    tierFilter !== 'all' ||
    onlyMentors ||
    searchQuery.trim().length > 0;

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
    setSelectedDept('all');
    setTierFilter('all');
    setOnlyMentors(false);
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
              {totalMembers}+ students · {DEPARTMENTS.length} departments · countless hours. One club, many stories.
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            },
          ]}
        >
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{totalMembers}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#FBBF24' }]}>{leadershipMembers.length}</Text>
            <Text style={styles.statLabel}>Leads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#4ADE80' }]}>{totalEventsOrganized}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#38BDF8' }]}>{totalProjectsShipped}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: '#A78BFA' }]}>{totalHours.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </Animated.View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name, role, skill, focus…"
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

        <View style={styles.tierRow}>
          {(['all', 'lead', 'core', 'member'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTierFilter(t)}
              style={[styles.tierChip, tierFilter === t && styles.tierChipActive]}
            >
              <Text
                style={[styles.tierChipText, tierFilter === t && styles.tierChipTextActive]}
              >
                {t === 'all' ? 'All' : t === 'lead' ? '👑 Leads' : t === 'core' ? '⭐ Core' : '🌱 Members'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderDepartments = () => (
    <Animated.View
      style={{
        opacity: chipAnim,
        transform: [{ translateY: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deptScroll}
      >
        <TouchableOpacity
          onPress={() => setSelectedDept('all')}
          style={[styles.deptChip, selectedDept === 'all' && styles.deptChipActive]}
        >
          <Text style={styles.deptIcon}>🌐</Text>
          <Text
            style={[styles.deptLabel, selectedDept === 'all' && styles.deptLabelActive]}
          >
            All
          </Text>
          <Text style={styles.deptCount}>{totalMembers}</Text>
        </TouchableOpacity>
        {DEPARTMENTS.map((d) => {
          const active = selectedDept === d.id;
          const count = departmentCounts[d.id] ?? 0;
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => setSelectedDept(d.id)}
              style={[
                styles.deptChip,
                active && { borderColor: d.color, backgroundColor: d.color + '22' },
              ]}
            >
              <Text style={styles.deptIcon}>{d.icon}</Text>
              <Text
                style={[styles.deptLabel, active && { color: d.color, fontWeight: '800' }]}
              >
                {d.name}
              </Text>
              <Text style={styles.deptCount}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderHighlights = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏛️ Departments</Text>
          <Text style={styles.sectionCaption}>{DEPARTMENTS.length} wings</Text>
        </View>
        <View style={styles.departmentGrid}>
          {DEPARTMENTS.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setSelectedDept(d.id)}
              activeOpacity={0.9}
              style={[styles.departmentCard, { borderColor: d.color + '44' }]}
            >
              <View style={[styles.departmentIconBubble, { backgroundColor: d.color + '22' }]}>
                <Text style={styles.departmentIcon}>{d.icon}</Text>
              </View>
              <Text style={styles.departmentName}>{d.name}</Text>
              <Text style={styles.departmentCount}>{departmentCounts[d.id] ?? 0} members</Text>
              <Text style={styles.departmentDesc} numberOfLines={3}>
                {d.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderLeadershipBoard = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>👑 Leadership</Text>
          <Text style={styles.sectionCaption}>{leadershipMembers.length} leads</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={IS_TABLET ? 280 : SCREEN_WIDTH * 0.7}
          decelerationRate="fast"
          contentContainerStyle={styles.leaderScroll}
        >
          {leadershipMembers.map((m) => {
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
                    <LinearGradient
                      colors={[dept?.color ?? '#FFD700', '#F59E0B']}
                      style={[styles.leaderAvatar, { width: LEAD_AVATAR, height: LEAD_AVATAR, borderRadius: LEAD_AVATAR / 2 }]}
                    >
                      <Text style={styles.leaderAvatarText}>
                        {m.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.leaderName} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text style={styles.leaderRole} numberOfLines={1}>
                    {m.role}
                  </Text>
                  {m.tagline ? (
                    <Text style={styles.leaderTagline} numberOfLines={2}>
                      "{m.tagline}"
                    </Text>
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
      </View>
    );
  };

  const renderTopContributors = () => {
    if (hasFilters) return null;
    const sortedByHours = [...TEAM_MEMBERS]
      .filter((m) => m.tier !== 'lead')
      .sort((a, b) => b.hoursContributed - a.hoursContributed)
      .slice(0, 6);
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>⭐ Top Contributors</Text>
          <Text style={styles.sectionCaption}>Outside of leads</Text>
        </View>
        <View style={styles.contribWrap}>
          {sortedByHours.map((m, idx) => {
            const dept = DEPARTMENTS.find((d) => d.id === m.department);
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => openMember(m)}
                activeOpacity={0.9}
                style={styles.contribRow}
              >
                <Text style={styles.contribRank}>#{idx + 1}</Text>
                <View
                  style={[
                    styles.contribAvatar,
                    { backgroundColor: (dept?.color ?? Colors.tech.neonBlue) + '33' },
                  ]}
                >
                  <Text style={styles.contribAvatarText}>
                    {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contribName}>{m.name}</Text>
                  <Text style={styles.contribRole} numberOfLines={1}>
                    {m.role} · {dept?.name}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.contribHours}>{m.hoursContributed} hrs</Text>
                  <Text style={styles.contribEvents}>{m.eventsOrganized} events</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDeptAnalytics = () => {
    if (hasFilters) return null;
    const maxHours = Math.max(...DEPT_ANALYTICS.map((d) => d.hours));
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📊 Department analytics</Text>
          <Text style={styles.sectionCaption}>Hours · retention</Text>
        </View>
        <View style={styles.analyticsCard}>
          {DEPT_ANALYTICS.map((d) => {
            const pct = Math.max(0.06, d.hours / maxHours);
            return (
              <View key={d.id} style={styles.analyticsRow}>
                <View style={styles.analyticsLabelCol}>
                  <Text style={styles.analyticsName}>{d.name}</Text>
                  <Text style={styles.analyticsSub}>
                    {d.headcount} ppl · {d.avgHoursPerMember} hrs/avg · {d.retention}% retained
                  </Text>
                </View>
                <View style={styles.analyticsBarCol}>
                  <View style={styles.analyticsBarBg}>
                    <View
                      style={[
                        styles.analyticsBarFill,
                        { width: `${Math.round(pct * 100)}%`, backgroundColor: d.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.analyticsValue, { color: d.color }]}>
                    {d.hours}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMentorshipTree = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌳 Mentorship tree</Text>
          <Text style={styles.sectionCaption}>{MENTORSHIP_TREE.length} mentors</Text>
        </View>
        {MENTORSHIP_TREE.map((n) => {
          const mentor = TEAM_MEMBERS.find((m) => m.id === n.mentorId);
          if (!mentor) return null;
          const dept = DEPARTMENTS.find((d) => d.id === mentor.department);
          const mentees = n.menteeIds
            .map((id) => TEAM_MEMBERS.find((m) => m.id === id))
            .filter(Boolean) as ExtTeamMember[];
          return (
            <View
              key={n.mentorId}
              style={[
                styles.mentorCard,
                { borderLeftColor: dept?.color ?? Colors.tech.neonBlue },
              ]}
            >
              <TouchableOpacity
                onPress={() => openMember(mentor)}
                activeOpacity={0.85}
                style={styles.mentorHeader}
              >
                <View
                  style={[
                    styles.mentorAvatar,
                    { backgroundColor: (dept?.color ?? Colors.tech.neonBlue) + '33' },
                  ]}
                >
                  <Text style={styles.mentorAvatarText}>
                    {mentor.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mentorName}>{mentor.name}</Text>
                  <Text style={styles.mentorRole} numberOfLines={1}>
                    {mentor.role} · {dept?.name}
                  </Text>
                </View>
                <View style={styles.mentorCountPill}>
                  <Text style={styles.mentorCountText}>{mentees.length} mentees</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.mentorFocus}>{n.focus}</Text>
              <Text style={styles.mentorCadence}>⏱ {n.cadence}</Text>
              <View style={styles.menteeRow}>
                {mentees.map((m) => {
                  const mdept = DEPARTMENTS.find((d) => d.id === m.department);
                  return (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => openMember(m)}
                      activeOpacity={0.85}
                      style={styles.menteeChip}
                    >
                      <View
                        style={[
                          styles.menteeAvatar,
                          { backgroundColor: (mdept?.color ?? '#555') + '33' },
                        ]}
                      >
                        <Text style={styles.menteeAvatarText}>
                          {m.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.menteeName} numberOfLines={1}>
                        {m.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTeamTestimonials = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>💬 Voices from the team</Text>
          <Text style={styles.sectionCaption}>Unedited</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamTestimonialScroll}
        >
          {TEAM_TESTIMONIALS.map((t) => (
            <View key={t.id} style={styles.teamTestimonialCard}>
              <LinearGradient
                colors={[t.color + '33', '#0A0F14']}
                style={styles.teamTestimonialGradient}
              >
                <Text style={styles.teamTestimonialQuote}>“{t.body}”</Text>
                <View style={styles.teamTestimonialFooter}>
                  <View
                    style={[
                      styles.teamTestimonialDot,
                      { backgroundColor: t.color },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamTestimonialName}>{t.author}</Text>
                    <Text style={styles.teamTestimonialRole}>
                      {t.role} · {t.dept} · {t.joined}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderApplyToJoin = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🚪 How to join</Text>
          <Text style={styles.sectionCaption}>5 steps · ~2 weeks</Text>
        </View>
        <View style={styles.applyCard}>
          {APPLY_STEPS.map((s, idx) => (
            <View key={s.id} style={styles.applyStep}>
              <View style={styles.applyStepBadge}>
                <Text style={styles.applyStepEmoji}>{s.emoji}</Text>
                <Text style={styles.applyStepIndex}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.applyStepTitle}>{s.title}</Text>
                <Text style={styles.applyStepBody}>{s.body}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.applyCTA}
            onPress={() =>
              Linking.openURL('mailto:hello@taruguardians.org?subject=I%20want%20to%20join%20Taru')
            }
          >
            <Text style={styles.applyCTAText}>✉ Start application</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOnCall = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📟 On-call · this week</Text>
          <Text style={styles.sectionCaption}>Care rotation</Text>
        </View>
        {ON_CALL.map((o) => (
          <View key={o.id} style={[styles.onCallRow, { borderLeftColor: o.color }]}>
            <View style={styles.onCallDayCol}>
              <Text style={styles.onCallDay}>{o.day}</Text>
              <Text style={styles.onCallDate}>{o.date}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.onCallNameRow}>
                <Text style={styles.onCallName}>{o.name}</Text>
                <Text style={[styles.onCallWing, { color: o.color }]}>{o.wing}</Text>
              </View>
              <Text style={styles.onCallHours}>{o.hours}</Text>
              <Text style={styles.onCallBackup}>Backup · {o.backup}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStandupLog = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🗣️ Standup log</Text>
          <Text style={styles.sectionCaption}>Today · {STANDUPS.length} updates</Text>
        </View>
        {STANDUPS.map((s) => (
          <View key={s.id} style={[styles.standupCard, { borderLeftColor: s.color }]}>
            <View style={styles.standupHeaderRow}>
              <Text style={styles.standupAuthor}>{s.author}</Text>
              <Text style={[styles.standupWing, { color: s.color }]}>{s.wing}</Text>
            </View>
            <View style={styles.standupBlockRow}>
              <Text style={styles.standupLabel}>YESTERDAY</Text>
              <Text style={styles.standupBody}>{s.yesterday}</Text>
            </View>
            <View style={styles.standupBlockRow}>
              <Text style={styles.standupLabel}>TODAY</Text>
              <Text style={styles.standupBody}>{s.today}</Text>
            </View>
            <View style={styles.standupBlockRow}>
              <Text style={[styles.standupLabel, { color: '#EF4444' }]}>BLOCKERS</Text>
              <Text style={styles.standupBody}>{s.block}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTraditions = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🪔 Club traditions</Text>
          <Text style={styles.sectionCaption}>What we repeat on purpose</Text>
        </View>
        <View style={styles.tradGrid}>
          {TRADITIONS.map((t) => (
            <View key={t.id} style={styles.tradCard}>
              <Text style={styles.tradEmoji}>{t.emoji}</Text>
              <Text style={[styles.tradCadence, { color: t.color }]}>{t.cadence}</Text>
              <Text style={styles.tradTitle} numberOfLines={2}>{t.title}</Text>
              <Text style={styles.tradBody} numberOfLines={4}>{t.body}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderThanks = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🙏 Wall of thanks</Text>
          <Text style={styles.sectionCaption}>Credit out loud</Text>
        </View>
        {THANKS.map((t) => (
          <View key={t.id} style={[styles.thankCard, { borderLeftColor: t.color }]}>
            <View style={styles.thankHeaderRow}>
              <Text style={styles.thankDate}>{t.date}</Text>
              <Text style={[styles.thankWing, { color: t.color }]}>{t.wing}</Text>
            </View>
            <Text style={styles.thankLine}>
              <Text style={styles.thankFrom}>{t.from}</Text>
              <Text style={styles.thankTo}>{' → ' + t.to}</Text>
            </Text>
            <Text style={styles.thankNote}>“{t.note}”</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTeamValues = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>💠 Our values</Text>
          <Text style={styles.sectionCaption}>Six rules we keep</Text>
        </View>
        <View style={styles.valueGrid}>
          {TEAM_VALUES.map((v) => (
            <View key={v.id} style={[styles.valueCard, { borderLeftColor: v.color }]}>
              <Text style={styles.valueEmoji}>{v.emoji}</Text>
              <Text style={styles.valueTitle} numberOfLines={2}>{v.value}</Text>
              <Text style={styles.valueBody} numberOfLines={4}>{v.body}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderRow}>
      <Text style={styles.listHeaderTitle}>
        {filtered.length} member{filtered.length === 1 ? '' : 's'}
        {selectedDept !== 'all'
          ? ` · ${DEPARTMENTS.find((d) => d.id === selectedDept)?.name}`
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
              <View
                style={[
                  styles.cardAvatar,
                  { backgroundColor: (dept?.color ?? Colors.tech.neonBlue) + '33' },
                ]}
              >
                <Text style={styles.cardAvatarText}>
                  {item.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              {item.tier === 'lead' ? (
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>👑 Lead</Text>
                </View>
              ) : item.tier === 'core' ? (
                <View style={[styles.tierBadge, { backgroundColor: '#38BDF833', borderColor: '#38BDF8' }]}>
                  <Text style={[styles.tierBadgeText, { color: '#38BDF8' }]}>⭐ Core</Text>
                </View>
              ) : (
                <View style={[styles.tierBadge, { backgroundColor: '#4ADE8033', borderColor: '#4ADE80' }]}>
                  <Text style={[styles.tierBadgeText, { color: '#4ADE80' }]}>🌱 Member</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardRole} numberOfLines={1}>
              {item.role}
            </Text>
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
            <View
              style={[
                styles.listAvatar,
                { backgroundColor: (dept?.color ?? Colors.tech.neonBlue) + '33' },
              ]}
            >
              <Text style={styles.listAvatarText}>
                {item.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.listRole} numberOfLines={1}>
                {item.role} · {dept?.name}
              </Text>
              <Text style={styles.listBio} numberOfLines={2}>
                {item.bio}
              </Text>
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
      <Text style={styles.emptyTitle}>No team members match these filters</Text>
      <Text style={styles.emptySubtitle}>Try a broader department or reset filters.</Text>
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
      <Text style={styles.footerText}>Showing {filtered.length} of {totalMembers} members.</Text>
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
                <LinearGradient
                  colors={[dept?.color ?? Colors.tech.neonBlue, '#0A0F14']}
                  style={styles.modalAvatar}
                >
                  <Text style={styles.modalAvatarText}>
                    {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </LinearGradient>
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
                    {m.tier === 'lead' ? '👑 Lead' : m.tier === 'core' ? '⭐ Core' : '🌱 Member'}
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
                    <Text style={styles.impactLabel}>Shipped</Text>
                  </View>
                </View>
                <Text style={styles.joinedText}>
                  Joined the club on {m.joinedDate}
                </Text>
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

              {m.projects.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Projects shipped</Text>
                  {m.projects.map((p) => (
                    <View key={p.id} style={styles.projectRow}>
                      <Text style={styles.projectTitle}>{p.title}</Text>
                      <Text style={styles.projectDescription}>{p.description}</Text>
                      <View style={styles.projectMetaRow}>
                        <View
                          style={[
                            styles.projectStatusPill,
                            p.status === 'completed' && { borderColor: '#4ADE80' },
                            p.status === 'ongoing' && { borderColor: '#38BDF8' },
                            p.status === 'planned' && { borderColor: '#FBBF24' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.projectStatusText,
                              p.status === 'completed' && { color: '#4ADE80' },
                              p.status === 'ongoing' && { color: '#38BDF8' },
                              p.status === 'planned' && { color: '#FBBF24' },
                            ]}
                          >
                            {p.status}
                          </Text>
                        </View>
                        <Text style={styles.projectMeta}>· {p.teamSize} ppl</Text>
                        <Text style={styles.projectMeta}>· {p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}</Text>
                      </View>
                      <View style={styles.projectTechRow}>
                        {p.technologies.map((t) => (
                          <View key={t} style={styles.projectTechPill}>
                            <Text style={styles.projectTechText}>{t}</Text>
                          </View>
                        ))}
                      </View>
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
                  {m.socialLinks.behance ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.behance)}>
                      <Text style={styles.socialBtnText}>Be</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.dribbble ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.dribbble)}>
                      <Text style={styles.socialBtnText}>Dribbble</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.twitter ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.twitter)}>
                      <Text style={styles.socialBtnText}>𝕏 · Twitter</Text>
                    </TouchableOpacity>
                  ) : null}
                  {m.socialLinks.instagram ? (
                    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(m.socialLinks.instagram)}>
                      <Text style={styles.socialBtnText}>Instagram</Text>
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

  // ------ Main ------
  const listHeader = (
    <View>
      {renderHeader()}
      {renderDepartments()}
      {renderHighlights()}
      {renderLeadershipBoard()}
      {renderDeptAnalytics()}
      {renderOnCall()}
      {renderStandupLog()}
      {renderTopContributors()}
      {renderMentorshipTree()}
      {renderTraditions()}
      {renderTeamValues()}
      {renderTeamTestimonials()}
      {renderThanks()}
      {renderApplyToJoin()}
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
          key={viewMode}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? (IS_TABLET ? 3 : 2) : 1}
          renderItem={viewMode === 'grid' ? renderGridCard : renderListCard}
          columnWrapperStyle={
            viewMode === 'grid' ? { paddingHorizontal: HORIZONTAL_PADDING / 2 } : undefined
          }
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
      {renderMemberModal()}
      {renderSortSheet()}
    </SafeAreaView>
  );
};

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
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
  headerEyebrow: {
    fontSize: 12,
    color: Colors.tech.neonBlue,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  headerTitle: {
    fontSize: IS_SMALL ? 26 : 30,
    color: Colors.text.primary,
    fontWeight: '800',
    marginTop: 4,
  },
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

  // Dept chips
  deptScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 12, paddingBottom: 6 },
  deptChip: {
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
  deptChipActive: {
    borderColor: Colors.tech.neonBlue,
    backgroundColor: Colors.tech.neonBlue + '22',
  },
  deptIcon: { fontSize: 14, marginRight: 6 },
  deptLabel: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  deptLabelActive: { color: Colors.tech.neonBlue, fontWeight: '800' },
  deptCount: {
    marginLeft: 6,
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
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
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionCaption: { color: Colors.text.muted, fontSize: 12 },

  // Departments grid
  departmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING - 4,
  },
  departmentCard: {
    width: IS_TABLET ? (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 16) / 3 : (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 16) / 2,
    backgroundColor: '#0B1118',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 14,
    margin: 4,
  },
  departmentIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  departmentIcon: { fontSize: 18 },
  departmentName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  departmentCount: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  departmentDesc: { color: Colors.text.secondary, fontSize: 11, marginTop: 8, lineHeight: 16 },

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
  leaderAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  // Contributors list
  contribWrap: { paddingHorizontal: HORIZONTAL_PADDING },
  contribRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  contribRank: {
    width: 28,
    color: Colors.accent.softGold,
    fontWeight: '800',
    fontSize: 13,
  },
  contribAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contribAvatarText: { color: Colors.text.primary, fontWeight: '800' },
  contribName: { color: Colors.text.primary, fontSize: 14, fontWeight: '700' },
  contribRole: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  contribHours: { color: Colors.tech.neonBlue, fontSize: 12, fontWeight: '800' },
  contribEvents: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

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
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING / 2,
    marginTop: 8,
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
  cardMetaRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  cardMeta: { color: Colors.text.muted, fontSize: 11 },

  // List card
  listCardOuter: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 10,
  },
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
  catBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  catBadgeText: { color: Colors.text.primary, fontSize: 11, fontWeight: '700' },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { color: Colors.text.primary, fontSize: 16 },
  modalAvatarWrap: { marginTop: 16 },
  modalAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff22',
  },
  modalAvatarText: { color: Colors.text.primary, fontSize: 30, fontWeight: '900' },
  modalTitle: { color: Colors.text.primary, fontSize: 22, fontWeight: '900', marginTop: 10 },
  modalRole: { color: Colors.accent.softGold, fontSize: 13, fontWeight: '700', marginTop: 4 },
  modalTagline: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  modalMetaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' },
  modalMetaPill: {
    borderWidth: 1,
    borderColor: '#ffffff33',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 3,
    marginBottom: 4,
  },
  modalMetaText: { color: Colors.text.primary, fontSize: 11 },

  modalScroll: { flexGrow: 0 },
  modalScrollContent: { padding: 16, paddingBottom: 20 },
  modalSection: { marginBottom: 18 },
  modalSectionTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  modalSectionBody: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20 },

  funFactBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffffff08',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.softGold,
  },
  funFactTitle: { color: Colors.accent.softGold, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  funFactText: { color: Colors.text.primary, fontSize: 13 },

  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff08',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  impactCell: { flex: 1, alignItems: 'center' },
  impactDivider: { width: 1, height: 28, backgroundColor: '#ffffff1F' },
  impactValue: { color: Colors.text.primary, fontSize: 17, fontWeight: '800' },
  impactLabel: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  joinedText: { color: Colors.text.muted, fontSize: 11, marginTop: 8, textAlign: 'center' },

  tagCloud: { flexDirection: 'row', flexWrap: 'wrap' },
  tagPill: {
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { color: Colors.text.primary, fontSize: 11 },

  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
  },
  achievementBullet: { color: Colors.accent.softGold, fontSize: 14, marginRight: 8, marginTop: 1 },
  achievementText: { color: Colors.text.secondary, fontSize: 13, flex: 1, lineHeight: 18 },

  projectRow: {
    padding: 12,
    backgroundColor: '#ffffff08',
    borderRadius: 12,
    marginBottom: 10,
  },
  projectTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  projectDescription: { color: Colors.text.secondary, fontSize: 12, marginTop: 4, lineHeight: 17 },
  projectMetaRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center', flexWrap: 'wrap' },
  projectStatusPill: {
    borderWidth: 1,
    borderColor: '#ffffff33',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  projectStatusText: { color: Colors.text.primary, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  projectMeta: { color: Colors.text.muted, fontSize: 11, marginLeft: 6 },
  projectTechRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  projectTechPill: {
    backgroundColor: Colors.tech.neonBlue + '20',
    borderColor: Colors.tech.neonBlue + '55',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 5,
    marginBottom: 4,
  },
  projectTechText: { color: Colors.tech.neonBlue, fontSize: 10 },

  socialRow: { flexDirection: 'row', flexWrap: 'wrap' },
  socialBtn: {
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  socialBtnText: { color: Colors.text.primary, fontSize: 12, fontWeight: '700' },

  modalActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
  },
  modalAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },

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

  // Department analytics
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
  analyticsLabelCol: {
    width: IS_SMALL ? 110 : 130,
    marginRight: 10,
  },
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

  // Mentorship tree
  mentorCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  mentorHeader: { flexDirection: 'row', alignItems: 'center' },
  mentorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mentorAvatarText: { color: Colors.text.primary, fontSize: 13, fontWeight: '900' },
  mentorName: { color: Colors.text.primary, fontSize: 14, fontWeight: '800' },
  mentorRole: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  mentorCountPill: {
    backgroundColor: '#ffffff14',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mentorCountText: { color: Colors.text.secondary, fontSize: 10, fontWeight: '800' },
  mentorFocus: { color: Colors.text.secondary, fontSize: 12, marginTop: 8, lineHeight: 17 },
  mentorCadence: { color: Colors.accent.softGold, fontSize: 11, marginTop: 4, fontWeight: '700' },
  menteeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  menteeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff0E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 6,
  },
  menteeAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  menteeAvatarText: { color: Colors.text.primary, fontSize: 9, fontWeight: '900' },
  menteeName: { color: Colors.text.secondary, fontSize: 11, fontWeight: '700' },

  // Team testimonials
  teamTestimonialScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10 },
  teamTestimonialCard: {
    width: IS_SMALL ? 260 : 300,
    marginRight: 12,
  },
  teamTestimonialGradient: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 220,
  },
  teamTestimonialQuote: {
    color: Colors.text.primary,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 20,
  },
  teamTestimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  teamTestimonialDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  teamTestimonialName: { color: Colors.text.primary, fontSize: 12, fontWeight: '800' },
  teamTestimonialRole: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Apply to join
  applyCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#0D141B',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  applyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  applyStepBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  applyStepEmoji: { fontSize: 18 },
  applyStepIndex: { color: Colors.text.muted, fontSize: 9, fontWeight: '800', marginTop: 2 },
  applyStepTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  applyStepBody: { color: Colors.text.secondary, fontSize: 11, marginTop: 3, lineHeight: 15 },
  applyCTA: {
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyCTAText: { color: '#001018', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // On-call
  onCallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  onCallDayCol: { width: 54, alignItems: 'flex-start' },
  onCallDay: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  onCallDate: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  onCallNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  onCallName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  onCallWing: { fontSize: 11, fontWeight: '800' },
  onCallHours: { color: Colors.text.secondary, fontSize: 11, marginTop: 3 },
  onCallBackup: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },

  // Standup
  standupCard: {
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  standupHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  standupAuthor: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  standupWing: { fontSize: 11, fontWeight: '800' },
  standupBlockRow: { marginTop: 6 },
  standupLabel: {
    color: Colors.tech.neonBlue,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  standupBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  // Traditions
  tradGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  tradCard: {
    width: '50%',
    padding: 4,
  },
  tradEmoji: { fontSize: 20 },
  tradCadence: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  tradTitle: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  tradBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
  },

  // Thanks
  thankCard: {
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  thankHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thankDate: { color: Colors.text.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  thankWing: { fontSize: 11, fontWeight: '800' },
  thankLine: { marginTop: 4, fontSize: 12 },
  thankFrom: { color: Colors.text.primary, fontWeight: '800' },
  thankTo: { color: Colors.text.secondary, fontWeight: '700' },
  thankNote: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Values
  valueGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  valueCard: {
    width: '50%',
    padding: 4,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  valueEmoji: { fontSize: 18 },
  valueTitle: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  valueBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 4,
  },
});

export default TeamScreen;
