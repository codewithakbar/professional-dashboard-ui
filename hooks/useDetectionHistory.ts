'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  cameraDetectionHistoryUrl,
  type DetectionHistoryEntry,
} from '@/lib/api';

export function useDetectionHistory(
  cameraId: string | number,
  token: string | null,
  enabled = true,
  intervalMs = 15000,
) {
  const [entries, setEntries] = useState<DetectionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(cameraDetectionHistoryUrl(cameraId, token));
      if (!res.ok) return;
      const data = await res.json();
      const parsed: DetectionHistoryEntry[] = (data.results ?? []).map(
        (row: DetectionHistoryEntry & { recordedAt: string }) => ({
          ...row,
          id: String(row.id),
          recordedAt: row.recordedAt,
        }),
      );
      setEntries(parsed);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [cameraId, token]);

  useEffect(() => {
    if (!enabled || !token) {
      setEntries([]);
      return;
    }

    fetchHistory();
    const id = setInterval(fetchHistory, intervalMs);
    return () => clearInterval(id);
  }, [enabled, token, fetchHistory, intervalMs]);

  return { entries, loading, refresh: fetchHistory };
}
