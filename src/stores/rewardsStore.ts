import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIUsage {
  coachMessages: number;
  briefsGenerated: number;
  tasksParsed: number;
  goalBreakdowns: number;
  weeklyReflections: number;
  challengesSuggested: number;
  tasksPrioritized: number;
  voiceInputsUsed: number;
}

interface RewardsStore {
  aiUsage: AIUsage;
  focusSessionsCompleted: number;
  completedChallenges: string[];
  accentColorsUsed: string[]; // hex colors ever used
  unlockedBadges: string[]; // badge ids user has unlocked (used to detect new unlocks)
  lastSeenBadges: string[]; // badge ids user has already seen the toast/animation for

  incrementAI: (key: keyof AIUsage, by?: number) => void;
  incrementFocusSession: () => void;
  markChallengeCompleted: (challengeId: string) => void;
  recordAccentColor: (hex: string) => void;
  setUnlockedBadges: (ids: string[]) => void;
  markBadgesSeen: (ids: string[]) => void;
}

export const useRewardsStore = create<RewardsStore>()(
  persist(
    (set) => ({
      aiUsage: {
        coachMessages: 0,
        briefsGenerated: 0,
        tasksParsed: 0,
        goalBreakdowns: 0,
        weeklyReflections: 0,
        challengesSuggested: 0,
        tasksPrioritized: 0,
        voiceInputsUsed: 0,
      },
      focusSessionsCompleted: 0,
      completedChallenges: [],
      accentColorsUsed: [],
      unlockedBadges: [],
      lastSeenBadges: [],

      incrementAI: (key, by = 1) =>
        set((state) => ({
          aiUsage: { ...state.aiUsage, [key]: state.aiUsage[key] + by },
        })),
      incrementFocusSession: () =>
        set((state) => ({ focusSessionsCompleted: state.focusSessionsCompleted + 1 })),
      markChallengeCompleted: (id) =>
        set((state) =>
          state.completedChallenges.includes(id)
            ? state
            : { completedChallenges: [...state.completedChallenges, id] }
        ),
      recordAccentColor: (hex) =>
        set((state) =>
          state.accentColorsUsed.includes(hex)
            ? state
            : { accentColorsUsed: [...state.accentColorsUsed, hex] }
        ),
      setUnlockedBadges: (ids) => set({ unlockedBadges: ids }),
      markBadgesSeen: (ids) => set({ lastSeenBadges: ids }),
    }),
    { name: 'momentum-rewards' }
  )
);
