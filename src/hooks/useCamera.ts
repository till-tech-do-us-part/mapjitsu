import { useCallback } from 'react';
import { useMapStore } from '@/stores/mapStore';

export interface CameraMode {
  pitch: number;
  bearing: number;
  zoom: number;
  followUser: boolean;
}

export const CAMERA_MODES = {
  driver: { pitch: 60, bearing: 0, zoom: 17, followUser: true },
  explorer: { pitch: 45, bearing: 0, zoom: 15, followUser: false },
  overview: { pitch: 0, bearing: 0, zoom: 12, followUser: false },
} as const;

export type CameraModeKey = keyof typeof CAMERA_MODES;

export function useCamera() {
  const { map, setPitch, setBearing, setZoom } = useMapStore();

  const setMode = useCallback((mode: CameraModeKey) => {
    if (!map) return;

    const config = CAMERA_MODES[mode];

    map.easeTo({
      pitch: config.pitch,
      bearing: config.bearing,
      zoom: config.zoom,
      duration: 1000,
    });

    setPitch(config.pitch);
    setBearing(config.bearing);
    setZoom(config.zoom);
  }, [map, setPitch, setBearing, setZoom]);

  return { setMode, modes: CAMERA_MODES };
}
