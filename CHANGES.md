# Momentum — Final Demo Expansion Changelog

Reference document for all features added in preparation for Final Demo Day (April 21, 2026).
Starting point: MVP already deployed on Vercel with Dashboard, Tasks, Calendar, Habits, Journal, Analytics, Goals, Coach, Screen Time, and Profile pages.

---

## Feature 1 — Accent Color Customization
**What changed:** The entire app's accent color used to be hardcoded indigo. Now the Profile page has an "Appearance" card with 8 color swatches (Indigo, Violet, Blue, Cyan, Emerald, Amber, Rose, Pink). Clicking a swatch instantly recolors every button, link, ring, and highlight in the app.
**Why:** Personalization is a top driver of retention in productivity apps. Users feel ownership when they can brand their tool.
**Result:** `--accent` and `--accent-hover` CSS variables are driven from Zustand preferences, persisted in localStorage, and updated via `ThemeProvider`. Demo sells instantly — switch a color on stage, everything updates live.
**Files:** `src/stores/preferencesStore.ts`, `src/components/ThemeProvider.tsx`, `src/app/profile/page.tsx`.

---

## Feature 2 — Productivity Score Dashboard Widget
**What changed:** Dashboard had no single daily summary metric. Added a bento card with an SVG progress ring showing today's 0–100 score, letter grade (A–F), and a running "productive-day streak" counter.
**Why:** A single glance-metric is the fastest way to communicate the app's value in a demo. It also motivates returning tomorrow.
**Scoring formula:**
- Habits: `(habitsCompletedToday / totalActiveHabits) × 40` (defaults to full 40 if no habits)
- Top-3 Tasks: `(top3CompletedToday / 3) × 40` (defaults to full 40 if none set)
- Journal: `hasEntryToday ? 20 : 0`
- Grades: ≥90 A, ≥80 B, ≥70 C, ≥60 D, <60 F
**Result:** Streak increments when score ≥ 70 on a new day; resets otherwise. Gives the Dashboard a clear headline number.
**Files:** `src/components/dashboard/DashboardProductivityScore.tsx` (new), `src/stores/preferencesStore.ts`, `src/app/page.tsx`.

---

## Feature 3 — Mood Tracker
**What changed:** Journal page had 3 text prompts but no emotional data. Added an emoji mood picker (😄 🙂 😐 😞 😩) above the prompts; Analytics shows a 7-day mood timeline.
**Why:** Mood is the single most-requested feature in journaling apps. It's also trivially visual for demo screenshots.
**Result:** `JournalEntry.mood` stored with each daily entry. Analytics page displays mood-per-day dots. Dashboard journal card shows today's mood emoji.
**Files:** `src/lib/types.ts` (Mood type + MOOD_EMOJI/LABEL), `src/stores/journalStore.ts`, `src/app/journal/page.tsx`, `src/app/analytics/page.tsx`, `src/components/dashboard/DashboardJournal.tsx`.

---

## Feature 4 — Focus Mode
**What changed:** Focus page was a regular page with a timer. Now there's an "Enter Focus Mode" button that hides the sidebar and shell entirely, rendering a full-screen distraction-free timer + top-3 task list. Exit via Esc or button.
**Why:** Focus apps only work if everything else disappears. The flashy transition also demos beautifully.
**Result:** `focusModeActive` in preferences store; `AppShell` renders children without the sidebar wrapper when active. Escape listener auto-exits.
**Files:** `src/stores/preferencesStore.ts`, `src/components/AppShell.tsx`, `src/app/focus/page.tsx`.

---

## Feature 5 — Voice Input for AI Coach
**What changed:** Coach was text-only. Added a mic button next to the send button that uses the browser's native Web Speech API to transcribe speech into the input field.
**Why:** Voice is a "wow" demo feature and costs nothing (no library, no API fees — browser-native).
**Result:** Mic button toggles between listening and idle states, with a pulsing red ring while active. Transcript auto-appends to the text input. Error toast if browser unsupported.
**Files:** `src/app/coach/page.tsx`.

---

