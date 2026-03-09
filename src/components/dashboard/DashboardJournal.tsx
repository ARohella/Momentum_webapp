'use client';

import { useJournalStore } from '@/stores/journalStore';
import { BookOpen, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

export function DashboardJournal() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const entry = useJournalStore((s) => s.getEntryForDate(today));
  const saveEntry = useJournalStore((s) => s.saveEntry);

  const [wentWell, setWentWell] = useState(entry?.wentWell || '');
  const [toImprove, setToImprove] = useState(entry?.toImprove || '');

  const handleSave = () => {
    saveEntry(today, wentWell, toImprove, entry?.freeform || '');
  };

  const hasEntry = entry && (entry.wentWell || entry.toImprove || entry.freeform);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-purple-400" />
          <h2 className="font-semibold text-lg">Daily Reflection</h2>
        </div>
        <Link
          href="/journal"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Full Journal
        </Link>
      </div>

      {hasEntry ? (
        <div className="space-y-3">
          {entry.wentWell && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted mb-1">What went well</p>
              <p className="text-sm text-foreground/80">{entry.wentWell}</p>
            </div>
          )}
          {entry.toImprove && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted mb-1">To improve</p>
              <p className="text-sm text-foreground/80">{entry.toImprove}</p>
            </div>
          )}
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
          >
            <Pencil size={12} /> Edit entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted">
              What went well today?
            </label>
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              onBlur={handleSave}
              placeholder="One thing that went well..."
              className="w-full resize-none rounded-lg bg-background border border-border px-3 py-2 text-sm placeholder:text-muted/50 focus:border-accent focus:outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted">
              What could I improve?
            </label>
            <textarea
              value={toImprove}
              onChange={(e) => setToImprove(e.target.value)}
              onBlur={handleSave}
              placeholder="One thing to improve..."
              className="w-full resize-none rounded-lg bg-background border border-border px-3 py-2 text-sm placeholder:text-muted/50 focus:border-accent focus:outline-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
