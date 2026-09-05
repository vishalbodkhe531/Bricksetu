import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ensureAdminUserSeeded } from '@/lib/auth/seed-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Auto-ensure admin user is provisioned & password synced before sign-in
    await ensureAdminUserSeeded();

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (error: any) {
    console.error('[LOGIN API ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
