export type IdentityCategory =
  | 'athlete'
  | 'reader'
  | 'scholar'
  | 'mindful'
  | 'disciplined'
  | 'healthy';

/**
 * UI grouping for the preset browser.
 * Intentionally separate from IdentityCategory — presets within one PresetCategory
 * can map to different identity categories (e.g. "Learning" covers both reader & scholar).
 */
export type PresetCategory =
  | 'Fitness'
  | 'Learning'
  | 'Focus'
  | 'Health'
  | 'Discipline'
  | 'Mindfulness';

export type Verdict =
  | 'Collapse'
  | 'Weak'
  | 'Decent'
  | 'Strong'
  | 'Excellent'
  | 'Elite';

/**
 * A local or server-assigned user identity.
 * In the MVP this is auto-created on first launch and lives only in local storage.
 * The `name` field is intentionally optional — it is unused in the single-user local
 * flow but will be populated once account/profile screens are added.
 */
export interface User {
  id: string;
  name?: string;     // Display name — optional, unused in MVP
  createdAt: string; // ISO 8601
}

/** A read-only template from the standard habit library. Never stored in AsyncStorage. */
export interface PresetHabit {
  presetId: string;           // Stable, human-readable — e.g. 'fitness-morning-run'
  name: string;
  points: number;             // Always a positive number
  type: 'positive' | 'negative';
  identityCategory: IdentityCategory;
  category: PresetCategory;   // Used to group presets in the browser UI
}

export interface Habit {
  id: string;
  /** Owner. Matches User.id. Stamped at creation; used to scope storage and future sync. */
  userId: string;
  name: string;
  /** Always stored as a positive number; scoring logic applies sign */
  points: number;
  type: 'positive' | 'negative';
  identityCategory: IdentityCategory;
  frequency: 'daily';
  isActive: boolean;
  /** true = added from the standard preset library; false = user-created custom habit */
  isPreset: boolean;
  /** Links back to PresetHabit.presetId. Undefined for custom habits. */
  presetId?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface DayLog {
  date: string;   // YYYY-MM-DD
  /** Owner. Matches User.id. Stamped at creation; used to scope storage and future sync. */
  userId: string;
  completedHabitIds: string[];
  triggeredNegativeHabitIds: string[];
  score: number;
  target: number;
  verdict: Verdict;
}

/**
 * Derived snapshot computed from habits + day logs. Never stored directly.
 * User-agnostic: the caller passes the correct user's data.
 */
export interface IdentityScoreSnapshot {
  category: IdentityCategory;
  score: number; // 0–100
}
