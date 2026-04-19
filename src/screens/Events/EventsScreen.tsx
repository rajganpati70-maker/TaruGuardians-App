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
// TICKET TIERS
// =====================================================

interface TicketTier {
  id: string;
  name: string;
  priceLabel: string;
  includes: string[];
  color: string;
  emoji: string;
  badge?: string;
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: 't-member',
    name: 'Member',
    priceLabel: 'Free',
    includes: [
      'Entry to all 4 days',
      'Breakfast + lunch on each day',
      'Merch pack · tote + sticker set',
      'Priority seating at main stage',
    ],
    color: '#22C55E',
    emoji: '🌱',
    badge: 'For club members only',
  },
  {
    id: 't-student',
    name: 'Student',
    priceLabel: '₹199',
    includes: [
      'Entry to all 4 days',
      'Lunch on each day',
      'Merch pack · tote + sticker set',
    ],
    color: '#38BDF8',
    emoji: '🎓',
  },
  {
    id: 't-general',
    name: 'General',
    priceLabel: '₹449',
    includes: [
      'Entry to all 4 days',
      'Lunch on each day',
      'Merch pack · tote only',
      'Access to workshops (first-come)',
    ],
    color: '#FBBF24',
    emoji: '🎟️',
  },
  {
    id: 't-patron',
    name: 'Patron',
    priceLabel: '₹2,499',
    includes: [
      'Entry to all 4 days',
      'All meals + snacks',
      'Full merch pack · tee + tote + poster',
      'Priority access to all workshops',
      '30-min mentor 1-on-1 with any wing lead',
      'Named credit in the annual report',
    ],
    color: '#D4AF37',
    emoji: '✨',
    badge: 'Proceeds fund 120 saplings',
  },
];

// =====================================================
// SPEAKERS (Rotating pool for featured events)
// =====================================================

interface Speaker {
  id: string;
  name: string;
  pronouns: string;
  role: string;
  org: string;
  bio: string;
  expertise: string[];
  sessions: string[];
  color: string;
  avatarEmoji: string;
}

const SPEAKERS: Speaker[] = [
  {
    id: 'sp-1',
    name: 'Dr. Meera Iyer',
    pronouns: 'she/her',
    role: 'Urban Ecologist',
    org: 'IISc, Bengaluru',
    bio: 'Researches urban biodiversity, writes long about slow forests. Believes 60% of city tree programs over-plant, under-maintain.',
    expertise: ['Urban forestry', 'Native species', 'Biodiversity audits'],
    sessions: ['Keynote: Why your city tree will die', 'Panel: Mono-culture vs native'],
    color: '#22C55E',
    avatarEmoji: '🌳',
  },
  {
    id: 'sp-2',
    name: 'Rohan Desai',
    pronouns: 'he/him',
    role: 'Staff Engineer',
    org: 'Razorpay',
    bio: 'Ex-Amazon, ex-Freshworks. Writes on on-call culture. Soft-spoken. Hates dashboards nobody reads.',
    expertise: ['Distributed systems', 'On-call', 'Team scaling'],
    sessions: ['Workshop: Small PR culture', 'Fireside: Burnout that nobody admits'],
    color: '#38BDF8',
    avatarEmoji: '👨‍💻',
  },
  {
    id: 'sp-3',
    name: 'Anaya Kapoor',
    pronouns: 'she/her',
    role: 'Founder + Designer',
    org: 'Pine Studio',
    bio: 'Identity work for 30+ climate-focused orgs. Runs design-with-constraints workshops in 7 cities.',
    expertise: ['Brand identity', 'Type design', 'Sustainability comms'],
    sessions: ['Workshop: Logos under constraint', 'Critique: Poster walk'],
    color: '#F472B6',
    avatarEmoji: '🎨',
  },
  {
    id: 'sp-4',
    name: 'Kabir Menon',
    pronouns: 'he/him',
    role: 'Documentary Cinematographer',
    org: 'Independent',
    bio: 'Shot 4 nature docs across the Western Ghats. No colour grading bravado. Honest light, honest cuts.',
    expertise: ['Documentary', 'Wildlife', 'Colour'],
    sessions: ['Workshop: 1-hour doc ethics', 'Screening: Forgotten rivers (9 min)'],
    color: '#EF4444',
    avatarEmoji: '🎬',
  },
  {
    id: 'sp-5',
    name: 'Zoya Khan',
    pronouns: 'she/her',
    role: 'Content + Newsletter',
    org: 'Reading Rainforest',
    bio: 'Runs a 14k-subscriber newsletter on slow reading. Anti-thread. Pro-footnote.',
    expertise: ['Longform', 'Newsletters', 'Editorial ethics'],
    sessions: ['Workshop: Writing for 30 seconds', 'Panel: Why threads are noise'],
    color: '#F59E0B',
    avatarEmoji: '✍️',
  },
  {
    id: 'sp-6',
    name: 'Vikram Rao',
    pronouns: 'he/him',
    role: 'Head of Community',
    org: 'Koo',
    bio: 'Turns online communities into offline trust. Moderation nerd. Safety-first ethos.',
    expertise: ['Community', 'Moderation', 'Trust & safety'],
    sessions: ['Panel: Drama-free Discords', 'Workshop: Moderation playbooks'],
    color: '#06B6D4',
    avatarEmoji: '🤝',
  },
  {
    id: 'sp-7',
    name: 'Ritika Banerjee',
    pronouns: 'she/her',
    role: 'Wildlife Photographer',
    org: 'National Geographic (contributor)',
    bio: 'Slow photographer. Waits days for one frame. Mentored 40+ young photographers.',
    expertise: ['Wildlife', 'Long telephoto', 'Patience'],
    sessions: ['Workshop: Waiting is a skill', 'Portfolio review'],
    color: '#FBBF24',
    avatarEmoji: '📸',
  },
  {
    id: 'sp-8',
    name: 'Aditya Krishnan',
    pronouns: 'he/him',
    role: 'Hydrology Researcher',
    org: 'ATREE',
    bio: 'Water tables, aquifers, boring numbers that matter. Writes science for 16-year-olds.',
    expertise: ['Hydrology', 'Groundwater', 'Policy'],
    sessions: ['Panel: Cities vs aquifers', 'Talk: The long slow well'],
    color: '#3B82F6',
    avatarEmoji: '💧',
  },
  {
    id: 'sp-9',
    name: 'Faiza Siddiqui',
    pronouns: 'she/her',
    role: 'Product Manager',
    org: 'Zerodha',
    bio: 'Built 3 products. Killed 2. Talks openly about killed products — more useful than shipped ones.',
    expertise: ['Product', 'Prioritisation', 'Killing features'],
    sessions: ['Fireside: The ones that didn\'t ship', 'AMA'],
    color: '#A78BFA',
    avatarEmoji: '🧭',
  },
  {
    id: 'sp-10',
    name: 'Sameer Talreja',
    pronouns: 'he/him',
    role: 'Policy Fellow',
    org: 'CPR',
    bio: 'Writes about urban policy without footnotes for every claim, but checks every footnote you cite.',
    expertise: ['Policy', 'Urban', 'Research'],
    sessions: ['Talk: Policy for builders', 'Roundtable: City & code'],
    color: '#10B981',
    avatarEmoji: '📜',
  },
  {
    id: 'sp-11',
    name: 'Tara Gill',
    pronouns: 'they/them',
    role: 'Motion Designer',
    org: 'Independent',
    bio: 'Animates slow, intentional loops. 12-frame obsessive. Has the best sticker collection in the club network.',
    expertise: ['Motion', 'Looping', 'Stickers'],
    sessions: ['Workshop: 12-frame loops', 'Sticker swap'],
    color: '#EC4899',
    avatarEmoji: '🔁',
  },
  {
    id: 'sp-12',
    name: 'Ankit Phadke',
    pronouns: 'he/him',
    role: 'Sponsor Relations',
    org: 'Flipkart',
    bio: 'Corporate side of partnerships. Has said NO to 80% of requests — shares the framework publicly.',
    expertise: ['Sponsorship', 'Negotiation', 'NGO partnerships'],
    sessions: ['Fireside: How sponsors actually think'],
    color: '#0EA5E9',
    avatarEmoji: '🧩',
  },
];

// =====================================================
// SPONSORS (3 tiers)
// =====================================================

interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'community';
  tagline: string;
  contribution: string;
  since: string;
  color: string;
  emoji: string;
}

const SPONSORS: Sponsor[] = [
  { id: 's-1', name: 'Leafline Labs', tier: 'platinum', tagline: 'Software for slow forests.', contribution: '₹6L + 60 laptops on loan', since: '2023', color: '#22C55E', emoji: '🌿' },
  { id: 's-2', name: 'Saplings Co.', tier: 'platinum', tagline: 'Native species nursery.', contribution: '12,000 saplings donated', since: '2023', color: '#4ADE80', emoji: '🌳' },
  { id: 's-3', name: 'Paper-or-not', tier: 'gold', tagline: 'Honest stationery, compostable pens.', contribution: '₹2L + 4000 notebooks', since: '2024', color: '#F59E0B', emoji: '📒' },
  { id: 's-4', name: 'BrewCity Coffee', tier: 'gold', tagline: 'Fair-trade roastery.', contribution: '60 kg coffee / semester', since: '2024', color: '#B45309', emoji: '☕' },
  { id: 's-5', name: 'Northwind Studios', tier: 'gold', tagline: 'Motion for causes.', contribution: '6 videos / year free', since: '2025', color: '#0EA5E9', emoji: '🎞️' },
  { id: 's-6', name: 'Radha Press', tier: 'community', tagline: 'Campus printer, 40 years.', contribution: 'Free printing for zines', since: '2022', color: '#EF4444', emoji: '📰' },
  { id: 's-7', name: 'Stillwater Photography', tier: 'community', tagline: 'Slow prints. Archival inks.', contribution: 'Portrait prints at cost', since: '2024', color: '#FBBF24', emoji: '📷' },
  { id: 's-8', name: 'Sundar Vans', tier: 'community', tagline: 'Campus transport co-op.', contribution: 'Plantation drive transport', since: '2023', color: '#8B5CF6', emoji: '🚐' },
];

// =====================================================
// VENUES (3 primary + overflow)
// =====================================================

interface Venue {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'hybrid';
  capacity: number;
  address: string;
  amenities: string[];
  accessibility: string[];
  nearestTransit: string;
  color: string;
  emoji: string;
}

const VENUES: Venue[] = [
  {
    id: 'v-1',
    name: 'Taru Hall (Auditorium)',
    type: 'indoor',
    capacity: 420,
    address: 'Main Campus, Block C · Building 2',
    amenities: ['Stage + lighting', 'Mic + PA', 'Projector 4K', 'Livestream rig', 'AC', 'Water refill stations'],
    accessibility: ['Ramp access', 'Wheelchair seating (8 slots)', 'Sign-language interpreter on request', 'Hearing loop'],
    nearestTransit: 'Bus stop #48 · 4 min walk',
    color: '#38BDF8',
    emoji: '🏛️',
  },
  {
    id: 'v-2',
    name: 'The Grove (Outdoor)',
    type: 'outdoor',
    capacity: 250,
    address: 'North Lawn · West of Block A',
    amenities: ['Shade canopies', 'Mobile PA', 'Portable stage', 'Composting toilets (2)', 'Water refill', 'Picnic seating'],
    accessibility: ['Paved path', 'Wheelchair seating (6 slots)', 'Reserved shaded area'],
    nearestTransit: 'Campus metro · 6 min walk',
    color: '#22C55E',
    emoji: '🌲',
  },
  {
    id: 'v-3',
    name: 'Studio 6 (Workshop Room)',
    type: 'indoor',
    capacity: 48,
    address: 'Block F · Floor 3',
    amenities: ['U-shape tables', 'Whiteboards', '24 monitors', 'Projector', 'Quiet corner'],
    accessibility: ['Elevator access', 'Adjustable-height tables (4)', 'Low-sensory room next door'],
    nearestTransit: 'Bus stop #12 · 2 min walk',
    color: '#A78BFA',
    emoji: '🧑‍🏫',
  },
  {
    id: 'v-4',
    name: 'Riverside Terrace',
    type: 'hybrid',
    capacity: 120,
    address: 'East Campus · River Walk',
    amenities: ['Indoor + covered outdoor', 'Mobile PA', 'String lights', 'Food stalls', 'Water station'],
    accessibility: ['Level walkway from east gate', 'Wheelchair seating (4 slots)', 'Stroller access'],
    nearestTransit: 'East Gate stop · 3 min walk',
    color: '#FBBF24',
    emoji: '🌅',
  },
];

// =====================================================
// FAQ (15 Q&As)
// =====================================================

interface EventFaq {
  id: string;
  q: string;
  a: string;
}

const EVENT_FAQS: EventFaq[] = [
  { id: 'f-1', q: 'Do I need to be a club member to attend?', a: 'No. Most events are open — check each event\'s "Who can attend" line. Member-only events will say so clearly.' },
  { id: 'f-2', q: 'How do I register?', a: 'Tap the event, then Register. You\'ll get a QR code on email + in-app. Show it at entry.' },
  { id: 'f-3', q: 'Can I bring a friend?', a: 'Yes — most events allow +1 with a short note in your registration. Some workshops have hard caps.' },
  { id: 'f-4', q: 'What\'s the refund policy?', a: 'Full refund up to 48 hours before the event. 50% refund between 48 and 24 hours. No refund inside 24 hours, but you can transfer your ticket.' },
  { id: 'f-5', q: 'Are meals provided?', a: 'For full-day events, yes — vegetarian by default, vegan on request, with a clearly labelled allergen card.' },
  { id: 'f-6', q: 'Is the venue accessible?', a: 'All 4 venues have paved/ramp access, reserved wheelchair seating and accessible restrooms. Ask us anything — we\'ll also arrange interpreters or low-sensory rooms.' },
  { id: 'f-7', q: 'Do you record talks?', a: 'Recorded with speaker consent. Published on the club\'s YouTube 7 days after the event. Workshops are usually not recorded.' },
  { id: 'f-8', q: 'Can I speak at an event?', a: 'Yes — submit via the Suggestion tab → "Propose a session". We reply in 3 working days.' },
  { id: 'f-9', q: 'Are events free?', a: 'Most are free for members. Larger fests (e.g. Taru Fest) have student / general / patron tiers — all proceeds fund saplings.' },
  { id: 'f-10', q: 'What if it rains?', a: 'Outdoor events move indoors if there\'s a yellow alert or higher. You\'ll get a push + SMS 4 hours before.' },
  { id: 'f-11', q: 'Can I volunteer instead of attending?', a: 'Absolutely — volunteering counts as attendance + you get a patron-tier goodie bag. Sign up under the event page.' },
  { id: 'f-12', q: 'Photography and privacy?', a: 'We photograph all events for the archive. If you don\'t want to be photographed, grab a teal wristband at entry — photographers skip those.' },
  { id: 'f-13', q: 'Children welcome?', a: 'Under-18 welcome with a guardian. Most workshops have a 12+ age recommendation.' },
  { id: 'f-14', q: 'I registered but can\'t come — what now?', a: 'Transfer your ticket to a friend (via the event page). If you can\'t, cancel at least 24 hours out so we can open the slot.' },
  { id: 'f-15', q: 'Who do I contact for special needs?', a: 'Email hello@taruguardians.org at least 72 hours before the event. We read every one.' },
];

// =====================================================
// CODE OF CONDUCT (summary)
// =====================================================

