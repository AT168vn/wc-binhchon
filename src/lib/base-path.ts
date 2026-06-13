const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || '')
  .trim()
  .replace(/\/$/, '');

export function getBasePath(): string {
  return configuredBasePath;
}

export function withBasePath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return path;
  }

  const base = getBasePath();
  if (!base) {
    return path;
  }

  return `${base}${path}`;
}

export function stripBasePath(pathname: string): string {
  const base = getBasePath();
  if (!base || !pathname.startsWith(base)) {
    return pathname;
  }

  const stripped = pathname.slice(base.length);
  if (!stripped) {
    return '/';
  }

  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

export function navigateToAppPath(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (/^https?:\/\//i.test(path)) {
    window.location.href = path;
    return;
  }

  const base = getBasePath();
  if (base && path.startsWith(base)) {
    window.location.href = path;
    return;
  }

  window.location.href = withBasePath(path);
}

export function isAppRoute(pathname: string, route: string): boolean {
  const normalizedPath = stripBasePath(pathname.replace(/\/$/, '') || '/');
  const normalizedRoute = route.replace(/\/$/, '') || '/';
  return normalizedPath === normalizedRoute;
}
