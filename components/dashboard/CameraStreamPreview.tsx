'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import { cameraStreamUrl } from '@/lib/api';
import type { Camera } from '@/lib/mockData';

interface CameraStreamPreviewProps {
  cameraId: string | number;
  cameraName: string;
  status: Camera['status'];
  /** Only connect when the card is near the viewport */
  lazy?: boolean;
  refreshKey?: number;
}

export function CameraStreamPreview({
  cameraId,
  cameraName,
  status,
  lazy = true,
  refreshKey = 0,
}: CameraStreamPreviewProps) {
  const [token, setToken] = useState<string | null>(null);
  const [hasFrame, setHasFrame] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem('auth-token'));
  }, []);

  useEffect(() => {
    setHasFrame(false);
    setStreamError(false);
  }, [refreshKey, cameraId]);

  useEffect(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy]);

  const shouldStream = inView && Boolean(token) && status !== 'offline';

  return (
    <div ref={containerRef} className="absolute inset-0">
      {shouldStream && (
        <img
          key={`${cameraId}-${refreshKey}`}
          src={cameraStreamUrl(cameraId, token!)}
          alt={cameraName}
          className="absolute inset-0 z-10 h-full w-full object-cover"
          onLoad={() => {
            setHasFrame(true);
            setStreamError(false);
          }}
          onError={() => {
            setHasFrame(false);
            setStreamError(true);
          }}
        />
      )}

      {(!hasFrame || streamError || !shouldStream) && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
          <CameraIcon className="h-12 w-12 text-neutral-500 opacity-25" />
          {streamError && (
            <p className="mt-2 text-[10px] text-neutral-500">Preview ulanmadi</p>
          )}
        </div>
      )}
    </div>
  );
}
