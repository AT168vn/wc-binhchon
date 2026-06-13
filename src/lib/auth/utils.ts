import Cookies from 'js-cookie';
import { AUTH_CONFIG } from './constants';
import { JWTPayload, UserInfoFromToken, PmquanlyJwtPayload } from './types';
import type { UserInfo } from './types';
import { getDecryptedToken } from './crypto';

/**
 * Helper function để decode base64 an toàn cho JWT payload
 * 
 * Lưu ý: Function này chỉ dùng để decode JWT payload, không dùng cho crypto-js
 * Crypto-js tự động xử lý base64 encoding/decoding khi mã hóa/giải mã
 */
const safeBase64Decode = (str: string): string => {
  try {
    // Thử decode với atob trước (browser)
    if (typeof window !== 'undefined') {
      return atob(str);
    } else {
      // Node.js environment
      return Buffer.from(str, 'base64').toString();
    }
  } catch {
    throw new Error('Invalid base64 string');
  }
};

// Function để khởi tạo authentication khi app start
export const initializeAuth = (): void => { 
  // Validate và cleanup tokens cũ
  const isValid = validateAndCleanupTokens();
  
  if (!isValid) {    
    // Không làm gì, để user tự login
    return;
  }
  
  // Token hợp lệ, có thể tiếp tục sử dụng app
};

// Function để validate và cleanup tokens khi khởi động
export const validateAndCleanupTokens = (): boolean => {  
  const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
  const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;
  
  if (!accessToken) {    
    return false;
  }
  
  try {
    // Kiểm tra token có hợp lệ không
    const isValid = isValidToken(accessToken);
    
    if (!isValid) {      
      clearAllAuthData();
      return false;
    }
    
    return true;
  } catch (error) {    
    clearAllAuthData();
    return false;
  }
};

// Function để clear tất cả authentication data (chỉ chạy trên client, không throw)
export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const cookieOptions = { path: '/' };
    Cookies.remove(AUTH_CONFIG.COOKIE.accessTokenKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.refreshTokenKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.userKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.usernameKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.returnUrlKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.selectedBranchIdKey, cookieOptions);
    Cookies.remove(AUTH_CONFIG.COOKIE.selectedBranchNameKey, cookieOptions);
  } catch (e) {
    console.warn('[Auth] clearAllAuthData cookies:', e);
  }
  try {
    localStorage.removeItem('sidebarMenuState');
    localStorage.removeItem('authState');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('permissionsCache');
    localStorage.removeItem('menuState');
    sessionStorage.clear();
  } catch (e) {
    console.warn('[Auth] clearAllAuthData storage:', e);
  }
};

// Function để clear cookies không hợp lệ
export const clearInvalidCookies = (): void => {
  try {
    const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
    if (encryptedToken) {
      // Thử giải mã token, nếu lỗi thì xóa cookie
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

// Utility functions để quản lý token
export const isValidToken = (token: string): boolean => {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Bước 1: Giải mã crypto-js nếu token đã được mã hóa
    const decryptedToken = getDecryptedToken(token);
    if (!decryptedToken) {
      return false;
    }
    
    // Bước 2: Kiểm tra format JWT
    if (!decryptedToken.includes('.')) {
      return false;
    }
    
    const [, payload] = decryptedToken.split('.');
    if (!payload) {
      return false;
    }
    
    // Bước 3: Decode JWT payload (base64)
    const decodedPayload = JSON.parse(safeBase64Decode(payload)) as JWTPayload;
    
    // Bước 4: Kiểm tra expiration
    const expirationTime = decodedPayload.exp * 1000;
    const now = Date.now();
    const isValid = now < expirationTime - AUTH_CONFIG.TOKEN.bufferTime;   
    return isValid;
  } catch (error) {    
    return false;
  }
};

export const getTokenExpirationTime = (token: string): number | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    // Bước 1: Giải mã crypto-js nếu token đã được mã hóa
    const decryptedToken = getDecryptedToken(token);
    if (!decryptedToken) {
      return null;
    }
    
    // Bước 2: Kiểm tra format JWT
    if (!decryptedToken.includes('.')) {
      return null;
    }
    
    const [, payload] = decryptedToken.split('.');
    if (!payload) {
      return null;
    }
    
    // Bước 3: Decode JWT payload (base64)
    const decodedPayload = JSON.parse(safeBase64Decode(payload)) as JWTPayload;
    
    const expirationTime = decodedPayload.exp * 1000;    
    return expirationTime;
  } catch (error) {    
    return null;
  }
};

export const getUserInfoFromToken = (token: string): UserInfoFromToken | null => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    // Bước 1: Giải mã crypto-js nếu token đã được mã hóa
    const decryptedToken = getDecryptedToken(token);
    if (!decryptedToken) {
      return null;
    }
    
    // Bước 2: Kiểm tra format JWT
    if (!decryptedToken.includes('.')) {
      return null;
    }
    
    const [, payload] = decryptedToken.split('.');
    if (!payload) {
      return null;
    }
    
    // Bước 3: Decode JWT payload (base64)
    const decodedPayload = JSON.parse(safeBase64Decode(payload)) as UserInfoFromToken;
    
    return decodedPayload;
  } catch {
    return null;
  }
};

/** Decode payload từ JWT chuỗi thô (dùng cho token vừa nhận từ API, chưa encrypt) */
export const decodeJwtPayload = (rawToken: string): Record<string, unknown> | null => {
  try {
    if (!rawToken || typeof rawToken !== 'string' || !rawToken.includes('.')) return null;
    const parts = rawToken.split('.');
    const payload = parts[1];
    if (!payload) return null;
    const decoded = typeof atob !== 'undefined' ? atob(payload) : Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/** Tạo UserInfo từ JWT payload của API pmquanly (sau khi login) */
export const buildUserInfoFromPmquanlyPayload = (payload: PmquanlyJwtPayload | null): UserInfo => {
  if (!payload) {
    return {
      user_ID: '',
      username: '',
      employee_ID: null,
      displayName: '',
      password: '',
      source: 2,
      email: '',
      status: true,
      application_ID: 'ehealth',
      application_Name: null,
      hsoft_ID: null,
      hsoft_Account: '',
      location: null,
      siteCompany_ID: 'ehealth',
      permissions: [],
    };
  }
  const userid = payload.userid ?? payload.nameid ?? '';
  const username = payload.unique_name ?? payload.email ?? String(userid);
  const displayName = payload.fullname ?? username;
  const email = payload.email ?? '';
  return {
    user_ID: String(userid),
    username,
    employee_ID: null,
    displayName,
    password: '',
    source: 2,
    email,
    status: true,
    application_ID: 'ehealth',
    application_Name: null,
    hsoft_ID: null,
    hsoft_Account: username,
    location: null,
    siteCompany_ID: 'ehealth',
    permissions: [],
  };
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

// Kiểm tra đường dẫn có phải public không
export const isPublicPath = (pathname: string): boolean => {
  return AUTH_CONFIG.ROUTES.publicPaths.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(publicPath)
  );
}; 