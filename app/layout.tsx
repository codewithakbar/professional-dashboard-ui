'use client';

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CameraProvider } from '@/context/CameraContext'
import { AppRouter } from '@/components/AppRouter'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Cannot use metadata in client component, removed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-neutral-50">
      <body className="font-sans antialiased">
        <AuthProvider>
          <CameraProvider>
            <AppRouter>
              {children}
            </AppRouter>
          </CameraProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
