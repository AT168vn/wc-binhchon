'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { clearAllAuthData, clearInvalidCookies, isValidToken } from '@/lib/auth/utils';
import { setLogoutHandler } from '@/lib/auth/logoutController';
import { logout as authLogout } from '@/lib/auth/api';
import type { UserInfo } from '@/lib/auth/types';
import { getDecryptedToken, encryptToken } from '@/lib/auth/crypto';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isInitialized: boolean;
}

export type AuthLoginOptions = {
  /** true: lưu phiên nhưng không chuyển trang (vd: chọn cơ sở làm việc sau đăng nhập). */
  skipRedirect?: boolean;
};

export type AuthLogoutOptions = {
  /** Bearer thô — dùng khi gọi logout trước khi đọc cookie ổn định (vd: modal chọn cơ sở trên /login). */
  accessTokenOverride?: string;
};

interface AuthContextType extends AuthState {
  login: (accessToken: string, user: UserInfo, refreshToken?: string, options?: AuthLoginOptions) => void;
  logout: (redirectToLogin?: boolean, options?: AuthLogoutOptions) => Promise<void>;
  checkAuthStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Không đọc cookie trong initializer — tránh HTML server/client khác nhau (hydration mismatch).
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    isInitialized: false,
  });

  const checkAuthStatus = useCallback((): boolean => {
    try {
      const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
      const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;
      const userStr = Cookies.get(AUTH_CONFIG.COOKIE.userKey);
      
      if (!accessToken || !userStr) {
        return false;
      }

      const user = JSON.parse(userStr);
      const isTokenValid = isValidToken(accessToken);
      
      return !!user && isTokenValid;
    } catch (error) {      
      return false;
    }
  }, []);

  const handleLogout = useCallback(async (redirectToLogin = true, options?: AuthLogoutOptions) => {
    try {
      // Lưu lại returnUrl trước khi logout nếu cần redirect
      if (redirectToLogin) {
        const currentPath = window.location.pathname;
        if (currentPath !== AUTH_CONFIG.ROUTES.login) {
          Cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, currentPath, {
            expires: new Date(Date.now() + 5 * 60 * 1000),
            path: '/'
          });
        }
      }

      // Lưu dữ liệu cumulative calls vào database trước khi logout
      try {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const storageKey = `callrealtime_cumulative_${dateString}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const cumulativeData: Record<string, {
            agentId: string;
            agentName: string;
            fullName: string;
            totalCalls: number;
            lastKnownCalls: number;
            lastUpdate: string;
          }> = JSON.parse(storedData);
          
          // Format dữ liệu thành format API cần
          const apiData = Object.values(cumulativeData).map(item => {
            // Parse agentName để lấy soMay và taiKhoan
            // agentName có thể là "HoanDV1" hoặc "8860   HoanDV1"
            const parts = item.agentName.trim().split(/\s+/);
            let soMay = item.agentId; // Mặc định dùng agentId
            let taiKhoan: string | null = null;
            
            if (parts.length > 0) {
              // Nếu phần đầu là số (số máy), thì đó là soMay
              if (/^\d+$/.test(parts[0])) {
                soMay = parts[0];
                taiKhoan = parts.length > 1 ? parts.slice(1).join(' ') : null;
              } else {
                // Nếu không phải số, thì agentName là taiKhoan
                taiKhoan = item.agentName;
              }
            }
            
            return {
              ngayThang: `${dateString}T00:00:00`,
              soMay: soMay,
              taiKhoan: taiKhoan,
              totalCalls: item.totalCalls,
              lastKnownCalls: item.lastKnownCalls,
              lastUpdate: item.lastUpdate || new Date().toISOString()
            };
          });
          
          // Gọi API lưu dữ liệu (sử dụng dynamic import để tránh circular dependency)
          if (apiData.length > 0 && typeof window !== 'undefined') {
            const { default: apiClient } = await import('@/lib/http/axios');
            await apiClient.post('/vanhanh/callrealtime/save-cumulative', apiData);            
            // Xóa dữ liệu trong localStorage sau khi lưu thành công
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.warn('[AuthProvider] Lỗi khi lưu dữ liệu cumulative calls trước khi logout:', error);
        // Không throw error để không chặn quá trình logout
      }

      // Gọi API logout (có thể truyền Bearer thô khi cookie chưa dùng được cho pmquanly)
      await authLogout(options?.accessTokenOverride);
    } catch {
      console.warn('[AuthProvider] Logout failed, but clearing local state');
    } finally {
      // Luôn clear local state ngay cả khi API call thất bại
      clearAllAuthData();
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isInitialized: true
      }));
      
      if (redirectToLogin && typeof window !== 'undefined') {
        if (window.location.pathname !== AUTH_CONFIG.ROUTES.login) {
          window.location.href = AUTH_CONFIG.ROUTES.login;
        } else {
          // Đang ở /login (vd: hủy chọn cơ sở): reload để tắt modal/state và làm mới form
          window.location.reload();
        }
      }
    }
  }, []);

  /** Gắn handler cho axios 401 (logoutController) — cùng luồng với đăng xuất thủ công / hết hạn tương tác. */
  useEffect(() => {
    setLogoutHandler(handleLogout);
    return () => {
      setLogoutHandler(null);
    };
  }, [handleLogout]);

  const isAuthenticatedRef = useRef(authState.isAuthenticated);
  isAuthenticatedRef.current = authState.isAuthenticated;

  // Tự động logout khi người dùng không thao tác trong N phút (mặc định 30, env NEXT_PUBLIC_TIMEOUT)
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const timeoutMinutes = AUTH_CONFIG.API.inactivityTimeoutMinutes;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    const scheduleLogout = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isAuthenticatedRef.current) return;
        void handleLogout(true);
      }, timeoutMs);
    };

    /** Gộp nhiều sự kiện trong cùng một frame; luôn reset đúng khi có tương tác thật */
    const resetInactivityTimer = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        scheduleLogout();
      });
    };

    const windowEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'click',
    ];

    windowEvents.forEach((evt) =>
      window.addEventListener(evt, resetInactivityTimer, { passive: true })
    );
    // window.scroll không bắt cuộn trong div con; scroll capture trên document + wheel
    document.addEventListener('scroll', resetInactivityTimer, { passive: true, capture: true });
    window.addEventListener('wheel', resetInactivityTimer, { passive: true });

    scheduleLogout();

    return () => {
      windowEvents.forEach((evt) =>
        window.removeEventListener(evt, resetInactivityTimer)
      );
      document.removeEventListener('scroll', resetInactivityTimer, true);
      window.removeEventListener('wheel', resetInactivityTimer);
      if (rafId != null) window.cancelAnimationFrame(rafId);
      if (timer) clearTimeout(timer);
    };
  }, [authState.isAuthenticated, handleLogout]);

  useEffect(() => {
    try {
      clearInvalidCookies();

      const encryptedToken = Cookies.get(AUTH_CONFIG.COOKIE.accessTokenKey);
      const accessToken = encryptedToken ? getDecryptedToken(encryptedToken) : null;
      const userStr = Cookies.get(AUTH_CONFIG.COOKIE.userKey);

      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr) as UserInfo;
          const isTokenValid = isValidToken(accessToken);

          if (isTokenValid) {
            setAuthState({
              isAuthenticated: true,
              user,
              accessToken,
              isInitialized: true,
            });
            return;
          }

          clearAllAuthData();
        } catch {
          // parse user fail — coi như chưa đăng nhập
        }
      }

      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isInitialized: true,
      });
    } catch {
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isInitialized: true,
      });
    }
  }, []);

  const handleLogin = useCallback((accessToken: string, user: UserInfo, refreshToken?: string, options?: AuthLoginOptions) => {
    // Validate token trước khi lưu
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      console.error('[AuthProvider] Token không hợp lệ:', accessToken);
      return;
    }

    const cookieOptions: Parameters<typeof Cookies.set>[2] = {
      expires: AUTH_CONFIG.COOKIE.expires,
      path: '/',
      sameSite: 'Lax',
      // Production HTTPS: bắt buộc gửi cookie với trình duyệt/chính sách bảo mật chặt hơn
      ...(typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? { secure: true }
        : {}),
    };

    // Mã hóa token trước khi lưu vào cookie
    try {
      const encryptedToken = encryptToken(accessToken);
      Cookies.set(AUTH_CONFIG.COOKIE.accessTokenKey, encryptedToken, cookieOptions);
      Cookies.set(AUTH_CONFIG.COOKIE.userKey, JSON.stringify(user), cookieOptions);
      if (refreshToken) {
        Cookies.set(AUTH_CONFIG.COOKIE.refreshTokenKey, refreshToken, cookieOptions);
      }
      
      if (process.env.NODE_ENV === 'development') {
        // Không log độ dài/prefix token — chỉ cờ an toàn cho debug
        // eslint-disable-next-line no-console
        console.debug('[AuthProvider] Session đã lưu', {
          hasToken: true,
          userId: user.user_ID,
          username: user.username,
        });
      }
    } catch (error) {
      console.error('[AuthProvider] Lỗi khi lưu token:', error);
      return;
    }
    
    setAuthState({
      isAuthenticated: true,
      user,
      accessToken,
      isInitialized: true
    });

    if (options?.skipRedirect) {
      return;
    }

    // Kiểm tra và chuyển hướng về trang trước đó nếu có
    const returnUrl = Cookies.get(AUTH_CONFIG.COOKIE.returnUrlKey);
    if (returnUrl) {
      Cookies.remove(AUTH_CONFIG.COOKIE.returnUrlKey, { path: '/' });
      window.location.href = returnUrl;
    } else {
      window.location.href = AUTH_CONFIG.ROUTES.home;
    }
  }, []);

  const contextValue = useMemo(() => ({
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    checkAuthStatus,
  }), [authState, handleLogin, handleLogout, checkAuthStatus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 