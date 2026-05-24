'use client';

import { useState, useMemo } from 'react';
import { useCamera } from '@/context/CameraContext';
import { CameraCard } from '@/components/dashboard/CameraCard';
import { Button } from '@/components/ui/button';
import { LocationModal } from '@/components/dashboard/LocationModal';
import {
  Plus,
  Search,
  X,
  MapPin,
  Video,
  Wifi,
  Radio,
  ArrowUpRight,
  LayoutGrid,
} from 'lucide-react';

const STATS_META = [
  {
    key: 'locations',
    label: 'Joylashuvlar',
    icon: MapPin,
    accent: 'from-brand-500/15 to-indigo-500/5',
    iconBg: 'bg-brand-100 text-brand-700',
    valueColor: 'text-foreground',
    hint: "Faol monitoring nuqtalari",
  },
  {
    key: 'total',
    label: 'Jami kameralar',
    icon: Video,
    accent: 'from-violet-500/15 to-purple-500/5',
    iconBg: 'bg-violet-100 text-violet-700',
    valueColor: 'text-foreground',
    hint: 'Tizimga ulangan',
  },
  {
    key: 'online',
    label: 'Online',
    icon: Wifi,
    accent: 'from-emerald-500/15 to-teal-500/5',
    iconBg: 'bg-emerald-100 text-emerald-700',
    valueColor: 'text-emerald-600',
    hint: 'Live oqim mavjud',
  },
  {
    key: 'recording',
    label: 'Yozilmoqda',
    icon: Radio,
    accent: 'from-amber-500/15 to-orange-500/5',
    iconBg: 'bg-amber-100 text-amber-700',
    valueColor: 'text-amber-600',
    hint: 'Faol yozuv jarayoni',
  },
] as const;

export default function DashboardPage() {
  const { locations, cameras, addLocation } = useCamera();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter((c) => c.status !== 'offline').length;
  const recordingCameras = cameras.filter((c) => c.status === 'recording').length;
  const offlineCameras = totalCameras - onlineCameras;
  const uptimePct = totalCameras ? Math.round((onlineCameras / totalCameras) * 100) : 0;

  const statsValues: Record<string, number> = {
    locations: locations.length,
    total: totalCameras,
    online: onlineCameras,
    recording: recordingCameras,
  };

  const filteredCameras = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cameras;
    return cameras.filter(
      (camera) =>
        camera.name.toLowerCase().includes(q) ||
        camera.streamUrl.toLowerCase().includes(q),
    );
  }, [cameras, searchQuery]);

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="num">{uptimePct}%</span> uptime · {totalCameras} kamera
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Boshqaruv paneli
          </h1>
          <p className="text-sm text-muted-foreground">
            Barcha joylashuv va kameralarning umumiy ko'rinishi.
          </p>
        </div>

        <Button
          onClick={() => setLocationModalOpen(true)}
          className="h-10 self-start bg-brand-600 px-4 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Joylashuv qo'shish
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_META.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="relative mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className={`mt-1 text-3xl font-semibold tracking-tight num ${s.valueColor}`}>
                  {statsValues[s.key]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* System health row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Tarmoq holati</p>
            <span className="text-xs text-muted-foreground num">{uptimePct}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${uptimePct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online{' '}
              <span className="num font-medium text-foreground">{onlineCameras}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Offline{' '}
              <span className="num font-medium text-foreground">{offlineCameras}</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Yozish faolligi</p>
            <span className="text-xs text-muted-foreground">
              <span className="num font-medium text-foreground">{recordingCameras}</span> /{' '}
              {totalCameras} kamera
            </span>
          </div>
          <div className="mt-4 flex items-end gap-1">
            {Array.from({ length: 24 }).map((_, i) => {
              const seed = (i * 7 + 11) % 24;
              const h =
                20 +
                Math.round(
                  ((Math.sin(seed) + 1) / 2) * 70 * (recordingCameras / Math.max(totalCameras, 1) + 0.4),
                );
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-amber-500/30 to-amber-500/80"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* Search + cameras */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">
              Barcha kameralar{' '}
              <span className="text-muted-foreground num">
                ({filteredCameras.length})
              </span>
            </h2>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Kamera nomi yoki URL bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Tozalash"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredCameras.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-medium">Kameralar topilmadi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? "Qidiruv shartlarini o'zgartirib ko'ring"
                : "Boshlash uchun joylashuv qo'shing"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setLocationModalOpen(true)}
                className="mt-5 bg-brand-600 text-white hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Joylashuv qo'shish
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Location Modal */}
      <LocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        onSubmit={addLocation}
        title="Yangi joylashuv qo'shish"
      />
    </div>
  );
}
