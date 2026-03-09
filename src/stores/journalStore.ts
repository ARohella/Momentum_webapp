import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { JournalEntry } from '@/lib/types';
import { format } from 'date-fns';

interface JournalStore {
  entries: JournalEntry[];
  getEntryForDate: (date: string) => JournalEntry | undefined;
  saveEntry: (date: string, wentWell: string, toImprove: string, freeform: string) => void;
  getAllEntries: () => JournalEntry[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      getEntryForDate: (date) => {
        return get().entries.find((e) => e.date === date);
      },
      saveEntry: (date, wentWell, toImprove, freeform) => {
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.date === date ? { ...e, wentWell, toImprove, freeform } : e
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
