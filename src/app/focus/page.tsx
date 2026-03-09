'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { Play, Pause, RotateCcw, Timer, Coffee } from 'lucide-react';

type Mode = 'countdown' | 'pomodoro';
type PomodoroPhase = 'work' | 'break';

export default function FocusPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const topThree = tasks.filter((t) => t.isTopThree && !t.completed);

  const [mode, setMode] = useState<Mode>('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [customMinutes, setCustomMinutes] = useState('25');

  // Pomodoro
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(pomodoroPhase === 'work' ? workDuration * 60 : breakDuration * 60);
    } else {
      setTimeLeft((parseInt(customMinutes) || 25) * 60);
    }
  }, [mode, pomodoroPhase, workDuration, breakDuration, customMinutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Timer complete
      if (mode === 'pomodoro') {
        if (pomodoroPhase === 'work') {
          setCompletedPomodoros((c) => c + 1);
          setPomodoroPhase('break');
          setTimeLeft(breakDuration * 60);
          // Auto-start break
          setTimeout(() => setIsRunning(true), 500);
        } else {
          setPomodoroPhase('work');
          setTimeLeft(workDuration * 60);
        }
      }
      // Play notification sound attempt
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch {}

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Momentum Focus', {
          body: mode === 'pomodoro'
            ? pomodoroPhase === 'work'
              ? 'Work session complete! Take a break.'
              : 'Break over! Ready to focus again?'
            : 'Timer complete!',
        });
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, pomodoroPhase, workDuration, breakDuration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime =
    mode === 'pomodoro'
      ? (pomodoroPhase === 'work' ? workDuration : breakDuration) * 60
      : (parseInt(customMinutes) || 25) * 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const activeTask = topThree.find((t) => t.id === selectedTask);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Mode selector */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => {
            setMode('countdown');
            setIsRunning(false);
            setTimeLeft((parseInt(customMinutes) || 25) * 60);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'countdown'
              ? 'bg-accent text-white'
              : 'text-muted hover:bg-surface-hover'
          }`}
        >
          <Timer size={16} />
          Countdown
        </button>
        <button
          onClick={() => {
            setMode('pomodoro');
            setIsRunning(false);
            setPomodoroPhase('work');
            setTimeLeft(workDuration * 60);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'pomodoro'
              ? 'bg-accent text-white'
              : 'text-muted hover:bg-surface-hover'
          }`}
        >
          <Coffee size={16} />
          Pomodoro
        </button>
      </div>

      {/* Current task */}
      {activeTask && (
        <div className="glass rounded-xl px-6 py-3 mb-6">
          <p className="text-xs text-muted">Focusing on</p>
          <p className="font-semibold">{activeTask.title}</p>
        </div>
      )}

      {/* Timer circle */}
      <div className="relative mb-8">
        <svg width="280" height="280" className="transform -rotate-90">
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="6"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={
              mode === 'pomodoro' && pomodoroPhase === 'break'
                ? '#22c55e'
                : 'var(--accent)'
            }
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {mode === 'pomodoro' && (
            <span className={`text-xs font-medium mt-2 ${
              pomodoroPhase === 'work' ? 'text-accent' : 'text-emerald-400'
            }`}>
              {pomodoroPhase === 'work' ? 'FOCUS' : 'BREAK'}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={resetTimer}
          className="rounded-full p-3 text-muted hover:bg-surface-hover transition-colors"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover transition-colors"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <div className="w-11" /> {/* Spacer for symmetry */}
      </div>

      {/* Settings */}
      <div className="glass rounded-2xl p-5 w-full max-w-sm">
        {mode === 'countdown' ? (
          <div>
            <label className="mb-2 block text-xs font-medium text-muted">
              Duration (minutes)
            </label>
            <div className="flex gap-2">
              {[15, 25, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setCustomMinutes(String(m));
                    if (!isRunning) setTimeLeft(m * 60);
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                    customMinutes === String(m)
                      ? 'bg-accent text-white'
                      : 'border border-border text-muted hover:bg-surface-hover'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Work</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                  className="w-16 rounded-lg bg-background border border-border px-2 py-1 text-sm text-center focus:border-accent focus:outline-none"
                  min="1"
                />
                <span className="text-xs text-muted">min</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Break</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  className="w-16 rounded-lg bg-background border border-border px-2 py-1 text-sm text-center focus:border-accent focus:outline-none"
                  min="1"
                />
                <span className="text-xs text-muted">min</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted">Completed</span>
              <span className="text-sm font-bold">{completedPomodoros}</span>
            </div>
          </div>
        )}
      </div>

      {/* Task selector */}
      {topThree.length > 0 && (
        <div className="mt-6 w-full max-w-sm">
          <p className="text-xs text-muted mb-2">Focus on a task:</p>
          <div className="flex flex-wrap gap-2">
            {topThree.map((task) => (
              <button
                key={task.id}
                onClick={() =>
                  setSelectedTask(selectedTask === task.id ? null : task.id)
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTask === task.id
                    ? 'bg-accent text-white'
                    : 'glass hover:bg-surface-hover'
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
