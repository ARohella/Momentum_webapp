'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);
  const accentColor = usePreferencesStore((s) => s.accentColor);
  const accentHover = usePreferencesStore((s) => s.accentHover);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--accent-hover', accentHover);
  }, [accentColor, accentHover]);

  return <>{children}</>;
}
