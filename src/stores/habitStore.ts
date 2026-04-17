import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Habit, StreakChallenge } from '@/lib/types';
import { format, addDays } from 'date-fns';

const MAX_HABITS = 7;

interface HabitStore {
  habits: Habit[];
  challenges: StreakChallenge[];
  addHabit: (name: string, category: string) => { success: boolean; message?: string };
  removeHabit: (id: string) => { hadStreak: boolean; streakLength: number };
  toggleCompletion: (id: string, date?: string) => void;
  getActiveHabits: () => Habit[];
  getStreak: (id: string) => number;
  canAddHabit: () => boolean;
  startChallenge: (habitId: string, targetDays: number) => StreakChallenge;
  endChallenge: (id: string) => void;
  getChallengesForHabit: (habitId: string) => StreakChallenge[];
  getChallengeProgress: (challengeId: string) => { completed: number; total: number };
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      challenges: [],
      startChallenge: (habitId, targetDays) => {
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(addDays(new Date(), targetDays - 1), 'yyyy-MM-dd');
        const challenge: StreakChallenge = {
          id: uuid(),
          habitId,
          targetDays,
          startDate,
          endDate,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ challenges: [...state.challenges, challenge] }));
        return challenge;
      },
      endChallenge: (id) => {
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
        }));
      },
      getChallengesForHabit: (habitId) => {
        return get().challenges.filter((c) => c.habitId === habitId);
      },
      getChallengeProgress: (challengeId) => {
        const challenge = get().challenges.find((c) => c.id === challengeId);
        if (!challenge) return { completed: 0, total: 0 };
        const habit = get().habits.find((h) => h.id === challenge.habitId);
        if (!habit) return { completed: 0, total: challenge.targetDays };

        let completed = 0;
        const start = new Date(challenge.startDate + 'T00:00:00');
        for (let i = 0; i < challenge.targetDays; i++) {
          const d = format(addDays(start, i), 'yyyy-MM-dd');
          if (habit.completions[d]) completed++;
        }
        return { completed, total: challenge.targetDays };
      },
      addHabit: (name, category) => {
        const active = get().habits.filter((h) => h.isActive);
        if (active.length >= MAX_HABITS) {
          return {
            success: false,
            message: `You can track a maximum of ${MAX_HABITS} habits. Focusing on fewer habits improves consistency. Remove a habit to add a new one.`,
          };
        }
        const habit: Habit = {
          id: uuid(),
          name,
          category,
          createdAt: new Date().toISOString(),
          completions: {},
          isActive: true,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        return { success: true };
      },
      removeHabit: (id) => {
        const habit = get().habits.find((h) => h.id === id);
        const streak = habit ? get().getStreak(id) : 0;
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, isActive: false } : h
          ),
        }));
        return { hadStreak: streak > 0, streakLength: streak };
      },
      toggleCompletion: (id, date) => {
        const dateKey = date || format(new Date(), 'yyyy-MM-dd');
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completions: {
                    ...h.completions,
                    [dateKey]: !h.completions[dateKey],
                  },
                }
              : h
          ),
        }));
      },
      getActiveHabits: () => {
        return get().habits.filter((h) => h.isActive);
      },
      getStreak: (id) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return 0;

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = format(d, 'yyyy-MM-dd');
          if (habit.completions[key]) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },
      canAddHabit: () => {
        return get().habits.filter((h) => h.isActive).length < MAX_HABITS;
      },
    }),
    { name: 'momentum-habits' }
  )
);
