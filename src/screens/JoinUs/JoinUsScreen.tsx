// =====================================================
// TARU GUARDIANS — JOIN US SCREEN
// Super Premium Multi-Step Recruitment Form
// =====================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const { width: W, height: H } = Dimensions.get('window');
const PAD = 20;

// -------------------------------------------------------
// Wing data
// -------------------------------------------------------
interface Wing {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  skills: string[];
  gradient: readonly [string, string, ...string[]];
  color: string;
}

const WINGS: Wing[] = [
  {
    id: 'content',
    name: 'Content Wing',
    emoji: '✍️',
    tagline: 'Write stories that actually get read.',
    skills: ['Writing', 'Research', 'Storytelling', 'SEO'],
    gradient: ['#3E2B00', '#5A4010'],
    color: '#F59E0B',
  },
  {
    id: 'tech',
    name: 'Tech Wing',
    emoji: '💻',
    tagline: 'Ship tools, not hype.',
    skills: ['React Native', 'Web Dev', 'APIs', 'UI/UX'],
    gradient: ['#053049', '#0A4A6E'],
    color: '#00D4FF',
  },
  {
    id: 'design',
    name: 'Graphic Design',
    emoji: '🎨',
    tagline: 'Every pixel tells a story.',
    skills: ['Figma', 'Branding', 'Typography', 'Illustration'],
    gradient: ['#2A0E3C', '#401458'],
    color: '#F472B6',
  },
  {
    id: 'video',
    name: 'Video Wing',
    emoji: '🎬',
    tagline: 'Motion that makes people stop scrolling.',
    skills: ['DaVinci', 'Premiere', 'Storyboarding', 'Sound'],
    gradient: ['#3E1A0A', '#5A280F'],
    color: '#FB923C',
  },
  {
    id: 'photo',
    name: 'Photography',
    emoji: '📷',
    tagline: 'Capture what others miss.',
    skills: ['Lightroom', 'Composition', 'Events', 'Archiving'],
    gradient: ['#0A3F20', '#0F5C2E'],
    color: '#4ADE80',
  },
  {
    id: 'pr',
    name: 'PR Wing',
    emoji: '📣',
    tagline: 'Build bridges, not just noise.',
    skills: ['Outreach', 'Press', 'Social Media', 'Partnerships'],
    gradient: ['#0E3540', '#135063'],
    color: '#38BDF8',
  },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];

// -------------------------------------------------------
// Floating label input
// -------------------------------------------------------
interface FloatInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

