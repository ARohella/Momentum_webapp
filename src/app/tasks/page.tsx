'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { CATEGORY_COLORS } from '@/lib/types';
import {
  Plus,
  Star,
  StarOff,
  Trash2,
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { AIScheduleButton } from '@/components/AIScheduleButton';

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete, toggleTopThree } = useTaskStore();
  const addEvent = useCalendarStore((s) => s.addEvent);
  const categories = usePreferencesStore((s) => s.categories);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState(categories[0] || 'work');
  const [description, setDescription] = useState('');
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const topThree = tasks.filter((t) => t.isTopThree && !t.completed);

  const filteredTasks =
    filter === 'active'
      ? incompleteTasks
      : filter === 'completed'
      ? completedTasks
      : tasks;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const task = addTask({
      title,
      description,
      estimatedDuration: parseInt(duration) || 30,
      deadline: deadline || undefined,
      category,
    });

    if (autoSchedule && scheduleTime) {
      const startDate = new Date(scheduleTime);
      const endDate = addMinutes(startDate, parseInt(duration) || 30);
      const event = addEvent({
        title: task.title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        category,
        isTask: true,
        taskId: task.id,
      });
      updateTask(task.id, {
        scheduledStart: event.start,
        scheduledEnd: event.end,
        calendarEventId: event.id,
      });
    }

    setTitle('');
    setDuration('30');
    setDeadline('');
    setDescription('');
    setAutoSchedule(false);
    setScheduleTime('');
    setShowModal(false);
  };

  const handleToggleTopThree = (id: string) => {
    const success = toggleTopThree(id);
    if (!success) {
      // Already 3 tasks selected
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted mt-1">
            {incompleteTasks.length} active, {completedTasks.length} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIScheduleButton />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Top 3 Focus Section */}
      {topThree.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-yellow-500" />
            <h2 className="font-semibold">Today&apos;s Focus ({topThree.length}/3)</h2>
          </div>
          <div className="space-y-2">
            {topThree.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-3"
              >
                <button onClick={() => toggleComplete(task.id)}>
                  <Circle size={18} className="text-yellow-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Clock size={10} /> {task.estimatedDuration}min
                    </span>
                    {task.scheduledStart && (
                      <span className="text-[10px] text-muted flex items-center gap-1">
                        <Calendar size={10} /> {format(new Date(task.scheduledStart), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[task.category] || CATEGORY_COLORS.custom }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-surface-hover'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity ${
              task.completed ? 'opacity-50' : ''
            }`}
          >
            <button onClick={() => toggleComplete(task.id)}>
              {task.completed ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <Circle size={18} className="text-muted" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <Clock size={10} /> {task.estimatedDuration}min
                </span>
                {task.deadline && (
                  <span className="text-[10px] text-muted">
                    Due {format(new Date(task.deadline), 'MMM d')}
                  </span>
                )}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.custom}20`,
                    color: CATEGORY_COLORS[task.category] || CATEGORY_COLORS.custom,
                  }}
                >
                  {task.category}
                </span>
              </div>
            </div>

            {!task.completed && (
              <button
                onClick={() => handleToggleTopThree(task.id)}
                className={`rounded-lg p-1.5 transition-colors ${
                  task.isTopThree
                    ? 'text-yellow-500'
                    : 'text-muted hover:text-yellow-500'
                }`}
                title={task.isTopThree ? 'Remove from focus' : 'Add to focus'}
              >
                {task.isTopThree ? <Star size={16} /> : <StarOff size={16} />}
              </button>
            )}

            <button
              onClick={() => deleteTask(task.id)}
              className="rounded-lg p-1.5 text-muted hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center py-16 text-muted">
            <p className="text-sm">No tasks found</p>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="5"
                    step="5"
                    className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
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
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  className="w-full resize-none rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  rows={2}
                />
              </div>

              {/* Auto-schedule toggle */}
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSchedule"
                    checked={autoSchedule}
                    onChange={(e) => setAutoSchedule(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="autoSchedule" className="text-sm font-medium">
                    <Calendar size={14} className="inline mr-1" />
                    Schedule on calendar
                  </label>
                </div>
                {autoSchedule && (
                  <div className="mt-3">
                    <label className="mb-1.5 block text-xs font-medium text-muted">
                      Schedule for
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
