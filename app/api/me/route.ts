import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, name, email, role, status, angkatan, jurusan')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ profile: null }, { status: 404 });
  }

  return NextResponse.json({ profile });
}