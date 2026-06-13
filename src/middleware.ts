import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from './lib/auth/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route không cần auth ngay lập tức
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname === '/wc_ketqua' ||
    pathname.includes('.') || // Static files
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Lấy access token từ cookies
  const encryptedToken = request.cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey)?.value;
  
  // Import và xử lý token
  let accessToken: string | null = null;
  if (encryptedToken) {
    try {
      const { getDecryptedToken } = await import('./lib/auth/crypto');
      accessToken = getDecryptedToken(encryptedToken);
    } catch (error) {      
      accessToken = null;
    }
  }

  // Nếu không có access token, redirect về login ngay lập tức
  if (!accessToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (pathname !== '/') {
      response.cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, pathname, {
        path: '/',
        maxAge: 300
      });
    }
    return response;
  }

  // Validate token expiration nhanh hơn
  try {
    // Import function từ utils
    const { isValidToken } = await import('./lib/auth/utils');
    
    if (!isValidToken(accessToken)) {
      // Token không hợp lệ, redirect về login
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (pathname !== '/') {
        response.cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, pathname, {
          path: '/',
          maxAge: 300
        });
      }
      return response;
    }

    // Nếu token hợp lệ, cho phép request
    return NextResponse.next();

  } catch (error) {    
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (pathname !== '/') {
      response.cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, pathname, {
        path: '/',
        maxAge: 300
      });
    }
    return response;
  }
}

// Tối ưu matcher để chỉ apply cho routes cần thiết
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\.).*)',
  ],
}; 