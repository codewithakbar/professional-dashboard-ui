'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCamera } from '@/context/CameraContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { PersonCountBadge } from '@/components/dashboard/PersonCountBadge';
import { cameraStreamUrl } from '@/lib/api';
import { useCameraDetection } from '@/hooks/useCameraDetection';
import { useDetectionHistory } from '@/hooks/useDetectionHistory';
import {
  ArrowLeft,
  Download,
  Camera,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  MapPin,
  Monitor,
  Activity,
  Radio,
  Shield,
  RefreshCw,
  Copy,
  CheckCheck,
  ExternalLink,
  Settings,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
} from 'lucide-react';

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestElementFullscreen(el: HTMLElement) {
  const target = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
  if (target.requestFullscreen) {
    await target.requestFullscreen();
    return;
  }
  if (target.webkitRequestFullscreen) {
    await target.webkitRequestFullscreen();
  }
}

async function exitDocumentFullscreen() {
  const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}

export default function CameraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getCameraById, getLocationById, updateCamera } = useCamera();
  const cameraId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasFrame, setHasFrame] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [aiToggling, setAiToggling] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const isVideoFullscreen = isFullscreen || pseudoFullscreen;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(sessionStorage.getItem('auth-token'));
    }
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      const el = videoContainerRef.current;
      const active = Boolean(el && getFullscreenElement() === el);
      setIsFullscreen(active);
      if (active) setPseudoFullscreen(false);
    };

    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);

  useEffect(() => {
    if (!isVideoFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pseudoFullscreen) setPseudoFullscreen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVideoFullscreen, pseudoFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    const el = videoContainerRef.current;
    if (!el) return;

    if (isVideoFullscreen) {
      if (getFullscreenElement() === el) {
        try {
          await exitDocumentFullscreen();
        } catch {
          /* ignore */
        }
      }
      setPseudoFullscreen(false);
      setIsFullscreen(false);
      return;
    }

    try {
      await requestElementFullscreen(el);
      setIsFullscreen(true);
      setPseudoFullscreen(false);
    } catch {
      setPseudoFullscreen(true);
      setIsFullscreen(false);
    }
  }, [isVideoFullscreen]);

  const camera = getCameraById(cameraId);
  const location = camera ? getLocationById(camera.locationId) : undefined;
  const aiEnabled = camera?.aiDetectionEnabled !== false;
  const { stats: detectionStats } = useCameraDetection(
    cameraId,
    token,
    aiEnabled && Boolean(camera?.streamUrl),
  );
  const { entries: detectionHistory, loading: historyLoading } = useDetectionHistory(
    cameraId,
    token,
    Boolean(camera?.streamUrl),
  );

  const handleAiToggle = async (checked: boolean) => {
    setAiToggling(true);
    try {
      await updateCamera(cameraId, { aiDetectionEnabled: checked });
      setRefreshKey(k => k + 1);
    } finally {
      setAiToggling(false);
    }
  };

  const handleCopyUrl = () => {
    if (camera?.streamUrl) {
      navigator.clipboard.writeText(camera.streamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    setHasFrame(false);
    setStreamError(false);
    setRefreshKey(k => k + 1);
  };

  if (!camera) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
            <Camera className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800">Kamera topilmadi</h2>
          <p className="text-neutral-500">ID: <code className="bg-neutral-100 px-2 py-0.5 rounded text-sm">{cameraId}</code></p>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = {
    online: { icon: Wifi, color: 'text-green-500', bg: 'bg-green-50 border-green-200', label: 'Online' },
    offline: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50 border-red-200', label: 'Offline' },
    recording: { icon: Radio, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', label: 'Recording' },
  }[camera.status];

  const StatusIcon = statusInfo.icon;
  const lastAiLogTime = detectionHistory[0]
    ? new Date(detectionHistory[0].recordedAt)
    : camera.lastRecording;

  return (
    <div className="space-y-6 pb-10">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Orqaga
          </Button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
            <span>Dashboard</span>
            <span>/</span>
            {location && (
              <>
                <span className="text-neutral-600">{location.name}</span>
                <span>/</span>
              </>
            )}
            <span className="text-neutral-900 font-medium">{camera.name}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Yangilash
          </Button>
          {camera.snapshotAvailable && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Snapshot
            </Button>
          )}
        </div>
      </div>

      {/* Main layout: video + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Camera video feed (2/3 width on xl) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Video Feed */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${camera.status === 'offline' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-sm font-medium text-neutral-700">Live Feed</span>
              </div>
              <div className="flex items-center gap-2">
                {token && (
                  <PersonCountBadge
                    cameraId={camera.id}
                    token={token}
                    variant="inline"
                    aiEnabled={aiEnabled}
                    stats={detectionStats}
                  />
                )}
                <span className="text-xs text-neutral-400 font-mono bg-neutral-100 px-2 py-0.5 rounded">{camera.resolution}</span>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors"
                  onClick={toggleFullscreen}
                  title={isVideoFullscreen ? 'Fullscreen dan chiqish' : 'Fullscreen'}
                  aria-label={isVideoFullscreen ? 'Fullscreen dan chiqish' : 'Fullscreen'}
                >
                  {isVideoFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actual video area */}
            <div
              ref={videoContainerRef}
              className={`bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-800 relative overflow-hidden group ${
                pseudoFullscreen
                  ? 'fixed inset-0 z-[200] h-screen w-screen aspect-auto'
                  : 'aspect-video'
              }`}
              onDoubleClick={toggleFullscreen}
            >
              {/* Background grid */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Stream image (MJPEG + YOLO overlay) */}
              {token && camera.streamUrl && (
                <img
                  key={refreshKey}
                  src={cameraStreamUrl(camera.id, token)}
                  alt={camera.name}
                  className={`absolute inset-0 z-10 w-full h-full ${
                    isVideoFullscreen ? 'object-contain' : 'object-cover'
                  }`}
                  onLoad={() => {
                    setHasFrame(true);
                    setStreamError(false);
                  }}
                  onError={() => {
                    setHasFrame(false);
                    setStreamError(true);
                  }}
                />
              )}

              {/* Placeholder while stream connects or on error */}
              {(!hasFrame || streamError) && (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                  <Camera className="h-20 w-20 text-neutral-600 opacity-30 mb-3" />
                  <p className="text-neutral-400 text-sm">
                    {streamError
                      ? 'Stream ulanmadi — backend ishlayaptimi?'
                      : camera.status === 'offline'
                        ? 'Kamera offline'
                        : 'Stream yuklanmoqda…'}
                  </p>
                </div>
              )}

              {/* Scan line animation (when online/recording) */}
              {camera.status !== 'offline' && (
                <div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60"
                  style={{
                    animation: 'scanline 3s linear infinite',
                  }}
                />
              )}

              {/* Recording badge */}
              {camera.status === 'recording' && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  <div className="h-2.5 w-2.5 bg-red-200 rounded-full" />
                  REC
                </div>
              )}

              {/* AI person count */}
              {token && hasFrame && (
                <div className="absolute bottom-16 left-4 z-20">
                  <PersonCountBadge
                    cameraId={camera.id}
                    token={token}
                    aiEnabled={aiEnabled}
                    stats={detectionStats}
                  />
                </div>
              )}

              {/* Fullscreen exit */}
              {isVideoFullscreen && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/85 transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                  Fullscreen dan chiqish (Esc)
                </button>
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4 z-10">
                <StatusBadge status={camera.status} />
              </div>

              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 opacity-70 m-4 rounded-sm" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 opacity-70 m-4 rounded-sm" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 opacity-70 m-4 rounded-sm" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 opacity-70 m-4 rounded-sm" />

              {/* Bottom stream info */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-1.5 rounded-lg font-mono">
                    {camera.streamUrl}
                  </span>
                  <span className="text-xs text-neutral-300 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stream URL bar */}
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
              <code className="text-xs text-neutral-600 font-mono flex-1 truncate">{camera.streamUrl}</code>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                {copied ? (
                  <><CheckCheck className="h-3.5 w-3.5" /> Nusxalandi</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Nusxalash</>
                )}
              </button>
            </div>
          </div>

          {/* Recording History / Activity */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Yozish tarixi
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Oxirgi yozuv vaqti</p>
                  <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    {lastAiLogTime.toLocaleString('uz-UZ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Yozish holati</p>
                  <p className={`text-sm font-semibold flex items-center gap-1.5 ${camera.status === 'recording' ? 'text-orange-600' : 'text-neutral-700'}`}>
                    <Radio className={`h-3.5 w-3.5 ${camera.status === 'recording' ? 'text-orange-500' : 'text-neutral-400'}`} />
                    {camera.status === 'recording' ? 'Yozilmoqda' : 'Standby'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Kamera qo'shilgan</p>
                  <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    {camera.createdAt.toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>

              {/* Detection history timeline */}
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
                    Insonlar soni tarixi
                  </p>
                  {historyLoading && (
                    <span className="text-xs text-neutral-400">Yangilanmoqda…</span>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {detectionHistory.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-2">
                      {aiEnabled
                        ? 'AI yoqilgan — stream ishlaganda boshlar soni shu yerda yoziladi.'
                        : "AI o'chiq — tarix yozilmaydi."}
                    </p>
                  ) : (
                    detectionHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-violet-50/60"
                      >
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            entry.personCount > 0 ? 'bg-violet-500' : 'bg-neutral-300'
                          }`}
                        />
                        <span className="text-neutral-500 font-mono text-xs w-40 flex-shrink-0">
                          {new Date(entry.recordedAt).toLocaleString('uz-UZ')}
                        </span>
                        <span className="text-neutral-800 font-medium tabular-nums">
                          {entry.personCount}{' '}
                          <span className="font-normal text-neutral-600">bosh</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* System events */}
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium mb-3">
                  Tizim voqealari
                </p>
                <div className="space-y-2">
                  {[
                    { time: lastAiLogTime, label: 'Oxirgi AI yozuvi', color: 'bg-blue-500' },
                    { time: camera.createdAt, label: "Kamera qo'shildi", color: 'bg-green-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`h-2 w-2 rounded-full ${item.color} flex-shrink-0`} />
                      <span className="text-neutral-500 font-mono text-xs w-40 flex-shrink-0">
                        {item.time.toLocaleString('uz-UZ')}
                      </span>
                      <span className="text-neutral-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: Camera details (1/3 width on xl) */}
        <div className="space-y-4">
          {/* Camera Header Info */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold truncate">{camera.name}</h1>
                  {location && (
                    <p className="text-blue-200 text-sm mt-1 flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      {location.name}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0 ml-3">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bg} text-sm font-medium`}>
                <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                <span className="text-neutral-800">{statusInfo.label}</span>
                {camera.status !== 'offline' && (
                  <span className="ml-auto text-xs text-neutral-500">Live</span>
                )}
              </div>
              {token && (
                <PersonCountBadge
                  cameraId={camera.id}
                  token={token}
                  variant="inline"
                  aiEnabled={aiEnabled}
                  stats={detectionStats}
                />
              )}
            </div>
          </div>

          {/* AI Detection */}
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-violet-100 bg-violet-50/50 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-violet-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                AI Detection (YOLOv8)
              </h3>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="ai-detection-toggle"
                  className="text-xs text-violet-800 font-medium cursor-pointer"
                >
                  {aiEnabled ? 'Yoniq' : "O'chiq"}
                </Label>
                <Switch
                  id="ai-detection-toggle"
                  checked={aiEnabled}
                  disabled={aiToggling}
                  onCheckedChange={handleAiToggle}
                />
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Users className="h-5 w-5 text-violet-500" />
                  <span className="text-sm">Hozir kadrda</span>
                </div>
                <span className="text-3xl font-bold text-violet-700 tabular-nums">
                  {!aiEnabled
                    ? "—"
                    : detectionStats?.ai_active
                      ? detectionStats.person_count
                      : '—'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {aiEnabled
                  ? 'YOLOv8s real-time tahlil qiladi (~8 marta/sekund). Video silliq yangilanadi; yashil ramkalar har kadrda saqlanadi.'
                  : "AI detection o'chirilgan — stream oddiy ko'rinishda, YOLO ishlamaydi va insonlar sanalmaydi."}
              </p>
              {aiEnabled && detectionStats?.last_detection_at && (
                <p className="text-xs text-neutral-400 font-mono">
                  Oxirgi tahlil:{' '}
                  {new Date(detectionStats.last_detection_at * 1000).toLocaleTimeString('uz-UZ')}
                </p>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-neutral-500" />
                Texnik ma'lumotlar
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {[
                { label: 'Kamera ID', value: `#${camera.id}`, icon: Shield },
                { label: 'Ruxsat (Resolution)', value: camera.resolution, icon: Monitor },
                { label: 'Snapshot', value: camera.snapshotAvailable ? 'Mavjud ✓' : 'Mavjud emas', icon: Camera },
                { label: 'Holat', value: statusInfo.label, icon: Activity },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Info */}
          {location && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  Joylashuv ma'lumotlari
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {[
                  { label: 'Nomi', value: location.name },
                  { label: 'Turi', value: location.type },
                  { label: 'Manzil', value: location.address },
                  { label: 'Kameralar soni', value: `${location.cameras.length} ta` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between px-5 py-3 gap-3">
                    <span className="text-xs text-neutral-500 flex-shrink-0 mt-0.5">{item.label}</span>
                    <span className="text-sm font-medium text-neutral-900 text-right">{item.value}</span>
                  </div>
                ))}
                {location.description && (
                  <div className="px-5 py-3">
                    <p className="text-xs text-neutral-500 mb-1">Tavsif</p>
                    <p className="text-sm text-neutral-700">{location.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">Tezkor amallar</h3>
            </div>
            <div className="p-4 space-y-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full justify-start border-neutral-200 text-neutral-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Stream yangilash
              </Button>
              {camera.snapshotAvailable && (
                <Button
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Snapshot olish
                </Button>
              )}
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full justify-start border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              >
                {copied ? <CheckCheck className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'URL nusxalandi!' : "Stream URL nusxalash"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanline animation style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 0.6; }
          95% { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
