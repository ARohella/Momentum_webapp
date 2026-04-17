'use client';

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { format, subDays, differenceInMinutes } from 'date-fns';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useJournalStore } from '@/stores/journalStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { MOOD_LABEL } from '@/lib/types';

function formatReflection(md: string): string {
  // Lightweight markdown: **bold** → <strong>
  return md.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
}

export function WeeklyReflection() {
  const events = useCalendarStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const entries = useJournalStore((s) => s.entries);
  const screen = useScreenTimeStore((s) => s.entries);
  const incrementAI = useRewardsStore((s) => s.incrementAI);

  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildContext = () => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return { date: d, dateStr: format(d, 'yyyy-MM-dd'), dayName: format(d, 'EEEE') };
    });

    const lines: string[] = [];
    lines.push(`Reflection window: ${format(days[0].date, 'MMM d')} – ${format(today, 'MMM d, yyyy')}`);

    // Habits
    lines.push('\n=== HABITS ===');
    const activeHabits = habits.filter((h) => h.isActive);
    for (const h of activeHabits) {
      const weekly = days.filter((d) => h.completions[d.dateStr]).length;
      lines.push(`• ${h.name} (${h.category}): ${weekly}/7 days this week`);
    }

    // Tasks
    lines.push('\n=== TASKS ===');
    const weekTasks = tasks.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= days[0].date;
    });
    const completed = weekTasks.filter((t) => t.completed);
    lines.push(`Completed this week: ${completed.length} / ${weekTasks.length}`);
    for (const t of completed.slice(0, 10)) {
      lines.push(`  ✓ ${t.title} (${t.category})`);
    }

    // Journal + moods
    lines.push('\n=== JOURNAL & MOOD (past 7 days) ===');
    for (const d of days) {
      const e = entries.find((en) => en.date === d.dateStr);
      if (e) {
        const mood = e.mood ? MOOD_LABEL[e.mood] : 'no mood logged';
        lines.push(`${d.dayName}: mood=${mood}`);
        if (e.wentWell) lines.push(`  went well: ${e.wentWell.slice(0, 120)}`);
        if (e.toImprove) lines.push(`  to improve: ${e.toImprove.slice(0, 120)}`);
      } else {
        lines.push(`${d.dayName}: no journal entry`);
      }
    }

    // Calendar time by category
    lines.push('\n=== TIME BY CATEGORY (this week) ===');
    const catTime: Record<string, number> = {};
    events.forEach((ev) => {
      const s = new Date(ev.start);
      if (s >= days[0].date && s <= today) {
        const mins = differenceInMinutes(new Date(ev.end), s);
        catTime[ev.category] = (catTime[ev.category] || 0) + mins;
      }
    });
    for (const [cat, mins] of Object.entries(catTime)) {
      lines.push(`${cat}: ${Math.round(mins / 60)}h`);
    }

    // Screen time
    lines.push('\n=== SCREEN TIME (past 7 days) ===');
    for (const d of days) {
      const st = screen.find((e) => e.date === d.dateStr);
      if (st) lines.push(`${d.dayName}: ${st.hours}h ${st.minutes}m`);
    }

    return lines.join('\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = buildContext();
      const res = await fetch('/api/ai-weekly-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setReflection(data.reflection);
      incrementAI('weeklyReflections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reflection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h2 className="font-semibold">AI Weekly Reflection</h2>
        </div>
        {reflection && !loading && (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface-hover transition-colors"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        )}
      </div>

      {!reflection && !loading && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted mb-4 max-w-md mx-auto">
            Let AI analyze your past 7 days of habits, tasks, mood, and schedule — and surface
            patterns, wins, concerns, and tailored recommendations.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Sparkles size={16} />
            Reflect on My Week
          </button>
        </div>
      )}

      {loading && (
        <div className="py-8 text-center">
          <Loader2 size={24} className="mx-auto animate-spin text-accent" />
          <p className="text-xs text-muted mt-2">Analyzing your week…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {reflection && !loading && (
        <div
          className="prose prose-invert text-sm text-white/80 space-y-3 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatReflection(reflection) }}
        />
      )}
    </div>
  );
}
