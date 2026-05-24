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
import { Location } from '@/lib/mockData';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Location, 'id' | 'cameras' | 'createdAt'>) => void;
  initialData?: Location;
  title?: string;
}

export function LocationModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title = 'Add Location'
}: LocationModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || '',
    address: initialData?.address || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Location name is required';
    if (!formData.type.trim()) newErrors.type = 'Location type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({ name: '', description: '', type: '', address: '' });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">{title}</DialogTitle>
          <DialogDescription className="text-neutral-600">
            {initialData ? 'Update location details' : 'Add a new location to monitor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Location Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., To'y Xona (Wedding Hall)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Location Type *
            </label>
            <Input
              type="text"
              placeholder="e.g., Wedding Hall, Hotel, Office"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
            />
            {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Address *
            </label>
            <Input
              type="text"
              placeholder="e.g., Samarkand, Uzbekistan"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-500"
            />
            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Optional description about this location"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-500 text-sm"
              rows={3}
            />
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
              {initialData ? 'Update' : 'Add'} Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
