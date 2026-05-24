'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Sparkles, Activity, Lock } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background lg:grid lg:grid-cols-2">
      {/* Brand panel — visible on lg+ */}
      <aside className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950" />
        <div className="absolute inset-0 bg-grid-dark mask-radial-fade" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl animate-blob [animation-delay:6s]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Top: logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight">Sentinel CCTV</span>
              <span className="text-xs text-white/60">Monitoring platform</span>
            </div>
          </Link>

          {/* Middle: marketing copy */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/60">
                Yangi avlod CCTV
              </p>
              <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight leading-[1.1]">
                Sun'iy intellekt ko'magi bilan{' '}
                <span className="text-gradient-brand">aqlli monitoring</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
                Yuzlab kameralarni bir paneldan boshqaring, AI esa sizning
                o'rningizga hodisalarni kuzatib boradi.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-3">
              {[
                { icon: Sparkles, text: 'YOLOv8s real-time inson aniqlash' },
                { icon: Activity, text: "To'liq detection history va analitika" },
                { icon: Lock, text: 'Xavfsiz token autentifikatsiyasi' },
              ].map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom */}
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Sentinel CCTV
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate mask-radial-fade opacity-50 lg:hidden" />

        {/* Mobile logo */}
        <Link
          href="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Bosh sahifa
        </Link>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
