import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// Database schema for MapJitsu
const SCHEMA_SQL = `
-- Enable PostGIS extension (may already exist)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  neighborhood TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety scores
CREATE TABLE IF NOT EXISTS safety_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  source TEXT NOT NULL,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibe scores
CREATE TABLE IF NOT EXISTS vibe_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  peak_hours INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_safety_scores_location ON safety_scores(location_id);
CREATE INDEX IF NOT EXISTS idx_vibe_scores_location ON vibe_scores(location_id);
`;

export async function POST(req: NextRequest) {
  try {
    // Simple auth check - require admin secret in header
    const authHeader = req.headers.get('x-admin-secret');
    const expectedSecret = process.env.TOKEN_SECRET;

    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - invalid admin secret',
      }, { status: 401 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase not configured',
      }, { status: 503 });
    }

    // Execute schema migration via SQL
    const { error } = await supabase.rpc('exec_sql', { query: SCHEMA_SQL });

    if (error) {
      // If RPC doesn't exist, we need to apply via Supabase dashboard or CLI
      return NextResponse.json({
        status: 'warning',
        message: 'Cannot run raw SQL via API. Please apply schema via Supabase Dashboard SQL Editor.',
        schema: SCHEMA_SQL,
        instructions: [
          '1. Go to https://supabase.com/dashboard/project/ofeyoffntuyoepevdanv/sql',
          '2. Paste the schema SQL below into the editor',
          '3. Click "Run" to execute',
        ],
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Schema migration completed successfully',
    });

  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Migration failed',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: 'Use POST with x-admin-secret header to run migration',
    schema_preview: SCHEMA_SQL.slice(0, 200) + '...',
  });
}
