/**
 * Preset Browser — browse and add habits from the standard library.
 * Presented as a modal from the Habits screen "+ New" button.
 *
 * Presets are organised into category tabs. One tap adds a habit to the
 * user's active list; the row button immediately shows a checkmark.
 * A "Build a custom habit" link at the bottom routes to the habit form.
 */
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAppData } from '../hooks/useAppData';
import { THEME } from '../constants/theme';
import { PRESETS, PRESET_CATEGORIES } from '../constants/presets';
import { PresetCategory, PresetHabit } from '../types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PresetBrowserScreen() {
  const { habits, addPresetHabit } = useAppData();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('Fitness');

  const presetsForCategory = PRESETS.filter((p) => p.category === selectedCategory);

  // A preset is "added" if any active habit links back to its presetId.
  // Archiving a preset habit and re-adding it is intentionally allowed.
  const isAdded = (preset: PresetHabit): boolean =>
    habits.some((h) => h.isActive && h.presetId === preset.presetId);

  const handleAdd = (preset: PresetHabit) => {
    if (isAdded(preset)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addPresetHabit(preset);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Modal header */}
      <View style={styles.header}>
        <Text style={styles.title}>Add Habits</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Done">
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillScroll}
        contentContainerStyle={styles.pillContent}
      >
        {PRESET_CATEGORIES.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Preset list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {presetsForCategory.map((preset, index) => {
            const added = isAdded(preset);
            const pointColor = preset.type === 'positive' ? THEME.positive : THEME.negative;
            const pointLabel =
              preset.type === 'positive' ? `+${preset.points}` : `−${preset.points}`;

            return (
              <React.Fragment key={preset.presetId}>
                <View style={styles.row}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowName}>{preset.name}</Text>
                    <View style={styles.rowMeta}>
                      <Text style={[styles.rowPoints, { color: pointColor }]}>{pointLabel}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.rowIdentity}>
                        {capitalize(preset.identityCategory)}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleAdd(preset)}
                    disabled={added}
                    style={({ pressed }) => [
                      styles.addButton,
                      added && styles.addButtonAdded,
                      pressed && !added && styles.addButtonPressed,
                    ]}
                    accessibilityLabel={added ? `${preset.name} added` : `Add ${preset.name}`}
                    accessibilityState={{ disabled: added }}
                  >
                    {added ? (
                      <SymbolView name="checkmark" tintColor={THEME.text.tertiary} size={13} />
                    ) : (
                      <Text style={styles.addButtonText}>Add</Text>
                    )}
                  </Pressable>
                </View>

                {index < presetsForCategory.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Custom habit link */}
        <Pressable
          onPress={() => router.replace('/habit-form')}
          style={({ pressed }) => [styles.customRow, pressed && styles.customRowPressed]}
          accessibilityLabel="Build a custom habit"
        >
          <Text style={styles.customText}>Build a custom habit</Text>
          <SymbolView name="chevron.right" tintColor={THEME.text.tertiary} size={13} />
        </Pressable>

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

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.accent,
  },

  // ── Category pills ───────────────────────────────────────────────────────
  pillScroll: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  pillContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: THEME.surface,
  },
  pillActive: {
    backgroundColor: THEME.text.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.text.secondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ── Preset list ──────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowMain: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '400',
    color: THEME.text.primary,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rowPoints: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  metaDot: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },
  rowIdentity: {
    fontSize: 12,
    color: THEME.text.tertiary,
  },

  // ── Add button ───────────────────────────────────────────────────────────
  addButton: {
    backgroundColor: THEME.text.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addButtonAdded: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  addButtonPressed: {
    opacity: 0.65,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: THEME.border,
    marginLeft: 16,
  },

  // ── Custom habit link ─────────────────────────────────────────────────────
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: THEME.surface,
    borderRadius: 16,
  },
  customRowPressed: {
    opacity: 0.65,
  },
  customText: {
    fontSize: 15,
    color: THEME.text.primary,
    fontWeight: '400',
  },

  bottomPad: { height: 20 },
});
