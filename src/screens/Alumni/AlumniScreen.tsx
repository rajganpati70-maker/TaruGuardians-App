// =====================================================
// TARU GUARDIANS — ALUMNI NETWORK (Premium Screen)
// Nature + Tech fusion · advanced filtering · rich data
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
  Linking,
  RefreshControl,
  Platform,
  TextInput,
  FlatList,
  Easing,
  Share,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Alumni, AlumniStats } from '../../types/navigation';

// -----------------------------------------------------
// Responsive + design tokens
// -----------------------------------------------------

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 22;
const AVATAR_SIZE = IS_SMALL ? 56 : 64;

const ANIM = {
  duration: {
    instant: 60,
    fast: 200,
    normal: 360,
    slow: 540,
    xslow: 820,
  },
  easing: {
    inOut: Easing.inOut(Easing.cubic),
    out: Easing.out(Easing.cubic),
    soft: Easing.bezier(0.25, 0.1, 0.25, 1),
    overshoot: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
};

// -----------------------------------------------------
// Batches / domains / filters
// -----------------------------------------------------

const BATCH_YEARS = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'] as const;

type SectorId =
  | 'all'
  | 'tech'
  | 'product'
  | 'data'
  | 'design'
  | 'research'
  | 'entrepreneur'
  | 'finance'
  | 'impact'
  | 'creative';

interface SectorMeta {
  id: SectorId;
  label: string;
  icon: string;
  color: string;
}

const SECTORS: SectorMeta[] = [
  { id: 'all', label: 'All Sectors', icon: '🌐', color: Colors.tech.neonBlue },
  { id: 'tech', label: 'Software & Tech', icon: '💻', color: '#2DD4BF' },
  { id: 'product', label: 'Product', icon: '🧭', color: '#FBBF24' },
  { id: 'data', label: 'Data / AI', icon: '🧠', color: '#A78BFA' },
  { id: 'design', label: 'Design', icon: '🎨', color: '#F472B6' },
  { id: 'research', label: 'Research', icon: '🔬', color: '#60A5FA' },
  { id: 'entrepreneur', label: 'Founders', icon: '🚀', color: '#F97316' },
  { id: 'finance', label: 'Finance', icon: '💹', color: '#10B981' },
  { id: 'impact', label: 'Sustainability', icon: '🌱', color: '#4ADE80' },
  { id: 'creative', label: 'Creative / Media', icon: '🎬', color: '#F87171' },
];

type SortKey =
  | 'recent-batch'
  | 'oldest-batch'
  | 'name-asc'
  | 'name-desc'
  | 'company-asc';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'recent-batch', label: 'Most recent batch', icon: '🆕' },
  { key: 'oldest-batch', label: 'Earliest batch', icon: '📜' },
  { key: 'name-asc', label: 'Name A→Z', icon: '🔤' },
  { key: 'name-desc', label: 'Name Z→A', icon: '🔡' },
  { key: 'company-asc', label: 'Company A→Z', icon: '🏢' },
];

type ViewMode = 'list' | 'grid';

// -----------------------------------------------------
// Domain helpers
// -----------------------------------------------------

interface ExtAlumni extends Alumni {
  sector: SectorId;
  featured?: boolean;
  mentor?: boolean;
  experienceYears: number;
  skills: string[];
  sustainabilityPledge?: string;
  quote?: string;
  timeline: { year: string; role: string; company: string }[];
}

const makeAlumni = (
  id: number,
  name: string,
  batch: string,
  currentRole: string,
  company: string,
  location: string,
  sector: SectorId,
  experienceYears: number,
  achievements: string[],
  skills: string[],
  message: string,
  opts?: {
    featured?: boolean;
    mentor?: boolean;
    pledge?: string;
    quote?: string;
    pastRoles?: string[];
    timeline?: { year: string; role: string; company: string }[];
    linkedin?: string;
    email?: string;
    role?: string;
  }
): ExtAlumni => ({
  id: String(id),
  name,
  batch,
  role: opts?.role ?? currentRole,
  company,
  location,
  imageUrl: '',
  email: opts?.email ?? `${name.toLowerCase().replace(/[^a-z]/g, '')}@alumni.taruguardians.org`,
  linkedin:
    opts?.linkedin ?? `https://linkedin.com/in/${name.toLowerCase().replace(/[^a-z]/g, '-')}`,
  currentRole,
  pastRoles: opts?.pastRoles ?? [],
  achievements,
  messageToStudents: message,
  sector,
  experienceYears,
  skills,
  featured: opts?.featured,
  mentor: opts?.mentor,
  sustainabilityPledge: opts?.pledge,
  quote: opts?.quote,
  timeline:
    opts?.timeline ??
    [
      { year: batch, role: 'Graduated', company: 'Taru Guardians' },
      { year: String(Number(batch) + 1), role: currentRole, company },
    ],
});

// -----------------------------------------------------
// Alumni dataset
// -----------------------------------------------------

const ALUMNI_DATA: ExtAlumni[] = [
  makeAlumni(
    1,
    'Rohit Sharma',
    '2020',
    'Engineering Manager',
    'Google',
    'Bangalore, India',
    'tech',
    6,
    ['Google Excellence Award 2023', 'Led migration of 400M-user billing service', 'Author of 2 internal design docs turned org-wide'],
    ['Go', 'Kubernetes', 'Distributed Systems', 'Site Reliability', 'Team Leadership'],
    'Dream bada rakho lekin ground realities ko respect karo — shortcuts long-term compound nahi karte.',
    {
      featured: true,
      mentor: true,
      pledge: 'Plant 50 trees every year + fund 5 scholarships annually.',
      quote: 'Code is easy. Calibrating impact is hard.',
      pastRoles: ['Software Engineer', 'Senior SWE'],
      timeline: [
        { year: '2020', role: 'Graduated', company: 'Taru Guardians' },
        { year: '2020', role: 'SWE Intern', company: 'Infosys' },
        { year: '2021', role: 'Software Engineer', company: 'Flipkart' },
        { year: '2023', role: 'Senior SWE', company: 'Google' },
        { year: '2025', role: 'Engineering Manager', company: 'Google' },
      ],
    }
  ),
  makeAlumni(
    2,
    'Priya Singh',
    '2021',
    'Senior Product Manager',
    'Amazon',
    'Hyderabad, India',
    'product',
    5,
    ['Amazon Star Award 2024', 'Shipped 3 0→1 products with >50M users', 'Keynote at PMF India 2024'],
    ['Product Strategy', 'User Research', 'Growth', 'A/B Experimentation', 'SQL'],
    'Features kam banao, outcomes zyada sochna seekho — user pain points ka ek clear tree rakho.',
    {
      featured: true,
      mentor: true,
      quote: 'A PM without data is just opinions with confidence.',
      pledge: 'Mentor 10 first-gen college students every year.',
      timeline: [
        { year: '2021', role: 'Graduated', company: 'Taru Guardians' },
        { year: '2021', role: 'APM', company: 'Swiggy' },
        { year: '2023', role: 'Product Manager', company: 'Amazon' },
        { year: '2025', role: 'Senior PM', company: 'Amazon' },
      ],
    }
  ),
  makeAlumni(
    3,
    'Ankit Patel',
    '2022',
    'Machine Learning Engineer',
    'Microsoft',
    'Bangalore, India',
    'data',
    4,
    ['Microsoft AI Impact Award', 'Co-authored 2 NeurIPS workshop papers', 'Open-sourced a ranking library (3.2k stars)'],
    ['Python', 'PyTorch', 'Transformers', 'MLOps', 'Distributed Training'],
    'ML me shortcut lene se models unreliable ho jaate hain — baseline strong banao pehle.',
    {
      featured: true,
      mentor: true,
      quote: 'Data is the new oil — but refining matters more than volume.',
      pledge: 'Donate 5% of stipend to open-source AI safety research.',
    }
  ),
  makeAlumni(
    4,
    'Sneha Gupta',
    '2023',
    'Senior Product Designer',
    'Apple',
    'Bangalore, India',
    'design',
    3,
    ['Apple Design Excellence 2024', '3 WWDC session feature shipments', 'Design system used by 14 teams'],
    ['Figma', 'Design Systems', 'Motion', 'Prototyping', 'User Research'],
    'Aesthetic likna easy hai, accessibility tough — dono ek saath practice karte raho.',
    {
      featured: true,
      mentor: true,
      quote: 'Great design is invisible — and opinionated.',
      pledge: 'Free accessibility audits for 12 NGO websites every year.',
    }
  ),
  makeAlumni(
    5,
    'Vikram Kumar',
    '2024',
    'Founder & CEO',
    'EcoTech Solutions',
    'Bangalore, India',
    'entrepreneur',
    2,
    ['Forbes 30 Under 30 — Asia 2025', 'Raised Seed + Series A ($8.4M)', 'Recognized by UNEP for rural cleantech'],
    ['Business Strategy', 'Hardware–Software', 'Fundraising', 'IoT', 'Supply Chain'],
    'Idea se zyada execution matter karta hai — aur execution = honest feedback loops.',
    {
      featured: true,
      mentor: true,
      pledge: 'Hire 30% of workforce from tier-3 colleges and rural talent.',
      quote: 'Startups don\'t need vision decks — they need weekly cash runways and believers.',
      timeline: [
        { year: '2024', role: 'Graduated', company: 'Taru Guardians' },
        { year: '2024', role: 'Co-founder', company: 'EcoTech Solutions' },
        { year: '2025', role: 'CEO', company: 'EcoTech Solutions' },
      ],
    }
  ),
  makeAlumni(
    6,
    'Meera Shah',
    '2025',
    'Business Analyst',
    'McKinsey & Company',
    'Mumbai, India',
    'finance',
    1,
    ['Top Performer Q4 2025', 'Led 3 CSR engagements', 'Best Campus Rookie — McK Mumbai'],
    ['Structured Problem Solving', 'Excel Modeling', 'Client Communication', 'Strategy'],
    'Pehla saal seekhne me invest karo — compensation baad me apne aap chase karega.',
    {
      mentor: true,
      quote: 'Consulting is 80% listening, 20% framing.',
      pledge: 'Volunteer 100+ hrs with rural financial-literacy NGOs.',
    }
  ),
  makeAlumni(
    7,
    'Aditya Reddy',
    '2020',
    'Vice President — Investment Banking',
    'Goldman Sachs',
    'Bangalore, India',
    'finance',
    6,
    ['Best Analyst 2022', 'Closed $1.2B cross-border deal', 'Directors\' List 3 years in a row'],
    ['Valuation', 'M&A', 'Financial Modeling', 'Cross-border deals'],
    'Network is net worth — par trust unka hi banta hai jinhone mistakes mana aur fix kiya ho.',
    {
      mentor: true,
      quote: 'In finance, compounding your reputation matters more than compounding your Excel tricks.',
    }
  ),
  makeAlumni(
    8,
    'Kavya Nair',
    '2021',
    'Scientist-C',
    'ISRO',
    'Bangalore, India',
    'research',
    5,
    ['ISRO Young Scientist Award 2024', 'Co-designed Chandrayaan-3 payload thermal subsystem', '3 peer-reviewed publications'],
    ['MATLAB', 'Thermal Analysis', 'Systems Engineering', 'Scientific Writing'],
    'Reach for the stars — lekin paper pehle publish karo, ghar waale phir satisfy hote hain.',
    {
      featured: true,
      mentor: true,
      quote: 'Space missions fail silently. Engineering rigor is not optional.',
    }
  ),
  makeAlumni(
    9,
    'Harshit Jain',
    '2019',
    'Staff Software Engineer',
    'Netflix',
    'Los Gatos, USA',
    'tech',
    7,
    ['Netflix Rockstar 2023', 'Led CDN rollout in APAC', 'Invited speaker QCon SF'],
    ['Streaming Systems', 'Rust', 'Edge Computing', 'Video Codecs'],
    'Bahar jaake kaam karna hai to system-design me genuinely deep jaao — interviews ki ratt mat lagao.',
    {
      quote: 'Scale eats assumptions for breakfast.',
    }
  ),
  makeAlumni(
    10,
    'Shruti Menon',
    '2022',
    'UX Researcher',
    'Spotify',
    'Stockholm, Sweden',
    'research',
    4,
    ['Spotify R&D Award', 'Led listener-behavior study across 12 markets', 'Published Nielsen-Norman guest essay'],
    ['Mixed-methods Research', 'Diary Studies', 'NPS', 'Quant+Qual', 'Storytelling'],
    'Research agar action me translate na ho to report nahi, museum piece ban jaati hai.',
    {
      mentor: true,
      quote: 'Users don\'t owe you coherence. You owe them clarity.',
    }
  ),
  makeAlumni(
    11,
    'Devraj Iyer',
    '2021',
    'Senior iOS Engineer',
    'Swiggy',
    'Bangalore, India',
    'tech',
    5,
    ['Swiggy Spotlight 2024', 'Shipped delivery-partner iOS rewrite', 'Led 4-person pod'],
    ['Swift', 'SwiftUI', 'Combine', 'Performance Tuning', 'CI/CD'],
    'Crash-free sessions >= 99.7% ke neeche chhota hi launch mat karo.',
    {}
  ),
  makeAlumni(
    12,
    'Anaya Verma',
    '2023',
    'Sustainability Analyst',
    'BCG — Climate & Sustainability',
    'Gurugram, India',
    'impact',
    3,
    ['Clean Tech Rising 2025', 'ESG framework for 2 Fortune 500', 'TEDx Youth Bangalore'],
    ['ESG Reporting', 'Carbon Accounting', 'Policy Analysis', 'Workshops'],
    'Sustainability marketing ke paar le jaao — real KPIs ke bina intent shallow hai.',
    {
      featured: true,
      mentor: true,
      pledge: 'Help 20 startups publish their first sustainability report pro-bono.',
      quote: 'Climate is not a vertical. It\'s a context.',
    }
  ),
  makeAlumni(
    13,
    'Ritika Bansal',
    '2020',
    'Lead Data Scientist',
    'Ola',
    'Bangalore, India',
    'data',
    6,
    ['Ola Innovate 2023', 'Built matching engine v3', '3 patents filed'],
    ['Causal Inference', 'Bayesian Methods', 'PyMC', 'Spark', 'A/B'],
    'Data scientist ko philosopher banna padta hai — pehle question, phir model.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    14,
    'Arjun Pillai',
    '2022',
    'Backend Engineer',
    'Stripe',
    'Dublin, Ireland',
    'tech',
    4,
    ['Stripe Engineering Excellence', 'Owned payments reconciliation SLA', 'Open-source contributor to Postgres'],
    ['Java', 'Postgres', 'Kafka', 'Observability', 'Consistency models'],
    'Payments systems me integrity > latency. Har bug ka blast radius sochke code likho.',
    {
      mentor: true,
      quote: 'Correctness is a feature, not a luxury.',
    }
  ),
  makeAlumni(
    15,
    'Nandini Rao',
    '2024',
    'Brand Strategist',
    'Ogilvy',
    'Mumbai, India',
    'creative',
    2,
    ['Young Lions Shortlist', 'Led 3 fintech repositioning campaigns'],
    ['Brand Strategy', 'Copy', 'Storytelling', 'Campaign Planning'],
    'Brand matlab logo nahi — brand matlab emotional default jo customer ke mann me apna ghar bana le.',
    {
      quote: 'Ads ruk jaate hain, reputation compound hoti hai.',
    }
  ),
  makeAlumni(
    16,
    'Sanjay Rane',
    '2019',
    'Co-founder & CTO',
    'GreenLogix',
    'Pune, India',
    'entrepreneur',
    7,
    ['Seed raised $1.8M', 'Deploy cleantech in 14 MSMEs', 'IIT Bombay collaborator'],
    ['Hardware', 'Low-power electronics', 'Embedded C', 'Operations'],
    'Customer ke saath 20 hafta gujaro phir build karo — chair-builder hardware startup zinda nahi rahti.',
    {
      mentor: true,
      pledge: 'Co-build 4 open-source hardware kits for schools.',
    }
  ),
  makeAlumni(
    17,
    'Ayesha Khan',
    '2023',
    'Frontend Engineer',
    'Razorpay',
    'Bangalore, India',
    'tech',
    3,
    ['Razorpay Shine Award', 'Accessible payment flow redesign', 'Internal speaker program host'],
    ['React', 'TypeScript', 'Accessibility', 'Performance', 'Design tokens'],
    'Frontend me polish obvious dikhti hai — isliye uske peeche "fundamentals" ko dhanda karo.',
    {
      mentor: true,
      quote: 'Shipping fast is good. Shipping correct is non-negotiable.',
    }
  ),
  makeAlumni(
    18,
    'Rahul Desai',
    '2021',
    'Senior Consultant',
    'Deloitte Strategy',
    'Bangalore, India',
    'finance',
    5,
    ['Outstanding Consultant 2024', 'Turnaround for state-run utility'],
    ['Market Entry', 'Due Diligence', 'Financial Modeling', 'Workshops'],
    'Consulting deck me slide kam, decision framework zyada honi chahiye.',
    {}
  ),
  makeAlumni(
    19,
    'Pooja Kulkarni',
    '2020',
    'DevOps Architect',
    'Atlassian',
    'Bangalore, India',
    'tech',
    6,
    ['Atlassian Values Award', 'Reduced CI minutes by 42%', 'Speaker at DevOpsDays'],
    ['Kubernetes', 'Terraform', 'Observability', 'Incident Management'],
    'Automate apni insanity — log roz dekhne padein to pipeline adhoora hai.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    20,
    'Tanmay Joshi',
    '2022',
    'Game Designer',
    'Ubisoft',
    'Montreal, Canada',
    'creative',
    4,
    ['Game Awards Shortlist 2024', 'Designed 2 mechanics shipped in AAA title'],
    ['Unity', 'Game Balance', 'Level Design', 'Playtesting'],
    'Game design me "fun" feel se judge hota hai, metrics se prove hota hai.',
    {
      quote: 'Players don\'t play your intention. They play your systems.',
    }
  ),
  makeAlumni(
    21,
    'Megha Srinivasan',
    '2019',
    'Principal Engineer',
    'Adobe',
    'Noida, India',
    'tech',
    7,
    ['Adobe Founders\' Award', 'Led Premiere Rush perf overhaul', 'Architect of cloud-sync subsystem'],
    ['C++', 'Graphics', 'Cross-platform', 'Profiling', 'Leadership'],
    'Principal role = technical judgment + taste + humility to be overruled by data.',
    {
      featured: true,
      mentor: true,
    }
  ),
  makeAlumni(
    22,
    'Aniket Bose',
    '2024',
    'Associate',
    'Bain & Company',
    'New Delhi, India',
    'finance',
    2,
    ['Bain Best Campus Recruit 2024', 'Led PE due-diligence for consumer deal'],
    ['Excel Modeling', 'Slide-writing', 'Primary Research'],
    'Modeling jitni shortcut se karoge utna recover karna mehenga padega.',
    {
      quote: 'The first draft of your model is always wrong. Iterate ruthlessly.',
    }
  ),
  makeAlumni(
    23,
    'Shalini Yadav',
    '2023',
    'AI Researcher',
    'Google DeepMind',
    'London, UK',
    'research',
    3,
    ['Chevening Scholar 2024', 'Published at ICML', 'Collaborator on foundation-model safety'],
    ['JAX', 'Reinforcement Learning', 'Safety Research', 'Writing'],
    'Research me hype-cycle ko ignore karna seekho, baseline methods me mehnat karo.',
    {
      featured: true,
      mentor: true,
      quote: 'Papers are conversations, not trophies.',
    }
  ),
  makeAlumni(
    24,
    'Siddharth Menon',
    '2021',
    'Associate Product Manager',
    'Cred',
    'Bangalore, India',
    'product',
    5,
    ['Cred Bootcamp Top 3', 'Launched 2 new experiments yielding +7% NPS'],
    ['Product Sense', 'SQL', 'Amplitude', 'Feature Specs'],
    'PM roles me listening a superpower hai — kabhi bhi "smart jawab" se pehle 2 questions aur puchho.',
    {}
  ),
  makeAlumni(
    25,
    'Divya Menon',
    '2018',
    'Head of Design',
    'Zerodha',
    'Bangalore, India',
    'design',
    8,
    ['AIGA Honor 2024', 'Scaled design team 3→22', 'Author of Kite design language book'],
    ['Design Leadership', 'Systems', 'Culture Building', 'Hiring'],
    'Taste 3 saal me develop hoti hai, sensibility ban\'ne me 10 lagta hai — patient raho.',
    {
      featured: true,
      mentor: true,
      pledge: 'Run 4 free design bootcamps per year for tier-3 students.',
    }
  ),
  makeAlumni(
    26,
    'Rakesh Pandey',
    '2020',
    'Senior SRE',
    'PhonePe',
    'Bangalore, India',
    'tech',
    6,
    ['PhonePe Technology Excellence', 'Sub-60 sec MTTR for transactions infra'],
    ['SRE', 'Kafka', 'Scaling', 'Incident Review'],
    'SRE role me ego checkbox pe chhodo — blameless postmortem culture sirf words me nahi, practice me chahiye.',
    {}
  ),
  makeAlumni(
    27,
    'Avni Saxena',
    '2022',
    'Impact Investment Analyst',
    'Omidyar Network India',
    'Mumbai, India',
    'impact',
    4,
    ['Top Analyst 2024', 'Supported 6 early-stage impact startups'],
    ['Impact Modeling', 'Due Diligence', 'Portfolio Support'],
    'Impact measure karo ya mat maapo — par blind faith me invest mat karo.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    28,
    'Manish Ahuja',
    '2019',
    'Principal Data Scientist',
    'Walmart Labs',
    'Bangalore, India',
    'data',
    7,
    ['Walmart CTO Recognition', 'Built demand forecasting engine v4', 'Speaker KDD 2024'],
    ['Forecasting', 'Causal ML', 'Python', 'Scientific Writing'],
    'Business value dikhane ke liye pahle problem clearly articulate karo — model baad ki baat hai.',
    {
      mentor: true,
      quote: 'A clean problem statement is half the model.',
    }
  ),
  makeAlumni(
    29,
    'Ishita Roy',
    '2024',
    'Growth Marketing Lead',
    'Meesho',
    'Bangalore, India',
    'creative',
    2,
    ['Meesho Lightspeed Award', 'Led 0→1 creator program'],
    ['Growth Loops', 'Attribution', 'Creator Ops', 'Content'],
    'Growth me vanity-metrics se bacho — unit economics aur retention ko always front-and-center rakho.',
    {}
  ),
  makeAlumni(
    30,
    'Parth Saluja',
    '2023',
    'Full-stack Developer',
    'Atlan',
    'Bangalore, India',
    'tech',
    3,
    ['Atlan Hackday Winner 2024', 'Built lineage visualization v2'],
    ['TypeScript', 'GraphQL', 'Data catalogs', 'UX-engineering'],
    'Product-engineer banna hai to spec likhna seekho, sirf ticket-execute mat karo.',
    {}
  ),
  makeAlumni(
    31,
    'Riya Chauhan',
    '2021',
    'Senior Lawyer (Tech & IP)',
    'Cyril Amarchand Mangaldas',
    'Mumbai, India',
    'finance',
    5,
    ['Rising Star — Legal 500', 'Advised 3 IPO-track startups'],
    ['Technology Law', 'IP', 'Contract Drafting', 'Negotiation'],
    'Legal me shortcut = long term se bahut mehenga — har clause justify kar saktey ho tabhi draft bhejo.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    32,
    'Karan Malhotra',
    '2020',
    'Founding Engineer',
    'Turing',
    'Remote (Bangalore)',
    'entrepreneur',
    6,
    ['Forbes Asia Emerging Builders 2024', 'Built core matching engine'],
    ['Python', 'Ruby', 'Django', 'Team Building'],
    'Joining a 5-person company chhoti si family jaisa hai — culture fit skill fit se zyada critical hai.',
    {
      quote: 'Employee #1 → Employee #50 is two different universes.',
    }
  ),
  makeAlumni(
    33,
    'Neha Bhatt',
    '2022',
    'Behavioral Scientist',
    'Dalberg Design',
    'Delhi NCR, India',
    'research',
    4,
    ['Dalberg MVP 2024', 'Field research across 6 states'],
    ['Behavioral Economics', 'Field Research', 'Workshops', 'Synthesis'],
    'Policy aur design ke beech ka pul hona hota hai — dono ko speak karna padega.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    34,
    'Yash Agarwal',
    '2024',
    'Software Engineer',
    'Linear',
    'Remote (Mumbai)',
    'tech',
    2,
    ['Linear Launch-week contributor'],
    ['React', 'GraphQL', 'Elixir', 'Product sense'],
    'Small team = big leverage. Apne bugs khud fix karo, apni launches khud own karo.',
    {}
  ),
  makeAlumni(
    35,
    'Lavanya Iyer',
    '2020',
    'Director of Operations',
    'Piramal Foundation',
    'Mumbai, India',
    'impact',
    6,
    ['Aspire Fellow 2023', 'Scaled rural health programs across 4 states'],
    ['Operations', 'Government Relations', 'Monitoring & Evaluation'],
    'Impact operations me data aur humility dono chahiye — yaha sirf spreadsheets se truth nahi milti.',
    {
      mentor: true,
      pledge: 'Design a rural leadership accelerator with 100 cohort slots / year.',
    }
  ),
  makeAlumni(
    36,
    'Ankita Mehta',
    '2019',
    'Senior Economist',
    'World Bank',
    'Washington DC, USA',
    'research',
    7,
    ['Chevening Scholar 2021', '3 World Bank policy papers'],
    ['Econometrics', 'Policy Analysis', 'Stata', 'Writing'],
    'Economics ke without politics samjhe kaam adhoora hai — humility rakho data pe.',
    {
      featured: true,
    }
  ),
  makeAlumni(
    37,
    'Rohan Kapoor',
    '2021',
    'AI Platform Engineer',
    'OpenAI',
    'San Francisco, USA',
    'tech',
    5,
    ['OpenAI Builder of the Quarter 2025', 'Core author of model-eval framework'],
    ['Python', 'CUDA', 'Distributed systems', 'Infrastructure'],
    'Frontier AI companies me prod reliability > research glamour — build boring but solid.',
    {
      featured: true,
      mentor: true,
      quote: 'The model is the artist. The infra is the stage.',
    }
  ),
  makeAlumni(
    38,
    'Sana Fatima',
    '2023',
    'Content Strategist',
    'Netflix',
    'Mumbai, India',
    'creative',
    3,
    ['Netflix India Rookie 2024', 'Commissioned 2 regional documentaries'],
    ['Editorial', 'Research', 'Pitch-writing', 'Audience insight'],
    'Content jo apne audience ko respect karta hai wahi compound karta hai — baaki is churn ka hissa hai.',
    {}
  ),
  makeAlumni(
    39,
    'Tejas Sawant',
    '2018',
    'Chief of Staff',
    'Razorpay',
    'Bangalore, India',
    'product',
    8,
    ['Glue Award for Leadership', 'Built OKR rollout infra', 'Public speaker on operational craft'],
    ['Operations', 'Program Management', 'Strategy', 'Coaching'],
    'Chief of staff = leverage through clarity — politics me pado nahi, work speak karne do.',
    {
      mentor: true,
      featured: true,
    }
  ),
  makeAlumni(
    40,
    'Geetika Bose',
    '2020',
    'Co-founder',
    'Climafarms',
    'Kolkata, India',
    'entrepreneur',
    6,
    ['Ashoka Fellow 2024', 'Deployed cleantech on 20k acres of farmland'],
    ['AgriTech', 'Field Deployment', 'Partnerships', 'Community Building'],
    'Farmers ke saath baith ke cycle pakdo — MVP hackathon se nahi mitti se banta hai.',
    {
      featured: true,
      pledge: 'Train 1000 women farmers every year on regenerative agriculture.',
    }
  ),
  makeAlumni(
    41,
    'Ayaan Sinha',
    '2022',
    'Site Reliability Engineer',
    'Shopify',
    'Bangalore, India',
    'tech',
    4,
    ['Shopify Shoutout 2024'],
    ['K8s', 'Go', 'Incident Response', 'Observability'],
    'Night on-call shift pe khud hi seekhoge: prevention > firefighting.',
    {}
  ),
  makeAlumni(
    42,
    'Komal Arya',
    '2024',
    'Associate Product Designer',
    'Paytm',
    'Noida, India',
    'design',
    2,
    ['Paytm Young Gun 2025'],
    ['Figma', 'Mobile IA', 'Prototyping'],
    'Pehla saal portfolio se zyada ek strong mentor find karne me lagaao.',
    {}
  ),
  makeAlumni(
    43,
    'Siddharth Nair',
    '2019',
    'Partner',
    'Blume Ventures',
    'Bangalore, India',
    'entrepreneur',
    7,
    ['Seed backer of 12 unicorn-track startups'],
    ['Venture Investing', 'Dealflow', 'Founder Coaching'],
    'VC business me bet thoughts nahi, founders pe lagate hain — chemistry aur craft dono dekho.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    44,
    'Priyanshi Jain',
    '2021',
    'Lead Copywriter',
    'Wieden+Kennedy',
    'Delhi NCR, India',
    'creative',
    5,
    ['Goafest Young Lion 2024'],
    ['Long-form writing', 'Brand voice', 'Pitches'],
    'Copy me clarity > cleverness — tagline ke peeche story honi chahiye.',
    {}
  ),
  makeAlumni(
    45,
    'Harsh Vardhan',
    '2018',
    'Senior Director — Engineering',
    'Freshworks',
    'Chennai, India',
    'tech',
    8,
    ['Freshworks Engineering Excellence', 'Scaled platform to 60k+ customers'],
    ['SaaS', 'Architecture', 'Leadership'],
    'Senior role me humility chahiye — junior best engineers se seekh sakte ho daily.',
    {
      featured: true,
      mentor: true,
      timeline: [
        { year: '2018', role: 'Graduated', company: 'Taru Guardians' },
        { year: '2018', role: 'Software Engineer', company: 'Freshworks' },
        { year: '2021', role: 'Engineering Manager', company: 'Freshworks' },
        { year: '2023', role: 'Director', company: 'Freshworks' },
        { year: '2025', role: 'Senior Director', company: 'Freshworks' },
      ],
    }
  ),
  makeAlumni(
    46,
    'Nisha Pillai',
    '2022',
    'Energy Analyst',
    'IEA (International Energy Agency)',
    'Paris, France',
    'impact',
    4,
    ['IEA Young Analyst Program'],
    ['Energy Modeling', 'Policy Research', 'Writing'],
    'Sustainability me rich data mil jaati hai — par comms skill zyada matter karta hai.',
    {
      mentor: true,
    }
  ),
  makeAlumni(
    47,
    'Gaurav Khanna',
    '2023',
    'Android Engineer',
    'Truecaller',
    'Bangalore, India',
    'tech',
    3,
    ['Truecaller Q3 2024 MVP'],
    ['Kotlin', 'Compose', 'Performance', 'Play Store hygiene'],
    'Library churn me phasne se bacho — fundamentals tight rakho (concurrency, memory, render).',
    {}
  ),
  makeAlumni(
    48,
    'Sara D\'Souza',
    '2020',
    'Diplomatic Fellow',
    'United Nations Development Programme',
    'Geneva, Switzerland',
    'impact',
    6,
    ['UN Gender Action Fellowship 2024', '4 cross-country field missions'],
    ['Policy', 'Multi-lateral negotiation', 'Writing', 'Languages'],
    'Diplomacy me patience + precision — zor se bolna communication nahi hota.',
    {
      featured: true,
    }
  ),
  makeAlumni(
    49,
    'Ashish Gowda',
    '2019',
    'Principal Product Manager',
    'Atlassian',
    'Bangalore, India',
    'product',
    7,
    ['Atlassian PM of the Year 2023'],
    ['Dev tools', 'B2B SaaS', 'Cross-functional leadership'],
    'B2B PM role me user != buyer — dono ko genuinely serve karo.',
    {
      mentor: true,
      featured: true,
    }
  ),
  makeAlumni(
    50,
    'Ritu Saxena',
    '2021',
    'Creative Director',
    'Scroll.in',
    'New Delhi, India',
    'creative',
    5,
    ['Ramnath Goenka Award 2024', '3 long-form visual essays shipped'],
    ['Visual storytelling', 'Editorial', 'Digital publishing'],
    'Media me trust build karna slow kaam hai — viral hona goal mat banao.',
    {}
  ),
  makeAlumni(
    51,
    'Varun Rao',
    '2024',
    'Backend Engineer',
    'Uber',
    'Bangalore, India',
    'tech',
    2,
    ['Uber Hackathon Winner 2025'],
    ['Go', 'gRPC', 'Distributed systems', 'Streaming'],
    'Jab pehla system design review aaye, prepare karke jaana — shortcut nahi chalte.',
    {}
  ),
  makeAlumni(
    52,
    'Bhoomika Das',
    '2018',
    'VP — Product',
    'Swiggy',
    'Bangalore, India',
    'product',
    8,
    ['Swiggy Innovation Trailblazer', 'Scaled food+grocery product org 25→240'],
    ['Zero-to-one', 'Consumer product', 'Org design'],
    'VP role me sabse important skill hai delegate-with-trust + tough-decisions-with-kindness.',
    {
      featured: true,
      mentor: true,
      pledge: 'Mentor 30 women founders each year.',
    }
  ),
];

