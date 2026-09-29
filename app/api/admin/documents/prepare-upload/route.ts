import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Step 1 of upload: server only hands out permission to upload one specific
// file, it never receives the file bytes itself. The actual PDF goes browser
// -> Supabase Storage directly (see uploadToSignedUrl on the client), which
// is what keeps this off Vercel's ~4.5MB serverless request body limit.
export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const id = randomUUID();
  const path = `${id}.pdf`;

  const { data, error } = await auth.admin.storage
    .from('documents')
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('Failed to create signed upload URL:', error);
    return NextResponse.json({ error: 'Gagal menyiapkan upload.' }, { status: 500 });
  }

  return NextResponse.json({ id, path, token: data.token });
}
