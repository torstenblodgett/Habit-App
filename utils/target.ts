import { DayLog } from '../types';

const DEFAULT_TARGET = 50;
const MIN_TARGET = 40;
const WINDOW_DAYS = 7;

/**
 * Computes today's target score.
 * Formula: max(40, round(7-day_avg + 5))
 *
 * We always divide by WINDOW_DAYS (7) so the target reflects a true 7-day
 * weekly average. Days with no log count as 0.
 *
 * Today is excluded from the window to avoid a feedback loop where logging
 * habits today raises the target mid-day.
 *
 * @param dayLogs - all stored day logs
 * @param last7DaysExcludingToday - the 7 days ending yesterday (oldest first)
 */
export function computeDailyTarget(
  dayLogs: DayLog[],
  last7DaysExcludingToday: string[]
): number {
  const recentScores = last7DaysExcludingToday.map(
    (date) => dayLogs.find((l) => l.date === date)?.score ?? 0
  );

  const hasHistory = recentScores.some((s) => s > 0);
  if (!hasHistory) return DEFAULT_TARGET;

  // Always divide by 7 regardless of how many days were passed in
  const weeklyAvg = recentScores.reduce((sum, s) => sum + s, 0) / WINDOW_DAYS;
  return Math.max(MIN_TARGET, Math.round(weeklyAvg + 5));
}