interface ConductPillar {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
}

const CONDUCT_PILLARS: ConductPillar[] = [
  { id: 'c-1', title: 'Respect everyone', body: 'All ages, all genders, all identities, all career stages. The first-year gets the same airtime as the staff engineer.', icon: '🫶', color: '#F472B6' },
  { id: 'c-2', title: 'Share the mic', body: 'If you\'ve spoken twice, wait until everyone who wants to has spoken once. This is a rule, not a vibe.', icon: '🎤', color: '#38BDF8' },
  { id: 'c-3', title: 'No photos without consent', body: 'Teal wristband = no photo. Ask before posting anyone on social.', icon: '📷', color: '#FBBF24' },
  { id: 'c-4', title: 'No self-promotion spam', body: 'Talks are for ideas, not pitch decks. Sponsors have their own slot.', icon: '🚫', color: '#EF4444' },
  { id: 'c-5', title: 'Safe-word: "pause"', body: 'Anyone can call "pause" to stop a session for a moment. No explanation needed.', icon: '⏸️', color: '#22C55E' },
  { id: 'c-6', title: 'Report quietly', body: 'Any concern → DM any wing lead or safety officer. Handled privately, within 24 hours.', icon: '🛡️', color: '#A78BFA' },
];

// =====================================================
// WEEK / MONTH CALENDAR DENSITY
// =====================================================

interface CalendarDay {
  date: string;
  label: string;
  count: number;
  isToday: boolean;
  topEvent?: string;
}

const buildCalendarDays = (count: number, base: Date): CalendarDay[] => {
  const out: CalendarDay[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime());
    d.setDate(base.getDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' }),
      count: (i * 7 + 3) % 5,
      isToday: i === 0,
      topEvent:
        ['Plantation drive', 'AI workshop', 'Newsletter doctor', 'Photo walk', 'Fireside'][
          i % 5
        ],
    });
  }
  return out;
};

const CALENDAR_DAYS: CalendarDay[] = buildCalendarDays(14, new Date());

// =====================================================
// CHAPTERS / CITY HUBS
// =====================================================

interface CityChapter {
  id: string;
  city: string;
  members: number;
  lead: string;
  nextEvent: string;
  color: string;
  emoji: string;
}

const CITY_CHAPTERS: CityChapter[] = [
  { id: 'ch-1', city: 'Bengaluru', members: 84, lead: 'Aarav S.', nextEvent: 'Plantation drive · 28 Jun', color: '#22C55E', emoji: '🌆' },
  { id: 'ch-2', city: 'Hyderabad', members: 42, lead: 'Neha G.', nextEvent: 'Design crit · 30 Jun', color: '#38BDF8', emoji: '🏙️' },
  { id: 'ch-3', city: 'Pune', members: 31, lead: 'Raj M.', nextEvent: 'First-PR Friday · 05 Jul', color: '#FBBF24', emoji: '🌇' },
  { id: 'ch-4', city: 'Delhi', members: 28, lead: 'Tara J.', nextEvent: 'Photo walk · 08 Jul', color: '#F472B6', emoji: '🏘️' },
  { id: 'ch-5', city: 'Mumbai', members: 25, lead: 'Ritika B.', nextEvent: 'Portfolio review · 12 Jul', color: '#A78BFA', emoji: '🌃' },
  { id: 'ch-6', city: 'Chennai', members: 18, lead: 'Aditya K.', nextEvent: 'Community meetup · 15 Jul', color: '#EF4444', emoji: '🏖️' },
];

// =====================================================
// ACCESSIBILITY OPTIONS
// =====================================================

interface AccessibilityOption {
  id: string;
  label: string;
  body: string;
  icon: string;
}

const ACCESSIBILITY_OPTIONS: AccessibilityOption[] = [
  { id: 'a-1', label: 'Wheelchair seating', body: 'Reserved at every venue. Pre-book during registration.', icon: '♿' },
  { id: 'a-2', label: 'Sign-language interpreter', body: 'Available on 72-hour notice for any session.', icon: '🤟' },
  { id: 'a-3', label: 'Live captions', body: 'All main-stage talks. English + Hindi.', icon: '🗣️' },
  { id: 'a-4', label: 'Low-sensory room', body: 'Quiet room next to every venue. No mic, dim lights, optional noise-cancelling headphones.', icon: '🤫' },
  { id: 'a-5', label: 'Large-print handouts', body: 'On request at the registration desk.', icon: '🔍' },
  { id: 'a-6', label: 'Gender-neutral restrooms', body: 'Available at all four main venues.', icon: '🚻' },
];

// -----------------------------------------------------
// Travel & accommodation
// -----------------------------------------------------

interface TravelOption {
  id: string;
  mode: string;
  emoji: string;
  color: string;
  details: string;
  costHint: string;
  eta: string;
}

const TRAVEL_OPTIONS: TravelOption[] = [
  { id: 'tv-1', mode: 'Campus shuttle',       emoji: '🚌', color: '#22C55E', details: 'Free club shuttle from main gate to venue · every 20 min.', costHint: 'Free', eta: '12 min' },
  { id: 'tv-2', mode: 'Metro · Purple line',  emoji: '🚇', color: '#A78BFA', details: 'Get off at Saplings Station · 4 min walk · step-free exit.', costHint: '₹20–₹40', eta: '18 min' },
  { id: 'tv-3', mode: 'City bus · 206',       emoji: '🚏', color: '#38BDF8', details: 'Bus 206 stops right outside Gate 4 · avoid 8–10am crush.',    costHint: '₹10',    eta: '26 min' },
  { id: 'tv-4', mode: 'Cycle lane + parking', emoji: '🚲', color: '#F59E0B', details: 'Protected lane from east campus · 40 guarded cycle racks.',    costHint: 'Free', eta: '14 min' },
  { id: 'tv-5', mode: 'Auto / cab',           emoji: '🛺', color: '#F472B6', details: 'Drop off at Gate 3 · Gate 1 is reserved for accessibility.',   costHint: '₹60–₹120', eta: '9 min' },
  { id: 'tv-6', mode: 'Carpool board',        emoji: '🚗', color: '#6366F1', details: 'Post in #carpool the night before. Drivers post seat counts.',  costHint: 'Split fuel', eta: 'varies' },
];

interface StayOption {
  id: string;
  name: string;
  type: 'hostel' | 'hotel' | 'home-stay';
  emoji: string;
  color: string;
  walk: string;
  perks: string[];
  priceHint: string;
}

const STAY_OPTIONS: StayOption[] = [
  { id: 'st-1', name: 'Neem Guest Hostel',      type: 'hostel',   emoji: '🛏️', color: '#22C55E', walk: '7 min walk',  perks: ['Dorm beds', 'Shared kitchen', 'Cycle rentals'],     priceHint: '₹450–₹900/night' },
  { id: 'st-2', name: 'Banyan Homestay Circle', type: 'home-stay', emoji: '🏠', color: '#F59E0B', walk: '15 min cab',  perks: ['Alumni hosts', 'Home-cooked meals', 'Laundry'],     priceHint: '₹800–₹1,600/night' },
  { id: 'st-3', name: 'Canopy Boutique Hotel',  type: 'hotel',    emoji: '🏨', color: '#A78BFA', walk: '10 min walk', perks: ['Quiet workspace', 'Shuttle to venue', '24×7 desk'], priceHint: '₹2,200–₹4,500/night' },
  { id: 'st-4', name: 'Sapling Hostel (budget)', type: 'hostel',  emoji: '🛌', color: '#38BDF8', walk: '20 min bus',  perks: ['Bunk beds', 'Free Wi-Fi', 'Common lounge'],          priceHint: '₹350–₹700/night' },
];

// -----------------------------------------------------
// Past-event recaps
// -----------------------------------------------------

interface EventRecap {
  id: string;
  title: string;
  date: string;
  emoji: string;
  color: string;
  attended: number;
  signups: number;
  highlight: string;
  metrics: { label: string; value: string }[];
  quote: string;
  quoteAuthor: string;
}

const EVENT_RECAPS: EventRecap[] = [
  {
    id: 'er-1',
    title: 'Sapling Hack · Spring',
    date: 'Mar 14, 2026',
    emoji: '🌱',
    color: '#22C55E',
    attended: 412,
    signups: 540,
    highlight: '24 teams · 16 demos · 3 field pilots greenlit for Q3.',
    metrics: [
      { label: 'Saplings planted on day 2', value: '320' },
      { label: 'E-waste collected', value: '88 kg' },
      { label: 'Mentor hours logged', value: '168 hrs' },
    ],
    quote: 'I came in knowing nothing about RN. I left with a merged PR and a mentor.',
    quoteAuthor: 'Riya G. · first-year',
  },
  {
    id: 'er-2',
    title: 'Campus Cleanup Drive',
    date: 'Feb 22, 2026',
    emoji: '♻️',
    color: '#38BDF8',
    attended: 188,
    signups: 240,
    highlight: '4 zones swept · 214 kg waste segregated · 28 bags composted on-site.',
    metrics: [
      { label: 'Volunteers', value: '188' },
      { label: 'Recyclables sent to MRF', value: '126 kg' },
      { label: 'Compost started', value: '4 bins' },
    ],
    quote: 'We thought the south lawn was clean. It absolutely was not. Now it actually is.',
    quoteAuthor: 'Arjun K. · ops lead',
  },
  {
    id: 'er-3',
    title: 'Design Critique Night',
    date: 'Jan 18, 2026',
    emoji: '🎨',
    color: '#F472B6',
    attended: 94,
    signups: 110,
    highlight: '11 portfolios reviewed · 3 speaker invites · 1 full internship lead.',
    metrics: [
      { label: 'Portfolios reviewed', value: '11' },
      { label: 'First-time presenters', value: '7' },
      { label: 'Mentors on panel', value: '6' },
    ],
    quote: 'Three drafts in, my posters stopped looking like homework.',
    quoteAuthor: 'Neha P. · poster designer',
  },
  {
    id: 'er-4',
    title: 'Alumni Fireside · Climate',
    date: 'Dec 09, 2025',
    emoji: '🔥',
    color: '#F59E0B',
    attended: 156,
    signups: 210,
    highlight: '3 alumni · 90 min · 11 students connected to mentors post-session.',
    metrics: [
      { label: 'Alumni speakers', value: '3' },
      { label: 'Questions from floor', value: '38' },
      { label: 'Follow-up intros', value: '11' },
    ],
    quote: 'The honesty about failed launches is the part I needed most.',
    quoteAuthor: 'Aditi S. · prefinal',
  },
];

// -----------------------------------------------------
// Volunteer roles
// -----------------------------------------------------

interface VolunteerRole {
  id: string;
  name: string;
  emoji: string;
  color: string;
  spots: number;
  filled: number;
  time: string;
  responsibilities: string[];
}

const VOLUNTEER_ROLES: VolunteerRole[] = [
  { id: 'vr-1', name: 'Registration desk',     emoji: '📋', color: '#38BDF8', spots: 12, filled: 8,  time: 'Day-1 · 07:30–11:00', responsibilities: ['Check-in flow', 'Badge handouts', 'Welcome newcomers'] },
  { id: 'vr-2', name: 'Floor ops',             emoji: '📣', color: '#F59E0B', spots: 14, filled: 10, time: 'All-day · rotations', responsibilities: ['Crowd flow', 'Signage', 'Runner tasks'] },
  { id: 'vr-3', name: 'AV · main stage',       emoji: '🎚️', color: '#A78BFA', spots: 6,  filled: 4,  time: 'Tech rehearsal + live', responsibilities: ['Mic runs', 'Slides cue', 'Live-stream ops'] },
  { id: 'vr-4', name: 'Hospitality',           emoji: '☕', color: '#22C55E', spots: 10, filled: 7,  time: 'Breaks + lunch',       responsibilities: ['Refreshments', 'Speaker care', 'Vendor coord'] },
  { id: 'vr-5', name: 'Photography',           emoji: '📷', color: '#F472B6', spots: 5,  filled: 3,  time: 'All-day',              responsibilities: ['Consent badges', 'Shot-list', 'Dropbox uploads'] },
  { id: 'vr-6', name: 'Accessibility buddy',   emoji: '🤝', color: '#6366F1', spots: 6,  filled: 2,  time: 'All-day',              responsibilities: ['Wheelchair assistance', 'Low-sensory escorts', 'On-call help'] },
  { id: 'vr-7', name: 'Sustainability crew',   emoji: '🌿', color: '#16A34A', spots: 8,  filled: 5,  time: 'All-day',              responsibilities: ['Waste segregation', 'Compost bins', 'Zero-waste badges'] },
  { id: 'vr-8', name: 'Night shift · venue',   emoji: '🌙', color: '#0EA5E9', spots: 4,  filled: 2,  time: '22:00–06:00',          responsibilities: ['Overnight reset', 'Stock count', 'Morning handover'] },
];

// -----------------------------------------------------
// Live-stream & recording
// -----------------------------------------------------

interface StreamDetail {
  id: string;
  track: string;
  where: string;
  time: string;
  platform: string;
  caption: boolean;
  recording: boolean;
  color: string;
}

const STREAM_DETAILS: StreamDetail[] = [
  { id: 'sd-1', track: 'Main stage',       where: 'Lawn Amphitheatre',     time: '10:00–18:00 IST', platform: 'YouTube Live + website', caption: true,  recording: true,  color: '#22C55E' },
  { id: 'sd-2', track: 'Hacker track',     where: 'Seminar Hall 2',        time: '11:00–20:00 IST', platform: 'YouTube Live',           caption: true,  recording: true,  color: '#38BDF8' },
  { id: 'sd-3', track: 'Design lab',       where: 'Studio B (basement)',   time: '12:00–16:00 IST', platform: 'Twitch + replay link',   caption: false, recording: true,  color: '#F472B6' },
  { id: 'sd-4', track: 'Alumni fireside',  where: 'Heritage Library',      time: '18:00–20:00 IST', platform: 'YouTube Live',           caption: true,  recording: false, color: '#F59E0B' },
];

// -----------------------------------------------------
// Photo / video consent
// -----------------------------------------------------

interface ConsentRule {
  id: string;
  tone: 'good' | 'ask' | 'never';
  emoji: string;
  title: string;
  body: string;
}

const CONSENT_RULES: ConsentRule[] = [
  { id: 'cr-1', tone: 'good',  emoji: '🟢', title: 'Green badge = yes',        body: 'Fine to photograph, post, tag. Candid shots welcome.' },
  { id: 'cr-2', tone: 'ask',   emoji: '🟡', title: 'Yellow badge = ask first', body: 'Please ask verbally before any photo or video. We will remind you.' },
  { id: 'cr-3', tone: 'never', emoji: '🔴', title: 'Red badge = no',           body: 'Never photograph or film. Respect it quietly. No exceptions.' },
  { id: 'cr-4', tone: 'good',  emoji: '🟦', title: 'Kids on site',             body: 'Guardians must sign the kids-photo waiver at the registration desk.' },
  { id: 'cr-5', tone: 'ask',   emoji: '🟣', title: 'Takedown requests',        body: 'Email hello@taruguardians.org · we honour within 48 hours. Always.' },
];

// =====================================================
// Food vendors (on-site F&B)
// =====================================================

interface FoodVendor {
  id: string;
  name: string;
  cuisine: string;
  veg: 'full-veg' | 'veg + non-veg' | 'vegan-friendly';
  priceBand: '₹'| '₹₹' | '₹₹₹';
  hours: string;
  dietary: string[];
  contact: string;
  highlight: string;
  emoji: string;
  color: string;
}

