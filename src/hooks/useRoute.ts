import { useState, useCallback } from 'react';
import { useMapStore } from '@/stores/mapStore';
import type mapboxgl from 'mapbox-gl';

interface RoutePoint {
  lng: number;
  lat: number;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface RouteData {
  geometry: GeoJSON.LineString;
  duration: number;
  distance: number;
  steps: RouteStep[];
}

const CONGESTION_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  heavy: '#ef4444',
  severe: '#7f1d1d',
  unknown: '#3b82f6',
};

export function useRoute() {
  const { map } = useMapStore();
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async (origin: RoutePoint, destination: RoutePoint) => {
    if (!map) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/map/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        setRoute({
          geometry: routeData.geometry,
          duration: routeData.duration,
          distance: routeData.distance,
          steps: routeData.legs[0].steps.map((step: { maneuver: { instruction: string }; distance: number; duration: number }) => ({
            instruction: step.maneuver.instruction,
            distance: step.distance,
            duration: step.duration,
          })),
        });

        // Add route layer to map
        if (map.getSource('route')) {
          (map.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: routeData.geometry,
          });
        } else {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeData.geometry,
            },
          });

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 6,
              'line-opacity': 0.8,
            },
          });
        }
      }
    } catch (err) {
      setError('Failed to fetch route');
      console.error('Route fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [map]);

  const clearRoute = useCallback(() => {
    if (map) {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getSource('route')) map.removeSource('route');
    }
    setRoute(null);
  }, [map]);

  return { route, loading, error, fetchRoute, clearRoute, CONGESTION_COLORS };
}
