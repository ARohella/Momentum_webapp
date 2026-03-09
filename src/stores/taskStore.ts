import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Task } from '@/lib/types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'isTopThree' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleTopThree: (id: string) => boolean;
  getTopThree: () => Task[];
  getIncompleteTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: uuid(),
          completed: false,
          isTopThree: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      },
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },
      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },
      toggleTopThree: (id) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return false;

        if (!task.isTopThree) {
          const currentTopThree = state.tasks.filter((t) => t.isTopThree && !t.completed);
          if (currentTopThree.length >= 3) return false;
        }

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, isTopThree: !t.isTopThree } : t
          ),
        }));
        return true;
      },
      getTopThree: () => {
        return get().tasks.filter((t) => t.isTopThree && !t.completed);
      },
      getIncompleteTasks: () => {
        return get().tasks.filter((t) => !t.completed);
      },
    }),
    { name: 'momentum-tasks' }
  )
);
