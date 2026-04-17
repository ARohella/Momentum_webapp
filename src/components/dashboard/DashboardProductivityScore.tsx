'use client';

import { useEffect, useMemo } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useJournalStore } from '@/stores/journalStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { Trophy, Flame } from 'lucide-react';
import { format } from 'date-fns';

export function DashboardProductivityScore() {
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const entries = useJournalStore((s) => s.entries);
  const productivityStreak = usePreferencesStore((s) => s.productivityStreak);
  const recordProductivityScore = usePreferencesStore((s) => s.recordProductivityScore);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { score, habitsScore, tasksScore, journalScore, grade } = useMemo(() => {
    const activeHabits = habits.filter((h) => h.isActive);
    const habitsCompletedToday = activeHabits.filter((h) => h.completions[today]).length;
    const habitsScore =
      activeHabits.length === 0 ? 40 : Math.min(40, (habitsCompletedToday / activeHabits.length) * 40);

    const top3Tasks = tasks.filter((t) => t.isTopThree);
    const top3Completed = tasks.filter((t) => t.isTopThree && t.completed).length;
    const tasksScore = top3Tasks.length === 0 ? 40 : Math.min(40, (top3Completed / 3) * 40);

    const hasJournal = entries.some((e) => e.date === today);
    const journalScore = hasJournal ? 20 : 0;

    const total = Math.round(habitsScore + tasksScore + journalScore);
    const grade =
      total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';

    return { score: total, habitsScore, tasksScore, journalScore, grade };
  }, [tasks, habits, entries, today]);

  useEffect(() => {
    recordProductivityScore(score, today);
  }, [score, today, recordProductivityScore]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const gradeColor =
    grade === 'A' ? 'text-emerald-400'
    : grade === 'B' ? 'text-lime-400'
    : grade === 'C' ? 'text-amber-400'
    : grade === 'D' ? 'text-orange-400'
    : 'text-rose-400';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-accent" />
        <h2 className="font-semibold text-sm">Today&apos;s Score</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
            <span className={`text-xs font-bold ${gradeColor}`}>{grade}</span>
          </div>
        </div>

        {productivityStreak > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Flame size={12} className="text-orange-400" />
            <span>
              <span className="font-semibold text-foreground">{productivityStreak}</span> day streak
            </span>
          </div>
        )}

        <div className="w-full grid grid-cols-3 gap-1 text-[10px] text-muted mt-1">
          <div className="text-center">
            <div className="font-semibold text-foreground">{Math.round(habitsScore)}</div>
            <div>Habits</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{Math.round(tasksScore)}</div>
            <div>Tasks</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">{journalScore}</div>
            <div>Journal</div>
          </div>
        </div>
      </div>
    </div>
  );
}
