// =====================================================
// ULTRA PREMIUM EVENTS SCREEN
// Taru Guardians - Tech Club Events
// Nested Upcoming & Past tabs, filters, search, modal
// =====================================================

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  Image,
  SafeAreaView,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Event, EventCategory } from '../../types/navigation';

// =====================================================
// SCREEN DIMENSIONS & RESPONSIVE HELPERS
// =====================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH >= 768;
const HORIZONTAL_PADDING = IS_SMALL ? 14 : 18;
const CARD_RADIUS = 20;

// =====================================================
// ANIMATION PRESETS
// =====================================================

const ANIM = {
  duration: {
    instant: 60,
    fast: 180,
    normal: 320,
    slow: 520,
    xslow: 800,
  },
  easing: {
    inOut: Easing.inOut(Easing.cubic),
    out: Easing.out(Easing.cubic),
    bezier: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
};

// =====================================================
// EVENT CATEGORIES (12)
// =====================================================

const EVENT_CATEGORIES: EventCategory[] = [
  { id: '1', name: 'All Events', icon: '🎉', color: Colors.tech.neonBlue },
  { id: '2', name: 'Adventure', icon: '🏔️', color: '#FF7043' },
  { id: '3', name: 'Environment', icon: '🌿', color: Colors.nature.leafGreen },
  { id: '4', name: 'Technology', icon: '💻', color: Colors.tech.electricBlue },
  { id: '5', name: 'Workshop', icon: '📚', color: '#AB47BC' },
  { id: '6', name: 'Social', icon: '🤝', color: '#EC407A' },
  { id: '7', name: 'Sports', icon: '⚽', color: '#FFA726' },
  { id: '8', name: 'Art & Culture', icon: '🎨', color: '#7E57C2' },
  { id: '9', name: 'Music', icon: '🎵', color: '#26C6DA' },
  { id: '10', name: 'Food', icon: '🍽️', color: '#8D6E63' },
  { id: '11', name: 'Travel', icon: '✈️', color: '#5C6BC0' },
  { id: '12', name: 'Photography', icon: '📸', color: '#FFCA28' },
];

// =====================================================
// EVENT DATA HELPERS
// =====================================================

const makeEvent = (
  id: number,
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  category: string,
  type: 'upcoming' | 'past',
  attendees: number,
  maxAttendees: number,
  price: number,
  organizer: string,
  isFeature: boolean,
  tags: string[],
): Event => ({
  id: String(id),
  title,
  description,
  date,
  time,
  location,
  imageUrl: '',
  category,
  type,
  attendees,
  maxAttendees,
  price,
  isFree: price === 0,
  organizer,
  contactEmail: `${organizer.replace(/\s+/g, '').toLowerCase()}@taruguardians.org`,
  isFeature,
  tags,
});

// =====================================================
// UPCOMING EVENTS (60 premium events)
// =====================================================

const UPCOMING_EVENTS: Event[] = [
  makeEvent(1, 'Himalayan Trek Expedition', 'Five-day Himalayan trekking adventure with certified guides, premium gear, camping under the stars, and breathtaking mountain vistas across Manali-Hampta pass.', '2026-05-01', '06:00 AM', 'Manali Base Camp', 'Adventure', 'upcoming', 45, 50, 2500, 'Adventure Club', true, ['trek', 'mountain', 'himalayas', 'camping']),
  makeEvent(2, 'Green Tomorrow Plantation Drive', 'Plant 500 native saplings across the city. Tools, saplings and refreshments provided. Earn community-service hours and certificate.', '2026-04-25', '08:00 AM', 'Shimla City Park', 'Environment', 'upcoming', 150, 200, 0, 'Green Team', true, ['plantation', 'green', 'conservation']),
  makeEvent(3, 'Tech-for-Nature Hackathon 2026', '24-hour hackathon to build tech solutions for environmental challenges. Mentors from industry, exciting prize pool, swag and networking.', '2026-04-20', '10:00 AM', 'Innovation Hub, Bangalore', 'Technology', 'upcoming', 80, 100, 500, 'Tech Wing', true, ['hackathon', 'innovation', 'ai', 'coding']),
  makeEvent(4, 'Wildlife Photography Masterclass', 'Immersive workshop with award-winning wildlife photographers. Equipment provided, classroom + field sessions, portfolio review.', '2026-05-10', '07:00 AM', 'Sariska Tiger Reserve', 'Photography', 'upcoming', 28, 35, 1800, 'Photo Club', true, ['wildlife', 'photography', 'masterclass']),
  makeEvent(5, 'Cultural Night & Folk Concert', 'Evening of folk music, dance and storytelling celebrating regional heritage. Food stalls, handicrafts, open-air stage.', '2026-04-28', '06:00 PM', 'Amphitheatre', 'Art & Culture', 'upcoming', 220, 300, 200, 'Art Club', true, ['folk', 'music', 'concert']),
  makeEvent(6, 'Marathon for Clean Air', 'Annual 5K/10K marathon promoting clean-air awareness. Timing chips, medals, goodie bags, rehydration zones.', '2026-06-05', '05:30 AM', 'Eco Park Main Gate', 'Sports', 'upcoming', 320, 500, 150, 'Wellness Club', true, ['marathon', 'running', 'health']),
  makeEvent(7, 'Leadership Bootcamp', 'Three-day residential bootcamp on leadership, communication, decision-making with executive coaches.', '2026-05-18', '09:00 AM', 'Retreat Campus', 'Workshop', 'upcoming', 40, 45, 2200, 'HR Wing', false, ['leadership', 'bootcamp', 'workshop']),
  makeEvent(8, 'Electronic Music Fest', 'Multi-stage electronic music festival with indie DJs, light shows, food trucks and a late-night rave tent.', '2026-07-12', '04:00 PM', 'Riverside Grounds', 'Music', 'upcoming', 900, 1500, 600, 'Music Club', true, ['edm', 'festival', 'djs']),
  makeEvent(9, 'Startup Pitch Night', 'Student-founders pitch to VCs for seed funding. Networking rounds, demo booths, mentor speed-dating.', '2026-05-22', '05:00 PM', 'Auditorium A', 'Technology', 'upcoming', 180, 250, 0, 'Tech Wing', true, ['startup', 'pitch', 'funding', 'demo']),
  makeEvent(10, 'Organic Food Carnival', 'Farm-to-table food carnival with organic vendors, cooking demos, tasting tables and nutritionist talks.', '2026-05-05', '11:00 AM', 'Community Ground', 'Food', 'upcoming', 260, 400, 100, 'Green Team', false, ['organic', 'food', 'carnival']),
  makeEvent(11, 'AI + Sustainability Summit', 'Full-day summit on how AI accelerates sustainable outcomes. Panels, workshops, research showcase.', '2026-06-15', '09:00 AM', 'Convention Centre', 'Technology', 'upcoming', 300, 400, 800, 'Tech Wing', true, ['ai', 'sustainability', 'summit']),
  makeEvent(12, 'River Clean-up Drive', 'Community clean-up along 3 km river stretch. Gloves, safety vests, sorting bins provided. Lunch included.', '2026-04-30', '07:00 AM', 'River Walk Point 3', 'Environment', 'upcoming', 120, 200, 0, 'Green Team', false, ['clean-up', 'river', 'volunteer']),
  makeEvent(13, 'Paragliding Experience', 'Tandem paragliding flights with licensed pilots. Stunning valley panoramas, GoPro footage included.', '2026-09-15', '08:00 AM', 'Bir Billing', 'Adventure', 'upcoming', 22, 30, 3500, 'Adventure Club', true, ['paragliding', 'flying', 'adventure']),
  makeEvent(14, 'Graphic Design Bootcamp', 'Four-day immersive bootcamp on Figma, Illustrator, branding, typography, portfolio build.', '2026-05-25', '10:00 AM', 'Design Studio', 'Workshop', 'upcoming', 35, 40, 1200, 'Taru Wings', false, ['design', 'figma', 'bootcamp']),
  makeEvent(15, 'Stand-up Comedy Night', 'Open-mic + featured performers. Laugh-out-loud evening with student comics and a special headliner act.', '2026-05-08', '07:30 PM', 'Black Box Theatre', 'Art & Culture', 'upcoming', 160, 200, 120, 'Art Club', false, ['comedy', 'stand-up', 'entertainment']),
  makeEvent(16, 'Tree-Mapping Tech Workshop', 'Learn how to map urban tree canopy using QGIS and drone data. Hands-on field + lab.', '2026-06-20', '09:00 AM', 'GIS Lab', 'Environment', 'upcoming', 24, 30, 300, 'Green Team', false, ['gis', 'drone', 'mapping']),
  makeEvent(17, 'Flutter App Jam', 'Weekend Flutter coding jam. Build a full app in 48 hours with free cloud credits and mentor support.', '2026-05-30', '09:00 AM', 'Hacker House', 'Technology', 'upcoming', 60, 80, 0, 'Tech Wing', true, ['flutter', 'mobile', 'jam']),
  makeEvent(18, 'Yoga in the Park', 'Sunrise yoga session with a certified instructor. Mats provided. All experience levels welcome.', '2026-05-12', '06:00 AM', 'Lotus Park', 'Sports', 'upcoming', 70, 120, 0, 'Wellness Club', false, ['yoga', 'wellness', 'outdoor']),
  makeEvent(19, 'Book Swap & Poetry Reading', 'Bring a book, take a book. Evening poetry reading with local poets and spoken-word performers.', '2026-05-17', '05:00 PM', 'Library Lawn', 'Art & Culture', 'upcoming', 45, 80, 0, 'Content Writer Wing', false, ['books', 'poetry', 'swap']),
  makeEvent(20, 'Rock Climbing Intro', 'Beginner-friendly indoor rock climbing class with certified instructors. Gear provided.', '2026-06-02', '10:00 AM', 'Climb Wall Arena', 'Adventure', 'upcoming', 18, 24, 600, 'Adventure Club', false, ['climbing', 'adventure', 'indoor']),
  makeEvent(21, 'Photography Field Day', 'Guided photo walk across old town. Composition tips, candid portraits, street photography.', '2026-05-14', '05:30 AM', 'Old Town Square', 'Photography', 'upcoming', 40, 50, 250, 'Photo Club', false, ['street', 'photowalk', 'composition']),
  makeEvent(22, 'Debate Championship', 'Inter-college debate championship on sustainability motions. Cash prizes and trophy.', '2026-06-12', '09:30 AM', 'Main Auditorium', 'Social', 'upcoming', 90, 120, 200, 'HR Wing', true, ['debate', 'public-speaking']),
  makeEvent(23, 'Herbal Garden Workshop', 'Plant your own herb kit. Learn uses of tulsi, aloe, mint, stevia and more. Take home starter pot.', '2026-05-19', '09:00 AM', 'Botanical Garden', 'Environment', 'upcoming', 55, 80, 150, 'Green Team', false, ['herbs', 'garden', 'diy']),
  makeEvent(24, 'VR Hack Jam', 'Virtual reality game jam. Build a 10-minute VR experience in a weekend. Headsets provided.', '2026-07-02', '09:00 AM', 'XR Lab', 'Technology', 'upcoming', 30, 40, 400, 'Tech Wing', false, ['vr', 'xr', 'gaming']),
  makeEvent(25, 'Street Food Trail', 'Guided walking tour through heritage lanes. Taste 12 signature dishes at curated stalls.', '2026-05-24', '05:00 PM', 'Heritage Lanes', 'Food', 'upcoming', 50, 60, 500, 'HR Wing', false, ['food', 'street', 'heritage']),
  makeEvent(26, 'Public Speaking Masterclass', 'Workshop with a TEDx speaker on stagecraft, storytelling and message design. Practice rounds.', '2026-05-27', '10:00 AM', 'Seminar Hall B', 'Workshop', 'upcoming', 50, 60, 350, 'PR Wing', false, ['speaking', 'storytelling']),
  makeEvent(27, 'Short-Film Screening', 'Premiere of five student short films. Directors Q&A and audience choice award.', '2026-06-08', '06:30 PM', 'Film Hall', 'Art & Culture', 'upcoming', 120, 200, 100, 'Video Editor Wing', true, ['film', 'screening', 'directors']),
  makeEvent(28, 'Sustainable Fashion Show', 'Student designers showcase upcycled fashion collections. Runway, photography pit, press coverage.', '2026-07-20', '06:00 PM', 'Grand Ballroom', 'Art & Culture', 'upcoming', 350, 500, 700, 'Art Club', true, ['fashion', 'upcycled', 'runway']),
  makeEvent(29, 'Data Science Meetup', 'Talks on MLOps, real-world ML pipelines, open dataset hackathon. Networking dinner.', '2026-05-31', '04:00 PM', 'DS Lab', 'Technology', 'upcoming', 70, 90, 0, 'Tech Wing', false, ['data', 'ml', 'meetup']),
  makeEvent(30, 'Nature Sketching Retreat', 'Open-air sketching retreat in the hills. Materials and overnight stay included.', '2026-06-28', '09:00 AM', 'Hill Retreat Camp', 'Art & Culture', 'upcoming', 20, 30, 1800, 'Graphic Designer Wing', false, ['sketch', 'retreat', 'nature']),
  makeEvent(31, 'Blockchain Basics', 'Beginner workshop on Web3, wallets, smart contracts and safety. Hands-on testnet exercises.', '2026-06-11', '10:00 AM', 'Web3 Lab', 'Workshop', 'upcoming', 40, 60, 0, 'Tech Wing', false, ['web3', 'blockchain']),
  makeEvent(32, 'Cricket Premier League', 'Inter-wing T20 cricket league across 3 weekends. Trophy, player-of-the-series, MVP awards.', '2026-06-14', '09:00 AM', 'Cricket Ground', 'Sports', 'upcoming', 180, 250, 0, 'HR Wing', true, ['cricket', 'league', 'sport']),
  makeEvent(33, 'Vegan Potluck Social', 'Bring a vegan dish, meet new friends, exchange recipes. Zero-waste utensils provided.', '2026-05-21', '06:00 PM', 'Community Kitchen', 'Food', 'upcoming', 45, 80, 0, 'Green Team', false, ['vegan', 'potluck', 'social']),
  makeEvent(34, 'Robotics Open House', 'Robotics lab demo day. Tours, live demos, Arduino projects and DIY mini-robots to take home.', '2026-06-18', '11:00 AM', 'Robotics Lab', 'Technology', 'upcoming', 130, 200, 50, 'Tech Wing', false, ['robotics', 'arduino', 'demo']),
  makeEvent(35, 'Journaling Workshop', 'Journaling techniques for well-being, productivity and creativity. Guided prompts and templates.', '2026-05-29', '05:00 PM', 'Wellness Centre', 'Workshop', 'upcoming', 35, 50, 100, 'Content Writer Wing', false, ['journal', 'wellness', 'writing']),
  makeEvent(36, 'Jungle Safari Camp', 'Overnight jungle safari + bonfire. Spot deer, peacocks, migratory birds. Naturalist guides.', '2026-09-05', '04:30 AM', 'National Park Gate', 'Adventure', 'upcoming', 30, 40, 4200, 'Adventure Club', true, ['safari', 'jungle', 'wildlife']),
  makeEvent(37, 'Responsive Web Sprint', 'Weekend sprint to build a fully responsive portfolio site. Hosting credits included.', '2026-06-07', '09:30 AM', 'Web Lab', 'Technology', 'upcoming', 45, 60, 0, 'Web/App Dev Wing', false, ['web', 'responsive', 'portfolio']),
  makeEvent(38, 'Classical Dance Showcase', 'Evening showcase of Bharatanatyam, Kathak and Odissi by student performers.', '2026-06-22', '07:00 PM', 'Dance Hall', 'Art & Culture', 'upcoming', 140, 200, 150, 'Art Club', false, ['classical', 'dance', 'showcase']),
  makeEvent(39, 'Solar Workshop', 'DIY solar lantern build. Take home a working off-grid lantern. Safety gear provided.', '2026-07-06', '10:00 AM', 'Maker Space', 'Workshop', 'upcoming', 28, 40, 550, 'Green Team', false, ['solar', 'diy', 'renewable']),
  makeEvent(40, 'Podcast Launch Party', 'Official launch of Taru Talk podcast + live interview with alumni founder. Refreshments.', '2026-05-26', '06:30 PM', 'Radio Studio', 'Social', 'upcoming', 75, 100, 0, 'PR Wing', true, ['podcast', 'launch']),
  makeEvent(41, 'Stargazing Night', 'Astronomy club stargazing event with telescopes. Meteor shower predicted.', '2026-08-12', '09:00 PM', 'Observation Deck', 'Environment', 'upcoming', 90, 120, 0, 'Green Team', true, ['astronomy', 'stars', 'night']),
  makeEvent(42, 'Kickboxing Bootcamp', 'Introductory kickboxing bootcamp with a national-level coach. All gear provided.', '2026-06-19', '06:00 AM', 'Fitness Arena', 'Sports', 'upcoming', 30, 40, 450, 'Wellness Club', false, ['kickboxing', 'fitness']),
  makeEvent(43, 'Content Strategy Workshop', 'Workshop on editorial calendars, SEO fundamentals, and brand storytelling.', '2026-06-01', '10:00 AM', 'Conference Room', 'Workshop', 'upcoming', 40, 50, 300, 'Content Writer Wing', false, ['content', 'seo', 'editorial']),
  makeEvent(44, 'Cycling Expedition', '60 km countryside cycling expedition. Support vehicle, snacks, mechanic backup.', '2026-06-25', '05:30 AM', 'City Gate', 'Adventure', 'upcoming', 60, 80, 350, 'Adventure Club', false, ['cycling', 'expedition']),
  makeEvent(45, 'Open Mic Night', 'Perform your song, poem, comedy, act. Free stage time, lights, sound.', '2026-05-16', '07:00 PM', 'Cafe Stage', 'Music', 'upcoming', 100, 150, 0, 'Art Club', false, ['open-mic', 'perform']),
  makeEvent(46, 'Eco-Brick Workshop', 'Make eco-bricks from plastic waste. Learn construction uses and community projects.', '2026-05-23', '10:00 AM', 'Workshop Shed', 'Environment', 'upcoming', 35, 60, 0, 'Green Team', false, ['eco-brick', 'plastic', 'diy']),
  makeEvent(47, 'Creative Writing Retreat', 'Weekend getaway for fiction writers. Prompts, critiques, guest author reading.', '2026-07-18', '04:00 PM', 'Hillside Lodge', 'Workshop', 'upcoming', 20, 25, 2500, 'Content Writer Wing', false, ['writing', 'fiction', 'retreat']),
  makeEvent(48, 'Volleyball Tournament', 'Three-day volleyball tournament. Mixed teams, finals under lights, MVP trophy.', '2026-06-29', '09:00 AM', 'Sand Courts', 'Sports', 'upcoming', 120, 160, 100, 'HR Wing', false, ['volleyball', 'tournament']),
  makeEvent(49, 'Pottery Afternoon', 'Hands-on pottery wheel session. Take home two glazed pieces after firing.', '2026-06-07', '02:00 PM', 'Clay Studio', 'Art & Culture', 'upcoming', 15, 20, 500, 'Art Club', false, ['pottery', 'clay', 'craft']),
  makeEvent(50, 'UX Research Roundtable', 'Roundtable with industry UX researchers on methods, recruiting, synthesis.', '2026-06-04', '05:00 PM', 'UX Lounge', 'Workshop', 'upcoming', 30, 40, 0, 'Graphic Designer Wing', false, ['ux', 'research', 'design']),
  makeEvent(51, 'Trail Running Series', 'Weekly trail running meetup. Trails graded easy to challenging. Timing optional.', '2026-05-15', '06:00 AM', 'Forest Trailhead', 'Sports', 'upcoming', 60, 120, 0, 'Wellness Club', false, ['running', 'trail']),
  makeEvent(52, 'Mobile Journalism Class', 'Shoot, edit and publish a news story entirely on your phone. Professional tips included.', '2026-06-13', '10:00 AM', 'Media Lab', 'Workshop', 'upcoming', 30, 40, 250, 'Video Editor Wing', false, ['mojo', 'journalism']),
  makeEvent(53, 'Reading Circle', 'Monthly non-fiction reading circle. Discuss ideas, debate takeaways over chai.', '2026-05-20', '06:00 PM', 'Reading Room', 'Social', 'upcoming', 20, 30, 0, 'Content Writer Wing', false, ['reading', 'discussion']),
  makeEvent(54, 'Fundraising Gala', 'Annual fundraising gala for club initiatives. Dinner, auctions, live performances.', '2026-08-28', '07:00 PM', 'Grand Hall', 'Social', 'upcoming', 250, 400, 1500, 'PR Wing', true, ['gala', 'fundraising']),
  makeEvent(55, 'Hackathon Wrap Party', 'Celebration after hackathon weekend. Pizza, music, award ceremony.', '2026-04-21', '08:00 PM', 'Innovation Hub', 'Social', 'upcoming', 150, 200, 0, 'Tech Wing', false, ['party', 'hackathon']),
  makeEvent(56, 'Portfolio Review Night', 'Senior designers review juniors\' portfolios. Honest feedback, career advice.', '2026-06-27', '05:30 PM', 'Design Studio', 'Workshop', 'upcoming', 25, 35, 0, 'Graphic Designer Wing', false, ['portfolio', 'review']),
  makeEvent(57, 'Wildlife Rescue Info Session', 'Info session with a wildlife rescue NGO. How to help, volunteer paths.', '2026-05-07', '06:00 PM', 'Seminar Room', 'Environment', 'upcoming', 45, 60, 0, 'Green Team', false, ['wildlife', 'rescue']),
  makeEvent(58, 'Tabla & Guitar Fusion', 'Fusion evening with tabla + acoustic guitar performers. Acoustic, intimate setting.', '2026-06-09', '07:30 PM', 'Open Lawn', 'Music', 'upcoming', 80, 120, 150, 'Music Club', false, ['tabla', 'guitar', 'fusion']),
  makeEvent(59, 'Alumni Homecoming Dinner', 'Welcome back dinner for alumni of 2015-2025 batches. Reunion speeches and memories wall.', '2026-09-30', '07:00 PM', 'Alumni Lounge', 'Social', 'upcoming', 200, 300, 1200, 'Alumni Wing', true, ['alumni', 'dinner']),
  makeEvent(60, 'Taru Annual Fest', 'The flagship annual fest of Taru Guardians. Three days of workshops, music, food, concerts.', '2026-10-15', '10:00 AM', 'Main Campus', 'Social', 'upcoming', 1800, 3000, 500, 'HR Wing', true, ['fest', 'annual', 'flagship']),
];

// =====================================================
// PAST EVENTS (60 archived events)
// =====================================================

const PAST_EVENTS: Event[] = [
  makeEvent(101, 'Spring Plantation 2024', 'Planted 800 saplings across four green zones. Certificates issued to volunteers.', '2024-03-20', '08:00 AM', 'Eco Park', 'Environment', 'past', 180, 200, 0, 'Green Team', true, ['plantation', 'spring']),
  makeEvent(102, 'Hack Guardians 2023', 'Signature 24-hour hackathon. 120 participants across 30 teams. Judges from industry.', '2023-10-14', '10:00 AM', 'Innovation Hub', 'Technology', 'past', 120, 120, 500, 'Tech Wing', true, ['hackathon', '2023']),
  makeEvent(103, 'Winter Trek 2024', 'Snow trek to Kuari Pass. Stunning Himalayan panorama. Safe returns, zero incidents.', '2024-01-05', '06:00 AM', 'Kuari Pass Base', 'Adventure', 'past', 24, 25, 5500, 'Adventure Club', true, ['trek', 'winter', 'snow']),
  makeEvent(104, 'Cultural Fest 2023', 'Annual cultural fest with dance, music, drama. Packed auditorium each night.', '2023-11-18', '05:00 PM', 'Amphitheatre', 'Art & Culture', 'past', 600, 700, 150, 'Art Club', true, ['cultural', 'fest']),
  makeEvent(105, 'Photography Exhibition', 'Month-long exhibition featuring 50 prints by club photographers.', '2024-02-10', '10:00 AM', 'Gallery', 'Photography', 'past', 420, 500, 50, 'Photo Club', true, ['photography', 'exhibition']),
  makeEvent(106, 'Marathon 2023', 'City-wide 10K marathon for environmental awareness. 1000+ runners registered.', '2023-08-06', '05:30 AM', 'City Square', 'Sports', 'past', 950, 1000, 200, 'Wellness Club', true, ['marathon']),
  makeEvent(107, 'AI Talks 2023', 'Series of four talks with AI researchers. Packed audiences, lively Q&A.', '2023-09-12', '04:00 PM', 'Auditorium', 'Technology', 'past', 260, 300, 0, 'Tech Wing', false, ['ai', 'talks']),
  makeEvent(108, 'Nature Camp 2024', 'Week-long nature camp for new members. Plant ID, birding, bushcraft.', '2024-04-15', '08:00 AM', 'Forest Camp', 'Adventure', 'past', 60, 60, 1800, 'Green Team', true, ['camp', 'nature']),
  makeEvent(109, 'Music Night 2023', 'Acoustic music night with 8 student acts. Candle-lit lawn setting.', '2023-12-09', '06:30 PM', 'Open Lawn', 'Music', 'past', 180, 220, 100, 'Music Club', false, ['music', 'acoustic']),
  makeEvent(110, 'Tech Expo 2022', 'Student-built projects expo across 40 teams. Awards in three categories.', '2022-11-26', '10:00 AM', 'Tech Block', 'Technology', 'past', 420, 500, 0, 'Tech Wing', true, ['expo', 'projects']),
  makeEvent(111, 'Clean-up Marathon 2023', 'Coordinated city-wide clean-up. 1.2 tonnes of waste collected and segregated.', '2023-06-05', '06:00 AM', 'Multiple Zones', 'Environment', 'past', 500, 600, 0, 'Green Team', true, ['clean-up']),
  makeEvent(112, 'Food Fest 2024', 'Three-day food fest with 40 stalls and live cooking demos.', '2024-03-02', '11:00 AM', 'Fair Ground', 'Food', 'past', 700, 900, 50, 'HR Wing', true, ['food', 'fest']),
  makeEvent(113, 'Art Bazaar 2023', 'Student-run art bazaar. Paintings, prints, handmade stationery.', '2023-10-22', '10:00 AM', 'Art Block', 'Art & Culture', 'past', 280, 350, 0, 'Art Club', false, ['art', 'bazaar']),
  makeEvent(114, 'Open Mic 2024', 'Quarterly open-mic. 20 performers, standing-room only.', '2024-02-22', '07:00 PM', 'Cafe Stage', 'Music', 'past', 120, 150, 0, 'Art Club', false, ['open-mic']),
  makeEvent(115, 'Debate Finals 2023', 'Inter-college debate finals. Team Taru placed runners-up.', '2023-09-29', '10:00 AM', 'Auditorium', 'Social', 'past', 180, 200, 0, 'HR Wing', true, ['debate']),
  makeEvent(116, 'Robotics Open 2023', 'Inter-wing robotics showdown. Line followers, sumo bots, maze solvers.', '2023-11-11', '11:00 AM', 'Robotics Lab', 'Technology', 'past', 90, 120, 100, 'Tech Wing', false, ['robotics']),
  makeEvent(117, 'Hill Trek 2022', 'Scenic hill trek and overnight camping. Clear-sky stargazing reported.', '2022-10-29', '05:30 AM', 'Pine Trail', 'Adventure', 'past', 40, 45, 1800, 'Adventure Club', false, ['trek', 'hill']),
  makeEvent(118, 'Graphic Design Showcase', 'Semester showcase of design portfolios. Industry reviewers invited.', '2024-04-01', '04:00 PM', 'Design Studio', 'Art & Culture', 'past', 140, 180, 0, 'Graphic Designer Wing', false, ['design', 'showcase']),
  makeEvent(119, 'Wellness Week 2024', 'Seven-day wellness programme. Yoga, meditation, nutrition talks.', '2024-01-15', '06:00 AM', 'Wellness Centre', 'Sports', 'past', 260, 300, 0, 'Wellness Club', true, ['wellness', 'week']),
  makeEvent(120, 'Short Film Fest 2023', 'Student short-film festival with jury and audience awards.', '2023-12-16', '05:00 PM', 'Film Hall', 'Art & Culture', 'past', 220, 260, 100, 'Video Editor Wing', true, ['film', 'festival']),
  makeEvent(121, 'Travel Talks 2023', 'Alumni share backpacking stories from 12 countries.', '2023-08-19', '06:00 PM', 'Auditorium B', 'Travel', 'past', 150, 180, 0, 'Alumni Wing', false, ['travel', 'talks']),
  makeEvent(122, 'Coding Contest 2023', 'Quarterly DSA coding contest with cash prizes.', '2023-07-08', '02:00 PM', 'Coding Lab', 'Technology', 'past', 180, 200, 100, 'Tech Wing', false, ['coding', 'dsa']),
  makeEvent(123, 'Nature Photography Walk', 'Early morning bird photography walk with naturalist guide.', '2024-03-09', '05:30 AM', 'Wetlands Park', 'Photography', 'past', 35, 40, 150, 'Photo Club', false, ['birds', 'photo']),
  makeEvent(124, 'Design Thinking Workshop', 'Hands-on design-thinking workshop with prototypes and user tests.', '2023-10-08', '10:00 AM', 'UX Lounge', 'Workshop', 'past', 45, 50, 250, 'Graphic Designer Wing', false, ['design-thinking']),
  makeEvent(125, 'Community Picnic 2023', 'Annual community picnic. Games, potluck, trust-building activities.', '2023-02-26', '10:00 AM', 'Picnic Park', 'Social', 'past', 320, 400, 50, 'HR Wing', false, ['picnic', 'social']),
  makeEvent(126, 'Dance Workshop 2023', 'Contemporary dance workshop with a guest choreographer.', '2023-04-14', '04:00 PM', 'Dance Hall', 'Art & Culture', 'past', 50, 60, 200, 'Art Club', false, ['dance']),
  makeEvent(127, 'Green Café Launch', 'Launch of zero-waste green café on campus. Reusable cups encouraged.', '2023-09-01', '05:00 PM', 'Green Café', 'Food', 'past', 300, 350, 0, 'Green Team', true, ['cafe', 'launch']),
  makeEvent(128, 'Cricket Cup 2022', 'Inter-wing T20 cricket tournament. Packed evening finals.', '2022-09-10', '09:00 AM', 'Cricket Ground', 'Sports', 'past', 220, 260, 0, 'HR Wing', true, ['cricket']),
  makeEvent(129, 'Newsletter Relaunch', 'Relaunch event for Taru Times newsletter. New design, new voice.', '2024-01-27', '05:00 PM', 'Media Room', 'Social', 'past', 60, 80, 0, 'Content Writer Wing', false, ['newsletter']),
  makeEvent(130, 'VR Experience Day', 'VR demo day featuring student-built immersive experiences.', '2023-11-05', '10:00 AM', 'XR Lab', 'Technology', 'past', 180, 220, 50, 'Tech Wing', false, ['vr', 'xr']),
  makeEvent(131, 'Monsoon Trek 2023', 'Monsoon waterfall trek with safety briefings and rescue drills.', '2023-07-29', '06:00 AM', 'Falls Trailhead', 'Adventure', 'past', 32, 35, 1200, 'Adventure Club', false, ['monsoon', 'trek']),
  makeEvent(132, 'Poetry Slam 2023', 'Spoken-word poetry slam. Audience vote for winners.', '2023-06-17', '07:00 PM', 'Black Box', 'Art & Culture', 'past', 110, 140, 50, 'Content Writer Wing', false, ['poetry', 'slam']),
  makeEvent(133, 'Cybersec Workshop', 'Ethical hacking and cybersec fundamentals workshop.', '2023-05-20', '10:00 AM', 'Sec Lab', 'Workshop', 'past', 40, 50, 300, 'Tech Wing', false, ['cybersec', 'ethical']),
  makeEvent(134, 'Eco Fashion Show 2023', 'Upcycled fashion show with student designers.', '2023-03-25', '06:00 PM', 'Ballroom', 'Art & Culture', 'past', 320, 400, 500, 'Art Club', true, ['fashion', 'eco']),
  makeEvent(135, 'Startup Talks 2023', 'Three founders share zero-to-one journey in candid sessions.', '2023-02-11', '05:00 PM', 'Seminar Hall', 'Technology', 'past', 180, 220, 0, 'Tech Wing', false, ['startup', 'talks']),
  makeEvent(136, 'Beach Clean-up Drive', 'Off-campus beach clean-up drive. 1.5 tonnes of plastic waste collected.', '2023-01-28', '07:00 AM', 'Silver Beach', 'Environment', 'past', 200, 220, 0, 'Green Team', true, ['beach', 'clean-up']),
  makeEvent(137, 'Pottery Fair 2023', 'Fundraising pottery fair. Proceeds to conservation fund.', '2023-11-25', '11:00 AM', 'Clay Studio', 'Art & Culture', 'past', 140, 180, 30, 'Art Club', false, ['pottery']),
  makeEvent(138, 'Volleyball Open 2023', 'Campus-wide volleyball tournament. Mixed teams, night finals.', '2023-05-06', '09:00 AM', 'Sand Courts', 'Sports', 'past', 120, 150, 100, 'HR Wing', false, ['volleyball']),
  makeEvent(139, 'Wildlife Film Screening', 'BBC Planet-Earth style wildlife film screening + discussion.', '2023-04-08', '06:30 PM', 'Film Hall', 'Environment', 'past', 160, 200, 0, 'Green Team', false, ['wildlife', 'film']),
  makeEvent(140, 'Music Festival 2022', 'Two-day music festival featuring 10 student bands.', '2022-12-10', '04:00 PM', 'Open Grounds', 'Music', 'past', 750, 900, 250, 'Music Club', true, ['music', 'festival']),
  makeEvent(141, 'Public Speaking Finale', 'Finals of the club public speaking tournament.', '2023-07-01', '04:00 PM', 'Seminar Hall', 'Social', 'past', 140, 180, 0, 'PR Wing', false, ['speaking']),
  makeEvent(142, 'Food Drive 2022', 'Community food drive for 200 families. 3 tonnes of rations delivered.', '2022-08-27', '09:00 AM', 'Distribution Centre', 'Social', 'past', 120, 150, 0, 'HR Wing', true, ['food-drive']),
  makeEvent(143, 'Nature Yoga Retreat', 'Weekend yoga retreat by a lakeside. Guided meditation and pranayama.', '2023-04-29', '06:00 AM', 'Lakeside Lodge', 'Sports', 'past', 30, 30, 2200, 'Wellness Club', false, ['yoga', 'retreat']),
  makeEvent(144, 'Coding Marathon 2022', '48-hour coding marathon with 10+ industry challenges.', '2022-11-05', '09:00 AM', 'Innovation Hub', 'Technology', 'past', 80, 100, 300, 'Tech Wing', true, ['coding', 'marathon']),
  makeEvent(145, 'Guitar Workshop 2023', 'Beginner guitar workshop with renowned city musician.', '2023-01-14', '04:00 PM', 'Music Room', 'Music', 'past', 40, 50, 200, 'Music Club', false, ['guitar']),
  makeEvent(146, 'Science Quiz 2023', 'Inter-college science quiz. Won by team Taru Quasars.', '2023-08-26', '10:00 AM', 'Auditorium', 'Technology', 'past', 240, 300, 0, 'Tech Wing', false, ['quiz', 'science']),
  makeEvent(147, 'Monsoon Clean-up', 'Clean-up of clogged urban drains post monsoon.', '2023-09-23', '07:00 AM', 'Old Town', 'Environment', 'past', 140, 180, 0, 'Green Team', false, ['clean-up', 'monsoon']),
  makeEvent(148, 'Radio Jockey Workshop', 'RJ workshop with veterans from local FM stations.', '2023-10-07', '04:00 PM', 'Radio Studio', 'Workshop', 'past', 35, 40, 150, 'PR Wing', false, ['radio', 'rj']),
  makeEvent(149, 'Alumni Reunion 2023', 'Grand reunion for alumni across 10 batches.', '2023-12-30', '06:00 PM', 'Grand Hall', 'Social', 'past', 320, 400, 500, 'Alumni Wing', true, ['alumni', 'reunion']),
  makeEvent(150, 'Farewell 2024', 'Official farewell for the graduating batch. Speeches, awards, slideshow.', '2024-04-28', '05:00 PM', 'Main Auditorium', 'Social', 'past', 420, 500, 0, 'HR Wing', true, ['farewell']),
  makeEvent(151, 'Taru Annual Fest 2023', 'The flagship annual fest of 2023. Three days, 60 events, 4000 attendees.', '2023-10-18', '10:00 AM', 'Main Campus', 'Social', 'past', 3800, 4000, 500, 'HR Wing', true, ['fest']),
  makeEvent(152, 'Taru Annual Fest 2022', 'Post-pandemic revival edition. Unforgettable three-day celebration.', '2022-11-12', '10:00 AM', 'Main Campus', 'Social', 'past', 2800, 3500, 400, 'HR Wing', true, ['fest']),
  makeEvent(153, 'Sustainability Summit 2023', 'Summit on sustainability with speakers from 12 NGOs.', '2023-06-22', '09:00 AM', 'Convention Centre', 'Environment', 'past', 320, 400, 200, 'Green Team', true, ['summit', 'sustainability']),
  makeEvent(154, 'Book Launch - Roots', 'Launch of club anthology "Roots" with contributor readings.', '2023-03-18', '05:00 PM', 'Library Hall', 'Art & Culture', 'past', 160, 200, 0, 'Content Writer Wing', false, ['book', 'anthology']),
  makeEvent(155, 'Drone Filming Workshop', 'Aerial filming workshop with licensed drone operator.', '2023-11-19', '09:00 AM', 'Outdoor Range', 'Workshop', 'past', 20, 25, 800, 'Video Editor Wing', false, ['drone', 'filming']),
  makeEvent(156, 'Bonsai Workshop 2023', 'Introduction to bonsai with starter saplings and tools.', '2023-02-19', '10:00 AM', 'Garden House', 'Environment', 'past', 40, 50, 400, 'Green Team', false, ['bonsai']),
  makeEvent(157, 'Dance Battle 2023', 'Crew-vs-crew dance battle night. Freestyle and hip-hop categories.', '2023-05-27', '06:30 PM', 'Dance Hall', 'Music', 'past', 220, 280, 100, 'Art Club', false, ['dance', 'battle']),
  makeEvent(158, 'Web Conference 2023', 'Student-organised web conference with 12 talks.', '2023-09-16', '10:00 AM', 'Tech Block', 'Technology', 'past', 280, 350, 0, 'Web/App Dev Wing', true, ['web', 'conference']),
  makeEvent(159, 'Heritage Walk 2023', 'Guided heritage walk across the old city with a historian.', '2023-02-05', '06:00 AM', 'Old City Gate', 'Travel', 'past', 80, 100, 50, 'HR Wing', false, ['heritage', 'walk']),
  makeEvent(160, 'Hack Guardians 2022', 'The edition where three teams filed provisional patents.', '2022-10-22', '10:00 AM', 'Innovation Hub', 'Technology', 'past', 120, 120, 400, 'Tech Wing', true, ['hackathon', '2022']),
];

// =====================================================
// AGGREGATE STATS
// =====================================================

const EVENT_STATS = {
  totalEvents: UPCOMING_EVENTS.length + PAST_EVENTS.length,
  upcomingEvents: UPCOMING_EVENTS.length,
  pastEvents: PAST_EVENTS.length,
  featuredEvents:
    UPCOMING_EVENTS.filter((e) => e.isFeature).length +
    PAST_EVENTS.filter((e) => e.isFeature).length,
  freeEvents:
    UPCOMING_EVENTS.filter((e) => e.isFree).length +
    PAST_EVENTS.filter((e) => e.isFree).length,
  categories: EVENT_CATEGORIES.length - 1,
};

// =====================================================
// SORT OPTIONS
// =====================================================

type SortKey = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'popularity';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'date-asc', label: 'Date (earliest)', icon: '📅' },
  { key: 'date-desc', label: 'Date (latest)', icon: '📆' },
  { key: 'price-asc', label: 'Price (low→high)', icon: '💰' },
  { key: 'price-desc', label: 'Price (high→low)', icon: '💎' },
  { key: 'popularity', label: 'Most popular', icon: '🔥' },
];

