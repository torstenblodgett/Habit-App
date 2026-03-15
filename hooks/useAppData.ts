import { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, DayLog, Verdict, IdentityScoreSnapshot, PresetHabit, User } from '../types';
import {
  loadUser,
  saveUser,
  loadHabits,
  saveHabits,
  loadDayLogs,
  saveDayLogs,
  migrateLegacyDataIfNeeded,
} from '../storage';
import { today, getLast7Days, getLast30Days, subtractDays } from '../utils/dates';
import {
  computeScore,
  getVerdict,
  computeWeeklyAverage,
  computeMonthlyAverage,
} from '../utils/scoring';
import { computeDailyTarget } from '../utils/target';
import { computeAllIdentityScores } from '../utils/identity';
import { generateId } from '../utils/id';

export interface AppData {
  /** The active local user. Null only during the brief initial load. */
  currentUser: User | null;
  habits: Habit[];
  dayLogs: DayLog[];
  todayLog: DayLog;
  todayScore: number;
  todayVerdict: Verdict;
  todayTarget: number;
  weeklyAverage: number;
  monthlyAverage: number;
  identityScores: IdentityScoreSnapshot[];
  isLoading: boolean;
  toggleHabit: (habitId: string) => void;
  toggleNegativeHabit: (habitId: string) => void;
  /**
   * Adds a custom habit. `userId` is injected by the hook — callers do not
   * need to supply it (and habit-form.tsx has no access to currentUser).
   */
  addHabit: (habit: Omit<Habit, 'userId'>) => Promise<void>;
  addPresetHabit: (preset: PresetHabit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deactivateHabit: (habitId: string) => Promise<void>;
}

function createEmptyDayLog(userId: string, date: string, target: number): DayLog {
  return {
    date,
    userId,
    completedHabitIds: [],
    triggeredNegativeHabitIds: [],
    score: 0,
    target,
    verdict: 'Collapse',
  };
}

/** Creates and persists a new local user on first launch. */
async function createAndSaveLocalUser(): Promise<User> {
  const user: User = { id: generateId(), createdAt: new Date().toISOString() };
  await saveUser(user);
  return user;
}

export function useAppData(): AppData {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Step 1: Get existing local user, or create one on first launch.
      const user = (await loadUser()) ?? (await createAndSaveLocalUser());

      // Step 2: Migrate legacy flat keys (pre-user-scoping) if present,
      // otherwise load normally from user-scoped keys.
      const { habits: rawHabits, logs: rawLogs, didMigrate } =
        await migrateLegacyDataIfNeeded(user.id);
      const [loadedHabits, loadedLogs] = didMigrate
        ? [rawHabits, rawLogs]
        : await Promise.all([loadHabits(user.id), loadDayLogs(user.id)]);

      // Step 3: Back-fill isPreset field on habits created before it was added.
      // Treat any such habit as a custom habit (isPreset: false).
      const needsMigration = loadedHabits.some((h) => !('isPreset' in h));
      const migratedHabits: Habit[] = needsMigration
        ? loadedHabits.map((h) => ('isPreset' in h ? h : { ...h, isPreset: false }))
        : loadedHabits;
      if (needsMigration) {
        // Persist so this back-fill runs only once.
        await saveHabits(user.id, migratedHabits).catch(() => {});
      }

      setCurrentUser(user);
      setHabits(migratedHabits);
      setDayLogs(loadedLogs);
      setIsLoading(false);
    }
    load();
  }, []);

  const todayDate = today();

  const last7Days = useMemo(() => getLast7Days(todayDate), [todayDate]);
  const last30Days = useMemo(() => getLast30Days(todayDate), [todayDate]);

  // 7-day window ending yesterday — used for target calculation.
  // Excludes today to avoid a feedback loop where logging raises the target mid-day.
  const last7DaysExcludingToday = useMemo(
    () => getLast7Days(subtractDays(todayDate, 1)),
    [todayDate]
  );

  const todayTarget = useMemo(
    () => computeDailyTarget(dayLogs, last7DaysExcludingToday),
    [dayLogs, last7DaysExcludingToday]
  );

  // Stable userId string — empty string only during the brief initial load.
  const userId = currentUser?.id ?? '';

  const todayLog: DayLog = useMemo(
    () =>
      dayLogs.find((l) => l.date === todayDate) ??
      createEmptyDayLog(userId, todayDate, todayTarget),
    [dayLogs, todayDate, todayTarget, userId]
  );

  const todayScore = useMemo(() => computeScore(habits, todayLog), [habits, todayLog]);
  const todayVerdict = useMemo(() => getVerdict(todayScore), [todayScore]);
  const weeklyAverage = useMemo(
    () => computeWeeklyAverage(dayLogs, last7Days),
    [dayLogs, last7Days]
  );
  const monthlyAverage = useMemo(
    () => computeMonthlyAverage(dayLogs, last30Days),
    [dayLogs, last30Days]
  );
  const identityScores = useMemo(
    () => computeAllIdentityScores(habits, dayLogs, last30Days),
    [habits, dayLogs, last30Days]
  );

  /**
   * Core updater for today's log. Computes new score + verdict after mutation.
   * Persists asynchronously without blocking the UI update.
   */
  const mutateTodayLog = useCallback(
    (updater: (log: DayLog) => DayLog) => {
      if (!currentUser) return; // guard: called only after load completes
      setDayLogs((prev) => {
        const existingIndex = prev.findIndex((l) => l.date === todayDate);
        const current =
          existingIndex >= 0
            ? prev[existingIndex]
            : createEmptyDayLog(currentUser.id, todayDate, todayTarget);
        const updated = updater(current);
        const newScore = computeScore(habits, updated);
        const newVerdict = getVerdict(newScore);
        const final: DayLog = { ...updated, score: newScore, verdict: newVerdict };

        const newLogs =
          existingIndex >= 0
            ? prev.map((l, i) => (i === existingIndex ? final : l))
            : [...prev, final];

        saveDayLogs(currentUser.id, newLogs).catch(() => {}); // fire-and-forget
        return newLogs;
      });
    },
    [habits, todayDate, todayTarget, currentUser]
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      mutateTodayLog((log) => {
        const isCompleted = log.completedHabitIds.includes(habitId);
        return {
          ...log,
          completedHabitIds: isCompleted
            ? log.completedHabitIds.filter((id) => id !== habitId)
            : [...log.completedHabitIds, habitId],
        };
      });
    },
    [mutateTodayLog]
  );

  const toggleNegativeHabit = useCallback(
    (habitId: string) => {
      mutateTodayLog((log) => {
        const isTriggered = log.triggeredNegativeHabitIds.includes(habitId);
        return {
          ...log,
          triggeredNegativeHabitIds: isTriggered
            ? log.triggeredNegativeHabitIds.filter((id) => id !== habitId)
            : [...log.triggeredNegativeHabitIds, habitId],
        };
      });
    },
    [mutateTodayLog]
  );

  const addHabit = useCallback(
    async (habit: Omit<Habit, 'userId'>) => {
      if (!currentUser) return;
      // Stamp the userId here so habit-form.tsx doesn't need to know about currentUser.
      const stamped: Habit = { ...habit, userId: currentUser.id };
      const updated = [...habits, stamped];
      setHabits(updated);
      await saveHabits(currentUser.id, updated);
    },
    [habits, currentUser]
  );

  /**
   * Instantiates a Habit from a preset template and adds it to the active list.
   * No-ops if an active copy of this preset already exists (prevents duplicates).
   * Archiving a preset habit and re-adding from the browser is intentionally allowed.
   */
  const addPresetHabit = useCallback(
    async (preset: PresetHabit) => {
      if (!currentUser) return;
      const alreadyActive = habits.some(
        (h) => h.isActive && h.presetId === preset.presetId
      );
      if (alreadyActive) return;

      const now = new Date().toISOString();
      const newHabit: Habit = {
        id: generateId(),
        userId: currentUser.id,
        name: preset.name,
        points: preset.points,
        type: preset.type,
        identityCategory: preset.identityCategory,
        frequency: 'daily',
        isActive: true,
        isPreset: true,
        presetId: preset.presetId,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...habits, newHabit];
      setHabits(updated);
      await saveHabits(currentUser.id, updated);
    },
    [habits, currentUser]
  );

  const updateHabit = useCallback(
    async (habit: Habit) => {
      if (!currentUser) return;
      const updated = habits.map((h) => (h.id === habit.id ? habit : h));
      setHabits(updated);
      await saveHabits(currentUser.id, updated);
    },
    [habits, currentUser]
  );

  const deactivateHabit = useCallback(
    async (habitId: string) => {
      if (!currentUser) return;
      const updated = habits.map((h) =>
        h.id === habitId
          ? { ...h, isActive: false, updatedAt: new Date().toISOString() }
          : h
      );
      setHabits(updated);
      await saveHabits(currentUser.id, updated);
    },
    [habits, currentUser]
  );

  return {
    currentUser,
    habits,
    dayLogs,
    todayLog,
    todayScore,
    todayVerdict,
    todayTarget,
    weeklyAverage,
    monthlyAverage,
    identityScores,
    isLoading,
    toggleHabit,
    toggleNegativeHabit,
    addHabit,
    addPresetHabit,
    updateHabit,
    deactivateHabit,
  };
}
