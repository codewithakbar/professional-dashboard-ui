export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function cameraStreamUrl(cameraId: string | number, token: string): string {
  return `${API_BASE_URL}/api/cameras/${cameraId}/stream/?token=${encodeURIComponent(token)}`;
}

export function cameraDetectionUrl(cameraId: string | number, token: string): string {
  return `${API_BASE_URL}/api/cameras/${cameraId}/detection/?token=${encodeURIComponent(token)}`;
}

export function cameraDetectionHistoryUrl(
  cameraId: string | number,
  token: string,
  limit = 50,
): string {
  return `${API_BASE_URL}/api/cameras/${cameraId}/detection-history/?token=${encodeURIComponent(token)}&limit=${limit}`;
}

export interface DetectionHistoryEntry {
  id: string;
  personCount: number;
  recordedAt: string;
}

export interface CameraDetectionStats {
  camera_id: number;
  camera_name: string;
  person_count: number;
  last_detection_at: number | null;
  ai_active: boolean;
  ai_enabled: boolean;
}
