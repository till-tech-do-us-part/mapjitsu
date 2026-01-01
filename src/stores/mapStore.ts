import { create } from 'zustand';
import type mapboxgl from 'mapbox-gl';
import type { LightPreset } from '@/components/map/LightingController';

interface MapState {
  map: mapboxgl.Map | null;
  center: { lng: number; lat: number };
  zoom: number;
  pitch: number;
  bearing: number;
  lightPreset: LightPreset;
  loaded: boolean;

  setMap: (map: mapboxgl.Map | null) => void;
  setCenter: (center: { lng: number; lat: number }) => void;
  setZoom: (zoom: number) => void;
  setPitch: (pitch: number) => void;
  setBearing: (bearing: number) => void;
  setLightPreset: (preset: LightPreset) => void;
  setLoaded: (loaded: boolean) => void;
  flyTo: (coords: [number, number], zoom?: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  map: null,
  center: { lng: -122.4194, lat: 37.7749 },
  zoom: 14,
  pitch: 45,
  bearing: -17.6,
  lightPreset: 'night',
  loaded: false,

  setMap: (map) => set({ map }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setPitch: (pitch) => set({ pitch }),
  setBearing: (bearing) => set({ bearing }),
  setLightPreset: (preset) => set({ lightPreset: preset }),
  setLoaded: (loaded) => set({ loaded }),

  flyTo: (coords, zoom) => {
    const { map } = get();
    if (!map) return;
    map.flyTo({
      center: coords,
      zoom: zoom ?? get().zoom,
      essential: true,
    });
    set({ center: { lng: coords[0], lat: coords[1] } });
  },
}));
