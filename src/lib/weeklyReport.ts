import { format, differenceInMinutes } from 'date-fns';
import { CalendarEvent, Habit, JournalEntry, Task, MOOD_LABEL } from '@/lib/types';

interface ReportInput {
  weekStart: Date;
  weekEnd: Date;
  weekDays: Date[];
  habits: Habit[];
  tasks: Task[];
  events: CalendarEvent[];
  journalEntries: JournalEntry[];
  categoryTime: Record<string, number>;
}

export function generateWeeklyReport(data: ReportInput): string {
  const { weekStart, weekEnd, weekDays, habits, tasks, events, journalEntries, categoryTime } = data;

  const weekStartStr = format(weekStart, 'MMM d');
  const weekEndStr = format(weekEnd, 'MMM d, yyyy');

  // Tasks completed this week
  const weekTasksCompleted = tasks.filter((t) => {
    if (!t.completed) return false;
    const created = new Date(t.createdAt);
    return created >= weekStart && created <= weekEnd;
  });

  // Total hours scheduled this week
  const totalMinutes = events
    .filter((e) => {
      const start = new Date(e.start);
      return start >= weekStart && start <= weekEnd;
    })
    .reduce((sum, e) => sum + differenceInMinutes(new Date(e.end), new Date(e.start)), 0);

  // Habit consistency
  const habitLines = habits.map((h) => {
    const completed = weekDays.filter((d) => h.completions[format(d, 'yyyy-MM-dd')]).length;
    const pct = Math.round((completed / 7) * 100);
    return `  - ${h.name}: ${completed}/7 days (${pct}%)`;
  });

  // Mood summary
  const moodEntries = weekDays
    .map((d) => journalEntries.find((e) => e.date === format(d, 'yyyy-MM-dd')))
    .filter((e) => e?.mood);

  const moodLines = weekDays.map((d) => {
    const ds = format(d, 'yyyy-MM-dd');
    const entry = journalEntries.find((e) => e.date === ds);
    return `  - ${format(d, 'EEE MMM d')}: ${entry?.mood ? MOOD_LABEL[entry.mood] : 'Not logged'}`;
  });

  // Journal highlights
  const journalHighlights = journalEntries
    .filter((e) => {
      const d = new Date(e.date + 'T12:00:00');
      return d >= weekStart && d <= weekEnd && e.wentWell;
    })
    .map((e) => `  - ${format(new Date(e.date + 'T12:00:00'), 'EEE MMM d')}: ${e.wentWell}`);

  // Category breakdown
  const categoryLines = Object.entries(categoryTime)
    .filter(([, min]) => min > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, min]) => `  - ${cat}: ${(min / 60).toFixed(1)}h`);

  return `═══════════════════════════════════════════════════════
           MOMENTUM WEEKLY REPORT
           ${weekStartStr} – ${weekEndStr}
═══════════════════════════════════════════════════════

📊 THE NUMBERS
───────────────────────────────────────────────────────
Tasks Completed:      ${weekTasksCompleted.length}
Hours Scheduled:      ${(totalMinutes / 60).toFixed(1)}h
Journal Entries:      ${journalEntries.filter((e) => {
    const d = new Date(e.date + 'T12:00:00');
    return d >= weekStart && d <= weekEnd;
  }).length} / 7
Moods Logged:         ${moodEntries.length} / 7

🎯 HABIT CONSISTENCY
───────────────────────────────────────────────────────
${habitLines.length > 0 ? habitLines.join('\n') : '  (No active habits tracked)'}

⏱️  TIME BY CATEGORY
───────────────────────────────────────────────────────
${categoryLines.length > 0 ? categoryLines.join('\n') : '  (No events scheduled)'}

😊 MOOD TIMELINE
───────────────────────────────────────────────────────
${moodLines.join('\n')}

✨ WHAT WENT WELL
───────────────────────────────────────────────────────
${journalHighlights.length > 0 ? journalHighlights.join('\n') : '  (No journal highlights captured this week)'}

═══════════════════════════════════════════════════════
Generated: ${format(new Date(), 'EEEE, MMMM d, yyyy h:mm a')}
Momentum — your personal operating system
═══════════════════════════════════════════════════════
`;
}
