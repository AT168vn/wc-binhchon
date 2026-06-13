/**
 * Khi deploy GitHub Pages (static), API Next.js không chạy trên cùng domain.
 * Set NEXT_PUBLIC_APP_API_BASE=https://your-server.com để client gọi API backend.
 */
export function resolveAppApiPath(path: string): string {
  if (!path.startsWith('/api/')) {
    return path;
  }

  const base = (process.env.NEXT_PUBLIC_APP_API_BASE || '').trim().replace(/\/$/, '');
  if (!base) {
    return path;
  }

  return `${base}${path}`;
}
