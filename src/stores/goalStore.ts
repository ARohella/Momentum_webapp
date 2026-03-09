import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Goal } from '@/lib/types';

interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  incrementProgress: (id: string, amount: number) => void;
  getProgressPercentage: (id: string) => number;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [],
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: uuid(),
          progress: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
        return newGoal;
      },
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },
      incrementProgress: (id, amount) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, progress: Math.min(g.progress + amount, g.target) } : g
          ),
        }));
      },
      getProgressPercentage: (id) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal || goal.target === 0) return 0;
        return Math.round((goal.progress / goal.target) * 100);
      },
    }),
    { name: 'momentum-goals' }
  )
);
