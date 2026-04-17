import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { habits } = await req.json();
  // habits: [{ id, name, consistencyPct, currentStreak, daysTracked, category }]

  const systemPrompt = `You are Momentum's Challenge Coach. The user has the following active habits with their recent performance.

${JSON.stringify(habits, null, 2)}

Suggest exactly 3 personalized Streak Challenges that match this user's current momentum. Rules:
- Match difficulty to consistency: high consistency (>75%) → 30-day challenge; moderate (50-75%) → 14-day; low (<50%) → 7-day starter.
- Prefer habits with current momentum (non-zero streak).
- Vary: don't suggest 3 challenges for the same habit.
- Each reasoning must cite the specific data (consistency %, current streak, days tracked).

Return ONLY a JSON array — no markdown fences, no preamble. Each element:
{
  "habitId": "<id from the input>",
  "habitName": "<exact name>",
  "targetDays": 7 | 14 | 30,
  "reasoning": "<1-2 sentences citing their actual data>",
  "difficulty": "starter" | "building" | "mastery"
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let suggestions;
    try {
      suggestions = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 });
    }
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: `Failed to generate suggestions: ${error}` }, { status: 500 });
  }
}
