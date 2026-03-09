'use client';

import { useState } from 'react';
import { useJournalStore } from '@/stores/journalStore';
import { BookOpen, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  const entries = useJournalStore((s) => s.entries);
  const saveEntry = useJournalStore((s) => s.saveEntry);
  const entry = entries.find((e) => e.date === dateStr);
  const allEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const [wentWell, setWentWell] = useState(entry?.wentWell || '');
  const [toImprove, setToImprove] = useState(entry?.toImprove || '');
  const [freeform, setFreeform] = useState(entry?.freeform || '');
  const [saved, setSaved] = useState(false);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const ds = format(date, 'yyyy-MM-dd');
    const e = useJournalStore.getState().getEntryForDate(ds);
    setWentWell(e?.wentWell || '');
    setToImprove(e?.toImprove || '');
    setFreeform(e?.freeform || '');
    setSaved(false);
  };

  const handleSave = () => {
    saveEntry(dateStr, wentWell, toImprove, freeform);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <p className="text-sm text-muted mt-1">Daily reflection and free writing</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main editor */}
        <div className="glass rounded-2xl p-6">
          {/* Date navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => handleDateChange(subDays(selectedDate, 1))}
              className="rounded-lg p-2 text-muted hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="font-semibold">{format(selectedDate, 'EEEE')}</p>
              <p className="text-sm text-muted">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            <button
              onClick={() => {
                if (!isToday) handleDateChange(addDays(selectedDate, 1));
              }}
              disabled={isToday}
              className={`rounded-lg p-2 transition-colors ${
                isToday ? 'text-border cursor-not-allowed' : 'text-muted hover:bg-surface-hover'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Prompts */}
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider font-medium text-emerald-400">
                What went well today?
              </label>
              <textarea
                value={wentWell}
                onChange={(e) => {
                  setWentWell(e.target.value);
                  setSaved(false);
                }}
                placeholder="Reflect on your wins, no matter how small..."
                className="w-full resize-none rounded-xl bg-background border border-border px-4 py-3 text-sm leading-relaxed placeholder:text-muted/40 focus:border-accent focus:outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider font-medium text-amber-400">
                What could I improve tomorrow?
              </label>
              <textarea
                value={toImprove}
                onChange={(e) => {
                  setToImprove(e.target.value);
                  setSaved(false);
                }}
                placeholder="Be honest with yourself — growth starts here..."
                className="w-full resize-none rounded-xl bg-background border border-border px-4 py-3 text-sm leading-relaxed placeholder:text-muted/40 focus:border-accent focus:outline-none"
                rows={4}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider font-medium text-purple-400">
                Free Writing
              </label>
              <textarea
                value={freeform}
                onChange={(e) => {
                  setFreeform(e.target.value);
                  setSaved(false);
                }}
                placeholder="Anything on your mind... thoughts, ideas, gratitude, plans..."
                className="w-full resize-none rounded-xl bg-background border border-border px-4 py-3 text-sm leading-relaxed placeholder:text-muted/40 focus:border-accent focus:outline-none"
                rows={6}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            {saved && (
              <span className="text-xs text-emerald-400 animate-pulse">Saved!</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              <Save size={14} />
              Save Entry
            </button>
          </div>
        </div>

        {/* Recent entries sidebar */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={16} />
            Recent Entries
          </h3>
          <div className="space-y-3">
            {allEntries.slice(0, 10).map((e) => (
              <button
                key={e.id}
                onClick={() => handleDateChange(new Date(e.date + 'T12:00:00'))}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                  e.date === dateStr
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <p className="text-sm font-medium">
                  {format(new Date(e.date + 'T12:00:00'), 'MMM d, yyyy')}
                </p>
                {e.wentWell && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {e.wentWell}
                  </p>
                )}
              </button>
            ))}
            {allEntries.length === 0 && (
              <p className="text-sm text-muted text-center py-4">
                No entries yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
