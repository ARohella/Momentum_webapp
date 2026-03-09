'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CalendarEvent, CATEGORY_COLORS } from '@/lib/types';
import { usePreferencesStore } from '@/stores/preferencesStore';

// Convert any date string to datetime-local format (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EventModalProps {
  event?: Partial<CalendarEvent>;
  onSave: (event: Omit<CalendarEvent, 'id' | 'color'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function EventModal({ event, onSave, onDelete, onClose }: EventModalProps) {
  const categories = usePreferencesStore((s) => s.categories);

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [start, setStart] = useState(toDatetimeLocal(event?.start || ''));
  const [end, setEnd] = useState(toDatetimeLocal(event?.end || ''));
  const [category, setCategory] = useState(event?.category || categories[0] || 'work');
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [recurrence, setRecurrence] = useState(event?.recurrence || '');
  const [recurrenceType, setRecurrenceType] = useState('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;

    let rrule = '';
    switch (recurrenceType) {
      case 'daily':
        rrule = 'FREQ=DAILY';
        break;
      case 'weekdays':
        rrule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
        break;
      case 'weekly':
        rrule = 'FREQ=WEEKLY';
        break;
      case 'monthly':
        rrule = 'FREQ=MONTHLY';
        break;
      case 'custom':
        rrule = recurrence;
        break;
    }

    onSave({
      title,
      description,
      start,
      end,
      category,
      allDay,
      recurrence: rrule || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {event?.id ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="allDay" className="text-sm text-muted">All day</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Start</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? start.split('T')[0] : start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">End</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? end.split('T')[0] : end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Repeat</label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom (RRule)</option>
            </select>
          </div>

          {recurrenceType === 'custom' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">RRule</label>
              <input
                type="text"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm font-mono focus:border-accent focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full resize-none rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              rows={2}
            />
          </div>

          {/* Color preview */}
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.custom }}
            />
            <span className="text-xs text-muted">
              Color auto-assigned by category
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              {event?.id ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
