/**
 * Today Screen — the primary screen.
 *
 * Shows: score, verdict, target progress, positive habits ("Build Your Day"),
 * negative habits ("Avoid"), weekly average, and a share button.
 */
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useRouter } from 'expo-router';

import { useAppData } from '../../hooks/useAppData';
import { HabitRow } from '../../components/HabitRow';
import { Divider } from '../../components/Divider';
import { SectionHeader } from '../../components/SectionHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { VerdictBadge } from '../../components/VerdictBadge';
import { EmptyHabits } from '../../components/EmptyHabits';
import { ShareCard } from '../../components/ShareCard';
import { THEME } from '../../constants/theme';
import { getMotivationalText } from '../../utils/scoring';
import { formatDisplayDate, today } from '../../utils/dates';

export default function TodayScreen() {
  const {
    habits,
    todayLog,
    todayScore,
    todayVerdict,
    todayTarget,
    weeklyAverage,
    isLoading,
    toggleHabit,
    toggleNegativeHabit,
  } = useAppData();

  const todayStr = today();
  const router = useRouter();
  const shareRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const activeHabits = habits.filter((h) => h.isActive);
  const positiveHabits = activeHabits.filter((h) => h.type === 'positive');
  const negativeHabits = activeHabits.filter((h) => h.type === 'negative');

  const progress = todayTarget > 0 ? Math.min(1, todayScore / todayTarget) : 0;
  const targetReached = todayScore >= todayTarget;
  // Use neutral colour at 0 so first-launch doesn't open on alarming red "COLLAPSE"
  const verdictColor = todayScore > 0 ? THEME.verdictColor[todayVerdict] : THEME.text.primary;
  const motivationalText = getMotivationalText(todayScore, todayTarget);

  const handleShare = async () => {
    if (!shareRef.current) return;
    try {
      setIsSharing(true);
      const uri = await (shareRef.current as any).capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Error', 'Could not capture the share card.');
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator color={THEME.text.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {/* Off-screen share card — positioned outside viewport for ViewShot capture */}
      <ViewShot
        ref={shareRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.offScreen}
      >
        <ShareCard
          todayLog={todayLog}
          habits={habits}
          weeklyAverage={weeklyAverage}
          verdict={todayVerdict}
          score={todayScore}
          target={todayTarget}
        />
      </ViewShot>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row: date + weekly avg */}
          <View style={styles.header}>
            <Text style={styles.dateLabel}>{formatDisplayDate(todayStr)}</Text>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyMeta}>Weekly avg</Text>
              <Text style={styles.weeklyValue}>{weeklyAverage > 0 ? weeklyAverage : '—'}</Text>
            </View>
          </View>

          {/* Score hero */}
          <View style={styles.hero}>
            <Text
              style={[styles.scoreNumber, { color: verdictColor }]}
              accessibilityLabel={`Score ${todayScore}`}
            >
              {todayScore}
            </Text>
            {/* Only show verdict once the user has started logging — avoids "COLLAPSE" on first launch */}
            {todayScore > 0 && <VerdictBadge verdict={todayVerdict} size="lg" />}
          </View>

          {/* Target progress */}
          <View style={styles.targetSection}>
            <View style={styles.targetRow}>
              <Text style={styles.motivationalText}>{motivationalText}</Text>
              <Text style={styles.targetValue}>Target {todayTarget}</Text>
            </View>
            <ProgressBar
              progress={progress}
              color={targetReached ? THEME.positive : verdictColor}
              height={4}
            />
          </View>

          {/* Build Your Day */}
          <SectionHeader title="Build Your Day" />
          <View style={styles.habitList}>
            {positiveHabits.length === 0 ? (
              <EmptyHabits type="positive" onNavigate={() => router.push('/(tabs)/habits')} />
            ) : (
              positiveHabits.map((habit, index) => (
                <React.Fragment key={habit.id}>
                  <HabitRow
                    habit={habit}
                    isActive={todayLog.completedHabitIds.includes(habit.id)}
                    onPress={() => toggleHabit(habit.id)}
                  />
                  {index < positiveHabits.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </View>

          {/* Avoid — only rendered when the user has negative habits set up */}
          {negativeHabits.length > 0 && (
            <>
              <SectionHeader title="Avoid" />
              <View style={styles.habitList}>
                {negativeHabits.map((habit, index) => (
                  <React.Fragment key={habit.id}>
                    <HabitRow
                      habit={habit}
                      isActive={todayLog.triggeredNegativeHabitIds.includes(habit.id)}
                      onPress={() => toggleNegativeHabit(habit.id)}
                    />
                    {index < negativeHabits.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </View>
            </>
          )}

          {/* Share */}
          <View style={styles.shareRow}>
            <Pressable
              onPress={handleShare}
              disabled={isSharing}
              style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}
              accessibilityLabel="Share today's score card"
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Capturing…' : 'Share Day Card'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.bg,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  offScreen: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    color: THEME.text.secondary,
  },
  weeklyBadge: {
    alignItems: 'flex-end',
  },
  weeklyMeta: {
    fontSize: 11,
    fontWeight: '400',
    color: THEME.text.tertiary,
  },
  weeklyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text.secondary,
    fontVariant: ['tabular-nums'],
  },

  // Score
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  scoreNumber: {
    fontSize: 96,
    fontWeight: '800',
    lineHeight: 100,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
  },

  // Target
  targetSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text.secondary,
  },
  targetValue: {
    fontSize: 13,
    color: THEME.text.tertiary,
    fontVariant: ['tabular-nums'],
  },

  // Habits
  habitList: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Share
  shareRow: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  shareButton: {
    backgroundColor: THEME.text.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  shareButtonPressed: {
    opacity: 0.65,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomPad: { height: 20 },
});
