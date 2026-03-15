import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface DividerProps {
  /** Left inset. Default 52 aligns past the HabitRow check circle. */
  inset?: number;
}

export function Divider({ inset = 52 }: DividerProps) {
  return <View style={[styles.divider, { marginLeft: inset }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: THEME.border,
  },
});
