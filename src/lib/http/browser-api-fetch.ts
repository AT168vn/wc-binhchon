import { API_CONFIG } from '@/lib/auth/constants';
import { resolveAppApiPath } from '@/lib/app-api-path';

/**
 * Bật gọi trực tiếp từ trình duyệt tới API backend (1 chặng)
 * thay vì Browser -> Next -> backend (2 chặng).
 *
 * .env: NEXT_PUBLIC_BROWSER_DIRECT=true
 */
export function isPmquanlyBrowserDirectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BROWSER_DIRECT === 'true';
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/$/, '');
}

/** Chỉ dùng khi NEXT_PUBLIC_BROWSER_DIRECT=true — tùy chọn trong .env */
function browserDirectAuthBase(): string {
  const raw = (process.env.NEXT_PUBLIC_BROWSER_DIRECT_AUTH_URL || '').trim();
  return raw ? stripTrailingSlash(raw) : '';
}

/**
 * Chuyển path tương đối `/api/...` (gọi qua proxy Next) sang URL tuyệt đối khi bật direct mode.
 * - `/api/auth/login` luôn giữ nguyên (Next route — giữ X-API-KEY phía server).
 * - `/api/auth/logout`, refresh, get-user-profile → auth.pmquanly.
 * - Còn lại → api.pmquanly (kèm prefix path như proxy).
 */
export function resolvePmquanlyBrowserUrl(path: string): string {
  const appApiPath = resolveAppApiPath(path);
  if (appApiPath.startsWith('http')) {
    return appApiPath;
  }

  if (!isPmquanlyBrowserDirectEnabled() || !path.startsWith('/api/')) {
    return path;
  }

  const directBase = browserDirectAuthBase();
  if (!directBase) {
    return path;
  }

  if (path.startsWith('/api/auth/login')) {
    return path;
  }

  if (
    path.startsWith('/api/auth/logout') ||
    path.startsWith('/api/auth/refresh-token') ||
    path.startsWith('/api/auth/get-user-profile')
  ) {
    return `${directBase}${path}`;
  }

  return `${directBase}${path}`;
}

/**
 * Fetch tương đương `fetch`, nhưng resolve URL và gắn `X-API-KEY` khi gọi trực tiếp pmquanly (khớp proxy Next).
 */
export function browserApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input !== 'string') {
    return fetch(input, init);
  }

  const url = resolvePmquanlyBrowserUrl(input);
  const headers = new Headers(init?.headers);

  if (
    isPmquanlyBrowserDirectEnabled() &&
    url.startsWith('http') &&
    API_CONFIG.loginKey &&
    !headers.has('X-API-KEY')
  ) {
    headers.set('X-API-KEY', API_CONFIG.loginKey);
  }

  return fetch(url, { ...init, headers });
}
