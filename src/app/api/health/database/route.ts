import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not configured',
      }, { status: 503 });
    }

    // Test querying the MapJitsu tables
    const tables = ['locations', 'safety_scores', 'vibe_scores'];
    const results: Record<string, { exists: boolean; count: number | null; error?: string }> = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results[table] = { exists: false, count: null, error: error.message };
      } else {
        results[table] = { exists: true, count: count ?? 0 };
      }
    }

    const allTablesExist = Object.values(results).every(r => r.exists);

    return NextResponse.json({
      status: allTablesExist ? 'ok' : 'partial',
      message: allTablesExist
        ? 'All MapJitsu tables exist and are accessible'
        : 'Some tables are missing or inaccessible',
      tables: results,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Database check failed',
    }, { status: 500 });
  }
}
