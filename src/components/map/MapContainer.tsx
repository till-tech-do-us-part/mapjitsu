'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '@/stores/mapStore';
import { useLighting } from '@/components/map/LightingController';
import { CameraController } from '@/components/map/CameraController';
import { SearchBox } from '@/components/map/SearchBox';
import { JitsuChat } from '@/components/ai/JitsuChat';
import { MAPJITSU_STYLE_URL } from '@/lib/mapbox/styles';

export function MapContainer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const {
    map,
    setMap,
    setLoaded,
    loaded,
    center,
    zoom,
    pitch,
    bearing,
    lightPreset
  } = useMapStore();

  // Apply lighting preset
  useLighting(map, lightPreset);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
      return;
    }

    mapboxgl.accessToken = token;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPJITSU_STYLE_URL,
      center: [center.lng, center.lat],
      zoom,
      pitch,
      bearing,
      antialias: true,
    });

    newMap.on('load', () => {
      // Configure Standard Style for night mode
      newMap.setConfigProperty('basemap', 'lightPreset', lightPreset);

      // Add 3D terrain
      newMap.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      newMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add fog for atmosphere
      newMap.setFog({
        color: 'rgb(15, 23, 42)',
        'high-color': 'rgb(30, 41, 59)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(2, 6, 23)',
        'star-intensity': 0.6,
      });

      setLoaded(true);
    });

    mapRef.current = newMap;
    setMap(newMap);

    return () => {
      newMap.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div
        ref={mapContainerRef}
        data-testid="map-container"
        data-loaded={loaded}
        className="w-full h-full"
      />
      {loaded && <SearchBox />}
      {loaded && <CameraController />}
      {loaded && <JitsuChat />}
    </div>
  );
}
