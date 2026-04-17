'use client';

import { useState } from 'react';
import { useScreenTimeStore } from '@/stores/screenTimeStore';
import { Smartphone, TrendingDown, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScreenTimePage() {
  const { entries, logScreenTime, getWeeklyAverage, getRecentEntries } = useScreenTimeStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = entries.find((e) => e.date === today);

  const [hours, setHours] = useState(todayEntry?.hours?.toString() || '');
  const [minutes, setMinutes] = useState(todayEntry?.minutes?.toString() || '');
  const [editing, setEditing] = useState(false);

  const weeklyAvg = getWeeklyAverage();
  const avgH = Math.floor(weeklyAvg / 60);
  const avgM = weeklyAvg % 60;

  // Last 14 days chart data
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = entries.find((e) => e.date === dateStr);
    return {
      date: format(d, 'MMM d'),
      shortDate: format(d, 'dd'),
      totalMinutes: entry ? entry.hours * 60 + entry.minutes : 0,
      hours: entry ? entry.hours + entry.minutes / 60 : 0,
    };
  });

  const handleLog = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    if (h > 0 || m > 0) {
      logScreenTime(today, h, m);
      setEditing(false);
    }
  };

  // Trend: compare this week avg to last week
  const last7 = getRecentEntries(7);
  const prev7 = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 7 + i), 'yyyy-MM-dd');
    return entries.find((e) => e.date === d);
  }).filter(Boolean);

  const thisWeekAvg =
    last7.length > 0
      ? last7.reduce((sum, e) => sum + e.hours * 60 + e.minutes, 0) / last7.length
      : 0;
  const lastWeekAvg =
    prev7.length > 0
      ? prev7.reduce((sum, e) => sum + (e!.hours * 60 + e!.minutes), 0) / prev7.length
      : 0;
  const trend = thisWeekAvg - lastWeekAvg;

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Screen Time</h1>
        <p className="text-sm text-muted mt-1">Track and reduce your daily screen usage</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Log today */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Smartphone size={16} />
            Today
          </h2>
          {todayEntry && !editing ? (
            <div className="text-center py-4">
              <p className="text-4xl font-bold tracking-tight">
                {todayEntry.hours}<span className="text-lg text-muted">h </span>
                {todayEntry.minutes}<span className="text-lg text-muted">m</span>
              </p>
              <p className="text-xs text-muted mt-2">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <button
                onClick={() => {
                  setHours(todayEntry.hours.toString());
                  setMinutes(todayEntry.minutes.toString());
                  setEditing(true);
                }}
                className="mt-4 text-xs text-accent hover:text-accent-hover"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted">Log your screen time for today</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg bg-background border border-border px-3 py-3 text-lg text-center font-bold focus:border-accent focus:outline-none"
                  />
                  <p className="text-[10px] text-muted text-center mt-1">Hours</p>
                </div>
                <span className="text-2xl text-muted font-bold">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg bg-background border border-border px-3 py-3 text-lg text-center font-bold focus:border-accent focus:outline-none"
                  />
                  <p className="text-[10px] text-muted text-center mt-1">Minutes</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLog}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
                >
                  {todayEntry ? 'Save' : 'Log Screen Time'}
                </button>
                {todayEntry && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      setHours(todayEntry.hours.toString());
                      setMinutes(todayEntry.minutes.toString());
                    }}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-muted">Weekly Average</p>
            <p className="text-3xl font-bold mt-1">
              {avgH}<span className="text-sm text-muted">h </span>
              {avgM}<span className="text-sm text-muted">m</span>
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-muted">Trend vs Last Week</p>
            <div className="flex items-center gap-2 mt-1">
              {trend <= 0 ? (
                <TrendingDown size={20} className="text-emerald-400" />
              ) : (
                <TrendingUp size={20} className="text-red-400" />
              )}
              <p className={`text-lg font-bold ${trend <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Math.abs(Math.round(trend))} min {trend <= 0 ? 'less' : 'more'}
              </p>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-muted">Total Entries</p>
            <p className="text-3xl font-bold mt-1">{entries.length}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <h2 className="font-semibold mb-4">Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="shortDate"
                tick={{ fill: 'var(--muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 60)}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--fg)',
                }}
                formatter={(value) => {
                  const v = Number(value) || 0;
                  return [`${Math.floor(v / 60)}h ${v % 60}m`, 'Screen Time'];
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="totalMinutes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
