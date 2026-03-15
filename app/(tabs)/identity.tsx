import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppData } from '../../hooks/useAppData';
import { IdentityRow } from '../../components/IdentityRow';
import { Divider } from '../../components/Divider';
import { THEME } from '../../constants/theme';
import { IDENTITY_CATEGORIES } from '../../constants/identity';

export default function IdentityScreen() {
  const { identityScores, habits, isLoading } = useAppData();

  const hasAnyHabits = habits.some((h) => h.isActive && h.type === 'positive');

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
        <View style={styles.header}>
          <Text style={styles.title}>Identity</Text>
          <Text style={styles.subtitle}>
            {hasAnyHabits
              ? 'Based on last 30 days'
              : 'Add habits to start tracking your identity'}
          </Text>
        </View>

        <View style={styles.card}>
          {IDENTITY_CATEGORIES.map((category, index) => {
            const snapshot = identityScores.find((s) => s.category === category);
            const score = snapshot?.score ?? 0;
            return (
              <React.Fragment key={category}>
                <IdentityRow category={category} score={score} />
                {index < IDENTITY_CATEGORIES.length - 1 && <Divider inset={16} />}
              </React.Fragment>
            );
          })}
        </View>

        {!hasAnyHabits && (
          <View style={styles.emptyNote}>
            <Text style={styles.emptyText}>
              Your identity scores grow as you complete positive habits. Each category
              reflects your consistency over the last 30 days.
            </Text>
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
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.text.tertiary,
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyNote: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.text.tertiary,
    lineHeight: 20,
  },
  bottomPad: { height: 20 },
});
