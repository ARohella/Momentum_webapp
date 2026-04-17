'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useHabitStore } from '@/stores/habitStore';
import { CATEGORY_COLORS } from '@/lib/types';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

const STEPS = ['Welcome', 'Categories', 'Habits', 'Theme', 'Ready'];

const SUGGESTED_HABITS = [
  'Exercise',
  'Meditate',
  'Read',
  'Journal',
  'Drink Water',
  'Sleep 8 Hours',
  'No Social Media',
  'Study',
  'Walk 10k Steps',
  'Code',
  'Eat Healthy',
  'Stretch',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setTheme, addCategory, removeCategory, completeOnboarding, categories, updateProfile, profile } =
    usePreferencesStore();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');

  const handleNext = () => {
    if (step === 1) {
      // Sync categories
      const defaultCats = ['work', 'health', 'learning', 'personal', 'leisure'];
      defaultCats.forEach((c) => {
        if (!selectedCategories.includes(c)) removeCategory(c);
      });
      selectedCategories.forEach((c) => addCategory(c));
    }
    if (step === 3) {
      setTheme(selectedTheme);
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    // Persist name
    updateProfile({ name: name.trim() });
    // Add selected habits
    selectedHabits.forEach((h) => addHabit(h, 'personal'));
    setTheme(selectedTheme);
    completeOnboarding();
    router.push('/');
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) => {
      if (prev.includes(habit)) return prev.filter((h) => h !== habit);
      if (prev.length >= 7) return prev;
      return [...prev, habit];
    });
  };

  const addCustomCategory = () => {
    if (customCategory && !selectedCategories.includes(customCategory.toLowerCase())) {
      setSelectedCategories((prev) => [...prev, customCategory.toLowerCase()]);
      setCustomCategory('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? 'w-8 bg-accent' : 'w-4 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Momentum"
              className="mb-6 inline-block h-16 w-16 rounded-2xl object-cover"
            />
            <h1 className="text-3xl font-bold mb-3">Welcome to Momentum</h1>
            <p className="text-muted mb-8 max-w-sm mx-auto">
              Your daily operating system for personal productivity and self-improvement.
            </p>
            <div className="mb-8">
              <label className="mb-2 block text-sm text-muted">What should we call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full max-w-xs mx-auto rounded-xl bg-surface border border-border px-4 py-3 text-center text-lg focus:border-accent focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 1: Categories */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Life Categories</h2>
            <p className="text-muted text-center mb-6 text-sm">
              Choose how you want to categorize your time
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {['work', 'health', 'learning', 'personal', 'leisure', 'finance', 'social', 'creative'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      selectedCategories.includes(cat)
                        ? 'bg-accent/10 text-accent border border-accent/30'
                        : 'glass hover:bg-surface-hover'
                    }`}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[cat] || '#6b7280',
                      }}
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {selectedCategories.includes(cat) && <Check size={14} />}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                placeholder="Add custom category"
                className="flex-1 rounded-lg bg-surface border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              <button
                onClick={addCustomCategory}
                className="rounded-lg bg-accent px-3 py-2 text-sm text-white"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Habits */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Pick Your Habits</h2>
            <p className="text-muted text-center mb-6 text-sm">
              Choose up to 7 habits to track daily ({selectedHabits.length}/7)
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_HABITS.map((habit) => (
                <button
                  key={habit}
                  onClick={() => toggleHabit(habit)}
                  disabled={!selectedHabits.includes(habit) && selectedHabits.length >= 7}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedHabits.includes(habit)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : selectedHabits.length >= 7
                      ? 'glass opacity-40 cursor-not-allowed'
                      : 'glass hover:bg-surface-hover'
                  }`}
                >
                  {selectedHabits.includes(habit) && <Check size={14} className="inline mr-1" />}
                  {habit}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted text-center mt-4">
              You can always change these later
            </p>
          </div>
        )}

        {/* Step 3: Theme */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Choose Your Theme</h2>
            <p className="text-muted text-center mb-6 text-sm">
              Pick your preferred visual style
            </p>
            <div className="flex gap-4 justify-center">
              {([
                { value: 'dark' as const, label: 'Dark', bg: '#09090b', fg: '#fafafa' },
                { value: 'light' as const, label: 'Light', bg: '#fafafa', fg: '#09090b' },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedTheme(t.value)}
                  className={`flex flex-col items-center gap-3 rounded-2xl p-4 transition-all ${
                    selectedTheme === t.value
                      ? 'ring-2 ring-accent'
                      : 'glass hover:bg-surface-hover'
                  }`}
                >
                  <div
                    className="h-20 w-20 rounded-xl border border-border"
                    style={{ background: t.bg }}
                  />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Sparkles size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {name ? `You're all set, ${name}!` : "You're all set!"}
            </h2>
            <p className="text-muted mb-2 text-sm max-w-sm mx-auto">
              Momentum is ready. Start building your daily momentum with:
            </p>
            <div className="flex flex-col items-center gap-2 my-6 text-sm">
              <p>{selectedCategories.length} life categories</p>
              <p>{selectedHabits.length} habits to track</p>
              <p>{selectedTheme} theme</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              <Sparkles size={16} />
              Let&apos;s Go
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
