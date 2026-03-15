import { Habit, DayLog, IdentityCategory, IdentityScoreSnapshot } from '../types';
import { IDENTITY_CATEGORIES } from '../constants/identity';

/**
 * Computes identity score (0–100) for a category over the last 30 days.
 *
 * Score = completions / opportunities × 100
 * where opportunity = active positive habit × day in the window.
 * Returns 0 if no relevant habits exist yet.
 */
export function computeIdentityScore(
  category: IdentityCategory,
  habits: Habit[],
  dayLogs: DayLog[],
  last30Days: string[]
): number {
  const relevant = habits.filter(
    (h) => h.identityCategory === category && h.type === 'positive' && h.isActive
  );
  if (relevant.length === 0) return 0;

  const opportunities = relevant.length * last30Days.length;
  if (opportunities === 0) return 0;

  let completions = 0;
  for (const date of last30Days) {
    const log = dayLogs.find((l) => l.date === date);
    if (!log) continue;
    for (const habit of relevant) {
      if (log.completedHabitIds.includes(habit.id)) {
        completions++;
      }
    }
  }

  return Math.round((completions / opportunities) * 100);
}

export function computeAllIdentityScores(
  habits: Habit[],
  dayLogs: DayLog[],
  last30Days: string[]
): IdentityScoreSnapshot[] {
  return IDENTITY_CATEGORIES.map((category) => ({
    category,
    score: computeIdentityScore(category, habits, dayLogs, last30Days),
  }));
}