## Feature 6 — AI Daily Brief (Interactive Popup)
**What changed:** Dashboard showed siloed data; the Coach required a user-typed question. Added a Daily Brief card that opens a full visual popup — gradient vibe-colored header, AI-generated headline, and five icon-led sections (Schedule, Focus, Habits, Goals, Motivation) with inline interaction (tap habit chips to check in, tap tasks to complete).
**Why:** A text blurb gets read once and ignored. A visual, interactive dashboard-in-a-popup is something users will reopen throughout the day to re-center priorities.
**Result:** POST `/api/ai-brief` calls Gemini 2.5 Flash Lite (temp 0.7) with `responseMimeType: 'application/json'` and returns `{ headline, scheduleNote, focusNote, habitsNote, motivation, vibe }`. The modal pairs AI commentary with the user's real data — today's events with start times, top-3 tasks with checkboxes, habit pills with streak counts and check-in taps, goal progress bars. "Vibe" drives the header gradient (energized/focused/balanced/recovery/ambitious). Card shows at-a-glance counts (events / tasks / habits done). Escape/backdrop closes; regenerate button in header.
**Files:** `src/app/api/ai-brief/route.ts` (new), `src/components/dashboard/DashboardAIBrief.tsx` (new), `src/app/page.tsx`.

---

## Feature 7 — Natural Language Task Entry
**What changed:** Task creation required filling a modal form (title, duration, category, deadline). Added a "magic wand" quick-add bar at the top of the Tasks page: type "30-minute workout tomorrow morning" and Gemini parses it into a structured task preview.
**Why:** Cuts task creation friction to near-zero. Classic AI UX demo.
**Result:** POST `/api/ai-parse-task` returns `{title, estimatedDuration, deadline, category}` as JSON. User sees a preview card, clicks Add to confirm or Edit to adjust.
**Files:** `src/app/api/ai-parse-task/route.ts` (new), `src/app/tasks/page.tsx`.

---

## Feature 8 — AI Goal → Task Breakdown
**What changed:** Goals were standalone with manual progress logging, no link to actionable work. Added an "AI Breakdown" button on each goal card that calls Gemini to produce 5–8 concrete milestone tasks, which can be added to the task list in one click.
**Why:** Bridges the biggest gap in goal-tracking apps: goals → actual tasks. The demo shows real agentic behavior.
**Result:** POST `/api/ai-goal-breakdown` returns an array of `{title, estimatedDuration, deadline}`. Inline slide-out panel with "Add All" or per-task "+" buttons.
**Files:** `src/app/api/ai-goal-breakdown/route.ts` (new), `src/app/goals/page.tsx`.

---

## Feature 9 — Habit Insights
**What changed:** Habits page showed a weekly completion table + heatmap but no pattern analysis. Added an "Insights" section computing completion rate per day-of-week over the past 60 days, highlighting each habit's best and worst day.
**Why:** Actionable insight ("you never meditate on Thursdays") beats raw data. Minimal code, high demo impact.
**Result:** For each active habit: "Best: Monday (83%)" / "Worst: Thursday (41%)". Plus overall "Most consistent habit" highlight.
**Files:** `src/app/habits/page.tsx`.

---

## Feature 10 — Streak Challenges
**What changed:** Streaks were tracked passively. Now users can start a named 7/14/30-day challenge for any habit with a Zap icon. Active challenges show a mini SVG progress ring and days-remaining countdown.
**Why:** Challenges convert passive streak tracking into an active commitment. Gamification drives retention.
**Result:** New `StreakChallenge` type. `startChallenge(habitId, targetDays)` computes start/end dates via date-fns. `getChallengeProgress` counts completions within the window.
**Files:** `src/lib/types.ts`, `src/stores/habitStore.ts`, `src/app/habits/page.tsx`.

---

## Feature 11 — Google Calendar Sync
**What changed:** Calendar was local-only. Added Google Calendar OAuth integration via Google Identity Services (client-side, no backend). Users can "Connect Google Calendar" and "Sync" to import their Google events into Momentum.
**Why:** A standalone calendar is a dealbreaker. Real users already live in Google Calendar; syncing is non-negotiable.
**Result:** Uses GIS token flow (no NextAuth / backend required) — access token stored in localStorage, auto-expires. Fetches events ±1 month from today, dedupes by `googleEventId`, marks imported events with `source: 'google'`. Shows sync status and last-synced time.
**Setup:** Requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var (OAuth client from Google Cloud Console, web app type, authorized origin = deployed URL).
**Files:** `src/lib/googleCalendar.ts` (new), `src/lib/types.ts` (added `source` + `googleEventId` to CalendarEvent), `src/app/calendar/page.tsx`.

---

