'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCamera } from '@/context/CameraContext';
import { CameraCard } from '@/components/dashboard/CameraCard';
import { CameraModal } from '@/components/dashboard/CameraModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ArrowLeft,
  MapPin,
  Edit2,
  Trash2,
  Video,
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getLocationById, addCamera, updateCamera, deleteCamera } = useCamera();
  const locationId = params.id as string;

  const location = getLocationById(locationId);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [deletingCameraId, setDeletingCameraId] = useState<string | null>(null);

  if (!location) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="border-border text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-base font-medium">Joylashuv topilmadi</p>
        </div>
      </div>
    );
  }

  const handleAddCamera = (data: any) => {
    if (editingCamera) {
      updateCamera(editingCamera.id, data);
      setEditingCamera(null);
    } else {
      addCamera(locationId, data);
    }
  };

  const handleEditCamera = (camera: any) => {
    setEditingCamera(camera);
    setCameraModalOpen(true);
  };

  const handleDeleteCamera = (cameraId: string) => {
    setDeletingCameraId(cameraId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCameraId) {
      deleteCamera(deletingCameraId);
      setDeletingCameraId(null);
    }
  };

  const deletingCamera = location.cameras.find((cam) => cam.id === deletingCameraId);
  const onlineCameras = location.cameras.filter((c) => c.status !== 'offline').length;
  const offlineCameras = location.cameras.length - onlineCameras;
  const recordingCameras = location.cameras.filter((c) => c.status === 'recording').length;

  const stats = [
    {
      label: 'Jami',
      value: location.cameras.length,
      icon: Video,
      color: 'text-foreground',
      iconBg: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Online',
      value: onlineCameras,
      icon: Wifi,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Offline',
      value: offlineCameras,
      icon: WifiOff,
      color: 'text-rose-600',
      iconBg: 'bg-rose-50 text-rose-700',
    },
    {
      label: 'Yozilmoqda',
      value: recordingCameras,
      icon: Radio,
      color: 'text-amber-600',
      iconBg: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Back */}
      <Button
        onClick={() => router.back()}
        variant="outline"
        size="sm"
        className="border-border text-foreground hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Joylashuvlarga qaytish
      </Button>

      {/* Location header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 via-violet-500/5 to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {location.name}
                  </h1>
                  <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {location.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{location.address}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingCamera(null);
                setCameraModalOpen(true);
              }}
              className="self-start bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Kamera qo'shish
            </Button>
          </div>

          {location.description && (
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              {location.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.iconBg}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className={`mt-2 text-2xl font-semibold tracking-tight num ${s.color}`}>
                    {s.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cameras */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Kameralar{' '}
          <span className="text-muted-foreground num">({location.cameras.length})</span>
        </h2>

        {location.cameras.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {location.cameras.map((camera) => (
              <div key={camera.id} className="group/wrap relative">
                <CameraCard camera={camera} />
                {/* Action overlay */}
                <div className="absolute right-3 top-3 z-20 flex gap-1.5 opacity-0 transition-opacity group-hover/wrap:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditCamera(camera);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-md backdrop-blur-md transition-colors hover:bg-brand-600 hover:text-white"
                    aria-label="Tahrirlash"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteCamera(camera.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/95 text-rose-600 shadow-md backdrop-blur-md transition-colors hover:bg-rose-600 hover:text-white"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-base font-medium">Hozircha kameralar yo'q</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu joylashuvga birinchi kamerangizni qo'shing
            </p>
            <Button
              onClick={() => {
                setEditingCamera(null);
                setCameraModalOpen(true);
              }}
              className="mt-5 bg-brand-600 text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Kamera qo'shish
            </Button>
          </div>
        )}
      </section>

      {/* Camera modal */}
      <CameraModal
        open={cameraModalOpen}
        onOpenChange={(open) => {
          setCameraModalOpen(open);
          if (!open) setEditingCamera(null);
        }}
        onSubmit={handleAddCamera}
        initialData={editingCamera}
        title={editingCamera ? 'Kamerani tahrirlash' : "Yangi kamera qo'shish"}
      />

      {/* Delete confirmation */}
      <DeleteConfirmation
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Kamerani o'chirish?"
        description="Bu kamera joylashuvdan olib tashlanadi. Bu amalni qaytarib bo'lmaydi."
        itemName={deletingCamera?.name}
      />
    </div>
  );
}