const FOOD_VENDORS: FoodVendor[] = [
  { id: 'fv-1', name: 'Anandi\'s Thali',          cuisine: 'Gujarati thali',          veg: 'full-veg',        priceBand: '₹₹',   hours: '11:00 – 22:00', dietary: ['gluten-free options', 'jain on request'],          contact: '+91 98XXX 11002', highlight: 'Unlimited roti + 8 fresh sides · the default lunch for the whole team.',     emoji: '🍽️', color: '#F59E0B' },
  { id: 'fv-2', name: 'Ghar Ki Chai',              cuisine: 'Chai + snacks',           veg: 'full-veg',        priceBand: '₹',    hours: '07:00 – 23:00', dietary: ['dairy', 'sugar-free chai on ask'],                     contact: '+91 98XXX 11003', highlight: 'Adrak chai + kanda bhaji · the morning handshake.',                             emoji: '🍵', color: '#EA580C' },
  { id: 'fv-3', name: 'Sprout Bowl',                cuisine: 'Salads + grain bowls',    veg: 'vegan-friendly',  priceBand: '₹₹',   hours: '10:00 – 21:00', dietary: ['vegan', 'nut-free', 'low-oil'],                         contact: '+91 98XXX 11004', highlight: 'A proper clean lunch · grain + greens + protein · zero drama.',                   emoji: '🥗', color: '#22C55E' },
  { id: 'fv-4', name: 'Kulcha Works',                cuisine: 'Amritsari kulcha',        veg: 'veg + non-veg',   priceBand: '₹₹',   hours: '12:00 – 23:00', dietary: ['egg', 'chicken', 'mutton'],                              contact: '+91 98XXX 11005', highlight: 'Tandoor on-site · the after-session comfort food.',                               emoji: '🫓', color: '#B45309' },
  { id: 'fv-5', name: 'Forest Floor Coffee',         cuisine: 'Specialty coffee',        veg: 'full-veg',        priceBand: '₹₹₹',  hours: '08:00 – 22:00', dietary: ['oat milk', 'almond milk', 'decaf'],                      contact: '+91 98XXX 11006', highlight: 'Filter · pour-over · flat white · the caffeine HQ for the edit team.',           emoji: '☕', color: '#92400E' },
  { id: 'fv-6', name: 'Puran Poli Akka',             cuisine: 'Maharashtrian sweets',    veg: 'full-veg',        priceBand: '₹₹',   hours: '11:00 – 20:00', dietary: ['traditional ghee', 'jaggery'],                            contact: '+91 98XXX 11007', highlight: 'The Friday dessert · hot puran poli with a slick of ghee.',                       emoji: '🍯', color: '#D97706' },
  { id: 'fv-7', name: 'South Tide',                   cuisine: 'South Indian tiffin',     veg: 'full-veg',        priceBand: '₹₹',   hours: '07:00 – 22:00', dietary: ['gluten-free by default', 'dairy'],                        contact: '+91 98XXX 11008', highlight: 'Podi idli + ghee sambhar · it has kept morale afloat for three workshops.',       emoji: '🥘', color: '#0891B2' },
  { id: 'fv-8', name: 'The Fruit Cart',               cuisine: 'Fresh fruit + shakes',    veg: 'full-veg',        priceBand: '₹',    hours: '09:00 – 21:00', dietary: ['low-sugar', 'no-ice on request'],                         contact: '+91 98XXX 11009', highlight: 'Cut-fruit plates + shakes · the quick between-sessions snack.',                   emoji: '🥭', color: '#F97316' },
  { id: 'fv-9', name: 'Baker\'s Bench',              cuisine: 'Breads + sandwiches',     veg: 'veg + non-veg',   priceBand: '₹₹',   hours: '10:00 – 21:00', dietary: ['sourdough', 'grilled chicken', 'eggless cakes'],          contact: '+91 98XXX 11010', highlight: 'Fresh sourdough + cold-cut sandwiches · the pack-and-go lunch.',                 emoji: '🥪', color: '#F59E0B' },
  { id: 'fv-10', name: 'Nimbu Soda House',            cuisine: 'Mocktails + sharbat',     veg: 'full-veg',        priceBand: '₹',    hours: '10:00 – 23:00', dietary: ['no-sugar options', 'herbal'],                              contact: '+91 98XXX 11011', highlight: 'Jaljeera · nimbu soda · the 4pm reset button.',                                     emoji: '🥤', color: '#84CC16' },
];

// =====================================================
// Event packing list (what to bring)
// =====================================================

interface PackingItem {
  id: string;
  name: string;
  why: string;
  mustHave: boolean;
  emoji: string;
  category: 'essentials' | 'comfort' | 'tech' | 'climate';
}

const PACKING_LIST: PackingItem[] = [
  { id: 'pk-1',  name: 'Government ID · original',           why: 'Needed at the gate · digital copy is not accepted.',                         mustHave: true,  emoji: '🪪', category: 'essentials' },
  { id: 'pk-2',  name: 'Printed ticket or QR on phone',      why: 'Saves 10 minutes in line · we do accept screenshots.',                         mustHave: true,  emoji: '🎫', category: 'essentials' },
  { id: 'pk-3',  name: 'Refillable water bottle',            why: 'Six refill stations on-site · we avoid single-use plastic end-to-end.',        mustHave: true,  emoji: '💧', category: 'climate' },
  { id: 'pk-4',  name: 'Reusable cloth bag',                 why: 'For handouts + small gear · no plastic bags handed out on-site.',              mustHave: false, emoji: '🛍️', category: 'climate' },
  { id: 'pk-5',  name: 'Warm layer for AC halls',            why: 'Halls run cool · a light shawl or hoodie is enough.',                          mustHave: false, emoji: '🧥', category: 'comfort' },
  { id: 'pk-6',  name: 'Closed-toe shoes',                   why: 'You will walk more than you expect · 6–8km over a full day.',                 mustHave: true,  emoji: '👟', category: 'comfort' },
  { id: 'pk-7',  name: 'Power bank · 10,000mAh+',            why: 'Wall outlets are limited · the volunteer station has a few chargers.',         mustHave: false, emoji: '🔋', category: 'tech' },
  { id: 'pk-8',  name: 'Laptop + charger',                   why: 'Only needed if you are in a hands-on workshop · otherwise leave at home.',      mustHave: false, emoji: '💻', category: 'tech' },
  { id: 'pk-9',  name: 'Notebook + 2 pens',                  why: 'Screens die · a notebook has not once been a bad idea at a workshop.',          mustHave: false, emoji: '📓', category: 'tech' },
  { id: 'pk-10', name: 'Any medication you need',            why: 'A small first-aid table is on-site · we cannot stock personal meds.',           mustHave: true,  emoji: '💊', category: 'essentials' },
  { id: 'pk-11', name: 'Light snack + fruit',                why: 'Between sessions, the cart takes 5-10 min · pack a small snack.',                mustHave: false, emoji: '🍎', category: 'comfort' },
  { id: 'pk-12', name: 'Handkerchief / small towel',         why: 'In peak summer, the walk from gate to hall takes a toll.',                       mustHave: false, emoji: '🧻', category: 'comfort' },
];

// =====================================================
// Parking + transit (detailed)
// =====================================================

interface ParkingLot {
  id: string;
  name: string;
  capacity: number;
  type: 'on-site' | 'satellite' | 'paid-mall';
  walkMinutes: number;
  priceNote: string;
  evChargers: number;
  cycleRacks: number;
  accessible: boolean;
  color: string;
}

const PARKING_LOTS: ParkingLot[] = [
  { id: 'pl-1', name: 'Main gate · block A',            capacity: 320, type: 'on-site',     walkMinutes: 2,  priceNote: 'Free · volunteers only',              evChargers: 6, cycleRacks: 40, accessible: true,  color: '#22C55E' },
  { id: 'pl-2', name: 'Hostel loop · block C',           capacity: 180, type: 'on-site',     walkMinutes: 6,  priceNote: 'Free · full-day pass at the gate',    evChargers: 2, cycleRacks: 24, accessible: true,  color: '#38BDF8' },
  { id: 'pl-3', name: 'Library basement',                capacity: 95,  type: 'on-site',     walkMinutes: 4,  priceNote: 'Free · usually full by 09:30',         evChargers: 0, cycleRacks: 0,  accessible: true,  color: '#A78BFA' },
  { id: 'pl-4', name: 'Brigade Road · satellite',       capacity: 280, type: 'satellite',   walkMinutes: 15, priceNote: '₹40/day · pay at the booth',            evChargers: 4, cycleRacks: 10, accessible: false, color: '#F59E0B' },
  { id: 'pl-5', name: 'MG Road mall · paid',            capacity: 520, type: 'paid-mall',   walkMinutes: 22, priceNote: '₹100/day · validated with receipt',    evChargers: 10, cycleRacks: 0,  accessible: true,  color: '#F472B6' },
  { id: 'pl-6', name: 'Cycle-only racks · north gate',   capacity: 64,  type: 'on-site',     walkMinutes: 3,  priceNote: 'Free · lock required',                   evChargers: 0, cycleRacks: 64, accessible: true,  color: '#14B8A6' },
];

interface TransitRoute {
  id: string;
  mode: 'metro' | 'bus' | 'train' | 'shuttle' | 'auto';
  name: string;
  fromHub: string;
  toVenue: string;
  firstRun: string;
  lastRun: string;
  frequency: string;
  cost: string;
  accessibility: string;
  emoji: string;
  color: string;
}

const TRANSIT_ROUTES: TransitRoute[] = [
  { id: 'tr-1', mode: 'metro',   name: 'Purple Line',           fromHub: 'MG Road Metro',      toVenue: '12-min walk to north gate',    firstRun: '05:30', lastRun: '23:30', frequency: 'Every 7–10 min',  cost: '₹20 – ₹40',   accessibility: 'Lift at MG Road · ramp at venue.',                 emoji: '🚇', color: '#A78BFA' },
  { id: 'tr-2', mode: 'bus',     name: 'KSRTC 356-A',            fromHub: 'Majestic BMTC',      toVenue: 'Stops at main gate',            firstRun: '05:00', lastRun: '23:00', frequency: 'Every 15 min',    cost: '₹18',          accessibility: 'Low-floor on alt. buses · ask the conductor.',      emoji: '🚌', color: '#22C55E' },
  { id: 'tr-3', mode: 'train',   name: 'Local · Yeshwantpur',   fromHub: 'Yeshwantpur Jn',      toVenue: '25-min walk · 10-min auto',     firstRun: '05:45', lastRun: '22:00', frequency: 'Every 45 min',    cost: '₹20 – ₹60',   accessibility: 'Platform ramps · station lifts partial.',           emoji: '🚆', color: '#38BDF8' },
  { id: 'tr-4', mode: 'shuttle', name: 'Event shuttle · Kempegowda', fromHub: 'Kempegowda airport', toVenue: 'Main gate drop-off',             firstRun: '06:30', lastRun: '20:00', frequency: 'Every 30 min',    cost: 'Free with pass',  accessibility: 'Low-floor · pre-book a wheelchair slot in RSVP.',    emoji: '🚐', color: '#F59E0B' },
  { id: 'tr-5', mode: 'shuttle', name: 'City shuttle · Indiranagar', fromHub: 'Indiranagar metro',  toVenue: 'North gate drop-off',             firstRun: '07:30', lastRun: '21:30', frequency: 'Every 45 min',    cost: 'Free with pass',  accessibility: 'Low-floor · full wheelchair access.',                emoji: '🚐', color: '#F472B6' },
  { id: 'tr-6', mode: 'auto',    name: 'Auto-rickshaw',           fromHub: 'Any city hub',        toVenue: 'Main gate / north gate',          firstRun: 'Anytime', lastRun: 'Anytime', frequency: 'Hail or Ola/Uber', cost: '₹80 – ₹260',   accessibility: 'Limited · pick a shuttle for full accessibility.',   emoji: '🛺', color: '#EA580C' },
  { id: 'tr-7', mode: 'metro',   name: 'Green Line',              fromHub: 'Kempegowda interchange', toVenue: '6-min walk + 1 shuttle',         firstRun: '05:30', lastRun: '23:30', frequency: 'Every 6–9 min',   cost: '₹15 – ₹45',   accessibility: 'Full lift + ramp access end-to-end.',                emoji: '🚇', color: '#22C55E' },
];

// =====================================================
// First-aid + medical (on-site)
// =====================================================

interface MedicalStation {
  id: string;
  name: string;
  location: string;
  hours: string;
  capabilities: string[];
  emergencyLink: string;
  escalation: string;
  color: string;
  emoji: string;
}

const MEDICAL_STATIONS: MedicalStation[] = [
  { id: 'ms-1', name: 'Central first-aid tent',     location: 'Main gate · 40m inside',         hours: '07:00 – 23:00', capabilities: ['minor cuts', 'sprains', 'headache', 'dehydration', 'BP check'],         emergencyLink: '+91 80 4000 11', escalation: '5-min ambulance to Sparsh Hospital · MG Road.',           color: '#22C55E', emoji: '⛑️' },
  { id: 'ms-2', name: 'Hall B · side room',          location: 'Hall B · west wing',              hours: '09:00 – 20:00', capabilities: ['anxiety support', 'quiet room', 'low-light + fan', 'water + ORS'],         emergencyLink: '+91 80 4000 12', escalation: 'Linked to main tent · medic-on-call.',                   color: '#38BDF8', emoji: '🩹' },
  { id: 'ms-3', name: 'North gate · ambulance',      location: 'North gate · parking B',          hours: '08:00 – 22:00', capabilities: ['full ambulance', 'defibrillator', 'IV', 'oxygen'],                           emergencyLink: '+91 80 4000 13', escalation: 'Direct transit to Sparsh · 4 min.',                       color: '#EF4444', emoji: '🚑' },
  { id: 'ms-4', name: 'Food court · medic pair',     location: 'Food court · centre',             hours: '11:00 – 21:00', capabilities: ['allergies', 'food poisoning', 'oral meds', 'minor burns'],                  emergencyLink: '+91 80 4000 14', escalation: 'Escalate to central tent if not resolving in 20 min.',    color: '#F59E0B', emoji: '🍽️' },
  { id: 'ms-5', name: 'Mental-health drop-in',        location: 'Library basement · room 04',      hours: '10:00 – 20:00', capabilities: ['listening room', 'counsellor on-call', 'quiet + weighted blanket', 'tea'],   emergencyLink: '+91 80 4000 15', escalation: 'On-call psychiatrist · warm handoff with consent only.',   color: '#A78BFA', emoji: '🫂' },
];

// =====================================================
// Schedule-at-a-glance (30-minute blocks)
// =====================================================

interface ScheduleBlock {
  id: string;
  day: 'Day 1' | 'Day 2' | 'Day 3';
  startTime: string;
  endTime: string;
  title: string;
  kind: 'keynote' | 'workshop' | 'panel' | 'meal' | 'social' | 'field';
  room: string;
  lead: string;
  color: string;
}

