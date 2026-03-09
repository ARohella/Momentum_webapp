import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured.' },
      { status: 500 }
    );
  }

  const { messages, context } = await req.json();

  const systemPrompt = `You are an AI productivity coach inside the Momentum app. You help users plan their day, set goals, manage time, and stay accountable.

USER CONTEXT:
${context}

CAPABILITIES — you can suggest scheduling events. When you want to propose adding an event to the calendar, include a JSON block in your response like this:
\`\`\`schedule
{"title": "Event name", "start": "ISO datetime", "end": "ISO datetime", "category": "work|health|learning|personal|leisure"}
\`\`\`
You can include multiple schedule blocks in one response if needed (e.g. for weekly planning).

GUIDELINES:
- Be concise, warm, and encouraging — not preachy
- Give concrete, actionable advice
- When the user asks to schedule something, suggest specific times based on their profile and current calendar
- For weekly recurring activities (like "gym 3x/week"), propose specific days/times that don't conflict with existing events
- Never schedule during sleep hours or in tiny gaps between meetings
- Reference the user's goals and habits when relevant to keep them accountable
- If the user seems overwhelmed, help them prioritize
- Ask clarifying questions when the request is ambiguous`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'I understand. I\'m your Momentum AI coach. I have access to your calendar, tasks, goals, and profile. How can I help you today?' }] },
    ...messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
  ];

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
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

    // Extract any schedule blocks
    const scheduleBlocks: Array<{ title: string; start: string; end: string; category: string }> = [];
    const scheduleRegex = /```schedule\n([\s\S]*?)```/g;
    let match;
    while ((match = scheduleRegex.exec(text)) !== null) {
      try {
        scheduleBlocks.push(JSON.parse(match[1]));
      } catch {
        // skip malformed blocks
      }
    }

    // Clean the text by removing schedule blocks for display
    const cleanText = text.replace(/```schedule\n[\s\S]*?```/g, '').trim();

    return NextResponse.json({ text: cleanText, scheduleBlocks });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get AI response: ${error}` },
      { status: 500 }
    );
  }
}
