'use client';

import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { CATEGORY_COLORS } from '@/lib/types';
import { BarChart3 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInMinutes } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const events = useCalendarStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const categories = usePreferencesStore((s) => s.categories);

  // Calculate time spent per category this week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const categoryTime: Record<string, number> = {};
  categories.forEach((c) => (categoryTime[c] = 0));

  events.forEach((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    if (eventStart >= weekStart && eventStart <= weekEnd) {
      const minutes = differenceInMinutes(eventEnd, eventStart);
      const cat = event.category || 'custom';
      categoryTime[cat] = (categoryTime[cat] || 0) + minutes;
    }
  });

  const pieData = categories
    .map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: Math.round((categoryTime[cat] || 0) / 60 * 10) / 10,
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.custom,
    }))
    .filter((d) => d.value > 0);

  // Daily task completions this week
  const dailyCompletions = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completed = tasks.filter(
      (t) => t.completed && t.createdAt.startsWith(dateStr)
    ).length;
    return {
      day: format(day, 'EEE'),
      tasks: completed,
    };
  });

  // Habit consistency this week
  const activeHabits = habits.filter((h) => h.isActive);
  const habitConsistency = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completed = activeHabits.filter((h) => h.completions[dateStr]).length;
    return {
      day: format(day, 'EEE'),
      completed,
      total: activeHabits.length,
      pct: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0,
    };
  });

  // Stats
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;
  const totalEvents = events.length;
  const totalHoursScheduled = Math.round(
    Object.values(categoryTime).reduce((a, b) => a + b, 0) / 60
  );

  const customTooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--fg)',
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted mt-1">Weekly overview of your productivity</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        {[
          { label: 'Hours Scheduled', value: totalHoursScheduled, suffix: 'h' },
          { label: 'Tasks Completed', value: totalTasksCompleted, suffix: '' },
          { label: 'Active Habits', value: activeHabits.length, suffix: '' },
          { label: 'Events This Week', value: totalEvents, suffix: '' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">
              {stat.value}
              <span className="text-sm text-muted">{stat.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Time Distribution Pie */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} />
            Life Balance (This Week)
          </h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs">
                      {d.name}: <span className="font-medium">{d.value}h</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">
              No events this week to analyze
            </p>
          )}
        </div>

        {/* Task completions bar */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Tasks Completed (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyCompletions}>
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="tasks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Habit consistency */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Habit Consistency (This Week)</h2>
          {activeHabits.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitConsistency}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Bar dataKey="pct" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted py-8 text-center">
              Add habits to see consistency data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
