import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppData } from '../../hooks/useAppData';
import { StatCard } from '../../components/StatCard';
import { VerdictBadge } from '../../components/VerdictBadge';
import { THEME } from '../../constants/theme';
import { getLast7Days, getLast30Days, formatShortDate, today } from '../../utils/dates';
import {
  getCurrentStreak,
  countVerdictDays,
  getBestDay,
  getRecentDayScores,
  getHabitConsistency,
} from '../../utils/stats';
import { getVerdict } from '../../utils/scoring';

const BAR_MAX_HEIGHT = 72; // px — fixed track height for reliable layout

export default function StatsScreen() {
  const { dayLogs, habits, weeklyAverage, monthlyAverage, isLoading } = useAppData();

  // Bar chart window toggle
  const [chartWindow, setChartWindow] = useState<'7d' | '30d'>('7d');

  // Habit consistency — which habit is selected (null = auto-select first)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Calendar — tapped date (null = nothing selected)
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  const todayStr = today();
  const last7Days = getLast7Days(todayStr);
  const last30Days = getLast30Days(todayStr);

  const streak = getCurrentStreak(dayLogs, todayStr);
  const strongPlusDays = countVerdictDays(dayLogs, ['Strong', 'Excellent', 'Elite']);
  const bestDay = getBestDay(dayLogs, last30Days);

  // Week-aligned grid for the 30-day calendar (Mon → Sun columns)
  const calWeeks = useMemo(() => {
    const firstDate = new Date(last30Days[0] + 'T00:00:00');
    const jsDay = firstDate.getDay(); // 0=Sun … 6=Sat
    const mondayOffset = jsDay === 0 ? 6 : jsDay - 1; // shift so Mon=0
    const cells: (string | null)[] = [...Array(mondayOffset).fill(null), ...last30Days];
    while (cells.length % 7 !== 0) cells.push(null); // pad to full weeks
    const weeks: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [last30Days]);

  // Bar chart data — reacts to window toggle
  const chartDays = chartWindow === '7d' ? last7Days : last30Days;
  const recentScores = getRecentDayScores(dayLogs, chartDays);
  const maxScore = Math.max(...recentScores.map((d) => d.score), 1);

  // Habit consistency — computed once
  const consistencyData = useMemo(
    () => getHabitConsistency(habits, dayLogs, last30Days),
    [habits, dayLogs, last30Days]
  );

  // Resolve which habit to show (default to first if nothing explicitly selected)
  const effectiveHabitId =
    selectedHabitId && consistencyData.some((h) => h.habitId === selectedHabitId)
      ? selectedHabitId
      : consistencyData[0]?.habitId ?? null;

  const selectedHabit = consistencyData.find((h) => h.habitId === effectiveHabitId) ?? null;

  // Per-day green/gray dots for the selected habit
  const habitDots = useMemo(() => {
    if (!effectiveHabitId) return [];
    return last30Days.map((date) => {
      const log = dayLogs.find((l) => l.date === date);
      return {
        date,
        completed: log?.completedHabitIds.includes(effectiveHabitId) ?? false,
      };
    });
  }, [effectiveHabitId, dayLogs, last30Days]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading} edges={['top']}>
        <ActivityIndicator color={THEME.text.secondary} />
      </SafeAreaView>
    );
  }

  const hasData = dayLogs.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>

        {/* Averages */}
        <View style={styles.row}>
          <StatCard label="Weekly avg" value={weeklyAverage > 0 ? weeklyAverage : '—'} sublabel="Last 7 days" accent />
          <StatCard label="Monthly avg" value={monthlyAverage > 0 ? monthlyAverage : '—'} sublabel="Last 30 days" />
        </View>

        {/* Streak + strong days */}
        <View style={styles.row}>
          <StatCard
            label="Streak"
            value={streak === 0 ? '—' : `${streak}d`}
            sublabel="Consecutive days"
          />
          <StatCard label="Strong+ days" value={strongPlusDays} sublabel="All time" />
        </View>

        {/* Best recent day */}
        {bestDay && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best recent day</Text>
            <View style={styles.bestDayCard}>
              <View style={styles.bestDayLeft}>
                <Text style={styles.bestDayDate}>{formatShortDate(bestDay.date)}</Text>
                <Text style={styles.bestDayScore}>{bestDay.score}</Text>
              </View>
              <VerdictBadge verdict={bestDay.verdict} size="md" />
            </View>
          </View>
        )}

        {/* ── Score history — bar chart with 7D / 30D toggle ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Score history</Text>
            <View style={styles.windowToggle}>
              <Pressable
                onPress={() => setChartWindow('7d')}
                style={[styles.toggleBtn, chartWindow === '7d' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, chartWindow === '7d' && styles.toggleBtnTextActive]}>
                  7D
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setChartWindow('30d')}
                style={[styles.toggleBtn, chartWindow === '30d' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, chartWindow === '30d' && styles.toggleBtnTextActive]}>
                  30D
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={[styles.barsCard, chartWindow === '30d' && styles.barsCard30]}>
            {recentScores.map(({ date, score }) => {
              const verdict = score > 0 ? getVerdict(score) : null;
              const barColor = verdict ? THEME.verdictColor[verdict] : THEME.border;
              const barHeight = score > 0
                ? Math.max(6, Math.round((score / maxScore) * BAR_MAX_HEIGHT))
                : 0;
              const isToday = date === todayStr;

              return (
                <View key={date} style={styles.barColumn}>
                  {score > 0 && (
                    <Text style={styles.barScore}>{score}</Text>
                  )}
                  <View style={styles.barTrack}>
                    {barHeight > 0 && (
                      <View
                        style={[
                          styles.barFill,
                          { height: barHeight, backgroundColor: barColor },
                        ]}
                      />
                    )}
                  </View>
                  {/* Date labels only in 7D mode — too cramped at 30 bars */}
                  {chartWindow === '7d' && (
                    <Text style={[styles.barDate, isToday && styles.barDateToday]}>
                      {formatShortDate(date).split(' ')[0]}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Last 30 days — week-aligned heat-map calendar ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 days</Text>
          <View style={styles.calendarCard}>

            {/* Mon–Sun column headers */}
            <View style={styles.calWeekRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <View key={i} style={styles.dot}>
                  <Text style={styles.calDayLabel}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Week rows */}
            <View style={styles.calGrid}>
              {calWeeks.map((week, rowIdx) => (
                <View key={rowIdx} style={styles.calWeekRow}>
                  {week.map((date, colIdx) => {
                    if (!date) return <View key={colIdx} style={styles.dot} />;
                    const score = dayLogs.find((l) => l.date === date)?.score ?? 0;
                    const dotColor =
                      score <= 0 ? THEME.border
                      : score < 40 ? '#FF3B30'
                      : score < 70 ? '#E6AA00'
                      : THEME.positive;
                    const isSelected = date === selectedCalDate;
                    return (
                      <Pressable
                        key={colIdx}
                        onPress={() => setSelectedCalDate((prev) => prev === date ? null : date)}
                        style={[styles.dot, { backgroundColor: dotColor }, isSelected && styles.dotSelected]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Tapped day detail — fixed-height row to prevent layout shift */}
            <Text style={styles.calSelectedInfo}>
              {selectedCalDate ? (() => {
                const score = dayLogs.find((l) => l.date === selectedCalDate)?.score ?? 0;
                return `${formatShortDate(selectedCalDate)}  ·  ${score > 0 ? `Score ${score}` : 'No activity'}`;
              })() : ' '}
            </Text>

            {/* Legend */}
            <View style={styles.calLegend}>
              {([
                { color: THEME.border,   label: 'None'  },
                { color: '#FF3B30',      label: '< 40'  },
                { color: '#E6AA00',      label: '40–69' },
                { color: THEME.positive, label: '70+'   },
              ] as const).map(({ color, label }) => (
                <View key={label} style={styles.calLegendItem}>
                  <View style={[styles.calLegendDot, { backgroundColor: color }]} />
                  <Text style={styles.calLegendLabel}>{label}</Text>
                </View>
              ))}
            </View>

          </View>
        </View>

        {/* ── Habit consistency — per-habit selector + dot grid ── */}
        {consistencyData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit consistency</Text>

            {/* Horizontal habit selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillScroller}
              style={styles.pillScrollView}
            >
              {consistencyData.map((item) => {
                const active = item.habitId === effectiveHabitId;
                return (
                  <Pressable
                    key={item.habitId}
                    onPress={() => setSelectedHabitId(item.habitId)}
                    style={[styles.habitPill, active && styles.habitPillActive]}
                  >
                    <Text style={[styles.habitPillText, active && styles.habitPillTextActive]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Detail card — 30-day completion dots + summary */}
            {selectedHabit && (
              <View style={styles.consistencyCard}>
                <View style={styles.dotGrid}>
                  {habitDots.map(({ date, completed }) => (
                    <View
                      key={date}
                      style={[
                        styles.dot,
                        { backgroundColor: completed ? THEME.positive : THEME.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.consistencyStat}>
                  {selectedHabit.completedCount} / 30 days
                  {'  ·  '}
                  {Math.round(selectedHabit.rate * 100)}%
                </Text>
              </View>
            )}
          </View>
        )}

        {!hasData && (
          <View style={styles.emptyNote}>
            <Text style={styles.emptyText}>Log habits every day to build your stats.</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.bg,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.text.primary,
    letterSpacing: -0.5,
  },

  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: THEME.text.tertiary,
    textTransform: 'uppercase',
  },

  // ─── 7D / 30D toggle ──────────────────────────────────────────────────────

  windowToggle: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: THEME.text.primary,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text.tertiary,
    letterSpacing: 0.3,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },

  // ─── Best day card ────────────────────────────────────────────────────────

  bestDayCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestDayLeft: { gap: 4 },
  bestDayDate: {
    fontSize: 13,
    color: THEME.text.tertiary,
  },
  bestDayScore: {
    fontSize: 42,
    fontWeight: '800',
    color: THEME.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },

  // ─── Bar chart ────────────────────────────────────────────────────────────

  barsCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  // In 30D mode: tighter gaps, no date labels
  barsCard30: {
    gap: 2,
    paddingHorizontal: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barScore: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.text.tertiary,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    width: '100%',
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barDate: {
    fontSize: 9,
    color: THEME.text.tertiary,
    fontWeight: '500',
  },
  barDateToday: {
    color: THEME.text.primary,
    fontWeight: '700',
  },

  // ─── Dot grid (shared by verdict calendar + habit consistency) ────────────

  calendarCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ring shown on the selected dot
  dotSelected: {
    borderWidth: 2,
    borderColor: THEME.text.primary,
  },

  // ─── Week-grid calendar ───────────────────────────────────────────────────

  calGrid: {
    gap: 6, // row spacing
    marginTop: 6,
  },
  calWeekRow: {
    flexDirection: 'row',
    gap: 6, // column spacing — matches dot width + gap of dotGrid
  },
  calDayLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.text.tertiary,
    letterSpacing: 0.3,
  },
  // Fixed-height text row so the card doesn't jump when a dot is tapped
  calSelectedInfo: {
    fontSize: 13,
    color: THEME.text.secondary,
    marginTop: 12,
    height: 18, // reserve space whether or not text is showing
    fontVariant: ['tabular-nums'],
  },
  calLegend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  calLegendItem: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  calLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calLegendLabel: {
    fontSize: 11,
    color: THEME.text.tertiary,
    fontVariant: ['tabular-nums'],
  },

  // ─── Habit consistency ────────────────────────────────────────────────────

  pillScrollView: {
    marginBottom: 10,
  },
  pillScroller: {
    gap: 8,
    paddingRight: 4,
  },
  habitPill: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  habitPillActive: {
    backgroundColor: THEME.text.primary,
  },
  habitPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.text.secondary,
  },
  habitPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  consistencyCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
  },
  consistencyStat: {
    fontSize: 13,
    color: THEME.text.tertiary,
    paddingTop: 12,
    fontVariant: ['tabular-nums'],
  },

  emptyNote: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.text.tertiary,
    lineHeight: 20,
  },
  bottomPad: { height: 20 },
});
