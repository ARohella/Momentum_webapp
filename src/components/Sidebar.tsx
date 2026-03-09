'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Repeat,
  BookOpen,
  Target,
  BarChart3,
  Focus,
  Smartphone,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  MessageSquare,
  User,
} from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useJournalStore } from '@/stores/journalStore';
import { useGoalStore } from '@/stores/goalStore';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { useDemoStore } from '@/stores/demoStore';
import {
  getDemoCalendarEvents,
  getDemoTasks,
  getDemoHabits,
  getDemoJournalEntries,
  getDemoGoals,
  getDemoScreenTimeEntries,
} from '@/lib/demoData';
import { useState, useCallback, useRef } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/habits', label: 'Habits', icon: Repeat },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/focus', label: 'Focus', icon: Focus },
  { href: '/screen-time', label: 'Screen Time', icon: Smartphone },
  { href: '/coach', label: 'AI Coach', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = usePreferencesStore();
  const [collapsed, setCollapsed] = useState(false);
  const { isDemoMode, setDemoMode } = useDemoStore();

  // Store refs for backup/restore
  const backupRef = useRef<Record<string, unknown> | null>(null);

  const enterDemoMode = useCallback(() => {
    backupRef.current = {
      events: [...useCalendarStore.getState().events],
      tasks: [...useTaskStore.getState().tasks],
      habits: [...useHabitStore.getState().habits],
      journalEntries: [...useJournalStore.getState().entries],
      goals: [...useGoalStore.getState().goals],
      screenEntries: [...useScreenTimeStore.getState().entries],
    };

    // Load demo data by directly setting state
    useCalendarStore.setState({ events: getDemoCalendarEvents() });
    useTaskStore.setState({ tasks: getDemoTasks() });
    useHabitStore.setState({ habits: getDemoHabits() });
    useJournalStore.setState({ entries: getDemoJournalEntries() });
    useGoalStore.setState({ goals: getDemoGoals() });
    useScreenTimeStore.setState({ entries: getDemoScreenTimeEntries() });

    setDemoMode(true);
  }, [setDemoMode]);

  const exitDemoMode = useCallback(() => {
    const b = backupRef.current;
    if (b) {
      useCalendarStore.setState({ events: b.events as never[] });
      useTaskStore.setState({ tasks: b.tasks as never[] });
      useHabitStore.setState({ habits: b.habits as never[] });
      useJournalStore.setState({ entries: b.journalEntries as never[] });
      useGoalStore.setState({ goals: b.goals as never[] });
      useScreenTimeStore.setState({ entries: b.screenEntries as never[] });
      backupRef.current = null;
    } else {
      useCalendarStore.setState({ events: [] });
      useTaskStore.setState({ tasks: [] });
      useHabitStore.setState({ habits: [] });
      useJournalStore.setState({ entries: [] });
      useGoalStore.setState({ goals: [] });
      useScreenTimeStore.setState({ entries: [] });
    }

    setDemoMode(false);
  }, [setDemoMode]);

  const themeOptions = [
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'light' as const, icon: Sun, label: 'Light' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
          M
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Momentum</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Demo mode toggle */}
      <div className="border-t border-border px-3 py-2">
        <button
          onClick={isDemoMode ? exitDemoMode : enterDemoMode}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            isDemoMode
              ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
              : 'text-muted hover:bg-surface-hover hover:text-foreground'
          }`}
          title={isDemoMode ? 'Exit Demo Mode' : 'Enter Demo Mode'}
        >
          <FlaskConical size={16} className="shrink-0" />
          {!collapsed && <span>{isDemoMode ? 'Exit Demo' : 'Demo Mode'}</span>}
        </button>
      </div>

      {/* Theme toggle */}
      <div className="border-t border-border px-3 py-3">
        <div className={`flex ${collapsed ? 'flex-col' : ''} items-center gap-1 rounded-lg bg-background p-1`}>
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  theme === opt.value
                    ? 'bg-surface-hover text-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
                title={opt.label}
              >
                <Icon size={14} />
                {!collapsed && <span>{opt.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center border-t border-border text-muted hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
