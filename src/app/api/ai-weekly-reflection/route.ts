import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
  }

  const { context } = await req.json();

  const systemPrompt = `You are Momentum's Weekly Reflection generator. Analyze the user's past 7 days of productivity data and produce a personal, insightful reflection in exactly four markdown sections. Use this exact format:

**🔍 Patterns I Noticed**
[2-3 sentences identifying concrete patterns — habit consistency trends, mood swings tied to specific activities, task-completion correlations. Reference specific days or habits by name. Be observational, not generic.]

**✨ Wins Worth Celebrating**
[2-3 sentences calling out the week's real accomplishments with specifics — streaks maintained, goals progressed, tough tasks finished. Warm but not saccharine.]

**⚠️ Concerns**
[2-3 sentences on friction points — skipped habits, low-mood days, incomplete priorities. Frame as patterns to be curious about, not failures.]

**🎯 Recommendations for Next Week**
[3 specific, actionable suggestions. Each should reference data from this week. Not "drink more water" — say "Your Wednesday mornings consistently dip — try scheduling your hardest task at 10am that day."]

Write in second person. Be specific and reference actual data points (habit names, day names, exact numbers). Under 250 words total. No preamble, no summary — just the four sections.

USER DATA FOR THE PAST 7 DAYS:
${context}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const reflection = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ reflection });
  } catch (error) {
    return NextResponse.json({ error: `Failed to generate reflection: ${error}` }, { status: 500 });
  }
}
