'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, Camera } from '@/lib/mockData';
import { useAuth } from './AuthContext';

interface CameraContextType {
  locations: Location[];
  cameras: Camera[];
  addLocation: (location: Omit<Location, 'id' | 'cameras' | 'createdAt'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  addCamera: (locationId: string, camera: Omit<Camera, 'id' | 'createdAt'>) => Promise<void>;
  updateCamera: (id: string, updates: Partial<Camera>) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
  getLocationById: (id: string) => Location | undefined;
  getCameraById: (id: string) => Camera | undefined;
  getCamerasByLocation: (locationId: string) => Camera[];
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const { isAuthenticated } = useAuth();

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth-token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/locations/', {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        // Parse dates in the incoming data
        const parsedLocations = data.map((loc: any) => ({
          ...loc,
          id: loc.id.toString(),
          createdAt: new Date(loc.createdAt),
          cameras: loc.cameras.map((cam: any) => ({
            ...cam,
            id: cam.id.toString(),
            locationId: cam.locationId.toString(),
            aiDetectionEnabled: cam.aiDetectionEnabled ?? true,
            lastRecording: new Date(cam.lastRecording),
            createdAt: new Date(cam.createdAt)
          }))
        }));
        setLocations(parsedLocations);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  // Load locations on auth status change
  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    } else {
      setLocations([]);
      setCameras([]);
    }
  }, [isAuthenticated]);

  // Sync cameras state when locations updates
  useEffect(() => {
    const allCameras = locations.flatMap(loc => loc.cameras);
    setCameras(allCameras);
  }, [locations]);

  const addLocation = async (locationData: Omit<Location, 'id' | 'cameras' | 'createdAt'>) => {
    try {
      const response = await fetch('http://localhost:8000/api/locations/', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(locationData),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/locations/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/locations/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const addCamera = async (locationId: string, cameraData: Omit<Camera, 'id' | 'createdAt'>) => {
    try {
      const body = {
        name: cameraData.name,
        locationId: parseInt(locationId),
        streamUrl: cameraData.streamUrl,
        resolution: cameraData.resolution,
        status: cameraData.status,
        snapshotAvailable: cameraData.snapshotAvailable
      };
      
      const response = await fetch('http://localhost:8000/api/cameras/', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to add camera:', error);
    }
  };

  const updateCamera = async (id: string, updates: Partial<Camera>) => {
    try {
      const body: any = { ...updates };
      if (updates.locationId) {
        body.locationId = parseInt(updates.locationId);
      }
      if (updates.streamUrl) {
        body.streamUrl = updates.streamUrl;
      }
      if (updates.snapshotAvailable !== undefined) {
        body.snapshotAvailable = updates.snapshotAvailable;
      }
      if (updates.aiDetectionEnabled !== undefined) {
        body.aiDetectionEnabled = updates.aiDetectionEnabled;
      }

      const response = await fetch(`http://localhost:8000/api/cameras/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to update camera:', error);
    }
  };

  const deleteCamera = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Failed to delete camera:', error);
    }
  };

  const getLocationById = (id: string): Location | undefined => {
    return locations.find(loc => loc.id.toString() === id.toString());
  };

  const getCameraById = (id: string): Camera | undefined => {
    return cameras.find(cam => cam.id.toString() === id.toString());
  };

  const getCamerasByLocation = (locationId: string): Camera[] => {
    const location = getLocationById(locationId);
    return location?.cameras || [];
  };

  return (
    <CameraContext.Provider
      value={{
        locations,
        cameras,
        addLocation,
        updateLocation,
        deleteLocation,
        addCamera,
        updateCamera,
        deleteCamera,
        getLocationById,
        getCameraById,
        getCamerasByLocation
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCamera() {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within CameraProvider');
  }
  return context;
}
