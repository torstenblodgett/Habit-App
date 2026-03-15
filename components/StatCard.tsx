import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sublabel, accent = false }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && { color: THEME.accent }]}>{value}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.6,
    color: THEME.text.tertiary,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 34,
    fontWeight: '700',
    color: THEME.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  sublabel: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },
});
