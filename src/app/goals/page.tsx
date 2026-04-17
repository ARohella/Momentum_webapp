'use client';

import { useState } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { useTaskStore } from '@/stores/taskStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { CATEGORY_COLORS, Goal } from '@/lib/types';
import { Plus, Target, Trash2, X, TrendingUp, Wand2, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';

interface BreakdownTask {
  title: string;
  estimatedDuration: number;
  deadline?: string;
}

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, incrementProgress, getProgressPercentage } =
    useGoalStore();
  const categories = usePreferencesStore((s) => s.categories);
  const incrementAI = useRewardsStore((s) => s.incrementAI);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'time' | 'milestone' | 'custom'>('time');
  const [target, setTarget] = useState('100');
  const [unit, setUnit] = useState('hours');
  const [category, setCategory] = useState(categories[0] || 'work');
  const [deadline, setDeadline] = useState('');

  const [incrementId, setIncrementId] = useState<string | null>(null);
  const [incrementAmount, setIncrementAmount] = useState('1');

  const addTask = useTaskStore((s) => s.addTask);
  const [breakdownGoalId, setBreakdownGoalId] = useState<string | null>(null);
  const [breakdownTasks, setBreakdownTasks] = useState<BreakdownTask[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());

  const handleBreakdown = async (goal: Goal) => {
    setBreakdownGoalId(goal.id);
    setBreakdownLoading(true);
    setBreakdownTasks([]);
    setAddedIndices(new Set());
    try {
      const res = await fetch('/api/ai-goal-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, today: format(new Date(), 'yyyy-MM-dd') }),
      });
      const data = await res.json();
      if (Array.isArray(data.tasks)) {
        setBreakdownTasks(data.tasks);
        incrementAI('goalBreakdowns');
      }
    } catch {
      /* ignore */
    } finally {
      setBreakdownLoading(false);
    }
  };

  const addBreakdownTask = (i: number, task: BreakdownTask, goalCategory: string) => {
    addTask({
      title: task.title,
      description: '',
      estimatedDuration: task.estimatedDuration || 60,
      deadline: task.deadline && task.deadline !== 'null' ? task.deadline : undefined,
      category: goalCategory,
    });
    setAddedIndices((prev) => new Set([...prev, i]));
  };

  const addAllBreakdownTasks = (goalCategory: string) => {
    breakdownTasks.forEach((t, i) => {
      if (!addedIndices.has(i)) {
        addTask({
          title: t.title,
          description: '',
          estimatedDuration: t.estimatedDuration || 60,
          deadline: t.deadline && t.deadline !== 'null' ? t.deadline : undefined,
          category: goalCategory,
        });
      }
    });
    setAddedIndices(new Set(breakdownTasks.map((_, i) => i)));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;
    addGoal({
      title,
      type,
      target: parseFloat(target),
      unit,
      category,
      deadline: deadline || undefined,
    });
    setTitle('');
    setTarget('100');
    setShowModal(false);
  };

  const handleIncrement = (id: string) => {
    incrementProgress(id, parseFloat(incrementAmount) || 0);
    setIncrementId(null);
    setIncrementAmount('1');
  };

  const typeDefaults = {
    time: { unit: 'hours', placeholder: 'e.g., Work 100 hours on startup' },
    milestone: { unit: 'tasks', placeholder: 'e.g., Complete 50 tasks' },
    custom: { unit: 'units', placeholder: 'e.g., Read 20 books' },
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-sm text-muted mt-1">{goals.length} goals tracked</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = getProgressPercentage(goal.id);
          const isComplete = pct >= 100;
          return (
            <div key={goal.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.custom,
                    }}
                  />
                  <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                    {goal.type}
                  </span>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 className="font-semibold text-sm mb-1">{goal.title}</h3>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold">{goal.progress}</span>
                <span className="text-sm text-muted">/ {goal.target} {goal.unit}</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-2 w-full rounded-full bg-surface-hover">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-500' : 'bg-accent'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted">{pct}%</span>
                  {goal.deadline && (
                    <span className="text-[10px] text-muted">
                      Due {format(new Date(goal.deadline), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>

              {!isComplete && (
                <>
                  {incrementId === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={incrementAmount}
                        onChange={(e) => setIncrementAmount(e.target.value)}
                        className="flex-1 rounded-lg bg-background border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
                        min="0"
                        step="0.5"
                        autoFocus
                      />
                      <button
                        onClick={() => handleIncrement(goal.id)}
                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setIncrementId(null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface-hover"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIncrementId(goal.id)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                    >
                      <TrendingUp size={12} />
                      Log Progress
                    </button>
                  )}
                </>
              )}

              {isComplete && (
                <div className="flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
                  <Target size={12} />
                  Goal Achieved!
                </div>
              )}

              {!isComplete && (
                <button
                  onClick={() => handleBreakdown(goal)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
                >
                  <Wand2 size={12} />
                  AI Breakdown
                </button>
              )}

              {breakdownGoalId === goal.id && (
                <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
                      <Wand2 size={12} />
                      AI Suggested Tasks
                    </p>
                    <button
                      onClick={() => setBreakdownGoalId(null)}
                      className="text-muted hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {breakdownLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted py-3">
                      <Loader2 size={12} className="animate-spin" />
                      Generating milestone tasks...
                    </div>
                  )}
                  {!breakdownLoading && breakdownTasks.length > 0 && (
                    <>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {breakdownTasks.map((t, i) => {
                          const added = addedIndices.has(i);
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 rounded-lg border p-2 ${
                                added ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-background/50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{t.title}</p>
                                <p className="text-[10px] text-muted">
                                  {t.estimatedDuration}min{t.deadline && t.deadline !== 'null' ? ` • due ${t.deadline}` : ''}
                                </p>
                              </div>
                              {added ? (
                                <Check size={14} className="text-emerald-400 shrink-0" />
                              ) : (
                                <button
                                  onClick={() => addBreakdownTask(i, t, goal.category)}
                                  className="shrink-0 rounded bg-accent px-2 py-1 text-[10px] font-medium text-white hover:bg-accent-hover"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => addAllBreakdownTasks(goal.category)}
                        className="mt-2 w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                      >
                        Add All to Tasks
                      </button>
                    </>
                  )}
                  {!breakdownLoading && breakdownTasks.length === 0 && (
                    <p className="text-xs text-muted py-2">No tasks generated. Try again.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-16 text-muted">
            <Target size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No goals set yet</p>
            <p className="text-xs mt-1">Define what you want to achieve</p>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">New Goal</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Goal Type</label>
                <div className="flex gap-2">
                  {(['time', 'milestone', 'custom'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        setUnit(typeDefaults[t].unit);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        type === t
                          ? 'bg-accent text-white'
                          : 'border border-border text-muted hover:bg-surface-hover'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={typeDefaults[type].placeholder}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Target</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    min="1"
                    className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="hours, tasks, books..."
                    className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
