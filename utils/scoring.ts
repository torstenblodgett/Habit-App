import { Habit, DayLog, Verdict } from '../types';
import { VERDICT_THRESHOLDS } from '../constants/verdicts';

/** Recomputes score from habits and a day log. Pure function. */
export function computeScore(habits: Habit[], dayLog: DayLog): number {
  let score = 0;

  for (const habitId of dayLog.completedHabitIds) {
    const habit = habits.find((h) => h.id === habitId);
    if (habit?.type === 'positive') {
      score += habit.points;
    }
  }

  for (const habitId of dayLog.triggeredNegativeHabitIds) {
    const habit = habits.find((h) => h.id === habitId);
    if (habit?.type === 'negative') {
      score -= habit.points;
    }
  }

  return score;
}

export function getVerdict(score: number): Verdict {
  if (score >= VERDICT_THRESHOLDS.ELITE) return 'Elite';
  if (score >= VERDICT_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= VERDICT_THRESHOLDS.STRONG) return 'Strong';
  if (score >= VERDICT_THRESHOLDS.DECENT) return 'Decent';
  if (score >= VERDICT_THRESHOLDS.WEAK) return 'Weak';
  return 'Collapse';
}

/** Returns a short motivational string based on current score and target. */
export function getMotivationalText(score: number, target: number): string {
  if (score >= target) return 'Target reached';
  if (score <= 0) return 'Make today count';

  const next = getNextVerdictThreshold(score);
  if (next) {
    const gap = next.threshold - score;
    return `${gap} point${gap !== 1 ? 's' : ''} from ${next.name}`;
  }

  const gap = target - score;
  return `${gap} point${gap !== 1 ? 's' : ''} to target`;
}

function getNextVerdictThreshold(score: number): { threshold: number; name: string } | null {
  if (score < VERDICT_THRESHOLDS.WEAK)
    return { threshold: VERDICT_THRESHOLDS.WEAK, name: 'Weak' };
  if (score < VERDICT_THRESHOLDS.DECENT)
    return { threshold: VERDICT_THRESHOLDS.DECENT, name: 'Decent' };
  if (score < VERDICT_THRESHOLDS.STRONG)
    return { threshold: VERDICT_THRESHOLDS.STRONG, name: 'Strong' };
  if (score < VERDICT_THRESHOLDS.EXCELLENT)
    return { threshold: VERDICT_THRESHOLDS.EXCELLENT, name: 'Excellent' };
  if (score < VERDICT_THRESHOLDS.ELITE)
    return { threshold: VERDICT_THRESHOLDS.ELITE, name: 'Elite' };
  return null;
}

/** Weekly average over exactly 7 calendar days (zero for days with no log). */
export function computeWeeklyAverage(dayLogs: DayLog[], last7Days: string[]): number {
  const total = last7Days.reduce((sum, date) => {
    const log = dayLogs.find((l) => l.date === date);
    return sum + (log?.score ?? 0);
  }, 0);
  return Math.round(total / 7);
}

/** Monthly average over exactly 30 calendar days. */
export function computeMonthlyAverage(dayLogs: DayLog[], last30Days: string[]): number {
  const total = last30Days.reduce((sum, date) => {
    const log = dayLogs.find((l) => l.date === date);
    return sum + (log?.score ?? 0);
  }, 0);
  return Math.round(total / 30);
}
