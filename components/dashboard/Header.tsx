'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, ChevronRight, Sun, Moon, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const labelFor = (seg: string, i: number) => {
    if (seg === 'dashboard') return 'Dashboard';
    if (seg === 'locations') return 'Joylashuvlar';
    if (seg === 'camera') return 'Kamera';
    if (i === segments.length - 1 && /^\d+$/.test(seg)) return `#${seg}`;
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  };

  return segments.map((seg, i) => ({
    label: labelFor(seg, i),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const crumbs = useBreadcrumb();

  const toggleDark = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    setDark(isDark);
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        {/* Breadcrumb / title */}
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-12 lg:pl-0">
          {title ? (
            <h2 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {title}
            </h2>
          ) : (
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
            >
              {crumbs.map((c, i) => (
                <div key={c.href} className="flex min-w-0 items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                  {c.isLast ? (
                    <span className="truncate font-medium text-foreground">
                      {c.label}
                    </span>
                  ) : (
                    <Link
                      href={c.href}
                      className="truncate hover:text-foreground transition-colors"
                    >
                      {c.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Search (md+) */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Qidirish..."
            className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-12 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 lg:w-72"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleDark}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Tema o'zgartirish"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Yordam"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Bildirishnomalar"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          </button>

          {/* User chip */}
          <div className="ml-1 hidden items-center gap-2.5 rounded-lg border border-border bg-card pl-1 pr-3 py-1 sm:flex">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-violet-600 text-[11px] font-semibold text-white">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium text-foreground">{user?.name || 'User'}</span>
              <span className="text-[10px] text-muted-foreground">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
