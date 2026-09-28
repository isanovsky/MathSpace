import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { fetchDocumentById } from '@/lib/data/catalog';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Postgres rejects a malformed uuid with an error; answer 404 instead.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const profile = await getCurrentProfile();

  try {
    const document = await fetchDocumentById(id, profile);
    if (!document) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ document });
  } catch (error) {
    console.error('Failed to load document:', error);
    return NextResponse.json({ error: 'Failed to load document.' }, { status: 500 });
  }
}
