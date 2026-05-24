'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCamera } from '@/context/CameraContext';
import {
  Menu,
  X,
  LayoutGrid,
  MapPin,
  LogOut,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Joylashuvlar', href: '/dashboard/locations', icon: MapPin },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { cameras, locations } = useCamera();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition lg:hidden"
        aria-label="Menyu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
        <div className="pointer-events-none absolute -top-32 -right-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Brand */}
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-6 pt-6 pb-5 border-b border-sidebar-border"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/40">
              <Shield className="h-[18px] w-[18px]" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">Sentinel CCTV</span>
              <span className="text-[11px] text-sidebar-foreground/60">v2.0 · Monitoring</span>
            </div>
          </Link>

          {/* Stats summary */}
          <div className="px-4 pt-5">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live monitoring
                </div>
                <Activity className="h-3.5 w-3.5 text-sidebar-foreground/40" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-medium">
                    Joylashuv
                  </p>
                  <p className="mt-0.5 text-lg font-semibold num">{locations.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-medium">
                    Kamera
                  </p>
                  <p className="mt-0.5 text-lg font-semibold num">{cameras.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-6 flex-1 px-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Menyu
            </p>
            <ul className="space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{label}</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${
                          active
                            ? 'translate-x-0 opacity-100'
                            : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User card + logout */}
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
              <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-semibold text-white shadow-md">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
                <p className="truncate text-[11px] text-sidebar-foreground/60">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30"
            >
              <LogOut className="h-4 w-4" />
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
