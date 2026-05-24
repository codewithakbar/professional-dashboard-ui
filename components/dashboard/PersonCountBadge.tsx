'use client';

import { Users, Sparkles } from 'lucide-react';
import { useCameraDetection } from '@/hooks/useCameraDetection';
import type { CameraDetectionStats } from '@/lib/api';

interface PersonCountBadgeProps {
  cameraId: string | number;
  token: string | null;
  enabled?: boolean;
  aiEnabled?: boolean;
  variant?: 'overlay' | 'inline';
  stats?: CameraDetectionStats | null;
}

export function PersonCountBadge({
  cameraId,
  token,
  enabled = true,
  aiEnabled: aiEnabledProp,
  variant = 'overlay',
  stats: statsProp,
}: PersonCountBadgeProps) {
  const { stats: polled } = useCameraDetection(
    cameraId,
    token,
    enabled && !statsProp,
  );
  const stats = statsProp ?? polled;

  const count = stats?.person_count ?? 0;
  const aiOn = aiEnabledProp ?? stats?.ai_enabled !== false;
  const active = aiOn && stats?.ai_active;

  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
          aiOn
            ? 'bg-violet-50 border-violet-200'
            : 'bg-neutral-50 border-neutral-200'
        }`}
      >
        <Sparkles className={`h-4 w-4 ${aiOn ? 'text-violet-600' : 'text-neutral-400'}`} />
        <div>
          <p className={`text-xs font-medium ${aiOn ? 'text-violet-600' : 'text-neutral-500'}`}>
            AI (YOLOv8s)
          </p>
          <p className={`text-lg font-bold tabular-nums ${aiOn ? 'text-violet-900' : 'text-neutral-500'}`}>
            {!aiOn ? "O'chiq" : active ? count : '—'}{' '}
            {aiOn && (
              <span className="text-sm font-normal text-violet-700">inson</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
        !aiOn
          ? 'bg-neutral-800/90 text-neutral-400'
          : active
            ? 'bg-violet-600 text-white'
            : 'bg-neutral-700/80 text-neutral-300'
      }`}
    >
      <Users className="h-4 w-4" />
      <span className="tabular-nums">
        {!aiOn ? "AI o'chiq" : active ? count : '…'}
      </span>
      {aiOn && <span className="text-xs font-normal opacity-90">inson</span>}
    </div>
  );
}
