function fmt(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Consecutive days (ending today or yesterday) with at least one activity. */
export function computeStreak(activity: { day: string; count: number }[]): number {
  const countsByDay = new Map(activity.map((a) => [a.day, a.count]));
  const cursor = new Date();
  if ((countsByDay.get(fmt(cursor)) ?? 0) === 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let streak = 0;
  while ((countsByDay.get(fmt(cursor)) ?? 0) > 0) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
