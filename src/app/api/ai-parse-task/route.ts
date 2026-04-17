import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { text, today, categories } = await req.json();

  const systemPrompt = `Parse the following natural language task description into structured JSON. Today's date is ${today}.

User input: "${text}"

Available categories: ${(categories || ['work', 'health', 'learning', 'personal', 'leisure']).join(', ')}

Return ONLY a valid JSON object (no markdown, no code blocks) with these fields:
{
  "title": "short clean task title",
  "estimatedDuration": 30,
  "deadline": "YYYY-MM-DD or null if no deadline mentioned",
  "category": "one of the available categories (pick the best fit)"
}

Rules:
- estimatedDuration is in minutes (default 30 if not specified)
- If user says "tomorrow", set deadline to ${today} + 1 day
- If user says "next week", set deadline to ${today} + 7 days
- If user says "by Friday", calculate the next Friday from ${today}
- Category must match one from the list exactly (lowercase)
- Title should be concise, action-oriented, capitalized`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256,
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
      // Try to extract JSON from markdown
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || !parsed.title) {
      return NextResponse.json({ error: 'Could not parse task' }, { status: 400 });
    }

    return NextResponse.json({
      title: parsed.title,
      estimatedDuration: parsed.estimatedDuration || 30,
      deadline: parsed.deadline && parsed.deadline !== 'null' ? parsed.deadline : undefined,
      category: parsed.category || 'personal',
    });
  } catch (error) {
    return NextResponse.json({ error: `Failed to parse: ${error}` }, { status: 500 });
  }
}
