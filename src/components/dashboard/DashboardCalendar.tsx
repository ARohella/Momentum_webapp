'use client';

import { useCalendarStore } from '@/stores/calendarStore';
import { format, isToday, addHours, startOfDay } from 'date-fns';
import { Clock, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export function DashboardCalendar() {
  const events = useCalendarStore((s) => s.events);
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayEvents = events
    .filter((e) => {
      const d = new Date(e.start);
      return format(d, 'yyyy-MM-dd') === today;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  const now = new Date();
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" />
          <h2 className="font-semibold text-lg">Today&apos;s Schedule</h2>
        </div>
        <Link
          href="/calendar"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View Full Calendar
        </Link>
      </div>

      <div className="relative overflow-y-auto flex-1 min-h-0">
        {/* Time grid */}
        <div className="relative ml-12">
          {hours.map((hour) => {
            const hourDate = addHours(startOfDay(now), hour);
            return (
              <div key={hour} className="relative h-12 border-t border-border/50">
                <span className="absolute -left-12 -top-2.5 text-[10px] text-muted font-mono w-10 text-right">
                  {format(hourDate, 'h a')}
                </span>
              </div>
            );
          })}

          {/* Events overlay */}
          {todayEvents.map((event) => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const startHour = startDate.getHours() + startDate.getMinutes() / 60;
            const endHour = endDate.getHours() + endDate.getMinutes() / 60;
            const top = (startHour - 7) * 48; // 48px per hour
            const height = Math.max((endHour - startHour) * 48, 24);

            if (startHour < 7 || startHour > 21) return null;

            return (
              <div
                key={event.id}
                className="absolute left-0 right-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white overflow-hidden"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: event.color,
                  opacity: 0.9,
                }}
              >
                <div className="truncate">{event.title}</div>
                <div className="text-[10px] opacity-80 flex items-center gap-1">
                  <Clock size={10} />
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </div>
              </div>
            );
          })}

          {/* Now indicator */}
          {now.getHours() >= 7 && now.getHours() <= 21 && (
            <div
              className="absolute left-0 right-0 border-t-2 border-accent z-10"
              style={{
                top: `${(now.getHours() + now.getMinutes() / 60 - 7) * 48}px`,
              }}
            >
              <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-accent" />
            </div>
          )}
        </div>

        {todayEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <CalendarDays size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No events scheduled today</p>
            <Link
              href="/calendar"
              className="mt-2 text-xs text-accent hover:text-accent-hover"
            >
              Add an event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
