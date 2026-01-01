import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  lng: z.coerce.number(),
  lat: z.coerce.number(),
  contours_minutes: z.string().default('5,10,15'),
  profile: z.enum(['walking', 'cycling', 'driving']).default('walking'),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { lng, lat, contours_minutes, profile } = querySchema.parse(params);

    const secretToken = process.env.MAPBOX_SECRET_TOKEN;
    if (!secretToken) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing Mapbox secret token' },
        { status: 500 }
      );
    }

    const url = new URL(
      `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}`
    );
    url.searchParams.set('contours_minutes', contours_minutes);
    url.searchParams.set('polygons', 'true');
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
    console.error('Isochrone API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
