import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Habit } from '@/lib/types';
import { format } from 'date-fns';

const MAX_HABITS = 7;

interface HabitStore {
  habits: Habit[];
  addHabit: (name: string, category: string) => { success: boolean; message?: string };
  removeHabit: (id: string) => { hadStreak: boolean; streakLength: number };
  toggleCompletion: (id: string, date?: string) => void;
  getActiveHabits: () => Habit[];
  getStreak: (id: string) => number;
  canAddHabit: () => boolean;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
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
