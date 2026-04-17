'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { CATEGORY_COLORS } from '@/lib/types';
import {
  Plus,
  Flame,
  Check,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Insight {
  habitId: string;
  habitName: string;
  bestDay: { name: string; pct: number } | null;
  worstDay: { name: string; pct: number } | null;
  overallPct: number;
}

function activeHabitsInsights(habits: { id: string; name: string; isActive: boolean; completions: Record<string, boolean>; createdAt: string }[]): Insight[] {
  return habits
    .filter((h) => h.isActive)
    .map((h) => {
      const created = new Date(h.createdAt);
      const daysSinceCreated = Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000));
      const windowDays = Math.min(60, daysSinceCreated);

      const dayBuckets: { total: number; done: number }[] = Array.from({ length: 7 }, () => ({ total: 0, done: 0 }));
      let overallDone = 0, overallTotal = 0;

      for (let i = 0; i < windowDays; i++) {
        const d = subDays(new Date(), i);
        if (d < created) continue;
        const key = format(d, 'yyyy-MM-dd');
        const dow = d.getDay();
        dayBuckets[dow].total++;
        overallTotal++;
        if (h.completions[key]) {
          dayBuckets[dow].done++;
          overallDone++;
        }
      }

      const dayStats = dayBuckets.map((b, i) => ({
        name: DAY_NAMES[i],
        pct: b.total > 0 ? Math.round((b.done / b.total) * 100) : -1,
      })).filter((d) => d.pct >= 0);

      let bestDay: Insight['bestDay'] = null;
      let worstDay: Insight['worstDay'] = null;
      if (dayStats.length > 0) {
        bestDay = dayStats.reduce((a, b) => (a.pct >= b.pct ? a : b));
        worstDay = dayStats.reduce((a, b) => (a.pct <= b.pct ? a : b));
      }

      return {
        habitId: h.id,
        habitName: h.name,
        bestDay,
        worstDay,
        overallPct: overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0,
      };
    });
}

