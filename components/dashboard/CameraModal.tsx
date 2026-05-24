'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera } from '@/lib/mockData';

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Camera, 'id' | 'createdAt'>) => void;
  initialData?: Camera;
  title?: string;
}

export function CameraModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title = 'Add Camera'
}: CameraModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    streamUrl: initialData?.streamUrl || '',
    resolution: initialData?.resolution || '1080p',
    status: initialData?.status || 'online' as const,
    locationId: initialData?.locationId || '',
    lastRecording: initialData?.lastRecording || new Date(),
    snapshotAvailable: initialData?.snapshotAvailable || true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizeStreamUrl = (url: string) =>
    url.trim().replace(/&amp;/gi, '&');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const streamUrl = normalizeStreamUrl(formData.streamUrl);

    if (!formData.name.trim()) newErrors.name = 'Camera name is required';
    if (!streamUrl) newErrors.streamUrl = 'Stream URL is required';
    else if (!/^https?:\/\//i.test(streamUrl)) {
      newErrors.streamUrl = 'URL http:// yoki https:// bilan boshlanishi kerak';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...formData, streamUrl });
    setFormData({
      name: '',
      streamUrl: '',
      resolution: '1080p',
      status: 'online',
      locationId: '',
      lastRecording: new Date(),
      snapshotAvailable: true
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">{title}</DialogTitle>
          <DialogDescription className="text-neutral-600">
            {initialData ? 'Update camera settings' : 'Add a new camera to location'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Camera Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., Main Stage Camera"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Stream URL *
            </label>
            <Input
              type="url"
              placeholder="http://IP:port/snap.jpg?JpegSize=M&JpegCam=1&r=1"
              value={formData.streamUrl}
              onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-500 font-mono text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              IP kamera:{' '}
              <code className="bg-neutral-100 px-1 rounded text-[11px]">
                .../snap.jpg?JpegSize=M&amp;JpegCam=1&amp;r=1
              </code>{' '}
              yoki{' '}
              <code className="bg-neutral-100 px-1 rounded text-[11px]">
                .../cgi-bin/camera?resolution=640
              </code>
              . EarthCam ham qo‘llab-quvvatlanadi.
            </p>
            {errors.streamUrl && <p className="text-red-600 text-xs mt-1">{errors.streamUrl}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Resolution
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 text-sm"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 text-sm"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="recording">Recording</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="snapshot"
              checked={formData.snapshotAvailable}
              onChange={(e) => setFormData({ ...formData, snapshotAvailable: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-blue-600"
            />
            <label htmlFor="snapshot" className="text-sm font-medium text-neutral-700">
              Snapshot Available
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {initialData ? 'Update' : 'Add'} Camera
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
