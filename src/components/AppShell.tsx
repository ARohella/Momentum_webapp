'use client';

import { Sidebar } from './Sidebar';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const onboardingCompleted = usePreferencesStore((s) => s.onboardingCompleted);

  // If onboarding not completed, render children directly (onboarding page handles itself)
  if (!onboardingCompleted) {
    return <>{children}</>;
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