// -----------------------------------------------------
// Aggregates
// -----------------------------------------------------

const uniqueCompanies = Array.from(new Set(ALUMNI_DATA.map((a) => a.company))).sort();

const ALUMNI_STATS: AlumniStats & { avgYoE: number; countries: number; mentors: number } = {
  totalAlumni: 500,
  avgExperience: Math.round(
    (ALUMNI_DATA.reduce((acc, a) => acc + a.experienceYears, 0) / ALUMNI_DATA.length) * 10
  ) / 10,
  placementRate: 96,
  companiesHired: uniqueCompanies.length + 120,
  avgYoE:
    Math.round(
      (ALUMNI_DATA.reduce((acc, a) => acc + a.experienceYears, 0) / ALUMNI_DATA.length) * 10
    ) / 10,
  countries: new Set(ALUMNI_DATA.map((a) => a.location.split(',').slice(-1)[0].trim())).size,
  mentors: ALUMNI_DATA.filter((a) => a.mentor).length,
};

// -----------------------------------------------------
// Testimonials / featured quotes
// -----------------------------------------------------

interface Testimonial {
  id: string;
  authorId: string;
  quote: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = ALUMNI_DATA
  .filter((a) => !!a.quote)
  .slice(0, 8)
  .map((a) => ({
    id: `t-${a.id}`,
    authorId: a.id,
    quote: a.quote!,
    role: `${a.currentRole} · ${a.company}`,
  }));

// -----------------------------------------------------
// Top companies aggregate
// -----------------------------------------------------

const TOP_COMPANIES = (() => {
  const map = new Map<string, number>();
  ALUMNI_DATA.forEach((a) => map.set(a.company, (map.get(a.company) ?? 0) + 1));
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
})();

// -----------------------------------------------------
// Hall of Fame (featured alumni highlights)
// -----------------------------------------------------

const HALL_OF_FAME = ALUMNI_DATA.filter((a) => a.featured);

// -----------------------------------------------------
// Meetups / upcoming alumni events
// -----------------------------------------------------

interface AlumniMeetup {
  id: string;
  title: string;
  date: string;
  city: string;
  mode: 'offline' | 'virtual' | 'hybrid';
  description: string;
  capacity: number;
  registered: number;
  tags: string[];
}

const ALUMNI_MEETUPS: AlumniMeetup[] = [
  {
    id: 'm1',
    title: 'Bangalore Alumni Catch-up — Q2 2026',
    date: '2026-05-17',
    city: 'Bangalore',
    mode: 'offline',
    description:
      'Casual evening with snacks + lightning talks from 6 alumni across product, tech, sustainability.',
    capacity: 120,
    registered: 87,
    tags: ['networking', 'talks', 'offline'],
  },
  {
    id: 'm2',
    title: 'Climate Tech Fireside — online',
    date: '2026-04-30',
    city: 'Virtual',
    mode: 'virtual',
    description:
      'Alumni working in cleantech share practical lessons on building in the climate space.',
    capacity: 500,
    registered: 312,
    tags: ['cleantech', 'virtual', 'fireside'],
  },
  {
    id: 'm3',
    title: 'Hyderabad Mentor Night',
    date: '2026-06-08',
    city: 'Hyderabad',
    mode: 'offline',
    description:
      'Speed-mentoring with 12 alumni across product, data, design. Open to current students.',
    capacity: 80,
    registered: 64,
    tags: ['mentorship', 'offline'],
  },
  {
    id: 'm4',
    title: 'Alumni Founders Panel — Mumbai',
    date: '2026-07-12',
    city: 'Mumbai',
    mode: 'hybrid',
    description:
      'Panel with alumni founders across edtech, cleantech, fintech — Q&A with students + alumni.',
    capacity: 200,
    registered: 143,
    tags: ['founders', 'panel', 'hybrid'],
  },
  {
    id: 'm5',
    title: 'Design Systems Masterclass',
    date: '2026-08-03',
    city: 'Virtual',
    mode: 'virtual',
    description:
      'Hands-on 3-hour workshop from Head-of-Design alumni. Build a starter design system together.',
    capacity: 250,
    registered: 112,
    tags: ['design', 'workshop'],
  },
  {
    id: 'm6',
    title: 'Global Alumni Summit 2026',
    date: '2026-11-20',
    city: 'Bangalore',
    mode: 'hybrid',
    description:
      'Annual flagship 2-day summit — 40+ speakers, 10 workshops, awards night, campus connect.',
    capacity: 700,
    registered: 280,
    tags: ['summit', 'annual', 'flagship'],
  },
];

// -----------------------------------------------------
// Mentorship spots
// -----------------------------------------------------

interface MentorshipSlot {
  id: string;
  mentorId: string;
  topic: string;
  slotsRemaining: number;
  durationMin: number;
  format: 'call' | 'chat' | 'in-person';
}

const MENTORSHIP_SLOTS: MentorshipSlot[] = ALUMNI_DATA
  .filter((a) => a.mentor)
  .slice(0, 12)
  .map((a, idx) => ({
    id: `ms-${a.id}`,
    mentorId: a.id,
    topic: [
      'Breaking into Product',
      'System design fundamentals',
      'Design portfolio review',
      'Research path after college',
      'Sustainability career advice',
      'Founding engineer journey',
      'Data science interviews',
      'Finance off-campus prep',
      'Consulting case workshop',
      'ML engineering career',
      'Startup fundraising basics',
      'Cross-border careers',
    ][idx % 12],
    slotsRemaining: 2 + (idx % 4),
    durationMin: [30, 45, 60][idx % 3],
    format: (['call', 'chat', 'in-person'] as const)[idx % 3],
  }));

// -----------------------------------------------------
// Alumni pledges / sustainability initiatives
// -----------------------------------------------------

const ALUMNI_PLEDGES = ALUMNI_DATA.filter((a) => !!a.sustainabilityPledge).slice(0, 10);

// -----------------------------------------------------
// City chapters / regional hubs
// -----------------------------------------------------

interface ChapterHub {
  id: string;
  city: string;
  country: string;
  emoji: string;
  color: string;
  founded: string;
  anchors: string[];
  members: number;
  cadence: string;
  meetup: string;
  vibe: string;
}

const CHAPTERS: ChapterHub[] = [
  {
    id: 'ch-blr',
    city: 'Bengaluru',
    country: 'India',
    emoji: '🌆',
    color: '#4CAF50',
    founded: '2022',
    anchors: ['Meera Iyer · 2019', 'Rahul Das · 2020'],
    members: 92,
    cadence: 'Every 1st Saturday · 10:00–12:30',
    meetup: 'Cubbon Park · Bandstand corner',
    vibe: 'Sunday photo walks, alumni brunches, sapling drives at Turahalli.',
  },
  {
    id: 'ch-hyd',
    city: 'Hyderabad',
    country: 'India',
    emoji: '🏛️',
    color: '#38BDF8',
    founded: '2023',
    anchors: ['Aditi Pawar · 2020'],
    members: 47,
    cadence: 'Every 2nd Sunday · 16:00–18:30',
    meetup: 'KBR Park · Main gate',
    vibe: 'Slow walks. Biriyani afterwards. A running book club since 2023.',
  },
  {
    id: 'ch-pune',
    city: 'Pune',
    country: 'India',
    emoji: '🏞️',
    color: '#F59E0B',
    founded: '2023',
    anchors: ['Ishaan Kulkarni · 2021'],
    members: 38,
    cadence: 'Fortnightly Sundays',
    meetup: 'ARAI Hill (monsoon) · FC Road cafes (rest of year)',
    vibe: 'Monsoon treks, ghazal nights, FC Road cafes the rest of the year.',
  },
  {
    id: 'ch-mum',
    city: 'Mumbai',
    country: 'India',
    emoji: '🌊',
    color: '#A78BFA',
    founded: '2024',
    anchors: ['Zara Qureshi · 2022', 'Raghav Sethi · 2019'],
    members: 64,
    cadence: 'Monthly · last Sunday',
    meetup: 'Worli Sea Face (sunsets) · Bandra cafes',
    vibe: 'Sunsets by the sea-face, and a rotating cohort of sector-specific hangs.',
  },
  {
    id: 'ch-del',
    city: 'Delhi NCR',
    country: 'India',
    emoji: '🌳',
    color: '#F472B6',
    founded: '2022',
    anchors: ['Kanishka Arora · 2018', 'Farhan Siddiqui · 2023'],
    members: 71,
    cadence: 'Monthly · 1st Sunday',
    meetup: 'Lodhi Garden · Tomb cluster',
    vibe: 'Lodhi walks, climate-talks and winter bookbinding meets.',
  },
  {
    id: 'ch-chn',
    city: 'Chennai',
    country: 'India',
    emoji: '🏖️',
    color: '#22C55E',
    founded: '2024',
    anchors: ['Divya Rajagopal · 2021'],
    members: 29,
    cadence: 'Monthly · 2nd Saturday',
    meetup: 'Besant Nagar · Elliot\'s Beach',
    vibe: 'Beach cleanups, filter coffee, very slow Tamil literature readings.',
  },
  {
    id: 'ch-sfo',
    city: 'SF Bay Area',
    country: 'USA',
    emoji: '🌉',
    color: '#6366F1',
    founded: '2024',
    anchors: ['Tanvi Shah · 2019', 'Rohan Menon · 2020'],
    members: 31,
    cadence: 'Monthly · rotating hosts',
    meetup: 'Dolores Park · Mission St. cafés',
    vibe: 'Friendly weekend meet-ups. Quarterly hiring AMAs for new grads.',
  },
  {
    id: 'ch-ldn',
    city: 'London',
    country: 'UK',
    emoji: '☂️',
    color: '#F87171',
    founded: '2025',
    anchors: ['Harsh Bhargava · 2020'],
    members: 18,
    cadence: 'Monthly · 3rd Saturday',
    meetup: 'Regent\'s Park · Primrose Hill slope',
    vibe: 'Slow park lunches, climate policy chats, and actual British weather.',
  },
  {
    id: 'ch-sgp',
    city: 'Singapore',
    country: 'Singapore',
    emoji: '🌴',
    color: '#FBBF24',
    founded: '2024',
    anchors: ['Nandini Pillai · 2021'],
    members: 22,
    cadence: 'Fortnightly · Sunday mornings',
    meetup: 'Botanic Gardens · Swan Lake',
    vibe: 'Sunday mornings at the Botanic Gardens, and a sprawling WhatsApp group.',
  },
  {
    id: 'ch-blr-west',
    city: 'Bengaluru · West',
    country: 'India',
    emoji: '🌿',
    color: '#EC4899',
    founded: '2025',
    anchors: ['Varun Nambiar · 2022'],
    members: 26,
    cadence: 'Monthly · 3rd Sunday',
    meetup: 'Kaikondrahalli Lake',
    vibe: 'Lake cleanups, bird counts, post-walk iced filter coffee.',
  },
];

// -----------------------------------------------------
// Career pivots — stories of non-obvious moves
// -----------------------------------------------------

interface CareerPivot {
  id: string;
  from: string;
  to: string;
  alumniId: string;
  year: string;
  story: string;
  takeaway: string;
  icon: string;
  color: string;
}

const CAREER_PIVOTS: CareerPivot[] = [
  {
    id: 'cp-1',
    alumniId: 'al-1',
    from: 'Backend at fintech',
    to: 'Climate-data platform lead',
    year: '2024',
    story: 'Shipped the club sustainability dashboard in senior year. Two years later, he rebuilt it for a real emissions-data startup.',
    takeaway: 'The club\'s dashboards were the portfolio that mattered.',
    icon: '🌡️',
    color: '#22C55E',
  },
  {
    id: 'cp-2',
    alumniId: 'al-5',
    from: 'Consulting',
    to: 'Co-founded climate fund',
    year: '2025',
    story: 'Spent 18 months reading every impact-VC deck. Raised a modest early-stage climate fund out of Bengaluru. Still writes monthly LP letters longhand.',
    takeaway: 'Patience compounds faster than a Series A.',
    icon: '💼',
    color: '#F59E0B',
  },
  {
    id: 'cp-3',
    alumniId: 'al-3',
    from: 'Frontend dev',
    to: 'Design systems engineer',
    year: '2023',
    story: 'Co-authored the club\'s design tokens. Got pulled into a full design-systems role at her company. Still ships the quarterly club kit.',
    takeaway: 'Ownership in open source creates the career you want.',
    icon: '🎨',
    color: '#F472B6',
  },
  {
    id: 'cp-4',
    alumniId: 'al-7',
    from: 'ML research intern',
    to: 'Field sustainability researcher',
    year: '2024',
    story: 'Decided the lab wasn\'t where the problems lived. Works out of 4 villages in North Karnataka now. Publishes quarterly field briefs.',
    takeaway: 'The shortest loop between problem and fix is sometimes the field.',
    icon: '🌾',
    color: '#84CC16',
  },
  {
    id: 'cp-5',
    alumniId: 'al-9',
    from: 'Product at social app',
    to: 'Public-school tech lead',
    year: '2023',
    story: 'Left a fast-growing product job to rebuild a state-school computer lab. 4 teachers trained, 180 students onboarded.',
    takeaway: 'Impact × proximity > salary.',
    icon: '🏫',
    color: '#38BDF8',
  },
  {
    id: 'cp-6',
    alumniId: 'al-11',
    from: 'Data science at retailer',
    to: 'Open-data journalist',
    year: '2025',
    story: 'Wrote 8 posts on campus energy data for the club. A national paper picked it up. Now full-time data journalist.',
    takeaway: 'The first 8 posts were the audition.',
    icon: '📰',
    color: '#A78BFA',
  },
];

// -----------------------------------------------------
// Mentor board (council of returning alumni)
// -----------------------------------------------------

interface MentorBoardSeat {
  id: string;
  alumniId: string;
  name: string;
  role: string;
  domain: string;
  office: string;
  color: string;
  focus: string;
  hoursLeft: number;
}

const MENTOR_BOARD: MentorBoardSeat[] = [
  { id: 'mb-1', alumniId: 'al-1', name: 'Meera Iyer', role: 'Platform eng · climate SaaS', domain: 'Technology', office: 'Bengaluru · in-person Wednesdays', color: '#38BDF8', focus: 'Backend architecture, field data pipelines, junior mentorship.', hoursLeft: 4 },
  { id: 'mb-2', alumniId: 'al-3', name: 'Tanvi Shah', role: 'Design systems eng', domain: 'Design', office: 'SF Bay · remote + async review', color: '#F472B6', focus: 'Design tokens, accessibility, portfolio review.', hoursLeft: 3 },
  { id: 'mb-3', alumniId: 'al-5', name: 'Kanishka Arora', role: 'Climate fund partner', domain: 'Finance', office: 'Delhi · Friday afternoons', color: '#F59E0B', focus: 'Grant writing, pitch prep, budgeting early-stage.', hoursLeft: 2 },
  { id: 'mb-4', alumniId: 'al-7', name: 'Aditi Pawar', role: 'Field researcher', domain: 'Research', office: 'Hyderabad + 4 villages', color: '#A78BFA', focus: 'Field research ethics, stakeholder interviews, publication.', hoursLeft: 5 },
  { id: 'mb-5', alumniId: 'al-9', name: 'Farhan Siddiqui', role: 'Ed-tech · public schools', domain: 'Impact', office: 'Delhi NCR · monthly Zoom', color: '#22C55E', focus: 'Classroom tech, curricula co-design, teacher trust.', hoursLeft: 6 },
  { id: 'mb-6', alumniId: 'al-11', name: 'Ishaan Kulkarni', role: 'Data journalist', domain: 'Content', office: 'Pune · alternate Saturdays', color: '#F87171', focus: 'Investigative pitching, data vis, long-form editing.', hoursLeft: 3 },
];

// =====================================================
// Fireside recaps (past events with guest stories)
// =====================================================

interface FiresideRecap {
  id: string;
  title: string;
  date: string;
  host: string;
  guests: string[];
  attendance: number;
  highlight: string;
  quote: string;
  quoteAuthor: string;
  color: string;
  emoji: string;
}

const FIRESIDE_RECAPS: FiresideRecap[] = [
  { id: 'fr-1', title: 'Fireside · ‘Fieldwork that doesn\'t break you’',             date: 'Mar 15, 2026', host: 'Aditi Pawar',       guests: ['Aditi Pawar', 'Farhan Siddiqui'],        attendance: 142, highlight: 'Two researchers mapped the line between rigour and self-care. The room stayed quiet for a long time after.', quote: 'If the research breaks you, it wasn\'t honest research. It was extraction from the inside out.',            quoteAuthor: 'Aditi Pawar',       color: '#A78BFA', emoji: '🔥' },
  { id: 'fr-2', title: 'Fireside · ‘Designing for the last user, not the first’',     date: 'Feb 22, 2026', host: 'Tanvi Shah',        guests: ['Tanvi Shah', 'Mira Jain'],               attendance: 118, highlight: 'A designer\'s case for the slow, quiet polish that the loudest users never see.',                                            quote: 'Beautiful onboarding is easy. The hard work is the 400th screen. That\'s the one that teaches you to design.', quoteAuthor: 'Tanvi Shah',        color: '#F472B6', emoji: '🔥' },
  { id: 'fr-3', title: 'Fireside · ‘Funding without selling your soul’',              date: 'Jan 28, 2026', host: 'Kanishka Arora',    guests: ['Kanishka Arora', 'Vishwas Kapoor'],      attendance: 156, highlight: 'How small climate orgs raise money without warping their work. The honest answer: slowly.',                                 quote: 'The best grant I ever wrote started with a line our CEO crossed out three times: ‘what we got wrong last year.’', quoteAuthor: 'Kanishka Arora',  color: '#F59E0B', emoji: '🔥' },
  { id: 'fr-4', title: 'Fireside · ‘Writing for readers who don\'t have time’',        date: 'Dec 12, 2025', host: 'Ishaan Kulkarni',   guests: ['Ishaan Kulkarni', 'Ananya Prasad'],      attendance: 204, highlight: 'A data journalist on the discipline of writing for people who will give you 90 seconds and no longer.',                       quote: 'If your lede doesn\'t survive the lift, the whole piece dies in a coat pocket.',                                      quoteAuthor: 'Ishaan Kulkarni',   color: '#F87171', emoji: '🔥' },
  { id: 'fr-5', title: 'Fireside · ‘Open-source as a village discipline’',             date: 'Nov 30, 2025', host: 'Meera Iyer',        guests: ['Meera Iyer', 'Rohit Bhatt'],             attendance: 187, highlight: 'Two engineers on treating an OSS project like a village: the maintainers, the outsiders, the elders, the kids.',           quote: 'An issue backlog is a memory. You weed it. You don\'t let it become a landfill.',                                  quoteAuthor: 'Meera Iyer',        color: '#38BDF8', emoji: '🔥' },
  { id: 'fr-6', title: 'Fireside · ‘Career pivots we don\'t regret’',                   date: 'Oct 18, 2025', host: 'Varun Mehta',       guests: ['Varun Mehta', 'Saanvi Rao', 'Rehan Qureshi'], attendance: 234, highlight: 'Three alumni on leaving jobs that looked right on paper. No villains. Just honest reasons.',                                 quote: 'The day I stopped defending the thing I was doing is the day I learned I had already left it.',                      quoteAuthor: 'Saanvi Rao',         color: '#22C55E', emoji: '🔥' },
];

// =====================================================
// Relocation grants (alumni-funded support)
// =====================================================

interface RelocationGrant {
  id: string;
  name: string;
  amount: string;
  cadence: string;
  usedFor: string;
  eligibility: string;
  deadline: string;
  color: string;
}

const RELOCATION_GRANTS: RelocationGrant[] = [
  { id: 'rg-1', name: 'First-month floor grant',        amount: '₹18,000',   cadence: 'One-off',      usedFor: 'Deposit + first-month rent for alumni moving to a new city for their first role.',          eligibility: 'Any alumni within 12 months of graduation · first move.',   deadline: 'Rolling',         color: '#22C55E' },
  { id: 'rg-2', name: 'Climate-job travel stipend',     amount: '₹12,500',   cadence: 'Bi-annual',    usedFor: 'Travel + 3 nights of stay for in-person interviews at climate-sector employers.',             eligibility: 'Interview invite from a verified climate org.',              deadline: 'Mar 31 / Sep 30', color: '#F59E0B' },
  { id: 'rg-3', name: 'Field-research microgrant',       amount: '₹22,000',   cadence: 'Quarterly',    usedFor: 'Field-travel, stay, and a 30-day data plan for alumni doing first-time primary research.',   eligibility: 'Alumni + 1 mentor co-signed · open proposal form.',          deadline: 'Apr 30',          color: '#A78BFA' },
  { id: 'rg-4', name: 'Gear-return buy-back',             amount: '₹4,500 avg', cadence: 'Rolling',     usedFor: 'Buy-back on cameras / mics / second laptops returning to the club pool from alumni.',        eligibility: 'Gear bought with alumni\'s own money during club years.',     deadline: 'Rolling',         color: '#38BDF8' },
  { id: 'rg-5', name: 'Legal / taxes first-time',         amount: 'Free',       cadence: 'Bi-annual',    usedFor: 'A 45-min session with a CA + a lawyer on first-time tax filing, NDA reviews, and offers.',   eligibility: 'First-year after graduation.',                                deadline: 'Jul 31',          color: '#F472B6' },
  { id: 'rg-6', name: 'Emergency food-and-rent',          amount: '₹6,000',    cadence: 'On request',   usedFor: 'Private fund for alumni in a 2-4 week rough patch. No form. A quick call. Trust-based.',     eligibility: 'Any alumni · confidential · never published.',                deadline: 'Rolling',         color: '#EF4444' },
];

// =====================================================
// Alumni polls (quarterly pulse)
// =====================================================

interface AlumniPoll {
  id: string;
  question: string;
  total: number;
  answers: { label: string; pct: number; color: string }[];
  finishedAt: string;
  commentary: string;
}

const ALUMNI_POLLS: AlumniPoll[] = [
  {
    id: 'ap-1',
    question: 'What do you wish you\'d learned in your last semester?',
    total: 148,
    finishedAt: 'Q1 2026',
    commentary: 'Negotiating offers beat ‘another framework’ by a wide margin — and it\'s been the same answer three quarters in a row.',
    answers: [
      { label: 'Negotiating offers + compensation',        pct: 38, color: '#22C55E' },
      { label: 'Managing up · working with seniors',        pct: 22, color: '#38BDF8' },
      { label: 'Writing clearly in email / docs',          pct: 17, color: '#A78BFA' },
      { label: 'Tax / legal / relocation basics',          pct: 14, color: '#F59E0B' },
      { label: 'Another technical framework',              pct: 9,  color: '#F472B6' },
    ],
  },
  {
    id: 'ap-2',
    question: 'How often do you still talk to your club batch?',
    total: 162,
    finishedAt: 'Q1 2026',
    commentary: 'A long tail of alumni still message their batch weekly — even 4 years in. The app helps · in-person helps more.',
    answers: [
      { label: 'Weekly · group is still active',           pct: 28, color: '#22C55E' },
      { label: 'Monthly · on a call / meetup',             pct: 34, color: '#38BDF8' },
      { label: 'Quarterly · only at chapter meetups',      pct: 22, color: '#A78BFA' },
      { label: 'Rarely · but I want to more',              pct: 12, color: '#F59E0B' },
      { label: 'Never',                                     pct: 4,  color: '#F472B6' },
    ],
  },
  {
    id: 'ap-3',
    question: 'Which support from the club mattered most?',
    total: 134,
    finishedAt: 'Q4 2025',
    commentary: 'Alumni-to-alumni support outranks official mentorship. We\'re getting better at scaffolding it.',
    answers: [
      { label: 'Alumni-to-alumni introductions',           pct: 32, color: '#22C55E' },
      { label: 'Formal mentorship · paired',               pct: 24, color: '#38BDF8' },
      { label: 'Relocation / grant support',               pct: 18, color: '#A78BFA' },
      { label: 'Mock interviews + portfolio reviews',      pct: 16, color: '#F59E0B' },
      { label: 'Nothing specific · just the community',    pct: 10, color: '#F472B6' },
    ],
  },
  {
    id: 'ap-4',
    question: 'If you could add one more alumni service, what would it be?',
    total: 118,
    finishedAt: 'Q4 2025',
    commentary: 'A dedicated therapy stipend is now the top write-in · leadership is exploring it for Q3.',
    answers: [
      { label: 'Subsidised therapy · mental health support', pct: 34, color: '#22C55E' },
      { label: 'Alumni-to-alumni lending circle',            pct: 21, color: '#38BDF8' },
      { label: 'Job-hunting cohort · 6-week structured',     pct: 18, color: '#A78BFA' },
      { label: 'More in-person city meetups',                 pct: 16, color: '#F59E0B' },
      { label: 'Online-only · less in-person please',          pct: 11, color: '#F472B6' },
    ],
  },
];

// =====================================================
// Alumni publications (writing & research credits)
// =====================================================

interface Publication {
  id: string;
  alumniId: string;
  author: string;
  title: string;
  venue: string;
  year: number;
  kind: 'paper' | 'essay' | 'book' | 'talk';
  color: string;
}

const PUBLICATIONS: Publication[] = [
  { id: 'pub-1',  alumniId: 'al-1',  author: 'Meera Iyer',        title: 'Field-first data pipelines · a pattern library',          venue: 'Open-Source Climate Journal',       year: 2025, kind: 'paper', color: '#38BDF8' },
  { id: 'pub-2',  alumniId: 'al-3',  author: 'Tanvi Shah',         title: 'Design tokens for low-bandwidth apps',                   venue: 'SmashingConf · Freiburg',             year: 2025, kind: 'talk',  color: '#F472B6' },
  { id: 'pub-3',  alumniId: 'al-5',  author: 'Kanishka Arora',     title: 'Writing a climate grant without lying',                  venue: 'India Impact Review',                 year: 2024, kind: 'essay', color: '#F59E0B' },
  { id: 'pub-4',  alumniId: 'al-7',  author: 'Aditi Pawar',        title: 'Consent protocols in village field research',            venue: 'Journal of Applied Anthropology',     year: 2024, kind: 'paper', color: '#A78BFA' },
  { id: 'pub-5',  alumniId: 'al-9',  author: 'Farhan Siddiqui',    title: 'Teacher trust is the curriculum',                        venue: 'Ed-tech Stories Anthology',           year: 2025, kind: 'book',  color: '#22C55E' },
  { id: 'pub-6',  alumniId: 'al-11', author: 'Ishaan Kulkarni',    title: 'A data-journalist\'s rough-draft notebook',              venue: 'Personal · open repo',                year: 2024, kind: 'essay', color: '#F87171' },
  { id: 'pub-7',  alumniId: 'al-1',  author: 'Meera Iyer',         title: 'What release rotations taught a tiny open-source team',  venue: 'GitHub Universe',                      year: 2024, kind: 'talk',  color: '#38BDF8' },
  { id: 'pub-8',  alumniId: 'al-3',  author: 'Tanvi Shah',         title: 'Designing for the last user',                            venue: 'Config · Figma',                        year: 2026, kind: 'talk',  color: '#F472B6' },
  { id: 'pub-9',  alumniId: 'al-5',  author: 'Kanishka Arora',     title: 'The quiet grant · an anatomy',                          venue: 'Stanford Social Innovation Review',    year: 2025, kind: 'essay', color: '#F59E0B' },
  { id: 'pub-10', alumniId: 'al-7',  author: 'Aditi Pawar',        title: 'Rain on the landslide · a 5-village study',             venue: 'Environment & Urbanization',          year: 2025, kind: 'paper', color: '#A78BFA' },
];

// =====================================================
// Phase 3q-alumni: deeper alumni structures
// =====================================================

interface AlumniScholarship {
  id: string;
  name: string;
  fundedBy: string;
  amountInr: number;
  batch: string;
  discipline: string;
  recipients: number;
  note: string;
  color: string;
  emoji: string;
}

const ALUMNI_SCHOLARSHIPS: AlumniScholarship[] = [
  { id: 'sch-1', name: 'Meera Iyer · field-engineering grant', fundedBy: 'Meera Iyer · 2018 batch', amountInr: 120000, batch: '2026 entry', discipline: 'Engineering + climate', recipients: 4, note: 'Two semesters · covers tuition gap + travel to one field site.', color: '#38BDF8', emoji: '🧪' },
  { id: 'sch-2', name: 'Tanvi · design-for-good fund', fundedBy: 'Tanvi Shah · 2019 batch', amountInr: 80000, batch: '2026 entry', discipline: 'Design · UX or brand', recipients: 3, note: 'Buys a first Wacom or a monitor · no paperwork beyond a thank-you note.', color: '#F472B6', emoji: '🎨' },
  { id: 'sch-3', name: 'Kanishka · writing-residency fund', fundedBy: 'Kanishka Arora · 2020 batch', amountInr: 60000, batch: '2026 entry', discipline: 'Writing / journalism', recipients: 2, note: 'Two-week residency + one editor mentor + one byline guarantee.', color: '#F59E0B', emoji: '✍️' },
  { id: 'sch-4', name: 'Aditi · field-research grant', fundedBy: 'Aditi Pawar · 2021 batch', amountInr: 100000, batch: '2026 entry', discipline: 'Social sciences · rural', recipients: 3, note: 'Three months · travel · one published paper at the end.', color: '#A78BFA', emoji: '🌾' },
  { id: 'sch-5', name: 'Farhan · teacher-training bursary', fundedBy: 'Farhan Siddiqui · 2019 batch', amountInr: 70000, batch: '2026 entry', discipline: 'Education', recipients: 5, note: 'One year · covers training plus one school visit per quarter.', color: '#22C55E', emoji: '📚' },
  { id: 'sch-6', name: 'Ishaan · open-journalism fund', fundedBy: 'Ishaan Kulkarni · 2021 batch', amountInr: 50000, batch: '2026 entry', discipline: 'Data journalism', recipients: 2, note: 'Pays for one story · editor + lawyer + publication support.', color: '#F87171', emoji: '📰' },
  { id: 'sch-7', name: 'Rohit · RN engineer bootstrap', fundedBy: 'Rohit Sen · 2022 batch', amountInr: 35000, batch: '2026 entry', discipline: 'Mobile engineering', recipients: 3, note: 'Buys a test device + a one-year course · short check-in calls.', color: '#00D4FF', emoji: '📱' },
  { id: 'sch-8', name: 'Nabhya · accessibility fund', fundedBy: 'Nabhya Gupta · 2022 batch', amountInr: 45000, batch: '2026 entry', discipline: 'A11y-focused work', recipients: 2, note: 'Gear + course + one deliverable (a11y audit) to a real org.', color: '#7E57C2', emoji: '♿' },
];

interface AdvisorySpecialism {
  id: string;
  alumniId: string;
  name: string;
  specialism: string;
  hoursPerMonth: number;
  slotsFilled: number;
  slotsOpen: number;
  note: string;
  color: string;
  emoji: string;
}

const ADVISORY_SPECIALISMS: AdvisorySpecialism[] = [
  { id: 'av-1', alumniId: 'al-1', name: 'Meera Iyer', specialism: 'Climate-data engineering', hoursPerMonth: 4, slotsFilled: 3, slotsOpen: 1, note: 'Prefers short field-logs + one focused call per fortnight.', color: '#38BDF8', emoji: '🧪' },
  { id: 'av-2', alumniId: 'al-3', name: 'Tanvi Shah', specialism: 'Brand + product-design crit', hoursPerMonth: 3, slotsFilled: 3, slotsOpen: 0, note: 'Opens a new slot every six months · join the waitlist.', color: '#F472B6', emoji: '🎨' },
  { id: 'av-3', alumniId: 'al-5', name: 'Kanishka Arora', specialism: 'Grants + long-form writing', hoursPerMonth: 2, slotsFilled: 2, slotsOpen: 1, note: 'One 90-min workshop on writing a grant draft without lying.', color: '#F59E0B', emoji: '✍️' },
  { id: 'av-4', alumniId: 'al-7', name: 'Aditi Pawar', specialism: 'Field-research consent', hoursPerMonth: 2, slotsFilled: 1, slotsOpen: 1, note: 'Reviews protocols · rarely on calls · prefers async notes.', color: '#A78BFA', emoji: '🌾' },
  { id: 'av-5', alumniId: 'al-9', name: 'Farhan Siddiqui', specialism: 'Teacher-training curriculum', hoursPerMonth: 4, slotsFilled: 2, slotsOpen: 2, note: 'Runs one in-person sit-in per term in Bengaluru.', color: '#22C55E', emoji: '📚' },
  { id: 'av-6', alumniId: 'al-11', name: 'Ishaan Kulkarni', specialism: 'Data-journalism + public records', hoursPerMonth: 3, slotsFilled: 2, slotsOpen: 1, note: 'Shares the quiet rules of requesting public documents.', color: '#F87171', emoji: '📰' },
  { id: 'av-7', alumniId: 'al-2', name: 'Rohit Sen', specialism: 'RN · Android · CI', hoursPerMonth: 4, slotsFilled: 3, slotsOpen: 1, note: 'Paired-debug session on anyone\'s real bug · bring logs.', color: '#00D4FF', emoji: '📱' },
  { id: 'av-8', alumniId: 'al-4', name: 'Nabhya Gupta', specialism: 'Accessibility audits', hoursPerMonth: 3, slotsFilled: 1, slotsOpen: 2, note: 'Teaches by auditing one of your real pages with you.', color: '#7E57C2', emoji: '♿' },
];

interface DiasporaCluster {
  id: string;
  city: string;
  country: string;
  alumniCount: number;
  meetsEvery: string;
  lead: string;
  flag: string;
  color: string;
}

const DIASPORA_CLUSTERS: DiasporaCluster[] = [
  { id: 'dc-1', city: 'Bengaluru', country: 'India', alumniCount: 42, meetsEvery: 'Last Sun · monthly', lead: 'Meera', flag: '🇮🇳', color: '#00D4FF' },
  { id: 'dc-2', city: 'Pune', country: 'India', alumniCount: 21, meetsEvery: 'Fortnightly Fri · evening', lead: 'Rohit', flag: '🇮🇳', color: '#22C55E' },
  { id: 'dc-3', city: 'Mumbai', country: 'India', alumniCount: 33, meetsEvery: 'First Sat · monthly', lead: 'Tanvi', flag: '🇮🇳', color: '#F472B6' },
  { id: 'dc-4', city: 'Delhi NCR', country: 'India', alumniCount: 29, meetsEvery: 'Monthly · rotating café', lead: 'Kanishka', flag: '🇮🇳', color: '#F59E0B' },
  { id: 'dc-5', city: 'London', country: 'UK', alumniCount: 14, meetsEvery: 'Quarterly · Saturday brunch', lead: 'Aditi', flag: '🇬🇧', color: '#A78BFA' },
  { id: 'dc-6', city: 'Berlin', country: 'Germany', alumniCount: 9, meetsEvery: 'Quarterly · park walk', lead: 'Farhan', flag: '🇩🇪', color: '#22C55E' },
  { id: 'dc-7', city: 'San Francisco Bay', country: 'USA', alumniCount: 12, meetsEvery: 'Quarterly · Sunday coffee', lead: 'Ishaan', flag: '🇺🇸', color: '#F87171' },
  { id: 'dc-8', city: 'Singapore', country: 'Singapore', alumniCount: 7, meetsEvery: 'Quarterly · Marina walk', lead: 'Nabhya', flag: '🇸🇬', color: '#7E57C2' },
  { id: 'dc-9', city: 'Dubai', country: 'UAE', alumniCount: 6, meetsEvery: 'Quarterly · desert drive', lead: 'Rohit', flag: '🇦🇪', color: '#FFB74D' },
];

interface AskMeAnything {
  id: string;
  alumniId: string;
  alumniName: string;
  date: string;
  topic: string;
  questionsCollected: number;
  mode: 'text' | 'audio' | 'video';
  color: string;
  emoji: string;
}

const AMA_SESSIONS: AskMeAnything[] = [
  { id: 'ama-1', alumniId: 'al-1', alumniName: 'Meera Iyer', date: 'Apr 27 · Sat', topic: 'First 90 days as a tech lead in a climate org', questionsCollected: 34, mode: 'audio', color: '#38BDF8', emoji: '🎙️' },
  { id: 'ama-2', alumniId: 'al-3', alumniName: 'Tanvi Shah', date: 'May 04 · Sat', topic: 'Breaking into design without a portfolio site', questionsCollected: 52, mode: 'video', color: '#F472B6', emoji: '🎥' },
  { id: 'ama-3', alumniId: 'al-5', alumniName: 'Kanishka Arora', date: 'May 11 · Sat', topic: 'Writing a grant · the parts nobody tells you', questionsCollected: 21, mode: 'text', color: '#F59E0B', emoji: '✍️' },
  { id: 'ama-4', alumniId: 'al-7', alumniName: 'Aditi Pawar', date: 'May 18 · Sat', topic: 'Consent-first field research in rural India', questionsCollected: 18, mode: 'audio', color: '#A78BFA', emoji: '🎙️' },
  { id: 'ama-5', alumniId: 'al-9', alumniName: 'Farhan Siddiqui', date: 'May 25 · Sat', topic: 'Training teachers who did not ask for training', questionsCollected: 29, mode: 'video', color: '#22C55E', emoji: '🎥' },
  { id: 'ama-6', alumniId: 'al-11', alumniName: 'Ishaan Kulkarni', date: 'Jun 01 · Sat', topic: 'Requesting public records · without anger', questionsCollected: 15, mode: 'text', color: '#F87171', emoji: '📝' },
];

interface GivingLedger {
  id: string;
  source: string;
  amountInr: number;
  used: string;
  dateReceived: string;
  visibility: 'named' | 'anonymous';
  color: string;
  emoji: string;
}

const GIVING_LEDGER: GivingLedger[] = [
  { id: 'gl-1', source: 'Meera Iyer · 2018', amountInr: 120000, used: 'Scholarship fund + field-engineering grant.', dateReceived: '2026-01-18', visibility: 'named', color: '#38BDF8', emoji: '🌱' },
  { id: 'gl-2', source: 'Tanvi Shah · 2019', amountInr: 80000, used: 'Design bursary · Wacom / monitor grants.', dateReceived: '2026-02-02', visibility: 'named', color: '#F472B6', emoji: '🎨' },
  { id: 'gl-3', source: 'Anonymous · batch 2018', amountInr: 60000, used: 'Covered hostel deposit for two first-years.', dateReceived: '2026-02-20', visibility: 'anonymous', color: '#94A3B8', emoji: '🤲' },
  { id: 'gl-4', source: 'Kanishka Arora · 2020', amountInr: 60000, used: 'Writing residency · two fellows.', dateReceived: '2026-03-11', visibility: 'named', color: '#F59E0B', emoji: '✍️' },
  { id: 'gl-5', source: 'Aditi Pawar · 2021', amountInr: 100000, used: 'Field-research grant · three fellows.', dateReceived: '2026-03-22', visibility: 'named', color: '#A78BFA', emoji: '🌾' },
  { id: 'gl-6', source: 'Anonymous · batch 2022', amountInr: 30000, used: 'Replaced broken studio strobe.', dateReceived: '2026-04-01', visibility: 'anonymous', color: '#94A3B8', emoji: '💡' },
  { id: 'gl-7', source: 'Farhan Siddiqui · 2019', amountInr: 70000, used: 'Teacher-training bursary · five teachers.', dateReceived: '2026-04-08', visibility: 'named', color: '#22C55E', emoji: '📚' },
  { id: 'gl-8', source: 'Ishaan Kulkarni · 2021', amountInr: 50000, used: 'Open-journalism fund · two investigations.', dateReceived: '2026-04-12', visibility: 'named', color: '#F87171', emoji: '📰' },
];

interface CompanyReferral {
  id: string;
  company: string;
  alumniLead: string;
  openRoles: number;
  type: 'full-time' | 'internship' | 'contract';
  lastUpdated: string;
  note: string;
  color: string;
  emoji: string;
}

const COMPANY_REFERRALS: CompanyReferral[] = [
  { id: 'cr-1', company: 'Atlassian', alumniLead: 'Rohit Sen · 2022', openRoles: 3, type: 'full-time', lastUpdated: '2 days ago', note: 'Android + release-engineering · remote within APAC only.', color: '#0052CC', emoji: '🧱' },
  { id: 'cr-2', company: 'Figma', alumniLead: 'Tanvi Shah · 2019', openRoles: 2, type: 'internship', lastUpdated: '5 days ago', note: 'Brand + product-design interns · portfolio review by Tanvi.', color: '#F24E1E', emoji: '🎨' },
  { id: 'cr-3', company: 'Scroll.in', alumniLead: 'Kanishka Arora · 2020', openRoles: 1, type: 'full-time', lastUpdated: '1 week ago', note: 'Climate correspondent · bilingual preferred.', color: '#EF4444', emoji: '📰' },
  { id: 'cr-4', company: 'Pratham', alumniLead: 'Farhan Siddiqui · 2019', openRoles: 4, type: 'full-time', lastUpdated: '3 days ago', note: 'Teacher training + curriculum · Bengaluru + Delhi.', color: '#22C55E', emoji: '📚' },
  { id: 'cr-5', company: 'WaterAid India', alumniLead: 'Aditi Pawar · 2021', openRoles: 2, type: 'contract', lastUpdated: '2 weeks ago', note: 'Field research · Assam + Karnataka · 3-month contracts.', color: '#38BDF8', emoji: '💧' },
  { id: 'cr-6', company: 'The Ken', alumniLead: 'Ishaan Kulkarni · 2021', openRoles: 1, type: 'internship', lastUpdated: '4 days ago', note: 'Data-journalism intern · remote · 3-month duration.', color: '#F59E0B', emoji: '📊' },
  { id: 'cr-7', company: 'Microsoft', alumniLead: 'Meera Iyer · 2018', openRoles: 2, type: 'full-time', lastUpdated: '1 day ago', note: 'Climate-data engineering · Hyderabad + Bengaluru.', color: '#0078D4', emoji: '🧪' },
  { id: 'cr-8', company: 'Mozilla Foundation', alumniLead: 'Nabhya Gupta · 2022', openRoles: 1, type: 'contract', lastUpdated: '6 days ago', note: 'A11y audit contractor · 6-month engagement.', color: '#A855F7', emoji: '♿' },
];

// =====================================================
// Phase 3x: deeper alumni structures
// =====================================================

interface LegacyProject {
  id: string;
  title: string;
  alumnus: string;
  batch: string;
  stillAlive: boolean;
  useNote: string;
  color: string;
  emoji: string;
}

const LEGACY_PROJECTS: LegacyProject[] = [
  { id: 'lp-1',  title: 'Sapling tracker v1 · Excel',        alumnus: 'Meera Iyer · 2014',   batch: '2014', stillAlive: false, useNote: 'Retired when the app took over · blueprint preserved.',          color: '#94A3B8', emoji: '📊' },
  { id: 'lp-2',  title: 'Club handbook · first draft',        alumnus: 'Rohit Kapoor · 2015', batch: '2015', stillAlive: true,  useNote: 'Still the backbone of our on-boarding · updated twice.',            color: '#F59E0B', emoji: '📘' },
  { id: 'lp-3',  title: 'Campus tree-walk audio guide',       alumnus: 'Tanvi Shah · 2016',   batch: '2016', stillAlive: true,  useNote: 'Plays on a rented speaker on every founding day.',                  color: '#22C55E', emoji: '🎧' },
  { id: 'lp-4',  title: 'Annual report · print template',     alumnus: 'Priya Ghosh · 2017',  batch: '2017', stillAlive: true,  useNote: 'Used for the last six annual reports · same typography.',          color: '#F472B6', emoji: '📰' },
  { id: 'lp-5',  title: 'Open-mic stage design',              alumnus: 'Anmol Sethi · 2018',  batch: '2018', stillAlive: true,  useNote: 'Five-year run · the stage you see on every showcase night.',        color: '#7E57C2', emoji: '🎤' },
  { id: 'lp-6',  title: 'Field-shoot consent-form template',  alumnus: 'Maya Sinha · 2019',   batch: '2019', stillAlive: true,  useNote: 'Translated to Hindi by a junior · now a club standard.',              color: '#FFD166', emoji: '📄' },
  { id: 'lp-7',  title: 'Code of conduct · v1',                alumnus: 'Ananya Rao · 2020',   batch: '2020', stillAlive: true,  useNote: 'Refined yearly · the spirit still hers.',                             color: '#EF4444', emoji: '🛡️' },
  { id: 'lp-8',  title: 'Bus-factor handover guide',          alumnus: 'Ishita Verma · 2021', batch: '2021', stillAlive: true,  useNote: 'Now pinned in every wing chat · saved a core lead-change once.',     color: '#00D4FF', emoji: '🔁' },
  { id: 'lp-9',  title: 'Taru Wings · first documentary',     alumnus: 'Vikram Joshi · 2019', batch: '2019', stillAlive: true,  useNote: 'Still shown to first-years · ten minutes of heart.',                  color: '#EF4444', emoji: '🎞️' },
];

interface AlumniAward {
  id: string;
  award: string;
  alumnus: string;
  year: string;
  body: string;
  note: string;
  color: string;
  emoji: string;
}

const ALUMNI_AWARDS: AlumniAward[] = [
  { id: 'aa-1', award: 'Green Campus Ambassador',        alumnus: 'Meera Iyer · 2014',   year: '2019', body: 'Ministry of Environment',                 note: 'For village sapling programs that crossed 40k trees.',           color: '#22C55E', emoji: '🌳' },
  { id: 'aa-2', award: 'Young Engineer of the Year',     alumnus: 'Anmol Sethi · 2018',  year: '2021', body: 'Institution of Engineers',                note: 'For solar-water-pump prototype built in final year.',             color: '#00D4FF', emoji: '🔌' },
  { id: 'aa-3', award: 'Forty Under Forty',              alumnus: 'Tanvi Shah · 2016',   year: '2023', body: 'Design Today · India',                    note: 'Long piece on poster systems · honest about mistakes.',           color: '#F472B6', emoji: '🎨' },
  { id: 'aa-4', award: 'Climate Journalism Grant',       alumnus: 'Rohit Kapoor · 2015', year: '2022', body: 'Pulitzer Climate Centre',                 note: 'For reporting from Sundarbans · grant took a full year.',         color: '#F59E0B', emoji: '📰' },
  { id: 'aa-5', award: 'NIT Distinguished Alumna',        alumnus: 'Priya Ghosh · 2017',  year: '2024', body: 'Alumni Council · NIT Surat',              note: 'First ecology-focused awardee · citation hand-written.',          color: '#A78BFA', emoji: '🎓' },
  { id: 'aa-6', award: 'Wildlife Photographer · Shortlist', alumnus: 'Maya Sinha · 2019', year: '2023', body: 'Royal Photography Society',               note: 'For a long exposure of a melting glacier · printed at the Met.',  color: '#FFD166', emoji: '📷' },
  { id: 'aa-7', award: 'Independent Films · Best Short',   alumnus: 'Vikram Joshi · 2019', year: '2024', body: 'Mumbai Film Festival',                    note: 'An 11-minute piece on a river waking up after monsoon.',           color: '#EF4444', emoji: '🎬' },
];

interface AlumniVenture {
  id: string;
  company: string;
  founder: string;
  year: string;
  stage: 'idea' | 'seed' | 'series A' | 'series B+' | 'non-profit';
  missionLine: string;
  hiringNote: string;
  color: string;
  emoji: string;
}

const ALUMNI_VENTURES: AlumniVenture[] = [
  { id: 'av-1',  company: 'Sorrel Cold-Chain',       founder: 'Meera Iyer · 2014',   year: '2019', stage: 'series A',  missionLine: 'Solar cold-chains for rural dairy · 31 villages.',                hiringNote: 'Hiring field engineers · base in Pune.',              color: '#00D4FF', emoji: '🧊' },
  { id: 'av-2',  company: 'Moss Studio',              founder: 'Tanvi Shah · 2016',   year: '2022', stage: 'seed',       missionLine: 'Design studio · climate and care briefs only.',                     hiringNote: 'Open to two motion designers · remote ok.',             color: '#F472B6', emoji: '🌿' },
  { id: 'av-3',  company: 'Jaldhaara',                founder: 'Rohit Kapoor · 2015', year: '2021', stage: 'non-profit', missionLine: 'Pond-restoration non-profit · 68 ponds so far.',                    hiringNote: 'Volunteer weekends · Karnataka + Tamil Nadu.',         color: '#38BDF8', emoji: '💧' },
  { id: 'av-4',  company: 'PaperTrails · school kits', founder: 'Anmol Sethi · 2018', year: '2023', stage: 'seed',       missionLine: 'Paper-light school kits for low-ink government schools.',          hiringNote: 'Not hiring yet · looking for school partners.',        color: '#F59E0B', emoji: '📚' },
  { id: 'av-5',  company: 'SongOfBirds · camera trap', founder: 'Maya Sinha · 2019',  year: '2024', stage: 'idea',       missionLine: 'Low-cost camera traps for small-town forest offices.',              hiringNote: 'Looking for one embedded engineer · early co-founder.', color: '#FFD166', emoji: '🐦' },
  { id: 'av-6',  company: 'Long Lens Films',          founder: 'Vikram Joshi · 2019', year: '2022', stage: 'seed',       missionLine: 'Documentary studio · quiet, long-form, patient.',                   hiringNote: 'Needs an editor · part-time, per-film.',               color: '#EF4444', emoji: '🎞️' },
  { id: 'av-7',  company: 'Okta Mentor Collective',    founder: 'Ananya Rao · 2020',  year: '2023', stage: 'non-profit', missionLine: 'Mentor matchmaking for first-gen engineers · free.',                hiringNote: 'Need mentors more than hires · please raise your hand.', color: '#7E57C2', emoji: '🫶' },
  { id: 'av-8',  company: 'Mangrove · climate pods',   founder: 'Ishita Verma · 2021', year: '2024', stage: 'idea',       missionLine: 'Offline-first climate learning pods for schools.',                  hiringNote: 'Pilot teachers in Kerala + Assam · join as builder.',   color: '#22C55E', emoji: '🌱' },
];

interface ReunionPlan {
  id: string;
  title: string;
  date: string;
  location: string;
  seats: number;
  rsvped: number;
  color: string;
  emoji: string;
}

const REUNION_PLANS: ReunionPlan[] = [
  { id: 'rp-1', title: 'Founding-day gather · all batches',  date: '20 May · Sat',     location: 'Campus lawn · main block',        seats: 200, rsvped: 132, color: '#FFD166', emoji: '🎉' },
  { id: 'rp-2', title: '10-year reunion · 2014 batch',        date: '07 Jun · Fri',     location: 'The old library · auditorium',    seats: 60,  rsvped: 41,  color: '#F59E0B', emoji: '🎓' },
  { id: 'rp-3', title: '5-year reunion · 2019 batch',         date: '14 Jun · Fri',     location: 'Black-box theatre',                seats: 80,  rsvped: 64,  color: '#A78BFA', emoji: '🪞' },
  { id: 'rp-4', title: 'Alumni + student open-mic',           date: '22 Jun · Sat',     location: 'Open-air amphitheatre',            seats: 150, rsvped: 84,  color: '#F472B6', emoji: '🎤' },
  { id: 'rp-5', title: 'Forest walk · alumni + juniors',      date: '30 Jun · Sun',     location: 'Campus ridge + hill trail',        seats: 40,  rsvped: 28,  color: '#22C55E', emoji: '🥾' },
  { id: 'rp-6', title: 'Quiet tea · only 2015–2018 batches',  date: '14 Jul · Sun',     location: 'Rooftop · dorm A',                 seats: 30,  rsvped: 20,  color: '#38BDF8', emoji: '🍵' },
];

interface FamilyHeritage {
  id: string;
  alumniName: string;
  relation: string;
  relatedTo: string;
  kind: 'parent' | 'sibling' | 'partner' | 'mentor';
  note: string;
  color: string;
  emoji: string;
}

const FAMILY_HERITAGE: FamilyHeritage[] = [
  { id: 'fh-1', alumniName: 'Meera Iyer · 2014',     relation: 'daughter of',   relatedTo: 'Prof. V. Iyer · botany dept',      kind: 'parent',  note: 'She wrote the first tree-walk script with him.',           color: '#22C55E', emoji: '🌳' },
  { id: 'fh-2', alumniName: 'Rahul Khanna · 2023',   relation: 'brother of',    relatedTo: 'Ira Khanna · 2020 batch',            kind: 'sibling', note: 'Both edited for the club magazine.',                       color: '#F59E0B', emoji: '📰' },
  { id: 'fh-3', alumniName: 'Anmol Sethi · 2018',    relation: 'mentee of',     relatedTo: 'Priya Ghosh · 2017 batch',           kind: 'mentor',  note: 'First-year mentor match · still meet every month.',         color: '#A78BFA', emoji: '🧭' },
  { id: 'fh-4', alumniName: 'Tanvi Shah · 2016',     relation: 'partner of',    relatedTo: 'Vikram Joshi · 2019 batch',          kind: 'partner', note: 'Met at the documentary night · three years in.',           color: '#F472B6', emoji: '🪷' },
  { id: 'fh-5', alumniName: 'Maya Sinha · 2019',     relation: 'daughter of',   relatedTo: 'Mrs. R. Sinha · campus librarian',   kind: 'parent',  note: 'Books + film · the library is on every thank-you card.',  color: '#FFD166', emoji: '📚' },
  { id: 'fh-6', alumniName: 'Ananya Rao · 2020',     relation: 'mentee of',     relatedTo: 'Rohit Kapoor · 2015 batch',          kind: 'mentor',  note: 'Reporting + policy · hands off a baton slowly.',           color: '#7E57C2', emoji: '📜' },
  { id: 'fh-7', alumniName: 'Ishita Verma · 2021',   relation: 'sister of',     relatedTo: 'Ira Verma · 2024 batch',             kind: 'sibling', note: 'Both in the core council · quiet joke about the surname.', color: '#00D4FF', emoji: '👭' },
];

interface AlumniStoryBeat {
  id: string;
  alumnusLine: string;
  year: string;
  beat: string;
  detail: string;
  color: string;
  emoji: string;
}

const STORY_BEATS: AlumniStoryBeat[] = [
  { id: 'sb-1', alumnusLine: 'Meera · 2014',     year: '2014', beat: 'Planted the first sapling row on the west slope',            detail: 'Twelve trees · forty-one still standing after a decade.',          color: '#22C55E', emoji: '🌱' },
  { id: 'sb-2', alumnusLine: 'Rohit · 2015',     year: '2016', beat: 'Wrote the handbook on a long train ride',                    detail: 'From Bengaluru to Delhi · 36 hours · the draft still has soot marks.', color: '#F59E0B', emoji: '📘' },
  { id: 'sb-3', alumnusLine: 'Priya · 2017',     year: '2017', beat: 'Sent 21 hand-written cards on founding day',                 detail: 'Every junior got one · kept in a drawer, most of them.',              color: '#A78BFA', emoji: '💌' },
  { id: 'sb-4', alumnusLine: 'Anmol · 2018',      year: '2019', beat: 'Solar-pump prototype ran for 44 hours straight',             detail: 'A tiny party when it hit 40 hours · then 44 was the real win.',        color: '#00D4FF', emoji: '🔋' },
  { id: 'sb-5', alumnusLine: 'Tanvi · 2016',     year: '2020', beat: 'Gave the first real retrospective talk',                     detail: 'Named the mistakes before the wins · the room clapped twice for the honesty.', color: '#F472B6', emoji: '🪞' },
  { id: 'sb-6', alumnusLine: 'Vikram · 2019',    year: '2022', beat: 'Shipped a documentary that was five months late',             detail: 'The wait was the film · everyone said so afterwards.',                 color: '#EF4444', emoji: '🎬' },
  { id: 'sb-7', alumnusLine: 'Ananya · 2020',    year: '2023', beat: 'Matched 140 juniors to mentors in a month',                  detail: 'Spreadsheet grew to 12 tabs · then she simplified it back to 3.',      color: '#7E57C2', emoji: '🫶' },
  { id: 'sb-8', alumnusLine: 'Ishita · 2021',    year: '2024', beat: 'Quietly refused an award so a junior could take it',         detail: 'Said nothing about it · the junior didn\'t know for a year.',           color: '#FFD166', emoji: '🕊️' },
];

// =====================================================
// Component
// =====================================================

const AlumniScreen: React.FC = () => {
  // -------------- State ------------------
  const [selectedBatch, setSelectedBatch] = useState<'all' | string>('all');
  const [selectedSector, setSelectedSector] = useState<SectorId>('all');
  const [selectedCompany, setSelectedCompany] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent-batch');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [onlyMentors, setOnlyMentors] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<ExtAlumni | null>(null);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // -------------- Animations -------------
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const sectorAnim = useRef(new Animated.Value(0)).current;
  const batchAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const testimonialIndex = useRef(new Animated.Value(0)).current;

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
      Animated.timing(sectorAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(batchAnim, {
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

    const timer = setTimeout(() => setLoading(false), 620);
    return () => clearTimeout(timer);
  }, [headerAnim, statsAnim, sectorAnim, batchAnim, listAnim]);

  useEffect(() => {
    if (showAlumniModal) {
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
  }, [showAlumniModal, modalScale, modalOpacity]);

  // -------------- Filtering --------------
  const filteredAlumni = useMemo(() => {
    let list: ExtAlumni[] = ALUMNI_DATA;

    if (selectedBatch !== 'all') list = list.filter((a) => a.batch === selectedBatch);
    if (selectedSector !== 'all') list = list.filter((a) => a.sector === selectedSector);
    if (selectedCompany !== 'all') list = list.filter((a) => a.company === selectedCompany);
    if (onlyMentors) list = list.filter((a) => a.mentor);
    if (onlyFeatured) list = list.filter((a) => a.featured);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.currentRole.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    switch (sortKey) {
      case 'recent-batch':
        list = [...list].sort((a, b) => Number(b.batch) - Number(a.batch));
        break;
      case 'oldest-batch':
        list = [...list].sort((a, b) => Number(a.batch) - Number(b.batch));
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'company-asc':
        list = [...list].sort((a, b) => a.company.localeCompare(b.company));
        break;
    }

    return list;
  }, [selectedBatch, selectedSector, selectedCompany, onlyMentors, onlyFeatured, searchQuery, sortKey]);

  const hasFilters =
    selectedBatch !== 'all' ||
    selectedSector !== 'all' ||
    selectedCompany !== 'all' ||
    onlyMentors ||
    onlyFeatured ||
    searchQuery.trim().length > 0;

  // -------------- Handlers ---------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const openAlumni = useCallback((alumnus: ExtAlumni) => {
    setSelectedAlumni(alumnus);
    setShowAlumniModal(true);
  }, []);

  const closeAlumni = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAlumniModal(false);
      setSelectedAlumni(null);
    });
  }, [modalScale, modalOpacity]);

  const handleLinkedIn = useCallback(async (alumnus: ExtAlumni) => {
    try {
      await Linking.openURL(alumnus.linkedin);
    } catch {
      Alert.alert('Unable to open link', 'LinkedIn link could not be opened.');
    }
  }, []);

  const handleEmail = useCallback(async (alumnus: ExtAlumni) => {
    try {
      await Linking.openURL(`mailto:${alumnus.email}`);
    } catch {
      Alert.alert('Unable to open email', 'Your device cannot open a mail composer.');
    }
  }, []);

  const handleShare = useCallback(async (alumnus: ExtAlumni) => {
    try {
      await Share.share({
        message: `Meet ${alumnus.name} — ${alumnus.currentRole} @ ${alumnus.company}. Class of ${alumnus.batch} from Taru Guardians.`,
      });
    } catch {
      // user cancelled
    }
  }, []);

  const handleMentorshipRequest = useCallback((alumnus: ExtAlumni) => {
    Alert.alert(
      'Request mentorship',
      `Send a request to ${alumnus.name}? They will receive a short intro template to reply to.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send request',
          onPress: () => {
            Alert.alert('Request sent!', 'The alumnus will reach out within a few days.');
          },
        },
      ]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedBatch('all');
    setSelectedSector('all');
    setSelectedCompany('all');
    setOnlyMentors(false);
    setOnlyFeatured(false);
    setSearchQuery('');
  }, []);

  // -------------- Sub-renderers ----------

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#0A1A1F', '#0E2F1F', Colors.accent.softGold + '55']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeadBlock}>
            <Text style={styles.headerEyebrow}>🌿 Taru Guardians</Text>
            <Text style={styles.headerTitle}>Alumni Network</Text>
            <Text style={styles.headerSubtitle}>
              500+ alumni · 60+ companies · 12 countries — building tech, climate, product and design.
            </Text>
          </View>
          <View style={styles.headerControls}>
            <TouchableOpacity
              accessibilityLabel="Change sort order"
              style={styles.headerIconBtn}
              onPress={() => setShowSortMenu(true)}
            >
              <Text style={styles.headerIcon}>⇅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Toggle view"
              style={styles.headerIconBtn}
              onPress={() => setViewMode((m) => (m === 'list' ? 'grid' : 'list'))}
            >
              <Text style={styles.headerIcon}>{viewMode === 'list' ? '▦' : '≡'}</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.statValue}>{ALUMNI_STATS.totalAlumni}+</Text>
            <Text style={styles.statLabel}>Alumni</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{ALUMNI_STATS.placementRate}%</Text>
            <Text style={styles.statLabel}>Placed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{ALUMNI_STATS.companiesHired}+</Text>
            <Text style={styles.statLabel}>Companies</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{ALUMNI_STATS.mentors}</Text>
            <Text style={styles.statLabel}>Mentors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{ALUMNI_STATS.countries}</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
        </Animated.View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, company, role, skill, city…"
            placeholderTextColor={Colors.text.muted}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickFilterRow}>
          <TouchableOpacity
            onPress={() => setOnlyMentors((v) => !v)}
            style={[styles.chip, onlyMentors && styles.chipActive]}
          >
            <Text style={[styles.chipText, onlyMentors && styles.chipTextActive]}>
              🤝 Mentors only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOnlyFeatured((v) => !v)}
            style={[styles.chip, onlyFeatured && styles.chipActive]}
          >
            <Text style={[styles.chipText, onlyFeatured && styles.chipTextActive]}>
              ⭐ Featured
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCompanyMenu(true)}
            style={[styles.chip, selectedCompany !== 'all' && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, selectedCompany !== 'all' && styles.chipTextActive]}
              numberOfLines={1}
            >
              🏢 {selectedCompany === 'all' ? 'Company' : selectedCompany}
            </Text>
          </TouchableOpacity>
          {hasFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.chipReset}>
              <Text style={styles.chipResetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderSectorRail = () => (
    <Animated.View
      style={{
        opacity: sectorAnim,
        transform: [
          {
            translateY: sectorAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
          },
        ],
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectorScroll}
      >
        {SECTORS.map((s) => {
          const active = s.id === selectedSector;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSelectedSector(s.id)}
              style={[
                styles.sectorChip,
                active && { borderColor: s.color, backgroundColor: s.color + '22' },
              ]}
            >
              <Text style={styles.sectorIcon}>{s.icon}</Text>
              <Text
                style={[styles.sectorLabel, active && { color: s.color, fontWeight: '700' }]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );

  const renderBatchRail = () => (
    <Animated.View
      style={{
        opacity: batchAnim,
        transform: [
          {
            translateY: batchAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
          },
        ],
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.batchScroll}
      >
        <TouchableOpacity
          onPress={() => setSelectedBatch('all')}
          style={[styles.batchChip, selectedBatch === 'all' && styles.batchChipActive]}
        >
          <Text
            style={[styles.batchText, selectedBatch === 'all' && styles.batchTextActive]}
          >
            All batches
          </Text>
        </TouchableOpacity>
        {BATCH_YEARS.map((b) => (
          <TouchableOpacity
            key={b}
            onPress={() => setSelectedBatch(b)}
            style={[styles.batchChip, selectedBatch === b && styles.batchChipActive]}
          >
            <Text style={[styles.batchText, selectedBatch === b && styles.batchTextActive]}>
              {b}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderHallOfFame = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏆 Hall of Fame</Text>
          <Text style={styles.sectionCaption}>{HALL_OF_FAME.length} featured alumni</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={IS_TABLET ? 340 : SCREEN_WIDTH * 0.8}
          decelerationRate="fast"
          contentContainerStyle={styles.hofScroll}
        >
          {HALL_OF_FAME.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => openAlumni(a)}
              style={styles.hofCard}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[
                  SECTORS.find((s) => s.id === a.sector)?.color + '33' ?? '#00000000',
                  '#0A0F14',
                ]}
                style={styles.hofGradient}
              >
                <View style={styles.hofTopRow}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          (SECTORS.find((s) => s.id === a.sector)?.color ?? Colors.tech.neonBlue) +
                          '33',
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>{a.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hofName} numberOfLines={1}>
                      {a.name}
                    </Text>
                    <Text style={styles.hofRole} numberOfLines={1}>
                      {a.currentRole}
                    </Text>
                    <Text style={styles.hofCompany} numberOfLines={1}>
                      @ {a.company} · {a.batch}
                    </Text>
                  </View>
                </View>
                {a.quote ? (
                  <Text style={styles.hofQuote} numberOfLines={3}>
                    “{a.quote}”
                  </Text>
                ) : (
                  <Text style={styles.hofQuote} numberOfLines={3}>
                    {a.messageToStudents}
                  </Text>
                )}
                <View style={styles.hofFooter}>
                  {a.mentor && <Text style={styles.hofBadge}>🤝 Mentor</Text>}
                  <Text style={styles.hofLoc}>📍 {a.location.split(',')[0]}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTestimonials = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>💬 Alumni Voices</Text>
          <Text style={styles.sectionCaption}>{TESTIMONIALS.length} quotes</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={IS_TABLET ? 380 : SCREEN_WIDTH * 0.78}
          decelerationRate="fast"
          contentContainerStyle={styles.testimonialScroll}
        >
          {TESTIMONIALS.map((t) => {
            const author = ALUMNI_DATA.find((a) => a.id === t.authorId)!;
            const c = SECTORS.find((s) => s.id === author.sector)!.color;
            return (
              <View key={t.id} style={styles.testimonialCard}>
                <LinearGradient
                  colors={[c + '30', '#000000AA']}
                  style={styles.testimonialGradient}
                >
                  <Text style={styles.testimonialQuoteMark}>”</Text>
                  <Text style={styles.testimonialQuote}>{t.quote}</Text>
                  <View style={styles.testimonialAuthorRow}>
                    <View style={[styles.smallAvatar, { backgroundColor: c + '55' }]}>
                      <Text style={styles.smallAvatarText}>{author.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.testimonialAuthor}>{author.name}</Text>
                      <Text style={styles.testimonialRole}>{t.role}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTopCompanies = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏢 Top Companies</Text>
          <Text style={styles.sectionCaption}>Where our alumni work</Text>
        </View>
        <View style={styles.companyGrid}>
          {TOP_COMPANIES.map(([company, count]) => (
            <TouchableOpacity
              key={company}
              onPress={() => setSelectedCompany(company)}
              style={styles.companyPill}
              activeOpacity={0.8}
            >
              <Text style={styles.companyName} numberOfLines={1}>
                {company}
              </Text>
              <Text style={styles.companyCount}>{count} alumni</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMeetups = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📅 Upcoming Alumni Meetups</Text>
          <Text style={styles.sectionCaption}>{ALUMNI_MEETUPS.length} events</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={IS_TABLET ? 340 : SCREEN_WIDTH * 0.78}
          decelerationRate="fast"
          contentContainerStyle={styles.meetupScroll}
        >
          {ALUMNI_MEETUPS.map((m) => {
            const ratio = m.registered / m.capacity;
            return (
              <View key={m.id} style={styles.meetupCard}>
                <LinearGradient
                  colors={[Colors.tech.neonBlue + '22', '#000000AA']}
                  style={styles.meetupGradient}
                >
                  <Text style={styles.meetupBadge}>
                    {m.mode === 'offline' ? '📍 Offline' : m.mode === 'virtual' ? '💻 Online' : '🌐 Hybrid'}
                  </Text>
                  <Text style={styles.meetupTitle}>{m.title}</Text>
                  <Text style={styles.meetupMeta}>
                    {m.date} · {m.city}
                  </Text>
                  <Text style={styles.meetupDescription} numberOfLines={3}>
                    {m.description}
                  </Text>
                  <View style={styles.meetupBar}>
                    <View style={[styles.meetupBarFill, { width: `${ratio * 100}%` }]} />
                  </View>
                  <Text style={styles.meetupCapacity}>
                    {m.registered} / {m.capacity} registered
                  </Text>
                  <View style={styles.meetupTagRow}>
                    {m.tags.map((tag) => (
                      <View key={tag} style={styles.meetupTag}>
                        <Text style={styles.meetupTagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderMentorshipSlots = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧭 Mentorship Slots</Text>
          <Text style={styles.sectionCaption}>Open right now</Text>
        </View>
        <View style={styles.mentorshipList}>
          {MENTORSHIP_SLOTS.map((m) => {
            const alumnus = ALUMNI_DATA.find((a) => a.id === m.mentorId);
            if (!alumnus) return null;
            const c = SECTORS.find((s) => s.id === alumnus.sector)!.color;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => openAlumni(alumnus)}
                style={styles.mentorshipItem}
                activeOpacity={0.85}
              >
                <View style={[styles.mentorshipDot, { backgroundColor: c }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.mentorshipTopic} numberOfLines={1}>
                    {m.topic}
                  </Text>
                  <Text style={styles.mentorshipMeta} numberOfLines={1}>
                    {alumnus.name} · {alumnus.currentRole} @ {alumnus.company}
                  </Text>
                  <Text style={styles.mentorshipFormat}>
                    {m.durationMin} min · {m.format} · {m.slotsRemaining} slot(s) left
                  </Text>
                </View>
                <Text style={styles.mentorshipArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderPledges = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌱 Sustainability Pledges</Text>
          <Text style={styles.sectionCaption}>{ALUMNI_PLEDGES.length} alumni pledges</Text>
        </View>
        <View>
          {ALUMNI_PLEDGES.map((a) => (
            <TouchableOpacity
              key={`pl-${a.id}`}
              onPress={() => openAlumni(a)}
              style={styles.pledgeItem}
              activeOpacity={0.85}
            >
              <Text style={styles.pledgeLeaf}>🍃</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pledgeAuthor}>
                  {a.name} · {a.currentRole} @ {a.company}
                </Text>
                <Text style={styles.pledgeText} numberOfLines={3}>
                  {a.sustainabilityPledge}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChapters = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌍 Chapters · city hubs</Text>
          <Text style={styles.sectionCaption}>{CHAPTERS.length} cities</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chaptersScroll}
        >
          {CHAPTERS.map((c) => (
            <View key={c.id} style={styles.chapterCard}>
              <LinearGradient
                colors={[c.color + '40', '#0A0F14']}
                style={styles.chapterGradient}
              >
                <View style={styles.chapterTopRow}>
                  <Text style={styles.chapterEmoji}>{c.emoji}</Text>
                  <View style={styles.chapterPill}>
                    <Text style={styles.chapterPillText}>est. {c.founded}</Text>
                  </View>
                </View>
                <Text style={styles.chapterCity}>{c.city}</Text>
                <Text style={styles.chapterCountry}>{c.country}</Text>
                <View style={styles.chapterDivider} />
                <Text style={styles.chapterMetaLabel}>Cadence</Text>
                <Text style={styles.chapterMetaValue}>{c.cadence}</Text>
                <Text style={styles.chapterMetaLabel}>Meetup spot</Text>
                <Text style={styles.chapterMetaValue}>{c.meetup}</Text>
                <Text style={styles.chapterMetaLabel}>Anchors</Text>
                {c.anchors.map((a) => (
                  <Text key={a} style={styles.chapterAnchor}>• {a}</Text>
                ))}
                <View style={styles.chapterFootRow}>
                  <Text style={[styles.chapterMembers, { color: c.color }]}>
                    {c.members} members
                  </Text>
                  <Text style={styles.chapterVibe} numberOfLines={3}>{c.vibe}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCareerPivots = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🔀 Career pivots</Text>
          <Text style={styles.sectionCaption}>Non-obvious moves</Text>
        </View>
        {CAREER_PIVOTS.map((p) => (
          <View key={p.id} style={[styles.pivotCard, { borderLeftColor: p.color }]}>
            <View style={styles.pivotTopRow}>
              <View style={[styles.pivotIconWrap, { backgroundColor: p.color + '2A' }]}>
                <Text style={styles.pivotIcon}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pivotArrowRow}>
                  <Text style={styles.pivotFrom}>{p.from}</Text>
                  <Text style={styles.pivotArrow}>  →  </Text>
                  <Text style={[styles.pivotTo, { color: p.color }]}>{p.to}</Text>
                </Text>
                <Text style={styles.pivotYear}>{p.year}</Text>
              </View>
            </View>
            <Text style={styles.pivotStory}>{p.story}</Text>
            <View style={[styles.pivotTakeawayRow, { backgroundColor: p.color + '14' }]}>
              <Text style={styles.pivotTakeawayLabel}>Takeaway</Text>
              <Text style={styles.pivotTakeaway}>{p.takeaway}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMentorBoard = () => {
    if (hasFilters) return null;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🧭 Mentor board</Text>
          <Text style={styles.sectionCaption}>{MENTOR_BOARD.length} seats</Text>
        </View>
        <View style={styles.boardGrid}>
          {MENTOR_BOARD.map((s) => (
            <View key={s.id} style={styles.boardCard}>
              <LinearGradient
                colors={[s.color + '33', '#0A0F14']}
                style={styles.boardGradient}
              >
                <View style={styles.boardHeaderRow}>
                  <View style={[styles.boardDot, { backgroundColor: s.color }]} />
                  <Text style={styles.boardDomain}>{s.domain}</Text>
                </View>
                <Text style={styles.boardName}>{s.name}</Text>
                <Text style={styles.boardRole} numberOfLines={2}>{s.role}</Text>
                <Text style={styles.boardOffice}>📍 {s.office}</Text>
                <Text style={styles.boardFocus} numberOfLines={3}>{s.focus}</Text>
                <View style={styles.boardHoursRow}>
                  <View style={[styles.boardHoursPill, { backgroundColor: s.color + '22' }]}>
                    <Text style={[styles.boardHoursText, { color: s.color }]}>
                      {s.hoursLeft} hrs left this month
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderScholarships = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🎓 Alumni-funded scholarships</Text>
        <Text style={styles.sectionCaption}>
          ₹{(ALUMNI_SCHOLARSHIPS.reduce((a, s) => a + s.amountInr, 0) / 1000).toFixed(0)}K · {ALUMNI_SCHOLARSHIPS.length} active
        </Text>
      </View>
      {ALUMNI_SCHOLARSHIPS.map((s) => (
        <View key={s.id} style={[styles.schCard, { borderLeftColor: s.color }]}>
          <View style={styles.schTopRow}>
            <Text style={styles.schEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.schName} numberOfLines={2}>{s.name}</Text>
              <Text style={styles.schFunded}>by {s.fundedBy}</Text>
            </View>
            <Text style={[styles.schAmount, { color: s.color }]}>
              ₹{(s.amountInr / 1000).toFixed(0)}K
            </Text>
          </View>
          <View style={styles.schMetaRow}>
            <Text style={styles.schMetaText}>{s.discipline}</Text>
            <Text style={styles.schMetaText}>{s.recipients} recipients</Text>
          </View>
          <Text style={styles.schNote} numberOfLines={3}>{s.note}</Text>
        </View>
      ))}
    </View>
  );

  const renderAdvisors = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧭 Alumni advisors · by specialism</Text>
        <Text style={styles.sectionCaption}>
          {ADVISORY_SPECIALISMS.reduce((a, s) => a + s.slotsOpen, 0)} slots open
        </Text>
      </View>
      {ADVISORY_SPECIALISMS.map((s) => (
        <View key={s.id} style={[styles.advCard, { borderLeftColor: s.color }]}>
          <View style={styles.advTopRow}>
            <Text style={styles.advEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.advName} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.advSpec} numberOfLines={1}>{s.specialism}</Text>
            </View>
            <View
              style={[
                styles.advPill,
                {
                  backgroundColor:
                    s.slotsOpen > 0 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                },
              ]}
            >
              <Text
                style={[
                  styles.advPillText,
                  { color: s.slotsOpen > 0 ? '#22C55E' : '#EF4444' },
                ]}
              >
                {s.slotsOpen > 0 ? `${s.slotsOpen} open` : 'waitlist'}
              </Text>
            </View>
          </View>
          <View style={styles.advStatRow}>
            <Text style={styles.advStatText}>{s.hoursPerMonth}h / month</Text>
            <Text style={styles.advStatText}>
              {s.slotsFilled} / {s.slotsFilled + s.slotsOpen} booked
            </Text>
          </View>
          <Text style={styles.advNote} numberOfLines={2}>{s.note}</Text>
        </View>
      ))}
    </View>
  );

  const renderDiaspora = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌍 Diaspora clusters</Text>
        <Text style={styles.sectionCaption}>
          {DIASPORA_CLUSTERS.reduce((a, c) => a + c.alumniCount, 0)} alumni · {DIASPORA_CLUSTERS.length} cities
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasporaScroll}>
        {DIASPORA_CLUSTERS.map((c) => (
          <View key={c.id} style={[styles.diasporaCard, { borderColor: c.color + '55' }]}>
            <View style={styles.diasporaFlagRow}>
              <Text style={styles.diasporaFlag}>{c.flag}</Text>
              <Text style={[styles.diasporaCount, { color: c.color }]}>{c.alumniCount}</Text>
            </View>
            <Text style={styles.diasporaCity} numberOfLines={1}>{c.city}</Text>
            <Text style={styles.diasporaCountry} numberOfLines={1}>{c.country}</Text>
            <Text style={styles.diasporaMeet} numberOfLines={2}>{c.meetsEvery}</Text>
            <Text style={styles.diasporaLead} numberOfLines={1}>lead · {c.lead}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAMA = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>💬 Ask-me-anything · upcoming</Text>
        <Text style={styles.sectionCaption}>{AMA_SESSIONS.length} sessions · one Saturday each</Text>
      </View>
      {AMA_SESSIONS.map((a) => (
        <View key={a.id} style={[styles.amaCard, { borderLeftColor: a.color }]}>
          <Text style={styles.amaEmoji}>{a.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.amaTopRow}>
              <Text style={styles.amaName}>{a.alumniName}</Text>
              <Text style={[styles.amaMode, { color: a.color }]}>{a.mode}</Text>
            </View>
            <Text style={styles.amaTopic} numberOfLines={2}>{a.topic}</Text>
            <View style={styles.amaFootRow}>
              <Text style={styles.amaDate}>{a.date}</Text>
              <Text style={styles.amaQCount}>{a.questionsCollected} questions in</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderGivingLedger = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🤝 Giving ledger · this year</Text>
        <Text style={styles.sectionCaption}>
          ₹{(GIVING_LEDGER.reduce((a, g) => a + g.amountInr, 0) / 1000).toFixed(0)}K received
        </Text>
      </View>
      {GIVING_LEDGER.map((g) => (
        <View key={g.id} style={[styles.gvRow, { borderLeftColor: g.color }]}>
          <Text style={styles.gvEmoji}>{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.gvTopRow}>
              <Text style={styles.gvSource} numberOfLines={1}>{g.source}</Text>
              <Text style={[styles.gvAmount, { color: g.color }]}>
                ₹{(g.amountInr / 1000).toFixed(0)}K
              </Text>
            </View>
            <Text style={styles.gvUsed} numberOfLines={2}>{g.used}</Text>
            <Text style={styles.gvMeta}>
              {g.dateReceived} · {g.visibility === 'named' ? 'named gift' : 'anonymous'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCompanyReferrals = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔗 Alumni-led referrals</Text>
        <Text style={styles.sectionCaption}>
          {COMPANY_REFERRALS.reduce((a, c) => a + c.openRoles, 0)} open · {COMPANY_REFERRALS.length} companies
        </Text>
      </View>
      {COMPANY_REFERRALS.map((c) => (
        <View key={c.id} style={[styles.crCard, { borderLeftColor: c.color }]}>
          <View style={styles.crTopRow}>
            <Text style={styles.crEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.crCoRow}>
                <Text style={styles.crCo} numberOfLines={1}>{c.company}</Text>
                <Text style={[styles.crRoles, { color: c.color }]}>{c.openRoles}</Text>
              </View>
              <Text style={styles.crLead} numberOfLines={1}>{c.alumniLead}</Text>
            </View>
          </View>
          <View style={styles.crMetaRow}>
            <Text style={styles.crType}>{c.type}</Text>
            <Text style={styles.crUpdated}>upd. {c.lastUpdated}</Text>
          </View>
          <Text style={styles.crNote} numberOfLines={2}>{c.note}</Text>
        </View>
      ))}
    </View>
  );

  const renderAlumniListHeader = () => (
    <View style={styles.listHeaderRow}>
      <Text style={styles.listHeaderTitle}>
        {filteredAlumni.length} alumni
        {selectedBatch !== 'all' ? ` · batch ${selectedBatch}` : ''}
        {selectedSector !== 'all'
          ? ` · ${SECTORS.find((s) => s.id === selectedSector)!.label}`
          : ''}
      </Text>
      {hasFilters && (
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.listHeaderReset}>Reset filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAlumniRow = ({ item, index }: { item: ExtAlumni; index: number }) => {
    const c = SECTORS.find((s) => s.id === item.sector)!.color;
    if (viewMode === 'list') {
      return (
        <Animated.View
          style={[
            styles.alumniCard,
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
            onPress={() => openAlumni(item)}
            android_ripple={{ color: c + '22' }}
            style={({ pressed }) => [
              styles.alumniInner,
              pressed && { opacity: 0.9 },
            ]}
          >
            <LinearGradient
              colors={[c + '18', '#0A0F14']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.alumniGradient}
            >
              <View style={[styles.avatar, { backgroundColor: c + '33' }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.alumniMeta}>
                <View style={styles.alumniMetaRow}>
                  <Text style={styles.alumniName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.featured && <Text style={styles.featuredPill}>⭐</Text>}
                  {item.mentor && <Text style={styles.mentorPill}>🤝</Text>}
                </View>
                <Text style={styles.alumniRole} numberOfLines={1}>
                  {item.currentRole}
                </Text>
                <Text style={styles.alumniCompany} numberOfLines={1}>
                  @ {item.company}
                </Text>
                <Text style={styles.alumniLoc} numberOfLines={1}>
                  📍 {item.location} · Class of {item.batch}
                </Text>
              </View>
              <Text style={styles.alumniArrow}>›</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      );
    }

    // grid variant
    return (
      <View style={styles.gridItem}>
        <Pressable
          onPress={() => openAlumni(item)}
          android_ripple={{ color: c + '22' }}
          style={styles.gridInner}
        >
          <LinearGradient colors={[c + '22', '#0A0F14']} style={styles.gridGradient}>
            <View style={[styles.avatarLarge, { backgroundColor: c + '44' }]}>
              <Text style={styles.avatarLargeText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.gridName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.gridRole} numberOfLines={1}>
              {item.currentRole}
            </Text>
            <Text style={styles.gridCompany} numberOfLines={1}>
              @ {item.company}
            </Text>
            <View style={styles.gridBadges}>
              {item.mentor && <Text style={styles.gridBadge}>🤝</Text>}
              {item.featured && <Text style={styles.gridBadge}>⭐</Text>}
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No alumni match these filters</Text>
      <Text style={styles.emptySubtitle}>Try widening your search or reset all filters.</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
        <Text style={styles.emptyButtonText}>Reset filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSkeletonList = () => (
    <View>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.alumniCard, styles.skeletonCard]}>
          <View style={styles.skeletonAvatar} />
          <View style={{ flex: 1 }}>
            <View style={[styles.skeletonLine, { width: '55%' }]} />
            <View style={[styles.skeletonLine, { width: '80%' }]} />
            <View style={[styles.skeletonLine, { width: '40%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Showing {filteredAlumni.length} of {ALUMNI_DATA.length} curated alumni profiles
      </Text>
      <Text style={styles.footerText}>🌿 Tech + climate · 500+ network strong</Text>
    </View>
  );

  // -------------- Modals -----------------
  const renderAlumniModal = () => {
    if (!selectedAlumni) return null;
    const a = selectedAlumni;
    const c = SECTORS.find((s) => s.id === a.sector)!.color;
    return (
      <Modal
        visible={showAlumniModal}
        transparent
        animationType="none"
        onRequestClose={closeAlumni}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAlumni} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            <LinearGradient
              colors={[c + '33', '#0A0F14']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHero}
            >
              <View style={styles.modalHeroRow}>
                <View style={[styles.avatarHero, { backgroundColor: c + '55' }]}>
                  <Text style={styles.avatarHeroText}>{a.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>{a.name}</Text>
                  <Text style={styles.modalCurrent}>{a.currentRole}</Text>
                  <Text style={styles.modalCompany}>@ {a.company}</Text>
                  <Text style={styles.modalLoc}>
                    📍 {a.location} · Class of {a.batch} · {a.experienceYears}y exp
                  </Text>
                  <View style={styles.modalBadgeRow}>
                    {a.mentor && <Text style={styles.modalBadge}>🤝 Mentor</Text>}
                    {a.featured && <Text style={styles.modalBadge}>⭐ Featured</Text>}
                    <Text style={[styles.modalBadge, { backgroundColor: c + '33', borderColor: c }]}>
                      {SECTORS.find((s) => s.id === a.sector)!.icon}{' '}
                      {SECTORS.find((s) => s.id === a.sector)!.label}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                accessibilityLabel="Close profile"
                onPress={closeAlumni}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Message to students</Text>
                <Text style={styles.modalSectionBody}>{a.messageToStudents}</Text>
              </View>

              {a.quote ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Favourite line</Text>
                  <View style={styles.modalQuoteBlock}>
                    <Text style={styles.modalQuoteMark}>”</Text>
                    <Text style={styles.modalQuote}>{a.quote}</Text>
                  </View>
                </View>
              ) : null}

              {a.skills.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Skills</Text>
                  <View style={styles.skillWrap}>
                    {a.skills.map((s) => (
                      <View key={s} style={[styles.skillChip, { borderColor: c }]}>
                        <Text style={[styles.skillText, { color: c }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {a.achievements.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Achievements</Text>
                  {a.achievements.map((ach) => (
                    <View key={ach} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{ach}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {a.timeline.length > 0 ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Career timeline</Text>
                  <View style={styles.timeline}>
                    {a.timeline.map((t, idx) => (
                      <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineLeftCol}>
                          <Text style={styles.timelineYear}>{t.year}</Text>
                          <View
                            style={[
                              styles.timelineDot,
                              { backgroundColor: c },
                              idx === 0 && styles.timelineDotFirst,
                            ]}
                          />
                          {idx < a.timeline.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <View style={styles.timelineRightCol}>
                          <Text style={styles.timelineRole}>{t.role}</Text>
                          <Text style={styles.timelineCompany}>{t.company}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {a.sustainabilityPledge ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🌱 Sustainability pledge</Text>
                  <Text style={styles.modalSectionBody}>{a.sustainabilityPledge}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => handleLinkedIn(a)}
                style={[styles.modalAction, { backgroundColor: '#0A66C2' }]}
              >
                <Text style={styles.modalActionText}>LinkedIn</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEmail(a)}
                style={[styles.modalAction, { backgroundColor: Colors.tech.neonBlue }]}
              >
                <Text style={styles.modalActionText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare(a)}
                style={[styles.modalAction, { backgroundColor: '#333' }]}
              >
                <Text style={styles.modalActionText}>Share</Text>
              </TouchableOpacity>
              {a.mentor && (
                <TouchableOpacity
                  onPress={() => handleMentorshipRequest(a)}
                  style={[styles.modalAction, { backgroundColor: '#16A34A' }]}
                >
                  <Text style={styles.modalActionText}>Mentorship</Text>
                </TouchableOpacity>
              )}
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
        <Text style={styles.sheetTitle}>Sort alumni by</Text>
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
            <Text style={[styles.sheetLabel, sortKey === opt.key && styles.sheetLabelActive]}>
              {opt.label}
            </Text>
            {sortKey === opt.key && <Text style={styles.sheetCheck}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );

  const renderCompanySheet = () => (
    <Modal
      visible={showCompanyMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCompanyMenu(false)}
    >
      <Pressable style={styles.sheetBackdrop} onPress={() => setShowCompanyMenu(false)} />
      <View style={[styles.sheet, styles.sheetTall]}>
        <Text style={styles.sheetTitle}>Filter by company</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => {
              setSelectedCompany('all');
              setShowCompanyMenu(false);
            }}
            style={styles.sheetRow}
          >
            <Text style={[styles.sheetLabel, selectedCompany === 'all' && styles.sheetLabelActive]}>
              All companies
            </Text>
            {selectedCompany === 'all' && <Text style={styles.sheetCheck}>✓</Text>}
          </TouchableOpacity>
          {uniqueCompanies.map((company) => (
            <TouchableOpacity
              key={company}
              onPress={() => {
                setSelectedCompany(company);
                setShowCompanyMenu(false);
              }}
              style={styles.sheetRow}
            >
              <Text
                style={[
                  styles.sheetLabel,
                  selectedCompany === company && styles.sheetLabelActive,
                ]}
              >
                {company}
              </Text>
              {selectedCompany === company && <Text style={styles.sheetCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  // -------------- Main render ------------
  const renderFiresides = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🔥 Fireside recaps</Text>
        <Text style={styles.sectionCaption}>Recent alumni conversations</Text>
      </View>
      {FIRESIDE_RECAPS.map((f) => (
        <View key={f.id} style={[styles.firesideCard, { borderLeftColor: f.color }]}>
          <View style={styles.firesideHeaderRow}>
            <Text style={styles.firesideEmoji}>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.firesideTitle} numberOfLines={2}>{f.title}</Text>
              <Text style={styles.firesideMeta}>
                {f.date} · {f.attendance} attended · host {f.host}
              </Text>
            </View>
          </View>
          <Text style={styles.firesideHighlight} numberOfLines={4}>{f.highlight}</Text>
          <View style={styles.firesideQuoteBox}>
            <Text style={styles.firesideQuote}>“{f.quote}”</Text>
            <Text style={styles.firesideQuoteAuthor}>— {f.quoteAuthor}</Text>
          </View>
          <View style={styles.firesideGuestRow}>
            {f.guests.map((g) => (
              <View key={g} style={[styles.firesideGuestPill, { borderColor: f.color + '55' }]}>
                <Text style={[styles.firesideGuestText, { color: f.color }]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderRelocationGrants = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🛟 Relocation grants</Text>
        <Text style={styles.sectionCaption}>Alumni-funded · trust-based</Text>
      </View>
      {RELOCATION_GRANTS.map((g) => (
        <View key={g.id} style={[styles.grantCard, { borderLeftColor: g.color }]}>
          <View style={styles.grantHeaderRow}>
            <Text style={styles.grantName}>{g.name}</Text>
            <Text style={[styles.grantAmount, { color: g.color }]}>{g.amount}</Text>
          </View>
          <Text style={styles.grantUsedFor}>{g.usedFor}</Text>
          <View style={styles.grantMetaRow}>
            <Text style={styles.grantMetaLabel}>Eligibility</Text>
            <Text style={styles.grantMeta}>{g.eligibility}</Text>
          </View>
          <View style={styles.grantFootRow}>
            <Text style={styles.grantCadence}>{g.cadence}</Text>
            <Text style={styles.grantDeadline}>Deadline: {g.deadline}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAlumniPolls = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📊 Alumni polls</Text>
        <Text style={styles.sectionCaption}>Quarterly pulse</Text>
      </View>
      {ALUMNI_POLLS.map((p) => (
        <View key={p.id} style={styles.pollCard}>
          <View style={styles.pollHeaderRow}>
            <Text style={styles.pollQuestion} numberOfLines={3}>{p.question}</Text>
            <Text style={styles.pollTotal}>{p.total} voted · {p.finishedAt}</Text>
          </View>
          {p.answers.map((a) => (
            <View key={a.label} style={styles.pollRow}>
              <View style={styles.pollLabelRow}>
                <Text style={styles.pollLabel} numberOfLines={2}>{a.label}</Text>
                <Text style={[styles.pollPct, { color: a.color }]}>{a.pct}%</Text>
              </View>
              <View style={styles.pollTrack}>
                <View
                  style={[
                    styles.pollFill,
                    { width: `${a.pct}%`, backgroundColor: a.color },
                  ]}
                />
              </View>
            </View>
          ))}
          <Text style={styles.pollCommentary}>{p.commentary}</Text>
        </View>
      ))}
    </View>
  );

  const renderPublications = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📝 Publications + talks</Text>
        <Text style={styles.sectionCaption}>What alumni put out this year</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.publicationScroll}
      >
        {PUBLICATIONS.map((p) => (
          <View key={p.id} style={[styles.pubCard, { borderLeftColor: p.color }]}>
            <Text style={[styles.pubKind, { color: p.color }]}>{p.kind.toUpperCase()}</Text>
            <Text style={styles.pubTitle} numberOfLines={3}>{p.title}</Text>
            <Text style={styles.pubVenue} numberOfLines={2}>{p.venue}</Text>
            <View style={styles.pubFootRow}>
              <Text style={styles.pubAuthor}>{p.author}</Text>
              <Text style={styles.pubYear}>{p.year}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // ------ Phase 3x deeper blocks ------
  const renderLegacyProjects = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🏛️ Legacy projects · still alive</Text>
        <Text style={styles.sectionCaption}>{LEGACY_PROJECTS.length} threads</Text>
      </View>
      {LEGACY_PROJECTS.map((l) => (
        <View key={l.id} style={[styles.lpRow, { borderLeftColor: l.color }]}>
          <Text style={styles.lpEmoji}>{l.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.lpTopRow}>
              <Text style={styles.lpTitle} numberOfLines={2}>{l.title}</Text>
              <View
                style={[
                  styles.lpAlive,
                  {
                    backgroundColor: (l.stillAlive ? '#22C55E' : '#94A3B8') + '22',
                    borderColor: (l.stillAlive ? '#22C55E' : '#94A3B8') + '66',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.lpAliveText,
                    { color: l.stillAlive ? '#22C55E' : '#94A3B8' },
                  ]}
                >
                  {l.stillAlive ? 'in-use' : 'retired'}
                </Text>
              </View>
            </View>
            <Text style={styles.lpAlumnus} numberOfLines={1}>{l.alumnus}</Text>
            <Text style={styles.lpNote} numberOfLines={2}>{l.useNote}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAlumniAwards = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🏆 Awards + honours</Text>
        <Text style={styles.sectionCaption}>{ALUMNI_AWARDS.length} in the cabinet</Text>
      </View>
      {ALUMNI_AWARDS.map((a) => (
        <View key={a.id} style={[styles.awCard, { borderLeftColor: a.color }]}>
          <View style={styles.awTopRow}>
            <Text style={styles.awEmoji}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.awAward} numberOfLines={2}>{a.award}</Text>
              <Text style={styles.awBody} numberOfLines={1}>
                {a.body} · {a.year}
              </Text>
            </View>
          </View>
          <Text style={[styles.awAlumnus, { color: a.color }]} numberOfLines={1}>{a.alumnus}</Text>
          <Text style={styles.awNote} numberOfLines={3}>{a.note}</Text>
        </View>
      ))}
    </View>
  );

  const renderAlumniVentures = () => (
    <View style={styles.sectionBlock}>
      <View style={[styles.sectionHeaderRow, { paddingHorizontal: HORIZONTAL_PADDING }]}>
        <Text style={styles.sectionTitle}>🚀 Alumni ventures</Text>
        <Text style={styles.sectionCaption}>{ALUMNI_VENTURES.length} active</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, gap: 10 }}
      >
        {ALUMNI_VENTURES.map((v) => (
          <View
            key={v.id}
            style={[
              styles.avnCard,
              { borderColor: v.color + '55' },
            ]}
          >
            <Text style={styles.avnEmoji}>{v.emoji}</Text>
            <Text style={styles.avnCompany} numberOfLines={1}>{v.company}</Text>
            <Text style={styles.avnFounder} numberOfLines={1}>{v.founder}</Text>
            <View style={styles.avnMetaRow}>
              <View
                style={[
                  styles.avnStagePill,
                  { backgroundColor: v.color + '22', borderColor: v.color + '66' },
                ]}
              >
                <Text style={[styles.avnStageText, { color: v.color }]}>{v.stage}</Text>
              </View>
              <Text style={styles.avnYear}>{v.year}</Text>
            </View>
            <Text style={styles.avnMission} numberOfLines={3}>{v.missionLine}</Text>
            <Text style={styles.avnHiring} numberOfLines={2}>{v.hiringNote}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderReunions = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🎊 Reunions · on the calendar</Text>
        <Text style={styles.sectionCaption}>{REUNION_PLANS.length} gathers</Text>
      </View>
      {REUNION_PLANS.map((r) => {
        const pct = r.seats > 0 ? Math.min(1, r.rsvped / r.seats) : 0;
        return (
          <View key={r.id} style={[styles.rpCard, { borderLeftColor: r.color }]}>
            <View style={styles.rpTopRow}>
              <Text style={styles.rpEmoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rpTitle} numberOfLines={2}>{r.title}</Text>
                <Text style={styles.rpDate} numberOfLines={1}>{r.date}</Text>
              </View>
            </View>
            <Text style={styles.rpLocation} numberOfLines={1}>{r.location}</Text>
            <View style={styles.rpBarBg}>
              <View
                style={[
                  styles.rpBarFill,
                  { width: `${Math.round(pct * 100)}%`, backgroundColor: r.color },
                ]}
              />
            </View>
            <Text style={styles.rpSeats}>
              {r.rsvped} / {r.seats} rsvp'd · {Math.round((1 - pct) * 100)}% open
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderFamilyHeritage = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🫧 Family + mentor lineages</Text>
        <Text style={styles.sectionCaption}>quiet ties</Text>
      </View>
      {FAMILY_HERITAGE.map((f) => (
        <View key={f.id} style={[styles.fhRow, { borderLeftColor: f.color }]}>
          <Text style={styles.fhEmoji}>{f.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.fhAlumnus} numberOfLines={1}>{f.alumniName}</Text>
            <Text style={styles.fhRelation} numberOfLines={1}>
              {f.relation} · {f.relatedTo}
            </Text>
            <Text style={styles.fhNote} numberOfLines={2}>{f.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStoryBeats = () => (
    <View style={[styles.sectionBlock, { paddingHorizontal: HORIZONTAL_PADDING }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📜 Story beats · a decade at a glance</Text>
        <Text style={styles.sectionCaption}>{STORY_BEATS.length} moments</Text>
      </View>
      {STORY_BEATS.map((b) => (
        <View key={b.id} style={[styles.sbRow, { borderLeftColor: b.color }]}>
          <View style={styles.sbYearCol}>
            <Text style={[styles.sbYear, { color: b.color }]}>{b.year}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sbTopRow}>
              <Text style={styles.sbEmoji}>{b.emoji}</Text>
              <Text style={styles.sbAlumnus} numberOfLines={1}>{b.alumnusLine}</Text>
            </View>
            <Text style={styles.sbBeat} numberOfLines={2}>{b.beat}</Text>
            <Text style={styles.sbDetail} numberOfLines={3}>{b.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const headerComponent = (
    <View>
      {renderHeader()}
      {renderSectorRail()}
      {renderBatchRail()}
      {renderHallOfFame()}
      {renderStoryBeats()}
      {renderTestimonials()}
      {renderTopCompanies()}
      {renderAlumniVentures()}
      {renderChapters()}
      {renderMeetups()}
      {renderReunions()}
      {renderFiresides()}
      {renderMentorBoard()}
      {renderAdvisors()}
      {renderFamilyHeritage()}
      {renderAMA()}
      {renderMentorshipSlots()}
      {renderCareerPivots()}
      {renderCompanyReferrals()}
      {renderRelocationGrants()}
      {renderScholarships()}
      {renderAlumniAwards()}
      {renderLegacyProjects()}
      {renderGivingLedger()}
      {renderAlumniPolls()}
      {renderDiaspora()}
      {renderPublications()}
      {renderPledges()}
      {renderAlumniListHeader()}
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
          {renderSkeletonList()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredAlumni}
          keyExtractor={(item) => item.id}
          renderItem={renderAlumniRow}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          initialNumToRender={10}
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
      {renderAlumniModal()}
      {renderSortSheet()}
      {renderCompanySheet()}
    </SafeAreaView>
  );
};

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollRoot: { flex: 1 },
  listContent: { paddingBottom: 80 },

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
    color: Colors.accent.softGold,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: IS_SMALL ? 26 : 30,
    color: Colors.text.primary,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  headerControls: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff12',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  headerIcon: { fontSize: 18, color: Colors.text.primary },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff0A',
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
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
    padding: 0,
  },
  clearIcon: { fontSize: 14, color: Colors.text.muted, paddingHorizontal: 6 },

  // Chips
  quickFilterRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#ffffff0F',
    borderWidth: 1,
    borderColor: '#ffffff22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: 180,
  },
  chipActive: { borderColor: Colors.tech.neonBlue, backgroundColor: Colors.tech.neonBlue + '22' },
  chipText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: Colors.tech.neonBlue },
  chipReset: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#4A1A1A',
  },
  chipResetText: { color: '#FBA5A5', fontSize: 12, fontWeight: '700' },

  // Sector rail
  sectorScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 14, paddingBottom: 6 },
  sectorChip: {
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
  sectorIcon: { fontSize: 14, marginRight: 6 },
  sectorLabel: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },

  // Batch rail
  batchScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 10, paddingBottom: 4 },
  batchChip: {
    backgroundColor: '#ffffff0A',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ffffff1A',
  },
  batchChipActive: {
    backgroundColor: Colors.accent.softGold + '33',
    borderColor: Colors.accent.softGold,
  },
  batchText: { color: Colors.text.secondary, fontSize: 13, fontWeight: '600' },
  batchTextActive: { color: Colors.accent.softGold, fontWeight: '800' },

  // Section blocks
  sectionBlock: { paddingTop: 18, paddingBottom: 4 },
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

  // Hall of fame
  hofScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING * 2 },
  hofCard: {
    width: IS_TABLET ? 320 : SCREEN_WIDTH * 0.78,
    marginRight: 12,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  hofGradient: {
    padding: 16,
    borderRadius: CARD_RADIUS,
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  hofTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  avatarText: { color: Colors.text.primary, fontSize: 22, fontWeight: '800' },
  hofName: { color: Colors.text.primary, fontSize: 16, fontWeight: '800' },
  hofRole: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  hofCompany: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  hofQuote: {
    color: Colors.text.primary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  hofFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  hofBadge: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#4ADE8022',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  hofLoc: { color: Colors.text.muted, fontSize: 11 },

  // Testimonials
  testimonialScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING * 2 },
  testimonialCard: {
    width: IS_TABLET ? 360 : SCREEN_WIDTH * 0.76,
    marginRight: 12,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  testimonialGradient: {
    padding: 16,
    borderRadius: CARD_RADIUS,
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  testimonialQuoteMark: {
    color: Colors.accent.softGold,
    fontSize: 42,
    fontWeight: '900',
    marginTop: -6,
  },
  testimonialQuote: {
    color: Colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  testimonialAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  smallAvatarText: { color: Colors.text.primary, fontWeight: '800' },
  testimonialAuthor: { color: Colors.text.primary, fontSize: 13, fontWeight: '700' },
  testimonialRole: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Top companies
  companyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  companyPill: {
    backgroundColor: '#ffffff0A',
    borderColor: '#ffffff22',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    maxWidth: '48%',
  },
  companyName: { color: Colors.text.primary, fontSize: 13, fontWeight: '700' },
  companyCount: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },

  // Meetups
  meetupScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingRight: HORIZONTAL_PADDING * 2 },
  meetupCard: {
    width: IS_TABLET ? 340 : SCREEN_WIDTH * 0.78,
    marginRight: 12,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  meetupGradient: {
    padding: 16,
    borderRadius: CARD_RADIUS,
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  meetupBadge: {
    alignSelf: 'flex-start',
    color: Colors.tech.neonBlue,
    backgroundColor: Colors.tech.neonBlue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  meetupTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '800' },
  meetupMeta: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  meetupDescription: { color: Colors.text.secondary, fontSize: 12, marginTop: 8, lineHeight: 18 },
  meetupBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#ffffff18',
    marginTop: 10,
    overflow: 'hidden',
  },
  meetupBarFill: { height: 6, backgroundColor: Colors.tech.neonBlue },
  meetupCapacity: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  meetupTagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  meetupTag: {
    backgroundColor: '#ffffff12',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  meetupTagText: { color: Colors.text.secondary, fontSize: 10 },

  // Mentorship list
  mentorshipList: { paddingHorizontal: HORIZONTAL_PADDING },
  mentorshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  mentorshipDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  mentorshipTopic: { color: Colors.text.primary, fontSize: 14, fontWeight: '700' },
  mentorshipMeta: { color: Colors.text.secondary, fontSize: 12, marginTop: 2 },
  mentorshipFormat: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  mentorshipArrow: { color: Colors.text.muted, fontSize: 22, marginLeft: 8 },

  // Pledges
  pledgeItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: HORIZONTAL_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff0F',
  },
  pledgeLeaf: { fontSize: 22, marginRight: 10 },
  pledgeAuthor: { color: Colors.text.primary, fontSize: 13, fontWeight: '700' },
  pledgeText: { color: Colors.text.secondary, fontSize: 12, marginTop: 3, lineHeight: 18 },

  // Alumni list
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

  alumniCard: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 8,
  },
  alumniInner: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  alumniGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  alumniMeta: { flex: 1, paddingRight: 10 },
  alumniMetaRow: { flexDirection: 'row', alignItems: 'center' },
  alumniName: { color: Colors.text.primary, fontSize: 15, fontWeight: '800' },
  featuredPill: { marginLeft: 6, fontSize: 13 },
  mentorPill: { marginLeft: 4, fontSize: 13 },
  alumniRole: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  alumniCompany: { color: Colors.text.primary, fontSize: 12, marginTop: 2 },
  alumniLoc: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  alumniArrow: { color: Colors.text.muted, fontSize: 22 },

  // Grid
  gridRow: { justifyContent: 'space-between', paddingHorizontal: HORIZONTAL_PADDING },
  gridItem: {
    width: (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 10) / 2,
    marginTop: 10,
  },
  gridInner: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  gridGradient: {
    padding: 14,
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  avatarLargeText: { color: Colors.text.primary, fontSize: 26, fontWeight: '800' },
  gridName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  gridRole: { color: Colors.text.secondary, fontSize: 11, marginTop: 2, textAlign: 'center' },
  gridCompany: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  gridBadges: { flexDirection: 'row', marginTop: 6 },
  gridBadge: { fontSize: 13, marginHorizontal: 2 },

  // Empty
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

  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  skeletonAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#ffffff15',
    marginRight: 12,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff12',
    marginVertical: 4,
  },

  // Footer
  footer: { alignItems: 'center', paddingTop: 18, paddingBottom: 30 },
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
  modalHero: {
    padding: 18,
    paddingTop: 22,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalHeroRow: { flexDirection: 'row', alignItems: 'center' },
  avatarHero: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  avatarHeroText: { color: Colors.text.primary, fontSize: 30, fontWeight: '900' },
  modalName: { color: Colors.text.primary, fontSize: 20, fontWeight: '800' },
  modalCurrent: { color: Colors.text.primary, fontSize: 14, marginTop: 2 },
  modalCompany: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  modalLoc: { color: Colors.text.muted, fontSize: 11, marginTop: 4 },
  modalBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  modalBadge: {
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#ffffff14',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
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
  modalQuoteBlock: {
    padding: 12,
    backgroundColor: '#ffffff08',
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.softGold,
    borderRadius: 10,
  },
  modalQuoteMark: {
    color: Colors.accent.softGold,
    fontSize: 30,
    fontWeight: '900',
    marginTop: -8,
  },
  modalQuote: { color: Colors.text.primary, fontSize: 13, fontStyle: 'italic', lineHeight: 20 },

  skillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: { fontSize: 11, fontWeight: '700' },

  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bulletDot: { color: Colors.accent.softGold, marginRight: 6, fontSize: 14 },
  bulletText: { color: Colors.text.secondary, fontSize: 13, lineHeight: 20, flex: 1 },

  timeline: { marginTop: 4 },
  timelineRow: { flexDirection: 'row', marginBottom: 12 },
  timelineLeftCol: { width: 70, alignItems: 'center' },
  timelineYear: { color: Colors.text.muted, fontSize: 11, marginBottom: 4 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff44',
  },
  timelineDotFirst: { borderColor: Colors.accent.softGold },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#ffffff22', marginTop: 2 },
  timelineRightCol: { flex: 1, paddingLeft: 10 },
  timelineRole: { color: Colors.text.primary, fontSize: 13, fontWeight: '700' },
  timelineCompany: { color: Colors.text.muted, fontSize: 12 },

  modalActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ffffff18',
    flexWrap: 'wrap',
  },
  modalAction: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  modalActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Sheets
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
  sheetTall: { maxHeight: SCREEN_HEIGHT * 0.7 },
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

  // Chapters / city hubs
  chaptersScroll: { paddingLeft: HORIZONTAL_PADDING, paddingRight: 10, paddingBottom: 6 },
  chapterCard: {
    width: IS_SMALL ? 240 : 270,
    marginRight: 12,
  },
  chapterGradient: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 340,
  },
  chapterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterEmoji: { fontSize: 26 },
  chapterPill: {
    backgroundColor: '#ffffff14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chapterPillText: { color: Colors.text.primary, fontSize: 10, fontWeight: '800' },
  chapterCity: { color: Colors.text.primary, fontSize: 18, fontWeight: '900', marginTop: 10 },
  chapterCountry: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  chapterDivider: {
    height: 1,
    backgroundColor: '#ffffff12',
    marginVertical: 10,
  },
  chapterMetaLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  chapterMetaValue: { color: Colors.text.secondary, fontSize: 11, marginTop: 2, lineHeight: 15 },
  chapterAnchor: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  chapterFootRow: { marginTop: 10 },
  chapterMembers: { fontSize: 12, fontWeight: '800' },
  chapterVibe: { color: Colors.text.secondary, fontSize: 10.5, marginTop: 6, lineHeight: 14, fontStyle: 'italic' },

  // Career pivots
  pivotCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  pivotTopRow: { flexDirection: 'row', alignItems: 'center' },
  pivotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pivotIcon: { fontSize: 20 },
  pivotArrowRow: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  pivotFrom: { color: Colors.text.muted, fontSize: 12 },
  pivotArrow: { color: Colors.text.muted, fontSize: 12 },
  pivotTo: { fontSize: 13, fontWeight: '900' },
  pivotYear: { color: Colors.accent.softGold, fontSize: 10, fontWeight: '700', marginTop: 2 },
  pivotStory: { color: Colors.text.secondary, fontSize: 12, marginTop: 10, lineHeight: 17 },
  pivotTakeawayRow: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pivotTakeawayLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pivotTakeaway: { color: Colors.text.primary, fontSize: 12, marginTop: 3, fontStyle: 'italic' },

  // Mentor board
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING - 4,
  },
  boardCard: {
    width: IS_TABLET ? '33.333%' : '50%',
    padding: 4,
  },
  boardGradient: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffffff14',
    minHeight: 220,
  },
  boardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  boardDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  boardDomain: {
    color: Colors.text.muted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  boardName: { color: Colors.text.primary, fontSize: 14, fontWeight: '900', marginTop: 8 },
  boardRole: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  boardOffice: { color: Colors.text.muted, fontSize: 10, marginTop: 8 },
  boardFocus: { color: Colors.text.secondary, fontSize: 11, marginTop: 6, lineHeight: 15 },
  boardHoursRow: { marginTop: 10, alignItems: 'flex-start' },
  boardHoursPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  boardHoursText: { fontSize: 10, fontWeight: '800' },

  // Fireside recaps
  firesideCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  firesideHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  firesideEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  firesideTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', lineHeight: 18 },
  firesideMeta: { color: Colors.text.muted, fontSize: 11, marginTop: 3 },
  firesideHighlight: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  firesideQuoteBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  firesideQuote: {
    color: Colors.text.primary,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  firesideQuoteAuthor: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  firesideGuestRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  firesideGuestPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  firesideGuestText: { fontSize: 10, fontWeight: '800' },

  // Relocation grants
  grantCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  grantHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grantName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  grantAmount: { fontSize: 14, fontWeight: '900', marginLeft: 8 },
  grantUsedFor: {
    color: Colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  grantMetaRow: { marginTop: 8 },
  grantMetaLabel: {
    color: Colors.tech.neonBlue,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  grantMeta: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 2 },
  grantFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  grantCadence: { color: Colors.text.primary, fontSize: 11, fontWeight: '800' },
  grantDeadline: { color: Colors.text.muted, fontSize: 10 },

  // Polls
  pollCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  pollHeaderRow: { marginBottom: 10 },
  pollQuestion: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  pollTotal: { color: Colors.text.muted, fontSize: 10, marginTop: 4 },
  pollRow: { marginBottom: 8 },
  pollLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pollLabel: { color: Colors.text.secondary, fontSize: 11, flex: 1, marginRight: 8 },
  pollPct: { fontSize: 11, fontWeight: '800' },
  pollTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 4,
    overflow: 'hidden',
  },
  pollFill: { height: '100%', borderRadius: 3 },
  pollCommentary: {
    color: Colors.text.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Publications
  publicationScroll: { paddingHorizontal: 2, paddingBottom: 6 },
  pubCard: {
    width: 200,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderLeftWidth: 3,
  },
  pubKind: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  pubTitle: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 6,
    minHeight: 48,
  },
  pubVenue: { color: Colors.text.secondary, fontSize: 11, marginTop: 6 },
  pubFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pubAuthor: { color: Colors.text.primary, fontSize: 10, fontWeight: '800' },
  pubYear: { color: Colors.text.muted, fontSize: 10 },

  // Scholarships
  schCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  schTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  schEmoji: { fontSize: 24, marginRight: 10, marginTop: 2 },
  schName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  schFunded: { color: Colors.text.muted, fontSize: 11, marginTop: 3 },
  schAmount: { fontSize: 16, fontWeight: '900', marginLeft: 8 },
  schMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  schMetaText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '600' },
  schNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },

  // Advisors
  advCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  advTopRow: { flexDirection: 'row', alignItems: 'center' },
  advEmoji: { fontSize: 22, marginRight: 10 },
  advName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  advSpec: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  advPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginLeft: 8 },
  advPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  advStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  advStatText: { color: Colors.text.muted, fontSize: 10 },
  advNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },

  // Diaspora
  diasporaScroll: { paddingRight: HORIZONTAL_PADDING },
  diasporaCard: {
    width: 140,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  diasporaFlagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diasporaFlag: { fontSize: 26 },
  diasporaCount: { fontSize: 18, fontWeight: '900' },
  diasporaCity: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', marginTop: 8 },
  diasporaCountry: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  diasporaMeet: { color: Colors.text.secondary, fontSize: 10, lineHeight: 13, marginTop: 6 },
  diasporaLead: { color: Colors.text.muted, fontSize: 10, marginTop: 6, fontStyle: 'italic' },

  // AMA
  amaCard: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  amaEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  amaTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amaName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  amaMode: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  amaTopic: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  amaFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  amaDate: { color: Colors.tech.neonBlue, fontSize: 10, fontWeight: '700' },
  amaQCount: { color: Colors.text.muted, fontSize: 10 },

  // Giving ledger
  gvRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  gvEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  gvTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gvSource: { color: Colors.text.primary, fontSize: 12, fontWeight: '800', flex: 1 },
  gvAmount: { fontSize: 14, fontWeight: '900', marginLeft: 8 },
  gvUsed: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  gvMeta: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // Company referrals
  crCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  crTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  crEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  crCoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  crCo: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  crRoles: { fontSize: 16, fontWeight: '900', marginLeft: 8 },
  crLead: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  crMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  crType: { color: Colors.text.secondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  crUpdated: { color: Colors.text.muted, fontSize: 10 },
  crNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },

  // --- Phase 3x: legacy projects ---
  lpRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  lpEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  lpTopRow: { flexDirection: 'row', alignItems: 'center' },
  lpTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1, lineHeight: 17 },
  lpAlive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
  },
  lpAliveText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  lpAlumnus: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700', marginTop: 4 },
  lpNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },

  // --- Phase 3x: alumni awards ---
  awCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  awTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  awEmoji: { fontSize: 24, marginRight: 10, marginTop: 2 },
  awAward: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  awBody: { color: Colors.text.muted, fontSize: 11, marginTop: 3, fontStyle: 'italic' },
  awAlumnus: { fontSize: 12, fontWeight: '800', marginTop: 6, paddingLeft: 34 },
  awNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, paddingLeft: 34 },

  // --- Phase 3x: alumni ventures ---
  avnCard: {
    width: 220,
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  avnEmoji: { fontSize: 28 },
  avnCompany: { color: Colors.text.primary, fontSize: 14, fontWeight: '800', marginTop: 6 },
  avnFounder: { color: Colors.text.muted, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  avnMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  avnStagePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  avnStageText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  avnYear: { color: Colors.text.muted, fontSize: 10 },
  avnMission: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  avnHiring: { color: Colors.accent.softGold, fontSize: 11, marginTop: 6, fontStyle: 'italic' },

  // --- Phase 3x: reunions ---
  rpCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  rpTopRow: { flexDirection: 'row', alignItems: 'center' },
  rpEmoji: { fontSize: 24, marginRight: 10 },
  rpTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  rpDate: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  rpLocation: { color: Colors.text.secondary, fontSize: 11, marginTop: 6, paddingLeft: 34 },
  rpBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 10,
    overflow: 'hidden',
  },
  rpBarFill: { height: 4, borderRadius: 2 },
  rpSeats: { color: Colors.text.muted, fontSize: 10, marginTop: 6 },

  // --- Phase 3x: family heritage ---
  fhRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  fhEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  fhAlumnus: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  fhRelation: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '700', marginTop: 2 },
  fhNote: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },

  // --- Phase 3x: story beats ---
  sbRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  sbYearCol: { width: 52, marginRight: 10 },
  sbYear: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  sbTopRow: { flexDirection: 'row', alignItems: 'center' },
  sbEmoji: { fontSize: 18, marginRight: 6 },
  sbAlumnus: { color: Colors.text.muted, fontSize: 11, fontWeight: '700', flex: 1 },
  sbBeat: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17, marginTop: 4 },
  sbDetail: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
});

export default AlumniScreen;
