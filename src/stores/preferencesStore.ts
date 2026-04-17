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
  accentColor: string;
  accentHover: string;
  productivityStreak: number;
  lastProductiveDate: string;
  focusModeActive: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAccentColor: (value: string, hover: string) => void;
  recordProductivityScore: (score: number, today: string) => void;
  setFocusMode: (v: boolean) => void;
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
      accentColor: '#6366f1',
      accentHover: '#818cf8',
      productivityStreak: 0,
      lastProductiveDate: '',
      focusModeActive: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (value, hover) => set({ accentColor: value, accentHover: hover }),
      recordProductivityScore: (score, today) =>
        set((state) => {
          if (state.lastProductiveDate === today) return state;
          const newStreak = score >= 70 ? state.productivityStreak + 1 : 0;
          return {
            productivityStreak: newStreak,
            lastProductiveDate: today,
          };
        }),
      setFocusMode: (v) => set({ focusModeActive: v }),
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
    {
      name: 'momentum-preferences',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
