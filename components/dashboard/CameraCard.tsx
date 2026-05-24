'use client';

import Link from 'next/link';
import { Camera } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { CameraStreamPreview } from './CameraStreamPreview';
import { Camera as CameraIcon, Clock, ChevronRight, Maximize2 } from 'lucide-react';

interface CameraCardProps {
  camera: Camera;
}

export function CameraCard({ camera }: CameraCardProps) {
  return (
    <Link
      href={`/dashboard/camera/${camera.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:shadow-xl">
        {/* Live preview */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          <CameraStreamPreview
            cameraId={camera.id}
            cameraName={camera.name}
            status={camera.status}
            lazy
          />

          {/* Subtle vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Status */}
          <div className="absolute right-3 top-3 z-10">
            <StatusBadge status={camera.status} />
          </div>

          {/* REC */}
          {camera.status === 'recording' && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-rose-600/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-200 opacity-90" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-200" />
              </span>
              REC
            </div>
          )}

          {/* Corner brackets */}
          <div className="pointer-events-none absolute inset-3 opacity-60">
            <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-brand-300/70 rounded-tl" />
            <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-brand-300/70 rounded-tr" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-brand-300/70 rounded-bl" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-brand-300/70 rounded-br" />
          </div>

          {/* Bottom row */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between">
            <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[11px] text-white/90 backdrop-blur">
              {camera.resolution}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-brand-600/90 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" />
              Ochish
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700">
                {camera.name}
              </h3>
              <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                {camera.streamUrl}
              </p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="num">{camera.lastRecording.toLocaleTimeString()}</span>
            </span>
            {camera.snapshotAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                <CameraIcon className="h-3 w-3" />
                Snapshot
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
