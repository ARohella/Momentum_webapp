'use client';

import { useTaskStore } from '@/stores/taskStore';
import { CheckSquare, Circle, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

export function DashboardTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);

  const topThree = tasks.filter((t) => t.isTopThree && !t.completed);
  const completedToday = tasks.filter((t) => t.isTopThree && t.completed);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-yellow-500" />
          <h2 className="font-semibold text-lg">Top 3 Focus</h2>
        </div>
        <Link
          href="/tasks"
          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          All Tasks
        </Link>
      </div>

      <div className="space-y-2">
        {topThree.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleComplete(task.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <Circle size={18} className="shrink-0 text-muted" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-[10px] text-muted">{task.estimatedDuration}min</p>
            </div>
          </button>
        ))}

        {completedToday.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleComplete(task.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left opacity-50 transition-colors hover:bg-surface-hover hover:opacity-70"
          >
            <CheckCircle2 size={18} className="shrink-0 text-green-500" />
            <p className="text-sm line-through truncate">{task.title}</p>
          </button>
        ))}

        {topThree.length === 0 && completedToday.length === 0 && (
          <div className="flex flex-col items-center py-8 text-muted">
            <CheckSquare size={28} className="mb-2 opacity-50" />
            <p className="text-sm">No focus tasks set</p>
            <Link
              href="/tasks"
              className="mt-1 text-xs text-accent hover:text-accent-hover"
            >
              Set your top 3
            </Link>
          </div>
        )}
      </div>

      {(topThree.length > 0 || completedToday.length > 0) && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{completedToday.length}/3 completed</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i < completedToday.length ? 'bg-green-500' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
