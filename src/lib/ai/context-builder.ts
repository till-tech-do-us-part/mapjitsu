interface LocationContext {
  coordinates: { lat: number; lng: number };
  neighborhood: string | null;
  city: string | null;
  timeContext: 'morning' | 'afternoon' | 'evening' | 'night';
}

function getTimeContext(): LocationContext['timeContext'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export async function buildContext(lat: number, lng: number): Promise<LocationContext> {
  const token = process.env.MAPBOX_SECRET_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return {
      coordinates: { lat, lng },
      neighborhood: null,
      city: null,
      timeContext: getTimeContext(),
    };
  }

  // Reverse geocode to get location info
  const geocodeUrl = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + `${lng},${lat}.json`);
  geocodeUrl.searchParams.set('access_token', token);
  geocodeUrl.searchParams.set('types', 'neighborhood,place');

  try {
    const response = await fetch(geocodeUrl.toString());
    const data = await response.json();

    const features = data.features || [];
    const neighborhood = features.find((f: { place_type: string[]; text: string }) =>
      f.place_type.includes('neighborhood'))?.text || null;
    const city = features.find((f: { place_type: string[]; text: string }) =>
      f.place_type.includes('place'))?.text || null;

    return {
      coordinates: { lat, lng },
      neighborhood,
      city,
      timeContext: getTimeContext(),
    };
  } catch {
    return {
      coordinates: { lat, lng },
      neighborhood: null,
      city: null,
      timeContext: getTimeContext(),
    };
  }
}

export { type LocationContext };
