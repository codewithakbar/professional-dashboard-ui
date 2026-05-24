'use client';

import Link from 'next/link';
import { Location } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { MapPin, Video, Edit2, Trash2, ArrowRight, Wifi } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const onlineCameras = location.cameras.filter((c) => c.status !== 'offline').length;
  const total = location.cameras.length;
  const onlinePct = total > 0 ? Math.round((onlineCameras / total) * 100) : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Top gradient strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-sky-500 opacity-80" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                {location.name}
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {location.address}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {location.type}
          </span>
        </div>

        {location.description && (
          <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
            {location.description}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <Video className="h-3 w-3" />
              Jami
            </div>
            <p className="mt-1 text-lg font-semibold num">{total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
              <Wifi className="h-3 w-3" />
              Online
            </div>
            <p className="mt-1 text-lg font-semibold text-emerald-600 num">
              {onlineCameras}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Sog'lik
            </div>
            <p className="mt-1 text-lg font-semibold num">{onlinePct}%</p>
          </div>
        </div>

        {/* Health bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              onlinePct >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : onlinePct >= 50
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-orange-400'
            }`}
            style={{ width: `${onlinePct}%` }}
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <Link href={`/dashboard/locations/${location.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full justify-between border-border text-foreground hover:bg-accent group-hover:border-brand-300 group-hover:text-brand-700"
            >
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4" />
                Kameralarni ko'rish
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>

          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              aria-label="Tahrirlash"
              className="border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              aria-label="O'chirish"
              className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
