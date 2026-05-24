'use client';

import { useState, useMemo } from 'react';
import { useCamera } from '@/context/CameraContext';
import { LocationCard } from '@/components/dashboard/LocationCard';
import { LocationModal } from '@/components/dashboard/LocationModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { Button } from '@/components/ui/button';
import { Plus, Search, X, MapPin } from 'lucide-react';

export default function LocationsPage() {
  const { locations, addLocation, updateLocation, deleteLocation } = useCamera();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return locations;
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(q) ||
        location.address.toLowerCase().includes(q) ||
        location.type.toLowerCase().includes(q),
    );
  }, [locations, searchQuery]);

  const handleAddLocation = (data: any) => {
    if (editingLocation) {
      updateLocation(editingLocation.id, data);
      setEditingLocation(null);
    } else {
      addLocation(data);
    }
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    setLocationModalOpen(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    setDeletingLocationId(locationId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingLocationId) {
      deleteLocation(deletingLocationId);
      setDeletingLocationId(null);
    }
  };

  const deletingLocation = locations.find((loc) => loc.id === deletingLocationId);

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Joylashuvlar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring nuqtalarini yarating va boshqaring.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLocation(null);
            setLocationModalOpen(true);
          }}
          className="h-10 self-start bg-brand-600 px-4 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Joylashuv qo'shish
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Nomi, manzili yoki turi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-10 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Tozalash"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Locations grid */}
      {filteredLocations.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={() => handleEditLocation(location)}
              onDelete={() => handleDeleteLocation(location.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-base font-medium">
            {searchQuery ? 'Joylashuv topilmadi' : 'Hozircha joylashuv yo\'q'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Qidiruv shartlarini o'zgartirib ko'ring"
              : 'Birinchi joylashuvingizni qo\'shing'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => {
                setEditingLocation(null);
                setLocationModalOpen(true);
              }}
              className="mt-5 bg-brand-600 text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Joylashuv qo'shish
            </Button>
          )}
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        open={locationModalOpen}
        onOpenChange={(open) => {
          setLocationModalOpen(open);
          if (!open) setEditingLocation(null);
        }}
        onSubmit={handleAddLocation}
        initialData={editingLocation}
        title={editingLocation ? 'Joylashuvni tahrirlash' : "Yangi joylashuv qo'shish"}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Joylashuvni o'chirish?"
        description="Bu joylashuv va unga tegishli barcha kameralar o'chiriladi. Bu amalni qaytarib bo'lmaydi."
        itemName={deletingLocation?.name}
      />
    </div>
  );
}
