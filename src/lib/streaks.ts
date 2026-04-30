export function calculateCurrentStreak(completions: string[], today?: string): number {
  const todayDate = today ?? new Date().toISOString().split('T')[0];
  const unique = Array.from(new Set(completions)).sort().reverse();
  if (unique.length === 0) return 0;
  if (!unique.includes(todayDate)) return 0;

  let streak = 0;
  const current = new Date(todayDate);

  while (true) {
    const expected = current.toISOString().split('T')[0];
    if (unique.includes(expected)) {
      streak++;
      current.setUTCDate(current.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}