'use client';

import { useState, useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useGoalStore } from '@/stores/goalStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Calendar,
  Target,
  Flame,
  Heart,
  X,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface Brief {
  headline: string;
  scheduleNote: string;
  focusNote: string;
  habitsNote: string;
  motivation: string;
  vibe: string;
}

const VIBE_STYLES: Record<string, { label: string; className: string }> = {
  energized: { label: 'Energized', className: 'from-amber-500 to-orange-500' },
  focused: { label: 'Focused', className: 'from-indigo-500 to-blue-500' },
  balanced: { label: 'Balanced', className: 'from-emerald-500 to-teal-500' },
  recovery: { label: 'Recovery', className: 'from-sky-500 to-cyan-500' },
  ambitious: { label: 'Ambitious', className: 'from-purple-500 to-pink-500' },
};

export function DashboardAIBrief() {
  const events = useCalendarStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTaskComplete = useTaskStore((s) => s.toggleComplete);
  const habits = useHabitStore((s) => s.habits);
  const toggleHabit = useHabitStore((s) => s.toggleCompletion);
  const goals = useGoalStore((s) => s.goals);
  const profile = usePreferencesStore((s) => s.profile);
  const incrementAI = useRewardsStore((s) => s.incrementAI);

  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayEventsList = events
    .filter((e) => e.start.startsWith(today))
    .sort((a, b) => a.start.localeCompare(b.start));

  const topTasks = tasks.filter((t) => t.isTopThree);

  const activeHabits = habits.filter((h) => h.isActive);

  const computeStreak = (completions: Record<string, boolean>) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const k = format(new Date(d.getTime() - i * 86400000), 'yyyy-MM-dd');
      if (completions[k]) streak++;
      else break;
    }
    return streak;
  };

  const buildContext = () => {
    const todayEvents = todayEventsList.map(
      (e) => `${e.title} (${format(new Date(e.start), 'h:mm a')} - ${format(new Date(e.end), 'h:mm a')})`
    );
    const topTasksCtx = topTasks
      .filter((t) => !t.completed)
      .map((t) => `${t.title} (${t.estimatedDuration}min)`);
    const habitsCtx = activeHabits.map((h) => {
      const streak = computeStreak(h.completions);
      const doneToday = h.completions[today] ? 'done' : 'pending';
      return `${h.name} (${streak}-day streak, ${doneToday})`;
    });
    const goalsCtx = goals.map(
      (g) => `${g.title}: ${Math.round((g.progress / g.target) * 100)}% complete`
    );

    return `Today: ${today} (${format(new Date(), 'EEEE')})
User: ${profile.name || 'User'}

Today's Events: ${todayEvents.join('; ') || 'None scheduled'}

Top 3 Tasks: ${topTasksCtx.join('; ') || 'None set'}

Active Habits: ${habitsCtx.join('; ') || 'None'}

Goals: ${goalsCtx.join('; ') || 'None'}`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      incrementAI('briefsGenerated');
      const res = await fetch('/api/ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: buildContext() }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setBrief(data.brief);
    } catch {
      setError("Couldn't connect to the AI service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const vibe = brief?.vibe && VIBE_STYLES[brief.vibe] ? VIBE_STYLES[brief.vibe] : VIBE_STYLES.focused;

  const completedTopTasks = topTasks.filter((t) => t.completed).length;
  const doneHabitsCount = activeHabits.filter((h) => h.completions[today]).length;

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <Sparkles size={14} />
            </div>
            <h2 className="font-semibold text-sm">Your Daily Brief</h2>
          </div>
          {brief && (
            <button
              onClick={() => setOpen(true)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              View brief →
            </button>
          )}
        </div>

        <button
          onClick={brief ? () => setOpen(true) : handleGenerate}
          className="w-full text-left rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-accent/20 p-4 hover:from-purple-500/15 hover:to-indigo-500/15 transition-all group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted mb-0.5">{greeting}, {profile.name || 'friend'}</p>
              <p className="text-sm font-semibold truncate">
                {brief ? brief.headline : 'Get your personalized brief'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {todayEventsList.length} event{todayEventsList.length === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={11} />
                  {completedTopTasks}/{topTasks.length || 0} tasks
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={11} />
                  {doneHabitsCount}/{activeHabits.length} habits
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white group-hover:bg-accent-hover transition-colors">
                <Sparkles size={12} />
                {brief ? 'Open' : 'Generate'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative bg-gradient-to-br ${vibe.className} p-6 text-white`}>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1.5 hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
              <p className="text-xs uppercase tracking-wider opacity-80">
                {greeting}, {profile.name || 'friend'}
              </p>
              <h2 className="text-2xl font-bold mt-1 pr-8">
                {loading ? 'Generating your brief…' : brief?.headline || 'Your Daily Brief'}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-white/20 px-2.5 py-1 font-medium">
                  {format(new Date(), 'EEEE, MMM d')}
                </span>
                {brief && (
                  <span className="rounded-full bg-white/20 px-2.5 py-1 font-medium">
                    {vibe.label}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="ml-auto flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                  Regenerate
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {loading && !brief && (
                <div className="flex items-center gap-2 justify-center py-8 text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking through your day...</span>
                </div>
              )}

              {/* Schedule */}
              <section className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                    <Calendar size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Schedule</h3>
                    {brief?.scheduleNote && (
                      <p className="text-xs text-muted mt-0.5">{brief.scheduleNote}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted">{todayEventsList.length}</span>
                </div>
                {todayEventsList.length === 0 ? (
                  <p className="text-xs text-muted italic">No events scheduled today.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {todayEventsList.slice(0, 5).map((e) => (
                      <li key={e.id} className="flex items-center gap-3 text-sm">
                        <Clock size={12} className="text-muted shrink-0" />
                        <span className="text-xs text-muted w-20 shrink-0 font-mono">
                          {format(new Date(e.start), 'h:mm a')}
                        </span>
                        <span className="truncate">{e.title}</span>
                      </li>
                    ))}
                    {todayEventsList.length > 5 && (
                      <li className="text-xs text-muted pl-8">
                        +{todayEventsList.length - 5} more
                      </li>
                    )}
                  </ul>
                )}
              </section>

              {/* Focus */}
              <section className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Target size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Today's Focus</h3>
                    {brief?.focusNote && (
                      <p className="text-xs text-muted mt-0.5">{brief.focusNote}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {completedTopTasks}/{topTasks.length}
                  </span>
                </div>
                {topTasks.length === 0 ? (
                  <p className="text-xs text-muted italic">No top-3 tasks set — pick your priorities.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {topTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 text-sm">
                        <button
                          onClick={() => toggleTaskComplete(t.id)}
                          className={`shrink-0 transition-colors ${
                            t.completed ? 'text-emerald-400' : 'text-muted hover:text-foreground'
                          }`}
                        >
                          {t.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <span className={`flex-1 truncate ${t.completed ? 'line-through text-muted' : ''}`}>
                          {t.title}
                        </span>
                        <span className="text-xs text-muted shrink-0">{t.estimatedDuration}m</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Habits */}
              <section className="rounded-xl border border-border bg-background/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                    <Flame size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">Habits</h3>
                    {brief?.habitsNote && (
                      <p className="text-xs text-muted mt-0.5">{brief.habitsNote}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {doneHabitsCount}/{activeHabits.length}
                  </span>
                </div>
                {activeHabits.length === 0 ? (
                  <p className="text-xs text-muted italic">No active habits yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeHabits.map((h) => {
                      const streak = computeStreak(h.completions);
                      const done = !!h.completions[today];
                      return (
                        <button
                          key={h.id}
                          onClick={() => toggleHabit(h.id)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                            done
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : 'border-border bg-background hover:bg-surface-hover'
                          }`}
                        >
                          {done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                          <span className="font-medium">{h.name}</span>
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-orange-400">
                              <Flame size={10} />
                              {streak}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Goals snapshot */}
              {goals.length > 0 && (
                <section className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <TrendingUp size={15} />
                    </div>
                    <h3 className="font-semibold text-sm flex-1">Goals</h3>
                  </div>
                  <div className="space-y-2">
                    {goals.slice(0, 3).map((g) => {
                      const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
                      return (
                        <div key={g.id}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="truncate pr-2">{g.title}</span>
                            <span className="text-muted font-mono">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Motivation */}
              {brief?.motivation && (
                <section className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shrink-0">
                      <Heart size={15} />
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 pt-1">
                      {brief.motivation}
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
