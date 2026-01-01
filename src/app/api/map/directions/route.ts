import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  origin: z.object({ lng: z.number(), lat: z.number() }),
  destination: z.object({ lng: z.number(), lat: z.number() }),
  profile: z.enum(['driving', 'walking', 'cycling']).default('driving'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, profile } = requestSchema.parse(body);

    const secretToken = process.env.MAPBOX_SECRET_TOKEN;
    if (!secretToken) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing Mapbox secret token' },
        { status: 500 }
      );
    }

    const url = new URL(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
    );
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('steps', 'true');
    url.searchParams.set('annotations', 'congestion,duration');
    url.searchParams.set('access_token', secretToken);

    const response = await fetch(url.toString());
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
