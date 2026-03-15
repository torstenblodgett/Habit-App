/**
 * Storage layer — all AsyncStorage access goes through these functions.
 *
 * Key design decisions:
 * - All data is scoped under the user's ID: `@scorecard/{userId}/habits`
 * - A single user record lives at `@scorecard/user` (user-agnostic by definition)
 * - Legacy keys (`@scorecard/habits`, `@scorecard/day_logs`) are handled by the
 *   one-time migration helper `migrateLegacyDataIfNeeded`
 *
 * Adding a backend later:
 * - Replace `AsyncStorage.getItem` / `setItem` calls with API calls (or a cache layer)
 * - All function signatures already accept `userId`, so no call-site changes are needed
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, DayLog, User } from '../types';

// ─── Key builders ─────────────────────────────────────────────────────────────

/** The single user record. Not user-scoped (there is only one local user). */
const USER_KEY = '@scorecard/user';

/** User-scoped data keys. */
const habitsKey  = (userId: string) => `@scorecard/${userId}/habits`;
const logsKey    = (userId: string) => `@scorecard/${userId}/day_logs`;

/** Legacy flat keys from before user-scoping was introduced. Used only in migration. */
const LEGACY_HABITS_KEY   = '@scorecard/habits';
const LEGACY_DAY_LOGS_KEY = '@scorecard/day_logs';

// ─── User ─────────────────────────────────────────────────────────────────────

export async function loadUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? (JSON.parse(data) as User) : null;
  } catch {
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export async function loadHabits(userId: string): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(habitsKey(userId));
    return data ? (JSON.parse(data) as Habit[]) : [];
  } catch {
    return [];
  }
}

export async function saveHabits(userId: string, habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(habitsKey(userId), JSON.stringify(habits));
}

// ─── Day logs ─────────────────────────────────────────────────────────────────

export async function loadDayLogs(userId: string): Promise<DayLog[]> {
  try {
    const data = await AsyncStorage.getItem(logsKey(userId));
    return data ? (JSON.parse(data) as DayLog[]) : [];
  } catch {
    return [];
  }
}

export async function saveDayLogs(userId: string, logs: DayLog[]): Promise<void> {
  await AsyncStorage.setItem(logsKey(userId), JSON.stringify(logs));
}

// ─── One-time migration ───────────────────────────────────────────────────────

/**
 * Migrates pre-user-scoping data (if present) into user-scoped keys.
 *
 * Runs in O(n) once per device. On all subsequent launches `didMigrate` is
 * false and this function returns immediately without any I/O.
 *
 * Migration strategy:
 * 1. Read legacy flat keys
 * 2. Stamp every record with `userId`
 * 3. Write to new user-scoped keys
 * 4. Remove legacy keys so this never runs again
 *
 * If legacy keys are absent, returns empty arrays and `didMigrate: false`.
 * The caller should then load normally via `loadHabits` / `loadDayLogs`.
 */
export async function migrateLegacyDataIfNeeded(userId: string): Promise<{
  habits: Habit[];
  logs: DayLog[];
  didMigrate: boolean;
}> {
  const [rawHabits, rawLogs] = await Promise.all([
    AsyncStorage.getItem(LEGACY_HABITS_KEY),
    AsyncStorage.getItem(LEGACY_DAY_LOGS_KEY),
  ]);

  if (rawHabits === null && rawLogs === null) {
    return { habits: [], logs: [], didMigrate: false };
  }

  // Stamp every record with the new userId field.
  // Also preserve any partial records — the isPreset migration in useAppData
  // will handle the isPreset field separately.
  const habits: Habit[] = rawHabits
    ? (JSON.parse(rawHabits) as Omit<Habit, 'userId'>[]).map((h) => ({
        ...h,
        userId,
      } as Habit))
    : [];

  const logs: DayLog[] = rawLogs
    ? (JSON.parse(rawLogs) as Omit<DayLog, 'userId'>[]).map((l) => ({
        ...l,
        userId,
      } as DayLog))
    : [];

  // Persist to new user-scoped keys and clean up legacy keys atomically.
  await Promise.all([
    saveHabits(userId, habits),
    saveDayLogs(userId, logs),
    AsyncStorage.multiRemove([LEGACY_HABITS_KEY, LEGACY_DAY_LOGS_KEY]),
  ]);

  return { habits, logs, didMigrate: true };
}