// =====================================================
// COMPONENT
// =====================================================

const EventsScreen: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Source of truth based on activeTab
  const sourceEvents = activeTab === 'upcoming' ? UPCOMING_EVENTS : PAST_EVENTS;

  // Derived list (memoized)
  const filteredEvents = useMemo(() => {
    let list = sourceEvents;

    // Category
    if (selectedCategory !== '1') {
      const cat = EVENT_CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat) list = list.filter((e) => e.category === cat.name);
    }

    // Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Only free
    if (onlyFree) list = list.filter((e) => e.isFree);

    // Only featured
    if (onlyFeatured) list = list.filter((e) => e.isFeature);

    // Sort
    const sorted = [...list];
    switch (sortKey) {
      case 'date-asc':
        sorted.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'date-desc':
        sorted.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sorted.sort(
          (a, b) =>
            b.attendees / b.maxAttendees - a.attendees / a.maxAttendees,
        );
        break;
    }
    return sorted;
  }, [
    sourceEvents,
    selectedCategory,
    searchQuery,
    sortKey,
    onlyFree,
    onlyFeatured,
  ]);

  // Featured events list
  const featuredUpcoming = useMemo(
    () => UPCOMING_EVENTS.filter((e) => e.isFeature).slice(0, 5),
    [],
  );

  // Initial animations + simulated loading
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: ANIM.duration.slow,
        easing: ANIM.easing.out,
        useNativeDriver: true,
      }),
      Animated.timing(tabAnim, {
        toValue: 1,
        duration: ANIM.duration.normal,
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
  }, [headerAnim, categoryAnim, tabAnim, listAnim]);

  // Modal animations
  useEffect(() => {
    if (showEventModal) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
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
  }, [showEventModal, modalScale, modalOpacity]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleTabChange = useCallback(
    (tab: 'upcoming' | 'past') => {
      if (tab === activeTab) return;
      Animated.sequence([
        Animated.timing(listAnim, {
          toValue: 0,
          duration: ANIM.duration.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveTab(tab);
        Animated.timing(listAnim, {
          toValue: 1,
          duration: ANIM.duration.normal,
          useNativeDriver: true,
        }).start();
      });
    },
    [activeTab, listAnim],
  );

  const openEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const closeEvent = useCallback(() => {
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
      setShowEventModal(false);
      setSelectedEvent(null);
    });
  }, [modalScale, modalOpacity]);

  const handleShare = useCallback(async (event: Event) => {
    try {
      await Share.share({
        message: `Check out "${event.title}" on ${event.date} at ${event.location}. Organized by ${event.organizer}.`,
      });
    } catch {
      // ignore share errors
    }
  }, []);

  const handleRegister = useCallback((event: Event) => {
    Alert.alert(
      'Confirm Registration',
      `Register for "${event.title}" on ${event.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => Alert.alert('Success', "You're registered! See you there."),
        },
      ],
    );
  }, []);

  const handleContact = useCallback((event: Event) => {
    if (event.contactEmail) {
      Linking.openURL(
        `mailto:${event.contactEmail}?subject=Query about ${encodeURIComponent(event.title)}`,
      );
    }
  }, []);

  const handleOpenMap = useCallback((event: Event) => {
    const q = encodeURIComponent(event.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }, []);

  const handleAddToCalendar = useCallback((event: Event) => {
    Alert.alert('Calendar', `"${event.title}" added to your calendar on ${event.date}.`);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('1');
    setSearchQuery('');
    setOnlyFree(false);
    setOnlyFeatured(false);
    setSortKey('date-asc');
  }, []);

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const getCategoryStyle = (name: string) => {
    const c = EVENT_CATEGORIES.find((x) => x.name === name);
    return {
      color: c?.color ?? Colors.tech.neonBlue,
      icon: c?.icon ?? '🎉',
    };
  };

  // Header -----------------------------------------------------
  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[
          Colors.background.deepBlack,
          Colors.background.darkGreen,
          Colors.background.deepBlack,
        ]}
        style={styles.headerGradient}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.overline}>Taru Guardians</Text>
            <Text style={styles.mainTitle}>Events</Text>
            <Text style={styles.subTitle}>
              Learn. Explore. Build. Give back.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.sortButtonText}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: EVENT_STATS.totalEvents, icon: '🎯' },
            { label: 'Upcoming', value: EVENT_STATS.upcomingEvents, icon: '🚀' },
            { label: 'Past', value: EVENT_STATS.pastEvents, icon: '📚' },
            { label: 'Featured', value: EVENT_STATS.featuredEvents, icon: '⭐' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, tags, locations…"
            placeholderTextColor={Colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              onlyFree && styles.filterChipActive,
            ]}
            onPress={() => setOnlyFree((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>
              {onlyFree ? '● ' : ''}🆓 Free only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              onlyFeatured && styles.filterChipActive,
            ]}
            onPress={() => setOnlyFeatured((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>
              {onlyFeatured ? '● ' : ''}⭐ Featured
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterChipMuted}
            onPress={clearFilters}
            activeOpacity={0.8}
          >
            <Text style={styles.filterTextMuted}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Categories -------------------------------------------------
  const renderCategories = () => (
    <Animated.View
      style={[
        styles.categoryContainer,
        {
          opacity: categoryAnim,
          transform: [
            {
              translateY: categoryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {EVENT_CATEGORIES.map((c) => {
          const active = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(c.id)}
              style={[
                styles.categoryChip,
                {
                  borderColor: c.color,
                  backgroundColor: active ? c.color : 'transparent',
                },
              ]}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  { color: active ? Colors.text.primary : c.color },
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

  // Nested tabs ------------------------------------------------
  const renderNestedTabs = () => (
    <Animated.View style={[styles.nestedTabsContainer, { opacity: tabAnim }]}>
      <View style={styles.nestedTabs}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.nestedTab,
            activeTab === 'upcoming' && styles.nestedTabActive,
          ]}
          onPress={() => handleTabChange('upcoming')}
        >
          <Text style={styles.nestedTabIcon}>📅</Text>
          <Text
            style={[
              styles.nestedTabText,
              activeTab === 'upcoming' && styles.nestedTabTextActive,
            ]}
          >
            Upcoming ({UPCOMING_EVENTS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.nestedTab,
            activeTab === 'past' && styles.nestedTabActive,
          ]}
          onPress={() => handleTabChange('past')}
        >
          <Text style={styles.nestedTabIcon}>🗂️</Text>
          <Text
            style={[
              styles.nestedTabText,
              activeTab === 'past' && styles.nestedTabTextActive,
            ]}
          >
            Past ({PAST_EVENTS.length})
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Featured carousel (upcoming only) --------------------------
  const renderFeaturedCarousel = () => {
    if (activeTab !== 'upcoming' || featuredUpcoming.length === 0) return null;
    return (
      <View style={styles.featuredContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Featured</Text>
          <Text style={styles.sectionHint}>{featuredUpcoming.length} picks</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          snapToInterval={SCREEN_WIDTH * 0.8 + 16}
          decelerationRate="fast"
        >
          {featuredUpcoming.map((e) => {
            const { color, icon } = getCategoryStyle(e.category);
            return (
              <TouchableOpacity
                key={e.id}
                activeOpacity={0.9}
                onPress={() => openEvent(e)}
                style={[styles.featuredCard, { borderColor: color }]}
              >
                <LinearGradient
                  colors={[color + '33', Colors.background.darkGreen]}
                  style={styles.featuredGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
                  </View>
                  <Text style={styles.featuredIcon}>{icon}</Text>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {e.title}
                  </Text>
                  <Text style={styles.featuredMeta}>📅 {e.date}</Text>
                  <Text style={styles.featuredMeta} numberOfLines={1}>
                    📍 {e.location}
                  </Text>
                  <Text
                    style={[
                      styles.featuredPrice,
                      { color: e.isFree ? Colors.nature.leafGreen : Colors.accent.softGold },
                    ]}
                  >
                    {e.isFree ? 'FREE' : `₹${e.price}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Event card -------------------------------------------------
  const renderEventCard = ({ item: event }: ListRenderItemInfo<Event>) => {
    const { color, icon } = getCategoryStyle(event.category);
    const fillRatio = event.maxAttendees
      ? Math.min(1, event.attendees / event.maxAttendees)
      : 0;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.eventCard}
        onPress={() => openEvent(event)}
      >
        <LinearGradient
          colors={[Colors.background.darkGreen, Colors.background.deepBlack]}
          style={styles.eventCardBg}
        >
          <View style={[styles.eventHeader, { backgroundColor: color + '22' }]}>
            <Text style={styles.eventHeaderIcon}>{icon}</Text>
            <View style={[styles.typeBadge, { backgroundColor: activeTab === 'upcoming' ? Colors.tech.neonBlue : '#9E9E9E' }]}>
              <Text style={styles.typeBadgeText}>
                {activeTab === 'upcoming' ? 'UPCOMING' : 'COMPLETED'}
              </Text>
            </View>
            {event.isFeature && (
              <View style={[styles.featuredChip, { backgroundColor: Colors.accent.softGold }]}>
                <Text style={styles.featuredChipText}>⭐</Text>
              </View>
            )}
          </View>

          <View style={styles.eventBody}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>📅 {event.date}</Text>
              <Text style={styles.metaItem}>⏰ {event.time}</Text>
            </View>
            <Text style={styles.metaItem} numberOfLines={1}>📍 {event.location}</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {event.tags.slice(0, 3).map((t, i) => (
                <View key={i} style={[styles.tag, { borderColor: color }]}>
                  <Text style={[styles.tagText, { color }]}>#{t}</Text>
                </View>
              ))}
            </View>

            {/* Attendee progress */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${fillRatio * 100}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>

            <View style={styles.eventFooter}>
              <Text style={styles.attendeesText}>
                👥 {event.attendees}/{event.maxAttendees}
              </Text>
              <Text
                style={[
                  styles.priceText,
                  {
                    color: event.isFree
                      ? Colors.nature.leafGreen
                      : activeTab === 'past'
                      ? Colors.text.secondary
                      : Colors.accent.softGold,
                  },
                ]}
              >
                {event.isFree ? 'FREE' : `₹${event.price}`}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Empty state ------------------------------------------------
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🌱</Text>
      <Text style={styles.emptyTitle}>No events match your filters</Text>
      <Text style={styles.emptyHint}>
        Try clearing filters or exploring another category.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
        <Text style={styles.emptyButtonText}>Reset filters</Text>
      </TouchableOpacity>
    </View>
  );

  // Skeleton loader --------------------------------------------
  const renderSkeleton = () => (
    <View style={{ paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 12 }}>
      {[1, 2, 3].map((n) => (
        <View key={n} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '40%' }]} />
        </View>
      ))}
    </View>
  );

  // Event detail modal ----------------------------------------
  const renderEventModal = () => {
    if (!selectedEvent) return null;
    const { color, icon } = getCategoryStyle(selectedEvent.category);
    const fillRatio = selectedEvent.maxAttendees
      ? Math.min(1, selectedEvent.attendees / selectedEvent.maxAttendees)
      : 0;
    return (
      <Modal
        visible={showEventModal}
        transparent
        animationType="fade"
        onRequestClose={closeEvent}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.background.darkGreen, Colors.background.deepBlack]}
              style={styles.modalGradient}
            >
              <TouchableOpacity
                onPress={closeEvent}
                style={styles.modalClose}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT * 0.82 }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={[styles.modalHero, { backgroundColor: color + '22' }]}>
                  <Text style={styles.modalHeroIcon}>{icon}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          selectedEvent.type === 'upcoming'
                            ? Colors.tech.neonBlue
                            : '#9E9E9E',
                        position: 'absolute',
                        top: 16,
                        right: 16,
                      },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {selectedEvent.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <View style={styles.modalMetaGroup}>
                  <Text style={styles.modalMeta}>📅 {selectedEvent.date}</Text>
                  <Text style={styles.modalMeta}>⏰ {selectedEvent.time}</Text>
                  <Text style={styles.modalMeta}>📍 {selectedEvent.location}</Text>
                  <Text style={styles.modalMeta}>🏷️ {selectedEvent.category}</Text>
                  <Text style={styles.modalMeta}>👤 {selectedEvent.organizer}</Text>
                </View>

                <Text style={styles.modalSectionTitle}>About this event</Text>
                <Text style={styles.modalDescription}>
                  {selectedEvent.description}
                </Text>

                {/* Progress */}
                <View style={styles.modalAttendeesRow}>
                  <Text style={styles.modalMeta}>
                    👥 {selectedEvent.attendees}/{selectedEvent.maxAttendees} attendees
                  </Text>
                  <Text
                    style={[
                      styles.modalPrice,
                      {
                        color: selectedEvent.isFree
                          ? Colors.nature.leafGreen
                          : Colors.accent.softGold,
                      },
                    ]}
                  >
                    {selectedEvent.isFree ? 'FREE' : `₹${selectedEvent.price}`}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${fillRatio * 100}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.modalSectionTitle}>Tags</Text>
                <View style={styles.tagsRow}>
                  {selectedEvent.tags.map((t, i) => (
                    <View key={i} style={[styles.tag, { borderColor: color }]}>
                      <Text style={[styles.tagText, { color }]}>#{t}</Text>
                    </View>
                  ))}
                </View>

                {/* Action buttons */}
                <View style={styles.modalActions}>
                  {selectedEvent.type === 'upcoming' && (
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: color }]}
                      activeOpacity={0.85}
                      onPress={() => handleRegister(selectedEvent)}
                    >
                      <Text style={styles.primaryButtonText}>Register</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.85}
                    onPress={() => handleShare(selectedEvent)}
                  >
                    <Text style={styles.secondaryButtonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.85}
                    onPress={() => handleAddToCalendar(selectedEvent)}
                  >
                    <Text style={styles.secondaryButtonText}>Calendar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.85}
                    onPress={() => handleOpenMap(selectedEvent)}
                  >
                    <Text style={styles.secondaryButtonText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.85}
                    onPress={() => handleContact(selectedEvent)}
                  >
                    <Text style={styles.secondaryButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // Sort menu --------------------------------------------------
  const renderSortMenu = () => (
    <Modal
      visible={showSortMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <TouchableOpacity
        style={styles.sortOverlay}
        activeOpacity={1}
        onPress={() => setShowSortMenu(false)}
      >
        <View style={styles.sortSheet}>
          <Text style={styles.sortTitle}>Sort by</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortKey === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={styles.sortOption}
                onPress={() => {
                  setSortKey(opt.key);
                  setShowSortMenu(false);
                }}
              >
                <Text style={styles.sortIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.sortLabel,
                    active && { color: Colors.tech.neonBlue, fontWeight: '700' },
                  ]}
                >
                  {opt.label}
                </Text>
                {active && <Text style={styles.sortCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.deepBlack}
        translucent
      />
      <Animated.View style={{ flex: 1, opacity: listAnim }}>
        <FlatList
          data={loading ? [] : filteredEvents}
          keyExtractor={(e) => e.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderCategories()}
              {renderNestedTabs()}
              {renderFeaturedCarousel()}
              <View style={styles.listIntro}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'upcoming' ? '🚀 Upcoming' : '🗂️ Past'}
                </Text>
                <Text style={styles.sectionHint}>
                  {filteredEvents.length} results
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={loading ? renderSkeleton() : renderEmptyState()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.tech.neonBlue}
              colors={[Colors.tech.neonBlue]}
              progressBackgroundColor={Colors.background.darkGreen}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          windowSize={9}
          maxToRenderPerBatch={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Animated.View>

      {renderEventModal()}
      {renderSortMenu()}

      {loading && (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.tech.neonBlue} />
        </View>
      )}
    </SafeAreaView>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
  listContent: {
    paddingBottom: 120,
  },

  // Header
  headerContainer: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tech.neonBlue + '22',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  overline: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mainTitle: {
    color: Colors.text.primary,
    fontSize: IS_SMALL ? 28 : 34,
    fontWeight: '800',
    marginTop: 2,
  },
  subTitle: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  sortButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.tech.neonBlue + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonText: {
    color: Colors.tech.neonBlue,
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statValue: {
    color: Colors.tech.neonBlue,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: 10,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 14,
    height: 46,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
  },
  clearIcon: {
    color: Colors.text.secondary,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '44',
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.tech.neonBlue + '22',
    borderColor: Colors.tech.neonBlue,
  },
  filterText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  filterChipMuted: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: Colors.text.muted,
  },
  filterTextMuted: {
    color: Colors.text.secondary,
    fontSize: 12,
  },

  // Categories
  categoryContainer: { marginTop: 4 },
  categoryScroll: { paddingHorizontal: HORIZONTAL_PADDING, paddingVertical: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    marginRight: 8,
  },
  categoryIcon: { fontSize: 14, marginRight: 6 },
  categoryName: { fontSize: 12, fontWeight: '600' },

  // Nested tabs
  nestedTabsContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 10,
  },
  nestedTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 14,
    padding: 4,
  },
  nestedTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  nestedTabActive: {
    backgroundColor: Colors.tech.neonBlue + '22',
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue,
  },
  nestedTabIcon: { fontSize: 14, marginRight: 6 },
  nestedTabText: {
    color: Colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  nestedTabTextActive: {
    color: Colors.tech.neonBlue,
  },

  // List intro
  listIntro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHint: {
    color: Colors.text.tertiary,
    fontSize: 12,
  },

  // Featured
  featuredContainer: { marginTop: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 10,
  },
  featuredScroll: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.8,
    marginRight: 16,
    borderRadius: CARD_RADIUS,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  featuredGradient: {
    padding: 18,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.accent.softGold,
  },
  featuredBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredIcon: { fontSize: 28, marginTop: 8 },
  featuredTitle: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  featuredMeta: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },

  // Event card
  eventCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 14,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '33',
  },
  eventCardBg: {
    padding: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eventHeaderIcon: { fontSize: 26 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  featuredChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredChipText: { fontSize: 12 },
  eventBody: {
    padding: 14,
  },
  eventTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metaItem: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginBottom: 2,
  },
  eventDescription: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  attendeesText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    color: Colors.text.tertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.tech.neonBlue + '22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue,
  },
  emptyButtonText: {
    color: Colors.tech.neonBlue,
    fontSize: 13,
    fontWeight: '700',
  },

  // Skeleton
  skeletonCard: {
    backgroundColor: Colors.background.darkGreen,
    marginBottom: 14,
    borderRadius: CARD_RADIUS,
    padding: 14,
  },
  skeletonHeader: {
    height: 40,
    backgroundColor: Colors.text.muted + '22',
    borderRadius: 10,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: Colors.text.muted + '22',
    borderRadius: 6,
    width: '80%',
    marginBottom: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '44',
  },
  modalGradient: {},
  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background.deepBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalHero: {
    height: 140,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalHeroIcon: { fontSize: 56 },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  modalMetaGroup: { marginBottom: 10 },
  modalMeta: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginBottom: 4,
  },
  modalSectionTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  modalDescription: {
    color: Colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  modalAttendeesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    flexBasis: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: Colors.background.deepBlack,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    flexBasis: '48%',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.background.darkGreen,
    borderWidth: 1,
    borderColor: Colors.tech.neonBlue + '44',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: Colors.tech.neonBlue,
    fontSize: 13,
    fontWeight: '700',
  },

  // Sort
  sortOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sortSheet: {
    backgroundColor: Colors.background.darkGreen,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 30,
  },
  sortTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.text.muted + '33',
  },
  sortIcon: { fontSize: 16, marginRight: 10 },
  sortLabel: {
    color: Colors.text.primary,
    fontSize: 14,
    flex: 1,
  },
  sortCheck: { color: Colors.tech.neonBlue, fontSize: 14, fontWeight: '800' },

  // Loader overlay
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

export default EventsScreen;
