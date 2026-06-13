import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './lib/auth/constants';

const PUBLIC_PATHS = new Set([
  AUTH_CONFIG.ROUTES.login,
  '/wc_ketqua',
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const encryptedToken = request.cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey)?.value;
  let accessToken: string | null = null;

  if (encryptedToken) {
    try {
      const { getDecryptedToken } = await import('./lib/auth/crypto');
      accessToken = getDecryptedToken(encryptedToken);
    } catch {
      accessToken = null;
    }
  }

  if (!accessToken) {
    const response = NextResponse.redirect(new URL(AUTH_CONFIG.ROUTES.login, request.url));
    if (pathname !== '/') {
      response.cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, pathname, {
        path: '/',
        maxAge: 300,
      });
    }
    return response;
  }

  try {
    const { isValidToken } = await import('./lib/auth/utils');
    if (!isValidToken(accessToken)) {
      const response = NextResponse.redirect(new URL(AUTH_CONFIG.ROUTES.login, request.url));
      if (pathname !== '/') {
        response.cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, pathname, {
          path: '/',
          maxAge: 300,
        });
      }
      return response;
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL(AUTH_CONFIG.ROUTES.login, request.url));
    return response;
  }
}

export const config = {
  matcher: ['/', '/wc_bongda', '/wc_bongda/:path*'],
};
