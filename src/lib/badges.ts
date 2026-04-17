import type { Task, Habit, JournalEntry, Goal, ScreenTimeEntry, StreakChallenge } from '@/lib/types';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;     // lucide-react icon name
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  category: 'tasks' | 'habits' | 'journal' | 'goals' | 'focus' | 'ai' | 'meta';
  // Returns { progress, total } where progress >= total means unlocked
  check: (ctx: BadgeContext) => { progress: number; total: number };
}

export interface BadgeContext {
  tasks: Task[];
  habits: Habit[];
  challenges: StreakChallenge[];
  completedChallenges: string[]; // ids of challenges that were completed
  journalEntries: JournalEntry[];
  goals: Goal[];
  screenTime: ScreenTimeEntry[];
  aiUsage: {
    coachMessages: number;
    briefsGenerated: number;
    tasksParsed: number;
    goalBreakdowns: number;
    weeklyReflections: number;
    challengesSuggested: number;
    tasksPrioritized: number;
    voiceInputsUsed: number;
  };
  focusSessionsCompleted: number;
  accentColorsUsed: number;
}

function longestStreak(habit: Habit): number {
  const dates = Object.keys(habit.completions)
    .filter((d) => habit.completions[d])
    .sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00');
    const curr = new Date(dates[i] + 'T00:00:00');
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Task badges
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: 'CheckCircle2',
    tier: 'bronze',
    category: 'tasks',
    check: (c) => ({ progress: Math.min(c.tasks.filter((t) => t.completed).length, 1), total: 1 }),
  },
  {
    id: 'ten-tasks',
    name: 'Getting Things Done',
    description: 'Complete 10 tasks',
    icon: 'CheckSquare',
    tier: 'silver',
    category: 'tasks',
    check: (c) => ({ progress: Math.min(c.tasks.filter((t) => t.completed).length, 10), total: 10 }),
  },
  {
    id: 'fifty-tasks',
    name: 'Productivity Machine',
    description: 'Complete 50 tasks',
    icon: 'Zap',
    tier: 'gold',
    category: 'tasks',
    check: (c) => ({ progress: Math.min(c.tasks.filter((t) => t.completed).length, 50), total: 50 }),
  },

  // Habit badges
  {
    id: 'first-habit',
    name: 'Habit Forming',
    description: 'Create your first habit',
    icon: 'Repeat',
    tier: 'bronze',
    category: 'habits',
    check: (c) => ({ progress: Math.min(c.habits.length, 1), total: 1 }),
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak on any habit',
    icon: 'Flame',
    tier: 'silver',
    category: 'habits',
    check: (c) => {
      const best = c.habits.reduce((m, h) => Math.max(m, longestStreak(h)), 0);
      return { progress: Math.min(best, 7), total: 7 };
    },
  },
  {
    id: 'month-streak',
    name: 'Iron Will',
    description: 'Maintain a 30-day streak on any habit',
    icon: 'Award',
    tier: 'gold',
    category: 'habits',
    check: (c) => {
      const best = c.habits.reduce((m, h) => Math.max(m, longestStreak(h)), 0);
      return { progress: Math.min(best, 30), total: 30 };
    },
  },
  {
    id: 'century',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak on any habit',
    icon: 'Crown',
    tier: 'legendary',
    category: 'habits',
    check: (c) => {
      const best = c.habits.reduce((m, h) => Math.max(m, longestStreak(h)), 0);
      return { progress: Math.min(best, 100), total: 100 };
    },
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete a Streak Challenge',
    icon: 'Trophy',
    tier: 'gold',
    category: 'habits',
    check: (c) => ({ progress: Math.min(c.completedChallenges.length, 1), total: 1 }),
  },

  // Journal badges
  {
    id: 'first-journal',
    name: 'Reflective',
    description: 'Write your first journal entry',
    icon: 'BookOpen',
    tier: 'bronze',
    category: 'journal',
    check: (c) => ({ progress: Math.min(c.journalEntries.length, 1), total: 1 }),
  },
  {
    id: 'ten-journals',
    name: 'Storyteller',
    description: 'Write 10 journal entries',
    icon: 'Feather',
    tier: 'silver',
    category: 'journal',
    check: (c) => ({ progress: Math.min(c.journalEntries.length, 10), total: 10 }),
  },
  {
    id: 'mood-tracker',
    name: 'Emotional IQ',
    description: 'Track your mood for 7 days',
    icon: 'Smile',
    tier: 'silver',
    category: 'journal',
    check: (c) => {
      const withMood = c.journalEntries.filter((e) => e.mood).length;
      return { progress: Math.min(withMood, 7), total: 7 };
    },
  },

  // Goals
  {
    id: 'first-goal',
    name: 'Dreamer',
    description: 'Create your first goal',
    icon: 'Target',
    tier: 'bronze',
    category: 'goals',
    check: (c) => ({ progress: Math.min(c.goals.length, 1), total: 1 }),
  },
  {
    id: 'goal-complete',
    name: 'Achiever',
    description: 'Complete a goal (hit 100% progress)',
    icon: 'Medal',
    tier: 'gold',
    category: 'goals',
    check: (c) => {
      const done = c.goals.filter((g) => g.progress >= g.target).length;
      return { progress: Math.min(done, 1), total: 1 };
    },
  },

  // Focus
  {
    id: 'focus-rookie',
    name: 'Focused',
    description: 'Complete a focus session',
    icon: 'Focus',
    tier: 'bronze',
    category: 'focus',
    check: (c) => ({ progress: Math.min(c.focusSessionsCompleted, 1), total: 1 }),
  },
  {
    id: 'focus-master',
    name: 'Deep Worker',
    description: 'Complete 10 focus sessions',
    icon: 'Brain',
    tier: 'gold',
    category: 'focus',
    check: (c) => ({ progress: Math.min(c.focusSessionsCompleted, 10), total: 10 }),
  },

  // AI
  {
    id: 'ai-curious',
    name: 'AI Curious',
    description: 'Chat with the AI Coach',
    icon: 'MessageSquare',
    tier: 'bronze',
    category: 'ai',
    check: (c) => ({ progress: Math.min(c.aiUsage.coachMessages, 1), total: 1 }),
  },
  {
    id: 'ai-power-user',
    name: 'AI Power User',
    description: 'Use 5 different AI features',
    icon: 'Sparkles',
    tier: 'gold',
    category: 'ai',
    check: (c) => {
      const u = c.aiUsage;
      const featuresUsed = [
        u.coachMessages > 0,
        u.briefsGenerated > 0,
        u.tasksParsed > 0,
        u.goalBreakdowns > 0,
        u.weeklyReflections > 0,
        u.challengesSuggested > 0,
        u.tasksPrioritized > 0,
        u.voiceInputsUsed > 0,
      ].filter(Boolean).length;
      return { progress: Math.min(featuresUsed, 5), total: 5 };
    },
  },
  {
    id: 'voice-master',
    name: 'Voice Master',
    description: 'Use voice input with AI Coach',
    icon: 'Mic',
    tier: 'silver',
    category: 'ai',
    check: (c) => ({ progress: Math.min(c.aiUsage.voiceInputsUsed, 1), total: 1 }),
  },

  // Meta
  {
    id: 'personalizer',
    name: 'Personalizer',
    description: 'Try 3 different accent colors',
    icon: 'Palette',
    tier: 'bronze',
    category: 'meta',
    check: (c) => ({ progress: Math.min(c.accentColorsUsed, 3), total: 3 }),
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Complete onboarding',
    icon: 'Rocket',
    tier: 'bronze',
    category: 'meta',
    check: () => ({ progress: 1, total: 1 }),
  },
];

export const TIER_COLORS: Record<BadgeDefinition['tier'], { bg: string; text: string; ring: string }> = {
  bronze: { bg: 'bg-amber-700/20', text: 'text-amber-500', ring: 'ring-amber-700/40' },
  silver: { bg: 'bg-slate-400/20', text: 'text-slate-300', ring: 'ring-slate-400/40' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', ring: 'ring-yellow-500/50' },
  legendary: { bg: 'bg-purple-500/20', text: 'text-purple-400', ring: 'ring-purple-500/50' },
};

export function evaluateBadges(ctx: BadgeContext) {
  return BADGE_DEFINITIONS.map((def) => {
    const { progress, total } = def.check(ctx);
    return {
      def,
      progress,
      total,
      unlocked: progress >= total,
      percent: total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0,
    };
  });
}
