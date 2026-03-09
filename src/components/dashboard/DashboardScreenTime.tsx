'use client';

import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import Link from 'next/link';

export function DashboardScreenTime() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const entry = useScreenTimeStore((s) => s.getEntryForDate(today));
  const logScreenTime = useScreenTimeStore((s) => s.logScreenTime);
  const weeklyAvg = useScreenTimeStore((s) => s.getWeeklyAverage());

  const [hours, setHours] = useState(entry?.hours?.toString() || '');
  const [minutes, setMinutes] = useState(entry?.minutes?.toString() || '');

  const handleSave = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    if (h > 0 || m > 0) {
      logScreenTime(today, h, m);
    }
  };

  const avgHours = Math.floor(weeklyAvg / 60);
  const avgMins = weeklyAvg % 60;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-cyan-400" />
          <h2 className="font-semibold text-lg">Screen Time</h2>
        </div>
        <Link
          href="/screen-time"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          History
        </Link>
      </div>

      {entry ? (
        <div className="text-center py-2">
          <p className="text-3xl font-bold tracking-tight">
            {entry.hours}<span className="text-lg text-muted">h </span>
            {entry.minutes}<span className="text-lg text-muted">m</span>
          </p>
          <p className="text-[10px] text-muted mt-1">Today</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-center focus:border-accent focus:outline-none"
            />
            <p className="text-[10px] text-muted text-center mt-1">Hours</p>
          </div>
          <span className="text-muted font-bold">:</span>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-center focus:border-accent focus:outline-none"
            />
            <p className="text-[10px] text-muted text-center mt-1">Minutes</p>
          </div>
          <button
            onClick={handleSave}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Log
          </button>
        </div>
      )}

      {weeklyAvg > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted">
            Weekly avg: {avgHours}h {avgMins}m
          </p>
        </div>
      )}
    </div>
  );
}
