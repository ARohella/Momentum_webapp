'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface Suggestion {
  taskId: string;
  suggestedStart: string;
  suggestedEnd: string;
  reason: string;
}

export function AIScheduleButton() {
  const events = useCalendarStore((s) => s.events);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const categories = usePreferencesStore((s) => s.categories);
  const profile = usePreferencesStore((s) => s.profile);

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const unscheduledTasks = tasks.filter((t) => !t.completed && !t.scheduledStart);

  const handleSchedule = async () => {
    if (unscheduledTasks.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events.map((e) => ({
            title: e.title,
            start: e.start,
            end: e.end,
            category: e.category,
          })),
          tasks: unscheduledTasks.map((t) => ({
            id: t.id,
            title: t.title,
            estimatedDuration: t.estimatedDuration,
            deadline: t.deadline,
            category: t.category,
          })),
          preferences: { categories },
          profile,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuggestions(data.suggestions || []);
        setShowResults(true);
      }
    } catch {
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = (suggestion: Suggestion) => {
    const task = tasks.find((t) => t.id === suggestion.taskId);
    if (!task) return;

    const event = addEvent({
      title: task.title,
      start: suggestion.suggestedStart,
      end: suggestion.suggestedEnd,
      category: task.category,
      isTask: true,
      taskId: task.id,
    });

    updateTask(task.id, {
      scheduledStart: suggestion.suggestedStart,
      scheduledEnd: suggestion.suggestedEnd,
      calendarEventId: event.id,
    });

    setSuggestions((prev) => prev.filter((s) => s.taskId !== suggestion.taskId));
  };

  if (unscheduledTasks.length === 0) return null;

  return (
    <div>
      <button
        onClick={handleSchedule}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {loading ? 'Analyzing...' : `AI Schedule (${unscheduledTasks.length})`}
      </button>

      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {showResults && suggestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl p-6 mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                AI Suggestions
              </h2>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSuggestions([]);
                }}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-hover"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {suggestions.map((s) => {
                const task = tasks.find((t) => t.id === s.taskId);
                return (
                  <div
                    key={s.taskId}
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="font-medium text-sm">{task?.title || 'Unknown task'}</p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(s.suggestedStart).toLocaleString()} -{' '}
                      {new Date(s.suggestedEnd).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted mt-1 italic">{s.reason}</p>
                    <button
                      onClick={() => acceptSuggestion(s)}
                      className="mt-2 flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                    >
                      <Check size={12} />
                      Accept
                    </button>
                  </div>
                );
              })}
            </div>

            {suggestions.length === 0 && (
              <p className="text-sm text-muted text-center py-4">
                All suggestions accepted!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
