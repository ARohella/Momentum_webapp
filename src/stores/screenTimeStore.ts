import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { ScreenTimeEntry } from '@/lib/types';
import { format, subDays } from 'date-fns';

interface ScreenTimeStore {
  entries: ScreenTimeEntry[];
  logScreenTime: (date: string, hours: number, minutes: number) => void;
  getEntryForDate: (date: string) => ScreenTimeEntry | undefined;
  getWeeklyAverage: () => number; // in minutes
  getRecentEntries: (days: number) => ScreenTimeEntry[];
}

export const useScreenTimeStore = create<ScreenTimeStore>()(
  persist(
    (set, get) => ({
      entries: [],
      logScreenTime: (date, hours, minutes) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.date === date ? { ...e, hours, minutes } : e
            ),
          }));
        } else {
          set((state) => ({
            entries: [...state.entries, { id: uuid(), date, hours, minutes }],
          }));
        }
      },
      getEntryForDate: (date) => {
        return get().entries.find((e) => e.date === date);
      },
      getWeeklyAverage: () => {
        const today = new Date();
        const weekEntries = [];
        for (let i = 0; i < 7; i++) {
          const d = format(subDays(today, i), 'yyyy-MM-dd');
          const entry = get().entries.find((e) => e.date === d);
          if (entry) weekEntries.push(entry.hours * 60 + entry.minutes);
        }
        if (weekEntries.length === 0) return 0;
        return Math.round(weekEntries.reduce((a, b) => a + b, 0) / weekEntries.length);
      },
      getRecentEntries: (days) => {
        const today = new Date();
        const dates = Array.from({ length: days }, (_, i) =>
          format(subDays(today, i), 'yyyy-MM-dd')
        );
        return dates
          .map((d) => get().entries.find((e) => e.date === d))
          .filter(Boolean) as ScreenTimeEntry[];
      },
    }),
    { name: 'momentum-screentime' }
  )
);
