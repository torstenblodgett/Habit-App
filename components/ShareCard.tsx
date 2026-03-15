/**
 * ShareCard — a self-contained visual summary of a day, rendered off-screen
 * so it can be captured with react-native-view-shot and shared.
 *
 * Status: UI complete. Capture + share are wired in the Today screen.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayLog, Habit, Verdict } from '../types';
import { THEME } from '../constants/theme';
import { formatDisplayDate } from '../utils/dates';

interface ShareCardProps {
  todayLog: DayLog;
  habits: Habit[];
  weeklyAverage: number;
  verdict: Verdict;
  score: number;
  target: number;
}

export function ShareCard({ todayLog, habits, weeklyAverage, verdict, score, target }: ShareCardProps) {
  const verdictColor = THEME.verdictColor[verdict];

  // Up to 4 completed positive habits for display
  const completedPositive = habits
    .filter((h) => h.type === 'positive' && todayLog.completedHabitIds.includes(h.id))
    .slice(0, 4);

  const progress = Math.min(1, score / Math.max(target, 1));
  // Card is 340px wide with 28px padding each side → 284px track.
  // Use pixel width so ViewShot captures the bar reliably (% widths can be unreliable off-screen).
  const barFillWidth = Math.round(progress * 284);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>SCORECARD</Text>
        <Text style={styles.date}>{formatDisplayDate(todayLog.date)}</Text>
      </View>

      {/* Score */}
      <View style={styles.scoreSection}>
        <Text style={[styles.score, { color: verdictColor }]}>{score}</Text>
        <Text style={[styles.verdict, { color: verdictColor }]}>{verdict}</Text>
      </View>

      {/* Target bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: barFillWidth, backgroundColor: verdictColor }]} />
      </View>
      <Text style={styles.targetLabel}>Target {target}</Text>

      {/* Completed habits */}
      {completedPositive.length > 0 && (
        <View style={styles.habits}>
          {completedPositive.map((h) => (
            <View key={h.id} style={styles.habitChip}>
              <Text style={styles.habitChipText}>✓ {h.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Weekly avg  {weeklyAverage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: THEME.text.tertiary,
  },
  date: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  score: {
    fontSize: 80,
    fontWeight: '800',
    lineHeight: 88,
    fontVariant: ['tabular-nums'],
  },
  verdict: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barTrack: {
    height: 4,
    backgroundColor: THEME.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 999,
  },
  targetLabel: {
    fontSize: 12,
    color: THEME.text.tertiary,
    marginTop: -8,
  },
  habits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitChip: {
    backgroundColor: THEME.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  habitChipText: {
    fontSize: 13,
    color: THEME.text.secondary,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: THEME.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },
});
