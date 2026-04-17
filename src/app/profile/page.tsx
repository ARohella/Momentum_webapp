'use client';

import { useState } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { Save, User, Palette, Check } from 'lucide-react';
import { Achievements } from '@/components/Achievements';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ACCENT_OPTIONS = [
  { name: 'Indigo', value: '#6366f1', hover: '#818cf8' },
  { name: 'Violet', value: '#8b5cf6', hover: '#a78bfa' },
  { name: 'Blue', value: '#3b82f6', hover: '#60a5fa' },
  { name: 'Cyan', value: '#06b6d4', hover: '#22d3ee' },
  { name: 'Emerald', value: '#10b981', hover: '#34d399' },
  { name: 'Amber', value: '#f59e0b', hover: '#fbbf24' },
  { name: 'Rose', value: '#f43f5e', hover: '#fb7185' },
  { name: 'Pink', value: '#ec4899', hover: '#f472b6' },
];

export default function ProfilePage() {
  const { profile, updateProfile, accentColor, setAccentColor } = usePreferencesStore();
  const recordAccentColor = useRewardsStore((s) => s.recordAccentColor);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      workDays: f.workDays.includes(day)
        ? f.workDays.filter((d) => d !== day)
        : [...f.workDays, day].sort(),
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User size={24} className="text-accent" />
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column — Achievements */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Achievements />
        </div>

        {/* Right column — everything else */}
        <div className="space-y-6">
        {/* Basic Info */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Bio / Notes</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Anything the AI coach should know about you..."
                className="w-full resize-none rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Sleep Schedule */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Sleep Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Wake Up</label>
              <input
                type="time"
                value={form.wakeTime}
                onChange={(e) => setForm({ ...form, wakeTime: e.target.value })}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Bedtime</label>
              <input
                type="time"
                value={form.sleepTime}
                onChange={(e) => setForm({ ...form, sleepTime: e.target.value })}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Work Schedule */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Work Schedule</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Work Start</label>
                <input
                  type="time"
                  value={form.workStartTime}
                  onChange={(e) => setForm({ ...form, workStartTime: e.target.value })}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Work End</label>
                <input
                  type="time"
                  value={form.workEndTime}
                  onChange={(e) => setForm({ ...form, workEndTime: e.target.value })}
                  className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Work Days</label>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      form.workDays.includes(i)
                        ? 'bg-accent text-white'
                        : 'border border-border text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-accent" />
            <h2 className="font-semibold">Appearance</h2>
          </div>
          <label className="mb-3 block text-xs font-medium text-muted">Accent Color</label>
          <div className="flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map((opt) => {
              const selected = accentColor === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setAccentColor(opt.value, opt.hover);
                    recordAccentColor(opt.value);
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                  title={opt.name}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                      selected ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: opt.value,
                      boxShadow: selected ? `0 0 0 2px ${opt.value}` : undefined,
                    }}
                  >
                    {selected && <Check size={16} className="text-white" />}
                  </div>
                  <span className={`text-[10px] ${selected ? 'text-foreground font-medium' : 'text-muted'}`}>
                    {opt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Scheduling Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Preferred Workout Time</label>
              <select
                value={form.preferredWorkoutTime}
                onChange={(e) => setForm({ ...form, preferredWorkoutTime: e.target.value as 'morning' | 'afternoon' | 'evening' })}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              >
                <option value="morning">Morning (before work)</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening (after work)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Best Focus / Deep Work Time</label>
              <select
                value={form.focusHours}
                onChange={(e) => setForm({ ...form, focusHours: e.target.value as 'morning' | 'afternoon' })}
                className="w-full rounded-lg bg-background border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
