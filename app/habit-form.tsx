/**
 * Habit Form — create or edit a habit.
 * Presented as a modal. Receives optional `habitId` param for edit mode.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppData } from '../hooks/useAppData';
import { THEME } from '../constants/theme';
import { IDENTITY_CATEGORIES, IDENTITY_LABELS } from '../constants/identity';
import { Habit, IdentityCategory } from '../types';
import { generateId } from '../utils/id';

const POINT_OPTIONS = [5, 8, 10, 12, 15, 20, 25, 30];

function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  labelOf,
}: {
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  labelOf: (value: T) => string;
}) {
  return (
    <View style={seg.container}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[seg.option, active && seg.activeOption]}
          >
            <Text style={[seg.label, active && seg.activeLabel]}>{labelOf(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const seg = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: THEME.bg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontSize: 14,
    color: THEME.text.secondary,
    fontWeight: '500',
  },
  activeLabel: {
    color: THEME.text.primary,
    fontWeight: '600',
  },
});

export default function HabitFormScreen() {
  const params = useLocalSearchParams<{ habitId?: string }>();
  const router = useRouter();
  const { habits, addHabit, updateHabit } = useAppData();

  const editingHabit = params.habitId
    ? habits.find((h) => h.id === params.habitId)
    : undefined;
  const isEditing = !!editingHabit;

  // Form state
  const [name, setName] = useState(editingHabit?.name ?? '');
  const [type, setType] = useState<'positive' | 'negative'>(editingHabit?.type ?? 'positive');
  const [points, setPoints] = useState(editingHabit?.points ?? 10);
  const [category, setCategory] = useState<IdentityCategory>(
    editingHabit?.identityCategory ?? 'disciplined'
  );
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Validate on blur
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return 'Habit name is required.';
    if (trimmed.length < 2) return 'Name must be at least 2 characters.';
    if (trimmed.length > 60) return 'Name is too long (max 60 characters).';
    // Check for duplicate names (excluding self in edit mode)
    const duplicate = habits.find(
      (h) =>
        h.isActive &&
        h.name.trim().toLowerCase() === trimmed.toLowerCase() &&
        h.id !== editingHabit?.id
    );
    if (duplicate) return 'A habit with this name already exists.';
    return '';
  };

  const handleSave = async () => {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      if (isEditing && editingHabit) {
        const updated: Habit = {
          ...editingHabit,
          name: name.trim(),
          type,
          points,
          identityCategory: category,
          updatedAt: now,
        };
        await updateHabit(updated);
      } else {
        // userId is intentionally absent — addHabit stamps it from currentUser.
        const newHabit: Omit<Habit, 'userId'> = {
          id: generateId(),
          name: name.trim(),
          type,
          points,
          identityCategory: category,
          frequency: 'daily',
          isActive: true,
          isPreset: false,
          createdAt: now,
          updatedAt: now,
        };
        await addHabit(newHabit);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save habit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Modal header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Habit' : 'New Habit'}</Text>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            hitSlop={12}
            accessibilityLabel="Save habit"
          >
            <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              onBlur={() => setNameError(validateName(name))}
              placeholder="e.g. Morning run, Skip social media"
              placeholderTextColor={THEME.text.tertiary}
              returnKeyType="done"
              maxLength={60}
              autoFocus={!isEditing}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Type */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Type</Text>
            <SegmentedControl
              options={['positive', 'negative'] as const}
              selected={type}
              onChange={setType}
              labelOf={(v) => (v === 'positive' ? 'Positive (+)' : 'Negative (−)')}
            />
            <Text style={styles.fieldNote}>
              {type === 'positive'
                ? 'Adds to your score when completed.'
                : 'Subtracts from your score when triggered.'}
            </Text>
          </View>

          {/* Points */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Points</Text>
            <View style={styles.pointsGrid}>
              {POINT_OPTIONS.map((p) => {
                const active = p === points;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPoints(p)}
                    style={[styles.pointChip, active && styles.pointChipActive]}
                    accessibilityLabel={`${p} points`}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.pointChipText, active && styles.pointChipTextActive]}>
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Identity category */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Identity</Text>
            <View style={styles.categoryGrid}>
              {IDENTITY_CATEGORIES.map((cat) => {
                const active = cat === category;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                    accessibilityLabel={IDENTITY_LABELS[cat]}
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {IDENTITY_LABELS[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 40, paddingHorizontal: 20 },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  cancelText: {
    fontSize: 16,
    color: THEME.text.secondary,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.accent,
  },
  saveTextDisabled: {
    opacity: 0.4,
  },

  field: {
    marginTop: 28,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: THEME.text.tertiary,
    textTransform: 'uppercase',
  },
  fieldNote: {
    fontSize: 13,
    color: THEME.text.tertiary,
  },

  input: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: THEME.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: THEME.negative,
  },
  errorText: {
    fontSize: 13,
    color: THEME.negative,
    marginTop: -4,
  },

  pointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pointChip: {
    backgroundColor: THEME.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pointChipActive: {
    backgroundColor: THEME.text.primary,
    borderColor: THEME.text.primary,
  },
  pointChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  pointChipTextActive: {
    color: '#FFFFFF',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: THEME.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: THEME.text.primary,
    borderColor: THEME.text.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.text.secondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  bottomPad: { height: 20 },
});
