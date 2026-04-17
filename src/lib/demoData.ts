import { v4 as uuid } from 'uuid';
import { format, subDays, addDays, startOfToday } from 'date-fns';
import { CalendarEvent, Task, Habit, JournalEntry, Goal, ScreenTimeEntry, StreakChallenge, CATEGORY_COLORS } from '@/lib/types';

const today = startOfToday();
const todayStr = format(today, 'yyyy-MM-dd');

// Build a local datetime string that won't shift when parsed
function makeTime(dayOffset: number, hour: number, minute: number = 0): string {
  const d = addDays(today, dayOffset);
  const dateStr = format(d, 'yyyy-MM-dd');
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${dateStr}T${h}:${m}:00`;
}

export function getDemoCalendarEvents(): CalendarEvent[] {
  return [
    {
      id: uuid(),
      title: 'Morning Standup',
      start: makeTime(0, 9, 0),
      end: makeTime(0, 9, 30),
      category: 'work',
      color: CATEGORY_COLORS.work,
      recurrence: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    },
    {
      id: uuid(),
      title: 'Deep Work: Feature Sprint',
      start: makeTime(0, 10, 0),
      end: makeTime(0, 12, 0),
      category: 'work',
      color: CATEGORY_COLORS.work,
    },
    {
      id: uuid(),
      title: 'Gym - Upper Body',
      start: makeTime(0, 7, 0),
      end: makeTime(0, 8, 0),
      category: 'health',
      color: CATEGORY_COLORS.health,
    },
    {
      id: uuid(),
      title: 'Lunch with Sarah',
      start: makeTime(0, 12, 30),
      end: makeTime(0, 13, 30),
      category: 'personal',
      color: CATEGORY_COLORS.personal,
    },
    {
      id: uuid(),
      title: 'CS229 Lecture - Neural Networks',
      start: makeTime(0, 14, 0),
      end: makeTime(0, 15, 30),
      category: 'learning',
      color: CATEGORY_COLORS.learning,
    },
    {
      id: uuid(),
      title: 'Team Retro',
      start: makeTime(0, 16, 0),
      end: makeTime(0, 16, 45),
      category: 'work',
      color: CATEGORY_COLORS.work,
    },
    {
      id: uuid(),
      title: 'Read: Designing Data-Intensive Apps',
      start: makeTime(0, 20, 0),
      end: makeTime(0, 21, 0),
      category: 'learning',
      color: CATEGORY_COLORS.learning,
    },
    {
      id: uuid(),
      title: 'Movie Night',
      start: makeTime(1, 19, 0),
      end: makeTime(1, 21, 30),
      category: 'leisure',
      color: CATEGORY_COLORS.leisure,
    },
    {
      id: uuid(),
      title: 'Dentist Appointment',
      start: makeTime(2, 10, 0),
      end: makeTime(2, 11, 0),
      category: 'health',
      color: CATEGORY_COLORS.health,
    },
    {
      id: uuid(),
      title: 'Weekend Hike',
      start: makeTime(3, 8, 0),
      end: makeTime(3, 12, 0),
      category: 'health',
      color: CATEGORY_COLORS.health,
    },
    {
      id: uuid(),
      title: '1:1 with Manager',
      start: makeTime(-1, 11, 0),
      end: makeTime(-1, 11, 30),
      category: 'work',
      color: CATEGORY_COLORS.work,
    },
    {
      id: uuid(),
      title: 'Yoga',
      start: makeTime(1, 7, 0),
      end: makeTime(1, 8, 0),
      category: 'health',
      color: CATEGORY_COLORS.health,
      recurrence: 'FREQ=WEEKLY;BYDAY=TU,TH,SA',
    },
  ];
}

export function getDemoTasks(): Task[] {
  return [
    {
      id: uuid(),
      title: 'Finish API integration for dashboard',
      description: 'Connect the analytics widgets to the backend API endpoints',
      estimatedDuration: 120,
      deadline: format(addDays(today, 2), 'yyyy-MM-dd'),
      category: 'work',
      completed: false,
      isTopThree: true,
      createdAt: subDays(today, 1).toISOString(),
    },
    {
      id: uuid(),
      title: 'Review pull request #42',
      description: 'Code review for the new auth flow',
      estimatedDuration: 30,
      deadline: todayStr,
      category: 'work',
      completed: true,
      isTopThree: true,
      createdAt: subDays(today, 1).toISOString(),
    },
    {
      id: uuid(),
      title: 'Complete ML assignment Chapter 5',
      estimatedDuration: 90,
      deadline: format(addDays(today, 3), 'yyyy-MM-dd'),
      category: 'learning',
      completed: false,
      isTopThree: true,
      createdAt: subDays(today, 2).toISOString(),
    },
    {
      id: uuid(),
      title: 'Grocery shopping',
      estimatedDuration: 45,
      category: 'personal',
      completed: false,
      isTopThree: false,
      createdAt: subDays(today, 1).toISOString(),
    },
    {
      id: uuid(),
      title: 'Write blog post on React patterns',
      estimatedDuration: 60,
      category: 'learning',
      completed: false,
      isTopThree: false,
      createdAt: subDays(today, 3).toISOString(),
    },
    {
      id: uuid(),
      title: 'Schedule car maintenance',
      estimatedDuration: 15,
      category: 'personal',
      completed: true,
      isTopThree: false,
      createdAt: subDays(today, 5).toISOString(),
    },
    {
      id: uuid(),
      title: 'Prepare slides for team presentation',
      estimatedDuration: 90,
      deadline: format(addDays(today, 1), 'yyyy-MM-dd'),
      category: 'work',
      completed: true,
      isTopThree: false,
      createdAt: subDays(today, 4).toISOString(),
    },
    {
      id: uuid(),
      title: 'Update portfolio website',
      estimatedDuration: 60,
      category: 'personal',
      completed: false,
      isTopThree: false,
      createdAt: subDays(today, 2).toISOString(),
    },
  ];
}

export function getDemoHabits(): Habit[] {
  const makeCompletions = (daysBack: number, hitRate: number): Record<string, boolean> => {
    const completions: Record<string, boolean> = {};
    for (let i = 0; i < daysBack; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      completions[d] = Math.random() < hitRate;
    }
    // Ensure today and recent days are completed for streak display
    completions[todayStr] = true;
    completions[format(subDays(today, 1), 'yyyy-MM-dd')] = true;
    completions[format(subDays(today, 2), 'yyyy-MM-dd')] = true;
    return completions;
  };

  return [
    {
      id: uuid(),
      name: 'Meditate 10 min',
      category: 'health',
      createdAt: subDays(today, 30).toISOString(),
      completions: makeCompletions(30, 0.85),
      isActive: true,
    },
    {
      id: uuid(),
      name: 'Read 30 pages',
      category: 'learning',
      createdAt: subDays(today, 25).toISOString(),
      completions: makeCompletions(25, 0.75),
      isActive: true,
    },
    {
      id: uuid(),
      name: 'Exercise',
      category: 'health',
      createdAt: subDays(today, 40).toISOString(),
      completions: makeCompletions(40, 0.7),
      isActive: true,
    },
    {
      id: uuid(),
      name: 'No social media before noon',
      category: 'personal',
      createdAt: subDays(today, 14).toISOString(),
      completions: makeCompletions(14, 0.65),
      isActive: true,
    },
    {
      id: uuid(),
      name: 'Practice DSA problem',
      category: 'learning',
      createdAt: subDays(today, 20).toISOString(),
      completions: makeCompletions(20, 0.6),
      isActive: true,
    },
  ];
}

export function getDemoJournalEntries(): JournalEntry[] {
  return [
    {
      id: uuid(),
      date: todayStr,
      wentWell: 'Had a productive deep work session. Finally cracked the caching bug that was bothering me all week.',
      toImprove: 'Got distracted by Slack notifications during focus time. Need to mute channels during deep work blocks.',
      freeform: 'Feeling energized about the project direction. The team retro went really well — we aligned on priorities for the sprint.',
      mood: 'great',
      createdAt: today.toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      wentWell: 'Completed all three top priorities. Morning gym session gave me great energy for the day.',
      toImprove: 'Stayed up too late reading. Need to stick to the 10:30pm wind-down routine.',
      freeform: 'Interesting conversation with Sarah about potential side project ideas. Might explore the AI tutoring concept more.',
      mood: 'good',
      createdAt: subDays(today, 1).toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      wentWell: 'Shipped the notification refactor. Felt really good to close out that long-running ticket.',
      toImprove: 'Ate lunch at my desk again. Should take a proper break.',
      freeform: 'Quiet, focused day.',
      mood: 'good',
      createdAt: subDays(today, 2).toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 3), 'yyyy-MM-dd'),
      wentWell: 'Great progress on the ML assignment. The neural network concepts are finally clicking.',
      toImprove: 'Skipped meditation today — felt rushed in the morning. Should wake up 15 min earlier.',
      freeform: 'Started reading "Designing Data-Intensive Applications". The chapter on replication was fascinating.',
      mood: 'okay',
      createdAt: subDays(today, 3).toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 4), 'yyyy-MM-dd'),
      wentWell: 'Nothing specific — just a meh kind of day.',
      toImprove: 'Energy was low. Should have gone for a walk instead of powering through.',
      freeform: '',
      mood: 'bad',
      createdAt: subDays(today, 4).toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 5), 'yyyy-MM-dd'),
      wentWell: 'Presented the quarterly review. Got positive feedback from leadership on the product roadmap.',
      toImprove: 'Need to delegate more — tried to do everything myself and ended up stressed.',
      freeform: '',
      mood: 'good',
      createdAt: subDays(today, 5).toISOString(),
    },
    {
      id: uuid(),
      date: format(subDays(today, 6), 'yyyy-MM-dd'),
      wentWell: 'Long run in the morning. Felt amazing afterwards.',
      toImprove: 'Over-committed socially and ran out of time to prep for Monday.',
      freeform: 'Weekend reset — cooked a real breakfast for once.',
      mood: 'great',
      createdAt: subDays(today, 6).toISOString(),
    },
  ];
}

export function getDemoChallenges(habits: Habit[]): StreakChallenge[] {
  // Find habits by name to tie challenges to them
  const meditate = habits.find((h) => h.name.toLowerCase().includes('meditate'));
  const exercise = habits.find((h) => h.name.toLowerCase().includes('exercise'));
  const read = habits.find((h) => h.name.toLowerCase().includes('read'));

  const challenges: StreakChallenge[] = [];

  if (meditate) {
    // 30-day challenge, started 18 days ago → 12 days left, good progress
    challenges.push({
      id: uuid(),
      habitId: meditate.id,
      targetDays: 30,
      startDate: format(subDays(today, 18), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 11), 'yyyy-MM-dd'),
      createdAt: subDays(today, 18).toISOString(),
    });
  }

  if (exercise) {
    // 14-day challenge, started 4 days ago
    challenges.push({
      id: uuid(),
      habitId: exercise.id,
      targetDays: 14,
      startDate: format(subDays(today, 4), 'yyyy-MM-dd'),
      endDate: format(addDays(today, 9), 'yyyy-MM-dd'),
      createdAt: subDays(today, 4).toISOString(),
    });
  }

  if (read) {
    // 7-day challenge starting today
    challenges.push({
      id: uuid(),
      habitId: read.id,
      targetDays: 7,
      startDate: todayStr,
      endDate: format(addDays(today, 6), 'yyyy-MM-dd'),
      createdAt: today.toISOString(),
    });
  }

  return challenges;
}

export function getDemoGoals(): Goal[] {
  return [
    {
      id: uuid(),
      title: 'Read 24 books this year',
      type: 'milestone',
      target: 24,
      unit: 'books',
      progress: 5,
      category: 'learning',
      deadline: '2026-12-31',
      createdAt: subDays(today, 60).toISOString(),
    },
    {
      id: uuid(),
      title: 'Run 500km',
      type: 'custom',
      target: 500,
      unit: 'km',
      progress: 127,
      category: 'health',
      deadline: '2026-12-31',
      createdAt: subDays(today, 90).toISOString(),
    },
    {
      id: uuid(),
      title: 'Complete ML course',
      type: 'milestone',
      target: 12,
      unit: 'chapters',
      progress: 5,
      category: 'learning',
      deadline: '2026-06-30',
      createdAt: subDays(today, 30).toISOString(),
    },
    {
      id: uuid(),
      title: 'Log 200 hours deep work',
      type: 'time',
      target: 200,
      unit: 'hours',
      progress: 68,
      category: 'work',
      deadline: '2026-06-30',
      createdAt: subDays(today, 45).toISOString(),
    },
  ];
}

export function getDemoScreenTimeEntries(): ScreenTimeEntry[] {
  const entries: ScreenTimeEntry[] = [];
  for (let i = 0; i < 14; i++) {
    const baseHours = 4 + Math.floor(Math.random() * 4); // 4-7 hours
    const mins = Math.floor(Math.random() * 60);
    entries.push({
      id: uuid(),
      date: format(subDays(today, i), 'yyyy-MM-dd'),
      hours: baseHours,
      minutes: mins,
    });
  }
  return entries;
}
