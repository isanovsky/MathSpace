import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const jurusan = typeof body?.jurusan === 'string' ? body.jurusan.trim() : '';
  const angkatan = typeof body?.angkatan === 'string' ? body.angkatan.trim() : '';

  if (!name || !jurusan || !angkatan) {
    return NextResponse.json(
      { error: 'name, jurusan, and angkatan are required.' },
      { status: 400 },
    );
  }

  // Deliberately not accepting role/status/email here — those change through
  // admin approval or auth flows, never through a user editing their own form.
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .update({ name, jurusan, angkatan })
    .eq('id', user.id)
    .select('id, name, email, role, status, angkatan, jurusan')
    .single();

  if (error || !profile) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }

  return NextResponse.json({ profile });
}