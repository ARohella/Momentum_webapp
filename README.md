# Momentum

An all-in-one productivity dashboard with AI-assisted scheduling that helps users proactively structure their time around personal priorities.

[![Demo Video](https://img.youtube.com/vi/eR3HOFCPAd8/maxresdefault.jpg)](https://youtu.be/eR3HOFCPAd8)

**[Watch the Demo Video](https://youtu.be/eR3HOFCPAd8)**

## Problem

Students, founders, and young professionals often say they "don't have time" for important personal goals — going to the gym, building a side project, meditating. The real issue isn't lack of time but lack of structured scheduling that protects those priorities. Existing tools like Google Calendar are passive: they require manual time blocking and don't intelligently adjust when new events are added.

## What It Does

Momentum lets users manage their full day from a single dashboard:

- **Calendar** — Google Calendar-style weekly/daily view with hourly rows, 15-minute drag snapping, and recurring event support (via RRule)
- **Top-3 Focus Tasks** — Daily priority tasks to keep attention on what matters most
- **Habit Tracker** — Up to 7 active habits with streak tracking and streak-loss warnings
- **Journal** — Daily journaling integrated into the dashboard
- **Goals** — Long-term goal tracking (time-based, milestone, custom metrics) with progress analytics showing how daily actions contribute to bigger objectives
- **Focus Timer** — Pomodoro-style timer for deep work sessions
- **Screen Time** — Monitor daily screen time usage
- **Analytics** — Visualize habit consistency, goal progress, and task completion trends
- **AI Scheduler** — Analyzes calendar gaps, user profile (wake/sleep times, work hours, workout preferences), and suggests sensible time slots that respect real-world constraints
- **AI Coach** — Conversational assistant with full user context (events, tasks, habits, goals, profile) that can propose calendar events via embedded JSON blocks, accepted with one click

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (React 19) + TypeScript |
| Styling | Tailwind CSS 4 |
| State Management | Zustand with localStorage persistence |
| Calendar | FullCalendar + RRule for recurring events |
| Charts | Recharts |
| AI | Gemini API via Next.js API routes |
| Icons | Lucide React |

Fully client-side — no backend required for the core experience.

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key (for AI features)

### Installation

```bash
git clone <repo-url>
cd Momentum_webapp
npm install
```

### Environment Variables

Create a `.env.local` file:

```
GEMINI_API_KEY=your_gemini_api_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

Toggle **Demo Mode** to populate all stores with realistic mock data so every feature is usable without manual setup.

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── analytics/        # Analytics dashboard
│   ├── api/              # API routes (AI endpoints)
│   ├── calendar/         # Calendar view
│   ├── coach/            # AI coach interface
│   ├── focus/            # Focus timer
│   ├── goals/            # Goal tracking
│   ├── habits/           # Habit tracker
│   ├── journal/          # Daily journal
│   ├── onboarding/       # User profile setup
│   ├── profile/          # User preferences
│   ├── screen-time/      # Screen time tracking
│   └── tasks/            # Task management
├── components/           # Shared UI components
│   ├── dashboard/        # Bento-grid dashboard widgets
│   ├── AppShell.tsx      # Layout wrapper with sidebar
│   ├── EventModal.tsx    # Calendar event creation/editing
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/                  # Utilities
└── stores/               # Zustand state stores
    ├── calendarStore.ts
    ├── taskStore.ts
    ├── habitStore.ts
    ├── goalStore.ts
    ├── journalStore.ts
    ├── screenTimeStore.ts
    ├── preferencesStore.ts
    └── demoStore.ts
```

## Key Design Decisions

- **Dark/light theme only** — no system mode, to keep the UI consistent and predictable
- **Max 7 active habits** — prevents habit overload; includes streak-loss warnings
- **Top-3 daily tasks** — forces prioritization over endless to-do lists
- **User profile feeds AI prompts** — wake/sleep times, work hours, and workout preferences are passed directly to the AI scheduler so suggestions are actually usable
- **AI scheduling guardrails** — never schedules before wake time or after sleep time, places exercise at preferred times, avoids squeezing workouts into short gaps between meetings, spreads weekly recurring activities across different days

## Iteration Highlights

| Issue | Fix | Result |
|-------|-----|--------|
| Recurring events showed as single events | Expanded occurrences across the calendar using RRule, linking instances back to the original event | Recurring events display correctly across all views |
| AI scheduler suggested 3am time slots | Added user profile constraints to AI prompts (wake time, sleep time, work hours) | AI respects sleep schedule and places activities sensibly |
| Clicking calendar slots didn't autofill event times | Pre-fill the event modal with selected start/end time on slot click | One-click event creation from any time slot |
| Calendar was too scrollable with 15-min rows | Switched to hourly visual rows while keeping 15-minute drag precision | Compact day view that fits on screen |
