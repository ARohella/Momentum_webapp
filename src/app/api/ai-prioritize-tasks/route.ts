import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { tasks, todaySchedule, focusTime, today } = await req.json();
  // tasks: [{id, title, estimatedDuration, deadline, category}]
  // todaySchedule: [{title, start, end}]
  // focusTime: 'morning' | 'afternoon'
  // today: ISO date string

  const systemPrompt = `You are Momentum's Task Prioritizer. Today is ${today}. Given the user's incomplete tasks, today's existing calendar, and their preferred focus time, recommend which 3 tasks to do today as their "Top 3" — and explain why.

Decision criteria (weigh in this order):
1. Deadline pressure (overdue or due today/tomorrow = high priority)
2. High-leverage work during the user's peak focus time (${focusTime})
3. Realistic fit around existing calendar commitments
4. Mix of categories when possible — don't stack all "work"

INCOMPLETE TASKS:
${JSON.stringify(tasks, null, 2)}

TODAY'S CALENDAR:
${JSON.stringify(todaySchedule, null, 2)}

Return ONLY a JSON object — no markdown fences, no preamble:
{
  "ranked": [
    { "taskId": "<id>", "rank": 1, "reasoning": "<1 concise sentence citing the specific factor — deadline, calendar gap, focus time, etc>" },
    { "taskId": "<id>", "rank": 2, "reasoning": "..." },
    { "taskId": "<id>", "rank": 3, "reasoning": "..." }
  ],
  "summary": "<1 sentence on the overall strategy for today>"
}`;

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
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: `Failed to prioritize tasks: ${error}` }, { status: 500 });
  }
}
