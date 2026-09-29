import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessDocument } from '@/lib/data/access';

// Server-only: no NEXT_PUBLIC_ prefix, so this never reaches the browser bundle.
const apiKey = process.env.GEMINI_API_KEY;
const MAX_PDF_BYTES = 10 * 1024 * 1024; // matches the upload limit

export async function POST(request: NextRequest) {
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set on the server.');
    return NextResponse.json(
      { error: 'AI assistant is not configured.' },
      { status: 500 },
    );
  }

  let body: { question?: string; documentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  let documentTitle = 'dokumen ini';

  if (body.documentId) {
    const { data: doc } = await admin
      .from('documents')
      .select('title, is_premium, status, file_path')
      .eq('id', body.documentId)
      .maybeSingle();

    if (doc) {
      documentTitle = doc.title;

      // Re-check access on the server — never trust that the client only
      // calls this from a page it was actually allowed to open. Without
      // this, chat becomes a side channel to read premium documents.
      const profile = await getCurrentProfile();
      const isVisible = doc.status === 'aktif' || profile?.role === 'admin';
      if (!isVisible || !canAccessDocument(profile, doc.is_premium)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (doc.file_path) {
        const { data: fileBlob, error: downloadError } = await admin.storage
          .from('documents')
          .download(doc.file_path);

        if (downloadError || !fileBlob) {
          console.error('Failed to download PDF for chat:', downloadError);
        } else if (fileBlob.size > MAX_PDF_BYTES) {
          // Should not happen given the upload cap, but never trust stored
          // state blindly when it is about to be sent to a third-party API.
          console.error('Stored PDF exceeds expected size, skipping attachment.');
        } else {
          const base64 = Buffer.from(await fileBlob.arrayBuffer()).toString('base64');
          parts.push({ inlineData: { mimeType: 'application/pdf', data: base64 } });
        }
      }
    }
  }

  const hasFile = parts.length > 0;
  const instruction = hasFile
    ? `Context: You are a math assistant for MathSpace. The attached PDF is the document titled "${documentTitle}". Answer using its actual content. Question: ${question}`
    : `Context: You are a math assistant for MathSpace. No file is attached for the document "${documentTitle}" (it has not been uploaded by an admin yet), so answer generally and say you cannot see the file's content. Question: ${question}`;

  parts.push({ text: instruction });

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts }],
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
