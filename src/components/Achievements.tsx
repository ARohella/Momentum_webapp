'use client';

import { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Lock, Trophy } from 'lucide-react';
import { BADGE_DEFINITIONS, evaluateBadges, TIER_COLORS } from '@/lib/badges';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useJournalStore } from '@/stores/journalStore';
import { useGoalStore } from '@/stores/goalStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useRewardsStore } from '@/stores/rewardsStore';

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

const CATEGORY_LABELS: Record<string, string> = {
  tasks: 'Tasks',
  habits: 'Habits',
  journal: 'Journal',
  goals: 'Goals',
  focus: 'Focus',
  ai: 'AI',
  meta: 'Milestones',
};

export function Achievements() {
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const challenges = useHabitStore((s) => s.challenges);
  const entries = useJournalStore((s) => s.entries);
  const goals = useGoalStore((s) => s.goals);
  const screenTime = useScreenTimeStore((s) => s.entries);
  const rewards = useRewardsStore();

  const evaluated = useMemo(
    () =>
      evaluateBadges({
        tasks,
        habits,
        challenges,
        completedChallenges: rewards.completedChallenges,
        journalEntries: entries,
        goals,
        screenTime,
        aiUsage: rewards.aiUsage,
        focusSessionsCompleted: rewards.focusSessionsCompleted,
        accentColorsUsed: rewards.accentColorsUsed.length,
      }),
    [tasks, habits, challenges, entries, goals, screenTime, rewards]
  );

  const unlockedCount = evaluated.filter((b) => b.unlocked).length;
  const totalCount = evaluated.length;

  const grouped = useMemo(() => {
    const g: Record<string, typeof evaluated> = {};
    for (const b of evaluated) {
      const cat = b.def.category;
      if (!g[cat]) g[cat] = [];
      g[cat].push(b);
    }
    return g;
  }, [evaluated]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-accent" />
          <h2 className="font-semibold">Achievements</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {unlockedCount}<span className="text-muted">/{totalCount}</span>
          </div>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([category, badges]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {badges.map((b) => {
                const IconComp = (Icons as unknown as Record<string, LucideIcon>)[b.def.icon];
                const colors = TIER_COLORS[b.def.tier];
                return (
                  <div
                    key={b.def.id}
                    className={`group relative rounded-xl border border-border p-3 transition-all ${
                      b.unlocked
                        ? `${colors.bg} ring-1 ${colors.ring}`
                        : 'bg-background opacity-60 hover:opacity-100'
                    }`}
                    title={b.def.description}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          b.unlocked ? colors.bg : 'bg-surface'
                        }`}
                      >
                        {b.unlocked && IconComp ? (
                          <IconComp size={18} className={colors.text} />
                        ) : (
                          <Lock size={14} className="text-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${b.unlocked ? '' : 'text-muted'}`}>
                          {b.def.name}
                        </p>
                        <p className="text-[10px] text-muted line-clamp-2 leading-tight mt-0.5">
                          {b.def.description}
                        </p>
                        {!b.unlocked && b.total > 1 && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full bg-accent/60 transition-all"
                                style={{ width: `${b.percent}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted">
                              {b.progress}/{b.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
