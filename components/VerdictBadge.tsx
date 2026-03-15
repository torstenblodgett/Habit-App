import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Verdict } from '../types';
import { THEME } from '../constants/theme';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
}

// lg is typographic — pure bold colored text, no box.
// sm/md retain the subtle pill + border treatment for use in compact contexts.
const SIZE_STYLES = {
  sm: { fontSize: 10, letterSpacing: 0.7, paddingHorizontal: 7, paddingVertical: 3 },
  md: { fontSize: 12, letterSpacing: 0.8, paddingHorizontal: 10, paddingVertical: 4 },
  lg: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 1.8 },
};

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const color = THEME.verdictColor[verdict];
  const sizeStyle = SIZE_STYLES[size];
  const isPill = size !== 'lg';

  return (
    <Text
      style={[
        styles.base,
        isPill && styles.pill,
        sizeStyle,
        isPill
          ? {
              color,
              borderColor: `${color}33`,
              backgroundColor: `${color}12`,
            }
          : { color },
      ]}
    >
      {verdict.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  pill: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
