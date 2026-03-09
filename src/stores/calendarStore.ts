import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { CalendarEvent, CATEGORY_COLORS } from '@/lib/types';

interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'color'> & { color?: string }) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) => {
        const newEvent: CalendarEvent = {
          ...event,
          id: uuid(),
          color: event.color || CATEGORY_COLORS[event.category] || CATEGORY_COLORS.custom,
        };
        set((state) => ({ events: [...state.events, newEvent] }));
        return newEvent;
      },
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },
      getEventsForDate: (date) => {
        return get().events.filter((e) => e.start.startsWith(date));
      },
    }),
    { name: 'momentum-calendar' }
  )
);
