'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { AUTH_CONFIG } from '@/lib/auth/constants';
import { clearAllAuthData, clearInvalidCookies, isValidToken } from '@/lib/auth/utils';
import type { UserInfo } from '@/lib/auth/types';
import { getDecryptedToken, encryptToken } from '@/lib/auth/crypto';
import { isAppRoute, navigateToAppPath } from '@/lib/base-path';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isInitialized: boolean;
}

export type AuthLoginOptions = {
  skipRedirect?: boolean;
};

interface AuthContextType extends AuthState {
  login: (accessToken: string, user: UserInfo, refreshToken?: string, options?: AuthLoginOptions) => void;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  checkAuthStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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
      return !!user && isValidToken(accessToken);
    } catch {
      return false;
    }
  }, []);

  const handleLogout = useCallback(async (redirectToLogin = true) => {
    if (redirectToLogin) {
      const currentPath = window.location.pathname;
      if (!isAppRoute(currentPath, AUTH_CONFIG.ROUTES.login)) {
        Cookies.set(AUTH_CONFIG.COOKIE.returnUrlKey, currentPath, {
          expires: new Date(Date.now() + 5 * 60 * 1000),
          path: '/',
        });
      }
    }

    clearAllAuthData();
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isInitialized: true,
    });

    if (redirectToLogin && typeof window !== 'undefined') {
      if (!isAppRoute(window.location.pathname, AUTH_CONFIG.ROUTES.login)) {
        navigateToAppPath(AUTH_CONFIG.ROUTES.login);
      } else {
        window.location.reload();
      }
    }
  }, []);

  const isAuthenticatedRef = useRef(authState.isAuthenticated);
  isAuthenticatedRef.current = authState.isAuthenticated;

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
      window.addEventListener(evt, resetInactivityTimer, { passive: true }),
    );
    document.addEventListener('scroll', resetInactivityTimer, { passive: true, capture: true });
    window.addEventListener('wheel', resetInactivityTimer, { passive: true });

    scheduleLogout();

    return () => {
      windowEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
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
          if (isValidToken(accessToken)) {
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
          // parse user fail
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

  const handleLogin = useCallback(
    (accessToken: string, user: UserInfo, refreshToken?: string, options?: AuthLoginOptions) => {
      if (!accessToken?.trim()) {
        return;
      }

      const cookieOptions: Parameters<typeof Cookies.set>[2] = {
        expires: AUTH_CONFIG.COOKIE.expires,
        path: '/',
        sameSite: 'Lax',
        ...(typeof window !== 'undefined' && window.location.protocol === 'https:'
          ? { secure: true }
          : {}),
      };

      try {
        Cookies.set(AUTH_CONFIG.COOKIE.accessTokenKey, encryptToken(accessToken), cookieOptions);
        Cookies.set(AUTH_CONFIG.COOKIE.userKey, JSON.stringify(user), cookieOptions);
        if (refreshToken) {
          Cookies.set(AUTH_CONFIG.COOKIE.refreshTokenKey, refreshToken, cookieOptions);
        }
      } catch (error) {
        console.error('[AuthProvider] Lỗi khi lưu token:', error);
        return;
      }

      setAuthState({
        isAuthenticated: true,
        user,
        accessToken,
        isInitialized: true,
      });

      if (options?.skipRedirect) {
        return;
      }

      const returnUrl = Cookies.get(AUTH_CONFIG.COOKIE.returnUrlKey);
      if (returnUrl) {
        Cookies.remove(AUTH_CONFIG.COOKIE.returnUrlKey, { path: '/' });
        navigateToAppPath(returnUrl);
      } else {
        navigateToAppPath(AUTH_CONFIG.ROUTES.home);
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      ...authState,
      login: handleLogin,
      logout: handleLogout,
      checkAuthStatus,
    }),
    [authState, handleLogin, handleLogout, checkAuthStatus],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