## Feature 12 — Weekly Digest
**What changed:** Analytics had live charts but no exportable summary. Added a "Download Weekly Report" button that generates a formatted `.txt` file summarizing the past 7 days: productivity score average, habit consistency, time by category, mood timeline, and top wins from the journal.
**Why:** Users love tangible artifacts — a downloadable report is a natural share / reflection prompt. It also provides a lightweight "share with a coach" path without email setup.
**Result:** `generateWeeklyReport()` builds the report string from existing store data. Browser triggers download as `momentum-weekly-YYYY-MM-DD.txt`.
**Files:** `src/lib/weeklyReport.ts` (new), `src/app/analytics/page.tsx`.

---

## Feature 13 — Rewards & Badges System
**What changed:** Progress had no payoff beyond raw numbers. Added a 21-badge achievement system spanning tasks, habits, journal, goals, focus, AI usage, and meta categories with bronze/silver/gold/legendary tiers. Badges appear on the Profile page with lock icons + progress bars for locked ones and colored tier rings for unlocked ones.
**Why:** Gamification drives repeat engagement. Badges also expose features users might not notice (e.g., Voice Master encourages trying voice input).
**Result:** `src/lib/badges.ts` defines every badge with a `check(ctx)` function returning `{ progress, total }`. `rewardsStore` tracks AI usage per-feature, focus sessions, accent colors tried, challenges completed, and seen-badges (for unseen notifications later). Every AI endpoint + focus session increments the relevant counter. Highlights: Week Warrior (7-day streak), Iron Will (30), Unstoppable (100, legendary), Challenge Champion, Emotional IQ (7 distinct moods), AI Power User (5 AI features used), Personalizer (3 accent colors), Early Adopter.
**Files:** `src/lib/badges.ts` (new), `src/stores/rewardsStore.ts` (new), `src/components/Achievements.tsx` (new), `src/app/profile/page.tsx`, plus `incrementAI()` wiring in `coach`, `tasks`, `goals`, `habits`, `DashboardAIBrief`, `WeeklyReflection`, and `incrementFocusSession()` in `focus`.

---

## Feature 14 — AI Weekly Reflection
**What changed:** Analytics showed numbers but no interpretation. Added a "Weekly Reflection" card that feeds the past 7 days of habit counts, completed tasks, journal moods, time-by-category, and screen time into Gemini and returns a 4-section analysis: Patterns I Noticed / Wins Worth Celebrating / Concerns / Recommendations.
**Why:** Raw analytics are useless without a "so what." An AI that reads your week like a coach turns passive charts into active guidance.
**Result:** POST `/api/ai-weekly-reflection` (temp 0.8, 1024 tokens, <250 words). Renders with markdown bold → `<strong>` replacer. Increments `weeklyReflections` on the rewards store for badge progress.
**Files:** `src/app/api/ai-weekly-reflection/route.ts` (new), `src/components/WeeklyReflection.tsx` (new), `src/app/analytics/page.tsx`.

---

## Feature 15 — AI Challenge Coach (Auto-Generated Streak Challenges)
**What changed:** Streak challenges in Feature 10 were manual — users had to pick a habit and target days themselves. Added an "AI Challenge Coach" card on the Habits page that analyzes each habit's consistency (completion % over tracked days) and current streak, then suggests 3 personalized 7/14/30-day challenges with reasoning and difficulty tags (starter / building / mastery).
**Why:** Users don't know which habit is ready for a 30-day push versus a gentle 7-day nudge. The AI picks the right stretch automatically.
**Result:** POST `/api/ai-challenge-suggestions` (temp 0.6, JSON response). Rules: >75% consistency → 30 days, 50–75% → 14, <50% → 7. One-click "Start" calls `startChallenge(habitId, targetDays)`. Increments `challengesSuggested` counter.
**Files:** `src/app/api/ai-challenge-suggestions/route.ts` (new), `src/app/habits/page.tsx`.

---

## Feature 16 — AI Smart Task Prioritizer
**What changed:** Top-3 tasks were picked manually. Added an "AI Smart Prioritizer" card on the Tasks page that considers deadline pressure, peak focus hours from the user's profile, today's calendar availability, and category mix, then returns the 3 tasks to focus on today — each with a one-sentence reasoning — and a one-click "Promote to Today's Focus" action.
**Why:** Most productivity failures are prioritization failures. Giving users an AI second opinion on what to work on today is arguably the single highest-leverage feature in the app.
**Result:** POST `/api/ai-prioritize-tasks` (temp 0.5, JSON response). Returns `{ ranked: [{taskId, rank, reasoning}×3], summary }`. Applying the ranking clears existing top-3 flags and sets the AI-chosen tasks. Increments `tasksPrioritized`.
**Files:** `src/app/api/ai-prioritize-tasks/route.ts` (new), `src/app/tasks/page.tsx`.