const SCHEDULE_BLOCKS: ScheduleBlock[] = [
  { id: 'sb-1',  day: 'Day 1', startTime: '09:00', endTime: '09:30', title: 'Registration + badge pickup',          kind: 'social',   room: 'Main gate',         lead: 'Ops team',                 color: '#38BDF8' },
  { id: 'sb-2',  day: 'Day 1', startTime: '09:30', endTime: '10:00', title: 'Opening · keynote I',                   kind: 'keynote',  room: 'Hall A',             lead: 'Meera I. (alumni)',         color: '#F59E0B' },
  { id: 'sb-3',  day: 'Day 1', startTime: '10:15', endTime: '12:00', title: 'Workshop · design tokens 101',          kind: 'workshop', room: 'Lab 3',              lead: 'Tanvi S. (alumni)',         color: '#F472B6' },
  { id: 'sb-4',  day: 'Day 1', startTime: '12:00', endTime: '13:00', title: 'Lunch · Gujarati thali / sprout bowl',  kind: 'meal',     room: 'Food court',         lead: 'Anandi + Sprout Bowl',      color: '#F59E0B' },
  { id: 'sb-5',  day: 'Day 1', startTime: '13:15', endTime: '15:00', title: 'Workshop · field research ethics',       kind: 'workshop', room: 'Hall B',             lead: 'Aditi P. (alumni)',          color: '#A78BFA' },
  { id: 'sb-6',  day: 'Day 1', startTime: '15:15', endTime: '16:30', title: 'Panel · funding without selling out',    kind: 'panel',    room: 'Hall A',             lead: 'Kanishka + 2 guests',        color: '#22C55E' },
  { id: 'sb-7',  day: 'Day 1', startTime: '16:45', endTime: '18:00', title: 'Field walk · campus sapling audit',      kind: 'field',    room: 'South lawn',         lead: 'Aarav + volunteers',         color: '#22C55E' },
  { id: 'sb-8',  day: 'Day 1', startTime: '19:00', endTime: '21:00', title: 'Community dinner + open mic',            kind: 'social',   room: 'Garden lawn',        lead: 'Hospitality crew',           color: '#F59E0B' },

  { id: 'sb-9',  day: 'Day 2', startTime: '09:00', endTime: '10:30', title: 'Keynote II · ten years of open-source',  kind: 'keynote',  room: 'Hall A',             lead: 'Meera I. (alumni)',          color: '#38BDF8' },
  { id: 'sb-10', day: 'Day 2', startTime: '10:45', endTime: '12:30', title: 'Workshop · long-form writing clinic',    kind: 'workshop', room: 'Library · room 2',   lead: 'Ishaan K. (alumni)',         color: '#F87171' },
  { id: 'sb-11', day: 'Day 2', startTime: '12:30', endTime: '13:30', title: 'Lunch · kulcha + podi idli',             kind: 'meal',     room: 'Food court',         lead: 'Kulcha Works + South Tide',   color: '#F59E0B' },
  { id: 'sb-12', day: 'Day 2', startTime: '13:45', endTime: '15:30', title: 'Workshop · portfolio review · design',   kind: 'workshop', room: 'Lab 4',              lead: 'Tanvi S. + Mira J.',         color: '#F472B6' },
  { id: 'sb-13', day: 'Day 2', startTime: '15:45', endTime: '17:00', title: 'Panel · climate careers · Q&A',           kind: 'panel',    room: 'Hall A',             lead: 'Kanishka + 3 guests',         color: '#22C55E' },
  { id: 'sb-14', day: 'Day 2', startTime: '17:15', endTime: '18:30', title: 'Fireside · ‘fieldwork that doesn\'t break you’', kind: 'panel', room: 'Hall C',   lead: 'Aditi + Farhan',              color: '#A78BFA' },
  { id: 'sb-15', day: 'Day 2', startTime: '19:30', endTime: '22:30', title: 'Alumni-student dinner + DJ set',          kind: 'social',   room: 'Garden lawn',        lead: 'Music crew',                  color: '#F472B6' },

  { id: 'sb-16', day: 'Day 3', startTime: '09:00', endTime: '10:30', title: 'Wing standups · public show-and-tell',   kind: 'panel',    room: 'Hall A',             lead: 'All wing leads',              color: '#38BDF8' },
  { id: 'sb-17', day: 'Day 3', startTime: '10:45', endTime: '12:30', title: 'Workshop · video editing · reel cuts',    kind: 'workshop', room: 'Lab 5',              lead: 'Dhruv R. + Akshara N.',       color: '#F87171' },
  { id: 'sb-18', day: 'Day 3', startTime: '12:30', endTime: '13:30', title: 'Lunch · fruit cart + nimbu soda',         kind: 'meal',     room: 'Food court',         lead: 'The Fruit Cart + Nimbu House', color: '#F59E0B' },
  { id: 'sb-19', day: 'Day 3', startTime: '13:45', endTime: '15:15', title: 'Workshop · PR basics for first-timers',    kind: 'workshop', room: 'Lab 6',              lead: 'Varun M. (alumni)',           color: '#22C55E' },
  { id: 'sb-20', day: 'Day 3', startTime: '15:30', endTime: '17:00', title: 'Closing panel · ‘what we got wrong this year’', kind: 'panel', room: 'Hall A',   lead: 'Leads + alumni',               color: '#F472B6' },
  { id: 'sb-21', day: 'Day 3', startTime: '17:15', endTime: '18:00', title: 'Awards + thanks',                         kind: 'keynote',  room: 'Hall A',             lead: 'Leadership team',              color: '#F59E0B' },
  { id: 'sb-22', day: 'Day 3', startTime: '18:15', endTime: '20:00', title: 'Community wind-down · slow dinner',        kind: 'meal',     room: 'Garden lawn',        lead: 'Hospitality crew',              color: '#22C55E' },
];

// =====================================================
// COMPONENT
// =====================================================

// =====================================================
// Phase 3t: deeper events structures
// =====================================================

interface MerchDrop {
  id: string;
  item: string;
  priceInr: number;
  stock: number;
  material: string;
  note: string;
  color: string;
  emoji: string;
}

const MERCH_DROPS: MerchDrop[] = [
  { id: 'md-1',  item: 'Organic cotton tee · leaf print', priceInr: 480, stock: 120, material: 'GOTS-certified organic cotton',   note: 'Printed at a union shop in Tirupur.',                     color: '#22C55E', emoji: '👕' },
  { id: 'md-2',  item: 'Recycled tote · seed pattern',    priceInr: 220, stock: 200, material: 'Post-consumer recycled canvas',   note: 'Sewn by a women-led co-op in Bengaluru.',                color: '#38BDF8', emoji: '🛍️' },
  { id: 'md-3',  item: 'Bamboo sipper · 450 ml',          priceInr: 350, stock: 80,  material: 'Food-grade bamboo · steel liner', note: 'Dishwasher-safe · rinse before first use.',              color: '#F59E0B', emoji: '🧃' },
  { id: 'md-4',  item: 'Enamel pin · Taru leaf',          priceInr: 120, stock: 300, material: 'Lead-free enamel on brass',        note: 'Small + sturdy · ships with a thank-you note.',          color: '#A78BFA', emoji: '🪷' },
  { id: 'md-5',  item: 'Notebook · 80 pages · upcycled',  priceInr: 180, stock: 150, material: 'Handmade recycled paper',          note: 'Made in Sanganer · acid-free · light spine.',             color: '#F472B6', emoji: '📓' },
  { id: 'md-6',  item: 'Sapling kit · five seeds',        priceInr: 95,  stock: 250, material: 'Cloth pouch + 5 native seeds',     note: 'Neem · tulsi · amla · guava · curry leaf · all local.', color: '#22C55E', emoji: '🌱' },
  { id: 'md-7',  item: 'Guardian cap · forest green',     priceInr: 290, stock: 60,  material: 'Organic cotton twill',             note: 'Small run · every cap has a hand-stitched leaf.',        color: '#22C55E', emoji: '🧢' },
  { id: 'md-8',  item: 'Sticker pack · 12 pieces',        priceInr: 80,  stock: 400, material: 'Recycled paper + plant-based ink', note: 'Designed by four different GD wing members.',           color: '#F472B6', emoji: '🏷️' },
];

interface GreenOpsItem {
  id: string;
  area: string;
  action: string;
  owner: string;
  done: boolean;
  color: string;
  emoji: string;
}

const GREEN_OPS: GreenOpsItem[] = [
  { id: 'go-1',  area: 'Water',   action: 'Use reusable glass jugs instead of bottled water.',    owner: 'Ops wing',           done: true,  color: '#38BDF8', emoji: '💧' },
  { id: 'go-2',  area: 'Waste',   action: 'Set up three-bin segregation · wet / dry / e-waste.',  owner: 'Volunteers · green team', done: true, color: '#22C55E', emoji: '♻️' },
  { id: 'go-3',  area: 'Food',    action: 'Ask vendors to bring reusable plates · no foil.',      owner: 'Food coordinator',   done: true,  color: '#F59E0B', emoji: '🍛' },
  { id: 'go-4',  area: 'Energy',  action: 'Switch to LED stage lights · cut wattage by 40%.',     owner: 'Photo + lighting',   done: true,  color: '#FDE047', emoji: '💡' },
  { id: 'go-5',  area: 'Travel',  action: 'Carpool sheet goes live 10 days before the event.',    owner: 'PR wing',            done: true,  color: '#A78BFA', emoji: '🚗' },
  { id: 'go-6',  area: 'Paper',   action: 'No printed brochures · everything lives in the app.',  owner: 'Content wing',       done: true,  color: '#F472B6', emoji: '🌿' },
  { id: 'go-7',  area: 'Gifts',   action: 'Speaker gifts are a sapling + a hand-written card.',   owner: 'PR wing',            done: true,  color: '#22C55E', emoji: '🌱' },
  { id: 'go-8',  area: 'Mugs',    action: '120 reusable mugs · wash + return · no paper cups.',   owner: 'Volunteers · mug desk', done: false, color: '#00D4FF', emoji: '☕' },
  { id: 'go-9',  area: 'Merch',   action: 'Merch sourced from GOTS + union-shop vendors only.',   owner: 'Merch lead',         done: false, color: '#22C55E', emoji: '👕' },
  { id: 'go-10', area: 'Audit',   action: 'Post-event waste-audit photo within 48 hours.',        owner: 'Sustainability wing', done: false, color: '#F59E0B', emoji: '📸' },
];

interface RiskEntry {
  id: string;
  risk: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  owner: string;
  mitigation: string;
  color: string;
  emoji: string;
}

const RISK_REGISTER: RiskEntry[] = [
  { id: 'rk-1', risk: 'Rain · stage lights exposed',        likelihood: 'medium', impact: 'high',   owner: 'Ops wing',    mitigation: 'Two tarps on standby · backup indoor room 2A held.',      color: '#38BDF8', emoji: '🌧️' },
  { id: 'rk-2', risk: 'Speaker drops out · 48h before',     likelihood: 'medium', impact: 'medium', owner: 'PR wing',      mitigation: 'Reserve list of 3 speakers · each pre-briefed on topic.', color: '#A78BFA', emoji: '🎤' },
  { id: 'rk-3', risk: 'Crowd overflow · room 1 fills',      likelihood: 'high',   impact: 'medium', owner: 'Volunteers',   mitigation: 'Live relay to room 2B · volunteer guides routing.',       color: '#F59E0B', emoji: '👥' },
  { id: 'rk-4', risk: 'Power outage · stage + audio',       likelihood: 'low',    impact: 'high',   owner: 'Ops wing',    mitigation: 'Battery-backed PA + 30-min generator on campus.',         color: '#EF4444', emoji: '⚡' },
  { id: 'rk-5', risk: 'Photo consent mix-up',               likelihood: 'low',    impact: 'high',   owner: 'PR wing',      mitigation: 'Wristbands · green = OK · red = no photo · brief volunteers.', color: '#22C55E', emoji: '📸' },
  { id: 'rk-6', risk: 'Medical incident · heat exhaustion', likelihood: 'low',    impact: 'high',   owner: 'Medical lead', mitigation: 'Two first-aid stations · 100 ORS packets · on-call doctor.', color: '#F87171', emoji: '🩺' },
  { id: 'rk-7', risk: 'Wi-Fi saturates during stream',      likelihood: 'medium', impact: 'medium', owner: 'Web wing',     mitigation: 'Dedicated stream SSID · guests use a throttled pool.',    color: '#00D4FF', emoji: '📡' },
  { id: 'rk-8', risk: 'Food shortage · vendor misjudges',   likelihood: 'low',    impact: 'medium', owner: 'Food lead',    mitigation: 'Two backup vendors on call · 30-min delivery radius.',    color: '#F59E0B', emoji: '🍱' },
];

interface PhotoBrief {
  id: string;
  slot: string;
  camera: string;
  mustCapture: string;
  styleNote: string;
  color: string;
  emoji: string;
}

const PHOTO_BRIEFS: PhotoBrief[] = [
  { id: 'pb-1', slot: 'Pre-event · 45 min before',        camera: 'Prime · 35mm · natural light',           mustCapture: 'Volunteers setting up · hands-on details · signage.',          styleNote: 'Warm · documentary · no stiff posing · f/2.8.',    color: '#F59E0B', emoji: '🌅' },
  { id: 'pb-2', slot: 'Opening keynote',                  camera: 'Telephoto · 70–200 · off-stage',         mustCapture: 'Speaker three-quarter · crowd reaction · slide + face duo.',   styleNote: 'Low ISO · sharp · no harsh flash · f/4.',          color: '#A78BFA', emoji: '🎤' },
  { id: 'pb-3', slot: 'Wing workshops',                   camera: 'Wide 24mm · moving with attendees',      mustCapture: 'Hands on laptops · sticky notes · smiles during debug.',        styleNote: 'Eye-level · follow one pair for 10 min each.',     color: '#F472B6', emoji: '🧑‍💻' },
  { id: 'pb-4', slot: 'Lunch + tea · courtyard',          camera: 'Prime 50mm · candid',                    mustCapture: 'Reusable mugs · plates · laughter · inter-wing conversations.', styleNote: 'Warm tones · slightly over-exposed · f/1.8.',      color: '#F59E0B', emoji: '☕' },
  { id: 'pb-5', slot: 'Alumni fireside',                  camera: 'Low light · 85mm · tripod-ready',        mustCapture: 'Mentor + mentee eye-contact · audience in soft blur.',          styleNote: 'Shallow depth · warm · soft bokeh · f/1.8.',       color: '#7E57C2', emoji: '🔥' },
  { id: 'pb-6', slot: 'Closing group photo',              camera: 'Wide 24mm · step-ladder · flash off',    mustCapture: 'One wide frame · one medium · one candid right after.',         styleNote: 'Tall people back · short people front · 3 takes.', color: '#22C55E', emoji: '📸' },
];

interface AfterPartyPlan {
  id: string;
  name: string;
  slot: string;
  capacity: number;
  vibe: string;
  signupMode: 'free' | 'rsvp' | 'waitlist';
  color: string;
  emoji: string;
}

const AFTER_PARTY_PLANS: AfterPartyPlan[] = [
  { id: 'ap-1', name: 'Quiet lounge · chai + board games',     slot: '7:30 pm – 9:30 pm', capacity: 50, vibe: 'Low-stim · no music · warm lighting · chess + carrom.',          signupMode: 'rsvp',     color: '#A78BFA', emoji: '🧘' },
  { id: 'ap-2', name: 'Open-mic · music + poetry',             slot: '8:00 pm – 10:30 pm', capacity: 120, vibe: 'Acoustic first · volunteers curate slots of 6 min each.',        signupMode: 'rsvp',     color: '#F472B6', emoji: '🎸' },
  { id: 'ap-3', name: 'Night hike · campus green patch',       slot: '9:00 pm – 10:00 pm', capacity: 30, vibe: 'Twelve-minute loop · two volunteer guides · torches provided.', signupMode: 'waitlist', color: '#22C55E', emoji: '🌳' },
  { id: 'ap-4', name: 'Gallery walk · this year in photos',    slot: '7:30 pm – 9:00 pm', capacity: 80, vibe: 'Prints up in the courtyard · photographer present for q&a.',     signupMode: 'free',     color: '#F59E0B', emoji: '🖼️' },
  { id: 'ap-5', name: 'Silent study · late-night hack',        slot: '9:00 pm – 12:00 am', capacity: 40, vibe: 'Quiet only · laptops ok · one volunteer runs tea runs.',         signupMode: 'rsvp',     color: '#00D4FF', emoji: '💻' },
];

