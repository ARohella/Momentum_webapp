import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { goal, today } = await req.json();

  const systemPrompt = `Break down the following goal into 5-8 concrete, actionable milestone tasks. Today's date is ${today}.

Goal:
- Title: ${goal.title}
- Type: ${goal.type}
- Target: ${goal.target} ${goal.unit}
- Current progress: ${goal.progress} ${goal.unit} (${Math.round((goal.progress / goal.target) * 100)}%)
- Category: ${goal.category}
- Deadline: ${goal.deadline || 'none'}

Return ONLY a valid JSON array (no markdown, no code blocks). Each item must have:
{
  "title": "specific action-oriented task title",
  "estimatedDuration": 60,
  "deadline": "YYYY-MM-DD or null"
}

Rules:
- Tasks should be specific, actionable, and progressively build toward the goal
- estimatedDuration in minutes (range 15-180)
- Spread deadlines across time leading up to goal deadline (if any)
- Start with easier/smaller tasks, build up
- Return 5-8 tasks total
- Output MUST be valid JSON array like: [{"title":"...","estimatedDuration":60,"deadline":"2026-04-20"},...]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.5,
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
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      parsed = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({ tasks: Array.isArray(parsed) ? parsed : [] });
  } catch (error) {
    return NextResponse.json({ error: `Failed to break down goal: ${error}` }, { status: 500 });
  }
}
