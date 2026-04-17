import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { JournalEntry, Mood } from '@/lib/types';

interface JournalStore {
  entries: JournalEntry[];
  getEntryForDate: (date: string) => JournalEntry | undefined;
  saveEntry: (date: string, wentWell: string, toImprove: string, freeform: string, mood?: Mood) => void;
  setMood: (date: string, mood: Mood) => void;
  getAllEntries: () => JournalEntry[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      getEntryForDate: (date) => {
        return get().entries.find((e) => e.date === date);
      },
      saveEntry: (date, wentWell, toImprove, freeform, mood) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.date === date
                ? { ...e, wentWell, toImprove, freeform, mood: mood ?? e.mood }
                : e
            ),
          }));
        } else {
          set((state) => ({
            entries: [
              ...state.entries,
              {
                id: uuid(),
                date,
                wentWell,
                toImprove,
                freeform,
                mood,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },
      setMood: (date, mood) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.date === date ? { ...e, mood } : e
            ),
          }));
        } else {
          set((state) => ({
            entries: [
              ...state.entries,
              {
                id: uuid(),
                date,
                wentWell: '',
                toImprove: '',
                freeform: '',
                mood,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },
      getAllEntries: () => {
        return [...get().entries].sort((a, b) => b.date.localeCompare(a.date));
      },
    }),
    { name: 'momentum-journal' }
  )
);
