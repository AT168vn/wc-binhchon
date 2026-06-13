import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './providers';

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'World Cup 2026',
  description: process.env.NEXT_PUBLIC_TEN_HIEN_THI,
  icons: {
    icon: {
      url: `${basePath}/images/LogoTamAnh.png`,
      type: 'image/svg+xml',
    },
    shortcut: `${basePath}/images/LogoTamAnh.png`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
