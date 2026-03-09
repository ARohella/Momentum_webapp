'use client';

import { useHabitStore } from '@/stores/habitStore';
import { Repeat, Flame, Check } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export function DashboardHabits() {
  const habits = useHabitStore((s) => s.habits);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const getStreak = useHabitStore((s) => s.getStreak);

  const activeHabits = habits.filter((h) => h.isActive);
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedCount = activeHabits.filter((h) => h.completions[today]).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat size={18} className="text-emerald-500" />
          <h2 className="font-semibold text-lg">Habits</h2>
        </div>
        <Link
          href="/habits"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Manage
        </Link>
      </div>

      <div className="space-y-2">
        {activeHabits.map((habit) => {
          const completed = habit.completions[today];
          const streak = getStreak(habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggleCompletion(habit.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                completed
                  ? 'bg-emerald-500/10'
                  : 'hover:bg-surface-hover'
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border'
                }`}
              >
                {completed && <Check size={12} />}
              </div>
              <span className={`flex-1 text-sm font-medium ${completed ? 'text-emerald-400' : ''}`}>
                {habit.name}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                  <Flame size={10} />
                  {streak}
                </span>
              )}
            </button>
          );
        })}

        {activeHabits.length === 0 && (
          <div className="flex flex-col items-center py-8 text-muted">
            <Repeat size={28} className="mb-2 opacity-50" />
            <p className="text-sm">No habits tracked</p>
            <Link
              href="/habits"
              className="mt-1 text-xs text-accent hover:text-accent-hover"
            >
              Add a habit
            </Link>
          </div>
        )}
      </div>

      {activeHabits.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted">
            {completedCount}/{activeHabits.length} completed today
          </p>
        </div>
      )}
    </div>
  );
}
