import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { Habit } from '../types';
import { THEME } from '../constants/theme';

interface HabitRowProps {
  habit: Habit;
  isActive: boolean; // completed (positive) or triggered (negative)
  onPress: () => void;
}

export function HabitRow({ habit, isActive, onPress }: HabitRowProps) {
  const isPositive = habit.type === 'positive';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const checkColor = isPositive
    ? isActive
      ? THEME.positive
      : THEME.border
    : isActive
    ? THEME.negative
    : THEME.border;

  const pointLabel = isPositive
    ? `+${habit.points}`
    : isActive
    ? `-${habit.points}`
    : `−${habit.points}`;

  const pointColor = isPositive
    ? isActive
      ? THEME.positive
      : THEME.text.tertiary
    : isActive
    ? THEME.negative
    : THEME.text.tertiary;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
      accessibilityLabel={`${habit.name}, ${pointLabel}`}
    >
      {/* Check / X indicator — SF Symbol for crisp native glyphs */}
      <View
        style={[
          styles.check,
          {
            borderColor: checkColor,
            backgroundColor: isActive ? checkColor : 'transparent',
          },
        ]}
      >
        {isActive && (
          <SymbolView
            name={isPositive ? 'checkmark' : 'xmark'}
            tintColor="#FFFFFF"
            size={10}
          />
        )}
      </View>

      <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
        {habit.name}
      </Text>

      <Text style={[styles.points, { color: pointColor }]}>{pointLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 13,
  },
  pressed: {
    opacity: 0.55,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: THEME.text.primary,
    fontWeight: '400',
  },
  nameActive: {
    color: THEME.text.secondary,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
});
