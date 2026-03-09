'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { CATEGORY_COLORS } from '@/lib/types';
import {
  Plus,
  Flame,
  Check,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function HabitsPage() {
  const { habits, addHabit, removeHabit, toggleCompletion, getStreak, canAddHabit } =
    useHabitStore();
  const categories = usePreferencesStore((s) => s.categories);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'personal');
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ hadStreak: boolean; streakLength: number } | null>(null);

  const activeHabits = habits.filter((h) => h.isActive);
  const today = format(new Date(), 'yyyy-MM-dd');

  // Last 7 days for weekly view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      isToday: format(d, 'yyyy-MM-dd') === today,
    };
  });

  // Current month days for monthly view
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const result = addHabit(name, category);
    if (result.success) {
      setName('');
      setShowModal(false);
    }
  };

  const handleRemove = (id: string) => {
    const streak = getStreak(id);
    if (streak > 0) {
      setShowDeleteWarning(id);
      setDeleteInfo({ hadStreak: true, streakLength: streak });
    } else {
      removeHabit(id);
    }
  };

  const confirmRemove = () => {
    if (showDeleteWarning) {
      removeHabit(showDeleteWarning);
      setShowDeleteWarning(null);
      setDeleteInfo(null);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-sm text-muted mt-1">
            {activeHabits.length}/7 habits tracked
          </p>
        </div>
        <button
          onClick={() => {
            if (!canAddHabit()) return;
            setShowModal(true);
          }}
          disabled={!canAddHabit()}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            canAddHabit()
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-surface text-muted cursor-not-allowed'
          }`}
        >
          <Plus size={16} />
          New Habit
        </button>
      </div>

      {!canAddHabit() && (
        <div className="glass rounded-xl p-4 mb-6 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Maximum habits reached</p>
              <p className="text-xs text-muted mt-1">
                Focusing on fewer habits improves consistency. Remove a habit to add a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly View */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h2 className="font-semibold mb-4">This Week</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted pb-3 pr-4 w-40">Habit</th>
                {last7Days.map((day) => (
                  <th
                    key={day.date}
                    className={`text-center pb-3 px-2 ${day.isToday ? 'text-accent' : 'text-muted'}`}
                  >
                    <div className="text-[10px] font-medium">{day.label}</div>
                    <div className="text-xs font-bold">{day.dayNum}</div>
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-muted pb-3 px-2">Streak</th>
                <th className="pb-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {activeHabits.map((habit) => {
                const streak = getStreak(habit.id);
                return (
                  <tr key={habit.id} className="border-t border-border/30">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.custom,
                          }}
                        />
                        <span className="text-sm font-medium truncate">{habit.name}</span>
                      </div>
                    </td>
                    {last7Days.map((day) => {
                      const completed = habit.completions[day.date];
                      return (
                        <td key={day.date} className="text-center py-3 px-2">
                          <button
                            onClick={() => toggleCompletion(habit.id, day.date)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                              completed
                                ? 'bg-emerald-500 text-white'
                                : 'border border-border hover:border-emerald-500/50'
                            }`}
                          >
                            {completed && <Check size={12} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-2">
                      {streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-orange-400">
                          <Flame size={12} /> {streak}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRemove(habit.id)}
                        className="rounded-lg p-1 text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeHabits.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <p className="text-sm">No habits tracked yet</p>
            <p className="text-xs mt-1">Add up to 7 habits to build consistency</p>
          </div>
        )}
      </div>

      {/* Monthly Heatmap */}
      {activeHabits.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">
            {format(new Date(), 'MMMM yyyy')} Overview
          </h2>
          <div className="space-y-4">
            {activeHabits.map((habit) => {
              const completedDays = monthDays.filter(
                (d) => habit.completions[format(d, 'yyyy-MM-dd')]
              ).length;
              return (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{habit.name}</span>
                    <span className="text-xs text-muted">
                      {completedDays}/{monthDays.length} days
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {monthDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const completed = habit.completions[dateStr];
                      const isFuture = day > new Date();
                      return (
                        <div
                          key={dateStr}
                          className={`h-4 w-4 rounded-sm ${
                            isFuture
                              ? 'bg-surface'
                              : completed
                              ? 'bg-emerald-500'
                              : 'bg-surface-hover'
                          }`}
                          title={`${format(day, 'MMM d')} - ${completed ? 'Done' : 'Missed'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">New Habit</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Meditate, Exercise, Read"
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && deleteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <AlertTriangle size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Remove Habit?</h2>
                <p className="text-sm text-muted">
                  You have a {deleteInfo.streakLength}-day streak!
                </p>
              </div>
            </div>
            <p className="text-sm text-muted mb-6">
              Removing this habit will reset your streak data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteWarning(null);
                  setDeleteInfo(null);
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
              >
                Keep Habit
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
