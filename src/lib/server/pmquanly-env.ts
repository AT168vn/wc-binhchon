/**
 * Biến môi trường auth — chỉ import từ API routes / server.
 *
 * - AUTH_URL: base dịch vụ auth (vd. https://api-auth.bvta.vn)
 * - AUTH_BASE_URL: base application (vd. .../api/application) — Domain/Hsoft
 */
function stripEnvQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function normalizeHttpUrl(raw: string, fallback: string): string {
  let value = stripEnvQuotes(raw).replace(/\/$/, '');
  if (!value) return fallback;

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`;
  }

  try {
    const u = new URL(value);
    return u.href.replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

function resolveAuthServiceUrl(): string {
  const explicit = process.env.AUTH_URL?.trim();
  if (explicit) {
    return normalizeHttpUrl(explicit, 'http://localhost:3010');
  }

  const fromApplication = process.env.AUTH_BASE_URL?.trim();
  if (fromApplication) {
    const stripped = stripEnvQuotes(fromApplication).replace(/\/api\/application\/?$/i, '');
    return normalizeHttpUrl(stripped, 'http://localhost:3010');
  }

  return 'http://localhost:3010';
}

/**
 * Base URL dịch vụ auth — các path: /api/auth/login, refresh, logout, profile.
 */
export function getPmquanlyAuthBaseUrl(): string {
  return resolveAuthServiceUrl();
}

export function getPmquanlyApiKey(): string {
  return process.env.NEXT_PUBLIC_API_KEY || '';
}

/**
 * Base URL auth application (Domain / Hsoft / SSO).
 */
export function getAuthApplicationBaseUrl(): string {
  const explicit = process.env.AUTH_BASE_URL?.trim();
  if (explicit) {
    return normalizeHttpUrl(explicit, 'https://api-auth.bvta.vn/api/application');
  }
  return `${resolveAuthServiceUrl()}/api/application`;
}

export function getAuthDomain(): string {
  return stripEnvQuotes(process.env.AUTH_DOMAIN || process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'bvta.vn');
}

/** @deprecated Dùng getPmquanlyAuthBaseUrl */
export const getPmquanlyBaseUrl = getPmquanlyAuthBaseUrl;

/** @deprecated Dùng getPmquanlyAuthBaseUrl */
export const getKskApiBaseUrl = getPmquanlyAuthBaseUrl;
