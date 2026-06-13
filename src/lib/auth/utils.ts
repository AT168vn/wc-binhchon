import Cookies from 'js-cookie';
import { AUTH_CONFIG } from './constants';
import { JWTPayload } from './types';
import type { UserInfo } from './types';
import { getDecryptedToken } from './crypto';

function safeBase64Decode(str: string): string {
  try {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof window !== 'undefined') {
      return atob(normalized);
    }
    return Buffer.from(normalized, 'base64').toString();
  } catch {
    throw new Error('Invalid base64 string');
  }
}

export const validateAndCleanupTokens = (): boolean => {
  const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
  const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;

  if (!accessToken) {
    return false;
  }

  try {
    if (!isValidToken(accessToken)) {
      clearAllAuthData();
      return false;
    }
    return true;
  } catch {
    clearAllAuthData();
    return false;
  }
};

export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const cookieOptions = { path: '/' };
    Cookies.remove(AUTH_CONFIG.COOKIE.accessTokenKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.refreshTokenKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.userKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.returnUrlKey, cookieOptions);
  } catch (e) {
    console.warn('[Auth] clearAllAuthData cookies:', e);
  }
};

export const clearInvalidCookies = (): void => {
  try {
    const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
    if (encryptedToken) {
      try {
        getDecryptedToken(encryptedToken);
      } catch {
        Cookies.remove(AUTH_CONFIG.COOKIE.accessTokenKey, { path: '/' });
      }
    }
  } catch (error) {
    console.warn('[Utils] Error checking invalid cookies:', error);
  }
};

export const isValidToken = (token: string): boolean => {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const decryptedToken = getDecryptedToken(token);
    if (!decryptedToken || !decryptedToken.includes('.')) {
      return false;
    }

    const [, payload] = decryptedToken.split('.');
    if (!payload) {
      return false;
    }

    const decodedPayload = JSON.parse(safeBase64Decode(payload)) as JWTPayload;
    const expirationTime = decodedPayload.exp * 1000;
    return Date.now() < expirationTime - AUTH_CONFIG.TOKEN.bufferTime;
  } catch {
    return false;
  }
};

export function buildUserInfoFromBinhChon(input: {
  su_taikhoan: string;
  su_hoten: string | null;
}): UserInfo {
  const displayName = input.su_hoten?.trim() || input.su_taikhoan;
  return {
    user_ID: input.su_taikhoan,
    username: input.su_taikhoan,
    employee_ID: null,
    displayName,
    password: '',
    source: 2,
    email: '',
    status: true,
    application_ID: 'wc-binh-chon',
    application_Name: 'World Cup Bình chọn',
    hsoft_ID: null,
    hsoft_Account: input.su_taikhoan,
    location: null,
    siteCompany_ID: 'wc-binh-chon',
    permissions: [],
  };
}
