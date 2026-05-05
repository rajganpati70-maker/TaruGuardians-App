// ================================================================
// INTERACTIVE POLL — Tap to vote, animated results, live counts
// ================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PollAnswer {
  label: string;
  pct: number;
  color: string;
}

interface PollData {
  id: string;
  question: string;
  total: number;
  finishedAt: string;
  commentary: string;
  answers: PollAnswer[];
}

interface InteractivePollProps {
  poll: PollData;
}

const InteractivePoll: React.FC<InteractivePollProps> = ({ poll }) => {
  const [voted, setVoted]     = useState<string | null>(null);
  const [counts, setCounts]   = useState(
    Object.fromEntries(poll.answers.map((a) => [a.label, a.pct]))
  );
  const [total, setTotal]     = useState(poll.total);

  // One Animated.Value per answer bar
  const barAnims = useRef(
    poll.answers.map(() => new Animated.Value(0))
  ).current;
  const cardScale  = useRef(new Animated.Value(1)).current;
  const resultsFade = useRef(new Animated.Value(0)).current;
  const checkScale  = useRef(new Animated.Value(0)).current;

  // Animate bars in on mount (display mode) — after a vote only
  const animateBars = (pcts: number[]) => {
    Animated.parallel([
      Animated.timing(resultsFade, {
        toValue: 1, duration: 280, useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }),
      ...barAnims.map((bar, i) =>
        Animated.spring(bar, {
          toValue: pcts[i],
          useNativeDriver: false,
          tension: 55,
          friction: 9,
        })
      ),
    ]).start();
  };

  const handleVote = (label: string) => {
    if (voted) return;

    // Recalculate percentages with the new vote added
    const newTotal = total + 1;
    const originalVotes = Object.fromEntries(
      poll.answers.map((a) => [a.label, Math.round((a.pct / 100) * poll.total)])
    );
    originalVotes[label] = (originalVotes[label] ?? 0) + 1;

    const newPcts = Object.fromEntries(
      poll.answers.map((a) => [
        a.label,
        Math.round((originalVotes[a.label]! / newTotal) * 100),
      ])
    );

    // Button press feel
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.97, duration: 80, useNativeDriver: false }),
      Animated.timing(cardScale, { toValue: 1.0,  duration: 120, useNativeDriver: false }),
    ]).start();

    setCounts(newPcts);
    setTotal(newTotal);
    setVoted(label);
    animateBars(poll.answers.map((a) => newPcts[a.label]!));

    // Check mark pop
    Animated.spring(checkScale, {
      toValue: 1, useNativeDriver: false, tension: 80, friction: 6,
    }).start();
  };

  const isVoted = voted !== null;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.question}>{poll.question}</Text>
        <Text style={styles.meta}>
          {total} voted{isVoted ? ' · ✓ You voted' : ''} · {poll.finishedAt}
        </Text>
      </View>

      {/* Options */}
      {poll.answers.map((a, i) => {
        const isSelected = voted === a.label;
        const pct = isVoted ? (counts[a.label] ?? a.pct) : a.pct;

        return (
          <TouchableOpacity
            key={a.label}
            onPress={() => handleVote(a.label)}
            disabled={isVoted}
            activeOpacity={0.75}
            style={[
              styles.optionBtn,
              isVoted && isSelected && { borderColor: a.color, borderWidth: 1.5 },
              isVoted && !isSelected && { opacity: 0.65 },
            ]}
          >
            {/* Bar fill behind the option (post-vote) */}
            {isVoted && (
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: a.color + '22',
                    width: barAnims[i].interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            )}

            {/* Label row */}
            <View style={styles.optionRow}>
              {/* Radio / Check */}
              <View style={[styles.radio, isSelected && { borderColor: a.color }]}>
                {isSelected && (
                  <Animated.View
                    style={[
                      styles.radioDot,
                      {
                        backgroundColor: a.color,
                        transform: [{ scale: checkScale }],
                      },
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: '#fff', fontWeight: '700' },
                ]}
                numberOfLines={2}
              >
                {a.label}
              </Text>

              {/* Percentage (only shown after voting) */}
              {isVoted && (
                <Animated.Text
                  style={[
                    styles.pctText,
                    { color: a.color, opacity: resultsFade },
                  ]}
                >
                  {pct}%
                </Animated.Text>
              )}
            </View>

            {/* Thin bottom progress bar (post-vote) */}
            {isVoted && (
              <View style={styles.trackRow}>
                <View style={styles.track}>
                  <Animated.View
                    style={[
                      styles.trackFill,
                      {
                        backgroundColor: a.color,
                        width: barAnims[i].interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Vote prompt / commentary */}
      {!isVoted ? (
        <View style={styles.promptRow}>
          <Text style={styles.promptText}>👆 Tap an option to vote</Text>
        </View>
      ) : (
        <Text style={styles.commentary}>{poll.commentary}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D141B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerRow: { marginBottom: 14 },
  question: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  meta: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 5,
    fontWeight: '600',
  },
  optionBtn: {
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  optionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
    flexShrink: 0,
    minWidth: 32,
    textAlign: 'right',
  },
  trackRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  promptRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  promptText: {
    color: '#475569',
    fontSize: 11,
    fontStyle: 'italic',
  },
  commentary: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default InteractivePoll;
