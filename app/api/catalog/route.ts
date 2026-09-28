import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile';
import { fetchCatalog } from '@/lib/data/catalog';

export const dynamic = 'force-dynamic';

// Metadata (title, description, premium flag) is public on purpose: locked
// documents are shown as a teaser. Access to the FILE itself is a separate
// endpoint with its own check (step 6d). Archived documents are admin-only.
export async function GET() {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === 'admin';

  try {
    const catalog = await fetchCatalog(isAdmin);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Failed to load catalog:', error);
    return NextResponse.json({ error: 'Failed to load catalog.' }, { status: 500 });
  }
}