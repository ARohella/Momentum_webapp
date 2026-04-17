import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { context } = await req.json();

  const systemPrompt = `You are Momentum's Daily Brief generator. Analyze the user's data and return concise, personalized commentary as JSON.

Return EXACTLY this JSON shape (no markdown, no extra keys):
{
  "headline": "short punchy title for today (max 8 words, no period)",
  "scheduleNote": "one sentence about how today's schedule looks (max 20 words)",
  "focusNote": "one sentence about their top priorities and why they matter (max 22 words)",
  "habitsNote": "one sentence about habit streaks — call out risk or celebrate wins (max 20 words)",
  "motivation": "one warm, specific sentence tied to their goals (max 22 words)",
  "vibe": "one of: energized, focused, balanced, recovery, ambitious"
}

Rules:
- Second person ("You have...", "Your streak...")
- Reference SPECIFIC details from their data (names, numbers, streaks)
- No emojis, no markdown, no quotation marks inside strings
- If a section has no data, still write an encouraging sentence

USER DATA:
${context}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
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
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    return NextResponse.json({ brief: parsed });
  } catch (error) {
    return NextResponse.json({ error: `Failed to generate brief: ${error}` }, { status: 500 });
  }
}
