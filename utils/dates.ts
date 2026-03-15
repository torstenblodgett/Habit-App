/** Returns today's date as YYYY-MM-DD in local time */
export function today(): string {
  return formatDate(new Date());
}

/** Formats a Date object as YYYY-MM-DD in local time */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Subtracts n days from a YYYY-MM-DD string, returns YYYY-MM-DD */
export function subtractDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

/** Returns the last 7 days ending on (and including) anchor, oldest first */
export function getLast7Days(anchor: string): string[] {
  return Array.from({ length: 7 }, (_, i) => subtractDays(anchor, 6 - i));
}

/** Returns the last 30 days ending on (and including) anchor, oldest first */
export function getLast30Days(anchor: string): string[] {
  return Array.from({ length: 30 }, (_, i) => subtractDays(anchor, 29 - i));
}

/** Human-readable date label, e.g. "Friday, March 13" */
export function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Short date label, e.g. "Mar 13" */
export function formatShortDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
