'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Video,
  Shield,
  BarChart3,
  Sparkles,
  ArrowRight,
  Github,
  Activity,
  Eye,
  Lock,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-500/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-500/15 blur-3xl animate-blob [animation-delay:4s]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-400/15 blur-3xl animate-blob [animation-delay:8s]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid-slate mask-radial-fade opacity-60" />

      {/* Top nav */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight">Sentinel CCTV</span>
              <span className="text-[11px] text-muted-foreground">Monitoring platform</span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">
              Imkoniyatlar
            </a>
            <a href="#stats" className="hover:text-foreground transition-colors">
              Statistika
            </a>
            <a href="#cta" className="hover:text-foreground transition-colors">
              Boshlash
            </a>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Kirish
                </Button>
              </Link>
            )}
            <Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20">
                {isAuthenticated ? 'Dashboardga' : "Ro'yxatdan o'tish"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Real-time AI tahlil yoqilgan · YOLOv8s
          </div>

          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            CCTV monitoring{' '}
            <span className="text-gradient-brand">yangi avlod</span> platformasi
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Bir paneldan o'nlab joylashuv va yuzlab kameralarni boshqaring.
            Sun'iy intellekt sizning o'rningizga insonlarni sanaydi, hodisalarni
            yozadi va sizga faqat muhim narsani ko'rsatadi.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href={isAuthenticated ? '/dashboard' : '/auth/login'}>
              <Button
                size="lg"
                className="h-12 bg-brand-600 px-6 text-base text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
              >
                {isAuthenticated ? 'Dashboardga kirish' : 'Bepul boshlash'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base"
                >
                  Akkaunt yaratish
                </Button>
              </Link>
            )}
          </div>

          {!isAuthenticated && (
            <div className="mt-10 inline-flex items-center gap-3 rounded-xl border border-border bg-card/70 backdrop-blur-md px-5 py-3 text-left shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <Lock className="h-4 w-4 text-brand-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Demo akkaunt</p>
                <p className="text-muted-foreground num">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">
                    admin@example.com
                  </code>{' '}
                  /{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px]">
                    admin123
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating preview mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-brand-500/30 via-violet-500/30 to-sky-500/30 opacity-40 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-3 flex-1">
                <div className="mx-auto inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  sentinel.dashboard / cameras
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              {[
                { name: 'Lobby Cam 01', status: 'Recording', count: 7, accent: 'from-red-500/70 to-rose-500/40' },
                { name: 'Warehouse 02', status: 'Online', count: 0, accent: 'from-emerald-500/70 to-teal-500/40' },
                { name: 'Entrance 03', status: 'Online', count: 3, accent: 'from-sky-500/70 to-blue-500/40' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-900 to-slate-800"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-40`} />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                    {c.status}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow">
                    {c.count} inson
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <span className="font-medium">{c.name}</span>
                    <span className="font-mono text-white/60">1920×1080</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative z-10 border-y border-border bg-card/40 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<200ms', label: 'AI tahlil kechikishi' },
            { value: '8 fps', label: 'YOLOv8 inference' },
            { value: '24/7', label: "Doimiy monitoring" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-background px-6 py-10 text-center"
            >
              <p className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl num">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand-600">Imkoniyatlar</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Professional darajadagi xavfsizlik
          </h2>
          <p className="mt-4 text-muted-foreground">
            Real-time stream, AI ko'mak, va to'liq nazorat — bir vaqtning o'zida.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Video,
              title: 'Live MJPEG stream',
              desc: 'Real vaqtli kamera oqimlari, past kechikish, lazy-load preview.',
              color: 'from-blue-500/15 to-indigo-500/10',
              iconColor: 'text-blue-600',
            },
            {
              icon: Sparkles,
              title: 'AI Detection (YOLOv8)',
              desc: 'Insonlar avtomatik tarzda sanaladi va tarix yoziladi.',
              color: 'from-violet-500/15 to-purple-500/10',
              iconColor: 'text-violet-600',
            },
            {
              icon: Activity,
              title: 'Detection history',
              desc: 'Soatlar bo\'yicha qaysi vaqtda nechta inson o\'tganini ko\'ring.',
              color: 'from-emerald-500/15 to-teal-500/10',
              iconColor: 'text-emerald-600',
            },
            {
              icon: Shield,
              title: 'Xavfsiz autentifikatsiya',
              desc: 'Token asosida muhofaza, sessiyalar va rollar bilan boshqaring.',
              color: 'from-rose-500/15 to-pink-500/10',
              iconColor: 'text-rose-600',
            },
            {
              icon: BarChart3,
              title: 'KPI dashboard',
              desc: 'Joylashuv va kameralar bo\'yicha umumiy ko\'rsatkichlar.',
              color: 'from-amber-500/15 to-orange-500/10',
              iconColor: 'text-amber-600',
            },
            {
              icon: Zap,
              title: 'Tez va engil',
              desc: 'Next.js 16 + Tailwind 4, lazy loading va virtual rendering.',
              color: 'from-cyan-500/15 to-sky-500/10',
              iconColor: 'text-cyan-600',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-8 py-16 text-center text-white shadow-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,.5) 0, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,.3) 0, transparent 50%)',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Tayyormisiz? Hozir boshlang
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Bir necha daqiqada o'zingizning birinchi kameringizni qo'shing va
              haqiqiy vaqtda monitoring qiling.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
                <Button
                  size="lg"
                  className="h-12 bg-white px-6 text-base text-brand-700 hover:bg-white/90"
                >
                  {isAuthenticated ? 'Dashboardga' : 'Akkaunt yaratish'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/30 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  >
                    Akkaunt bor — kirish
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Shield className="h-3.5 w-3.5" />
            </div>
            © {new Date().getFullYear()} Sentinel CCTV. All rights reserved.
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
