'use client';

import { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';

export type LightPreset = 'dawn' | 'day' | 'dusk' | 'night';

export function getLightPreset(hour: number): LightPreset {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function useLighting(map: mapboxgl.Map | null, override?: LightPreset) {
  useEffect(() => {
    if (!map) return;

    const preset = override ?? getLightPreset(new Date().getHours());

    try {
      map.setConfigProperty('basemap', 'lightPreset', preset);
    } catch (error) {
      // Style may not be fully loaded yet
      console.debug('Could not set light preset:', error);
    }
  }, [map, override]);
}
