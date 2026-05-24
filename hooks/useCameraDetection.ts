'use client';

import { useEffect, useState } from 'react';
import { cameraDetectionUrl, type CameraDetectionStats } from '@/lib/api';

export function useCameraDetection(
  cameraId: string | number,
  token: string | null,
  enabled = true,
  intervalMs = 2500,
) {
  const [stats, setStats] = useState<CameraDetectionStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !token) {
      setStats(null);
      return;
    }

    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(cameraDetectionUrl(cameraId, token));
        if (!res.ok) return;
        const data: CameraDetectionStats = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        /* ignore polling errors */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [cameraId, token, enabled, intervalMs]);

  return { stats, loading };
}
