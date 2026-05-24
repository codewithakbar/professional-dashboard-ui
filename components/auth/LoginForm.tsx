'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Email yoki parol noto\'g\'ri');
      }
    } catch {
      setError("Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="flex flex-col items-center text-center lg:hidden">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
          <Shield className="h-6 w-6" />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Xush kelibsiz
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akkauntingizga kiring va kuzatuvni davom ettiring.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Parol
            </Label>
            <Link
              href="#"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              Unutdingizmi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
              className="h-11 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kirilmoqda...
            </>
          ) : (
            'Kirish'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Akkaunt yo'qmi?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          Ro'yxatdan o'tish
        </Link>
      </div>

      {/* Demo credentials */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-violet-50/50" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-foreground">Demo akkaunt</p>
            <div className="mt-1.5 space-y-0.5 num text-muted-foreground">
              <p>
                Email:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  admin@example.com
                </code>
              </p>
              <p>
                Parol:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                  admin123
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
