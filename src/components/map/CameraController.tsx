'use client';

import { useCamera, type CameraModeKey } from '@/hooks/useCamera';

const MODE_LABELS: Record<CameraModeKey, string> = {
  driver: 'Driver',
  explorer: 'Explorer',
  overview: 'Overview',
};

export function CameraController() {
  const { setMode } = useCamera();

  return (
    <div
      data-testid="camera-controller"
      className="absolute top-4 right-4 flex flex-col gap-2 z-10"
    >
      {(Object.keys(MODE_LABELS) as CameraModeKey[]).map((mode) => (
        <button
          key={mode}
          data-testid={`camera-mode-${mode}`}
          onClick={() => setMode(mode)}
          className="px-4 py-2 bg-cyber-building/80 text-cyber-text rounded-lg
                     hover:bg-neon-blue/20 border border-neon-blue/30
                     transition-colors backdrop-blur-sm"
        >
          {MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );
}
