'use client';

import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-cyber-bg flex items-center justify-center">
        <div className="text-neon-blue animate-pulse">Loading MapJitsu...</div>
      </div>
    ),
  }
);

export default function Home() {
  return <MapContainer />;
}
