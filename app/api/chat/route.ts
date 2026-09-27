import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Server-only: no NEXT_PUBLIC_ prefix, so this never reaches the browser bundle.
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set on the server.');
    return NextResponse.json(
      { error: 'AI assistant is not configured.' },
      { status: 500 },
    );
  }

  let body: { question?: string; documentTitle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
  }

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Context: You are a math assistant for MathSpace. You are helping a student with the document: ${body.documentTitle ?? 'this document'}. Question: ${question}`,
            },
          ],
        },
      ],
    });

    const answer = response.text || 'Maaf, saya tidak dapat memproses permintaan tersebut.';
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghubungi Gemini. Coba lagi nanti.' },
      { status: 502 },
    );
  }
}