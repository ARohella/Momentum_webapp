import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DemoStore {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      isDemoMode: false,
      setDemoMode: (value) => set({ isDemoMode: value }),
    }),
    { name: 'momentum-demo' }
  )
);
