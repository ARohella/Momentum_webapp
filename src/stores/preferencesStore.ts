import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  wakeTime: string;   // HH:mm format
  sleepTime: string;   // HH:mm format
  workStartTime: string;
  workEndTime: string;
  workDays: number[];  // 0=Sun, 1=Mon, ..., 6=Sat
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening';
  focusHours: 'morning' | 'afternoon';
  bio: string;
}

interface PreferencesStore {
  theme: 'dark' | 'light';
  categories: string[];
  onboardingCompleted: boolean;
  profile: UserProfile;
  setTheme: (theme: 'dark' | 'light') => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_CATEGORIES = ['work', 'health', 'learning', 'personal', 'leisure'];

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  wakeTime: '07:00',
  sleepTime: '23:00',
  workStartTime: '09:00',
  workEndTime: '17:00',
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
  preferredWorkoutTime: 'morning',
  focusHours: 'morning',
  bio: '',
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      categories: DEFAULT_CATEGORIES,
      onboardingCompleted: false,
      profile: DEFAULT_PROFILE,
      setTheme: (theme) => set({ theme }),
      addCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category.toLowerCase())
            ? state.categories
            : [...state.categories, category.toLowerCase()],
        })),
      removeCategory: (category) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
    }),
    { name: 'momentum-preferences' }
  )
);
