import { DayLog, Habit, Verdict } from '../types';
import { subtractDays } from './dates';

/**
 * Current streak: consecutive days ending today (or yesterday if today has no score)
 * where score > 0.
 */
export function getCurrentStreak(dayLogs: DayLog[], todayStr: string): number {
  if (dayLogs.length === 0) return 0;

  const todayLog = dayLogs.find((l) => l.date === todayStr);
  const todayScored = todayLog != null && todayLog.score > 0;

  // Determine the most recent active day to start counting from
  const startDate = todayScored ? todayStr : subtractDays(todayStr, 1);

  let streak = 0;
  let cursor = startDate;

  for (let i = 0; i < 366; i++) {
    const log = dayLogs.find((l) => l.date === cursor);
    if (!log || log.score <= 0) break;
    streak++;
    cursor = subtractDays(cursor, 1);
  }

  return streak;
}

/** Count days matching any of the given verdicts. */
export function countVerdictDays(dayLogs: DayLog[], verdicts: Verdict[]): number {
  return dayLogs.filter((log) => verdicts.includes(log.verdict)).length;
}

/** Best scoring day in a date window. Returns null if no logs with score > 0 in window. */
export function getBestDay(dayLogs: DayLog[], dateWindow: string[]): DayLog | null {
  const relevant = dayLogs.filter((l) => dateWindow.includes(l.date) && l.score > 0);
  if (relevant.length === 0) return null;
  return relevant.reduce((best, log) => (log.score > best.score ? log : best), relevant[0]);
}

/** Recent day scores for display (oldest → newest), filling missing days with 0. */
export function getRecentDayScores(
  dayLogs: DayLog[],
  dateWindow: string[]
): { date: string; score: number }[] {
  return dateWindow.map((date) => ({
    date,
    score: dayLogs.find((l) => l.date === date)?.score ?? 0,
  }));
}

/**
 * Per-habit completion data over a date window.
 * Only includes active positive habits.
 * Preserves original habit order (not sorted by rate).
 */
export function getHabitConsistency(
  habits: Habit[],
  dayLogs: DayLog[],
  dateWindow: string[]
): { habitId: string; name: string; completedCount: number; rate: number }[] {
  const positiveHabits = habits.filter((h) => h.isActive && h.type === 'positive');
  return positiveHabits.map((habit) => {
    const completedCount = dateWindow.reduce((count, date) => {
      const log = dayLogs.find((l) => l.date === date);
      return count + (log?.completedHabitIds.includes(habit.id) ? 1 : 0);
    }, 0);
    return {
      habitId: habit.id,
      name: habit.name,
      completedCount,
      rate: dateWindow.length > 0 ? completedCount / dateWindow.length : 0,
    };
  });
}
