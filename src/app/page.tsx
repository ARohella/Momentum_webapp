'use client';

import { usePreferencesStore } from '@/stores/preferencesStore';
import { redirect } from 'next/navigation';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { DashboardTasks } from '@/components/dashboard/DashboardTasks';
import { DashboardHabits } from '@/components/dashboard/DashboardHabits';
import { DashboardJournal } from '@/components/dashboard/DashboardJournal';
import { DashboardScreenTime } from '@/components/dashboard/DashboardScreenTime';
import { format } from 'date-fns';

export default function Dashboard() {
  const onboardingCompleted = usePreferencesStore((s) => s.onboardingCompleted);

  if (!onboardingCompleted) {
    redirect('/onboarding');
  }

  const today = new Date();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}
        </h1>
        <p className="mt-1 text-muted text-sm">
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
        {/* Calendar - spans 2 cols, 2 rows */}
        <div className="glass rounded-2xl p-5 lg:col-span-2 lg:row-span-2 flex flex-col max-h-[calc(100vh-160px)]">
          <DashboardCalendar />
        </div>

        {/* Top 3 Tasks */}
        <div className="glass rounded-2xl p-5">
          <DashboardTasks />
        </div>

        {/* Habits */}
        <div className="glass rounded-2xl p-5">
          <DashboardHabits />
        </div>

        {/* Journal */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <DashboardJournal />
        </div>

        {/* Screen Time */}
        <div className="glass rounded-2xl p-5">
          <DashboardScreenTime />
        </div>
      </div>
    </div>
  );
}