export default function HabitsPage() {
  const {
    habits, addHabit, removeHabit, toggleCompletion, getStreak, canAddHabit,
    challenges, startChallenge, endChallenge, getChallengeProgress,
  } = useHabitStore();
  const categories = usePreferencesStore((s) => s.categories);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'personal');
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ hadStreak: boolean; streakLength: number } | null>(null);
  const [challengeModalHabitId, setChallengeModalHabitId] = useState<string | null>(null);
  const incrementAI = useRewardsStore((s) => s.incrementAI);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    { habitId: string; habitName: string; targetDays: number; reasoning: string; difficulty: string }[]
  >([]);

  const handleSuggestChallenges = async () => {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const input = activeHabits.map((h) => {
        const keys = Object.keys(h.completions).filter((d) => h.completions[d]);
        const daysTracked = Math.max(
          1,
          Math.round((Date.now() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          id: h.id,
          name: h.name,
          category: h.category,
          consistencyPct: Math.round((keys.length / Math.min(daysTracked, 60)) * 100),
          currentStreak: getStreak(h.id),
          daysTracked: Math.min(daysTracked, 60),
        };
      });
      const res = await fetch('/api/ai-challenge-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSuggestions(data.suggestions || []);
      incrementAI('challengesSuggested');
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : 'Failed to suggest challenges');
    } finally {
      setSuggestLoading(false);
    }
  };

  const acceptSuggestion = (s: { habitId: string; targetDays: number }) => {
    startChallenge(s.habitId, s.targetDays);
    setSuggestions((prev) => prev.filter((x) => x.habitId !== s.habitId || x.targetDays !== s.targetDays));
  };

  // Compute day-of-week insights per habit over last 60 days
  const insights = activeHabitsInsights(habits);

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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setChallengeModalHabitId(habit.id)}
                          className="rounded-lg p-1 text-muted hover:text-accent transition-colors"
                          title="Start challenge"
                        >
                          <Zap size={14} />
                        </button>
                        <button
                          onClick={() => handleRemove(habit.id)}
                          className="rounded-lg p-1 text-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {/* AI Challenge Suggestions */}
      {activeHabits.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              AI Challenge Coach
            </h2>
            <button
              onClick={handleSuggestChallenges}
              disabled={suggestLoading}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {suggestLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {suggestLoading ? 'Analyzing…' : suggestions.length > 0 ? 'Regenerate' : 'Suggest Challenges'}
            </button>
          </div>
          {suggestError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 mb-3">
              {suggestError}
            </div>
          )}
          {suggestions.length === 0 && !suggestLoading && !suggestError && (
            <p className="text-sm text-muted">
              Let AI analyze your habit patterns and recommend personalized challenges based on your current momentum.
            </p>
          )}
          {suggestions.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {suggestions.map((s, i) => (
                <div
                  key={`${s.habitId}-${i}`}
                  className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {s.difficulty}
                    </span>
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                      {s.targetDays} days
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{s.habitName}</h3>
                  <p className="text-xs text-muted flex-1 mb-3 leading-relaxed">{s.reasoning}</p>
                  <button
                    onClick={() => acceptSuggestion(s)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
                  >
                    Start this challenge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Challenges */}
      {challenges.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Zap size={16} className="text-accent" />
            Active Challenges
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => {
              const habit = habits.find((h) => h.id === c.habitId);
              if (!habit) return null;
              const progress = getChallengeProgress(c.id);
              const pct = Math.round((progress.completed / progress.total) * 100);
              const daysRemaining = Math.max(0, Math.ceil((new Date(c.endDate + 'T23:59:59').getTime() - Date.now()) / 86400000));
              const r = 28;
              const circ = 2 * Math.PI * r;
              const off = circ - (pct / 100) * circ;
              return (
                <div key={c.id} className="rounded-xl border border-accent/20 bg-accent/5 p-4 flex items-center gap-3">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
                      <circle cx="35" cy="35" r={r} fill="none" stroke="var(--border-color)" strokeWidth="5" />
                      <circle cx="35" cy="35" r={r} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {progress.completed}/{progress.total}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{habit.name}</p>
                    <p className="text-[10px] text-muted">{c.targetDays}-day challenge</p>
                    <p className="text-[10px] text-accent mt-0.5">{daysRemaining} days remaining</p>
                  </div>
                  <button onClick={() => endChallenge(c.id)} className="text-muted hover:text-red-400" title="End challenge">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Habit Insights */}
      {insights.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            Insights
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {insights.map((ins) => (
              <div key={ins.habitId} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{ins.habitName}</p>
                  <span className="text-xs text-muted">{ins.overallPct}% overall</span>
                </div>
                {ins.bestDay && ins.worstDay ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-emerald-400" />
                      <span className="text-muted">Best:</span>
                      <span className="font-medium text-foreground">{ins.bestDay.name} ({ins.bestDay.pct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={12} className="text-orange-400" />
                      <span className="text-muted">Worst:</span>
                      <span className="font-medium text-foreground">{ins.worstDay.name} ({ins.worstDay.pct}%)</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted">Track for a few more days to see patterns</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Start Challenge Modal */}
      {challengeModalHabitId && (() => {
        const habit = habits.find((h) => h.id === challengeModalHabitId);
        if (!habit) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass w-full max-w-sm rounded-2xl p-6 mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <Zap size={18} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Start Challenge</h2>
                  <p className="text-sm text-muted">{habit.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted mb-5">Commit to a streak challenge. Track your progress with a dedicated ring on this page.</p>
              <div className="space-y-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => {
                      startChallenge(habit.id, days);
                      setChallengeModalHabitId(null);
                    }}
                    className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <span className="font-medium text-sm">{days}-day challenge</span>
                    <span className="text-xs text-muted">
                      {days === 7 ? 'Short sprint' : days === 14 ? 'Build momentum' : 'Lock it in'}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setChallengeModalHabitId(null)}
                className="mt-4 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

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
