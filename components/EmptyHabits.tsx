import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface EmptyHabitsProps {
  type: 'positive' | 'negative';
  onNavigate?: () => void;
}

export function EmptyHabits({ type, onNavigate }: EmptyHabitsProps) {
  const message =
    type === 'positive'
      ? 'No habits added yet.'
      : 'No habits to avoid. Add negative habits to track what to cut.';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {type === 'positive' && onNavigate && (
        <Pressable onPress={onNavigate} hitSlop={8}>
          <Text style={styles.link}>Go to Habits →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
  },
  text: {
    fontSize: 14,
    color: THEME.text.tertiary,
    lineHeight: 20,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
  },
});
