import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: THEME.text.tertiary,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 13,
    color: THEME.text.tertiary,
    marginTop: 2,
  },
});
