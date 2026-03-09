export type Category = 'work' | 'health' | 'learning' | 'personal' | 'leisure' | 'custom';

export const CATEGORY_COLORS: Record<Category | string, string> = {
  work: '#3b82f6',
  health: '#22c55e',
  learning: '#a855f7',
  personal: '#f59e0b',
  leisure: '#ec4899',
  custom: '#6b7280',
};

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  category: Category | string;
  color: string;
  isTask?: boolean;
  taskId?: string;
  recurrence?: string; // RRule string
  allDay?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedDuration: number; // minutes
  deadline?: string;
  category: Category | string;
  completed: boolean;
  isTopThree: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
  calendarEventId?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: Category | string;
  createdAt: string;
  completions: Record<string, boolean>; // date string -> completed
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  wentWell: string;
  toImprove: string;
  freeform: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'time' | 'milestone' | 'custom';
  target: number;
  unit: string; // 'hours', 'tasks', 'books', 'km', etc.
  progress: number;
  category: Category | string;
  deadline?: string;
  createdAt: string;
}

export interface ScreenTimeEntry {
  id: string;
  date: string;
  hours: number;
  minutes: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  categories: string[];
  onboardingCompleted: boolean;
}
