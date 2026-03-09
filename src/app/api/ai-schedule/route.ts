import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured. Set GEMINI_API_KEY in your environment.' },
      { status: 500 }
    );
  }

  const { events, tasks, preferences, profile } = await req.json();

  const profileContext = profile ? `
User Profile:
- Name: ${profile.name || 'User'}
- Wake time: ${profile.wakeTime || '07:00'}
- Sleep time: ${profile.sleepTime || '23:00'}
- Work hours: ${profile.workStartTime || '09:00'} to ${profile.workEndTime || '17:00'}
- Work days: ${(profile.workDays || [1,2,3,4,5]).map((d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
- Preferred workout time: ${profile.preferredWorkoutTime || 'morning'}
- Best focus/deep work time: ${profile.focusHours || 'morning'}
- Bio/notes: ${profile.bio || 'None'}
` : '';

  const prompt = `You are a smart scheduling assistant for a productivity app called Momentum.

Given the user's current calendar events and unscheduled tasks, suggest optimal time slots for each task.
${profileContext}
STRICT Rules:
- NEVER schedule anything before the user's wake time or after their sleep time
- NEVER schedule health/exercise during work hours if there's time before/after work
- Place exercise/gym at the user's preferred workout time (${profile?.preferredWorkoutTime || 'morning'})
- Place focus/deep work tasks during the user's best focus time (${profile?.focusHours || 'morning'})
- Do not overlap with existing events
- Respect work hours: only schedule work tasks during work hours
- Personal/health/leisure tasks should go outside of work hours
- If a task doesn't fit today, suggest the next available day
- Leave 15-minute buffer between events
- Be sensible: don't schedule gym in a 1-hour gap between work meetings. Gym needs open time before/after, not squeezed between obligations
- For weekly recurring tasks (e.g. "work out 3x/week"), spread them across different days of the week
- Respect task deadlines
- Consider task duration — don't squeeze a 2-hour task into a 1-hour gap

Current Events (ISO format):
${JSON.stringify(events, null, 2)}

Unscheduled Tasks:
${JSON.stringify(tasks, null, 2)}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Respond ONLY with a valid JSON array of objects with these fields:
- taskId: string
- suggestedStart: ISO datetime string
- suggestedEnd: ISO datetime string
- reason: brief explanation of why this time was chosen`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 500 });
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get AI suggestions: ${error}` },
      { status: 500 }
    );
  }
}
