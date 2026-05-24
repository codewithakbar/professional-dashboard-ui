interface StatusBadgeProps {
  status: 'online' | 'offline' | 'recording';
  className?: string;
}

const STATUS_CONFIG = {
  online: {
    label: 'Online',
    ring: 'border-emerald-300/70 bg-emerald-50/95',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    animated: true,
  },
  offline: {
    label: 'Offline',
    ring: 'border-rose-300/70 bg-rose-50/95',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    ping: 'bg-rose-400',
    animated: false,
  },
  recording: {
    label: 'Recording',
    ring: 'border-amber-300/70 bg-amber-50/95',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
    animated: true,
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm ${c.ring} ${c.text} ${className ?? ''}`}
    >
      <span className="relative flex h-2 w-2">
        {c.animated && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${c.ping}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}