---

## Polish — Persistence, Demo Data, Branding, Legal

**Onboarding hydration fix.** Zustand's persist middleware hydrates from localStorage *after* the first render, which caused `redirect('/onboarding')` to fire on every app load even after onboarding was complete. Added `_hasHydrated` flag set by `onRehydrateStorage` callback in `preferencesStore`; `page.tsx` and `AppShell.tsx` now early-return an empty shell until hydration resolves.

**Onboarding name fix.** The onboarding flow captured `name` into local React state but never wrote it to `preferencesStore.profile`. Added `updateProfile({ name: name.trim() })` call in `handleFinish`.

**Rich demo data.** Demo Mode previously loaded a thin set of events. Expanded `demoData.ts` with 7 moods-tagged journal entries, a completed top-3 task, and three auto-seeded challenges (30-day meditation mid-run, 14-day exercise starting, 7-day reading fresh). Sidebar `enterDemoMode` / `exitDemoMode` now handle challenges alongside habits.

**Screen time edit bug.** Update button used to call `logScreenTime(today, 0, 0)` to "clear" the entry, but that wrote a zero entry rather than deleting it — so the "Today's entry" view kept re-rendering over the form. Replaced with an explicit `editing` state flag and Save/Cancel pair.

**Branding.** Moved `Subject.png` to `public/logo.png`; wired `icons` into `src/app/layout.tsx` metadata so the browser tab favicon matches; replaced the old "M" box in Sidebar and Onboarding with the logo image.

**Privacy & Terms.** Added `/privacy` and `/terms` pages covering data handling, Google scopes, Limited Use compliance, AI disclaimer, and acceptable use. These are required for the Google OAuth consent form (Feature 11) and linkable from the homepage footer.

---

## Summary Table

| # | Feature | Key File(s) | User-visible change |
|---|---------|-------------|---------------------|
| 1 | Accent Color | `ThemeProvider`, Profile | 8 swatches, instant recolor |
| 2 | Productivity Score | `DashboardProductivityScore` | SVG ring + grade on Dashboard |
| 3 | Mood Tracker | Journal + Analytics | Emoji picker + weekly trend |
| 4 | Focus Mode | `AppShell`, Focus page | Full-screen distraction-free view |
| 5 | Voice Input | Coach page | Mic button (Web Speech API) |
| 6 | AI Daily Brief | `/api/ai-brief`, Dashboard | Interactive popup with icons + live data |
| 7 | NLP Task Entry | `/api/ai-parse-task`, Tasks | Type a sentence → structured task |
| 8 | Goal Breakdown | `/api/ai-goal-breakdown`, Goals | AI splits goal into milestones |
| 9 | Habit Insights | Habits page | Best/worst day-of-week per habit |
| 10 | Streak Challenges | habitStore, Habits page | 7/14/30-day challenges w/ ring |
| 11 | Google Calendar | `lib/googleCalendar.ts`, Calendar | OAuth + import |
| 12 | Weekly Digest | `lib/weeklyReport.ts`, Analytics | Download .txt summary |
| 13 | Rewards & Badges | `lib/badges.ts`, `rewardsStore`, Profile | 21 badges across 7 categories |
| 14 | AI Weekly Reflection | `/api/ai-weekly-reflection`, Analytics | AI reads your week like a coach |
| 15 | AI Challenge Coach | `/api/ai-challenge-suggestions`, Habits | Auto-picks 7/14/30-day challenges |
| 16 | AI Smart Prioritizer | `/api/ai-prioritize-tasks`, Tasks | AI picks today's top-3 tasks |

---

## New Environment Variables
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — required for Feature 11 (Google Calendar Sync). Set in Vercel project settings.
- `GEMINI_API_KEY` — already present; reused for Features 6, 7, 8, 14, 15, 16.

## New Dependencies
None. All features use libraries already in the project (Zustand, date-fns, lucide-react, recharts, rrule) or browser-native APIs (Web Speech, Google Identity Services script).
