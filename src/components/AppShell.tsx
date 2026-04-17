'use client';

import { Sidebar } from './Sidebar';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const onboardingCompleted = usePreferencesStore((s) => s.onboardingCompleted);
  const focusModeActive = usePreferencesStore((s) => s.focusModeActive);
  const hasHydrated = usePreferencesStore((s) => s._hasHydrated);

  // Wait for persisted state to load before deciding
  if (!hasHydrated) {
    return <div className="min-h-screen" />;
  }

  // If onboarding not completed, render children directly (onboarding page handles itself)
  if (!onboardingCompleted) {
    return <>{children}</>;
  }

  // In focus mode, render children full-screen without sidebar
  if (focusModeActive) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[220px] flex-1 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
