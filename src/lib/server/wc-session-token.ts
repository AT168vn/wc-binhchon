import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { getDecryptedToken } from '@/lib/auth/crypto';

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getSessionSecret(): string {
  return (
    process.env.WC_SESSION_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_API_KEY?.trim() ||
    'wc-binh-chon-session'
  );
}

export type WcSessionPayload = {
  sub: string;
  username: string;
  fullname: string;
  exp: number;
  iat: number;
};

export function verifyWcSessionToken(token: string): WcSessionPayload | null {
  try {
    if (!token || !token.includes('.')) {
      return null;
    }

    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac('sha256', getSessionSecret())
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload)) as WcSessionPayload;
    if (!decoded.sub || typeof decoded.exp !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now >= decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getWcSessionSuTaikhoanFromRequest(request: NextRequest): string | null {
  const encryptedToken = request.cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey)?.value;
  if (!encryptedToken) {
    return null;
  }

  try {
    const accessToken = getDecryptedToken(encryptedToken);
    if (!accessToken) {
      return null;
    }
    const session = verifyWcSessionToken(accessToken);
    return session?.sub?.trim() || null;
  } catch {
    return null;
  }
}

export function createWcSessionToken(input: {
  su_taikhoan: string;
  su_hoten: string | null;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 6 * 60 * 60;
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: input.su_taikhoan,
      username: input.su_taikhoan,
      fullname: input.su_hoten ?? input.su_taikhoan,
      exp,
      iat: now,
    }),
  );
  const secret =
    process.env.WC_SESSION_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_API_KEY?.trim() ||
    'wc-binh-chon-session';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
