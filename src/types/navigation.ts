// =====================================================
// ULTRA PREMIUM TYPES DEFINITIONS
// =====================================================

import { NavigatorScreenParams } from '@react-navigation/native';

// =====================================================
// BOTTOM TAB NAVIGATION PARAMETERS
// =====================================================

export type RootTabParamList = NavigatorScreenParams<{
  HomeTab: undefined;
  EventsTab: undefined;
  TaruWingsTab: undefined;
  TeamTab: undefined;
  AlumniTab: undefined;
  SuggestionTab: undefined;
}>;

// =====================================================
// TARU WINGS (NESTED TABS)
// =====================================================

export type TaruWingsParamList = NavigatorScreenParams<{
  ContentWriter: undefined;
  WebAppDevelopment: undefined;
  GraphicDesigner: undefined;
  VideoEditor: undefined;
  Photographer: undefined;
  PublicRelations: undefined;
}>;

// =====================================================
// EVENT TYPES
// =====================================================

export type EventType = 'upcoming' | 'past';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category: string;
  type: EventType;
  attendees: number;
  maxAttendees: number;
  price: number;
  isFree: boolean;
  organizer: string;
  contactEmail: string;
  isFeature: boolean;
  tags: string[];
}

export interface EventCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// =====================================================
// TEAM MEMBER TYPES
// =====================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  imageUrl: string;
  bio: string;
  skills: string[];
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  achievements: string[];
  projects: Project[];
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  memberCount: number;
  description: string;
}

// =====================================================
// PROJECT TYPES
// =====================================================

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  technologies: string[];
  status: 'completed' | 'ongoing' | 'planned';
  startDate: string;
  endDate?: string;
  teamSize: number;
  githubUrl?: string;
  liveUrl?: string;
}

// =====================================================
// ALUMNI TYPES
// =====================================================

export interface Alumni {
  id: string;
  name: string;
  batch: string;
  role: string;
  company: string;
  location: string;
  imageUrl: string;
  email: string;
  linkedin: string;
  currentRole: string;
  pastRoles: string[];
  achievements: string[];
  messageToStudents: string;
}

export interface AlumniStats {
  totalAlumni: number;
  avgExperience: number;
  placementRate: number;
  companiesHired: number;
}

// =====================================================
// SUGGESTION TYPES
// =====================================================

export interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  submittedAt: string;
  votedCount: number;
  isAnonymous: boolean;
}

export interface SuggestionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// =====================================================
// TARU WINGS MEMBER TYPES
// =====================================================

export interface TaruWingsMember {
  id: string;
  name: string;
  role: string;
  wing: string;
  year: string;
  imageUrl: string;
  bio: string;
  email: string;
  skills: string[];
  portfolio?: string;
}

export interface WingSection {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  memberCount: number;
  openPositions: string[];
}

// =====================================================
// HOME SCREEN TYPES
// =====================================================

export interface HomeStats {
  totalEvents: number;
  totalMembers: number;
  totalAlumni: number;
  totalProjects: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  isNew: boolean;
}

// =====================================================
// NAVIGATION STATE
// =====================================================

export interface NavigationState {
  currentTab: string;
  isReady: boolean;
}

// =====================================================
// UI COMPONENT TYPES
// =====================================================

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  elevation?: number;
}

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

// =====================================================
// ANIMATION TYPES
// =====================================================

export interface AnimationConfig {
  duration: number;
  easing?: 'easeInOut' | 'easeOut' | 'spring';
  delay?: number;
}

export interface ScrollAnimation {
  translateY: Animated.Value;
  opacity: Animated.Value;
}

// =====================================================
// THEME TYPES
// =====================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  typography: {
    h1: object;
    h2: object;
    h3: object;
    body: object;
    caption: object;
  };
}