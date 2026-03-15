import React from 'react';
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
import { useRouter } from 'expo-router';

import { useAppData } from '../../hooks/useAppData';
import { SectionHeader } from '../../components/SectionHeader';
import { Divider } from '../../components/Divider';
import { THEME } from '../../constants/theme';
import { IDENTITY_LABELS } from '../../constants/identity';
import { Habit } from '../../types';

function HabitManageRow({
  habit,
  onEdit,
  onDeactivate,
}: {
  habit: Habit;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const pointSign = habit.type === 'positive' ? '+' : '−';
  const pointColor = habit.type === 'positive' ? THEME.positive : THEME.negative;

  const confirmDeactivate = () => {
    Alert.alert(
      'Archive habit?',
      `"${habit.name}" will be removed from your daily list. You can re-add it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: onDeactivate },
      ]
    );
  };

  return (
    <View style={styles.habitRow}>
      <Pressable onPress={onEdit} style={styles.habitMain} accessibilityLabel={`Edit ${habit.name}`}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitMeta}>
            {IDENTITY_LABELS[habit.identityCategory]}
            {'  ·  '}
            <Text style={styles.habitOrigin}>
              {habit.isPreset ? 'Standard' : 'Custom'}
            </Text>
          </Text>
        </View>
        <Text style={[styles.habitPoints, { color: pointColor }]}>
          {pointSign}{habit.points}
        </Text>
      </Pressable>
      <Pressable
        onPress={confirmDeactivate}
        style={styles.archiveButton}
        accessibilityLabel={`Archive ${habit.name}`}
        hitSlop={8}
      >
        <Text style={styles.archiveText}>Archive</Text>
      </Pressable>
    </View>
  );
}

export default function HabitsScreen() {
  const { habits, isLoading, deactivateHabit } = useAppData();
  const router = useRouter();

  const activeHabits = habits.filter((h) => h.isActive);
  const positiveHabits = activeHabits.filter((h) => h.type === 'positive');
  const negativeHabits = activeHabits.filter((h) => h.type === 'negative');

  // "+ New" opens the preset browser; editing a specific habit goes straight to the form.
  const openPresetBrowser = () => {
    router.push({ pathname: '/preset-browser' });
  };

  const navigateToForm = (habitId: string) => {
    router.push({ pathname: '/habit-form', params: { habitId } });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loading} edges={['top']}>
        <ActivityIndicator color={THEME.text.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <Pressable
            onPress={openPresetBrowser}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            accessibilityLabel="Add new habit"
          >
            <Text style={styles.addButtonText}>+ New</Text>
          </Pressable>
        </View>

        {activeHabits.length === 0 ? (
          // First-time empty state — show a single clear explanation, no redundant section headers
          <View style={styles.globalEmpty}>
            <Text style={styles.globalEmptyTitle}>No habits yet</Text>
            <Text style={styles.globalEmptyText}>
              Add positive habits that build your score, and negative habits that track what
              to avoid. Tap + New to get started.
            </Text>
          </View>
        ) : (
          <>
            {/* Positive */}
            <SectionHeader title="Build Your Day" />
            {positiveHabits.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>Tap + New to add a positive habit.</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {positiveHabits.map((habit, index) => (
                  <React.Fragment key={habit.id}>
                    <HabitManageRow
                      habit={habit}
                      onEdit={() => navigateToForm(habit.id)}
                      onDeactivate={() => { deactivateHabit(habit.id).catch(() => {}); }}
                    />
                    {index < positiveHabits.length - 1 && <Divider inset={16} />}
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* Negative */}
            <SectionHeader title="Avoid" />
            {negativeHabits.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>Tap + New to add a habit to avoid.</Text>
              </View>
            ) : (
              <View style={styles.listCard}>
                {negativeHabits.map((habit, index) => (
                  <React.Fragment key={habit.id}>
                    <HabitManageRow
                      habit={habit}
                      onEdit={() => navigateToForm(habit.id)}
                      onDeactivate={() => { deactivateHabit(habit.id).catch(() => {}); }}
                    />
                    {index < negativeHabits.length - 1 && <Divider inset={16} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.text.primary,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: THEME.text.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonPressed: { opacity: 0.65 },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  listCard: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  habitMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  habitInfo: {
    flex: 1,
    gap: 2,
  },
  habitName: {
    fontSize: 16,
    color: THEME.text.primary,
    fontWeight: '400',
  },
  habitMeta: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },
  habitOrigin: {
    fontSize: 11,
    color: THEME.text.tertiary,
    opacity: 0.7,
  },
  habitPoints: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  archiveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  archiveText: {
    fontSize: 13,
    color: THEME.text.tertiary,
  },

  emptyRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.text.tertiary,
  },

  globalEmpty: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 8,
  },
  globalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  globalEmptyText: {
    fontSize: 14,
    color: THEME.text.tertiary,
    lineHeight: 20,
  },

  bottomPad: { height: 20 },
});
