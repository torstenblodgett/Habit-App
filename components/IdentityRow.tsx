import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IdentityCategory } from '../types';
import { IDENTITY_LABELS } from '../constants/identity';
import { THEME } from '../constants/theme';
import { ProgressBar } from './ProgressBar';

interface IdentityRowProps {
  category: IdentityCategory;
  score: number; // 0–100
}

function getBarColor(score: number): string {
  if (score >= 80) return THEME.verdictColor.Elite;
  if (score >= 60) return THEME.verdictColor.Excellent;
  if (score >= 40) return THEME.verdictColor.Strong;
  if (score >= 20) return THEME.verdictColor.Decent;
  return THEME.border;
}

export function IdentityRow({ category, score }: IdentityRowProps) {
  const label = IDENTITY_LABELS[category];
  const barColor = getBarColor(score);
  const hasData = score > 0;

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.name}>{label}</Text>
        <Text style={[styles.score, { color: hasData ? THEME.text.primary : THEME.text.tertiary }]}>
          {hasData ? `${score}%` : '—'}
        </Text>
      </View>
      <ProgressBar progress={score / 100} color={barColor} height={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 9,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '400',
    color: THEME.text.primary,
  },
  score: {
    fontSize: 14,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
