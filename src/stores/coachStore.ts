import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ScheduleBlock {
  title: string;
  start: string;
  end: string;
  category: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  scheduleBlocks?: ScheduleBlock[];
  acceptedBlocks?: number[];
}

interface CoachStore {
  messages: CoachMessage[];
  addMessage: (msg: CoachMessage) => void;
  markBlockAccepted: (messageId: string, blockIndex: number) => void;
  clearMessages: () => void;
}

export const useCoachStore = create<CoachStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      markBlockAccepted: (messageId, blockIndex) =>
        set((s) => ({
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.acceptedBlocks || [];
            if (existing.includes(blockIndex)) return m;
            return { ...m, acceptedBlocks: [...existing, blockIndex] };
          }),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'momentum-coach' }
  )
);
