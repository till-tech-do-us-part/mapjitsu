import { useState, useCallback } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface VibeCheckResult {
  response: string;
  context: {
    neighborhood: string | null;
    city: string | null;
    timeContext: string;
  };
}

export function useVibeCheck() {
  const { center } = useMapStore();
  const [result, setResult] = useState<VibeCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkVibe = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: center.lat,
          lng: center.lng,
          query,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to get vibe check');
    } finally {
      setLoading(false);
    }
  }, [center]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, checkVibe, clearResult };
}