interface WeatherWatch {
  id: string;
  hour: string;
  condition: string;
  tempC: number;
  humidity: number;
  note: string;
  color: string;
  emoji: string;
}

const WEATHER_WATCH: WeatherWatch[] = [
  { id: 'ww-1', hour: '07:00', condition: 'Cool + dry',        tempC: 19, humidity: 62, note: 'Good for setup · carry a light jacket.',                      color: '#38BDF8', emoji: '🌤️' },
  { id: 'ww-2', hour: '09:00', condition: 'Clear · mild sun',  tempC: 23, humidity: 58, note: 'Open courtyard is comfortable · flags up.',                  color: '#FDE047', emoji: '☀️' },
  { id: 'ww-3', hour: '11:00', condition: 'Sunny · warm',      tempC: 28, humidity: 54, note: 'Move panels indoors if over 30 · keep ORS station open.',    color: '#F59E0B', emoji: '🌞' },
  { id: 'ww-4', hour: '13:00', condition: 'Partly cloudy',     tempC: 30, humidity: 57, note: 'Good for the lunch courtyard · tarps loose but ready.',     color: '#F59E0B', emoji: '⛅' },
  { id: 'ww-5', hour: '15:00', condition: 'Chance of rain',    tempC: 27, humidity: 72, note: '30% rain · move the photo wall indoors as a precaution.',    color: '#A78BFA', emoji: '🌦️' },
  { id: 'ww-6', hour: '17:00', condition: 'Drizzle possible',  tempC: 25, humidity: 80, note: 'Have two tarps ready · open-mic shifts inside if needed.',   color: '#7E57C2', emoji: '🌧️' },
  { id: 'ww-7', hour: '19:00', condition: 'Mild + clear',      tempC: 22, humidity: 68, note: 'Good for the night hike · take torches + whistles.',       color: '#22C55E', emoji: '🌙' },
  { id: 'ww-8', hour: '21:00', condition: 'Cool + calm',       tempC: 20, humidity: 66, note: 'Close-down shift · courtyard lights on · head-count done.', color: '#38BDF8', emoji: '✨' },
];

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

  // Extras state (footer sections)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('t-member');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<CityChapter | null>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [followedSponsors, setFollowedSponsors] = useState<string[]>([]);
  const [rsvpedChapters, setRsvpedChapters] = useState<string[]>([]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const extrasModalScale = useRef(new Animated.Value(0.9)).current;
  const extrasModalOpacity = useRef(new Animated.Value(0)).current;

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
  // EXTRAS: FOOTER SECTIONS (speakers, sponsors, venues, ticket tiers, FAQ, etc.)
  // =====================================================

  const openSpeaker = useCallback(
    (s: Speaker) => {
      setSelectedSpeaker(s);
      setShowSpeakerModal(true);
      extrasModalScale.setValue(0.9);
      extrasModalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(extrasModalScale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(extrasModalOpacity, {
          toValue: 1,
          duration: ANIM.duration.normal,
          easing: ANIM.easing.out,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [extrasModalOpacity, extrasModalScale],
  );

  const closeSpeaker = useCallback(() => {
    Animated.parallel([
      Animated.timing(extrasModalScale, {
        toValue: 0.92,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(extrasModalOpacity, {
        toValue: 0,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSpeakerModal(false);
      setSelectedSpeaker(null);
    });
  }, [extrasModalOpacity, extrasModalScale]);

  const openVenue = useCallback(
    (v: Venue) => {
      setSelectedVenue(v);
      setShowVenueModal(true);
      extrasModalScale.setValue(0.92);
      extrasModalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(extrasModalScale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(extrasModalOpacity, {
          toValue: 1,
          duration: ANIM.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [extrasModalOpacity, extrasModalScale],
  );

  const closeVenue = useCallback(() => {
    Animated.parallel([
      Animated.timing(extrasModalScale, {
        toValue: 0.92,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(extrasModalOpacity, {
        toValue: 0,
        duration: ANIM.duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowVenueModal(false);
      setSelectedVenue(null);
    });
  }, [extrasModalOpacity, extrasModalScale]);

  const submitCheckin = useCallback(() => {
    if (checkinCode.trim().length < 4) {
      Alert.alert('Code too short', 'Enter the 4-6 digit code from your confirmation email.');
      return;
    }
    setCheckinSuccess(true);
    setTimeout(() => {
      setShowCheckinModal(false);
      setCheckinCode('');
      setCheckinSuccess(false);
    }, 1600);
  }, [checkinCode]);

  const submitFeedback = useCallback(() => {
    if (feedbackRating === 0) {
      Alert.alert('Pick a rating', 'Tap one of the stars first.');
      return;
    }
    if (feedbackText.trim().length < 10) {
      Alert.alert('A bit more', 'Tell us at least 10 characters — what worked, what didn\'t.');
      return;
    }
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackText('');
      setFeedbackSent(false);
    }, 1400);
  }, [feedbackRating, feedbackText]);

  const toggleSponsor = useCallback((id: string) => {
    setFollowedSponsors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleChapterRsvp = useCallback((id: string) => {
    setRsvpedChapters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const renderCalendarSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>📅 14-day calendar</Text>
        <Text style={styles.extrasSubtitle}>Density heat-map by day</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarRow}
      >
        {CALENDAR_DAYS.map((d) => {
          const intensity = Math.min(1, d.count / 5);
          const bg =
            d.count === 0
              ? Colors.background.darkGreen
              : `rgba(0,212,255,${0.15 + intensity * 0.6})`;
          return (
            <View
              key={d.date}
              style={[
                styles.calendarCell,
                { backgroundColor: bg },
                d.isToday && styles.calendarCellToday,
              ]}
            >
              <Text style={styles.calendarLabel}>{d.label}</Text>
              <Text style={styles.calendarCount}>
                {d.count} {d.count === 1 ? 'event' : 'events'}
              </Text>
              {!!d.topEvent && (
                <Text style={styles.calendarTop} numberOfLines={1}>
                  {d.topEvent}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderTicketsSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🎟️ Ticket tiers</Text>
        <Text style={styles.extrasSubtitle}>Taru Fest 2026 · 4 days</Text>
      </View>
      <View style={styles.ticketTabsRow}>
        {TICKET_TIERS.map((t) => {
          const active = selectedTier === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.ticketTab,
                active && { backgroundColor: t.color + '25', borderColor: t.color },
              ]}
              onPress={() => setSelectedTier(t.id)}
            >
              <Text style={styles.ticketTabEmoji}>{t.emoji}</Text>
              <Text
                style={[
                  styles.ticketTabLabel,
                  active && { color: t.color, fontWeight: '800' },
                ]}
              >
                {t.name}
              </Text>
              <Text style={styles.ticketTabPrice}>{t.priceLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {(() => {
        const tier = TICKET_TIERS.find((t) => t.id === selectedTier) || TICKET_TIERS[0];
        return (
          <View
            style={[
              styles.ticketBlock,
              { borderColor: tier.color + '66', backgroundColor: tier.color + '10' },
            ]}
          >
            <View style={styles.ticketBlockHeaderRow}>
              <Text style={styles.ticketBlockName}>
                {tier.emoji} {tier.name}
              </Text>
              <Text style={[styles.ticketBlockPrice, { color: tier.color }]}>
                {tier.priceLabel}
              </Text>
            </View>
            {!!tier.badge && (
              <View style={[styles.ticketBadge, { backgroundColor: tier.color + '33' }]}>
                <Text style={[styles.ticketBadgeText, { color: tier.color }]}>
                  {tier.badge}
                </Text>
              </View>
            )}
            <View style={{ marginTop: 10 }}>
              {tier.includes.map((line) => (
                <View key={line} style={styles.ticketIncludeRow}>
                  <Text style={[styles.ticketIncludeBullet, { color: tier.color }]}>✓</Text>
                  <Text style={styles.ticketIncludeText}>{line}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.ticketCta, { backgroundColor: tier.color }]}
              onPress={() => setShowTicketModal(true)}
            >
              <Text style={styles.ticketCtaText}>Buy {tier.name} ticket</Text>
            </TouchableOpacity>
          </View>
        );
      })()}
    </View>
  );

  const renderSpeakersSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🎤 Featured speakers</Text>
        <Text style={styles.extrasSubtitle}>
          {SPEAKERS.length} voices across 4 days
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: HORIZONTAL_PADDING }}
      >
        {SPEAKERS.map((sp) => (
          <TouchableOpacity
            key={sp.id}
            activeOpacity={0.9}
            onPress={() => openSpeaker(sp)}
            style={[styles.speakerCard, { borderColor: sp.color + '55' }]}
          >
            <View
              style={[
                styles.speakerAvatar,
                { backgroundColor: sp.color + '33' },
              ]}
            >
              <Text style={styles.speakerAvatarEmoji}>{sp.avatarEmoji}</Text>
            </View>
            <Text style={styles.speakerName} numberOfLines={1}>
              {sp.name}
            </Text>
            <Text style={styles.speakerPronouns}>{sp.pronouns}</Text>
            <Text style={[styles.speakerRole, { color: sp.color }]} numberOfLines={1}>
              {sp.role}
            </Text>
            <Text style={styles.speakerOrg} numberOfLines={1}>
              {sp.org}
            </Text>
            <View style={styles.speakerExpertiseRow}>
              {sp.expertise.slice(0, 2).map((ex) => (
                <View
                  key={ex}
                  style={[
                    styles.speakerExpertisePill,
                    { borderColor: sp.color + '55' },
                  ]}
                >
                  <Text style={styles.speakerExpertisePillText}>{ex}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSponsorsSection = () => {
    const byTier = (t: Sponsor['tier']) => SPONSORS.filter((s) => s.tier === t);
    const tierOrder: { key: Sponsor['tier']; label: string; color: string }[] = [
      { key: 'platinum', label: 'Platinum partners', color: '#E5E7EB' },
      { key: 'gold', label: 'Gold partners', color: '#FBBF24' },
      { key: 'community', label: 'Community partners', color: '#22C55E' },
    ];
    return (
      <View style={styles.extrasSection}>
        <View style={styles.extrasHeaderRow}>
          <Text style={styles.extrasTitle}>🤝 Partners + sponsors</Text>
          <Text style={styles.extrasSubtitle}>All proceeds → saplings</Text>
        </View>
        {tierOrder.map((group) => (
          <View key={group.key} style={{ marginBottom: 14 }}>
            <Text style={[styles.sponsorTierLabel, { color: group.color }]}>
              {group.label}
            </Text>
            <View style={styles.sponsorGrid}>
              {byTier(group.key).map((sp) => {
                const followed = followedSponsors.includes(sp.id);
                return (
                  <View
                    key={sp.id}
                    style={[
                      styles.sponsorCard,
                      { borderColor: sp.color + '55' },
                    ]}
                  >
                    <View style={styles.sponsorHeaderRow}>
                      <Text style={styles.sponsorEmoji}>{sp.emoji}</Text>
                      <Text style={styles.sponsorName} numberOfLines={1}>
                        {sp.name}
                      </Text>
                    </View>
                    <Text style={styles.sponsorTagline} numberOfLines={2}>
                      {sp.tagline}
                    </Text>
                    <Text style={styles.sponsorContribution} numberOfLines={2}>
                      {sp.contribution}
                    </Text>
                    <Text style={styles.sponsorSince}>Partnering since {sp.since}</Text>
                    <TouchableOpacity
                      onPress={() => toggleSponsor(sp.id)}
                      style={[
                        styles.sponsorFollowBtn,
                        followed && {
                          backgroundColor: sp.color + '22',
                          borderColor: sp.color,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sponsorFollowText,
                          followed && { color: sp.color },
                        ]}
                      >
                        {followed ? '✓ Following' : '+ Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderVenuesSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>📍 Venues</Text>
        <Text style={styles.extrasSubtitle}>All accessible · all reachable</Text>
      </View>
      {VENUES.map((v) => (
        <TouchableOpacity
          key={v.id}
          activeOpacity={0.9}
          onPress={() => openVenue(v)}
          style={[styles.venueCard, { borderColor: v.color + '55' }]}
        >
          <View style={styles.venueHeaderRow}>
            <Text style={styles.venueEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.venueName}>{v.name}</Text>
              <Text style={styles.venueTypeLine}>
                {v.type.toUpperCase()} · cap {v.capacity}
              </Text>
            </View>
          </View>
          <Text style={styles.venueAddress} numberOfLines={2}>
            {v.address}
          </Text>
          <Text style={styles.venueTransit}>🚏 {v.nearestTransit}</Text>
          <View style={styles.venueAmenityRow}>
            {v.amenities.slice(0, 3).map((a) => (
              <View key={a} style={styles.venueAmenityPill}>
                <Text style={styles.venueAmenityText}>{a}</Text>
              </View>
            ))}
            {v.amenities.length > 3 && (
              <Text style={styles.venueMore}>+{v.amenities.length - 3} more</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFaqSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>❓ Frequently asked</Text>
        <Text style={styles.extrasSubtitle}>{EVENT_FAQS.length} questions</Text>
      </View>
      {EVENT_FAQS.map((f) => {
        const open = expandedFaq === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.9}
            onPress={() => setExpandedFaq(open ? null : f.id)}
            style={[styles.faqRow, open && styles.faqRowOpen]}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ} numberOfLines={open ? undefined : 2}>
                {f.q}
              </Text>
              <Text
                style={[styles.faqChevron, open && { transform: [{ rotate: '90deg' }] }]}
              >
                ›
              </Text>
            </View>
            {open && <Text style={styles.faqA}>{f.a}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderConductSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🛡️ Code of conduct</Text>
        <TouchableOpacity onPress={() => setShowConductModal(true)}>
          <Text style={styles.extrasLink}>Read full →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.conductGrid}>
        {CONDUCT_PILLARS.map((c) => (
          <View
            key={c.id}
            style={[styles.conductPill, { borderColor: c.color + '66' }]}
          >
            <Text style={styles.conductIcon}>{c.icon}</Text>
            <Text style={styles.conductTitle} numberOfLines={1}>
              {c.title}
            </Text>
            <Text style={styles.conductBody} numberOfLines={3}>
              {c.body}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderChaptersSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🏙️ City chapters</Text>
        <Text style={styles.extrasSubtitle}>6 cities · 228 members</Text>
      </View>
      <View style={styles.chapterGrid}>
        {CITY_CHAPTERS.map((c) => {
          const rsvped = rsvpedChapters.includes(c.id);
          return (
            <View
              key={c.id}
              style={[styles.chapterCard, { borderColor: c.color + '55' }]}
            >
              <Text style={styles.chapterEmoji}>{c.emoji}</Text>
              <Text style={styles.chapterCity}>{c.city}</Text>
              <Text style={styles.chapterMembers}>{c.members} members</Text>
              <Text style={styles.chapterLead} numberOfLines={1}>
                Lead · {c.lead}
              </Text>
              <Text style={styles.chapterNext} numberOfLines={2}>
                {c.nextEvent}
              </Text>
              <TouchableOpacity
                onPress={() => toggleChapterRsvp(c.id)}
                style={[
                  styles.chapterRsvp,
                  rsvped && {
                    backgroundColor: c.color + '22',
                    borderColor: c.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chapterRsvpText,
                    rsvped && { color: c.color },
                  ]}
                >
                  {rsvped ? '✓ Going' : 'RSVP'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderAccessibilitySection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>♿ Accessibility</Text>
        <Text style={styles.extrasSubtitle}>Default at every venue</Text>
      </View>
      {ACCESSIBILITY_OPTIONS.map((a) => (
        <View key={a.id} style={styles.accessRow}>
          <Text style={styles.accessIcon}>{a.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.accessLabel}>{a.label}</Text>
            <Text style={styles.accessBody}>{a.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCheckinSection = () => (
    <View style={styles.extrasSection}>
      <LinearGradient
        colors={['#0B3A2A', '#0E5A3E']}
        style={styles.checkinBanner}
      >
        <Text style={styles.checkinEmoji}>🎫</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.checkinTitle}>At the gate?</Text>
          <Text style={styles.checkinSubtitle}>
            Use the 4–6 digit code from your confirmation email to check in.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkinBtn}
          onPress={() => setShowCheckinModal(true)}
        >
          <Text style={styles.checkinBtnText}>Check in</Text>
        </TouchableOpacity>
      </LinearGradient>
      <TouchableOpacity
        style={[styles.feedbackRow]}
        onPress={() => setShowFeedbackModal(true)}
      >
        <Text style={styles.feedbackEmoji}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.feedbackTitle}>Came to an event? Drop feedback.</Text>
          <Text style={styles.feedbackSubtitle}>
            We read everything. Takes 30 seconds.
          </Text>
        </View>
        <Text style={styles.feedbackChev}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTravelSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🧭 Getting here</Text>
        <Text style={styles.extrasSubtitle}>{TRAVEL_OPTIONS.length} ways</Text>
      </View>
      <View style={styles.travelGrid}>
        {TRAVEL_OPTIONS.map((t) => (
          <View key={t.id} style={styles.travelCard}>
            <View style={[styles.travelIconWrap, { backgroundColor: t.color + '2A' }]}>
              <Text style={styles.travelIcon}>{t.emoji}</Text>
            </View>
            <Text style={styles.travelMode}>{t.mode}</Text>
            <Text style={styles.travelDetails} numberOfLines={3}>{t.details}</Text>
            <View style={styles.travelFootRow}>
              <Text style={[styles.travelCost, { color: t.color }]}>{t.costHint}</Text>
              <Text style={styles.travelEta}>{t.eta}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStaySection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🛏️ Where to stay</Text>
        <Text style={styles.extrasSubtitle}>{STAY_OPTIONS.length} options</Text>
      </View>
      {STAY_OPTIONS.map((s) => (
        <View key={s.id} style={[styles.stayCard, { borderLeftColor: s.color }]}>
          <View style={styles.stayHeaderRow}>
            <Text style={styles.stayEmoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stayName}>{s.name}</Text>
              <Text style={styles.stayMeta}>{s.type} · {s.walk}</Text>
            </View>
            <Text style={[styles.stayPrice, { color: s.color }]}>{s.priceHint}</Text>
          </View>
          <View style={styles.stayPerksRow}>
            {s.perks.map((p) => (
              <View key={p} style={styles.stayPerkChip}>
                <Text style={styles.stayPerkText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecapsSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🗂️ Recent recaps</Text>
        <Text style={styles.extrasSubtitle}>{EVENT_RECAPS.length} events</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recapScroll}
      >
        {EVENT_RECAPS.map((r) => (
          <View key={r.id} style={styles.recapCard}>
            <LinearGradient
              colors={[r.color + '38', '#0A0F14']}
              style={styles.recapGradient}
            >
              <View style={styles.recapHeaderRow}>
                <Text style={styles.recapEmoji}>{r.emoji}</Text>
                <View style={styles.recapCountPill}>
                  <Text style={styles.recapCountText}>
                    {r.attended}/{r.signups}
                  </Text>
                </View>
              </View>
              <Text style={styles.recapTitle}>{r.title}</Text>
              <Text style={styles.recapDate}>{r.date}</Text>
              <Text style={styles.recapHighlight} numberOfLines={3}>{r.highlight}</Text>
              <View style={styles.recapMetricsRow}>
                {r.metrics.map((m) => (
                  <View key={m.label} style={styles.recapMetric}>
                    <Text style={[styles.recapMetricVal, { color: r.color }]}>{m.value}</Text>
                    <Text style={styles.recapMetricLab} numberOfLines={2}>{m.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.recapQuoteRow}>
                <Text style={styles.recapQuote} numberOfLines={3}>“{r.quote}”</Text>
                <Text style={styles.recapQuoteAuthor}>— {r.quoteAuthor}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderVolunteerSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🤝 Volunteer roles</Text>
        <Text style={styles.extrasSubtitle}>{VOLUNTEER_ROLES.length} teams</Text>
      </View>
      <View style={styles.volunteerGrid}>
        {VOLUNTEER_ROLES.map((v) => {
          const pct = v.spots > 0 ? Math.min(1, v.filled / v.spots) : 0;
          return (
            <View key={v.id} style={styles.volunteerCard}>
              <View style={styles.volunteerHeader}>
                <Text style={styles.volunteerEmoji}>{v.emoji}</Text>
                <Text style={styles.volunteerName}>{v.name}</Text>
              </View>
              <Text style={styles.volunteerTime}>{v.time}</Text>
              <View style={styles.volunteerBarBg}>
                <View
                  style={[
                    styles.volunteerBarFill,
                    { width: `${Math.round(pct * 100)}%`, backgroundColor: v.color },
                  ]}
                />
              </View>
              <Text style={[styles.volunteerSpots, { color: v.color }]}>
                {v.filled}/{v.spots} filled
              </Text>
              {v.responsibilities.map((r) => (
                <Text key={r} style={styles.volunteerResp}>• {r}</Text>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStreamSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>📡 Livestream tracks</Text>
        <Text style={styles.extrasSubtitle}>Captions · replays</Text>
      </View>
      {STREAM_DETAILS.map((s) => (
        <View key={s.id} style={[styles.streamRow, { borderLeftColor: s.color }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.streamTrack}>{s.track}</Text>
            <Text style={styles.streamWhere}>{s.where} · {s.time}</Text>
            <Text style={styles.streamPlatform}>{s.platform}</Text>
          </View>
          <View style={styles.streamPillCol}>
            <View
              style={[
                styles.streamPill,
                { backgroundColor: s.caption ? '#22C55E22' : '#ffffff14' },
              ]}
            >
              <Text
                style={[
                  styles.streamPillText,
                  { color: s.caption ? '#22C55E' : Colors.text.muted },
                ]}
              >
                {s.caption ? 'CC' : 'no CC'}
              </Text>
            </View>
            <View
              style={[
                styles.streamPill,
                { backgroundColor: s.recording ? '#38BDF822' : '#ffffff14', marginTop: 4 },
              ]}
            >
              <Text
                style={[
                  styles.streamPillText,
                  { color: s.recording ? '#38BDF8' : Colors.text.muted },
                ]}
              >
                {s.recording ? 'replay' : 'live only'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderConsentSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>📷 Photo / video consent</Text>
        <Text style={styles.extrasSubtitle}>Badge legend</Text>
      </View>
      {CONSENT_RULES.map((c) => (
        <View key={c.id} style={styles.consentRow}>
          <Text style={styles.consentEmoji}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.consentTitle}>{c.title}</Text>
            <Text style={styles.consentBody}>{c.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFoodVendorsSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🍽️ Food vendors on-site</Text>
        <Text style={styles.extrasSubtitle}>{FOOD_VENDORS.length} carts · all week</Text>
      </View>
      {FOOD_VENDORS.map((v) => (
        <View key={v.id} style={[styles.vendorCard, { borderLeftColor: v.color }]}>
          <View style={styles.vendorHeaderRow}>
            <Text style={styles.vendorEmoji}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.vendorTopRow}>
                <Text style={styles.vendorName} numberOfLines={1}>{v.name}</Text>
                <Text style={[styles.vendorPrice, { color: v.color }]}>{v.priceBand}</Text>
              </View>
              <Text style={styles.vendorCuisine}>{v.cuisine} · {v.veg}</Text>
            </View>
          </View>
          <Text style={styles.vendorHighlight} numberOfLines={3}>{v.highlight}</Text>
          <View style={styles.vendorPillRow}>
            {v.dietary.map((d) => (
              <View key={d} style={styles.vendorPill}>
                <Text style={styles.vendorPillText}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.vendorFootRow}>
            <Text style={styles.vendorHours}>{v.hours}</Text>
            <Text style={styles.vendorContact}>{v.contact}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPackingListSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🎒 Pack before you come</Text>
        <Text style={styles.extrasSubtitle}>Must-haves marked · the rest is optional</Text>
      </View>
      {PACKING_LIST.map((p) => (
        <View key={p.id} style={styles.packRow}>
          <Text style={styles.packEmoji}>{p.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.packTopRow}>
              <Text style={styles.packName} numberOfLines={1}>{p.name}</Text>
              {p.mustHave ? (
                <View style={styles.packMustPill}>
                  <Text style={styles.packMustText}>MUST</Text>
                </View>
              ) : (
                <Text style={styles.packOpt}>optional</Text>
              )}
            </View>
            <Text style={styles.packWhy} numberOfLines={3}>{p.why}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderParkingSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🅿️ Parking lots</Text>
        <Text style={styles.extrasSubtitle}>{PARKING_LOTS.length} lots · EV + cycles welcomed</Text>
      </View>
      {PARKING_LOTS.map((l) => (
        <View key={l.id} style={[styles.parkRow, { borderLeftColor: l.color }]}>
          <View style={styles.parkTopRow}>
            <Text style={styles.parkName} numberOfLines={1}>{l.name}</Text>
            <Text style={[styles.parkType, { color: l.color }]}>{l.type}</Text>
          </View>
          <Text style={styles.parkMeta}>
            {l.capacity} slots · {l.walkMinutes} min walk · EV {l.evChargers} · 🚲 {l.cycleRacks}
          </Text>
          <Text style={styles.parkPrice}>{l.priceNote}</Text>
          {l.accessible ? (
            <Text style={[styles.parkAccess, { color: '#22C55E' }]}>♿ accessible route from this lot</Text>
          ) : (
            <Text style={[styles.parkAccess, { color: '#F59E0B' }]}>♿ limited — prefer lot 1 or 5</Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderTransitSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>🚇 Public transit</Text>
        <Text style={styles.extrasSubtitle}>Prefer transit · shuttle is free with a pass</Text>
      </View>
      {TRANSIT_ROUTES.map((t) => (
        <View key={t.id} style={[styles.transitCard, { borderLeftColor: t.color }]}>
          <View style={styles.transitTopRow}>
            <Text style={styles.transitEmoji}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.transitName} numberOfLines={1}>{t.name}</Text>
              <Text style={styles.transitHub}>{t.fromHub} → {t.toVenue}</Text>
            </View>
          </View>
          <View style={styles.transitMetaRow}>
            <Text style={styles.transitMetaText}>
              {t.firstRun}–{t.lastRun} · {t.frequency}
            </Text>
            <Text style={[styles.transitCost, { color: t.color }]}>{t.cost}</Text>
          </View>
          <Text style={styles.transitAccess} numberOfLines={2}>♿ {t.accessibility}</Text>
        </View>
      ))}
    </View>
  );

  const renderMedicalSection = () => (
    <View style={styles.extrasSection}>
      <View style={styles.extrasHeaderRow}>
        <Text style={styles.extrasTitle}>⛑️ First-aid + medical</Text>
        <Text style={styles.extrasSubtitle}>Five stations on-site · one is mental-health only</Text>
      </View>
      {MEDICAL_STATIONS.map((m) => (
        <View key={m.id} style={[styles.medCard, { borderLeftColor: m.color }]}>
          <View style={styles.medTopRow}>
            <Text style={styles.medEmoji}>{m.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.medName} numberOfLines={1}>{m.name}</Text>
              <Text style={styles.medLoc}>{m.location} · {m.hours}</Text>
            </View>
          </View>
          <View style={styles.medCapRow}>
            {m.capabilities.map((c) => (
              <View key={c} style={[styles.medCapPill, { borderColor: m.color + '55' }]}>
                <Text style={[styles.medCapText, { color: m.color }]}>{c}</Text>
              </View>
            ))}
          </View>
          <View style={styles.medFootRow}>
            <Text style={styles.medPhone}>{m.emergencyLink}</Text>
            <Text style={styles.medEsc} numberOfLines={2}>↳ {m.escalation}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderScheduleSection = () => {
    const days: ScheduleBlock['day'][] = ['Day 1', 'Day 2', 'Day 3'];
    return (
      <View style={styles.extrasSection}>
        <View style={styles.extrasHeaderRow}>
          <Text style={styles.extrasTitle}>🗓️ Schedule-at-a-glance</Text>
          <Text style={styles.extrasSubtitle}>Three days · every 30-min block published</Text>
        </View>
        {days.map((d) => (
          <View key={d} style={styles.schedDayBlock}>
            <Text style={styles.schedDayLabel}>{d}</Text>
            {SCHEDULE_BLOCKS.filter((b) => b.day === d).map((b) => (
              <View key={b.id} style={[styles.schedRow, { borderLeftColor: b.color }]}>
                <View style={styles.schedTimeCol}>
                  <Text style={styles.schedStart}>{b.startTime}</Text>
                  <Text style={styles.schedEnd}>{b.endTime}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.schedTitle} numberOfLines={2}>{b.title}</Text>
                  <Text style={styles.schedMeta} numberOfLines={1}>
                    {b.kind} · {b.room} · {b.lead}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderMerchSection = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧺 Merch drops · responsibly sourced</Text>
        <Text style={styles.sectionHint}>{MERCH_DROPS.length} items · small-run</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: HORIZONTAL_PADDING }}>
        {MERCH_DROPS.map((m) => (
          <View key={m.id} style={[styles.merchCard, { borderColor: m.color + '55' }]}>
            <Text style={styles.merchEmoji}>{m.emoji}</Text>
            <Text style={styles.merchItem} numberOfLines={2}>{m.item}</Text>
            <Text style={[styles.merchPrice, { color: m.color }]}>₹{m.priceInr}</Text>
            <Text style={styles.merchStock}>{m.stock} in stock</Text>
            <Text style={styles.merchMaterial} numberOfLines={2}>{m.material}</Text>
            <Text style={styles.merchNote} numberOfLines={3}>{m.note}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderGreenOps = () => {
    const doneCount = GREEN_OPS.filter((g) => g.done).length;
    return (
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🌿 Green-ops checklist</Text>
          <Text style={styles.sectionHint}>
            {doneCount}/{GREEN_OPS.length} done
          </Text>
        </View>
        {GREEN_OPS.map((g) => (
          <View key={g.id} style={[styles.goRow, { borderLeftColor: g.color, opacity: g.done ? 0.9 : 1 }]}>
            <Text style={styles.goEmoji}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.goTopRow}>
                <Text style={styles.goArea} numberOfLines={1}>{g.area}</Text>
                <View
                  style={[
                    styles.goStatus,
                    {
                      backgroundColor: g.done ? 'rgba(34,197,94,0.18)' : 'rgba(245,158,11,0.18)',
                    },
                  ]}
                >
                  <Text style={[styles.goStatusText, { color: g.done ? '#22C55E' : '#F59E0B' }]}>
                    {g.done ? 'done' : 'doing'}
                  </Text>
                </View>
              </View>
              <Text style={styles.goAction} numberOfLines={2}>{g.action}</Text>
              <Text style={styles.goOwner} numberOfLines={1}>owner · {g.owner}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRiskRegister = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🧯 Risk register · and what we do</Text>
        <Text style={styles.sectionHint}>{RISK_REGISTER.length} tracked</Text>
      </View>
      {RISK_REGISTER.map((r) => (
        <View key={r.id} style={[styles.riskCard, { borderLeftColor: r.color }]}>
          <View style={styles.riskTopRow}>
            <Text style={styles.riskEmoji}>{r.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.riskTitle} numberOfLines={2}>{r.risk}</Text>
              <Text style={styles.riskOwner} numberOfLines={1}>owner · {r.owner}</Text>
            </View>
          </View>
          <View style={styles.riskPillRow}>
            <View style={styles.riskPill}>
              <Text style={styles.riskPillLabel}>likelihood</Text>
              <Text style={styles.riskPillText}>{r.likelihood}</Text>
            </View>
            <View style={styles.riskPill}>
              <Text style={styles.riskPillLabel}>impact</Text>
              <Text style={styles.riskPillText}>{r.impact}</Text>
            </View>
          </View>
          <Text style={styles.riskMitigation} numberOfLines={3}>{r.mitigation}</Text>
        </View>
      ))}
    </View>
  );

  const renderPhotoBriefs = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>📷 Photography briefs · by slot</Text>
        <Text style={styles.sectionHint}>{PHOTO_BRIEFS.length} briefs</Text>
      </View>
      {PHOTO_BRIEFS.map((p) => (
        <View key={p.id} style={[styles.pbCard, { borderLeftColor: p.color }]}>
          <View style={styles.pbTopRow}>
            <Text style={styles.pbEmoji}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pbSlot}>{p.slot}</Text>
              <Text style={styles.pbCamera} numberOfLines={1}>{p.camera}</Text>
            </View>
          </View>
          <Text style={styles.pbSectionLabel}>MUST CAPTURE</Text>
          <Text style={styles.pbBody} numberOfLines={3}>{p.mustCapture}</Text>
          <Text style={styles.pbSectionLabel}>STYLE NOTE</Text>
          <Text style={styles.pbBody} numberOfLines={2}>{p.styleNote}</Text>
        </View>
      ))}
    </View>
  );

  const renderAfterParty = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌙 After-party plans</Text>
        <Text style={styles.sectionHint}>{AFTER_PARTY_PLANS.length} tracks</Text>
      </View>
      {AFTER_PARTY_PLANS.map((a) => (
        <View key={a.id} style={[styles.apCard, { borderLeftColor: a.color }]}>
          <View style={styles.apTopRow}>
            <Text style={styles.apEmoji}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.apName} numberOfLines={2}>{a.name}</Text>
              <Text style={styles.apSlot}>{a.slot}</Text>
            </View>
            <View
              style={[
                styles.apSignup,
                {
                  backgroundColor:
                    a.signupMode === 'free'
                      ? 'rgba(34,197,94,0.18)'
                      : a.signupMode === 'rsvp'
                      ? 'rgba(0,212,255,0.18)'
                      : 'rgba(245,158,11,0.18)',
                },
              ]}
            >
              <Text
                style={[
                  styles.apSignupText,
                  {
                    color:
                      a.signupMode === 'free'
                        ? '#22C55E'
                        : a.signupMode === 'rsvp'
                        ? '#00D4FF'
                        : '#F59E0B',
                  },
                ]}
              >
                {a.signupMode}
              </Text>
            </View>
          </View>
          <Text style={styles.apCapacity}>cap · {a.capacity} people</Text>
          <Text style={styles.apVibe} numberOfLines={3}>{a.vibe}</Text>
        </View>
      ))}
    </View>
  );

  const renderWeatherWatch = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🌦️ Weather watch · event day</Text>
        <Text style={styles.sectionHint}>hourly outlook</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: HORIZONTAL_PADDING }}>
        {WEATHER_WATCH.map((w) => (
          <View key={w.id} style={[styles.wwCard, { borderColor: w.color + '55' }]}>
            <Text style={styles.wwHour}>{w.hour}</Text>
            <Text style={styles.wwEmoji}>{w.emoji}</Text>
            <Text style={[styles.wwTemp, { color: w.color }]}>{w.tempC}°C</Text>
            <Text style={styles.wwCondition} numberOfLines={2}>{w.condition}</Text>
            <Text style={styles.wwHumidity}>{w.humidity}% rh</Text>
            <Text style={styles.wwNote} numberOfLines={3}>{w.note}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderExtrasFooter = () => (
    <View>
      {renderCalendarSection()}
      {renderWeatherWatch()}
      {renderGreenOps()}
      {renderRiskRegister()}
      {renderPhotoBriefs()}
      {renderAfterParty()}
      {renderMerchSection()}
      {renderScheduleSection()}
      {renderTicketsSection()}
      {renderSpeakersSection()}
      {renderSponsorsSection()}
      {renderVenuesSection()}
      {renderTravelSection()}
      {renderTransitSection()}
      {renderParkingSection()}
      {renderStaySection()}
      {renderPackingListSection()}
      {renderFoodVendorsSection()}
      {renderMedicalSection()}
      {renderStreamSection()}
      {renderFaqSection()}
      {renderConductSection()}
      {renderConsentSection()}
      {renderChaptersSection()}
      {renderAccessibilitySection()}
      {renderVolunteerSection()}
      {renderRecapsSection()}
      {renderCheckinSection()}
      <View style={styles.footerBand}>
        <Text style={styles.footerLine}>
          Built with saplings, scripts + slow weekends.
        </Text>
        <Text style={styles.footerLineFaint}>Taru Guardians · Events · v1.2</Text>
      </View>
    </View>
  );

  // =====================================================
  // EXTRAS MODALS
  // =====================================================

  const renderSpeakerModal = () => {
    if (!selectedSpeaker) return null;
    const s = selectedSpeaker;
    return (
      <Modal
        visible={showSpeakerModal}
        transparent
        animationType="none"
        onRequestClose={closeSpeaker}
      >
        <Animated.View
          style={[
            styles.extrasModalOverlay,
            { opacity: extrasModalOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.extrasModalCard,
              { transform: [{ scale: extrasModalScale }], borderColor: s.color + '66' },
            ]}
          >
            <View
              style={[
                styles.speakerModalAvatar,
                { backgroundColor: s.color + '33', borderColor: s.color },
              ]}
            >
              <Text style={styles.speakerModalAvatarEmoji}>{s.avatarEmoji}</Text>
            </View>
            <Text style={styles.extrasModalTitle}>{s.name}</Text>
            <Text style={styles.extrasModalSub}>
              {s.pronouns} · {s.role}
            </Text>
            <Text style={[styles.extrasModalOrg, { color: s.color }]}>{s.org}</Text>
            <Text style={styles.extrasModalBody}>{s.bio}</Text>
            <Text style={styles.extrasModalSectionLabel}>Expertise</Text>
            <View style={styles.speakerModalChipRow}>
              {s.expertise.map((ex) => (
                <View
                  key={ex}
                  style={[
                    styles.speakerModalChip,
                    { backgroundColor: s.color + '22', borderColor: s.color + '55' },
                  ]}
                >
                  <Text style={[styles.speakerModalChipText, { color: s.color }]}>
                    {ex}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.extrasModalSectionLabel}>Sessions</Text>
            {s.sessions.map((sess) => (
              <View key={sess} style={styles.speakerSessionRow}>
                <Text style={styles.speakerSessionBullet}>•</Text>
                <Text style={styles.speakerSessionText}>{sess}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.extrasModalClose, { borderColor: s.color + '77' }]}
              onPress={closeSpeaker}
            >
              <Text style={[styles.extrasModalCloseText, { color: s.color }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderVenueModal = () => {
    if (!selectedVenue) return null;
    const v = selectedVenue;
    return (
      <Modal
        visible={showVenueModal}
        transparent
        animationType="none"
        onRequestClose={closeVenue}
      >
        <Animated.View
          style={[
            styles.extrasModalOverlay,
            { opacity: extrasModalOpacity },
          ]}
        >
          <Animated.View
            style={[
              styles.extrasModalCard,
              { transform: [{ scale: extrasModalScale }], borderColor: v.color + '66' },
            ]}
          >
            <Text style={styles.venueModalEmoji}>{v.emoji}</Text>
            <Text style={styles.extrasModalTitle}>{v.name}</Text>
            <Text style={styles.extrasModalSub}>
              {v.type.toUpperCase()} · capacity {v.capacity}
            </Text>
            <Text style={[styles.extrasModalOrg, { color: v.color }]}>
              {v.address}
            </Text>
            <Text style={styles.extrasModalSectionLabel}>Amenities</Text>
            <View style={styles.venueModalList}>
              {v.amenities.map((a) => (
                <View key={a} style={styles.venueModalListRow}>
                  <Text style={[styles.venueModalListBullet, { color: v.color }]}>
                    •
                  </Text>
                  <Text style={styles.venueModalListText}>{a}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.extrasModalSectionLabel}>Accessibility</Text>
            <View style={styles.venueModalList}>
              {v.accessibility.map((a) => (
                <View key={a} style={styles.venueModalListRow}>
                  <Text style={styles.venueModalListBullet}>✓</Text>
                  <Text style={styles.venueModalListText}>{a}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.extrasModalSectionLabel}>Transit</Text>
            <Text style={styles.extrasModalBody}>{v.nearestTransit}</Text>
            <TouchableOpacity
              style={[styles.extrasModalClose, { borderColor: v.color + '77' }]}
              onPress={closeVenue}
            >
              <Text style={[styles.extrasModalCloseText, { color: v.color }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  const renderConductModal = () => (
    <Modal
      visible={showConductModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowConductModal(false)}
    >
      <View style={styles.conductOverlay}>
        <View style={styles.conductSheet}>
          <Text style={styles.conductSheetTitle}>🛡️ Code of conduct</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CONDUCT_PILLARS.map((c) => (
              <View key={c.id} style={styles.conductSheetRow}>
                <View
                  style={[
                    styles.conductSheetIcon,
                    { backgroundColor: c.color + '33' },
                  ]}
                >
                  <Text style={styles.conductSheetIconText}>{c.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.conductSheetRowTitle}>{c.title}</Text>
                  <Text style={styles.conductSheetRowBody}>{c.body}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.conductSheetFooter}>
              This is not decoration. Breaking conduct = a conversation first, and if
              needed, a quiet exit from the event. No drama.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.conductClose}
            onPress={() => setShowConductModal(false)}
          >
            <Text style={styles.conductCloseText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTicketModal = () => {
    const tier = TICKET_TIERS.find((t) => t.id === selectedTier) || TICKET_TIERS[0];
    return (
      <Modal
        visible={showTicketModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.extrasModalOverlay}>
          <View
            style={[
              styles.extrasModalCard,
              { borderColor: tier.color + '66' },
            ]}
          >
            <Text style={styles.extrasModalTitle}>
              {tier.emoji} {tier.name} ticket
            </Text>
            <Text style={[styles.extrasModalOrg, { color: tier.color }]}>
              {tier.priceLabel}
            </Text>
            <Text style={styles.extrasModalBody}>
              This is a mock ticket flow. No real payment runs here — in production,
              tickets would route to the registrar. You\'ll get a QR code by email
              within 5 minutes of payment and an SMS confirmation.
            </Text>
            <View style={{ marginTop: 10 }}>
              {tier.includes.map((x) => (
                <View key={x} style={styles.ticketIncludeRow}>
                  <Text style={[styles.ticketIncludeBullet, { color: tier.color }]}>
                    ✓
                  </Text>
                  <Text style={styles.ticketIncludeText}>{x}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.extrasModalClose, { borderColor: tier.color + '77' }]}
              onPress={() => setShowTicketModal(false)}
            >
              <Text style={[styles.extrasModalCloseText, { color: tier.color }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCheckinModal = () => (
    <Modal
      visible={showCheckinModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCheckinModal(false)}
    >
      <View style={styles.conductOverlay}>
        <View style={styles.conductSheet}>
          <Text style={styles.conductSheetTitle}>🎫 Event check-in</Text>
          {checkinSuccess ? (
            <View style={styles.checkinSuccess}>
              <Text style={styles.checkinSuccessEmoji}>✅</Text>
              <Text style={styles.checkinSuccessTitle}>You\'re in.</Text>
              <Text style={styles.checkinSuccessBody}>
                A volunteer will hand you a wristband and a program sheet. Have a good
                one.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.conductSheetRowBody}>
                Type the 4–6 digit code from your confirmation email.
              </Text>
              <TextInput
                style={styles.checkinInput}
                value={checkinCode}
                onChangeText={(t) => setCheckinCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="0000"
                placeholderTextColor={Colors.text.muted}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.conductClose} onPress={submitCheckin}>
                <Text style={styles.conductCloseText}>Check in</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.conductClose, styles.conductCloseGhost]}
                onPress={() => setShowCheckinModal(false)}
              >
                <Text style={[styles.conductCloseText, { color: Colors.text.muted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.conductOverlay}>
        <View style={styles.conductSheet}>
          <Text style={styles.conductSheetTitle}>💬 Event feedback</Text>
          {feedbackSent ? (
            <View style={styles.checkinSuccess}>
              <Text style={styles.checkinSuccessEmoji}>🙏</Text>
              <Text style={styles.checkinSuccessTitle}>Sent. Read.</Text>
              <Text style={styles.checkinSuccessBody}>
                Every note is read by the wing that hosted the event.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.conductSheetRowBody}>
                How was it? Tap stars + tell us what worked.
              </Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setFeedbackRating(n)}
                    style={styles.starBtn}
                  >
                    <Text
                      style={[
                        styles.starBtnText,
                        feedbackRating >= n && { color: '#FBBF24' },
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.feedbackInput}
                value={feedbackText}
                onChangeText={setFeedbackText}
                placeholder="What worked? What didn't? Be specific."
                placeholderTextColor={Colors.text.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.feedbackCount}>
                {feedbackText.length} chars · min 10
              </Text>
              <TouchableOpacity style={styles.conductClose} onPress={submitFeedback}>
                <Text style={styles.conductCloseText}>Send feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.conductClose, styles.conductCloseGhost]}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={[styles.conductCloseText, { color: Colors.text.muted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
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
          ListFooterComponent={loading ? null : renderExtrasFooter()}
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
      {renderSpeakerModal()}
      {renderVenueModal()}
      {renderConductModal()}
      {renderTicketModal()}
      {renderCheckinModal()}
      {renderFeedbackModal()}

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

  // Extras sections — calendar, tickets, speakers, sponsors, venues, FAQ, etc.
  extrasSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.text.muted + '22',
  },
  extrasHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  extrasTitle: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  extrasSubtitle: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  extrasLink: {
    color: Colors.tech.neonBlue,
    fontSize: 12,
    fontWeight: '700',
  },

  // Calendar
  calendarRow: {
    paddingRight: HORIZONTAL_PADDING,
  },
  calendarCell: {
    width: 110,
    padding: 10,
    marginRight: 10,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.text.muted + '22',
  },
  calendarCellToday: {
    borderColor: Colors.tech.neonBlue,
    borderWidth: 1.5,
  },
  calendarLabel: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  calendarCount: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  calendarTop: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 6,
  },

  // Ticket tiers
  ticketTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketTab: {
    flexBasis: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    backgroundColor: Colors.background.darkGreen,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  ticketTabEmoji: {
    fontSize: 18,
  },
  ticketTabLabel: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  ticketTabPrice: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ticketBlock: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 14,
  },
  ticketBlockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketBlockName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  ticketBlockPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  ticketBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  ticketBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ticketIncludeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  ticketIncludeBullet: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 8,
    marginTop: 1,
  },
  ticketIncludeText: {
    color: Colors.text.primary,
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  ticketCta: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  ticketCtaText: {
    color: Colors.background.deepBlack,
    fontSize: 14,
    fontWeight: '800',
  },

  // Speakers
  speakerCard: {
    width: 180,
    padding: 12,
    marginRight: 10,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    backgroundColor: Colors.background.darkGreen,
  },
  speakerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  speakerAvatarEmoji: {
    fontSize: 26,
  },
  speakerName: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  speakerPronouns: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },
  speakerRole: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  speakerOrg: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },
  speakerExpertiseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  speakerExpertisePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 4,
  },
  speakerExpertisePillText: {
    color: Colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  // Sponsors
  sponsorTierLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sponsorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sponsorCard: {
    flexBasis: IS_TABLET ? '32%' : '48%',
    marginBottom: 10,
    padding: 12,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    backgroundColor: Colors.background.darkGreen,
  },
  sponsorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sponsorEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  sponsorName: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  sponsorTagline: {
    color: Colors.text.primary,
    fontSize: 12,
    lineHeight: 17,
  },
  sponsorContribution: {
    color: Colors.tech.neonBlue,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  sponsorSince: {
    color: Colors.text.muted,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  sponsorFollowBtn: {
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  sponsorFollowText: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  // Venues
  venueCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.background.darkGreen,
  },
  venueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  venueEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  venueName: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  venueTypeLine: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.6,
  },
  venueAddress: {
    color: Colors.text.primary,
    fontSize: 12,
    marginTop: 4,
  },
  venueTransit: {
    color: Colors.tech.neonBlue,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  venueAmenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  venueAmenityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.background.deepBlack,
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    marginRight: 6,
    marginBottom: 4,
  },
  venueAmenityText: {
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  venueMore: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  // FAQ
  faqRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.text.muted + '22',
    backgroundColor: Colors.background.darkGreen,
    marginBottom: 8,
  },
  faqRowOpen: {
    borderColor: Colors.tech.neonBlue + '66',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQ: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  faqChevron: {
    color: Colors.tech.neonBlue,
    fontSize: 18,
    fontWeight: '800',
  },
  faqA: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },

  // Code of conduct
  conductGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  conductPill: {
    flexBasis: '48%',
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: Colors.background.darkGreen,
    padding: 12,
    marginBottom: 10,
  },
  conductIcon: {
    fontSize: 20,
  },
  conductTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  conductBody: {
    color: Colors.text.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  // Chapters
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterCard: {
    flexBasis: IS_TABLET ? '32%' : '48%',
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: Colors.background.darkGreen,
    padding: 12,
    marginBottom: 10,
  },
  chapterEmoji: {
    fontSize: 22,
  },
  chapterCity: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  chapterMembers: {
    color: Colors.tech.neonBlue,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  chapterLead: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  chapterNext: {
    color: Colors.text.primary,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  chapterRsvp: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  chapterRsvpText: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  // Accessibility
  accessRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.text.muted + '22',
  },
  accessIcon: {
    fontSize: 18,
    width: 30,
  },
  accessLabel: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  accessBody: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // Checkin + Feedback banners
  checkinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: CARD_RADIUS,
    marginBottom: 10,
  },
  checkinEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  checkinTitle: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  checkinSubtitle: {
    color: Colors.text.primary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  checkinBtn: {
    backgroundColor: Colors.tech.neonBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkinBtnText: {
    color: Colors.background.deepBlack,
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: CARD_RADIUS,
    backgroundColor: Colors.background.darkGreen,
    borderWidth: 1,
    borderColor: Colors.text.muted + '22',
  },
  feedbackEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  feedbackTitle: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackSubtitle: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  feedbackChev: {
    color: Colors.tech.neonBlue,
    fontSize: 18,
    fontWeight: '800',
  },

  // Footer band
  footerBand: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerLine: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerLineFaint: {
    color: Colors.text.muted,
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Extras modals (speaker / venue / tickets)
  extrasModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 18,
  },
  extrasModalCard: {
    backgroundColor: Colors.background.darkGreen,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    width: '100%',
    maxHeight: '88%',
  },
  extrasModalTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  extrasModalSub: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  extrasModalOrg: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  extrasModalBody: {
    color: Colors.text.primary,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  extrasModalSectionLabel: {
    color: Colors.text.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 6,
  },
  extrasModalClose: {
    marginTop: 14,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  extrasModalCloseText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Speaker modal
  speakerModalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 2,
  },
  speakerModalAvatarEmoji: {
    fontSize: 32,
  },
  speakerModalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  speakerModalChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  speakerModalChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  speakerSessionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  speakerSessionBullet: {
    color: Colors.tech.neonBlue,
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  speakerSessionText: {
    color: Colors.text.primary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Venue modal
  venueModalEmoji: {
    fontSize: 34,
    textAlign: 'center',
  },
  venueModalList: {
    marginTop: 4,
  },
  venueModalListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  venueModalListBullet: {
    color: Colors.tech.neonBlue,
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  venueModalListText: {
    color: Colors.text.primary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Conduct + checkin + feedback modals (sheet-style)
  conductOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  conductSheet: {
    backgroundColor: Colors.background.darkGreen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: '88%',
  },
  conductSheetTitle: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  conductSheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conductSheetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  conductSheetIconText: {
    fontSize: 18,
  },
  conductSheetRowTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  conductSheetRowBody: {
    color: Colors.text.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  conductSheetFooter: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  conductClose: {
    marginTop: 14,
    backgroundColor: Colors.tech.neonBlue,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  conductCloseGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    marginTop: 8,
  },
  conductCloseText: {
    color: Colors.background.deepBlack,
    fontSize: 13,
    fontWeight: '800',
  },

  // Checkin modal
  checkinInput: {
    borderWidth: 1,
    borderColor: Colors.text.muted + '55',
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 10,
  },
  checkinSuccess: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  checkinSuccessEmoji: {
    fontSize: 36,
  },
  checkinSuccessTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  checkinSuccessBody: {
    color: Colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },

  // Feedback modal
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },
  starBtn: {
    padding: 6,
  },
  starBtnText: {
    fontSize: 32,
    color: Colors.text.muted + '77',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Colors.text.muted + '33',
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 13,
    marginTop: 10,
    minHeight: 90,
  },
  feedbackCount: {
    color: Colors.text.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },

  // Travel
  travelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  travelCard: {
    width: '50%',
    padding: 4,
  },
  travelIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelIcon: { fontSize: 18 },
  travelMode: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  travelDetails: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  travelFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  travelCost: { fontSize: 11, fontWeight: '800' },
  travelEta: { color: Colors.text.muted, fontSize: 11 },

  // Stay
  stayCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  stayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stayEmoji: { fontSize: 22, marginRight: 10 },
  stayName: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  stayMeta: {
    color: Colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  stayPrice: { fontSize: 12, fontWeight: '800' },
  stayPerksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  stayPerkChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#ffffff0F',
    marginRight: 6,
    marginBottom: 4,
  },
  stayPerkText: { color: Colors.text.secondary, fontSize: 10, fontWeight: '700' },

  // Recaps
  recapScroll: { paddingRight: 10, paddingBottom: 6, marginTop: 6 },
  recapCard: { width: 280, marginRight: 12 },
  recapGradient: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffffff18',
    minHeight: 360,
  },
  recapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapEmoji: { fontSize: 26 },
  recapCountPill: {
    backgroundColor: '#ffffff14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recapCountText: { color: Colors.text.primary, fontSize: 10, fontWeight: '800' },
  recapTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  recapDate: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  recapHighlight: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  recapMetricsRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  recapMetric: { flex: 1, paddingHorizontal: 4 },
  recapMetricVal: { fontSize: 14, fontWeight: '900' },
  recapMetricLab: { color: Colors.text.muted, fontSize: 9, marginTop: 2 },
  recapQuoteRow: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff0E',
  },
  recapQuote: { color: Colors.text.primary, fontSize: 11, fontStyle: 'italic', lineHeight: 15 },
  recapQuoteAuthor: { color: Colors.text.muted, fontSize: 10, marginTop: 4 },

  // Volunteer
  volunteerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  volunteerCard: {
    width: '50%',
    padding: 4,
  },
  volunteerHeader: { flexDirection: 'row', alignItems: 'center' },
  volunteerEmoji: { fontSize: 18, marginRight: 6 },
  volunteerName: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  volunteerTime: { color: Colors.text.muted, fontSize: 10, marginTop: 4 },
  volunteerBarBg: {
    height: 6,
    backgroundColor: '#ffffff14',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  volunteerBarFill: { height: 6, borderRadius: 4 },
  volunteerSpots: { fontSize: 10, fontWeight: '800', marginTop: 4 },
  volunteerResp: { color: Colors.text.secondary, fontSize: 10, marginTop: 2 },

  // Stream
  streamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#0D141B',
    borderLeftWidth: 3,
  },
  streamTrack: {
    color: Colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  streamWhere: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  streamPlatform: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  streamPillCol: { alignItems: 'flex-end', marginLeft: 8 },
  streamPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  streamPillText: { fontSize: 10, fontWeight: '800' },

  // Consent
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: '#0D141B',
    borderWidth: 1,
    borderColor: '#ffffff0F',
  },
  consentEmoji: { fontSize: 18, marginRight: 10, marginTop: 1 },
  consentTitle: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  consentBody: {
    color: Colors.text.secondary,
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },

  // Food vendors
  vendorCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  vendorHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  vendorEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  vendorTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vendorName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  vendorPrice: { fontSize: 12, fontWeight: '800', marginLeft: 8 },
  vendorCuisine: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  vendorHighlight: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },
  vendorPillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  vendorPill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 4,
  },
  vendorPillText: { color: Colors.text.muted, fontSize: 10, fontWeight: '700' },
  vendorFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  vendorHours: { color: Colors.text.muted, fontSize: 10 },
  vendorContact: { color: Colors.tech.neonBlue, fontSize: 10, fontWeight: '700' },

  // Packing list
  packRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  packEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  packTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  packMustPill: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packMustText: { color: '#22C55E', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  packOpt: { color: Colors.text.muted, fontSize: 10, fontStyle: 'italic' },
  packWhy: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 3 },

  // Parking lots
  parkRow: {
    backgroundColor: '#0D141B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  parkTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  parkName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  parkType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  parkMeta: { color: Colors.text.secondary, fontSize: 11, marginTop: 4 },
  parkPrice: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  parkAccess: { fontSize: 11, marginTop: 6, fontWeight: '700' },

  // Transit
  transitCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  transitTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  transitEmoji: { fontSize: 20, marginRight: 10, marginTop: 2 },
  transitName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  transitHub: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  transitMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  transitMetaText: { color: Colors.text.muted, fontSize: 11 },
  transitCost: { fontSize: 11, fontWeight: '800' },
  transitAccess: { color: Colors.text.secondary, fontSize: 11, marginTop: 6, lineHeight: 15 },

  // Medical
  medCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  medTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  medEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  medName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  medLoc: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  medCapRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  medCapPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  medCapText: { fontSize: 10, fontWeight: '800' },
  medFootRow: { marginTop: 8 },
  medPhone: { color: Colors.tech.neonBlue, fontSize: 11, fontWeight: '800' },
  medEsc: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 3 },

  // Schedule
  schedDayBlock: { marginBottom: 14 },
  schedDayLabel: {
    color: Colors.tech.neonBlue,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 6,
  },
  schedRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  schedTimeCol: { width: 50, alignItems: 'flex-start', marginRight: 10 },
  schedStart: { color: Colors.text.primary, fontSize: 12, fontWeight: '800' },
  schedEnd: { color: Colors.text.muted, fontSize: 10, marginTop: 1 },
  schedTitle: { color: Colors.text.primary, fontSize: 12, fontWeight: '800', lineHeight: 16 },
  schedMeta: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },

  // Phase 3t shared section wrappers
  sectionBlock: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Merch
  merchCard: {
    width: 180,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  merchEmoji: { fontSize: 28 },
  merchItem: { color: Colors.text.primary, fontSize: 12, fontWeight: '800', marginTop: 8, lineHeight: 16 },
  merchPrice: { fontSize: 18, fontWeight: '900', marginTop: 6 },
  merchStock: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  merchMaterial: { color: Colors.text.secondary, fontSize: 10, lineHeight: 13, marginTop: 6 },
  merchNote: { color: Colors.text.muted, fontSize: 10, lineHeight: 13, marginTop: 4, fontStyle: 'italic' },

  // Green ops
  goRow: {
    flexDirection: 'row',
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  goEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  goTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goArea: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', flex: 1 },
  goStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginLeft: 8 },
  goStatusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  goAction: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  goOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },

  // Risk
  riskCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  riskTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  riskEmoji: { fontSize: 22, marginRight: 10, marginTop: 2 },
  riskTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  riskOwner: { color: Colors.text.muted, fontSize: 10, marginTop: 2, fontStyle: 'italic' },
  riskPillRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  riskPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 8,
  },
  riskPillLabel: { color: Colors.text.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  riskPillText: { color: Colors.text.primary, fontSize: 12, fontWeight: '800', marginTop: 2, textTransform: 'capitalize' },
  riskMitigation: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 8 },

  // Photo briefs
  pbCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  pbTopRow: { flexDirection: 'row', alignItems: 'center' },
  pbEmoji: { fontSize: 22, marginRight: 10 },
  pbSlot: { color: Colors.text.primary, fontSize: 13, fontWeight: '800' },
  pbCamera: { color: Colors.text.secondary, fontSize: 11, marginTop: 2 },
  pbSectionLabel: {
    color: Colors.text.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },
  pbBody: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15 },

  // After-party
  apCard: {
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  apTopRow: { flexDirection: 'row', alignItems: 'center' },
  apEmoji: { fontSize: 22, marginRight: 10 },
  apName: { color: Colors.text.primary, fontSize: 13, fontWeight: '800', lineHeight: 17 },
  apSlot: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  apSignup: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginLeft: 8 },
  apSignupText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  apCapacity: { color: Colors.text.secondary, fontSize: 11, marginTop: 8, fontWeight: '700' },
  apVibe: { color: Colors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 6 },

  // Weather
  wwCard: {
    width: 140,
    backgroundColor: '#0D141B',
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  wwHour: { color: Colors.text.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  wwEmoji: { fontSize: 30, marginTop: 6 },
  wwTemp: { fontSize: 20, fontWeight: '900', marginTop: 6 },
  wwCondition: { color: Colors.text.primary, fontSize: 12, fontWeight: '700', marginTop: 4, lineHeight: 16 },
  wwHumidity: { color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  wwNote: { color: Colors.text.secondary, fontSize: 10, lineHeight: 13, marginTop: 6 },
});

export default EventsScreen;
