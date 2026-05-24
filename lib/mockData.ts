export interface Camera {
  id: string;
  name: string;
  locationId: string;
  streamUrl: string;
  resolution: string;
  status: 'online' | 'offline' | 'recording';
  lastRecording: Date;
  snapshotAvailable: boolean;
  aiDetectionEnabled?: boolean;
  createdAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: string;
  address: string;
  cameras: Camera[];
  createdAt: Date;
}

export const initialLocations: Location[] = [
  {
    id: '1',
    name: "To'y Xona (Wedding Hall)",
    description: 'Main wedding venue with multiple camera coverage',
    type: 'Wedding Hall',
    address: 'Samarkand, Uzbekistan',
    cameras: [
      {
        id: 'cam-1',
        name: 'Main Stage Camera',
        locationId: '1',
        streamUrl: 'https://example.com/stream/cam1',
        resolution: '1080p',
        status: 'online',
        lastRecording: new Date(Date.now() - 3600000),
        snapshotAvailable: true,
        createdAt: new Date(Date.now() - 86400000 * 7)
      },
      {
        id: 'cam-2',
        name: 'Entrance Camera',
        locationId: '1',
        streamUrl: 'https://example.com/stream/cam2',
        resolution: '720p',
        status: 'online',
        lastRecording: new Date(Date.now() - 1800000),
        snapshotAvailable: true,
        createdAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        id: 'cam-3',
        name: 'Reception Area',
        locationId: '1',
        streamUrl: 'https://example.com/stream/cam3',
        resolution: '1080p',
        status: 'recording',
        lastRecording: new Date(Date.now() - 300000),
        snapshotAvailable: true,
        createdAt: new Date(Date.now() - 86400000 * 3)
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 30)
  },
  {
    id: '2',
    name: 'Qo\'qon Hotel',
    description: 'Hotel security system',
    type: 'Hotel',
    address: 'Fergana, Uzbekistan',
    cameras: [
      {
        id: 'cam-4',
        name: 'Lobby Camera',
        locationId: '2',
        streamUrl: 'https://example.com/stream/cam4',
        resolution: '1080p',
        status: 'online',
        lastRecording: new Date(Date.now() - 7200000),
        snapshotAvailable: true,
        createdAt: new Date(Date.now() - 86400000 * 14)
      },
      {
        id: 'cam-5',
        name: 'Parking Area',
        locationId: '2',
        streamUrl: 'https://example.com/stream/cam5',
        resolution: '720p',
        status: 'offline',
        lastRecording: new Date(Date.now() - 86400000),
        snapshotAvailable: false,
        createdAt: new Date(Date.now() - 86400000 * 10)
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 60)
  },
  {
    id: '3',
    name: 'Tashkent Business Center',
    description: 'Modern office building',
    type: 'Office',
    address: 'Tashkent, Uzbekistan',
    cameras: [
      {
        id: 'cam-6',
        name: 'Main Entrance',
        locationId: '3',
        streamUrl: 'https://example.com/stream/cam6',
        resolution: '1080p',
        status: 'online',
        lastRecording: new Date(Date.now() - 600000),
        snapshotAvailable: true,
        createdAt: new Date(Date.now() - 86400000 * 20)
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 45)
  }
];