const FloatInput: React.FC<FloatInputProps> = ({
  label, value, onChangeText, multiline, keyboardType = 'default', autoCapitalize = 'sentences',
}) => {
  const floatAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [focused, setFocused] = useState(false);

  const onFocus = () => {
    setFocused(true);
    Animated.spring(floatAnim, { toValue: 1, useNativeDriver: false, friction: 8 }).start();
  };
  const onBlur = () => {
    setFocused(false);
    if (!value) Animated.spring(floatAnim, { toValue: 0, useNativeDriver: false, friction: 8 }).start();
  };

  const labelTop = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [multiline ? 18 : 16, -10] });
  const labelSize = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = floatAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.35)', '#00D4FF'] });
  const borderColor = focused ? '#00D4FF' : 'rgba(255,255,255,0.12)';

  return (
    <View style={[fi.wrap, multiline && fi.wrapMulti]}>
      <Animated.Text style={[fi.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={[fi.input, multiline && fi.inputMulti, { borderColor }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="transparent"
        selectionColor="#00D4FF"
      />
    </View>
  );
};

const fi = StyleSheet.create({
  wrap: { marginBottom: 22, position: 'relative' },
  wrapMulti: { marginBottom: 22 },
  label: { position: 'absolute', left: 16, fontWeight: '600', zIndex: 1, backgroundColor: 'transparent' },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  inputMulti: { height: 110, textAlignVertical: 'top', paddingTop: 28 },
});

// -------------------------------------------------------
// Main screen
// -------------------------------------------------------
const JoinUsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(Array.from({ length: 12 }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    op: new Animated.Value(1),
    scale: new Animated.Value(1),
  }))).current;

  // Form state
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [selectedWing, setSelectedWing] = useState('');
  const [skills, setSkills] = useState('');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const TOTAL_STEPS = 4;

  const goToStep = useCallback((next: number) => {
    const dir = next > step ? 1 : -1;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -dir * W, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * W, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 10, tension: 80 }).start();
    });
    Animated.spring(progressAnim, {
      toValue: next / TOTAL_STEPS,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [step, slideAnim, progressAnim]);

  const fireConfetti = useCallback(() => {
    const anims = particleAnims.map((p, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 80 + Math.random() * 80;
      return Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 700, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * dist - 40, duration: 700, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(p.scale, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(30, anims).start();
  }, [particleAnims]);

  const handleSubmit = useCallback(() => {
    if (!email.trim()) { Alert.alert('Missing', 'Please enter your email.'); return; }
    setSubmitted(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    setTimeout(fireConfetti, 300);
  }, [email, successScale, successOpacity, fireConfetti]);

  const canNext = useCallback(() => {
    if (step === 0) return name.trim().length > 1 && year !== '';
    if (step === 1) return selectedWing !== '';
    if (step === 2) return reason.trim().length > 10;
    return true;
  }, [step, name, year, selectedWing, reason]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const CONFETTI_COLORS = ['#F59E0B', '#00D4FF', '#F472B6', '#4ADE80', '#FB923C', '#A78BFA',
    '#F59E0B', '#00D4FF', '#F472B6', '#4ADE80', '#FB923C', '#A78BFA'];

  // ---- Render steps ----
  const renderStep0 = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepEyebrow}>STEP 1 OF 4</Text>
      <Text style={s.stepTitle}>Who are you? 👋</Text>
      <Text style={s.stepSubtitle}>Tell us a little about yourself to get started.</Text>

      <FloatInput label="Your full name" value={name} onChangeText={setName} autoCapitalize="words" />

      <Text style={s.sectionLabel}>Which year are you in?</Text>
      <View style={s.yearGrid}>
        {YEARS.map((y) => (
          <TouchableOpacity
            key={y}
            style={[s.yearChip, year === y && s.yearChipActive]}
            onPress={() => setYear(y)}
            activeOpacity={0.8}
          >
            <Text style={[s.yearChipText, year === y && s.yearChipTextActive]}>{y}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepEyebrow}>STEP 2 OF 4</Text>
      <Text style={s.stepTitle}>Pick your wing 🌿</Text>
      <Text style={s.stepSubtitle}>Where do you feel most alive? Choose the one that calls to you.</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: H * 0.52 }}>
        {WINGS.map((w) => {
          const active = selectedWing === w.id;
          return (
            <TouchableOpacity
              key={w.id}
              onPress={() => setSelectedWing(w.id)}
              activeOpacity={0.88}
              style={[s.wingCard, active && { borderColor: w.color, borderWidth: 2 }]}
            >
              <LinearGradient colors={active ? [w.gradient[0], w.gradient[1]] : ['#0A0F14', '#111620']} style={s.wingGradient}>
                <View style={s.wingTopRow}>
                  <Text style={s.wingEmoji}>{w.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.wingName, active && { color: w.color }]}>{w.name}</Text>
                    <Text style={s.wingTagline}>{w.tagline}</Text>
                  </View>
                  {active && (
                    <View style={[s.wingCheck, { backgroundColor: w.color }]}>
                      <Text style={s.wingCheckMark}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={s.wingSkillRow}>
                  {w.skills.map((sk) => (
                    <View key={sk} style={[s.wingSkill, { borderColor: w.color + '55' }]}>
                      <Text style={[s.wingSkillText, { color: w.color }]}>{sk}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepEyebrow}>STEP 3 OF 4</Text>
      <Text style={s.stepTitle}>Tell us more 🧠</Text>
      <Text style={s.stepSubtitle}>No right answers. Be honest. We love that.</Text>

      <FloatInput
        label="Why do you want to join Taru Guardians?"
        value={reason}
        onChangeText={setReason}
        multiline
      />
      <FloatInput
        label="Any skills or tools you know? (optional)"
        value={skills}
        onChangeText={setSkills}
        multiline
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={s.stepWrap}>
      <Text style={s.stepEyebrow}>STEP 4 OF 4</Text>
      <Text style={s.stepTitle}>How to reach you 📬</Text>
      <Text style={s.stepSubtitle}>A wing lead will reach out within 3 working days.</Text>

      <FloatInput label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <FloatInput label="Phone number (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      {/* Summary card */}
      <View style={s.summaryCard}>
        <LinearGradient colors={['#0A2F1F', '#071A10']} style={s.summaryGradient}>
          <Text style={s.summaryTitle}>Your application summary</Text>
          <SummaryRow label="Name" value={name} />
          <SummaryRow label="Year" value={year} />
          <SummaryRow label="Wing" value={WINGS.find((w) => w.id === selectedWing)?.name ?? ''} />
          {reason.trim() ? <SummaryRow label="Why" value={reason.slice(0, 80) + (reason.length > 80 ? '…' : '')} /> : null}
        </LinearGradient>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <Animated.View style={[s.successWrap, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
      {/* Confetti particles */}
      {particleAnims.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            s.confettiDot,
            {
              backgroundColor: CONFETTI_COLORS[i],
              transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
              opacity: p.op,
            },
          ]}
        />
      ))}

      <LinearGradient colors={['#042F1A', '#0A3F2A', '#0C5540']} style={s.successCard}>
        <Text style={s.successEmoji}>🌿</Text>
        <Text style={s.successTitle}>You're in the queue!</Text>
        <Text style={s.successSubtitle}>
          Hey {name.split(' ')[0]}! Your interest in the{' '}
          <Text style={{ color: WINGS.find((w) => w.id === selectedWing)?.color ?? '#4ADE80' }}>
            {WINGS.find((w) => w.id === selectedWing)?.name}
          </Text>{' '}
          has been noted. A wing lead will reach out to you at {email} within 3 working days.
        </Text>

        <View style={s.successDivider} />

        <Text style={s.successNote}>
          While you wait — follow us on Instagram and join our WhatsApp community for updates.
        </Text>

        <TouchableOpacity style={s.successBtn} onPress={() => navigation.goBack()} activeOpacity={0.88}>
          <LinearGradient colors={['#00D4FF', '#0066FF']} style={s.successBtnGrad}>
            <Text style={s.successBtnText}>Back to home →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const steps = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={Platform.OS === 'android'} />

      {/* Background gradient blobs */}
      <View style={s.blobTL} pointerEvents="none" />
      <View style={s.blobBR} pointerEvents="none" />

      {/* Header */}
      {!submitted && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => step === 0 ? navigation.goBack() : goToStep(step - 1)} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Join Taru Guardians</Text>
            <Text style={s.headerSub}>Step {step + 1} of {TOTAL_STEPS}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      )}

      {/* Progress bar */}
      {!submitted && (
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: progressWidth }]} />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {submitted ? (
            renderSuccess()
          ) : (
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              {steps[step]?.()}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      {!submitted && (
        <View style={s.bottomBar}>
          {step < TOTAL_STEPS - 1 ? (
            <TouchableOpacity
              style={[s.nextBtn, !canNext() && s.nextBtnDisabled]}
              onPress={() => canNext() && goToStep(step + 1)}
              activeOpacity={canNext() ? 0.85 : 1}
            >
              <LinearGradient
                colors={canNext() ? ['#00D4FF', '#0066FF'] : ['#1A1A2E', '#1A1A2E']}
                style={s.nextBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={[s.nextBtnText, !canNext() && { color: 'rgba(255,255,255,0.3)' }]}>
                  Continue →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.nextBtn} onPress={handleSubmit} activeOpacity={0.88}>
              <LinearGradient colors={['#22C55E', '#16A34A']} style={s.nextBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.nextBtnText}>🌿  Submit application</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {step > 0 && (
            <TouchableOpacity onPress={() => goToStep(step - 1)} style={s.backLinkBtn}>
              <Text style={s.backLinkText}>← Go back</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// -------------------------------------------------------
// Summary row helper
// -------------------------------------------------------
const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) =>
  value ? (
    <View style={sr.row}>
      <Text style={sr.label}>{label}</Text>
      <Text style={sr.value} numberOfLines={2}>{value}</Text>
    </View>
  ) : null;

const sr = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: 8, gap: 8 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', width: 52 },
  value: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
});

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  blobTL: {
    position: 'absolute', top: -80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#00D4FF', opacity: 0.06,
  },
  blobBR: {
    position: 'absolute', bottom: 80, right: -80,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#22C55E', opacity: 0.07,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingTop: 8, paddingBottom: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },

  // Progress
  progressTrack: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: PAD, borderRadius: 2, marginBottom: 4,
  },
  progressFill: {
    height: 3, backgroundColor: '#00D4FF', borderRadius: 2,
  },

  scrollContent: { paddingBottom: 160, paddingTop: 12 },

  // Step
  stepWrap: { paddingHorizontal: PAD },
  stepEyebrow: { fontSize: 11, color: '#00D4FF', fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  stepTitle: { fontSize: 30, color: '#fff', fontWeight: '900', lineHeight: 36, marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 20, marginBottom: 28 },

  sectionLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', marginBottom: 12 },

  // Year chips
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  yearChip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  yearChipActive: { borderColor: '#00D4FF', backgroundColor: '#00D4FF22' },
  yearChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  yearChipTextActive: { color: '#00D4FF' },

  // Wing cards
  wingCard: {
    borderRadius: 18, overflow: 'hidden',
    marginBottom: 12, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  wingGradient: { padding: 14 },
  wingTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  wingEmoji: { fontSize: 28 },
  wingName: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  wingTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 16 },
  wingCheck: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  wingCheckMark: { color: '#000', fontSize: 14, fontWeight: '900' },
  wingSkillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wingSkill: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  wingSkillText: { fontSize: 11, fontWeight: '700' },

  // Summary
  summaryCard: { borderRadius: 18, overflow: 'hidden', marginTop: 8 },
  summaryGradient: { padding: 16 },
  summaryTitle: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAD, paddingBottom: 28, paddingTop: 12,
    backgroundColor: '#000',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  nextBtn: { borderRadius: 18, overflow: 'hidden', marginBottom: 0 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnGrad: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },
  backLinkBtn: { alignItems: 'center', marginTop: 12 },
  backLinkText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: '600' },

  // Success
  successWrap: {
    alignItems: 'center', paddingHorizontal: PAD,
    paddingTop: 40, position: 'relative',
  },
  confettiDot: {
    position: 'absolute', width: 10, height: 10,
    borderRadius: 5, top: '45%', left: '50%',
  },
  successCard: {
    borderRadius: 28, padding: 28, width: '100%', alignItems: 'center',
  },
  successEmoji: { fontSize: 52, marginBottom: 12 },
  successTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  successSubtitle: {
    color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
    lineHeight: 22, marginBottom: 20,
  },
  successDivider: { height: 1, width: '80%', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  successNote: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center',
    lineHeight: 18, marginBottom: 24,
  },
  successBtn: { borderRadius: 18, overflow: 'hidden', width: '100%' },
  successBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  successBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});

export default JoinUsScreen;
