import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not configured',
        configured: false,
      }, { status: 503 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to create Supabase client',
        configured: true,
        connected: false,
      }, { status: 503 });
    }

    // Test basic connectivity by querying a non-existent table
    // A "relation does not exist" error confirms we're authenticated and connected
    const { error } = await supabase.from('_health_check_test').select('*').limit(1);

    // Expected errors that confirm we're connected:
    // 42P01: PostgreSQL "relation does not exist"
    // PGRST205: PostgREST "table not found in schema cache"
    if (error?.code === '42P01' || error?.code === 'PGRST205' || error?.message?.includes('does not exist')) {
      return NextResponse.json({
        status: 'ok',
        message: 'Supabase connected and authenticated',
        configured: true,
        connected: true,
        projectId: process.env.SUPABASE_PROJECT_ID || 'unknown',
        projectUrl: process.env.SUPABASE_URL,
        timestamp: new Date().toISOString(),
      });
    }

    // If no error, somehow the test table exists - still means connected
    if (!error) {
      return NextResponse.json({
        status: 'ok',
        message: 'Supabase connected successfully',
        configured: true,
        connected: true,
        projectId: process.env.SUPABASE_PROJECT_ID || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }

    // Other errors indicate connection/auth issues
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      configured: true,
      connected: false,
    }, { status: 503 });

  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
      configured: isSupabaseConfigured(),
      connected: false,
    }, { status: 500 });
  }
}
